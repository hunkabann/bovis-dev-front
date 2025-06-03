import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { UsuarioTimesheet } from 'src/app/catalogos/Models/timesheetusuarios';
//import { ClientesService } from 'src/app/catalogos/services/clientes.service';
import { TimeSheetUsuarioService } from 'src/app/catalogos/services/timesheetusuarios.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TITLES } from 'src/utils/constants';
import { timesheetusuariosRegistroComponent } from '../registro/timesheetusuarios-registro.component';

@Component({
  selector: 'app-principal',
  templateUrl: './timesheetusuarios-principal.component.html',
  styleUrls: ['./timesheetusuarios-principal.component.css'],
  providers: [MessageService, DialogService]
})
export class timesheetusuariosPrincipalComponent implements OnInit {

  clientesService   = inject(TimeSheetUsuarioService)
  dialogService     = inject(DialogService)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)

  //clientes: UsuarioTimesheet[] = []

  usuariotimesheet: UsuarioTimesheet[] = []

  constructor() { }

  ngOnInit(): void {
    this.cargarClientes()
  }
  
  cargarClientes() {
    
    this.sharedService.cambiarEstado(true)
  
    this.clientesService.obtenerUsuarioTimesheet()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.usuariotimesheet = data
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  guardarUsuarioTimesheet(usuariotimesheet: UsuarioTimesheet, index: number) {
    
    this.dialogService.open(timesheetusuariosRegistroComponent, {
      header: `${usuariotimesheet ? 'Actualizar' : 'Agregar'} timesheet usuario`,
      width: '50%',
      contentStyle: {overflow: 'auto'},
      data: {
        usuariotimesheet
      }
    })
    .onClose.subscribe((result) => {
      
      if(result && result.exito) {
        
        this.messageService.add({severity: 'success', summary: TITLES.success, detail: 'El Usuario Timesheet ha sido guardado.'})

        if(usuariotimesheet) {
          this.usuariotimesheet[index] = {
            ...result.clienteActualizado,
            numEmpleadoRrHh: result.clienteActualizado.numEmpleadoRrHh
          }
        } else {
          this.cargarClientes()
        }
      }
    })
  }

  eliminarUsuarioTimesheet(usuariotimesheet: UsuarioTimesheet, index: number) {
    
    this.sharedService.cambiarEstado(true)

    this.clientesService.eliminarUsuarioTimesheet(usuariotimesheet.numEmpleadoRrHh)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.messageService.add({severity: 'success', summary: TITLES.success, detail: 'El Usuario ha sido eliminado.'})
          this.usuariotimesheet.splice(index, 1)
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

}
