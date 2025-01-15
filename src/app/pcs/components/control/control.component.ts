import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PcsService } from '../../services/pcs.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { formatearInformacionControl, obtenerMeses } from 'src/helpers/helpers';
import { DialogService } from 'primeng/dynamicdialog';
import { ModificarRubroComponent } from '../modificar-rubro/modificar-rubro.component';
import { seccionesPCSControl, SUBJECTS, TITLES } from 'src/utils/constants';
import { Mes } from 'src/models/general.model';
import { finalize } from 'rxjs';
import { Rubro, GastosIngresosTotales, GastosIngresosControlData, SumaFecha, Previsto, SumaFechas, SeccionOpcion, SeccionRespuesta, SeccionFormateada } from '../../models/pcs.model';
import { CatalogosService } from '../../services/catalogos.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css'],
  providers: [MessageService, DialogService]
})
export class ControlComponent implements OnInit {

  Control: GastosIngresosControlData

  Previsto: Previsto

  fechaInicio: Date;
  fechaFin: Date;

  SumaFecha: SumaFechas[] = []
  SumaFechaRealSalarios: SumaFechas[] = []
  SumaFechaViaticos: SumaFechas[] = []
  SumaFechaGastos: SumaFechas[] = []

  frutas: string[]

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
  SumaIngresosReal = 0;
  SumaIngresosViaticos = 0;
  SumaIngresosGasto = 0;

  seccionesOpciones: SeccionOpcion[] = [...seccionesPCSControl];
  seccionesCargado: boolean[] = [];
  seccionesData: any[] = [];

  constructor() { }

  form = this.fb.group({
    numProyecto: [0, Validators.required],
    secciones: this.fb.array([]),
    totales: this.fb.array([]),
    sumaFechas: this.fb.array([])
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



  get fechasControlSalarios() {
    return this.form.get('sumaFechas') as FormArray
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
      this.cargarInformacionIngreso(this.idproyecto)
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
            this.cargarInformacionIngreso(numProyecto)
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

  async cargarInformacionSeccion(event: any) {
    const { index } = event;
    this.pcsService.obtenerInformacionSeccion(this.idproyecto, this.seccionesOpciones[index].slug)
      .pipe(finalize(() => this.seccionesCargado[index] = true))
      .subscribe({
        next: async (result) => {
          const { data } = result as SeccionRespuesta;
          if (data?.hasChildren) {
            let subSecciones: SeccionFormateada[] = [];
            data?.subsecciones?.map(async subSeccion => {
              let subSeccionData = await formatearInformacionControl(subSeccion);
              subSecciones.push(subSeccionData);
            });
            this.seccionesData[index] = {
              hasChildren: true,
              subSecciones
            };
          } else {
            this.seccionesData[index] = await formatearInformacionControl(data);
          }
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      });
  }

  cargarInformacionIngreso(numProyecto: number) {

    this.pcsService.obtenerGastosIngresosSecciones(numProyecto, 'gastos')
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: ({ data }) => {
          this.proyectoFechaInicio = new Date(data.fechaIni)
          this.proyectoFechaFin = new Date(data.fechaFin)

          console.log('this.proyectoFechaInicio: ' + this.proyectoFechaInicio)
          console.log('this.proyectoFechaFin: ' + this.proyectoFechaFin)
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })

  }

  async cargarInformacion(numProyecto: number) {
    this.pcsService.obtenerGastosControlSalarios(numProyecto, 'Control')
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: async ({ data }) => {

          console.log('data.salarios: ' + data.salarios)
          console.log('data.salarios.previsto: ' + data.salarios.previsto)
          console.log('data.salarios.previsto.subTotal: ' + data.salarios.previsto.subTotal)
          console.log('data.salarios suma fecha: ' + data.salarios.previsto.sumaFechas)

          // data.salarios.previsto.sumaFechas.forEach((sumaFecha) => {

          //  console.log('sumaFecha.mes  =>  ' + sumaFecha.mes)
          //   console.log('sumaFecha.anio  =>  ' + sumaFecha.anio)
          //   console.log('sumaFecha.sumaPorcentaje  =>  ' + sumaFecha.sumaPorcentaje)

          //  })

          console.log('this.proyectoFechaInicio: ' + this.proyectoFechaInicio)
          console.log('this.proyectoFechaFin: ' + this.proyectoFechaFin)

          this.mesesProyecto = await obtenerMeses(this.proyectoFechaInicio, this.proyectoFechaFin)

          this.SumaFecha = data.salarios.previsto.sumaFechas
          this.SumaFechaRealSalarios = data.salarios.real.sumaFechas


          this.Previsto = data.salarios.previsto
          //this.SumaFechaViaticos = data.viaticos.previsto.sumaFechas

          this.SumaFechaViaticos = data.viaticos.real.sumaFechas

          // Remove the duplicate items
          const uniqueByRubroAnio = [...new Map(this.SumaFechaViaticos.map(item => [`${item.rubro}`, item])).values()];
          this.SumaFechaViaticos = uniqueByRubroAnio;


          let frutasverdes = ["Previsto", "Real"];

          this.frutas = frutasverdes



          this.SumaIngresos = data.salarios.previsto.subTotal
          this.SumaIngresosReal = data.salarios.real.subTotal
          this.SumaIngresosViaticos = data.viaticos.previsto.subTotal

          data.gastos.previstos.forEach((sumaFecha) => {

            console.log('this.SumaFechaSalarios  =>  ' + this.SumaFecha.length)

            this.SumaIngresosGasto = sumaFecha.subTotal

            this.SumaFechaGastos = sumaFecha.sumaFechas

            const uniqueByGastosRubroAnio = [...new Map(this.SumaFechaGastos.map(item => [`${item.rubro}`, item])).values()];
            this.SumaFechaGastos = uniqueByGastosRubroAnio;



          })

          data.salarios.previsto.sumaFechas.forEach((seccion) => {

            this.fechasControlSalarios.push(this.fb.group({
              rubro: [seccion.rubro],
              mes: [seccion.mes],
              anio: [seccion.anio],
              sumaPorcentaje: [seccion.sumaPorcentaje]
            }))

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
