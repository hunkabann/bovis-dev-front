import { Component, OnInit, inject } from '@angular/core';
import { LazyLoadEvent, MessageService, PrimeNGConfig } from 'primeng/api';
import { CieService } from '../../services/cie.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CALENDAR, TITLES, cieHeaders, cieHeadersFieldsLazy } from 'src/utils/constants';
import { CieRegistro } from '../../models/cie.models';
import { finalize, forkJoin } from 'rxjs';
import { Opcion } from 'src/models/general.model';
import { format } from 'date-fns';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-resultado-busqueda',
  templateUrl: './resultado-busqueda.component.html',
  styleUrls: ['./resultado-busqueda.component.css'],
  providers: [MessageService]
})
export class ResultadoBusquedaComponent implements OnInit {
  
  cieService      = inject(CieService)
  config          = inject(PrimeNGConfig)
  messageService  = inject(MessageService)
  sharedService   = inject(SharedService)
  activatedRoute  = inject(ActivatedRoute)
  location        = inject(Location)

  data: CieRegistro[] = []

  cieHeadersLocal:        string[] = cieHeaders
  cieHeadersFieldsLocal:  any = cieHeadersFieldsLazy
  conceptos:              Opcion[]
  cuentas:                Opcion[]
  empresas:               Opcion[]
  numsProyecto:           Opcion[]
  responsables:           Opcion[]
  clasificacionesPY:      Opcion[]

  concepto:         string
  cuenta:           string
  empresa:          string
  numProyecto:      number
  responsable:      string
  clasificacionPY:  string
  fechas:           Date[]

  firstLoading:     boolean = true

  noRegistros = 10
  totalRegistros = 0
  loading: boolean = false

  constructor() { }

  ngOnInit(): void {

    this.getConfigCalendar()

    this.cargarCatalogos()
    
    this.verificarEstado()

    // this.loadData({ first: 0, rows: this.noRegistros })
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

  loadData(event: LazyLoadEvent) {
    if(!this.firstLoading) {

      this.noRegistros = event.rows
      const page = (event.first / this.noRegistros) + 1;
      
      console.log(event);
  
      this.loading = true
  
      let mes     = null
      let anio    = null
      let mesFin  = null
      let anioFin = null
  
      if(this.fechas && this.fechas.length > 0) {
        if(this.fechas[0]) {
          mes   = +format(this.fechas[0], 'M')
          anio  = +format(this.fechas[0], 'Y')
        }
        if(this.fechas[1]) {
          mesFin   = +format(this.fechas[1], 'M')
          anioFin  = +format(this.fechas[1], 'Y')
        }
      }
      
      this.cieService.getRegistros(
          this.cuenta, 
          mes,
          anio,
          mesFin,
          anioFin,
          this.concepto,
          this.empresa,
          this.numProyecto,
          this.responsable,
          this.clasificacionPY,
          page, 
          this.noRegistros,
          event.sortField || null,
          event.sortOrder == 1 ? 'ASC' : 'DESC'
        )
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: ({data}) => {
            this.totalRegistros = data.totalRegistros
            this.data = data.registros
          },
          error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
        })
  
      // this.dataService.getData(page, this.pageSize).subscribe(response => {
      //   this.data = response.data; // Assuming API response contains data field with items
      //   this.totalRecords = response.totalRecords; // Assuming API response contains totalRecords field
      // });
    } else {
      this.firstLoading = false
    }
  }

  cargarCatalogos() {

    this.sharedService.cambiarEstado(true)

    forkJoin([
      this.cieService.getCieCuentas(),
      this.cieService.getCieConceptos(),
      this.cieService.getCieEmpresas(),
      this.cieService.getCieNumsProyecto(),
      this.cieService.getCieresponsables(),
      this.cieService.getCieClasificacionesPY()
    ])
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: (data) => {
        const [cuentasR, conceptosR, empresasR, numsProyectoR, responsablesR, clasificacionesPYR] = data
        this.cuentas            = cuentasR.data.map(registro => ({name: registro, code: registro}))
        this.conceptos          = conceptosR.data.map(registro => ({name: registro, code: registro}))
        this.empresas           = empresasR.data.map(registro => ({name: registro.chempresa, code: registro.chempresa}))
        this.numsProyecto       = numsProyectoR.data.map(registro => ({name: registro.toString(), code: registro.toString()}))
        this.responsables       = responsablesR.data.map(registro => ({name: registro, code: registro}))
        this.clasificacionesPY  = clasificacionesPYR.data.map(registro => ({name: registro, code: registro}))
      },
      error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
    })
  }

  filtrar() {
    this.loadData({ first: 0, rows: this.noRegistros })
  }

  limpiar() {
    this.cuenta = null
    this.fechas = []
    this.concepto = null
    this.empresa = null
    this.numProyecto = null
    this.responsable = null
    this.clasificacionPY = null
  }
  
  getConfigCalendar() {
    this.config.setTranslation({
      firstDayOfWeek: 1,
      dayNames: CALENDAR.dayNames,
      dayNamesShort: CALENDAR.dayNamesShort,
      dayNamesMin: CALENDAR.dayNamesMin,
      monthNames: CALENDAR.monthNames,
      monthNamesShort: CALENDAR.monthNamesShort,
      today: 'Hoy',
      clear: 'Limpiar',
    })
  }

}

// (onLazyLoad)="loadData($event)"