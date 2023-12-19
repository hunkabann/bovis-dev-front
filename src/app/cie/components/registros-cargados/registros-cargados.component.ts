import { Component, OnInit, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-registros-cargados',
  templateUrl: './registros-cargados.component.html',
  styleUrls: ['./registros-cargados.component.css']
})
export class RegistrosCargadosComponent implements OnInit {

  ref       = inject(DynamicDialogRef)
  config    = inject(DynamicDialogConfig)

  constructor() { }

  cantidad: number

  ngOnInit(): void {
    
    if(this.config.data) {
      this.cantidad = this.config.data.cantidad
    }
  }

}
