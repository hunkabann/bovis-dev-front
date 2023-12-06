import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SharedService } from '../../shared/services/shared.service';
import { ContratosService } from '../services/contratos.service';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { Plantilla } from '../models/contratos.model';

@Component({
  selector: 'app-plantillas',
  templateUrl: './plantillas.component.html',
  styleUrls: ['./plantillas.component.css'],
  providers: [MessageService]
})
export class PlantillasComponent implements OnInit {

  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  contratosService  = inject(ContratosService)
  location          = inject(Location)
  activatedRoute    = inject(ActivatedRoute)

  plantillas: Plantilla[] = []

  constructor() { }

  ngOnInit(): void {
    this.verificarEstado()

    this.sharedService.cambiarEstado(true)

    this.contratosService.getPlantillas('todos')
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.plantillas = data
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
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
  
  toggleActivo(id: number, activo: boolean) {
    console.log(activo)
    const index = this.plantillas.findIndex(({idContratoTemplate}) => idContratoTemplate === id)
    if(index >= 0) {
      this.sharedService.cambiarEstado(true)
      this.contratosService.togglePlantillaEstado(!activo, id)
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (data) => {
            this.plantillas.at(index).activo = !activo
            this.messageService.add({ severity: 'success', summary: 'Registro actualizado', detail: `El registro ha sido ${activo ? 'deshabilitado' : 'habilitado'}.` })
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
        })
    }
  }

}
