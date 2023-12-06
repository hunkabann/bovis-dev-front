import { Component, OnInit } from '@angular/core';
import { Empleado, UpPersona } from '../Models/empleados';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { EmpleadosService } from '../services/empleados.service';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'],
})
export class EmpleadosComponent implements OnInit {

  ListEmpleadosModel: Empleado[] = []
  personas: UpPersona[] = []

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private empleadosServ: EmpleadosService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.verificarEstado()

    this.sharedService.cambiarEstado(true)

    if (localStorage.getItem('empleados') != null) {
      this.ListEmpleadosModel = JSON.parse(
        localStorage.getItem('empleados') || '[]'
      );
      //console.log(this.ListEmpleadosModel);
    }

    this.empleadosServ.getPersonas()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => this.personas = data,
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
    const index = this.personas.findIndex(({nukidpersona}) => nukidpersona === id)
    if(index >= 0) {
      this.sharedService.cambiarEstado(true)
      this.empleadosServ.toggleEstado(!activo, id)
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (data) => {
            this.personas.at(index).boactivo = !activo
            this.messageService.add({ severity: 'success', summary: 'Registro actualizado', detail: `El registro ha sido ${activo ? 'deshabilitado' : 'habilitado'}.` })
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
        })
    }
  }
}
