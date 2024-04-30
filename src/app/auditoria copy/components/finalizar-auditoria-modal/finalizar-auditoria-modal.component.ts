import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuditoriaService } from '../../services/auditoria.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize } from 'rxjs';
import { SUBJECTS, TITLES } from 'src/utils/constants';

@Component({
  selector: 'app-finalizar-auditoria-modal',
  templateUrl: './finalizar-auditoria-modal.component.html',
  styleUrls: ['./finalizar-auditoria-modal.component.css'],
  providers: [MessageService]
})
export class FinalizarAuditoriaModalComponent implements OnInit {

  ref               = inject(DynamicDialogRef)
  auditoriaService  = inject(AuditoriaService)
  sharedService     = inject(SharedService)
  messageService    = inject(MessageService)

  numProyecto: number;
  fechaI: any;


    constructor(
      ) { }
    
    ngOnInit(): void {
      this.numProyecto = JSON.parse(localStorage.getItem('numProyecto'));
      this.fechaI = JSON.parse(localStorage.getItem('fecha'))
      console.log(this.numProyecto);
    };

    onFinish() {
      this.sharedService.cambiarEstado(true);
      const request = {
        num_proyecto: this.numProyecto,
        fecha_inicio: this.fechaI
      }
      this.auditoriaService.getClosePeriodoAuditoria(request)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe(result => {
        const success = result['success']
        if(success) {
          Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Se finalizo la auditoria', detail: 'El registro ha sido guardado.' }))
        }
        this.ref.close(true);
        localStorage.removeItem('numProyecto');
        localStorage.removeItem('fecha');
        location.reload();
      })
    }

    onCancel() {
      this.ref.close(true)
    }

  

}
