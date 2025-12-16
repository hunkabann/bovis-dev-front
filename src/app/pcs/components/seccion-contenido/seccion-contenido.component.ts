import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { GastosIngresosSecciones, ModificarRubroEmitterProps, Rubro } from '../../models/pcs.model';
import { Mes } from 'src/models/general.model';
import { DialogService } from 'primeng/dynamicdialog';
import { ModificarRubroComponent } from '../modificar-rubro/modificar-rubro.component';
import { ModificarRubroInflacionComponent } from '../modificar-rubro-inflacion/modificar-rubro-inflacion.component';

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
    this.seccion.fechaIni = new Date(this.seccion.fechaIni); //LEO Fórmula Inflación  
    
    //FEE libre I
    if(this.seccion.idSeccion == 17) {
      //si se trata de "FEE  libre" que muestre el btn
      this.esEditable = true;
    }
    //FEE libre F
  }
  
  // modificarRubro(rubro: Rubro, seccionIndex: number, rubroIndex: number, idSeccion: number, reembolsable: boolean) {
  modificarRubro(rubro: Rubro, rubroIndex: number, idSeccionRubro: number) {
    // this.modificarRubroEvent.emit({rubro, idSeccion, fechaIni: this.seccion.fechaIni, fechaFin: this.seccion.fechaFin});
    console.log('rubro.idRubro:'+ rubro.idRubro)
    //LEO Fórmula Inlfación I 
    //se reemplaza el code anterior para colocar una función que haga el mismo llamado y se vea más limpio la decisión
    // entre que ventana debe abrir
    if(rubro.idRubro==2) {
      // abre para datos de Inlfaciión Anual
      this.abreRubroInflacion(rubro, rubroIndex);
      //this.abreRubro(rubro, rubroIndex); //se coloca para el cambio de Invertir habilitar "CostoEmpleado" en StaffingPlan
    }
    //FEE libre I
    else if(idSeccionRubro == 17){
      console.log('Es para FEE libre')
    }
    //FEE libre F
    else {
      //abre para modificar como siempre
      this.abreRubro(rubro, rubroIndex);
    }
    //LEO Fórmula Inlfación F
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

  //LEO Fórmula Inflación I
  //abreRubro abre la modal que se viene manejando siempre 
  abreRubro(rubro: Rubro, rubroIndex: number) {
    // this.modificarRubroEvent.emit({rubro, idSeccion, fechaIni: this.seccion.fechaIni, fechaFin: this.seccion.fechaFin});
    console.log('Abre Modal Modificar Rubro IdRubro:'+ rubro.idRubro)
    this.dialogService.open(ModificarRubroComponent, {
      header: rubro.rubro ,
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

  //abreRubroInflacion abre la modal para modificar datos de Inflación Anual
  abreRubroInflacion(rubro: Rubro, rubroIndex: number) {
    console.log('Abre Modal Modificar-RubroInflacion IdRubro:'+ rubro.idRubro + ' idSeccion:'+this.seccion.idSeccion + ' Reembolsable:'+rubro.reembolsable
      +' SeccionFechaIni:'+this.seccion.fechaIni)
    this.dialogService.open(ModificarRubroInflacionComponent, {
      header: rubro.rubro,
      width: '50%',
      contentStyle: { overflow: 'auto' },
      data: {
        rubroEnvio: rubro,
        fechaInicio: this.seccion.fechaIni,
        mesInicio: this.seccion.fechaIni.getMonth()+1,
        numProyecto: this.seccion.numProyecto,
        reembolsable: rubro.reembolsable,
      }
    }).onClose.subscribe((result) => {
      
    });
  }    
  //LEO Fórmula Inflación F

  //FEE libre I
  muestraUnidad(codigoSeccion: string){
    if(!codigoSeccion.includes('02.0000') && !codigoSeccion.includes('07.0000')) {
      return true;
    }
    else {
      return false;
    }
  }

  //FEE libre F
}
