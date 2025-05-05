import { Component, OnInit } from '@angular/core';
import { ProfesorService, Profesor } from '../../services/profesor.service';

@Component({
  selector: 'app-perfil-profesor',
  templateUrl: './perfil-profesor.component.html',
  styleUrls: ['./perfil-profesor.component.css']
})
export class PerfilProfesorComponent implements OnInit {
  profesor?: Profesor;

  constructor(private profesorService: ProfesorService) {}

  ngOnInit(): void {
    this.profesorService.getProfesorById(1).subscribe((data) => {
      this.profesor = data;
    });
  }
}
