import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

export interface ReservaEspacioDTO {
  idReserva?: number;
  fecha: string;
  tramoHorario: string;
  idEspacio: number;
  idProfesor: number;
  nombreProfesor?: string;
  nombreEspacio?: string;
}

// ✅ Interfaz actualizada para coincidir con el DTO del backend
export interface ReservaRecursoDTO {
  idReserva?: number;           // Opcional para creación
  fecha: string;
  tramoHorario: string;
  idRecurso: number;
  idProfesor: number;           // ✅ Campo principal para identificar al profesor
  nombreProfesor?: string;      // ✅ Campo adicional del backend
  nombreRecurso?: string;       // ✅ Campo adicional del backend  
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'http://localhost:8085/api';

  constructor(private http: HttpClient) {
    console.log('ReservaService inicializado');
  }

  // RESERVAS DE ESPACIOS
  getReservasEspacio(): Observable<any[]> {
    console.log('Obteniendo todas las reservas de espacios');
    return this.http.get<any[]>(`${this.apiUrl}/reservaEspacio`);
  }

  crearReservaEspacio(reserva: ReservaEspacioDTO): Observable<any> {
    console.log('Enviando nueva reserva de espacio:', reserva);
    return this.http.post(`${this.apiUrl}/reservaEspacio/crear`, reserva);
  }

  actualizarReservaEspacio(id: number, reserva: ReservaEspacioDTO): Observable<any> {
    console.log(`Actualizando reserva de espacio con ID ${id}:`, reserva);
    return this.http.put(`${this.apiUrl}/reservaEspacio/actualizar/${id}`, reserva);
  }

  eliminarReservaEspacio(id: number): Observable<void> {
    console.log('Eliminando reserva de espacio con ID', id);
    return this.http.delete<void>(`${this.apiUrl}/reservaEspacio/eliminar/${id}`);
  }

  buscarReservasEspacio(fecha: string, aula: string): Observable<any[]> {
    console.log(`Buscando reservas para fecha ${fecha}, aula ${aula}`);
    return this.http.get<any[]>(`${this.apiUrl}/reservaEspacio/buscar`, {
      params: { fecha, aula }
    });
  }

  getTurnos(): Observable<string[]> {
    console.log('📡 Solicitando turnos al backend');
    return this.http.get<string[]>(`${this.apiUrl}/reservaEspacio/turnos`);
  }

  // RESERVAS DE RECURSOS
  getReservasRecurso(): Observable<any[]> {
    console.log('Obteniendo todas las reservas de recursos');
    return this.http.get<any[]>(`${this.apiUrl}/reservaRecurso`);
  }

  crearReservaRecurso(reserva: ReservaRecursoDTO): Observable<any> {
    console.log('Enviando nueva reserva de recurso:', reserva);
    return this.http.post(`${this.apiUrl}/reservaRecurso/crear`, reserva);
  }

  actualizarReservaRecurso(id: number, reserva: ReservaRecursoDTO): Observable<any> {
    console.log(`Actualizando reserva de recurso con ID ${id}:`, reserva);
    return this.http.put(`${this.apiUrl}/reservaRecurso/actualizar/${id}`, reserva);
  }

  eliminarReservaRecurso(id: number): Observable<any> {
    console.log(`Eliminando reserva de recurso con ID ${id}`);
    return this.http.delete(`${this.apiUrl}/reservaRecurso/eliminar/${id}`);
  }

  buscarReservasRecurso(fecha: string, material: string): Observable<ReservaRecursoDTO[]> {
    console.log(`Buscando reservas para recurso en fecha ${fecha}, material ${material}`);
    return this.http.get<ReservaRecursoDTO[]>(`${this.apiUrl}/reservaRecurso/buscar`, {
      params: { fecha, material }
    });
  }

  getHistorialCompleto(): Observable<[any[], any[]]> {
    console.log('Obteniendo historial completo de reservas (espacios y recursos)');
    return forkJoin([
      this.getReservasEspacio(),
      this.getReservasRecurso()
    ]);
  }
}