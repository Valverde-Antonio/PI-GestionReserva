import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [  CommonModule, RouterModule],
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css']
})
export class PaginaPrincipalComponent implements OnInit {
  usuarioActual: string = '';
  rolActual: string = '';  // Variable para almacenar el rol

  ngOnInit(): void {
    // Obtener el nombre del usuario y el rol desde localStorage
    this.usuarioActual = localStorage.getItem('usuario') || 'Usuario';
    this.rolActual = localStorage.getItem('rol') || 'Profesor';  // Por defecto asignamos "Profesor"
  }
}
