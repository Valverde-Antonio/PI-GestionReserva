import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

type RolWire = { nombreRol?: string; nombre_rol?: string };

export interface Profesor {
  idProfesor: number;
  usuario: string;
  nombre: string;
  clave?: string;
  roles: RolWire[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8085/api/auth/login';

  private _rol$ = new BehaviorSubject<string>(localStorage.getItem('rol') || '');
  readonly rol$ = this._rol$.asObservable();

  private _usuario$ = new BehaviorSubject<string>(localStorage.getItem('usuario') || '');
  readonly usuario$ = this._usuario$.asObservable();

  private _nombre$ = new BehaviorSubject<string>(localStorage.getItem('nombreCompleto') || '');
  readonly nombre$ = this._nombre$.asObservable();

  private _idProfesor$ = new BehaviorSubject<number>(Number(localStorage.getItem('idProfesor') || 0));
  readonly idProfesor$ = this._idProfesor$.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Normaliza un valor a minúsculas sin espacios
   */
  private normaliza(v: unknown): string {
    return (v ?? '').toString().trim().toLowerCase();
  }

  /**
   * Realiza el login del usuario y guarda sus datos en localStorage
   */
  login(usuario: string, clave: string): Observable<Profesor> {
    return this.http.post<Profesor>(this.apiUrl, { usuario, clave }).pipe(
      tap((profesor) => {
        const rawRol =
          profesor?.roles?.[0]?.nombre_rol ??
          profesor?.roles?.[0]?.nombreRol ??
          '';
        
        const norm = this.normaliza(rawRol);
        const rol = norm === 'directivo' ? 'directivo' : norm === 'profesor' ? 'profesor' : '';

        if (!rol) {
          console.error('Rol no reconocido:', rawRol);
          return;
        }
        
        this.setUsuario(profesor.usuario);
        this.setRol(rol);
        this.setIdProfesor(profesor.idProfesor);
        this.setNombreCompleto(profesor.nombre);
      })
    );
  }

  /**
   * Guarda el nombre de usuario
   */
  setUsuario(v: string) {
    localStorage.setItem('usuario', v);
    this._usuario$.next(v);
  }

  /**
   * Guarda el rol del usuario
   */
  setRol(v: string) {
    const n = this.normaliza(v);
    localStorage.setItem('rol', n);
    this._rol$.next(n);
  }

  /**
   * Guarda el ID del profesor
   */
  setIdProfesor(id: number) {
    localStorage.setItem('idProfesor', String(id));
    this._idProfesor$.next(id);
  }

  /**
   * Guarda el nombre completo del profesor
   */
  setNombreCompleto(nombre: string) {
    localStorage.setItem('nombreCompleto', nombre);
    this._nombre$.next(nombre);
  }

  /**
   * Obtiene el rol del usuario
   */
  getRol(): string { 
    return localStorage.getItem('rol') || '';
  }

  /**
   * Obtiene el nombre de usuario
   */
  getUsuario(): string { 
    return localStorage.getItem('usuario') || '';
  }

  /**
   * Obtiene el nombre completo del profesor
   */
  getNombreCompleto(): string { 
    return localStorage.getItem('nombreCompleto') || '';
  }

  /**
   * Obtiene el ID del profesor
   */
  getIdProfesor(): number { 
    return Number(localStorage.getItem('idProfesor') || 0);
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('rol') && !!localStorage.getItem('usuario');
  }

  /**
   * Verifica si el usuario es directivo
   */
  isDirectivo(): boolean {
    return this.getRol() === 'directivo';
  }

  /**
   * Verifica si el usuario es profesor
   */
  isProfesor(): boolean {
    return this.getRol() === 'profesor';
  }

  /**
   * Cierra la sesión del usuario y limpia localStorage
   */
  logout(): void {
    localStorage.clear();
    this._usuario$.next('');
    this._nombre$.next('');
    this._rol$.next('');
    this._idProfesor$.next(0);
  }
}