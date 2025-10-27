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
  usuario: string = '';
  clave: string = '';
  mostrarPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

login(): void {
  this.authService.login(this.usuario, this.clave).subscribe({
    next: (profesor: Profesor) => {
      this.authService.setUsuario(profesor.usuario);

      // Extraer correctamente el nombre del rol de la estructura 'roles' y 'nombre_rol'
      const rolNombre = profesor.roles &&
        profesor.roles.length > 0 &&
        profesor.roles[0].nombre_rol
          ? profesor.roles[0].nombre_rol.toLowerCase()
          : '';

      // Detectar si es directivo (equipo) o profesor
let rolDetectado: string | null = null;
if (rolNombre === 'directivo') {
  rolDetectado = 'directivo';
} else if (rolNombre === 'profesor') {
  rolDetectado = 'profesor';
}
      this.authService.setRol(rolDetectado ?? '');

      if (rolDetectado === 'profesor') {
        this.router.navigate(['/paginaPrincipal']);
      } else if (rolDetectado === 'directivo') {
        this.router.navigate(['/admin']);
      } else {
        alert('Usuario sin rol asignado. Contacte con el administrador.');
      }
    },
    error: () => {
      alert('Credenciales incorrectas');
    }
  });
}






  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  limpiar(): void {
    this.usuario = '';
    this.clave = '';
  }
}
