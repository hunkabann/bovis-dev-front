import { Component, Input, OnInit } from '@angular/core';

interface InputInterface {
  hasChildre:   boolean,
  subSecciones: InputRegistros[]
}

interface InputRegistros {
  seccion:   string,
  encabezados:  string[],
  registros:    any[]
}

@Component({
  selector: 'app-subsecciones-accordion',
  templateUrl: './subsecciones-accordion.component.html',
  styleUrls: ['./subsecciones-accordion.component.css']
})
export class SubseccionesAccordionComponent implements OnInit {

  @Input() data: InputInterface;

  constructor() { }

  ngOnInit(): void { }

}
