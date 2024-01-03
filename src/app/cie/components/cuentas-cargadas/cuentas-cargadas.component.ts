import { Component, OnInit, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CargaCuenta } from '../../models/cie.models';

@Component({
  selector: 'app-cuentas-cargadas',
  templateUrl: './cuentas-cargadas.component.html',
  styleUrls: ['./cuentas-cargadas.component.css']
})
export class CuentasCargadasComponent implements OnInit {

  ref                 = inject(DynamicDialogRef)
  config              = inject(DynamicDialogConfig)

  cuentasCargadas: CargaCuenta[] = []

  constructor() { }

  ngOnInit(): void {
    if(this.config.data) {
      this.cuentasCargadas = this.config.data.cuentas
    }
  }

}
