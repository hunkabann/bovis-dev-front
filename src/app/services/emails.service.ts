import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GenericResponse } from '../empleados/Models/empleados';

@Injectable({
  providedIn: 'root'
})
export class EmailsService {

  baseUrl = environment.urlApiBovis;
  
  http = inject(HttpClient)

  constructor() { }

  sendEmail(body: any) {
    return this.http.post<GenericResponse>(`${this.baseUrl}api/Email`, body)
  }
}
