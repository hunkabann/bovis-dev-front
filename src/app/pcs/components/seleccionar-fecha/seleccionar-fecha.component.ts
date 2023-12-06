import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { PrimeNGConfig } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { CALENDAR } from 'src/utils/constants';

@Component({
  selector: 'app-seleccionar-fecha',
  templateUrl: './seleccionar-fecha.component.html',
  styleUrls: ['./seleccionar-fecha.component.css']
})
export class SeleccionarFechaComponent implements OnInit {

  fechas: any

  constructor(
    private config: PrimeNGConfig,
    public ref: DynamicDialogRef
  ) { }

  ngOnInit(): void {
    this.getConfigCalendar()
  }

  seleccionarFecha() {
    this.ref.close([ this.fechas[0] && format(this.fechas[0], 'MM-yy'), this.fechas[1] && format(this.fechas[1], 'MM-yy') ])
  }

  getConfigCalendar() {
    this.config.setTranslation({
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
}
