import { Pipe, PipeTransform } from '@angular/core';
import { Otro, Proyecto, Timesheet } from '../models/timesheet.model';

@Pipe({
  name: 'proyectoJoin'
})
export class ProyectoJoinPipe implements PipeTransform {

  transform(proyectos: Otro[] | Proyecto[], ...args: unknown[]): number {

    const [tipo, totalDias] = args
    let total = 0

    switch(tipo) {
      case 'proyectos':
        // proyectos.forEach(proyecto => total += proyecto.tDedicacion)
        proyectos.forEach(proyecto => total += proyecto.dias)
        //total = this.formateaValor((total / +totalDias) * 100)
        total = Math.round((total / +totalDias) * 100)
        break
      case 'proyectosDias':
        proyectos.forEach(proyecto => total += proyecto.dias)
        break
      case 'otros':
        // proyectos.forEach(otro => total += otro.tDedicacion)
        proyectos.forEach(otro => total += otro.dias)
        //total = this.formateaValor((total / +totalDias) * 100)
        total = Math.round((total / +totalDias) * 100)
        break
      case 'otrosDias':
        proyectos.forEach(otro => total += otro.dias)
        break
      default:
        total = 0
    }

    return total
    // const arr = proyectos.map(proyecto => `${proyecto.descripcion}: ${proyecto.tDedicacion} %`)
    // return arr.join(" | ");
  }

  transformCalcula(proyectos: Otro[] | Proyecto[], ...args: unknown[]): number {

    const [tipo, totalDias] = args
    let total = 0

    switch(tipo) {
      case 'proyectos':
        // proyectos.forEach(proyecto => total += proyecto.tDedicacion)
        proyectos.forEach(proyecto => total += proyecto.dias)
        total = Math.round((total / +totalDias) * 100)
        break
      case 'proyectosDias':
        proyectos.forEach(proyecto => total += proyecto.dias)
        break
      case 'otros':
        // proyectos.forEach(otro => total += otro.tDedicacion)
        proyectos.forEach(otro => total += otro.dias)
        total = Math.round((total / +totalDias) * 100)
        break
      case 'otrosDias':
        proyectos.forEach(otro => total += otro.dias)
        break
      default:
        total = 0
    }

    return total
    // const arr = proyectos.map(proyecto => `${proyecto.descripcion}: ${proyecto.tDedicacion} %`)
    // return arr.join(" | ");
  }

  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }


}
