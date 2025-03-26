import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize , forkJoin} from 'rxjs';
import { ClientesService } from 'src/app/catalogos/services/clientes.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TITLES, errorsArray,SUBJECTS } from 'src/utils/constants';
import { Opcion } from 'src/models/general.model';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';
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
  clientesService   = inject(ClientesService)
  primeConfig       = inject(PrimeNGConfig)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  fb                = inject(FormBuilder)
  timesheetService  = inject(TimesheetService)
  pcsService        = inject(PcsService)
  usuariosService = inject(UsuarioService)

  esActualizacion = false

  form = this.fb.group({
    id_cliente:   [null],
    cliente:      ['', Validators.required],
    rfc:          ['', Validators.required],
    activo:       [true]
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

    if(this.config.data.cliente) {
      
      this.esActualizacion = true
      
      const cliente = this.config.data.cliente
      this.form.patchValue({
        id_cliente: cliente.idCliente,
        cliente:    cliente.cliente,
        rfc:        cliente.rfc
      })
    }
  }

  guardar() {
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    this.clientesService.guardarCliente(this.form.value, this.esActualizacion)
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
