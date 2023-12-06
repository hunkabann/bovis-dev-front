import { Component, OnInit, inject } from '@angular/core';
import { Perfil } from '../../models/usuario.model';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UsuarioService } from '../../services/usuario.service';
import { finalize } from 'rxjs';
import { TITLES } from 'src/utils/constants';
import { DialogService } from 'primeng/dynamicdialog';
import { PerfilRegistroComponent } from '../perfil-registro/perfil-registro.component';

@Component({
  selector: 'app-perfiles',
  templateUrl: './perfiles.component.html',
  styleUrls: ['./perfiles.component.css'],
  providers: [MessageService, DialogService]
})
export class PerfilesComponent implements OnInit {

  messageService  = inject(MessageService)
  sharedService   = inject(SharedService)
  usuariosService = inject(UsuarioService)
  dialogService   = inject(DialogService)

  constructor() { }

  perfiles: Perfil[] = []

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)

    this.usuariosService.obtenerPerfiles()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => this.perfiles = data,
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  eliminarPerfil(id: number, i: number) {
    
    this.sharedService.cambiarEstado(true)

    this.usuariosService.eliminarPerfil(id)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'El perfil ha sido eliminado.' })
          this.perfiles.splice(i, 1)
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }
  
  mostrarPerfilRegistro() {
    
    this.dialogService.open(PerfilRegistroComponent, {
      header: 'Crear perfil',
      width: '50%',
      contentStyle: {overflow: 'auto'},
      data: {}
    })
    .onClose.subscribe((data) => {
      if(data) {
        this.perfiles.push({
          idPerfil:    null,
          perfil:      data.perfil,
          descripcion: data.descripcion,
          activo:      true,
        });
      }
    })
  }

}
