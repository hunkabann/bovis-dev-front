import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { finalize, forkJoin } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';
import { Opcion } from 'src/models/general.model';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { CatalogosService } from '../services/catalogos.service';
import { PcsService } from '../services/pcs.service';

@Component({
  selector: 'app-pcs',
  templateUrl: './pcs.component.html',
  styleUrls: ['./pcs.component.css']
})
export class PcsComponent implements OnInit {

  sharedService = inject(SharedService)
  messageService = inject(MessageService)
  timesheetService = inject(TimesheetService)
  router = inject(Router)
  activatedRoute = inject(ActivatedRoute)
  catalogosService = inject(CatalogosService)
  pcsService = inject(PcsService)

  items: MenuItem[] = [
    { label: 'IP', routerLink: 'ip' },
    { label: 'Staffing Plan', routerLink: 'staffing-plan' },
    { label: 'Gastos', routerLink: 'gastos' },
    { label: 'Ingresos', routerLink: 'ingresos' },
    { label: 'Control', routerLink: 'control' },
    { label: 'PPA-KPI', routerLink: 'ppa-kpi' }
  ]

  activeItem: MenuItem;
  proyectos: Opcion[] = []
  proyectoId: number = null;

  constructor() { }

  ngOnInit(): void {
    this.sharedService.cambiarEstado(true)

    forkJoin([
      this.timesheetService.getCatProyectos()
    ])
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (value) => {
          const [proyectosR] = value
          this.proyectos = proyectosR.data.map(proyecto => ({ code: proyecto.numProyecto.toString(), name: `${proyecto.numProyecto.toString()} - ${proyecto.nombre}` }))

          this.verificarEstado()
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })

    this.pcsService.obtenerNuevoProyecto()
      .subscribe(proyecto => {
        this.proyectos.push({ code: proyecto.id.toString(), name: `${proyecto.id.toString()} - ${proyecto.nombre}` })
        // this.proyectoId = proyecto.id
      })
  }

  verificarEstado() {
    this.activatedRoute.queryParams.subscribe(params => {
      const proyecto = params['proyecto']
      const esEdicion = params['esEdicion']

      if (proyecto) {
        this.proyectoId = proyecto
        this.pcsService.enviarIdProyecto(this.proyectoId)

        this.cambiarTabs(esEdicion)
      }
    });
  }

  onActiveItemChange(event: any) {
    this.activeItem = event
    this.proyectoId = null;
  }

  cargarProyecto(esEdicion: boolean = false) {
    if (!esEdicion) {
      this.proyectoId = null
    }
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        proyecto: esEdicion ? this.proyectoId : null,
        esEdicion: esEdicion ? 1 : null,
        nuevo: !esEdicion
      }
    })

    this.cambiarTabs()
  }

  cambiarTabs(esEdicion: boolean = false) {
    this.items = this.items.map(item => ({
      ...item,
      queryParams: {
        proyecto: this.proyectoId,
        esEdicion: esEdicion ? 1 : null
      }
    }))
  }

}
