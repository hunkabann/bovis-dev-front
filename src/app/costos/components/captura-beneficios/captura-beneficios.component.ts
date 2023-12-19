import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { EmpleadosService } from 'src/app/empleados/services/empleados.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Opcion } from 'src/models/general.model';
import { TITLES, errorsArray } from 'src/utils/constants';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor( private router: Router) { }

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
    facturacion_bpm:              [0, Validators.required]
  })

  empleados: Opcion[] = []

  NumEmpleado = null

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)

    

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

  guardar() {
    console.log(this.form.value);

    const body = {
     ...this.form.value
      //fecha_ingreso:          format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
      //fecha_salida:           this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
      //fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null

    }
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

}
