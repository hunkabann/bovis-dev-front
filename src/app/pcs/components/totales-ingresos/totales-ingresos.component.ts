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
      subtotal: 0,
      subtotalno: 0,
      meses: [],
      registros: []
    },
    facturacion: {
      titulo: 'Facturación',
      subtotal: 0,
      subtotalno: 0,
      meses: [],
      registros: []
    },
    cobranza: {
      titulo: 'Cobranza',
      subtotal: 0,
      subtotalno: 0,
      meses: [],
      registros: []
    }
  };

  constructor() { }

  ngOnInit(): void {
    if(this.totalesData) {
      if(this.totalesData.ingreso) {
        this.totalesData.ingreso.forEach((ingreso: GastosIngresosTotales) => {
        // Asegurar que el mes esté registrado
        if (!this.registros.ingreso.meses.some(m => m.mes === ingreso.mes && m.anio === ingreso.anio)) {
          this.registros.ingreso.meses.push({
            mes: ingreso.mes,
            anio: ingreso.anio,
            desc: formatearFechaEncabezado(ingreso.mes, ingreso.anio)
          });
        }

        // Guardar valores reembolsables y no reembolsables por separado
        if (ingreso.reembolsable) {
          this.registros.ingreso.subtotal += ingreso.totalPorcentaje;
        } else {
          this.registros.ingreso.subtotalno += ingreso.totalPorcentaje;
        }

        // Almacenamos ambos tipos de registros por separado
        this.registros.ingreso.registros.push(ingreso);
        });
      }

      if(this.totalesData.facturacion) {
        this.totalesData.facturacion.forEach((facturacion: GastosIngresosTotales) => {
          if (!facturacion.reembolsable) {
          this.registros.facturacion.subtotal += facturacion.totalPorcentaje;
          const existingRegistro = this.registros.facturacion.registros.find(registro => registro.mes === facturacion.mes && registro.anio === facturacion.anio && registro.reembolsable == false);
          if (existingRegistro) {
            existingRegistro.totalPorcentaje = facturacion.totalPorcentaje;
          } else {
            this.registros.facturacion.registros.push(facturacion);
          }
        }

          if (!this.registros.facturacion.meses.some(m => m.mes === facturacion.mes && m.anio === facturacion.anio)) {
            this.registros.facturacion.meses.push({mes: facturacion.mes, anio: facturacion.anio, desc: formatearFechaEncabezado(facturacion.mes, facturacion.anio)});
          }
        });
      }
      if(this.totalesData.cobranza) {
        this.totalesData.cobranza.forEach((cobranza: GastosIngresosTotales) => {
          this.registros.cobranza.subtotal += cobranza.totalPorcentaje;
          const existingRegistro = this.registros.cobranza.registros.find(registro => registro.mes === cobranza.mes && registro.anio === cobranza.anio && registro.reembolsable == false);
          if (existingRegistro) {
            existingRegistro.totalPorcentaje = cobranza.totalPorcentaje;
          } else {
            this.registros.cobranza.registros.push(cobranza);
          }
          if (!this.registros.cobranza.meses.some(m => m.mes === cobranza.mes && m.anio === cobranza.anio)) {
            this.registros.cobranza.meses.push({mes: cobranza.mes, anio: cobranza.anio, desc: formatearFechaEncabezado(cobranza.mes, cobranza.anio)});
          }
        });
      }
    }
  }

  originalOrder = (a: KeyValue<string, TotalesIngresosFormateado>, b: KeyValue<string, TotalesIngresosFormateado>): number => {
    return 0;
  }

  //LEO inputs para FEEs I
  // Añade estos dos métodos utilitarios para usar en el HTML
  filterReembolsables(ingresos: any[]): any[] {
    return ingresos?.filter(i => i.reembolsable === true) || [];
  }

  filterNoReembolsables(ingresos: any[]): any[] {
    return ingresos?.filter(i => i.reembolsable === false) || [];
  }

  guardar()
  {}
  //LEO inputs para FEEs F
}
