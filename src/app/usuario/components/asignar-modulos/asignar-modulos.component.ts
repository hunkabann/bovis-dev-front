import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UsuarioService } from '../../services/usuario.service';
import { Modulo, ModuloArbol } from '../../models/usuario.model';
import { finalize } from 'rxjs';
import { TITLES } from 'src/utils/constants';

@Component({
  selector: 'app-asignar-modulos',
  templateUrl: './asignar-modulos.component.html',
  styleUrls: ['./asignar-modulos.component.css'],
  providers: [MessageService]
})
export class AsignarModulosComponent implements OnInit {

  activatedRoute  = inject(ActivatedRoute)
  fb              = inject(FormBuilder)
  messageService  = inject(MessageService)
  sharedService   = inject(SharedService)
  usuariosService = inject(UsuarioService)

  constructor() { }

  get modulos() {
    return this.form.get('modulos') as FormArray
  }

  form = this.fb.group({
    id_perfil:  [0, Validators.required],
    modulos:    this.fb.array([])
  })

  listaModulos:   ModuloArbol[] = []
  nombrePerfil:   string = ''

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)
    
    this.activatedRoute.paramMap.subscribe(params => {

      const id = Number(params.get('id'))

      if(id) {

        this.form.patchValue({ id_perfil: id })
      
        this.usuariosService.obtenerModulosArbol()
          .subscribe({
            next: ({data}) => {
              this.listaModulos = data
              this.usuariosService.obtenerPerfilModulosArbol(id)
                .pipe(finalize (() => this.sharedService.cambiarEstado(false)))
                .subscribe({
                  next: ({data}) => {

                    this.nombrePerfil = data.perfil
                    
                    // Modulos registrados
                    let modulosUsuario: Modulo[] = []

                    data.modulos.forEach(modulo => {
                      modulo.submodulos.forEach(submodulo => {
                        modulosUsuario.push({
                          idModulo:   submodulo.idSubmodulo,
                          modulo:     modulo.modulo,
                          subModulo:  submodulo.subModulo,
                          isTab:      false,
                          tab:        null,
                          activo:     submodulo.activo
                        })
                        submodulo.tabs.forEach(tab => {
                          modulosUsuario.push({
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

                    const modulosRegistrados = modulosUsuario.map(({idModulo}) => idModulo)

                    // Modulos generales
                    this.listaModulos.forEach(modulo => {
                      modulo.submodulos.forEach(submodulo => {
                        this.modulos.push(
                          this.fb.group({
                            idModulo:   submodulo.idSubmodulo,
                            modulo:     modulo.modulo,
                            subModulo:  submodulo.subModulo,
                            isTab:      false,
                            tab:        null,
                            activo:     modulosRegistrados.includes(submodulo.idSubmodulo)
                          })
                        )
                        submodulo.tabs.forEach(tab => {
                          this.modulos.push(
                            this.fb.group({
                              idModulo:   tab.idTab,
                              modulo:     modulo.modulo,
                              subModulo:  submodulo.subModulo,
                              isTab:      true,
                              tab:        tab.tab,
                              activo:     modulosRegistrados.includes(submodulo.idSubmodulo)
                            })
                          )
                        })
                      })
                    })
                  },
                  error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
                })
            },
            error: (err) => {
              this.sharedService.cambiarEstado(false)
              this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
            }
          })
      }
    })
  }

  guardar() {
    
    this.sharedService.cambiarEstado(true)

    const modulosSeleccionados = this.modulos.controls.filter(modulo => modulo.get('activo').value)

    const body: any = {
      id_perfil:  this.form.value.id_perfil,
      modulos:    modulosSeleccionados.map(modulo => modulo.get('idModulo').value)
    }

    this.usuariosService.actualizarPerfilModulos(body)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'Los módulos han sido actualizados.' }),
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

}
