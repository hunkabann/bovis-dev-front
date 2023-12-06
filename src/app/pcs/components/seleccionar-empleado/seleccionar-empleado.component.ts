import { Component, OnInit, inject } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';
import { Opcion } from '../../../../models/general.model';
import { Empleado } from 'src/app/timesheet/models/timesheet.model';

@Component({
  selector: 'app-seleccionar-empleado',
  templateUrl: './seleccionar-empleado.component.html',
  styleUrls: ['./seleccionar-empleado.component.css']
})
export class SeleccionarEmpleadoComponent implements OnInit {

  sharedService     = inject(SharedService)
  timesheetService  = inject(TimesheetService)

  empleadosOriginal: Empleado[] = []
  empleados: Opcion[] = []

  constructor(
    public ref: DynamicDialogRef
  ) { }

  ngOnInit(): void {
    
    this.sharedService.cambiarEstado(true)

    this.timesheetService.getEmpleados()
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: ({data}) => {
        this.empleadosOriginal = data
        this.empleados = this.empleadosOriginal.map(empleado => ({code: empleado.nunum_empleado_rr_hh.toString(), name: empleado.nombre_persona}))
      },
      error: (err) => this.closeDialog()
    })
  }

  seleccionarEmpleado(event: any) {
    const empleado = this.empleadosOriginal.find(empleado => empleado.nunum_empleado_rr_hh == event.value)
    this.ref.close({empleado})
  }

  closeDialog() {
    this.ref.close(null)
  }

}
