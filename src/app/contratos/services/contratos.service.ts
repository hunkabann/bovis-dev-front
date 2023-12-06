import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { GenericResponse } from 'src/app/empleados/Models/empleados';
import { environment } from 'src/environments/environment';
import { EstadosList, PlantillaResponse, PlantillasResponse } from '../models/contratos.model';

@Injectable({
  providedIn: 'root'
})
export class ContratosService {

  http = inject(HttpClient)

  baseUrl = environment.urlApiBovis;

  constructor() { }

  getPlantillas(estado: EstadosList) {
    return this.http.get<PlantillasResponse>(`${this.baseUrl}api/Contrato/Templates/${estado}`) // todos | activos | inactivos
  }

  getPlantilla(id: number) {
    return this.http.get<PlantillaResponse>(`${this.baseUrl}api/Contrato/Template/Registro/${id}`)
  }

  guardarPlantilla(body: any, esActualizacion: boolean) {
    return esActualizacion 
    ? this.http.put<GenericResponse>(`${this.baseUrl}api/Contrato/Template/Actualizar`, body)
    : this.http.post<GenericResponse>(`${this.baseUrl}api/Contrato/Template/Agregar`, body)
  }

  togglePlantillaEstado(activo: boolean, id: number) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/Contrato/Template/Estatus/Actualizar`, {
      id_contrato_template: id,
      boactivo: activo
    })
  }
}
