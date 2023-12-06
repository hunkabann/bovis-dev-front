import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ReportesService } from '../../services/reportes.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Reporte } from '../../models/reportes.model';
import { finalize } from 'rxjs';
import { SUBJECTS, TITLES } from 'src/utils/constants';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css'],
  providers: [MessageService]
})
export class ListaComponent implements OnInit {

  messageService  = inject(MessageService)
  reportesService = inject(ReportesService)
  sharedService   = inject(SharedService)

  reportes: Reporte[] = []

  constructor() { }

  ngOnInit(): void {
    
    this.sharedService.cambiarEstado(true)
    
    this.reportesService.getReporte()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.reportes = data
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })
  }

}
