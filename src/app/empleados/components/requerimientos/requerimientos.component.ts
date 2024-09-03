import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { EmpleadosService } from '../../services/empleados.service';
import { Observable, finalize, forkJoin } from 'rxjs';
import { FiltrosRequerimientos, Requerimiento,encabezadosRequerimiento } from '../../Models/empleados';
import { SUBJECTS, TITLES,EXCEL_EXTENSION } from 'src/utils/constants';
import { Location } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { Opcion } from 'src/models/general.model';
import { UserService } from 'src/app/services/user.service';

import * as XLSX from 'xlsx';
import { formatCurrency } from 'src/helpers/helpers';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-requerimientos',
  templateUrl: './requerimientos.component.html',
  styleUrls: ['./requerimientos.component.scss'],
  providers: [MessageService]
})
export class RequerimientosComponent implements OnInit {

  activatedRoute    = inject(ActivatedRoute)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  empleadoService   = inject(EmpleadosService)
  location          = inject(Location)
  fb                = inject(FormBuilder)
  router            = inject(Router)
  userService       = inject(UserService)

  directores: Opcion[] = []
  proyectos:  Opcion[] = []
  puestos:    Opcion[] = []

  filtros$: Observable<FiltrosRequerimientos>
  filtros:  FiltrosRequerimientos = {}

  data: Requerimiento[] = []
  personas: Opcion[] = []
  
  requerimientoActual: number = null
  mostrarModal: boolean = false

  today: Date = new Date();
  pipe = new DatePipe('en-US');
  todayWithPipe = null;

  form = this.fb.group({
    persona: ['', Validators.required]
  })

  constructor() { }

  ngOnInit(): void {
    this.verificarEstado()

    this.sharedService.cambiarEstado(true)

    this.empleadoService.getRequerimientos(this.filtros)
      .subscribe({
        next: ({data}) => {
          this.data = data
          forkJoin([
            this.empleadoService.getDirectores(),
            this.empleadoService.getPuestos(),
          ])
          .pipe(
            finalize(() => {
              this.sharedService.cambiarEstado(false)
            })
          )
          .subscribe(([directoresR, puestosR]) => {
            this.directores = directoresR.data.map(director => ({name: director.nombre_persona, code: director.nunum_empleado_rr_hh.toString()}))
            this.puestos = puestosR.data.map(puesto => ({name: puesto.chpuesto, code: puesto.nukid_puesto.toString()}))
          })
        },
        error: (err) => {
          this.sharedService.cambiarEstado(false)
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
        }
      })
  }

  verificarEstado() {

    this.activatedRoute.queryParams.subscribe(params => {
      // Access query parameters
      const success = params['success']

      if(success) {
        Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Requerimiento guardado', detail: 'El requerimiento ha sido guardado.' }))
      }

      const urlWithoutQueryParams = this.location.path().split('?')[0];
      this.location.replaceState(urlWithoutQueryParams);
    });
  }

  mostrarModalPersonas(requerimiento: Requerimiento) {
    this.sharedService.cambiarEstado(true)
    this.empleadoService.getPersonasDisponibles()
      .pipe(finalize(() => {
        this.requerimientoActual = requerimiento.nukidrequerimiento
        this.mostrarModal = true
        this.sharedService.cambiarEstado(false)
      }))
      .subscribe({
        next: ({data}) => {
          this.personas = data.map(persona => ({
            name: `${persona.chnombre} ${persona.chap_paterno} ${persona.chap_materno ? persona.chap_materno : ''}`,
            code: persona.nukidpersona.toString()
          }))
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })
  }

  asignarPersona() {
    this.router.navigate(['/empleados/registro-empleado'], {queryParams: {id_persona: this.form.value.persona, id_requerimiento: this.requerimientoActual}})
  }

  onChangeFiltro(campo: string, {value: valor}: any) {
    this.filtros = {
      ...this.filtros,
      [campo]: valor
    }

    if(campo === 'idDirector') {
      this.getProyectos(valor)
    }

    this.sharedService.cambiarEstado(true)

    this.empleadoService.getRequerimientos(this.filtros)
      .pipe(
        finalize(() => {
          this.sharedService.cambiarEstado(false)
        })
      )
      .subscribe({
        next: ({data}) => this.data = data,
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })
  }

  getProyectos(valor: any) {
    this.sharedService.cambiarEstado(true)
    this.empleadoService.getProyectosPorDirector(valor)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => this.proyectos = data.map(proyecto => ({name: proyecto.proyecto, code: proyecto.numProyecto.toString()})),
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
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

      saveAs(blob, `Empleados_` + this.todayWithPipe + `${EXCEL_EXTENSION}`)
    });
  }

  _setXLSXTitles(worksheet: ExcelJS.Worksheet) {
    const fillNota: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } }
    //const fillNotaCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillCobranza: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffa4ffa4' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }


    worksheet.getCell('F3').value = 'SUELDO'
    worksheet.getCell('F3').fill = fillCobranza
    worksheet.getCell('F3').alignment = alignment
    worksheet.mergeCells('F3:G3')
  }

  _setXLSXHeader(worksheet: ExcelJS.Worksheet) {
    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }

    encabezadosRequerimiento.forEach((encabezado, index) => {
      let cell = worksheet.getCell(4, index + 1)
      cell.value = encabezado.label
      cell.fill = fill
      cell.alignment = alignment
    })
  }

  _setXLSXContent(worksheet: ExcelJS.Worksheet, row: number): number {

    const fillCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillFactura: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } }

    this.data.forEach(record => {
      //worksheet.getCell(row).fill = record.fechaCancelacion ? fillCancelada : fillFactura
      //const col = row.getCell(row);

      worksheet.getCell(row, 1).value = record.chcategoria
      worksheet.getCell(row, 2).value = record.chpuesto
      worksheet.getCell(row, 3).value = record.chnivel_estudios
      worksheet.getCell(row, 4).value = record.chprofesion
      worksheet.getCell(row, 5).value = record.chjornada
      worksheet.getCell(row, 6).value = this.formatCurrency(record.nusueldo_min)
      worksheet.getCell(row, 7).value = this.formatCurrency(record.nusueldo_max)

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

}
