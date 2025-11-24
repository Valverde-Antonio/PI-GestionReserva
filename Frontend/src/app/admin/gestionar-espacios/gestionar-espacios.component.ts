import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService, ReservaEspacioDTO } from '../../services/reserva.service';
import { EspacioService } from '../../services/espacio.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gestionar-espacios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-espacios.component.html',
  styleUrls: ['./gestionar-espacios.component.css']
})
export class GestionarEspaciosComponent implements OnInit {
  fechaSeleccionada: string = '';
  aulaSeleccionada: any = null;
  aulas: any[] = [];
  
  // Tramos fijos
  turnos: string[] = ['08:00', '09:00', '10:00', '11:30', '12:30', '13:30'];
  
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
    this.fechaSeleccionada = this.obtenerFechaHoy();
    this.cargarAulas();
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
        // Canonizar y eliminar duplicados
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
   * Calcula la hora de fin sumando 60 minutos
   */
  obtenerHoraFin(hora: string): string {
    return this.addMinutes(hora, 60);
  }

  /**
   * Formatea un tramo horario para mostrar
   */
  formatTramo(horaInicio: string): string {
    return this.normalizaTramo(horaInicio);
  }

  /**
   * Verifica si un horario está reservado
   */
  isReservado(hora: string): boolean {
    const tramo = this.normalizaTramo(hora);
    return this.reservas.some(r => this.canonizaTramo(r.tramoHorario) === tramo);
  }

  /**
   * Verifica si una reserva pertenece al profesor actual
   */
  esReservaPropia(hora: string): boolean {
    const reserva = this.getReservaPorHora(hora);
    const idProfesor = Number(localStorage.getItem('idProfesor')) || 0;
    return Number(reserva?.idProfesor) === idProfesor;
  }

  /**
   * Obtiene la reserva de un horario específico
   */
  getReservaPorHora(hora: string): ReservaEspacioDTO | undefined {
    const tramo = this.normalizaTramo(hora);
    return this.reservas.find(r => this.canonizaTramo(r.tramoHorario) === tramo);
  }

  /**
   * Crea una nueva reserva para el horario seleccionado
   */
  reservar(hora: string): void {
    if (this.esFechaPasada(this.fechaSeleccionada)) {
      this.mostrarModalConMensaje('No se puede reservar en fechas pasadas');
      return;
    }

    if (this.isReservado(hora)) {
      if (this.esReservaPropia(hora)) {
        this.mostrarModalConMensaje('Ya tienes este horario reservado');
      } else {
        const reserva = this.getReservaPorHora(hora);
        this.mostrarModalConMensaje(`Este horario ya está reservado por ${reserva?.nombreProfesor || 'otro usuario'}`);
      }
      return;
    }
    
    const idProfesor = Number(localStorage.getItem('idProfesor')) || 1;
    const tramoHorario = this.normalizaTramo(hora);

    const reserva: ReservaEspacioDTO = {
      fecha: this.fechaSeleccionada,
      tramoHorario,
      idEspacio: this.aulaSeleccionada.idEspacio,
      idProfesor: idProfesor
    };

    this.reservaService.crearReservaEspacio(reserva).subscribe({
      next: () => {
        this.mostrarModalConMensaje('Reserva creada correctamente');
        this.cargarReservas();
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        if (error.status === 500 || error.status === 409) {
          this.mostrarModalConMensaje('Este horario ya está reservado para esta aula');
        } else {
          this.mostrarModalConMensaje('Error al crear la reserva. Intenta de nuevo.');
        }
      }
    });
  }

  /**
   * Cancela una reserva (con confirmación si es de otro profesor)
   */
  cancelarReserva(hora: string): void {
    const reserva = this.getReservaPorHora(hora);
    if (!reserva) return;

    const esPropia = this.esReservaPropia(hora);
    
    if (esPropia) {
      this.reservaService.eliminarReservaEspacio(reserva.idReserva!).subscribe({
        next: () => {
          this.cargarReservas();
          this.mostrarModalConMensaje('Reserva cancelada correctamente');
        },
        error: (err) => {
          console.error('Error al cancelar la reserva:', err);
          this.mostrarModalConMensaje('Error al cancelar la reserva');
        }
      });
    } else {
      this.modoConfirmacion = true;
      this.reservaActual = reserva;
      this.mostrarModalConMensaje(`¿Seguro que deseas cancelar la reserva de ${reserva.nombreProfesor}?`);
    }
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
   * Confirma la eliminación de una reserva de otro profesor
   */
  confirmarEliminacion(): void {
    if (!this.reservaActual) return;

    this.reservaService.eliminarReservaEspacio(this.reservaActual.idReserva!).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarReservas();
        this.mostrarModalConMensaje('Reserva eliminada correctamente');
      },
      error: (error) => {
        console.error('Error al eliminar la reserva:', error);
        this.cerrarModal();
        this.mostrarModalConMensaje('Error al eliminar la reserva');
      }
    });
  }
}