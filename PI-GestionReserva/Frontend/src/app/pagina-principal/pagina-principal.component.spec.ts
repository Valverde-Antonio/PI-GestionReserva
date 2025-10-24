import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component'; // ✅ IMPORTACIÓN CORRECTA
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterModule], // ✅ HEADER AÑADIDO AQUÍ
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css']
})
export class PaginaPrincipalComponent implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit(): void {}
}
