import { Pipe, PipeTransform } from '@angular/core';
import { Fecha } from '../models/pcs.model';
import { Mes } from 'src/models/general.model';
import { formatCurrency, getCurrencySymbol } from '@angular/common';

@Pipe({
  name: 'porcentajeMes'
})
export class PorcentajeMesPipe implements PipeTransform {

  transform(value: Fecha[], ...args: unknown[]): unknown {
    const [mesRegistro] = args as Array<Mes>;
    const fecha = value.find(fecha => fecha.mes == mesRegistro.mes && fecha.anio == mesRegistro.anio);

    if (fecha && fecha.porcentaje > 0) {
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
