import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UsuarioService } from '../../services/usuario.service';
import { finalize } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { TITLES } from 'src/utils/constants';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css'],
  providers: [MessageService]
})
export class PrincipalComponent implements OnInit {

  messageService  = inject(MessageService)
  sharedService   = inject(SharedService)
  usuariosService = inject(UsuarioService)

  constructor() { }

  usuarios: Usuario[] = []

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)

    this.usuariosService.obtenerUsuarios()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => this.usuarios = data,
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  eliminarUsuario(id: number, i: number) {
    
    this.sharedService.cambiarEstado(true)

    this.usuariosService.eliminarUsuario(id)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'El usuario ha sido eliminado.' })
          this.usuarios.splice(i, 1)
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

}
