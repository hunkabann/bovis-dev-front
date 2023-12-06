import { Component, OnInit } from '@angular/core';
import { EmpleadosService } from '../../services/empleados.service';
import { CatEmpleado, UpEmpleado } from '../../Models/empleados';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize, forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Item } from 'src/models/general.model';
import { Table } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { MostrarProyectosComponent } from '../mostrar-proyectos/mostrar-proyectos.component';

@Component({
  selector: 'app-empleados-principal',
  templateUrl: './empleados-principal.component.html',
  styleUrls: ['./empleados-principal.component.css'],
  providers: [MessageService, DialogService]
})
export class EmpleadosPrincipalComponent implements OnInit {

  empleados:  UpEmpleado[] = []
  puestos:    Item[] = []
  estados:    Item[] = [
    {label: 'Activo', value: true},
    {label: 'Inactivo', value: false}
  ]

  constructor( 
    private empleadosServ: EmpleadosService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.verificarEstado()

    this.sharedService.cambiarEstado(true)

    forkJoin([
      this.empleadosServ.getEmpleados(),
      this.empleadosServ.getPuestos()
    ])
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (value) => {
          const [empleadosR, puestosR] = value
          this.empleados = empleadosR.data
          this.puestos = puestosR.data.map(puesto => ({value: puesto.chpuesto, label: puesto.chpuesto}))
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
    const index = this.empleados.findIndex(({nunum_empleado_rr_hh}) => nunum_empleado_rr_hh === id)
    if(index >= 0) {
      this.sharedService.cambiarEstado(true)
      this.empleadosServ.toggleEstado(!activo, id, false)
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (data) => {
            this.empleados.at(index).boactivo = !activo
            this.messageService.add({ severity: 'success', summary: 'Registro actualizado', detail: `El registro ha sido ${activo ? 'deshabilitado' : 'habilitado'}.` })
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
        })
    }
  }

  mostrarProyectos(id: number) {
    this.dialogService.open(MostrarProyectosComponent, {
      header: 'Proyectos del empleado',
      width: '50%',
      contentStyle: {overflow: 'auto'},
      data: {
        id
      }
    })
  }

}
