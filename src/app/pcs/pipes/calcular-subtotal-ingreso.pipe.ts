import { Pipe, PipeTransform } from '@angular/core';
import { GastosIngresosTotales } from '../models/pcs.model';
import {formatCurrency, getCurrencySymbol} from '@angular/common';

@Pipe({
  name: 'calcularSubtotalIngreso'
})
export class CalcularSubtotalIngresoPipe implements PipeTransform {

  arraybeneficio: GastosIngresosTotales[] = []

  transform(value: GastosIngresosTotales[], ...args: unknown[]): unknown {
    
    let subtotal = 0


    this.arraybeneficio  = value

    const dato = value;
    dato?.forEach(paso=>{

      console.log("paso.cost-------------->> " +paso.totalPorcentaje);

    })

    value.forEach(totales => {
      subtotal += +totales.totalPorcentaje
    })

    return this.formateaValor(formatCurrency(subtotal, 'en-US', getCurrencySymbol('USD', 'wide')))
  }

  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

}
