import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header-admin.component.html',
  styleUrls: ['./header-admin.component.css']
})
export class HeaderAdminComponent implements OnInit {
  @Input() nombreUsuario: string = '';

  mostrarMenu: boolean = false;
  pantallaPequena: boolean = window.innerWidth < 768;

  constructor(private router: Router) {}

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this.pantallaPequena = window.innerWidth < 768;
      if (!this.pantallaPequena) {
        this.mostrarMenu = true; 
      }
    });

    this.mostrarMenu = !this.pantallaPequena;
  }

  cerrarSesion(): void {
    console.log('Cerrar sesión');
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}