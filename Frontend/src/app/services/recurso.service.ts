import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recurso {
  idRecurso: number; 
  nombre: string;    
}

@Injectable({
  providedIn: 'root'
})
export class RecursoService {
  private apiUrl = 'http://localhost:8085/api/recursos'; 

  constructor(private http: HttpClient) {}

  getRecursos(): Observable<Recurso[]> {
    return this.http.get<Recurso[]>(`${this.apiUrl}`);
  }

  crearRecurso(recurso: Pick<Recurso, 'nombre'>): Observable<Recurso> {
    // El backend solo necesita 'nombre'
    return this.http.post<Recurso>(`${this.apiUrl}`, recurso);
  }

  actualizarRecurso(idRecurso: number, recurso: Pick<Recurso, 'nombre'>): Observable<Recurso> {
    return this.http.put<Recurso>(`${this.apiUrl}/${idRecurso}`, recurso);
  }

  eliminarRecurso(idRecurso: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idRecurso}`);
  }
}
