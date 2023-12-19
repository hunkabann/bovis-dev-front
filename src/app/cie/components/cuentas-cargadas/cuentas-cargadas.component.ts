import { Component, OnInit, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-cuentas-cargadas',
  templateUrl: './cuentas-cargadas.component.html',
  styleUrls: ['./cuentas-cargadas.component.css']
})
export class CuentasCargadasComponent implements OnInit {

  ref                 = inject(DynamicDialogRef)
  config              = inject(DynamicDialogConfig)

  cuentasCargadas: {
    cuenta:   string,
    concepto: string
  }[] = []

  constructor() { }

  ngOnInit(): void {
    if(this.config.data) {
      this.cuentasCargadas = this.config.data.cuentas
    }
  }

}
