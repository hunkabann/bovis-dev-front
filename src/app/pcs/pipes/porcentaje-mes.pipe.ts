import { Pipe, PipeTransform } from '@angular/core';
import { Fecha } from '../models/pcs.model';
import { Mes } from 'src/models/general.model';
import { formatCurrency, getCurrencySymbol } from '@angular/common';

@Pipe({
  name: 'porcentajeMes'
})
export class PorcentajeMesPipe implements PipeTransform {

  transform(value: Fecha[], ...args: unknown[]): unknown {
    const [mesRegistro, codigo, costoMensual] = args as [Mes, string, number?];
    const fecha = value.find(fecha => fecha.mes == mesRegistro.mes && fecha.anio == mesRegistro.anio);

    if (fecha && fecha.porcentaje > 0) {
      if(codigo == '02.0000' && costoMensual) {  
        if(costoMensual) {
          return this.formateaValor(formatCurrency((costoMensual * fecha.porcentaje) / 100, 'en-US', getCurrencySymbol('USD', 'wide')));
        } else {
          return this.formateaValor(formatCurrency(0, 'en-US', getCurrencySymbol('USD', 'wide')));
        }   
      }
      
      return this.formateaValor(formatCurrency(fecha.porcentaje, 'en-US', getCurrencySymbol('USD', 'wide')))

      const porcentaje = Number(fecha.porcentaje);
      return isNaN(porcentaje) ? 0 : porcentaje;
    }

    return this.formateaValor(formatCurrency(0, 'en-US', getCurrencySymbol('USD', 'wide')))
    return 0;
  }

  formateaValor(valor) {
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }
}
