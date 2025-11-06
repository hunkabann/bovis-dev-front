//LEO inputs para FEEs

import { Pipe, PipeTransform } from '@angular/core';
import { GastosIngresosTotales } from '../models/pcs.model';

@Pipe({
  name: 'porcentajeImportesSubtotal'
})
export class PorcentajeImportesSubtotalPipe implements PipeTransform {

  transform(valores: GastosIngresosTotales[], porcentaje: number): number {
    if (!Array.isArray(valores) || valores.length === 0 || porcentaje == null) {
      return 0;
    }

    let aNuevo = valores.map(v => v.totalPorcentaje * (porcentaje / 100));
    let nSubTotal = 0;

    aNuevo.forEach(element => {
        nSubTotal+=element;
    });

    return nSubTotal;
  }


}