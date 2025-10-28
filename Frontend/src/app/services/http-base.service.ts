import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpBaseService {
  private headers = new HttpHeaders({
    'Access-Control-Allow-Origin': '*'
  });

  constructor(private http: HttpClient) {}

  get<T>(url: string, p0: { params: { nombre: string; }; }) {
    return this.http.get<T>(url, { headers: this.headers });
  }

  post<T>(url: string, body: any) {
    return this.http.post<T>(url, body, { headers: this.headers });
  }

  put<T>(url: string, body: any) {
    return this.http.put<T>(url, body, { headers: this.headers });
  }

  delete<T>(url: string) {
    return this.http.delete<T>(url, { headers: this.headers });
  }
}
