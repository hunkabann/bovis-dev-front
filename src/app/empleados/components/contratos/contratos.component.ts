import { Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { Plantilla } from 'src/app/contratos/models/contratos.model';
import { ContratosService } from 'src/app/contratos/services/contratos.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { EmpleadosService } from '../../services/empleados.service';
import { ContratoPlantilla } from '../../Models/empleados';

@Component({
  selector: 'app-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.css']
})
export class ContratosComponent implements OnInit {

  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  contratosService  = inject(ContratosService)
  empleadosService  = inject(EmpleadosService)
  location          = inject(Location)
  activatedRoute    = inject(ActivatedRoute)

  idEmpleado: number = null
  plantillas: ContratoPlantilla[] = []

  constructor() { }

  ngOnInit(): void {
    this.verificarEstado()

    this.sharedService.cambiarEstado(true)

    this.activatedRoute.params
      .subscribe(({id}) => {
        if(id) {
          this.idEmpleado = id
          this.empleadosService.getContratosPorEmpleado(id)
            .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
            .subscribe({
              next: ({data}) => {
                this.plantillas = data
              },
              error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
            })
        }
      })
  }

  verificarEstado() {

    this.activatedRoute.queryParams.subscribe(params => {
      // Access query parameters
      const success = params['success']

      if(success) {
        Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Registro guardado', detail: 'El registro ha sido guardado.' }))
      }

      const urlWithoutQueryParams = this.location.path().split('?')[0];
      this.location.replaceState(urlWithoutQueryParams);
    });
  }

}
