import { Component, OnInit, inject } from '@angular/core';
import { LazyLoadEvent, MessageService, PrimeNGConfig } from 'primeng/api';
import { CieService } from '../../services/cie.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CALENDAR, EXCEL_EXTENSION, TITLES, cieHeaders, cieHeadersFieldsLazy } from 'src/utils/constants';
import { CieRegistro, encabezados } from '../../models/cie.models';
import { finalize, forkJoin } from 'rxjs';
import { Opcion } from 'src/models/general.model';
import { format } from 'date-fns';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import * as XLSX from 'xlsx';
import { formatCurrency } from 'src/helpers/helpers';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-resultado-busqueda',
  templateUrl: './resultado-busqueda.component.html',
  styleUrls: ['./resultado-busqueda.component.css'],
  providers: [MessageService]
})
export class ResultadoBusquedaComponent implements OnInit {

  todayWithPipe = null;
  pipe = new DatePipe('en-US');

  cieService = inject(CieService)
  config = inject(PrimeNGConfig)
  messageService = inject(MessageService)
  sharedService = inject(SharedService)
  activatedRoute = inject(ActivatedRoute)
  location = inject(Location)

  data: CieRegistro[] = []
  allData: CieRegistro[] = []

  cieHeadersLocal: string[] = cieHeaders
  cieHeadersFieldsLocal: any = cieHeadersFieldsLazy
  conceptos: Opcion[]
  cuentas: Opcion[]
  empresas: Opcion[]
  numsProyecto: Opcion[]
  responsables: Opcion[]
  clasificacionesPY: Opcion[]

  concepto: string
  cuenta: string
  empresa: string
  numProyecto: number
  responsable: string
  clasificacionPY: string
  fechas: Date[] = [new Date(), null]

  fechacancela: string

  firstLoading: boolean = true

  noRegistros = 10
  totalRegistros = 0
  loading: boolean = false

  constructor() { }

  ngOnInit(): void {
    this.getConfigCalendar()
    this.cargarCatalogos()
    this.verificarEstado()
    // this.loadData({ first: 0, rows: this.noRegistros })
  }

  verificarEstado() {

    this.activatedRoute.queryParams.subscribe(params => {
      // Access query parameters
      const success = params['success']

      if (success) {
        Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Registro guardado', detail: 'El registro ha sido guardado.' }))
      }

      const urlWithoutQueryParams = this.location.path().split('?')[0];
      this.location.replaceState(urlWithoutQueryParams);
    });
  }

  loadData(event: LazyLoadEvent) {
    if (!this.firstLoading) {
      this.noRegistros = event.rows
      const page = (event.first / this.noRegistros) + 1;
      this.loading = true
      let mes = null
      let anio = null
      let mesFin = null
      let anioFin = null

      if (this.fechas && this.fechas.length > 0) {
        if (this.fechas[0]) {
          mes = +format(this.fechas[0], 'M')
          anio = +format(this.fechas[0], 'Y')
        }
        if (this.fechas[1]) {
          mesFin = +format(this.fechas[1], 'M')
          anioFin = +format(this.fechas[1], 'Y')
        }
      }

      this.cieService.getRegistros(
        this.cuenta,
        mes,
        anio,
        mesFin,
        anioFin,
        this.concepto,
        this.empresa,
        this.numProyecto,
        this.responsable,
        this.clasificacionPY,
        page,
        this.noRegistros,
        event.sortField || null,
        event.sortOrder == 1 ? 'ASC' : 'DESC'
      )
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: ({ data }) => {
            this.totalRegistros = data.totalRegistros
            this.data = data.registros
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        })

      // this.dataService.getData(page, this.pageSize).subscribe(response => {
      //   this.data = response.data; // Assuming API response contains data field with items
      //   this.totalRecords = response.totalRecords; // Assuming API response contains totalRecords field
      // });
    } else {
      this.firstLoading = false
    }
  }

  cargarCatalogos() {
    this.sharedService.cambiarEstado(true)

    forkJoin([
      this.cieService.getCieCuentas(),
      this.cieService.getCieConceptos(),
      this.cieService.getCieEmpresas(),
      this.cieService.getCieNumsProyecto(),
      this.cieService.getCieresponsables(),
      this.cieService.getCieClasificacionesPY()
    ])
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          const [cuentasR, conceptosR, empresasR, numsProyectoR, responsablesR, clasificacionesPYR] = data
          this.cuentas = cuentasR.data.map(registro => ({ name: registro, code: registro }))
          this.conceptos = conceptosR.data.map(registro => ({ name: registro, code: registro }))
          this.empresas = empresasR.data.map(registro => ({ name: registro.chempresa, code: registro.chempresa }))
          this.numsProyecto = numsProyectoR.data.map(registro => ({ name: registro.toString(), code: registro.toString() }))
          this.responsables = responsablesR.data.map(registro => ({ name: registro, code: registro }))
          this.clasificacionesPY = clasificacionesPYR.data.map(registro => ({ name: registro, code: registro }))
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
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

    this.allData.forEach(record => {
      //worksheet.getCell(row).fill = record.fechaCancelacion ? fillCancelada : fillFactura
      //const col = row.getCell(row);

      worksheet.getCell(row, 1).value = record.nombreCuenta
      worksheet.getCell(row, 2).value = record.cuenta
      worksheet.getCell(row, 3).value = record.tipoPoliza
      worksheet.getCell(row, 4).value = record.numero
      worksheet.getCell(row, 5).value = record.fecha
      if (record.fechaCancelacion == null || record.fechaCancelacion == '') {
        worksheet.getCell(row, 6).value = record.mes
      } else {
        worksheet.getCell(row, 6).value = this.regresames(record.fechaCancelacion)
      }

      worksheet.getCell(row, 7).value = record.concepto
      worksheet.getCell(row, 8).value = record.centroCostos
      worksheet.getCell(row, 9).value = record.proyecto
      if (!this.esElmismomes(record.fecha, record.fechaCancelacion)) {
        worksheet.getCell(row, 10).value = formatCurrency(0)
        worksheet.getCell(row, 11).value = formatCurrency(0)
        worksheet.getCell(row, 12).value = formatCurrency(0)
        worksheet.getCell(row, 13).value = formatCurrency(0)
      } else {
        worksheet.getCell(row, 10).value = formatCurrency(record.saldoInicial || 0)
        worksheet.getCell(row, 11).value = formatCurrency(record.debe || 0)
        worksheet.getCell(row, 12).value = formatCurrency(record.haber || 0)

        if (record.debe == null || "" + record.debe == '') {
          worksheet.getCell(row, 13).value = formatCurrency(record.movimiento || 0)
        } else {
          worksheet.getCell(row, 13).value = formatCurrency(record.movimiento * -1)
        }
      }

      worksheet.getCell(row, 14).value = record.empresa
      worksheet.getCell(row, 15).value = record.proyecto
      worksheet.getCell(row, 16).value = record.tipoCuenta
      worksheet.getCell(row, 17).value = record.edoResultados
      worksheet.getCell(row, 18).value = record.responsable
      worksheet.getCell(row, 19).value = record.tipoProyecto
      worksheet.getCell(row, 20).value = record.tipoPy
      worksheet.getCell(row, 21).value = record.clasificacionPy
      //worksheet.getCell(row).fill = {  type: 'pattern', pattern: 'solid', fgColor: { argb: record.fechaCancelacion ?  'FFC000':  '70AD47'}};
      worksheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: record.fechaCancelacion ? 'ea899a' : 'ffffff' } };
      row++
    });

    return row

  }



  exportJsonToExcel(fileName: string = 'CIE'): void {
    this.sharedService.cambiarEstado(true)

    let mes = null
    let anio = null
    let mesFin = null
    let anioFin = null

    if (this.fechas && this.fechas.length > 0) {
      if (this.fechas[0]) {
        mes = +format(this.fechas[0], 'M')
        anio = +format(this.fechas[0], 'Y')
      }
      if (this.fechas[1]) {
        mesFin = +format(this.fechas[1], 'M')
        anioFin = +format(this.fechas[1], 'Y')
      }
    }

    this.cieService.getAllRegistros(
      this.cuenta,
      mes,
      anio,
      mesFin,
      anioFin,
      this.concepto,
      this.empresa,
      this.numProyecto,
      this.responsable,
      this.clasificacionPY,
      -1,
      -1,
      null,
      'DESC'
    )
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.allData = data['data']['registros'];

          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Detalle');
          // Tìtulos
          this._setXLSXTitles(worksheet)
          this._setXLSXHeader(worksheet)
          let row = 5

          row = this._setXLSXContent(worksheet, row)
          workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `CIE_${Date.now()}${EXCEL_EXTENSION}`);
          });

          /*
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

          const workbook: XLSX.WorkBook = {
            Sheets: {
              'Detalle': worksheet
            },
            SheetNames: ['Detalle'],
          };
          const jsonDataRes = data.registros.map(registro => ({
            nombre_cuenta: registro.nombreCuenta,
            cuenta: registro.cuenta,
            tipo_poliza: registro.tipoPoliza,
            numero: registro.numero,
            fecha: registro.fecha,
            mes: registro.mes,
            concepto: registro.concepto,
            centro_costos: registro.centroCostos,
            proyectos: registro.proyecto,
            saldo_inicial: formatCurrency(registro.saldoInicial || 0),
            debe: formatCurrency(registro.debe || 0),
            haber: formatCurrency(registro.haber || 0),
            movimiento: formatCurrency(registro.movimiento || 0),
            empresa: registro.empresa,
            num_proyecto: registro.numProyecto,
            tipo_proyecto: registro.tipoProyecto,
            edo_resultados: registro.edoResultados,
            responsable: registro.responsable,
            tipo_cuenta: registro.tipoCuenta,
            tipo_py: registro.tipoPy,
            clasificacion_py: registro.clasificacionPy
          }))
          XLSX.utils.sheet_add_json(worksheet, jsonDataRes, { origin: 'A2', skipHeader: true })
          XLSX.utils.sheet_add_aoa(worksheet, [this.cieHeadersLocal]);

          // save to file
          XLSX.writeFile(workbook, `${fileName + '_' + Date.now()}${EXCEL_EXTENSION}`);
          */
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })

  }

  filtrar() {
    this.loadData({ first: 0, rows: this.noRegistros })
  }

  limpiar() {
    this.cuenta = null
    this.fechas = []
    this.concepto = null
    this.empresa = null
    this.numProyecto = null
    this.responsable = null
    this.clasificacionPY = null
  }

  getConfigCalendar() {
    this.config.setTranslation({
      firstDayOfWeek: 1,
      dayNames: CALENDAR.dayNames,
      dayNamesShort: CALENDAR.dayNamesShort,
      dayNamesMin: CALENDAR.dayNamesMin,
      monthNames: CALENDAR.monthNames,
      monthNamesShort: CALENDAR.monthNamesShort,
      today: 'Hoy',
      clear: 'Limpiar',
    })
  }

  parseDate(str: string): Date {
    let mdy: String[] = str.split('-');
    return new Date(Number(mdy[0]), Number(mdy[1]), Number(mdy[2]));
  }

  esElmismomes(fechaemi: string, fechacancela: string): boolean {
    //console.log("fechaemi: " + fechaemi);
    //console.log("fechacancela: " + fechacancela);
    let mdyEmi: String[] = fechaemi.split('-');

    //console.log("Number(mdy[1]) - 1: " + (Number(mdyEmi[1])));
    //let fIni: Date = this.parseDate(fechaemi);

    if (fechacancela == null || fechacancela == "") {
      // return true;

      // Number(mdy[1])+""
      if ((Number(mdyEmi[1])) == 0) {
        return false;
      } else {
        return true;
      }
    } else {

      let mdyCancela: String[] = fechacancela.split('-');

      // console.log("Number(mdy[1]) - 1: " + (Number(mdyCancela[1])));
      let fFin: Date = this.parseDate(fechacancela);
      if ((Number(mdyEmi[1])) == (Number(mdyCancela[1]))) {
        return false;
      } else {
        return true;
      }

    }

    //return this.form.get(campo).invalid &&
    //      (this.form.get(campo).dirty || this.form.get(campo).touched)
  }

  regresames(fechacancela: string): string {
    //console.log("fechaemi: " + fechaemi);
    //console.log("fechacancela: " + fechacancela);

    if (fechacancela != null || fechacancela != "") {
      let mdy: String[] = fechacancela.split('-');
      //console.log("Number(mdy[1]) - 1: " + (Number(mdy[1])));
      return Number(mdy[1]) + ""
    } else {
      return "0"
    }

  }

  regresaValorPositivo(RecordDebe: string, RecordMovimiento: String): string {
    //console.log("RecordDebe: " + RecordDebe);
    //console.log("RecordMovimiento: " + RecordMovimiento.replace("-", ''));
    var numberValue = Number(RecordMovimiento);
    if (Math.sign(numberValue) == 1) {
      RecordMovimiento = -Number(RecordMovimiento) + ""
    }

    if (RecordDebe == null || RecordDebe == "") {
      //let mdy: String[] = RecordMovimiento.split('-');
      //console.log("Number(mdy[0]): " + -RecordMovimiento);
      return RecordMovimiento + ""

    } else {
      return -RecordMovimiento + ""
    }

  }

  getHeadersTabla() {
    return [
      { key: 'NombreCuenta', label: 'NOMBRE CUENTA' },
      { key: 'Cuenta', label: 'CUENTA' },
      { key: 'TipoPoliza', label: 'TIPO POLIZA' },
      { key: 'Numero', label: 'NUMERO' },
      { key: 'Fecha', label: 'FECHA' },
      { key: 'Mes', label: 'MES' },
      { key: 'Concepto', label: 'CONCEPTO' },
      { key: 'CentroCostos', label: 'CENTRO DE COSTOS' },
      { key: 'Proyectos', label: 'PROYECTOS' },
      { key: 'SaldoInicial', label: 'SALDO INICIAL' },
      { key: 'Debe', label: 'DEBE' },
      { key: 'Haber', label: 'HABER' },
      { key: 'Movimiento', label: 'MOVIMIENTO' },
      { key: 'Empresa', label: 'EMPRESA' },
      { key: 'NumProyecto', label: 'NUM PROYECTO' },
      { key: 'TipoProyecto', label: 'TIPO' },
      { key: 'EdoResultados', label: 'EDO DE RESULTADOS' },
      { key: 'Responsable', label: 'RESPONSABLE' },
      { key: 'TipoCuenta', label: 'UNIDAD' },
      { key: 'TipoPy', label: 'TIPO PY' },
      { key: 'ClasificacionPy', label: 'CLASIFICACION PY' },

    ];
  }

}

// (onLazyLoad)="loadData($event)"
