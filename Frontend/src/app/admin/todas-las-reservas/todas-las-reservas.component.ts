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

  filtroFecha: string = '';
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
    this.filtroFecha = this.obtenerFechaHoy();

    console.log('👤 Usuario logeado:', this.usuarioLogeado);
    console.log('📅 Fecha inicial:', this.filtroFecha);

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
    const { filtroFecha, filtroMaterial, filtroProfesor, filtroAula, filtroTipo } = this;
    console.log('🔍 Aplicando filtros:', { filtroFecha, filtroMaterial, filtroProfesor, filtroAula, filtroTipo });

    this.filtradoReservas = this.reservas.filter(r => {
      const coincideFecha = filtroFecha ? r.fecha === filtroFecha : true;
      const coincideMaterial = (filtroMaterial && r.tipo === 'Material')
        ? r.recurso === filtroMaterial
        : true;
      const coincideProfesor = filtroProfesor ? r.profesor === filtroProfesor : true;
      const coincideAula = (filtroAula && r.tipo === 'Aula')
        ? r.espacio === filtroAula
        : true;
      const coincideTipo = (filtroTipo === 'Todas') ? true : r.tipo === filtroTipo;

      return coincideFecha && coincideMaterial && coincideProfesor && coincideAula && coincideTipo;
    });

    console.log('✅ Resultados tras filtrar:', this.filtradoReservas.length, 'reservas');
    this.currentPage = 1;
  }

  limpiarFiltros(): void {
    this.filtroFecha = this.obtenerFechaHoy();
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

      doc.addImage(logo, 'PNG', 15, 10, 30, 30);

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Instituto de Educación Secundaria', pageWidth / 2, 52, { align: 'center' });

      doc.setFontSize(16);
      doc.text('ALMUDEYNE', pageWidth / 2, 60, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Historial de Reservas', pageWidth / 2, 68, { align: 'center' });

      doc.setLineWidth(0.5);
      doc.setDrawColor(60, 126, 102);
      doc.line(50, 73, pageWidth - 50, 73);

      doc.setFontSize(9);
      doc.setTextColor(100);
      const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Fecha de generación: ${fechaGeneracion}`, pageWidth / 2, 80, { align: 'center' });
      doc.text(`Total de reservas: ${this.filtradoReservas.length}`, pageWidth / 2, 86, { align: 'center' });

      doc.setTextColor(0);
      autoTable(doc, {
        head: [['Tipo', 'Espacio/Material', 'Fecha', 'Tramo Horario', 'Profesor', 'Estado']],
        body: this.filtradoReservas.map(r => [
          r.tipo,
          r.tipo === 'Aula' ? r.espacio : r.recurso,
          r.fecha,
          r.horaInicio,
          r.profesor,
          r.estado
        ]),
        startY: 93,
        styles: {
          halign: 'center',
          valign: 'middle',
          fontSize: 9,
          cellPadding: 4
        },
        headStyles: {
          fillColor: [60, 126, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        margin: { left: 15, right: 15 }
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );

        doc.text(
          'IES Almudeyne - Sistema de Gestión de Reservas',
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 5,
          { align: 'center' }
        );
      }

      doc.save(`reservas_almudeyne_${new Date().getTime()}.pdf`);
      console.log('📄 PDF generado con éxito con', this.filtradoReservas.length, 'reservas');
    };

    logo.onerror = () => {
      console.warn('⚠️ Error al cargar el logo del instituto');
      this.generarPDFSinLogo();
    };
  }

  generarPDFSinLogo(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('IES ALMUDEYNE', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Historial de Reservas', pageWidth / 2, 28, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(60, 126, 102);
    doc.line(50, 33, pageWidth - 50, 33);

    doc.setFontSize(9);
    doc.setTextColor(100);
    const fechaGeneracion = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha: ${fechaGeneracion} | Total: ${this.filtradoReservas.length} reservas`, pageWidth / 2, 40, { align: 'center' });

    doc.setTextColor(0);
    autoTable(doc, {
      head: [['Tipo', 'Espacio/Material', 'Fecha', 'Tramo Horario', 'Profesor', 'Estado']],
      body: this.filtradoReservas.map(r => [
        r.tipo,
        r.tipo === 'Aula' ? r.espacio : r.recurso,
        r.fecha,
        r.horaInicio,
        r.profesor,
        r.estado
      ]),
      startY: 47,
      styles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 9,
        cellPadding: 4
      },
      headStyles: {
        fillColor: [60, 126, 102],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`reservas_almudeyne_${new Date().getTime()}.pdf`);
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
}