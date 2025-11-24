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
  mostrarHeader: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarEstado();
    
    this.authService.rol$.subscribe(rol => {
      this.rol = rol;
      this.verificarEstado();
    });
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.verificarEstado();
    });
  }

  /**
   * Verifica el estado actual de la aplicación y determina si debe mostrar el header
   * Se muestra el header solo si no es la ruta de login y el usuario tiene un rol válido
   */
  verificarEstado(): void {
    const rutaActual = this.router.url;
    this.rol = localStorage.getItem('rol') || '';
    
    const esRutaLogin = rutaActual.includes('/login') || rutaActual === '/';
    const tieneRolValido = this.rol === 'directivo' || this.rol === 'profesor';
    
    this.mostrarHeader = !esRutaLogin && tieneRolValido;
  }

  /**
   * Verifica si el usuario tiene rol de directivo
   */
  get esDirectivo(): boolean {
    return this.rol === 'directivo';
  }

  /**
   * Verifica si el usuario tiene rol de profesor
   */
  get esProfesor(): boolean {
    return this.rol === 'profesor';
  }

  /**
   * Alias para mostrarHeader (mantiene compatibilidad)
   */
  get mostrarHeaders(): boolean {
    return this.mostrarHeader;
  }
}