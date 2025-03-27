import { Component, Input, OnInit } from '@angular/core';
import { GastosIngresosSecciones } from '../../models/pcs.model';

@Component({
  selector: 'app-seccion-contenido',
  templateUrl: './seccion-contenido.component.html',
  styleUrls: ['./seccion-contenido.component.css']
})
export class SeccionContenidoComponent implements OnInit {

  @Input() data: GastosIngresosSecciones;

  constructor() { }

  ngOnInit(): void {
  }

}
