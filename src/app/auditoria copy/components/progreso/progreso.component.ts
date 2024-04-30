import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progreso',
  templateUrl: './progreso.component.html',
  styleUrls: ['./progreso.component.css']
})
export class ProgresoComponent implements OnInit {

  @Input() totalDocumentos: number = 0;
  @Input() totalDocumentosValidados: number = 0;

  styleBarra: string

  constructor() { }

  get total() {

    if(this.totalDocumentos == 0 && this.totalDocumentosValidados == 0) {
      return 0
    }

    if(this.totalDocumentos == this.totalDocumentosValidados) {
      this.styleBarra = "customProgressCompleto"
    }else{
      this.styleBarra = "customProgress"
    }
    
    return Math.round((this.totalDocumentosValidados / this.totalDocumentos) * 100)
  }

  ngOnInit(): void {}

}
