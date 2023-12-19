import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { GenericResponse } from 'src/app/empleados/Models/empleados';
import { environment } from 'src/environments/environment';
import { ObtenerClientesResponse } from '../Models/clientes';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  http = inject(HttpClient)
  
  baseUrl = environment.urlApiBovis;

  constructor() { }

  obtenerClientes() {
    return this.http.get<ObtenerClientesResponse>(`${this.baseUrl}api/Catalogo/Cliente/true`)
  }

  guardarCliente(body: any, esActualizacion = false) {
    return esActualizacion 
    ? this.http.put<GenericResponse>(`${this.baseUrl}api/Catalogo/Cliente/Actualizar`, body)
    : this.http.post<GenericResponse>(`${this.baseUrl}api/Catalogo/Cliente/Agregar`, body)
  }

  eliminarCliente(id: number) {
    return this.http.delete<GenericResponse>(`${this.baseUrl}api/Catalogo/Cliente/Borrar/${id}`)
  }
}
