import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progreso',
  templateUrl: './progreso.component.html',
  styleUrls: ['./progreso.component.css']
})
export class ProgresoComponent implements OnInit {

  @Input() totalDocumentos: number = 0;
  @Input() totalDocumentosValidados: number = 0;

  constructor() { }

  get total() {

    if(this.totalDocumentos == 0 && this.totalDocumentosValidados == 0) {
      return 0
    }
    
    return Math.round((this.totalDocumentosValidados / this.totalDocumentos) * 100)
  }

  ngOnInit(): void {}

}
