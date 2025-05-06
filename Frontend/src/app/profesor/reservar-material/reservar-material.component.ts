import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Turno {
  hora: string;
  reservas: { [material: string]: number };
}

@Component({
  selector: 'app-reservar-material',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar-material.component.html',
  styleUrls: ['./reservar-material.component.css']
})
export class ReservarMaterialComponent {
  materiales: string[] = ['Proyector', 'Portátil', 'Pizarra Digital'];
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

  reservar(hora: string, material: string): void {
    const turno = this.turnos.find(t => t.hora === hora);
    if (!turno) return;

    const cantidadActual = turno.reservas[material] || 0;

    if (cantidadActual === 0) {
      const input = prompt(`¿Cuántos ${material} deseas reservar de ${hora} el ${this.fechaSeleccionada}?`);
      const cantidad = Number(input);

      if (!isNaN(cantidad) && cantidad > 0) {
        turno.reservas[material] = cantidad;
        console.log(`Reserva confirmada: ${cantidad} ${material} - ${hora} - ${this.fechaSeleccionada}`);
      } else {
        alert('Cantidad no válida.');
      }
    } else {
      const liberar = confirm(`Ya hay reservados ${cantidadActual} ${material}. ¿Deseas cancelar la reserva?`);
      if (liberar) {
        turno.reservas[material] = 0;
        console.log(`Reserva cancelada: ${material} - ${hora}`);
      }
    }
  }

  isReservado(turno: Turno, material: string): boolean {
    return (turno.reservas[material] || 0) > 0;
  }

  cantidadReservada(turno: Turno, material: string): number {
    return turno.reservas[material] || 0;
  }
}
