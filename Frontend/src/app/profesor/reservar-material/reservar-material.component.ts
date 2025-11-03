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
  reservas: ReservaRecursoDTO[] = [];

  // ✅ Tramos fijos (hora de INICIO). La vista los mostrará como HH:mm-HH:mm
  turnos: string[] = ['08:00', '09:00', '10:00', '11:30', '12:30', '13:30'];

  // Modal
  mostrarModal: boolean = false;
  mensajeModal: string = '';
  modoConfirmacion: boolean = false;
  reservaActual: any = null;

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private recursoService: RecursoService
  ) {}

  // ✅ Utils horarios (mismo criterio que en aulas) --------------------------
  private pad(n: number) { return n.toString().padStart(2, '0'); }

  private addMinutes(hhmm: string, minutes: number) {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(0, 0, 0, h, (m || 0) + minutes);
    return `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}`;
  }

  /** Devuelve HH:mm-HH:mm (sin espacios) */
  private normalizaTramo(inicio: string, fin?: string, duracionMin = 60) {
    const start = (inicio ?? '').toString().replace(/\s/g, '');
    const end = (fin ?? this.addMinutes(start, duracionMin)).toString().replace(/\s/g, '');
    return `${start}-${end}`;
  }

  /** Quita espacios; si viene solo HH:mm, agrega +60m -> HH:mm-HH:mm */
  private canonizaTramo(anyStr: string) {
    const limpio = (anyStr ?? '').toString().replace(/\s/g, '');
    if (/^\d{2}:\d{2}$/.test(limpio)) return `${limpio}-${this.addMinutes(limpio, 60)}`;
    return limpio;
  }
  // -------------------------------------------------------------------------

  ngOnInit(): void {
    console.log('✅ Inicializado ReservarMaterialComponent');
    this.cargarMateriales();
  }

  // Mostrar etiqueta bonita HH:mm-HH:mm en la tabla
  formatTramo(horaInicio: string): string {
    return this.normalizaTramo(horaInicio);
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

  onFechaChange(): void { this.cargarReservas(); }
  onMaterialChange(): void { this.cargarReservas(); }

  cargarReservas(): void {
    if (!this.fechaSeleccionada || !this.materialSeleccionado) return;

    console.log(`🔄 Cargando reservas para fecha: ${this.fechaSeleccionada}, material: ${this.materialSeleccionado.nombre}`);

    this.reservaService
      .buscarReservasRecurso(this.fechaSeleccionada, this.materialSeleccionado.nombre)
      .subscribe({
        next: (data) => {
          // ✅ Canoniza tramoHorario al llegar del backend
          this.reservas = (data || []).map(r => ({
            ...r,
            tramoHorario: this.canonizaTramo(r.tramoHorario)
          }));
          console.log('📋 Reservas cargadas (canonizadas):', this.reservas);
        },
        error: () => {
          this.mostrarModalConMensaje('Error al cargar reservas');
          console.error('❌ Error al cargar reservas');
        },
      });
  }

  // ✅ Comparación exacta con tramo canónico
  isReservado(horaInicio: string): boolean {
    const tramo = this.normalizaTramo(horaInicio);
    return this.reservas.some(r => this.canonizaTramo(r.tramoHorario) === tramo);
  }

  esReservaPropia(horaInicio: string): boolean {
    const r = this.getReservaPorHora(horaInicio);
    const idProfesor = Number(localStorage.getItem('idProfesor')) || 0;
    const esPropia = Number(r?.idProfesor) === idProfesor;
    console.log(`👤 ¿Reserva propia? Turno: ${horaInicio} → ${esPropia}`, r);
    return esPropia;
  }

  getReservaPorHora(horaInicio: string): ReservaRecursoDTO | undefined {
    const tramo = this.normalizaTramo(horaInicio);
    const reserva = this.reservas.find(r => this.canonizaTramo(r.tramoHorario) === tramo);
    console.log(`🔍 Reserva encontrada para ${horaInicio}:`, reserva);
    return reserva;
  }

  reservar(horaInicio: string): void {
    const idProfesor = Number(localStorage.getItem('idProfesor')) || 1;

    // ✅ Construye tramo canónico HH:mm-HH:mm
    const tramoHorario = this.normalizaTramo(horaInicio);

    const reserva: ReservaRecursoDTO = {
      fecha: this.fechaSeleccionada,
      tramoHorario,
      idRecurso: this.materialSeleccionado.idRecurso,
      idProfesor: idProfesor
      // nombreProfesor opcional; el backend puede rellenarlo si quiere
    };

    console.log('🟢 Creando reserva de recurso (normalizada):', reserva);

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

  cancelarReserva(horaInicio: string): void {
    const reserva = this.getReservaPorHora(horaInicio);
    if (!reserva) return;

    if (!this.esReservaPropia(horaInicio)) {
      console.log('❌ No se puede cancelar una reserva de otro usuario');
      this.mostrarModalConMensaje('No puedes cancelar una reserva que no es tuya');
      return;
    }

    console.log('🔴 Cancelando reserva:', reserva);

    this.reservaService.eliminarReservaRecurso(reserva.idReserva!).subscribe({
      next: () => {
        console.log('✅ Reserva eliminada correctamente');
        // Refresca desde backend para evitar desalineaciones
        this.cargarReservas();
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
