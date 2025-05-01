import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;
  private rol: 'profesor' | 'equipo' | '' = '';

  login(rol: 'profesor' | 'equipo') {
    this.loggedIn = true;
    this.rol = rol;
  }

  logout() {
    this.loggedIn = false;
    this.rol = '';
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getRol(): string {
    return this.rol;
  }

  isProfesor(): boolean {
    return this.rol === 'profesor';
  }

  isEquipo(): boolean {
    return this.rol === 'equipo';
  }
}
