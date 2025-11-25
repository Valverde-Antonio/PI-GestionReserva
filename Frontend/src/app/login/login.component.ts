import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Profesor } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  usuario = '';
  clave = '';
  mostrarPassword = false;

  // Modal
  mostrarModal: boolean = false;
  mensajeModal: string = '';
  tipoMensaje: 'success' | 'error' | 'warning' | 'info' = 'error';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    console.groupCollapsed('%c[LoginComponent] login() → suscripción', 'color:#6a0dad');
    this.authService.login(this.usuario, this.clave).subscribe({
      next: (_profesor: Profesor) => {
        const rol = this.authService.getRol();
        console.info('[LoginComponent] Rol tras login =>', rol || '(vacío)');

        if (rol === 'profesor') {
          console.info('[LoginComponent] Navegando a /paginaPrincipal');
          this.router.navigate(['/paginaPrincipal']);
        } else if (rol === 'directivo') {
          console.info('[LoginComponent] Navegando a /paginaPrincipalAdmin');
          this.router.navigate(['/paginaPrincipalAdmin']);
        } else {
          console.error('[LoginComponent] Usuario sin rol asignado. Mostrar modal.');
          this.mostrarMensaje('Usuario sin rol asignado. Contacte con el administrador.', 'warning');
        }
        console.groupEnd();
      },
      error: (err) => {
        console.groupCollapsed('%c[LoginComponent] Error en login', 'color:#e00');
        console.error(err);
        console.groupEnd();
        this.mostrarMensaje('Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.', 'error');
      }
    });
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
    console.debug('[LoginComponent] togglePassword ->', this.mostrarPassword);
  }

  limpiar(): void {
    this.usuario = '';
    this.clave = '';
    console.debug('[LoginComponent] limpiar() -> campos vaciados');
  }

  /**
   * Muestra un mensaje en el modal
   */
  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info'): void {
    this.mensajeModal = mensaje;
    this.tipoMensaje = tipo;
    this.mostrarModal = true;
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.mensajeModal = '';
  }
}