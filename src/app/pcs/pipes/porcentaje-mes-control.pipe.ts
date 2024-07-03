import { Pipe, PipeTransform } from '@angular/core';
import { SumaFecha } from '../models/pcs.model';
import { Mes } from 'src/models/general.model';

@Pipe({
  name: 'porcentajeMesControl'
})
export class porcentajeMesControlPipe implements PipeTransform {

  transform(value: SumaFecha[], ...args: unknown[]): unknown {
    const [mesRegistro] = args as Array<Mes>
    
    const mes = value.find(info => info.mes == mesRegistro.mes)

    //console.log(' mes ------>> ' + mes.mes)

    const anio  = value.find(info =>info.anio == mesRegistro.anio)

   // console.log(' anio ------>> ' + anio.anio)

   

      if(mes && anio && mes.sumaPorcentaje > 0) {

        //console.log(' mes.porcentaje ------>> ' + mes.porcentaje)
        return mes.sumaPorcentaje
      }

   

    

    return '-';
  }

}
