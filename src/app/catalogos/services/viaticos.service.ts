import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Viaticos } from '../Models/catalogos';

@Injectable({
  providedIn: 'root'
})
export class ViaticosService {
  baseUrl = environment.urlApiBovis;

  constructor(private http: HttpClient) { }

  getViaticos() {
    return this.http.get<any>(`${this.baseUrl}api/catalogo/viatico`);
  }
}
