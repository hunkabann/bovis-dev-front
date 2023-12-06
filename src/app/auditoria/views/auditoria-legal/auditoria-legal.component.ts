import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-auditoria-legal',
  templateUrl: './auditoria-legal.component.html',
  styleUrls: ['./auditoria-legal.component.css']
})
export class AuditoriaLegalComponent {

  items: MenuItem[] = [
    { label: 'Seleccionar documentos del proyecto', routerLink: 'seleccionar' },
    { label: 'Carga de documentos', routerLink: 'cargar' },
    { label: 'Seguimiento de auditoria', routerLink: 'seguimiento' },
  ]

  activeItem: MenuItem;

  constructor() { }

  onActiveItemChange(event: any){
    this.activeItem = event
  }

}
