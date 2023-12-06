import { Pipe, PipeTransform } from '@angular/core';
import { UpPersona } from '../Models/empleados';

@Pipe({
  name: 'fullName'
})
export class FullNamePipe implements PipeTransform {

  transform({chnombre, chap_paterno, chap_materno}: UpPersona, ...args: unknown[]): unknown {
    return `${chnombre} ${chap_paterno} ${chap_materno || ''}`;
  }

}
