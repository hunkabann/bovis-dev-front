import { Pipe, PipeTransform } from '@angular/core';
import { Fecha } from '../models/pcs.model';
import { formatCurrency, getCurrencySymbol } from '@angular/common';

@Pipe({
  name: 'calcularSubtotal'
})
export class CalcularSubtotalPipe implements PipeTransform {

  transform(value: Fecha[], ...args: unknown[]): unknown {
    const [codigo, costoMensual] = args as [string, number?];

    let subtotal = 0

    value.forEach(fecha => {
      if(codigo == '02.0000' && costoMensual) {  
        if(costoMensual) {
          subtotal += (costoMensual * fecha.porcentaje) / 100;
        } else {
          subtotal += 0;
        }   
      } else {
        subtotal += +fecha.porcentaje
      }
    })

    return this.formateaValor(formatCurrency(subtotal, 'en-US', getCurrencySymbol('USD', 'wide')))
  }


  formateaValor(valor) {
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }
}


