import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './header/header.component';
import { HeaderAdminComponent } from './header-admin/header-admin.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    HeaderComponent,
    HeaderAdminComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'GestionReservas';
  rol: string = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 AppComponent inicializado');
    
    // 🔥 SOLUCIÓN 1: Leer el rol inicial del localStorage
    this.rol = localStorage.getItem('rol') || '';
    console.log('📋 Rol inicial desde localStorage:', this.rol);

    // 🔥 SOLUCIÓN 2: Suscribirse a cambios del rol
    this.authService.rol$.subscribe(rol => {
      this.rol = rol;
      console.log('🎭 App Component - Rol actualizado vía observable:', this.rol);
    });

    // 🔥 SOLUCIÓN 3: Actualizar el rol en cada cambio de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Volver a leer el rol después de cada navegación
      this.rol = localStorage.getItem('rol') || '';
      console.log('🔄 Navegación detectada - Rol actual:', this.rol);
    });
  }

  get esDirectivo(): boolean {
    return this.rol === 'directivo';
  }

  get esProfesor(): boolean {
    return this.rol === 'profesor';
  }

  get mostrarHeaders(): boolean {
    const mostrar = !!this.rol && (this.esDirectivo || this.esProfesor);
    console.log('👁️ ¿Mostrar headers?', mostrar, '- Rol:', this.rol);
    return mostrar;
  }
}