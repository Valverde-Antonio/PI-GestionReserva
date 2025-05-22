import { Routes } from '@angular/router';

// COMPONENTES COMUNES
import { LoginComponent } from './login/login.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PaginaPrincipalComponent } from './pagina-principal/pagina-principal.component';

// ADMIN
import { PaginaPrincipalAdminComponent } from './pagina-principal-admin/pagina-principal-admin.component';
import { GestionarEspaciosComponent } from './admin/gestionar-espacios/gestionar-espacios.component';
import { GestionarRecursosComponent } from './admin/gestionar-recursos/gestionar-recursos.component';
import { TodasLasReservasComponent } from './admin/todas-las-reservas/todas-las-reservas.component';


// PROFESOR

import { HistoricoReservasComponent } from './profesor/historico-reservas/historico-reservas.component';
import { RegistrarComponent } from './profesor/registrar/registrar.component';
import { ReservarAulaComponent } from './profesor/reservar-aula/reservar-aula.component';
import { ReservarMaterialComponent } from './profesor/reservar-material/reservar-material.component';

export const routes: Routes = [
  // REDIRECCIÓN INICIAL
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // COMUNES
  { path: 'login', component: LoginComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'header', component: HeaderComponent },
  { path: 'paginaPrincipal', component: PaginaPrincipalComponent },

  // ADMIN
  { path: 'admin', component: PaginaPrincipalAdminComponent },
  { path: 'admin-espacios', component: GestionarEspaciosComponent },
  { path: 'admin-recursos', component: GestionarRecursosComponent },
  { path: 'admin-reservas', component: TodasLasReservasComponent },


  // PROFESOR
  { path: 'historicoReservas', component: HistoricoReservasComponent },
  { path: 'registrar-profesor', component: RegistrarComponent },
  { path: 'reservar-aula', component: ReservarAulaComponent },
  { path: 'reservar-material', component: ReservarMaterialComponent }
];
