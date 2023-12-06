import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthResponse } from '../models/Auth.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = environment.urlApiBovis;

  constructor(private http: HttpClient) { }

  getToken(email: string) {
    return this.http.post<AuthResponse>(`${ this.baseUrl }api/Token`, {
      email,
      username: environment.tokenUser,
      password: environment.tokenSecret
    })
    .pipe(map(data => {
      if(data) {
        localStorage.setItem('tk', data.token)
        return data.token
      } else {
        localStorage.removeItem('tk')
        return null
      }
    }))
  }
}
