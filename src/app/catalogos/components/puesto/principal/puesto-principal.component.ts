import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { Puesto } from 'src/app/catalogos/Models/puesto';
import { PuestoService } from 'src/app/catalogos/services/puesto.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TITLES } from 'src/utils/constants';
import { PuestoRegistroComponent } from '../registro/puesto-registro.component';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-puesto-principal',
  templateUrl: './puesto-principal.component.html',
  styleUrls: ['./puesto-principal.component.css'],
  providers: [MessageService, DialogService]
})
export class PuestoPrincipalComponent implements OnInit {

  PuestoService   = inject(PuestoService)
  dialogService     = inject(DialogService)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)

  clientes: Puesto[] = []

  constructor() { }

  ngOnInit(): void {
    this.cargarClientes()
  }
  
  cargarClientes() {
    
    this.sharedService.cambiarEstado(true)
  
    this.PuestoService.obtenerPuesto()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.clientes = data
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  guardarCliente(cliente: Puesto, index: number) {
    
    this.dialogService.open(PuestoRegistroComponent, {
      header: `${cliente ? 'Actualizar' : 'Agregar'} Puesto`,
      width: '50%',
      contentStyle: {overflow: 'auto'},
      data: {
        cliente
      }
    })
    .onClose.subscribe((result) => {
      
      if(result && result.exito) {
        
        this.messageService.add({severity: 'success', summary: TITLES.success, detail: 'El Puesto ha sido guardado.'})

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

  eliminarCliente(puesto: Puesto, index: number) {
    
    this.sharedService.cambiarEstado(true)

    this.PuestoService.eliminarPuesto(puesto.nukid_puesto)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.messageService.add({severity: 'success', summary: TITLES.success, detail: 'El Puesto ha sido eliminado.'})
          this.clientes.splice(index, 1)
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

}
