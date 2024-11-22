import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { PuestoService } from 'src/app/catalogos/services/puesto.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TITLES, errorsArray } from 'src/utils/constants';
import { InputNumberModule } from 'primeng/inputnumber';

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
    nukidnivel:      [0, Validators.required],
    chcvenoi:          [''],
    chpuesto:          ['', Validators.required],
    nusalario_min:          [0, Validators.required],
    nusalario_max:          [0, Validators.required],
    nusalario_prom:          [0, Validators.required],
    boactivo:       [true]
  })

  constructor() { }

  ngOnInit(): void {

   // this.form.controls['nusalario_prom'].disable();

    if(this.config.data.cliente) {
      
      this.esActualizacion = true
      
      const cliente = this.config.data.cliente
      this.form.patchValue({
        nukid_puesto: cliente.nukid_puesto,
        nukidnivel: cliente.nukidnivel,
        chcvenoi: cliente.chcvenoi,
        chpuesto:    cliente.chpuesto,
        nusalario_min:    cliente.nusalario_min,
        nusalario_max:    cliente.nusalario_max,
        nusalario_prom:    ((cliente.nusalario_min+cliente.nusalario_max)/2)
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

  calcularPromedioMax(event: any,  seccion: string) {
    const valor = +event
   
    console.log('Promedio Max: '+ (valor + this.form.value.nusalario_min) / 2)
      this.form.patchValue({
        nusalario_prom:  (valor + this.form.value.nusalario_min) / 2
        //costo:      this.formateaValor( (valor / (this.form.value.dias - this.sumaOtros)) * 100 ),
       // diasCalc: valor,
        //dedicacionCalc: this.formateaValor((valor / this.form.value.dias) * 100) 
      })
      
    
  }

  calcularPromedioMin(event: any,  seccion: string) {
    const valor = +event
    console.log('Promedio Min: '+ (valor + this.form.value.nusalario_max) / 2)
      this.form.patchValue({
        nusalario_prom:  (valor + this.form.value.nusalario_max) / 2
        //costo:      this.formateaValor( (valor / (this.form.value.dias - this.sumaOtros)) * 100 ),
       // diasCalc: valor,
        //dedicacionCalc: this.formateaValor((valor / this.form.value.dias) * 100) 
      })
      
    
  }

}
