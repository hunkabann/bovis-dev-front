import { Pipe, PipeTransform } from '@angular/core';
import { Proyecto } from '../models/timesheet.model';

@Pipe({
  name: 'sumaPorcentajes'
})
export class SumaPorcentajesPipe implements PipeTransform {

  transform(proyectos: Proyecto[], ...args: unknown[]): unknown {
    let total = 0
    proyectos.forEach(proyecto => {
      total += proyecto.tDedicacion
    })
    return `${total}%`;
  }

}
