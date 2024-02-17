import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { FacturacionService } from '../../services/facturacion.service';
import { Busqueda, NotaCreditoSF } from '../../Models/FacturacionModels';
import { TITLES, errorsArray } from 'src/utils/constants';
import { Opcion } from 'src/models/general.model';
import { finalize } from 'rxjs';

interface Props {
  nota: NotaCreditoSF
}

@Component({
  selector: 'app-vincular-nota-credito',
  templateUrl: './vincular-nota-credito.component.html',
  styleUrls: ['./vincular-nota-credito.component.css'],
  providers: [MessageService]
})
export class VincularNotaCreditoComponent implements OnInit {

  ref                 = inject(DynamicDialogRef)
  config              = inject(DynamicDialogConfig)
  primeConfig         = inject(PrimeNGConfig)
  messageService      = inject(MessageService)
  sharedService       = inject(SharedService)
  facturacionService  = inject(FacturacionService)
  fb                  = inject(FormBuilder)
  
  facturas: Opcion[] = []
  busqueda: Busqueda

  form = this.fb.group({
    id_factura:         [null, Validators.required],
    uuid_nota_credito:  [''],
    chnota_credito:  ['']
  })

  constructor() { }

  ngOnInit(): void {

    const data = this.config.data as Props
    if(data) {
      if(data.nota) {
        this.form.patchValue({
          uuid_nota_credito: data.nota.chuuid_nota_credito
        })
         this.form.patchValue({
            chnota_credito: data.nota.chnota_credito
            
          })
        
        this.busqueda = {
          idProyecto: null,
          idCliente:  null,
          idEmpresa:  null,
          fechaIni:   null,
          fechaFin:   null,
          noFactura:  null
        }

        this.sharedService.cambiarEstado(true)
        this.facturacionService.getBusqueda(this.busqueda)
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: ({data}) => {
              this.facturas = data.map(factura => ({code: factura.id, name: `${factura.noFactura} - ${factura.clienteRFC}`}))
            },
            error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
          })
      }
    }
  }

  guardar() {

    this.sharedService.cambiarEstado(true)
    
    this.facturacionService.vincularNotaCredito(this.form.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.ref.close({ok: true})
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  esInvalido(campo: string): boolean {
    return this.form.get(campo).invalid && 
            (this.form.get(campo).dirty || this.form.get(campo).touched)
  }

  obtenerMensajeError(campo: string): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if(this.form.get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }

}
