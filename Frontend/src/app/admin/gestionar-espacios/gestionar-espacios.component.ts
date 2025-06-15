import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';


interface Turno {
  hora: string;
  reservas: { [aula: string]: string }; // el valor es el motivo
}

@Component({
  selector: 'app-gestionar-espacios',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderAdminComponent],
  templateUrl: './gestionar-espacios.component.html',
  styleUrls: ['./gestionar-espacios.component.css']
})
export class GestionarEspaciosComponent {
  aulas: string[] = Array.from({ length: 30 }, (_, i) => `Aula ${i + 1}`);
  profesores: string[] = ['Profesor 1', 'Profesor 2', 'Profesor 3', 'Profesor 4'];
  aulaSeleccionada: string = this.aulas[0];
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

    const key = `${this.aulaSeleccionada}-${this.profesorSeleccionado}`;
    const actual = turno.reservas[key];

    if (!actual) {
      const motivo = prompt(`¿Motivo para reservar ${this.aulaSeleccionada} para ${this.profesorSeleccionado} de ${hora} el ${this.fechaSeleccionada}?`);
      if (motivo && motivo.trim().length > 0) {
        turno.reservas[key] = motivo.trim();
        this.mensajeModal = `Reserva hecha: ${this.aulaSeleccionada} - ${hora} - ${this.fechaSeleccionada} - Profesor: ${this.profesorSeleccionado}`;
        this.mostrarModal = true;
      } else {
        alert('Debes ingresar un motivo para la reserva.');
      }
    } else {
      const cancelar = confirm(`Ya está reservado (${actual}). ¿Deseas liberar la reserva?`);
      if (cancelar) {
        turno.reservas[key] = '';
        console.log(`Reserva cancelada: ${this.aulaSeleccionada} - ${hora} - Profesor: ${this.profesorSeleccionado}`);
      }
    }
  }

  isReservado(turno: Turno): boolean {
    const key = `${this.aulaSeleccionada}-${this.profesorSeleccionado}`;
    return turno.reservas[key]?.trim().length > 0;
  }

  motivo(turno: Turno): string {
    const key = `${this.aulaSeleccionada}-${this.profesorSeleccionado}`;
    return turno.reservas[key];
  }
  mostrarModal: boolean = false;
  mensajeModal: string = '';

  cerrarModal(): void {
    this.mostrarModal = false;
    this.mensajeModal = '';
  }

}