import { Component, OnInit } from '@angular/core';
import { DorService } from '../../Services/dor.service';
import { Objetivos, ObjetivosGenerales, Subordinados, EstatusObjetivosPorProyecto, MensajesObjetivosCualitativos } from '../../Models/subordinados';
import { ConfirmationService, Message, MessageService, PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-dor-objetivos',
  templateUrl: './dor-objetivos.component.html',
  styleUrls: ['./dor-objetivos.component.scss']
})
export class DorObjetivosComponent implements OnInit {
  userMail: string | null = '';
  isConsulta = true;
  empleado: Subordinados = new Subordinados();
  listObjGenrales: ObjetivosGenerales[];
  listObjGenralesTipoUno: ObjetivosGenerales[];
  listObjGenralesTipoDos: ObjetivosGenerales[];
  tiposTablasObjGenerales: any;
  listObjetivos: Objetivos[] = [];
  msgs: Message[] = [];
  totalObjetivosTipoUno: number = 0;
  totalObjetivosTipoDos: number = 0;
  totalObjetivosCualitativos: number = 0;
  displayModal: boolean;
  motivoRechazoObjetivos: string = '';
  mensaje_sin_datos = MensajesObjetivosCualitativos.sin_datos_objetivos;
  count_carapteres: number = 20;
  anio: number = 2023;
  constructor(private dorService: DorService, private confirmationService: ConfirmationService,
    private primengConfig: PrimeNGConfig, private messageService: MessageService) {
    this.userMail = localStorage.getItem('userMail');
  }

  ngOnInit(): void {
    //console.log(this.userMail);
    this.getInfoEmpleado();

  }

  getInfoEmpleado() {
    this.dorService.getDatosEmpleado(this.userMail).subscribe(emp => {
      this.empleado = emp.data || new Subordinados();
      //console.log(this.empleado);

      this.getObjetivosPorProyecto(String(this.anio), this.empleado.centrosdeCostos || '', this.empleado.noEmpleado || '', this.empleado.nivel || '', EstatusObjetivosPorProyecto.capturado_por_ejecutivo, false)

      this.dorService.getConsultarMetasProyecto(this.empleado.centrosdeCostos,this.empleado.nivel).subscribe(gpm => {
        //console.log(gpm);
        this.dorService.getObjetivosGenerales(this.empleado.nivel || '', this.empleado.unidadDeNegocio || '').subscribe(generales => {
          this.listObjGenrales = generales.data;
          //console.log(this.listObjGenrales);
          this.getTablasObjetivosGenerales(gpm);
        });
      });
    });
  }

  getObjetivosPorProyecto(anio: string, numProyecto: string, noEmpleado: string, nivel: string, tipo: number, isRecursivo: boolean) {

    this.dorService.getObjetivosByProyecto(anio, numProyecto, noEmpleado, nivel, tipo).subscribe(obj => {

      if (obj.data.length == 0) {
        this.listObjetivos = [];
      }
      else {
        this.listObjetivos = obj.data;
        this.listObjetivos.forEach(obj => {
          this.totalObjetivosCualitativos += Number(obj.valor || '');
        });
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
    this.listObjGenralesTipoUno = this.listObjGenrales.filter(xx => xx.concepto == "CORPORATIVO");
    this.listObjGenralesTipoDos = this.listObjGenrales.filter(xx => xx.concepto != "CORPORATIVO");

    this.listObjGenralesTipoUno.forEach(obj => {
      this.totalObjetivosTipoUno += Number(obj.valor || '');
    });

    if(gpm.data.length > 0){
      let objGPM: ObjetivosGenerales[];
      objGPM = gpm.data;
      objGPM.forEach(function (value) {
        value.meta = value.meta +' %'
      });
      //console.log(objGPM);
      this.listObjGenralesTipoDos = objGPM.concat(this.listObjGenralesTipoDos);
    }


    this.listObjGenralesTipoDos.forEach(obj => {
      this.totalObjetivosTipoDos += Number(obj.valor || '');
    });
  }

  confirm1() {
    this.confirmationService.confirm({
      message: 'Apruebas todos los objetivos?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      accept: () => {

        this.saveAllObjetivos('2');
        /*   this.messageService.add({
            severity: "success",
            summary: "Dor",
            detail: "Objetivos aprobados correctamente"
          }); */
        /*  this.msgs = [{severity:'info', summary:'Confirmed', detail:'You have accepted'}]; */
      },
      reject: () => {
        this.messageService.add({
          severity: "warn",
          summary: "Dor",
          detail: "Acción cancelada"
        });
        /* this.msgs = [{severity:'info', summary:'Rejected', detail:'You have rejected'}]; */
      }
    });
  }

  showModalDialog() {
    this.motivoRechazoObjetivos = '';
    this.displayModal = true;
  }

  async saveAllObjetivos(tipoAcept: string) {

    let tipoSaveMensaje = '';
    let isProcesa = true
    if (tipoAcept == '3') {
      tipoSaveMensaje = 'rechazados'
      if (this.motivoRechazoObjetivos.length >= this.count_carapteres) {
        isProcesa = true;
      }
      else{
        isProcesa = false;
      }
    }
    else {
      tipoSaveMensaje = 'aprobados'
    }
    if (isProcesa) {
      this.listObjetivos.forEach(async objetivo => {
        objetivo.acepto = tipoAcept;
        objetivo.nivel = objetivo.valor;
        if (tipoAcept == '3') {
          objetivo.motivoR = this.motivoRechazoObjetivos;
        }

        await this.dorService.updateObjetivos(objetivo).subscribe(udt => {
          this.messageService.add({ severity: 'success', summary: 'Guardar', detail: `Todos los objetivos fueron ${tipoSaveMensaje} correctamente` });
        });
      });

      this.displayModal = false;
      this.getInfoEmpleado();
    }
  }

}
