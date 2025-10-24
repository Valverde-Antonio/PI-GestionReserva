import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-admin.component.html',
  styleUrls: ['./header-admin.component.css']
})
export class HeaderAdminComponent implements OnInit {
  mostrarMenu: boolean = false;
  pantallaPequena: boolean = false;

  rol: string = '';
  nombre: string = '';

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.rol = this.authService.getRol();
    this.nombre = this.authService.getNombreCompleto();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
