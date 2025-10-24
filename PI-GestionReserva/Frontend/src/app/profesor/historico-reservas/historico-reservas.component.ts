import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HeaderComponent } from '../../header/header.component';
import { ReservaService } from '../../services/reserva.service';
import { RecursoService } from '../../services/recurso.service';

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

  aulas: string[] = [];
  materiales: string[] = [];

  usuarioLogueado: string = '';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 5;

  mostrarModalActualizar: boolean = false;
  reservaSeleccionada: any = null;

  mostrarModalEliminar: boolean = false;
  reservaAEliminar: any = null;

  constructor(
    private reservaService: ReservaService,
    private recursoService: RecursoService
  ) {}

  ngOnInit(): void {
    this.usuarioLogueado = localStorage.getItem('usuario') || '';

    this.reservaService.getHistorialCompleto().subscribe({
      next: ([reservasEspacios, reservasRecursos]: [any[], any[]]) => {
        // Normalizadores para soportar ambos formatos del backend
        const getUsuario = (r: any) => r?.profesor?.usuario ?? r?.nombreProfesor ?? '';
        const getEspacio = (r: any) => r?.espacio?.nombre ?? r?.nombreEspacio ?? '';
        const getRecurso = (r: any) => r?.recurso?.nombre ?? r?.nombreRecurso ?? '';
        const getFecha = (r: any) => r?.fecha;
        const getInicio = (r: any) => {
          // tramoHorario puede venir como "08:00 - 09:00" o "08:00"
          const t = r?.tramoHorario || '';
          if (t.includes(' - ')) return t.split(' - ')[0];
          return t; // "08:00"
        };
        const getFin = (r: any) => {
          const t = r?.tramoHorario || '';
          if (t.includes(' - ')) return t.split(' - ')[1];
          // si solo viene "08:00", calculo +1h
          if (/^\d{2}:\d{2}$/.test(t)) {
            const [h, m] = t.split(':').map((x: string) => parseInt(x, 10));
            const finH = ((h + 1) % 24).toString().padStart(2, '0');
            return `${finH}:${m.toString().padStart(2, '0')}`;
          }
          return '';
        };

        // Filtramos por el usuario logueado (coherente con ambos esquemas)
        const espaciosUsuario = (reservasEspacios || [])
          .filter((r: any) => getUsuario(r) === this.usuarioLogueado)
          .map((r: any) => ({
            id: r.idReserva,
            tipo: 'Aula',
            espacio: getEspacio(r),
            recurso: '',
            fecha: getFecha(r),
            horaInicio: getInicio(r),
            horaFin: getFin(r),
            estado: 'Finalizada',
            profesor: getUsuario(r),
          }));

        const recursosUsuario = (reservasRecursos || [])
          .filter((r: any) => getUsuario(r) === this.usuarioLogueado)
          .map((r: any) => ({
            id: r.idReserva,
            tipo: 'Material',
            espacio: '',
            recurso: getRecurso(r),
            fecha: getFecha(r),
            horaInicio: getInicio(r),
            horaFin: getFin(r),
            estado: 'Finalizada',
            profesor: getUsuario(r),
          }));

        this.historial = [...espaciosUsuario, ...recursosUsuario];

        this.aulas = [...new Set(this.historial.filter(h => h.tipo === 'Aula').map(h => h.espacio))].sort();
        this.filtrarReservas();
      },
      error: err => console.error('Error al cargar reservas:', err)
    });

    this.recursoService.getRecursos().subscribe({
      next: data => {
        this.materiales = (data || []).map((r: any) => r.nombre).sort();
      },
      error: err => console.error('Error al cargar recursos:', err)
    });
  }

  filtrarReservas(): void {
    this.filtradoReservas = this.historial.filter(h => {
      const coincideFecha = this.filtroFecha ? h.fecha === this.filtroFecha : true;
      const coincideMaterial = h.tipo === 'Material' ? (this.filtroMaterial ? h.recurso === this.filtroMaterial : true) : true;
      const coincideAula = h.tipo === 'Aula' ? (this.filtroAula ? h.espacio === this.filtroAula : true) : true;
      return coincideFecha && coincideMaterial && coincideAula;
    });
    this.currentPage = 1;
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroMaterial = '';
    this.filtroAula = '';
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
    this.reservaSeleccionada = { ...reserva };
    this.mostrarModalActualizar = true;
  }

  cerrarModal(): void {
    this.mostrarModalActualizar = false;
    this.reservaSeleccionada = null;
  }

  guardarCambios(): void {
    // TODO: integrar con backend si queréis editar realmente desde aquí
    if (!this.reservaSeleccionada) return;
    const index = this.historial.findIndex(r => r.id === this.reservaSeleccionada.id);
    if (index !== -1) {
      this.historial[index] = { ...this.reservaSeleccionada };
      this.filtrarReservas();
      this.cerrarModal();
    }
  }

  eliminarReserva(reserva: any): void {
    this.reservaAEliminar = reserva;
    this.mostrarModalEliminar = true;
  }

  confirmarEliminacion(): void {
    if (this.reservaAEliminar) {
      this.historial = this.historial.filter(r => r !== this.reservaAEliminar);
      this.filtrarReservas();
    }
    this.cancelarEliminacion();
  }

  cancelarEliminacion(): void {
    this.reservaAEliminar = null;
    this.mostrarModalEliminar = false;
  }

  exportarPDFMisReservas(): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('Reservas', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text('REGISTRO DE MIS RESERVAS', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

    autoTable(doc, {
      head: [['Espacio/Material', 'Fecha', 'Hora', 'Estado']],
      body: this.filtradoReservas.map(h => [
        h.espacio || h.recurso || '',
        h.fecha,
        `${h.horaInicio}${h.horaFin ? ' - ' + h.horaFin : ''}`,
        h.estado
      ]),
      startY: 45,
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: [60, 126, 102], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.text('IES. ALMUDEYNE', 14, pageHeight - 10);
    doc.text('Página 1 de 1', doc.internal.pageSize.getWidth() - 40, pageHeight - 10);
    doc.save('mis-reservas.pdf');
  }
}
