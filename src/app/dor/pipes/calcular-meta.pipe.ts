import { Pipe, PipeTransform } from '@angular/core';
import { ObjetivosGenerales } from '../Models/subordinados';

@Pipe({
  name: 'calcularMeta'
})
export class CalcularMetaPipe implements PipeTransform {

  transform({ingreso, gasto, promedioReal}: ObjetivosGenerales, ...args: unknown[]): unknown {
    
    let resultado = ingreso - gasto

    if(gasto > 0) {
      resultado = resultado / gasto
    } else {
      resultado = promedioReal
    }

    return Math.ceil(resultado);
  }

}
