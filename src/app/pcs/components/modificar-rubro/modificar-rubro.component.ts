import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PcsService } from '../../services/pcs.service';
import { TITLES, errorsArray } from 'src/utils/constants';
import { obtenerMeses } from 'src/helpers/helpers';
import { Fecha, Rubro } from '../../models/pcs.model';
import { Mes } from 'src/models/general.model';
import { finalize } from 'rxjs';

interface Unid {
  name: string;
}

@Component({
  selector: 'app-modificar-rubro',
  templateUrl: './modificar-rubro.component.html',
  styleUrls: ['./modificar-rubro.component.css'],
  providers: [MessageService]
})
export class ModificarRubroComponent implements OnInit {
  ref = inject(DynamicDialogRef)
  config = inject(DynamicDialogConfig)
  primeConfig = inject(PrimeNGConfig)
  messageService = inject(MessageService)
  sharedService = inject(SharedService)
  pcsService = inject(PcsService)
  fb = inject(FormBuilder)

  unidades: Unid[] | undefined;

  selectedUnidades: Unid | undefined;

  selectedUnidad: any;

  mes_ini: number
  ano_ini: number

  form = this.fb.group({
    idRubro: [null],
    idSeccion: [null],
    unidad: ['', Validators.required],
    cantidad: ['', Validators.required],
    reembolsable: [false],
    aplicaTodosMeses: [false],
    fechas: this.fb.array([]),
    numProyecto: [null]
  })

  constructor() { }

  get fechas() {
    return this.form.get('fechas') as FormArray
  }

  async ngOnInit(): Promise<void> {
    this.unidades = [
      { name: '%' },
      { name: 'mes' },
      { name: 'pp' },
      { name: 'otro' }
    ];

    const rubro = this.config.data.rubro as Rubro
    // console.log(rubro);

    const idSeccion = this.config.data.idSeccion;
    const numProyectos = this.config.data.numProyecto;

    if (this.config.data) {
      //console.log('valor de unidad ' + rubro.unidad )
      this.form.patchValue({
        idRubro: rubro.idRubro,
        //unidad:           rubro.unidad?.toString(),
        idSeccion: idSeccion,
        cantidad: rubro.cantidad?.toString(),
        reembolsable: rubro.reembolsable || false,
        aplicaTodosMeses: rubro.aplicaTodosMeses || false,
        numProyecto: numProyectos
      })
    }

    this.selectedUnidad = rubro.unidad?.toString()

    const fechaInicio = new Date(this.config.data.fechaInicio)
    const fechaFin = new Date(this.config.data.fechaFin)
    // console.log("this.config.data.fechaInicio:" + this.config.data.fechaInicio)
    // console.log(fechaInicio.getMonth() + 1)
    var splitted = fechaInicio.toString().split(" ", 4);
    //console.log(splitted)
    this.mes_ini = Number(fechaInicio.getMonth() + 1)
    this.ano_ini = Number(fechaInicio.getFullYear())
    //console.log("this.mes_ini: " + this.mes_ini)
    //console.log("this.ano_ini : " + this.ano_ini)
    let meses = await obtenerMeses(fechaInicio, fechaFin);

    meses.forEach(mesRegistro => {
      const date = new Date("01-" + mesRegistro.mes + "-" + mesRegistro.anio)
      //console.log("FORMULA MES : " + this.mes_ini +" - "+ fechaRegistro.mes)
      //console.log("OPERACIONES MES : " + (fechaRegistro.mes - this.mes_ini))
      //console.log("FORMULA ANIO : " +  fechaRegistro.anio +" - "+ this.ano_ini +" * 12 ")
      //console.log("OPERACIONES ANIO : " + (( fechaRegistro.anio -this.ano_ini) * 12 ))
      //console.log("GRAN TOTAL : " + +(fechaRegistro.mes - this.mes_ini) + +(( fechaRegistro.anio -this.ano_ini) * 12 ))

      let MES = (mesRegistro.mes - this.mes_ini)
      let ANIO = ((mesRegistro.anio - this.ano_ini) * 12)
      let OPERACION = MES + ANIO
      // console.log("GRAN TOTAL : " + OPERACION)

      this.fechas.push(this.fb.group({
        mes: [mesRegistro.mes],
        anio: [mesRegistro.anio],
        desc: [mesRegistro.desc],
        porcentaje: [this.form.value.idRubro ? this.obtenerPorcentaje(rubro.fechas, mesRegistro) : 0],
        mesTranscurrido: OPERACION
      }))
    })


    if (rubro.aplicaTodosMeses) {
      this.cambiarValoresFechas()
    }
  }

  guardar() {
    this.sharedService.cambiarEstado(true)

    this.pcsService.actualizarRubro(this.form.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.ref.close({ rubro: this.form.value })
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  cambiarValoresFechas() {
    this.fechas.controls.forEach((fecha, index) => {
      this.fechas.at(index).patchValue({
        porcentaje: this.form.value.aplicaTodosMeses ? this.form.value.cantidad : 0
      })
    })
  }

  obtenerPorcentaje(fechas: Fecha[], mesRegistro: Mes) {
    const mes = fechas.find(info => info.mes == mesRegistro.mes && info.anio == mesRegistro.anio)

    if (mes && mes.porcentaje > 0) {
      return +mes.porcentaje
    }

    return 0
  }

  esInvalido(campo: string): boolean {
    return this.form.get(campo).invalid &&
      (this.form.get(campo).dirty || this.form.get(campo).touched)
  }

  obtenerMensajeError(campo: string): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if (this.form.get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }

  closeDialog() {
    this.ref.close(null)
  }

}
