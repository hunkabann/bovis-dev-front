import { Component, OnInit, inject } from '@angular/core';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PcsService } from '../../services/pcs.service';
import { FormArray, FormBuilder } from '@angular/forms';
import { Empleado, Etapa, Fecha } from '../../models/pcs.model';
import { addMonths, differenceInCalendarMonths, differenceInMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';
import { finalize } from 'rxjs';
import { Mes, Opcion } from 'src/models/general.model';
import { Empleado as EmpleadoTS } from 'src/app/timesheet/models/timesheet.model';
import { TITLES, errorsArray } from 'src/utils/constants';
import { obtenerMeses } from 'src/helpers/helpers';
import { CostosService } from 'src/app/costos/services/costos.service';

interface EtapaEmpleado {
  etapa:              Etapa,
  empleado:           Empleado,
  num_proyecto:       number,
  aplicaTodosMeses:   boolean,
  cantidad:           number
}

@Component({
  selector: 'app-modificar-empleado',
  templateUrl: './modificar-empleado.component.html',
  styleUrls: ['./modificar-empleado.component.css'],
  providers: [MessageService]
})
export class ModificarEmpleadoComponent implements OnInit {

  ref               = inject(DynamicDialogRef)
  config            = inject(DynamicDialogConfig)
  primeConfig       = inject(PrimeNGConfig)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  pcsService        = inject(PcsService)
  fb                = inject(FormBuilder)
  timesheetService  = inject(TimesheetService)
  costosService   = inject(CostosService)

  fechaMinima:        Date
  fechaMaxima:        Date
  empleadosOriginal:  EmpleadoTS[] = []
  empleados:          Opcion[] = []
  empleado:           Empleado = null

  mensajito: string;

  form = this.fb.group({
    id_fase:          [null],
    num_empleado:     [null],
    num_proyecto:     [null],
    aplicaTodosMeses: [false],
    ModificaSueldo:   [false],
    cantidad:         [0],
    FEE:              [0],
    fechas:           this.fb.array([])
  })

  constructor() { }
  
  get fechas() {
    return this.form.get('fechas') as FormArray
  }

  ngOnInit(): void {

    this.form.controls['FEE'].disable(); 

    const data = this.config.data as EtapaEmpleado
    if(data) {
      this.form.patchValue({
        id_fase:          data.etapa.idFase,
        num_empleado:     data.empleado?.numempleadoRrHh || null,
        num_proyecto:     data.num_proyecto || null,
        aplicaTodosMeses: data.empleado?.aplicaTodosMeses,
        cantidad:         data.empleado?.cantidad
      })

      if(!data.empleado) {
        this.cargarEmpleados()
      } else {
        this.empleado = data.empleado
      

        this.costosService.getCostoID(data.empleado?.numempleadoRrHh)
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: ({data,message}) => {

            const [costoR] = data
            console.log('message ' + message)
            console.log('data.map(empleado => costoR.costoMensualEmpleado ) ' + data.map(empleado => costoR.idCosto))
            console.log(' this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado )) ' +  this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado )))

            if(message != null  ){
            
              this.mensajito = message;

            if(this.mensajito.includes('No se encontraron registros de costos para el empleado:') ){

              this.form.patchValue({
                FEE:                          this.formateaValor(0.0),
                
              })

            }else{

              this.form.patchValue({
                FEE:                          this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado )),
                
              })

            }
          }

            
            
            
          
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        })
      }

      const fechaInicio     = new Date(data.etapa.fechaIni)
      const fechaFin        = new Date(data.etapa.fechaFin)

      obtenerMeses(fechaInicio, fechaFin).forEach(mesRegistro => {

        this.fechas.push(this.fb.group({
          mes:        [mesRegistro.mes],
          anio:       [mesRegistro.anio],
          desc:       [mesRegistro.desc],
          porcentaje: [this.empleado ? this.obtenerPorcentaje(data.empleado.fechas, mesRegistro) : 0]
        }))
      })
    }
  }

  guardar() {
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    this.pcsService.modificarEmpleado(this.form.value, !!this.empleado)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          if(!this.empleado) {
            const empleadoEncontrado = this.empleadosOriginal.find(empleadoRegistro => empleadoRegistro.nunum_empleado_rr_hh == this.form.value.num_empleado)
            this.empleado = {
              id:                 null,
              empleado:           empleadoEncontrado.nombre_persona,
              numempleadoRrHh:    empleadoEncontrado.nunum_empleado_rr_hh.toString(),
              idFase:             this.form.value.id_fase,
              fechas:             [],
              aplicaTodosMeses:   this.form.value.aplicaTodosMeses,
              cantidad:           this.form.value.cantidad
            }
          }
          const empleadoRespuesta: Empleado = {
            ...this.empleado,
            aplicaTodosMeses:   this.form.value.aplicaTodosMeses,
            cantidad:           this.form.value.cantidad,
            fechas:             this.form.value.fechas as Fecha[]
          } 
          this.messageService.add({severity: 'success', summary: TITLES.success, detail: 'La etapa ha sido agregada.'})
          this.ref.close({empleado: empleadoRespuesta})
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  cargarEmpleados() {
        
    this.sharedService.cambiarEstado(true)

    this.timesheetService.getEmpleados()
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: ({data}) => {
        this.empleadosOriginal = data
        this.empleados = this.empleadosOriginal.map(empleado => ({code: empleado.nunum_empleado_rr_hh.toString(), name: empleado.nombre_persona}))
      },
      error: (err) => this.closeDialog()
    })
  }

  cambiarValores() {
    this.fechas.controls.forEach((fecha, index) => {
      this.fechas.at(index).patchValue({
        porcentaje: this.form.value.aplicaTodosMeses ? this.form.value.cantidad : 0
      })
    })
  }

  cambiarValoresSueldos() {
    if(this.form.value.ModificaSueldo){
      this.form.controls['FEE'].enable()
    }else{
      this.form.controls['FEE'].reset()
      this.form.controls['FEE'].disable()
      
    }

    
    /*this.fechas.controls.forEach((fecha, index) => {
      this.fechas.at(index).patchValue({
        porcentaje: this.form.value.ModificaSueldo ? this.form.value.FEE : 0
      })
    })*/
  }

  CargaSueldoCostos(event: any){

    console.log('event.value ' + event.value )
    console.log('event ' + event )
    console.log('+event. ' + +event )

    this.costosService.getCostoID(event)
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: ({data,message}) => {

              const [costoR] = data
              console.log('message ' + message)
              console.log('data.map(empleado => costoR.costoMensualEmpleado ) ' + data.map(empleado => costoR.idCosto))
              console.log(' this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado )) ' +  this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado )))

              if(message != null  ){
              
                this.mensajito = message;

              if(this.mensajito.includes('No se encontraron registros de costos para el empleado:') ){

                this.form.patchValue({
                  FEE:                          this.formateaValor(0.0),
                  
                })

              }else{

                this.form.patchValue({
                  FEE:                          this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado )),
                  
                })

              }
            }

              
              
              
            
            },
            error: (err) => {
              console.log("error cuando no Existe registro de costos --------------> " +err.error.text);
              this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      
              
            }
          })

  

  }

  obtenerPorcentaje(fechas: Fecha[], mesRegistro: Mes) {
    const mes = fechas.find(info => info.mes == mesRegistro.mes)

    if(mes && mes.porcentaje > 0) {
      return +mes.porcentaje
    }

    return 0
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
  
  closeDialog() {
    this.ref.close(null)
  }

  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

}
