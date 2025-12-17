import { Component, OnInit, inject, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PcsService } from '../../services/pcs.service';
import { TITLES, errorsArray } from 'src/utils/constants';
import { obtenerMeses, descripcionMesAnio, deshabilitaControl } from 'src/helpers/helpers';
import { Fecha, Rubro, GastosIngresosTotales, FechaEntradaFacturaCob, FechaFormValue, FechaEntradaFEELibre } from '../../models/pcs.model';  //FEE libre
import { Mes } from 'src/models/general.model';
import { finalize } from 'rxjs';
import { facturaCancelacion } from 'src/app/facturacion/Models/FacturacionModels';


@Component({
    selector: 'app-modificar-facturacob',
    templateUrl: './modificar-facturacob.component.html',
    styleUrls: ['./modificar-facturacob.component.css'],
    providers: [MessageService]
})
export class ModificarFacturacobComponent implements OnInit {

  registrosEntrada: GastosIngresosTotales[] = [];
  tipo: number = 0;
  numProyecto: number = 0;
  idSeccion: number = 0; //FEE libre
  idRubro: number = 0; //FEE libre

  form = this.fb.group({
    numProyecto: [null],
    tipo: [null],
    fechas: this.fb.array([]),
  });

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private pcsService: PcsService,
    private messageService: MessageService
  ) {}

    get fechasFA() {
        //    return this.form.get('fechas') as FormArray
        return this.form.get('fechas') as FormArray<FormGroup>;
    }


  ngOnInit(): void {

    // Recibir datos enviados
    this.registrosEntrada = this.config.data.registros;
    this.tipo = this.config.data.tipo;
    this.numProyecto = this.config.data.numProyecto;
    this.idSeccion = this.config.data.idSeccion;
    this.idRubro = this.config.data.idRubro == null ? 0 : this.config.data.idRubro; //FEE libre

    // Setear valores al form
    this.form.patchValue({
      numProyecto: this.numProyecto,
      tipo: this.tipo
    });

    // Cargar fechas al FormArray
    this.registrosEntrada.forEach(r => {
      this.fechasFA.push(
        this.fb.group({
          mes: [r.mes],
          anio: [r.anio],
          desc: descripcionMesAnio(r.mes,r.anio),
          disabled: deshabilitaControl(r.mes,r.anio),
          totalPorcentaje: [r.totalPorcentaje, Validators.required]
        })
      );
    });
  }

  guardar() {
    let payload;

  const aSalida: FechaEntradaFacturaCob[] = [];
  const aSalidaFee: FechaEntradaFEELibre[] = []; //FEE libre

  (this.form.value.fechas as FechaFormValue[]).forEach(fecha => {

      const nuevo: FechaEntradaFacturaCob = {
          mes: fecha.mes,
          anio: fecha.anio,
          reembolsable: true,
          totalPorcentaje: fecha.totalPorcentaje
      };

      aSalida.push(nuevo);
  });

    if(this.tipo == 1){
        payload = {
            nunum_proyecto: this.numProyecto,
            tipo: this.tipo,
            //facturacion: this.form.value.fechas
            facturacion: aSalida,
        };
    }
    else if(this.tipo == 2){ //FEE libre
        payload = {
            nunum_proyecto: this.numProyecto,
            tipo: this.tipo,
            //cobranza: this.form.value.fechas
            cobranza: aSalida,
        };
    }
    //FEE libre I
    else {
      //para FEE libre se cambia el listado de fechas
      (this.form.value.fechas as FechaFormValue[]).forEach(fecha => {

        const nuevo: FechaEntradaFEELibre = {
            mes: fecha.mes,
            anio: fecha.anio,
            reembolsable: true,
            totalPorcentaje: fecha.totalPorcentaje
        };

        aSalidaFee.push(nuevo);
      });

      payload = {
          nunum_proyecto: this.numProyecto,
          tipo: this.tipo,
          idSeccion: this.idSeccion,
          idRubro: this.idRubro,
          reembolsable: true,
          fees: aSalidaFee,
      };
    }
    //FEE libre F

    //console.log('payload:'+payload);
    //FEE libre I
    if(this.tipo == 3){
      //guardar FEE libre
      console.log('Guardare FEE libre');
      this.pcsService.actualizarFee(payload).subscribe({

      next: (resp) => {

        // Cerrar y devolver al padre el arreglo ACTUALIZADO
        const arregloActualizado = (aSalidaFee as any[]).map(f => ({
            reembolsable: false,
            mes: f.mes,
            anio: f.anio,
            totalPorcentaje: f.totalPorcentaje,
            porcentaje: f.totalPorcentaje
        }));

        this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Guardado correctamente' });

        this.ref.close({
          rubroActualizado: arregloActualizado
        });
      },

      error: (err) => {
        this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error });
      }

      });      
    }
    else{
      //guardar Facturacion o Cobranza
      //FEE libre F
      this.pcsService.actualizarFacturacob(payload).subscribe({

      next: (resp) => {

        // Cerrar y devolver al padre el arreglo ACTUALIZADO
        const arregloActualizado = (this.form.value.fechas as any[]).map(f => ({
            reembolsable: false,
            mes: f.mes,
            anio: f.anio,
            totalPorcentaje: f.totalPorcentaje
        }));

        this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Guardado correctamente' });

        this.ref.close({
          rubroActualizado: arregloActualizado
        });
      },

      error: (err) => {
        this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error });
      }

      });
    }//FEE libre 
  }

}

