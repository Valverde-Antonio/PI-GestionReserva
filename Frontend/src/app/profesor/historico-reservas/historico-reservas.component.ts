import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HeaderComponent } from '../../header/header.component';
import { ReservaService } from '../../services/reserva.service';
import { RecursoService } from '../../services/recurso.service';
import { EspacioService } from '../../services/espacio.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-historico-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './historico-reservas.component.html',
  styleUrls: ['./historico-reservas.component.css']
})
export class HistoricoReservasComponent implements OnInit {
  historial: any[] = [];
  filtradoReservas: any[] = [];

  filtroFecha: string = '';
  filtroMaterial: string = '';
  filtroAula: string = '';
  filtroEstado: string = '';

  aulas: string[] = [];
  materiales: string[] = [];
  espacios: any[] = [];
  recursos: any[] = [];

  usuarioLogueado: string = '';
  idProfesorActual: number = 0;

  tramosHorarios: string[] = [
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:30-12:30',
    '12:30-13:30',
    '13:30-14:30'
  ];

  // Paginación
  currentPage: number = 1;
  pageSize: number = 5;

  mostrarModalActualizar: boolean = false;
  reservaSeleccionada: any = null;

  mostrarModalEliminar: boolean = false;
  reservaAEliminar: any = null;

  // Loading states
  cargando: boolean = false;
  procesando: boolean = false;

  constructor(
    private reservaService: ReservaService,
    private recursoService: RecursoService,
    private espacioService: EspacioService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usuarioLogueado = this.authService.getNombreCompleto();
    this.idProfesorActual = this.authService.getIdProfesor();
    
    console.log('👤 Usuario actual:', this.usuarioLogueado, 'ID:', this.idProfesorActual);
    
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    
    // Cargar espacios
    this.espacioService.getEspacios().subscribe({
      next: data => {
        this.espacios = data;
        this.aulas = data.map((e: any) => e.nombre).sort();
        console.log('🏫 Espacios cargados:', this.espacios);
      },
      error: err => console.error('Error al cargar espacios:', err)
    });

    // Cargar recursos
    this.recursoService.getRecursos().subscribe({
      next: data => {
        this.recursos = data;
        this.materiales = data.map((r: any) => r.nombre).sort();
        console.log('📦 Recursos cargados:', this.recursos);
      },
      error: err => console.error('Error al cargar recursos:', err)
    });

    // Cargar reservas
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservaService.getHistorialCompleto().subscribe({
      next: ([reservasEspacios, reservasRecursos]: [any[], any[]]) => {
        // Procesar reservas de espacios
        const espaciosUsuario = (reservasEspacios || [])
          .filter((r: any) => {
            const idProfesor = r.idProfesor;
            return Number(idProfesor) === this.idProfesorActual;
          })
          .map((r: any) => ({
            id: r.idReserva,
            tipo: 'Aula',
            espacio: r.nombreEspacio,
            recurso: '',
            fecha: r.fecha,
            horaInicio: this.extraerHoraInicio(r.tramoHorario),
            tramoHorario: r.tramoHorario,
            estado: this.calcularEstado(r.fecha),
            idEspacio: r.idEspacio,
            idProfesor: r.idProfesor
          }));

        // Procesar reservas de recursos
        const recursosUsuario = (reservasRecursos || [])
          .filter((r: any) => {
            const idProfesor = r.idProfesor;
            return Number(idProfesor) === this.idProfesorActual;
          })
          .map((r: any) => ({
            id: r.idReserva,
            tipo: 'Material',
            espacio: '',
            recurso: r.nombreRecurso,
            fecha: r.fecha,
            horaInicio: this.extraerHoraInicio(r.tramoHorario),
            tramoHorario: r.tramoHorario,
            estado: this.calcularEstado(r.fecha),
            idRecurso: r.idRecurso,
            idProfesor: r.idProfesor
          }));

        this.historial = [...espaciosUsuario, ...recursosUsuario].sort((a, b) => {
          // Ordenar por fecha descendente (más reciente primero)
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });

        console.log('📋 Mis reservas cargadas:', this.historial.length);
        this.filtrarReservas();
        this.cargando = false;
      },
      error: err => {
        console.error('Error al cargar reservas:', err);
        this.cargando = false;
      }
    });
  }

  extraerHoraInicio(tramoHorario: string): string {
    if (!tramoHorario) return '';
    // Si viene "08:00-09:00", extraer "08:00"
    if (tramoHorario.includes('-')) {
      return tramoHorario.split('-')[0].trim();
    }
    return tramoHorario;
  }

  calcularEstado(fecha: string): string {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaReserva = new Date(fecha + 'T00:00:00');
    
    if (fechaReserva < hoy) {
      return 'Finalizada';
    } else if (fechaReserva.getTime() === hoy.getTime()) {
      return 'En curso';
    } else {
      return 'Pendiente';
    }
  }

  filtrarReservas(): void {
    this.filtradoReservas = this.historial.filter(h => {
      const coincideFecha = this.filtroFecha ? h.fecha === this.filtroFecha : true;
      const coincideMaterial = h.tipo === 'Material' ? (this.filtroMaterial ? h.recurso === this.filtroMaterial : true) : true;
      const coincideAula = h.tipo === 'Aula' ? (this.filtroAula ? h.espacio === this.filtroAula : true) : true;
      const coincideEstado = this.filtroEstado ? h.estado === this.filtroEstado : true;
      return coincideFecha && coincideMaterial && coincideAula && coincideEstado;
    });
    this.currentPage = 1;
    console.log('🔍 Reservas filtradas:', this.filtradoReservas.length);
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroMaterial = '';
    this.filtroAula = '';
    this.filtroEstado = '';
    this.filtrarReservas();
  }

  get totalPages(): number {
    return Math.ceil(this.filtradoReservas.length / this.pageSize);
  }

  get reservasPaginadas(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtradoReservas.slice(start, start + this.pageSize);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
    }
  }

  modificarReserva(reserva: any): void {
    // Solo permitir editar reservas pendientes o en curso
    if (reserva.estado === 'Finalizada') {
      alert('No se pueden modificar reservas finalizadas');
      return;
    }

    this.reservaSeleccionada = { ...reserva };
    console.log('📝 Editando reserva:', this.reservaSeleccionada);
    this.mostrarModalActualizar = true;
  }

  cerrarModal(): void {
    this.mostrarModalActualizar = false;
    this.reservaSeleccionada = null;
  }

  guardarCambios(): void {
    if (!this.reservaSeleccionada || this.procesando) return;

    // Validar que la fecha no sea del pasado
    const fechaReserva = new Date(this.reservaSeleccionada.fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaReserva < hoy) {
      alert('No se puede modificar una reserva con fecha pasada');
      return;
    }

    console.log('💾 Guardando cambios de reserva:', this.reservaSeleccionada);
    this.procesando = true;

    const dto: any = {
      fecha: this.reservaSeleccionada.fecha,
      tramoHorario: this.reservaSeleccionada.tramoHorario,
      idProfesor: this.idProfesorActual
    };

    if (this.reservaSeleccionada.tipo === 'Aula') {
      const espacioSeleccionado = this.espacios.find(e => e.nombre === this.reservaSeleccionada.espacio);
      dto.idEspacio = espacioSeleccionado ? espacioSeleccionado.idEspacio : this.reservaSeleccionada.idEspacio;

      this.reservaService.actualizarReservaEspacio(this.reservaSeleccionada.id, dto).subscribe({
        next: () => {
          console.log('✅ Reserva de aula actualizada');
          alert('Reserva actualizada correctamente');
          this.procesando = false;
          this.cerrarModal();
          this.cargarReservas();
        },
        error: (error) => {
          console.error('❌ Error al actualizar:', error);
          alert(error.error || 'Error al actualizar la reserva');
          this.procesando = false;
        }
      });
    } else {
      const recursoSeleccionado = this.recursos.find(r => r.nombre === this.reservaSeleccionada.recurso);
      dto.idRecurso = recursoSeleccionado ? recursoSeleccionado.idRecurso : this.reservaSeleccionada.idRecurso;

      this.reservaService.actualizarReservaRecurso(this.reservaSeleccionada.id, dto).subscribe({
        next: () => {
          console.log('✅ Reserva de material actualizada');
          alert('Reserva actualizada correctamente');
          this.procesando = false;
          this.cerrarModal();
          this.cargarReservas();
        },
        error: (error) => {
          console.error('❌ Error al actualizar:', error);
          alert(error.error || 'Error al actualizar la reserva');
          this.procesando = false;
        }
      });
    }
  }

  eliminarReserva(reserva: any): void {
    // Solo permitir eliminar reservas pendientes o en curso
    if (reserva.estado === 'Finalizada') {
      alert('No se pueden eliminar reservas finalizadas');
      return;
    }

    this.reservaAEliminar = reserva;
    this.mostrarModalEliminar = true;
  }

  confirmarEliminacion(): void {
    if (!this.reservaAEliminar || this.procesando) return;

    console.log('🗑️ Eliminando reserva:', this.reservaAEliminar);
    this.procesando = true;

    if (this.reservaAEliminar.tipo === 'Aula') {
      this.reservaService.eliminarReservaEspacio(this.reservaAEliminar.id).subscribe({
        next: () => {
          console.log('✅ Reserva de aula eliminada');
          alert('Reserva eliminada correctamente');
          this.procesando = false;
          this.cancelarEliminacion();
          this.cargarReservas();
        },
        error: (error) => {
          console.error('❌ Error al eliminar:', error);
          alert('Error al eliminar la reserva');
          this.procesando = false;
        }
      });
    } else {
      this.reservaService.eliminarReservaRecurso(this.reservaAEliminar.id).subscribe({
        next: () => {
          console.log('✅ Reserva de material eliminada');
          alert('Reserva eliminada correctamente');
          this.procesando = false;
          this.cancelarEliminacion();
          this.cargarReservas();
        },
        error: (error) => {
          console.error('❌ Error al eliminar:', error);
          alert('Error al eliminar la reserva');
          this.procesando = false;
        }
      });
    }
  }

  cancelarEliminacion(): void {
    this.reservaAEliminar = null;
    this.mostrarModalEliminar = false;
  }

  exportarPDFMisReservas(): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('Mis Reservas', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Profesor: ${this.usuarioLogueado}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

    const fechaGeneracion = new Date().toLocaleDateString('es-ES');
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${fechaGeneracion}`, doc.internal.pageSize.getWidth() / 2, 37, { align: 'center' });

    autoTable(doc, {
      head: [['Tipo', 'Espacio/Material', 'Fecha', 'Hora', 'Estado']],
      body: this.filtradoReservas.map(h => [
        h.tipo,
        h.espacio || h.recurso || '',
        h.fecha,
        h.tramoHorario,
        h.estado
      ]),
      startY: 45,
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: [60, 126, 102], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.text('IES ALMUDEYNE', 14, pageHeight - 10);
    doc.text(`Total: ${this.filtradoReservas.length} reservas`, doc.internal.pageSize.getWidth() - 50, pageHeight - 10);
    
    doc.save(`mis-reservas-${new Date().getTime()}.pdf`);
    console.log('📄 PDF generado exitosamente');
  }

  puedeModificar(reserva: any): boolean {
    return reserva.estado !== 'Finalizada';
  }

  puedeEliminar(reserva: any): boolean {
    return reserva.estado !== 'Finalizada';
  }

  obtenerFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}