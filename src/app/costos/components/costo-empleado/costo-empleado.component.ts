import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CostosService } from '../../services/costos.service';
import { SharedService } from '../../../shared/services/shared.service';
import { finalize } from 'rxjs';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { CostoEmpleado } from '../../models/costos.model';

@Component({
  selector: 'app-costo-empleado',
  templateUrl: './costo-empleado.component.html',
  styleUrls: ['./costo-empleado.component.css'],
  providers: [MessageService]
})
export class CostoEmpleadoComponent implements OnInit {

  costosService   = inject(CostosService)
  messageService  = inject(MessageService)
  sharedService   = inject(SharedService)

  costos: CostoEmpleado[] = []

  constructor() { }

  ngOnInit(): void {
    this.sharedService.cambiarEstado(true)

    this.costosService.getCostosEmpleado()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.costos = data
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

}
