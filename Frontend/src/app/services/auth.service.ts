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

  // 🔥 SOLUCIÓN: Inicializar BehaviorSubjects leyendo del localStorage
  private _rol$ = new BehaviorSubject<string>(localStorage.getItem('rol') || '');
  readonly rol$ = this._rol$.asObservable();

  private _usuario$ = new BehaviorSubject<string>(localStorage.getItem('usuario') || '');
  readonly usuario$ = this._usuario$.asObservable();

  private _nombre$ = new BehaviorSubject<string>(localStorage.getItem('nombreCompleto') || '');
  readonly nombre$ = this._nombre$.asObservable();

  private _idProfesor$ = new BehaviorSubject<number>(Number(localStorage.getItem('idProfesor') || 0));
  readonly idProfesor$ = this._idProfesor$.asObservable();

  constructor(private http: HttpClient) {
    console.log('🔐 AuthService inicializado');
    console.log('📋 Estado inicial:');
    console.log('  - Usuario:', this._usuario$.value);
    console.log('  - Rol:', this._rol$.value);
    console.log('  - Nombre:', this._nombre$.value);
    console.log('  - ID Profesor:', this._idProfesor$.value);
  }

  private normaliza(v: unknown): string {
    return (v ?? '').toString().trim().toLowerCase();
  }

  login(usuario: string, clave: string): Observable<Profesor> {
    return this.http.post<Profesor>(this.apiUrl, { usuario, clave }).pipe(
      tap((profesor) => {
        console.log('✅ Login exitoso:', profesor);
        
        const rawRol =
          profesor?.roles?.[0]?.nombre_rol ??
          profesor?.roles?.[0]?.nombreRol ??
          '';
        
        const norm = this.normaliza(rawRol);
        const rol = norm === 'directivo' ? 'directivo' : norm === 'profesor' ? 'profesor' : '';

        if (!rol) {
          console.error('❌ Rol no reconocido:', rawRol);
          return;
        }

        console.log('🎭 Rol detectado:', rol);
        
        // Guardar en localStorage Y actualizar BehaviorSubjects
        this.setUsuario(profesor.usuario);
        this.setRol(rol);
        this.setIdProfesor(profesor.idProfesor);
        this.setNombreCompleto(profesor.nombre);

        // 🔥 Verificar que se guardó
        console.log('💾 Datos guardados:');
        console.log('  - rol:', localStorage.getItem('rol'));
        console.log('  - usuario:', localStorage.getItem('usuario'));
        console.log('  - nombreCompleto:', localStorage.getItem('nombreCompleto'));
        console.log('  - idProfesor:', localStorage.getItem('idProfesor'));
      })
    );
  }

  // Setters: actualizan localStorage Y BehaviorSubject
  setUsuario(v: string) {
    console.log('📝 Guardando usuario:', v);
    localStorage.setItem('usuario', v);
    this._usuario$.next(v);
  }

  setRol(v: string) {
    const n = this.normaliza(v);
    console.log('🎭 Guardando rol:', n);
    localStorage.setItem('rol', n);
    this._rol$.next(n);
  }

  setIdProfesor(id: number) {
    console.log('🆔 Guardando idProfesor:', id);
    localStorage.setItem('idProfesor', String(id));
    this._idProfesor$.next(id);
  }

  setNombreCompleto(nombre: string) {
    console.log('📛 Guardando nombre:', nombre);
    localStorage.setItem('nombreCompleto', nombre);
    this._nombre$.next(nombre);
  }

  // Getters: leen del localStorage
  getRol(): string { 
    const rol = localStorage.getItem('rol') || '';
    return rol;
  }

  getUsuario(): string { 
    return localStorage.getItem('usuario') || '';
  }

  getNombreCompleto(): string { 
    return localStorage.getItem('nombreCompleto') || '';
  }

  getIdProfesor(): number { 
    return Number(localStorage.getItem('idProfesor') || 0);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('rol') && !!localStorage.getItem('usuario');
  }

  isDirectivo(): boolean {
    return this.getRol() === 'directivo';
  }

  isProfesor(): boolean {
    return this.getRol() === 'profesor';
  }

  logout(): void {
    console.log('🚪 Cerrando sesión...');
    localStorage.clear();
    this._usuario$.next('');
    this._nombre$.next('');
    this._rol$.next('');
    this._idProfesor$.next(0);
    console.log('✅ Sesión cerrada - localStorage limpiado');
  }
}