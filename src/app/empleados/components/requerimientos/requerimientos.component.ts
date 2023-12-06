import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { EmpleadosService } from '../../services/empleados.service';
import { Observable, finalize, forkJoin } from 'rxjs';
import { FiltrosRequerimientos, Requerimiento } from '../../Models/empleados';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { Location } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { Opcion } from 'src/models/general.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-requerimientos',
  templateUrl: './requerimientos.component.html',
  styleUrls: ['./requerimientos.component.scss'],
  providers: [MessageService]
})
export class RequerimientosComponent implements OnInit {

  activatedRoute    = inject(ActivatedRoute)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  empleadoService   = inject(EmpleadosService)
  location          = inject(Location)
  fb                = inject(FormBuilder)
  router            = inject(Router)
  userService       = inject(UserService)

  directores: Opcion[] = []
  proyectos:  Opcion[] = []
  puestos:    Opcion[] = []

  filtros$: Observable<FiltrosRequerimientos>
  filtros:  FiltrosRequerimientos = {}

  data: Requerimiento[] = []
  personas: Opcion[] = []
  
  requerimientoActual: number = null
  mostrarModal: boolean = false

  form = this.fb.group({
    persona: ['', Validators.required]
  })

  constructor() { }

  ngOnInit(): void {
    this.verificarEstado()

    this.sharedService.cambiarEstado(true)

    this.empleadoService.getRequerimientos(this.filtros)
      .subscribe({
        next: ({data}) => {
          this.data = data
          forkJoin([
            this.empleadoService.getDirectores(),
            this.empleadoService.getPuestos(),
          ])
          .pipe(
            finalize(() => {
              this.sharedService.cambiarEstado(false)
            })
          )
          .subscribe(([directoresR, puestosR]) => {
            this.directores = directoresR.data.map(director => ({name: director.nombre_persona, code: director.nunum_empleado_rr_hh.toString()}))
            this.puestos = puestosR.data.map(puesto => ({name: puesto.chpuesto, code: puesto.nukid_puesto.toString()}))
          })
        },
        error: (err) => {
          this.sharedService.cambiarEstado(false)
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
        }
      })
  }

  verificarEstado() {

    this.activatedRoute.queryParams.subscribe(params => {
      // Access query parameters
      const success = params['success']

      if(success) {
        Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Requerimiento guardado', detail: 'El requerimiento ha sido guardado.' }))
      }

      const urlWithoutQueryParams = this.location.path().split('?')[0];
      this.location.replaceState(urlWithoutQueryParams);
    });
  }

  mostrarModalPersonas(requerimiento: Requerimiento) {
    this.sharedService.cambiarEstado(true)
    this.empleadoService.getPersonasDisponibles()
      .pipe(finalize(() => {
        this.requerimientoActual = requerimiento.nukidrequerimiento
        this.mostrarModal = true
        this.sharedService.cambiarEstado(false)
      }))
      .subscribe({
        next: ({data}) => {
          this.personas = data.map(persona => ({
            name: `${persona.chnombre} ${persona.chap_paterno} ${persona.chap_materno ? persona.chap_materno : ''}`,
            code: persona.nukidpersona.toString()
          }))
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })
  }

  asignarPersona() {
    this.router.navigate(['/empleados/registro-empleado'], {queryParams: {id_persona: this.form.value.persona, id_requerimiento: this.requerimientoActual}})
  }

  onChangeFiltro(campo: string, {value: valor}: any) {
    this.filtros = {
      ...this.filtros,
      [campo]: valor
    }

    if(campo === 'idDirector') {
      this.getProyectos(valor)
    }

    this.sharedService.cambiarEstado(true)

    this.empleadoService.getRequerimientos(this.filtros)
      .pipe(
        finalize(() => {
          this.sharedService.cambiarEstado(false)
        })
      )
      .subscribe({
        next: ({data}) => this.data = data,
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })
  }

  getProyectos(valor: any) {
    this.sharedService.cambiarEstado(true)
    this.empleadoService.getProyectosPorDirector(valor)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => this.proyectos = data.map(proyecto => ({name: proyecto.proyecto, code: proyecto.numProyecto.toString()})),
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

}
