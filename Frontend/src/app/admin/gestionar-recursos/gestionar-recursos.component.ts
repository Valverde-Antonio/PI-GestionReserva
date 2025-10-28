import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService, ReservaRecursoDTO } from '../../services/reserva.service';
import { RecursoService } from '../../services/recurso.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gestionar-recursos',
  standalone: true,
  imports: [CommonModule, FormsModule, ],
  templateUrl: './gestionar-recursos.component.html',
  styleUrls: ['./gestionar-recursos.component.css'],
})
export class GestionarRecursosComponent implements OnInit {
  fechaSeleccionada: string = '';
  materialSeleccionado: any = null;
  materiales: any[] = [];
  turnos: string[] = [];
  reservas: ReservaRecursoDTO[] = [];

  mostrarModal: boolean = false;
  mensajeModal: string = '';

  constructor(
    private reservaService: ReservaService,
    private recursoService: RecursoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('✅ Inicializado GestionarRecursosComponent');

    // Cargar turnos desde el backend
    this.reservaService.getTurnos().subscribe({
      next: (data) => {
        this.turnos = data;
        console.log('🕐 Turnos cargados:', this.turnos);
      },
      error: (err) => {
        console.error('❌ Error al cargar turnos:', err);
      },
    });

    // Cargar recursos/materiales desde el backend
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

  // Cargar las reservas de acuerdo a la fecha y el material seleccionado
  cargarReservas(): void {
    if (!this.fechaSeleccionada || !this.materialSeleccionado) return;
    console.log(
      `🔄 Cargando reservas para ${this.fechaSeleccionada}, material: ${this.materialSeleccionado.nombre}`
    );
    this.reservaService
      .buscarReservasRecurso(
        this.fechaSeleccionada,
        this.materialSeleccionado.nombre
      )
      .subscribe({
        next: (data) => {
          this.reservas = data;
          console.log('📋 Reservas recibidas:', this.reservas);
        },
        error: (err) => {
          console.error('❌ Error al cargar reservas:', err);
          this.mostrarModalConMensaje('Error al cargar reservas');
        },
      });
  }

  // Verificar si un turno está reservado
  isReservado(hora: string): boolean {
    return this.reservas.some((r) => r.tramoHorario.startsWith(hora));
  }

  // Verificar si la reserva es propia
  esReservaPropia(hora: string): boolean {
    const reserva = this.getReservaPorHora(hora);
    const idProfesor = this.authService.getIdProfesor(); // Obtener el ID del profesor logueado
    const esPropia = reserva
      ? Number(reserva.idProfesor) === Number(idProfesor)
      : false; // Asegurarse de comparar los números

    console.log(`👤 ¿Es propia la reserva de ${hora}? → ${esPropia}`, reserva);
    return esPropia;
  }

  // Obtener la reserva de un turno específico
  getReservaPorHora(hora: string): ReservaRecursoDTO | undefined {
    const reserva = this.reservas.find((r) => r.tramoHorario.startsWith(hora));
    console.log(`🔍 Reserva encontrada para ${hora}:`, reserva);
    return reserva;
  }

  // Realizar la reserva de un recurso
  reservar(hora: string): void {
    const idProfesor = this.authService.getIdProfesor();

    // Verificar que materialSeleccionado tenga un idRecurso válido
    if (!this.materialSeleccionado || !this.materialSeleccionado.idRecurso) {
      console.error('❌ Error: El material seleccionado no tiene un id válido');
      this.mostrarModalConMensaje('Error: Material no seleccionado o sin ID');
      return;
    }

    // Crear el objeto de reserva con los datos necesarios (sin cantidad)
    const reserva: ReservaRecursoDTO = {
      fecha: this.fechaSeleccionada,
      tramoHorario: hora,
      idRecurso: this.materialSeleccionado.idRecurso,
      idProfesor: idProfesor,
    };

    console.log('🟢 Enviando reserva al backend:', reserva);

    // Validación básica de campos requeridos
    if (!reserva.idRecurso || !reserva.idProfesor || !reserva.fecha || !reserva.tramoHorario) {
      console.error('❌ Error: Los datos de la reserva no están completos:', reserva);
      this.mostrarModalConMensaje('Error: Datos de la reserva incompletos');
      return;
    }

    // Llamar al servicio para crear la reserva
    this.reservaService.crearReservaRecurso(reserva).subscribe({
      next: () => {
        console.log('✅ Reserva creada con éxito');
        this.mostrarModalConMensaje('Reserva creada con éxito');
        this.cargarReservas();  // Cargar nuevamente las reservas
      },
      error: (error) => {
        console.error('❌ Error al crear reserva:', error);

        // Verificar el tipo de error
        if (error.status === 500 || error.status === 409) {
          console.error('❌ El turno ya está reservado');
          this.mostrarModalConMensaje('El turno ya está reservado');
        } else {
          console.error('❌ Error desconocido al crear la reserva');
          this.mostrarModalConMensaje('Error al crear la reserva');
        }
      },
    });
  }

  // Cancelar una reserva, incluso de otros profesores (modo directivo)
  cancelarReserva(hora: string): void {
    const reserva = this.getReservaPorHora(hora);
    if (!reserva || reserva.idReserva === undefined) {
      console.error('❌ El ID de la reserva no es válido.');
      return;
    }

    console.log('🔴 Eliminando reserva:', reserva);
    console.log('ID de la reserva a eliminar:', reserva.idReserva);

    // Llamada al servicio de eliminación
    this.reservaService.eliminarReservaRecurso(reserva.idReserva).subscribe({
      next: () => {
        console.log('✅ Reserva cancelada');
        this.reservas = this.reservas.filter(
          (r) => r.idReserva !== reserva.idReserva
        );
        this.mostrarModalConMensaje('Reserva cancelada correctamente');
      },
      error: (err) => {
        console.error('❌ Error al cancelar reserva:', err);
        this.mostrarModalConMensaje('Error al cancelar la reserva');
      },
    });
  }

  // Mostrar modal con mensaje
  mostrarModalConMensaje(mensaje: string) {
    this.mensajeModal = mensaje;
    this.mostrarModal = true;
  }

  // Cerrar el modal
  cerrarModal() {
    this.mostrarModal = false;
    this.mensajeModal = '';
  }
}
