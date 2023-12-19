import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {

  activatedRoute    = inject(ActivatedRoute)

  esEdicion:            boolean = false
  labelBotonPrincipal:  string = ''

  baseUrl = environment.urlApiBovis;

  constructor(private http: HttpClient) { }

  getSectores() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/Sector/`);
  }

  getPais() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/pais/`);
  }

  getEstatusProyecto() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/Estatus/`);
  }

  getClientes() {
    return this.http.get<any>(`${this.baseUrl}api/pcs/clientes`);
  }

  getEmpleados() {
    return this.http.get<any>(`${this.baseUrl}api/empleado/ConsultarDetalle`);
  }

  obtenerParametros() {

    return this.activatedRoute.queryParams
    .pipe(
      map(data => {
        const params = {
          proyecto:   data['proyecto'] || null,
          esEdicion:  data['esEdicion'] == 1
        }

        this.esEdicion = params.esEdicion
        this.labelBotonPrincipal = params.esEdicion ? 'Actualizar' : 'Guardar'

        return params
    }))
  }

  getDirectores() {
    return this.http.get<any>(`${this.baseUrl}api/Requerimiento/DirectoresEjecutivos`)
  }

}
