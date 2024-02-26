import { Component, OnInit } from '@angular/core';
import { Objetivos, ObjetivosGenerales, Subordinados, EstatusObjetivosPorProyecto, MensajesObjetivosCualitativos } from '../../Models/subordinados';
import { DorService } from '../../Services/dor.service';
import { MessageService } from 'primeng/api';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize } from 'rxjs';
import { TITLES } from 'src/utils/constants';

interface EmpleadosSub {
  name: string,
  value: string
}

@Component({
  selector: 'app-dor-captura',
  templateUrl: './dor-captura.component.html',
  styleUrls: ['./dor-captura.component.scss']
})
export class DorCapturaComponent implements OnInit {

  isConsulta = true;
  isObjetivos = false;
  empleadosSub: EmpleadosSub[] = [];
  objetivos2: Objetivos[];
  userMail: string | null = '';
  listSubordinados: Subordinados[];
  listObjetivos: Objetivos[];
  subComple: Subordinados = new Subordinados();
  clonedObjetivos: { [s: string]: Objetivos; } = {};
  listObjGenrales: ObjetivosGenerales[];
  listObjGenralesTipoUno: ObjetivosGenerales[];
  listObjGenralesTipoDos: ObjetivosGenerales[];
  tiposTablasObjGenerales: any;
  totalObjetivosTipoUno: number = 0;
  totalObjetivosTipoDos: number = 0;
  totalObjetivosCualitativos: number = 0;
  totalObjetivosGeneral: number = 0;
  msgs: any = [];
  mensaje_sin_datos = MensajesObjetivosCualitativos.sin_datos_captura;
  motivoRechazoObjetivos: string = '';
  isMotivoRechazo: boolean = false;
  anio: number = 2023;
  constructor(private docService: DorService, private messageService: MessageService, private sharedService: SharedService) {
    //console.log(localStorage.getItem('userMail'));
    this.userMail = localStorage.getItem('userMail');
  }

  ngOnInit(): void {
    this.getInicialDatosEjecutivo()
  }

  getInicialDatosEjecutivo() {
    this.sharedService.cambiarEstado(true)
    this.docService.getDatosEjecutivo(this.userMail).subscribe(data => {
      const dataMod = data as any
      if (dataMod.success) {
        const str = 'data' as any;
        let datos = data[str as keyof typeof data];
        let nombre = datos['nombre' as keyof typeof datos];
        this.docService.getDatosSubordinados(nombre)
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: (dataSub) => {
              this.listSubordinados = <Subordinados[]>dataSub.data;
              this.listSubordinados.forEach(element => {
                this.empleadosSub.push({ name: String(element.nombre), value: String(element.nombre) })
              });
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
          })
      } else {
        this.sharedService.cambiarEstado(false)
        this.messageService.add({ severity: 'warn', summary: TITLES.error, detail: dataMod.message })
      }
    });
  }

  onChangeEmpleado(event: any) {
    /*console.log('event :' + event);
     console.log(event.value);*/
    if (event.value) {

      this.sharedService.cambiarEstado(true)

      let select = <EmpleadosSub>event.value
      //console.log(this.listSubordinados);
      let subordinado = this.listSubordinados.find(xx => xx.nombre == select.value) ?? {};
      //console.log(subordinado);
      this.subComple.proyecto = subordinado?.proyecto || '';
      this.subComple.noEmpleado = subordinado?.noEmpleado || '';
      this.subComple.unidadDeNegocio = subordinado?.unidadDeNegocio || '';
      this.subComple.direccionEjecutiva = subordinado?.direccionEjecutiva || '';
      this.subComple.centrosdeCostos = subordinado?.centrosdeCostos || '';

      this.getObjetivosPorProyecto(String(this.anio), this.subComple.centrosdeCostos, this.subComple.noEmpleado, subordinado.nivel || '', EstatusObjetivosPorProyecto.inicial, true);

      /*       this.docService.getConsultarGPM(this.subComple.centrosdeCostos).subscribe(gpm => {
              //console.log(gpm);
              this.docService.getObjetivosGenerales(subordinado.nivel || '', subordinado?.unidadDeNegocio || '').subscribe(generales => {
                this.listObjGenrales = generales.data;
                //console.log(this.listObjGenrales);
                this.getTablasObjetivosGenerales(gpm);
              });
            }); */
      this.docService.getConsultarMetasProyecto(this.subComple.centrosdeCostos, subordinado.nivel)
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe(gpm => {
          //  this.docService.getConsultarMetasProyecto('274', '4').subscribe(gpm => {
          // console.log(gpm);
          this.docService.getObjetivosGenerales(subordinado.nivel || '', subordinado?.unidadDeNegocio || '').subscribe(generales => {
            this.listObjGenrales = generales.data;
            // console.log(this.listObjGenrales);
            this.getTablasObjetivosGenerales(gpm);
          });
        });
    }
  }

  clearPorcentajes() {
    this.totalObjetivosTipoUno = 0;
    this.totalObjetivosTipoDos = 0;
    this.totalObjetivosCualitativos = 0;
    this.totalObjetivosGeneral = 0;
  }

  getObjetivosPorProyecto(anio: string, numProyecto: string, noEmpleado: string, nivel: string, tipo: number, isRecursivo: boolean) {
    this.clearPorcentajes();
    this.docService.getObjetivosByProyecto(anio, numProyecto, noEmpleado, nivel, tipo).subscribe(objetivos => {

      if (objetivos.data.length == 0 && isRecursivo) {
        this.listObjetivos = [];
        this.objetivos2 = [];
        this.getObjetivosPorProyecto(anio, numProyecto, noEmpleado, nivel, EstatusObjetivosPorProyecto.rechazado_por_empleado, false);
      }
      else {
        this.listObjetivos = objetivos.data;
        this.objetivos2 = objetivos.data;
        this.isObjetivos = true;
        let numId = 1;
        this.listObjetivos.forEach(obj => {
          obj.id = numId.toString();
          numId++;
          obj.descripcion == 'Objetivo personal' ? obj.isComodin = true : obj.isComodin = false;
          obj.descripcion?.includes('Evaluación 360°') ? obj.isEditable = true : obj.isEditable = false;
          //obj.descripcion?.includes('Objetivo personal') ? obj.isEditable = true : obj.isEditable = false;

          this.totalObjetivosCualitativos += Number(obj.valor || '');

          if (obj.motivoR != null && obj.motivoR != '') {
            this.motivoRechazoObjetivos = obj.motivoR;
            this.isMotivoRechazo = true;
          }
          else {
            this.motivoRechazoObjetivos = '';
            this.isMotivoRechazo = false;
          }

        });
        let numId2 = 1;
        this.objetivos2.forEach(obj => {
          obj.id = numId2.toString();
          //element.Empleado = '10003';
          numId2++;
        });
        //console.log(this.listObjetivos);
      }
    });

  }

  getTablasObjetivosGenerales(gpm: any) {

    let tipos = this.listObjGenrales.map(item => item.concepto)
      .filter((value, index, self) => self.indexOf(value) === index);

    let indiceCorporativo = tipos.indexOf('CORPORATIVO');
    //console.log(indiceCorporativo);
    if (indiceCorporativo == 1) {
      tipos = tipos.reverse();
    }
    this.tiposTablasObjGenerales = tipos;
    //console.log(tipos);
    this.listObjGenralesTipoUno = this.listObjGenrales.filter(xx => xx.concepto == "CORPORATIVO");
    this.listObjGenralesTipoDos = this.listObjGenrales.filter(xx => xx.concepto != "CORPORATIVO");


    this.listObjGenralesTipoUno.forEach(obj => {
      this.totalObjetivosTipoUno += Number(obj.valor || '');
    });

    if (gpm.data.length > 0) {
      //let objGPM: ObjetivosGenerales = gpm.data[0];
      let objGPM: ObjetivosGenerales[];
      objGPM = gpm.data;
      //objGPM.valor == null ? objGPM.valor = '0' : '';
      //console.log('objGPM');
      //console.log(objGPM);
      objGPM.forEach(function (value) {
        value.meta = value.meta ? value.meta + ' %' : '-'
      });

      //this.listObjGenralesTipoDos.splice(0,0, objGPM);
      this.listObjGenralesTipoDos = objGPM.concat(this.listObjGenralesTipoDos);
      //this.listObjGenralesTipoDos.push(objGPM);
    }

    this.listObjGenralesTipoDos.forEach(obj => {
      this.totalObjetivosTipoDos += Number(obj.valor || '');
    });

    //console.log( this.listObjGenralesTipoDos);

  }

  getSubordinados() {
    this.docService.getDatosSubordinados('').subscribe(data => {

    });
  }

  getObjetivosProyectos() {
    /* this.docService.getObjetivosByProyecto().subscribe(data => {

    }); */
  }

  saveObjetivo(objetivo: Objetivos) {
    /* objetivo.Proyecto = this.subComple.proyecto;
    objetivo.Empleado = this.subComple.noEmpleado; */
    objetivo.acepto = '0';
    objetivo.nivel = objetivo.valor;
    //console.log(objetivo);
    this.docService.updateObjetivos(objetivo).subscribe(udt => {
      console.log(udt);
      let mensaje: string = udt.message;
      if (udt.message == null) {
        delete this.clonedObjetivos[objetivo.id];
        this.asignarValorComodin();
        this.messageService.add({ severity: 'success', summary: 'Guardar', detail: 'Almacenado correctamente' });
      }
      else if (mensaje.includes('error')) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
      }
    });
  }

  async saveAllObjetivos() {
    this.listObjetivos.forEach(async objetivo => {
      objetivo.acepto = '1';
      objetivo.nivel = objetivo.valor;
      await this.docService.updateObjetivos(objetivo).subscribe(udt => {
        console.log(udt);
      });
    });
    //console.log(this.listObjetivos);
    this.isObjetivos = false;
    this.messageService.add({ severity: 'success', summary: 'Guardar', detail: 'Todos los objetivos fueron almacenados correctamente' });
  }

  onRowEditInit(product: Objetivos) {
    this.clonedObjetivos[product.id] = { ...product };
  }

  asignarValorComodin() {

    this.listObjetivos.forEach(obj => {
      obj.descripcion == 'Sustentabilidad?' ? obj.isComodin = true : obj.isComodin = false;
    });
    this.objetivos2.forEach(obj => {
      obj.descripcion == 'Sustentabilidad?' ? obj.isComodin = true : obj.isComodin = false;
    });
  }

  onRowEditSave(objetivo: Objetivos) {
    //console.log(objetivo);
    if (objetivo.meta != '') {
      this.saveObjetivo(objetivo);
      /* delete this.clonedObjetivos[product.id];
      this.messageService.add({severity:'success', summary: 'Success', detail:'Product is updated'}); */
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Campo Meta Requerido' });
    }
  }

  onRowEditCancel(objetivo: Objetivos, index: number) {
    /* console.log(product);
    console.log(index); */
    this.objetivos2[index] = this.clonedObjetivos[objetivo.id];
    delete this.clonedObjetivos[objetivo.id];
  }

}
