import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { ClientesService } from 'src/app/catalogos/services/clientes.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TITLES, errorsArray } from 'src/utils/constants';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  providers: [MessageService]
})
export class RegistroComponent implements OnInit {
  
  ref               = inject(DynamicDialogRef)
  config            = inject(DynamicDialogConfig)
  clientesService   = inject(ClientesService)
  primeConfig       = inject(PrimeNGConfig)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  fb                = inject(FormBuilder)

  esActualizacion = false

  form = this.fb.group({
    id_cliente:   [null],
    cliente:      ['', Validators.required],
    rfc:          ['', Validators.required],
    activo:       [true]
  })

  constructor() { }

  ngOnInit(): void {
    if(this.config.data.cliente) {
      
      this.esActualizacion = true
      
      const cliente = this.config.data.cliente
      this.form.patchValue({
        id_cliente: cliente.idCliente,
        cliente:    cliente.cliente,
        rfc:        cliente.rfc
      })
    }
  }

  guardar() {
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    this.clientesService.guardarCliente(this.form.value, this.esActualizacion)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.ref.close({exito: true, clienteActualizado: this.form.value})
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
