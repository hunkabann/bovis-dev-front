import { Component, OnInit,ViewChild, inject } from '@angular/core'; //LEO Linea Base
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { finalize, forkJoin } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';
import { Opcion } from 'src/models/general.model';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { CatalogosService } from '../services/catalogos.service';
import { PcsService } from '../services/pcs.service';
import { Calendar } from 'primeng/calendar'; //LEO Linea Base
import { DateUtils } from 'src/app/shared/utils/date-utils'; // LineaBase

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

  stilovisible: boolean = false
  stilovisibleCal: boolean = false

  items: MenuItem[] = [
    { label: 'IP', routerLink: 'ip' },
    { label: 'Staffing Plan', routerLink: 'staffing-plan' },
    { label: 'Gastos', routerLink: 'gastos' },
    { label: 'Ingresos', routerLink: 'ingresos' },
    { label: 'Control', routerLink: 'control' }
  ]

  activeItem: MenuItem;
  proyectos: Opcion[] = []
  proyectoId: number = null;
  fecha_base: Date = null;//LEO Linea Base
  fechaSeleccionadaPorUsuario = false; // Para saber si el usuario cambió la fecha //LEO Linea Base
  @ViewChild('fechaBaseRef') fechaBaseRef!: Calendar;//LEO Linea Base

  constructor() { }

  ngOnInit(): void {
    this.sharedService.cambiarEstado(true)

    //LEO I Linea Base
    if(this.fecha_base == null)
    {
      this.fecha_base = new Date();
    }
    //LEO F Linea Base

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
      const itemlabel = params['itemlabel']
      const fechaParam = params['fecha_base']; // leer la fecha //LEO Linea Base

      if (proyecto) {
        this.proyectoId = proyecto
        this.pcsService.enviarIdProyecto(this.proyectoId)

        this.cambiarTabs(esEdicion,itemlabel)
      }

      //LEO I Linea Base
      // asignar fecha desde los params si existe
      if (fechaParam) {
        const partes = fechaParam.split(/[\/\-]/); // acepta 2025/10/26 o 2025-10-26
        const year = parseInt(partes[0], 10);
        const month = parseInt(partes[1], 10) - 1;
        const day = parseInt(partes[2], 10);
        this.fecha_base = new Date(year, month, day); // crea fecha local, sin UTC
        this.fechaSeleccionadaPorUsuario = true;
      }
      //LEO F Linea Base
    });
  }

  onActiveItemChange(event: any) {
    this.activeItem = event

   // console.log('VALOR DEL ITEM ----------------->>>>> ' + event)

  if(event === 'IP'){      
      this.stilovisibleCal = true   
      this.deshabilitaCalendario(false); // Habilita el calendario //LEO Linea Base
  }else{
    this.stilovisibleCal = true
    this.deshabilitaCalendario(false);// Deshabilita el calendario //LEO Linea Base
  }

    this.proyectoId = null;
  }

  cargarProyecto(esEdicion: boolean = false) {
    if (!esEdicion) {
      this.proyectoId = null
    }

    //LEO I Linea Base
    // Solo poner la fecha actual si el usuario no la ha cambiado antes
    if (!this.fechaSeleccionadaPorUsuario) {
      this.fecha_base = new Date();
    }
    //LEO F Linea Base

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        proyecto: esEdicion ? this.proyectoId : null,
        esEdicion: esEdicion ? 1 : null,
        nuevo: !esEdicion,
        fecha_base: this.fecha_base ? DateUtils.formatDate_yyyyMMdd(this.fecha_base,"-") : DateUtils.getToday_yyyyMMdd("yyyy/MM/dd","-") //LEO Linea Base
        //fechaBase: this.fecha_base //LEO Linea Base
      }
    })

    this.cambiarTabs(false,'')
  }

  cambiarTabs(esEdicion: boolean = false,itemlabel : string ) {
    this.items = this.items.map(item => ({
      ...item,
      queryParams: {
        proyecto: this.proyectoId,
        esEdicion: esEdicion ? 1 : null,
        fecha_base: this.fecha_base ? DateUtils.formatDate_yyyyMMdd(this.fecha_base,"-") : DateUtils.getToday_yyyyMMdd("yyyy/MM/dd","-") //LEO Linea Base
      },
      
    }))


    if( itemlabel == 'IP' || itemlabel == 'undefined' || itemlabel == '' || itemlabel == null){
       this.stilovisible = false
    }else{
      this.stilovisible = true 
    }


    //const found = this.items.find((element) => element.label );

//console.log(esEdicion);
    console.log('VALOR DEL ITEM ----------------->>>>> ' + itemlabel )

    
   
  }

  //LEO I Linea Base
  onFechaSeleccionada(event: Date) {
    this.fechaSeleccionadaPorUsuario = true;
    this.fecha_base = event;

    // Actualiza el queryParam "fecha_base" en la URL sin recargar la página
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge', // mantiene los demás params (proyecto, esEdicion, etc.)
      queryParams: {
        fecha_base: DateUtils.formatDate_yyyyMMdd(this.fecha_base,"-"),
      }
    });
  }

  deshabilitaCalendario(bHabilita: boolean)
  {
    if (this.fechaBaseRef) {
      this.fechaBaseRef.disabled = bHabilita;
    }
  }

  private formatFechaQuery(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    //return `${year}-${month}-${day}`; // formato ISO corto //asi resta 1 día a la fecha
    return `${year}/${month}/${day}`; // usa / para evitar que JS lo interprete como UTC
  }

  //LEO F Linea Base
}
