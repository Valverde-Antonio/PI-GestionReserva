import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-admin.component.html',
  styleUrls: ['./header-admin.component.css']
})
export class HeaderAdminComponent implements OnInit, OnDestroy {
  mostrarMenu = false;
  pantallaPequena = false;
  rol = '';
  nombre = '';
  
  // 🔥 Para limpiar las suscripciones
  private subscriptions: Subscription[] = [];

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('✅ HeaderAdminComponent (DIRECTIVO) cargado');
    
    // 🔥 SOLUCIÓN 1: Leer inmediatamente del localStorage
    this.rol = localStorage.getItem('rol') || '';
    this.nombre = localStorage.getItem('nombreCompleto') || '';
    
    console.log('📝 Header Admin - Valores iniciales:');
    console.log('  ➡️ Rol:', this.rol);
    console.log('  ➡️ Nombre:', this.nombre);
    console.log('  ➡️ Usuario:', this.authService.getUsuario());

    // 🔥 SOLUCIÓN 2: Suscribirse a los cambios
    const rolSub = this.authService.rol$.subscribe(r => {
      this.rol = r;
      console.log('🔄 Header Admin - Rol actualizado:', this.rol);
    });

    const nombreSub = this.authService.nombre$.subscribe(n => {
      this.nombre = n;
      console.log('🔄 Header Admin - Nombre actualizado:', this.nombre);
    });

    this.subscriptions.push(rolSub, nombreSub);
  }

  ngOnDestroy(): void {
    // 🧹 Limpiar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cerrarSesion(): void {
    console.log('🚪 Cerrando sesión desde Header Admin');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.mostrarMenu = !this.mostrarMenu;
  }
}