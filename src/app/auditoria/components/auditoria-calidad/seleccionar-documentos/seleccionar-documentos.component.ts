import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { finalize, forkJoin } from 'rxjs';
import { AuditoriaService } from 'src/app/auditoria/services/auditoria.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TITLES, SUBJECTS, errorsArray } from '../../../../../utils/constants';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { PeriodosAuditoritaResponse, Seccion, SeccionPeriodos } from 'src/app/auditoria/models/auditoria.model';
import { Opcion } from 'src/models/general.model';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seleccionar-documentos',
  templateUrl: './seleccionar-documentos.component.html',
  styleUrls: ['./seleccionar-documentos.component.css'],
  providers: [MessageService]
})
export class SeleccionarDocumentosComponent implements OnInit {

  sharedService     = inject(SharedService)
  messageService    = inject(MessageService)
  auditoriaService  = inject(AuditoriaService)
  fb                = inject(FormBuilder)
  timesheetService  = inject(TimesheetService)
  router            = inject(Router)

  form = this.fb.group({
    id_proyecto:  ['', Validators.required],
    id_periodo: ['', Validators.required],
    auditorias:   this.fb.array([]),
  })

  esActualizacion:  boolean = false

  proyectos:  Opcion[] = []
  secciones:  Seccion[] = []
  periodos: Opcion[] = []
  dataPeriodosAuditoria: SeccionPeriodos[] = [];
  fechaInicio: any;
  fechaFin: any;
  selectP : any;
  numeroProyecto: any;
  Label_cumplimiento: string;
  
  constructor() { }

  get auditorias() {
    return this.form.get('auditorias') as FormArray
  }

  ngOnInit(): void {
    // this.onPeriodos();
    this.sharedService.cambiarEstado(true)

    if(this.auditoriaService.esLegal){
      this.Label_cumplimiento = "Descripción del entregable"
    }else{
      this.Label_cumplimiento = "Cumplimiento"
    }

    forkJoin([
      this.auditoriaService.getCumplimiento(),
      this.timesheetService.getCatProyectos()
    ])
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: (value) => {
        console.log('esta informacion es de forkjoin', value);
        const [auditoriaR, proyectosR] = value
        // const [periodoR, periodosR] = value
        this.secciones = auditoriaR.data
        this.proyectos = proyectosR.data.map(proyecto => ({code: proyecto.numProyecto.toString(), name: `${proyecto.numProyecto} - ${proyecto.nombre}`}))
        // this.periodos = periodosR.data.map(periodo => ({code: periodo.numProyecto.toString(), name: `${this.fechaInicio} - ${this.fechaFin}`}))
        this.secciones.forEach(seccion => {
          seccion.auditorias.forEach(auditoria => {
            this.auditorias.push(this.fb.group({
              id_auditoria: [auditoria.idAuditoria],
              aplica:       [auditoria.aplica],
              motivo:       [auditoria.motivo],
              punto:        [auditoria.punto],
              cumplimiento: [this.auditoriaService.tipo == 'calidad' ? auditoria.cumplimientoCalidad : auditoria.cumplimientoLegal],
              documentoRef: [auditoria.documentoRef],
              id_seccion:   [auditoria.idSeccion],
              seccion:      [seccion.chSeccion]
            }))
          })
        })
      },
      error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: SUBJECTS.error})
    })
  }

  guardar() {
    this.sharedService.cambiarEstado(true)

    this.auditoriaService.agregarCumplimiento(this.form.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.messageService.add({ severity: 'success', summary: 'Registro guardado', detail: 'El registro ha sido guardado.' })
          // this.router.navigate(['auditoria/cargar'], {queryParams: {success: true, tipo: this.auditoriaService.esLegal ? 'legal' : null}})
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }
  getCumplimientos(event: any) {
    console.log(this.fechaInicio, this.fechaFin);
    
    this.sharedService.cambiarEstado(true)
    const {value: id} = event
    this.auditoriaService.getProyectoCumplimiento(id, this.fechaInicio, this.fechaFin)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          console.log(data,'mi data');
          
          let auditoriasLista: number[] = []
          data.forEach(cumplimiento => {
            cumplimiento.auditorias.forEach(auditoria => {
              if(auditoria.aplica) {
                auditoriasLista.push(auditoria.idAuditoria)
                console.log(auditoriasLista, 'Auditoria Lista');
              }
            })
          })
          
          this.auditorias.controls.forEach(control => {
            control.patchValue({
              aplica: auditoriasLista.includes(control.value.id_auditoria)
            })
          })
          // this.secciones = data
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: SUBJECTS.error})
      })
  }
  // onPeriodos(){
  //   console.log('onPeriodos');
  //   this.getPeriodosAuditorita;
  // };
  // next: (respuesta: any) => {
  //   if (respuesta && respuesta.length > 0) {
  //     this.dataCp = respuesta;
  //     if (this.dataCp.length > 0) {
  //       this.formSaveAddInstall
  //         .get('insEntidadFederativa')
  //         .setValue(this.dataCp[0].estado);
  //       this.formSaveAddInstall
  //         .get('insMunicipio')
  //         .setValue(this.dataCp[0].municipio);
  //       this.formSaveAddInstall
  //         .get('insColonia')
  //         .setValue(this.dataCp.colonia);
  //     } else {
  //       this.formSaveAddInstall.get('insEntidadFederativa').setValue('');
  //       this.formSaveAddInstall.get('insMunicipio').setValue('');
  //       this.formSaveAddInstall.get('insColonia').setValue('');
  //     }
  //   }
  // },

  getPeriodosAuditorita(event: any) {
    this.sharedService.cambiarEstado(true)
    const {value: id} = event
    this.auditoriaService.getProyectoPeriodosAuditoria(id)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          const [periodoR, periodosR] = data
          this.secciones = periodoR.data
          this.periodos = periodosR?.data.map(periodo => ({code: periodo?.numProyecto.toString(), fecha: `${periodo?.this.fechaInicio} - ${periodo?.this.fechaFin}`}))
          this.dataPeriodosAuditoria = data;
          this.dataPeriodosAuditoria.forEach(periodoAudit => {
            this.fechaInicio = periodoAudit?.fechaInicio
           this.fechaFin = periodoAudit?.fechaFin
           this.numeroProyecto = periodoAudit?.idProyecto;
           console.log(this.fechaInicio, this.fechaFin);
           this.form.get('id_periodo').setValue(this.fechaInicio + ' / ' + this.fechaFin);
           this.form.get('id_periodo').patchValue(this.fechaInicio + ' / ' + this.fechaFin);
           this.selectP = this.fechaInicio + this.fechaFin;
           console.log(this.selectP);
        })
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: SUBJECTS.error})
      })
  }

  startAuditoria(){
    console.log('inicio la auditoria');
    console.log(this.numeroProyecto);
    this.sharedService.cambiarEstado(true)
    const numProyecto = {
      num_proyecto: this.numeroProyecto
    }
    this.auditoriaService.getOpenPeriodoAuditoria(numProyecto)
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: ({data}) => {

      },
      error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: SUBJECTS.error})
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

  esInvalidoEnArreglo(formArray: FormArray, campo: string, index: number): boolean {
    return formArray.controls[index].get(campo).invalid && 
            (formArray.controls[index].get(campo).dirty || formArray.controls[index].get(campo).touched)
  }

  obtenerMensajeErrorEnArreglo(formArray: FormArray, campo: string, index: number): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if(formArray.controls[index].get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }

}
