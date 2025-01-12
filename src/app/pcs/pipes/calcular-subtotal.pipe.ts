import { Pipe, PipeTransform } from '@angular/core';
import { Fecha } from '../models/pcs.model';
import { formatCurrency, getCurrencySymbol } from '@angular/common';

@Pipe({
  name: 'calcularSubtotal'
})
export class CalcularSubtotalPipe implements PipeTransform {

  transform(value: Fecha[], ...args: unknown[]): unknown {
    // console.log(Object.values(value));

    let subtotal = 0

    value.forEach(fecha => {
      subtotal += +fecha.porcentaje
    })

    return this.formateaValor(formatCurrency(subtotal, 'en-US', getCurrencySymbol('USD', 'wide')))
  }


  formateaValor(valor) {
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }
}


