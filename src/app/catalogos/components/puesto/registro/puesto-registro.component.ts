import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { PuestoService } from 'src/app/catalogos/services/puesto.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TITLES, errorsArray } from 'src/utils/constants';

@Component({
  selector: 'app-puesto-registro',
  templateUrl: './puesto-registro.component.html',
  styleUrls: ['./puesto-registro.component.css'],
  providers: [MessageService]
})
export class PuestoRegistroComponent implements OnInit {
  
  ref               = inject(DynamicDialogRef)
  config            = inject(DynamicDialogConfig)
  puestoService   = inject(PuestoService)
  primeConfig       = inject(PrimeNGConfig)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  fb                = inject(FormBuilder)

  esActualizacion = false

  form = this.fb.group({
    nukid_puesto:   [null],
    nukidnivel:      ['', Validators.required],
    chpuesto:          ['', Validators.required],
    nusalario_min:          ['', Validators.required],
    nusalario_max:          ['', Validators.required],
    nusalario_prom:          ['', Validators.required],
    boactivo:       [true]
  })

  constructor() { }

  ngOnInit(): void {
    if(this.config.data.cliente) {
      
      this.esActualizacion = true
      
      const cliente = this.config.data.cliente
      this.form.patchValue({
        nukid_puesto: cliente.nukid_puesto,
        nukidnivel: cliente.nukidnivel,
        chpuesto:    cliente.chpuesto,
        nusalario_min:    cliente.nusalario_min,
        nusalario_max:    cliente.nusalario_max,
        nusalario_prom:    cliente.nusalario_prom
      })
    }
  }

  guardar() {
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    this.puestoService.guardarPuesto(this.form.value, this.esActualizacion)
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
