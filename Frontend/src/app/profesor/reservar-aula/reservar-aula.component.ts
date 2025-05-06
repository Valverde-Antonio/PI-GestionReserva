import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Turno {
  hora: string;
  reservas: { [aula: string]: string }; // el valor es el motivo
}

@Component({
  selector: 'app-reservar-aula',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar-aula.component.html',
  styleUrls: ['./reservar-aula.component.css']
})
export class ReservarAulaComponent {
  aulas: string[] = Array.from({ length: 30 }, (_, i) => `Aula ${i + 1}`);
  aulaSeleccionada: string = this.aulas[0];
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

    const actual = turno.reservas[this.aulaSeleccionada];

    if (!actual) {
      const motivo = prompt(`¿Motivo para reservar ${this.aulaSeleccionada} de ${hora} el ${this.fechaSeleccionada}?`);
      if (motivo && motivo.trim().length > 0) {
        turno.reservas[this.aulaSeleccionada] = motivo.trim();
        console.log(`Reserva hecha: ${this.aulaSeleccionada} - ${hora} - ${this.fechaSeleccionada} - Motivo: ${motivo}`);
      } else {
        alert('Debes ingresar un motivo para la reserva.');
      }
    } else {
      const cancelar = confirm(`Ya está reservado (${actual}). ¿Deseas liberar la reserva?`);
      if (cancelar) {
        turno.reservas[this.aulaSeleccionada] = '';
        console.log(`Reserva cancelada: ${this.aulaSeleccionada} - ${hora}`);
      }
    }
  }

  isReservado(turno: Turno): boolean {
    return turno.reservas[this.aulaSeleccionada]?.trim().length > 0;
  }

  motivo(turno: Turno): string {
    return turno.reservas[this.aulaSeleccionada];
  }
}
