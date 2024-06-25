import { Pipe, PipeTransform } from '@angular/core';
import { GastosIngresosTotales } from '../models/pcs.model';

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

    return subtotal
  }

}
