import { Component, OnInit, inject } from '@angular/core';
import { EmpleadosService } from '../../services/empleados.service';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/services/shared.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Opcion } from 'src/models/general.model';
import { finalize, forkJoin } from 'rxjs';
import { SUBJECTS, TITLES, errorsArray } from 'src/utils/constants';
import { Puesto } from '../../Models/empleados';

@Component({
  selector: 'app-modificar-requerimiento',
  templateUrl: './modificar-requerimiento.component.html',
  styleUrls: ['./modificar-requerimiento.component.scss']
})
export class ModificarRequerimientoComponent implements OnInit {
  
  empleadosService  = inject(EmpleadosService)
  fb                = inject(FormBuilder)
  sharedService     = inject(SharedService)
  messageService    = inject(MessageService)
  router            = inject(Router)
  activatedRoute    = inject(ActivatedRoute)

  constructor() { }

  form = this.fb.group({
    id_requerimiento:     [0],
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
    habilidades:          [[''], [Validators.required]],
    experiencias:         [[''], [Validators.required]],
    idJefeInmediato:      ['', [Validators.required]],
    idTipoContrato:       ['', [Validators.required]],
    idEstado:             ['', [Validators.required]],
    idCiudad:             ['', [Validators.required]],
    disponibilidadViajar: ['NO', [Validators.required]],
    aniosExperiencia:     ['', [Validators.required]],
    nivelIngles:          [null],
    comentarios:          ['', [Validators.required]],
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

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)

    this.activatedRoute.paramMap.subscribe(params => {
      const id = Number(params.get('id'))
      this.form.patchValue({id_requerimiento: id})

      this.empleadosService.getRequerimiento(id)
        .subscribe({
          next: ({data}) => {
            const requerimiento = data
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

              if(requerimiento.nukiddirector_ejecutivo) {
                this.getProyectos({value: requerimiento.nukiddirector_ejecutivo})
              }

              const habilidades = requerimiento.habilidades.map(habilidad => habilidad.idHabilidad.toString())
              const experiencias = requerimiento.experiencias.map(experiencia => experiencia.idExperiencia.toString())

              this.form.patchValue({
                sueldoMin:            requerimiento.nusueldo_min.toString(),
                sueldoMax:            requerimiento.nusueldo_max.toString(),
                categoria:            requerimiento.nukidcategoria.toString(),
                puesto:               requerimiento.nukidpuesto.toString(),
                nivelEstudios:        requerimiento.nukidnivel_estudios.toString(),
                profesion:            requerimiento.nukidprofesion.toString(),
                jornada:              requerimiento.nukidjornada.toString(),
                sueldoReal:           requerimiento.nusueldo_real.toString(),
                idDirectorEjecutivo:  requerimiento.nukiddirector_ejecutivo.toString(),
                idProyecto:           requerimiento.nukidproyecto.toString(),
                idJefeInmediato:      requerimiento.nukidjefe_inmediato.toString(),
                idTipoContrato:       requerimiento.nukidtipo_contrato.toString(),
                idEstado:             requerimiento.nukidestado.toString(),
                idCiudad:             requerimiento.nukidciudad.toString(),
                disponibilidadViajar: requerimiento.bodisponibilidad_viajar ? 'SI' : 'NO',
                aniosExperiencia:     requerimiento.nuanios_experiencia.toString(),
                nivelIngles:          requerimiento.chnivel_ingles,
                comentarios:          requerimiento.chcomentarios,
                habilidades,
                experiencias
              })
              
              this.buscarCiudades({value: this.form.value.idEstado})
            })
          },
          error: (err) => {
            this.sharedService.cambiarEstado(false)
            this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
          }
        })
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

    this.empleadosService.actualizarRequerimiento(body)
      .subscribe({
        next: (data) => {
          this.form.reset()
          this.sharedService.cambiarEstado(false)
          this.router.navigate(['/empleados/requerimientos'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.sharedService.cambiarEstado(false)
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
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
