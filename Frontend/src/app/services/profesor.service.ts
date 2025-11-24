import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpBaseService } from './http-base.service';

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
  private apiUrl = 'http://localhost:8085/api/profesores';

  constructor(private http: HttpBaseService) {}

  crearProfesor(profesor: Profesor): Observable<Profesor> {
    return this.http.post<Profesor>(this.apiUrl, profesor);
  }

  getProfesores(): Observable<Profesor[]> {
    return this.http.get<Profesor[]>(this.apiUrl, {} as any); 
  }

  getProfesorById(id: number): Observable<Profesor> {
    return this.http.get<Profesor>(`${this.apiUrl}/${id}`, {} as any); 
  }

  actualizarProfesor(id: number, profesor: Profesor): Observable<Profesor> {
    return this.http.put<Profesor>(`${this.apiUrl}/${id}`, profesor); 
  }

  eliminarProfesor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`); 
  }

  getPerfilPorUsuario(usuario: string): Observable<Profesor> {
    return this.http.get<Profesor>(`${this.apiUrl}/usuario/${usuario}`, {} as any); 
  }
}