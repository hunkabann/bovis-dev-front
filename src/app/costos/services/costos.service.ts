import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CostosEmpleadoResponse } from '../models/costos.model';

@Injectable({
  providedIn: 'root'
})
export class CostosService {

  baseUrl = environment.urlApiBovis;

  http = inject(HttpClient)

  constructor() { }

  getCostosEmpleado() {
    return this.http.get<CostosEmpleadoResponse>(`${ this.baseUrl }api/Costo/costos`)
  }
}
