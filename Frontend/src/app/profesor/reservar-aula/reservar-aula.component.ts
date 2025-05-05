import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservar-aula',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar-aula.component.html',
  styleUrls: ['./reservar-aula.component.css']
})
export class ReservarAulaComponent {
  reserva = {
    aula: '',
    fecha: '',
    hora: '',
    motivo: ''
  };

  aulas: string[] = ['Aula 101', 'Aula 102', 'Laboratorio 1', 'Sala de reuniones'];
}
