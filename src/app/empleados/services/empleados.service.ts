import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CatEmpleado, CatPersona, CatalogoResponse, Persona, GenerarRequerimientoResponse, RequerimientosResponse, RequerimientoResponse, ActualizarRequerimientoResponse, UpPersonasResponse, GenericResponse, TurnoResponse, UpEmpleadoResponse, UpPersonaResponse, PuestosResponse, OneEmpleadoResponse, ReqProyectosResponse, TiposContratoResponse, EstadosResponse, FiltrosRequerimientos, ContratosResponse, ContratoResponse, PaisesResponse, CostoEmpleadoResponse } from '../Models/empleados';
import { Observable } from 'rxjs';
import { PlantillasResponse } from 'src/app/contratos/models/contratos.model';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {

  baseUrl = environment.urlApiBovis;

  private httpHeaders = new HttpHeaders(
    { 'Content-Type': 'application/json' }
  )

  constructor(private http: HttpClient) { }

  getEstadoCivil() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/EstadoCivil/`);
  }

  getTipoSangre() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/TipoSangre/`);
  }

  getTipoPersona() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/TipoPersona/`);
  }

  getTipoSexo() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/Sexo/`);
  }

  getCatPersonas() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/TipoPersona/`);
  }

  getCatEmpleados() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/TipoEmpleado/`);
  }

  getCatCategorias() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/categoria/`);
  }

  getCatTiposContratos() {
    return this.http.get<TiposContratoResponse>(`${this.baseUrl}api/catalogo/TipoContrato/true`);
  }

  getCatEstados() {
    return this.http.get<EstadosResponse>(`${this.baseUrl}api/Catalogo/Estado/true`)
  }

  getCatPaises() {
    return this.http.get<PaisesResponse>(`${this.baseUrl}api/Catalogo/Pais/true`)
  }

  getCatCiudades(estado: number = 0) {
    return this.http.get<any>(`${this.baseUrl}api/Empleado/Ciudades/true/${estado}`);
  }

  getCatNivelEstudios() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/NivelEstudios/`);
  }

  getCatFormasPago() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/FormaPago/`);
  }

  getCatJornadas() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/Jornada/`);
  }

  getCatDepartamentos() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/Departamento/`);
  }

  getCatClasificacion() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/Clasificacion/`);
  }

  getCatUnidadNegocio() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/UnidadNegocio/`);
  }

  getCatTurno() {
    return this.http.get<TurnoResponse>(`${this.baseUrl}api/Catalogo/Turno/true`)
  }

  savePersona(persona: Persona): Observable<any> {
    return this.http.put(`${this.baseUrl}api/empleado/persona/Agregar`, persona, { headers: this.httpHeaders });
  }

  // Hecho por sebastian.flores
  getPersonas() {
    return this.http.get<UpPersonasResponse>(`${this.baseUrl}api/Persona/Personas/true`);
  }

  getPersona(id: number) {
    return this.http.get<UpPersonaResponse>(`${this.baseUrl}api/Persona/Registro/${id}`)
  }

  getEmpleados() {
    return this.http.get<UpEmpleadoResponse>(`${this.baseUrl}api/Empleado/Empleados/true`);
  }

  getEmpleado(id: number) {
    return this.http.get<OneEmpleadoResponse>(`${this.baseUrl}api/Empleado/Registro/${id}`)
  }

  getPersonasDisponibles() {
    return this.http.get<UpPersonasResponse>(`${this.baseUrl}api/Persona/Personas/Libres`)
  }

  getDirectores() {
    return this.http.get<UpEmpleadoResponse>(`${this.baseUrl}api/Requerimiento/DirectoresEjecutivos`)
  }

  getProyectosPorDirector(idDirector: number) {
    return this.http.get<ReqProyectosResponse>(`${this.baseUrl}api/Requerimiento/Proyectos/DirectorEjecutivo/${idDirector}`)
  }

  getCategorias() {
    return this.http.get<CatalogoResponse>(`${this.baseUrl}api/Catalogo/Categoria/true`)
  }

  getPuestos() {
    return this.http.get<PuestosResponse>(`${this.baseUrl}api/Catalogo/Puesto/true`)
  }

  getNivelEstudios() {
    return this.http.get<CatalogoResponse>(`${this.baseUrl}api/Catalogo/NivelEstudios/true`)
  }

  getJornadas() {
    return this.http.get<CatalogoResponse>(`${this.baseUrl}api/Catalogo/Jornada/true`)
  }

  getHabilidades() {
    return this.http.get<CatalogoResponse>(`${this.baseUrl}api/Catalogo/Habilidad/true`)
  }

  getExperiencias() {
    return this.http.get<CatalogoResponse>(`${this.baseUrl}api/Catalogo/Experiencia/true`)
  }

  getProfesiones() {
    return this.http.get<CatalogoResponse>(`${this.baseUrl}api/Catalogo/Profesion/true`)
  }

  generarRequerimiento(body: any) {
    return this.http.post<GenerarRequerimientoResponse>(`${this.baseUrl}api/Requerimiento/Registro/Agregar`, body)
  }

  getRequerimientos(filtros: FiltrosRequerimientos) {
    const {idDirector, idProyecto, idPuesto} = filtros
    return this.http.get<RequerimientosResponse>(`${this.baseUrl}api/Requerimiento/Requerimientos/false/${ idDirector || 0 }/${ idProyecto || 0 }/${ idPuesto || 0 }`)
  }

  getRequerimiento(id: number) {
    return this.http.get<RequerimientoResponse>(`${this.baseUrl}api/Requerimiento/Registro/${id}`)
  }

  actualizarRequerimiento(body: any) {
    return this.http.put<ActualizarRequerimientoResponse>(`${this.baseUrl}api/Requerimiento/Registro/Actualizar`, body)
  }

  guardarPersona(body: any, esActualizacion: boolean) {
    return !esActualizacion 
            ? this.http.post<GenericResponse>(`${this.baseUrl}api/Persona/Registro/Agregar`, body) 
            : this.http.put<GenericResponse>(`${this.baseUrl}api/Persona/Registro/Actualizar`, body)
  }

  guardarEmpleado(body: any, esActualizacion: boolean) {
    return !esActualizacion 
            ? this.http.post<GenericResponse>(`${this.baseUrl}api/Empleado/Registro/Agregar`, body)
            : this.http.put<GenericResponse>(`${this.baseUrl}api/Empleado/Registro/Actualizar`, body)
  }

 guardarCostoEmpleado(body: any) {
    return this.http.post<GenericResponse>(`${this.baseUrl}api/Costo`, body)
  }
  
  toggleEstado(activo: boolean, id: number, esPersona = true) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/${ esPersona ? 'Persona' : 'Empleado'}/Estatus/Actualizar`, {
      id,
      boactivo: activo
    })
  }
   
  getContratosPorEmpleado(id: number) {
    return this.http.get<ContratosResponse>(`${this.baseUrl}api/Contrato/ContratosEmpleado/${id}`)
  }

  getCostoID(id: string) {
    return this.http.get<CostoEmpleadoResponse>(`${this.baseUrl}api/Costo/Empleado/${id}`)
  }

  guardarBeneficioCosto(body: any) {
    return this.http.post<GenericResponse>(`${this.baseUrl}/api/Beneficios`, body)
  }
  
  getContratoPorEmpleado(id: number) {
    return this.http.get<ContratoResponse>(`${this.baseUrl}api/Contrato/ContratoEmpleado/Registro/${id}`)
  }

  guardarCostoEmpleado(body: any , esActualizacion: boolean) {
    
    return this.http.post<GenericResponse>(`${this.baseUrl}api/Costo`, body)
    
  }

  guardarCostoEmpleadoActualiza(body: any , esActualizacion: boolean,id: string) {
    
    return this.http.put<GenericResponse>(`${this.baseUrl}${id}`, body)
  }

  guardarContrato(body: any, esActualizacion: boolean) {
    return esActualizacion 
    ? this.http.put<GenericResponse>(`${this.baseUrl}api/Contrato/ContratoEmpleado/Actualizar`, body)
    : this.http.post<GenericResponse>(`${this.baseUrl}api/Contrato/ContratoEmpleado/Agregar`, body)
  }

  // ./ Hecho por sebastian.flores

  saveEmpleado(empleado: CatEmpleado): Observable<any> {
    console.log(empleado);
    return this.http.put(`${this.baseUrl}api/empleado/Agregar`, empleado, { headers: this.httpHeaders });
  }

}
