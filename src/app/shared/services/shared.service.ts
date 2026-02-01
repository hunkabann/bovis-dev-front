import { Injectable } from '@angular/core';
import { errorsArray } from 'src/utils/constants';
import { CatalogosService } from '../../pcs/services/catalogos.service'; // LineaBase
import { Observable, map } from 'rxjs'; // LineaBase
import { DateUtils } from 'src/app/shared/utils/date-utils'; // LineaBase

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  _cargando: boolean = false
  private _pageTitle = ''

  constructor(private catalogosService: CatalogosService) { }

  get cargando() {
    return this._cargando
  }

  get pageTitle() {
    this._pageTitle = localStorage.getItem('pageTitle') || '-'
    return this._pageTitle
  }
  
  cambiarEstado(estado: boolean) {
    Promise.resolve().then(() => this._cargando = estado)
  }

  esInvalido(form: any, campo: string): boolean {
    return form.get(campo).invalid && 
            (form.get(campo).dirty || form.get(campo).touched)
  }

  obtenerMensajeError(form: any, campo: string): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if(form.get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }

  //LineaBase I
   obtieneLineaBase(fecha: string, pestania: string): Observable<string> {
    return this.catalogosService.obtenerParametros().pipe(
      map(params => {
        let caso = '';

        if (!params.fecha_base || params.fecha_base == 'undefined' || params.fecha_base == undefined) {
          fecha = DateUtils.getToday_yyyyMMdd("yyyy/MM/dd", "-");
          caso = 'casoNoExiste';
        } else {
          if (fecha !== params.fecha_base) {
            console.log(`Fecha_base_Anterior:{${fecha}} Fecha_base_Nueva:{${params.fecha_base}}`);
          }

          fecha = params.fecha_base;
          caso = 'casoExiste';
        }

        console.log(`Pestania:${pestania} Fecha_base:{${fecha}} caso:{${caso}}`);

        return fecha;
      })
    );
  }
  //LineaBase F
}
