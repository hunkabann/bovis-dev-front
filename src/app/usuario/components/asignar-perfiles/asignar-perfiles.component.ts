import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UsuarioService } from '../../services/usuario.service';
import { finalize } from 'rxjs';
import { TITLES } from 'src/utils/constants';
import { Perfil } from '../../models/usuario.model';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-asignar-perfiles',
  templateUrl: './asignar-perfiles.component.html',
  styleUrls: ['./asignar-perfiles.component.css'],
  providers: [MessageService]
})
export class AsignarPerfilesComponent implements OnInit {

  activatedRoute  = inject(ActivatedRoute)
  fb              = inject(FormBuilder)
  messageService  = inject(MessageService)
  sharedService   = inject(SharedService)
  usuariosService = inject(UsuarioService)

  constructor() { }

  get perfiles() {
    return this.form.get('perfiles') as FormArray
  }

  form = this.fb.group({
    id_usuario: [0, Validators.required],
    perfiles:   this.fb.array([])
  })

  listaPerfiles:       Perfil[] = []
  nombreUsuario:  string = ''

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)
    
    this.activatedRoute.paramMap.subscribe(params => {

      const id = Number(params.get('id'))

      if(id) {

        this.form.patchValue({ id_usuario: id })
      
        this.usuariosService.obtenerPerfiles()
          .subscribe({
            next: ({data}) => {
              this.listaPerfiles = data
              this.usuariosService.obtenerUsuarioPerfiles(id)
                .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                .subscribe({
                  next: ({data}) => {

                    this.nombreUsuario = data.usuario
                    const perfilesRegistrados = data.perfiles.map(perfil => perfil.idPerfil)
                    this.listaPerfiles.forEach(perfil => {
                      this.perfiles.push(
                        this.fb.group({
                          idPerfil: perfil.idPerfil,
                          perfil: perfil.perfil,
                          activo: perfilesRegistrados.includes(perfil.idPerfil)
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

    const perfilesSeleccionados = this.perfiles.controls.filter(perfil => perfil.get('activo').value)

    const body: any = {
      id_usuario: this.form.value.id_usuario,
      perfiles: perfilesSeleccionados.map(perfil => perfil.get('idPerfil').value)
    }

    this.usuariosService.actualizarUsuarioPerfiles(body)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'Los perfiles han sido actualizados.' }),
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

}
