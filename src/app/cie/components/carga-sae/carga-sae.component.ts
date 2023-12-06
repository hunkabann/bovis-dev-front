import { Component, OnInit, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { CieService } from '../../services/cie.service';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CieElementPost, CieProyecto } from '../../models/cie.models';
import { EXCEL_EXTENSION, SUBJECTS, TITLES, cieHeaders } from 'src/utils/constants';
import { finalize, forkJoin } from 'rxjs';

interface Option {
  name:   string,
  value:  string,
}

@Component({
  selector: 'app-carga-sae',
  templateUrl: './carga-sae.component.html',
  styleUrls: ['./carga-sae.component.css'],
  providers: [MessageService]
})
export class CargaSaeComponent implements OnInit {

  cieService      = inject(CieService)
  messageService  = inject(MessageService)
  sharedService   = inject(SharedService)

  excelData:        any
  jsonData:         CieElementPost[] = []
  cieHeadersLocal:  string[] = cieHeaders

  fileSizeMax: number = 10000000
  isLoadingFile = false
  companyOptions: Option[] = []
  selectedOption: Option
  uploaded = false
  currentFileName: String = ''
  cuentas: string[] = []
  proyectos: string[] = []
  cuentasFaltantes: number[] = []

  proyectosEncontrados: any = {}
  cuentasEncontradas: any = {}

  constructor() {}

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)

    this.cieService.getEmpresas().subscribe(({data}) => {
      this.companyOptions = data.map(empresa => {
        return {
          name: empresa.chempresa,
          value: empresa.nukidempresa.toString()
        }
      })

      this.sharedService.cambiarEstado(false)
    })
  }

  get jsonFormateado() {
    return JSON.stringify(this.jsonData, null, 3)
  }

  async onBasicUpload(event: any, fileUpload: any) {
    this.isLoadingFile = true
    this.uploaded = false
    this.jsonData = []

    this.sharedService.cambiarEstado(true)
    
    const [ file ] = event.files
    const fileReader = new FileReader()
    fileReader.readAsBinaryString( file )

    this.currentFileName = file.name

    fileReader.onload = e => {
      const workBook = XLSX.read( fileReader.result, { type: 'binary' } )
      const [sheetName] = workBook.SheetNames
      this.excelData = XLSX.utils.sheet_to_json( workBook.Sheets[sheetName] )
      let tempNormalRecords: any[] = []
      let lastRecord = false
      let isMiddleDash = false
      let cuentaActual = ''
      // console.log(this.excelData)
      this.excelData.map((record: any, i: number, row: any[]) => {
        lastRecord = (i + 1) === row.length
        isMiddleDash = record.Tipo === '-'
        if(isMiddleDash || lastRecord) {
          cuentaActual = record.__EMPTY
        } else {
          if(record.Concepto) {
            const cuenta = cuentaActual.split(' ')[2]
            this.cuentas.push(cuenta)
            this.proyectos.push(record.Proyectos)
            tempNormalRecords.push({
              // ...record, 
              nombre_cuenta:      cuentaActual,
              cuenta:             cuenta,
              tipo_poliza:        record.__EMPTY,
              numero:             +record.Numero,
              fecha:              record.Fecha,
              mes:                record.Fecha.split('/')[1],
              concepto:           record.Concepto,
              centro_costos:      record['Centro de costos']?.trim(),
              proyectos:          record.Proyectos,
              saldo_inicial:      record['Saldo inicial'],
              debe:               record.Debe,
              haber:              record.Haber,
              movimiento:         record.Debe - record.Haber,
              empresa:            this.selectedOption.name.trim(),
              num_proyecto:       null, //record['Centro de costos'] ? +record['Centro de costos'].split('.')[0] : 0,
              tipo_proyecto:      null,
              edo_resultados:     null,
              responsable:        null,
              tipo_cuenta:        null,
              tipo_py:            null,
              clasificacion_py:   null
            })
          }
        }
      })
      
      forkJoin([
        this.cieService.getInfoCuentas({data: [...new Set(this.cuentas)]}),
        this.cieService.getInfoProyectos({data: [...new Set(this.proyectos)]})
      ])
      .pipe( finalize(() => this.sharedService.cambiarEstado(false)) )
      .subscribe(([infoCuentasR, infoProyectosR]) => {

        infoCuentasR.data.forEach(cuenta => this.cuentasEncontradas[cuenta.cuenta] = {...cuenta})

        infoProyectosR.data.forEach(proyecto => this.proyectosEncontrados[proyecto.proyecto] = {...proyecto})
        
        this.jsonData = tempNormalRecords.map(normalRecord => {

          const keyProyecto = normalRecord.proyectos
          const keyCuenta = normalRecord.cuenta
          const noProyecto = this.proyectosEncontrados[keyProyecto]?.numProyecto
          // console.log(this.cuentasEncontradas[keyCuenta]);
          if(!this.cuentasEncontradas[keyCuenta]) {
            this.cuentasFaltantes.push(keyCuenta)
          }
          return {
            ...normalRecord,
            centro_costos:      normalRecord.centro_costos, //?.split('.')[0]
            num_proyecto:       noProyecto ? this.obtenerNoProyecto(noProyecto) : null,
            responsable:        this.proyectosEncontrados[keyProyecto]?.responsable || null,
            tipo_cuenta:        this.proyectosEncontrados[keyProyecto]?.tipoProyecto || null,
            edo_resultados:     this.cuentasEncontradas[keyCuenta]?.tipoResultado || null,
            tipo_proyecto:      this.cuentasEncontradas[keyCuenta]?.tipoCuenta || null,
            tipo_py:            this.cuentasEncontradas[keyCuenta]?.tipoPY || null,
            clasificacion_py:   this.cuentasEncontradas[keyCuenta]?.clasificacionPY || null
          }
        })
      })
    }

    this.isLoadingFile = false
    this.uploaded = true
    
    fileUpload.clear();
  }

  obtenerNoProyecto(noProyecto: number) {

    let numero: number = null

    switch(noProyecto) {
      case 236: 
        numero = 110
        break
      case 261: 
        numero = 112
        break
      default:
        numero = noProyecto
    }
    
    return numero.toString()
  }

  onChangeCompany(event: any) {
    this.selectedOption = event.value

    this.uploaded = false
  }

  exportJsonToExcel(fileName: string = 'CIE'): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet( [] );

    const workbook: XLSX.WorkBook = {
      Sheets: { 
        'Detalle': worksheet 
      },
      SheetNames: ['Detalle'],
    };
    XLSX.utils.sheet_add_json(worksheet, this.jsonData, { origin: 'A2', skipHeader: true })
    XLSX.utils.sheet_add_aoa(worksheet, [this.cieHeadersLocal]);

    // save to file
    XLSX.writeFile(workbook, `${fileName + '_' + Date.now()}${EXCEL_EXTENSION}`);
  }

  cargar() {
    this.sharedService.cambiarEstado(true)
    console.log(this.jsonData)
    // console.log(this.jsonData)
    this.cieService.cargarSae(this.jsonData, this.currentFileName)
      .pipe(
        finalize(() => {
          this.sharedService.cambiarEstado(false)
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.add({severity: 'success', summary: 'SAE cargado', detail: 'El SAE ha sido cargado.'})
        },
        error: (err) => {
          this.messageService.add({severity: 'error', summary: 'Oh no...', detail: err.error})
        }
      })
  }

  copiarCuentasFaltantes() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.cuentasFaltantes.join(','))
        .then(() => {
          this.messageService.add({severity: 'success', summary: TITLES.success, detail: 'Cuentas copiadas en la papelera.'})
        })
        .catch(err => {
          this.messageService.add({severity: 'error', summary: TITLES.error, detail: SUBJECTS.error})
        });
    } else {
      this.messageService.add({severity: 'error', summary: 'Oh no...', detail: 'Clipboard API no soportado.'})
    }
  }

}
