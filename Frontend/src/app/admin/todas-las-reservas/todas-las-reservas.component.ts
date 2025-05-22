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
  filtradoReservas: any[] = [];

  filtroFecha: string = '';
  filtroMaterial: string = '';
  filtroProfesor: string = '';

  profesores: string[] = ['Todos', 'Prof. García', 'Prof. Martínez', 'Prof. López'];

  ngOnInit(): void {
    this.reservas = [
      { id: 1, espacio: 'Aula 1', recurso: 'Proyector', fecha: '2025-05-01', horaInicio: '08:00', horaFin: '09:00', estado: 'Finalizada', profesor: 'Prof. García' },
      { id: 2, espacio: 'Aula 2', recurso: 'Portátiles', fecha: '2025-05-02', horaInicio: '09:00', horaFin: '10:00', estado: 'Cancelada', profesor: 'Prof. Martínez' },
      { id: 3, espacio: 'Aula 3', recurso: 'Pizarra Digital', fecha: '2025-05-03', horaInicio: '10:00', horaFin: '11:00', estado: 'Finalizada', profesor: 'Prof. López' },
      { id: 4, espacio: 'Aula 4', recurso: 'Proyector', fecha: '2025-05-04', horaInicio: '11:00', horaFin: '12:00', estado: 'Finalizada', profesor: 'Prof. García' }
    ];

    this.filtrarReservas();
  }

  filtrarReservas(): void {
    this.filtradoReservas = this.reservas.filter(r => {
      const coincideFecha = this.filtroFecha ? r.fecha === this.filtroFecha : true;
      const coincideMaterial = this.filtroMaterial ? r.recurso.toLowerCase().includes(this.filtroMaterial.toLowerCase()) : true;
      const coincideProfesor = this.filtroProfesor && this.filtroProfesor !== 'Todos' ? r.profesor === this.filtroProfesor : true;
      return coincideFecha && coincideMaterial && coincideProfesor;
    });
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroMaterial = '';
    this.filtroProfesor = '';
    this.filtrarReservas();
  }
  exportarPDFTodasReservas(): void {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('Reservas', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Subtítulo
    doc.setFontSize(12);
    doc.text('REGISTRO DE MIS RESERVAS', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

    // Tabla de datos
    const body = this.filtradoReservas.map(h => [
      h.espacio,
      h.recurso,
      h.fecha,
      `${h.horaInicio} - ${h.horaFin}`,
      h.estado,
      h.profesor
    ]);

    autoTable(doc, {
      head: [['Espacio', 'Recurso', 'Fecha', 'Hora', 'Estado', 'Profesor']],
      body: body,
      startY: 45,
      styles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 10
      },
      headStyles: {
        fillColor: [60, 126, 102],
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

    // Guardar PDF
    doc.save('mis-reservas.pdf');
  }


  mostrarModalActualizar: boolean = false;
  reservaSeleccionada: any = null;
  modificarReserva(reserva: any): void {
    this.reservaSeleccionada = { ...reserva }; // se puede clonar para evitar edición directa
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

  verDetalles(reserva: any): void {
    alert(`Detalles:\nEspacio: ${reserva.espacio
      }\nProfesor: ${reserva.profesor} `);
  }


}
