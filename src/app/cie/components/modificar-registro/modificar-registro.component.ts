import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CieService } from '../../services/cie.service';
import { CALENDAR, TITLES, errorsArray, mesesString } from 'src/utils/constants';
import { finalize, forkJoin } from 'rxjs';
import { Item, Opcion } from 'src/models/general.model';
import { format } from 'date-fns';
import { Location } from '@angular/common';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';

@Component({
  selector: 'app-modificar-registro',
  templateUrl: './modificar-registro.component.html',
  styleUrls: ['./modificar-registro.component.css'],
  providers: [MessageService]
})
export class ModificarRegistroComponent implements OnInit {

  config            = inject(PrimeNGConfig)
  messageService    = inject(MessageService)
  router            = inject(Router)
  fb                = inject(FormBuilder)
  sharedService     = inject(SharedService)
  cieService        = inject(CieService)
  activatedRoute    = inject(ActivatedRoute)
  timesheetService  = inject(TimesheetService)

  tiposPY: Opcion[] = []
  clasificacionesPY: Opcion[] = []
  proyectosLista: Opcion[] = []

  constructor() { }

  mesesOpciones: Item[] = mesesString.filter(mes => mes.value != 0)

  form = this.fb.group({
    id_cie:             [null, Validators.required],
    nombre_cuenta:      ['', Validators.required],
    cuenta:             ['', Validators.required],
    tipo_poliza:        ['', Validators.required],
    numero:             [0, Validators.required],
    fecha:              ['', Validators.required],
    mes:                ['', Validators.required],
    concepto:           ['', Validators.required],
    centro_costos:      ['', Validators.required],
    proyectos:          [''],
    saldo_inicial:      [0.0, Validators.required],
    debe:               [0.0, Validators.required],
    haber:              [0.0, Validators.required],
    movimiento:         [0.0, Validators.required],
    empresa:            ['', Validators.required],
    num_proyecto:       ['0', Validators.required],
    tipo_cuenta:        [''],
    edo_resultados:     [''],
    responsable:        [''],
    tipo_proyecto:      [''],
    tipo_py:            [''],
    clasificacion_py:   ['']
  })

  ngOnInit(): void {
    
    this.getConfigCalendar()
    this.sharedService.cambiarEstado(true)
    
    this.activatedRoute.params
      .subscribe(({id}) => {
        if(id) {
          
          forkJoin([
            this.cieService.getTiposPY(),
            this.cieService.getCieClasificacionesPY(),
            this.timesheetService.getCatProyectos(),
            this.cieService.getRegistro(id)
          ])
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: (data) => {
              const [tiposPYRes, clasificacionesPYRes, proyectosRes, registroRes] = data
              this.tiposPY = tiposPYRes.data.map(registro => ({code: registro.trim(), name: registro}))
              this.clasificacionesPY = clasificacionesPYRes.data.map(registro => ({code: registro.trim(), name: registro}))
              this.proyectosLista = proyectosRes.data.map(proyecto => ({code: proyecto.numProyecto.toString(), name: `${proyecto.numProyecto.toString()} - ${proyecto.nombre}`}))
              
              this.form.patchValue({
                id_cie: id,
                nombre_cuenta:      registroRes.data.nombreCuenta,
                cuenta:             registroRes.data.cuenta,
                tipo_poliza:        registroRes.data.tipoPoliza,
                numero:             +registroRes.data.numero,
                fecha:              new Date(registroRes.data.fecha) as any,
                mes:                registroRes.data.mes.toString(),
                concepto:           registroRes.data.concepto,
                centro_costos:      registroRes.data.centroCostos,
                proyectos:          registroRes.data.proyecto,
                saldo_inicial:      registroRes.data.saldoInicial,
                debe:               registroRes.data.debe,
                haber:              registroRes.data.haber,
                movimiento:         registroRes.data.movimiento,
                empresa:            registroRes.data.empresa,
                num_proyecto:       registroRes.data.numProyecto.toString(),
                tipo_cuenta:        registroRes.data.tipoCuenta || '',
                edo_resultados:     registroRes.data.edoResultados || '',
                responsable:        registroRes.data.responsable || '',
                tipo_proyecto:      registroRes.data.tipoProyecto || '',
                tipo_py:            registroRes.data.tipoPy || '',
                clasificacion_py:   registroRes.data.clasificacionPy.trim() || ''
              })
            },
            error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
          })
        }
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

  guardar() {
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    const body = {
      ...this.form.value,
      fecha: format(new Date(this.form.value.fecha || null), 'dd/MM/Y'),
    }

    let nuevoProyecto = ''
    const proyectoIndex = this.proyectosLista.findIndex(proyecto => proyecto.code === this.form.value.num_proyecto)
    if(proyectoIndex >= 0) {
      nuevoProyecto = this.proyectosLista.at(proyectoIndex).name
      this.form.patchValue({
        proyectos: nuevoProyecto
      })
    }

    this.cieService.actualizarCieRegistro(body)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.form.reset()
          this.router.navigate(['/cie/resultado-busqueda'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
  }

}
