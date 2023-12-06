import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SUBJECTS, TITLES, errorsArray } from 'src/utils/constants';
import { ContratosService } from '../services/contratos.service';
import { finalize } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-registro-plantilla',
  templateUrl: './registro-plantilla.component.html',
  styleUrls: ['./registro-plantilla.component.css'],
  providers: [MessageService]
})
export class RegistroPlantillaComponent implements OnInit {

  fb                = inject(FormBuilder)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  contratosService  = inject(ContratosService)
  activatedRoute    = inject(ActivatedRoute)
  router            = inject(Router)

  esActualizacion: boolean = false

  form = this.fb.group({
    id_contrato_template: [null],
    titulo:               ['', Validators.required],
    template:             ['', Validators.required]
  })
  
  constructor() { }

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)

    this.activatedRoute.params
      .subscribe(({id}) => {
        if(id) {
          this.setearDatos(id)
        } else {
          this.sharedService.cambiarEstado(false)
        }
      })
  }

  guardar() {
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    this.contratosService.guardarPlantilla(this.form.value, this.esActualizacion)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.form.reset()
          this.router.navigate(['/contratos/plantillas'], {queryParams: {success: true}});
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })
  }

  setearDatos(id: number) {
    this.esActualizacion = true

    this.contratosService.getPlantilla(id)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.form.patchValue({
            id_contrato_template: id,
            titulo: data.titulo,
            template: data.template
          })
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
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

  limpiar() {
    this.form.reset()
  }

}
