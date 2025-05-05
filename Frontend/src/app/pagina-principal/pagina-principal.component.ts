import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // ✅ Importación necesaria

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // ✅ Agregado RouterModule
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css']
})
export class PaginaPrincipalComponent {
  opcionSeleccionada: string = 'espacio';
  tipoReserva: string = 'diaria';
  opciones: string[] = ['Aula 1', 'Aula 2', 'Laboratorio'];
}
