import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-admin.component.html',
  styleUrls: ['./header-admin.component.css']
})
export class HeaderAdminComponent implements OnInit, OnDestroy {
  mostrarMenu = false;
  pantallaPequena = false;
  rol = '';
  nombre = '';
  

  private subscriptions: Subscription[] = [];

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    
    this.rol = localStorage.getItem('rol') || '';
    this.nombre = localStorage.getItem('nombreCompleto') || '';
    
  

    const rolSub = this.authService.rol$.subscribe(r => {
      this.rol = r;
    });

    const nombreSub = this.authService.nombre$.subscribe(n => {
      this.nombre = n;
    });

    this.subscriptions.push(rolSub, nombreSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.mostrarMenu = !this.mostrarMenu;
  }
}