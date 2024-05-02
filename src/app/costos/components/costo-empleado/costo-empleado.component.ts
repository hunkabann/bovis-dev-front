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
  FechaIngre = null;

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
      worksheet.getCell(row, 10).value = record.unidadNegocio
      worksheet.getCell(row, 11).value = record.empresa
      worksheet.getCell(row, 12).value = record.nombreJefe
      let newDate = new Date(record.fechaIngreso);
      this.FechaIngre = this.pipe.transform(newDate, 'dd-MM-yyyy');
      worksheet.getCell(row, 13).value = this.FechaIngre
      worksheet.getCell(row, 14).value = record.antiguedad
      worksheet.getCell(row, 15).value = this.formatCurrency(record.avgDescuentoEmpleado)
      worksheet.getCell(row, 16).value = this.formatCurrency(record.montoDescuentoMensual)
      worksheet.getCell(row, 17).value = this.formatCurrency(record.sueldoNetoPercibidoMensual)
      worksheet.getCell(row, 18).value = this.formatCurrency(record.retencionImss)
      let numero_ispt = Number(record.ispt)
      worksheet.getCell(row, 19).value = this.formatCurrency(numero_ispt)
      //worksheet.getCell(row, 19).value = record.ispt
      worksheet.getCell(row, 20).value = this.formatCurrency(record.sueldoBrutoInflacion)
      worksheet.getCell(row, 21).value =this.formatCurrency( record.anual)
      worksheet.getCell(row, 22).value = this.formatCurrency(record.aguinaldoCantidadMeses)
      worksheet.getCell(row, 23).value = this.formatCurrency(record.aguinaldoMontoProvisionMensual)
      worksheet.getCell(row, 24).value = record.pvDiasVacasAnuales
      worksheet.getCell(row, 25).value = this.formatCurrency(record.pvProvisionMensual)
      worksheet.getCell(row, 26).value = this.formatCurrency(record.indemProvisionMensual)
      worksheet.getCell(row, 27).value = this.formatCurrency(record.avgBonoAnualEstimado)
      worksheet.getCell(row, 28).value = this.formatCurrency(record.bonoAnualProvisionMensual)
      worksheet.getCell(row, 29).value = record.sgmmCostoTotalAnual
      worksheet.getCell(row, 30).value = this.formatCurrency(record.sgmmCostoMensual)
      worksheet.getCell(row, 31).value = this.formatCurrency(record.svCostoTotalAnual)
      worksheet.getCell(row, 32).value = this.formatCurrency(record.svCostoMensual)
      worksheet.getCell(row, 33).value = this.formatCurrency(record.vaidCostoMensual)
      worksheet.getCell(row, 34).value = this.formatCurrency(record.vaidComisionCostoMensual)
      worksheet.getCell(row, 35).value = this.formatCurrency(record.ptuProvision)
      worksheet.getCell(row, 36).value = this.formatCurrency(record.impuesto3sNomina)
      worksheet.getCell(row, 37).value = this.formatCurrency(record.imss)
      worksheet.getCell(row, 38).value = this.formatCurrency(record.retiro2)
      worksheet.getCell(row, 39).value = this.formatCurrency(record.cesantesVejez)
      worksheet.getCell(row, 40).value = this.formatCurrency(record.infonavit)
      worksheet.getCell(row, 41).value = this.formatCurrency(record.cargasSociales)
      worksheet.getCell(row, 42).value = this.formatCurrency(record.costoMensualEmpleado)
      worksheet.getCell(row, 43).value = this.formatCurrency(record.costoMensualProyecto)
      worksheet.getCell(row, 44).value = this.formatCurrency(record.costoAnualEmpleado)
      worksheet.getCell(row, 45).value = this.formatCurrency(record.costoSalarioBruto)
      worksheet.getCell(row, 46).value = this.formatCurrency(record.costoSalarioNeto)
      worksheet.getCell(row, 47).value = record.nuAnno
      worksheet.getCell(row, 48).value = record.nuMes
      let numero_salarioDiarioIntegrado = Number(record.salarioDiarioIntegrado)
      worksheet.getCell(row, 49).value = this.formatCurrency(numero_salarioDiarioIntegrado)
      //worksheet.getCell(row, 49).value = record.salarioDiarioIntegrado

      
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
