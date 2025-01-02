import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SUBJECTS, TITLES, errorsArray } from 'src/utils/constants';
import { ContratosService } from '../services/contratos.service';
import { finalize } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Hero, HEROES,Item} from '../models/contratos.model';

@Component({
  selector: 'app-registro-plantilla',
  templateUrl: './registro-plantilla.component.html',
  styleUrls: ['./registro-plantilla.component.css'],
  providers: [MessageService]
})
export class RegistroPlantillaComponent implements OnInit {

  fb                = inject(FormBuilder)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  contratosService  = inject(ContratosService)
  activatedRoute    = inject(ActivatedRoute)
  router            = inject(Router)

  esActualizacion: boolean = false

  form = this.fb.group({
    id_contrato_template: [null],
    titulo:               ['', Validators.required],
    template:             ['', Validators.required],
    campito: [null]
  })

  contenido:  Hero[] = []

  campos:    Item[] = [
    {label: 'Nombre del campo', value: '{Nombre del campo}'},
  	{label: 'nunum_empleado_rr_hh', value: '{nunum_empleado_rr_hh}'},
  	{label: 'nukidpersona', value: '{nukidpersona}'},
  	{label: 'nombre_persona', value: '{nombre_persona}'},
  	{label: 'dtfecha_nacimiento', value: '{dtfecha_nacimiento}'},
  	{label: 'chedad', value: '{chedad}'},
  	{label: 'nukidsexo', value: '{nukidsexo}'},
  	{label: 'chsexo', value: '{chsexo}'},
  	{label: 'chcurp', value: '{chcurp}'},
  	{label: 'chrfc', value: '{chrfc}'},
  	{label: 'chnacionalidad', value: '{chnacionalidad}'},
  	{label: 'nukidtipo_empleado', value: '{nukidtipo_empleado}'},
  	{label: 'chtipo_emplado', value: '{chtipo_emplado}'},
  	{label: 'nukidcategoria', value: '{nukidcategoria}'},
  	{label: 'chcategoria', value: '{chcategoria}'},
  	{label: 'nukidtipo_contrato', value: '{nukidtipo_contrato}'},
  	{label: 'chtipo_contrato', value: '{chtipo_contrato}'},
  	{label: 'chcve_puesto', value: '{chcve_puesto}'},
  	{label: 'chpuesto', value: '{chpuesto}'},
  	{label: 'nukidempresa', value: '{nukidempresa}'},
  	{label: 'chempresa', value: '{chempresa}'},
  	{label: 'chcalle', value: '{chcalle}'},
  	{label: 'nunumero_interior', value: '{nunumero_interior}'},
  	{label: 'nunumero_exterior', value: '{nunumero_exterior}'},
  	{label: 'chcolonia', value: '{chcolonia}'},
  	{label: 'chalcaldia', value: '{chalcaldia}'},
  	{label: 'nukidciudad', value: '{nukidciudad}'},
  	{label: 'chciudad', value: '{chciudad}'},
  	{label: 'nukidestado', value: '{nukidestado}'},
  	{label: 'chestado', value: '{chestado}'},
  	{label: 'chcp', value: '{chcp}'},
  	{label: 'nukidpais', value: '{nukidpais}'},
  	{label: 'chpais', value: '{chpais}'},
  	{label: 'nukidnivel_estudios', value: '{nukidnivel_estudios}'},
  	{label: 'chnivel_estudios', value: '{chnivel_estudios}'},
  	{label: 'nukidforma_pago', value: '{nukidforma_pago}'},
  	{label: 'chforma_pago', value: '{chforma_pago}'},
  	{label: 'nukidjornada', value: '{nukidjornada}'},
  	{label: 'chjornada', value: '{chjornada}'},
  	{label: 'nukiddepartamento', value: '{nukiddepartamento}'},
  	{label: 'chdepartamento', value: '{chdepartamento}'},
  	{label: 'nukidclasificacion', value: '{nukidclasificacion}'},
  	{label: 'chclasificacion', value: '{chclasificacion}'},
  	{label: 'nukidjefe_directo', value: '{nukidjefe_directo}'},
  	{label: 'chjefe_directo', value: '{chjefe_directo}'},
  	{label: 'nukidunidad_negocio', value: '{nukidunidad_negocio}'},
  	{label: 'chunidad_negocio', value: '{chunidad_negocio}'},
  	{label: 'nukidtipo_contrato_sat', value: '{nukidtipo_contrato_sat}'},
  	{label: 'chtipo_contrato_sat', value: '{chtipo_contrato_sat}'},
  	{label: 'nunum_empleado', value: '{nunum_empleado}'},
  	{label: 'dtfecha_ingreso', value: '{dtfecha_ingreso}'},
    {label: 'dtfecha_ingresoLetras', value: '{dtfecha_ingresoLetras}'},
  	{label: 'dtfecha_salida', value: '{dtfecha_salida}'},
    {label: 'dtfecha_salidaLetras', value: '{dtfecha_salidaLetras}'},
  	{label: 'dtfecha_ultimo_reingreso', value: '{dtfecha_ultimo_reingreso}'},
    {label: 'dtfecha_ultimo_reingresoLetras', value: '{dtfecha_ultimo_reingresoLetras}'},
  	{label: 'chnss', value: '{chnss}'},
  	{label: 'chemail_bovis', value: '{chemail_bovis}'},
  	{label: 'salarioenLetras', value: '{salarioenLetras}'},
  	{label: 'nukidprofesion', value: '{nukidprofesion}'},
  	{label: 'chprofesion', value: '{chprofesion}'},
  	{label: 'nuantiguedad', value: '{nuantiguedad}'},
  	{label: 'nukidturno', value: '{nukidturno}'},
  	{label: 'chturno', value: '{chturno}'},
  	{label: 'nuunidad_medica', value: '{nuunidad_medica}'},
  	{label: 'chregistro_patronal', value: '{chregistro_patronal}'},
  	{label: 'chcotizacion', value: '{chcotizacion}'},
  	{label: 'nuduracion', value: '{nuduracion}'},
  	{label: 'boactivo', value: '{boactivo}'},
  	{label: 'boempleado', value: '{boempleado}'},
  	{label: 'chporcentaje_pension', value: '{chporcentaje_pension}'},
  	{label: 'nudescuento_pension', value: '{nudescuento_pension}'},
  	{label: 'nuporcentaje_pension', value: '{nuporcentaje_pension}'},
  	{label: 'nufondo_fijo', value: '{nufondo_fijo}'},
  	{label: 'nucredito_infonavit', value: '{nucredito_infonavit}'},
  	{label: 'chtipo_descuento', value: '{chtipo_descuento}'},
  	{label: 'nuvalor_descuento', value: '{nuvalor_descuento}'},
  	{label: 'nuno_empleado_noi', value: '{nuno_empleado_noi}'},
  	{label: 'chrol', value: '{chrol}'},
  	{label: 'dtvigencia', value: '{dtvigencia}'},
  	{label: 'dtvigencia90', value: '{dtvigencia90}'},
  	{label: 'cantidadEnLetras', value: '{cantidadEnLetras}'},
  	{label: 'chexperiencias', value: '{chexperiencias}'},
  	{label: 'chhabilidades', value: '{chhabilidades}'},
  	{label: 'nuproyecto_principal', value: '{nuproyecto_principal}'},
  	{label: 'chproyecto_principal', value: '{chproyecto_principal}'},
    {label: 'dtvigenciaLetras', value: '{dtvigenciaLetras}'},
    {label: 'dtvigencia90Letras', value: '{dtvigencia90Letras}'}
  ]
  
  constructor() { }

  ngOnInit(): void {

    this.contenido = HEROES

    this.sharedService.cambiarEstado(true)

    this.activatedRoute.params
      .subscribe(({id}) => {
        if(id) {
          this.setearDatos(id)
        } else {
          this.sharedService.cambiarEstado(false)
        }
      })
  }

  guardar() {
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    this.contratosService.guardarPlantilla(this.form.value, this.esActualizacion)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.form.reset()
          this.router.navigate(['/contratos/plantillas'], {queryParams: {success: true}});
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })
  }

  setearDatos(id: number) {
    this.esActualizacion = true

    this.contratosService.getPlantilla(id)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.form.patchValue({
            id_contrato_template: id,
            titulo: data.titulo,
            template: data.template
          })
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
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

  limpiar() {
    this.form.reset()
  }

  Ingresarvalor(campo: string) {
    
    

    

  }

  buscarEmpleados(event: any) {

    //this.sharedService.cambiarEstado(true)

    console.log('VALOR QUE LLEGA DEL COMBO -------- <<<< ' + event.value)

    this.form.patchValue({
      template: this.form.value.template + ' '+ event.value.replace(' ', '').replace('\n', '').replace('<br/>', '')
    })
  }

}
