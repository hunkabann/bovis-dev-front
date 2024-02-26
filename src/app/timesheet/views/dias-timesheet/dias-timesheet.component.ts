import { Component, OnInit, inject } from '@angular/core';
import { TimesheetService } from '../../services/timesheet.service';
import { DiasTimesheet } from '../../models/timesheet.model';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize } from 'rxjs';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { format } from 'date-fns';
import { DialogService } from 'primeng/dynamicdialog';
import { ModificarFeriadosComponent } from '../../components/modificar-feriados/modificar-feriados.component';

@Component({
  selector: 'app-dias-timesheet',
  templateUrl: './dias-timesheet.component.html',
  styleUrls: ['./dias-timesheet.component.css'],
  providers: [MessageService, DialogService]
})
export class DiasTimesheetComponent implements OnInit {

  dialogService     = inject(DialogService)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  timesheetService  = inject(TimesheetService)

  diasTimesheet: DiasTimesheet[] = []
  mes: number = 0
  fechaActual: number = (+format(Date.now(), 'Y') + +format(Date.now(), 'M'))

  constructor() { }

  ngOnInit(): void {
    this.obtenerDias(this.mes)
  }

  buscarRegistros(event: any) {
    this.obtenerDias(+format((this.mes), 'M'))
  }

  modificarFeriados(ts: DiasTimesheet, index: number) {
    this.dialogService.open(ModificarFeriadosComponent, {
      header: 'Modificar Feriados',
      width: '50%',
      contentStyle: {overflow: 'auto'},
      data: {
        id:       ts.id,
        feriados: ts.feriados,
        mes:      ts.mes,
        anio:     ts.anio
      }
    })
    .onClose.subscribe((resp) => {
      if(resp) {
        if(resp.exito) {
          this.diasTimesheet.at(index).feriados = resp.dias
          this.diasTimesheet.at(index).sabados_feriados = resp.sabados
          this.messageService.add({severity: 'success', summary: TITLES.success, detail: 'Los días feriados han sido modificados.'})
        } else {
          this.messageService.add({severity: 'error', summary: TITLES.success, detail: SUBJECTS.error})
        }
      }
    })
  }

  limpiar() {
    this.obtenerDias(0)
    this.mes = null;
  }

  obtenerDias(mes: number) {
    
    this.sharedService.cambiarEstado(true)

    this.timesheetService.obtenerDiasTimesheet(mes)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.diasTimesheet = data
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

}
