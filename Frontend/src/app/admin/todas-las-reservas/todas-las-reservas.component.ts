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

  profesores: any[] = []; // ⭐ Cambiado para guardar objetos completos
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

  constructor(
    private reservaService: ReservaService,
    private recursoService: RecursoService,
    private espacioService: EspacioService,
    private profesorService: ProfesorService
  ) { }

  ngOnInit(): void {
    this.usuarioLogeado = localStorage.getItem('nombreCompleto') || '';
    console.log('👤 Usuario logeado:', this.usuarioLogeado);
    this.cargarProfesores();
    this.cargarMateriales();
    this.cargarEspacios();
    this.cargarReservas();
  }

  cargarProfesores(): void {
    this.profesorService.getProfesores().subscribe(data => {
      this.profesores = data; // ⭐ Guardamos objetos completos con ID y nombre
      console.log('📘 Profesores cargados:', this.profesores);
    });
  }

  cargarMateriales(): void {
    this.recursoService.getRecursos().subscribe(data => {
      this.materiales = data;
      console.log('📦 Materiales cargados:', this.materiales);
    });
  }

  cargarEspacios(): void {
    this.espacioService.getEspacios().subscribe(data => {
      this.espacios = data;
      console.log('🏫 Espacios cargados:', this.espacios);
    });
  }

  cargarReservas(): void {
    this.reservaService.getHistorialCompleto().subscribe(([espacios, recursos]: [any[], any[]]) => {
      const reservasEspacios = espacios.map((r: any) => ({
        id: r.idReserva,
        idEspacio: r.idEspacio,
        idProfesor: r.idProfesor,          // ⭐ YA GUARDAS ESTO
        espacio: r.nombreEspacio,
        recurso: '',
        fecha: r.fecha,
        horaInicio: r.tramoHorario,
        horaFin: r.tramoHorario,
        estado: 'Finalizada',
        profesor: r.nombreProfesor,         // ⭐ NOMBRE
        tipo: 'Aula'
      }));

      const reservasRecursos = recursos.map((r: any) => ({
        id: r.idReserva,
        idRecurso: r.idRecurso,
        idProfesor: r.idProfesor,          // ⭐ YA GUARDAS ESTO
        espacio: '',
        recurso: r.nombreRecurso,
        fecha: r.fecha,
        horaInicio: r.tramoHorario,
        horaFin: r.tramoHorario,
        estado: 'Finalizada',
        profesor: r.nombreProfesor,        // ⭐ NOMBRE
        tipo: 'Material'
      }));

      this.reservas = [...reservasEspacios, ...reservasRecursos];
      console.log('📋 Reservas cargadas:', this.reservas);

      this.filtroProfesor = this.usuarioLogeado;
      this.filtrarReservas();
    });
  }

  filtrarReservas(): void {
    const { filtroFecha, filtroMaterial, filtroProfesor, filtroAula, filtroTipo } = this;
    console.log('🔍 Aplicando filtros:', { filtroFecha, filtroMaterial, filtroProfesor, filtroAula, filtroTipo });

    this.filtradoReservas = this.reservas.filter(r =>
      (filtroFecha ? r.fecha === filtroFecha : true) &&
      (filtroMaterial && r.tipo === 'Material' ? r.recurso.toLowerCase().includes(filtroMaterial.toLowerCase()) : true) &&
      (filtroProfesor ? r.profesor === filtroProfesor : true) &&
      (filtroAula && r.tipo === 'Aula' ? r.espacio === filtroAula : true) &&
      (filtroTipo === 'Todas' ? true : r.tipo === filtroTipo)
    );

    console.log('✅ Resultados tras filtrar:', this.filtradoReservas);
    this.currentPage = 1;
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroMaterial = '';
    this.filtroAula = '';
    this.filtroTipo = 'Todas';
    this.filtroProfesor = this.usuarioLogeado;
    this.filtrarReservas();
  }

  exportarPDFTodasReservas(): void {
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = 'assets/img/logoAlmudeyne.png'; // ⭐ Ruta correcta

    logo.onload = () => {
      // Logo centrado
      const pageWidth = doc.internal.pageSize.getWidth();
      //const logoWidth = 35;

      doc.addImage(logo, 'PNG', 15, 10, 30, 30); // Logo a la izquierda

      // Título centrado debajo del logo
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Instituto de Educación Secundaria', pageWidth / 2, 52, { align: 'center' });

      doc.setFontSize(16);
      doc.text('ALMUDEYNE', pageWidth / 2, 60, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Historial de Reservas', pageWidth / 2, 68, { align: 'center' });

      // Línea decorativa
      doc.setLineWidth(0.5);
      doc.setDrawColor(60, 126, 102);
      doc.line(50, 73, pageWidth - 50, 73);

      // Información
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

      // Tabla
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

      // Pie de página con número de página
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

        // Texto adicional en el pie
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
      alert('No se pudo cargar el logo. Generando PDF sin imagen.');
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

  // ⭐ MÉTODO CORREGIDO
  guardarCambios(): void {
    if (!this.reservaSeleccionada) return;

    console.log('💾 Guardando cambios de reserva:', this.reservaSeleccionada);

    // ⭐ USAR EL ID QUE YA TIENES EN LA RESERVA
    // No necesitas buscar el profesor, ya tienes su ID

    const dto: any = {
      fecha: this.reservaSeleccionada.fecha,
      tramoHorario: this.reservaSeleccionada.horaInicio,
      idProfesor: this.reservaSeleccionada.idProfesor  // ⭐ USAR EL ID QUE YA TIENES
    };

    // Si el usuario cambió el profesor en el select, buscar el nuevo ID
    const profesorCambiado = this.profesores.find(p => p.nombre === this.reservaSeleccionada.profesor);
    if (profesorCambiado) {
      dto.idProfesor = profesorCambiado.idProfesor;
    }

    // Determinar si es reserva de espacio o recurso
    if (this.reservaSeleccionada.tipo === 'Aula') {
      // Si el usuario cambió el espacio, buscar el nuevo ID
      const espacioCambiado = this.espacios.find(e => e.nombre === this.reservaSeleccionada.espacio);
      dto.idEspacio = espacioCambiado ? espacioCambiado.idEspacio : this.reservaSeleccionada.idEspacio;

      console.log('📤 Enviando actualización de espacio:', dto);

      this.reservaService.actualizarReservaEspacio(this.reservaSeleccionada.id, dto).subscribe({
        next: (response) => {
          console.log('✅ Reserva de espacio actualizada:', response);
          alert('Reserva actualizada correctamente');
          this.cerrarModal();
          this.cargarReservas();
        },
        error: (error) => {
          console.error('❌ Error al actualizar reserva de espacio:', error);
          alert('Error al actualizar la reserva: ' + (error.error?.message || error.message));
        }
      });
    } else {
      // Si el usuario cambió el recurso, buscar el nuevo ID
      const recursoCambiado = this.materiales.find(m => m.nombre === this.reservaSeleccionada.recurso);
      dto.idRecurso = recursoCambiado ? recursoCambiado.idRecurso : this.reservaSeleccionada.idRecurso;

      console.log('📤 Enviando actualización de recurso:', dto);

      this.reservaService.actualizarReservaRecurso(this.reservaSeleccionada.id, dto).subscribe({
        next: (response) => {
          console.log('✅ Reserva de recurso actualizada:', response);
          alert('Reserva actualizada correctamente');
          this.cerrarModal();
          this.cargarReservas();
        },
        error: (error) => {
          console.error('❌ Error al actualizar reserva de recurso:', error);
          alert('Error al actualizar la reserva: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  eliminarReserva(reserva: any): void {
    this.reservaAEliminar = reserva;
    this.mostrarModalEliminar = true;
  }

  // ⭐ MÉTODO ACTUALIZADO: Ahora elimina de la base de datos
  confirmarEliminacion(): void {
    if (!this.reservaAEliminar) return;

    console.log('🗑️ Eliminando reserva:', this.reservaAEliminar);

    if (this.reservaAEliminar.tipo === 'Aula') {
      this.reservaService.eliminarReservaEspacio(this.reservaAEliminar.id).subscribe({
        next: (response) => {
          console.log('✅ Reserva de espacio eliminada:', response);
          alert('Reserva eliminada correctamente');
          this.cancelarEliminacion();
          this.cargarReservas(); // Recargar para ver los cambios
        },
        error: (error) => {
          console.error('❌ Error al eliminar reserva de espacio:', error);
          alert('Error al eliminar la reserva');
        }
      });
    } else {
      this.reservaService.eliminarReservaRecurso(this.reservaAEliminar.id).subscribe({
        next: (response) => {
          console.log('✅ Reserva de recurso eliminada:', response);
          alert('Reserva eliminada correctamente');
          this.cancelarEliminacion();
          this.cargarReservas(); // Recargar para ver los cambios
        },
        error: (error) => {
          console.error('❌ Error al eliminar reserva de recurso:', error);
          alert('Error al eliminar la reserva');
        }
      });
    }
  }

  cancelarEliminacion(): void {
    this.reservaAEliminar = null;
    this.mostrarModalEliminar = false;
  }
}