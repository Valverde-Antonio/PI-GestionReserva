import { Component, OnInit } from '@angular/core';
import { HeaderAdminComponent } from '../header-admin/header-admin.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pagina-principal-admin',
  standalone: true,
  imports: [HeaderAdminComponent, CommonModule, RouterModule],
  templateUrl: './pagina-principal-admin.component.html',
  styleUrls: ['./pagina-principal-admin.component.css'] // ← ✅ CORREGIDO
})
export class PaginaPrincipalAdminComponent implements OnInit {
  usuarioActual: string = '';

  ngOnInit(): void {
    this.usuarioActual = localStorage.getItem('usuario') || 'Admin';
  }
}
