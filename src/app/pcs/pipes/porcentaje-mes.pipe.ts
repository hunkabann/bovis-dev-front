import { Pipe, PipeTransform } from '@angular/core';
import { Fecha } from '../models/pcs.model';
import { Mes } from 'src/models/general.model';
import {formatCurrency, getCurrencySymbol} from '@angular/common';

@Pipe({
  name: 'porcentajeMes'
})
export class PorcentajeMesPipe implements PipeTransform {

  transform(value: Fecha[], ...args: unknown[]): unknown {
    const [mesRegistro] = args as Array<Mes>
    
    const mes = value.find(info => info.mes == mesRegistro.mes)

    //console.log(' mes ------>> ' + mes.mes)

    const anio  = value.find(info =>info.anio == mesRegistro.anio)

   // console.log(' anio ------>> ' + anio.anio)

   

      if(mes && anio && mes.porcentaje > 0) {

        //console.log(' mes.porcentaje ------>> ' + mes.porcentaje)
        //return this.formateaValor(formatCurrency(mes.porcentaje, 'en-US', getCurrencySymbol('USD', 'wide')))
        return mes.porcentaje
      }

    return '-';
  }
  
  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }


}
