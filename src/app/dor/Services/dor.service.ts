import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Objetivos, ObjetivosGeneralesNuevo } from '../Models/subordinados';
import { GenericResponse } from 'src/app/empleados/Models/empleados';

@Injectable({
  providedIn: 'root'
})
export class DorService {

  baseUrl = environment.urlApiBovis;
  totalCorporativoResultado: number = 0
  totalDeProyectoResultado: number = 0

  private httpHeaders = new HttpHeaders(
    { 'Content-Type': 'application/json' }
  )

  constructor(private http: HttpClient) { }

  sumarResultado(valor: number, corporativo: boolean = true) {
    Promise.resolve().then(() => {
      if(corporativo)
        this.totalCorporativoResultado += valor
      else
        this.totalDeProyectoResultado += valor
    })
  }

  getDatosEjecutivo(userMail: string | null): Observable<Object>{

    let mail = `{"email":"${userMail}"}`;
    return this.http.post<Object>(`${this.baseUrl}api/Dor/DatosEjecutivo`,mail, { headers: this.httpHeaders });
  }

  getDatosSubordinados(name: string): Observable<any> {
    let user = `{"nombre":"${name}"}`;
    //console.log(user);
    return this.http.post(`${this.baseUrl}api/DOR/ListaSubordinados`, user, { headers: this.httpHeaders });
  }

  getObjetivosByProyecto(anio: string, numProyecto: string, noEmpleado: string, nivel: string, tipo: number, mes: number = 0) {

    return this.http.get<any>(`${this.baseUrl}api/DOR/ConsultarObjetivosProyecto/${anio}/${numProyecto}/${noEmpleado}/${nivel}/${tipo}/${mes}`);
  }

  getObjetivosGenerales(nivel: string, unidad: string, mes: number = 0, modulo: string = 'Carga', anio: number = 0) {
    //console.log(nivel);
    return this.http.get<any>(`${this.baseUrl}api/DOR/ConsultarObjetivosGenerales/${nivel}/${unidad}/${mes}/${anio}/${modulo}`);
  }

  updateObjetivos(objetivo: Objetivos): Observable<any> {
    //console.log(objetivo);
    return this.http.put(`${this.baseUrl}api/dor/ActualizarObjetivos`, objetivo, { headers: this.httpHeaders });
  }


  getDatosEmpleado(userMail: string | null) {
    let mail = `{"email":"${userMail}"}`;
    return this.http.post<any>(`${this.baseUrl}api/dor/DatosEmpleado`,mail, { headers: this.httpHeaders });
  }

  // getConsultarGPM(proyecto: string | null) {
  //   return this.http.get<any>(`${this.baseUrl}api/dor/ConsultarGPM/${proyecto}`);
  // }

  getConsultarMetasProyecto(proyecto: string | null,nivel: string | null, mes: number = 0, modulo: string = 'Carga', empleado: number = 0, anio: number = 0) {
    return this.http.get<any>(`${this.baseUrl}api/dor/ConsultarMetas/${proyecto}/${nivel}/${mes}/${anio}/${empleado}/${modulo}`);
  }

  actualizarReal(body: any) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/DOR/UpdateReal`, body, { headers: this.httpHeaders })
  }

  actualizarRealCualitativos(body: any) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/DOR/UpdateObjetivoPersonal`, body, { headers: this.httpHeaders })
  }

  actualizarAcepto(num_empleado: number) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/DOR/UpdateAcepto`, {
      num_empleado,
      acepto: 5
    }, { headers: this.httpHeaders })
  }

}
