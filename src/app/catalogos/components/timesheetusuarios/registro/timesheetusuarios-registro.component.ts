import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize , forkJoin} from 'rxjs';
//import { ClientesService } from 'src/app/catalogos/services/clientes.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TITLES, errorsArray,SUBJECTS } from 'src/utils/constants';
import { Opcion } from 'src/models/general.model';
import { TimeSheetUsuarioService } from 'src/app/catalogos/services/timesheetusuarios.service';
import { PcsService } from 'src/app/pcs/services/pcs.service';
import { UsuarioService } from 'src/app/usuario/services/usuario.service';

@Component({
  selector: 'app-registro',
  templateUrl: './timesheetusuarios-registro.component.html',
  styleUrls: ['./timesheetusuarios-registro.component.css'],
  providers: [MessageService]
})
export class timesheetusuariosRegistroComponent implements OnInit {
  
  ref               = inject(DynamicDialogRef)
  config            = inject(DynamicDialogConfig)
  //clientesService   = inject(ClientesService)
  primeConfig       = inject(PrimeNGConfig)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  fb                = inject(FormBuilder)
  timesheetService  = inject(TimeSheetUsuarioService)
  pcsService        = inject(PcsService)
  usuariosService = inject(UsuarioService)

  esActualizacion = false

  form = this.fb.group({
    numEmpleadoRrHh:   [null],
    usuario:      ['', Validators.required],
    nombreEmpleado:      [null],
    numProyecto:      ['', Validators.required],
    nombreProyecto:       [null],
  })

  proyectos: Opcion[] = []
  usuarios: Opcion[] = []
  constructor() { }

  ngOnInit(): void {

    forkJoin([
          this.timesheetService.getCatProyectos(),
          this.usuariosService.obtenerUsuarios()
        ])
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: (value) => {
              const [proyectosR,usuariosR] = value
              this.proyectos = proyectosR.data.map(proyecto => ({ code: proyecto.numProyecto.toString(), name: `${proyecto.numProyecto.toString()} - ${proyecto.nombre}` })),
              this.usuarios = usuariosR.data.map(usuarios => ({ code: usuarios.numEmpleado.toString(), name: `${usuarios.numEmpleado.toString()} - ${usuarios.empleado}` }))
    
              //this.verificarEstado()
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
          })
    
        this.pcsService.obtenerNuevoProyecto()
          .subscribe(proyecto => {
            this.proyectos.push({ code: proyecto.id.toString(), name: `${proyecto.id.toString()} - ${proyecto.nombre}` })
            // this.proyectoId = proyecto.id
          })

    if(this.config.data.usuariotimesheet) {
      
      this.esActualizacion = true

      
      const usuariotimesheet = this.config.data.usuariotimesheet
      this.form.patchValue({
        numEmpleadoRrHh: usuariotimesheet.numEmpleadoRrHh,
        usuario:    usuariotimesheet.usuario,
        numProyecto:        usuariotimesheet.numProyecto,
        nombreProyecto:        usuariotimesheet.nombreProyecto,
      })
    }
  }

  guardar() {
    //if(!this.form.valid) {
    //  this.form.markAllAsTouched()
    //  return
    //}

  console.log("valor de usuario = "+ this.form.value.usuario)
  console.log("valor de Proyecto = "+ this.form.value.nombreProyecto)

   

   this.form.patchValue({
        numEmpleadoRrHh:  this.form.controls['usuario'].value,
        numProyecto: this.form.controls['nombreProyecto'].value
        //costo:      this.formateaValor( (valor / (this.form.value.dias - this.sumaOtros)) * 100 ),
       // diasCalc: valor,
        //dedicacionCalc: this.formateaValor((valor / this.form.value.dias) * 100) 
      })

    this.sharedService.cambiarEstado(true)

    this.timesheetService.guardarUsuarioTimesheet(this.form.value, this.esActualizacion)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.ref.close({exito: true, clienteActualizado: this.form.value})
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
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

}
