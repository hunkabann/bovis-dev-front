import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { EmpleadoProyecto } from 'src/app/timesheet/models/timesheet.model';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';

@Component({
  selector: 'app-mostrar-proyectos',
  templateUrl: './mostrar-proyectos.component.html',
  styleUrls: ['./mostrar-proyectos.component.css']
})
export class MostrarProyectosComponent implements OnInit {

  proyectos: EmpleadoProyecto[] = []

  constructor(
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private timesheetService: TimesheetService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    
    this.sharedService.cambiarEstado(true)

    const id = this.config.data.id
    if(id) {
      this.timesheetService.getProyectos(id)
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: ({data}) => {
            this.proyectos = data
          },
          error: (err) => this.ref.close()
        })
    } else {
      this.ref.close()
    }
  }

}
