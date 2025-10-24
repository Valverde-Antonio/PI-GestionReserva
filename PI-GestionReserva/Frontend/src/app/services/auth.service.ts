import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

type RolWire = { nombreRol?: string; nombre_rol?: string };

export interface Profesor {
  idProfesor: number;
  usuario: string;
  nombre: string;
  clave?: string;  // no lo necesitamos guardar
  roles: RolWire[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8085/api/auth/login';
  private usuario: string = '';
  private rol: string = '';
  private nombreCompleto: string = '';
  private idProfesor: number = 0;

  constructor(private http: HttpClient) {}

  login(usuario: string, clave: string): Observable<Profesor> {
    return this.http.post<Profesor>(this.apiUrl, { usuario, clave }).pipe(
      tap((profesor) => {
        if (profesor && profesor.roles?.length > 0) {
          // ✅ soporta ambas variantes del backend
          const rol = profesor.roles[0]?.nombreRol ?? profesor.roles[0]?.nombre_rol;
          if (rol) {
            this.setUsuario(profesor.usuario);
            this.setRol(rol);
            this.setIdProfesor(profesor.idProfesor);
            this.setNombreCompleto(profesor.nombre);
          } else {
            console.error('El rol del profesor es inválido (sin nombreRol/nombre_rol)');
          }
        } else {
          console.error('El profesor no tiene roles asignados');
        }
      })
    );
  }

  setUsuario(usuario: string): void {
    this.usuario = usuario;
    localStorage.setItem('usuario', usuario);
  }

  setRol(rol: string): void {
    this.rol = rol;
    localStorage.setItem('rol', rol);
  }

  setIdProfesor(id: number): void {
    this.idProfesor = id;
    localStorage.setItem('idProfesor', id.toString());
  }

  setNombreCompleto(nombre: string): void {
    this.nombreCompleto = nombre;
    localStorage.setItem('nombreCompleto', nombre);
  }

  getRol(): string {
    return this.rol || localStorage.getItem('rol') || '';
  }

  getUsuario(): string {
    return this.usuario || localStorage.getItem('usuario') || '';
  }

  getNombreCompleto(): string {
    return this.nombreCompleto || localStorage.getItem('nombreCompleto') || '';
  }

  getIdProfesor(): number {
    return this.idProfesor || Number(localStorage.getItem('idProfesor')) || 0;
  }

  logout(): void {
    this.usuario = '';
    this.nombreCompleto = '';
    this.rol = '';
    this.idProfesor = 0;
    localStorage.clear();
    console.log('Logout realizado correctamente');
  }
}
