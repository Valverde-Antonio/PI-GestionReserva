import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  usuario: string = '';
  clave: string = '';
  rol: string = '';
  mostrarPassword: boolean = false;

  constructor(private router: Router) {}

  login() {
    if (this.usuario === 'usuario' && this.clave === 'usuario') {
      if (this.rol === 'profesor' || this.rol === 'equipo') {
        this.router.navigate(['/paginaPrincipal']);
      } else {
        alert('Por favor, selecciona un rol.');
      }
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  }

  limpiar() {
    this.usuario = '';
    this.clave = '';
    this.rol = '';
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }
}