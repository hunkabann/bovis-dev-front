import { Component, OnInit, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuditoriaService } from '../../services/auditoria.service';
import { Documento } from '../../models/auditoria.model';
import { descargarArchivo } from 'src/helpers/helpers';
import { MessageService } from 'primeng/api';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { FormArray, FormBuilder } from '@angular/forms';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-ver-documentos',
  templateUrl: './ver-documentos.component.html',
  styleUrls: ['./ver-documentos.component.css'],
  providers: [MessageService]
})
export class VerDocumentosComponent implements OnInit {

  auditoriaService  = inject(AuditoriaService)
  config            = inject(DynamicDialogConfig)
  fb                = inject(FormBuilder)
  messageService    = inject(MessageService)
  ref               = inject(DynamicDialogRef)
  sharedService     = inject(SharedService)

  // documentos: Documento[]
  
  formDocumentos = this.fb.group({
    data: this.fb.array([])
  })

  constructor() { }
  
  get documentos() {
    return this.formDocumentos.get('data') as FormArray
  }

  ngOnInit(): void {
    if(this.config.data?.idAuditoria) {
      this.auditoriaService.getDocumentos(this.config.data.idAuditoria)
        .subscribe({
          next: ({data}) => {
            data.forEach(documento => {
                this.documentos.push(
                  this.fb.group({
                    fecha:        [documento.fecha],
                    id_documento: [documento.idDocumento],
                    valido:       [documento.valido]
                  })
                )
              }
            )
          },
          error: (err) => this.closeDialog()
        })
    } else {
      this.closeDialog()
    }
  }

  descargarDocumento(id: number) {
    if(id != 0) {
      this.auditoriaService.getDocumento(id)
        .subscribe({
          next: ({data}) => {
            this.descargar(data.documentoBase64)
          },
          error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: SUBJECTS.error})
        })
    }
  }

  async descargar(base64: string) {
    await descargarArchivo(base64, `Documento_${Date.now()}`)
  }

  closeDialog() {
    this.ref.close()
  }

  guardar() {
    
    this.sharedService.cambiarEstado(true)

    this.auditoriaService.validarDocumentos(this.formDocumentos.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.ref.close({exito: true})
        },
        error: (err) =>  this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

}
