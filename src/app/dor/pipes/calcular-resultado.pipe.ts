import { Pipe, PipeTransform, inject } from '@angular/core';
import { ObjetivosGeneralesNuevo } from '../Models/subordinados';
import { DorService } from '../Services/dor.service';

const MIN = 70
const MAX = 120
const IND = 1.2

@Pipe({
  name: 'calcularResultado'
})
export class CalcularResultadoPipe implements PipeTransform {
  
  dorService = inject(DorService)

  transform(obj: ObjetivosGeneralesNuevo, ...args: unknown[]): unknown {

    const [tipo] = args

    let primerValor: number = 0
    let segundoValor: number = 0
    let resultado: number = 0

    const porcentajeEstimado = (obj.porcentajeEstimado ? +obj.porcentajeEstimado : 0)

    if(tipo == 'AREA') {
      switch(obj.descripcion.trim().toLowerCase()) {
        case 'planes de trabajo': 
        case 'encuesta satisfacción sc':
          segundoValor = obj.real / obj.meta
          primerValor = segundoValor * +obj.valor
          segundoValor *= 100
          break
        case 'presupuesto':
          segundoValor = obj.meta / obj.real
          primerValor = segundoValor * +obj.valor
          segundoValor *=100
          // segundoValor = obj.proyectadoTotal * +obj.valor 
          // primerValor = obj.proyectadoTotal test 2
          break
        default:
          segundoValor = obj.real * porcentajeEstimado
          primerValor = segundoValor
          segundoValor = segundoValor * 100
      }
    } else {
      switch(obj.descripcion.trim().toLowerCase()) {
        case 'seguridad':
          if(tipo === 'CORPORATIVO') {
            segundoValor = (1 - ((obj.metaValor - obj.meta) / obj.meta)) * 100
            primerValor = (+obj.valor * segundoValor) / 100
          } else {
            // segundoValor = 1 + Math.abs((obj.real - +obj.meta ) / +obj.meta)
            segundoValor = (1 - ((obj.real - obj.meta) / obj.meta)) * 100
            primerValor = (+obj.valor * segundoValor) / 100
          }
          break
        case 'cartera vencida':
          // segundoValor = 100 - (obj.real * porcentajeEstimado)
          segundoValor = 100 - obj.real
          primerValor = (segundoValor * +obj.valor) / 100
          break
        case 'gasto':
          // const valorReal = obj.real
          // segundoValor = ((+obj.meta / valorReal) * (obj.porcentajeEstimado ? +obj.porcentajeEstimado : 0) * 10)
          if(tipo === 'DE PROYECTO') {
            segundoValor = obj.meta / obj.real
            primerValor = (segundoValor * +obj.valor)
            segundoValor *= 100
          } else {
            segundoValor = (obj.gastoTotal/obj.proyectadoTotal)/((obj.gastoTotal/obj.real)*porcentajeEstimado)
            primerValor = ((segundoValor) * +obj.valor) / 100
          }
          break
        case 'gpm proyecto':
          // let gpm = 0
          // gpm = obj.ingresoTotal - obj.gastoTotal / obj.metaValor
          // segundoValor = (gpm/obj.real)/((gpm/obj.proyectadoTotal)*porcentajeEstimado)
          // primerValor = ((segundoValor) * +obj.valor) / 100

          segundoValor = obj.real / obj.meta
          primerValor = (segundoValor * +obj.valor)
          segundoValor *= 100

          // console.log([(gpm/obj.real), (gpm/obj.proyectadoTotal), (obj.porcentajeEstimado ? +obj.porcentajeEstimado : 0), ((gpm/obj.proyectadoTotal)*(obj.porcentajeEstimado ? +obj.porcentajeEstimado : 0))])
          break
        case 'gpm  bovis':
          segundoValor = obj.metaMensual / obj.meta
          primerValor = segundoValor * +obj.valor
          segundoValor *= 100
          break
        default:
          primerValor = (+obj.valor * obj.real) / +obj.meta
          segundoValor = (+primerValor * 100) / +obj.valor
      }
      
      if(+obj.meta <= 0 && obj.descripcion.toLowerCase() != 'cartera vencida') {
        return 0
      }
    }

    if(segundoValor < MIN) {
      resultado = 0
    } else if(segundoValor >= MIN && segundoValor < MAX) {
      resultado = primerValor
    } else if(segundoValor >= MAX) {
      resultado = (+obj.valor * IND)
    }

    if(tipo === 'CORPORATIVO') {
      this.dorService.sumarResultado(resultado)
    } else {
      this.dorService.sumarResultado(resultado, false)
    }

    return resultado.toFixed(2)
  }

}

// obtenerMes(value: ObjetivosGenerales, mesActual: number): number {
//   let valor = 0
//   const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
//   valor = value[meses[mesActual]] || 0

//   return valor
// }
