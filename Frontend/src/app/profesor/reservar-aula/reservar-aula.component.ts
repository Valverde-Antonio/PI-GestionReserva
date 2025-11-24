import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService, ReservaEspacioDTO } from '../../services/reserva.service';
import { EspacioService } from '../../services/espacio.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reservar-aula',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar-aula.component.html',
  styleUrls: ['./reservar-aula.component.css']
})
export class ReservarAulaComponent implements OnInit {
  fechaSeleccionada: string = '';
  aulaSeleccionada: any = null;
  aulas: any[] = [];
  reservas: ReservaEspacioDTO[] = [];

  turnos: string[] = ['08:00', '09:00', '10:00', '11:30', '12:30', '13:30'];

  mostrarModal: boolean = false;
  mensajeModal: string = '';
  modoConfirmacion: boolean = false;
  reservaActual: any = null;

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private espacioService: EspacioService,
  ) {}

  /**
   * Añade ceros a la izquierda para formato de hora
   */
  private pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  /**
   * Suma minutos a una hora en formato HH:mm
   */
  private addMinutes(hhmm: string, minutes: number): string {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(0, 0, 0, h, (m || 0) + minutes);
    return `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}`;
  }

  /**
   * Normaliza un tramo horario al formato HH:mm-HH:mm
   */
  private normalizaTramo(inicio: string, fin?: string, duracionMin = 60): string {
    const start = (inicio ?? '').toString().replace(/\s/g, '');
    const end = (fin ?? this.addMinutes(start, duracionMin)).toString().replace(/\s/g, '');
    return `${start}-${end}`;
  }

  /**
   * Canoniza un tramo horario (convierte formato simple a completo)
   */
  private canonizaTramo(anyStr: string): string {
    const limpio = (anyStr ?? '').toString().replace(/\s/g, '');
    if (/^\d{2}:\d{2}$/.test(limpio)) {
      return `${limpio}-${this.addMinutes(limpio, 60)}`;
    }
    return limpio;
  }

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   */
  obtenerFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Verifica si una fecha es del pasado
   */
  private esFechaPasada(fecha: string): boolean {
    const fechaSelec = new Date(fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaSelec < hoy;
  }

  ngOnInit(): void {
    this.fechaSeleccionada = this.obtenerFechaHoy();
    this.cargarAulas();
  }

  /**
   * Formatea un tramo horario para mostrar
   */
  formatTramo(horaInicio: string): string {
    return this.normalizaTramo(horaInicio);
  }

  /**
   * Carga la lista de aulas disponibles
   */
  cargarAulas(): void {
    this.espacioService.getEspacios().subscribe({
      next: data => {
        this.aulas = data;
        if (this.aulas.length > 0) {
          this.aulaSeleccionada = this.aulas[0];
          this.cargarReservas();
        }
      },
      error: err => {
        console.error('Error al cargar aulas:', err);
        this.mostrarModalConMensaje('Error al cargar las aulas');
      }
    });
  }

  /**
   * Se ejecuta cuando cambia la fecha seleccionada
   */
  onFechaChange(): void {
    this.cargarReservas();
  }

  /**
   * Se ejecuta cuando cambia el aula seleccionada
   */
  onAulaChange(): void {
    this.cargarReservas();
  }

  /**
   * Carga las reservas del aula y fecha seleccionados
   */
  cargarReservas(): void {
    if (!this.fechaSeleccionada || !this.aulaSeleccionada) return;
    
    if (this.esFechaPasada(this.fechaSeleccionada)) {
      this.reservas = [];
      return;
    }
    
    this.reservaService.buscarReservasEspacio(this.fechaSeleccionada, this.aulaSeleccionada.nombre).subscribe({
      next: data => {
        const reservasMap = new Map<string, ReservaEspacioDTO>();
        
        (data || []).forEach(r => {
          const tramoCanonizado = this.canonizaTramo(r.tramoHorario);
          const key = `${tramoCanonizado}-${r.idEspacio}`;
          
          if (!reservasMap.has(key) || (r.idReserva && r.idReserva > (reservasMap.get(key)?.idReserva || 0))) {
            reservasMap.set(key, { ...r, tramoHorario: tramoCanonizado });
          }
        });
        
        this.reservas = Array.from(reservasMap.values());
      },
      error: () => {
        this.mostrarModalConMensaje('Error al cargar reservas');
        console.error('Error al cargar reservas');
      }
    });
  }

  /**
   * Verifica si un horario está reservado
   */
  isReservado(horaInicio: string): boolean {
    const tramo = this.normalizaTramo(horaInicio);
    return this.reservas.some(r => this.canonizaTramo(r.tramoHorario) === tramo);
  }

  /**
   * Verifica si una reserva pertenece al profesor actual
   */
  esReservaPropia(horaInicio: string): boolean {
    const r = this.getReservaPorHora(horaInicio);
    const idProfesor = Number(localStorage.getItem('idProfesor')) || 0;
    return Number(r?.idProfesor) === idProfesor;
  }

  /**
   * Obtiene la reserva de un horario específico
   */
  getReservaPorHora(horaInicio: string): ReservaEspacioDTO | undefined {
    const tramo = this.normalizaTramo(horaInicio);
    return this.reservas.find(r => this.canonizaTramo(r.tramoHorario) === tramo);
  }

  /**
   * Crea una nueva reserva para el horario seleccionado
   */
  reservar(horaInicio: string): void {
    if (this.esFechaPasada(this.fechaSeleccionada)) {
      this.mostrarModalConMensaje('No se puede reservar en fechas pasadas');
      return;
    }
    
    const idProfesor = Number(localStorage.getItem('idProfesor')) || 1;
    const tramoHorario = this.normalizaTramo(horaInicio);

    const reserva: ReservaEspacioDTO = {
      fecha: this.fechaSeleccionada,
      tramoHorario,
      idEspacio: this.aulaSeleccionada.idEspacio,
      idProfesor: idProfesor
    };

    this.reservaService.crearReservaEspacio(reserva).subscribe({
      next: () => {
        this.mostrarModalConMensaje('Reserva creada con éxito');
        this.cargarReservas();
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        if (error.status === 500 || error.status === 409) {
          this.mostrarModalConMensaje('El turno ya está reservado');
        } else {
          this.mostrarModalConMensaje('Error al crear la reserva');
        }
      }
    });
  }

  /**
   * Cancela una reserva existente
   */
  cancelarReserva(horaInicio: string): void {
    const reserva = this.getReservaPorHora(horaInicio);
    if (!reserva) return;

    this.reservaService.eliminarReservaEspacio(reserva.idReserva!).subscribe({
      next: () => {
        this.mostrarModalConMensaje('Reserva cancelada correctamente');
        this.cargarReservas();
      },
      error: (error) => {
        console.error('Error al cancelar la reserva:', error);
        this.mostrarModalConMensaje('Error al cancelar la reserva');
      }
    });
  }

  /**
   * Muestra un modal con un mensaje
   */
  mostrarModalConMensaje(mensaje: string): void {
    this.mensajeModal = mensaje;
    this.mostrarModal = true;
  }

  /**
   * Cierra el modal actual
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.mensajeModal = '';
    this.reservaActual = null;
    this.modoConfirmacion = false;
  }

  /**
   * Confirma y ejecuta la eliminación de una reserva desde el modal
   */
  confirmarEliminacion(): void {
    if (!this.reservaActual) return;

    this.reservaService.eliminarReservaEspacio(this.reservaActual.idReserva!).subscribe({
      next: () => {
        this.mostrarModalConMensaje('Reserva eliminada correctamente');
        setTimeout(() => this.cargarReservas(), 300);
      },
      error: (error) => {
        console.error('Error al eliminar la reserva:', error);
        this.mostrarModalConMensaje('Error al eliminar la reserva');
      }
    });

    this.cerrarModal();
  }
}