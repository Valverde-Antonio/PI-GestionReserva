import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';//instalar npm install jspdf jspdf-autotable 
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-historico-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historico-reservas.component.html',
  styleUrls: ['./historico-reservas.component.css']
})
export class HistoricoReservasComponent implements OnInit {
  historial: any[] = [];
  filtradoReservas: any[] = [];

  filtroFecha: string = '';
  filtroMaterial: string = '';

  ngOnInit(): void {
    this.historial = [
      { espacio: 'Aula 2', recurso: 'Proyector', fecha: '2025-04-22', horaInicio: '09:00', horaFin: '10:30', estado: 'Finalizada' },
      { espacio: 'Aula 5', recurso: 'Portátiles x20', fecha: '2025-04-15', horaInicio: '12:00', horaFin: '13:00', estado: 'Cancelada' },
      { espacio: 'Aula 15', recurso: 'Pizarra Digital', fecha: '2025-04-10', horaInicio: '08:00', horaFin: '09:00', estado: 'Finalizada' },
      { espacio: 'Aula 6', recurso: 'Proyector', fecha: '2025-04-09', horaInicio: '10:00', horaFin: '11:00', estado: 'Finalizada' },
      { espacio: 'Aula 1', recurso: 'Portátiles x10', fecha: '2025-04-05', horaInicio: '11:30', horaFin: '12:30', estado: 'Cancelada' }
    ];

    this.filtrarReservas();
  }

  filtrarReservas(): void {
    this.filtradoReservas = this.historial.filter(h => {
      const coincideFecha = this.filtroFecha ? h.fecha === this.filtroFecha : true;
      const coincideMaterial = this.filtroMaterial
        ? h.recurso.toLowerCase().includes(this.filtroMaterial.toLowerCase())
        : true;
      return coincideFecha && coincideMaterial;
    });
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroMaterial = '';
    this.filtrarReservas();
  }
  exportarPDFMisReservas(): void {
    const doc = new jsPDF();

    //Revisar Logo
    // const logoBase64 = 'data:image/png;base64,iVBORw0K...';
    // doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20);
  
    // Título
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('Reservas', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
    // Subtítulo
    doc.setFontSize(12);
    doc.text('REGISTRO DE MIS RESERVAS', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });
  
    // Datos del historial filtrado
    const body = this.filtradoReservas.map(h => [
      h.espacio,
      h.recurso,
      h.fecha,
      `${h.horaInicio} - ${h.horaFin}`,
      h.estado
    ]);
  
    autoTable(doc, {
      head: [['Espacio', 'Recurso', 'Fecha', 'Hora', 'Estado']],
      body: body,
      startY: 45,
      styles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 10
      },
      headStyles: {
        fillColor: [60, 126, 102], // Color de fondo de la cabecera(Verde)
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
  
    // Pie de página
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.text('IES. ALMUDEYNE', 14, pageHeight - 10);
    doc.text('Página 1 de 1', doc.internal.pageSize.getWidth() - 40, pageHeight - 10);
  
    doc.save('mis-reservas.pdf');
  }
}
