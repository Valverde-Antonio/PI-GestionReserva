import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservar-material',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar-material.component.html',
  styleUrls: ['./reservar-material.component.css']
})
export class ReservarMaterialComponent {
  reserva = {
    material: '',
    cantidad: 1,
    fecha: '',
    aula: ''
  };

  materiales: string[] = ['Proyector', 'Portátil', 'Micrófono', 'Pizarra Digital'];
}
