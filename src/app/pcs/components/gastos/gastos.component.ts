import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PcsService } from '../../services/pcs.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { obtenerMeses } from 'src/helpers/helpers';
import { DialogService } from 'primeng/dynamicdialog';
import { ModificarRubroComponent } from '../modificar-rubro/modificar-rubro.component';
import { TITLES } from 'src/utils/constants';
import { Mes } from 'src/models/general.model';
import { finalize } from 'rxjs';
import { Rubro } from '../../models/pcs.model';

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css'],
  providers: [MessageService, DialogService]
})
export class GastosComponent implements OnInit {

  dialogService     = inject(DialogService)
  fb                = inject(FormBuilder)
  messageService    = inject(MessageService)
  pcsService        = inject(PcsService)
  sharedService     = inject(SharedService)

  cargando:             boolean = true
  proyectoSeleccionado: boolean = false
  mesesProyecto:        Mes[] = []
  
  proyectoFechaInicio:  Date
  proyectoFechaFin:     Date

  constructor() { }
  
  form = this.fb.group({
    numProyecto:  [0, Validators.required],
    secciones:    this.fb.array([])
  })

  get secciones() {
    return this.form.get('secciones') as FormArray
  }
  
  rubros(seccionIndex: number) {
    return (this.secciones.at(seccionIndex).get('rubros') as FormArray)
  }
  
  fechas(seccionIndex: number, rubroIndex: number) {
    return (this.rubros(seccionIndex).at(rubroIndex).get('fechas') as FormArray)
  }

  ngOnInit(): void {
    
    this.pcsService.cambiarEstadoBotonNuevo(false)

    this.pcsService.obtenerIdProyecto()
      .subscribe(numProyecto => {
        this.proyectoSeleccionado = true
        if(numProyecto) {
          // this.sharedService.cambiarEstado(true)
          this.cargando = true
          this.cargarInformacion(numProyecto)
        } else {
          console.log('No hay proyecto');
        }
      })
  }

  cargarInformacion(numProyecto: number) {
    this.pcsService.obtenerGastosIngresosSecciones(numProyecto)
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: ({data}) => {

          this.proyectoFechaInicio  = new Date(data.fechaIni)
          this.proyectoFechaFin     = new Date(data.fechaFin)
          this.mesesProyecto        = obtenerMeses(this.proyectoFechaInicio, this.proyectoFechaFin)

          this.secciones.clear()

          data.secciones.forEach((seccion, seccionIndex) => {
            
            this.secciones.push(this.fb.group({
              idSeccion:  [seccion.idSeccion],
              codigo:     [seccion.codigo],
              seccion:    [seccion.seccion],
              rubros:     this.fb.array([])
            }))
            
            seccion.rubros.forEach((rubro, rubroIndex) => {

              // Agregamos los rubros por seccion
              this.rubros(seccionIndex).push(this.fb.group({
                ...rubro,
                fechas:   this.fb.array([])
              }))
              
              // Agreamos las fechas por rubro
              rubro.fechas.forEach(fecha => {

                this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
                  id:         fecha.id,
                  mes:        fecha.mes,
                  anio:       fecha.anio,
                  porcentaje: fecha.porcentaje
                }))
              })
            })
          })
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  modificarRubro(rubro: Rubro, seccionIndex: number, rubroIndex: number) {

    this.dialogService.open(ModificarRubroComponent, {
      header: rubro.rubro,
      width: '50%',
      contentStyle: {overflow: 'auto'},
      data: {
        rubro,
        fechaInicio:  this.proyectoFechaInicio,
        fechaFin:     this.proyectoFechaFin
      }
    })
    .onClose.subscribe((result) => {

      if(result && result.rubro) {

        const rubroRespuesta = result.rubro as Rubro

        this.rubros(seccionIndex).at(rubroIndex).patchValue({
          unidad:           rubroRespuesta.unidad,
          cantidad:         rubroRespuesta.cantidad,
          reembolsable:     rubroRespuesta.reembolsable,
          aplicaTodosMeses: rubroRespuesta.aplicaTodosMeses
        })

        this.fechas(seccionIndex, rubroIndex).clear()

        rubroRespuesta.fechas.forEach(fechaRegistro => {
          this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
            id:         fechaRegistro.id,
            mes:        fechaRegistro.mes,
            anio:       fechaRegistro.anio,
            porcentaje: fechaRegistro.porcentaje
          }))
        })
      }
    })
  }

}
