import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TimesheetService } from '../../services/timesheet.service';
import { MsalService } from '@azure/msal-angular';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { format } from 'date-fns';
import { Opcion } from 'src/models/general.model';
import { finalize, forkJoin } from 'rxjs';
import { SabadosOpciones, Timesheet } from '../../models/timesheet.model';
import { TITLES, errorsArray,MODULOS } from 'src/utils/constants';
import { DialogService } from 'primeng/dynamicdialog';
import { AgregarProyectoComponent } from '../agregar-proyecto/agregar-proyecto.component';
import { UserService } from '../../../services/user.service';

import { EmpleadosService } from 'src/app/empleados/services/empleados.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-modificar',
  templateUrl: './modificar.component.html',
  styleUrls: ['./modificar.component.scss'],
  providers: [MessageService,DialogService]
})
export class ModificarComponent implements OnInit {

  errorMessage: string = ''

  empleadodialog: string = ''
  codedialog: number
  cargando: boolean = true

  empleados: Opcion[] = []

  timesheetService  = inject(TimesheetService)
  authService       = inject(MsalService)
  fb                = inject(FormBuilder)
  sharedService     = inject(SharedService)
  messageService    = inject(MessageService)
  router            = inject(Router)
  activatedRoute    = inject(ActivatedRoute)
  dialogService     = inject(DialogService)
  userService       = inject(UserService)
  empleadosService  = inject(EmpleadosService)

  diasHabiles: number = 0
  timesheetID: number = 0

  fechahoy: number = 0

  visible: boolean = true

  stilovisible: string = ''

  form = this.fb.group({
    id_time_sheet:  [0],
    empleado:       ['', [Validators.required]],
    fecha:          [format(Date.now(), 'M/Y')],
    mes:            [format(Date.now(), 'M')],
    anio:           [format(Date.now(), 'Y')],
    responsable:    ['', Validators.required],
    id_responsable: [0],
    id_empleado:    [0],
    dias:           [this.diasHabiles, [Validators.min(1)]],
    sabados:        ['NO'],
    proyectos:      this.fb.array([]),
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

  constructor(public ref: DynamicDialogRef,public config: DynamicDialogConfig) { }

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

    return (totalProyectos + totalOtros)
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
    

    this.activatedRoute.paramMap.subscribe(params => {
     // const id = Number(params.get('id'))
     const id = this.config.data.code

     this.timesheetID= this.config.data.code

      this.form.patchValue({id_time_sheet: id})
      forkJoin(([
        this.timesheetService.getTimeSheetPorId(id)
      ]))
      .pipe(
        finalize(() => {
          this.sharedService.cambiarEstado(false)
        })
      )
      .subscribe(([timesheetR]) => {
        if(timesheetR.data) {
          this.mapForm(timesheetR.data)
        }
      })
    })

    this.cargarDatos()

    /**this.activatedRoute.paramMap.subscribe(params => {
      const id = Number(params.get('id'))
      this.form.patchValue({id_time_sheet: id})
      forkJoin(([
        this.timesheetService.getTimeSheetPorId(id)
      ]))
      .pipe(
        finalize(() => {
          this.sharedService.cambiarEstado(false)
        })
      )
      .subscribe(([timesheetR]) => {
        if(timesheetR.data) {
          this.mapForm(timesheetR.data)
        }
      })
    })*/
  }

  cargarDatos() {

    forkJoin(([
      this.timesheetService.getEmpleadoInfo(localStorage.getItem('userMail') || ''),
      this.userService.verificarRol(MODULOS.TIMESHEET_CARGA_DE_HORAS)?.administrador ? this.empleadosService.getEmpleados() : this.timesheetService.getEmpleadosByJefeEmail(localStorage.getItem('userMail') || ''),
      this.timesheetService.getDiasHabiles(+this.form.value.mes, +this.form.value.anio, this.form.value.sabados as SabadosOpciones)
    ]))
    .pipe(
      finalize(() => {
        this.sharedService.cambiarEstado(false)
      })
    )
    .subscribe(([empleadoR, empleadosR, diasR]) => {
     // if(!empleadoR.success) {
     //   this.messageService.add({ severity: 'error', summary: 'Oh no...', detail: '¡No pudimos encontrar información del usuario responsable!' })
     // } else {
     //   const {nukid_empleado, chnombre, chap_paterno} = empleadoR.data
     //   this.form.patchValue({responsable: `${chnombre} ${chap_paterno}`})
      //  this.form.patchValue({id_responsable: nukid_empleado})
     // }

      //this.empleados = empleadosR.data.map(empleado => ({name: empleado.nombre_persona, code: empleado.nunum_empleado_rr_hh.toString()}))
      this.empleados = empleadosR.data.map(empleado => ({ code: empleado.nunum_empleado_rr_hh.toString(), name: `${empleado.nunum_empleado_rr_hh.toString()} - ${empleado.nombre_persona}` }))

      this.form.patchValue({dias: diasR.habiles})
      this.otros.at(0).patchValue({dias: diasR.feriados})
    })
  }

  buscarProyectos(event: any) {
    this.sharedService.cambiarEstado(true)
    const id = event.value.code
    /**this.timesheetService.getProyectos(id).subscribe(({data}) => {
      this.proyectos.clear()
      data.map(proyecto => this.proyectos.push(
        this.fb.group({
          id:         [proyecto.nunum_proyecto],
          nombre:     [proyecto.chproyecto],
          dias:       ['', Validators.required],
          dedicacion: [0],
          costo:      [0]
        }))
      )
      this.sharedService.cambiarEstado(false)
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

  /**calcularPorcentajes(event: any, i: number, seccion: string) {
    const valor = +event
    if(seccion === 'proyectos') {
      this.proyectos.at(i).patchValue({
        dedicacion: Math.round( (valor / this.form.value.dias) * 100 ),
        costo:      Math.round( (valor / (this.form.value.dias - this.sumaOtros)) * 100 )
      })
    } else {
      this.otros.at(i).patchValue({
        dedicacion: Math.round( (valor / this.form.value.dias) * 100 )
      })
      this.proyectos.controls.forEach(proyecto => {
        const costo = Math.round( ( Number(proyecto.get('dias').value) / (this.form.value.dias - this.sumaOtros) ) * 100 )
        proyecto.patchValue({
          costo
        })
      })
    }
  }*/

  actualizar() {
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    const values = this.form.value
    const body = {
      ...values, 
      sabados: (values.sabados === 'SI'),
      empleado: {
        name: values.empleado,
        code: values.id_empleado.toString()
      }
    }

    // console.log(body)
    // return

    this.sharedService.cambiarEstado(true)

   /**  this.timesheetService.actualizarHoras(body)
      .subscribe({
        next: (data) => {
          // this.form.reset()
          this.sharedService.cambiarEstado(false)
          this.router.navigate(['/timesheet/consultar'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.sharedService.cambiarEstado(false)
          this.messageService.add({ severity: 'error', summary: 'Oh no...', detail: err.error || '¡Ha ocurrido un error!' })
        }
      })*/

        this.timesheetService.actualizarHoras(body)
      .subscribe({
        next: (data) => {
          // this.form.reset()
          this.sharedService.cambiarEstado(false)
          //this.router.navigate(['/timesheet/cargar-horas'], {queryParams: {success: true}});
          Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Registro actializado', detail: 'El registro ha sido actualizado.' }))
        
        },
        error: (err) => {
          this.sharedService.cambiarEstado(false)
          this.messageService.add({ severity: 'error', summary: 'Oh no...', detail: err.error || '¡Ha ocurrido un error!' })
        }
      })
  
  }

  mapForm(data: Timesheet) {
    this.empleadodialog = data.empleado
    this.codedialog = data.id_empleado
    this.form.patchValue({
      empleado:       data.empleado,
      fecha:          `${data.mes}/${data.anio}`,
      mes:            data.mes.toString(),
      anio:           data.anio.toString(),
      responsable:    data.responsable,
      id_responsable: data.id_responsable,
      id_empleado:    data.id_empleado,
      dias:           data.dias_trabajo,
      sabados:        data.sabados ? 'SI' : 'NO',
    })

    this.proyectos.clear()
    data.proyectos.forEach((proyecto, index) => {
      this.proyectos.push(
        this.fb.group({
          id:         [proyecto.idProyecto],
          nombre:     [proyecto.descripcion],
          dias:       [proyecto.dias, Validators.required],
          dedicacion: [0],
          costo:      [proyecto.costo],
          diasCalc:      [0],
          dedicacionCalc:      [proyecto.tDedicacion],
          tsproyect:      [proyecto.idTimesheet_Proyecto]

        })
      )
      this.calcularPorcentajes(proyecto.dias, index, 'proyectos')
    })

    data.otros.forEach((otro) => {
      const index = this.otros.controls.findIndex(otroC => otroC.value.id === otro.descripcion)
      if(index >= 0) {
        this.otros.at(index).patchValue({
          dias: otro.dias
        })
        this.calcularPorcentajes(otro.dias, index, 'otros')
      }
    })
  }

  eliminarProyecto(idProyecto: number, i: number) {

    const empleado: any = this.form.value.empleado

    this.sharedService.cambiarEstado(true)

    const values = this.form.value
    

    this.timesheetService.eliminarProyecto({
        id_empleado: values.id_empleado,
        id_proyecto: idProyecto,
        id_timesheet: this.timesheetID
      })
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => this.proyectos.removeAt(i),
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
    //this.proyectos.removeAt(i)
    // error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
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
    
    console.log('this.empleadodialog ------ ' +this.empleadodialog)
    console.log('this.form.value.empleado ------ ' +this.form.value.empleado)

    const empleado = this.form.value.empleado

    console.log('this.codedialog ------ ' +this.codedialog)

    this.dialogService.open(AgregarProyectoComponent, {
      header: 'Agregar proyecto',
      width: '50%',
      height: '380px',
      contentStyle: {overflow: 'auto'},
      data: {
        empleado,
        code: this.codedialog
      }
    })
    .onClose.subscribe(({exito, registro}) => {
      if(exito) {
        this.proyectos.push(
          this.fb.group({
            id:         [registro.proyectoId],
            nombre:     [registro.proyectoNombre],
            dias:       ['', Validators.required],
            dedicacion: [0],
            dedicacionCalc: [0],
            costo:      [0],
            diasCalc:      [0]
          })
        )
      }
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
      //console.log("Dedicacion: "+ (valor / this.form.value.dias) * 100)
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
        costo:      this.formateaValor( (valor * (this.form.value.dias + this.sumaOtros)) / 100 ),
        dedicacion: valor,
        dias:        this.formateaValor((valor * this.form.value.dias) / 100)

      })
      //console.log("Dedicacion: "+ (valor / this.form.value.dias) * 100)
      
      this.proyectos.controls.forEach(proyecto => {
        const costo = this.formateaValor( ( Number(proyecto.get('dias').value) / (this.form.value.dias - this.sumaOtros) ) * 100 )
        proyecto.patchValue({
          costo
        })
      })
      //console.log("Dedicacion: "+ (valor / this.form.value.dias) * 100)

    }

  }

  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

  
}
