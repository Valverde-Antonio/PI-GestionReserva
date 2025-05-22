import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  mostrarMenu: boolean = false;
  pantallaPequena: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.pantallaPequena = window.innerWidth < 768;
    this.mostrarMenu = !this.pantallaPequena;

    window.addEventListener('resize', () => {
      this.pantallaPequena = window.innerWidth < 768;
      if (!this.pantallaPequena) this.mostrarMenu = true;
    });
  }

  cerrarSesion(): void {
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
