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
  mostrarHeader: boolean = false; // 🔥 NUEVO: Control del header

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 AppComponent inicializado');
    
    // 🔥 Verificar estado inicial
    this.verificarEstado();
    
    // 🔥 Suscribirse a cambios del rol
    this.authService.rol$.subscribe(rol => {
      this.rol = rol;
      console.log('🎭 App Component - Rol actualizado vía observable:', this.rol);
      this.verificarEstado();
    });
    
    // 🔥 Actualizar en cada cambio de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('🔄 Navegación detectada - URL:', event.url);
      this.verificarEstado();
    });
  }

  // 🔥 NUEVO MÉTODO: Verificar si debe mostrar el header
  verificarEstado(): void {
    const rutaActual = this.router.url;
    this.rol = localStorage.getItem('rol') || '';
    
    // 🔥 Mostrar header SOLO si:
    // 1. NO es la ruta de login
    // 2. Tiene un rol válido (directivo o profesor)
    const esRutaLogin = rutaActual.includes('/login') || rutaActual === '/';
    const tieneRolValido = this.rol === 'directivo' || this.rol === 'profesor';
    
    this.mostrarHeader = !esRutaLogin && tieneRolValido;
    
    console.log('📊 Estado actual:', {
      ruta: rutaActual,
      rol: this.rol,
      esLogin: esRutaLogin,
      tieneRol: tieneRolValido,
      mostrarHeader: this.mostrarHeader
    });
  }

  get esDirectivo(): boolean {
    return this.rol === 'directivo';
  }

  get esProfesor(): boolean {
    return this.rol === 'profesor';
  }

  // 🔥 MODIFICADO: Ya no se usa, pero lo mantengo por compatibilidad
  get mostrarHeaders(): boolean {
    return this.mostrarHeader;
  }
}