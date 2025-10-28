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
  imports: [CommonModule, FormsModule, ],
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

  profesores: string[] = [];
  espacios: { nombre: string }[] = [];
  materiales: { nombre: string }[] = [];

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
  ) {}

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
      this.profesores = data.map((p: any) => p.nombre);
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
        espacio: r.nombreEspacio,
        recurso: '',
        fecha: r.fecha,
        horaInicio: r.tramoHorario,
        horaFin: r.tramoHorario,
        estado: 'Finalizada',
        profesor: r.nombreProfesor,
        tipo: 'Aula'
      }));

      const reservasRecursos = recursos.map((r: any) => ({
        id: r.idReserva,
        espacio: '',
        recurso: r.nombreRecurso,
        fecha: r.fecha,
        horaInicio: r.tramoHorario,
        horaFin: r.tramoHorario,
        estado: 'Finalizada',
        profesor: r.nombreProfesor,
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
    doc.setFontSize(18);
    doc.text('Reservas', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    autoTable(doc, {
      head: [['Espacio', 'Material', 'Fecha', 'Hora', 'Estado', 'Profesor']],
      body: this.filtradoReservas.map(r => [
        r.espacio || '-',
        r.recurso || '-',
        r.fecha,
        `${r.horaInicio} - ${r.horaFin}`,
        r.estado,
        r.profesor
      ]),
      startY: 30,
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: [60, 126, 102], textColor: [255, 255, 255] }
    });

    doc.save('todas-las-reservas.pdf');
    console.log('📄 Exportado PDF con', this.filtradoReservas.length, 'reservas');
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
    this.mostrarModalActualizar = true;
  }

  cerrarModal(): void {
    this.mostrarModalActualizar = false;
    this.reservaSeleccionada = null;
  }

  guardarCambios(): void {
    if (!this.reservaSeleccionada) return;
    const index = this.reservas.findIndex(r => r.id === this.reservaSeleccionada.id);
    if (index !== -1) {
      this.reservas[index] = { ...this.reservaSeleccionada };
      this.filtrarReservas();
      this.cerrarModal();
      console.log('✅ Reserva modificada:', this.reservaSeleccionada);
    }
  }

  eliminarReserva(reserva: any): void {
    this.reservaAEliminar = reserva;
    this.mostrarModalEliminar = true;
  }

  confirmarEliminacion(): void {
    if (this.reservaAEliminar) {
      this.reservas = this.reservas.filter(r => r !== this.reservaAEliminar);
      this.filtrarReservas();
      console.log('🗑️ Reserva eliminada:', this.reservaAEliminar);
    }
    this.cancelarEliminacion();
  }

  cancelarEliminacion(): void {
    this.reservaAEliminar = null;
    this.mostrarModalEliminar = false;
  }
}
