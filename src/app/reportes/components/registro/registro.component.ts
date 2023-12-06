import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ReportesService } from '../../services/reportes.service';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { SUBJECTS, TITLES, errorsArray } from 'src/utils/constants';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  providers: [MessageService]
})
export class RegistroComponent implements OnInit {

  activatedRoute  = inject(ActivatedRoute)
  fb              = inject(FormBuilder)
  messageService  = inject(MessageService)
  reportesService = inject(ReportesService)
  router          = inject(Router)
  sharedService   = inject(SharedService)

  form = this.fb.group({
    id_reporte:             [],
    nombre:                 ['', Validators.required],
    descripcion:            ['', Validators.required],
    query:                  ['', Validators.required],
    id_empleado_crea:       [1],
    id_empleado_actualiza:  [1]
  })

  esActualizacion: boolean = false

  constructor() { }

  ngOnInit(): void {
    this.activatedRoute.params
      .subscribe(({id}) => {
        if(id) {
          this.cargarRegistro(id)
        }
      })
  }

  cargarRegistro(id: number) {

    this.sharedService.cambiarEstado(true)

    this.esActualizacion = true

    this.reportesService.getReporte(id)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          if(data.length > 0) {
            const [reporte] = data
            this.form.patchValue({
              id_reporte:   reporte.idReporte,
              nombre:       reporte.nombre,
              descripcion:  reporte.descripcion,
              query:        reporte.query
            })
          }
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })
  }

  guardar() {

    this.sharedService.cambiarEstado(true)
    
    this.reportesService.guardarReporte(this.form.value, this.esActualizacion)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.router.navigate(['/reportes/lista'], {queryParams: {success: true}});
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
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
