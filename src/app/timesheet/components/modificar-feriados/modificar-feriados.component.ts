import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CALENDAR, errorsArray } from 'src/utils/constants';
import { TimesheetService } from '../../services/timesheet.service';
import { finalize } from 'rxjs';
import { eachDayOfInterval, endOfMonth, isSaturday, isSunday } from 'date-fns';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-modificar-feriados',
  templateUrl: './modificar-feriados.component.html',
  styleUrls: ['./modificar-feriados.component.css']
})
export class ModificarFeriadosComponent implements OnInit {

  fb                = inject(FormBuilder)
  public config     = inject(DynamicDialogConfig)
  public ref        = inject(DynamicDialogRef)
  primeConfig       = inject(PrimeNGConfig)
  sharedService     = inject(SharedService)
  timesheetService  = inject(TimesheetService)

  form = this.fb.group({
    id_timesheet:       [null],
    dias:               [0],
    sabados_feriados:   [0],
    dias_seleccionados: [null, Validators.required]
  })

  fechasDeshabilitadas: Date[];
  fechaMinima: Date
  fechaMaxima: Date

  constructor() {
    if(this.config.data) {
      this.form.patchValue({
        id_timesheet: this.config.data.id,
        dias:         this.config.data.feriados
      })
    } else {
      this.closeDialog()
    }
  }

  ngOnInit(): void {
    this.getConfigCalendar()

    this.fechaMinima = new Date(`${this.config.data.anio}-${this.config.data.mes}-01 00:00:00`);
    this.fechaMaxima = endOfMonth(this.fechaMinima)
    
    const diasEnMes = eachDayOfInterval({ start: this.fechaMinima, end: this.fechaMaxima });
  
    this.fechasDeshabilitadas = diasEnMes.filter(dia => isSunday(dia));
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

  guardar() {

    this.sharedService.cambiarEstado(true)

    const diasSeleccionados = this.form.value.dias_seleccionados as Date[]
    const sabadosFeriados = diasSeleccionados.filter(dia => isSaturday(dia))
    const diasFeriados = diasSeleccionados.filter(dia => !isSaturday(dia))

    this.form.patchValue({
      dias:             diasFeriados.length, 
      sabados_feriados: sabadosFeriados.length
    })
    
    this.timesheetService.modificarFeriados(this.form.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => this.ref.close({exito: true, dias: diasFeriados.length, sabados: sabadosFeriados.length}),
        error: (err) => this.ref.close({exito: false})
      })
  }
  
  closeDialog() {
    this.ref.close({exito: false})
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
