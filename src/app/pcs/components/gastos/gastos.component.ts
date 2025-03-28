import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PcsService } from '../../services/pcs.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { obtenerMeses } from 'src/helpers/helpers';
import { DialogService } from 'primeng/dynamicdialog';
import { ModificarRubroComponent } from '../modificar-rubro/modificar-rubro.component';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { Mes } from 'src/models/general.model';
import { finalize } from 'rxjs';
import { Rubro, EtapasPorProyectoData, SumaFecha, GastosIngresosSecciones, ModificarRubroEmitterProps } from '../../models/pcs.model';
import { CatalogosService } from '../../services/catalogos.service';
import { CostosService } from 'src/app/costos/services/costos.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css'],
  providers: [MessageService, DialogService]
})

export class GastosComponent implements OnInit {

  dialogService = inject(DialogService);
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  pcsService = inject(PcsService);
  sharedService = inject(SharedService);
  catalogosService = inject(CatalogosService);
  costosService = inject(CostosService);

  cargando: boolean = true;
  proyectoSeleccionado: boolean = false;
  mesesProyecto: Mes[] = [];

  proyectoFechaInicio: Date;
  proyectoFechaFin: Date;
  numProyectorubro: number;

  idproyecto: number;

  costoMensualEmpleado: number;

  sumacolumna: number;

  total: number;
  cantidad: number;

  mensajito: string;

  cantidadMesesTranscurridos: number;
  seccionesCargado: boolean[] = [];
  seccionesData: any[] = [];

  constructor(private activatedRoute: ActivatedRoute, private router: Router) { }

  form = this.fb.group({
    numProyecto: [0, Validators.required],
    secciones: this.fb.array([]),
    etapas: this.fb.array([])
  });


  get secciones() {
    return this.form.get('secciones') as FormArray;
  }

  rubros(seccionIndex: number) {
    return (this.secciones.at(seccionIndex).get('rubros') as FormArray);
  }

  fechas(seccionIndex: number, rubroIndex: number) {
    return (this.rubros(seccionIndex).at(rubroIndex).get('fechas') as FormArray);
  }

  sumafechas(seccionIndex: number) {
    return (this.secciones.at(seccionIndex).get('sumaFechas') as FormArray);
  }


  async ngOnInit(): Promise<void> {
    this.pcsService.cambiarEstadoBotonNuevo(false);

    this.catalogosService.obtenerParametros()
      .subscribe(params => {
        if (params.proyecto) {
          this.idproyecto = params.proyecto;
        }
      });

    if (this.idproyecto) {
      //console.log("Gastos.components Entro al this.idproyecto " + this.idproyecto)
      this.cargando = true;
      this.numProyectorubro = this.idproyecto;
      this.cargarInformacion(this.idproyecto);
    } else {
      this.pcsService.obtenerIdProyecto()
        .subscribe(numProyecto => {
          this.proyectoSeleccionado = true;
          if (numProyecto) {
            // this.sharedService.cambiarEstado(true)
            this.cargando = true;
            this.numProyectorubro = numProyecto;
            this.cargarInformacion(numProyecto);
          } else {
            console.log('No hay proyecto');
          }
        });
    }

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
       
        itemlabel : 'Gastos'
      },
      queryParamsHandling: 'merge'
    })
  }

  filterReembolsables(rubros: any[]): any[] {
    return rubros.filter(rubro => rubro.value.reembolsable === true);
  }

  filterNoReembolsables(rubros: any[]): any[] {
    return rubros.filter(rubro => rubro.value.reembolsable === false || rubro.value.reembolsable === null);
  }

  async cargarInformacion(numProyecto: number) {

    this.mesesProyecto = null;
    this.secciones.clear();

    this.pcsService.obtenerGastosIngresosSeccionesNuevo(numProyecto)
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: async ({ data }) => {
          this.mesesProyecto = await obtenerMeses(this.proyectoFechaInicio, this.proyectoFechaFin);

          await Promise.all(data.map(async (seccion, seccionIndex) => {
            this.secciones.push(this.fb.group({
              idSeccion: [seccion.idSeccion],
              codigo: [seccion.codigo],
              seccion: [seccion.seccion],
              rubros: this.fb.array([]),
              sumaFechas: this.fb.array([])
            }));
          }))
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      });


    this.catalogosService.obtenerParametros()
      .subscribe(params => {
        if (params.proyecto) {
          this.idproyecto = params.proyecto
        }
      });
  }

  async cargarInformacionSeccion(event: any) {
    const { index } = event;
    this.pcsService.obtenerInformacionGastosIngresos(this.idproyecto, 'gasto', this.secciones.value.at(index).seccion)
      .pipe(finalize(() => this.seccionesCargado[index] = true))
      .subscribe({
        next: async (result) => {
          const { data } = result;
          const seccion = data?.secciones[0] || null;
          if(seccion) {
            const mesesProyecto = obtenerMeses(new Date(data.fechaIni), new Date(data.fechaFin));
            this.seccionesData[index] = {
              ...seccion,
              mesesProyecto,
              fechaIni: data.fechaIni,
              fechaFin: data.fechaFin,
              numProyecto: data.numProyecto
            };
          }
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      });
  }

  formateaValor(valor) {
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

  padTwoDigits(num: number) {
    return num.toString().padStart(2, "0");
  }

}
