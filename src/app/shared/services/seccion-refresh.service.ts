// shared/services/seccion-refresh.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SeccionRefreshService {

  private refrescarSeccionSource = new Subject<number>();

  refrescarSeccion$ = this.refrescarSeccionSource.asObservable();

  refrescarSeccion(indexSeccion: number) {
    this.refrescarSeccionSource.next(indexSeccion);
  }
}
