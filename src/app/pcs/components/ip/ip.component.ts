import { Component, OnInit, inject } from '@angular/core';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { ICatalogo, ICatalogoCliente, ICatalogoCombos, IEmpleado, IEmpleadoNew } from '../../models/ip';
import { CatalogosService } from '../../services/catalogos.service';
import { FormBuilder, Validators,FormArray } from '@angular/forms';
import { PcsService } from '../../services/pcs.service';
import { TITLES, errorsArray,EXCEL_EXTENSION  } from 'src/utils/constants';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize } from 'rxjs';
import { differenceInMonths, format,differenceInCalendarMonths,addMonths } from 'date-fns';
import { Proyecto,encabezadosEmpleado ,OpcionEmpleado,encabezadosStaffing} from '../../models/pcs.model';
import {CostoEmpleado, CostosEmpleadoResponse} from '../../models/ip';
import { Opcion } from 'src/models/general.model';
import { CieService } from 'src/app/cie/services/cie.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';
import { Empleado, Etapa, EtapasPorProyectoData } from '../../models/pcs.model';
import { obtenerMeses } from 'src/helpers/helpers';

//import { addMonths, differenceInCalendarMonths, format} from 'date-fns';
import { es } from 'date-fns/locale';
import { Mes } from 'src/models/general.model';

@Component({
  selector: 'app-ip',
  templateUrl: './ip.component.html',
  styleUrls: ['./ip.component.css'],
  providers: [MessageService]
})
export class IpComponent implements OnInit {

  today: Date = new Date();
  pipe = new DatePipe('en-US');
  todayWithPipe = null;
  FechaIngre = null;

  etapasdata: EtapasPorProyectoData

  empleado: CostoEmpleado[] = []

  isConsulta: boolean = false;

  catSectores: ICatalogoCombos[] = [];
  catPaises: ICatalogoCombos[] = [];
  catClientes: ICatalogoCombos[] = [];
  catEstatusProyecto: ICatalogoCombos[] = [];
  catEmpleados: Opcion[] = []

  listCatSectores: Array<ICatalogo> = [];
  listCatPaises: Array<ICatalogo> = [];
  listCatClientes: Array<ICatalogoCliente> = [];
  listCatEstatusProyecto: Array<ICatalogo> = [];
  listEmpleados: Array<IEmpleadoNew> = [];
  empresas: Opcion[] = []

  proyecto: Proyecto = null
  cargando: boolean = true
  mostrarFormulario: boolean = false
  idproyecto: number;

  Numproyectos: string;
  Nameproyecto: string;
  fechaIni: string;
  fechaFin: string;

  proyectoFechaInicio:  Date
  proyectoFechaFin:     Date

  form2 = this.fb.group({
    numProyecto:  [0, Validators.required],
    etapas:       this.fb.array([])
  })

  get etapas() {
    return this.form2.get('etapas') as FormArray
  }
  
  empleados(etapaIndex: number) {
    return (this.etapas.at(etapaIndex).get('empleados') as FormArray)
  }
  
  fechas(etapaIndex: number, empleadoIndex: number) {
    return (this.empleados(etapaIndex).at(empleadoIndex).get('fechas') as FormArray)
  }


  form = this.fb.group({
    num_proyecto: ['', [Validators.required]],
    nombre_proyecto: ['', [Validators.required]],
    alcance: [null],
    codigo_postal: [null],
    ciudad: [null],
    id_pais: [null],
    id_estatus: [null],
    id_sector: [null],
    id_tipo_proyecto: [null],
    id_responsable_preconstruccion: [null],
    id_responsable_construccion: [null],
    id_responsable_ehs: [null],
    id_responsable_supervisor: [null],
    ids_clientes: [[''], [Validators.required]],
    id_empresa: ['', [Validators.required]],
    id_director_ejecutivo: ['', [Validators.required]],
    costo_promedio_m2: [null],
    fecha_inicio: [null],
    fecha_fin: [null],
    total_meses: [0],
    nombre_contacto: [null],
    posicion_contacto: [null],
    telefono_contacto: [null],
    correo_contacto: [null],
    impuesto_nomina: [0, [Validators.required]]
  })
  
  constructor(private config: PrimeNGConfig, private catServ: CatalogosService, private fb: FormBuilder, private pcsService: PcsService, private messageService: MessageService, private sharedService: SharedService, private cieService: CieService, private activatedRoute: ActivatedRoute, private router: Router) { }

  catalogosService = inject(CatalogosService)

  ngOnInit(): void {
    this.poblarCombos();
    this.getConfigCalendar();
    this.pcsService.cambiarEstadoBotonNuevo(true)
    this.catalogosService.obtenerParametros()
      .subscribe(params => {

        if (!params.proyecto) {
          this.proyecto = null
          this.cargando = false
          this.form.reset()

          console.log("params.proyecto:" + params.proyecto)
        }else{
          this.idproyecto = params.proyecto
          console.log("else params.proyecto:" + params.proyecto)

          this.mostrarFormulario = true
      // this.sharedService.cambiarEstado(true)
      // this.cargando = true
      this.pcsService.obtenerProyectoPorId(this.idproyecto)
        .pipe(finalize(() => {
          // this.sharedService.cambiarEstado(false)
          this.cargando = false
        }))
        .subscribe({
          next: ({ data }) => {
            //console.log(data)
            if (data.length >= 0) {
              const [proyectoData] = data
              const ids_clientes = proyectoData.clientes.map(cliente => cliente.idCliente.toString())

              this.Numproyectos =   proyectoData.nunum_proyecto.toString()
              this.Nameproyecto =   proyectoData.chproyecto.toString()
              this.fechaIni =   proyectoData.dtfecha_ini != '' ? new Date(proyectoData.dtfecha_ini) as any : null
              this.fechaFin =   proyectoData.dtfecha_fin != '' ? new Date(proyectoData.dtfecha_fin) as any : null

              this.form.patchValue({
                num_proyecto: proyectoData.nunum_proyecto.toString(),
                nombre_proyecto: proyectoData.chproyecto.toString(),
                alcance: proyectoData.chalcance.toString(),
                codigo_postal: proyectoData.chcp,
                ciudad: proyectoData.chciudad,
                id_pais: proyectoData.nukidpais,
                id_estatus: proyectoData.nukidestatus,
                id_sector: proyectoData.nukidsector,
                id_tipo_proyecto: proyectoData.nukidtipo_proyecto,
                id_responsable_preconstruccion: proyectoData.nukidresponsable_preconstruccion,
                id_responsable_construccion: proyectoData.nukidresponsable_construccion,
                id_responsable_ehs: proyectoData.nukidresponsable_ehs,
                id_responsable_supervisor: proyectoData.nukidresponsable_supervisor,
                ids_clientes,
                id_empresa: proyectoData.nukidempresa.toString(),
                id_director_ejecutivo: proyectoData.nukiddirector_ejecutivo.toString(),
                costo_promedio_m2: proyectoData.nucosto_promedio_m2,
                fecha_inicio: proyectoData.dtfecha_ini != '' ? new Date(proyectoData.dtfecha_ini) as any : null,
                fecha_fin: proyectoData.dtfecha_fin != '' ? new Date(proyectoData.dtfecha_fin) as any : null,
                nombre_contacto: proyectoData.chcontacto_nombre,
                posicion_contacto: proyectoData.chcontacto_posicion,
                telefono_contacto: proyectoData.chcontacto_telefono,
                correo_contacto: proyectoData.chcontacto_correo,
                impuesto_nomina: proyectoData.impuesto_nomina
                
              })
              this.actualizarTotalMeses()
            }
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        })
        }
      })

     if (this.idproyecto){
      console.log("Entro al this.idproyecto " + this.idproyecto)
      this.mostrarFormulario = true
      // this.sharedService.cambiarEstado(true)
      // this.cargando = true
      this.pcsService.obtenerProyectoPorId(this.idproyecto)
        .pipe(finalize(() => {
          // this.sharedService.cambiarEstado(false)
          this.cargando = false
        }))
        .subscribe({
          next: ({ data }) => {
            //console.log(data)
            if (data.length >= 0) {
              const [proyectoData] = data
              const ids_clientes = proyectoData.clientes.map(cliente => cliente.idCliente.toString())

              this.Numproyectos =   proyectoData.nunum_proyecto.toString()
              this.Nameproyecto =   proyectoData.chproyecto.toString()
              this.fechaIni =   proyectoData.dtfecha_ini != '' ? new Date(proyectoData.dtfecha_ini) as any : null
              this.fechaFin =   proyectoData.dtfecha_fin != '' ? new Date(proyectoData.dtfecha_fin) as any : null
              
              this.form.patchValue({
                num_proyecto: proyectoData.nunum_proyecto.toString(),
                nombre_proyecto: proyectoData.chproyecto.toString(),
                alcance: proyectoData.chalcance.toString(),
                codigo_postal: proyectoData.chcp,
                ciudad: proyectoData.chciudad,
                id_pais: proyectoData.nukidpais,
                id_estatus: proyectoData.nukidestatus,
                id_sector: proyectoData.nukidsector,
                id_tipo_proyecto: proyectoData.nukidtipo_proyecto,
                id_responsable_preconstruccion: proyectoData.nukidresponsable_preconstruccion,
                id_responsable_construccion: proyectoData.nukidresponsable_construccion,
                id_responsable_ehs: proyectoData.nukidresponsable_ehs,
                id_responsable_supervisor: proyectoData.nukidresponsable_supervisor,
                ids_clientes,
                id_empresa: proyectoData.nukidempresa.toString(),
                id_director_ejecutivo: proyectoData.nukiddirector_ejecutivo.toString(),
                costo_promedio_m2: proyectoData.nucosto_promedio_m2,
                fecha_inicio: proyectoData.dtfecha_ini != '' ? new Date(proyectoData.dtfecha_ini) as any : null,
                fecha_fin: proyectoData.dtfecha_fin != '' ? new Date(proyectoData.dtfecha_fin) as any : null,
                nombre_contacto: proyectoData.chcontacto_nombre,
                posicion_contacto: proyectoData.chcontacto_posicion,
                telefono_contacto: proyectoData.chcontacto_telefono,
                correo_contacto: proyectoData.chcontacto_correo,
                impuesto_nomina: proyectoData.impuesto_nomina
                
              })
              this.actualizarTotalMeses()
            }
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        })

        this.pcsService.obtenerEtapasPorProyecto(this.idproyecto)
          .pipe(finalize(() => {
            // this.sharedService.cambiarEstado(false)
            //this.proyectoSeleccionado = true
            //this.cargando = false
          }))
          .subscribe({
            next: ({data}) => this.etapasdata = data,
            error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
          })
    
     }else{

      this.pcsService.obtenerIdProyecto()
      .subscribe(numProyecto => {
        // this.proyectoSeleccionado = true
        // this.form.reset()
        // this.etapas.clear()
        if (numProyecto) {
          console.log("Entro al numero de proyecto " + numProyecto)
          this.mostrarFormulario = true
          // this.sharedService.cambiarEstado(true)
          // this.cargando = true
          this.pcsService.obtenerProyectoPorId(numProyecto)
            .pipe(finalize(() => {
              // this.sharedService.cambiarEstado(false)
              this.cargando = false
            }))
            .subscribe({
              next: ({ data }) => {
                //console.log(data)
                if (data.length >= 0) {
                  const [proyectoData] = data
                  const ids_clientes = proyectoData.clientes.map(cliente => cliente.idCliente.toString())

                  this.Numproyectos =   proyectoData.nunum_proyecto.toString()
                  this.Nameproyecto =   proyectoData.chproyecto.toString()
                  this.fechaIni =   proyectoData.dtfecha_ini != '' ? new Date(proyectoData.dtfecha_ini) as any : null
                  this.fechaFin =   proyectoData.dtfecha_fin != '' ? new Date(proyectoData.dtfecha_fin) as any : null

                  this.form.patchValue({
                    num_proyecto: proyectoData.nunum_proyecto.toString(),
                    nombre_proyecto: proyectoData.chproyecto.toString(),
                    alcance: proyectoData.chalcance.toString(),
                    codigo_postal: proyectoData.chcp,
                    ciudad: proyectoData.chciudad,
                    id_pais: proyectoData.nukidpais,
                    id_estatus: proyectoData.nukidestatus,
                    id_sector: proyectoData.nukidsector,
                    id_tipo_proyecto: proyectoData.nukidtipo_proyecto,
                    id_responsable_preconstruccion: proyectoData.nukidresponsable_preconstruccion,
                    id_responsable_construccion: proyectoData.nukidresponsable_construccion,
                    id_responsable_ehs: proyectoData.nukidresponsable_ehs,
                    id_responsable_supervisor: proyectoData.nukidresponsable_supervisor,
                    ids_clientes,
                    id_empresa: proyectoData.nukidempresa.toString(),
                    id_director_ejecutivo: proyectoData.nukiddirector_ejecutivo.toString(),
                    costo_promedio_m2: proyectoData.nucosto_promedio_m2,
                    fecha_inicio: proyectoData.dtfecha_ini != '' ? new Date(proyectoData.dtfecha_ini) as any : null,
                    fecha_fin: proyectoData.dtfecha_fin != '' ? new Date(proyectoData.dtfecha_fin) as any : null,
                    nombre_contacto: proyectoData.chcontacto_nombre,
                    posicion_contacto: proyectoData.chcontacto_posicion,
                    telefono_contacto: proyectoData.chcontacto_telefono,
                    correo_contacto: proyectoData.chcontacto_correo,
                    impuesto_nomina: proyectoData.impuesto_nomina
                    
                  })
                  this.actualizarTotalMeses()
                }
              },
              error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
            })

            this.pcsService.obtenerEtapasPorProyecto(numProyecto)
          .pipe(finalize(() => {
            // this.sharedService.cambiarEstado(false)
            //this.proyectoSeleccionado = true
           // this.cargando = false
          }))
          .subscribe({
            next: ({data}) => this.etapasdata = data,
            error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
          })
        } else  {
            console.log('No hay proyecto');
          }
        
      })

     }

    

    this.activatedRoute.queryParams.subscribe(params => {
      const nuevo = params['nuevo']
      if (nuevo) {
        this.mostrarFormulario = true
      }
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

  actualizarTotalMeses() {
    console.log('first')
    let total_meses = 0

    if (this.form.value.fecha_inicio && this.form.value.fecha_fin) {
      total_meses = differenceInMonths(this.form.value.fecha_fin, this.form.value.fecha_inicio)
    }

    this.form.patchValue({ total_meses })
  }

  poblarCombos() {
    this.getCatCategorias();
    this.getPaises();
    this.getClientes();
    this.getEstatusProyecto();
    this.getEmpleados();
    this.getEmpleadosExcel();
    this.getCatEmpresas();
  }

  getCatEmpresas() {
    this.empresas = []
    this.cieService.getCieEmpresas()
      .subscribe({
        next: ({ data }) => {
          this.empresas = data.map(registro => ({ name: registro.chempresa, code: registro.nukidempresa.toString() }))
        },
        error: (err) => this.empresas = []
      })
  }

  getCatCategorias() {
    this.listCatSectores = [];
    this.catServ.getSectores().subscribe((data) => {
      if (data.success) {
        this.listCatSectores = <ICatalogo[]>data['data'];
        this.listCatSectores.forEach((element) => {
          this.catSectores.push({
            name: String(element.descripcion),
            value: String(element.id),
          });
        });
      }
    });
  }

  getPaises() {
    this.listCatPaises = [];
    this.catServ.getPais().subscribe((data) => {
      if (data.success) {
        this.listCatPaises = <ICatalogo[]>data['data'];
        this.listCatPaises.forEach((element) => {
          this.catPaises.push({
            name: String(element.descripcion),
            value: String(element.id),
          });
        });
      }
    });
  }

  getClientes() {
    this.listCatClientes = [];
    this.catServ.getClientes().subscribe((data) => {
      if (data.success) {
        this.listCatClientes = <ICatalogoCliente[]>data['data'];
        this.listCatClientes.forEach((element) => {
          this.catClientes.push({
            name: String(element.cliente),
            value: String(element.idCliente),
          });
        });
      }
    });
  }

  getEstatusProyecto() {
    this.listCatEstatusProyecto = [];
    this.catServ.getEstatusProyecto().subscribe((data) => {
      if (data.success) {
        this.listCatEstatusProyecto = <ICatalogo[]>data['data'];
        this.listCatEstatusProyecto.forEach((element) => {
          this.catEstatusProyecto.push({
            name: String(element.descripcion),
            value: String(element.id),
          });
        });
      }
    });
  }

  /*getEmpleados() {
    this.listEmpleados = [];
    this.catServ.getDirectores().subscribe((data) => {
      if (data.success) {
        this.listEmpleados = <IEmpleadoNew[]>data['data'];
        this.listEmpleados.forEach((element) => {
          this.catEmpleados.push({
            name: String(`${element.chnombre} ${element.chap_paterno} ${element.chap_materno} / ${element.chpuesto}`),
          });
        });
      }
    });
  }*/

    getEmpleadosExcel() {
      this.listEmpleados = [];
      this.catServ.getEmpleadosExcel().subscribe((data) => {
        this.empleado = data.data
        console.log('array data costo por empleado ------ ' + data.data)
      });
    }

  getEmpleados() {
    this.catServ.getDirectores().subscribe((directoresR) => {
      this.catEmpleados = directoresR.data.map(catEmpleados => ({ name: catEmpleados.nombre_persona, code: catEmpleados.nunum_empleado_rr_hh.toString() }))
      

    });

  }

  guardar() {

    console.log(this.form.value)

    if (!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    this.form.patchValue({
      fecha_inicio: this.form.value.fecha_inicio ? format(new Date(this.form.value.fecha_inicio), 'Y-MM-dd') as any : null,
      fecha_fin: this.form.value.fecha_fin ? format(new Date(this.form.value.fecha_fin), 'Y-MM-dd') as any : null
    })

    this.pcsService.guardar(this.catalogosService.esEdicion, this.form.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'El proyecto ha sido guardado.' })
          if (!this.catalogosService.esEdicion) {

            this.pcsService.enviarNuevoProyecto({
              id: +this.form.value.num_proyecto,
              nombre: this.form.value.nombre_proyecto
            })

            this.router.navigate([], {
              relativeTo: this.activatedRoute,
              queryParams: {
                proyecto: this.form.value.num_proyecto,
                esEdicion: 1,
                nuevo: false
              },
              queryParamsHandling: 'merge'
            })
          }
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
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


  exportJsonToExcel(): void {

    const workbook = new ExcelJS.Workbook()

    const worksheet = workbook.addWorksheet('Costo por Empleados')
    const worksheetStaffing = workbook.addWorksheet('Staffing')
    const worksheetGastos = workbook.addWorksheet('Gastos')
    const worksheetIngresos = workbook.addWorksheet('Ingresos')

    // Tìtulos Empleados
    this._setXLSXTitlesEmpleados(worksheet)

    // Encabezados Empleados
    this._setXLSXHeaderEmpleados(worksheet)

    let row = 5
    // Contenido Empleados
    row = this._setXLSXContentEmpleados(worksheet, row)

    // Tìtulos Staffing
    this._setXLSXTitlesStaffing(worksheetStaffing)

    // Encabezados Staffing
    this._setXLSXHeaderStaffing(worksheetStaffing)

    let rows = 5
    
    // Contenido Staffing
    rows = this._setXLSXContentStaffing(worksheetStaffing, rows)

    // Contenido
    //this._setXLSXContent(worksheet)

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      //saveAs(blob, `FacturacionCancelacion_${Date.now()}${EXCEL_EXTENSION}`)
      this.todayWithPipe = this.pipe.transform(Date.now(), 'dd_MM_yyyy');

      saveAs(blob, `llenado_pcs_offline` + this.todayWithPipe + `${EXCEL_EXTENSION}`)
    });
  }

  _setXLSXTitlesEmpleados(worksheet: ExcelJS.Worksheet) {

    const fillNota: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } }
    //const fillNotaCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillCobranza: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffa4ffa4' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }


    /*worksheet.getCell('K3').value = 'Seniority'
    worksheet.getCell('K3').fill = fillNota
    worksheet.getCell('K3').alignment = alignment
    worksheet.mergeCells('K3:L3')

    worksheet.getCell('M3').value = 'Sueldo Neto Mensual (MN)'
    worksheet.getCell('M3').fill = fillNota
    worksheet.getCell('M3').alignment = alignment
    worksheet.mergeCells('M3:O3')

    worksheet.getCell('P3').value = 'Sueldo Bruto'
    worksheet.getCell('P3').fill = fillNota
    worksheet.getCell('P3').alignment = alignment
    worksheet.mergeCells('P3:R3')*/

    

  }

  _setXLSXHeaderEmpleados(worksheet: ExcelJS.Worksheet) {
    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff91d2ff' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }

    encabezadosEmpleado.forEach((encabezado, index) => {
      let cell = worksheet.getCell(4, index + 1)
      cell.value = encabezado.label
      cell.fill = fill
      cell.alignment = alignment
    })
  }

  _setXLSXContentEmpleados(worksheet: ExcelJS.Worksheet, row: number): number {

    const fillCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillFactura: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } }

    this.empleado.forEach(record => {
      //worksheet.getCell(row).fill = record.fechaCancelacion ? fillCancelada : fillFactura
      //const col = row.getCell(row);

      //console.log('record.numEmpleadoRrHh ------ ' + record.numEmpleadoRrHh)

      worksheet.getCell(row, 1).value = record.numEmpleadoRrHh
      worksheet.getCell(row, 2).value = record.nombreCompletoEmpleado
      worksheet.getCell(row, 3).value = record.costoMensualEmpleado

     
      row++
    });

    return row

  }

  _setXLSXTitlesStaffing(worksheet: ExcelJS.Worksheet) {

    const fillNota: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } }
    //const fillNotaCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillCobranza: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffa4ffa4' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }


    /*worksheet.getCell('K3').value = 'Seniority'
    worksheet.getCell('K3').fill = fillNota
    worksheet.getCell('K3').alignment = alignment
    worksheet.mergeCells('K3:L3')

    worksheet.getCell('M3').value = 'Sueldo Neto Mensual (MN)'
    worksheet.getCell('M3').fill = fillNota
    worksheet.getCell('M3').alignment = alignment
    worksheet.mergeCells('M3:O3')

    worksheet.getCell('P3').value = 'Sueldo Bruto'
    worksheet.getCell('P3').fill = fillNota
    worksheet.getCell('P3').alignment = alignment
    worksheet.mergeCells('P3:R3')*/

    

  }

  _setXLSXHeaderStaffing(worksheet: ExcelJS.Worksheet) {
    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff91d2ff' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }

    encabezadosStaffing.forEach((encabezado, index) => {
      let cell = worksheet.getCell(4, index + 1)
      cell.value = encabezado.label
      cell.fill = fill
      cell.alignment = alignment

      let cell1 = worksheet.getCell(1,1)

          cell1.value = 'Numero proyecto'
          cell1.fill = fill
          cell1.alignment = alignment
          worksheet.getCell(2, 1).value = this.Numproyectos

          let cell3 = worksheet.getCell(1,2)

          cell3.value = 'Nombre del proyecto'
          cell3.fill = fill
          cell3.alignment = alignment
          worksheet.getCell(2, 2).value = this.Nameproyecto
          
         

      this.etapasdata.etapas.forEach((etapa, etapaIndex) => {

        
        //worksheet.getCell(row, 6).value = this.Nameproyecto
  
        const diferenciaMeses = differenceInCalendarMonths(new Date(this.fechaFin), new Date(this.fechaIni));
        const meses: Mes[] = []
  
        let titulomes = 8
        
        for (let i = 0; i <= diferenciaMeses; i++) {
          const fecha = addMonths(new Date(this.fechaIni), i)
          const mes   = +format(fecha, 'M')
          const anio  = +format(fecha, 'Y')
          const desc  = format(fecha, 'LLL/Y', {locale: es})
          let cell2 = worksheet.getCell(4,titulomes)

          cell2.value = desc
          cell2.fill = fill
          cell2.alignment = alignment

         
          
  
          titulomes++
          meses.push({
            mes:  mes,
            anio: anio,
            desc: desc
          })
        }
      })

    })
  }

  _setXLSXContentStaffing(worksheet: ExcelJS.Worksheet, row: number): number {

    const fillCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillFactura: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } }

    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff91d2ff' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }


    //this.etapasdata.forEach(record => {
      //worksheet.getCell(row).fill = record.fechaCancelacion ? fillCancelada : fillFactura
      //const col = row.getCell(row);

     // console.log('record.numEmpleadoRrHh ------ ' + record.numEmpleadoRrHh)
    // console.log('Entra al contenido ------ ' )
    // this.pcsService.obtenerEtapasPorProyecto(this.idproyecto).forEach(record => {
      //worksheet.getCell(row).fill = record.fechaCancelacion ? fillCancelada : fillFactura
      //const col = row.getCell(row);
      //this.proyectoFechaInicio  = new Date(record.data.fechaIni)
    //this.proyectoFechaFin     = new Date(record.data.fechaFin)
    
    //console.log('this.Numproyectos ------ ' + this.Numproyectos)
    
      

     // console.log('this.etapasdata ------ ' + this.etapasdata)

      this.etapasdata.etapas.forEach((etapa, etapaIndex) => {

       /* *
      //worksheet.getCell(row, 6).value = this.Nameproyecto

      const diferenciaMeses = differenceInCalendarMonths(new Date(etapa.fechaFin), new Date(etapa.fechaIni));
      const meses: Mes[] = []

      let titulomes = 9
      
      for (let i = 0; i <= diferenciaMeses; i++) {
        const fecha = addMonths(new Date(etapa.fechaIni), i)
        const mes   = +format(fecha, 'M')
        const anio  = +format(fecha, 'Y')
        const desc  = format(fecha, 'LLL/Y', {locale: es})
        //worksheet.getCell(4, titulomes).value = desc
        

        titulomes++
        meses.push({
          mes:  mes,
          anio: anio,
          desc: desc
        })
      }*/
      

        this.etapas.push(this.fb.group({
          idFase:       etapa.idFase,
          orden:        etapa.orden,
          fase:         etapa.fase,
          fechaIni:     etapa.fechaIni,
          fechaFin:     etapa.fechaFin,
          empleados:    this.fb.array([]),
          meses:        this.fb.array(obtenerMeses(new Date(etapa.fechaIni), new Date(etapa.fechaFin)))
        }))

        
        

        if(etapa.empleados === null || etapa.empleados.length === 0 ){
          console.log('etapa.empleados ------  vacia el tamaño es -- ' + etapa.empleados.length )
          //worksheet.getCell(row, 1).value = this.Numproyectos
          //worksheet.getCell(row, 2).value = this.Nameproyecto
          console.log('etapa.fase ------ ' + etapa.fase)
  
          worksheet.getCell(row, 1).value = etapa.fase
          worksheet.getCell(row, 2).value = etapa.fechaIni
          worksheet.getCell(row, 3).value = etapa.fechaFin
          
          row++
        }else{
          console.log('etapa.empleados ------ ' +etapa.empleados)
        }

       

      // Agregamos los empleados por cada etapa
      etapa.empleados.forEach((empleado, empleadoIndex) => {

       

        this.empleados(etapaIndex).push(this.fb.group({
          id:               empleado.id,
          idFase:           empleado.idFase,
          numempleadoRrHh:  empleado.numempleadoRrHh,
          empleado:         empleado.empleado,
          fechas:           this.fb.array([]),
          aplicaTodosMeses: empleado.aplicaTodosMeses,
          cantidad:         empleado.cantidad
        }))

        //worksheet.getCell(row, 1).value = this.Numproyectos
       // worksheet.getCell(row, 2).value = this.Nameproyecto
       worksheet.getCell(row, 1).value = etapa.fase
        worksheet.getCell(row, 2).value = etapa.fechaIni
        worksheet.getCell(row, 3).value = etapa.fechaFin
        console.log('etapa.fase ------ ' + etapa.fase)

       
        worksheet.getCell(row, 4).value = empleado.numempleadoRrHh
        worksheet.getCell(row, 5).value = empleado.empleado
        worksheet.getCell(row, 6).value = empleado.cantidad
        worksheet.getCell(row, 7).value = empleado.fee
        
        let incrementa = 8

          //row++

        // Agreamos las fechas por empleado
        empleado.fechas.forEach(fecha => {
          
          
          //console.log('valor incrementable de columna--- ' + incrementa +' fecha.mes fecha.anio ------ ' + fecha.porcentaje)
          
          worksheet.getCell(row, incrementa).value = fecha.porcentaje
          
          incrementa++

          this.fechas(etapaIndex, empleadoIndex).push(this.fb.group({
            id:         fecha.id,
            mes:        fecha.mes,
            anio:       fecha.anio,
            porcentaje: fecha.porcentaje
          }))
        })
        row++
      })
      //row++
    })
    //});

    return row

  }

  

  formatCurrency(valor: number) {
    return valor.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    })
  }

}
