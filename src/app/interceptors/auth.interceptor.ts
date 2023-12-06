import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { MsalService } from '@azure/msal-angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: MsalService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accessToken = localStorage.getItem('tk');

    if (accessToken) {
      const cloned = request.clone({
        setHeaders: {
          Email:          localStorage.getItem('userMail'),
          Nombre:         localStorage.getItem('userName'),
          Authorization:  `Bearer ${accessToken}`,
          // 'User-Roles': ['it.dev', 'dev.full'],
        }
      });

      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('Unauthorized request', error);
            localStorage.removeItem('tk')
            localStorage.removeItem('userMail')
            localStorage.removeItem('userName')
            this.authService.logoutRedirect()
          }
          return throwError(error);
        })
      );
    } else {
      return next.handle(request);
    }
  }
}
