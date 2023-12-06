import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Viaticos } from '../../catalogos/Models/catalogos';

@Injectable({
  providedIn: 'root'
})
export class ServicetestService {
  baseUrl = environment.urlApiBovis;

  constructor(private http: HttpClient) { }

  getViaticos() {
    return this.http.get<Viaticos>(`${this.baseUrl}api/catalogo/viatico`);
  }
}
