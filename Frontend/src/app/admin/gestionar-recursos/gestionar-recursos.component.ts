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
  
  // ✅ Tramos fijos - NO se sobrescriben del backend
  turnos: string[] = ['08:00', '09:00', '10:00', '11:30', '12:30', '13:30'];
  
  reservas: ReservaRecursoDTO[] = [];

  mostrarModal: boolean = false;
  mensajeModal: string = '';
  modoConfirmacion: boolean = false;
  reservaActual: any = null;
  
  // 🔥 Flag para controlar actualizaciones optimistas
  procesandoReserva: boolean = false;

  constructor(
    private reservaService: ReservaService,
    private recursoService: RecursoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('✅ Inicializado GestionarRecursosComponent');
    
    // ✅ Establecer fecha de HOY por defecto
    this.fechaSeleccionada = this.obtenerFechaHoy();
    
    this.cargarMateriales();
  }

  // ✅ Obtener fecha actual en formato YYYY-MM-DD (público para el template)
  obtenerFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ✅ Validar que la fecha no sea del pasado
  private esFechaPasada(fecha: string): boolean {
    const fechaSelec = new Date(fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaSelec < hoy;
  }

  // ✅ Utils para normalizar tramos horarios
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

  // ✅ Formatear tramo horario para mostrar en la UI (HH:mm-HH:mm)
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
          // ✅ Cargar reservas automáticamente al iniciar
          this.cargarReservas();
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
    
    // ✅ Validar fecha pasada
    if (this.esFechaPasada(this.fechaSeleccionada)) {
      console.warn('⚠️ No se pueden cargar reservas de fechas pasadas');
      this.reservas = [];
      return;
    }

    console.log(`📄 Cargando reservas para fecha: ${this.fechaSeleccionada}, material: ${this.materialSeleccionado.nombre}`);

    this.reservaService
      .buscarReservasRecurso(this.fechaSeleccionada, this.materialSeleccionado.nombre)
      .subscribe({
        next: (data) => {
          // ✅ Canonizar y eliminar duplicados
          const reservasMap = new Map<string, ReservaRecursoDTO>();
          
          (data || []).forEach(r => {
            const tramoCanonizado = this.canonizaTramo(r.tramoHorario);
            const key = `${tramoCanonizado}-${r.idRecurso}`;
            
            // Solo guardar si no existe o si tiene idReserva más reciente
            if (!reservasMap.has(key) || (r.idReserva && r.idReserva > (reservasMap.get(key)?.idReserva || 0))) {
              reservasMap.set(key, { ...r, tramoHorario: tramoCanonizado });
            }
          });
          
          this.reservas = Array.from(reservasMap.values());
          console.log('📋 Reservas cargadas (sin duplicados):', this.reservas);
          console.log('📋 Detalles reservas:', this.reservas.map(r => ({
            tramo: r.tramoHorario,
            profesor: r.nombreProfesor,
            idProfesor: r.idProfesor,
            idReserva: r.idReserva
          })));
        },
        error: (err) => {
          console.error('❌ Error al cargar reservas:', err);
          this.mostrarModalConMensaje('Error al cargar reservas');
          this.reservas = [];
        },
      });
  }

  isReservado(hora: string): boolean {
    const tramo = this.normalizaTramo(hora);
    const reservado = this.reservas.some(r => this.canonizaTramo(r.tramoHorario) === tramo);
    return reservado;
  }

  esReservaPropia(hora: string): boolean {
    const reserva = this.getReservaPorHora(hora);
    const idProfesor = Number(localStorage.getItem('idProfesor')) || 0;
    const esPropia = reserva ? Number(reserva.idProfesor) === idProfesor : false;
    console.log(`👤 ¿Reserva propia ${hora}? idProfesor=${idProfesor}, reserva.idProfesor=${reserva?.idProfesor}, esPropia=${esPropia}`);
    return esPropia;
  }

  getReservaPorHora(hora: string): ReservaRecursoDTO | undefined {
    const tramo = this.normalizaTramo(hora);
    const reserva = this.reservas.find(r => this.canonizaTramo(r.tramoHorario) === tramo);
    return reserva;
  }

  reservar(hora: string): void {
    console.log('🎯 Iniciando proceso de reserva para:', hora);
    
    // 🔥 Prevenir doble clic
    if (this.procesandoReserva) {
      console.log('⚠️ Ya hay una reserva en proceso');
      return;
    }
    
    // ✅ Validar fecha pasada antes de reservar
    if (this.esFechaPasada(this.fechaSeleccionada)) {
      this.mostrarModalConMensaje('No se puede reservar en fechas pasadas');
      return;
    }

    // ✅ Verificar si ya está reservado
    if (this.isReservado(hora)) {
      console.log('⚠️ El horario ya está reservado');
      if (this.esReservaPropia(hora)) {
        this.mostrarModalConMensaje('⚠️ Ya tienes este horario reservado');
      } else {
        const reserva = this.getReservaPorHora(hora);
        this.mostrarModalConMensaje(`⚠️ Este horario ya está reservado por ${reserva?.nombreProfesor || 'otro usuario'}`);
      }
      return;
    }

    const idProfesor = this.authService.getIdProfesor();
    const tramoHorario = this.normalizaTramo(hora);

    // ✅ Validación de campos obligatorios
    if (!this.materialSeleccionado || !this.materialSeleccionado.idRecurso) {
      console.error('❌ Error: El material seleccionado no tiene un id válido');
      this.mostrarModalConMensaje('Error: Material no seleccionado');
      return;
    }

    if (!idProfesor) {
      console.error('❌ Error: No se pudo obtener el ID del profesor');
      this.mostrarModalConMensaje('Error: Usuario no identificado');
      return;
    }

    const reserva: ReservaRecursoDTO = {
      fecha: this.fechaSeleccionada,
      tramoHorario,
      idRecurso: Number(this.materialSeleccionado.idRecurso),
      idProfesor: Number(idProfesor)
    };

    console.log('🟢 Creando reserva de recurso:', reserva);
    
    // 🔥 Marcar como procesando
    this.procesandoReserva = true;

    this.reservaService.crearReservaRecurso(reserva).subscribe({
      next: (response) => {
        console.log('✅ Reserva creada exitosamente:', response);
        
        // 🔥 SOLUCIÓN: Actualización optimista con el ID del profesor correcto
        const nombreProfesor = localStorage.getItem('nombreCompleto') || 'Admin';
        const nuevaReserva: ReservaRecursoDTO = {
          ...reserva,
          idReserva: response?.idReserva || Date.now(),
          nombreProfesor: nombreProfesor,
          nombreRecurso: this.materialSeleccionado.nombre
        };
        
        this.reservas.push(nuevaReserva);
        console.log('✅ Reserva añadida al array local:', nuevaReserva);
        
        this.mostrarModalConMensaje('✅ Reserva creada correctamente');
        
        // Recargar después de un momento para confirmar
        setTimeout(() => {
          this.cargarReservas();
          this.procesandoReserva = false;
        }, 500);
      },
      error: (error) => {
        console.error('❌ Error al crear reserva:', error);
        console.error('📋 Detalles del error:', {
          status: error.status,
          mensaje: error.error,
          url: error.url
        });
        this.procesandoReserva = false;
        
        // Mejorar mensajes de error
        if (error.status === 500 || error.status === 409) {
          this.mostrarModalConMensaje('⚠️ Este horario ya está reservado para este material');
          this.cargarReservas();
        } else {
          this.mostrarModalConMensaje('❌ Error al crear la reserva. Intenta de nuevo.');
        }
      },
    });
  }

  cancelarReserva(hora: string): void {
    const reserva = this.getReservaPorHora(hora);
    if (!reserva || reserva.idReserva === undefined) {
      console.error('❌ El ID de la reserva no es válido.');
      return;
    }

    console.log('🔴 Cancelando reserva:', reserva);

    const esPropia = this.esReservaPropia(hora);
    
    // 🔥 Prevenir doble clic
    if (this.procesandoReserva) {
      return;
    }
    
    if (esPropia) {
      // Eliminar directamente si es propia
      this.procesandoReserva = true;
      
      this.reservaService.eliminarReservaRecurso(reserva.idReserva).subscribe({
        next: (response) => {
          console.log('✅ Reserva propia eliminada correctamente:', response);
          
          // 🔥 Actualización optimista
          this.reservas = this.reservas.filter(r => r.idReserva !== reserva.idReserva);
          console.log('✅ Reserva eliminada del array local');
          
          this.mostrarModalConMensaje('Reserva cancelada correctamente');
          
          setTimeout(() => {
            this.cargarReservas();
            this.procesandoReserva = false;
          }, 500);
        },
        error: (err) => {
          console.error('❌ Error real al cancelar la reserva:', err);
          this.procesandoReserva = false;
          this.mostrarModalConMensaje('Error al cancelar la reserva');
        }
      });
    } else {
      // Mostrar confirmación para reservas de otros
      this.modoConfirmacion = true;
      this.reservaActual = reserva;
      this.mostrarModalConMensaje(`¿Seguro que deseas cancelar la reserva de ${reserva.nombreProfesor}?`);
    }
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
    
    this.procesandoReserva = true;

    this.reservaService.eliminarReservaRecurso(this.reservaActual.idReserva).subscribe({
      next: (response) => {
        console.log('✅ Reserva eliminada correctamente:', response);
        
        // 🔥 Actualización optimista
        this.reservas = this.reservas.filter(r => r.idReserva !== this.reservaActual.idReserva);
        console.log('✅ Reserva eliminada del array local (confirmación)');
        
        this.cerrarModal();
        this.mostrarModalConMensaje('Reserva eliminada correctamente');
        
        setTimeout(() => {
          this.cargarReservas();
          this.procesandoReserva = false;
        }, 500);
      },
      error: (error) => {
        console.error('❌ Error real al eliminar la reserva:', error);
        this.procesandoReserva = false;
        this.cerrarModal();
        this.mostrarModalConMensaje('Error al eliminar la reserva');
      }
    });
  }
}