import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ReportesService } from '../../services/reportes.service';
import { finalize } from 'rxjs';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { Reporte } from '../../models/reportes.model';

@Component({
  selector: 'app-ejecucion',
  templateUrl: './ejecucion.component.html',
  styleUrls: ['./ejecucion.component.css'],
  providers: [MessageService]
})
export class EjecucionComponent implements OnInit {

  activatedRoute  = inject(ActivatedRoute)
  messageService  = inject(MessageService)
  reportesService = inject(ReportesService)
  sharedService   = inject(SharedService)

  encabezados:  string[]
  datos:        any[]
  reporte:      Reporte

  constructor() { }

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)
    
    this.activatedRoute.params
      .subscribe(({id}) => {
        if(id) {
          this.buscarReporte(id)
        } else {
          this.sharedService.cambiarEstado(false)
        }
      })
  }

  buscarReporte(id: number) {
    
    this.reportesService.getReporte(id)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          if(data.length > 0) {
            const reporte = data[0]
            this.reporte = reporte
            this.ejecutarReporte(reporte.query)
          }
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })
  }

  ejecutarReporte(query: string) {
    
    this.sharedService.cambiarEstado(true)

    this.reportesService.ejecutarReporte(query)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          if(data.length > 0) {
            this.encabezados = Object.keys(data[0])
            this.datos = data
          }
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })
  }

}
