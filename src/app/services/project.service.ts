import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface GanttItem {
  x: [string, string];  // fechas en cadena
  y: string;            // nombre del proyecto
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

	http = inject(HttpClient)
	baseUrl = environment.urlApiBovis;

  constructor() { }

  /*
  getProjects(): Observable<GanttItem[]> {
    const data: GanttItem[] = [
      { x: ['2025-03-01', '2025-12-31'], y: 'nuevo de ingresos' },
      { x: ['2025-04-01', '2025-11-30'], y: 'uno' },
      { x: ['2025-05-01', '2025-11-30'], y: 'dos' },
      { x: ['2025-06-01', '2025-07-31'], y: 'tres' },
      { x: ['2025-08-01', '2025-12-31'], y: 'cuatro' }
    ];
    return of(data).pipe(delay(1000));
  }
    */

  getProjects(id: number, fecha: string): Observable<GanttItem[]> {
    //return this.http.get<GanttItem[]>(`${this.baseUrl}api/Pcs/EtapasP/${id}`);
    return this.http.get<any>(`${this.baseUrl}api/Pcs/EtapasP/${id}/${fecha}`).pipe(
      map(response => {
        // Aseguramos que data.data exista y sea un array
        const rawData = response?.data?.data || [];
        return rawData.map((item: any) => ({
          x: [item.x[0], item.x[1]],
          y: item.y
        })) as GanttItem[];
      })
    );
  }

}
