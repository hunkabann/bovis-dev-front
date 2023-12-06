import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EmpleadoTNoProyecto } from '../../models/timesheet.model';
import { TimesheetService } from '../../services/timesheet.service';
import { DropdownOpcion } from 'src/models/general.model';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-agregar-proyecto',
  templateUrl: './agregar-proyecto.component.html',
  styleUrls: ['./agregar-proyecto.component.css'],
  providers: [MessageService]
})
export class AgregarProyectoComponent implements OnInit {

  empleadoId: number = null
  proyectos: DropdownOpcion[] = []

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private timesheetService: TimesheetService,
    private messageService: MessageService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    if(this.config.data.empleado.code) {
      this.empleadoId = this.config.data.empleado.code
      this.timesheetService.getProyectosFaltanEmpleado(this.empleadoId)
        .subscribe({
          next: ({data}) => this.proyectos = data.map(data => ({
            name: data.proyecto.toString(),
            value: data.numProyecto.toString()
          })),
          error: (err) => {}
        })
    } else {
      this.closeDialog()
    }
  }

  closeDialog() {
    this.ref.close({exito: false})
  }

  seleccionarProyecto(event: any) {
    if(event.value) {
      this.sharedService.cambiarEstado(true)

      this.timesheetService.agregarProyecto({id_empleado: this.empleadoId, id_proyecto: event.value})
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (data) => {
            this.ref.close({exito: true, registro: {
              proyectoId:     event.value,
              proyectoNombre: this.proyectos.find(data => data.value === event.value).name
            }})
          },
          error: (err) => this.ref.close({exito: false})
        })
    }
  }
}
