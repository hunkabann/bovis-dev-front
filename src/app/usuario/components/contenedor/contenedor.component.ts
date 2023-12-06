import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-contenedor',
  templateUrl: './contenedor.component.html',
  styleUrls: ['./contenedor.component.css']
})
export class ContenedorComponent implements OnInit {

  constructor() { }
  
  items: MenuItem[] = [
    { label: 'Usuarios', routerLink: 'principal' },
    { label: 'Perfiles', routerLink: 'perfiles' },
    { label: 'Módulos', routerLink: 'modulos' },
  ]

  activeItem: MenuItem;

  ngOnInit(): void {
  }

  onActiveItemChange(event: any){
    this.activeItem = event
  }

}
