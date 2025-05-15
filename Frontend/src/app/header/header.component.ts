import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() nombreUsuario: string = 'Usuario';
  constructor(private router: Router) { }
  cerrarSesion() {
    console.log('Cerrar sesión');
    // Limpiar datos de sesión (si están almacenados en localStorage o sessionStorage)
    sessionStorage.clear();
    localStorage.clear();
    // Redirigir al login
    this.router.navigate(['/login']);
  }
}