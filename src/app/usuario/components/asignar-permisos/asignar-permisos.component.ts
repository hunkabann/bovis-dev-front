import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UsuarioService } from '../../services/usuario.service';
import { Permiso } from '../../models/usuario.model';
import { finalize } from 'rxjs';
import { TITLES } from 'src/utils/constants';

@Component({
  selector: 'app-asignar-permisos',
  templateUrl: './asignar-permisos.component.html',
  styleUrls: ['./asignar-permisos.component.css'],
  providers: [MessageService]
})
export class AsignarPermisosComponent implements OnInit {

  activatedRoute  = inject(ActivatedRoute)
  fb              = inject(FormBuilder)
  messageService  = inject(MessageService)
  sharedService   = inject(SharedService)
  usuariosService = inject(UsuarioService)

  constructor() { }

  get permisos() {
    return this.form.get('permisos') as FormArray
  }

  form = this.fb.group({
    id_perfil:  [0, Validators.required],
    permisos:    this.fb.array([])
  })

  listaPermisos:   Permiso[] = []
  nombrePerfil:   string = ''

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)
    
    this.activatedRoute.paramMap.subscribe(params => {

      const id = Number(params.get('id'))

      if(id) {

        this.form.patchValue({ id_perfil: id })
      
        this.usuariosService.obtenerPermisos()
          .subscribe({
            next: ({data}) => {
              this.listaPermisos = data
              this.usuariosService.obtenerPerfilPermisos(id)
                .pipe(finalize (() => this.sharedService.cambiarEstado(false)))
                .subscribe({
                  next: ({data}) => {

                    this.nombrePerfil = data.perfil
                    const permisosRegistrados = data.permisos.map(permiso => permiso.idPermiso)
                    this.listaPermisos.forEach(permiso => {
                      this.permisos.push(
                        this.fb.group({
                          idPermiso:  permiso.idPermiso,
                          permiso:    permiso.permiso,
                          activo:     permisosRegistrados.includes(permiso.idPermiso)
                        })
                      )
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

    const permisosSeleccionados = this.permisos.controls.filter(permiso => permiso.get('activo').value)

    const body: any = {
      id_perfil:  this.form.value.id_perfil,
      permisos:    permisosSeleccionados.map(permiso => permiso.get('idPermiso').value)
    }

    this.usuariosService.actualizarPerfilPermisos(body)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'Los permisos han sido actualizados.' }),
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

}
