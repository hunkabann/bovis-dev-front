import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Viaticos } from '../Models/catalogos';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {


  baseUrl = environment.urlApiBovis;

  constructor(private http: HttpClient) { }

}
