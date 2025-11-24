import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReservaService } from '../../services/reserva.service';
import { RecursoService } from '../../services/recurso.service';
import { EspacioService } from '../../services/espacio.service';
import { ProfesorService } from '../../services/profesor.service';

@Component({
  selector: 'app-todas-las-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todas-las-reservas.component.html',
  styleUrls: ['./todas-las-reservas.component.css']
})
export class TodasLasReservasComponent implements OnInit {
  reservas: any[] = [];
  filtradoReservas: any[] = [];

  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  filtroMaterial: string = '';
  filtroProfesor: string = '';
  filtroAula: string = '';
  filtroTipo: string = 'Todas';

  profesores: any[] = [];
  espacios: any[] = [];
  materiales: any[] = [];

  tramosHorarios: string[] = [
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:30-12:30',
    '12:30-13:30',
    '13:30-14:30'
  ];

  usuarioLogeado: string = '';

  currentPage: number = 1;
  pageSize: number = 4;

  mostrarModalActualizar: boolean = false;
  reservaSeleccionada: any = null;

  mostrarModalEliminar: boolean = false;
  reservaAEliminar: any = null;

  // Modales para directivo
  mostrarModalConflicto: boolean = false;
  conflictoInfo: any = null;
  reservaConflictiva: any = null;

  mostrarModalInformativo: boolean = false;
  mensajeInformativo: string = '';
  tipoMensaje: 'success' | 'error' | 'warning' | 'info' = 'info';

  // Estados de carga
  cargando: boolean = false;
  procesando: boolean = false;

  constructor(
    private reservaService: ReservaService,
    private recursoService: RecursoService,
    private espacioService: EspacioService,
    private profesorService: ProfesorService
  ) { }

  ngOnInit(): void {
    this.usuarioLogeado = localStorage.getItem('nombreCompleto') || '';
    this.filtroFechaDesde = this.obtenerFechaHoy();
    this.filtroFechaHasta = this.obtenerFechaHoy();
    this.cargarDatos();
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
   * Carga todos los datos necesarios: profesores, materiales, espacios y reservas
   */
  cargarDatos(): void {
    this.cargando = true;
    this.cargarProfesores();
    this.cargarMateriales();
    this.cargarEspacios();
    this.cargarReservas();
  }

  /**
   * Carga la lista de profesores
   */
  cargarProfesores(): void {
    this.profesorService.getProfesores().subscribe({
      next: data => {
        this.profesores = data;
      },
      error: err => console.error('Error al cargar profesores:', err)
    });
  }

  /**
   * Carga la lista de materiales/recursos
   */
  cargarMateriales(): void {
    this.recursoService.getRecursos().subscribe({
      next: data => {
        this.materiales = data;
      },
      error: err => console.error('Error al cargar materiales:', err)
    });
  }

  /**
   * Carga la lista de espacios/aulas
   */
  cargarEspacios(): void {
    this.espacioService.getEspacios().subscribe({
      next: data => {
        this.espacios = data;
      },
      error: err => console.error('Error al cargar espacios:', err)
    });
  }

  /**
   * Carga el historial completo de reservas (espacios y recursos)
   */
  cargarReservas(): void {
    this.reservaService.getHistorialCompleto().subscribe({
      next: ([espacios, recursos]: [any[], any[]]) => {
        const reservasEspacios = espacios.map((r: any) => ({
          id: r.idReserva,
          idEspacio: r.idEspacio,
          idProfesor: r.idProfesor,
          espacio: r.nombreEspacio,
          recurso: '',
          fecha: r.fecha,
          horaInicio: r.tramoHorario,
          horaFin: r.tramoHorario,
          tramoHorario: r.tramoHorario,
          estado: this.calcularEstado(r.fecha),
          profesor: r.nombreProfesor,
          tipo: 'Aula'
        }));

        const reservasRecursos = recursos.map((r: any) => ({
          id: r.idReserva,
          idRecurso: r.idRecurso,
          idProfesor: r.idProfesor,
          espacio: '',
          recurso: r.nombreRecurso,
          fecha: r.fecha,
          horaInicio: r.tramoHorario,
          horaFin: r.tramoHorario,
          tramoHorario: r.tramoHorario,
          estado: this.calcularEstado(r.fecha),
          profesor: r.nombreProfesor,
          tipo: 'Material'
        }));

        this.reservas = [...reservasEspacios, ...reservasRecursos].sort((a, b) => {
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });

        this.filtrarReservas();
        this.cargando = false;
      },
      error: err => {
        console.error('Error al cargar reservas:', err);
        this.cargando = false;
      }
    });
  }

  /**
   * Calcula el estado de una reserva según su fecha
   */
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

  /**
   * Aplica los filtros seleccionados a las reservas
   */
  filtrarReservas(): void {
    this.filtradoReservas = this.reservas.filter(r => {
      // Filtro por rango de fechas
      let coincideFecha = true;
      if (this.filtroFechaDesde && this.filtroFechaHasta) {
        const fechaReserva = new Date(r.fecha + 'T00:00:00');
        const fechaDesde = new Date(this.filtroFechaDesde + 'T00:00:00');
        const fechaHasta = new Date(this.filtroFechaHasta + 'T00:00:00');
        coincideFecha = fechaReserva >= fechaDesde && fechaReserva <= fechaHasta;
      } else if (this.filtroFechaDesde) {
        const fechaReserva = new Date(r.fecha + 'T00:00:00');
        const fechaDesde = new Date(this.filtroFechaDesde + 'T00:00:00');
        coincideFecha = fechaReserva >= fechaDesde;
      } else if (this.filtroFechaHasta) {
        const fechaReserva = new Date(r.fecha + 'T00:00:00');
        const fechaHasta = new Date(this.filtroFechaHasta + 'T00:00:00');
        coincideFecha = fechaReserva <= fechaHasta;
      }

      const coincideMaterial = (r.tipo === 'Material' && this.filtroMaterial)
        ? r.recurso === this.filtroMaterial
        : true;

      const coincideAula = (r.tipo === 'Aula' && this.filtroAula)
        ? r.espacio === this.filtroAula
        : true;

      const coincideProfesor = this.filtroProfesor ? r.profesor === this.filtroProfesor : true;
      const coincideTipo = (this.filtroTipo === 'Todas') ? true : r.tipo === this.filtroTipo;

      return coincideFecha && coincideMaterial && coincideAula && coincideProfesor && coincideTipo;
    });

    this.currentPage = 1;
  }

  /**
   * Limpia todos los filtros aplicados
   */
  limpiarFiltros(): void {
    this.filtroFechaDesde = this.obtenerFechaHoy();
    this.filtroFechaHasta = this.obtenerFechaHoy();
    this.filtroMaterial = '';
    this.filtroAula = '';
    this.filtroTipo = 'Todas';
    this.filtroProfesor = '';
    this.filtrarReservas();
  }

  /**
   * Genera un PDF con todas las reservas filtradas con logo institucional
   */
  exportarPDFTodasReservas(): void {
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = 'assets/img/logoAlmudeyne.png';

    logo.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Borde superior azul
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(1.5);
      doc.line(10, 10, pageWidth - 10, 10);

      doc.setFontSize(8);
      doc.setTextColor(41, 128, 185);
      doc.text('FORMATO DE IMPRESIÓN TODAS LAS RESERVAS', 15, 8);

      // Logo
      doc.addImage(logo, 'PNG', 20, 18, 35, 35);

      // Título
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('TODAS LAS RESERVAS', pageWidth / 2, 35, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(60, 42, pageWidth - 60, 42);

      // Información del listado
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('LISTADO DE RESERVAS', 20, 58);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const fechaDesde = this.filtroFechaDesde || 'dd/MM/yyyy';
      const fechaHasta = this.filtroFechaHasta || 'dd/MM/yyyy';
      doc.text(`Fecha desde: ${fechaDesde}`, 20, 65);
      doc.text(`Fecha hasta: ${fechaHasta}`, 110, 65);

      // Ordenar reservas por fecha y tramo horario
      const reservasOrdenadas = [...this.filtradoReservas].sort((a, b) => {
        const fechaComparison = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        if (fechaComparison !== 0) {
          return fechaComparison;
        }

        const horaA = this.extraerHoraInicioParaOrdenar(a.tramoHorario);
        const horaB = this.extraerHoraInicioParaOrdenar(b.tramoHorario);
        return horaA - horaB;
      });

      // Tabla de reservas
      autoTable(doc, {
        head: [['Fecha', 'Tipo', 'Espacio/Material', 'Tramo Horario', 'Profesor', 'Estado']],
        body: reservasOrdenadas.map(r => [
          r.fecha,
          r.tipo,
          r.tipo === 'Aula' ? r.espacio : r.recurso,
          r.tramoHorario,
          r.profesor,
          r.estado
        ]),
        startY: 80,
        styles: {
          halign: 'center',
          valign: 'middle',
          fontSize: 9,
          cellPadding: 5,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [25, 77, 67],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 20, right: 20 },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1
      });

      // Pie de página
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Total de reservas: ${this.filtradoReservas.length}`,
        20,
        pageHeight - 15
      );

      const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      doc.text(
        `Fecha de generación: ${fechaGeneracion}`,
        pageWidth / 2,
        pageHeight - 15,
        { align: 'center' }
      );

      doc.text(
        'IES Almudeyne',
        pageWidth - 20,
        pageHeight - 15,
        { align: 'right' }
      );

      doc.save(`todas_reservas_${new Date().getTime()}.pdf`);
    };

    logo.onerror = () => {
      console.warn('Error al cargar el logo del instituto');
      this.generarPDFSinLogo();
    };
  }

  /**
   * Genera un PDF sin logo en caso de error de carga
   */
  generarPDFSinLogo(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1.5);
    doc.line(10, 10, pageWidth - 10, 10);

    doc.setFontSize(8);
    doc.setTextColor(41, 128, 185);
    doc.text('FORMATO DE IMPRESIÓN TODAS LAS RESERVAS', 15, 8);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TODAS LAS RESERVAS', pageWidth / 2, 25, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(60, 32, pageWidth - 60, 32);

    doc.setFontSize(10);
    doc.text('LISTADO DE RESERVAS', 20, 45);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const fechaGeneracion = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha: ${fechaGeneracion}`, 20, 52);

    const reservasOrdenadas = [...this.filtradoReservas].sort((a, b) => {
      const fechaComparison = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      if (fechaComparison !== 0) return fechaComparison;

      const horaA = this.extraerHoraInicioParaOrdenar(a.tramoHorario);
      const horaB = this.extraerHoraInicioParaOrdenar(b.tramoHorario);
      return horaA - horaB;
    });

    autoTable(doc, {
      head: [['Fecha', 'Tipo', 'Espacio/Material', 'Tramo Horario', 'Profesor', 'Estado']],
      body: reservasOrdenadas.map(r => [
        r.fecha,
        r.tipo,
        r.tipo === 'Aula' ? r.espacio : r.recurso,
        r.tramoHorario,
        r.profesor,
        r.estado
      ]),
      startY: 65,
      styles: {
        halign: 'center',
        fontSize: 9,
        cellPadding: 5,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [25, 77, 67],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 20, right: 20 }
    });

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Total: ${this.filtradoReservas.length}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`todas_reservas_${new Date().getTime()}.pdf`);
  }

  /**
   * Calcula el número total de páginas
   */
  get totalPages(): number {
    return Math.ceil(this.filtradoReservas.length / this.pageSize);
  }

  /**
   * Obtiene las reservas de la página actual
   */
  get reservasPaginadas(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtradoReservas.slice(start, start + this.pageSize);
  }

  /**
   * Cambia a una página específica
   */
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
    }
  }

  /**
   * Abre el modal para modificar una reserva
   */
  modificarReserva(reserva: any): void {
    this.reservaSeleccionada = { ...reserva };
    this.mostrarModalActualizar = true;
  }

  /**
   * Cierra el modal de actualización
   */
  cerrarModal(): void {
    this.mostrarModalActualizar = false;
    this.reservaSeleccionada = null;
  }

  /**
   * Guarda los cambios de una reserva verificando disponibilidad (con privilegios de directivo)
   */
  guardarCambios(): void {
    if (!this.reservaSeleccionada || this.procesando) return;

    this.procesando = true;

    const dto: any = {
      fecha: this.reservaSeleccionada.fecha,
      tramoHorario: this.reservaSeleccionada.horaInicio,
      idProfesor: this.reservaSeleccionada.idProfesor
    };

    const profesorCambiado = this.profesores.find(p => p.nombre === this.reservaSeleccionada.profesor);
    if (profesorCambiado) {
      dto.idProfesor = profesorCambiado.idProfesor;
    }

    if (this.reservaSeleccionada.tipo === 'Aula') {
      const espacioCambiado = this.espacios.find(e => e.nombre === this.reservaSeleccionada.espacio);
      dto.idEspacio = espacioCambiado ? espacioCambiado.idEspacio : this.reservaSeleccionada.idEspacio;

      // Verificar disponibilidad del espacio
      this.reservaService.verificarDisponibilidadEspacio(
        this.reservaSeleccionada.fecha,
        this.reservaSeleccionada.horaInicio,
        dto.idEspacio,
        this.reservaSeleccionada.id
      ).subscribe({
        next: (resultado) => {
          if (resultado.disponible) {
            this.actualizarReservaEspacio(dto);
          } else {
            this.procesando = false;
            this.conflictoInfo = {
              nombreEspacio: this.reservaSeleccionada.espacio,
              reservadoPor: resultado.reservadoPor,
              fecha: this.reservaSeleccionada.fecha,
              tramo: this.reservaSeleccionada.horaInicio,
              idReservaConflictiva: resultado.idReserva
            };

            this.reservaConflictiva = this.reservas.find(r => r.id === resultado.idReserva);
            this.mostrarModalConflicto = true;
          }
        },
        error: (error) => {
          console.error('Error al verificar disponibilidad:', error);
          this.mostrarMensajeInformativo('Error al verificar disponibilidad', 'error');
          this.procesando = false;
        }
      });
    } else {
      const recursoCambiado = this.materiales.find(m => m.nombre === this.reservaSeleccionada.recurso);
      dto.idRecurso = recursoCambiado ? recursoCambiado.idRecurso : this.reservaSeleccionada.idRecurso;

      // Verificar disponibilidad del recurso
      this.reservaService.verificarDisponibilidadRecurso(
        this.reservaSeleccionada.fecha,
        this.reservaSeleccionada.horaInicio,
        dto.idRecurso,
        this.reservaSeleccionada.id
      ).subscribe({
        next: (resultado) => {
          if (resultado.disponible) {
            this.actualizarReservaRecurso(dto);
          } else {
            this.procesando = false;
            this.conflictoInfo = {
              nombreRecurso: this.reservaSeleccionada.recurso,
              reservadoPor: resultado.reservadoPor,
              fecha: this.reservaSeleccionada.fecha,
              tramo: this.reservaSeleccionada.horaInicio,
              idReservaConflictiva: resultado.idReserva
            };

            this.reservaConflictiva = this.reservas.find(r => r.id === resultado.idReserva);
            this.mostrarModalConflicto = true;
          }
        },
        error: (error) => {
          console.error('Error al verificar disponibilidad:', error);
          this.mostrarMensajeInformativo('Error al verificar disponibilidad', 'error');
          this.procesando = false;
        }
      });
    }
  }

  /**
   * Actualiza una reserva de espacio
   */
  actualizarReservaEspacio(dto: any): void {
    this.reservaService.actualizarReservaEspacio(this.reservaSeleccionada.id, dto).subscribe({
      next: () => {
        this.mostrarMensajeInformativo('Reserva actualizada correctamente', 'success');
        this.procesando = false;
        this.cerrarModal();
        this.cargarReservas();
      },
      error: (error) => {
        console.error('Error al actualizar reserva de espacio:', error);
        this.mostrarMensajeInformativo('Error al actualizar la reserva: ' + (error.error?.message || error.message), 'error');
        this.procesando = false;
      }
    });
  }

  /**
   * Actualiza una reserva de recurso
   */
  actualizarReservaRecurso(dto: any): void {
    this.reservaService.actualizarReservaRecurso(this.reservaSeleccionada.id, dto).subscribe({
      next: () => {
        this.mostrarMensajeInformativo('Reserva actualizada correctamente', 'success');
        this.procesando = false;
        this.cerrarModal();
        this.cargarReservas();
      },
      error: (error) => {
        console.error('Error al actualizar reserva de recurso:', error);
        this.mostrarMensajeInformativo('Error al actualizar la reserva: ' + (error.error?.message || error.message), 'error');
        this.procesando = false;
      }
    });
  }

  /**
   * Elimina la reserva conflictiva y procede con la modificación (privilegios de directivo)
   */
  eliminarReservaConflictivaYModificar(): void {
    if (!this.reservaConflictiva || this.procesando) return;

    this.procesando = true;

    if (this.reservaConflictiva.tipo === 'Aula') {
      this.reservaService.eliminarReservaEspacio(this.reservaConflictiva.id).subscribe({
        next: () => {
          this.mostrarMensajeInformativo('Reserva conflictiva eliminada. Procediendo con la modificación...', 'info');
          this.cerrarModalConflicto();

          setTimeout(() => {
            this.procesando = false;
            this.guardarCambios();
          }, 500);
        },
        error: (error) => {
          console.error('Error al eliminar reserva conflictiva:', error);
          this.mostrarMensajeInformativo('Error al eliminar la reserva conflictiva', 'error');
          this.procesando = false;
        }
      });
    } else {
      this.reservaService.eliminarReservaRecurso(this.reservaConflictiva.id).subscribe({
        next: () => {
          this.mostrarMensajeInformativo('Reserva conflictiva eliminada. Procediendo con la modificación...', 'info');
          this.cerrarModalConflicto();

          setTimeout(() => {
            this.procesando = false;
            this.guardarCambios();
          }, 500);
        },
        error: (error) => {
          console.error('Error al eliminar reserva conflictiva:', error);
          this.mostrarMensajeInformativo('Error al eliminar la reserva conflictiva', 'error');
          this.procesando = false;
        }
      });
    }
  }

  /**
   * Mantiene la reserva actual sin realizar cambios
   */
  mantenerReservaActual(): void {
    this.cerrarModalConflicto();
    this.cerrarModal();
    this.mostrarMensajeInformativo('No se realizaron cambios en la reserva', 'info');
  }

  /**
   * Cierra el modal de conflicto
   */
  cerrarModalConflicto(): void {
    this.mostrarModalConflicto = false;
    this.conflictoInfo = null;
    this.reservaConflictiva = null;
  }

  /**
   * Abre el modal para eliminar una reserva
   */
  eliminarReserva(reserva: any): void {
    this.reservaAEliminar = reserva;
    this.mostrarModalEliminar = true;
  }

  /**
   * Confirma y ejecuta la eliminación de una reserva
   */
  confirmarEliminacion(): void {
    if (!this.reservaAEliminar || this.procesando) return;

    this.procesando = true;

    if (this.reservaAEliminar.tipo === 'Aula') {
      this.reservaService.eliminarReservaEspacio(this.reservaAEliminar.id).subscribe({
        next: () => {
          this.mostrarMensajeInformativo('Reserva eliminada correctamente', 'success');
          this.procesando = false;
          this.cancelarEliminacion();
          this.cargarReservas();
        },
        error: (error) => {
          console.error('Error al eliminar reserva de espacio:', error);
          this.mostrarMensajeInformativo('Error al eliminar la reserva', 'error');
          this.procesando = false;
        }
      });
    } else {
      this.reservaService.eliminarReservaRecurso(this.reservaAEliminar.id).subscribe({
        next: () => {
          this.mostrarMensajeInformativo('Reserva eliminada correctamente', 'success');
          this.procesando = false;
          this.cancelarEliminacion();
          this.cargarReservas();
        },
        error: (error) => {
          console.error('Error al eliminar reserva de recurso:', error);
          this.mostrarMensajeInformativo('Error al eliminar la reserva', 'error');
          this.procesando = false;
        }
      });
    }
  }

  /**
   * Cancela la eliminación de una reserva
   */
  cancelarEliminacion(): void {
    this.reservaAEliminar = null;
    this.mostrarModalEliminar = false;
  }

  /**
   * Muestra un mensaje informativo con el tipo especificado
   */
  mostrarMensajeInformativo(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info'): void {
    this.mensajeInformativo = mensaje;
    this.tipoMensaje = tipo;
    this.mostrarModalInformativo = true;
  }

  /**
   * Cierra el modal informativo
   */
  cerrarModalInformativo(): void {
    this.mostrarModalInformativo = false;
    this.mensajeInformativo = '';
  }

  /**
   * Convierte un tramo horario a minutos para ordenación
   */
  extraerHoraInicioParaOrdenar(tramoHorario: string): number {
    if (!tramoHorario) return 0;

    const horaInicio = tramoHorario.includes('-')
      ? tramoHorario.split('-')[0].trim()
      : tramoHorario;

    const [horas, minutos] = horaInicio.split(':').map(Number);
    return horas * 60 + minutos;
  }
}