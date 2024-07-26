import { Pipe, PipeTransform } from '@angular/core';
import { GastosIngresosTotales } from '../models/pcs.model';
import { Mes } from 'src/models/general.model';

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
        return mes.totalPorcentaje
      }

   

    

    return '-';
  }

}