import { Component, OnInit, inject,ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CostosService } from '../../services/costos.service';
import { SharedService } from '../../../shared/services/shared.service';
import { finalize } from 'rxjs';
import { SUBJECTS, TITLES,EXCEL_EXTENSION } from 'src/utils/constants';
import { CostoEmpleado,encabezados } from '../../models/costos.model';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Item,Opcion } from 'src/models/general.model';
import { Table } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { Dropdown } from 'primeng/dropdown';


@Component({
  selector: 'app-costo-empleado',
  templateUrl: './costo-empleado.component.html',
  styleUrls: ['./costo-empleado.component.css'],
  providers: [MessageService]
})
export class CostoEmpleadoComponent implements OnInit {

  costosService   = inject(CostosService)
  messageService  = inject(MessageService)
  sharedService   = inject(SharedService)

  today: Date = new Date();
  pipe = new DatePipe('en-US');
  todayWithPipe = null;

  costos: CostoEmpleado[] = []

  constructor() { }

  ngOnInit(): void {
    this.sharedService.cambiarEstado(true)

    this.costosService.getCostosEmpleado()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.costos = data
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
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

      saveAs(blob, `Costos_X_Empleados_` + this.todayWithPipe + `${EXCEL_EXTENSION}`)
    });
  }

  _setXLSXTitles(worksheet: ExcelJS.Worksheet) {
  }

  _setXLSXHeader(worksheet: ExcelJS.Worksheet) {
    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }

    encabezados.forEach((encabezado, index) => {
      let cell = worksheet.getCell(4, index + 1)
      cell.value = encabezado.label
      cell.fill = fill
      cell.alignment = alignment
    })
  }

  _setXLSXContent(worksheet: ExcelJS.Worksheet, row: number): number {

    const fillCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillFactura: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } }

    this.costos.forEach(record => {
      //worksheet.getCell(row).fill = record.fechaCancelacion ? fillCancelada : fillFactura
      //const col = row.getCell(row);

      worksheet.getCell(row, 1).value = record.numEmpleadoRrHh
      worksheet.getCell(row, 2).value = record.numEmpleadoNoi
      worksheet.getCell(row, 3).value = record.nombreCompletoEmpleado
      worksheet.getCell(row, 4).value = record.ciudad
      worksheet.getCell(row, 5).value = record.puesto
     
        worksheet.getCell(row, 6).value = record.proyecto
     

      worksheet.getCell(row, 7).value = this.formatCurrency(record.sueldoBrutoInflacion)
      worksheet.getCell(row, 8).value = this.formatCurrency(record.cargasSociales)
      worksheet.getCell(row, 9).value = this.formatCurrency(record.costoMensualEmpleado)
      /*worksheet.getCell(row, 10).value = record.chunidad_negocio
      worksheet.getCell(row, 11).value = record.dtfecha_ingreso
      worksheet.getCell(row, 12).value = record.dtfecha_salida
      worksheet.getCell(row, 13).value = record.dtfecha_ultimo_reingreso
      worksheet.getCell(row, 14).value = record.chnss
      worksheet.getCell(row, 15).value = record.chemail_bovis
      worksheet.getCell(row, 16).value = record.nuantiguedad
      worksheet.getCell(row, 17).value = record.nufondo_fijo*/

      //worksheet.getCell(row, 18).value = record.responsable
      //worksheet.getCell(row, 19).value = record.tipoProyecto
      //worksheet.getCell(row, 20).value = record.tipoPy
      //worksheet.getCell(row, 21).value = record.clasificacionPy
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
  

}
