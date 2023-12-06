import { Component, OnInit, inject } from '@angular/core';
import { format } from 'date-fns';
import { MessageService } from 'primeng/api';
import { TimesheetService } from '../../services/timesheet.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize } from 'rxjs';
import { Timesheet } from '../../models/timesheet.model';
import * as XLSX from 'xlsx';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { EXCEL_EXTENSION, PERCENTAGE_FORMAT } from 'src/utils/constants';
import { es } from 'date-fns/locale';

interface ProyectoShort {
  id:           number,
  nombre:       string,
  dedicacion?:  number
}

interface Informacion {
  timesheet: Timesheet,
  participacion: ProyectoShort[]
}

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  providers: [MessageService]
})
export class SummaryComponent implements OnInit {

  timeSheetService  = inject(TimesheetService)
  sharedService     = inject(SharedService)

  proyectos:  ProyectoShort[] = []
  data: Informacion[] = []

  constructor() { }

  ngOnInit(): void {
    this.sharedService.cambiarEstado(true)
    this.timeSheetService.getCatProyectos(false)
      .subscribe(({data}) => {
        this.proyectos = data.map(({numProyecto, nombre}) => ({id: numProyecto, nombre, dedicacion: 0 }))
        this.sharedService.cambiarEstado(false)
      })
  }

  get totalPorcentaje() {
    let total = 0
    this.data.forEach(({timesheet}) => {
      timesheet.proyectos.forEach(proyecto => {
        total += proyecto.tDedicacion
      })
    })
    return total
  }

  onSelectFecha(event: any) {
    const mes = format(event, 'M')
    const anio = format(event, 'Y')
    
    this.sharedService.cambiarEstado(true)
    this.timeSheetService.getTimeSheetsPorFecha(+mes, +anio)
      .pipe(
        finalize(() => {
          this.sharedService.cambiarEstado(false)
        })
      )
      .subscribe(({data}) => {
        this.data = data.map(timesheet => ({
          timesheet,
          participacion: this.proyectos.map((proyecto, index) => {

            const key = timesheet.proyectos.findIndex(({idProyecto}) => idProyecto === proyecto.id)
            let dedicacion = 0
            if(key >= 0) {
              // console.log(timesheet.proyectos[key].tDedicacion)
              dedicacion = timesheet.proyectos[key].tDedicacion
              this.proyectos[index].dedicacion += dedicacion
            }
            return {
              id:         proyecto.id,
              nombre:     proyecto.nombre,
              dedicacion
            }
          })
        }))
        // console.log(this.proyectos)
      })
  }
  
  exportJsonToExcel() {

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Detalle');
    
    // Tìtulos
    this._setXLSXTitles(worksheet)

    this._setXLSXHeader(worksheet)
    
    let row = 9

    row = this._setXLSXContent(worksheet, row)

    this._setXSLXFooter(worksheet, row)

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      saveAs(blob, `Summary_${Date.now()}${EXCEL_EXTENSION}`);
    });
  }

  _setXLSXTitles(worksheet: ExcelJS.Worksheet) {

    worksheet.getCell('G1').value = 'BOVIS - Control Mensual de Tiempos - '
    worksheet.getCell('G2').value = 'Resumen Mensual'

    worksheet.getCell('G4').value = 'Mes'
    worksheet.getCell('H4').value = format(Date.now(), 'LLLL Y', { locale: es })

    worksheet.getCell('G5').value = `Rev. 83- ${format(Date.now(), 'dd/MM/Y')}`

    worksheet.getCell('K1').value = `Nota: cada responsable debe filtrar la columna ""Responsable"" y completar la asignación de tiempo exclusivamente para los empleados que aparecen bajo su responsabilidad.
    NO AÑADIR O ELIMINAR FILAS O COLUMNAS NI CAMBIAR LA ESTRUCTURA DE LA HOJA EN MODO ALGUNO NI CAMBIAR FORMATOS NI MODIFICAR FORMULAS NI CONTENIDOS.
    Al terminar, guardar la hoja añadiendo al nombre las iniciales del Responsable y enviar`

    worksheet.mergeCells('K1:V2');

    const mergedCell = worksheet.getCell('K1');
    mergedCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };  
  }

  _setXLSXHeader(worksheet: ExcelJS.Worksheet) {
    
    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } };

    worksheet.getCell('A7').value = 'Count'	

    worksheet.getCell('B7').value = 'COI'	
    worksheet.getCell('B7').fill = fill
    worksheet.getCell('C7').value = 'NOI'	
    worksheet.getCell('C7').fill = fill
    worksheet.getCell('D7').value = 'CVE'	
    worksheet.getCell('D7').fill = fill	
    worksheet.getCell('E7').value = 'Número de empleado (Timesheet de Alma)'
    worksheet.getCell('E7').fill = fill
    worksheet.getCell('F7').value = '3'		
    worksheet.getCell('F7').fill = fill	
    worksheet.getCell('G7').value = 'Employee Name'	
    worksheet.getCell('G7').fill = fill
    worksheet.getCell('H7').value = 'Responsable'	
    worksheet.getCell('H7').fill = fill
    worksheet.getCell('I7').value = 'Total (%)'
    worksheet.getCell('I7').fill = fill

    let indice = 10
    this.proyectos.forEach((proyecto, index) => {
      
      let cell = worksheet.getCell(6, indice);
      worksheet.getCell(6, indice).value = proyecto.id
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF009821' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };  

      worksheet.getCell(7, indice).value = proyecto.nombre
      cell = worksheet.getCell(7, indice);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF84CA53' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };  
      
      indice++
    })

   
  }

  _setXLSXContent(worksheet: ExcelJS.Worksheet, row: number): number {

    this.data.forEach(record => {

      let totalTimesheet = 0

      record.participacion.forEach((proyecto, index) => {
        worksheet.getColumn(10 + index).width = 15
        worksheet.getCell(row, 10 + index).value = this.getDecimal(proyecto.dedicacion) || ''
        worksheet.getCell(row, 10 + index).numFmt = '0.00%';
        totalTimesheet += +proyecto.dedicacion
      })
      
      worksheet.getCell(row, 1).value = 1
      worksheet.getCell(row, 2).value = record.timesheet.coi_empresa
      worksheet.getCell(row, 3).value = record.timesheet.noi_empresa
      worksheet.getCell(row, 4).value = record.timesheet.noi_empleado
      worksheet.getCell(row, 5).value = record.timesheet.num_empleado
      worksheet.getCell(row, 6).value = 1
      worksheet.getCell(row, 7).value = record.timesheet.empleado
      worksheet.getCell(row, 8).value = record.timesheet.responsable
      worksheet.getCell(row, 9).value = this.getDecimal(totalTimesheet)
      worksheet.getCell(row, 9).numFmt = '0.00%';
      row++
    });

    return row
  }

  _setXSLXFooter(worksheet: ExcelJS.Worksheet, row: number) {
    let indice = 10
    this.proyectos.forEach((proyecto, index) => {

      worksheet.getCell(row, indice).value = this.getDecimal(proyecto.dedicacion)
      worksheet.getCell(row, indice).numFmt = '0.00%';
      
      indice++
    })
  }

  getDecimal(value: number) {
    return (value / 100)
  }

  formatPercentage(worksheet: XLSX.WorkSheet, row: number, col: number) {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
    const cell = worksheet[cellRef];
    
    cell.t = 'n';
    cell.z = PERCENTAGE_FORMAT;
  }

}
