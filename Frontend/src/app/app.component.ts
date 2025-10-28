import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './header/header.component'; // ← AÑADIR
import { HeaderAdminComponent } from './header-admin/header-admin.component'; // ← AÑADIR

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    HeaderComponent,      // ← AÑADIR
    HeaderAdminComponent  // ← AÑADIR
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'GestionReservas';
  
  // 🔥 SOLUCIÓN: Usar observable del AuthService
  rol: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // 🔥 Suscribirse al observable del rol
    this.authService.rol$.subscribe(rol => {
      this.rol = rol;
      console.log('🎭 App Component - Rol actualizado:', this.rol);
    });

    // 🔥 También leer directamente del localStorage como fallback
    if (!this.rol) {
      this.rol = localStorage.getItem('rol') || '';
      console.log('🎭 App Component - Rol desde localStorage:', this.rol);
    }
  }

  get esDirectivo(): boolean {
    const directivo = this.rol === 'directivo';
    console.log('🔍 ¿Es directivo?', directivo, '- Rol actual:', this.rol);
    return directivo;
  }

  get esProfesor(): boolean {
    const profesor = this.rol === 'profesor';
    console.log('🔍 ¿Es profesor?', profesor, '- Rol actual:', this.rol);
    return profesor;
  }

 get mostrarHeaders(): boolean {
  return !!this.rol && (this.esDirectivo || this.esProfesor);
}
}