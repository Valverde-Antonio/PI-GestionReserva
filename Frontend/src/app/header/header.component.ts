import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  mostrarMenu: boolean = false;
  pantallaPequena: boolean = false;
  rol: string = '';
  nombre: string = '';
  
  // 🔥 Para limpiar las suscripciones
  private subscriptions: Subscription[] = [];

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('✅ HeaderComponent (PROFESOR) cargado');
    
    // 🔥 SOLUCIÓN 1: Leer inmediatamente del localStorage
    this.rol = localStorage.getItem('rol') || '';
    this.nombre = localStorage.getItem('nombreCompleto') || '';
    
    console.log('📝 Header Profesor - Valores iniciales:');
    console.log('  ➡️ Rol:', this.rol);
    console.log('  ➡️ Nombre:', this.nombre);
    console.log('  ➡️ Usuario:', this.authService.getUsuario());

    // 🔥 SOLUCIÓN 2: Suscribirse a los cambios
    const rolSub = this.authService.rol$.subscribe(r => {
      this.rol = r;
      console.log('🔄 Header Profesor - Rol actualizado:', this.rol);
    });

    const nombreSub = this.authService.nombre$.subscribe(n => {
      this.nombre = n;
      console.log('🔄 Header Profesor - Nombre actualizado:', this.nombre);
    });

    this.subscriptions.push(rolSub, nombreSub);
  }

  ngOnDestroy(): void {
    // 🧹 Limpiar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cerrarSesion(): void {
    console.log('🚪 Cerrando sesión desde Header Profesor');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.mostrarMenu = !this.mostrarMenu;
  }
}