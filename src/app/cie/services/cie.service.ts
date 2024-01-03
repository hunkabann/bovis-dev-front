import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { CargaCuentasResponse, CieClasificacionesPYResponse, CieConceptosResponse, CieCuentasListaResponse, CieCuentasResponse, CieElementPost, CieEmpresasResponse, CieNumsProyectoResponse, CieProyectosResponse, CieRegistroUResponse, CieRegistrosPaginadosResponse, CieResponsablesResponse } from '../models/cie.models';
import { GenericResponse } from 'src/app/empleados/Models/empleados';
import { ListaStringResponse } from 'src/models/general.model';

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

  getRegistros(nombre_cuenta: string, mes_inicio: number, anio_inicio: number,  mes_fin: number, anio_fin: number, concepto: string, empresa: string, num_proyecto: number, responsable: string, clasificacion_py: string, offset: number, limit: number, sort_field: string, sort_order: string) {
    return this.http.post<CieRegistrosPaginadosResponse>(`${this.baseUrl}api/Cie/Registros`, {
        nombre_cuenta,
        mes_inicio,
        anio_inicio,
        mes_fin,
        anio_fin,
        concepto,
        empresa,
        num_proyecto,
        responsable,
        clasificacion_py,
        limit,
        offset,
        sort_field,
        sort_order
      //true/${nombre_cuenta}/${mes}/${anio}/${mesFin}/${anioFin}/${concepto}/${empresa}/${num_proyecto}/${responsable}/${clasificacionPY}/${offset}/${limit}
    })
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

  getTiposPY() {
    return this.http.get<ListaStringResponse>(`${this.baseUrl}api/Cie/TiposPY`)
  }

  getClasificacionesPY() {
    return this.http.get<ListaStringResponse>(`${this.baseUrl}api/Cie/ClasificacionesPY`)
  }

  actualizarCieRegistro(body: any) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/Cie/Registro/Actualizar`, body)
  }

  cargarCuentasNuevas(body: any) {
    return this.http.post<CargaCuentasResponse>(`${this.baseUrl}api/Cie/Cuentas/Agregar`, body)
  }
}
