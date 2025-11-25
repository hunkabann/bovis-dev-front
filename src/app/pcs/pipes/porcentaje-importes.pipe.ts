//LEO inputs para FEEs

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'porcentajeImportes'
})
export class PorcentajeImportesPipe implements PipeTransform {

  transform(valor: number, porcentaje: number): number {
    if (valor == null || porcentaje == null) {
      return 0;
    }
    return valor * (porcentaje / 100);
  }


}
