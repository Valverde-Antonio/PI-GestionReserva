import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  mostrarMenu: boolean = false;
  pantallaPequena: boolean = false;

  rol: string = '';
  nombre: string = '';

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
  console.log('✅ HeaderComponent cargado');
  console.log('➡️ Usuario:', this.authService.getUsuario());
  console.log('➡️ Rol:', this.authService.getRol());
}


  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
