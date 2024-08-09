import { Pipe, PipeTransform } from '@angular/core';
import { SumaFechas,SumaFecha } from '../models/pcs.model';
import { Mes } from 'src/models/general.model';
import {formatCurrency, getCurrencySymbol} from '@angular/common';

@Pipe({
  name: 'porcentajeMesControl'
})
export class porcentajeMesControlPipe implements PipeTransform {

  transform(value: SumaFechas[], ...args: unknown[]): unknown {
    const [mesRegistro] = args as Array<Mes>

    
    
    console.log(' registro mes ------>> ' + mesRegistro.mes)
    console.log(' registro mes ------>> ' + mesRegistro.anio)

    console.log(' value[0].mes ------>> ' + value[0].sumaPorcentaje);

    
    
    const mes = value.find(info => info.mes == mesRegistro.mes)

    //console.log(' mes ------>> ' + mes.mes)

    const anio  = value.find(info =>info.anio == mesRegistro.anio)

   //console.log(' anio ------>> ' + anio.anio)

   

      if(mes && anio && mes.sumaPorcentaje > 0) {

     //   console.log(' mes.porcentaje ------>> ' + mes.sumaPorcentaje)
     return this.formateaValor(formatCurrency( mes.sumaPorcentaje, 'en-US', getCurrencySymbol('USD', 'wide')))
      }

   

    

    return '-';
  }

  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

}
