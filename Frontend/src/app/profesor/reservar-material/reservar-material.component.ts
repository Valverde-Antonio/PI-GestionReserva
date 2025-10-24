import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService, ReservaRecursoDTO } from '../../services/reserva.service';
import { RecursoService } from '../../services/recurso.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-reservar-material',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './reservar-material.component.html',
  styleUrls: ['./reservar-material.component.css'],
})
export class ReservarMaterialComponent implements OnInit {
  fechaSeleccionada: string = '';
  materialSeleccionado: any = null;
  materiales: any[] = [];
  turnos: string[] = [];
  reservas: ReservaRecursoDTO[] = [];

  mostrarModal: boolean = false;
  mensajeModal: string = '';
  modoConfirmacion: boolean = false;
  reservaActual: any = null;

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private recursoService: RecursoService
  ) {}

  ngOnInit(): void {
    console.log('✅ Inicializado ReservarMaterialComponent');

    // 🔍 DEBUG: Verificar localStorage
    console.log('🔍 Contenido completo del localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key!);
      console.log(`  ${key}: ${value} (tipo: ${typeof value})`);
    }

    // Cargar turnos desde el backend
    this.reservaService.getTurnos().subscribe({
      next: (data) => {
        this.turnos = data;
        console.log('🕐 Turnos cargados desde el backend:', this.turnos);
      },
      error: (err) => {
        console.error('❌ Error al cargar los turnos:', err);
      },
    });

    this.cargarMateriales();
  }

  cargarMateriales(): void {
    this.recursoService.getRecursos().subscribe({
      next: (data) => {
        this.materiales = data;
        console.log('🛠️ Materiales disponibles:', this.materiales);
        if (this.materiales.length > 0) {
          this.materialSeleccionado = this.materiales[0];
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar materiales:', err);
        this.mostrarModalConMensaje('Error al cargar los materiales');
      },
    });
  }

  cargarReservas(): void {
    if (!this.fechaSeleccionada || !this.materialSeleccionado) return;

    console.log(`🔄 Cargando reservas para fecha: ${this.fechaSeleccionada}, material: ${this.materialSeleccionado.nombre}`);

    this.reservaService
      .buscarReservasRecurso(this.fechaSeleccionada, this.materialSeleccionado.nombre)
      .subscribe({
        next: (data) => {
          this.reservas = data;
          console.log('📋 Reservas cargadas:', this.reservas);

          // Debug adicional
          this.reservas.forEach((reserva, index) => {
            console.log(`Reserva ${index}:`, {
              idReserva: reserva.idReserva,
              idProfesor: reserva.idProfesor,
              tramoHorario: reserva.tramoHorario,
              nombreProfesor: reserva.nombreProfesor,
            });
          });
        },
        error: () => {
          this.mostrarModalConMensaje('Error al cargar reservas');
          console.error('❌ Error al cargar reservas');
        },
      });
  }

  obtenerHoraFin(hora: string): string {
    const horaInt = parseInt(hora.split(':')[0]);
    return `${(horaInt + 1).toString().padStart(2, '0')}:00`;
  }

  isReservado(hora: string): boolean {
    const estado = this.reservas.some((r) => r.tramoHorario.startsWith(hora));
    console.log(`🔄 Verificando si el turno ${hora} está reservado: ${estado}`);
    return estado;
  }

  esReservaPropia(hora: string): boolean {
    const reserva = this.getReservaPorHora(hora);

    if (!reserva) {
      console.log(`❌ No se encontró reserva para el turno: ${hora}`);
      return false;
    }

    // Obtenemos el nombre completo desde localStorage
    const usuarioLocal = localStorage.getItem('nombreCompleto');
    if (!usuarioLocal) {
      console.error('❌ Usuario no válido en localStorage');
      return false;
    }

    if (!reserva.nombreProfesor) {
      console.error('❌ La reserva no tiene nombreProfesor:', reserva);
      return false;
    }

    console.log(`🔍 Comparando Usuarios - localStorage: ${usuarioLocal}, reserva: ${reserva.nombreProfesor}`);

    const esPropia = reserva.nombreProfesor === usuarioLocal;

    console.log(`👤 ¿Reserva propia? Turno: ${hora} → ${esPropia}`, {
      reserva: reserva,
      usuarioLocal: usuarioLocal,
      nombreProfesor: reserva.nombreProfesor,
      comparacion: esPropia
    });

    return esPropia;
  }

  getReservaPorHora(hora: string): ReservaRecursoDTO | undefined {
    const reserva = this.reservas.find((r) => r.tramoHorario.startsWith(hora));
    console.log(`🔍 Reserva encontrada para ${hora}:`, reserva);
    return reserva;
  }

  reservar(hora: string): void {
    const idProfesor = Number(localStorage.getItem('idProfesor')) || 1;
    const usuarioLocal = localStorage.getItem('usuario') || '';

    const reserva: ReservaRecursoDTO = {
      fecha: this.fechaSeleccionada,
      tramoHorario: hora,
      idRecurso: this.materialSeleccionado.idRecurso,
      idProfesor: idProfesor,
      nombreProfesor: usuarioLocal,
      // ❌ cantidad: eliminado para cumplir el esquema del profesor
    };

    console.log('🟢 Creando reserva:', reserva);

    this.reservaService.crearReservaRecurso(reserva).subscribe({
      next: () => {
        this.mostrarModalConMensaje('Reserva creada con éxito');
        this.cargarReservas();
      },
      error: (error) => {
        console.error('❌ Error al crear la reserva:', error);
        if (error.status === 500 || error.status === 409) {
          this.mostrarModalConMensaje('El turno ya está reservado');
        } else {
          this.mostrarModalConMensaje('Error al crear la reserva');
        }
      },
    });
  }

  cancelarReserva(hora: string): void {
    const reserva = this.getReservaPorHora(hora);
    if (!reserva) return;

    console.log('🔴 Cancelando reserva:', reserva);

    if (!this.esReservaPropia(hora)) {
      console.log('❌ No se puede cancelar una reserva de otro usuario');
      this.mostrarModalConMensaje('No puedes cancelar una reserva que no es tuya');
      return;
    }

    this.reservaService.eliminarReservaRecurso(reserva.idReserva!).subscribe({
      next: () => {
        console.log('✅ Reserva eliminada correctamente');
        this.reservas = this.reservas.filter((r) => r.idReserva !== reserva.idReserva);
        this.mostrarModalConMensaje('Reserva cancelada');
      },
      error: (err) => {
        console.error('❌ Error al cancelar la reserva:', err);
        this.mostrarModalConMensaje('Error al cancelar la reserva');
      },
    });
  }

  mostrarModalConMensaje(mensaje: string) {
    this.mensajeModal = mensaje;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.mensajeModal = '';
    this.reservaActual = null;
    this.modoConfirmacion = false;
  }

  confirmarEliminacion(): void {
    if (!this.reservaActual) return;

    console.log('🧨 Confirmando eliminación de reserva:', this.reservaActual);

    this.reservaService.eliminarReservaRecurso(this.reservaActual.idReserva!).subscribe({
      next: () => {
        console.log('✅ Reserva eliminada correctamente (modal confirmación)');
        this.mostrarModalConMensaje('Reserva eliminada correctamente');
        setTimeout(() => this.cargarReservas(), 300);
      },
      error: (error) => {
        console.error('❌ Error al eliminar la reserva (modal):', error);
        this.mostrarModalConMensaje('Error al eliminar la reserva');
      }
    });

    this.cerrarModal();
  }
}
