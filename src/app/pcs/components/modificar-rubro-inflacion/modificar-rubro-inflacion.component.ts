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
  nukidSeccion: number; //Fórmula Inflación
  nukidRubro:number; //Fórmula Inflación
  fechaFin: string;

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
    private cdRef: ChangeDetectorRef,
  ) {}
  

  ngOnInit(): void {

    /*
    console.log('========== DATA RECIBIDA DEL MODAL ==========');
    console.log(this.config.data);
    console.log('=============================================');
    */

    //llenando las variables
    //this.mesActual = new Date().getMonth() + 1; // Enero = 1
    const hoy = new Date();

    this.mesActual = (hoy.getFullYear() * 100) + (hoy.getMonth() + 1);
    // Recibir datos enviados
    //this.registrosEntrada = this.config.data.registros;
    this.rubroEntrada = this.config.data.rubroEnvio; 
    this.fechaInicio = this.config.data.fechaInicio;
    this.mesInicio = this.config.data.mesInicio;
    this.numProyecto = this.config.data.numProyecto;
    //this.numPorcentaje = 15;
    this.reembolsable = this.config.data.reembolsable;
    this.nukidSeccion = this.config.data.idSeccion; //Fórmula Inflación
    this.nukidRubro = this.config.data.idRubro; //Fórmula Inflación
    this.fechaFin = this.config.data.fechaFin;

    /*
    console.log('this.nukidSeccion:'+this.nukidSeccion)
    console.log('this.nukidRubro:'+this.nukidRubro)
    console.log('this.fechaInicio:'+this.fechaInicio)
    console.log('this.fechaFin:'+this.fechaFin)
    */
    //Llenado de los meses para el combo 
    this.cargarCatalogoMeses();

    //obtener los valores guardado en BD
    this.consultaDatosinflacion();

    // Setear valores al form
    /*
    this.form.patchValue({
      numProyecto: this.numProyecto,
      numes_ini_calculo: this.mesguardado,
      porcentaje: this.numPorcentaje,
    });
    */

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
      nukid_seccion: this.nukidSeccion, 
      nukid_rubro: this.nukidRubro, 
      nuprocentaje: this.form.get('porcentaje').value,
      numes_ini_calculo: this.form.get('numes_ini_calculo').value
    };
    console.log('payload:'+payload);
    this.pcsService.actualizarDatosInflacion(payload).subscribe({

      next: (resp) => {

        //después de que guarde los datos e mes inicio y porcentaje ahora calcula con la fórmula
        //entonces reasigna valores para el request del siguiente servicio
        payload = {
          nunum_proyecto: this.numProyecto,
          nukid_seccion: this.nukidSeccion, 
          nukid_rubro: this.nukidRubro, 
          nuprocentaje: this.form.get('porcentaje').value,
          numes_ini_calculo: this.form.get('numes_ini_calculo').value,
          boreembolsable: this.reembolsable
        };  

        this.pcsService.actualizarDatosInflacionRubro(payload).subscribe({
          next: (resp) => {
            this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Guardado correctamente' });
            // Indicar al componente padre que SÍ hubo guardado
            this.ref.close({
              guardado: true
            });
          },

          error: (err) => {
            this.messageService.add({ severity: 'error', summary: TITLES.error, detail: 'Guarda Fórmula:' + err.error });
          }

        });
      },

      error: (err) => {
        this.messageService.add({ severity: 'error', summary: TITLES.error, detail: 'Guarda Datos:' + err.error });
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

      // Convertir strings a Date
      const fechaInicio = new Date(this.fechaInicio);
      const fechaFin = new Date(this.fechaFin);

      // Validación básica de fechas
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime()) || fechaInicio > fechaFin) {
        this.catMeses = [];
        return;
      }

      const mesesBase: Omit<MesesFront, 'disabled'>[] = [];

      const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril',
        'Mayo', 'Junio', 'Julio', 'Agosto',
        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      // Clonar fechaInicio para iterar sin modificar la original
      let fechaIteradora = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);

      while (fechaIteradora <= fechaFin) {

        const mes = fechaIteradora.getMonth(); // 0-11
        const anio = fechaIteradora.getFullYear();

        mesesBase.push({
          code: (anio * 100) + (mes + 1), // ejemplo: 202601
          name: `${nombresMeses[mes]} ${anio}`
        });

        // Avanzar un mes
        fechaIteradora.setMonth(fechaIteradora.getMonth() + 1);
      }

      // const mesesBase: Omit<MesesFront, 'disabled'>[] = [
      //   { code: 1,  name: 'Enero' },
      //   { code: 2,  name: 'Febrero' },
      //   { code: 3,  name: 'Marzo' },
      //   { code: 4,  name: 'Abril' },
      //   { code: 5,  name: 'Mayo' },
      //   { code: 6,  name: 'Junio' },
      //   { code: 7,  name: 'Julio' },
      //   { code: 8,  name: 'Agosto' },
      //   { code: 9,  name: 'Septiembre' },
      //   { code: 10, name: 'Octubre' },
      //   { code: 11, name: 'Noviembre' },
      //   { code: 12, name: 'Diciembre' }
      // ];

      /*
      if (
        !this.mesInicio || this.mesInicio < 1 || this.mesInicio > 12 ||
        !this.mesActual || this.mesActual < 1 || this.mesActual > 12
      ) {
        this.catMeses = [];
        return;
      }
        */
      if (
        !this.mesInicio ||
        !this.mesActual
      ) {
        this.catMeses = [];
        return;
      }

      /*
      // 1. MOSTRAR SOLO DESDE mesInicio HASTA DICIEMBRE
      this.catMeses = mesesBase
        .filter(mes => mes.code >= this.mesInicio)
        .map(mes => ({
          ...mes,
          // 2. DESHABILITAR MESES MENORES AL mesActual
          disabled: mes.code < this.mesActual
        }));
        */
       // MOSTRAR SOLO DESDE MES ACTUAL EN ADELANTE
      this.catMeses = mesesBase
        .filter(mes => mes.code >= this.mesActual)
        .map(mes => ({
            ...mes,
            disabled: false
        }));


      // SELECCIONAR MES ACTUAL
      /*
      setTimeout(() => {
        const control = this.form.get('numes_ini_calculo');

        if(control){
          control.setValue(this.mesActual, {emitEvent:false});
        }

        this.cdRef.detectChanges();

      },100);
      */


      // 3. SELECCIÓN AUTOMÁTICA DEL MES
      const mesParaSeleccionar =
        this.mesActual >= this.mesInicio
          ? this.mesActual
          : this.mesInicio;

      // FORZADO DE SELECCIÓN PARA DYNAMIC DIALOG
      /*
      setTimeout(() => {
        const control = this.form.get('numes_ini_calculo');
        if (control) {
          control.setValue(mesParaSeleccionar, { emitEvent: false });
        }

        this.cdRef.detectChanges(); // fuerza repintado del dropdown
      }, 100); // este 100ms es CLAVE en diálogos
      */

      // console.log('MesInicio:', this.mesInicio);
      // console.log('MesActual:', this.mesActual);
      // console.log('Catálogo final:', this.catMeses);
      // console.log('Mes seleccionado:', mesParaSeleccionar);

      /*
      console.log('fechaInicio:', this.fechaInicio);
      console.log('fechaFin:', this.fechaFin);
      console.log('mesInicio:', this.mesInicio);
      console.log('mesActual:', this.mesActual);
      console.log('mesesBase:', mesesBase);
      */

      // Valores iniciales del formulario
      const valoresFormulario: any = {};

      // --------------------------------------------------
      // MES DE INICIO
      // --------------------------------------------------
      const unidad = this.rubroEntrada?.unidad;

      if (unidad) {

        const [mesTexto, anioTexto] = unidad.split('/');

        const meses: { [key: string]: number } = {
          ene: 1,
          feb: 2,
          mar: 3,
          abr: 4,
          may: 5,
          jun: 6,
          jul: 7,
          ago: 8,
          sep: 9,
          oct: 10,
          nov: 11,
          dic: 12
        };

        const mes = meses[mesTexto.toLowerCase()];
        const anio = Number(anioTexto);

        if (mes && anio) {

          const codigoMes = (anio * 100) + mes;

          // Verificar que exista en el catálogo
          const mesCatalogo = this.catMeses.find(
            x => x.code === codigoMes
          );

          if (mesCatalogo) {
            valoresFormulario.numes_ini_calculo = codigoMes;
          }
        }
      }

      // --------------------------------------------------
      // PORCENTAJE
      // --------------------------------------------------
      const cantidad = this.rubroEntrada?.cantidad;

      //if (cantidad !== null && cantidad !== undefined && cantidad !== '') {
      if (cantidad !== null) {
        valoresFormulario.porcentaje = cantidad;
      }

      // --------------------------------------------------
      // APLICAR VALORES
      // --------------------------------------------------
      if (Object.keys(valoresFormulario).length > 0) {

        this.form.patchValue(valoresFormulario);

        console.log('Valores iniciales aplicados:', valoresFormulario);

        this.cdRef.detectChanges();
      }

    
  }

  /*
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
      */
    consultaDatosinflacion() {

      this.pcsService.obtenerDatosInflacion(this.numProyecto, '')
      .subscribe({
        next: ({ data }) => {

          console.log('Datos inflación servicio:', data);

          // Solo usar los datos de BD si NO vienen datos en el rubro
          if (this.rubroEntrada?.cantidad != null) {
            this.form.get('porcentaje')?.setValue(
              this.rubroEntrada.cantidad
            );
          } else if (data?.nuprocentaje != null && data.nuprocentaje !== 0) {
            this.form.get('porcentaje')?.setValue(
              data.nuprocentaje
            );
          } else {
            this.form.get('porcentaje')?.setValue(null);
          }


          if (this.rubroEntrada?.unidad) {

            const [mesTexto, anioTexto] =
              this.rubroEntrada.unidad.split('/');

            const meses: { [key: string]: number } = {
              ene: 1,
              feb: 2,
              mar: 3,
              abr: 4,
              may: 5,
              jun: 6,
              jul: 7,
              ago: 8,
              sep: 9,
              oct: 10,
              nov: 11,
              dic: 12
            };

            const mes = meses[mesTexto.toLowerCase()];
            const anio = Number(anioTexto);

            if (mes && anio) {

              const codigoMes = (anio * 100) + mes;

              console.log('Unidad:', this.rubroEntrada.unidad);
              console.log('numes_ini_calculo:', codigoMes);

              this.form.get('numes_ini_calculo')?.setValue(
                codigoMes
              );

            } else {
              this.form.get('numes_ini_calculo')?.setValue(null);
            }

          } else if (
            data?.numes_ini_calculo != null &&
            data.numes_ini_calculo !== 0
          ) {

            this.form.get('numes_ini_calculo')?.setValue(
              data.numes_ini_calculo
            );

          } else {

            this.form.get('numes_ini_calculo')?.setValue(null);

          }

        },

        error: (err) => {

          this.messageService.add({
            severity: 'error',
            summary: TITLES.error,
            detail: err.error
          });

        }
      });
  }
}

