import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MsalService } from '@azure/msal-angular';
import { finalize, forkJoin } from 'rxjs';
import { format } from 'date-fns';

import { TimesheetService } from '../../services/timesheet.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { MODULOS, TITLES, errorsArray } from 'src/utils/constants';
import { Proyecto, SabadosOpciones,Timesheet } from '../../models/timesheet.model';
import { Router } from '@angular/router';
import { Opcion } from 'src/models/general.model';
import { DialogService } from 'primeng/dynamicdialog';
import { AgregarProyectoComponent } from '../agregar-proyecto/agregar-proyecto.component';
import { UserService } from '../../../services/user.service';
import { EmpleadosService } from 'src/app/empleados/services/empleados.service';

@Component({
  selector: 'app-cargar-horas',
  templateUrl: './cargar-horas.component.html',
  styleUrls: ['./cargar-horas.component.css'],
  providers: [MessageService, DialogService]
})
export class CargarHorasComponent implements OnInit {

  errorMessage: string = ''
  cargando: boolean = true
  fecha: number = null
  timesheets: Timesheet[] = []
  proyectosTime: Proyecto[] = []

  timesheetService  = inject(TimesheetService)
  authService       = inject(MsalService)
  fb                = inject(FormBuilder)
  sharedService     = inject(SharedService)
  messageService    = inject(MessageService)
  router            = inject(Router)
  dialogService     = inject(DialogService)
  userService       = inject(UserService)
  empleadosService  = inject(EmpleadosService)

  empleados: Opcion[] = []

  diasHabiles: number = 0

  fechahoy: number = 0

  visible: boolean = true

  stilovisible: string = ''

  form = this.fb.group({
    empleado:       ['', [Validators.required]],
    fecha:          [format(Date.now(), 'M/Y')],
    mes:            [format(Date.now(), 'M')],
    anio:           [format(Date.now(), 'Y')],
    responsable:    ['', Validators.required],
    id_responsable: [0],
    dias:           [this.diasHabiles, [Validators.min(1)]],
    dedicacion: [0],
    sabados:        ['NO'],
    proyectos:      this.fb.array([]),
    botonagregar:   null,
    otros:          this.fb.array([
      this.fb.group({
        id:         ['feriado'],
        dias:       [0, Validators.required],
        dedicacion: [0],
      }),
      this.fb.group({
        id:         ['vacaciones'],
        dias:       [0, Validators.required],
        dedicacion: [0],
      }),
      this.fb.group({
        id:         ['permiso'],
        dias:       [0, Validators.required],
        dedicacion: [0],
      }),
      this.fb.group({
        id:         ['incapacidad'],
        dias:       [0, Validators.required],
        dedicacion: [0],
      }),
      this.fb.group({
        id:         ['inasistencia'],
        dias:       [0, Validators.required],
        dedicacion: [0],
      }),
      this.fb.group({
        id:         ['capacitación'],
        dias:       [0, Validators.required],
        dedicacion: [0],
      })
    ])
  })

  constructor() { }

  get proyectos() {
    return this.form.get('proyectos') as FormArray
  }

  get otros() {
    return this.form.get('otros') as FormArray
  }

  get totalSuperado(): boolean {
    return (this.diasAcumulados > this.form.value.dias)
  }

  get totalNoAlcanzado(): boolean{
    return (this.diasAcumulados < this.form.value.dias)
  }

  get diasAcumulados() {
    let totalProyectos = 0
    let totalOtros = 0
    for (let i = 0; i < this.proyectos.value.length; i++) {
      totalProyectos += +this.proyectos.value[i].dias
    }

    for (let i = 0; i < this.otros.value.length; i++) {
      totalOtros += +this.otros.value[i].dias
    }

    return this.formateaValor((totalProyectos + totalOtros))
  }

  get Dedicacion() {
    let totalProyectos = 0
    let totalOtros = 0
    for (let i = 0; i < this.proyectos.value.length; i++) {
      totalProyectos += +this.proyectos.value[i].dias
    }

    for (let i = 0; i < this.otros.value.length; i++) {
      totalOtros += +this.otros.value[i].dias
    }

    return this.formateaValor(((totalProyectos + totalOtros) * 100)/ (this.form.value.dias))
  }

  get DedicacionFaltante() {
    let totalProyectos = 0
    let totalOtros = 0
    for (let i = 0; i < this.proyectos.value.length; i++) {
      totalProyectos += +this.proyectos.value[i].dias
    }

    for (let i = 0; i < this.otros.value.length; i++) {
      totalOtros += +this.otros.value[i].dias
    }

    return this.formateaValor((100 - ((totalProyectos + totalOtros) * 100)/ (this.form.value.dias)))
  }

  get sumaOtros() {
    let total = 0
    this.otros.controls.forEach(control => {
      total += Number(control.get('dias').value)
    })
    return total
  }

  get stringFechaNoPermitida(): string {
    let date: Date = new Date();

    if(this.userService.verificarRol(MODULOS.TIMESHEET_CARGA_DE_HORAS)?.administrador){
      console.log('cantidad de empleados admin --------- <<<<<  ' + this.empleados.length) 
      console.log(Object.values(this.empleados));

      this.stilovisible = 'visible'
      return this.stilovisible                               
    }else{

     console.log('cantidad de empleados otros --------- <<<<<  ' + this.empleados.length) 
     console.log(Object.values(this.empleados));

      this.visible  = (this.empleados.length == 0 || this.empleados.length == 1 ? (+date.getDate() > 23  && +date.getDate() < 32) : (+date.getDate() > 26  && +date.getDate() < 32))

      if(this.visible){
        this.stilovisible = 'hidden'
        return this.stilovisible
      }else{
        this.stilovisible = 'visible'
        return this.stilovisible
      }

    }
    //return (+date.getDate() > 13  && +date.getDate() < 31)                                          // validar administrador                        //validar cualquier usuario
    
  }

  get FechaNoPermitida(): boolean {
    let date: Date = new Date();
    //return (+date.getDate() > 13  && +date.getDate() < 31)       
    if(this.userService.verificarRol(MODULOS.TIMESHEET_CARGA_DE_HORAS)?.administrador){
      return false                                   
    }else{
                                                                                                // validar administrador                        //validar cualquier usuario
      //return(this.userService.verificarRol(MODULOS.TIMESHEET_CARGA_DE_HORAS)?.administrador ? (+date.getDate() > 14  && +date.getDate() < 31) : (+date.getDate() > 14  && +date.getDate() < 31))
      return (this.empleados.length == 0 || this.empleados.length == 1 ? (+date.getDate() > 23  && +date.getDate() < 32) : (+date.getDate() > 26  && +date.getDate() < 32))
    }
  }

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)

    if(this.userService.rolesG.length >= 1) {
      this.cargarDatos()
    } else {
      this.userService.getRolesRealTime()
        .subscribe(data => {
          this.cargarDatos()
        })
    }
  }

  cargarDatos() {

    forkJoin(([
      this.timesheetService.getEmpleadoInfo(localStorage.getItem('userMail') || ''),
      this.userService.verificarRol(MODULOS.TIMESHEET_CARGA_DE_HORAS)?.administrador ? this.empleadosService.getEmpleadosActivos() : this.timesheetService.getEmpleadosByJefeEmail(localStorage.getItem('userMail') || ''),
      this.timesheetService.getDiasHabiles(+this.form.value.mes, +this.form.value.anio, this.form.value.sabados as SabadosOpciones)
    ]))
    .pipe(
      finalize(() => {
        this.sharedService.cambiarEstado(false)
      })
    )
    .subscribe(([empleadoR, empleadosR, diasR]) => {
      if(!empleadoR.success) {
        this.messageService.add({ severity: 'error', summary: 'Oh no...', detail: '¡No pudimos encontrar información del usuario responsable!' })
      } else {
        const {nukid_empleado, chnombre, chap_paterno} = empleadoR.data
        this.form.patchValue({responsable: `${chnombre} ${chap_paterno}`})
        this.form.patchValue({id_responsable: nukid_empleado})
      }

      //this.empleados = empleadosR.data.map(empleado => ({name: empleado.nombre_persona, code: empleado.nunum_empleado_rr_hh.toString()}))
      this.empleados = empleadosR.data.map(empleado => ({ code: empleado.nunum_empleado_rr_hh.toString(), name: `${empleado.nunum_empleado_rr_hh.toString()} - ${empleado.nombre_persona}` }))

      this.form.patchValue({dias: diasR.habiles})
      this.otros.at(0).patchValue({dias: diasR.feriados})
    })
  }

  buscarProyectos(event: any) {
    this.sharedService.cambiarEstado(true)
    const id = event.value.code


    /*const mesFormateado = 4//this.fecha ? +format(this.fecha, 'M') : 0
    const anioFormateado = 2024//this.fecha ? +format(this.fecha, 'Y') : 0

    this.timesheetService.getTimeSheetsPorEmpleado( 0,  0,  0,  0, mesFormateado, anioFormateado)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({ data }) => {
          this.timesheets = []
           data.map(ts => ({
            ...ts,
            
            id:  this.proyectosTime.descripcion,
            nombre: ts.chproyecto,
            dias:       [ts.nudias, Validators.required],
          dedicacion: [ts.nudedicacion], 
          costo:      [ts.nucosto],
          dedicacionCalc:      [ts.nudedicacion]
          }))


          this.sharedService.cambiarEstado(false)
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })*/


    this.timesheetService.getProyectos(id).subscribe(({data}) => {
      this.proyectos.clear()
      data.map(proyecto => this.proyectos.push(
        this.fb.group({
          id:         [proyecto.nunum_proyecto],
          nombre:     [proyecto.chproyecto],
          dias:       [proyecto.nudias, Validators.required],
          dedicacion: [proyecto.nudedicacion], 
          costo:      [proyecto.nucosto],
          diasCalc:      [0],
          dedicacionCalc:      [proyecto.nudedicacion]
        }))
      )
      this.sharedService.cambiarEstado(false)
    })



  }

  calcularDias(event: any) {
    this.sharedService.cambiarEstado(true)
    
    this.timesheetService.getDiasHabiles(
      +this.form.value.mes, 
      +this.form.value.anio, 
      event.value as any
    ).subscribe(({habiles, feriados}) => {
      this.form.patchValue({dias: habiles})
      this.otros.at(0).patchValue({dias: feriados})
      this.sharedService.cambiarEstado(false)
    })
  }

  calcularPorcentajes(event: any, i: number, seccion: string) {
    const valor = +event
    if(seccion === 'proyectos') {
      this.proyectos.at(i).patchValue({
        dedicacion:  this.formateaValor((valor / this.form.value.dias) * 100) ,
        costo:      this.formateaValor( (valor / (this.form.value.dias - this.sumaOtros)) * 100 ),
        diasCalc: valor,
        dedicacionCalc: this.formateaValor((valor / this.form.value.dias) * 100) 
      })

      //console.log("Calcula calcularDias valor: "+  valor )
      //console.log("Calcula calcularDias this.form.value.dias: "+ this.form.value.dias)
     // console.log("Calcula calcularDias this.sumaOtros: "+  this.sumaOtros)
      console.log("Calcula calcularDias Costo Formula: "+  this.formateaValor( (valor / (this.form.value.dias - this.sumaOtros)) * 100 ))
      
    } else {
      this.otros.at(i).patchValue({
        dedicacion: this.formateaValor( (valor / this.form.value.dias) * 100 )
      })
      this.proyectos.controls.forEach(proyecto => {
        const costo = this.formateaValor( ( Number(proyecto.get('dias').value) / (this.form.value.dias - this.sumaOtros) ) * 100 )
       
        proyecto.patchValue({
          costo
        })
      })
    }
  }

  calcularDiasdedica(event: any, i: number, seccion: string) {
    const valor = +event
    if(seccion === 'proyectos') {
      this.proyectos.at(i).patchValue({
        diasCalc:  this.formateaValor((valor * this.form.value.dias) / 100) ,
        //costo:      this.formateaValor( (valor * (this.form.value.dias + this.sumaOtros)) / 100 ),
        costo:      this.formateaValor( (((valor * this.form.value.dias )/ 100) / (this.form.value.dias - this.sumaOtros)) * 100 ),
        dedicacion: valor,
        dias:        this.formateaValor((valor * this.form.value.dias) / 100)

      })

      console.log("Calcula calcularDiasdedica valor: "+  valor )
      console.log("Calcula calcularDiasdedica this.form.value.dias: "+ this.form.value.dias)
      console.log("Calcula calcularDiasdedica this.sumaOtros: "+  this.sumaOtros)
      console.log("Calcula calcularDiasdedica Costo Formula: "+  this.formateaValor( (((valor * this.form.value.dias )/ 100) / (this.form.value.dias - this.sumaOtros)) * 100 ))
      //console.log("Dedicacion: "+ (valor / this.form.value.dias) * 100)
    }
      
      //console.log("Dedicacion1: Valor: "+  valor +" Dias: " + this.form.value.dias +" Formula: "+ this.formateaValor((valor * this.form.value.dias) / 100))
      //console.log("Dedicacion2: "+ this.formateaValor( (valor * (this.form.value.dias - this.sumaOtros)) / 100 ))
      //console.log("Dedicacion3: "+ valor)
      //console.log("Dedicacion4: "+ this.form.value.dias)
  }

  

  

  guardar() {
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    const body = {...this.form.value, sabados: (this.form.value.sabados === 'SI')} 

    // console.log(body)
    // return

    this.sharedService.cambiarEstado(true)

    this.timesheetService.cargarHoras(body)
      .subscribe({
        next: (data) => {
          // this.form.reset()
          this.sharedService.cambiarEstado(false)
          //this.router.navigate(['/timesheet/cargar-horas'], {queryParams: {success: true}});
          Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Registro guardado', detail: 'El registro ha sido guardado.' }))
        
        },
        error: (err) => {
          this.sharedService.cambiarEstado(false)
          this.messageService.add({ severity: 'error', summary: 'Oh no...', detail: err.error || '¡Ha ocurrido un error!' })
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
      if(this.form.get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }

  esInvalidoEnArreglo(formArray: FormArray, campo: string, index: number): boolean {
    return formArray.controls[index].get(campo).invalid && 
            (formArray.controls[index].get(campo).dirty || formArray.controls[index].get(campo).touched)
  }

  obtenerMensajeErrorEnArreglo(formArray: FormArray, campo: string, index: number): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if(formArray.controls[index].get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }
  
  agregarProyectoModal() {

      const empleado = this.form.value.empleado

    this.dialogService.open(AgregarProyectoComponent, {
      header: 'Agregar proyecto',
      width: '50%',
      height: '380px',
      contentStyle: {overflow: 'auto'},
      data: {
        empleado
      }
    })
    .onClose.subscribe(({exito, registro}) => {
      if(exito) {
        this.proyectos.push(
          this.fb.group({
            id:         [registro.proyectoId],
            nombre:     [registro.proyectoNombre],
            dias:       ['', Validators.required],
            dedicacionCalc: [0],
            costo:      [0],
            dedicacion : [0],
            diasCalc : [0]
          })
        )
      }
    })

    

    
  }

  eliminarProyecto(idProyecto: number, i: number) {

    const empleado: any = this.form.value.empleado

    this.sharedService.cambiarEstado(true)

    this.timesheetService.eliminarProyecto({
        id_empleado: empleado.code,
        id_proyecto: idProyecto,
        id_timesheet: 0
      })
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => this.proyectos.removeAt(i),
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }
}
