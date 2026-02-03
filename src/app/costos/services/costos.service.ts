import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CostosEmpleadoResponse,UpPersonasResponse,PuestosResponse,UpEmpleadoResponse } from '../models/costos.model';

@Injectable({
  providedIn: 'root'
})
export class CostosService {

  baseUrl = environment.urlApiBovis;

  http = inject(HttpClient)

  constructor() { }

  getCostosEmpleado(esreghistorico: boolean,idEmpleado: string,idPuesto: number,idProyecto: number,idEmpresa: number,IDUnidadNegocio: number,DtFechaIni: string,DtFechaFin: string) {
    //const historico = esreghistorico ? '1' : '0'
    return this.http.get<CostosEmpleadoResponse>(`${ this.baseUrl }api/Costo/costos/${esreghistorico}/${idEmpleado}/${idPuesto}/${idProyecto}/${idEmpresa}/${IDUnidadNegocio}/${DtFechaIni}/${DtFechaFin}`)
  }

  getCostoID(id: string, fecha: string) {
    return this.http.get<CostosEmpleadoResponse>(`${this.baseUrl}api/Costo/Empleado/${id}/${fecha}`)
  }

  getPersonas() {
    return this.http.get<UpPersonasResponse>(`${this.baseUrl}api/Persona/Personas/true`);
  }
  // LineaBase, se agrega param
  getEmpleados(fecha: string) {
    return this.http.get<UpEmpleadoResponse>(`${this.baseUrl}api/Empleado/Empleados/true/${fecha}`);
  }

  getPuestos() {
    return this.http.get<PuestosResponse>(`${this.baseUrl}api/Catalogo/Puesto/true`)
  }

  getProyectos() {
    return this.http.get<any>(`${this.baseUrl}api/pcs/proyectos/true`);
  }

  getCatUnidadNegocio() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/UnidadNegocio/`);
  }

  getEmpresas() {
    return this.http.get<any>(`${this.baseUrl}api/pcs/empresas`);
  }

  //LEO TBD
  getCostoIDPorPuesto(id: string, idPuesto: string, fecha: string) {
    return this.http.get<CostosEmpleadoResponse>(`${this.baseUrl}api/Costo/Empleado/${id}/${idPuesto}/${fecha}`)
  }
}
