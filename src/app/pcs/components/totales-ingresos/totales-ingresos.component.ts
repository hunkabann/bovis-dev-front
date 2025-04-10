import { Component, Input, OnInit } from '@angular/core';
import { GastosIngresosTotales, TotalesIngresosFormateado, TotalesIngresosResponseData } from '../../models/pcs.model';
import { Mes } from '../../../../models/general.model';
import { KeyValue } from '@angular/common';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { formatearFechaEncabezado } from 'src/helpers/helpers';

@Component({
  selector: 'app-totales-ingresos',
  templateUrl: './totales-ingresos.component.html',
  styleUrls: ['./totales-ingresos.component.css']
})
export class TotalesIngresosComponent implements OnInit {

  @Input() totalesData: TotalesIngresosResponseData;

  registros: {
    ingreso: TotalesIngresosFormateado,
    facturacion: TotalesIngresosFormateado,
    cobranza: TotalesIngresosFormateado
  } = {
    ingreso: {
      titulo: 'Ingreso',
      tipos: {
        reembolsables: {
          titulo: 'Reembolsables',
          meses: [],
          registros: []
        },
        noreembolsables: {
          titulo: 'No Reembolsables',
          meses: [],
          registros: []
        }
      }
    },
    facturacion: {
      titulo: 'Facturación',
      tipos: {
        reembolsables: {
          titulo: 'Reembolsables',
          meses: [],
          registros: []
        },
        noreembolsables: {
          titulo: 'No Reembolsables',
          meses: [],
          registros: []
        }
      }
    },
    cobranza: {
      titulo: 'Cobranza',
      tipos: {
        reembolsables: {
          titulo: 'Reembolsables',
          meses: [],
          registros: []
        },
        noreembolsables: {
          titulo: 'No Reembolsables',
          meses: [],
          registros: []
        }
      }
    }
  };

  constructor() { }

  ngOnInit(): void {
    if(this.totalesData) {
      if(this.totalesData.ingreso) {
        this.totalesData.ingreso.forEach((ingreso: GastosIngresosTotales) => {
          this.registros.ingreso.tipos[ingreso.reembolsable ? 'reembolsables' : 'noreembolsables'].registros.push(ingreso);
          this.registros.ingreso.tipos[ingreso.reembolsable ? 'reembolsables' : 'noreembolsables'].meses.push({mes: ingreso.mes, anio: ingreso.anio, desc: formatearFechaEncabezado(ingreso.mes, ingreso.anio)});
        });
      }
      if(this.totalesData.facturacion) {
        this.totalesData.facturacion.forEach((facturacion: GastosIngresosTotales) => {
          this.registros.facturacion.tipos[facturacion.reembolsable ? 'reembolsables' : 'noreembolsables'].registros.push(facturacion);
          this.registros.facturacion.tipos[facturacion.reembolsable ? 'reembolsables' : 'noreembolsables'].meses.push({mes: facturacion.mes, anio: facturacion.anio, desc: formatearFechaEncabezado(facturacion.mes, facturacion.anio)});
        });
      }
      if(this.totalesData.cobranza) {
        this.totalesData.cobranza.forEach((cobranza: GastosIngresosTotales) => {
          this.registros.cobranza.tipos[cobranza.reembolsable ? 'reembolsables' : 'noreembolsables'].registros.push(cobranza);
          this.registros.cobranza.tipos[cobranza.reembolsable ? 'reembolsables' : 'noreembolsables'].meses.push({mes: cobranza.mes, anio: cobranza.anio, desc: formatearFechaEncabezado(cobranza.mes, cobranza.anio)});
        });
      }
    }
  }

  originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
    return 0;
  }
}
