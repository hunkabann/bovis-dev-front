import { Component, OnInit, inject } from '@angular/core';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PcsService } from '../../services/pcs.service';
import { FormArray, FormBuilder } from '@angular/forms';
import { Empleado, Etapa, Fecha } from '../../models/pcs.model';
import { addMonths, differenceInCalendarMonths, differenceInMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';
import { finalize } from 'rxjs';
import { Mes, Opcion } from 'src/models/general.model';
import { Empleado as EmpleadoTS } from 'src/app/timesheet/models/timesheet.model';
import { TITLES, errorsArray } from 'src/utils/constants';
import { obtenerMeses } from 'src/helpers/helpers';

interface EtapaEmpleado {
  etapa:        Etapa,
  empleado:     Empleado,
  num_proyecto: number
}

@Component({
  selector: 'app-modificar-empleado',
  templateUrl: './modificar-empleado.component.html',
  styleUrls: ['./modificar-empleado.component.css'],
  providers: [MessageService]
})
export class ModificarEmpleadoComponent implements OnInit {

  ref               = inject(DynamicDialogRef)
  config            = inject(DynamicDialogConfig)
  primeConfig       = inject(PrimeNGConfig)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  pcsService        = inject(PcsService)
  fb                = inject(FormBuilder)
  timesheetService  = inject(TimesheetService)

  fechaMinima:        Date
  fechaMaxima:        Date
  empleadosOriginal:  EmpleadoTS[] = []
  empleados:          Opcion[] = []
  empleado:           Empleado = null

  form = this.fb.group({
    id_fase:      [null],
    num_empleado: [null],
    num_proyecto: [null],
    fechas:       this.fb.array([])
  })

  constructor() { }
  
  get fechas() {
    return this.form.get('fechas') as FormArray
  }

  ngOnInit(): void {

    const data = this.config.data as EtapaEmpleado
    if(data) {
      this.form.patchValue({
        id_fase:      data.etapa.idFase,
        num_empleado: data.empleado?.numempleadoRrHh || null,
        num_proyecto: data.num_proyecto || null
      })

      if(!data.empleado) {
        this.cargarEmpleados()
      } else {
        this.empleado = data.empleado
      }

      const fechaInicio     = new Date(data.etapa.fechaIni)
      const fechaFin        = new Date(data.etapa.fechaFin)

      obtenerMeses(fechaInicio, fechaFin).forEach(mesRegistro => {

        this.fechas.push(this.fb.group({
          mes:        [mesRegistro.mes],
          anio:       [mesRegistro.anio],
          desc:       [mesRegistro.desc],
          porcentaje: [this.empleado ? this.obtenerPorcentaje(data.empleado.fechas, mesRegistro) : 0]
        }))
      })
    }
  }

  guardar() {
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    this.pcsService.modificarEmpleado(this.form.value, !!this.empleado)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          if(!this.empleado) {
            const empleadoEncontrado = this.empleadosOriginal.find(empleadoRegistro => empleadoRegistro.nunum_empleado_rr_hh == this.form.value.num_empleado)
            this.empleado = {
              id:               null,
              empleado:         empleadoEncontrado.nombre_persona,
              numempleadoRrHh:  empleadoEncontrado.nunum_empleado_rr_hh.toString(),
              idFase:           this.form.value.id_fase,
              fechas:           []
            }
          }
          const empleadoRespuesta: Empleado = {
            ...this.empleado,
            fechas: this.form.value.fechas as Fecha[]
          } 
          this.messageService.add({severity: 'success', summary: TITLES.success, detail: 'La etapa ha sido agregada.'})
          this.ref.close({empleado: empleadoRespuesta})
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  cargarEmpleados() {
        
    this.sharedService.cambiarEstado(true)

    this.timesheetService.getEmpleados()
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: ({data}) => {
        this.empleadosOriginal = data
        this.empleados = this.empleadosOriginal.map(empleado => ({code: empleado.nunum_empleado_rr_hh.toString(), name: empleado.nombre_persona}))
      },
      error: (err) => this.closeDialog()
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
