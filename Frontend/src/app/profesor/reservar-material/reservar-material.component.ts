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

  obtenerFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private esFechaPasada(fecha: string): boolean {
    const fechaSelec = new Date(fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaSelec < hoy;
  }

  ngOnInit(): void {
    console.log('✅ Inicializado ReservarMaterialComponent');
    this.fechaSeleccionada = this.obtenerFechaHoy();
    this.cargarMateriales();
  }

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
          this.cargarReservas();
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar materiales:', err);
        this.mostrarModalConMensaje('Error al cargar los materiales');
      },
    });
  }

  onFechaChange(): void {
    this.cargarReservas();
  }

  onMaterialChange(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    if (!this.fechaSeleccionada || !this.materialSeleccionado) return;

    if (this.esFechaPasada(this.fechaSeleccionada)) {
      console.warn('⚠️ No se pueden cargar reservas de fechas pasadas');
      this.reservas = [];
      return;
    }

    console.log(`🔄 Cargando reservas para fecha: ${this.fechaSeleccionada}, material: ${this.materialSeleccionado.nombre}`);

    this.reservaService
      .buscarReservasRecurso(this.fechaSeleccionada, this.materialSeleccionado.nombre)
      .subscribe({
        next: (data) => {
          console.log('🔍 DATOS DEL BACKEND:', data);
          
          const reservasMap = new Map<string, ReservaRecursoDTO>();
          
          (data || []).forEach(r => {
            const tramoCanonizado = this.canonizaTramo(r.tramoHorario);
            const key = `${tramoCanonizado}-${r.idRecurso}`;
            
            // 🔥 CORREGIDO: Crear objeto sin spread operator
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
          
          console.log('📋 Reservas procesadas:', this.reservas.map(r => ({
            tramo: r.tramoHorario,
            profesor: r.nombreProfesor,
            idProfesor: r.idProfesor,
            idProfesorTipo: typeof r.idProfesor
          })));
          
          const idProfesorActual = this.authService.getIdProfesor();
          console.log('🔑 Usuario actual - idProfesor:', idProfesorActual, 'nombre:', this.authService.getNombreCompleto());
        },
        error: (err) => {
          console.error('❌ Error al cargar reservas:', err);
          this.mostrarModalConMensaje('Error al cargar reservas');
          this.reservas = [];
        },
      });
  }

  isReservado(horaInicio: string): boolean {
    const tramo = this.normalizaTramo(horaInicio);
    return this.reservas.some(r => this.canonizaTramo(r.tramoHorario) === tramo);
  }

  // 🔥 SOLUCIÓN: Verificar por ID con fallback a nombre
  esReservaPropia(horaInicio: string): boolean {
    const r = this.getReservaPorHora(horaInicio);
    if (!r) {
      return false;
    }
    
    const idProfesorActual = this.authService.getIdProfesor();
    
    // Si el backend envía idProfesor, usar ese (más robusto)
    if (r.idProfesor !== undefined && r.idProfesor !== null && !isNaN(r.idProfesor as any)) {
      const idReservaProfesor = Number(r.idProfesor);
      const esPropia = idReservaProfesor === idProfesorActual;
      
      console.log(`👤 ¿Reserva propia ${horaInicio}? (por ID)`, {
        idProfesorActual: idProfesorActual,
        idProfesorReserva: idReservaProfesor,
        esPropia: esPropia
      });
      
      return esPropia;
    }
    
    // Fallback: Si no hay idProfesor, verificar por nombre
    console.warn(`⚠️ Reserva sin idProfesor válido, verificando por nombre`);
    const nombreActual = this.authService.getNombreCompleto().trim().toLowerCase();
    const nombreReserva = (r.nombreProfesor || '').trim().toLowerCase();
    const esPropiaPorNombre = nombreActual === nombreReserva;
    
    console.log(`👤 ¿Reserva propia ${horaInicio}? (por nombre)`, {
      nombreActual: nombreActual,
      nombreReserva: nombreReserva,
      esPropia: esPropiaPorNombre
    });
    
    return esPropiaPorNombre;
  }

  getReservaPorHora(horaInicio: string): ReservaRecursoDTO | undefined {
    const tramo = this.normalizaTramo(horaInicio);
    return this.reservas.find(r => this.canonizaTramo(r.tramoHorario) === tramo);
  }

  reservar(horaInicio: string): void {
    console.log('🎯 Iniciando proceso de reserva para:', horaInicio);
    
    if (this.procesandoReserva) {
      console.log('⚠️ Ya hay una reserva en proceso');
      return;
    }
    
    if (this.esFechaPasada(this.fechaSeleccionada)) {
      this.mostrarModalConMensaje('No se puede reservar en fechas pasadas');
      return;
    }

    if (this.isReservado(horaInicio)) {
      console.log('⚠️ El horario ya está reservado');
      if (this.esReservaPropia(horaInicio)) {
        this.mostrarModalConMensaje('⚠️ Ya tienes este horario reservado');
      } else {
        const reserva = this.getReservaPorHora(horaInicio);
        this.mostrarModalConMensaje(`⚠️ Este horario ya está reservado por ${reserva?.nombreProfesor || 'otro usuario'}`);
      }
      return;
    }

    const idProfesor = this.authService.getIdProfesor();
    const tramoHorario = this.normalizaTramo(horaInicio);

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
    
    this.procesandoReserva = true;

    this.reservaService.crearReservaRecurso(reserva).subscribe({
      next: (response) => {
        console.log('✅ Reserva creada exitosamente:', response);
        
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
        console.log('✅ Reserva añadida al array local');
        
        this.mostrarModalConMensaje('Reserva creada con éxito');
        
        setTimeout(() => {
          this.cargarReservas();
          this.procesandoReserva = false;
        }, 500);
      },
      error: (error) => {
        console.error('❌ Error al crear la reserva:', error);
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

  cancelarReserva(horaInicio: string): void {
    const reserva = this.getReservaPorHora(horaInicio);
    
    if (!reserva || !reserva.idReserva) {
      console.error('❌ No se encontró la reserva o no tiene ID válido');
      return;
    }

    if (!this.esReservaPropia(horaInicio)) {
      console.log('❌ No se puede cancelar una reserva de otro usuario');
      this.mostrarModalConMensaje('No puedes cancelar una reserva que no es tuya');
      return;
    }

    console.log('🔴 Cancelando reserva:', reserva);
    
    if (this.procesandoReserva) {
      return;
    }
    this.procesandoReserva = true;

    this.reservaService.eliminarReservaRecurso(reserva.idReserva).subscribe({
      next: (response) => {
        console.log('✅ Reserva eliminada correctamente:', response);
        
        this.reservas = this.reservas.filter(r => r.idReserva !== reserva.idReserva);
        console.log('✅ Reserva eliminada del array local');
        
        this.mostrarModalConMensaje('Reserva cancelada correctamente');
        
        setTimeout(() => {
          this.cargarReservas();
          this.procesandoReserva = false;
        }, 500);
      },
      error: (err) => {
        console.error('❌ Error al cancelar la reserva:', err);
        this.procesandoReserva = false;
        this.mostrarModalConMensaje('Error al cancelar la reserva');
      },
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

    this.reservaService.eliminarReservaRecurso(this.reservaActual.idReserva!).subscribe({
      next: (response) => {
        console.log('✅ Reserva eliminada correctamente:', response);
        this.mostrarModalConMensaje('Reserva eliminada correctamente');
        setTimeout(() => this.cargarReservas(), 300);
      },
      error: (error) => {
        console.error('❌ Error al eliminar la reserva:', error);
        this.mostrarModalConMensaje('Error al eliminar la reserva');
      }
    });

    this.cerrarModal();
  }
}