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
import { Rubro, GastosIngresosTotales } from '../../models/pcs.model';
import { CatalogosService } from '../../services/catalogos.service';
import { ActivatedRoute, Router } from '@angular/router';



@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.css'],
  providers: [MessageService, DialogService]
})
export class IngresosComponent implements OnInit {

  fechaInicio: Date;
  fechaFin: Date;

  noFactura: string;

  dialogService = inject(DialogService)
  fb = inject(FormBuilder)
  messageService = inject(MessageService)
  pcsService = inject(PcsService)
  sharedService = inject(SharedService)
  catalogosService = inject(CatalogosService)

  cargando: boolean = true
  proyectoSeleccionado: boolean = false
  mesesProyecto: Mes[] = []


  proyectoFechaInicio: Date
  proyectoFechaFin: Date

  idproyecto: number;

  totalRecords: number = 0;

  IDEmpresa: number;
  IDCliente: number;

  isrembolsable: boolean = false

  rembolsable: string;

  totaless: GastosIngresosTotales[] = []

  SumaIngresos = 0;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) { }
  form = this.fb.group({
    numProyecto: [0, Validators.required],
    secciones: this.fb.array([]),
    totales: this.fb.array([])
  })

  get secciones() {
    return this.form.get('secciones') as FormArray
  }

  rubros(seccionIndex: number) {
    return (this.secciones.at(seccionIndex).get('rubros') as FormArray)
  }

  fechas(seccionIndex: number, rubroIndex: number) {
    return (this.rubros(seccionIndex).at(rubroIndex).get('fechas') as FormArray)
  }

  fechasIngreso(seccionIndex: number) {
    return (this.secciones.at(seccionIndex).get('totales') as FormArray)
  }

  get totals() {
    return this.form.get('totales') as FormArray
  }


  ngOnInit(): void {
    this.pcsService.cambiarEstadoBotonNuevo(false);

    this.catalogosService.obtenerParametros()
      .subscribe(params => {
        if (!params.proyecto) {
          console.log("params.proyecto:" + params.proyecto);
        } else {
          this.idproyecto = params.proyecto;
          console.log("else params.proyecto:" + params.proyecto);
        }
      });

    if (this.idproyecto) {
      console.log("Gastos.components Entro al this.idproyecto " + this.idproyecto);
      this.cargando = true;
      this.cargarInformacion(this.idproyecto);
    } else {
      this.pcsService.obtenerIdProyecto()
        .subscribe(numProyecto => {
          this.proyectoSeleccionado = true;
          if (numProyecto) {
            this.cargando = true;
            this.cargarInformacion(numProyecto);
          } else {
            console.log('No hay proyecto');
          }
        });
    }

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
       
        itemlabel : 'Ingresos'
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
    this.pcsService.obtenerGastosIngresosSecciones(numProyecto, 'ingreso')
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: async ({ data }) => {
          this.totaless = data.totales;

          data.totales.forEach(total => {
            // console.log('total.reembolsable: ' + total.reembolsable);
            // console.log('total.mes: ' + total.mes);
            // console.log('total.anio: ' + total.anio);
            // console.log('total.totalPorcentaje: ' + total.totalPorcentaje);
            this.SumaIngresos += +total.totalPorcentaje;
          });

          this.proyectoFechaInicio = new Date(data.fechaIni);
          this.proyectoFechaFin = new Date(data.fechaFin);
          this.mesesProyecto = await obtenerMeses(this.proyectoFechaInicio, this.proyectoFechaFin);

          data.secciones.forEach((seccion, seccionIndex) => {
            // Agregar la sección
            this.secciones.push(this.fb.group({
              idSeccion: [seccion.idSeccion],
              codigo: [seccion.codigo],
              seccion: [seccion.seccion],
              rubros: this.fb.array([]),
            }));

            const rubrosUnicos = [];
            // Filtramos los rubros y aseguramos que no se repitan
            seccion.rubros.forEach((rubro) => {
              // Comprobamos si el rubro ya ha sido agregado
              if (!rubrosUnicos.some(existingRubro => existingRubro.codigo === rubro.idRubro)) {
                rubrosUnicos.push(rubro);
              }
            });

            // Agregar los rubros únicos a la sección
            rubrosUnicos.forEach((rubro, rubroIndex) => {
              this.rubros(seccionIndex).push(this.fb.group({
                ...rubro,
                fechas: this.fb.array([]),
              }));

              // Agregar las fechas correspondientes al rubro
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
                } else {
                  this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
                    id: 0,
                    rubroReembolsable: rubro.reembolsable,
                    mes: mes.mes,
                    anio: mes.anio,
                    porcentaje: 0,
                  }));
                }
              });
            });
          });
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      });
  }

  modificarRubro(rubro: Rubro, seccionIndex: number, rubroIndex: number) {
    this.dialogService.open(ModificarRubroComponent, {
      header: rubro.rubro,
      width: '50%',
      contentStyle: { overflow: 'auto' },
      data: {
        rubro,
        fechaInicio: this.proyectoFechaInicio,
        fechaFin: this.proyectoFechaFin
      }
    })
      .onClose.subscribe((result) => {
        if (result && result.rubro) {

          const rubroRespuesta = result.rubro as Rubro

          this.rubros(seccionIndex).at(rubroIndex).patchValue({
            unidad: rubroRespuesta.unidad,
            cantidad: rubroRespuesta.cantidad,
            reembolsable: rubroRespuesta.reembolsable,
            aplicaTodosMeses: rubroRespuesta.aplicaTodosMeses
          });

          this.fechas(seccionIndex, rubroIndex).clear();

          rubroRespuesta.fechas.forEach(fechaRegistro => {
            this.fechas(seccionIndex, rubroIndex).push(this.fb.group({
              id: fechaRegistro.id,
              mes: fechaRegistro.mes,
              anio: fechaRegistro.anio,
              porcentaje: fechaRegistro.porcentaje
            }));
          });
        }
      });
  }

}
