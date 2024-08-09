import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { GenericResponse } from 'src/app/empleados/Models/empleados';
import { environment } from 'src/environments/environment';
import { ObtenerClientesResponse } from '../Models/puesto';

@Injectable({
  providedIn: 'root'
})
export class PuestoService {

  http = inject(HttpClient)
  
  baseUrl = environment.urlApiBovis;

  constructor() { }

  obtenerPuesto() {
    return this.http.get<ObtenerClientesResponse>(`${this.baseUrl}api/Catalogo/Puesto/true`)
  }

  guardarPuesto(body: any, esActualizacion = false) {
    return esActualizacion 
    ? this.http.put<GenericResponse>(`${this.baseUrl}api/Catalogo/Puesto/Actualizar`, body)
    : this.http.post<GenericResponse>(`${this.baseUrl}api/Catalogo/Puesto/Agregar`, body)
  }

  eliminarPuesto(id: number) {
    return this.http.delete<GenericResponse>(`${this.baseUrl}api/Catalogo/Puesto/Borrar/${id}`)
  }
}
