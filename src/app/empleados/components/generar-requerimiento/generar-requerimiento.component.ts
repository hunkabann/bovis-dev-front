import { Component, OnInit, inject } from '@angular/core';
import { EmpleadosService } from '../../services/empleados.service';
import { FormBuilder, Validators } from '@angular/forms';
import { TITLES, emailsDatos, errorsArray } from 'src/utils/constants';
import { SharedService } from 'src/app/shared/services/shared.service';
import { MessageService } from 'primeng/api';
import { finalize, forkJoin, map as mapRxjs, map } from 'rxjs';
import { Router } from '@angular/router';
import { Puesto } from '../../Models/empleados';
import { EmailsService } from 'src/app/services/emails.service';

interface RangoSueldo {
  min: number,
  max: number
}

interface Opcion {
  name: string,
  code: string
}

@Component({
  selector: 'app-generar-requerimiento',
  templateUrl: './generar-requerimiento.component.html',
  styleUrls: ['./generar-requerimiento.component.css'],
  providers: [MessageService]
})
export class GenerarRequerimientoComponent implements OnInit {
  
  empleadosService  = inject(EmpleadosService)
  fb                = inject(FormBuilder)
  sharedService     = inject(SharedService)
  messageService    = inject(MessageService)
  router            = inject(Router)
  emailsService     = inject(EmailsService)

  form = this.fb.group({
    categoria:            ['', [Validators.required]],
    puesto:               ['', [Validators.required]],
    nivelEstudios:        ['', [Validators.required]],
    profesion:            ['', [Validators.required]],
    jornada:              ['', [Validators.required]],
    sueldoMin:            ['', [Validators.required]],
    sueldoMax:            ['', [Validators.required]],
    sueldoReal:           ['', [Validators.required]],
    idDirectorEjecutivo:  ['', [Validators.required]],
    idProyecto:           ['', [Validators.required]],
    habilidades:          ['', [Validators.required]],
    experiencias:         ['', [Validators.required]],
    idJefeInmediato:      ['', [Validators.required]],
    idTipoContrato:       ['', [Validators.required]],
    idEstado:             ['', [Validators.required]],
    idCiudad:             ['', [Validators.required]],
    disponibilidadViajar: ['NO', [Validators.required]],
    aniosExperiencia:     ['', [Validators.required]],
    nivelIngles:          [null],
    comentarios:          [null],
  })

  
  categorias:         Opcion[] = []
  puestos:            Opcion[] = []
  nivelEstudios:      Opcion[] = []
  jornadas:           Opcion[] = []
  habilidades:        Opcion[] = []
  experiencias:       Opcion[] = []
  profesiones:        Opcion[] = []
  directores:         Opcion[] = []
  proyectos:          Opcion[] = []
  jefes:              Opcion[] = []
  tiposContratacion:  Opcion[] = []
  estados:            Opcion[] = []
  ciudades:           Opcion[] = []
  niveles:            Opcion[] = [
    {name: 'Básico', code: 'Básico'},
    {name: 'Medio', code: 'Medio'},
    {name: 'Avanzado', code: 'Avanzado'},
    {name: 'N/A', code: 'N/A'}
  ]

  puestosInfo:    Puesto[] = []

  constructor() { }

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)

    forkJoin([
      this.empleadosService.getCategorias(),
      this.empleadosService.getPuestos(),
      this.empleadosService.getNivelEstudios(),
      this.empleadosService.getJornadas(),
      this.empleadosService.getHabilidades(),
      this.empleadosService.getExperiencias(),
      this.empleadosService.getProfesiones(),
      this.empleadosService.getDirectores(),
      this.empleadosService.getEmpleados(),
      this.empleadosService.getCatTiposContratos(),
      this.empleadosService.getCatEstados()
    ])
    .pipe(
      finalize(() => {
        this.sharedService.cambiarEstado(false)
      })
    )
    .subscribe(([categoriasR, puestosR, nivelesR, jornadasR, habilidadesR, experienciasR, profesionesR, directoresR, empleadosR, tipoContratoR, estadosR]) => {
      this.categorias = categoriasR.data.map(categoria => ({name: categoria.descripcion, code: categoria.id.toString()}))
      this.puestosInfo = puestosR.data
      this.puestos = puestosR.data.map(puesto => ({name: puesto.chpuesto, code: puesto.nukid_puesto.toString()}))
      this.nivelEstudios = nivelesR.data.map(nivel => ({name: nivel.descripcion, code: nivel.id.toString()}))
      this.jornadas = jornadasR.data.map(jornada => ({name: jornada.descripcion, code: jornada.id.toString()}))
      this.habilidades = habilidadesR.data.map(habilidad => ({name: habilidad.descripcion, code: habilidad.id.toString()}))
      this.experiencias = experienciasR.data.map(experiencia => ({name: experiencia.descripcion, code: experiencia.id.toString()}))
      this.profesiones = profesionesR.data.map(profesion => ({name: profesion.descripcion, code: profesion.id.toString()}))
      this.directores = directoresR.data.map(director => ({name: director.nombre_persona, code: director.nunum_empleado_rr_hh.toString()}))
      this.jefes = empleadosR.data.map(empleado => ({name: empleado.nombre_persona, code: empleado.nunum_empleado_rr_hh.toString()}))
      this.tiposContratacion = tipoContratoR.data.map(tipo => ({name: tipo.chve_contrato, code: tipo.nukid_contrato.toString()}))
      this.estados = estadosR.data.map(estado => ({name: estado.estado, code: estado.idEstado.toString()}))
    })
  }

  guardar() {
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    const body = {
      ...this.form.value,
      disponibilidadViajar: (this.form.value.disponibilidadViajar === 'SI') ? true : false
    }
    // console.log(body)

    this.empleadosService.generarRequerimiento(body)
      .subscribe({
        next: (data) => {
          const emailNuevoRequerimiento = {
            ...emailsDatos.emailNuevoRequerimiento,
            body: emailsDatos.emailNuevoRequerimiento.body.replace('nombre_usuario', localStorage.getItem('userName') || '')
          }
          // console.log(emailNuevoRequerimiento);
          this.emailsService.sendEmail(emailNuevoRequerimiento)
            .pipe(finalize(() => {
              this.form.reset()
              this.sharedService.cambiarEstado(false)
              this.router.navigate(['/empleados/requerimientos'], {queryParams: {success: true}})
            }))
            .subscribe()
        },
        error: (err) => {
          this.sharedService.cambiarEstado(false)
          this.messageService.add({ severity: 'error', summary: 'Oh no...', detail: '¡Ha ocurrido un error!' })
        }
      })
  }

  setearSalarios({value}: any){
    const index = this.puestosInfo.findIndex(puesto => puesto.nukid_puesto === +value)
    if(index >= 0) {
      const puesto = this.puestosInfo.at(index)
      const sueldoReal = ((puesto.nusalario_min + puesto.nusalario_max) / 2).toString()
      this.form.patchValue({
        sueldoMin: puesto.nusalario_min.toString(),
        sueldoMax: puesto.nusalario_max.toString(),
        sueldoReal
      })
    }
  }

  getProyectos({value}: any) {
    this.sharedService.cambiarEstado(true)
    this.empleadosService.getProyectosPorDirector(value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => this.proyectos = data.map(proyecto => ({name: proyecto.proyecto, code: proyecto.numProyecto.toString()})),
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  esInvalido(campo: string): boolean {
    return this.form.get(campo).invalid && 
            (this.form.get(campo).dirty || this.form.get(campo).touched)
  }

  obtenerMensajeError(campo: string): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if(this.form.get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }

  buscarCiudades(event: any) {

    this.sharedService.cambiarEstado(true)

    this.empleadosService.getCatCiudades(event.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.ciudades = data.map(({ciudad, idCiudad}: any) => ({name: ciudad, code: idCiudad.toString()}))
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

}
