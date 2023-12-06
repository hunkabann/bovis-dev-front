import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CieService } from '../../services/cie.service';
import { CALENDAR, TITLES, errorsArray, mesesString } from 'src/utils/constants';
import { finalize } from 'rxjs';
import { Item } from 'src/models/general.model';
import { format } from 'date-fns';
import { Location } from '@angular/common';

@Component({
  selector: 'app-modificar-registro',
  templateUrl: './modificar-registro.component.html',
  styleUrls: ['./modificar-registro.component.css'],
  providers: [MessageService]
})
export class ModificarRegistroComponent implements OnInit {

  config          = inject(PrimeNGConfig)
  messageService  = inject(MessageService)
  router          = inject(Router)
  fb              = inject(FormBuilder)
  sharedService   = inject(SharedService)
  cieService      = inject(CieService)
  activatedRoute  = inject(ActivatedRoute)

  constructor() { }

  mesesOpciones: Item[] = mesesString.filter(mes => mes.value != 0)

  form = this.fb.group({
    id_cie:             [null, Validators.required],
    nombre_cuenta:      ['Cta 0001', Validators.required],
    cuenta:             ['AB12345', Validators.required],
    tipo_poliza:        ['GR', Validators.required],
    numero:             [100, Validators.required],
    fecha:              ['15/07/2022', Validators.required],
    mes:                ['06', Validators.required],
    concepto:           ['Movimiento mes de Junio', Validators.required],
    centro_costos:      ['ABCDEFG', Validators.required],
    proyectos:          ['Construcción de edificios', Validators.required],
    saldo_inicial:      [100000.8799, Validators.required],
    debe:               [10000.0000, Validators.required],
    haber:              [99000.8799, Validators.required],
    movimiento:         [10000.0000, Validators.required],
    empresa:            ['BOVIS', Validators.required],
    num_proyecto:       [435, Validators.required],
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
          this.cieService.getRegistro(id)
            .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
            .subscribe({
              next: ({data}) => {
                this.form.patchValue({
                  id_cie: id,
                  nombre_cuenta:      data.nombreCuenta,
                  cuenta:             data.cuenta,
                  tipo_poliza:        data.tipoPoliza,
                  numero:             +data.numero,
                  fecha:              new Date(data.fecha) as any,
                  mes:                data.mes.toString(),
                  concepto:           data.concepto,
                  centro_costos:      data.centroCostos,
                  proyectos:          data.proyectos,
                  saldo_inicial:      data.saldoInicial,
                  debe:               data.debe,
                  haber:              data.haber,
                  movimiento:         data.movimiento,
                  empresa:            data.empresa,
                  num_proyecto:       data.numProyecto,
                  tipo_cuenta:        data.tipoCuenta || '',
                  edo_resultados:     data.edoResultados || '',
                  responsable:        data.responsable || '',
                  tipo_proyecto:      data.tipoProyecto || '',
                  tipo_py:            data.tipoPy || '',
                  clasificacion_py:   data.clasificacionPy || ''
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
