import { Component, OnInit, inject, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PcsService } from '../../services/pcs.service';
import { TITLES, errorsArray } from 'src/utils/constants';
import { obtenerMeses, descripcionMesAnio, deshabilitaControl } from 'src/helpers/helpers';
import { Fecha, Rubro, GastosIngresosTotales, FechaEntradaFacturaCob, FechaFormValue } from '../../models/pcs.model';
import { Mes } from 'src/models/general.model';
import { finalize } from 'rxjs';
import { facturaCancelacion } from 'src/app/facturacion/Models/FacturacionModels';


@Component({
  selector: 'app-modificar-rubro-inflacion',
  templateUrl: './modificar-rubro-inflacion.component.html',
  styleUrls: ['./modificar-rubro-inflacion.component.css'],
  providers: [MessageService]
})
export class ModificarRubroInflacionComponent implements OnInit {
  registrosEntrada: GastosIngresosTotales[] = [];
  fechaInicio: string;
  mesInicio: number = 0;
  numProyecto: number = 0;
  numPorcentaje: number = 0;
  reembolsable: boolean;
  stilovisible: string = ''
  stilovisiblepp: string = ''

  form = this.fb.group({
    numProyecto: [null],
    numes_ini_calculo: [null],
    porcentaje: [null],
  });

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private pcsService: PcsService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {

    // Recibir datos enviados
    //this.registrosEntrada = this.config.data.registros;
    this.mesInicio = 9;
    this.fechaInicio = this.config.data.fechaInicio;
    this.numProyecto = this.config.data.numProyecto;
    this.numPorcentaje = 15;
    this.reembolsable = this.config.data.reembolsable;

    // Setear valores al form
    this.form.patchValue({
      numProyecto: this.numProyecto,
      numes_ini_calculo: this.mesInicio,
      porcentaje: this.numPorcentaje,
    });
  }

  obtenerMensajeError(campo: string): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if (this.form.get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }
  
  esInvalido(campo: string): boolean {
    return this.form.get(campo).invalid &&
      (this.form.get(campo).dirty || this.form.get(campo).touched)
  }  

  guardar() {
    
  }  

}

