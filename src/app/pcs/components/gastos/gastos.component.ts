import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PcsService } from '../../services/pcs.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { obtenerMeses } from 'src/helpers/helpers';
import { DialogService } from 'primeng/dynamicdialog';
import { ModificarRubroComponent } from '../modificar-rubro/modificar-rubro.component';
import { TITLES } from 'src/utils/constants';
import { Mes } from 'src/models/general.model';
import { finalize } from 'rxjs';
import { Rubro, EtapasPorProyectoData, SumaFecha } from '../../models/pcs.model';
import { CatalogosService } from '../../services/catalogos.service';
import { CostosService } from 'src/app/costos/services/costos.service';
import { Injectable } from '@angular/core';
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

  //sumaTotales:        SumaFecha[] = []
  //private spinner: NgxSpinnerService

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


  calcularTotalPorcentajePorMes(seccionNombre: string, mes: Mes, isReembolsable: Boolean): number {
    const seccion = this.secciones.controls.find(ctrl => ctrl.value.seccion === seccionNombre);

    let totalPorcentaje = 0.0;
    const rubros = seccion.get('rubros') as FormArray;

    rubros.controls.forEach((rubro, i) => {
      // console.log(rubro.get('reembolsable').value);
      const fechas = rubro.get('fechas') as FormArray;

      fechas.controls.forEach((fechaControl, j) => {
        const month = fechaControl.value;

        if (mes.mes === month.mes &&
          mes.anio === month.anio &&
          (isReembolsable === (rubro.get('reembolsable').value != null ? rubro.get('reembolsable').value : false))
        ) {
          const porcentaje = parseFloat(fechaControl.value.porcentaje);
          // console.log('Porcentaje encontrado para', rubro.get('rubro').value, 'del', mes.desc, ':', porcentaje);
          if (!isNaN(porcentaje)) {
            totalPorcentaje += porcentaje;
          }
        }
      });
    });

    // console.log('Total porcentaje de', seccionNombre, 'del', mes.desc, ':', totalPorcentaje);
    return totalPorcentaje;
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

    this.pcsService.obtenerGastosIngresosSecciones(numProyecto)
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: async ({ data }) => {
          this.proyectoFechaInicio = new Date(data.fechaIni);
          this.proyectoFechaFin = new Date(data.fechaFin);

          this.mesesProyecto = await obtenerMeses(this.proyectoFechaInicio, this.proyectoFechaFin);

          await Promise.all(data.secciones.map(async (seccion, seccionIndex) => {
            this.secciones.push(this.fb.group({
              idSeccion: [seccion.idSeccion],
              codigo: [seccion.codigo],
              seccion: [seccion.seccion],
              rubros: this.fb.array([]),
              sumaFechas: this.fb.array([])
            }));

            seccion.rubros.forEach((rubro, rubroIndex) => {

              // Agregamos los rubros por seccion
              this.rubros(seccionIndex).push(this.fb.group({
                ...rubro,
                fechas: this.fb.array([])
              }));

              if (seccion.seccion.includes('COSTOS DIRECTOS DE SALARIOS')) {
                this.costoMensualEmpleado = 0;

                // Agreamos las fechas por rubro
                rubro.fechas.forEach(fecha => {
                  if (rubro.costoMensual != null) {
                    this.costoMensualEmpleado = rubro.costoMensual;
                  }

                  this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
                    id: fecha.id,
                    mes: fecha.mes,
                    anio: fecha.anio,
                    porcentaje: this.formateaValor((fecha.porcentaje * this.costoMensualEmpleado) / 100)
                  }));
                });
              } else {

                // Agreamos las fechas por rubro
                this.mesesProyecto.forEach(mes => {
                  const mesRegistro = rubro.fechas.find(r =>
                    r.mes === mes.mes && r.anio === mes.anio
                  );

                  if (mesRegistro) {
                    this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
                      id: mesRegistro.id,
                      rubroReembolsable: rubro.reembolsable,
                      mes: mesRegistro.mes,
                      anio: mesRegistro.anio,
                      porcentaje: mesRegistro.porcentaje,
                    }));
                  }
                  else {
                    // console.log('Agregando registro:', mes, 'con porcentaje:', 0);
                    this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
                      id: 0,
                      rubroReembolsable: rubro.reembolsable,
                      mes: mes.mes,
                      anio: mes.anio,
                      porcentaje: 0,
                    }));
                  }
                });

              }
            });
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



  modificarRubro(rubro: Rubro, seccionIndex: number, rubroIndex: number, idSeccion: number, reembolsable: boolean) {
    rubro.reembolsable = reembolsable;

    this.dialogService.open(ModificarRubroComponent, {
      header: rubro.rubro,
      width: '50%',
      contentStyle: { overflow: 'auto' },
      data: {
        rubro,
        idSeccion: idSeccion,
        fechaInicio: this.proyectoFechaInicio,
        fechaFin: this.proyectoFechaFin,
        numProyecto: this.numProyectorubro,
      }
    }).onClose.subscribe((result) => {
      if (result && result.rubro) {
        const rubroRespuesta = result.rubro as Rubro;

        this.rubros(seccionIndex).at(rubroIndex).patchValue({
          unidad: rubroRespuesta.unidad,
          cantidad: rubroRespuesta.cantidad,
          reembolsable: rubroRespuesta.reembolsable,
          aplicaTodosMeses: rubroRespuesta.aplicaTodosMeses,
        });

        this.fechas(seccionIndex, rubroIndex).clear();

        const fechasFiltradas = rubroRespuesta.fechas.filter(fechaRegistro => {
          return reembolsable ? rubro.reembolsable : !rubro.reembolsable;
        });

        fechasFiltradas.forEach(fechaRegistro => {
          this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
            id: fechaRegistro.id,
            mes: fechaRegistro.mes,
            anio: fechaRegistro.anio,
            porcentaje: fechaRegistro.porcentaje,
          }));
        });

        this.cargarInformacion(this.numProyectorubro); 
      }
    });
  }

  formateaValor(valor) {
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

  padTwoDigits(num: number) {
    return num.toString().padStart(2, "0");
  }

}
