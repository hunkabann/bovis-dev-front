// role.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class RoleResolver implements Resolve<any> {

  constructor(private userService: UserService) { }

  resolve(): Observable<any> {
    return of(
            this.userService.getToken()
              .subscribe(data => {
                this.userService.getRoles()
                  .subscribe()
              })
            ) 
  }
}
