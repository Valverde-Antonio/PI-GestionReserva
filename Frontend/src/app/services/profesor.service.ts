import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Profesor {
  idProfesor?: number;
  usuario: string;
  clave: string;
  nombre: string;
  dni?: string;
  email?: string;
  curso_academico?: string;
  departamento?: string;
  alias?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfesorService {
  private apiUrl = 'http://localhost:8080/api/profesores'; 

  constructor(private http: HttpClient) {}

  // Crear nuevo profesor
  crearProfesor(profesor: Profesor): Observable<Profesor> {
    return this.http.post<Profesor>(this.apiUrl, profesor);
  }

  // Obtener todos los profesores
  getProfesores(): Observable<Profesor[]> {
    return this.http.get<Profesor[]>(this.apiUrl);
  }

  // Obtener un profesor por ID
  getProfesorById(id: number): Observable<Profesor> {
    return this.http.get<Profesor>(`${this.apiUrl}/${id}`);
  }

  // Actualizar un profesor
  actualizarProfesor(id: number, profesor: Profesor): Observable<Profesor> {
    return this.http.put<Profesor>(`${this.apiUrl}/${id}`, profesor);
  }

  // Eliminar un profesor
  eliminarProfesor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Obtener perfil por nombre de usuario (ideal para login)
  getPerfilPorUsuario(usuario: string): Observable<Profesor> {
    return this.http.get<Profesor>(`${this.apiUrl}/usuario/${usuario}`);
  }
}
