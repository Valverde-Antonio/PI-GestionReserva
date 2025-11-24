import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService, ReservaRecursoDTO } from '../../services/reserva.service';
import { RecursoService } from '../../services/recurso.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gestionar-recursos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-recursos.component.html',
  styleUrls: ['./gestionar-recursos.component.css'],
})
export class GestionarRecursosComponent implements OnInit {
  fechaSeleccionada: string = '';
  materialSeleccionado: any = null;
  materiales: any[] = [];
  
  turnos: string[] = ['08:00', '09:00', '10:00', '11:30', '12:30', '13:30'];
  
  reservas: ReservaRecursoDTO[] = [];

  mostrarModal: boolean = false;
  mensajeModal: string = '';
  modoConfirmacion: boolean = false;
  reservaActual: any = null;
  
  procesandoReserva: boolean = false;

  constructor(
    private reservaService: ReservaService,
    private recursoService: RecursoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fechaSeleccionada = this.obtenerFechaHoy();
    this.cargarMateriales();
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
   * Formatea un tramo horario para mostrar
   */
  formatTramo(horaInicio: string): string {
    return this.normalizaTramo(horaInicio);
  }

  /**
   * Carga la lista de materiales/recursos disponibles
   */
  cargarMateriales(): void {
    this.recursoService.getRecursos().subscribe({
      next: (data) => {
        this.materiales = data;
        if (this.materiales.length > 0) {
          this.materialSeleccionado = this.materiales[0];
          this.cargarReservas();
        }
      },
      error: (err) => {
        console.error('Error al cargar materiales:', err);
        this.mostrarModalConMensaje('Error al cargar los materiales');
      },
    });
  }

  /**
   * Carga las reservas del material y fecha seleccionados
   */
  cargarReservas(): void {
    if (!this.fechaSeleccionada || !this.materialSeleccionado) return;
    
    if (this.esFechaPasada(this.fechaSeleccionada)) {
      this.reservas = [];
      return;
    }

    this.reservaService
      .buscarReservasRecurso(this.fechaSeleccionada, this.materialSeleccionado.nombre)
      .subscribe({
        next: (data) => {
          const reservasMap = new Map<string, ReservaRecursoDTO>();
          
          (data || []).forEach(r => {
            const tramoCanonizado = this.canonizaTramo(r.tramoHorario);
            const key = `${tramoCanonizado}-${r.idRecurso}`;
            
            if (!reservasMap.has(key) || (r.idReserva && r.idReserva > (reservasMap.get(key)?.idReserva || 0))) {
              reservasMap.set(key, { ...r, tramoHorario: tramoCanonizado });
            }
          });
          
          this.reservas = Array.from(reservasMap.values());
        },
        error: (err) => {
          console.error('Error al cargar reservas:', err);
          this.mostrarModalConMensaje('Error al cargar reservas');
          this.reservas = [];
        },
      });
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
    return reserva ? Number(reserva.idProfesor) === idProfesor : false;
  }

  /**
   * Obtiene la reserva de un horario específico
   */
  getReservaPorHora(hora: string): ReservaRecursoDTO | undefined {
    const tramo = this.normalizaTramo(hora);
    return this.reservas.find(r => this.canonizaTramo(r.tramoHorario) === tramo);
  }

  /**
   * Crea una nueva reserva para el horario seleccionado
   */
  reservar(hora: string): void {
    if (this.procesandoReserva) {
      return;
    }
    
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

    const idProfesor = this.authService.getIdProfesor();
    const tramoHorario = this.normalizaTramo(hora);

    if (!this.materialSeleccionado || !this.materialSeleccionado.idRecurso) {
      console.error('Error: El material seleccionado no tiene un id válido');
      this.mostrarModalConMensaje('Error: Material no seleccionado');
      return;
    }

    if (!idProfesor) {
      console.error('Error: No se pudo obtener el ID del profesor');
      this.mostrarModalConMensaje('Error: Usuario no identificado');
      return;
    }

    const reserva: ReservaRecursoDTO = {
      fecha: this.fechaSeleccionada,
      tramoHorario,
      idRecurso: Number(this.materialSeleccionado.idRecurso),
      idProfesor: Number(idProfesor)
    };
    
    this.procesandoReserva = true;

    this.reservaService.crearReservaRecurso(reserva).subscribe({
      next: (response) => {
        const nombreProfesor = localStorage.getItem('nombreCompleto') || 'Admin';
        const nuevaReserva: ReservaRecursoDTO = {
          ...reserva,
          idReserva: response?.idReserva || Date.now(),
          nombreProfesor: nombreProfesor,
          nombreRecurso: this.materialSeleccionado.nombre
        };
        
        this.reservas.push(nuevaReserva);
        this.mostrarModalConMensaje('Reserva creada correctamente');
        
        setTimeout(() => {
          this.cargarReservas();
          this.procesandoReserva = false;
        }, 500);
      },
      error: (error) => {
        console.error('Error al crear reserva:', error);
        this.procesandoReserva = false;
        
        if (error.status === 500 || error.status === 409) {
          this.mostrarModalConMensaje('Este horario ya está reservado para este material');
          this.cargarReservas();
        } else {
          this.mostrarModalConMensaje('Error al crear la reserva. Intenta de nuevo.');
        }
      },
    });
  }

  /**
   * Cancela una reserva (con confirmación si es de otro profesor)
   */
  cancelarReserva(hora: string): void {
    const reserva = this.getReservaPorHora(hora);
    if (!reserva || reserva.idReserva === undefined) {
      console.error('El ID de la reserva no es válido.');
      return;
    }

    const esPropia = this.esReservaPropia(hora);
    
    if (this.procesandoReserva) {
      return;
    }
    
    if (esPropia) {
      this.procesandoReserva = true;
      
      this.reservaService.eliminarReservaRecurso(reserva.idReserva).subscribe({
        next: () => {
          this.reservas = this.reservas.filter(r => r.idReserva !== reserva.idReserva);
          this.mostrarModalConMensaje('Reserva cancelada correctamente');
          
          setTimeout(() => {
            this.cargarReservas();
            this.procesandoReserva = false;
          }, 500);
        },
        error: (err) => {
          console.error('Error al cancelar la reserva:', err);
          this.procesandoReserva = false;
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
    
    this.procesandoReserva = true;

    this.reservaService.eliminarReservaRecurso(this.reservaActual.idReserva).subscribe({
      next: () => {
        this.reservas = this.reservas.filter(r => r.idReserva !== this.reservaActual.idReserva);
        this.cerrarModal();
        this.mostrarModalConMensaje('Reserva eliminada correctamente');
        
        setTimeout(() => {
          this.cargarReservas();
          this.procesandoReserva = false;
        }, 500);
      },
      error: (error) => {
        console.error('Error al eliminar la reserva:', error);
        this.procesandoReserva = false;
        this.cerrarModal();
        this.mostrarModalConMensaje('Error al eliminar la reserva');
      }
    });
  }
}