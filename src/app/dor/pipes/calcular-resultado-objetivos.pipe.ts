import { Pipe, PipeTransform } from '@angular/core';
import { Objetivos } from '../Models/subordinados';

const MIN = 70
const MAX = 120
const IND = 1.2

@Pipe({
  name: 'calcularResultadoObjetivos'
})
export class CalcularResultadoObjetivosPipe implements PipeTransform {

  transform(objetivo: Objetivos, ...args: unknown[]): unknown {

    let resultado: number = 0
    let primerValor: number = 0
    
    // (+objetivo.porcentajeReal < +objetivo.valor ? 0 : objetivo.porcentajeReal)

    // if(+objetivo.porcentajeReal < +objetivo.valor) {
    //   resultado = 0
    // }

    if(+objetivo.porcentajeReal >= +objetivo.valor) {
      resultado = +objetivo.valor
    }
    
    if(objetivo.descripcion?.startsWith('2.-') || objetivo.descripcion == 'Objetivo personal') {
      const cantidad = objetivo.resultadoTemporal * 100
      if(cantidad < MIN) {
        resultado = 0
      } else if(cantidad >= MIN && cantidad < MAX) {
        resultado = (+objetivo.valor * objetivo.resultadoTemporal)
      } else if(cantidad >= MAX) {
        resultado = (+objetivo.valor * IND)
      }
    }

    return Math.round(resultado).toFixed(2);
  }

}
