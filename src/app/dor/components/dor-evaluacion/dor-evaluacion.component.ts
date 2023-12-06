import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { DorService } from '../../Services/dor.service';
import { Objetivos, ObjetivosGenerales, Subordinados, EstatusObjetivosPorProyecto, MensajesObjetivosCualitativos } from '../../Models/subordinados';

@Component({
  selector: 'app-dor-evaluacion',
  templateUrl: './dor-evaluacion.component.html',
  styleUrls: ['./dor-evaluacion.component.scss']
})
export class DorEvaluacionComponent implements OnInit {
  userMail: string | null = '';
  isConsulta = true;
  empleado: Subordinados = new Subordinados();
  listObjGenrales: ObjetivosGenerales[];
  listObjGenralesTipoUno: ObjetivosGenerales[];
  listObjGenralesTipoDos: ObjetivosGenerales[];
  tiposTablasObjGenerales: any;
  listObjetivos: Objetivos[] = [];
  totalObjetivosTipoUno: number = 0;
  totalObjetivosTipoDos: number = 0;
  totalObjetivosCualitativos: number = 0;
  mensaje_sin_datos = MensajesObjetivosCualitativos.sin_datos_evaluacion;
  anio: number = 2023;

  constructor(private dorService: DorService, private confirmationService: ConfirmationService,
    private primengConfig: PrimeNGConfig, private messageService: MessageService) {
    this.userMail = localStorage.getItem('userMail');
  }

  ngOnInit(): void {
    this.getInfoEmpleado();

  }

  getInfoEmpleado() {
    this.dorService.getDatosEmpleado(this.userMail).subscribe(emp => {
      this.empleado = emp.data || new Subordinados();
      console.log(this.empleado);

      this.getObjetivosPorProyecto(String(this.anio), this.empleado.centrosdeCostos || '', this.empleado.noEmpleado || '', this.empleado.nivel || '', EstatusObjetivosPorProyecto.aceptado_por_empleado, true)

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

    this.dorService.getObjetivosByProyecto(anio, numProyecto, noEmpleado, nivel, tipo).subscribe(objetivos => {

      if (objetivos.data.length == 0 && isRecursivo) {
        this.listObjetivos = [];
        this.getObjetivosPorProyecto(anio, numProyecto, noEmpleado, nivel, EstatusObjetivosPorProyecto.evaluado, false);
      }
      else {
        this.listObjetivos = objetivos.data;
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

}
