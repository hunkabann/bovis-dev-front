import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { GenericResponse } from 'src/app/empleados/Models/empleados';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PcsService {

  baseUrl = environment.urlApiBovis;

  http = inject(HttpClient)

  constructor() { }

  guardar(esActualizacion: boolean = false, body: any) {
    return esActualizacion
    ? this.http.put<GenericResponse>(`${this.baseUrl}api/Pcs/Proyectos`, body)
    : this.http.post<GenericResponse>(`${this.baseUrl}api/Pcs/Proyectos`, body)
  }
}
