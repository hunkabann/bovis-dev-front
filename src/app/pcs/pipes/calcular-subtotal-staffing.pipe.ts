import { Pipe, PipeTransform } from '@angular/core';
import { Fecha } from '../models/pcs.model';

@Pipe({
  name: 'calcularSubtotalStaffing'
})
export class calcularSubtotalStaffingPipe implements PipeTransform {

  transform(value: Fecha[], ...args: unknown[]): unknown {
    
    let subtotal = 0

    value.forEach(fecha => {
      subtotal += +fecha.porcentaje
    })

    return subtotal/100
  }

}
