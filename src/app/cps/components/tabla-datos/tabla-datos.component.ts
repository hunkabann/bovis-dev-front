import { Component, Input, OnInit } from '@angular/core';

interface InputInterface {
  encabezados:  string[],
  registros:    any[]
}

@Component({
  selector: 'app-tabla-datos',
  templateUrl: './tabla-datos.component.html',
  styleUrls: ['./tabla-datos.component.css']
})
export class TablaDatosComponent implements OnInit {

  @Input() data: InputInterface;

  constructor() { }

  ngOnInit(): void {
  }

}
