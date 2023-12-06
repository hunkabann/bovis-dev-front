import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { CieClasificacionesPYResponse, CieConceptosResponse, CieCuentasListaResponse, CieCuentasResponse, CieElementPost, CieEmpresasResponse, CieNumsProyectoResponse, CieProyectosResponse, CieRegistroUResponse, CieRegistrosPaginadosResponse, CieResponsablesResponse } from '../models/cie.models';
import { GenericResponse } from 'src/app/empleados/Models/empleados';

interface StringRequest {
  data: string[]
}

@Injectable({
  providedIn: 'root'
})
export class CieService {

  baseUrl = environment.urlApiBovis;

  constructor(private http: HttpClient) { }

  getEmpresas() {
    return this.http.get<CieEmpresasResponse>(`${this.baseUrl}api/Cie/Empresas/true`);
  }

  cargarSae(data: CieElementPost[], filename: String) {
    return this.http.post<any>(`${this.baseUrl}api/Cie/Registros/Agregar`, {data, nombre_archivo: filename})
  }

  getInfoCuentas(body: StringRequest) {
    return this.http.post<CieCuentasResponse>(`${this.baseUrl}api/Cie/Cuentas`, body)
  }

  getInfoProyectos(body: StringRequest) {
    return this.http.post<CieProyectosResponse>(`${this.baseUrl}api/Cie/Proyectos`, body)
  }

  getRegistros(nombre_cuenta: string = '-', mes: number = 0, anio: number = 0,  mesFin: number = 0, anioFin: number = 0, concepto: string = '-', empresa: string = '-', num_proyecto: number = 0, responsable: string = '-', clasificacionPY: string = '', offset: number, limit: number) {
    return this.http.get<CieRegistrosPaginadosResponse>(`${this.baseUrl}api/Cie/Registros/true/${nombre_cuenta}/${mes}/${anio}/${mesFin}/${anioFin}/${concepto}/${empresa}/${num_proyecto}/${responsable}/${clasificacionPY}/${offset}/${limit}`)
  }

  getCieConceptos() {
    return this.http.get<CieConceptosResponse>(`${this.baseUrl}api/Cie/Conceptos`)
  }

  getCieCuentas() {
    return this.http.get<CieCuentasListaResponse>(`${this.baseUrl}api/Cie/NombresCuenta`)
  }

  getCieNumsProyecto() {
    return this.http.get<CieNumsProyectoResponse>(`${this.baseUrl}api/Cie/NumsProyecto`)
  }

  getCieresponsables() {
    return this.http.get<CieResponsablesResponse>(`${this.baseUrl}api/Cie/Responsables`)
  }

  getCieEmpresas() {
    return this.http.get<CieEmpresasResponse>(`${this.baseUrl}api/Cie/Empresas/true`)
  }

  getCieClasificacionesPY() {
    return this.http.get<CieClasificacionesPYResponse>(`${this.baseUrl}api/Cie/ClasificacionesPY`)
  }
  
  getRegistro(id: number) {
    return this.http.get<CieRegistroUResponse>(`${this.baseUrl}api/Cie/Registro/${id}`)
  }

  actualizarCieRegistro(body: any) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/Cie/Registro/Actualizar`, body)
  }
}
