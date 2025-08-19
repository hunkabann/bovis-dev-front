import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CALENDAR, TITLES, errorsArray } from 'src/utils/constants';
import { PcsService } from '../../services/pcs.service';
import { format, startOfMonth } from 'date-fns';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-etapa',
  templateUrl: './modificar-etapa.component.html',
  styleUrls: ['./modificar-etapa.component.css']
})
export class ModificarEtapaComponent implements OnInit {

  ref = inject(DynamicDialogRef)
  config = inject(DynamicDialogConfig)
  primeConfig = inject(PrimeNGConfig)
  messageService = inject(MessageService)
  sharedService = inject(SharedService)
  pcsService = inject(PcsService)
  fb = inject(FormBuilder)

  fechaMinima: Date
  fechaMaxima: Date

  fechaMaximaDeshabilitada: boolean = false;

  form = this.fb.group({
    id_etapa: [null],
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
          id_etapa: data.etapa.idFase,
          num_proyecto: data.numProyecto,
          fecha_inicio: new Date(data.etapa.fechaIni) as any,
          fecha_fin: new Date(data.etapa.fechaFin) as any,
          orden: data.etapa.orden,
          nombre_fase: data.etapa.fase
        })
      }
      if (data.fechaInicio && data.fechaFin) {
        this.fechaMinima = startOfMonth(new Date())
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

    this.pcsService.modificarEtapa(body)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({ data }) => {
          this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'La etapa ha sido guardada.' })
          this.ref.close({ etapa: {
            ...this.form.value,
            idFase: this.form.value.id_etapa,
            fase: this.form.value.nombre_fase,
            fechaIni: this.form.value.fecha_inicio,
            fechaFin: this.form.value.fecha_fin,
            orden: this.form.value.orden
          } })
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
