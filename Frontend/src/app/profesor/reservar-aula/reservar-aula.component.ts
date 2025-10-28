import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService, ReservaEspacioDTO } from '../../services/reserva.service';
import { EspacioService } from '../../services/espacio.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-reservar-aula',
  standalone: true,
  imports: [CommonModule, FormsModule, ],
  templateUrl: './reservar-aula.component.html',
  styleUrls: ['./reservar-aula.component.css']
})
export class ReservarAulaComponent implements OnInit {
  fechaSeleccionada: string = '';
  aulaSeleccionada: any = null;
  aulas: any[] = [];
  turnos: string[] = [];
  reservas: ReservaEspacioDTO[] = [];

  mostrarModal: boolean = false;
  mensajeModal: string = '';
  modoConfirmacion: boolean = false;
  reservaActual: any = null;

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private espacioService: EspacioService,
  ) {}

  ngOnInit(): void {
    console.log('✅ Inicializado ReservarAulaComponent');

    this.reservaService.getTurnos().subscribe({
      next: data => {
        this.turnos = data;
        console.log('🕐 Turnos cargados desde el backend:', this.turnos);
      },
      error: err => {
        console.error('❌ Error al cargar los turnos:', err);
      }
    });

    this.cargarAulas();
  }

  cargarAulas(): void {
    this.espacioService.getEspacios().subscribe({
      next: data => {
        this.aulas = data;
        console.log('🏫 Aulas cargadas:', this.aulas);
        if (this.aulas.length > 0) {
          this.aulaSeleccionada = this.aulas[0];
        }
      },
      error: err => {
        console.error('❌ Error al cargar aulas:', err);
        this.mostrarModalConMensaje('Error al cargar las aulas');
      }
    });
  }

  cargarReservas(): void {
    if (!this.fechaSeleccionada || !this.aulaSeleccionada) return;
    console.log(`🔄 Cargando reservas para fecha: ${this.fechaSeleccionada}, aula: ${this.aulaSeleccionada.nombre}`);
    this.reservaService.buscarReservasEspacio(this.fechaSeleccionada, this.aulaSeleccionada.nombre).subscribe({
      next: data => {
        this.reservas = data;
        console.log('📋 Reservas cargadas:', this.reservas);
      },
      error: () => {
        this.mostrarModalConMensaje('Error al cargar reservas');
        console.error('❌ Error al cargar reservas');
      }
    });
  }

  obtenerHoraFin(hora: string): string {
    const horaInt = parseInt(hora.split(':')[0]);
    return `${(horaInt + 1).toString().padStart(2, '0')}:00`;
  }

  isReservado(hora: string): boolean {
    return this.reservas.some(r => r.tramoHorario.startsWith(hora));
  }

  esReservaPropia(hora: string): boolean {
    const reserva = this.getReservaPorHora(hora);
    const idProfesor = Number(localStorage.getItem('idProfesor')) || 0;
    const esPropia = Number(reserva?.idProfesor) === idProfesor;
    console.log(`👤 ¿Reserva propia? Turno: ${hora} → ${esPropia}`, reserva);
    return esPropia;
  }

  getReservaPorHora(hora: string): ReservaEspacioDTO | undefined {
    const reserva = this.reservas.find(r => r.tramoHorario.startsWith(hora));
    console.log(`🔍 Reserva encontrada para ${hora}:`, reserva);
    return reserva;
  }

  reservar(hora: string): void {
    const idProfesor = Number(localStorage.getItem('idProfesor')) || 1;

    const reserva: ReservaEspacioDTO = {
      fecha: this.fechaSeleccionada,
      tramoHorario: hora,
      idEspacio: this.aulaSeleccionada.idEspacio,
      idProfesor: idProfesor
    };

    console.log('🟢 Creando reserva:', reserva);

    this.reservaService.crearReservaEspacio(reserva).subscribe({
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
      }
    });
  }

  cancelarReserva(hora: string): void {
    const reserva = this.getReservaPorHora(hora);
    if (!reserva) return;

    console.log('🔴 Cancelando reserva:', reserva);

    this.reservaService.eliminarReservaEspacio(reserva.idReserva!).subscribe({
      next: () => {
        console.log('✅ Reserva eliminada correctamente');
        this.reservas = this.reservas.filter(r => r.idReserva !== reserva.idReserva);
        this.mostrarModalConMensaje('Reserva cancelada');
      },
      error: (err) => {
        console.error('❌ Error al cancelar la reserva:', err);
        this.mostrarModalConMensaje('Error al cancelar la reserva');
      }
    });
  }

  mostrarModalConMensaje(mensaje: string) {
    console.log('💬 Mostrando modal:', mensaje);
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

    this.reservaService.eliminarReservaEspacio(this.reservaActual.idReserva!).subscribe({
      next: () => {
        console.log('✅ Reserva eliminada correctamente (modal confirmación)');
        this.mostrarModalConMensaje('Reserva eliminada correctamente');
        setTimeout(() => this.cargarReservas(), 300); // breve retardo opcional
      },
      error: (error) => {
        console.error('❌ Error al eliminar la reserva (modal):', error);
        this.mostrarModalConMensaje('Error al eliminar la reserva');
      }
    });

    this.cerrarModal();
  }
}
