import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Opcion } from 'src/models/general.model';
import { TimesheetService } from '../../services/timesheet.service';
import { Timesheet } from '../../models/timesheet.model';
import { finalize, forkJoin } from 'rxjs';
import { MODULOS, SUBJECTS, TITLES } from 'src/utils/constants';
import { format } from 'date-fns';
import { CieService } from 'src/app/cie/services/cie.service';
import { ProyectoJoinPipe } from '../../pipes/proyecto-join.pipe';
import { UserService } from 'src/app/services/user.service';
import { EmpleadosService } from 'src/app/empleados/services/empleados.service';
import { FacturacionService } from 'src/app/facturacion/services/facturacion.service';

@Component({
  selector: 'app-consultar',
  templateUrl: './consultar.component.html',
  styleUrls: ['./consultar.component.css'],
  providers: [MessageService, ProyectoJoinPipe]
})
export class ConsultarComponent implements OnInit { //AfterViewInit {

  activatedRoute = inject(ActivatedRoute)
  cieService = inject(CieService)
  messageService = inject(MessageService)
  sharedService = inject(SharedService)
  timesheetService = inject(TimesheetService)
  proyectoJoin = inject(ProyectoJoinPipe)
  userService = inject(UserService)
  empleadosService = inject(EmpleadosService)
  facturacionService = inject(FacturacionService)

  empleados: Opcion[] = []
  proyectos: Opcion[] = []
  unidades: Opcion[] = []
  empresas: Opcion[] = []
  timesheets: Timesheet[] = []

  idEmpleado: number = null
  idProyecto: number = null
  idUnidad: number = null
  idEmpresa: number = null
  mes: number = null

  CalculaDias: number = null
  CalculaDedica: number = null

  constructor() { }

  //ngAfterViewInit(): void {
  ngOnInit(): void {
    this.verificarEstado()

    this.sharedService.cambiarEstado(true)

    if (!localStorage.getItem('esTimesheet')) {
      localStorage.setItem('esTimesheet', '1')
      window.location.reload()
    }

    this.userService.getRolesRealTime()
      .subscribe(data => {

        //console.log(data)
        forkJoin([
          this.userService.verificarRol(MODULOS.TIMESHEET_CONSULTA_MODIFICACION)?.administrador ? this.empleadosService.getEmpleados() : this.timesheetService.getEmpleadosByJefeEmail(localStorage.getItem('userMail') || ''),
          this.userService.verificarRol(MODULOS.TIMESHEET_CONSULTA_MODIFICACION)?.administrador ? this.facturacionService.getProyectos() : this.timesheetService.getCatProyectosByJefeEmail(localStorage.getItem('userMail') || ''),
          this.timesheetService.getCatUnidadNegocio(),
          this.cieService.getEmpresas()
        ])
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: (value) => {
              const [empleadosR, proyectosR, unidadesR, empresasR] = value
              this.empleados = empleadosR.data.map(({ nunum_empleado_rr_hh, nombre_persona }) => ({ name: nombre_persona, code: nunum_empleado_rr_hh.toString() }))
              this.proyectos = proyectosR.data.map(({ numProyecto, nombre }) => ({ name: nombre, code: numProyecto.toString() }))
              this.unidades = unidadesR.data.map(({ id, descripcion }) => ({ name: descripcion, code: id.toString() }))
              this.empresas = empresasR.data.map(({ chempresa, nukidempresa }) => ({ name: chempresa, code: nukidempresa.toString() }))
              this.sharedService.cambiarEstado(false)
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
          })
      })
  }

  verificarEstado() {

    this.activatedRoute.queryParams.subscribe(params => {
      // Access query parameters
      const success = params['success']

      if (success) {
        Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Horas guardadas', detail: 'Las horas han sido guardadas.' }))
      }
    });
  }

  buscarRegistros(event: any, tipo: string) {
    this.sharedService.cambiarEstado(true)

    const mesFormateado = this.mes ? +format(this.mes, 'M') : 0
    const anioFormateado = this.mes ? +format(this.mes, 'Y') : 0

    this.timesheetService.getTimeSheetsPorEmpleado(this.idEmpleado || 0, this.idProyecto || 0, this.idUnidad || 0, this.idEmpresa || 0, mesFormateado, anioFormateado)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({ data }) => {
          this.timesheets = []
          this.timesheets = data.map(ts => ({
            ...ts,
            proyectosJoin: this.proyectoJoin.transform(ts.proyectos, 'proyectos', ts.dias_trabajo),
            proyectosDiasJoin: Math.round(this.proyectoJoin.transform(ts.proyectos, 'proyectosDias')),
            otrosJoin: this.proyectoJoin.transform(ts.otros, 'otros', ts.dias_trabajo),
            otrosDiasJoin: this.proyectoJoin.transform(ts.otros, 'otrosDias'),
            completado: ((this.proyectoJoin.transformCalcula(ts.proyectos, 'proyectos', ts.dias_trabajo)) + (this.proyectoJoin.transformCalcula(ts.otros, 'otros', ts.dias_trabajo))) < 100
          })).sort((a, b) => {
            if (a.completado === b.completado) {
              return 0
            } else if (a.completado === true) {
              return -1
            } else {
              return 1
            }
          })
          this.sharedService.cambiarEstado(false)
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  limpiar() {
    this.idEmpleado = null
    this.idProyecto = null
    this.idUnidad = null
    this.idEmpresa = null
    this.mes = null
  }

  cambiarParticipacion(timesheet: Timesheet, idTimesheetProyecto: number, event: any) {

    const tsIndex = this.timesheets.findIndex(ts => ts.id === timesheet.id)
    if (tsIndex >= 0) {
      let selectedTimesheet = this.timesheets.at(tsIndex)
      const proyectoIndex = selectedTimesheet.proyectos.findIndex(proyecto => proyecto.idTimesheet_Proyecto === idTimesheetProyecto)
      if (proyectoIndex >= 0) {
        selectedTimesheet.proyectos.at(proyectoIndex).dias = +event.target.value
        //selectedTimesheet.proyectos.at(proyectoIndex).tDedicacion = this.formateaValor((+event.target.value / timesheet.dias_trabajo) * 100)
        selectedTimesheet.proyectos.at(proyectoIndex).tDedicacion = Math.round((+event.target.value / timesheet.dias_trabajo) * 100)
        const totalDias = this.calcularTotalDias(selectedTimesheet)
        const totalDedica = this.calcularTotalDedica(selectedTimesheet)
        //console.log("totalDias: "+ totalDias)
        //console.log("totalDedica: "+ totalDedica)

        //this.CalculaDias = this.formateaValor(this.calcularTotalDiasProy(selectedTimesheet))
        //this.CalculaDedica = this.formateaValor((this.calcularTotalDiasProy(selectedTimesheet)*100)/timesheet.dias_trabajo)
        this.CalculaDias = this.calcularTotalDiasProy(selectedTimesheet)
        this.CalculaDedica = Math.round((this.calcularTotalDiasProy(selectedTimesheet)*100)/timesheet.dias_trabajo)
        if (totalDias > timesheet.dias_trabajo) {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: `El número de días no puede ser mayor a ${timesheet.dias_trabajo}` })
        } else if (totalDias >= 0) {

          //selectedTimesheet.proyectos = timesheet.proyectos.map(proyecto => ({ ...proyecto, tDedicacion: this.formateaValor((proyecto.dias / timesheet.dias_trabajo) * 100) }))
          selectedTimesheet.proyectos = timesheet.proyectos.map(proyecto => ({ ...proyecto, tDedicacion: Math.round((proyecto.dias / timesheet.dias_trabajo) * 100 )}))

          const proyectoActualizado = timesheet.proyectos.at(proyectoIndex);

          this.sharedService.cambiarEstado(true)

          //console.log("proyectoActualizado.dias: "+ proyectoActualizado.dias)
          //console.log("proyectoActualizado.tDedicacion: "+ proyectoActualizado.tDedicacion)

          this.timesheetService.cambiarDiasDedicacion({
            id_timesheet_proyecto: idTimesheetProyecto,
            num_dias: proyectoActualizado.dias,
            num_dedicacion: Math.round(proyectoActualizado.tDedicacion)

          })
            .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
            .subscribe({
              next: (data) => {
                if (totalDias < timesheet.dias_trabajo) {
                  const mesFormateado = this.mes ? +format(this.mes, 'M') : 0
                  const anioFormateado = this.mes ? +format(this.mes, 'Y') : 0
              
                  this.timesheetService.getTimeSheetsPorEmpleado(this.idEmpleado || 0, this.idProyecto || 0, this.idUnidad || 0, this.idEmpresa || 0, mesFormateado, anioFormateado)
                    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                    .subscribe({
                      next: ({ data }) => {
                        this.timesheets = []
                        this.timesheets = data.map(ts => ({
                          ...ts,
                          proyectosJoin: this.proyectoJoin.transform(ts.proyectos, 'proyectos', ts.dias_trabajo),
                          proyectosDiasJoin: Math.round(this.proyectoJoin.transform(ts.proyectos, 'proyectosDias')),
                          otrosJoin: this.proyectoJoin.transform(ts.otros, 'otros', ts.dias_trabajo),
                          otrosDiasJoin: this.proyectoJoin.transform(ts.otros, 'otrosDias'),
                          completado: ((this.proyectoJoin.transformCalcula(ts.proyectos, 'proyectos', ts.dias_trabajo)) + (this.proyectoJoin.transformCalcula(ts.otros, 'otros', ts.dias_trabajo))) < 100
                        })).sort((a, b) => {
                          if (a.completado === b.completado) {
                            return 0
                          } else if (a.completado === true) {
                            return -1
                          } else {
                            return 1
                          }
                        })
                        this.sharedService.cambiarEstado(false)
                      },
                      error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
                    })

                  this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'Se ha guardardo el registro con éxito.' })
                 // this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: `El número de días es menor a ${timesheet.dias_trabajo}.`, life: 5000 })
                } else if (totalDias == timesheet.dias_trabajo) {
                  const mesFormateado = this.mes ? +format(this.mes, 'M') : 0
                  const anioFormateado = this.mes ? +format(this.mes, 'Y') : 0
              
                  this.timesheetService.getTimeSheetsPorEmpleado(this.idEmpleado || 0, this.idProyecto || 0, this.idUnidad || 0, this.idEmpresa || 0, mesFormateado, anioFormateado)
                    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                    .subscribe({
                      next: ({ data }) => {
                        this.timesheets = []
                        this.timesheets = data.map(ts => ({
                          ...ts,
                          proyectosJoin: this.proyectoJoin.transform(ts.proyectos, 'proyectos', ts.dias_trabajo),
                          proyectosDiasJoin: Math.round(this.proyectoJoin.transform(ts.proyectos, 'proyectosDias')),
                          otrosJoin: this.proyectoJoin.transform(ts.otros, 'otros', ts.dias_trabajo),
                          otrosDiasJoin: this.proyectoJoin.transform(ts.otros, 'otrosDias'),
                          completado: ((this.proyectoJoin.transformCalcula(ts.proyectos, 'proyectos', ts.dias_trabajo)) + (this.proyectoJoin.transformCalcula(ts.otros, 'otros', ts.dias_trabajo))) < 100
                        })).sort((a, b) => {
                          if (a.completado === b.completado) {
                            return 0
                          } else if (a.completado === true) {
                            return -1
                          } else {
                            return 1
                          }
                        })
                        this.sharedService.cambiarEstado(false)
                      },
                      error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
                    })
                  this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'Se ha guardardo el registro con éxito.' })
                }
              },
              error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
            })
        }
      }
    }

  }

  cambiarParticipacionDedica(timesheet: Timesheet, idTimesheetProyecto: number, event: any) {
    

    //console.log("Valor de dedicación: " + +event.target.value)
    const tsIndex = this.timesheets.findIndex(ts => ts.id === timesheet.id)
    if (tsIndex >= 0) {
      let selectedTimesheet = this.timesheets.at(tsIndex)
      const proyectoIndex = selectedTimesheet.proyectos.findIndex(proyecto => proyecto.idTimesheet_Proyecto === idTimesheetProyecto)
      if (proyectoIndex >= 0) {
        selectedTimesheet.proyectos.at(proyectoIndex).tDedicacion = Math.round(+event.target.value)
        //selectedTimesheet.proyectos.at(proyectoIndex).dias = this.formateaValor((+event.target.value * timesheet.dias_trabajo) / 100) 
        selectedTimesheet.proyectos.at(proyectoIndex).dias = (+event.target.value * timesheet.dias_trabajo) / 100
        const totalDias = this.calcularTotalDias(selectedTimesheet)
        const totalDedica = this.calcularTotalDedica(selectedTimesheet)
       //console.log("cambiarParticipacionDedica -  totalDias: "+ totalDias)
        //console.log("cambiarParticipacionDedica -  totalDedica: "+ totalDedica)
          //selectedTimesheet.  = timesheet.proyectos.map(proyecto => ({ ...proyecto, dias: this.formateaValor((+event.target.value * timesheet.dias_trabajo) / 100) }))
          //this.CalculaDias = this.formateaValor(this.calcularTotalDiasProy(selectedTimesheet))
          //this.CalculaDedica = this.formateaValor((this.calcularTotalDiasProy(selectedTimesheet)*100)/timesheet.dias_trabajo)
          this.CalculaDias = this.calcularTotalDiasProy(selectedTimesheet)
          this.CalculaDedica = (this.calcularTotalDiasProy(selectedTimesheet)*100)/timesheet.dias_trabajo

        //if (totalDias > timesheet.dias_trabajo) {
          if (totalDedica > 100) {
          
            const mesFormateado = this.mes ? +format(this.mes, 'M') : 0
            const anioFormateado = this.mes ? +format(this.mes, 'Y') : 0
        
            this.timesheetService.getTimeSheetsPorEmpleado(this.idEmpleado || 0, this.idProyecto || 0, this.idUnidad || 0, this.idEmpresa || 0, mesFormateado, anioFormateado)
              .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
              .subscribe({
                next: ({ data }) => {
                  this.timesheets = []
                  this.timesheets = data.map(ts => ({
                    ...ts,
                    proyectosJoin: totalDedica,
                    proyectosDiasJoin: Math.round(this.proyectoJoin.transform(ts.proyectos, 'proyectosDias')),
                    otrosJoin: this.proyectoJoin.transform(ts.otros, 'otros', ts.dias_trabajo),
                    otrosDiasJoin: this.proyectoJoin.transform(ts.otros, 'otrosDias'),
                    completado: ((this.proyectoJoin.transformCalcula(ts.proyectos, 'proyectos', ts.dias_trabajo)) + (this.proyectoJoin.transformCalcula(ts.otros, 'otros', ts.dias_trabajo))) < 100
                  })).sort((a, b) => {
                    if (a.completado === b.completado) {
                      return 0
                    } else if (a.completado === true) {
                      return -1
                    } else {
                      return 1
                    }
                  })
                  this.sharedService.cambiarEstado(false)
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
              })

          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: `La Dedicación no puede ser mayor a 100%` })
        } else if (totalDedica >= 0) {

          //selectedTimesheet.proyectos = timesheet.proyectos.map(proyecto => ({ ...proyecto, dias: this.formateaValor((+event.target.value * timesheet.dias_trabajo) / 100) }))

          const proyectoActualizado = timesheet.proyectos.at(proyectoIndex);

          this.sharedService.cambiarEstado(true)
          //console.log("cambiarParticipacionDedica - proyectoActualizado.dias: "+ proyectoActualizado.dias)
          //console.log("cambiarParticipacionDedica - proyectoActualizado.tDedicacion: "+ proyectoActualizado.tDedicacion)
          this.timesheetService.cambiarDiasDedicacion({
            id_timesheet_proyecto: idTimesheetProyecto,
            num_dias: proyectoActualizado.dias,
            num_dedicacion: Math.round(proyectoActualizado.tDedicacion)
          })
            .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
            .subscribe({
              next: (data) => {
                if (totalDedica < 100) {
                  const mesFormateado = this.mes ? +format(this.mes, 'M') : 0
                  const anioFormateado = this.mes ? +format(this.mes, 'Y') : 0
              
                  this.timesheetService.getTimeSheetsPorEmpleado(this.idEmpleado || 0, this.idProyecto || 0, this.idUnidad || 0, this.idEmpresa || 0, mesFormateado, anioFormateado)
                    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                    .subscribe({
                      next: ({ data }) => {
                        this.timesheets = []
                        this.timesheets = data.map(ts => ({
                          ...ts,
                          proyectosJoin: this.proyectoJoin.transform(ts.proyectos, 'proyectos', ts.dias_trabajo),
                          proyectosDiasJoin: Math.round(this.proyectoJoin.transform(ts.proyectos, 'proyectosDias')),
                          otrosJoin: this.proyectoJoin.transform(ts.otros, 'otros', ts.dias_trabajo),
                          otrosDiasJoin: this.proyectoJoin.transform(ts.otros, 'otrosDias'),
                          completado: ((this.proyectoJoin.transformCalcula(ts.proyectos, 'proyectos', ts.dias_trabajo)) + (this.proyectoJoin.transformCalcula(ts.otros, 'otros', ts.dias_trabajo))) < 100
                        })).sort((a, b) => {
                          if (a.completado === b.completado) {
                            return 0
                          } else if (a.completado === true) {
                            return -1
                          } else {
                            return 1
                          }
                        })
                        this.sharedService.cambiarEstado(false)
                      },
                      error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
                    })
                  this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'Se ha guardardo el registro con éxito.' })
                  //this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: `dedicación es menor a 100%.`, life: 5000 })
                } else if (totalDedica == 100) {
                  const mesFormateado = this.mes ? +format(this.mes, 'M') : 0
                  const anioFormateado = this.mes ? +format(this.mes, 'Y') : 0
              
                  this.timesheetService.getTimeSheetsPorEmpleado(this.idEmpleado || 0, this.idProyecto || 0, this.idUnidad || 0, this.idEmpresa || 0, mesFormateado, anioFormateado)
                    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                    .subscribe({
                      next: ({ data }) => {
                        this.timesheets = []
                        this.timesheets = data.map(ts => ({
                          ...ts,
                          proyectosJoin: this.proyectoJoin.transform(ts.proyectos, 'proyectos', ts.dias_trabajo),
                          proyectosDiasJoin: Math.round(this.proyectoJoin.transform(ts.proyectos, 'proyectosDias')),
                          otrosJoin: this.proyectoJoin.transform(ts.otros, 'otros', ts.dias_trabajo),
                          otrosDiasJoin: this.proyectoJoin.transform(ts.otros, 'otrosDias'),
                          completado: ((this.proyectoJoin.transformCalcula(ts.proyectos, 'proyectos', ts.dias_trabajo)) + (this.proyectoJoin.transformCalcula(ts.otros, 'otros', ts.dias_trabajo))) < 100
                        })).sort((a, b) => {
                          if (a.completado === b.completado) {
                            return 0
                          } else if (a.completado === true) {
                            return -1
                          } else {
                            return 1
                          }
                        })
                        this.sharedService.cambiarEstado(false)
                      },
                      error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
                    })
                  this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'Se ha guardardo el registro con éxito.' })
                }
              },
              error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
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


  calcularTotalDiasProy(timesheet: Timesheet) {

    let total = 0
    timesheet.proyectos.forEach(proyecto => total += proyecto.dias)
    //timesheet.otros.forEach(otro => total += otro.dias)
    return total
  }

  calcularTotalDedica(timesheet: Timesheet) {

    let total = 0
    timesheet.proyectos.forEach(proyecto => total += proyecto.tDedicacion)
    timesheet.otros.forEach(otro => total += otro.tDedicacion)
    return total
  }

  //formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
  //  return isNaN(valor) ? valor : parseFloat(valor).toFixed(0);
  //}

}
