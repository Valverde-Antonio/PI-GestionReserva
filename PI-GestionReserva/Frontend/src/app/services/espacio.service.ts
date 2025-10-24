import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Espacio {
  idEspacio: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class EspacioService {
  private baseUrl = 'http://localhost:8085/api/espacios';

  constructor(private http: HttpClient) {}

  getEspacios(): Observable<Espacio[]> {
    return this.http.get<Espacio[]>(this.baseUrl);
  }
}
