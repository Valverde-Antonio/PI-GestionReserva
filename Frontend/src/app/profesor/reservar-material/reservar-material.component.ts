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

  turnos: string[] = ['08:00', '09:00', '10:00', '11:30', '12:30', '13:30'];

  mostrarModal: boolean = false;
  mensajeModal: string = '';
  modoConfirmacion: boolean = false;
  reservaActual: any = null;
  
  procesandoReserva: boolean = false;

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private recursoService: RecursoService
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
    this.cargarMateriales();
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
   * Se ejecuta cuando cambia la fecha seleccionada
   */
  onFechaChange(): void {
    this.cargarReservas();
  }

  /**
   * Se ejecuta cuando cambia el material seleccionado
   */
  onMaterialChange(): void {
    this.cargarReservas();
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
            
            const reservaNormalizada: ReservaRecursoDTO = {
              idReserva: r.idReserva,
              fecha: r.fecha,
              tramoHorario: tramoCanonizado,
              idRecurso: r.idRecurso,
              idProfesor: r.idProfesor ? Number(r.idProfesor) : undefined,
              nombreProfesor: r.nombreProfesor,
              nombreRecurso: r.nombreRecurso
            };
            
            if (!reservasMap.has(key) || (r.idReserva && r.idReserva > (reservasMap.get(key)?.idReserva || 0))) {
              reservasMap.set(key, reservaNormalizada);
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
  isReservado(horaInicio: string): boolean {
    const tramo = this.normalizaTramo(horaInicio);
    return this.reservas.some(r => this.canonizaTramo(r.tramoHorario) === tramo);
  }

  /**
   * Verifica si una reserva pertenece al profesor actual (por ID o nombre)
   */
  esReservaPropia(horaInicio: string): boolean {
    const r = this.getReservaPorHora(horaInicio);
    if (!r) {
      return false;
    }
    
    const idProfesorActual = this.authService.getIdProfesor();
    
    // Verificar por ID si está disponible
    if (r.idProfesor !== undefined && r.idProfesor !== null && !isNaN(r.idProfesor as any)) {
      const idReservaProfesor = Number(r.idProfesor);
      return idReservaProfesor === idProfesorActual;
    }
    
    // Fallback: verificar por nombre
    const nombreActual = this.authService.getNombreCompleto().trim().toLowerCase();
    const nombreReserva = (r.nombreProfesor || '').trim().toLowerCase();
    return nombreActual === nombreReserva;
  }

  /**
   * Obtiene la reserva de un horario específico
   */
  getReservaPorHora(horaInicio: string): ReservaRecursoDTO | undefined {
    const tramo = this.normalizaTramo(horaInicio);
    return this.reservas.find(r => this.canonizaTramo(r.tramoHorario) === tramo);
  }

  /**
   * Crea una nueva reserva para el horario seleccionado
   */
  reservar(horaInicio: string): void {
    if (this.procesandoReserva) {
      return;
    }
    
    if (this.esFechaPasada(this.fechaSeleccionada)) {
      this.mostrarModalConMensaje('No se puede reservar en fechas pasadas');
      return;
    }

    if (this.isReservado(horaInicio)) {
      if (this.esReservaPropia(horaInicio)) {
        this.mostrarModalConMensaje('Ya tienes este horario reservado');
      } else {
        const reserva = this.getReservaPorHora(horaInicio);
        this.mostrarModalConMensaje(`Este horario ya está reservado por ${reserva?.nombreProfesor || 'otro usuario'}`);
      }
      return;
    }

    const idProfesor = this.authService.getIdProfesor();
    const tramoHorario = this.normalizaTramo(horaInicio);

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
        const nombreProfesor = this.authService.getNombreCompleto();
        const nuevaReserva: ReservaRecursoDTO = {
          fecha: this.fechaSeleccionada,
          tramoHorario: tramoHorario,
          idRecurso: Number(this.materialSeleccionado.idRecurso),
          idProfesor: Number(idProfesor),
          idReserva: response?.idReserva || Date.now(),
          nombreProfesor: nombreProfesor,
          nombreRecurso: this.materialSeleccionado.nombre
        };
        
        this.reservas.push(nuevaReserva);
        this.mostrarModalConMensaje('Reserva creada con éxito');
        
        setTimeout(() => {
          this.cargarReservas();
          this.procesandoReserva = false;
        }, 500);
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        this.procesandoReserva = false;
        
        if (error.status === 500 || error.status === 409) {
          this.mostrarModalConMensaje('El turno ya está reservado');
          this.cargarReservas();
        } else {
          this.mostrarModalConMensaje('Error al crear la reserva');
        }
      },
    });
  }

  /**
   * Cancela una reserva existente (solo si es propia)
   */
  cancelarReserva(horaInicio: string): void {
    const reserva = this.getReservaPorHora(horaInicio);
    
    if (!reserva || !reserva.idReserva) {
      console.error('No se encontró la reserva o no tiene ID válido');
      return;
    }

    if (!this.esReservaPropia(horaInicio)) {
      this.mostrarModalConMensaje('No puedes cancelar una reserva que no es tuya');
      return;
    }
    
    if (this.procesandoReserva) {
      return;
    }
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
      },
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
   * Confirma la eliminación de una reserva
   */
  confirmarEliminacion(): void {
    if (!this.reservaActual) return;

    this.reservaService.eliminarReservaRecurso(this.reservaActual.idReserva!).subscribe({
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