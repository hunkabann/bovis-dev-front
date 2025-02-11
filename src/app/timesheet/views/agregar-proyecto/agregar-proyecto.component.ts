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

    //console.log('entra ------ ' )

   // console.log('this.config.data.empleado.code ------ ' +this.config.data.code)

    if (this.config.data.code) {
      //console.log('cuando existe informacion  ------ ' +this.config.data.code)
      this.empleadoId = this.config.data.code
      //this.timesheetService.getProyectosFaltanEmpleadoNoClose(this.empleadoId)
      this.timesheetService.getProyectosFaltanEmpleado(this.empleadoId)
        .subscribe({
          next: ({data}) => 
            //this.proyectos = data.map(data => ({name: data.proyecto.toString(), value: data.numProyecto.toString()})),
            this.proyectos = data.map(proyecto => ({ name: proyecto.numProyecto.toString() + " - " + proyecto.proyecto.toString(), value: `${proyecto.numProyecto.toString()}` })),
          
          error: (err) => {}
        })
    } else {

      //console.log('this.config.data.empleado.code  ------ ' +this.config.data.empleado.code)

      if(this.config.data.empleado.code) {
       // console.log('cuando existe informacion del codigo empleado  ------ ' +this.config.data.empleado.code)
        this.empleadoId = this.config.data.empleado.code
        //this.timesheetService.getProyectosFaltanEmpleadoNoClose(this.empleadoId)
        this.timesheetService.getProyectosFaltanEmpleado(this.empleadoId)
          .subscribe({
            next: ({data}) => 
             // this.proyectos = data.map(data => ({name: data.proyecto.toString(), value: data.numProyecto.toString()})),
              this.proyectos = data.map(proyecto => ({ name: proyecto.numProyecto.toString() + " - " + proyecto.proyecto.toString(), value: `${proyecto.numProyecto.toString()}` })),
            error: (err) => {}
          })
      } else {
        this.closeDialog()
      }
      
    }

    
  }

  closeDialog() {
    this.ref.close({exito: false,registro:null})
  }

  seleccionarProyecto(event: any) {

    console.log('Alguien llama sin que se ejecute el seleccionar proyecto  ------ ')

    if(event.value) {
      this.sharedService.cambiarEstado(true)

     

      var arr = event.value.split('-'); //Note the space as well
      //console.log('valor del split' + arr[0]);
      //console.log('valor del split' + arr[1]);

      this.timesheetService.agregarProyecto({id_empleado: this.empleadoId, id_proyecto: event.value})
      //this.timesheetService.agregarProyecto({id_empleado: this.empleadoId, id_proyecto: arr[0].trim()})
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (data) => {
            this.ref.close({exito: true, registro: {
              proyectoId:     event.value,
              proyectoNombre: this.proyectos.find(data => data.value === event.value).name
             // tsproyect:
              //proyectoId:     arr[0].trim(),
              //proyectoNombre: arr[1]
            }})
          },
          error: (err) => this.ref.close({exito: false,registro:null})
        })
    }
  }
}
