import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { GastosIngresosSecciones, ModificarRubroEmitterProps, Rubro, Fecha, GastosIngresosTotales } from '../../models/pcs.model';  //FEE libre
import { Mes } from 'src/models/general.model';
import { MessageService } from 'primeng/api'; // FEE libre
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'; //FEE libre
import { ModificarRubroComponent } from '../modificar-rubro/modificar-rubro.component';
import { ModificarRubroInflacionComponent } from '../modificar-rubro-inflacion/modificar-rubro-inflacion.component';
import {ModificarFacturacobComponent } from '../modificar-facturacob/modificar-facturacob.component'; //FEE libre

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

   ref: DynamicDialogRef; //FEE libre

  constructor( private messageService: MessageService) { }

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
      this.abreRubroFactCob(rubro.fechas, 3, rubroIndex);
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
        idSeccion: this.seccion.idSeccion, //Fórmula Inflación
        idRubro: rubro.idRubro, //Fórmula Inflación
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

  esEspecial(codigoSeccion: string){
    if(codigoSeccion.includes('02.0000') || codigoSeccion.includes('07.0000')) {
      return true;
    }
    else {
      return false;
    }
  }

  esSeccionFee(codigoSeccion: string){
    if(codigoSeccion.includes('07.0000')) {
      return true;
    }
    else {
      return false;
    }
  }

  abreRubroFactCob(rubro: any[], idFuente: number, rubroIndex: number) {
    //se mapea la entrada de Fecha a GastosIngresosTotales para que muestre la info la modal
    let lst = this.mapeaFechasToGastostotales(rubro);
    console.log('abreRubroFactCob Idseccion:'+this.seccion.idSeccion);
    this.ref = this.dialogService.open(ModificarFacturacobComponent, {
      header: 'Modificar ' + rubro[rubroIndex].rubro,
      width: '700px',
      data: {
        registros: lst,           // <<--- ARREGLO COMPLETO
        tipo: idFuente,             // <<--- 1 = factura, 2 = cobranza, 3 FEE libre
        numProyecto: this.seccion.numProyecto,
        idSeccion: this.seccion.idSeccion,
        idRubro: this.seccion.rubros[rubroIndex].idRubro
      }
    });

    // Recibir resultado
    let smensaje = 'FEE libre';
    this.ref.onClose.subscribe((resultado) => {
       if (!resultado?.rubroActualizado) {
    return;
  }

  const fechasActualizadas = resultado.rubroActualizado;

  // IMPORTANTE: actualizar el rubro original
  const rubroOriginal =
    this.seccionesFormateadas[0].rubros[rubroIndex]; // FEE libre siempre reembolsable

  rubroOriginal.fechas = rubroOriginal.fechas.map(f => {
    const nueva = fechasActualizadas.find(
      x => x.mes === f.mes && x.anio === f.anio
    );

    return nueva
      ? { ...f, porcentaje: nueva.totalPorcentaje }
      : f;
  });

  // Forzar refresco de PrimeNG
  this.seccionesFormateadas = [...this.seccionesFormateadas];

  this.messageService.add({
    severity: 'success',
    summary: 'Actualizado',
    detail: 'El total de FEE libre fue modificado correctamente'
  });
});
  }  

  mapeaFechasToGastostotales(lstEntrada: Fecha[]): GastosIngresosTotales[] {
    return lstEntrada.map(fecha => ({
      mes: fecha.mes,
      anio: fecha.anio,
      reembolsable: true,
      totalPorcentaje: fecha.porcentaje
    }));
  }
  //FEE libre F

}
