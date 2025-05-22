import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';


interface Turno {
  hora: string;
  reservas: { [key: string]: number }; // el valor es el número de reservas
}

@Component({
  selector: 'app-gestionar-recursos',
  standalone: true,
  imports: [CommonModule, FormsModule,HeaderAdminComponent],
  templateUrl: './gestionar-recursos.component.html',
  styleUrls: ['./gestionar-recursos.component.css']
})
export class GestionarRecursosComponent {
  materiales: string[] = ['Proyector', 'Portátil', 'Pizarra Digital'];
  profesores: string[] = ['Profesor 1', 'Profesor 2', 'Profesor 3', 'Profesor 4'];
  materialSeleccionado: string = this.materiales[0];
  profesorSeleccionado: string = this.profesores[0];
  fechaSeleccionada: string = '';

  turnos: Turno[] = [
    { hora: '08:00 - 09:00', reservas: {} },
    { hora: '09:00 - 10:00', reservas: {} },
    { hora: '10:00 - 11:00', reservas: {} },
    { hora: '11:00 - 11:30', reservas: {} },
    { hora: '11:30 - 12:30', reservas: {} },
    { hora: '12:30 - 13:30', reservas: {} },
    { hora: '13:30 - 14:30', reservas: {} }
  ];

  reservar(hora: string): void {
    const turno = this.turnos.find(t => t.hora === hora);
    if (!turno) return;

    const key = `${this.materialSeleccionado}-${this.profesorSeleccionado}`;
    const cantidadActual = turno.reservas[key] || 0;

    if (cantidadActual === 0) {
      const input = prompt(`¿Cuántos ${this.materialSeleccionado} deseas reservar para ${this.profesorSeleccionado} de ${hora} el ${this.fechaSeleccionada}?`);
      const cantidad = Number(input);

      if (!isNaN(cantidad) && cantidad > 0) {
        turno.reservas[key] = cantidad;
        console.log(`Reserva confirmada: ${cantidad} ${this.materialSeleccionado} - ${hora} - ${this.fechaSeleccionada} - Profesor: ${this.profesorSeleccionado}`);
      } else {
        alert('Cantidad no válida.');
      }
    } else {
      const liberar = confirm(`Ya hay reservados ${cantidadActual} ${this.materialSeleccionado}. ¿Deseas cancelar la reserva?`);
      if (liberar) {
        turno.reservas[key] = 0;
        console.log(`Reserva cancelada: ${this.materialSeleccionado} - ${hora} - Profesor: ${this.profesorSeleccionado}`);
      }
    }
  }

  isReservado(turno: Turno): boolean {
    const key = `${this.materialSeleccionado}-${this.profesorSeleccionado}`;
    return (turno.reservas[key] || 0) > 0;
  }

  cantidadReservada(turno: Turno): number {
    const key = `${this.materialSeleccionado}-${this.profesorSeleccionado}`;
    return turno.reservas[key] || 0;
  }
}