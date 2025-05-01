import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { FooterComponent } from './footer/footer.component';
import { GestionarEspaciosComponent } from './admin/gestionar-espacios/gestionar-espacios.component';
import { GestionarRecursosComponent } from './admin/gestionar-recursos/gestionar-recursos.component';
import { TodasLasReservasComponent } from './admin/todas-las-reservas/todas-las-reservas.component';
import { EspaciosComponent } from './reservas/espacios/espacios.component';
import { RecursosComponent } from './reservas/recursos/recursos.component';
import { ReservarEspacioComponent } from './profesor/reservar-espacio/reservar-espacio.component';
import { ReservarRecursoComponent } from './profesor/reservar-recurso/reservar-recurso.component';
import { MisReservasComponent } from './profesor/mis-reservas/mis-reservas.component';
import { HistoricoReservasComponent } from './profesor/historico-reservas/historico-reservas.component';
import { ReservasHoyComponent } from './profesor/reservas-hoy/reservas-hoy.component';
import { HeaderComponent } from './header/header.component';
import { PaginaPrincipalComponent } from './pagina-principal/pagina-principal.component';
import path from 'path';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'header', component: HeaderComponent },

  // ADMIN
  { path: 'admin-espacios', component: GestionarEspaciosComponent },
  { path: 'admin-recursos', component: GestionarRecursosComponent },
  { path: 'admin-reservas', component: TodasLasReservasComponent },

  // RESERVAS
  { path: 'reservas-espacios', component: EspaciosComponent },
  { path: 'reservas-recursos', component: RecursosComponent },

  // PROFESOR
  { path: 'profesor/reservar-espacio', component: ReservarEspacioComponent },
  { path: 'profesor/reservar-recurso', component: ReservarRecursoComponent },
  { path: 'profesor/mis-reservas', component: MisReservasComponent },
  { path: 'profesor/historico-reservas', component: HistoricoReservasComponent },
  { path: 'profesor/reservas-hoy', component: ReservasHoyComponent },

  //PAGINAS
  { path: 'paginaPrincipal', component: PaginaPrincipalComponent },


];
