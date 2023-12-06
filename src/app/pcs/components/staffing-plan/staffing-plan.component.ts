import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { SeleccionarEmpleadoComponent } from '../seleccionar-empleado/seleccionar-empleado.component';
import { SeleccionarFechaComponent } from '../seleccionar-fecha/seleccionar-fecha.component';

interface Etapa {
  id:         number,
  nombre:     string,
  totalMeses: number,
  meses:      boolean[],
}

interface Empleado {
  id:         number,
  cod:        string,
  nombre:     string,
  posicion:   string,
  totalMeses: number,
  meses:      number[]
}

@Component({
  selector: 'app-staffing-plan',
  templateUrl: './staffing-plan.component.html',
  styleUrls: ['./staffing-plan.component.css'],
  providers: [DialogService]
})
export class StaffingPlanComponent implements OnInit {

  dialogService     = inject(DialogService)

  meses: String[] = ['06-23', '07-23', '08-23', '09-23', '10-23', '11-23', '12-23', '01-24']

  ngOnInit(): void {}

  /**
   * Etapas
   */
  etapaForm = this.fb.group({
    etapa: ['', Validators.required]
  });

  etapas: Etapa[] = []

  empleados: Empleado[] = []

  get jsonEtapas(): string {
    return JSON.stringify(this.etapas, null, 3)
  }

  get duracionMeses(): number {
    let total = 0
    this.etapasCampos.controls.map(element => {
      total += element.value.totalMeses
    })
    return total
    // this.etapasCampos.map(etapa => {
    //   total += etapa.totalMeses
    // })
    // return total
  }

  form = this.fb.group({
    empleadosCampos: this.fb.array([])
  });

  formEtapas = this.fb.group({
    etapasCampos: this.fb.array([])
  })

  get empleadosCampos() {
    return this.form.controls["empleadosCampos"] as FormArray;
  }

  get etapasCampos() {
    return this.formEtapas.controls['etapasCampos'] as FormArray
  }

  agregarEmpleado() {
    this.dialogService.open(SeleccionarEmpleadoComponent, {
      header: 'Seleccionar empleado',
      width: '50%',
      height: '450px',
      contentStyle: {overflow: 'auto'}
    })
    .onClose.subscribe(data => {
      if(data) {
        const mesesCampos = this.meses.map((mes, index) => {
          return [0]
        })
        const empleadoForm = this.fb.group({
          cod:        [data.empleado.nunum_empleado_rr_hh],
          nombre:     [data.empleado.nombre_persona],
          posicion:   [data.empleado.chpuesto],
          totalMeses: [0],
          ...mesesCampos
        })
        this.empleadosCampos.push(empleadoForm);
        this.empleados.push({
          id:         Date.now(),
          cod:        empleadoForm.value.cod,
          nombre:     empleadoForm.value.nombre,
          posicion:   empleadoForm.value.posicion,
          totalMeses: 0,
          meses:      []
        })
      }
    })
  }

  sumarTotal(i: number, iMes: number, {target}: any) {
    let total = 0
    this.meses.map((mes, index) => {
      this.empleados[i].meses[index] = (this.empleadosCampos.value[i][index] / 100)
      total += this.empleadosCampos.value[i][index]
    })
    this.empleados[i].totalMeses = (total / 100)
  }

  constructor(private fb: FormBuilder) {}

  toggleOpcion(id: number, idMes: number) {
    // etapa.meses[indice] = !etapa.meses[indice]
    // etapa.totalMeses = etapa.meses.filter(valor => valor).length
    const etapa = this.etapasCampos.value[id]
    const valor = etapa[idMes]
    const totalMeses = valor ? etapa.totalMeses + 1 : etapa.totalMeses - 1
    this.etapasCampos.at(id).patchValue({
      totalMeses
    })
  }

  agregarEtapa() {
    
    const mesesCampos = this.meses.map((mes, index) => {
      return [false]
    })

    const sEtapaForm = this.fb.group({
      id: Date.now(),
      nombre: this.etapaForm.value.etapa,
      totalMeses: 0,
      ...mesesCampos
    })
    this.etapasCampos.push(sEtapaForm)

    this.etapaForm.reset()
  }

  borrarEtapa(id: number) {
    // this.etapas = this.etapas.filter(({id}) => id !== etapa.id)
    this.etapasCampos.removeAt(id)
  }

  marcarPorFecha(id: number) {
    this.dialogService.open(SeleccionarFechaComponent, {
      header: 'Seleccionar Fecha',
      width: '50%',
      height: '450px',
      contentStyle: {overflow: 'auto'}
    })
    .onClose.subscribe(data => {
      if(data) {
        const [fechaInicio, fechaFin] = data

        if(fechaInicio && !fechaFin) {
          const indexMesInicio = this.meses.findIndex(mes => mes === fechaInicio)
          if(indexMesInicio >= 0) {
            for (let index = indexMesInicio; index < this.meses.length; index++) {
              const patchObject: any = {};
              patchObject[index] = true;
              this.etapasCampos.at(id).patchValue(patchObject)
            }
          }
        }

        if(fechaInicio && fechaFin) {
          const indexMesInicio = this.meses.findIndex(mes => mes === fechaInicio)
          const indexMesFin = this.meses.findIndex(mes => mes === fechaFin)

          if(indexMesInicio >= 0 && indexMesFin >= 0) {
            for (let index = indexMesInicio; index <= indexMesFin; index++) {
              const patchObject: any = {};
              patchObject[index] = true;
              this.etapasCampos.at(id).patchValue(patchObject)
            }
          }
        }
      }
    })
  }

  borrarEmpleado(indice: number) {
    this.empleadosCampos.removeAt(indice);
    this.empleados = this.empleados.filter((empleado, index) => index !== indice)
  }

}
