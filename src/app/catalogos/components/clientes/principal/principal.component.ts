import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { Cliente } from 'src/app/catalogos/Models/clientes';
import { ClientesService } from 'src/app/catalogos/services/clientes.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TITLES } from 'src/utils/constants';
import { RegistroComponent } from '../registro/registro.component';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css'],
  providers: [MessageService, DialogService]
})
export class PrincipalComponent implements OnInit {

  clientesService   = inject(ClientesService)
  dialogService     = inject(DialogService)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)

  clientes: Cliente[] = []

  constructor() { }

  ngOnInit(): void {
    this.cargarClientes()
  }
  
  cargarClientes() {
    
    this.sharedService.cambiarEstado(true)
  
    this.clientesService.obtenerClientes()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.clientes = data
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  guardarCliente(cliente: Cliente, index: number) {
    
    this.dialogService.open(RegistroComponent, {
      header: `${cliente ? 'Actualizar' : 'Agregar'} cliente`,
      width: '50%',
      contentStyle: {overflow: 'auto'},
      data: {
        cliente
      }
    })
    .onClose.subscribe((result) => {
      
      if(result && result.exito) {
        
        this.messageService.add({severity: 'success', summary: TITLES.success, detail: 'El cliente ha sido guardado.'})

        if(cliente) {
          this.clientes[index] = {
            ...result.clienteActualizado,
            idCliente: result.clienteActualizado.id_cliente
          }
        } else {
          this.cargarClientes()
        }
      }
    })
  }

  eliminarCliente(cliente: Cliente, index: number) {
    
    this.sharedService.cambiarEstado(true)

    this.clientesService.eliminarCliente(cliente.idCliente)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.messageService.add({severity: 'success', summary: TITLES.success, detail: 'El cliente ha sido eliminado.'})
          this.clientes.splice(index, 1)
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

}
