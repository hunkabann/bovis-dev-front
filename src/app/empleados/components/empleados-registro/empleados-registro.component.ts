import { Component, OnInit } from '@angular/core';
// import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CatEmpleado, Catalogo, Empleado, Puesto } from '../../Models/empleados';
import { ActivatedRoute, Router } from '@angular/router';
import { Message, MessageService, PrimeNGConfig } from 'primeng/api';
import { EmpleadosService } from '../../services/empleados.service';
import { CALENDAR, SUBJECTS, TITLES, errorsArray } from 'src/utils/constants';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize, forkJoin } from 'rxjs';
import { CieService } from 'src/app/cie/services/cie.service';
import { Opcion } from 'src/models/general.model';
import { differenceInCalendarYears, format } from 'date-fns';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';

async function sleep(ms: number): Promise<void> {
  return new Promise(
    (resolve) => setTimeout(resolve, ms));
}

interface ICatalogo {
  name: string;
  value: string;
}
@Component({
  selector: 'app-empleados-registro',
  templateUrl: './empleados-registro.component.html',
  styleUrls: ['./empleados-registro.component.css'],
})



export class EmpleadosRegistroComponent implements OnInit {
  esActualizacion = false

  EmpleadoTieneerror = false

  catPersonas: ICatalogo[] = []
  catTipoEmpleados: ICatalogo[] = []
  catCategorias: ICatalogo[] = []
  catTipoContratos: ICatalogo[] = []
  catEmpresas: ICatalogo[] = []
  catCiudades: ICatalogo[] = []
  catNivelEstudios: ICatalogo[] = []
  catFormasPago: ICatalogo[] = []
  catJornadas: ICatalogo[] = []
  catDepartamentos: ICatalogo[] = []
  catClasificacion: ICatalogo[] = []
  catJefesDirecto: ICatalogo[] = []
  catUnidadNegocio: ICatalogo[] = []
  catTurno: ICatalogo[] = []
  catJefes: ICatalogo[] = []
  habilidades: Opcion[] = []
  experiencias: Opcion[] = []
  profesiones: Opcion[] = []
  puestos: Opcion[] = []
  estados: Opcion[] = []
  paises: Opcion[] = []
  pensionOpciones: Opcion[] = [
    { code: 'SI', name: 'SI' },
    { code: 'NO', name: 'NO' },
    { code: 'NA', name: 'N/A' }
  ]

  fechaIngreso: Date;
  fechaSalida: Date;
  fechaReingreso: Date;

  empleado: CatEmpleado = new CatEmpleado();
  mensajeCamposRequeridos: string = '';
  isCamposRequeridos = false;
  messages1: Message[];

  puestosInfo: Puesto[] = []
  tiposDescuento: Opcion[] = [
    { code: 'Porcentaje', name: 'Porcentaje' },
    { code: 'Cuota fija', name: 'Cuota fija' },
    { code: 'Factor de descuento', name: 'Factor de descuento' }
  ];

  proyectos: Opcion[] = []

  form = this.fb.group({
    id_requerimiento: [0],
    num_empleado_rr_hh: ['', Validators.required],
    id_persona: ['', Validators.required],// 1,
    id_tipo_empleado: ['', Validators.required],// 1,
    id_categoria: ['', Validators.required],// 1,
    id_tipo_contrato: ['', Validators.required],// 1,
    cve_puesto: ['', Validators.required],// 1,
    id_empresa: ['', Validators.required],// 1,
    calle: ['', Validators.required],
    numero_interior: [null],
    numero_exterior: ['', Validators.required],
    colonia: ['', Validators.required],
    alcaldia: [null],
    id_ciudad: ['', Validators.required],// 1,
    id_estado: ['', Validators.required],//42,
    codigo_postal: ['', Validators.required],//"03550",
    id_pais: ['', Validators.required],//1,
    id_nivel_estudios: [null], // no requerido
    id_forma_pago: ['', Validators.required],// 1,
    id_jornada: ['', Validators.required],// 1,
    id_departamento: ['', Validators.required],// 1,
    id_clasificacion: [null], // no requerido
    id_jefe_directo: ['', Validators.required],// 1,
    id_unidad_negocio: ['', Validators.required],// 1,
    id_tipo_contrato_sat: [0],// 1,
    num_empleado: [null],// 1,
    fecha_ingreso: ['', Validators.required],// "22/06/2022",
    fecha_salida: [null],// "22/12/2022",
    fecha_ultimo_reingreso: [null],// "10/02/2023",
    nss: ['', Validators.required],// 123456789,
    email_bovis: ['', Validators.email],// "empleado@bovis.com",
    url_repo: [null], // no requerido
    salario: ['', Validators.required],// 10000.50,
    id_profesion: [null], // no requerido
    antiguedad: [null], // no requerido
    id_turno: [null], // no requerido
    unidad_medica: [null], // no requerido
    registro_patronal: ['', Validators.required],// "ABCD123",
    cotizacion: [null],// "ABCD1234567890",
    duracion: [null], // no requerido
    descuento_pension: [null], // requerido si porcentaje es SI
    porcentaje_pension: ['', Validators.required],// 5,
    fondo_fijo: [null], // no requerido
    credito_infonavit: [null], // no requerido
    tipo_descuento: [null], // no requerido
    valor_descuento: [null], // no requerido
    no_empleado_noi: [null], // no requerido
    rol: [null], // no requerido
    habilidades: [null], // no requerido ['']
    experiencias: [null], // no requerido ['']
    persona_nombre: [null],
    num_proyecto_principal: ['', Validators.required]
  })

  constructor(
    private config: PrimeNGConfig,
    private empleadosServ: EmpleadosService,
    private messageService: MessageService,
    private router: Router,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private cieService: CieService,
    private activatedRoute: ActivatedRoute,
    private timesheetService: TimesheetService
  ) { }

  ngOnInit(): void {
    this.getConfigCalendar();
    this.sharedService.cambiarEstado(true)

    this.activatedRoute.params
      .subscribe(({ id }) => {
        forkJoin([
          id ? this.empleadosServ.getPersonas() : this.empleadosServ.getPersonasDisponibles(),
          this.empleadosServ.getCatEmpleados(),
          this.empleadosServ.getCatCategorias(),
          this.empleadosServ.getCatTiposContratos(),
          this.cieService.getEmpresas(),
          this.empleadosServ.getCatNivelEstudios(),
          this.empleadosServ.getCatFormasPago(),
          this.empleadosServ.getCatJornadas(),
          this.empleadosServ.getCatDepartamentos(),
          this.empleadosServ.getCatClasificacion(),
          this.empleadosServ.getCatUnidadNegocio(),
          this.empleadosServ.getCatTurno(),
          this.empleadosServ.getHabilidades(),
          this.empleadosServ.getExperiencias(),
          this.empleadosServ.getProfesiones(),
          this.empleadosServ.getPuestos(),
          this.empleadosServ.getEmpleados(),
          this.empleadosServ.getCatEstados(),
          this.empleadosServ.getCatPaises(),
          this.timesheetService.getCatProyectos()
        ])
          .pipe(finalize(() => this.verificarActualizacion()))
          .subscribe({
            next: ([
              personaR,
              tipoEmpleadoR,
              categoriaR,
              tipoContratoR,
              empresaR,
              nivelEstudiosR,
              formaPagoR,
              jornadaR,
              departamentoR,
              clasificacionR,
              unidadNegocioR,
              turnoR,
              habilidadesR,
              experienciasR,
              profesionesR,
              puestoR,
              empleadosR,
              estadosR,
              paisesR,
              proyectosR
            ]) => {
              this.setCatPersonas(personaR.data)
              this.setCatTipoEmpleado(tipoEmpleadoR.data)
              this.setCatCategorias(categoriaR.data)
              this.setCatTipoContratos(tipoContratoR.data)
              this.setCatEmpresas(empresaR.data)
              this.setCatNivelEstudios(nivelEstudiosR.data)
              this.setCatFormasPago(formaPagoR.data)
              this.setCatJornadas(jornadaR.data)
              this.setCatDepartamentos(departamentoR.data)
              this.setCatClasificacion(clasificacionR.data)
              this.setCatUnidadNegocio(unidadNegocioR.data)
              this.setCatTurno(turnoR.data)
              this.habilidades = habilidadesR.data.map(habilidad => ({ name: habilidad.descripcion, code: habilidad.id.toString() }))
              this.experiencias = experienciasR.data.map(experiencia => ({ name: experiencia.descripcion, code: experiencia.id.toString() }))
              this.profesiones = profesionesR.data.map(profesion => ({ name: profesion.descripcion, code: profesion.id.toString() })),
                this.puestos = puestoR.data.map(puesto => ({ name: puesto.chpuesto, code: puesto.nukid_puesto.toString() }))
              this.puestosInfo = puestoR.data
              this.catJefes = empleadosR.data.map(empleado => ({ name: empleado.nombre_persona, value: empleado.nunum_empleado_rr_hh.toString() }))
              this.estados = estadosR.data.map(estado => ({ name: estado.estado, code: estado.idEstado.toString() }))
              this.paises = paisesR.data.map(pais => ({ name: pais.descripcion, code: pais.id.toString() }))
              this.proyectos = proyectosR.data.map(proyecto => ({ code: proyecto.numProyecto.toString(), name: `${proyecto.numProyecto} - ${proyecto.nombre}` }))
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
          })
      })
  }

  verificarActualizacion() {
    this.activatedRoute.params
      .subscribe(({ id }) => {
        if (id) {
          this.esActualizacion = true
          this.empleadosServ.getEmpleado(id)
            .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
            .subscribe({
              next: ({ data }) => {
                // console.log("data.dtfecha_ingreso: ----------------->> " + data.dtfecha_ingreso)
                 const newFecha_Ingreso = data.dtfecha_ingreso.replace('-', ' ') // Importante reemplazarlo por un espacio
                 const newFecha_Salida = data.dtfecha_salida.replace('-', ' ') // Importante reemplazarlo por un espacio
                 const newFecha_UltimoRegis = data.dtfecha_ultimo_reingreso.replace('-', ' ') // Importante reemplazarlo por un espacio

               // Funciona
                // console.log("Date.parse(data.dtfecha_ingreso)) : " + Date.parse(data.dtfecha_ingreso))
                 //console.log("new date) : " + new Date(Date.parse(data.dtfecha_ingreso)) + " ------------ "+ new Date(newFecha_Ingreso))
                const habilidades = data.habilidades.map(habilidad => habilidad.idHabilidad.toString())
                const experiencias = data.experiencias.map(experiencia => experiencia.idExperiencia.toString())
                this.form.patchValue({
                  num_empleado_rr_hh: data.nunum_empleado_rr_hh?.toString(),
                  id_persona: data.nukidpersona?.toString(),
                  id_tipo_empleado: data.nukidtipo_empleado?.toString(),
                  id_categoria: data.nukidcategoria?.toString(),
                  id_tipo_contrato: data.nukidtipo_contrato?.toString(),
                  cve_puesto: data.chcve_puesto?.toString(),
                  id_empresa: data.nukidempresa?.toString(),
                  calle: data.chcalle,
                  numero_interior: data.nunumero_interior,
                  numero_exterior: data.nunumero_exterior,
                  colonia: data.chcolonia,
                  alcaldia: data.chalcaldia,
                  id_ciudad: data.nukidciudad?.toString(),
                  id_estado: data.nukidestado?.toString(),
                  codigo_postal: data.chcp,
                  id_pais: data.nukidpais?.toString(),
                  id_nivel_estudios: data.nukidnivel_estudios?.toString(),
                  id_forma_pago: data.nukidforma_pago?.toString(),
                  id_jornada: data.nukidjornada?.toString(),
                  id_departamento: data.nukiddepartamento?.toString(),
                  id_clasificacion: data.nukidclasificacion?.toString(),
                  id_jefe_directo: data.nukidjefe_directo?.toString(),
                  // id_jefe_directo:        1,
                  id_unidad_negocio: data.nukidunidad_negocio?.toString(),
                  // id_tipo_contrato_sat:   data.nukidtipo_contrato_sat?.toString(),
                  // num_empleado:           data.nunum_empleado?.toString(),
                  fecha_ingreso: new Date(newFecha_Ingreso) as any,
                  fecha_salida: data.dtfecha_salida != '' ? new Date(newFecha_Salida) as any : null,
                  fecha_ultimo_reingreso: data.dtfecha_ultimo_reingreso != '' ? new Date(newFecha_UltimoRegis) as any : null,
                  nss: data.chnss?.toString(),
                  email_bovis: data.chemail_bovis,
                  url_repo: data.churl_repositorio,
                  salario: data.nusalario?.toString(),
                  id_profesion: data.nukidprofesion?.toString(),
                  // antiguedad:             data.nuantiguedad?.toString(),
                  id_turno: data.nukidturno?.toString(),
                  unidad_medica: data.nuunidad_medica?.toString(),
                  registro_patronal: data.chregistro_patronal,
                  cotizacion: data.chcotizacion,
                  duracion: data.nuduracion?.toString(),
                  descuento_pension: (+data.nudescuento_pension)?.toString(),//(+data.bodescuento_pension)?.toString(),
                  porcentaje_pension: data.chporcentaje_pension ? data.chporcentaje_pension?.toString() : 'NA',
                  fondo_fijo: data.nufondo_fijo?.toString(),
                  credito_infonavit: data.nucredito_infonavit != '' ? data.nucredito_infonavit?.toString() : null,
                  tipo_descuento: data.chtipo_descuento,
                  valor_descuento: data.nuvalor_descuento?.toString(),
                  no_empleado_noi: data.nuno_empleado_noi != '' ? data.nuno_empleado_noi?.toString() : null,
                  rol: data.chrol,
                  habilidades: habilidades as any,
                  experiencias: experiencias as any,
                  persona_nombre: data.nombre_persona,
                  num_proyecto_principal: data.nuproyecto_principal?.toString()
                })

                this.buscarCiudades({ value: this.form.value.id_estado })
              },
              error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
            })
        } else {
          this.form.patchValue({ habilidades: [], experiencias: [] })
          this.activatedRoute.queryParams
            .subscribe({
              next: ({ id_persona, id_requerimiento }) => {
                if (id_persona && id_requerimiento) {
                  this.getInfoDeAsignacion(id_persona, id_requerimiento)
                } else {
                  this.sharedService.cambiarEstado(false)
                }
              },
              error: (err) => {
                this.sharedService.cambiarEstado(false)
              }
            })
        }
      })
  }


  getInfoDeAsignacion(id_persona: number, id_requerimiento: number) {
    forkJoin([
      this.empleadosServ.getPersona(id_persona),
      this.empleadosServ.getRequerimiento(id_requerimiento)
    ])
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ([personaR, requerimientoR]) => {
          // const salario = ((requerimientoR.data.nusueldo_max + requerimientoR.data.nusueldo_min) / 2).toString()
          const requerimiento = requerimientoR.data

          const habilidades = requerimiento.habilidades.map(habilidad => habilidad.idHabilidad.toString())
          const experiencias = requerimiento.experiencias.map(experiencia => experiencia.idExperiencia.toString())

          this.form.patchValue({
            id_requerimiento: requerimiento.nukidrequerimiento,
            id_persona: personaR.data.nukidpersona.toString(),
            id_categoria: requerimiento.nukidcategoria.toString(),
            cve_puesto: requerimiento.nukidpuesto.toString(),
            id_nivel_estudios: requerimiento.nukidnivel_estudios.toString(),
            id_jornada: requerimiento.nukidjornada.toString(),
            id_profesion: requerimiento.nukidprofesion.toString(),
            id_tipo_contrato: requerimiento.nukidtipo_contrato.toString(),
            id_ciudad: requerimiento.nukidciudad.toString(),
            id_jefe_directo: requerimiento.nukidjefe_inmediato.toString(),
            salario: requerimiento.nusueldo_real.toString(),
            habilidades,
            experiencias
          })
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
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

  guardar() {
    if (!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    const body = {
      ...this.form.value,
      fecha_ingreso: format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
      fecha_salida: this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
      fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null
    }
    // console.log(body)

    this.empleadosServ.guardarEmpleado(body, this.esActualizacion)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.router.navigate(['/empleados/empleado-pri'], { queryParams: { success: true } });
          this.EmpleadoTieneerror = false



          if (!this.esActualizacion) {
            const bodyCostoEmpleado = {
              numEmpleadoRrHh: this.form.value.num_empleado_rr_hh,
              sueldoBruto: this.form.value.salario,
              cotizacion: this.form.value.cotizacion// 1,
            }

            this.empleadosServ.guardarCostoEmpleado(bodyCostoEmpleado, this.esActualizacion)
              .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
              .subscribe({
                next: (data) => {
                  this.form.reset()
                  this.router.navigate(['/empleados/empleado-pri'], { queryParams: { success: true } });
                },
                error: (err) => {
                  if(err.error.text.includes('Se creó nuevo registro con id:') ){
                    Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Registro guardado', detail: 'El registro ha sido guardado.' }))
                    console.log("Errores = "+ err.error.text)
                  }else{
                    //this.messageService.add({ severity: 'error Actualiza', summary: TITLES.error, detail: err.error.message })
                    this.messageService.add({ severity: 'error', summary: "guardarCostoEmpleadoActualiza()  registro components", detail: err.error })
                    console.log("Diferente error: "+ err.error.text)
                  }
                }
              })

          } else {
            let bodyCostoEmpleadoactualiza = {
              idCostoEmpleado: null,
              numEmpleadoRrHh: this.form.value.num_empleado_rr_hh,
              nuAnno: 2023,
              nuMes: 12,
              fechaIngreso: this.form.value.fecha_ingreso,
              sueldoBruto: this.form.value.salario ,
              numProyecto: this.form.value.num_proyecto_principal ,
              cotizacion: this.form.value.cotizacion
            }

            this.empleadosServ.getCostoID(this.form.value.num_empleado_rr_hh)
              .subscribe({
                next: (data) => {
                  if (data.data.length > 0) {
                    bodyCostoEmpleadoactualiza = {
                      ...bodyCostoEmpleadoactualiza,
                      idCostoEmpleado: data.data[0].idCostoEmpleado
                    }

                    this.empleadosServ.guardarCostoEmpleadoActualiza(bodyCostoEmpleadoactualiza, this.esActualizacion, "api/Costo/" + data.data[0].idCostoEmpleado)
                      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                      .subscribe({
                        next: (data) => {
                          this.form.reset()
                          this.router.navigate(['/empleados/empleado-pri'], { queryParams: { success: true } });
                        },
                        error: (err) => {
                          if(err.error.text.includes('Actualización del registro de costos:') ){
                            Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Registro guardado', detail: 'El registro ha sido guardado.' }))
                            console.log("Errores = "+ err.error.text)
                          }else{
                            this.messageService.add({ severity: 'error Actualiza', summary: TITLES.error, detail: err.error.message })
                            console.log("Diferente error: "+ err.error.text)
                          }
                         
                          //this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
                        }
                      })
                  }
                },
                error: (err) => {
                  this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
                }
              })
          }




        },
        error: (err) => {
          console.log(" err.error --------->>>>>>> " + err.error)
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
          this.EmpleadoTieneerror = true
        }
      })


    /*
  if (!this.EmpleadoTieneerror) {

    console.log(" --------->>>>>>> " + this.form.value.salario)

    const bodyCostoEmpleado = {
      numEmpleadoRrHh: this.form.value.num_empleado_rr_hh,
      sueldoBruto: this.form.value.salario// 1,
    }

    //const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    if (!this.esActualizacion) {
      sleep(10000);

      this.empleadosServ.guardarCostoEmpleado(bodyCostoEmpleado, this.esActualizacion)
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (data) => {
            // console.log(data)
            //this.form1.reset()
            this.router.navigate(['/empleados/empleado-pri'], { queryParams: { success: true } });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
          }
        })

    } else {
      //const idCons = this.empleadosServ.getCostoID(this.form.value.num_empleado_rr_hh)
      //let idCons:string = this.empleadosServ.getCostoID(this.form.value.num_empleado_rr_hh);
      sleep(10000);

      let bodyCostoEmpleadoactualiza = {
        idCostoEmpleado: null,
        numEmpleadoRrHh: this.form.value.num_empleado_rr_hh,
        nuAnno: 2023,
        nuMes: 12,
        fechaIngreso: this.form.value.fecha_ingreso,
        sueldoBruto: this.form.value.salario
      }

      this.empleadosServ.getCostoID(this.form.value.num_empleado_rr_hh)
        .subscribe({
          next: (data) => {
            if (data.data.length > 0) {
              bodyCostoEmpleadoactualiza = {
                ...bodyCostoEmpleadoactualiza,
                idCostoEmpleado: data.data[0].idCostoEmpleado
              }

              this.empleadosServ.guardarCostoEmpleadoActualiza(bodyCostoEmpleadoactualiza, this.esActualizacion, "api/Costo/" + data.data[0].idCostoEmpleado)
                .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                .subscribe({
                  next: (data) => {
                    // console.log(data)
                    //this.form1.reset()
                    this.router.navigate(['/empleados/empleado-pri'], { queryParams: { success: true } });
                  },
                  error: (err) => {
                    this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
                  }
                })
            }
          }
        })

    }

  }
  */






    // this.empleadosServ.guardarCostoEmpleado(bodyCostoEmpleado, this.esActualizacion)
    // .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    // .subscribe({
    //   next: (data) => {
    // console.log(data)
    //this.form1.reset()
    //    this.router.navigate(['/empleados/empleado-pri'], {queryParams: {success: true}});
    //  },
    //  error: (err) => {
    //    this.messageService.add({ severity: 'error', summary: TITLES.error, detail:  err.error  })
    //  }
    //})

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

  setCatPersonas(data: any[]) {
    data.forEach((element) => this.catPersonas.push({
      name: `${element.chnombre} ${element.chap_paterno} ${element.chap_materno || ''}`,
      value: String(element.nukidpersona),
    })
    )
  }

  setCatTipoEmpleado(data: any[]) {
    data.forEach((element) => this.catTipoEmpleados.push({
      name: String(element.descripcion),
      value: String(element.id),
    })
    );
  }

  setCatCategorias(data: any[]) {
    data.forEach((element) => this.catCategorias.push({
      name: String(element.descripcion),
      value: String(element.id),
    })
    )
  }

  setCatTipoContratos(data: any[]) {
    data.forEach((element) => this.catTipoContratos.push({
      name: String(element.chve_contrato),
      value: String(element.nukid_contrato),
    })
    )
  }

  setCatEmpresas(data: any[]) {
    data.forEach((element) => this.catEmpresas.push({
      name: String(element.chempresa),
      value: String(element.nukidempresa),
    })
    )
  }

  setCatCiudades(data: any[]) {
    this.catCiudades = []
    data.forEach((element) => this.catCiudades.push({
      name: String(element.ciudad),
      value: String(element.idCiudad),
    })
    )
  }

  setCatNivelEstudios(data: any[]) {
    data.forEach((element) => this.catNivelEstudios.push({
      name: String(element.descripcion),
      value: String(element.id),
    })
    )
  }

  setCatFormasPago(data: any[]) {
    data.forEach((element) => this.catFormasPago.push({
      name: String(element.descripcion),
      value: String(element.id),
    })
    )
  }

  setCatJornadas(data: any[]) {
    data.forEach((element) => this.catJornadas.push({
      name: String(element.descripcion),
      value: String(element.id),
    })
    )
  }

  setCatDepartamentos(data: any[]) {
    data.forEach((element) => this.catDepartamentos.push({
      name: String(element.descripcion),
      value: String(element.id),
    })
    )
  }

  setCatClasificacion(data: any[]) {
    data.forEach((element) => this.catClasificacion.push({
      name: String(element.descripcion),
      value: String(element.id),
    })
    )
  }

  setCatUnidadNegocio(data: any[]) {
    data.forEach((element) => this.catUnidadNegocio.push({
      name: String(element.descripcion),
      value: String(element.id),
    })
    )
  }

  setCatTurno(data: any[]) {
    data.forEach((element) => this.catTurno.push({
      name: String(element.descripcion),
      value: String(element.id),
    })
    )
  }

  buscarCiudades(event: any) {

    this.sharedService.cambiarEstado(true)

    this.empleadosServ.getCatCiudades(event.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({ data }) => {
          this.setCatCiudades(data)
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  setearSalarios({ value }: any) {
    const index = this.puestosInfo.findIndex(puesto => puesto.nukid_puesto === +value)
    if (index >= 0) {
      const puesto = this.puestosInfo.at(index)
      const sueldoReal = ((puesto.nusalario_min + puesto.nusalario_max) / 2).toString()
      this.form.patchValue({
        salario: sueldoReal
      })
    }
  }

  calcularAntiguedad(event: any) {
    const ahora = new Date()
    const diferencia = differenceInCalendarYears(ahora, new Date(event))
    this.form.patchValue({
      antiguedad: diferencia
    })
  }



}