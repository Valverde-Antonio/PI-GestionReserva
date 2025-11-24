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

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las reservas de espacios
   */
  getReservasEspacio(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservaEspacio`);
  }

  /**
   * Crea una nueva reserva de espacio
   */
  crearReservaEspacio(reserva: ReservaEspacioDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservaEspacio/crear`, reserva, {
      responseType: 'text' as 'json'
    }).pipe(
      map(response => {
        try {
          return typeof response === 'string' ? JSON.parse(response) : response;
        } catch {
          return { success: true, message: response };
        }
      })
    );
  }

  /**
   * Actualiza una reserva de espacio existente
   */
  actualizarReservaEspacio(id: number, reserva: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservaEspacio/actualizar/${id}`, reserva, {
      responseType: 'text' as 'json'
    }).pipe(
      map(response => {
        try {
          return typeof response === 'string' ? JSON.parse(response) : response;
        } catch {
          return { success: true, message: response };
        }
      })
    );
  }

  /**
   * Elimina una reserva de espacio
   */
  eliminarReservaEspacio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservaEspacio/eliminar/${id}`, {
      responseType: 'text'
    }).pipe(
      map(response => {
        return { success: true, message: response };
      })
    );
  }

  /**
   * Busca reservas de espacios por fecha y aula
   */
  buscarReservasEspacio(fecha: string, aula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservaEspacio/buscar`, {
      params: { fecha, aula }
    });
  }

  /**
   * Obtiene los turnos disponibles
   */
  getTurnos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/reservaEspacio/turnos`);
  }

  /**
   * Obtiene todas las reservas de recursos
   */
  getReservasRecurso(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservaRecurso`);
  }

  /**
   * Crea una nueva reserva de recurso
   */
  crearReservaRecurso(reserva: ReservaRecursoDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservaRecurso/crear`, reserva, {
      responseType: 'text' as 'json'
    }).pipe(
      map(response => {
        try {
          return typeof response === 'string' ? JSON.parse(response) : response;
        } catch {
          return { success: true, message: response };
        }
      })
    );
  }

  /**
   * Actualiza una reserva de recurso existente
   */
  actualizarReservaRecurso(id: number, reserva: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservaRecurso/actualizar/${id}`, reserva, {
      responseType: 'text' as 'json'
    }).pipe(
      map(response => {
        try {
          return typeof response === 'string' ? JSON.parse(response) : response;
        } catch {
          return { success: true, message: response };
        }
      })
    );
  }

  /**
   * Elimina una reserva de recurso
   */
  eliminarReservaRecurso(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservaRecurso/eliminar/${id}`, {
      responseType: 'text'
    }).pipe(
      map(response => {
        return { success: true, message: response };
      })
    );
  }

  /**
   * Busca reservas de recursos por fecha y material
   */
  buscarReservasRecurso(fecha: string, material: string): Observable<ReservaRecursoDTO[]> {
    return this.http.get<ReservaRecursoDTO[]>(`${this.apiUrl}/reservaRecurso/buscar`, {
      params: { fecha, material }
    });
  }

  /**
   * Verifica la disponibilidad de un espacio en una fecha y horario específicos
   */
  verificarDisponibilidadEspacio(fecha: string, tramoHorario: string, idEspacio: number, idReservaActual?: number): Observable<any> {
    let params: any = { fecha, tramoHorario, idEspacio: idEspacio.toString() };
    if (idReservaActual) {
      params.idReservaActual = idReservaActual.toString();
    }
    return this.http.get<any>(`${this.apiUrl}/reservaEspacio/verificar-disponibilidad`, { params });
  }

  /**
   * Verifica la disponibilidad de un recurso en una fecha y horario específicos
   */
  verificarDisponibilidadRecurso(fecha: string, tramoHorario: string, idRecurso: number, idReservaActual?: number): Observable<any> {
    let params: any = { fecha, tramoHorario, idRecurso: idRecurso.toString() };
    if (idReservaActual) {
      params.idReservaActual = idReservaActual.toString();
    }
    return this.http.get<any>(`${this.apiUrl}/reservaRecurso/verificar-disponibilidad`, { params });
  }

  /**
   * Obtiene el historial completo de reservas (espacios y recursos)
   */
  getHistorialCompleto(): Observable<[any[], any[]]> {
    return forkJoin([
      this.getReservasEspacio(),
      this.getReservasRecurso()
    ]);
  }
}