import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
//Reporte EmpleadosXProyecto en el siguiente import se agregó al final la clase:TimeSheetEmpProyectoResponse
import { CargarHorasResponse, CatEmpleadoResponse, DiasHabilesResponse, DiasTimesheetResponse, EmpleadoInfoResponse, EmpleadoProyectoResponse, EmpleadoTNoProyectos, SabadosOpciones, TimesheetPorIdResponse, TimesheetsPorEmpleadoResponse, TimesheetsPorFechaResponse, TsProyectosResponse, UnidadesNegocioResponse ,TimeSheetEmpProyectoResponse} from '../models/timesheet.model'; 
import { GenericResponse } from 'src/app/empleados/Models/empleados';

interface Dias {
  habiles:  number,
  feriados: number
}

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  baseUrl = environment.urlApiBovis;

  http = inject(HttpClient)

  constructor() { }

  getEmpleados() {
    return this.http.get<CatEmpleadoResponse>(`${this.baseUrl}api/Empleado/Empleados/true`)
  }

  getEmpleadosTIPO(idPuesto: number = 0) {
    return this.http.get<CatEmpleadoResponse>(`${this.baseUrl}api/Empleado/Puesto/${idPuesto}`)
  }
  

  getCatPuesto() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/Puesto/true/`);
  }

  //obtenerPuesto() {
   // return this.http.get<ObtenerClientesResponse>(`${this.baseUrl}api/Catalogo/Puesto/true`)
  //}
  getEmpleadosByJefeEmail(email: string) {
    return this.http.get<CatEmpleadoResponse>(`${this.baseUrl}api/Timesheet/EmpleadosByResponsable/${email}`)
  }

  getDiasHabiles(mes: number, anio: number, sabados: SabadosOpciones): Observable<Dias> {
    return this.http.get<DiasHabilesResponse>(`${this.baseUrl}api/Timesheet/DiasHabiles/${mes}/${anio}/${sabados === 'SI' ? 'true' : 'false'}`)
      .pipe(map(pre_info => pre_info.data))
      .pipe(map(info => {
        if(!info) return {habiles: 0, feriados: 0}

        return {habiles: info.dias_habiles+info.feriados, feriados: info.feriados}
      }))
  }

  getCatProyectos(ordenAlfabetico: boolean = true) {
    return this.http.get<TsProyectosResponse>(`${this.baseUrl}api/pcs/proyectos/${ordenAlfabetico}`)
  }

  getCatProyectosByJefeEmail(email: string) {
    return this.http.get<TsProyectosResponse>(`${this.baseUrl}api/Timesheet/ProyectosByResponsable/${email}`)
  }

  getProyectos(empleadoId: number) {
    return this.http.get<EmpleadoProyectoResponse>(`${this.baseUrl}api/Empleado/Proyectos/${empleadoId}`)
  }

  getEmpleadoInfo(correo: string) {
    return this.http.get<EmpleadoInfoResponse>(`${this.baseUrl}api/Empleado/Registro/Email/${correo}`)
  }

  cargarHoras(body: any) {
    return this.http.post<CargarHorasResponse>(`${this.baseUrl}api/Timesheet/Registro/Agregar`, body)
  }

  getTimeSheetsPorEmpleado(empleadoId: number = 0, proyectoId: number = 0, unidadId: number = 0, empresaId: number = 0, mes: number = 0, anio = 0) {
    return this.http.get<TimesheetsPorEmpleadoResponse>(`${this.baseUrl}api/Timesheet/TimeSheets/Filtro/${empleadoId}/${proyectoId}/${unidadId}/${empresaId}/${mes}/${anio}`)
  }

  getTimeSheetsPorEmpleadoproyec(empleadoId: number = 0, proyectoId: number = 0, unidadId: number = 0, empresaId: number = 0, mes: number = 0, anio = 0) {
    return this.http.get<EmpleadoProyectoResponse>(`${this.baseUrl}api/Timesheet/TimeSheets/Filtro/${empleadoId}/${proyectoId}/${unidadId}/${empresaId}/${mes}/${anio}`)
  }

  getTimeSheetPorId(timesheetId: number) {
    return this.http.get<TimesheetPorIdResponse>(`${this.baseUrl}api/Timesheet/Registro/${timesheetId}`)
  }

  getTimeSheetsPorFecha(mes: number, anio: number) {
    return this.http.get<TimesheetsPorFechaResponse>(`${this.baseUrl}api/Timesheet/TimeSheets/Fecha/${mes}/${anio}`)
  }

  actualizarHoras(body: any) {
    return this.http.put<CargarHorasResponse>(`${this.baseUrl}api/Timesheet/Registro/Actualizar`, body)
  }

  getCatUnidadNegocio() {
    return this.http.get<UnidadesNegocioResponse>(`${this.baseUrl}api/catalogo/UnidadNegocio/`);
  }

  getProyectosFaltanEmpleado(empleadoId: number) {
    return this.http.get<EmpleadoTNoProyectos>(`${this.baseUrl}api/Timesheet/NotProyectosByEmpleado/${empleadoId}`)
  }

  //atc 11-11-2024
  getProyectosFaltanEmpleadoNoClose(empleadoId: number) {
    return this.http.get<EmpleadoTNoProyectos>(`${this.baseUrl}api/Timesheet/NotProyectosByEmpleadoNoClose/${empleadoId}`)
  }

  agregarProyecto(body: any) {
    return this.http.post<GenericResponse>(`${this.baseUrl}api/Timesheet/ProyectoEmpleado`, body)
  }

  eliminarProyecto(body: any) {

   const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body,
    };
    return this.http.delete<GenericResponse>(`${this.baseUrl}api/Timesheet/ProyectoEmpleado`, options)
  }

  cambiarDiasDedicacion(body: any) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/Timesheet/DiasDedicacion`, body)
  }

  modificarFeriados(body: any) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/Timesheet/DiasFeriados`, body)
  }

  obtenerDiasTimesheet(mes: number) {
    return this.http.get<DiasTimesheetResponse>(`${this.baseUrl}api/Timesheet/Dias/${mes}`)
  }

  //Reporte EmpleadosXProyecto I
  getTimeSheetsEmpleadoxProyecto(proyectoId: number = 0) {
    return this.http.get<TimeSheetEmpProyectoResponse>(`${this.baseUrl}api/Timesheet/TimeSheets/Filtro/${proyectoId}`)
  }
  //Reporte EmpleadosXProyecto F
}
