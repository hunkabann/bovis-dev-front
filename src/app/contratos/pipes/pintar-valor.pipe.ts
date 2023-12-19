import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pintarValor'
})
export class PintarValorPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    let valor = value

    if(typeof value == 'object') {
      valor = JSON.stringify(valor, null, 3)
    }

    return valor;
  }

}
