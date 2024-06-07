import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CALENDAR, TITLES, errorsArray } from 'src/utils/constants';
import { PcsService } from '../../services/pcs.service';
import { format, startOfMonth } from 'date-fns';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-crear-etapa',
  templateUrl: './crear-etapa.component.html',
  styleUrls: ['./crear-etapa.component.css'],
  providers: [MessageService]
})
export class CrearEtapaComponent implements OnInit {

  ref = inject(DynamicDialogRef)
  config = inject(DynamicDialogConfig)
  primeConfig = inject(PrimeNGConfig)
  messageService = inject(MessageService)
  sharedService = inject(SharedService)
  pcsService = inject(PcsService)
  fb = inject(FormBuilder)

  fechaMinima: Date
  fechaMaxima: Date

  form = this.fb.group({
    num_proyecto: [null],
    orden: [1],
    nombre_fase: ['', Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required]
  })

  constructor() { }

  ngOnInit(): void {

    this.getConfigCalendar();

    const data = this.config.data
    if (data) {
      if (data.numProyecto) {
        this.form.patchValue({
          num_proyecto: data.numProyecto
        })
      }
      if (data.fechaInicio && data.fechaFin) {
        this.fechaMinima = startOfMonth(data.fechaInicio)
        this.fechaMaxima = startOfMonth(data.fechaFin)
      }
    }
  }

  guardar() {
    if (!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    const body = {
      ...this.form.value,
      fecha_inicio: this.form.value.fecha_inicio ? format(new Date(this.form.value.fecha_inicio), 'Y-MM-dd') : null,
      fecha_fin: this.form.value.fecha_fin ? format(new Date(this.form.value.fecha_fin), 'Y-MM-dd') : null
    }

    this.pcsService.agregarEtapa(body)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({ data }) => {
          this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'La etapa ha sido agregada.' })
          this.ref.close({ etapa: data })
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  getConfigCalendar() {
    this.primeConfig.setTranslation({
      firstDayOfWeek: 1,
      dayNames: CALENDAR.dayNames,
      dayNamesShort: CALENDAR.dayNamesShort,
      dayNamesMin: CALENDAR.dayNamesMin,
      monthNames: CALENDAR.monthNames,
      monthNamesShort: CALENDAR.monthNamesShort,
      today: 'Hoy',
      clear: 'Limpiar',
    })
  }

  esInvalido(campo: string): boolean {
    return this.form.get(campo).invalid &&
      (this.form.get(campo).dirty || this.form.get(campo).touched)
  }

  obtenerMensajeError(campo: string): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if (this.form.get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }

}
