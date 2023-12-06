import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize, forkJoin } from 'rxjs';
import { Plantilla } from 'src/app/contratos/models/contratos.model';
import { ContratosService } from 'src/app/contratos/services/contratos.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { SUBJECTS, TITLES, errorsArray } from 'src/utils/constants';
import { EmpleadosService } from '../../services/empleados.service';
import { UpEmpleado } from '../../Models/empleados';
import { error } from 'console';
import { Opcion } from 'src/models/general.model';
import { NumerosALetras } from 'src/helpers/numeroaletras';

const htmlToPdfmake = require("html-to-pdfmake")
const pdfMake = require('pdfmake')
const pdfFonts = require("pdfmake/build/vfs_fonts")
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-contratos-registro',
  templateUrl: './contratos-registro.component.html',
  styleUrls: ['./contratos-registro.component.css']
})
export class ContratosRegistroComponent implements OnInit {

  fb                = inject(FormBuilder)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  contratosService  = inject(ContratosService)
  activatedRoute    = inject(ActivatedRoute)
  empleadoService   = inject(EmpleadosService)
  router            = inject(Router)

  esActualizacion: boolean = false
  plantillas: Plantilla[] = []
  htmlForm: string = ''
  empleado: UpEmpleado = null
  campos: Opcion[] = []

  form = this.fb.group({
    id_empleado:          [null],
    id_contrato_empleado: [null],
    titulo:               ['', Validators.required],
    contrato:             ['', Validators.required]
  })

  constructor() { }

  ngOnInit(): void {

    this.sharedService.cambiarEstado(true)

    this.activatedRoute.params
      .subscribe(({id, empleado}) => {
        this.form.patchValue({ id_empleado: empleado })
        if(id) {
          this.setearDatos(id)
        } else {
          forkJoin([
            this.contratosService.getPlantillas('activos'),
            this.empleadoService.getEmpleado(this.form.value.id_empleado)
          ])
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: (value) => {
              const [plantillasR, empleadoR] = value
              this.plantillas = plantillasR.data

              this.empleado = empleadoR.data

              Object.entries(empleadoR.data).forEach(entry => {
                const [code, name] = entry
                if(!Array.isArray(name)) {
                  this.campos.push({code, name})
                }
              })
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
          })
        }
      })
  }

  guardar() {
    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    const idEmpleado = this.form.value.id_empleado

    this.empleadoService.guardarContrato(this.form.value, this.esActualizacion)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.form.reset()
          this.router.navigate([`/empleados/contratos/${idEmpleado}`], {queryParams: {success: true}});
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })
  }

  convertToPDF() {
    
    this.htmlForm = this.form.value.contrato
                  .replace(/class="ql-align-center"/g, 'style="text-align: center"')
                  .replace(/class="ql-align-left"/g, 'style="text-align: left"')
                  .replace(/class="ql-align-right"/g, 'style="text-align: right"')
                  .replace(/class="ql-align-justify"/g, 'style="text-align: justify"')
    
    const regex = /{([^}]+)}/g;

    this.htmlForm = this.htmlForm.replace(regex, (match, captureText) => this.reemplazar(match, captureText, this.empleado))
    
    const html = htmlToPdfmake(this.htmlForm, {ignoreStyles:['font-family']})

    const pdf = pdfMake.createPdf({content: html})

    pdf.download(this.form.value.titulo)
  }

  setearDatos(id: number) {
    this.esActualizacion = true

    forkJoin([
      this.empleadoService.getContratoPorEmpleado(id),
      this.empleadoService.getEmpleado(this.form.value.id_empleado)  
    ])
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: (value) => {
        const [contratoR, empleadoR] = value
        this.form.patchValue({
          id_contrato_empleado: id,
          titulo: contratoR.data.titulo,
          contrato: contratoR.data.contrato
        })

        this.empleado = empleadoR.data

        Object.entries(empleadoR.data).forEach(entry => {
          const [code, name] = entry
          if(!Array.isArray(name)) {
            this.campos.push({code, name})
          }
        })
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
    })
  }

  changeTemplate(event: any) {
    const index = this.plantillas.findIndex(plantilla => plantilla.idContratoTemplate === event.value)
    if(index >= 0) {
      this.form.patchValue({
        contrato: this.plantillas.at(index).template
      })
    }
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
  
  reemplazar(match: any, campo: string, empleado: UpEmpleado) {

    const [campoNombre, pipe] = campo.split('|')
    let resultado = this.empleado[campoNombre] || '-'

    if(pipe) {
      switch(pipe) {
        case 'monedaTexto':
          resultado += ` ${NumerosALetras(resultado)}`
          break
        default:
          resultado += '-'
      }
    }

    return resultado
  };

}
