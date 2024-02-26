import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FacturacionService } from '../../services/facturacion.service';
import { MessageService } from 'primeng/api';
import { FacrurasNC, InfoProyecto, LstFacturas, NotaCreditoSF, ResponseXML } from '../../Models/FacturacionModels';
import { Opcion } from 'src/models/general.model';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize, forkJoin } from 'rxjs';
import { EXCEL_EXTENSION, TITLES, errorsArray } from 'src/utils/constants';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FormBuilder, Validators } from '@angular/forms';
import { format } from 'date-fns';
import { formatCurrency } from 'src/helpers/helpers';
import { DialogService } from 'primeng/dynamicdialog';
import { VincularNotaCreditoComponent } from '../vincular-nota-credito/vincular-nota-credito.component';

@Component({
  selector: 'app-nota-credito-sin-factura',
  templateUrl: './nota-credito-sin-factura.component.html',
  styleUrls: ['./nota-credito-sin-factura.component.css'],
  providers: [MessageService, DialogService]
})
export class NotaCreditoSinFacturaComponent implements OnInit {

  cargaFileServ     = inject(FacturacionService)
  messageService    = inject(MessageService)
  timesheetService  = inject(TimesheetService)
  sharedService     = inject(SharedService)
  fb                = inject(FormBuilder)
  dialogService     = inject(DialogService)

  isLoadingFacturas: boolean = false;
  fileSizeMax = 1000000;
  isClear: boolean = false;
  strFileBase64: string = '';
  listFacturasBase64: Array<LstFacturas> = new Array<LstFacturas>();
  infoProyecto: InfoProyecto = new InfoProyecto();
  @ViewChild('fileUpload') fileUpload: any;
  listResponse: Array<ResponseXML>;
  errorMEssageFile: string = '';
  proyectos: Opcion[] = []
  idProyecto: number
  facturaBase64: string
  complementoInfo: any = {
    esPago:     false,
    titulo:     '',
    showModal:  false
  }
  proyectoBusqueda: number = null
  mesBusqueda: Date
  mesSeleccionado: number = null
  anioSeleccionado: number = null
  totalRecords:number = 0

  listBusquedaCompleto: NotaCreditoSF[] = []
  
  form = this.fb.group({
    uuid:               [''],
    fecha_cancelacion:  ['', Validators.required],
    motivo_cancelacion: ['', [Validators.required, Validators.minLength(20)]]
  })
  
  constructor() { }

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)

    forkJoin([
      this.timesheetService.getCatProyectos(),
      this.cargaFileServ.obtenerNotasSinFactura()
    ])
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.totalRecords = data.length
          const [proyectosR, notasCreditoR] = data
          this.proyectos = proyectosR.data.map(proyecto => ({code: proyecto.numProyecto.toString(), name: `${proyecto.numProyecto.toString()} - ${proyecto.nombre}`}))
          this.listBusquedaCompleto = notasCreditoR.data
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  buscarNotas() {
    
    this.sharedService.cambiarEstado(true)

      this.cargaFileServ.obtenerNotasSinFactura(this.proyectoBusqueda || 0, this.mesSeleccionado || 0, this.anioSeleccionado || 0)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.listBusquedaCompleto = data
          this.totalRecords = data.length
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  buscarRegistros() {

    if(this.mesBusqueda) {
      this.mesSeleccionado   = +format(this.mesBusqueda, 'M')
      this.anioSeleccionado  = +format(this.mesBusqueda, 'Y')
    } else {
      this.mesSeleccionado   = null
      this.anioSeleccionado  = null
    }

    this.buscarNotas()
  }

  limpiarFiltros() {
    this.mesBusqueda = null
    this.proyectoBusqueda = null
    this.mesSeleccionado = null
    this.anioSeleccionado = null

    this.buscarNotas()
  }

  getHeadersTabla() {
    return [
      {key: 'chuuid_nota_credito', label: 'UUID'},
      {key: 'nunum_proyecto', label: 'Num Proyecto'},
      // 'ID Tipo Factura',
      {key: 'nukidmoneda', label: 'ID Moneda'},
      {key: 'nuimporte', label: 'Importe'},
      {key: 'nuiva', label: 'Iva'},
      // 'IvaRet',
      {key: 'nutotal', label: 'Total'},
      {key: 'chconcepto', label: 'Concepto'},
      {key: 'numes', label: 'Mes'},
      {key: 'nuanio', label: 'Año'},
      // 'Fecha Emision',
      // 'Fecha Pago',
      {key: 'dtfecha_cancelacion', label: 'Fecha Cancelacion'},
      // 'No Factura',
      {key: 'nutipo_cambio', label: 'Tipo Cambio'},
      {key: 'chmotivocancela', label: 'Motivo Cancelacion'}
    ];
  }

  async onBasicUpload(event: any) {
    if (event && event.files) {
      //console.log('length: ' + event.files.length);
      this.isLoadingFacturas = true;
      await this.convertXML(event.files)
      //console.log(this.listFacturasBase64);

      setTimeout(
        ()=>{
        this.cargaFile()
      },3000);
    }
  }

  async convertXML(files: any) {
    return new Promise((resolve, reject) => {
      let listFacturasBase64Sub: Array<LstFacturas> = new Array<LstFacturas>();
      for (let file of files) {
        let reader = new FileReader();
        reader.onload = (evt) => {
          const xmlData: string = (evt as any).target.result;
          var parser = new DOMParser();
          var xmlz = parser.parseFromString(xmlData, "application/xml");
          this.strFileBase64 = window.btoa((new XMLSerializer()).serializeToString(xmlz));
          resolve(listFacturasBase64Sub);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      }

    });
  }

  cargaFile() {

    this.listResponse = new Array<ResponseXML>();
    try {
      const body = {
        NumProyecto: this.idProyecto,
        FacturaB64: this.strFileBase64
      }
      this.cargaFileServ.cargarNotaSinFactura(body).subscribe({
        next: (data) => {
          //console.log(data);
          if (data.success) {
            this.listResponse = data.data;
            //console.log(this.listResponse);
            this.messageService.add({
              severity: "success",
              summary: "Validar",
              detail: "Nota procesada",
              life: 2000
            });

            this.clearFile()
          }
        },
        error: (e) => {
          //console.log(e);
          let error = `${e.error}`
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: error,
            life: 2000
          });

          this.errorMEssageFile = error;

          this.clearFile(false)
        }

      })
      this.isLoadingFacturas = false;
      this.isClear = true;
    } catch (err) {
      console.log(err);
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: String(err)
      });
    }

  }

  clearFile(exito: boolean = true) {
    if(exito) {
      this.idProyecto = null
    }
    this.isClear = !this.isClear
    this.fileUpload.clear();
    this.listResponse = new Array<ResponseXML>();
    this.errorMEssageFile = '';
    this.listFacturasBase64 = new Array<LstFacturas>();
    this.listResponse = new Array<ResponseXML>();
  }

  exportJsonToExcel() {

    const workbook = new ExcelJS.Workbook()

    const worksheet = workbook.addWorksheet('Detalle')

    // Encabezados
    this._setXLSXHeader(worksheet)

    // Contenido
    this._setXLSXContent(worksheet)

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      saveAs(blob, `NotasCreditoSF_${Date.now()}${EXCEL_EXTENSION}`)
    });
  }

  _setXLSXHeader(worksheet: ExcelJS.Worksheet) {
    
    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }

    this.getHeadersTabla().forEach((encabezado, index) => {
      let cell = worksheet.getCell(1, index + 1)
      cell.value = encabezado.label
      cell.fill = fill
      cell.alignment = alignment
    })
  }

  _setXLSXContent(worksheet: ExcelJS.Worksheet) {

    let row = 2
    this.listBusquedaCompleto.forEach((nota, index) => {
      worksheet.getCell(row + index, 1).value = nota.chuuid_nota_credito
      worksheet.getCell(row + index, 2).value = nota.nunum_proyecto 
      worksheet.getCell(row + index, 3).value = nota.nukidmoneda
      worksheet.getCell(row + index, 4).value = formatCurrency(nota.nuimporte)
      worksheet.getCell(row + index, 5).value = formatCurrency(nota.nuiva)
      worksheet.getCell(row + index, 6).value = formatCurrency(nota.nutotal)
      worksheet.getCell(row + index, 7).value = nota.chconcepto
      worksheet.getCell(row + index, 8).value = nota.numes 
      worksheet.getCell(row + index, 9).value = nota.nuanio
      worksheet.getCell(row + index, 10).value = nota.dtfecha_cancelacion
      worksheet.getCell(row + index, 11).value = nota.nutipo_cambio
      worksheet.getCell(row + index, 12).value = nota.chmotivocancela
    })
  }
  
  cancelarComplemento(uuid: string) {
    this.complementoInfo = {
      esPago: false,
      titulo: 'Cancelar nota',
      showModal: true
    }
    this.form.reset()
    this.form.patchValue({uuid})
  }
  
  ejecutarCancelacion() {
    
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    this.cargaFileServ.cancelarComplemento(this.complementoInfo.esPago, this.form.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.complementoInfo.showModal = false

          const indexFactura = this.listBusquedaCompleto.findIndex(factura => factura.chuuid_nota_credito === this.form.value.uuid)
          this.listBusquedaCompleto.at(indexFactura).dtfecha_cancelacion = this.form.value.fecha_cancelacion
          this.listBusquedaCompleto.at(indexFactura).chmotivocancela = this.form.value.motivo_cancelacion

          this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'Se ha realizado la cancelación.' })
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  esInvalido(campo: string): boolean {
    return this.form.get(campo).invalid && 
            (this.form.get(campo).dirty || this.form.get(campo).touched)
  }

  obtenerMensajeError(campo: string): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if(this.form.get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }

  vicularNotaCredito(nota: NotaCreditoSF, i: number) {

    this.dialogService.open(VincularNotaCreditoComponent, {
      header: 'Vincular Nota de crédito',
      width: '50%',
      contentStyle: {overflow: 'auto'},
      data: {
        nota,
      }
    })
    .onClose.subscribe((result) => {
      if(result && result.ok) {
        this.listBusquedaCompleto.splice(i, 1)
        this.messageService.add({severity: "success", summary: TITLES.success, detail: "Nota vinculada."});
      }
    })
  }

}
