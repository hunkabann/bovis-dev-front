import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CumplimientoResponse, DocumentoResponse, DocumentosResponse, ProyectoCumplimientoResponse } from '../models/auditoria.model';
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

}
