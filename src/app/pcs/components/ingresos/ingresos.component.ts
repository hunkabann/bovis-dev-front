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
import { Rubro, GastosIngresosTotales } from '../../models/pcs.model';
import { CatalogosService } from '../../services/catalogos.service';



@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.css'],
  providers: [MessageService, DialogService]
})
export class IngresosComponent implements OnInit {

  fechaInicio: Date;
  fechaFin: Date;

  noFactura: string;

  dialogService = inject(DialogService)
  fb = inject(FormBuilder)
  messageService = inject(MessageService)
  pcsService = inject(PcsService)
  sharedService = inject(SharedService)
  catalogosService = inject(CatalogosService)

  cargando: boolean = true
  proyectoSeleccionado: boolean = false
  mesesProyecto: Mes[] = []


  proyectoFechaInicio: Date
  proyectoFechaFin: Date

  idproyecto: number;

  totalRecords: number = 0;


  IDEmpresa: number;
  IDCliente: number;

  isrembolsable: boolean = false

  rembolsable: string;

  totaless: GastosIngresosTotales[] = []

  SumaIngresos = 0;


  constructor() { }

  form = this.fb.group({
    numProyecto: [0, Validators.required],
    secciones: this.fb.array([]),
    totales: this.fb.array([])
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

  fechasIngreso(seccionIndex: number) {
    return (this.secciones.at(seccionIndex).get('totales') as FormArray)
  }

  get totals() {
    return this.form.get('totales') as FormArray
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
      console.log("Gastos.components Entro al this.idproyecto " + this.idproyecto)

      this.cargando = true
      this.cargarInformacion(this.idproyecto)
      /**for(let i = 0; i < 3; i++) {

        console.log("valor de i -------------- " + i)

        if(i > 1){
          this.isrembolsable  = true
          this.rembolsable = "REMBOLSABLE"
         }else{
          this.isrembolsable  = false
          this.rembolsable = "NO REMBOLSABLE"
         }

         console.log("this.isrembolsable -------------- " + this.isrembolsable +"this.isrembolsable -------------- " + this.rembolsable)


        i++
        }*/
    } else {
      this.pcsService.obtenerIdProyecto()
        .subscribe(numProyecto => {
          this.proyectoSeleccionado = true
          if (numProyecto) {
            // this.sharedService.cambiarEstado(true)
            this.cargando = true
            this.cargarInformacion(numProyecto)
            /**for(let i = 0; i < 3; i++) {

              console.log("valor de i -------------- " + i)

              if(i > 1){
                this.isrembolsable  = true
                this.rembolsable = "REMBOLSABLE"
               }else{
                this.isrembolsable  = false
                this.rembolsable = "NO REMBOLSABLE"
               }

               console.log("this.isrembolsable -------------- " + this.isrembolsable +"this.isrembolsable -------------- " + this.rembolsable)
              i++
              }*/
          } else {
            console.log('No hay proyecto');
          }
        })
    }


  }

  async cargarInformacion(numProyecto: number) {
    this.pcsService.obtenerGastosIngresosSecciones(numProyecto, 'ingreso')
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: async ({ data }) => {
          this.totaless = data.totales

          data.totales.forEach(total => {
            console.log('total.reembolsable: ' + total.reembolsable)
            console.log('total.mes: ' + total.mes)
            console.log('total.anio: ' + total.anio)
            console.log('total.totalPorcentaje: ' + total.totalPorcentaje)

            this.SumaIngresos += +total.totalPorcentaje


            /**  this.fechasIngreso(totalIndex).push(this.fb.group({
              reembolsable:  [total.reembolsable],
              mes:     [total.mes],
              anio:    [total.anio],
              totalPorcentaje:    [total.totalPorcentaje]
            }))*/

          })

          this.proyectoFechaInicio = new Date(data.fechaIni)
          this.proyectoFechaFin = new Date(data.fechaFin)
          this.mesesProyecto = await obtenerMeses(this.proyectoFechaInicio, this.proyectoFechaFin)

          data.secciones.forEach((seccion, seccionIndex) => {

            this.secciones.push(this.fb.group({
              idSeccion: [seccion.idSeccion],
              codigo: [seccion.codigo],
              seccion: [seccion.seccion],
              rubros: this.fb.array([])
            }))

            seccion.rubros.forEach((rubro, rubroIndex) => {

              // Agregamos los rubros por seccion
              this.rubros(seccionIndex).push(this.fb.group({
                ...rubro,
                fechas: this.fb.array([])
              }))

              // Agreamos las fechas por rubro
              rubro.fechas.forEach(fecha => {

                this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
                  id: fecha.id,
                  mes: fecha.mes,
                  anio: fecha.anio,
                  porcentaje: fecha.porcentaje
                }))
              })
            })

            seccion.rubros.forEach((norubro, norubroIndex) => {

              // Agregamos los rubros por seccion
              this.rubros(seccionIndex).push(this.fb.group({
                ...norubro,
                fechas: this.fb.array([])
              }))

              // Agreamos las fechas por rubro
              norubro.fechas.forEach(fecha => {

                this.fechas(seccionIndex, norubroIndex).push(this.fb.group({
                  id: fecha.id,
                  mes: fecha.mes,
                  anio: fecha.anio,
                  porcentaje: fecha.porcentaje
                }))
              })

            })

          })








        }


        ,
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })





  }


  modificarRubro(rubro: Rubro, seccionIndex: number, rubroIndex: number) {

    this.dialogService.open(ModificarRubroComponent, {
      header: rubro.rubro,
      width: '50%',
      contentStyle: { overflow: 'auto' },
      data: {
        rubro,
        fechaInicio: this.proyectoFechaInicio,
        fechaFin: this.proyectoFechaFin
      }
    })
      .onClose.subscribe((result) => {

        if (result && result.rubro) {

          const rubroRespuesta = result.rubro as Rubro

          this.rubros(seccionIndex).at(rubroIndex).patchValue({
            unidad: rubroRespuesta.unidad,
            cantidad: rubroRespuesta.cantidad,
            reembolsable: rubroRespuesta.reembolsable,
            aplicaTodosMeses: rubroRespuesta.aplicaTodosMeses
          })

          this.fechas(seccionIndex, rubroIndex).clear()

          rubroRespuesta.fechas.forEach(fechaRegistro => {
            this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
              id: fechaRegistro.id,
              mes: fechaRegistro.mes,
              anio: fechaRegistro.anio,
              porcentaje: fechaRegistro.porcentaje
            }))
          })
        }
      })
  }

  /**getFiltrosVaues() {
    let objBusqueda: Busqueda = new Busqueda();



    console.log('factura this.idproyecto   ----- '+ this.idproyecto)
    //objBusqueda.idProyecto = this.idproyecto;
    objBusqueda.idProyecto = 229;


    // switch (this.opcionFiltro) {
    //   case 1:
    //     objBusqueda.idProyecto = this.IDProyecto;
    //     break;
    //   case 2:
    //     objBusqueda.idEmpresa = this.IDEmpresa;
    //     break;
    //   case 3:
    //     objBusqueda.idCliente = this.IDCliente;
    //     break;
    // }


    return objBusqueda;
  }*/

}
