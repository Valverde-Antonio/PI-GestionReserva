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

  // 🔥 NUEVOS: Modales para directivo
  mostrarModalConflicto: boolean = false;
  conflictoInfo: any = null;
  reservaConflictiva: any = null; // La reserva que está bloqueando

  mostrarModalInformativo: boolean = false;
  mensajeInformativo: string = '';
  tipoMensaje: 'success' | 'error' | 'warning' | 'info' = 'info';

  // Loading states
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

    console.log('👤 Usuario logeado:', this.usuarioLogeado);
    console.log('📅 Fecha inicial:', this.filtroFechaDesde);

    this.cargarDatos();
  }

  obtenerFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cargarDatos(): void {
    this.cargando = true;
    this.cargarProfesores();
    this.cargarMateriales();
    this.cargarEspacios();
    this.cargarReservas();
  }

  cargarProfesores(): void {
    this.profesorService.getProfesores().subscribe({
      next: data => {
        this.profesores = data;
        console.log('📘 Profesores cargados:', this.profesores);
      },
      error: err => console.error('Error al cargar profesores:', err)
    });
  }

  cargarMateriales(): void {
    this.recursoService.getRecursos().subscribe({
      next: data => {
        this.materiales = data;
        console.log('📦 Materiales cargados:', this.materiales);
      },
      error: err => console.error('Error al cargar materiales:', err)
    });
  }

  cargarEspacios(): void {
    this.espacioService.getEspacios().subscribe({
      next: data => {
        this.espacios = data;
        console.log('🏫 Espacios cargados:', this.espacios);
      },
      error: err => console.error('Error al cargar espacios:', err)
    });
  }

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

        console.log('📋 Reservas cargadas:', this.reservas);

        this.filtrarReservas();
        this.cargando = false;
      },
      error: err => {
        console.error('Error al cargar reservas:', err);
        this.cargando = false;
      }
    });
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
    this.filtradoReservas = this.reservas.filter(r => {
      // 🔥 Filtro por rango de fechas
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
    console.log('🔍 Reservas filtradas:', this.filtradoReservas.length);
  }

  limpiarFiltros(): void {
    this.filtroFechaDesde = this.obtenerFechaHoy();
    this.filtroFechaHasta = this.obtenerFechaHoy();
    this.filtroMaterial = '';
    this.filtroAula = '';
    this.filtroTipo = 'Todas';
    this.filtroProfesor = '';
    this.filtrarReservas();
  }

  exportarPDFTodasReservas(): void {
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = 'assets/img/logoAlmudeyne.png';

    logo.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // 🔵 BORDE SUPERIOR AZUL
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(1.5);
      doc.line(10, 10, pageWidth - 10, 10);

      // 🔵 Texto "FORMATO DE IMPRESIÓN" arriba del borde
      doc.setFontSize(8);
      doc.setTextColor(41, 128, 185);
      doc.text('FORMATO DE IMPRESIÓN TODAS LAS RESERVAS', 15, 8);

      // 🖼️ LOGO A LA IZQUIERDA
      doc.addImage(logo, 'PNG', 20, 18, 35, 35);

      // 📋 TÍTULO CENTRADO GRANDE
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('TODAS LAS RESERVAS', pageWidth / 2, 35, { align: 'center' });

      // 📐 LÍNEA HORIZONTAL DEBAJO DEL TÍTULO
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(60, 42, pageWidth - 60, 42);

      // 📝 INFORMACIÓN DEL LISTADO
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('LISTADO DE RESERVAS', 20, 58);

      // Fecha desde y hasta
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const fechaDesde = this.filtroFechaDesde || 'dd/MM/yyyy';
      const fechaHasta = this.filtroFechaHasta || 'dd/MM/yyyy';
      doc.text(`Fecha desde: ${fechaDesde}`, 20, 65);
      doc.text(`Fecha hasta: ${fechaHasta}`, 110, 65);

      // 🔥 ORDENAR reservas por fecha y luego por tramo horario
      const reservasOrdenadas = [...this.filtradoReservas].sort((a, b) => {
        // Primero ordenar por fecha
        const fechaComparison = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        if (fechaComparison !== 0) {
          return fechaComparison;
        }

        // Si las fechas son iguales, ordenar por hora de inicio del tramo
        const horaA = this.extraerHoraInicioParaOrdenar(a.tramoHorario);
        const horaB = this.extraerHoraInicioParaOrdenar(b.tramoHorario);
        return horaA - horaB;
      });

      // ✅ TABLA CON ESTILO VERDE OSCURO
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

      // 📄 PIE DE PÁGINA
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

      // 💾 GUARDAR PDF
      doc.save(`todas_reservas_${new Date().getTime()}.pdf`);
      console.log('📄 PDF generado con estilo personalizado y ordenado');
    };

    logo.onerror = () => {
      console.warn('⚠️ Error al cargar el logo del instituto');
      this.generarPDFSinLogo();
    };
  }

  // 🔥 VERSIÓN SIN LOGO (por si falla la carga)
  generarPDFSinLogo(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Borde superior azul
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1.5);
    doc.line(10, 10, pageWidth - 10, 10);

    doc.setFontSize(8);
    doc.setTextColor(41, 128, 185);
    doc.text('FORMATO DE IMPRESIÓN TODAS LAS RESERVAS', 15, 8);

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TODAS LAS RESERVAS', pageWidth / 2, 25, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(60, 32, pageWidth - 60, 32);

    // Información
    doc.setFontSize(10);
    doc.text('LISTADO DE RESERVAS', 20, 45);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const fechaGeneracion = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha: ${fechaGeneracion}`, 20, 52);

    // Tabla con ordenación
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
    this.reservaSeleccionada = { ...reserva };
    console.log('📝 Reserva seleccionada para editar:', this.reservaSeleccionada);
    this.mostrarModalActualizar = true;
  }

  cerrarModal(): void {
    this.mostrarModalActualizar = false;
    this.reservaSeleccionada = null;
  }

  // 🔥 NUEVA LÓGICA: Verificar disponibilidad antes de guardar (CON PRIVILEGIOS DE DIRECTIVO)
  guardarCambios(): void {
    if (!this.reservaSeleccionada || this.procesando) return;

    console.log('💾 Guardando cambios de reserva:', this.reservaSeleccionada);
    this.procesando = true;

    const dto: any = {
      fecha: this.reservaSeleccionada.fecha,
      tramoHorario: this.reservaSeleccionada.horaInicio,
      idProfesor: this.reservaSeleccionada.idProfesor
    };

    // Si el usuario cambió el profesor en el select, buscar el nuevo ID
    const profesorCambiado = this.profesores.find(p => p.nombre === this.reservaSeleccionada.profesor);
    if (profesorCambiado) {
      dto.idProfesor = profesorCambiado.idProfesor;
    }

    // Determinar si es reserva de espacio o recurso
    if (this.reservaSeleccionada.tipo === 'Aula') {
      const espacioCambiado = this.espacios.find(e => e.nombre === this.reservaSeleccionada.espacio);
      dto.idEspacio = espacioCambiado ? espacioCambiado.idEspacio : this.reservaSeleccionada.idEspacio;

      // 🔥 Verificar disponibilidad
      this.reservaService.verificarDisponibilidadEspacio(
        this.reservaSeleccionada.fecha,
        this.reservaSeleccionada.horaInicio,
        dto.idEspacio,
        this.reservaSeleccionada.id
      ).subscribe({
        next: (resultado) => {
          console.log('📊 Resultado verificación:', resultado);

          if (resultado.disponible) {
            // ✅ Está disponible, proceder a guardar
            this.actualizarReservaEspacio(dto);
          } else {
            // ❌ NO está disponible - MOSTRAR MODAL DE CONFLICTO PARA DIRECTIVO
            this.procesando = false;
            this.conflictoInfo = {
              nombreEspacio: this.reservaSeleccionada.espacio,
              reservadoPor: resultado.reservadoPor,
              fecha: this.reservaSeleccionada.fecha,
              tramo: this.reservaSeleccionada.horaInicio,
              idReservaConflictiva: resultado.idReserva
            };

            // 🔥 Buscar la reserva conflictiva completa
            this.reservaConflictiva = this.reservas.find(r => r.id === resultado.idReserva);

            this.mostrarModalConflicto = true;
          }
        },
        error: (error) => {
          console.error('❌ Error al verificar disponibilidad:', error);
          this.mostrarMensajeInformativo('Error al verificar disponibilidad', 'error');
          this.procesando = false;
        }
      });
    } else {
      // Material
      const recursoCambiado = this.materiales.find(m => m.nombre === this.reservaSeleccionada.recurso);
      dto.idRecurso = recursoCambiado ? recursoCambiado.idRecurso : this.reservaSeleccionada.idRecurso;

      // 🔥 Verificar disponibilidad
      this.reservaService.verificarDisponibilidadRecurso(
        this.reservaSeleccionada.fecha,
        this.reservaSeleccionada.horaInicio,
        dto.idRecurso,
        this.reservaSeleccionada.id
      ).subscribe({
        next: (resultado) => {
          console.log('📊 Resultado verificación:', resultado);

          if (resultado.disponible) {
            // ✅ Está disponible, proceder a guardar
            this.actualizarReservaRecurso(dto);
          } else {
            // ❌ NO está disponible - MOSTRAR MODAL DE CONFLICTO PARA DIRECTIVO
            this.procesando = false;
            this.conflictoInfo = {
              nombreRecurso: this.reservaSeleccionada.recurso,
              reservadoPor: resultado.reservadoPor,
              fecha: this.reservaSeleccionada.fecha,
              tramo: this.reservaSeleccionada.horaInicio,
              idReservaConflictiva: resultado.idReserva
            };

            // 🔥 Buscar la reserva conflictiva completa
            this.reservaConflictiva = this.reservas.find(r => r.id === resultado.idReserva);

            this.mostrarModalConflicto = true;
          }
        },
        error: (error) => {
          console.error('❌ Error al verificar disponibilidad:', error);
          this.mostrarMensajeInformativo('Error al verificar disponibilidad', 'error');
          this.procesando = false;
        }
      });
    }
  }

  // 🔥 Métodos auxiliares para actualizar
  actualizarReservaEspacio(dto: any): void {
    console.log('📤 Enviando actualización de espacio:', dto);

    this.reservaService.actualizarReservaEspacio(this.reservaSeleccionada.id, dto).subscribe({
      next: () => {
        console.log('✅ Reserva de espacio actualizada');
        this.mostrarMensajeInformativo('Reserva actualizada correctamente', 'success');
        this.procesando = false;
        this.cerrarModal();
        this.cargarReservas();
      },
      error: (error) => {
        console.error('❌ Error al actualizar reserva de espacio:', error);
        this.mostrarMensajeInformativo('Error al actualizar la reserva: ' + (error.error?.message || error.message), 'error');
        this.procesando = false;
      }
    });
  }

  actualizarReservaRecurso(dto: any): void {
    console.log('📤 Enviando actualización de recurso:', dto);

    this.reservaService.actualizarReservaRecurso(this.reservaSeleccionada.id, dto).subscribe({
      next: () => {
        console.log('✅ Reserva de recurso actualizada');
        this.mostrarMensajeInformativo('Reserva actualizada correctamente', 'success');
        this.procesando = false;
        this.cerrarModal();
        this.cargarReservas();
      },
      error: (error) => {
        console.error('❌ Error al actualizar reserva de recurso:', error);
        this.mostrarMensajeInformativo('Error al actualizar la reserva: ' + (error.error?.message || error.message), 'error');
        this.procesando = false;
      }
    });
  }

  // 🔥 NUEVO: Eliminar reserva conflictiva y proceder con la modificación
  eliminarReservaConflictivaYModificar(): void {
    if (!this.reservaConflictiva || this.procesando) return;

    console.log('🗑️ Eliminando reserva conflictiva:', this.reservaConflictiva);
    this.procesando = true;

    // Determinar si es espacio o recurso
    if (this.reservaConflictiva.tipo === 'Aula') {
      this.reservaService.eliminarReservaEspacio(this.reservaConflictiva.id).subscribe({
        next: () => {
          console.log('✅ Reserva conflictiva de espacio eliminada');
          this.mostrarMensajeInformativo('Reserva conflictiva eliminada. Procediendo con la modificación...', 'info');

          // Cerrar modal de conflicto
          this.cerrarModalConflicto();

          // Proceder con la modificación original
          setTimeout(() => {
            this.procesando = false;
            this.guardarCambios();
          }, 500);
        },
        error: (error) => {
          console.error('❌ Error al eliminar reserva conflictiva:', error);
          this.mostrarMensajeInformativo('Error al eliminar la reserva conflictiva', 'error');
          this.procesando = false;
        }
      });
    } else {
      this.reservaService.eliminarReservaRecurso(this.reservaConflictiva.id).subscribe({
        next: () => {
          console.log('✅ Reserva conflictiva de recurso eliminada');
          this.mostrarMensajeInformativo('Reserva conflictiva eliminada. Procediendo con la modificación...', 'info');

          // Cerrar modal de conflicto
          this.cerrarModalConflicto();

          // Proceder con la modificación original
          setTimeout(() => {
            this.procesando = false;
            this.guardarCambios();
          }, 500);
        },
        error: (error) => {
          console.error('❌ Error al eliminar reserva conflictiva:', error);
          this.mostrarMensajeInformativo('Error al eliminar la reserva conflictiva', 'error');
          this.procesando = false;
        }
      });
    }
  }

  // 🔥 NUEVO: Mantener reserva actual (no hacer cambios)
  mantenerReservaActual(): void {
    console.log('✅ Directivo decidió mantener la reserva original');
    this.cerrarModalConflicto();
    this.cerrarModal();
    this.mostrarMensajeInformativo('No se realizaron cambios en la reserva', 'info');
  }

  cerrarModalConflicto(): void {
    this.mostrarModalConflicto = false;
    this.conflictoInfo = null;
    this.reservaConflictiva = null;
  }

  eliminarReserva(reserva: any): void {
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
          console.log('✅ Reserva de espacio eliminada');
          this.mostrarMensajeInformativo('Reserva eliminada correctamente', 'success');
          this.procesando = false;
          this.cancelarEliminacion();
          this.cargarReservas();
        },
        error: (error) => {
          console.error('❌ Error al eliminar reserva de espacio:', error);
          this.mostrarMensajeInformativo('Error al eliminar la reserva', 'error');
          this.procesando = false;
        }
      });
    } else {
      this.reservaService.eliminarReservaRecurso(this.reservaAEliminar.id).subscribe({
        next: () => {
          console.log('✅ Reserva de recurso eliminada');
          this.mostrarMensajeInformativo('Reserva eliminada correctamente', 'success');
          this.procesando = false;
          this.cancelarEliminacion();
          this.cargarReservas();
        },
        error: (error) => {
          console.error('❌ Error al eliminar reserva de recurso:', error);
          this.mostrarMensajeInformativo('Error al eliminar la reserva', 'error');
          this.procesando = false;
        }
      });
    }
  }

  cancelarEliminacion(): void {
    this.reservaAEliminar = null;
    this.mostrarModalEliminar = false;
  }

  // 🔥 NUEVO: Sistema de mensajes informativos
  mostrarMensajeInformativo(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info'): void {
    this.mensajeInformativo = mensaje;
    this.tipoMensaje = tipo;
    this.mostrarModalInformativo = true;
  }

  cerrarModalInformativo(): void {
    this.mostrarModalInformativo = false;
    this.mensajeInformativo = '';
  }
  extraerHoraInicioParaOrdenar(tramoHorario: string): number {
    if (!tramoHorario) return 0;

    // Extraer la hora de inicio (ej: "08:00-09:00" -> "08:00")
    const horaInicio = tramoHorario.includes('-')
      ? tramoHorario.split('-')[0].trim()
      : tramoHorario;

    // Convertir a minutos desde medianoche para facilitar comparación
    // ej: "08:00" -> 8*60 + 0 = 480
    const [horas, minutos] = horaInicio.split(':').map(Number);
    return horas * 60 + minutos;
  }
}
