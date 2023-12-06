import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { CatalogosGenerales } from '../Models/catalogos';

@Injectable({
  providedIn: 'root'
})
export class CatalogosGeneralesService {
  baseUrl = environment.urlApiBovis;

  private httpHeaders = new HttpHeaders(
    { 'Content-Type': 'application/json' }
  )

  constructor(private http: HttpClient) { }

  getDataCatalogo(pathServicio: string) {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/${pathServicio}`);
  }

  saveElement(registro: CatalogosGenerales, pathServicio: string): Observable<any> {
    console.log(registro);
    return this.http.put(`${this.baseUrl}/api/catalogo/${pathServicio}/Agregar`, registro, { headers: this.httpHeaders });
  }

  updateElement(registro: CatalogosGenerales, pathServicio: string): Observable<any> {
    //console.log(registro);
    return this.http.post(`${this.baseUrl}/api/catalogo/${pathServicio}/Actualizar`, registro, { headers: this.httpHeaders });
  }

  deleteElement(registro: CatalogosGenerales, pathServicio: string): Observable<any> {
  //console.log(registro);
   const options = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    body: {
      id: registro.id
    },
  };
  return this.http
    .delete(`${this.baseUrl}/api/catalogo/${pathServicio}/Borrar`, options);
  }

}
