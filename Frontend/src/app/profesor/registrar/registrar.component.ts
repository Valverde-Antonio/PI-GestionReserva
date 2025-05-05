import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // AÑADIDO
import { CommonModule } from '@angular/common'; // Por si usas *ngIf o *ngFor
import { Profesor, ProfesorService } from '../../services/profesor.service';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [CommonModule, FormsModule], // AÑADIDO
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css'] // si lo usas
})
export class RegistrarComponent {
  profesor: Profesor = { nombre: '', usuario: '', clave: '' };

  constructor(private profesorService: ProfesorService) {}

  registrar() {
    this.profesorService.crearProfesor(this.profesor).subscribe({
      next: () => alert('Profesor registrado'),
      error: () => alert('Error al registrar')
    });
  }
}
