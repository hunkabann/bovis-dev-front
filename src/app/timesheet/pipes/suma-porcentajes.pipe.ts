import { Pipe, PipeTransform } from '@angular/core';
import { Proyecto,Timesheet } from '../models/timesheet.model';

@Pipe({
  name: 'sumaPorcentajes'
})
export class SumaPorcentajesPipe implements PipeTransform {

  transform(timesheet: Timesheet, ...args: unknown[]): unknown {
    let total = 0
    timesheet.proyectos.forEach(proyecto => {
      total += proyecto.tDedicacion
    })

    timesheet.otros.forEach(proyecto => {
      total += proyecto.tDedicacion
    })

    return `${Math.round(total)}%`;
  }

  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

}
