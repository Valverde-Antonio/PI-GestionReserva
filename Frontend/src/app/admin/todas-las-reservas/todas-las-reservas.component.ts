import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-todas-las-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderAdminComponent],
  templateUrl: './todas-las-reservas.component.html',
  styleUrls: ['./todas-las-reservas.component.css']
})
export class TodasLasReservasComponent implements OnInit {
  reservas: any[] = [];
  // filtradoReservasMaterial: any[] = [];
  // filtradoReservasAula: any[] = [];
  filtradoReservas: any[] = [];

  filtroFecha: string = '';
  filtroMaterial: string = '';
  filtroProfesor: string = '';
  filtroAula: string = '';

  aulas: string[] = [];

  profesores: string[] = ['Todos', 'Prof. García', 'Prof. Martínez', 'Prof. López'];

  ngOnInit(): void {
    this.reservas = [
      { id: 1, espacio: 'Aula 1', recurso: 'Proyector', fecha: '2025-05-01', horaInicio: '08:00', horaFin: '09:00', estado: 'Finalizada', profesor: 'Prof. García' },
      { id: 2, espacio: 'Aula 2', recurso: 'Portátiles', fecha: '2025-05-02', horaInicio: '09:00', horaFin: '10:00', estado: 'Cancelada', profesor: 'Prof. Martínez' },
      { id: 3, espacio: 'Aula 3', recurso: 'Pizarra Digital', fecha: '2025-05-03', horaInicio: '10:00', horaFin: '11:00', estado: 'Finalizada', profesor: 'Prof. López' },
      { id: 4, espacio: 'Aula 4', recurso: '', motivo: 'Clase extra', fecha: '2025-05-04', horaInicio: '11:00', horaFin: '12:00', estado: 'Finalizada', profesor: 'Prof. García' },
      { id: 5, espacio: 'Aula 5', recurso: '', motivo: 'Clase extra', fecha: '2025-05-04', horaInicio: '11:00', horaFin: '12:00', estado: 'Finalizada', profesor: 'Prof. García' }

    ];

    // Generar lista de aulas únicas ordenada (corregido)
    this.aulas = Array.from(
      new Set(this.reservas
        .filter(h => !h.recurso || h.recurso.trim() === '')
        .map(h => h.espacio))
    ).sort((a, b) => {
      const numA = parseInt(a.replace('Aula ', ''), 10);
      const numB = parseInt(b.replace('Aula ', ''), 10);
      return numA - numB;
    });

    this.filtrarReservas();
  }

  filtrarReservas(): void {
    const filtroFecha = this.filtroFecha;
    const filtroMaterial = this.filtroMaterial;
    const filtroProfesor = this.filtroProfesor && this.filtroProfesor !== 'Todos' ? this.filtroProfesor : '';
    const filtroAula = this.filtroAula;

    this.filtradoReservas = this.reservas.filter(r =>
      (filtroFecha ? r.fecha === filtroFecha : true) &&
      (filtroMaterial ? (r.recurso || '').toLowerCase().includes(filtroMaterial.toLowerCase()) : true) &&
      (filtroProfesor ? r.profesor === filtroProfesor : true) &&
      (filtroAula ? r.espacio === filtroAula : true)
    );
  }


  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroMaterial = '';
    this.filtroProfesor = '';
    this.filtroAula = '';
    this.filtrarReservas();
  }

exportarPDFTodasReservas(): void {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text('Reservas', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.text('REGISTRO DE TODAS LAS RESERVAS', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

  // Tabla combinada de todas las reservas (aulas y materiales)
  autoTable(doc, {
    head: [['Espacio', 'Recurso/Motivo', 'Fecha', 'Hora', 'Estado', 'Profesor']],
    body: this.filtradoReservas.map(r => [
      r.espacio,
      r.recurso ? r.recurso : (r.motivo || '-'),
      r.fecha,
      `${r.horaInicio} - ${r.horaFin}`,
      r.estado,
      r.profesor
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

  doc.save('todas-reservas.pdf');
}

  // MODALES y Acciones:

  mostrarModalActualizar: boolean = false;
  reservaSeleccionada: any = null;

  modificarReserva(reserva: any): void {
    this.reservaSeleccionada = { ...reserva }; // clon para edición
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
    }
  }

  mostrarModalEliminar: boolean = false;
  reservaAEliminar: any = null;

  eliminarReserva(reserva: any): void {
    this.reservaAEliminar = reserva;
    this.mostrarModalEliminar = true;
  }

  confirmarEliminacion(): void {
    if (this.reservaAEliminar) {
      this.reservas = this.reservas.filter(r => r !== this.reservaAEliminar);
      this.filtrarReservas();
    }
    this.cancelarEliminacion();
  }

  cancelarEliminacion(): void {
    this.reservaAEliminar = null;
    this.mostrarModalEliminar = false;
  }
}
