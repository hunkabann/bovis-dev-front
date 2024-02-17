import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ComentariosResponse, CumplimientoResponse, DocumentoResponse, DocumentosResponse, ProyectoCumplimientoResponse,TiposComentarioResponse,TsProyectosResponse } from '../models/auditoria.model';
import { GenericResponse } from 'src/app/empleados/Models/empleados';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  baseUrl = environment.urlApiBovis;

  http = inject(HttpClient)

  esLegal: boolean = false

  constructor() { }

  get tipo() {
    return this.esLegal ? 'legal' : 'calidad'
  }

  getCumplimiento() {
    return this.http.get<CumplimientoResponse>(`${this.baseUrl}api/Auditoria/${this.tipo}`)
  }

  getProyectoCumplimiento(id: number) {
    return this.http.get<ProyectoCumplimientoResponse>(`${this.baseUrl}api/Auditoria/ByProyecto/${id}/${this.tipo}`)
  }

  getDocumento(id: number) {
    return this.http.get<DocumentoResponse>(`${this.baseUrl}api/Auditoria/Documento/${id}`)
  }

  getDocumentos(id: number) {
    return this.http.get<DocumentosResponse>(`${this.baseUrl}/api/Auditoria/Documentos/${id}/1/500`)
  }

  agregarCumplimiento(body: any) {
    return this.http.post<GenericResponse>(`${this.baseUrl}api/Auditoria`, body)
  }

  agregarDocumento(body: any) {
    return this.http.post<GenericResponse>(`${this.baseUrl}api/Auditoria/Documento`, body)
  }

  validarDocumentos(body: any) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/Auditoria/Documento/Validacion`, body)
  }
  
  getCatProyectos(ordenAlfabetico: boolean = true) {
    if('legal' == `${this.tipo}`){
      return this.http.get<TsProyectosResponse>(`${this.baseUrl}api/Auditoria/proyectos/legal`)
    }else{
      return this.http.get<TsProyectosResponse>(`${this.baseUrl}api/pcs/proyectos/${ordenAlfabetico}`)
    }

    
  }

  getTiposComentario() {
    return this.http.get<TiposComentarioResponse>(`${this.baseUrl}api/Auditoria/TipoComentarios`)
  }

  getComentarios(numProyecto: number) {
    return this.http.get<ComentariosResponse>(`${this.baseUrl}api/Auditoria/Comentarios/${numProyecto}`)
  }

  agregarComentario(body: any) {
    return this.http.post<GenericResponse>(`${this.baseUrl}api/Auditoria/Comentarios`, body)
  }

  agregarFechaProxAuditoria(body: any) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/pcs/Proyectos/FechaAuditoria`, body)
  }

}
