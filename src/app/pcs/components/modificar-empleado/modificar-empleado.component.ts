import { Component, OnInit, inject } from '@angular/core';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PcsService } from '../../services/pcs.service';
import { FormArray, FormBuilder } from '@angular/forms';
import { Empleado, Etapa, Fecha, puesto } from '../../models/pcs.model';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';
import { finalize } from 'rxjs';
import { Mes, Opcion } from 'src/models/general.model';
import { Empleado as EmpleadoTS } from 'src/app/timesheet/models/timesheet.model';
import { TITLES, errorsArray } from 'src/utils/constants';
import { obtenerMeses } from 'src/helpers/helpers';
import { CostosService } from 'src/app/costos/services/costos.service';

interface EtapaEmpleado {
  etapa: Etapa,
  empleado: Empleado,
  num_proyecto: number,
  aplicaTodosMeses: boolean,
  cantidad: number,
  FEE: number,
  reembolsable: boolean,
  chalias: string
  //PrecioVenta: number,
  //nucosto_ini: number,
}

interface ICatalogo {
  name: string;
  value: string;
}

@Component({
  selector: 'app-modificar-empleado',
  templateUrl: './modificar-empleado.component.html',
  styleUrls: ['./modificar-empleado.component.css'],
  providers: [MessageService]
})
export class ModificarEmpleadoComponent implements OnInit {

  ref = inject(DynamicDialogRef)
  config = inject(DynamicDialogConfig)
  primeConfig = inject(PrimeNGConfig)
  messageService = inject(MessageService)
  sharedService = inject(SharedService)
  pcsService = inject(PcsService)
  fb = inject(FormBuilder)
  timesheetService = inject(TimesheetService)
  costosService = inject(CostosService)

  fechaMinima: Date
  fechaMaxima: Date
  empleadosOriginal: EmpleadoTS[] = []
  empleados: Opcion[] = []
  empleado: Empleado = null
  FEEStaaafing: number
  catPuesto: Opcion[] = []
  Puesto: puesto[] = []
  PreciodeVenta: number;

  cargandoCosto: boolean = false;

  //TipoEmpleado:  EmpleadoTS[] = []

  mensajito: string;

  form = this.fb.group({
    id_fase: [null],
    num_empleado: [null],
    num_proyecto: [null],
    aplicaTodosMeses: [false],
    ModificaSueldo: [false],
    cantidad: [0],
    FEE: [0],
    fechas: this.fb.array([]),
    puesto: [null],
    reembolsable: [false],
    PrecioVenta: [0],
    nucosto_ini: [0],
    chalias: [null]
  })

  constructor() { }

  get fechas() {
    return this.form.get('fechas') as FormArray
  }

  async ngOnInit(): Promise<void> {

    // this.form.controls['FEE'].disable();

    this.form.controls['PrecioVenta'].disable();

    const data = this.config.data as EtapaEmpleado
    if (data) {

          /**console.log('valor Fee ------- ' + data.empleado.fee + '------ fase empleados Fee ------- ' + data.etapa.empleados[0].fee )
          console.log('valor Fee2 ------- ' +  data.empleado.fee+' valor directo de Fee2 ------- ' + data.FEE )
          console.log(Object.values(data.etapa.empleados));

          console.log("Planet Name :- " + data.FEE);

          for (const item of data.etapa.empleados) {
            this.FEEStaaafing = item.fee;
          console.log('this.FEEStaaafing ----------- ' + this.FEEStaaafing);
        }

          data.etapa.empleados.forEach(empleado => {

            console.log('valor Fee empleados etapa ------- ' + empleado.fee  )
              

            
          })

          let i = 0
          for (i = 0; i < data.etapa.empleados.length; i++) {
            console.log(data.etapa.empleados[i]);
          } 
    */

          //console.log('PrecioVenta ------- ' +  data.empleado.PrecioVenta )
          console.log('valor de alias ------- ' +  data.chalias )
          console.log('valor de alias ------- ' +  data.empleado?.chAlias )

      this.form.patchValue({
        id_fase: data.etapa.idFase,
        num_empleado: data.empleado?.numempleadoRrHh || null,
        num_proyecto: data.num_proyecto || null,
        aplicaTodosMeses: data.empleado?.aplicaTodosMeses,
        cantidad: data.empleado?.cantidad,
        puesto: data.empleado?.Puesto,
        reembolsable: data.empleado?.reembolsable,
        //nucosto_ini: data.empleado?.nucosto_ini,
        chalias: data.chalias,
        //PrecioVenta: data.empleado?.PrecioVenta
        
      })

      if (!data.empleado) {
        this.cargarEmpleados(),
          this.cargarTipoEmpleados()
      } else {

        this.form.controls['puesto'].disable();

        this.empleado = data.empleado


        // console.log('data.empleado.fee ------- ' + data.empleado.fee + ' ------------ data.empleado.fee ------- ' + data.empleado?.fee )

        if (data.FEE != null) {

          this.form.patchValue({
            FEE: this.formateaValor(data.FEE),
            PrecioVenta: this.formateaValor(data.FEE),
          })

        } else {
          this.cargandoCosto = true;
          this.costosService.getCostoID(data.empleado?.numempleadoRrHh)
            .pipe(finalize(() => {
              this.sharedService.cambiarEstado(false);
              this.cargandoCosto = false;
            }))
            .subscribe({
              next: ({ data, message }) => {

                const [costoR] = data
                console.log('message ' + message)
                console.log('data.map(empleado => costoR.costoMensualEmpleado ) ' + data.map(empleado => costoR.idCosto))
                console.log(' this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado )) ' + this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado)))

                

                if (message != null) {

                  this.mensajito = message;

                  if (this.mensajito.includes('No se encontraron registros de costos para el empleado:')) {
                    
                    this.PreciodeVenta = 0
                    this.form.patchValue({
                      FEE: this.formateaValor(0.0),
                      PrecioVenta: this.formateaValor(0.0),
                    })

                  } else {

                    this.PreciodeVenta = this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado))
                    this.form.patchValue({
                      FEE: this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado)),
                      PrecioVenta: this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado)),
                      
                nucosto_ini: this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado)),
                    })

                  }
                }
              },
              error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
            })

        }

        this.cargandoCosto = true;
        this.costosService.getCostoID(data.empleado?.numempleadoRrHh)
            .pipe(finalize(() => {
              this.sharedService.cambiarEstado(false);
              this.cargandoCosto = false;
            }))
            .subscribe({
              next: ({ data, message }) => {

                const [costoR] = data
                console.log('message ' + message)
                console.log('data.map(empleado => costoR.costoMensualEmpleado ) ' + data.map(empleado => costoR.idCosto))
                console.log(' this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado )) ' + this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado)))
                

                if (message != null) {

                  this.mensajito = message;

                  if (this.mensajito.includes('No se encontraron registros de costos para el empleado:')) {
                    this.PreciodeVenta = 0
                    this.form.patchValue({
                     // FEE: this.formateaValor(0.0),
                      PrecioVenta: this.formateaValor(0.0),
                    })

                  } else {
                    this.PreciodeVenta = this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado))

                    this.form.patchValue({
                     // FEE: this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado)),
                      PrecioVenta: this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado)),
                      
                nucosto_ini: this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado)),
                    })

                  }
                }
              },
              error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
            })
      }

      const fechaInicio = new Date(data.etapa.fechaIni)
      const fechaFin = new Date(data.etapa.fechaFin)

      let meses = await obtenerMeses(fechaInicio, fechaFin);
      const diaActual = format(new Date(), 'dd', { locale: es });

      meses.forEach(mesRegistro => {
        let registroDeshabilitado = false;
        if(mesRegistro.mes && mesRegistro.anio) {
          const fechaRegistro = `${diaActual}/${mesRegistro.mes}/${mesRegistro.anio}`;
          let fechaRegistroFormateada = parse(fechaRegistro, 'dd/MM/yyyy', new Date());
          registroDeshabilitado = fechaRegistroFormateada.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
        }
        this.fechas.push(this.fb.group({
          mes: [mesRegistro.mes],
          anio: [mesRegistro.anio],
          desc: [mesRegistro.desc],
          porcentaje: [this.empleado ? this.obtenerPorcentaje(data.empleado.fechas, mesRegistro) : 0],
          disabled: [registroDeshabilitado]
        }))
      })
    }
  }

  guardar() {
    if (!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)


    console.log('valor de precio de venta3: '+ this.PreciodeVenta)

    

    this.pcsService.modificarEmpleado(this.form.value, !!this.empleado)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({ data }) => {
          if (!this.empleado) {
            const empleadoEncontrado = this.empleadosOriginal.find(empleadoRegistro => empleadoRegistro.nunum_empleado_rr_hh == this.form.value.num_empleado)
            this.empleado = {
              id: null,
              empleado: empleadoEncontrado.nombre_persona,
              numempleadoRrHh: empleadoEncontrado.nunum_empleado_rr_hh.toString(),
              idFase: this.form.value.id_fase,
              fechas: [],
              aplicaTodosMeses: this.form.value.aplicaTodosMeses,
              cantidad: this.form.value.cantidad,
              fee: null,
              PrecioVenta: this.PreciodeVenta,
              Puesto: null,
              reembolsable: this.form.value.reembolsable,
              nuCostoIni: this.PreciodeVenta,
              chAlias: this.form.value.chalias,
              
            }
          }
          const empleadoRespuesta: Empleado = {
            ...this.empleado,
            aplicaTodosMeses: this.form.value.aplicaTodosMeses,
            cantidad: this.form.value.cantidad,
           // nucosto_ini: this.PreciodeVenta,
            //PrecioVenta: this.PreciodeVenta,
            fechas: this.form.value.fechas as Fecha[]
          }
          this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'La etapa ha sido agregada.' })
          this.ref.close({ empleado: empleadoRespuesta })
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  buscarEmpleados(event: any) {

    this.sharedService.cambiarEstado(true)

    console.log('VALOR QUE LLEGA DEL COMBO -------- <<<< ' + event.value)

    this.timesheetService.getEmpleadosTIPO(event.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({ data }) => {
          this.setCatEmpleados(data)
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  cargarEmpleados() {

    this.sharedService.cambiarEstado(true)

    this.timesheetService.getEmpleados()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({ data }) => {
          this.empleadosOriginal = data
          //this.empleados = this.empleadosOriginal.map(empleado => ({code: empleado.nunum_empleado_rr_hh.toString(), name: empleado.nombre_persona}))
          this.empleados = this.empleadosOriginal.map(empleado => ({ code: empleado.nunum_empleado_rr_hh.toString(), name: `${empleado.nunum_empleado_rr_hh.toString()} - ${empleado.nombre_persona}` }))
        },
        error: (err) => this.closeDialog()
      })
  }

  cargarTipoEmpleados() {

    this.sharedService.cambiarEstado(true)

    this.timesheetService.getCatPuesto()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({ data }) => {
          this.Puesto = data
          //this.empleados = this.empleadosOriginal.map(empleado => ({code: empleado.nunum_empleado_rr_hh.toString(), name: empleado.nombre_persona}))
          this.catPuesto = this.Puesto.map(tipoempleado => ({ code: tipoempleado.nukid_puesto.toString(), name: `${tipoempleado.chpuesto.toString()} ` }))
        },
        error: (err) => this.closeDialog()
      })
  }

  cambiarValores() {
    this.fechas.controls.forEach((fecha, index) => {
      if(!fecha.value.disabled) {
        this.fechas.at(index).patchValue({
          porcentaje: this.form.value.aplicaTodosMeses ? this.form.value.cantidad : 0
        })
      }
    })
  }

  cambiarValoresSueldos() {
    // if (this.form.value.ModificaSueldo) {
    //   this.form.controls['FEE'].enable()
    // } else {
    //   this.form.controls['FEE'].reset()
    //   this.form.controls['FEE'].disable()

    // }

    /*this.fechas.controls.forEach((fecha, index) => {
      this.fechas.at(index).patchValue({
        porcentaje: this.form.value.ModificaSueldo ? this.form.value.FEE : 0
      })
    })*/
  }

  CargaSueldoCostos(event: any) {

    console.log('event.value ' + event.value)
    console.log('event ' + event)
    console.log('+event. ' + +event)

    this.cargandoCosto = true;
    this.costosService.getCostoID(event)
      .pipe(finalize(() => {
        this.sharedService.cambiarEstado(false);
        this.cargandoCosto = false;
      }))
      .subscribe({
        next: ({ data, message }) => {

          const [costoR] = data
          console.log('message ' + message)
          console.log('data.map(empleado => costoR.costoMensualEmpleado ) ' + data.map(empleado => costoR.idCosto))
          console.log(' this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado )) ' + this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado)))
          

          if (message != null) {

            this.mensajito = message;

            if (this.mensajito.includes('No se encontraron registros de costos para el empleado:')) {

              this.PreciodeVenta = 0
              this.form.patchValue({
                FEE: this.formateaValor(0.0),
                PrecioVenta: this.formateaValor(0.0)

              })

            } else {


              this.PreciodeVenta = this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado))
              this.form.patchValue({
                FEE: this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado)),
                PrecioVenta: this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado)),
                nucosto_ini: this.formateaValor(data.map(empleado => costoR.costoMensualEmpleado)),

              })

            }
          }





        },
        error: (err) => {
          console.log("error cuando no Existe registro de costos --------------> " + err.error.text);
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })


        }
      })



  }

  obtenerPorcentaje(fechas: Fecha[], mesRegistro: Mes) {
    const mes = fechas.find(info => info.mes == mesRegistro.mes)

    if (mes && mes.porcentaje > 0) {
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
      if (this.form.get(campo).hasError(error.tipo))
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

  setCatTipoEmpleado(data: any[]) {
    data.forEach((element) => this.catPuesto.push({
      name: String(element.descripcion),
      code: String(element.id),
    })
    );
  }

  setCatEmpleados(data: any[]) {
    this.empleados = []
    data.forEach((element) => this.empleados.push({
      name: String(element.nunum_empleado_rr_hh + ' - ' + element.nombre_persona),
      code: String(element.nunum_empleado_rr_hh),
    })
    )
  }

}
