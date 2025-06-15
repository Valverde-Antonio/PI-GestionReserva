import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HeaderComponent } from '../../header/header.component';


@Component({
  selector: 'app-historico-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule,HeaderComponent ],
  templateUrl: './historico-reservas.component.html',
  styleUrls: ['./historico-reservas.component.css']
})
export class HistoricoReservasComponent implements OnInit {
  historial: any[] = [];
  filtradoReservasMaterial: any[] = [];
  filtradoReservasAula: any[] = [];
  filtradoReservas: any[] = [];

  filtroFecha: string = '';
  filtroMaterial: string = '';
  filtroAula: string = '';

  aulas: string[] = [];

  ngOnInit(): void {
    this.historial = [
      { tipo: 'material', espacio: 'Aula 2', recurso: 'Proyector', fecha: '2025-04-22', horaInicio: '09:00', horaFin: '10:30', estado: 'Finalizada' },
      { tipo: 'material', espacio: 'Aula 5', recurso: 'Portátiles x20', fecha: '2025-04-15', horaInicio: '12:00', horaFin: '13:00', estado: 'Cancelada' },
      { tipo: 'aula', espacio: 'Aula 15', recurso: '', fecha: '2025-04-10', horaInicio: '08:00', horaFin: '09:00', estado: 'Finalizada', motivo: 'Examen de matemáticas' },
      { tipo: 'material', espacio: 'Aula 6', recurso: 'Proyector', fecha: '2025-04-09', horaInicio: '10:00', horaFin: '11:00', estado: 'Finalizada' },
      { tipo: 'aula', espacio: 'Aula 1', recurso: '', fecha: '2025-04-05', horaInicio: '11:30', horaFin: '12:30', estado: 'Cancelada', motivo: 'Reunión de padres' }
    ];

    // generar lista de aulas únicas ordenada
    this.aulas = Array.from(
      new Set(this.historial.filter(h => h.tipo === 'aula').map(h => h.espacio))
    ).sort((a, b) => {
      const numA = parseInt(a.replace('Aula ', ''), 10);
      const numB = parseInt(b.replace('Aula ', ''), 10);
      return numA - numB;
    });

    this.filtrarReservas();
  }

  filtrarReservas(): void {
    this.filtradoReservas = this.historial.filter(h => {
      const coincideFecha = this.filtroFecha ? h.fecha === this.filtroFecha : true;
      const coincideMaterial = h.tipo === 'material'
        ? (this.filtroMaterial ? h.recurso.toLowerCase().includes(this.filtroMaterial.toLowerCase()) : true)
        : true;
      const coincideAula = h.tipo === 'aula'
        ? (this.filtroAula ? h.espacio === this.filtroAula : true)
        : true;

      return coincideFecha && coincideMaterial && coincideAula;
    });
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroMaterial = '';
    this.filtroAula = '';
    this.filtrarReservas();
  }

exportarPDFMisReservas(): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('Reservas', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text('REGISTRO DE MIS RESERVAS', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

    autoTable(doc, {
      head: [['Espacio', 'Recurso/Motivo', 'Fecha', 'Hora', 'Estado']],
      body: this.filtradoReservas.map(h => [
        h.espacio,
        h.recurso ? h.recurso : (h.motivo || '-'),
        h.fecha,
        `${h.horaInicio} - ${h.horaFin}`,
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
