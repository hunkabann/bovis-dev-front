import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PcsService } from '../../services/pcs.service';
import { TITLES, errorsArray } from 'src/utils/constants';
import { obtenerMeses } from 'src/helpers/helpers';
import { Fecha, Rubro } from '../../models/pcs.model';
import { Mes } from 'src/models/general.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-rubro',
  templateUrl: './modificar-rubro.component.html',
  styleUrls: ['./modificar-rubro.component.css'],
  providers: [MessageService]
})
export class ModificarRubroComponent implements OnInit {

  ref               = inject(DynamicDialogRef)
  config            = inject(DynamicDialogConfig)
  primeConfig       = inject(PrimeNGConfig)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  pcsService        = inject(PcsService)
  fb                = inject(FormBuilder)


  form = this.fb.group({
    idRubro:          [null],   
    unidad:           ['', Validators.required],
    cantidad:         ['', Validators.required],
    reembolsable:     [false],
    aplicaTodosMeses: [false],
    fechas:           this.fb.array([])
  })

  constructor() { }
  
  get fechas() {
    return this.form.get('fechas') as FormArray
  }

  ngOnInit(): void {

    const rubro = this.config.data.rubro as Rubro

    if(this.config.data) {
      this.form.patchValue({
        idRubro:          rubro.idRubro,
        unidad:           rubro.unidad.toString(),
        cantidad:         rubro.cantidad.toString(),
        reembolsable:     rubro.reembolsable,
        aplicaTodosMeses: rubro.aplicaTodosMeses
      })
    }

    const fechaInicio     = new Date(this.config.data.fechaInicio)
    const fechaFin        = new Date(this.config.data.fechaFin)

    obtenerMeses(fechaInicio, fechaFin).forEach(mesRegistro => {

      this.fechas.push(this.fb.group({
        mes:        [mesRegistro.mes],
        anio:       [mesRegistro.anio],
        desc:       [mesRegistro.desc],
        porcentaje: [this.form.value.idRubro ? this.obtenerPorcentaje(rubro.fechas, mesRegistro) : 0]
      }))
    })
    
    if(rubro.aplicaTodosMeses) {
      this.cambiarValoresFechas()
    }
  }

  guardar() {
    
    this.sharedService.cambiarEstado(true)

    this.pcsService.actualizarRubro(this.form.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.ref.close({rubro: this.form.value})
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  cambiarValoresFechas() {
    this.fechas.controls.forEach((fecha, index) => {
      this.fechas.at(index).patchValue({
        porcentaje: this.form.value.aplicaTodosMeses ? this.form.value.cantidad : 0
      })
    })
  }

  obtenerPorcentaje(fechas: Fecha[], mesRegistro: Mes) {
    const mes = fechas.find(info => info.mes == mesRegistro.mes)

    if(mes && mes.porcentaje > 0) {
      return +mes.porcentaje
    }

    return 0
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
  
  closeDialog() {
    this.ref.close(null)
  }

}
