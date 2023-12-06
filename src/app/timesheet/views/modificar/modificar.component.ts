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
import { TITLES, errorsArray } from 'src/utils/constants';

@Component({
  selector: 'app-modificar',
  templateUrl: './modificar.component.html',
  styleUrls: ['./modificar.component.scss'],
  providers: [MessageService]
})
export class ModificarComponent implements OnInit {

  errorMessage: string = ''
  cargando: boolean = true

  timesheetService  = inject(TimesheetService)
  authService       = inject(MsalService)
  fb                = inject(FormBuilder)
  sharedService     = inject(SharedService)
  messageService    = inject(MessageService)
  router            = inject(Router)
  activatedRoute    = inject(ActivatedRoute)

  diasHabiles: number = 0

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

    return (totalProyectos + totalOtros)
  }

  get sumaOtros() {
    let total = 0
    this.otros.controls.forEach(control => {
      total += Number(control.get('dias').value)
    })
    return total
  }

  ngOnInit(): void {
    
    this.sharedService.cambiarEstado(true)

    this.activatedRoute.paramMap.subscribe(params => {
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
    })
  }

  buscarProyectos(event: any) {
    this.sharedService.cambiarEstado(true)
    const id = event.value.code
    this.timesheetService.getProyectos(id).subscribe(({data}) => {
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
  }

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

    this.timesheetService.actualizarHoras(body)
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
      })
  }

  mapForm(data: Timesheet) {
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
          costo:      [0]
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
    this.proyectos.removeAt(i)
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
}
