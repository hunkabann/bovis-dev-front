import { Component, OnInit, inject, Input, ChangeDetectorRef  } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PcsService } from '../../services/pcs.service';
import { TITLES, errorsArray } from 'src/utils/constants';
import { obtenerMeses, descripcionMesAnio, deshabilitaControl } from 'src/helpers/helpers';
import { Fecha, Rubro, GastosIngresosTotales, FechaEntradaFacturaCob, FechaFormValue , MesesFront,DatosInflacion } from '../../models/pcs.model'; //LEO Fórmula Inflación
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
  rubroEntrada: Rubro;
  fechaInicio: string;
  mesInicio: number = 0;
  numProyecto: number = 0;
  numPorcentaje: number = 0;
  reembolsable: boolean;
  stilovisible: string = ''
  stilovisiblepp: string = ''
  catMeses : MesesFront[] = []; //LEO Fórmula Inflación
  mesActual: number = 0;
  mesguardado: number;

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
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef
  ) {}
  

  ngOnInit(): void {

    //llenando las variables
    this.mesActual = new Date().getMonth() + 1; // Enero = 1
    // Recibir datos enviados
    //this.registrosEntrada = this.config.data.registros;
    this.rubroEntrada = this.config.data.rubroEnvio; 
    this.fechaInicio = this.config.data.fechaInicio;
    this.mesInicio = this.config.data.mesInicio;
    this.numProyecto = this.config.data.numProyecto;
    //this.numPorcentaje = 15;
    this.reembolsable = this.config.data.reembolsable;

    //obtener los valores guardado en BD
    this.consultaDatosinflacion();

    //Llenado de los meses para el combo 
    this.cargarCatalogoMeses();

    // Setear valores al form
    this.form.patchValue({
      numProyecto: this.numProyecto,
      numes_ini_calculo: this.mesguardado,
      porcentaje: this.numPorcentaje,
    });

    //this.form.get('numes_ini_calculo')?.setValue(this.mesInicio );
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
    console.log('Porcentaje:'+this.form.get('porcentaje').value + ' numes_ini_calculo:' + this.form.get('numes_ini_calculo').value)
    let payload;

    payload = {
      nunum_proyecto: this.numProyecto,
      nuprocentaje: this.form.get('porcentaje').value,
      numes_ini_calculo: this.form.get('numes_ini_calculo').value
    };
    console.log('payload:'+payload);
    this.pcsService.actualizarDatosInflacion(payload).subscribe({

      next: (resp) => {

        this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Guardado correctamente' });

        this.ref.close({
          
        });
      },

      error: (err) => {
        this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error });
      }

    });
    
  }  

  calculaMesInicio(rubro: Rubro){
    //console.log('this.rubroEntrada.fechas:'+this.rubroEntrada.fechas)

    if(this.rubroEntrada.fechas == null || this.rubroEntrada.fechas.length==0){
      this.mesInicio = -1;
      return
    }

    if(this.rubroEntrada.fechas[0].mes == null){
      this.mesInicio = -2;
      return
    }

    this.mesInicio = this.rubroEntrada.fechas[0].mes;
    console.log('MesinicioCalculado:'+this.mesInicio);

    if(this.mesInicio < this.mesActual){
      this.mesInicio = this.mesActual;
    }
  }


    private cargarCatalogoMeses(): void {


      const mesesBase: Omit<MesesFront, 'disabled'>[] = [
        { code: 1,  name: 'Enero' },
        { code: 2,  name: 'Febrero' },
        { code: 3,  name: 'Marzo' },
        { code: 4,  name: 'Abril' },
        { code: 5,  name: 'Mayo' },
        { code: 6,  name: 'Junio' },
        { code: 7,  name: 'Julio' },
        { code: 8,  name: 'Agosto' },
        { code: 9,  name: 'Septiembre' },
        { code: 10, name: 'Octubre' },
        { code: 11, name: 'Noviembre' },
        { code: 12, name: 'Diciembre' }
      ];

      // ✅ Validaciones de seguridad
      if (
        !this.mesInicio || this.mesInicio < 1 || this.mesInicio > 12 ||
        !this.mesActual || this.mesActual < 1 || this.mesActual > 12
      ) {
        this.catMeses = [];
        return;
      }

      // 1. MOSTRAR SOLO DESDE mesInicio HASTA DICIEMBRE
      this.catMeses = mesesBase
        .filter(mes => mes.code >= this.mesInicio)
        .map(mes => ({
          ...mes,
          // 2. DESHABILITAR MESES MENORES AL mesActual
          disabled: mes.code < this.mesActual
        }));

      // 3. SELECCIÓN AUTOMÁTICA DEL MES
      const mesParaSeleccionar =
        this.mesActual >= this.mesInicio
          ? this.mesActual
          : this.mesInicio;

      // FORZADO DE SELECCIÓN PARA DYNAMIC DIALOG
      setTimeout(() => {
        const control = this.form.get('numes_ini_calculo');
        if (control) {
          control.setValue(mesParaSeleccionar, { emitEvent: false });
        }

        this.cdRef.detectChanges(); // fuerza repintado del dropdown
      }, 100); // este 100ms es CLAVE en diálogos

      // console.log('MesInicio:', this.mesInicio);
      // console.log('MesActual:', this.mesActual);
      // console.log('Catálogo final:', this.catMeses);
      // console.log('Mes seleccionado:', mesParaSeleccionar);
    
  }

  consultaDatosinflacion() {

    this.pcsService.obtenerDatosInflacion(this.numProyecto, '')
      .pipe()
      .subscribe({
        next: ({data}) => {
          this.numPorcentaje = data.nuprocentaje;
          this.mesguardado = data.numes_ini_calculo; 
          this.form.get('porcentaje')?.setValue(this.numPorcentaje);
          this.form.get('numes_ini_calculo')?.setValue(this.mesguardado);
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      });
  
  }
}

