import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Opcion } from 'src/models/general.model';
import { TimesheetService } from '../../services/timesheet.service';
import { Timesheet } from '../../models/timesheet.model';
import { finalize, forkJoin } from 'rxjs';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { format } from 'date-fns';
import { CieService } from 'src/app/cie/services/cie.service';

@Component({
  selector: 'app-consultar',
  templateUrl: './consultar.component.html',
  styleUrls: ['./consultar.component.css'],
  providers: [MessageService]
})
export class ConsultarComponent implements AfterViewInit {

  activatedRoute    = inject(ActivatedRoute)
  cieService        = inject(CieService)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  timesheetService  = inject(TimesheetService)

  empleados:    Opcion[] = []
  proyectos:    Opcion[] = []
  unidades:     Opcion[] = []
  empresas:     Opcion[] = []
  timesheets:   Timesheet[] = []

  idEmpleado:   number = null
  idProyecto:   number = null
  idUnidad:     number = null
  idEmpresa:    number = null
  mes:          number = null

  constructor() { }

  ngAfterViewInit(): void {
    this.verificarEstado()

    this.sharedService.cambiarEstado(true)

    forkJoin([
      this.timesheetService.getEmpleadosByJefeEmail(localStorage.getItem('userMail') || ''),
      this.timesheetService.getCatProyectosByJefeEmail(localStorage.getItem('userMail') || ''),
      this.timesheetService.getCatUnidadNegocio(),
      this.cieService.getEmpresas()
    ])
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: (value) => {
        const [empleadosR, proyectosR, unidadesR, empresasR] = value
        this.empleados = empleadosR.data.map(({nunum_empleado_rr_hh, nombre_persona}) => ({name: nombre_persona, code: nunum_empleado_rr_hh.toString()}))
        this.proyectos = proyectosR.data.map(({numProyecto, nombre}) => ({name: nombre, code: numProyecto.toString()}))
        this.unidades = unidadesR.data.map(({id, descripcion}) => ({name: descripcion, code: id.toString()}))
        this.empresas = empresasR.data.map(({chempresa, nukidempresa}) => ({ name: chempresa, code: nukidempresa.toString()}))
        this.sharedService.cambiarEstado(false)
      },
      error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: SUBJECTS.error})
    })
  }

  verificarEstado() {

    this.activatedRoute.queryParams.subscribe(params => {
      // Access query parameters
      const success = params['success']

      if(success) {
        Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Horas guardadas', detail: 'Las horas han sido guardadas.' }))
      }
    });
  }

  buscarRegistros(event: any, tipo: string) {
    this.sharedService.cambiarEstado(true)

    const mesFormateado = this.mes ? +format(this.mes, 'M') : 0
    
    this.timesheetService.getTimeSheetsPorEmpleado(this.idEmpleado || 0, this.idProyecto || 0, this.idUnidad || 0, this.idEmpresa || 0, mesFormateado)
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: ({data}) => {
        this.timesheets = []
        data.map(ts => this.timesheets.push(ts))
        this.sharedService.cambiarEstado(false)
      },
      error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
    })
  }

  cambiarParticipacion(timesheet: Timesheet, idTimesheetProyecto: number, event: any) {

    const tsIndex = this.timesheets.findIndex(ts => ts.id === timesheet.id)
    if(tsIndex >= 0) {
      let selectedTimesheet = this.timesheets.at(tsIndex)
      const proyectoIndex = selectedTimesheet.proyectos.findIndex(proyecto => proyecto.idTimesheet_Proyecto === idTimesheetProyecto)
      if(proyectoIndex >= 0) {
        selectedTimesheet.proyectos.at(proyectoIndex).dias = +event.target.value
        const totalDias = this.calcularTotalDias(selectedTimesheet)
        if(totalDias > timesheet.dias_trabajo) {
          this.messageService.add({severity: 'error', summary: TITLES.error, detail: `El número de días no puede ser mayor a ${timesheet.dias_trabajo}`})
        } else if(totalDias >= 0) {
          
          selectedTimesheet.proyectos = timesheet.proyectos.map(proyecto => ({...proyecto, tDedicacion: Math.round((proyecto.dias / timesheet.dias_trabajo) * 100)}))

          const proyectoActualizado = timesheet.proyectos.at(proyectoIndex);

          this.sharedService.cambiarEstado(true)
          this.timesheetService.cambiarDiasDedicacion({
              id_timesheet_proyecto:  idTimesheetProyecto,
              num_dias:               proyectoActualizado.dias,
              num_dedicacion:         proyectoActualizado.tDedicacion
            })
            .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
            .subscribe({
              next: (data) => {
                if(totalDias < timesheet.dias_trabajo) {
                  this.messageService.add({severity: 'success', summary: TITLES.success, detail: 'Se ha guardardo el registro con éxito.'})
                  this.messageService.add({severity: 'warn', summary: 'Aviso', detail: `El número de días es menor a ${timesheet.dias_trabajo}.`, life: 5000})
                } else if(totalDias == timesheet.dias_trabajo) {
                  this.messageService.add({severity: 'success', summary: TITLES.success, detail: 'Se ha guardardo el registro con éxito.'})
                }
              },
              error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
            })
        }
      }
    }

  }

  calcularTotalDias(timesheet: Timesheet) {

    let total = 0
    timesheet.proyectos.forEach(proyecto => total += proyecto.dias)
    timesheet.otros.forEach(otro => total += otro.dias)
    return total
  }

}
