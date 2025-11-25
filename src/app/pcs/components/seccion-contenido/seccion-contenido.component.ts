import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { GastosIngresosSecciones, ModificarRubroEmitterProps, Rubro } from '../../models/pcs.model';
import { Mes } from 'src/models/general.model';
import { DialogService } from 'primeng/dynamicdialog';
import { ModificarRubroComponent } from '../modificar-rubro/modificar-rubro.component';

interface Props extends GastosIngresosSecciones {
  fechaIni: Date,
  fechaFin: Date,
  numProyecto: number,
  mesesProyecto: {
    mes: number,
    anio: number,
    desc: string
  }[]
}

@Component({
  selector: 'app-seccion-contenido',
  templateUrl: './seccion-contenido.component.html',
  styleUrls: ['./seccion-contenido.component.css'],
  providers: [DialogService]
})
export class SeccionContenidoComponent implements OnInit {

  dialogService = inject(DialogService);

  @Input() seccion: Props;
  @Input() indexSeccion: number;
  @Input() secciones: GastosIngresosSecciones[];
  @Input() esEditable: boolean = false;
  @Input() mostrarNoReembolsables: boolean = true;
  @Input() nombrePaginaPadre: string; //LEO 2025-10-09 Puntos Bugs y Mejoras
  @Output() modificarRubroEvent = new EventEmitter<ModificarRubroEmitterProps>();

  
  seccionesFormateadas: {
    titulo: string,
    reembolsable: boolean,
    rubros: Rubro[]
  }[] = [
    {
      titulo: 'Reembolsables',
      reembolsable: true,
      rubros: []
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.seccionesFormateadas[0].rubros = [];
    if (this.mostrarNoReembolsables) {
      this.seccionesFormateadas[1] = {
        titulo: 'No Reembolsables',
        reembolsable: false,
        rubros: []
      };
      this.seccionesFormateadas[1].rubros = [];
    }
    this.seccion.rubros.forEach((rubro) => {
      if (rubro.reembolsable) {
        this.seccionesFormateadas[0].rubros.push(rubro);
      } else if (this.mostrarNoReembolsables) {
        this.seccionesFormateadas[1].rubros.push(rubro);
      }
    });
  }
  
  // modificarRubro(rubro: Rubro, seccionIndex: number, rubroIndex: number, idSeccion: number, reembolsable: boolean) {
  modificarRubro(rubro: Rubro, rubroIndex: number) {
    // this.modificarRubroEvent.emit({rubro, idSeccion, fechaIni: this.seccion.fechaIni, fechaFin: this.seccion.fechaFin});
    this.dialogService.open(ModificarRubroComponent, {
      header: rubro.rubro,
      width: '50%',
      contentStyle: { overflow: 'auto' },
      data: {
        rubro,
        idSeccion: this.seccion.idSeccion,
        fechaInicio: this.seccion.fechaIni,
        fechaFin: this.seccion.fechaFin,
        numProyecto: this.seccion.numProyecto,
      }
    }).onClose.subscribe((result) => {
      if (result && result.rubro) {
        const rubroRespuesta = result.rubro as Rubro;
        this.seccionesFormateadas[rubroRespuesta.reembolsable ? 0 : 1].rubros[rubroIndex] = {
          ...rubro,
          ...rubroRespuesta,
        };
      }
    });
  }
  
  calcularTotalPorcentajePorMes(codigo: string, mes: Mes, isReembolsable: Boolean): number {
        // const seccion = this.secciones.find(ctrl => ctrl.seccion === seccionNombre);
        // if(!isReembolsable) {
        //   return 0;
        // }

        let totalPorcentaje = 0.0;
  
        const rubros = this.seccion.rubros;
    
        rubros.forEach((rubro, i) => {
          const fechas = rubro.fechas;
    
          fechas.forEach((fecha, j) => {
            const mesRegistro = fecha;
    
            if (mes.mes === mesRegistro.mes &&
              mes.anio === mesRegistro.anio &&
              (isReembolsable === (rubro.reembolsable != null ? rubro.reembolsable : false))
            ) {
              const porcentaje = parseFloat((fecha.porcentaje || 0).toString());
              if (!isNaN(porcentaje)) {
                if(codigo == '02.0000' && rubro.costoMensual) {  
                  if(rubro.costoMensual) {
                    totalPorcentaje += (rubro.costoMensual * porcentaje) / 100;
                  } else {
                    totalPorcentaje += 0;
                  }   
                } else {
                  totalPorcentaje += porcentaje
                }
              }
            }
          });
        });
    
        return totalPorcentaje;
      }
  
  calcularSubTotal(rubros: Rubro[]): number {
    let subtotal = 0
    rubros.forEach(rubro => {
      rubro.fechas.forEach(fecha => {
        if(this.seccion.codigo == '02.0000' && rubro.costoMensual) {  
          if(rubro.costoMensual) {
            subtotal += (rubro.costoMensual * fecha.porcentaje) / 100;
          } else {
            subtotal += 0;
          }   
        } else {
          subtotal += +fecha.porcentaje
        }
      })
    });
    return subtotal;
  }

}
