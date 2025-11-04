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

  // ✅ Tramos lectivos fijos
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

  // ✅ Utils para horarios
  private pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  private addMinutes(hhmm: string, minutes: number): string {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(0, 0, 0, h, (m || 0) + minutes);
    return `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}`;
  }

  private normalizaTramo(inicio: string, fin?: string, duracionMin = 60): string {
    const start = (inicio ?? '').toString().replace(/\s/g, '');
    const end = (fin ?? this.addMinutes(start, duracionMin)).toString().replace(/\s/g, '');
    return `${start}-${end}`;
  }

  private canonizaTramo(anyStr: string): string {
    const limpio = (anyStr ?? '').toString().replace(/\s/g, '');
    if (/^\d{2}:\d{2}$/.test(limpio)) {
      return `${limpio}-${this.addMinutes(limpio, 60)}`;
    }
    return limpio;
  }

  // ✅ Obtener fecha actual (público para usarlo en el template)
  obtenerFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ✅ Validar fecha pasada
  private esFechaPasada(fecha: string): boolean {
    const fechaSelec = new Date(fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaSelec < hoy;
  }

  ngOnInit(): void {
    console.log('✅ Inicializado ReservarAulaComponent');
    
    // ✅ Establecer fecha de HOY por defecto
    this.fechaSeleccionada = this.obtenerFechaHoy();
    
    this.cargarAulas();
  }

  formatTramo(horaInicio: string): string {
    return this.normalizaTramo(horaInicio);
  }

  cargarAulas(): void {
    this.espacioService.getEspacios().subscribe({
      next: data => {
        this.aulas = data;
        console.log('🏫 Aulas cargadas:', this.aulas);
        if (this.aulas.length > 0) {
          this.aulaSeleccionada = this.aulas[0];
          // ✅ Cargar reservas automáticamente
          this.cargarReservas();
        }
      },
      error: err => {
        console.error('❌ Error al cargar aulas:', err);
        this.mostrarModalConMensaje('Error al cargar las aulas');
      }
    });
  }

  onFechaChange(): void {
    this.cargarReservas();
  }

  onAulaChange(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    if (!this.fechaSeleccionada || !this.aulaSeleccionada) return;
    
    // ✅ Validar fecha pasada
    if (this.esFechaPasada(this.fechaSeleccionada)) {
      console.warn('⚠️ No se pueden cargar reservas de fechas pasadas');
      this.reservas = [];
      return;
    }
    
    console.log(`🔄 Cargando reservas para fecha: ${this.fechaSeleccionada}, aula: ${this.aulaSeleccionada.nombre}`);
    
    this.reservaService.buscarReservasEspacio(this.fechaSeleccionada, this.aulaSeleccionada.nombre).subscribe({
      next: data => {
        // ✅ Canonizar y eliminar duplicados
        const reservasMap = new Map<string, ReservaEspacioDTO>();
        
        (data || []).forEach(r => {
          const tramoCanonizado = this.canonizaTramo(r.tramoHorario);
          const key = `${tramoCanonizado}-${r.idEspacio}`;
          
          // Solo guardar si no existe o si tiene idReserva más reciente
          if (!reservasMap.has(key) || (r.idReserva && r.idReserva > (reservasMap.get(key)?.idReserva || 0))) {
            reservasMap.set(key, { ...r, tramoHorario: tramoCanonizado });
          }
        });
        
        this.reservas = Array.from(reservasMap.values());
        console.log('📋 Reservas cargadas (sin duplicados):', this.reservas);
      },
      error: () => {
        this.mostrarModalConMensaje('Error al cargar reservas');
        console.error('❌ Error al cargar reservas');
      }
    });
  }

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

  getReservaPorHora(horaInicio: string): ReservaEspacioDTO | undefined {
    const tramo = this.normalizaTramo(horaInicio);
    const reserva = this.reservas.find(r => this.canonizaTramo(r.tramoHorario) === tramo);
    console.log(`🔍 Reserva encontrada para ${horaInicio}:`, reserva);
    return reserva;
  }

  reservar(horaInicio: string): void {
    // ✅ Validar fecha pasada antes de reservar
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

    console.log('🟢 Creando reserva (normalizada):', reserva);

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

  cancelarReserva(horaInicio: string): void {
    const reserva = this.getReservaPorHora(horaInicio);
    if (!reserva) return;

    console.log('🔴 Cancelando reserva:', reserva);

    this.reservaService.eliminarReservaEspacio(reserva.idReserva!).subscribe({
      next: (response) => {
        console.log('✅ Reserva eliminada correctamente:', response);
        this.cargarReservas();
        this.mostrarModalConMensaje('Reserva cancelada correctamente');
      },
      error: (err) => {
        console.error('❌ Error real al cancelar la reserva:', err);
        this.mostrarModalConMensaje('Error al cancelar la reserva');
      }
    });
  }

  mostrarModalConMensaje(mensaje: string): void {
    console.log('💬 Mostrando modal:', mensaje);
    this.mensajeModal = mensaje;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
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