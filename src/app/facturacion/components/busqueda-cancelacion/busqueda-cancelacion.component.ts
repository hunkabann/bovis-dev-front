import { Component, OnInit, ViewChild } from '@angular/core';
import { Message, MessageService, PrimeNGConfig } from 'primeng/api';
import {
  Busqueda,
  BusquedaCancelacion,
  Clientes,
  Cobranza,
  Empresas,
  NotaCredito,
  Proyectos,
  encabezados,
  equivalenteFacturaCobranza,
  equivalenteFacturaNota,
  facturaCancelacion,encabezadosReportes,
} from '../../Models/FacturacionModels';
import { FacturacionService } from '../../services/facturacion.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Dropdown } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { TITLES, errorsArray } from 'src/utils/constants';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const EXCEL_EXTENSION = '.xlsx';

import { DatePipe } from '@angular/common';

interface FiltroCancelacion {
  name: string;
  value: string;
}

interface AssociativeArray {
  [key: string]: string
}

@Component({
  selector: 'app-busqueda-cancelacion',
  templateUrl: './busqueda-cancelacion.component.html',
  styleUrls: ['./busqueda-cancelacion.component.css'],
})
export class BusquedaCancelacionComponent implements OnInit {

  today: Date = new Date();
  pipe = new DatePipe('en-US');
  todayWithPipe = null;

  //objBusqueda: Busqueda = new Busqueda();
  listBusquedaCompleto: Array<BusquedaCancelacion> =
    new Array<BusquedaCancelacion>();
  listBusquedaUnique: Array<BusquedaCancelacion> =
    new Array<BusquedaCancelacion>();
  // listBusquedaModal: Array<BusquedaCancelacion> =
  //   new Array<BusquedaCancelacion>();
  listBusquedaModal: NotaCredito[] | Cobranza[] = []
  listProyectos: Proyectos[] = [];
  listEmpresas: Empresas[] = [];
  listClientes: Clientes[] = [];
  filtroProyectos: FiltroCancelacion[] = [];
  filtroEmpresas: FiltroCancelacion[] = [];
  filtroClientes: FiltroCancelacion[] = [];
  equivalentesCobranzas: any = {}
  equivalentesNotas: any = {}

  messages: Message[] | undefined;
  showConfirm: boolean = false

  isDisableProyecto: boolean = false;
  isDisableEmpresa: boolean = false;
  isDisableCliente: boolean = false;
  isClear: boolean = false;


  IDProyecto: number;
  IDEmpresa: number;
  IDCliente: number;
  
  tipoCambio: number;
  totalRecords: number = 0;
  
  importePagado: number = 0;
  ivaPagado: number = 0;
  TotalPagado: number = 0;

  @ViewChild('dropDownProyecto') dropDownProyecto: Dropdown;
  @ViewChild('dropDownEmpresa') dropDownEmpresa: Dropdown;
  @ViewChild('dropDownCliente') dropDownCliente: Dropdown;
  maxDate: Date;
  fechaInicio: Date;
  fechaFin: Date;
  noFactura: string;
  opcionFiltro: number = 0;
  filtroValue: number;
  displayModal: boolean;
  motivoCancelacion: string = '';
  count_carapteres: number = 20;
  idCancelacion: number;
  ref: DynamicDialogRef;
  headerModalCancelacion: string = '';
  isCancelacionVisible: boolean;
  isTypeHeader: boolean = false;
  uuidPrincipal: string
  complementoInfo: any = {
    esPago: false,
    titulo: '',
    showModal: false
  }

  notaCreditoHeader = [
    'NC Uuid Nota Credito',
    'NC Id Moneda',
    'NC Id Tipo Relacion',
    'NC Nota Credito',
    'NC Importe',
    'NC Iva',
    'NC Total',
    'NC Concepto',
    'NC Mes',
    'NC Año',
    'NC Tipo Cambio',
    'NC Fecha Nota Credito',
  ];

  cobranzaHeader = [
    'C Uuid Cobranza',
    'C Id MonedaP',
    'No. CRP',
    'C Importe Pagado',
    'C Imp Saldo Ant',
    'C Importe Saldo Insoluto',
    'C Iva P',
    'C Tipo Cambio P',
    'C Fecha Pago',
  ]

  form = this.fb.group({
    uuid: [''],
    fecha_cancelacion: ['', Validators.required],
    motivo_cancelacion: ['', [Validators.required, Validators.minLength(20)]]
  })

  formGeneral = this.fb.group({
    id: [''],
    FechaCancelacion: ['', Validators.required],
    MotivoCancelacion: ['', [Validators.required, Validators.minLength(20)]]
  })

  constructor(
    private config: PrimeNGConfig,
    private facturacionService: FacturacionService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.maxDate = new Date();
    this.getConfigCalendar();
    this.listBusquedaCompleto = new Array<BusquedaCancelacion>();
    this.listBusquedaUnique = new Array<BusquedaCancelacion>();

    this.getPoblarProyectos();
    this.getPoblarEmpresas();
    this.getPoblarClientes();

    equivalenteFacturaCobranza.forEach(equivalente => {
      this.equivalentesCobranzas[equivalente.padre] = equivalente.hijo
    })

    equivalenteFacturaNota.forEach(equivalente => {
      this.equivalentesNotas[equivalente.padre] = equivalente.hijo
    })

    // console.log(this.equivalentesNotas)
  }

  getPoblarProyectos() {
    this.facturacionService.getProyectos().subscribe({
      next: (data) => {
        if (data.success) {
          this.listProyectos = data.data;

          this.listProyectos.forEach((element) => {
            this.filtroProyectos.push({
              name: `${String(element.numProyecto)} - ${String(element.nombre)}`,
              value: String(element.numProyecto),
            });
          });
        } else {
          this.messageError(data.message, 'Información de Proyectos');
        }
      },
      error: (e) => {
        this.messageError(e.message, 'Información de Proyectos');
      }
    });
  }

  getPoblarEmpresas() {
    this.facturacionService.getEmpresas().subscribe({
      next: (data) => {
        if (data.success) {
          this.listEmpresas = data.data;
          this.listEmpresas.forEach((element) => {
            this.filtroEmpresas.push({
              name: `${String(element.rfc)} / ${String(element.empresa)}`,
              value: String(element.idEmpresa),
            });
          });
        }
        else {
          this.messageError(data.message, 'Información de Empresas');
        }
      },
      error: (e) => {
        this.messageError(e.message, 'Información de Empresas');
      }
    });
  }

  getPoblarClientes() {
    this.facturacionService.getClientes().subscribe({

      next: (data) => {
        if (data.success) {
          this.listClientes = data.data;
          this.listClientes.forEach((element) => {
            this.filtroClientes.push({
              name: `${String(element.rfc)} / ${String(element.cliente)}`,
              value: String(element.idCliente),
            });
          });
        }
        else {
          this.messageError(data.message, 'Información de Clientes');
        }

      },
      error: (e) => {
        this.messageError(e.message, 'Información de Clientes');
      }
    });
  }

  messageError(message: string, tipo: string) {
    this.messageService.add({
      severity: "error",
      summary: tipo,
      detail: String(message)
    });

  }

  getConfigCalendar() {
    this.config.setTranslation({
      firstDayOfWeek: 1,
      dayNames: [
        'domingo',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
      ],
      dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
      dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
      monthNames: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
      monthNamesShort: [
        'ene',
        'feb',
        'mar',
        'abr',
        'may',
        'jun',
        'jul',
        'ago',
        'sep',
        'oct',
        'nov',
        'dic',
      ],
      today: 'Hoy',
      clear: 'Limpiar',
    });
  }

  busqueda() {
    this.totalRecords = 0;
    this.sharedService.cambiarEstado(true)
    this.listBusquedaCompleto = new Array<BusquedaCancelacion>();
    this.listBusquedaUnique = new Array<BusquedaCancelacion>();
    this.facturacionService
      .getBusqueda(this.getFiltrosVaues())
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe((bus) => {
        //console.log(bus);
        this.listBusquedaCompleto = bus.data.map(factura => {
          this.totalRecords++;
          let importePendiente = 0
          let importeEnPesos = 0

          importePendiente = factura.total
          importeEnPesos = factura.idMoneda === 'MXN' ? factura.importe : factura.importe * factura.tipoCambio

          

          if (factura.notas != null && factura.notas.length > 0) {
            factura.notas.forEach(nota => {
              importePendiente -= nota.nC_Total
            })
          }

          if (factura.cobranzas != null && factura.cobranzas.length > 0) {
            factura.cobranzas.forEach(cobranza => {
              //importePendiente -= +cobranza.c_ImportePagado
              importePendiente -= +cobranza.base
            })
          }

          return ({
            ...factura,
            importeEnPesos,
            importePendiente
          })
        });
        //console.log(this.listBusquedaCompleto);
        // this.listBusquedaUnique = [
        //   ...new Map(
        //     this.listBusquedaCompleto.map((item) => [item['uuid'], item])
        //   ).values(),
        // ];
      });
  }

  getFiltrosVaues() {
    let objBusqueda: Busqueda = new Busqueda();

    if (this.fechaFin != null) {
      let utcFin = this.fechaFin.toJSON().slice(0, 10).replace(/-/g, '-');
      objBusqueda.fechaFin = utcFin;
    } else {
      let utc = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
      objBusqueda.fechaFin = utc;
    }

    if (this.fechaInicio != null) {
      let utcInicio = this.fechaInicio
        .toJSON()
        .slice(0, 10)
        .replace(/-/g, '-');
      objBusqueda.fechaIni = utcInicio;
    }

    objBusqueda.idProyecto = this.IDProyecto;
    objBusqueda.idEmpresa = this.IDEmpresa;
    objBusqueda.idCliente = this.IDCliente;

    // switch (this.opcionFiltro) {
    //   case 1:
    //     objBusqueda.idProyecto = this.IDProyecto;
    //     break;
    //   case 2:
    //     objBusqueda.idEmpresa = this.IDEmpresa;
    //     break;
    //   case 3:
    //     objBusqueda.idCliente = this.IDCliente;
    //     break;
    // }

    objBusqueda.noFactura = this.noFactura || null;

    return objBusqueda;
  }

  getHeadersTabla() {
    return [
      { key: 'uuid', label: 'UUID' },
      { key: 'mes', label: 'MES' },
      { key: 'numProyecto', label: 'No. Proyecto' },
      { key: 'empresa', label: 'EMPRESA' },
      { key: 'cliente', label: 'CLIENTE' },
      { key: 'fechaEmision', label: 'FECHA DE EMISIÓN' },
      { key: 'noFactura', label: 'NO. DE FACTURA' },
      { key: 'idTipoFactura', label: 'Tipo' },
      { key: 'idMoneda', label: 'MONEDA' },
      { key: 'tipoCambio', label: 'TIPO DE CAMBIO' },
      { key: 'importe', label: 'IMPORTE' },
      { key: 'importeEnPesos', label: 'IMPORTE EN PESOS' },
      { key: 'iva', label: 'I.V.A.' },
      { key: 'ivaRet', label: 'IVA RET' },
      { key: 'total', label: 'TOTAL' },
      { key: 'concepto', label: 'CONCEPTO' },
      { key: 'importePendientePorPagar', label: 'IMPORTE PENDIENTE POR PAGAR (saldo)' },
      { key: 'importePendientePorPagar_dls', label: 'IMPORTE PENDIENTE POR PAGAR DLS (saldo)' },
      // {key: 'anio', label: 'Año'},
      // {key: 'fechaPago', label: 'Fecha Pago'},
      // {key: 'fechaCancelacion', label: 'Fecha Cancelacion'},
      { key: 'motivoCancelacion', label: 'Motivo Cancelacion' },
      /* 'NC Uuid Nota Credito',
      'NC Id Moneda',
      'NC Id Tipo Relacion',
      'NC Nota Credito',
      'NC Importe',
      'NC Iva',
      'NC Total',
      'NC Concepto',
      'NC Mes',
      'NC Año',
      'NC Tipo Cambio',
      'NC Fecha Nota Credito',
      'C Uuid Cobranza',
      'C Id MonedaP',
      'C Importe Pagado',
      'C Imp Saldo Ant',
      'C Importe Saldo Insoluto',
      'C Iva P',
      'C Tipo Cambio P',
      'C Fecha Pago', */
    ];
  }

  exportExcel() {
    console.log(111);

    /* import('xlsx').then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(this.listBusquedaCompleto);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "products");
    }); */
    /* pass here the table id */
    //let element = document.getElementById(this.listBusquedaCompleto);

    /* const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(this.listBusquedaCompleto);

   // generate workbook and add the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // save to file
    XLSX.writeFile(wb, "Facturacion"); */
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    /*  let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  let EXCEL_EXTENSION = '.xlsx';
  const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
  });
  FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION); */
  }

  private getOptions(json: any, origin?: number): any {
    // adding actual data
    const options = {
      skipHeader: true,
      origin: 1,
      header: ([] = []),
    };
    options.skipHeader = json.skipHeader ? json.skipHeader : false;
    if (!options.skipHeader && json.header && json.header.length) {
      options.header = json.header;
    }
    if (origin) {
      options.origin = origin ? origin : 1;
    }
    return options;
  }

  onChangeCombo(event: any, opcion: number) {
    /*console.log('event :' + event);
    console.log(event.value);*/
    if (event.value != null) {
      this.isClear = true;
      this.disableFiltros(opcion, event.value['value']);
      // this.opcionFiltro = opcion;
      this.fechaFin = new Date();
      this.filtroValue = event.value['value'];
      //console.log(this.filtroValue);
    } else {
      this.isClear = false;
    }
  }

  disableFiltros(opcion: number, value: number) {
    switch (opcion) {
      case 1:
        this.IDProyecto = value;
        // this.isDisableEmpresa = true;
        // this.isDisableCliente = true;
        break;
      case 2:
        this.IDEmpresa = value;
        // this.isDisableProyecto = true;
        // this.isDisableCliente = true;
        break;
      case 3:
        this.IDCliente = value;
        // this.isDisableProyecto = true;
        // this.isDisableEmpresa = true;
        break;
    }
  }

  clearFiltros() {
    this.dropDownProyecto.clear(null);
    this.dropDownEmpresa.clear(null);
    this.dropDownCliente.clear(null);

    this.isDisableProyecto = false;
    this.isDisableEmpresa = false;
    this.isDisableCliente = false;

    this.fechaInicio = null;
    this.fechaFin = null;

    this.noFactura = null

    this.IDProyecto = null
    this.IDEmpresa = null
    this.IDCliente = null

    this.opcionFiltro = 0;
  }

  showModalDialog(id: number) {
    this.idCancelacion = id;
    this.motivoCancelacion = '';
    this.displayModal = true;
    this.formGeneral.reset()
    this.showConfirm = false
  }

  preConfirmarCancelacion() {
    this.showConfirm = true
    this.messages = [{ severity: 'warn', summary: 'Importante', detail: 'Al confirmar la cancelación de esta factura, se cancelarán también sus notas de crédito y pagos.' }];
  }

  changeCancelar() {

    if (!this.formGeneral.valid) {
      this.formGeneral.markAllAsTouched()
      return
    }

    // let cancelacion: facturaCancelacion = new facturaCancelacion();
    // cancelacion.id = this.idCancelacion;
    // cancelacion.MotivoCancelacion = this.motivoCancelacion;
    const body: facturaCancelacion = {
      id: this.idCancelacion,
      MotivoCancelacion: this.formGeneral.value.MotivoCancelacion,
      FechaCancelacion: this.formGeneral.value.FechaCancelacion
    }

    this.facturacionService
      .facturaCancelacion(body)
      .subscribe((cancel) => {
        if (cancel.data) {
          this.messageService.add({
            severity: 'success',
            summary: 'Cancelar registro',
            detail: `Cancelación realizada correctamente`,
          });
          this.busqueda();
        }
      });
    this.displayModal = false;
  }

  calcularNotasCreditoCobranzas(bus: BusquedaCancelacion, esNotaCredito = true) {
    let total = 0

    if(bus.notas != null){
      const registos = esNotaCredito
      ? bus.notas.filter(nota => nota.nC_FechaCancelacion == null)
      : bus.cobranzas.filter(cobro => cobro.c_FechaCancelacion == null)

    total = registos.length
   
    }
    return total;

  }

  show(tipoModal: boolean, uuid: string) {

    const facturaIndex = this.listBusquedaCompleto.findIndex(factura => factura.uuid === uuid)
    if (facturaIndex < 0) return;

    const factura = this.listBusquedaCompleto.at(facturaIndex)

    this.isCancelacionVisible = true;
    this.isTypeHeader = tipoModal;
    this.headerModalCancelacion = this.isTypeHeader ? 'Notas de crédito' : 'Pagos';

    this.uuidPrincipal = uuid

    this.listBusquedaModal = tipoModal ? factura.notas : factura.cobranzas
  }

  cancelarComplemento(esPago: boolean, uuid: string) {
    this.complementoInfo = {
      esPago,
      titulo: esPago ? 'Cancelar pago' : 'Cancelar nota',
      showModal: true
    }
    this.form.reset()
    this.form.patchValue({ uuid })
  }

  exportJsonToExcel(): void {

    const workbook = new ExcelJS.Workbook()

    const worksheet = workbook.addWorksheet('Detalle')

    // Tìtulos
    this._setXLSXTitles(worksheet)

    // Encabezados
    this._setXLSXHeader(worksheet)

    // Contenido
    this._setXLSXContent(worksheet)

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      //saveAs(blob, `FacturacionCancelacion_${Date.now()}${EXCEL_EXTENSION}`)
      this.todayWithPipe = this.pipe.transform(Date.now(), 'dd_MM_yyyy');

      saveAs(blob, `FacturacionCancelacion_` + this.todayWithPipe + `${EXCEL_EXTENSION}`)
    });

  }

  _setXLSXTitles(worksheet: ExcelJS.Worksheet) {

    const fillNota: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff91d2ff' } }
    const fillNotaCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillCobranza: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffa4ffa4' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }

    worksheet.getCell('Q2').value = 'Nota de crédito'
    worksheet.getCell('Q2').fill = fillNota
    worksheet.getCell('Q2').alignment = alignment
    worksheet.getCell('R2').value = 'Complemento de pago'
    worksheet.getCell('R2').fill = fillCobranza
    worksheet.getCell('R2').alignment = alignment
    worksheet.getCell('S2').value = 'Comprobantes Cancelados'
    worksheet.getCell('S2').fill = fillNotaCancelada
    worksheet.getCell('S2').alignment = alignment
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

  _setXLSXContent(worksheet: ExcelJS.Worksheet) {

    const fillNota: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff91d2ff' } }
    const fillNotaCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillCobranza: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffa4ffa4' } }
    const fillFactura: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } }

    let inicio = 5


    this.listBusquedaCompleto.forEach(factura => {
      const inicioFactura = inicio
      let columnaImportePendiente = 0
      let columnaImportePendiente_dls = 0
      let ImporteNotayPago = 0
      let ImporteNotayPago_dlls = 0
      encabezados.forEach((encabezado, indexE) => {
        if (encabezado.id == 'importePendientePorPagar') {
          columnaImportePendiente = indexE + 1
        }
        if (encabezado.id == 'importePendientePorPagar_dls') {
          columnaImportePendiente_dls = indexE + 1
        }
        let cell = worksheet.getCell(inicio, indexE + 1)
        cell.value = factura[encabezado.id]
        cell.fill = factura['fechaCancelacion'] ? fillNotaCancelada : fillFactura
        const encabezadosRedondeados = ['total', 'importe', 'ivaRet', 'importeEnPesos']
        if (encabezadosRedondeados.includes(encabezado.id)) {
          //cell.value = this.formatCurrency(+cell.value)
          cell.value = this.formatCurrency(factura['fechaCancelacion'] ? 0 : +cell.value)
        }

        if (encabezado.id == 'iva') {

          let IVA = 0

          IVA = factura['idMoneda'] === 'MXN' ? +cell.value : +cell.value * +factura['tipoCambio']

          cell.value = this.formatCurrency(factura['fechaCancelacion'] ? 0 : IVA)
          //cell.value = this.formatCurrency(nota['nC_FechaCancelacion'] ? 0 : +cell.value)
        }

        if (encabezado.id == 'tipoCambio') {
          if (factura['tipoCambio'] == "0") {
            cell.value = ""
          } else {
            cell.value = factura['tipoCambio']
          }

        }

      })
      inicio++

      if (factura.notas != null && factura.notas.length > 0) {
        factura.notas.forEach(nota => {
          encabezados.forEach((encabezado, indexE) => {
            let cell = worksheet.getCell(inicio, indexE + 1)
            const campo = this.equivalentesNotas[encabezado.id]
            cell.value = nota[campo]
            cell.fill = nota['nC_FechaCancelacion'] ? fillNotaCancelada : fillNota
            if (encabezado.id == 'total') {
              cell.value = this.formatCurrency(nota['nC_FechaCancelacion'] ? 0 : +cell.value)
            }
            if (encabezado.id == 'importe') {
              cell.value = this.formatCurrency(nota['nC_FechaCancelacion'] ? 0 : +cell.value)
              console.log(" +cell.value " + nota['nC_Importe'])
              //ImporteNotayPago += nota['nC_Importe']
              ImporteNotayPago += nota['nC_FechaCancelacion'] ? 0 : nota['nC_Importe'] + nota['nC_Iva']
              ImporteNotayPago_dlls += nota['nC_FechaCancelacion'] ? 0 : nota['nC_Importe']

              console.log(" ImporteNotayPago " + ImporteNotayPago)
              console.log(" ImporteNotayPago_dlls " + ImporteNotayPago_dlls)
            }
            if (encabezado.id == 'iva') {
              let IVA = 0
              IVA = nota['nC_IdMoneda'] === 'MXN' ? +cell.value : +cell.value * +nota['nC_TipoCambio']
              cell.value = this.formatCurrency(nota['nC_FechaCancelacion'] ? 0 : IVA)
              //cell.value = this.formatCurrency(nota['nC_FechaCancelacion'] ? 0 : +cell.value)
            }
            if (encabezado.id == 'numProyecto') {
              cell.value = factura['numProyecto']

            }
            if (encabezado.id == 'importeEnPesos') {
              let importeEnPesos = 0

              importeEnPesos = nota['nC_IdMoneda'] === 'MXN' ? nota['nC_Importe'] : nota['nC_Importe'] * +nota['nC_TipoCambio']
              cell.value = this.formatCurrency(nota['nC_FechaCancelacion'] ? 0 : importeEnPesos)
            }

            if (encabezado.id == 'mes') {
              cell.value = nota['nC_Mes']
            }

            if (encabezado.id == 'tipoCambio') {
              if (nota['nC_TipoCambio'] == "0") {
                cell.value = ""
              } else {
                cell.value = nota['nC_TipoCambio']
              }

            }

          })
          inicio++
        })
      }

      if (factura.cobranzas != null && factura.cobranzas.length > 0) {
        factura.cobranzas.forEach(cobranza => {
          encabezados.forEach((encabezado, indexE) => {
            let cell = worksheet.getCell(inicio, indexE + 1)
            const campo = this.equivalentesCobranzas[encabezado.id]
            cell.value = cobranza[campo]
            cell.fill = cobranza['c_FechaCancelacion'] ? fillNotaCancelada : fillCobranza
            //cell.fill = fillCobranza
            if (encabezado.id == 'total') {
              //cell.value = this.formatCurrency(+cell.value)
              cell.value = this.formatCurrency(cobranza['c_FechaCancelacion'] ? 0 : +cell.value)
            }
            if (encabezado.id == 'importe') {
              //cell.value = this.formatCurrency(+cell.value)
              cell.value = this.formatCurrency(cobranza['c_FechaCancelacion'] ? 0 : +cell.value)
              //console.log(" +cell.value3 " + + cobranza['base'])
              //ImporteNotayPago += cobranza['base']
              ImporteNotayPago += cobranza['c_FechaCancelacion'] ? 0 : cobranza['base'] + cobranza['c_IvaP']
              ImporteNotayPago_dlls += cobranza['c_FechaCancelacion'] ? 0 : cobranza['base']
              //console.log(" ImporteNotayPago3 " + ImporteNotayPago)
            }
            if (encabezado.id == 'iva') {
              let IVA = 0
              IVA = cobranza['c_IdMonedaP'] === 'MXN' ? +cell.value : +cell.value * +cobranza['c_TipoCambioP']
              //cell.value = this.formatCurrency(cobranza['c_FechaCancelacion'] ? 0 : +cell.value)
              cell.value = this.formatCurrency(cobranza['c_FechaCancelacion'] ? 0 : IVA)
            }
            if (encabezado.id == 'numProyecto') {
              cell.value = factura['numProyecto']
            }
            if (encabezado.id == 'importeEnPesos') {
              let importeEnPesos = 0

              //importeEnPesos = cobranza['c_IdMonedaP'] === 'MXN' ? cobranza['c_ImportePagado'] : cobranza['c_ImportePagado'] * +cobranza['c_TipoCambioP']
              importeEnPesos = cobranza['c_IdMonedaP'] === 'MXN' ? cobranza['base'] : cobranza['base'] * +cobranza['c_TipoCambioP']
              //cell.value = cobranza['c_FechaCancelacion'] ? 0 : importeEnPesos
              console.log("importeEnPesos " + importeEnPesos)
              if (cobranza['c_FechaCancelacion'] == null || cobranza['c_FechaCancelacion'] == "") {
                if (importeEnPesos == null) {
                  cell.value = this.formatCurrency(0)
                } else {
                  cell.value = this.formatCurrency(importeEnPesos)
                }
              } else {
                cell.value = this.formatCurrency(0)
              }

            }

            if (encabezado.id == 'mes') {
              cell.value = factura['mes']
            }

            if (encabezado.id == 'tipoCambio') {
              if (cobranza['c_TipoCambioP'] == 0) {
                cell.value = ""
              } else {
                cell.value = cobranza['c_TipoCambioP']
              }

            }

          })
          inicio++
        })
      }


      if (factura['idMoneda'] === 'MXN') {

        let cell = worksheet.getCell(inicioFactura, columnaImportePendiente)

        let importePorPagarPesos = 0

        //importePorPagarPesos = factura['importe'] - ImporteNotayPago
        importePorPagarPesos = factura['total'] - ImporteNotayPago


        //cell.value = this.formatCurrency(importePorPagarPesos)
        
        //cell.value = this.formatCurrency(factura['fechaCancelacion'] ? 0 : importePorPagarPesos)
        cell.value = this.formatCurrency(importePorPagarPesos)

        let cell_dls = worksheet.getCell(inicioFactura, columnaImportePendiente_dls)
        cell_dls.value = this.formatCurrency(0.0)

      } else {
        let cell = worksheet.getCell(inicioFactura, columnaImportePendiente)
        cell.value = this.formatCurrency(0.0)

        let importePorPagar_dlls = 0
        this.tipoCambio = ImporteNotayPago_dlls * +factura['tipoCambio']

        if(this.tipoCambio == 0){
          importePorPagar_dlls = factura['importeEnPesos'] / +factura['tipoCambio']
        }else{
          importePorPagar_dlls = factura['importeEnPesos']  - this.tipoCambio
        
          console.log(" factura['total'] - ImporteNotayPago " + (factura['total'] - this.tipoCambio))
          console.log(" ImporteNotayPago " + this.tipoCambio)
          console.log(" factura['total'] " + factura['total'])
          console.log(" importePorPagar_dlls " + importePorPagar_dlls)
        }

        //const myNumber = Number(factura['tipoCambio']);
        //importePorPagar = factura['importe'] - ImporteNotayPago
       

        let cell_dls = worksheet.getCell(inicioFactura, columnaImportePendiente_dls)
        //cell_dls.value = this.formatCurrency(importePorPagar)
        //cell_dls.value = this.formatCurrency(factura['fechaCancelacion'] ? 0 : importePorPagar)
        cell_dls.value = this.formatCurrency(importePorPagar_dlls)
      }
      // Cálculos


    })

    // this.data.forEach(record => {

    //   let totalTimesheet = 0

    //   record.participacion.forEach((proyecto, index) => {
    //     worksheet.getColumn(10 + index).width = 15
    //     worksheet.getCell(row, 10 + index).value = this.getDecimal(proyecto.dedicacion)
    //     worksheet.getCell(row, 10 + index).numFmt = '0.00%';
    //     totalTimesheet += +proyecto.dedicacion
    //   })

    //   worksheet.getCell(row, 1).value = 1
    //   worksheet.getCell(row, 2).value = record.timesheet.coi_empresa
    //   worksheet.getCell(row, 3).value = record.timesheet.noi_empresa
    //   worksheet.getCell(row, 4).value = record.timesheet.noi_empleado
    //   worksheet.getCell(row, 5).value = record.timesheet.num_empleado
    //   worksheet.getCell(row, 6).value = 1
    //   worksheet.getCell(row, 7).value = record.timesheet.empleado
    //   worksheet.getCell(row, 8).value = record.timesheet.responsable
    //   worksheet.getCell(row, 9).value = this.getDecimal(totalTimesheet)
    //   worksheet.getCell(row, 9).numFmt = '0.00%';
    //   row++
    // })
  }

  formatCurrency(valor: number) {
    return valor.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    })
  }

  ejecutarCancelacion() {

    if (!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    this.facturacionService.cancelarComplemento(this.complementoInfo.esPago, this.form.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.complementoInfo.showModal = false
          this.isCancelacionVisible = false

          const indexFactura = this.listBusquedaCompleto.findIndex(factura => factura.uuid === this.uuidPrincipal)
          if (this.complementoInfo.esPago) {
            this.listBusquedaCompleto.at(indexFactura).totalCobranzas--
          } else {
            this.listBusquedaCompleto.at(indexFactura).totalNotasCredito--
          }

          this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'Se ha realizado la cancelación.' })
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  limpiar() {
    this.form.reset()
  }

  esInvalido(campo: string): boolean {
    return this.form.get(campo).invalid &&
      (this.form.get(campo).dirty || this.form.get(campo).touched)
  }

  obtenerMensajeError(campo: string): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if (this.form.get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }

  esInvalidoGeneral(campo: string): boolean {
    return this.formGeneral.get(campo).invalid &&
      (this.formGeneral.get(campo).dirty || this.formGeneral.get(campo).touched)
  }

  obtenerMensajeErrorGeneral(campo: string): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if (this.formGeneral.get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }

  exportJsonToExcelReporte(): void {

    const workbook = new ExcelJS.Workbook()

    const worksheet = workbook.addWorksheet('Detalle')

    // Tìtulos
    this._setXLSXTitlesReporte(worksheet)

    // Encabezados
    this._setXLSXHeaderReporte(worksheet)

    let row = 5

    // Contenido
    this._setXLSXContentReporte(worksheet,row)

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      //saveAs(blob, `FacturacionCancelacion_${Date.now()}${EXCEL_EXTENSION}`)
      this.todayWithPipe = this.pipe.transform(Date.now(), 'dd_MM_yyyy');

      saveAs(blob, `ReporteFacturacion_` + this.todayWithPipe + `${EXCEL_EXTENSION}`)
    });

  }

  _setXLSXTitlesReporte(worksheet: ExcelJS.Worksheet) {

    const fillNota: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff91d2ff' } }
    const fillNotaCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillCobranza: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffa4ffa4' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }

    worksheet.getCell('Q2').value = 'Nota de crédito'
    worksheet.getCell('Q2').fill = fillNota
    worksheet.getCell('Q2').alignment = alignment
    worksheet.getCell('R2').value = 'Complemento de pago'
    worksheet.getCell('R2').fill = fillCobranza
    worksheet.getCell('R2').alignment = alignment
    worksheet.getCell('S2').value = 'Comprobantes Cancelados'
    worksheet.getCell('S2').fill = fillNotaCancelada
    worksheet.getCell('S2').alignment = alignment
  }

  _setXLSXHeaderReporte(worksheet: ExcelJS.Worksheet) {

    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }

    encabezadosReportes.forEach((encabezado, index) => {
      let cell = worksheet.getCell(4, index + 1)
      cell.value = encabezado.label
      cell.fill = fill
      cell.alignment = alignment
    })
  }

  _setXLSXContentReporte(worksheet: ExcelJS.Worksheet, row: number): number {

    const fillCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillFactura: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } }

    this.listBusquedaCompleto.forEach(factura => {

      this.importePagado = 0
      this.ivaPagado = 0
      this.TotalPagado  = 0
     
       // cell.fill = factura['fechaCancelacion'] ? fillNotaCancelada : fillFactura

       worksheet.getCell(row, 1).value = factura.numProyecto
      worksheet.getCell(row, 2).value = factura.cliente
      worksheet.getCell(row, 3).value = factura.fechaEmision

      if (factura.cobranzas != null && factura.cobranzas.length > 0 && factura.fechaCancelacion == null) {

        factura.cobranzas.forEach(cobranza => {  
          worksheet.getCell(row, 4).value = cobranza.c_FechaPago
          this.importePagado += +cobranza.base
          this.ivaPagado += +cobranza.c_IvaP
          this.TotalPagado += +cobranza.c_ImportePagado
        })

        worksheet.getCell(row, 19).value = this.importePagado
        worksheet.getCell(row, 20).value = this.ivaPagado
        worksheet.getCell(row, 21).value = this.TotalPagado
        
       
      }else{

        worksheet.getCell(row, 4).value = ''
        worksheet.getCell(row, 19).value = 0
        worksheet.getCell(row, 20).value = 0
        worksheet.getCell(row, 21).value = 0

      }      
      worksheet.getCell(row, 5).value = factura.fechaCancelacion

      if (factura.notas != null && factura.notas.length > 0 ) {

        factura.notas.forEach(notas => {
          worksheet.getCell(row, 6).value = notas.nC_NotaCredito
          worksheet.getCell(row, 7).value = notas.nC_FechaNotaCredito
          if(factura.fechaCancelacion != null){
            worksheet.getCell(row, 18).value = notas.nC_Importe
          }else{
            worksheet.getCell(row, 18).value = 0
          }
          
        })
        
       
      }else{

        worksheet.getCell(row, 6).value = ''
        worksheet.getCell(row, 7).value = ''
        worksheet.getCell(row, 18).value = 0

      }      

      worksheet.getCell(row, 8).value = factura.noFactura
      worksheet.getCell(row, 9).value = factura.idTipoFactura
      worksheet.getCell(row, 10).value = factura.idMoneda
      if(factura.fechaCancelacion == null){
        worksheet.getCell(row, 11).value = factura.tipoCambio      
        worksheet.getCell(row, 12).value = 'importe en DOLARES'
        worksheet.getCell(row, 13).value = factura.importe
        worksheet.getCell(row, 14).value = factura.iva
        worksheet.getCell(row, 15).value = factura.ivaRet
        worksheet.getCell(row, 16).value = factura.total
      }else{
        worksheet.getCell(row, 11).value = 0  
        worksheet.getCell(row, 12).value = 0
        worksheet.getCell(row, 13).value = 0
        worksheet.getCell(row, 14).value = 0
        worksheet.getCell(row, 15).value = 0
        worksheet.getCell(row, 16).value = 0
      }
      
      worksheet.getCell(row, 17).value = factura.concepto
      
      if(factura.fechaCancelacion == null){
        worksheet.getCell(row, 22).value = 'importePendientePorPagar'
        worksheet.getCell(row, 23).value = 'IVAPendientePorPagar'
        worksheet.getCell(row, 24).value = 'TOTALPendientePorPagar'
      }else{
        worksheet.getCell(row, 22).value = 0
        worksheet.getCell(row, 23).value = 0
        worksheet.getCell(row, 24).value = 0
      }
      
        
    //})

    //inicio atc
/**
    this.costos.forEach(record => {
      //worksheet.getCell(row).fill = record.fechaCancelacion ? fillCancelada : fillFactura
      //const col = row.getCell(row);

      
      
      if(record.beneficios[0] == undefined){
        this.Costomenualproy = 0

        this.vivienda = 0
        this.Automovil = 0
        this.ViaticosaComprobar = 0
        this.BonoAdicionalReubicacion = 0
        this.Gasolina = 0
        this.Casetas = 0
        this.AyudaDeTransporte = 0
        this.VuelosDeAvion = 0
        this.ProvisionImpuestosExpatsr = 0
        this.FringeExpats = 0
        this.ProgramaDeEntretenimiento = 0
        this.EventosEspeciales = 0
        this.CostoIt = 0
        this.CostoTelefonia = 0
        this.SvDirectivos = 0
        this.FacturacionBpm = 0
        
       
        //console.log("Entra Aquio --------------> " +this.Costomenualproy);
      }else{
        //console.log("Entra Aquio --------------> " +record.beneficios[0].costo);
        this.arraybeneficio = record.beneficios
      

      const dato = this.arraybeneficio;
         dato?.forEach(paso=>{
             //console.log("paso.beneficio --------------> " +paso.beneficio);
             //console.log("paso.cost-------------->> " +paso.costo);

             this.Costomenualproy += +paso.costo

             if(paso.beneficio === "Automóvil"){
              this.Automovil = paso.costo;
            }
            
              if(paso.beneficio === "Vivienda"){

                this.vivienda = paso.costo;
            }

            if(paso.beneficio === "Viáticos a comprobar"){

              this.ViaticosaComprobar = paso.costo;
            
            }

            if(paso.beneficio === "Bono Adicional"){

              this.BonoAdicionalReubicacion = paso.costo;            
            }

            if(paso.beneficio === "Gasolina"){

              this.Gasolina = paso.costo;
            }

            if(paso.beneficio === "Casetas"){

              this.Casetas = paso.costo;
            
            }

            if(paso.beneficio === "Ayuda de transporte"){

              this.AyudaDeTransporte = paso.costo;
            }

            if(paso.beneficio === "Vuelos de avión"){

              this.VuelosDeAvion = paso.costo;
            }

            if(paso.beneficio === "Provisión Impuestos Expats"){

              this.ProvisionImpuestosExpatsr = paso.costo;
            }

            if(paso.beneficio === "Programa de entrenamiento"){

              this.ProgramaDeEntretenimiento = paso.costo;
            }

            if(paso.beneficio === "Eventos especiales"){

              this.EventosEspeciales = paso.costo;
            }

            if(paso.beneficio === "Costo IT"){

              this.CostoIt = paso.costo;
            }

            if(paso.beneficio === "Costo telefonia"){

              this.CostoTelefonia = paso.costo;
            }

            if(paso.beneficio === "S.V. Directivos"){

              this.SvDirectivos = paso.costo;
            }

            if(paso.beneficio === "Facturación BPM"){

              this.FacturacionBpm = paso.costo;
            }

            if(paso.beneficio === "Fringe Expats"){

              this.FringeExpats = paso.costo;
            
            }

            
         })



        // console.log("suma fuerapaso.cost-------------->> " +this.Costomenualproy);

        this.arraybeneficiosProyectos = record.beneficiosproyecto
      

      const datoProyecto = this.arraybeneficiosProyectos;
      datoProyecto?.forEach(pasoProyec=>{
             //console.log("paso.beneficio --------------> " +paso.beneficio);
             //console.log("paso.cost-------------->> " +paso.costo);

             

             if(pasoProyec.beneficio === "Automóvil"){
              this.Proy_Automovil = pasoProyec.nucostobeneficio;
            }
            
              if(pasoProyec.beneficio === "Vivienda"){

                this.Proy_vivienda = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Viáticos a comprobar"){

              this.Proy_ViaticosaComprobar = pasoProyec.nucostobeneficio;
            
            }

            if(pasoProyec.beneficio === "Bono Adicional"){

              this.Proy_BonoAdicionalReubicacion = pasoProyec.nucostobeneficio;            
            }

            if(pasoProyec.beneficio === "Gasolina"){

              this.Proy_Gasolina = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Casetas"){

              this.Proy_Casetas = pasoProyec.nucostobeneficio;
            
            }

            if(pasoProyec.beneficio === "Ayuda de transporte"){

              this.Proy_AyudaDeTransporte = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Vuelos de avión"){

              this.Proy_VuelosDeAvion = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Provisión Impuestos Expats"){

              this.Proy_ProvisionImpuestosExpatsr = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Programa de entrenamiento"){

              this.Proy_ProgramaDeEntretenimiento = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Eventos especiales"){

              this.Proy_EventosEspeciales = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Costo IT"){

              this.Proy_CostoIt = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Costo telefonia"){

              this.Proy_CostoTelefonia = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "S.V. Directivos"){

              this.Proy_SvDirectivos = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Facturación BPM"){

              this.Proy_FacturacionBpm = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Fringe Expats"){

              this.Proy_FringeExpats = pasoProyec.nucostobeneficio;
            
            }

            
         })

      }
      

      worksheet.getCell(row, 1).value = record.numEmpleadoRrHh
      worksheet.getCell(row, 2).value = record.numEmpleadoNoi
      worksheet.getCell(row, 3).value = record.nombreCompletoEmpleado
      worksheet.getCell(row, 4).value = record.ciudad
      worksheet.getCell(row, 5).value = record.puesto
     
        worksheet.getCell(row, 6).value = record.proyecto
     

      worksheet.getCell(row, 7).value = this.formatCurrency(record.sueldoBrutoInflacion)
      //worksheet.getCell(row, 8).value = this.formatCurrency(record.cargasSociales)
     // worksheet.getCell(row, 9).value = this.formatCurrency(record.costoMensualEmpleado)
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
      //worksheet.getCell(row, 19).value = record.ispt
      //worksheet.getCell(row, 20).value = this.formatCurrency(record.sueldoBrutoInflacion)
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
      worksheet.getCell(row, 46).value = this.formatCurrency(numero_salarioDiarioIntegrado)
      //worksheet.getCell(row, 49).value = record.salarioDiarioIntegrado

      //BENEFICIOS POR EMPLEADO

      worksheet.getCell(row, 47).value = this.formatCurrency(this.vivienda)
      worksheet.getCell(row, 48).value = this.formatCurrency(this.Automovil)
      worksheet.getCell(row, 49).value = this.formatCurrency(this.ViaticosaComprobar)
      worksheet.getCell(row, 50).value = this.formatCurrency(this.BonoAdicionalReubicacion)
      worksheet.getCell(row, 51).value = this.formatCurrency(this.Gasolina)
      worksheet.getCell(row, 52).value = this.formatCurrency(this.Casetas)
      worksheet.getCell(row, 53).value = this.formatCurrency(this.AyudaDeTransporte)
      worksheet.getCell(row, 54).value = this.formatCurrency(this.VuelosDeAvion)
      worksheet.getCell(row, 55).value = this.formatCurrency(this.ProvisionImpuestosExpatsr)
      worksheet.getCell(row, 56).value = this.formatCurrency(this.FringeExpats)
      worksheet.getCell(row, 57).value = this.formatCurrency(this.ProgramaDeEntretenimiento)
      worksheet.getCell(row, 58).value = this.formatCurrency(this.EventosEspeciales)
      worksheet.getCell(row, 59).value = this.formatCurrency(this.CostoIt)
      worksheet.getCell(row, 60).value = this.formatCurrency(this.CostoTelefonia)
      worksheet.getCell(row, 61).value = this.formatCurrency(this.SvDirectivos)
      worksheet.getCell(row, 62).value = this.formatCurrency(this.FacturacionBpm)

      //BENEFICIOS POR PROYECTO

      worksheet.getCell(row, 63).value = this.formatCurrency(this.Proy_vivienda)
      worksheet.getCell(row, 64).value = this.formatCurrency(this.Proy_Automovil)
      worksheet.getCell(row, 65).value = this.formatCurrency(this.Proy_ViaticosaComprobar)
      worksheet.getCell(row, 66).value = this.formatCurrency(this.Proy_BonoAdicionalReubicacion)
      worksheet.getCell(row, 67).value = this.formatCurrency(this.Proy_Gasolina)
      worksheet.getCell(row, 68).value = this.formatCurrency(this.Proy_Casetas)
      worksheet.getCell(row, 69).value = this.formatCurrency(this.Proy_AyudaDeTransporte)
      worksheet.getCell(row, 70).value = this.formatCurrency(this.Proy_VuelosDeAvion)
      worksheet.getCell(row, 71).value = this.formatCurrency(this.Proy_ProvisionImpuestosExpatsr)
      worksheet.getCell(row, 72).value = this.formatCurrency(this.Proy_FringeExpats)
      worksheet.getCell(row, 73).value = this.formatCurrency(this.Proy_ProgramaDeEntretenimiento)
      worksheet.getCell(row, 74).value = this.formatCurrency(this.Proy_EventosEspeciales)
      worksheet.getCell(row, 75).value = this.formatCurrency(this.Proy_CostoIt)
      worksheet.getCell(row, 76).value = this.formatCurrency(this.Proy_CostoTelefonia)
      worksheet.getCell(row, 77).value = this.formatCurrency(this.Proy_SvDirectivos)
      worksheet.getCell(row, 78).value = this.formatCurrency(this.Proy_FacturacionBpm)
      worksheet.getCell(row, 79).value = this.formatCurrency(record.costoMensualEmpleado + this.Costomenualproy + record.costoMensualProyecto)

      
      //worksheet.getCell(row).fill = {  type: 'pattern', pattern: 'solid', fgColor: { argb: record.fechaCancelacion ?  'FFC000':  '70AD47'}};
      //worksheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: record.fechaCancelacion ? 'ea899a' : 'ffffff' } };
*/
      //fin atc
      row++
    });

    return row

  }




}

// public exportJsonToExcel(fileName: string = 'facturacion_cancelacion'): void {
//   // inserting first blank row
//   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
//     this.listBusquedaCompleto,
//     this.getOptions(this.listBusquedaCompleto)
//   );

//   //for (let i = 1, length = this.listBusquedaCompleto.length; i < length; i++) {
//   // adding a dummy row for separation
//   XLSX.utils.sheet_add_json(
//     worksheet,
//     [{}],
//     this.getOptions(
//       {
//         data: [],
//         skipHeader: true,
//       },
//       -1
//     )
//   );
//   XLSX.utils.sheet_add_json(
//     worksheet,
//     this.listBusquedaCompleto,
//     this.getOptions(this.listBusquedaCompleto, 1)
//   );
//   //}
//   const workbook: XLSX.WorkBook = {
//     Sheets: { Sheet1: worksheet },
//     SheetNames: ['Sheet1'],
//   };
//   // save to file
//   XLSX.writeFile(workbook, `${fileName}${EXCEL_EXTENSION}`);
// }
