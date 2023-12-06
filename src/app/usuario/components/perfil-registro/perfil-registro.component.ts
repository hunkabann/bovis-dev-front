import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { errorsArray, TITLES } from 'src/utils/constants';
import { UsuarioService } from '../../services/usuario.service';
import { finalize } from 'rxjs';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-perfil-registro',
  templateUrl: './perfil-registro.component.html',
  styleUrls: ['./perfil-registro.component.css'],
  providers: [MessageService]
})
export class PerfilRegistroComponent implements OnInit {

  fb              = inject(FormBuilder)
  messageService  = inject(MessageService)
  ref             = inject(DynamicDialogRef)
  sharedService   = inject(SharedService)
  usuarioService  = inject(UsuarioService) 

  constructor() { }

  form = this.fb.group({
    perfil: ['', Validators.required],
    descripcion: ['', Validators.required]
  })

  ngOnInit(): void {
  }

  guardar() {

    this.sharedService.cambiarEstado(true)

    this.usuarioService.guardarPerfil(this.form.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'El perfil ha sido creado.' })
          this.ref.close(this.form.value)
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
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
