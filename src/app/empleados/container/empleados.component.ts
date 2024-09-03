import { Component, OnInit } from '@angular/core';
import { Empleado, UpPersona,encabezadosPersona } from '../Models/empleados';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { EmpleadosService } from '../services/empleados.service';
import { SUBJECTS, TITLES,EXCEL_EXTENSION } from 'src/utils/constants';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize,forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Item,Opcion } from 'src/models/general.model';
import * as XLSX from 'xlsx';
import { formatCurrency } from 'src/helpers/helpers';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'],
})
export class EmpleadosComponent implements OnInit {

  ListEmpleadosModel: Empleado[] = []
  personas: UpPersona[] = []

  FechaCumple = null;

  personass:    Item[] = []
  puestos:    Item[] = []
  estados:    Item[] = [
    {label: 'Activo', value: true},
    {label: 'Inactivo', value: false}
  ]

  IsEmpleado:    Item[] = [
    {label: 'SI', value: true},
    {label: 'No', value: false}
  ]

  today: Date = new Date();
  pipe = new DatePipe('en-US');
  todayWithPipe = null;



  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private empleadosServ: EmpleadosService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.verificarEstado()

    this.sharedService.cambiarEstado(true)

    forkJoin([
      this.empleadosServ.getPersonas(),
      this.empleadosServ.getPuestos()
    ])
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (value) => {
          
          const [personasR, puestosR] = value
          //const [empleadosR, puestosR] = value
          this.personass = personasR.data.map(persona => ({value: persona.chnombre_completo, label: persona.chnombre_completo}))
          this.puestos = puestosR.data.map(puesto => ({value: puesto.chpuesto, label: puesto.chpuesto}))
          //this.proyectos = proyectosR.data.map(proyecto => ({ code: proyecto.numProyecto.toString(), name: `${proyecto.numProyecto} - ${proyecto.nombre}` }))
          //this.empresas = EmplresaR.data.map(empresa => ({ code: empresa.idEmpresa.toString(), name: `${empresa.empresa}` }))
          //this.proyectos = proyectosR.data.map(proyecto => ({value: proyecto.nombre, label: proyecto.nombre }))
          
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })

    if (localStorage.getItem('empleados') != null) {
      this.ListEmpleadosModel = JSON.parse(
        localStorage.getItem('empleados') || '[]'
      );
      //console.log(this.ListEmpleadosModel);
    }

    this.empleadosServ.getPersonas()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => this.personas = data,
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })
  }

  verificarEstado() {

    this.activatedRoute.queryParams.subscribe(params => {
      // Access query parameters
      const success = params['success']

      if(success) {
        Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Registro guardado', detail: 'El registro ha sido guardado.' }))
      }

      const urlWithoutQueryParams = this.location.path().split('?')[0];
      this.location.replaceState(urlWithoutQueryParams);
    });
  }
  
  toggleActivo(id: number, activo: boolean) {
    const index = this.personas.findIndex(({nukidpersona}) => nukidpersona === id)
    if(index >= 0) {
      this.sharedService.cambiarEstado(true)
      this.empleadosServ.toggleEstado(!activo, id)
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (data) => {
            this.personas.at(index).boactivo = !activo
            this.messageService.add({ severity: 'success', summary: 'Registro actualizado', detail: `El registro ha sido ${activo ? 'deshabilitado' : 'habilitado'}.` })
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
        })
    }
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
  }

  _setXLSXHeader(worksheet: ExcelJS.Worksheet) {
    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }

    encabezadosPersona.forEach((encabezado, index) => {
      let cell = worksheet.getCell(4, index + 1)
      cell.value = encabezado.label
      cell.fill = fill
      cell.alignment = alignment
    })
  }

  _setXLSXContent(worksheet: ExcelJS.Worksheet, row: number): number {

    const fillCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillFactura: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } }

    this.personas.forEach(record => {
      //worksheet.getCell(row).fill = record.fechaCancelacion ? fillCancelada : fillFactura
      //const col = row.getCell(row);

      worksheet.getCell(row, 1).value = record.chnombre_completo
      worksheet.getCell(row, 2).value = record.chrfc
      let newDate = new Date(record.dtfecha_nacimiento);
      this.FechaCumple = this.pipe.transform(newDate, 'dd-MM-yyyy');
      worksheet.getCell(row, 3).value = this.FechaCumple
      //worksheet.getCell(row, 3).value = record.dtfecha_nacimiento
      worksheet.getCell(row, 4).value = record.chemail
      worksheet.getCell(row, 5).value = record.chtelefono
      worksheet.getCell(row, 6).value = record.chcelular
      worksheet.getCell(row, 7).value = record.chcurp
      worksheet.getCell(row, 8).value = record.chsexo
      worksheet.getCell(row, 9).value = record.chtipo_persona
      worksheet.getCell(row, 10).value = record.chedo_civil
      worksheet.getCell(row, 11).value = record.chtipo_sangre
      worksheet.getCell(row, 12).value = record.boempleado === true ? 'SI' : 'NO'
      row++
    });

    return row

  }

}
