import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ReservaEspacioDTO {
  idReserva?: number;
  fecha: string;
  tramoHorario: string;
  idEspacio: number;
  idProfesor: number;
  nombreProfesor?: string;
  nombreEspacio?: string;
}

export interface ReservaRecursoDTO {
  idReserva?: number;
  fecha: string;
  tramoHorario: string;
  idRecurso: number;
  idProfesor?: number;
  nombreProfesor?: string;
  nombreRecurso?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'http://localhost:8085/api';

  constructor(private http: HttpClient) {
    console.log('ReservaService inicializado');
  }

  // ============================================
  // RESERVAS DE ESPACIOS
  // ============================================

  getReservasEspacio(): Observable<any[]> {
    console.log('Obteniendo todas las reservas de espacios');
    return this.http.get<any[]>(`${this.apiUrl}/reservaEspacio`);
  }

  crearReservaEspacio(reserva: ReservaEspacioDTO): Observable<any> {
    console.log('Enviando nueva reserva de espacio:', reserva);
    return this.http.post(`${this.apiUrl}/reservaEspacio/crear`, reserva, {
      responseType: 'text' as 'json'
    }).pipe(
      map(response => {
        console.log('✅ Respuesta del servidor (espacio):', response);
        try {
          return typeof response === 'string' ? JSON.parse(response) : response;
        } catch {
          return { success: true, message: response };
        }
      })
    );
  }

  actualizarReservaEspacio(id: number, reserva: any): Observable<any> {
    console.log(`Actualizando reserva de espacio con ID ${id}:`, reserva);
    return this.http.put(`${this.apiUrl}/reservaEspacio/actualizar/${id}`, reserva, {
      responseType: 'text' as 'json'
    }).pipe(
      map(response => {
        console.log('✅ Respuesta del servidor:', response);
        try {
          return typeof response === 'string' ? JSON.parse(response) : response;
        } catch {
          return { success: true, message: response };
        }
      })
    );
  }

  eliminarReservaEspacio(id: number): Observable<any> {
    console.log('🗑️ Eliminando reserva de espacio con ID', id);
    return this.http.delete(`${this.apiUrl}/reservaEspacio/eliminar/${id}`, {
      responseType: 'text'
    }).pipe(
      map(response => {
        console.log('✅ Respuesta del servidor:', response);
        return { success: true, message: response };
      })
    );
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

  // ============================================
  // RESERVAS DE RECURSOS
  // ============================================

  getReservasRecurso(): Observable<any[]> {
    console.log('Obteniendo todas las reservas de recursos');
    return this.http.get<any[]>(`${this.apiUrl}/reservaRecurso`);
  }

  crearReservaRecurso(reserva: ReservaRecursoDTO): Observable<any> {
    console.log('Enviando nueva reserva de recurso:', reserva);
    return this.http.post(`${this.apiUrl}/reservaRecurso/crear`, reserva, {
      responseType: 'text' as 'json'
    }).pipe(
      map(response => {
        console.log('✅ Respuesta del servidor (recurso):', response);
        try {
          return typeof response === 'string' ? JSON.parse(response) : response;
        } catch {
          return { success: true, message: response };
        }
      })
    );
  }

  actualizarReservaRecurso(id: number, reserva: any): Observable<any> {
    console.log(`Actualizando reserva de recurso con ID ${id}:`, reserva);
    return this.http.put(`${this.apiUrl}/reservaRecurso/actualizar/${id}`, reserva, {
      responseType: 'text' as 'json'
    }).pipe(
      map(response => {
        console.log('✅ Respuesta del servidor:', response);
        try {
          return typeof response === 'string' ? JSON.parse(response) : response;
        } catch {
          return { success: true, message: response };
        }
      })
    );
  }

  eliminarReservaRecurso(id: number): Observable<any> {
    console.log(`🗑️ Eliminando reserva de recurso con ID ${id}`);
    return this.http.delete(`${this.apiUrl}/reservaRecurso/eliminar/${id}`, {
      responseType: 'text'
    }).pipe(
      map(response => {
        console.log('✅ Respuesta del servidor:', response);
        return { success: true, message: response };
      })
    );
  }

  buscarReservasRecurso(fecha: string, material: string): Observable<ReservaRecursoDTO[]> {
    console.log(`Buscando reservas para recurso en fecha ${fecha}, material ${material}`);
    return this.http.get<ReservaRecursoDTO[]>(`${this.apiUrl}/reservaRecurso/buscar`, {
      params: { fecha, material }
    });
  }

  // ============================================
  // VERIFICACIÓN DE DISPONIBILIDAD
  // ============================================

  verificarDisponibilidadEspacio(fecha: string, tramoHorario: string, idEspacio: number, idReservaActual?: number): Observable<any> {
    console.log('🔍 Verificando disponibilidad de espacio:', { fecha, tramoHorario, idEspacio, idReservaActual });
    let params: any = { fecha, tramoHorario, idEspacio: idEspacio.toString() };
    if (idReservaActual) {
      params.idReservaActual = idReservaActual.toString();
    }
    return this.http.get<any>(`${this.apiUrl}/reservaEspacio/verificar-disponibilidad`, { params });
  }

  verificarDisponibilidadRecurso(fecha: string, tramoHorario: string, idRecurso: number, idReservaActual?: number): Observable<any> {
    console.log('🔍 Verificando disponibilidad de recurso:', { fecha, tramoHorario, idRecurso, idReservaActual });
    let params: any = { fecha, tramoHorario, idRecurso: idRecurso.toString() };
    if (idReservaActual) {
      params.idReservaActual = idReservaActual.toString();
    }
    return this.http.get<any>(`${this.apiUrl}/reservaRecurso/verificar-disponibilidad`, { params });
  }

  // ============================================
  // HISTORIAL COMPLETO
  // ============================================

  getHistorialCompleto(): Observable<[any[], any[]]> {
    console.log('Obteniendo historial completo de reservas (espacios y recursos)');
    return forkJoin([
      this.getReservasEspacio(),
      this.getReservasRecurso()
    ]);
  }
}