import { Component } from '@angular/core';
import { HeaderAdminComponent } from '../header-admin/header-admin.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-pagina-principal-admin',
  standalone: true,
  imports: [HeaderAdminComponent,CommonModule, RouterModule],
  templateUrl: './pagina-principal-admin.component.html',
  styleUrl: './pagina-principal-admin.component.css'
})
export class PaginaPrincipalAdminComponent {

}
