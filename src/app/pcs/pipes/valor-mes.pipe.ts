import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valorMes'
})
export class ValorMesPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
