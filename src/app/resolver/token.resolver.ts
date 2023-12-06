// role.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class TokenResolver implements Resolve<any> {

  constructor(private authService: AuthService, private userService: UserService) { }

  resolve(): Observable<any> {
    return of(
            this.authService.getToken(localStorage.getItem('userMail'))
              .subscribe(data => {
                this.userService.sendToken(data)
              })
            );
  }
}
