import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { SeleccionarEmpleadoComponent } from '../seleccionar-empleado/seleccionar-empleado.component';
import { SeleccionarFechaComponent } from '../seleccionar-fecha/seleccionar-fecha.component';
import { PcsService } from '../../services/pcs.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TITLES } from 'src/utils/constants';
import { Empleado, Etapa, EtapasPorProyectoData } from '../../models/pcs.model';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CrearEtapaComponent } from '../crear-etapa/crear-etapa.component';
import { ModificarEmpleadoComponent } from '../modificar-empleado/modificar-empleado.component';
import { Mes } from 'src/models/general.model';
import { obtenerMeses } from 'src/helpers/helpers';
import { CatalogosService } from '../../services/catalogos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValue } from '@angular/common';
import { ModificarEtapaComponent } from '../modificar-etapa/modificar-etapa.component';

// interface Etapa {
//   id:         number,
//   nombre:     string,
//   totalMeses: number,
//   meses:      boolean[],
// }

// interface Empleado {
//   id:         number,
//   cod:        string,
//   nombre:     string,
//   posicion:   string,
//   totalMeses: number,
//   meses:      number[]
// }

@Component({
  selector: 'app-staffing-plan',
  templateUrl: './staffing-plan.component.html',
  styleUrls: ['./staffing-plan.component.css'],
  providers: [DialogService, MessageService]
})
export class StaffingPlanComponent implements OnInit {

  dialogService = inject(DialogService)
  fb = inject(FormBuilder)
  messageService = inject(MessageService)
  pcsService = inject(PcsService)
  sharedService = inject(SharedService)
  catalogosService = inject(CatalogosService)

  proyectoFechaInicio: Date
  proyectoFechaFin: Date

  cargando: boolean = true
  proyectoSeleccionado: boolean = false

  idproyecto: number;
  etapaTotales: any[] = [];

  constructor(private activatedRoute: ActivatedRoute, private router: Router) { }

  form = this.fb.group({
    numProyecto: [0, Validators.required],
    etapas: this.fb.array([])
  })

  get etapas() {
    return this.form.get('etapas') as FormArray
  }

  meses(etapaIndex: number) {
    return (this.etapas.at(etapaIndex).get('meses') as FormArray)
  }

  empleados(etapaIndex: number) {
    return (this.etapas.at(etapaIndex).get('empleados') as FormArray)
  }

  fechas(etapaIndex: number, empleadoIndex: number) {
    return (this.empleados(etapaIndex).at(empleadoIndex).get('fechas') as FormArray)
  }

  ngOnInit(): void {

    this.pcsService.cambiarEstadoBotonNuevo(false)

    this.catalogosService.obtenerParametros()
      .subscribe(params => {

        if (!params.proyecto) {

          console.log("params.proyecto:" + params.proyecto)
        } else {
          this.idproyecto = params.proyecto
          console.log("else params.proyecto:" + params.proyecto)
        }
      })

    if (this.idproyecto) {
      console.log("Staffing-plan.components Entro al this.idproyecto " + this.idproyecto)

      this.cargando = true
      this.pcsService.obtenerEtapasPorProyecto(this.idproyecto)
        .pipe(finalize(() => {
          // this.sharedService.cambiarEstado(false)
          this.proyectoSeleccionado = true
          this.cargando = false
        }))
        .subscribe({
          next: ({ data }) => this.cargarInformacion(data),
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        })
    } else {
      this.pcsService.obtenerIdProyecto()
        .subscribe(numProyecto => {
          this.proyectoSeleccionado = true
          this.form.reset()
          this.etapas.clear()
          if (numProyecto) {
            // this.sharedService.cambiarEstado(true)
            this.cargando = true
            this.pcsService.obtenerEtapasPorProyecto(numProyecto)
              .pipe(finalize(() => {
                // this.sharedService.cambiarEstado(false)
                this.cargando = false
              }))
              .subscribe({
                next: ({ data }) => this.cargarInformacion(data),
                error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
              })
          } else {
            console.log('No hay proyecto');
          }
        })
    }

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
       
        itemlabel : 'Staffing Plan'
      },
      queryParamsHandling: 'merge'
    })


  }

  async cargarInformacion(data: EtapasPorProyectoData) {

    this.form.patchValue({ numProyecto: data.numProyecto })
    this.proyectoFechaInicio = new Date(data.fechaIni)
    this.proyectoFechaFin = new Date(data.fechaFin)

    // Agregamos las etapas del proyecto
    data.etapas.map(async (etapa, etapaIndex) => {
      const meses: Mes[] = obtenerMeses(new Date(etapa.fechaIni), new Date(etapa.fechaFin));
      this.etapas.push(this.fb.group({
        idFase: etapa.idFase,
        orden: etapa.orden,
        fase: etapa.fase,
        fechaIni: etapa.fechaIni,
        fechaFin: etapa.fechaFin,
        empleados: this.fb.array([]),
        meses: this.fb.array(meses)
      }));

      meses.forEach(mes => {
        this.etapaTotales[etapa.idFase] = this.etapaTotales[etapa.idFase] || {};
        this.etapaTotales[etapa.idFase][`${mes.mes}_${mes.anio}`] = 0;
      });

      // Agregamos los empleados por cada etapa
      etapa.empleados.forEach((empleado, empleadoIndex) => {
        console.log('empleado.chAlias ' + empleado.chAlias)

        this.empleados(etapaIndex).push(this.fb.group({
          id: empleado.id,
          idFase: empleado.idFase,
          reembolsable: empleado.reembolsable,
          numempleadoRrHh: empleado.numempleadoRrHh,
          empleado: empleado.empleado,
          fechas: this.fb.array([]),
          aplicaTodosMeses: empleado.aplicaTodosMeses,
          cantidad: empleado.cantidad,
          FEE: empleado.fee,
          Puesto: empleado.Puesto,
          chalias: empleado.chAlias,
          //PrecioVenta: empleado.PrecioVenta,
         // nucosto_ini: empleado.nucosto_ini
        }))

        // Agreamos las fechas por empleado
        empleado.fechas.forEach(fecha => {
          if(this.etapaTotales[etapa.idFase][`${fecha.mes}_${fecha.anio}`] !== undefined) {
            this.etapaTotales[etapa.idFase][`${fecha.mes}_${fecha.anio}`] = (this.etapaTotales[etapa.idFase][`${fecha.mes}_${fecha.anio}`] || 0) + fecha.porcentaje;
          }
          this.fechas(etapaIndex, empleadoIndex).push(this.fb.group({
            id: fecha.id,
            mes: fecha.mes,
            anio: fecha.anio,
            porcentaje: fecha.porcentaje
          }))
        })
      })
    })
  }

  async agregarEtapa() {
    this.dialogService.open(CrearEtapaComponent, {
      header: 'Crear etapa',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      data: {
        numProyecto: this.form.value.numProyecto,
        fechaInicio: this.proyectoFechaInicio,
        fechaFin: this.proyectoFechaFin
      }
    })
      .onClose.subscribe(async (result) => {
        if (result && result.etapa) {
          const etapa = result.etapa
          this.etapas.push(this.fb.group({
            idFase: etapa.idFase,
            orden: etapa.orden,
            fase: etapa.fase,
            fechaIni: etapa.fechaIni,
            fechaFin: etapa.fechaFin,
            empleados: this.fb.array([]),
            meses: this.fb.array(await obtenerMeses(new Date(etapa.fechaIni), new Date(etapa.fechaFin)))
          }))
        }
      })
  }

  eliminarEtapa(event: Event, etapa: Etapa, index: number) {

    event.stopPropagation();

    this.sharedService.cambiarEstado(true)

    this.pcsService.eliminarEtapa(etapa.idFase)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.etapas.removeAt(index)
          this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'La etapa ha sido eliminada.' })
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  modificarEtapa(event: Event, etapa: Etapa, etapaIndex: number) {
    event.stopPropagation();

    this.dialogService.open(ModificarEtapaComponent, {
      header: 'Modificar etapa',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      data: {
        numProyecto: this.form.value.numProyecto,
        fechaInicio: this.proyectoFechaInicio,
        fechaFin: this.proyectoFechaFin,
        etapa: etapa
      }
    })
      .onClose.subscribe(async (result) => {
        if (result && result.etapa) {
          const etapaRes = result.etapa
          const meses: Mes[] = obtenerMeses(new Date(etapaRes.fechaIni), new Date(etapaRes.fechaFin));
          this.etapas.at(etapaIndex).patchValue({
            idFase: etapaRes.idFase,
            orden: etapaRes.orden,
            fase: etapaRes.fase,
            fechaIni: etapaRes.fechaIni,
            fechaFin: etapaRes.fechaFin
          });

          this.meses(etapaIndex).clear();

          this.etapaTotales[etapa.idFase] = [];
          meses.forEach(mes => {
            this.etapaTotales[etapaRes.idFase] = this.etapaTotales[etapaRes.idFase] || {};
            this.etapaTotales[etapaRes.idFase][`${mes.mes}_${mes.anio}`] = 0;
            this.meses(etapaIndex).push(this.fb.group(mes))
          });

          // Agreamos las fechas por empleado
          this.empleados(etapaIndex).clear();
          // Agregamos los empleados por cada etapa
          etapa.empleados.forEach((empleado, empleadoIndex) => {
            this.empleados(etapaIndex).push(this.fb.group({
              id: empleado.id,
              idFase: empleado.idFase,
              numempleadoRrHh: empleado.numempleadoRrHh,
              empleado: empleado.empleado,
              fechas: this.fb.array([]),
              aplicaTodosMeses: empleado.aplicaTodosMeses,
              cantidad: empleado.cantidad,
              FEE: empleado.fee,
              Puesto: empleado.Puesto,
              chalias: empleado.chAlias,
              //PrecioVenta: empleado.PrecioVenta,
             // nucosto_ini: empleado.nucosto_ini
            }))

            // Agreamos las fechas por empleado
            empleado.fechas.forEach(fecha => {
              if(this.etapaTotales[etapa.idFase][`${fecha.mes}_${fecha.anio}`] !== undefined) {
                this.etapaTotales[etapa.idFase][`${fecha.mes}_${fecha.anio}`] = (this.etapaTotales[etapa.idFase][`${fecha.mes}_${fecha.anio}`] || 0) + fecha.porcentaje;
                this.fechas(etapaIndex, empleadoIndex).push(this.fb.group({
                  id: fecha.id,
                  mes: fecha.mes,
                  anio: fecha.anio,
                  porcentaje: fecha.porcentaje
                }))
              }
            })
          })
        }
      })
  }

  modificarEmpleado(event: Event, etapa: Etapa, empleado: Empleado | null, etapaIndex: number, empleadoIndex: number | null, FEE: number | null, chalias: string | null) {
    event.stopPropagation();

    this.dialogService.open(ModificarEmpleadoComponent, {
      header: 'Empleado (Porcentajes)',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      data: {
        FEE,
        etapa,
        empleado,
        chalias,
        num_proyecto: this.form.value.numProyecto

      }
    })
      .onClose.subscribe((result) => {
        if (result && result.empleado) {
          const empleadoRespuesta = result.empleado as Empleado
          const fechasRespuesta = empleadoRespuesta.fechas.map(fechaRegistro => this.fb.group({
            id: fechaRegistro.id,
            mes: fechaRegistro.mes,
            anio: fechaRegistro.anio,
            porcentaje: fechaRegistro.porcentaje
          }))
          if (empleado) {

            this.empleados(etapaIndex).at(empleadoIndex).patchValue({
              aplicaTodosMeses: empleadoRespuesta.aplicaTodosMeses,
              cantidad: empleadoRespuesta.cantidad
            })

            this.fechas(etapaIndex, empleadoIndex).clear()

            empleadoRespuesta.fechas.forEach(fechaRegistro => {
              this.fechas(etapaIndex, empleadoIndex).push(this.fb.group({
                id: fechaRegistro.id,
                mes: fechaRegistro.mes,
                anio: fechaRegistro.anio,
                porcentaje: fechaRegistro.porcentaje
              }))
            })
          } else {
            this.empleados(etapaIndex).push(this.fb.group({
              id: empleadoRespuesta.id,
              idFase: empleadoRespuesta.idFase,
              numempleadoRrHh: empleadoRespuesta.numempleadoRrHh,
              empleado: empleadoRespuesta.empleado,
              fechas: this.fb.array(fechasRespuesta),
              aplicaTodosMeses: empleadoRespuesta.aplicaTodosMeses,
              cantidad: empleadoRespuesta.cantidad,
              reembolsable: empleadoRespuesta.reembolsable,
              chalias: empleadoRespuesta.chAlias,
              //nucosto_ini: empleadoRespuesta.nucosto_ini,
             // PrecioVenta: empleadoRespuesta.PrecioVenta
            }))
          }
        }
      })
  }

  eliminarEmpleado(event: Event, etapa: Etapa, empleado: Empleado, etapaIndex: number, empleadoIndex: number) {

    event.stopPropagation()

    this.sharedService.cambiarEstado(true)

    this.pcsService.eliminarEmpleado(empleado.numempleadoRrHh, etapa.idFase)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.empleados(etapaIndex).removeAt(empleadoIndex)
          this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'El empleado ha sido eliminada.' })
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  /**
   * Funciones auxiliares
   */

  obtenerNombreFase(etapa: Etapa) {
    return `${etapa.fase} (${format(new Date(etapa.fechaIni), 'LLL/Y', { locale: es })} - ${format(new Date(etapa.fechaFin), 'LLL/Y', { locale: es })})`
  }

  obtenerFechas(etapa: Etapa) {
    return [format(new Date(etapa.fechaIni), 'Y-m-d'), format(new Date(etapa.fechaFin), 'Y-m-d')]
  }

  originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
    return 0;
  }
}
