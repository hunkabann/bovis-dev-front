import { Pipe, PipeTransform } from '@angular/core';
import { GastosIngresosTotales } from '../models/pcs.model';
import { Mes } from 'src/models/general.model';
import {formatCurrency, getCurrencySymbol} from '@angular/common';

@Pipe({
  name: 'porcentajeMesFactura'
})
export class PorcentajeMesFacturaPipe implements PipeTransform {

  transform(value: GastosIngresosTotales[], ...args: unknown[]): unknown {
    const [mesRegistro] = args as Array<Mes>
    
    const mes = value.find(info => info.mes+1 == mesRegistro.mes)

    console.log(' mes ------>> ' + mes.mes)

    const anio  = value.find(info =>info.anio == mesRegistro.anio)

    console.log(' anio ------>> ' + anio.anio)

   

      if(mes && anio && mes.totalPorcentaje > 0) {

        console.log(' mes.porcentaje ------>> ' + mes.totalPorcentaje)
        return this.formateaValor(formatCurrency( mes.totalPorcentaje, 'en-US', getCurrencySymbol('USD', 'wide')))
      }

   

    

    return '-';
  }

  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

}
