import { Pipe, PipeTransform } from '@angular/core';
import { GastosIngresosTotales } from '../models/pcs.model';
import { Mes } from 'src/models/general.model';
import { formatCurrency, getCurrencySymbol } from '@angular/common';

@Pipe({
  name: 'porcentajeMesCobranza'
})
export class PorcentajeMesCobranzaPipe implements PipeTransform {

  transform(value: GastosIngresosTotales[], ...args: unknown[]): unknown {
    const [mesRegistro] = args as Array<Mes>
    const fecha = value.find(fecha => fecha.mes == mesRegistro.mes && fecha.anio == mesRegistro.anio);

    if (fecha && fecha.totalPorcentaje > 0) {
      // console.log(' mes.porcentaje ------>> ' + mes.totalPorcentaje)
      return this.formateaValor(formatCurrency(fecha.totalPorcentaje, 'en-US', getCurrencySymbol('USD', 'wide')))
    }

    return '-';
  }

  formateaValor(valor) {
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

}
