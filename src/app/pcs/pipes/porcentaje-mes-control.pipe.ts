import { Pipe, PipeTransform } from '@angular/core';
import { SumaFechas } from '../models/pcs.model';
import { Mes } from 'src/models/general.model';

@Pipe({
  name: 'porcentajeMesControl'
})
export class porcentajeMesControlPipe implements PipeTransform {

  transform(value: SumaFechas[], ...args: unknown[]): unknown {
    const [mesRegistro] = args as Array<Mes>

    
    
    //console.log(' registro mes ------>> ' + mesRegistro.mes)
    //console.log(' registro mes ------>> ' + mesRegistro.anio)

    //console.log(' value[0].mes ------>> ' + value[0]);

    
    
    const mes = value.find(info => info.mes == mesRegistro.mes)

    //console.log(' mes ------>> ' + mes.mes)

    const anio  = value.find(info =>info.anio == mesRegistro.anio)

   //console.log(' anio ------>> ' + anio.anio)

   

      if(mes && anio && mes.sumaPorcentaje > 0) {

     //   console.log(' mes.porcentaje ------>> ' + mes.sumaPorcentaje)
        return mes.sumaPorcentaje
      }

   

    

    return '-';
  }

}
