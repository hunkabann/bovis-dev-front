import { Component, Input, OnInit } from '@angular/core';
import { GastosIngresosSecciones, Rubro } from '../../models/pcs.model';
import { Mes } from 'src/models/general.model';

interface Props extends GastosIngresosSecciones {
  mesesProyecto: {
    mes: number,
    anio: number,
    desc: string
  }[]
}

@Component({
  selector: 'app-seccion-contenido',
  templateUrl: './seccion-contenido.component.html',
  styleUrls: ['./seccion-contenido.component.css']
})
export class SeccionContenidoComponent implements OnInit {

  @Input() seccion: Props;
  @Input() indexSeccion: number;
  @Input() secciones: GastosIngresosSecciones[];
  
  seccionesFormateadas: {
    titulo: string,
    reembolsable: boolean,
    rubros: Rubro[]
  }[] = [
    {
      titulo: 'Reembolsables',
      reembolsable: true,
      rubros: []
    },
    {
      titulo: 'No Reembolsables',
      reembolsable: false,
      rubros: []
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.seccionesFormateadas[0].rubros = [];
    this.seccionesFormateadas[1].rubros = [];
    this.seccion.rubros.forEach(rubro => {
      if(rubro.reembolsable) {
        this.seccionesFormateadas[0].rubros.push(rubro);
      } else {
        this.seccionesFormateadas[1].rubros.push(rubro);
      }
    });
  }
  
  modificarRubro(rubro: Rubro, seccionIndex: number, rubroIndex: number, idSeccion: number, reembolsable: boolean) {
    console.log('Hey there!')
  }
  
  calcularTotalPorcentajePorMes(seccionNombre: string, mes: Mes, isReembolsable: Boolean): number {
        // const seccion = this.secciones.find(ctrl => ctrl.seccion === seccionNombre);
    
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
                totalPorcentaje += porcentaje;
              }
            }
          });
        });
    
        return totalPorcentaje;
      }

}
