import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  mostrarMenu: boolean = false;
  pantallaPequena: boolean = false;
  rol: string = '';
  nombre: string = '';
  

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