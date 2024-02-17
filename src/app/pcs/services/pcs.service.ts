import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { GenericResponse } from 'src/app/empleados/Models/empleados';
import { environment } from 'src/environments/environment';
import { EtapasPorProyectoResponse, GastosIngresosSeccionesResponse, ProyectoPorIDResponse } from '../models/pcs.model';

interface NuevoProyecto {
  id:     number,
  nombre: string
}

@Injectable({
  providedIn: 'root'
})
export class PcsService {

  baseUrl = environment.urlApiBovis;

  _botonNuevo: boolean = false

  http = inject(HttpClient)

  private idProyectoObject = new Subject<number>()
  private nuevoProyecto = new Subject<NuevoProyecto>()

  constructor() { }
  
  get botonNuevo() {
    return this._botonNuevo
  }
  
  cambiarEstadoBotonNuevo(estado: boolean) {
    Promise.resolve().then(() => this._botonNuevo = estado)
  }

  enviarIdProyecto(data: number) {
    this.idProyectoObject.next(data)
  }
  
  enviarNuevoProyecto(data: NuevoProyecto) {
    this.nuevoProyecto.next(data)
  }

  obtenerIdProyecto() {
    return this.idProyectoObject.asObservable()
  }

  obtenerNuevoProyecto() {
    return this.nuevoProyecto.asObservable()
  }

  guardar(esActualizacion: boolean = false, body: any) {
    return esActualizacion
    ? this.http.put<GenericResponse>(`${this.baseUrl}api/Pcs/Proyectos`, body)
    : this.http.post<GenericResponse>(`${this.baseUrl}api/Pcs/Proyectos`, body)
  }

  obtenerEtapasPorProyecto(idProyecto: number) {
    return this.http.get<EtapasPorProyectoResponse>(`${this.baseUrl}api/Pcs/Etapas/${idProyecto}`)
  }

  agregarEtapa(body: any) {
    return this.http.post<GenericResponse>(`${this.baseUrl}api/Pcs/Etapas`, body)
  }

  eliminarEtapa(idEtapa: number) {
    return this.http.delete<GenericResponse>(`${this.baseUrl}api/Pcs/Etapas/${idEtapa}`)
  }

  modificarEmpleado(body: any, esActualizacion: boolean) {
    return esActualizacion 
    ? this.http.put<any>(`${this.baseUrl}api/Pcs/Empleados/Fase`, body)
    : this.http.post<any>(`${this.baseUrl}api/Pcs/Empleados/Fase`, body)
  }

  eliminarEmpleado(numEmpleado: string, idEtapa: number) {
    return this.http.delete<GenericResponse>(`${this.baseUrl}api/Pcs/Empleados/${numEmpleado}/Fase/${idEtapa}`)
  }

  obtenerProyectoPorId(id: number) {
    return this.http.get<ProyectoPorIDResponse>(`${this.baseUrl}api/Pcs/Proyectos/Info/${id}`)
  }

  obtenerGastosIngresosSecciones(numProyecto: number, tipo: string = 'gasto') {
    return this.http.get<GastosIngresosSeccionesResponse>(`${this.baseUrl}api/Pcs/GastosIngresos/${numProyecto}/${tipo}`)
  }

  actualizarRubro(body: any) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/Pcs/GastosIngresos`, body)
  }
  
}
