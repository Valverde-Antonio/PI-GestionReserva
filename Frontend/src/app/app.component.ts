import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './header/header.component';
import { HeaderAdminComponent } from './header-admin/header-admin.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, HeaderAdminComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  mostrarHeader = true;

  constructor(public authService: AuthService, private router: Router) {
    // Oculta el header solo en la ruta /login
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.mostrarHeader = event.urlAfterRedirects !== '/login';
      });
  }

  // 👇 Getter para usar "rol" directamente en el template
  get rol(): string {
    return this.authService.getRol(); // 'admin', 'profesor', etc.
  }
}
