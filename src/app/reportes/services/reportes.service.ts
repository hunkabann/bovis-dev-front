import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ReportesResponse } from '../models/reportes.model';
import { GenericResponse } from 'src/app/empleados/Models/empleados';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  http = inject(HttpClient)

  baseUrl = environment.urlApiBovis;

  constructor() { }

  getReportes(id: number) {
    return this.http.get<ReportesResponse>(`${ this.baseUrl }api/Reporte/Personalizado/0`)
  }

  getReporte(id: number = 0) {
    return this.http.get<ReportesResponse>(`${ this.baseUrl }api/Reporte/Personalizado/${ id }`)
  }

  ejecutarReporte(query: string) {
    return this.http.post<any>(`${ this.baseUrl }api/Reporte/Personalizado/Ejecutar`, {query})
  }

  guardarReporte(body: any, esEdicion: boolean = false) {
    return esEdicion 
    ? this.http.put<GenericResponse>(`${ this.baseUrl }api/Reporte/Personalizado/Actualizar`, body)
    : this.http.post<GenericResponse>(`${ this.baseUrl }api/Reporte/Personalizado/Guardar`, body)
  }
}
