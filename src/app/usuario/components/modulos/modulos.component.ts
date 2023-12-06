import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UsuarioService } from '../../services/usuario.service';
import { finalize } from 'rxjs';
import { TITLES } from 'src/utils/constants';
import { Modulo, ModuloArbol } from '../../models/usuario.model';

@Component({
  selector: 'app-modulos',
  templateUrl: './modulos.component.html',
  styleUrls: ['./modulos.component.css'],
  providers: [MessageService]
})
export class ModulosComponent implements OnInit {

  messageService  = inject(MessageService)
  sharedService   = inject(SharedService)
  usuariosService = inject(UsuarioService)

  constructor() { }

  modulos: Modulo[] = []

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)

    this.usuariosService.obtenerModulosArbol()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          
          let modulosTemp: Modulo[] = []

          data.forEach(modulo => {
            modulo.submodulos.forEach(submodulo => {
              modulosTemp.push({
                idModulo:   submodulo.idSubmodulo,
                modulo:     modulo.modulo,
                subModulo:  submodulo.subModulo,
                isTab:      false,
                tab:        null,
                activo:     submodulo.activo
              })
              submodulo.tabs.forEach(tab => {
                modulosTemp.push({
                  idModulo:   tab.idTab,
                  modulo:     modulo.modulo,
                  subModulo:  submodulo.subModulo,
                  isTab:      true,
                  tab:        tab.tab,
                  activo:     tab.activo
                })
              })
            })
          })

          this.modulos = modulosTemp
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

}
