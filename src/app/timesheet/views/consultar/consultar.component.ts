import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Opcion } from 'src/models/general.model';
import { TimesheetService } from '../../services/timesheet.service';
import { Proyecto, Timesheet } from '../../models/timesheet.model';
import { finalize, forkJoin } from 'rxjs';
import { MODULOS, SUBJECTS, TITLES,EXCEL_EXTENSION } from 'src/utils/constants';
import { format } from 'date-fns';
import { CieService } from 'src/app/cie/services/cie.service';
import { ProyectoJoinPipe } from '../../pipes/proyecto-join.pipe';
import { UserService } from 'src/app/services/user.service';
import { EmpleadosService } from 'src/app/empleados/services/empleados.service';
import { FacturacionService } from 'src/app/facturacion/services/facturacion.service';
import { ModificarComponent } from '../modificar/modificar.component';

import { DialogService } from 'primeng/dynamicdialog';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';

import { encabezados } from '../../models/timesheet.model';

@Component({
  selector: 'app-consultar',
  templateUrl: './consultar.component.html',
  styleUrls: ['./consultar.component.css'],
  providers: [MessageService, ProyectoJoinPipe,DialogService]
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
  dialogService     = inject(DialogService)

  empleados: Opcion[] = []
  proyectos: Opcion[] = []
  unidades: Opcion[] = []
  empresas: Opcion[] = []
  timesheets: Timesheet[] = []

  consultaExcel: Timesheet[] = []
  consultaExcelProyecto: Proyecto[] = []

  idEmpleado: number = null
  idProyecto: number = null
  idUnidad: number = null
  idEmpresa: number = null
  mes: number = null

  CalculaDias: number = null
  CalculaDedica: number = null

  today: Date = new Date();
  pipe = new DatePipe('en-US');
  todayWithPipe = null;

  indexcolum: number

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
              //this.empleados = empleadosR.data.map(({ nunum_empleado_rr_hh, nombre_persona }) => ({ name: nombre_persona, code: nunum_empleado_rr_hh.toString() }))
              this.empleados = empleadosR.data.map(empleado => ({ code: empleado.nunum_empleado_rr_hh.toString(), name: `${empleado.nunum_empleado_rr_hh.toString()} - ${empleado.nombre_persona}` }))
              //this.proyectos = proyectosR.data.map(({ numProyecto, nombre }) => ({ name: nombre, code: numProyecto.toString() }))
              this.proyectos = proyectosR.data.map(proyecto => ({ code: proyecto.numProyecto.toString(), name: `${proyecto.numProyecto.toString()} - ${proyecto.nombre}` }))
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

    console.log('this.mes '+ this.mes);
    

    const mesFormateado = this.mes ? +format(this.mes, 'M') : 0
    const anioFormateado = this.mes ? +format(this.mes, 'Y') : 0

    this.timesheetService.getTimeSheetsPorEmpleado(this.idEmpleado || 0, this.idProyecto || 0, this.idUnidad || 0, this.idEmpresa || 0, mesFormateado, anioFormateado)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({ data }) => {
          this.timesheets = []

          this.consultaExcel = data

          this.timesheets = data.map(ts => ({
            ...ts,
            proyectosJoin: this.proyectoJoin.transform(ts.proyectos, 'proyectos', ts.dias_trabajo),
            proyectosDiasJoin: Math.round(this.proyectoJoin.transform(ts.proyectos, 'proyectosDias')),
            otrosJoin: this.proyectoJoin.transform(ts.otros, 'otros', ts.dias_trabajo),
            otrosDiasJoin: this.proyectoJoin.transform(ts.otros, 'otrosDias'),
            completado: ((this.proyectoJoin.transformCalcula(ts.proyectos, 'proyectos', ts.dias_trabajo)) + (this.proyectoJoin.transformCalcula(ts.otros, 'otros', ts.dias_trabajo))) < 100 || ((this.proyectoJoin.transformCalcula(ts.proyectos, 'proyectos', ts.dias_trabajo)) + (this.proyectoJoin.transformCalcula(ts.otros, 'otros', ts.dias_trabajo))) > 100
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

  CargarHorasModal(timesheet: number) {
   
    this.dialogService.open(ModificarComponent, {
      header: 'Carga Horas',
      width: '95%',
      height: '95%',
      contentStyle: {overflow: 'auto'},
      data: {
        code: timesheet
      }
    })
    .onClose.subscribe(() => {
      
        this.buscarRegistros('','')

    })
  }

  exportJsonToExcel(): void {

    const workbook = new ExcelJS.Workbook()

    const worksheet = workbook.addWorksheet('Detalle')

    // Tìtulos
    this._setXLSXTitles(worksheet)

    // Encabezados
    this._setXLSXHeader(worksheet)

    let row = 5
    // Contenido
    row = this._setXLSXContent(worksheet, row)

    // Contenido
    //this._setXLSXContent(worksheet)

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      //saveAs(blob, `FacturacionCancelacion_${Date.now()}${EXCEL_EXTENSION}`)
      this.todayWithPipe = this.pipe.transform(Date.now(), 'dd_MM_yyyy');

      saveAs(blob, `Consulta_TimeSheet_` + this.todayWithPipe + `${EXCEL_EXTENSION}`)
    });
  }

  _setXLSXTitles(worksheet: ExcelJS.Worksheet) {

    const fillNota: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } }
    //const fillNotaCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillCobranza: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffa4ffa4' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }


    worksheet.getCell('H3').value = 'PROYECTOS'
    worksheet.getCell('H3').fill = fillNota
    worksheet.getCell('H3').alignment = alignment
    worksheet.mergeCells('H3:AF3')

    

    

    
  }

  _setXLSXHeader(worksheet: ExcelJS.Worksheet) {
    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff91d2ff' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }

    encabezados.forEach((encabezado, index) => {
      let cell = worksheet.getCell(4, index + 1)
      cell.value = encabezado.label

     /**  this.consultaExcel.forEach(record => {
        
  
        this.consultaExcelProyecto = record.proyectos

        cell.value = encabezado.label
      
      });*/

      cell.fill = fill
      cell.alignment = alignment
    })
  }

  _setXLSXContent(worksheet: ExcelJS.Worksheet, row: number): number {

    const fillCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillFactura: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } }


    


    this.consultaExcel.forEach(record => {
      //worksheet.getCell(row).fill = record.fechaCancelacion ? fillCancelada : fillFactura
      //const col = row.getCell(row);


      this.consultaExcelProyecto = record.proyectos
        // console.log("suma fuerapaso.cost-------------->> " +this.Costomenualproy);

       // worksheet.getCell(row, 1).value = record.coi_empresa
        worksheet.getCell(row, 1).value = record.mes
        worksheet.getCell(row, 2).value = record.anio
        worksheet.getCell(row, 3).value = record.num_empleado
        worksheet.getCell(row, 4).value = record.empleado     
        worksheet.getCell(row, 5).value = record.responsable      
        worksheet.getCell(row, 6).value = record.dias_trabajo 
        


        this.indexcolum  = 7
        const dato = this.consultaExcelProyecto;
                         dato?.forEach(paso=>{

                             console.log("paso.beneficio --------------> " +paso.descripcion);

                             worksheet.getCell(row, this.indexcolum++).value = paso.descripcion
                             worksheet.getCell(row, this.indexcolum++).value = paso.dias
                             worksheet.getCell(row, this.indexcolum++).value = paso.tDedicacion
                             worksheet.getCell(row, this.indexcolum++).value = paso.costo
                             //console.log("paso.cost-------------->> " +paso.costo);
                
                             //this.Costomenualproy += +paso.costo
                
                             //console.log("suma paso.cost-------------->> " +this.Costomenualproy);
                            
                         })

      /**
      worksheet.getCell(row, 8).value = record.unidadNegocio
      worksheet.getCell(row, 9).value = record.empresa
      worksheet.getCell(row, 10).value = record.nombreJefe
      let newDate = new Date(record.fechaIngreso);
      this.FechaIngre = this.pipe.transform(newDate, 'dd-MM-yyyy');
      worksheet.getCell(row, 11).value = this.FechaIngre
      worksheet.getCell(row, 12).value = record.antiguedad
      worksheet.getCell(row, 13).value = this.formatCurrency(record.avgDescuentoEmpleado)
      worksheet.getCell(row, 14).value = this.formatCurrency(record.montoDescuentoMensual)
      worksheet.getCell(row, 15).value = this.formatCurrency(record.sueldoNetoPercibidoMensual)
      worksheet.getCell(row, 16).value = this.formatCurrency(record.retencionImss)
      let numero_ispt = Number(record.ispt)
      worksheet.getCell(row, 17).value = this.formatCurrency(numero_ispt)
      worksheet.getCell(row, 18).value =this.formatCurrency( record.anual)
      worksheet.getCell(row, 19).value = this.formatCurrency(record.aguinaldoCantidadMeses)
      worksheet.getCell(row, 20).value = this.formatCurrency(record.aguinaldoMontoProvisionMensual)
      worksheet.getCell(row, 21).value = record.pvDiasVacasAnuales
      worksheet.getCell(row, 22).value = this.formatCurrency(record.pvProvisionMensual)
      worksheet.getCell(row, 23).value = this.formatCurrency(record.indemProvisionMensual)
      worksheet.getCell(row, 24).value = this.formatCurrency(record.avgBonoAnualEstimado)
      worksheet.getCell(row, 25).value = this.formatCurrency(record.bonoAnualProvisionMensual)
      worksheet.getCell(row, 26).value = record.sgmmCostoTotalAnual
      worksheet.getCell(row, 27).value = this.formatCurrency(record.sgmmCostoMensual)
      worksheet.getCell(row, 28).value = this.formatCurrency(record.svCostoTotalAnual)
      worksheet.getCell(row, 29).value = this.formatCurrency(record.svCostoMensual)
      worksheet.getCell(row, 30).value = this.formatCurrency(record.vaidCostoMensual)
      worksheet.getCell(row, 31).value = this.formatCurrency(record.vaidComisionCostoMensual)
      worksheet.getCell(row, 32).value = this.formatCurrency(record.ptuProvision)
      worksheet.getCell(row, 33).value = this.formatCurrency(record.impuesto3sNomina)
      worksheet.getCell(row, 34).value = this.formatCurrency(record.imss)
      worksheet.getCell(row, 35).value = this.formatCurrency(record.retiro2)
      worksheet.getCell(row, 36).value = this.formatCurrency(record.cesantesVejez)
      worksheet.getCell(row, 37).value = this.formatCurrency(record.infonavit)
      worksheet.getCell(row, 38).value = this.formatCurrency(record.cargasSociales)
      worksheet.getCell(row, 39).value = this.formatCurrency(record.costoMensualEmpleado+this.Costomenualproy)
      worksheet.getCell(row, 40).value = this.formatCurrency(record.costoMensualProyecto)
      worksheet.getCell(row, 41).value = this.formatCurrency(record.costoAnualEmpleado)
      worksheet.getCell(row, 42).value = this.formatCurrency(record.costoSalarioBruto)
      worksheet.getCell(row, 43).value = this.formatCurrency(record.costoSalarioNeto)
      worksheet.getCell(row, 44).value = record.nuAnno
      worksheet.getCell(row, 45).value = record.nuMes
      let numero_salarioDiarioIntegrado = Number(record.salarioDiarioIntegrado)
      worksheet.getCell(row, 46).value = this.formatCurrency(numero_salarioDiarioIntegrado)*/

      
      //worksheet.getCell(row).fill = {  type: 'pattern', pattern: 'solid', fgColor: { argb: record.fechaCancelacion ?  'FFC000':  '70AD47'}};
      //worksheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: record.fechaCancelacion ? 'ea899a' : 'ffffff' } };
      row++
    });

    return row

  }

  formatCurrency(valor: number) {
    return valor.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    })
  }

  getHeadersTabla() {
    return [
      {id: 'empresa', label: 'Empresa'},
      {id: 'mes', label: 'Mes'},
      {id: 'anio', label: 'Año'},
      {id: 'numempleado', label: 'Num empleado'},
      {id: 'empleado', label: 'Empleado'},
      {id: 'responsable', label: 'Responsable'},
      {id: 'diasTrabajo', label: 'Días Trabajo'},
    ];
  }

}
