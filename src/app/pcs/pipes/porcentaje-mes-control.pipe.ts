import { Pipe, PipeTransform } from '@angular/core';
import { SumaFechas, SumaFecha } from '../models/pcs.model';
import { Mes } from 'src/models/general.model';
import { formatCurrency, getCurrencySymbol } from '@angular/common';

@Pipe({
  name: 'porcentajeMesControl'
})
export class porcentajeMesControlPipe implements PipeTransform {

  transform(value: SumaFechas[], ...args: unknown[]): unknown {
    const [mesRegistro] = args as Array<Mes>
    const fecha = value.find(fecha => fecha.mes == mesRegistro.mes && fecha.anio == mesRegistro.anio);

    if (fecha && fecha.sumaPorcentaje > 0) {
      //   console.log(' mes.porcentaje ------>> ' + mes.sumaPorcentaje)
      return this.formateaValor(formatCurrency(fecha.sumaPorcentaje, 'en-US', getCurrencySymbol('USD', 'wide')))
    }

    return '-';
  }

  formateaValor(valor) {
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

}
