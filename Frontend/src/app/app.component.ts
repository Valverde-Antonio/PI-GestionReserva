import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { HeaderAdminComponent } from './header-admin/header-admin.component'; // 👈 importa el header admin


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, HeaderAdminComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  mostrarHeader = true;
  rol: string | null = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol'); 

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.mostrarHeader = event.urlAfterRedirects !== '/login';
        this.rol = localStorage.getItem('rol'); 
      }
    });
  }
}
