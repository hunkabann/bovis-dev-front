import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { finalize, forkJoin } from 'rxjs';
import { EmpleadosService } from 'src/app/empleados/services/empleados.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Opcion} from 'src/models/general.model';
import { CALENDAR, SUBJECTS,TITLES, errorsArray } from 'src/utils/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { CostoEmpleado } from '../../models/costos.model';
import { CostosService } from '../../services/costos.service';
import { differenceInCalendarYears, format } from 'date-fns';

@Component({
  selector: 'app-captura-beneficios',
  templateUrl: './captura-beneficios.component.html',
  styleUrls: ['./captura-beneficios.component.css'],
  providers: [MessageService]
})
export class CapturaBeneficiosComponent implements OnInit {

  empleadosService  = inject(EmpleadosService)
  fb                = inject(FormBuilder)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  costosService   = inject(CostosService)
  esActualizacion = true
  costos: CostoEmpleado[] = []

  disabledInput: boolean = false;

  idEmpleado: string;

  constructor( private router: Router,
    private activatedRoute: ActivatedRoute,
    private empleadosServ: EmpleadosService) { }

  form = this.fb.group({
    num_empleado:                 [null],
    vivienda:                     [0, Validators.required],
    automovil:                    [0, Validators.required],
    viaticos_a_comprobar:         [0, Validators.required],
    bono_adicional_reubicacion:   [0, Validators.required],
    gasolina:                     [0, Validators.required],
    casetas:                      [0, Validators.required],
    ayuda_de_transporte:          [0, Validators.required],
    vuelos_de_avion:              [0, Validators.required],
    provision_impuestos_expats:   [0, Validators.required],
    fringe_expats:                [0, Validators.required],
    programa_de_entretenimiento:  [0, Validators.required],
    eventos_especiales:           [0, Validators.required],
    otros:                        [0, Validators.required],
    costo_it:                     [0, Validators.required],
    costo_telefonia:              [0, Validators.required],
    sv_directivos:                [0, Validators.required],
    facturacion_bpm:              [0, Validators.required],
    id_persona:                   [null],
    persona_nombre:               [null],
    num_empleado_rr_hh:           [null],
    numEmpleadoNoi:               [null],
    ciudad:                       [null],
    reubicacion:                  [null],
    puesto:                       [null],
    pvDiasVacasAnuales:           [null],
    proyecto:                     [null],
    unidadNegocio:                [null],
    timesheet:                    [null],
    nombreJefe:                   [null],
    antiguedad:                   [null],
    sueldoBrutoInflacion:         [null],
    anual:                        [null],
    ptuProvision:                 [null],
    costoMensualEmpleado:         [null],
    costoMensualProyecto:         [null],
    costoAnualEmpleado:           [null],
    costoSalarioBruto:            [null],
    costoSalarioNeto:             [null],
    avgDescuentoEmpleado:         [null],
    montoDescuentoMensual:        [null],
    sueldoNetoPercibidoMensual:   [null],
    retencionImss:                [null],
    ispt:                         [null],
    empresa:                      [null],
    fechaIngreso:                 [null],
    aguinaldoCantidadMeses:       [null],
    aguinaldoMontoProvisionMensual: [null],
    vaidComisionCostoMensual:     [null],
    vaidCostoMensual:             [null],
    svCostoMensual:               [null],
    svCostoTotalAnual:            [null],
    sgmmCostoMensual:             [null],
    sgmmCostoTotalAnual:          [null],
    bonoAnualProvisionMensual:    [null],
    avgBonoAnualEstimado:         [null],
    indemProvisionMensual:        [null],
    pvProvisionMensual:           [null],
    impuesto3sNomina:             [null],
    imss:                         [null],
    retiro2:                      [null],
    cesantesVejez:                [null],
    infonavit:                    [null],
    cargasSociales:               [null]


  })

  empleados: Opcion[] = []

  NumEmpleado = null

  ngOnInit(): void {

    this.form.controls['num_empleado'].disable(); 
    this.form.controls['persona_nombre'].disable();               
    this.form.controls['num_empleado_rr_hh'].disable();           
    this.form.controls['numEmpleadoNoi'].disable();               
    this.form.controls['ciudad'].disable();                       
    this.form.controls['reubicacion'].disable();                 
    this.form.controls['puesto'].disable();                       
    this.form.controls['pvDiasVacasAnuales'].disable();           
    this.form.controls['proyecto'].disable();                     
    this.form.controls['unidadNegocio'].disable();                
    this.form.controls['timesheet'].disable();                    
    this.form.controls['nombreJefe'].disable();                   
    this.form.controls['antiguedad'].disable();                   
    this.form.controls['sueldoBrutoInflacion'].disable();         
    this.form.controls['anual'].disable();                        
    this.form.controls['ptuProvision'].disable();                 
    this.form.controls['costoMensualEmpleado'].disable();        
    this.form.controls['costoMensualProyecto'].disable();        
    this.form.controls['costoAnualEmpleado'].disable();           
    this.form.controls['costoSalarioBruto'].disable();            
    this.form.controls['costoSalarioNeto'].disable();             
    this.form.controls['avgDescuentoEmpleado'].disable();         
    this.form.controls['montoDescuentoMensual'].disable();        
    this.form.controls['sueldoNetoPercibidoMensual'].disable();   
    this.form.controls['retencionImss'].disable();                
    this.form.controls['ispt'].disable();                         
    this.form.controls['empresa'].disable();                      
    this.form.controls['fechaIngreso'].disable();                 
    this.form.controls['aguinaldoCantidadMeses'].disable();       
    this.form.controls['aguinaldoMontoProvisionMensual'].disable();
    this.form.controls['vaidComisionCostoMensual'].disable();     
    //this.form.controls['vaidCostoMensual'].disable();             
    this.form.controls['svCostoMensual'].disable();               
    //this.form.controls['svCostoTotalAnual'].disable();            
    this.form.controls['sgmmCostoMensual'].disable();             
    //this.form.controls['sgmmCostoTotalAnual'].disable();          
    this.form.controls['bonoAnualProvisionMensual'].disable();    
    //this.form.controls['avgBonoAnualEstimado'].disable();         
    this.form.controls['indemProvisionMensual'].disable();        
    this.form.controls['pvProvisionMensual'].disable();           
    this.form.controls['impuesto3sNomina'].disable();             
    this.form.controls['imss'].disable();                         
    this.form.controls['retiro2'].disable();                      
    this.form.controls['cesantesVejez'].disable();                
    this.form.controls['infonavit'].disable();                    
    this.form.controls['cargasSociales'].disable();
                  
   


    this.sharedService.cambiarEstado(true)

    this.activatedRoute.params
    .subscribe(({id}) => {
      forkJoin([
        id ? this.empleadosServ.getPersonas() : this.empleadosServ.getPersonasDisponibles(),
        this.empleadosServ.getCatEmpleados(),
        this.empleadosServ.getCatCategorias(),
        this.empleadosServ.getCatTiposContratos(),
        this.empleadosServ.getCatNivelEstudios(),
        this.empleadosServ.getCatFormasPago(),
        this.empleadosServ.getCatJornadas(),
        this.empleadosServ.getCatDepartamentos(),
        this.empleadosServ.getCatClasificacion(),
        this.empleadosServ.getCatUnidadNegocio(),
        this.empleadosServ.getCatTurno(),
        this.empleadosServ.getHabilidades(),
        this.empleadosServ.getExperiencias(),
        this.empleadosServ.getProfesiones(),
        this.empleadosServ.getPuestos(),
        this.empleadosServ.getEmpleados(),
        this.empleadosServ.getCatEstados(),
        this.empleadosServ.getCatPaises(),
      ])
      .pipe(finalize(() => this.verificarActualizacion()))
      .subscribe({
        next: ([
          empleadosR
        ]) => {
          this.empleados = empleadosR.data.map(empleado => ({name: empleado.chnombre, code: empleado.chap_materno}))
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
    })

    

    

    this.empleadosService.getEmpleados()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.empleados = data.map(empleado => ({name: empleado.nombre_persona, code: empleado.nunum_empleado_rr_hh.toString()}))
          
          //NumEmpleado = this.empleados.num_empleado_rr_hh as any
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  //getEmpleado

  verificarActualizacion() {

    this.activatedRoute.params
    .subscribe(({id}) => {
      if(id) {
        this.idEmpleado = id
        this.esActualizacion = true
        this.costosService.getCostoID(id)
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: ({data}) => {
              // console.log(data)
              const [costoR] = data
              this.costos = data
        //this.puestos = puestosR.data.map(puesto => ({value: puesto.chpuesto, label: puesto.chpuesto}))

              //this.costos = data.map(empleado => (costoR.numEmpleadoRrHh))
              //this.costos.numEmpleadoRrHh
              let newDate = new Date(data.map(empleado => (costoR.fechaIngreso))+"");
              const date = new Date(data.map(empleado => (costoR.fechaIngreso))+"");
              this.form.patchValue({
                ciudad:                         data.map(empleado => (costoR.ciudad)),
                num_empleado_rr_hh:             data.map(empleado => (costoR.numEmpleadoRrHh)),
                numEmpleadoNoi:                 data.map(empleado => (costoR.numEmpleadoNoi)),
                reubicacion:                    data.map(empleado => (costoR.reubicacion)),
                puesto:                         data.map(empleado => (costoR.puesto)),
                pvDiasVacasAnuales:             data.map(empleado => (costoR.pvDiasVacasAnuales)),
                proyecto:                       data.map(empleado => (costoR.proyecto)),
                unidadNegocio:                  data.map(empleado => (costoR.unidadNegocio)),
                empresa:                        data.map(empleado => (costoR.empresa)),
                timesheet:                      data.map(empleado => (costoR.timesheet)),
                fechaIngreso:                   format(new Date(newDate || null), 'dd/MM/y'),
                //nombreJefe:                     data.map(empleado => (costoR.nombreJefe)),
                antiguedad:                      this.formateaValor(data.map(empleado => (costoR.antiguedad))),
                sueldoBrutoInflacion:           data.map(empleado => (costoR.sueldoBrutoInflacion)),
                anual:                          data.map(empleado => (costoR.anual)),
                ptuProvision:                    this.formateaValor(data.map(empleado => (costoR.ptuProvision))),
                costoMensualEmpleado:           this.formateaValor(data.map(empleado => (costoR.costoMensualEmpleado))),
                costoMensualProyecto:           this.formateaValor(data.map(empleado => (costoR.costoMensualProyecto))),
                costoAnualEmpleado:             this.formateaValor(data.map(empleado => (costoR.costoAnualEmpleado))),
                costoSalarioBruto:              this.formateaValor(data.map(empleado => (costoR.costoSalarioBruto))),
                costoSalarioNeto:               this.formateaValor(data.map(empleado => (costoR.costoSalarioNeto))),
                avgDescuentoEmpleado:           data.map(empleado => (costoR.avgDescuentoEmpleado)),
                montoDescuentoMensual:          data.map(empleado => (costoR.montoDescuentoMensual)),
                sueldoNetoPercibidoMensual:     data.map(empleado => (costoR.sueldoNetoPercibidoMensual)),
                retencionImss:                  data.map(empleado => (costoR.retencionImss)),
                ispt:                           data.map(empleado => (costoR.ispt)),
                aguinaldoCantidadMeses:         data.map(empleado => (costoR.aguinaldoCantidadMeses)),
                aguinaldoMontoProvisionMensual: this.formateaValor(data.map(empleado => (costoR.aguinaldoMontoProvisionMensual))),
                vaidComisionCostoMensual:       data.map(empleado => (costoR.vaidComisionCostoMensual)),
                vaidCostoMensual:               data.map(empleado => (costoR.vaidCostoMensual)),
                svCostoMensual:                 data.map(empleado => (costoR.vaidCostoMensual)),
                svCostoTotalAnual:              data.map(empleado => (costoR.svCostoMensual)),
                sgmmCostoMensual:               this.formateaValor(data.map(empleado => (costoR.sgmmCostoMensual))),
                sgmmCostoTotalAnual:            data.map(empleado => (costoR.sgmmCostoTotalAnual)),
                bonoAnualProvisionMensual:      data.map(empleado => (costoR.bonoAnualProvisionMensual)),
                avgBonoAnualEstimado:           data.map(empleado => (costoR.avgBonoAnualEstimado)),
                indemProvisionMensual:          this.formateaValor(data.map(empleado => (costoR.indemProvisionMensual))),
                pvProvisionMensual:             this.formateaValor(data.map(empleado => (costoR.pvProvisionMensual))),
                impuesto3sNomina:               this.formateaValor(data.map(empleado => (costoR.impuesto3sNomina))),
                imss:                           data.map(empleado => (costoR.imss)),
                retiro2:                        data.map(empleado => (costoR.retiro2)),
                cesantesVejez:                  data.map(empleado => (costoR.cesantesVejez)),
                infonavit:                      data.map(empleado => (costoR.infonavit)),
                cargasSociales:                 this.formateaValor(data.map(empleado => (costoR.cargasSociales))),
                
              })
              //this.form.controls['ciudad'].disable();
            
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
          })
      } 
  })

    this.activatedRoute.params
      .subscribe(({id}) => {
        if(id) {

          this.esActualizacion = true
          this.empleadosServ.getEmpleado(id)
            .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
            .subscribe({
              next: ({data}) => {
                // console.log(data)
              const habilidades = data.habilidades.map(habilidad => habilidad.idHabilidad.toString())
              const experiencias = data.experiencias.map(experiencia => experiencia.idExperiencia.toString())
                this.form.patchValue({
                  num_empleado:           data.nunum_empleado_rr_hh?.toString(),
                  id_persona:             data.nukidpersona?.toString(),
                  persona_nombre:         data.nombre_persona,
                  nombreJefe:             data.chjefe_directo
                  
                })
              
              },
              error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
            })
        } 
    })

   
  }

  guardar() {
    console.log(this.form.value);

    let body = {
     //...this.form.value
     idCostoEmpleado: null,
     NumEmpleadoRrHh: this.form.value.num_empleado,
     //sueldoBrutoInflacion: this.form.value.sueldoBrutoInflacion,
     vaidCostoMensual: this.form.value.vaidCostoMensual,
     svCostoTotalAnual: this.form.value.svCostoTotalAnual,
     sgmmCostoTotalAnual: this.form.value.sgmmCostoTotalAnual,
     avgBonoAnualEstimado: this.form.value.avgBonoAnualEstimado
      //fecha_ingreso:          format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
      //fecha_salida:           this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
      //fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null

    }

    this.empleadosServ.getCostoID(this.idEmpleado)
              .subscribe({
                next: (data) => {
                  if (data.data.length > 0) {
                    body = {
                      ...body,
                      idCostoEmpleado: data.data[0].idCostoEmpleado
                    }

                    this.empleadosServ.guardarCostoEmpleadoActualiza(body, this.esActualizacion, "api/Costo/" + data.data[0].idCostoEmpleado)
                      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                      .subscribe({
                        next: (data) => {
                          this.form.reset()
                          this.router.navigate(['/costos/captura-beneficios'], { queryParams: { success: true } });
                        },
                        error: (err) => {
                          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
                        }
                      })
                  }
                },
                error: (err) => {
                  this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
                }
              })
         // }
   
   /* this.empleadosService.guardarCostoEmpleadoActualiza(body,true,this.form.value.num_empleado)
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: (data) => {
        this.form.reset()
        this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      }
    })*/
    // console.log(body)
    
    const bodyVivienda = {
      //...this.form.value
      //fecha_ingreso:          format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
      //fecha_salida:           this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
      //fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null

      NumEmpleadoRrHh: this.form.value.num_empleado,
      IdBeneficio: "1",
      Costo: this.form.value.vivienda
    }

  if(this.form.value.vivienda != 0 || this.form.value.vivienda != 0.0 || this.form.value.vivienda != 0.00){
    
    this.empleadosService.guardarBeneficioCosto(bodyVivienda)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.form.reset()
          this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })

  }

  const bodyAutomovil = {
    //...this.form.value
    //fecha_ingreso:          format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
    //fecha_salida:           this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
    //fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null

    NumEmpleadoRrHh: this.form.value.num_empleado,
    IdBeneficio: "2",
    Costo: this.form.value.automovil
  }

if(this.form.value.automovil != 0 || this.form.value.automovil != 0.0 || this.form.value.automovil != 0.00){
  
  this.empleadosService.guardarBeneficioCosto(bodyAutomovil)
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: (data) => {
        this.form.reset()
        this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      }
    })

}

const bodyViaticosAComprobar = {
  //...this.form.value
  //fecha_ingreso:          format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
  //fecha_salida:           this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
  //fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "3",
  Costo: this.form.value.viaticos_a_comprobar
}

if(this.form.value.viaticos_a_comprobar != 0 || this.form.value.viaticos_a_comprobar != 0.0 || this.form.value.viaticos_a_comprobar != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyViaticosAComprobar)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

const bodyBonoAdicional = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "4",
  Costo: this.form.value.bono_adicional_reubicacion
}

if(this.form.value.bono_adicional_reubicacion != 0 || this.form.value.bono_adicional_reubicacion != 0.0 || this.form.value.bono_adicional_reubicacion != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyBonoAdicional)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

const bodyGasolina = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "5",
  Costo: this.form.value.gasolina
}

if(this.form.value.gasolina != 0 || this.form.value.gasolina != 0.0 || this.form.value.gasolina != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyGasolina)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

const bodyCasetas = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "6",
  Costo: this.form.value.casetas
}

if(this.form.value.casetas != 0 || this.form.value.casetas != 0.0 || this.form.value.casetas != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyCasetas)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

const bodyAyudaTransporte = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "7",
  Costo: this.form.value.ayuda_de_transporte
}

if(this.form.value.ayuda_de_transporte != 0 || this.form.value.ayuda_de_transporte != 0.0 || this.form.value.ayuda_de_transporte != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyAyudaTransporte)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

const bodyVuelosAvion = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "8",
  Costo: this.form.value.vuelos_de_avion
}

if(this.form.value.vuelos_de_avion != 0 || this.form.value.vuelos_de_avion != 0.0 || this.form.value.vuelos_de_avion != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyVuelosAvion)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

const bodyprovisionImpues = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "9",
  Costo: this.form.value.provision_impuestos_expats
}

if(this.form.value.provision_impuestos_expats != 0 || this.form.value.provision_impuestos_expats != 0.0 || this.form.value.provision_impuestos_expats != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyprovisionImpues)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

const bodyFringeExpats = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "3007",
  Costo: this.form.value.fringe_expats
}

if(this.form.value.fringe_expats != 0 || this.form.value.fringe_expats != 0.0 || this.form.value.fringe_expats != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyFringeExpats)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

const bodyProgramadeEntrenamiento = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "10",
  Costo: this.form.value.programa_de_entretenimiento
}

if(this.form.value.programa_de_entretenimiento != 0 || this.form.value.programa_de_entretenimiento != 0.0 || this.form.value.programa_de_entretenimiento != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyProgramadeEntrenamiento)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

const bodyEventosEspeciales = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "11",
  Costo: this.form.value.eventos_especiales
}

if(this.form.value.eventos_especiales != 0 || this.form.value.eventos_especiales != 0.0 || this.form.value.eventos_especiales != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyEventosEspeciales)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

/**const bodyOtros = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "3",
  Costo: this.form.value.otros
}

if(this.form.value.otros != 0 || this.form.value.otros != 0.0 || this.form.value.otros != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyOtros)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}*/

const bodyCostoIT = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "1005",
  Costo: this.form.value.costo_it
}

if(this.form.value.costo_it != 0 || this.form.value.costo_it != 0.0 || this.form.value.costo_it != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyCostoIT)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

const bodyCosto_telefonia = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "2005",
  Costo: this.form.value.costo_telefonia
}

if(this.form.value.costo_telefonia != 0 || this.form.value.costo_telefonia != 0.0 || this.form.value.costo_telefonia != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyCosto_telefonia)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

const bodySV_Directivos = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "3005",
  Costo: this.form.value.sv_directivos
}

if(this.form.value.sv_directivos != 0 || this.form.value.sv_directivos != 0.0 || this.form.value.sv_directivos != 0.00){

this.empleadosService.guardarBeneficioCosto(bodySV_Directivos)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

const bodyFacturacion_BPM = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "3",
  Costo: this.form.value.facturacion_bpm
}

if(this.form.value.facturacion_bpm != 0 || this.form.value.facturacion_bpm != 0.0 || this.form.value.facturacion_bpm != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyFacturacion_BPM)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}

    
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

  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

}
 
