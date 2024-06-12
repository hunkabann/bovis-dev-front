import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PcsService } from '../../services/pcs.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { obtenerMeses,obtenerMesesTrans } from 'src/helpers/helpers';
import { DialogService } from 'primeng/dynamicdialog';
import { ModificarRubroComponent } from '../modificar-rubro/modificar-rubro.component';
import { TITLES } from 'src/utils/constants';
import { Mes } from 'src/models/general.model';
import { finalize } from 'rxjs';
import { Rubro,EtapasPorProyectoData,SumaFecha } from '../../models/pcs.model';
import { CatalogosService } from '../../services/catalogos.service';
import { CostosService } from 'src/app/costos/services/costos.service';
import { Injectable } from '@angular/core';

 


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
  catalogosService = inject(CatalogosService)
  costosService   = inject(CostosService)
  

  cargando:             boolean = true
  proyectoSeleccionado: boolean = false
  mesesProyecto:        Mes[] = []
  
  proyectoFechaInicio:  Date
  proyectoFechaFin:     Date
  numProyectorubro:    number
  
  idproyecto: number;

  costoMensualEmpleado: number;

  sumacolumna: number

  total: number
  cantidad: number

  mensajito: string;

  cantidadMesesTranscurridos:        number

  sumaTotales:        SumaFecha[] = []

   //private spinner: NgxSpinnerService

  constructor() { } 
  
  form = this.fb.group({
    numProyecto:  [0, Validators.required],
    secciones:    this.fb.array([]),
    etapas:    this.fb.array([])
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

  sumafechas(seccionIndex: number) {
    return (this.secciones.at(seccionIndex).get('sumaFechas') as FormArray)
  }

  ngOnInit(): void {
        
    this.pcsService.cambiarEstadoBotonNuevo(false)

    this.catalogosService.obtenerParametros()
      .subscribe(params => {

        if (!params.proyecto) {

         // console.log("params.proyecto:" + params.proyecto)
        }else{
          this.idproyecto = params.proyecto
          //console.log("else params.proyecto:" + params.proyecto)
        }
      })

      if (this.idproyecto){
        //console.log("Gastos.components Entro al this.idproyecto " + this.idproyecto)
        this.cargando = true
        this.numProyectorubro = this.idproyecto
          this.cargarInformacion(this.idproyecto)
      } else {
        this.pcsService.obtenerIdProyecto()
      .subscribe(numProyecto => {
        this.proyectoSeleccionado = true
        if(numProyecto) {
          // this.sharedService.cambiarEstado(true)
          this.cargando = true
          this.numProyectorubro = numProyecto
          this.cargarInformacion(numProyecto)
        } else {
          console.log('No hay proyecto');
        }
      })
      }

     
  }

  cargarInformacion(numProyecto: number) {
    this.pcsService.obtenerGastosIngresosSecciones(numProyecto)
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: ({data}) => {

          
          this.proyectoFechaInicio  = new Date(data.fechaIni)
          this.proyectoFechaFin     = new Date(data.fechaFin)
          


          data.secciones.forEach((seccion, seccionIndex) => {
            
            this.secciones.push(this.fb.group({
              idSeccion:  [seccion.idSeccion],
              codigo:     [seccion.codigo],
              seccion:    [seccion.seccion],
              rubros:     this.fb.array([]),
              sumaFechas:     this.fb.array([])
            }))

            
            
          seccion.rubros.forEach((rubro, rubroIndex) => {

              // Agregamos los rubros por seccion
              this.rubros(seccionIndex).push(this.fb.group({
                ...rubro,
                fechas:   this.fb.array([])
              }))
              
              if(seccion.seccion.includes('COSTOS DIRECTOS DE SALARIOS')){

                this.costosService.getCostoID(rubro.numEmpleadoRrHh)
                .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                .subscribe({
                  next: ({data,message}) => {
        
                    const [costoR] = data
                   

                    if(message != null  ){
              
                      this.mensajito = message;
      
                    if(this.mensajito.includes('No se encontraron registros de costos para el empleado') ){

                     // console.log('message ' + message)
                     // console.log('es 0 ' + 0)
      
                      this.costoMensualEmpleado =  0
                     /* this.total = rubro.fechas.reduce(
                        (acc, obj) => acc + (obj.porcentaje *this.costoMensualEmpleado)/100,
                        0
                      );
                      console.log('Total: ', this.total);
                  
                      //Calculamos el TOTAL
                      this.cantidad = rubro.fechas.reduce(
                        (add, obej) => add  +obej.porcentaje,
                        0
                      );
                      console.log('cantidad: ', this.cantidad);*/
                      this.sumaTotales = seccion.sumaFechas
      

                      const dato = this.sumaTotales;
                         dato?.forEach(paso=>{
                             console.log("paso.beneficio --------------> " +paso.sumaPorcentaje);
                             //console.log("paso.cost-------------->> " +paso.costo);
                
                             //this.Costomenualproy += +paso.costo
                
                             //console.log("suma paso.cost-------------->> " +this.Costomenualproy);
                            
                         })

/*
                        seccion.sumaFechas.forEach((sumaFecha) => {

                        //console.log('sumaFecha.sumaPorcentaje  =>  ' + sumaFecha.sumaPorcentaje)
                      
                        this.sumafechas(seccionIndex).push(this.fb.group({
                          mes:        sumaFecha.mes,
                          anio:       sumaFecha.anio,
                          sumaFecha:  sumaFecha.sumaPorcentaje
                        }))
                      })*/
          

                      // Agreamos las fechas por rubro
                        rubro.fechas.forEach(fecha => {
          
          
                         // console.log('fecha.porcentaje ------< ' + fecha.porcentaje  )
                         // console.log('this.costoMensualEmpleado ------< ' +this.costoMensualEmpleado )
                          //console.log('formula cuando es el porcentaje ------< ' + (fecha.porcentaje *this.costoMensualEmpleado)/100 )

                          //const total = rubro.fechas.map(({porcentaje}) => porcentaje).reduce((acc, value) => acc + +value, 0);

                          rubro.fechas.forEach(fecha => {
                            this.sumacolumna += +fecha.porcentaje
                          })

                          
          this.mesesProyecto        = obtenerMeses(this.proyectoFechaInicio, this.proyectoFechaFin)

                         //console.log('const total1 ------< ' + total)
                         
          
                          this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
                            id:         fecha.id,
                            mes:        fecha.mes,
                            anio:       fecha.anio,
                            porcentaje: (fecha.porcentaje *this.costoMensualEmpleado)/100
                            //porcentaje: fecha.porcentaje
                          }))
                        })
                       
      
                    }else{

                      //console.log('message ' + message)
                      //console.log('data.map(empleado => costoR.idCosto ) ' + data.map(empleado => costoR.idCosto))
                      //console.log('array 0 data.map(empleado => costoR.costoMensualEmpleado ) ' +  data.map(empleado => costoR.costoMensualEmpleado )[0])
      
                      this.costoMensualEmpleado =  data.map(empleado => costoR.costoMensualEmpleado )[0]

                      //this.sumaTotales = seccion.sumaFechas
      

                      const dato = this.sumaTotales;
                         dato?.forEach(paso=>{
                             //console.log("paso.beneficio --------------> " +paso.sumaPorcentaje);
                             //console.log("paso.cost-------------->> " +paso.costo);
                
                             //this.Costomenualproy += +paso.costo
                
                             //console.log("suma paso.cost-------------->> " +this.Costomenualproy);
                            
                         })


                        seccion.sumaFechas.forEach((sumaFecha) => {

                        //console.log('sumaFecha.sumaPorcentaje  =>  ' + sumaFecha.sumaPorcentaje)
                      
                        this.sumafechas(seccionIndex).push(this.fb.group({
                          mes:        sumaFecha.mes,
                          anio:       sumaFecha.anio,
                          sumaFecha:  sumaFecha.sumaPorcentaje
                        }))
                      })
                     
                         /* this.total = rubro.fechas.reduce(
                            (acc, obj) => acc + (obj.porcentaje *this.costoMensualEmpleado)/100,
                            0
                          );
                          console.log('Total: ', this.total);
                      
                          //Calculamos el TOTAL
                          this.cantidad = rubro.fechas.reduce(
                            (add, obej) => add  +obej.porcentaje,
                            0
                          );
                          console.log('cantidad: ', this.cantidad);*/

                          rubro.fechas.forEach(fecha => {
                            this.sumacolumna += +fecha.porcentaje
                          })

                      // Agreamos las fechas por rubro
                        rubro.fechas.forEach(fecha => {
          
          
                         //console.log('fecha.porcentaje ------< ' + fecha.porcentaje  )
                          //console.log('this.costoMensualEmpleado ------< ' +this.costoMensualEmpleado )
                          //console.log('formula cuando es el porcentaje ------< ' + (fecha.porcentaje *this.costoMensualEmpleado)/100 )

                          //this.sumacolumna = +(fecha.porcentaje *this.costoMensualEmpleado)/100

                          //console.log('this.sumacolumna ------< ' + this.sumacolumna)

                          //const total = rubro.fechas.map(({porcentaje}) => porcentaje).reduce((acc, value) => acc + +value, 0);

                          
          
                          this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
                            id:         fecha.id,
                            mes:        fecha.mes,
                            anio:       fecha.anio,
                            porcentaje: (fecha.porcentaje *this.costoMensualEmpleado)/100
                            //porcentaje: fecha.porcentaje
                          }))
                        })

                        
      
                    }
                  }

                    
        
                  },
                  error: (err) => {
                    //console.log("error cuando no Existe registro de costos --------------> " +err.error.text);
                    //this.costoMensualEmpleado = 0
                    //this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

                  }
                  
                })

                //console.log('hace las operaciones por que entro al 2 ' )

                 

              }else{

                //this.sumaTotales = seccion.sumaFechas
      

                      const dato = this.sumaTotales;
                         dato?.forEach(paso=>{
                             //console.log("paso.beneficio --------------> " +paso.sumaPorcentaje);
                             //console.log("paso.cost-------------->> " +paso.costo);
                
                             //this.Costomenualproy += +paso.costo
                
                             //console.log("suma paso.cost-------------->> " +this.Costomenualproy);
                            
                         })


                        seccion.sumaFechas.forEach((sumaFecha) => {

                        //console.log('sumaFecha.sumaPorcentaje  =>  ' + sumaFecha.sumaPorcentaje)
                      
                        this.sumafechas(seccionIndex).push(this.fb.group({
                          mes:        sumaFecha.mes,
                          anio:       sumaFecha.anio,
                          sumaFecha:  sumaFecha.sumaPorcentaje
                        }))
                      })
    

                //console.log('No hace operaciones por que es diferente de 2' )
                /*this.total = rubro.fechas.reduce(
                  (acc, obj) => acc + (obj.porcentaje *this.costoMensualEmpleado)/100,
                  0
                );
                console.log('Total: ', this.total);
            
                //Calculamos el TOTAL
                this.cantidad = rubro.fechas.reduce(
                  (add, obej) => add  +obej.porcentaje,
                  0
                );
                console.log('cantidad: ', this.cantidad);
*/
                rubro.fechas.forEach(fecha => {
                  this.sumacolumna += +fecha.porcentaje
                })
                         

                 // Agreamos las fechas por rubro
              rubro.fechas.forEach(fecha => {
                //this.sumacolumna  =0

                //this.sumacolumna += +fecha.porcentaje

                

                this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
                  id:         fecha.id,
                  mes:        fecha.mes,
                  anio:       fecha.anio,
                  porcentaje: fecha.porcentaje
                }))
              })

             // const total = rubro.fechas.map(({porcentaje}) => porcentaje).reduce((acc, value) => acc + +value, 0);

              //console.log('this.sumacolumna 3 ------< ' + total)
              
              

              }
             
            })
            
          })
        
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })


      this.catalogosService.obtenerParametros()
      .subscribe(params => {

        if (!params.proyecto) {

          //console.log("params.proyecto:" + params.proyecto)
        }else{
          this.idproyecto = params.proyecto
         // console.log("else params.proyecto:" + params.proyecto)
        }
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
        fechaFin:     this.proyectoFechaFin,
        numProyecto:  this.numProyectorubro
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

  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

  padTwoDigits(num: number) {
    return num.toString().padStart(2, "0");
  }

}
