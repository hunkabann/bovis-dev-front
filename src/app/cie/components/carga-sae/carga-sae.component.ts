import { Component, OnInit, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { CieService } from '../../services/cie.service';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CieElementPost, CieProyecto, CieCuentaDelete } from '../../models/cie.models';
import { EXCEL_EXTENSION, SUBJECTS, TITLES, cieHeaders, cieHeadersFields } from 'src/utils/constants';
import { finalize, forkJoin } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { RegistrosCargadosComponent } from '../registros-cargados/registros-cargados.component';
import { CuentasCargadasComponent } from '../cuentas-cargadas/cuentas-cargadas.component';
import { ProyectosFaltantesComponent } from '../proyectos-faltantes/proyectos-faltantes.component';
import { formatCurrency } from 'src/helpers/helpers';

interface Option {
  name: string,
  value: string,
}

@Component({
  selector: 'app-carga-sae',
  templateUrl: './carga-sae.component.html',
  styleUrls: ['./carga-sae.component.css'],
  providers: [MessageService, DialogService]
})
export class CargaSaeComponent implements OnInit {

  cieService = inject(CieService)
  messageService = inject(MessageService)
  sharedService = inject(SharedService)
  dialogService = inject(DialogService)

  excelData: any
  jsonData: CieElementPost[] = []
  jsonDataPaquetes: any[] = []
  paqueteActual: number = 0
  cieHeadersLocal: string[] = cieHeaders
  cieHeadersFieldsLocal: any = cieHeadersFields

  fileSizeMax: number = 10000000
  isLoadingFile = false
  companyOptions: Option[] = []
  selectedOption: Option
  uploaded = false
  currentFileName: string = ''
  cuentas: string[] = []
  proyectos: string[] = []
  cuentasFaltantes: {
    cuenta: string,
    nombre_cuenta: string,
    concepto: string
  }[] = []
  proyectosFaltantes: string[] = []

  proyectosEncontrados: any = {}
  cuentasEncontradas: any = {}
  paqueteInicial: boolean

  ArchivoElimina: {
    nombre_archivo: string

  }[] = []

  constructor() { }

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)

    this.cieService.getEmpresas().subscribe(({ data }) => {
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

    const [file] = event.files
    const fileReader = new FileReader()
    fileReader.readAsBinaryString(file)

    this.currentFileName = file.name

    fileReader.onload = e => {
      const workBook = XLSX.read(fileReader.result, { type: 'binary' })
      const [sheetName] = workBook.SheetNames
      this.excelData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName])
      let tempNormalRecords: any[] = []
      let lastRecord = false
      let isMiddleDash = false
      let cuentaActual = ''
     // console.log("dentro de Excel Data" + this.excelData)
      this.excelData.map((record: any, i: number, row: any[]) => {
       // console.log("dentro de Excel antes lastRecord" + lastRecord)
        lastRecord = (i + 1) === row.length
        //console.log("dentro de Excel despues lastRecord" + lastRecord)
        isMiddleDash = record.Tipo === '-'
        if (isMiddleDash || lastRecord) {
          cuentaActual = record.__EMPTY
        } else {
          if (record.Concepto) {
            try {

              console.log("cuentaActual: "+ cuentaActual + " cuentaActual[2] "+ cuentaActual[2])
                  const cuenta = cuentaActual.split(' ')[2]
            //if(!['703002003'].includes(cuenta))
             
                  {
                    console.log("Numero: "+ record.numero +" Fecha: " + record.Fecha +  " Concepto: " + record.Concepto)

                    //if(record.Fecha === undefined || record.Fecha === null){

                     

                    //}else{

                      this.cuentas.push(cuenta)
                    this.proyectos.push(record.Proyectos)
                    tempNormalRecords.push({
                      // ...record, 
                      nombre_cuenta: cuentaActual,
                      cuenta: cuenta,
                      tipo_poliza: record.__EMPTY,
                      numero: +record.Numero,
                      fecha: record.Fecha,
                      mes: record.Fecha.split('/')[1],
                      concepto: record.Concepto,
                      centro_costos: record['Centro de costos']?.trim() ?? record['centros de costos']?.trim(),
                      proyectos: record.Proyectos,
                      saldo_inicial: record['Saldo inicial'],
                      debe: record.Debe,
                      haber: record.Haber,
                      movimiento: record.Debe - record.Haber,
                      empresa: this.selectedOption.name.trim(),
                      num_proyecto: null, //record['Centro de costos'] ? +record['Centro de costos'].split('.')[0] : 0,
                      tipo_proyecto: null,
                      edo_resultados: null,
                      responsable: null,
                      tipo_cuenta: null,
                      tipo_py: null,
                      clasificacion_py: null
                    })

                   // }
                   
                    
                  }
              } catch(e) {
                console.log("Error al leer el Excel"+ e.toString()); 
                this.messageService.add({severity: 'error', summary: 'El archivo Excel tiene problema en el formato', detail: e.toString()})
                return;
              }
          }
        }
      })

      forkJoin([
        this.cieService.getInfoCuentas({ data: [...new Set(this.cuentas)] }),
        this.cieService.getInfoProyectos({ data: [...new Set(this.proyectos)] })
      ])
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe(([infoCuentasR, infoProyectosR]) => {

          let cuentasArreglo = []
          let proyectosArreglo = []
          this.cuentasFaltantes = []
          this.proyectosFaltantes = []

          infoCuentasR.data.forEach(cuenta => this.cuentasEncontradas[cuenta.cuenta] = { ...cuenta })

          infoProyectosR.data.forEach(proyecto => this.proyectosEncontrados[proyecto.proyecto] = { ...proyecto })

          this.jsonData = tempNormalRecords.map(normalRecord => {

            const keyProyecto = normalRecord.proyectos
            const keyCuenta = normalRecord.cuenta
            const noProyecto = this.proyectosEncontrados[keyProyecto]?.numProyecto
            // console.log(this.cuentasEncontradas[keyCuenta]);
            if (!this.cuentasEncontradas[keyCuenta]) {
              if (!cuentasArreglo.includes(keyCuenta)) {
                let conceptoCuenta = ''
                const conceptoSplit = normalRecord.nombre_cuenta.split(keyCuenta)
                if (conceptoSplit.length >= 2) {
                  conceptoCuenta = conceptoSplit[1].trim()
                }
                this.cuentasFaltantes.push({ cuenta: keyCuenta, nombre_cuenta: conceptoCuenta, concepto: normalRecord.concepto })
                cuentasArreglo.push(keyCuenta)
              }
            }

            if (!noProyecto) {
              if (!proyectosArreglo.includes(keyProyecto)) {
                this.proyectosFaltantes.push(keyProyecto)
                proyectosArreglo.push(keyProyecto)
              }
            }

            return {
              ...normalRecord,
              centro_costos: normalRecord.centro_costos, //?.split('.')[0]
              num_proyecto: noProyecto ? this.obtenerNoProyecto(noProyecto) : null,
              responsable: this.proyectosEncontrados[keyProyecto]?.responsable || null,
              tipo_cuenta: this.proyectosEncontrados[keyProyecto]?.tipoProyecto || null,
              edo_resultados: this.cuentasEncontradas[keyCuenta]?.tipoResultado || null,
              tipo_proyecto: this.cuentasEncontradas[keyCuenta]?.tipoCuenta || null,
              tipo_py: this.cuentasEncontradas[keyCuenta]?.tipoPY || null,
              clasificacion_py: this.cuentasEncontradas[keyCuenta]?.clasificacionPY || null
            }
          })
          cuentasArreglo = []
        })
    }

    this.isLoadingFile = false
    this.uploaded = true

    fileUpload.clear();
  }

  obtenerNoProyecto(noProyecto: number) {

    let numero: number = null

    switch (noProyecto) {
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
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

    const workbook: XLSX.WorkBook = {
      Sheets: {
        'Detalle': worksheet
      },
      SheetNames: ['Detalle'],
    };
    const jsonConFormato = this.jsonData.map(registro => {
      return {
        ...registro,
        saldo_inicial: formatCurrency(registro.saldo_inicial),
        debe: formatCurrency(registro.debe),
        haber: formatCurrency(registro.haber),
        movimiento: formatCurrency(registro.movimiento)
      }
    })
    XLSX.utils.sheet_add_json(worksheet, jsonConFormato, { origin: 'A2', skipHeader: true })
    XLSX.utils.sheet_add_aoa(worksheet, [this.cieHeadersLocal]);

    // save to file
    XLSX.writeFile(workbook, `${fileName + '_' + Date.now()}${EXCEL_EXTENSION}`);
  }

  cargar() {

    if (this.proyectosFaltantes.length > 0) {

      this.dialogService.open(ProyectosFaltantesComponent, {
        header: "Atención",
        width: '50%',
        contentStyle: { overflow: 'auto' },
        dismissableMask: true,
        data: {
          proyectos: this.proyectosFaltantes
        }
      })

      return;
    }

    this.sharedService.cambiarEstado(true)

    const tamanio = 100
    this.jsonDataPaquetes = this.partirArreglo(this.jsonData, tamanio)
    this.paqueteActual = 1

    this.cargarPaquetes()
  }

  cargarPaquetes() {

    if ((this.paqueteActual - 1) > 0) {
      this.paqueteInicial = false
    } else {
      this.paqueteInicial = true

    }

    this.cieService.cargarSae(this.jsonDataPaquetes[this.paqueteActual - 1], this.currentFileName, this.paqueteInicial)
      // .pipe(
      //   finalize(() => {
      //     this.sharedService.cambiarEstado(false)
      //   })
      // )
      .subscribe({
        next: (response) => {
          let stick = this.paqueteActual == this.jsonDataPaquetes.length;
          this.messageService.add({ severity: 'success', sticky: stick, summary: 'SAE cargado', detail: `${this.paqueteActual}/${this.jsonDataPaquetes.length}` })

          if (this.paqueteActual >= this.jsonDataPaquetes.length) {
            this.dialogService.open(RegistrosCargadosComponent, {
              header: "Registros cargados",
              width: '50%',
              contentStyle: { overflow: 'auto' },
              dismissableMask: true,
              data: {
                cantidad: this.jsonData.length
              }
            })
            this.paqueteActual = 0
            this.sharedService.cambiarEstado(false)
            return
          }

          this.paqueteActual = this.paqueteActual + 1
          this.cargarPaquetes()
        },
        error: (err) => {
          if (err.error === "El archivo \"" + this.currentFileName + "\" ya fue cargado anteriormente.") {
            //this.messageService.add({severity: 'error', summary: 'Oh no...', detail: err.error})
            this.confirmar()
          } else {
            this.messageService.add({ severity: 'error', sticky:true, summary: 'Oh no...', detail: err.error })
          }

          this.sharedService.cambiarEstado(false)
        }
      })

  }

  partirArreglo(arreglo: CieElementPost[], tamanio: number): any[] {
    const arreglosPartidos = [];
    for (let i = 0; i < arreglo.length; i += tamanio) {
      arreglosPartidos.push(arreglo.slice(i, i + tamanio));
    }
    return arreglosPartidos;
  }

  cargarCuentasFaltantes() {
    this.sharedService.cambiarEstado(true)

    this.cieService.cargarCuentasNuevas({ data: this.cuentasFaltantes })
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.messageService.add({ severity: 'success', sticky:true, summary: TITLES.success, detail: 'Cuentas cargadas correctamente.' })
          this.dialogService.open(CuentasCargadasComponent, {
            header: "Cuentas cargadas",
            width: '80%',
            contentStyle: { overflow: 'auto' },
            dismissableMask: true,
            data: {
              cuentas: data.data
            }
          })
          this.cuentasFaltantes = []
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  confirmar() {
    var r = confirm("Ya existe un Archivo Cargado, los datos anteriores se eliminaran , ¿deseas continuar?");
    if (r == true) {
      const body: CieCuentaDelete = {
        nombre_archivo: this.currentFileName,
      }

      this.ArchivoElimina.push({ nombre_archivo: this.currentFileName })
      // this.cieService.EliminaSae(this.ArchivoElimina)
      this.cieService.EliminaSae(body)
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (data) => {
            // this.empleados(etapaIndex).removeAt(empleadoIndex)
            this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'Los registros se eliminaron correctamente' })
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        })

      //alert("\'Ya paso la eliminacion\'");
    } else {
      //alert("\'codgio de redireccion (false)\'");
      return;
    }
  }

}
