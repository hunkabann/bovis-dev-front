import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { GenericResponse } from 'src/app/empleados/Models/empleados';
import { environment } from 'src/environments/environment';
import { ObtenerUsuarioTimesheetResponse } from '../Models/timesheetusuarios';
import { TsProyectosResponse } from 'src/app/timesheet/models/timesheet.model';

@Injectable({
  providedIn: 'root'
})
export class TimeSheetUsuarioService {

  http = inject(HttpClient)
  
  baseUrl = environment.urlApiBovis;

  constructor() { }

  eliminarCliente(id: number) {
    return this.http.delete<GenericResponse>(`${this.baseUrl}api/Catalogo/Cliente/Borrar/${id}`)
  }

getCatProyectos(ordenAlfabetico: boolean = true) {
    return this.http.get<TsProyectosResponse>(`${this.baseUrl}api/pcs/proyectos/${ordenAlfabetico}`)
  }

  obtenerUsuarioTimesheet() {
    return this.http.get<ObtenerUsuarioTimesheetResponse>(`${this.baseUrl}api/Timesheet/Usuarios`)
  }

  guardarUsuarioTimesheet(body: any, esActualizacion = false) {
    return esActualizacion 
    ? this.http.put<GenericResponse>(`${this.baseUrl}api/Timesheet/Usuarios`, body)
    : this.http.post<GenericResponse>(`${this.baseUrl}api/Timesheet/Usuarios`, body)
  }

  eliminarUsuarioTimesheet(id: string) {
    return this.http.delete<GenericResponse>(`${this.baseUrl}api/Timesheet/Usuarios`, { body: { id } })
  }
}
