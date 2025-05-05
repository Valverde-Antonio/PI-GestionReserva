import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-historico-reservas',
  templateUrl: './historico-reservas.component.html',
  styleUrls: ['./historico-reservas.component.css']
})
export class HistoricoReservasComponent implements OnInit {
  historial: any[] = [];

  ngOnInit(): void {
    // Simulación de datos para mostrar
    this.historial = [
      {
        espacio: 'Aula 2.2',
        recurso: 'TV Digital',
        fecha: '2025-04-22',
        horaInicio: '09:00',
        horaFin: '10:30',
        estado: 'Finalizada'
      },
      {
        espacio: 'Laboratorio B',
        recurso: 'Ordenadores',
        fecha: '2025-04-15',
        horaInicio: '12:00',
        horaFin: '13:00',
        estado: 'Cancelada'
      }
    ];

    // Para simular que no hay historial, dejarlo vacío
    // this.historial = [];
  }
}
