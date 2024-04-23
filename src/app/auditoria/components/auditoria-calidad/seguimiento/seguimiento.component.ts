import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { finalize, forkJoin, map } from 'rxjs';
import { Auditoria, Seccion, SeccionPeriodos } from 'src/app/auditoria/models/auditoria.model';
import { AuditoriaService } from 'src/app/auditoria/services/auditoria.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TimesheetService } from 'src/app/timesheet/services/timesheet.service';
import { descargarArchivo } from 'src/helpers/helpers';
import { Opcion, OpcionDos } from 'src/models/general.model';
import { SUBJECTS, TITLES, errorsArray } from 'src/utils/constants';
import { VerDocumentosComponent } from '../../ver-documentos/ver-documentos.component';
import { ComentariosModalComponent } from '../../comentarios-modal/comentarios-modal.component';
import { FinalizarAuditoriaModalComponent } from '../../finalizar-auditoria-modal/finalizar-auditoria-modal.component';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.css'],
  providers: [MessageService, DialogService]
})
export class SeguimientoComponent implements OnInit {

  sharedService = inject(SharedService)
  messageService = inject(MessageService)
  auditoriaService = inject(AuditoriaService)
  fb = inject(FormBuilder)
  timesheetService = inject(TimesheetService)
  router = inject(Router)
  dialogService = inject(DialogService)

  form = this.fb.group({
    id_proyecto: ['', Validators.required],
    id_periodo: ['', Validators.required],
    auditorias: this.fb.array([]),
  })

  esActualizacion: boolean = false

  proyectos: Opcion[] = []
  secciones: Seccion[] = []
  dataPeriodosAuditoria: SeccionPeriodos[] = [];
  dtaPAuditoria: OpcionDos[] = [];

  totalDocumentos: number = 0
  totalDocumentosValidados: number = 0
  numProyecto: number;
  fechaInicio: any;
  fechaFin: any;
  Label_cumplimiento: string;
  disabledAuditoria = true;
  disabledBtns: boolean = false;
  disabledEndAuditoria = false;


  constructor() { }

  get auditorias() {
    return this.form.get('auditorias') as FormArray
  }

  ngOnInit(): void {

    if (this.auditoriaService.esLegal) {
      this.Label_cumplimiento = "Descripción del entregable"
    } else {
      this.Label_cumplimiento = "Cumplimiento"
    }

    this.sharedService.cambiarEstado(true)
    this.functForJoin()

      this.form.get('id_periodo').valueChanges.subscribe( value => {
      })
  }

  functForJoin() {
    forkJoin([
      this.timesheetService.getCatProyectos()
    ])
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (value) => {
          const [proyectosR] = value
          this.proyectos = proyectosR.data.map(proyecto => ({ code: proyecto.numProyecto.toString(), name: `${proyecto.numProyecto} - ${proyecto.nombre}` }))
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
      })

  }

  guardar() {
    this.sharedService.cambiarEstado(true)

    this.auditoriaService.validarDocumentos({ data: this.auditorias.value })
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.messageService.add({ severity: 'success', summary: 'Validación guardada', detail: 'La validación ha sido guardada.' })
          // this.getSeccionesPorId(+this.form.value.id_proyecto)
          this.getPeriodosAudit(+this.form.value.id_proyecto)
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
  }

  getSecciones(event: any) {
    const { value: id } = event

    this.numProyecto = id

    // this.getSeccionesPorId(id)
  }

  getSeccionesPorId(id: number) {
    this.sharedService.cambiarEstado(true)

    this.totalDocumentos = 0
    this.totalDocumentosValidados = 0

    this.auditorias.clear()
    // this.auditoriaService.getProyectoCumplimiento(id)
    //   .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    //   .subscribe({
    //     next: ({ data }) => {
    //       data.forEach(seccion => {
    //         seccion.auditorias.forEach(auditoria => {
    //           this.auditorias.push(this.fb.group({
    //             id_auditoria_cumplimiento: [auditoria['idAuditoriaProyecto']],
    //             id_auditoria: [auditoria.idAuditoria],
    //             aplica: [auditoria.aplica],
    //             motivo: [auditoria.motivo],
    //             punto: [auditoria.punto],
    //             cumplimiento: [auditoria.cumplimiento],
    //             documentoRef: [auditoria.documentoRef],
    //             id_seccion: [auditoria.idSeccion],
    //             tieneDocumento: [auditoria.tieneDocumento],
    //             ultimoDocumentoValido: [auditoria.ultimoDocumentoValido],
    //             valido: [auditoria.ultimoDocumentoValido],
    //             id_documento: [auditoria.idDocumento],
    //             seccion: [seccion.chSeccion],
    //           }))
    //           this.totalDocumentos += +auditoria.aplica
    //           this.totalDocumentosValidados += (auditoria.aplica && auditoria.tieneDocumento) ? +auditoria.ultimoDocumentoValido : 0
    //         })
    //       })
    //     },
    //     error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
    //   })
  }

  getPeriodosAudit(event: any) {
    const {value: id} = event
    this.numProyecto = id;
    this.sharedService.cambiarEstado(true)
    
    this.totalDocumentos = 0
    this.totalDocumentosValidados = 0
    this.auditorias.clear()
    this.auditoriaService.getProyectoPeriodosAuditoria(id)
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: ({data}) => {
        this.dataPeriodosAuditoria = data;
        
        this.dtaPAuditoria = data?.map( prueba => ({proyectoid: prueba?.idProyecto.toString(), fechas: `${prueba.fechaInicio} - ${prueba.fechaFin}` }))
        this.dataPeriodosAuditoria.forEach(periodoAudit => {
          this.fechaInicio = periodoAudit?.fechaInicio
          this.fechaFin = periodoAudit?.fechaFin
          this.numProyecto = periodoAudit?.idProyecto
        })
        this.fechaInicio = data[0]?.fechaInicio ? data[0]?.fechaInicio : '01-01-1600'
        this.fechaFin = data[0]?.fechaFin ? '01-01-1600' : '01-01-1600'
      }
    })
  }

  getPeriodos(event: any) {

    let targetFechas = event?.originalEvent?.target?.innerText
    if(targetFechas.substr(-1) === '-' || targetFechas[0] === ''){
      this.disabledEndAuditoria = true
    }else {
      this.disabledEndAuditoria = false;
    }
    localStorage.setItem('fecha', JSON.stringify(targetFechas.split(' - ')[0]));

    this.sharedService.cambiarEstado(true)
    const {value: id} = event
    
    this.auditoriaService.getProyectoCumplimiento(id, this.fechaInicio ? this.fechaInicio : '01-01-1600', this.fechaFin ? this.fechaFin : '01-01-1600')
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: ({ data }) => {
        data.forEach(seccion => {
          seccion.auditorias.forEach(auditoria => {
            this.auditorias.push(this.fb.group({
              id_auditoria_cumplimiento: [auditoria['idAuditoriaProyecto']],
              id_auditoria: [auditoria.idAuditoria],
              aplica: [auditoria.aplica],
              motivo: [auditoria.motivo],
              punto: [auditoria.punto],
              cumplimiento: [auditoria.cumplimiento],
              documentoRef: [auditoria.documentoRef],
              id_seccion: [auditoria.idSeccion],
              tieneDocumento: [auditoria.tieneDocumento],
              ultimoDocumentoValido: [auditoria.ultimoDocumentoValido],
              valido: [auditoria.ultimoDocumentoValido],
              id_documento: [auditoria.idDocumento],
              seccion: [seccion.chSeccion],
            }))
            this.totalDocumentos += +auditoria.aplica
            this.totalDocumentosValidados += (auditoria.aplica && auditoria.tieneDocumento) ? +auditoria.ultimoDocumentoValido : 0
          })
        })
        if(data){
          this.disabledBtns = true;
        }else {
          this.disabledBtns = false;

        }
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
    })

  }

  getProyectoCalidad(event: any){
    const {value: id} = event
    this.auditoriaService.getProyectoCumplimiento(id,'27_03_2024', '01_01_1600')
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: ({data}) => {
        data.forEach(seccion => {
          seccion.auditorias.forEach(auditoria => {
            this.auditorias.push(this.fb.group({
              id_auditoria_cumplimiento: [auditoria['idAuditoriaProyecto']],
              id_auditoria: [auditoria.idAuditoria],
              aplica: [auditoria.aplica],
              motivo: [auditoria.motivo],
              punto: [auditoria.punto],
              cumplimiento: [auditoria.cumplimiento],
              documentoRef: [auditoria.documentoRef],
              id_seccion: [auditoria.idSeccion],
              tieneDocumento: [auditoria.tieneDocumento],
              ultimoDocumentoValido: [auditoria.ultimoDocumentoValido],
              valido: [auditoria.ultimoDocumentoValido],
              id_documento: [auditoria.idDocumento],
              seccion: [seccion.chSeccion],
            }))
            this.totalDocumentos += +auditoria.aplica
            this.totalDocumentosValidados += (auditoria.aplica && auditoria.tieneDocumento) ? +auditoria.ultimoDocumentoValido : 0
          })
        })
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
    })    
  }
  descargarDocumento(id: number) {
    if (id != 0) {
      this.auditoriaService.getDocumento(id)
        .subscribe({
          next: ({ data }) => {
            this.descargar(data.documentoBase64)
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
        })
    }
  }

  async descargar(base64: string) {
    await descargarArchivo(base64, `Documento_${Date.now()}`)
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

  esInvalidoEnArreglo(formArray: FormArray, campo: string, index: number): boolean {
    return formArray.controls[index].get(campo).invalid &&
      (formArray.controls[index].get(campo).dirty || formArray.controls[index].get(campo).touched)
  }

  obtenerMensajeErrorEnArreglo(formArray: FormArray, campo: string, index: number): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if (formArray.controls[index].get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }

  verDocumentos(idAuditoriaProyecto: number) {
    console.log("ID Auditoria Documento: " + idAuditoriaProyecto);
    this.dialogService.open(VerDocumentosComponent, {
      header: 'Documentos cargados',
      width: '90%',
      height: '90%',
      contentStyle: { overflow: 'auto' },
      data: {
        idAuditoriaProyecto,
        esEdicion: true
      }
    })
      .onClose.subscribe(data => {
        if (data) {
          if (data.exito) {
            this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'Los documentos han sido validados.' })
          }
        }
      })
  }

  mostrarModalComentarios() {

    this.dialogService.open(ComentariosModalComponent, {
      header: 'Resultados de la evaluación',
      width: '90%',
      height: '90%',
      contentStyle: { overflow: 'auto' },
      data: {
        readOnly: false,
        numProyecto: this.numProyecto
      }
    })
      .onClose.subscribe(data => {
        if (data) {
        }
      })
  }

  finalizarAuditoria() {
    this.dialogService.open(FinalizarAuditoriaModalComponent, {
      header: 'Finalizar auditoria',
      width: '40%',
      height: '40%',
      contentStyle: { overflow: 'auto' },
      data: {
        readOnly: false,
        numProyecto: this.numProyecto,
      }
    })
    .onClose.subscribe(data => {
      if (data) {
        this.functForJoin();
      }
    })
    localStorage.setItem('numProyecto', JSON.stringify(this.numProyecto));
    console.log(this.fechaInicio);
  }

}
