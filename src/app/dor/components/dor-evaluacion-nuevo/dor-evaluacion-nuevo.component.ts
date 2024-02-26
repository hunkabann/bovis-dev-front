import { Component, OnInit } from '@angular/core';
import { Objetivos, Subordinados, EstatusObjetivosPorProyecto, MensajesObjetivosCualitativos, ObjetivosGeneralesNuevo } from '../../Models/subordinados';
import { DorService } from '../../Services/dor.service';
import { MessageService } from 'primeng/api';
import { format } from 'date-fns';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize } from 'rxjs';
import { TITLES, meses } from 'src/utils/constants';
import { Item } from 'src/models/general.model';

interface EmpleadosSub {
  name: string,
  value: string,
  id: number
}

@Component({
  selector: 'app-dor-evaluacion-nuevo',
  templateUrl: './dor-evaluacion-nuevo.component.html',
  styleUrls: ['./dor-evaluacion-nuevo.component.css']
})
export class DorEvaluacionNuevoComponent implements OnInit {

  isConsulta = true;
  mostrarContenido = false;
  isObjetivos = false;
  empleadosSub: EmpleadosSub[] = [];
  objetivos2: Objetivos[];
  userMail: string | null = '';
  listSubordinados: Subordinados[];
  listObjetivos: Objetivos[];
  subComple: Subordinados = new Subordinados();
  clonedObjetivos: { [s: string]: Objetivos; } = {};
  clonedObjetivoTipoDos2: { [s: string]: ObjetivosGeneralesNuevo; } = {};
  listObjGenrales: ObjetivosGeneralesNuevo[];
  listObjGenralesTipoUno: ObjetivosGeneralesNuevo[];
  listObjGenralesTipoDos: ObjetivosGeneralesNuevo[];
  listObjGenralesTipoDos2: ObjetivosGeneralesNuevo[];
  tiposTablasObjGenerales: string[];
  totalObjetivosTipoUno: number = 0;
  totalObjetivosTipoDos: number = 0;
  totalRealTipoUno: number = 0;
  totalRealTipoDos: number = 0;
  totalObjetivosCualitativos: number = 0;
  totalRealCualitativos: number = 0;
  totalCualitativosResultado: number = 0;
  totalObjetivosGeneral: number = 0;
  msgs: any = [];
  mensaje_sin_datos = MensajesObjetivosCualitativos.sin_datos_captura;
  motivoRechazoObjetivos: string = '';
  isMotivoRechazo: boolean = false;
  anio: number = 0;
  mes: number = 0;
  mesCurso: Date = null
  maxFecha: Date = null
  idEmpleado: number;
  numEmpleado: number;
  objetivoAModificar: Objetivos;
  aceptado: boolean = true;
  // idEmpleadoActual: number;

  meses: Item[] = []
  anios: Item[] = []

  totalCorporativoReal: number = 0
  totalDeProyectoReal: number = 0

  constructor(public docService: DorService, private messageService: MessageService, private sharedService: SharedService) {
    //console.log(localStorage.getItem('userMail'));
    this.userMail = localStorage.getItem('userMail');
  }

  ngOnInit(): void {
    const fechaCurrent = new Date()
    this.cargarAnios()
    this.anio = +format(fechaCurrent, 'Y')
    this.cargarMeses(this.anio)
    this.getInicialDatosEjecutivo();
  }

  getInicialDatosEjecutivo() {
    this.sharedService.cambiarEstado(true)
    try {
      this.docService.getDatosEjecutivo(this.userMail).subscribe(data => {
        //this.docService.getDatosEjecutivo('jmmorales@hunkabann.com.mx').subscribe(data => {
        //console.log(data);
        if (!data['data'])
        {
          this.sharedService.cambiarEstado(false)
          this.messageService.add({ severity: 'warn', summary: TITLES.error, detail: data['message'] })
          return;
        }


        const str = 'data' as any;
        let datos = data[str as keyof typeof data];
        //console.log(datos['nombre' as keyof typeof datos]);
        let nombre = datos['nombre' as keyof typeof datos];
        this.docService.getDatosSubordinados(nombre)
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe(dataSub => {
            //console.log(dataSub);
            this.listSubordinados = <Subordinados[]>dataSub.data;
            //console.log(this.listSubordinados);
            this.listSubordinados.forEach(element => {
              this.empleadosSub.push({ name: String(element.nombre), value: String(element.nombre), id: +element.noEmpleado })
            });
          });
      });
    }
    catch (ex) {
      this.sharedService.cambiarEstado(false)
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: ex.error.message })
    }
  }


  onChangeEmpleado(event: any) {
    /*console.log('event :' + event);
     console.log(event.value);*/
    if (event.value) {

      this.sharedService.cambiarEstado(true)

      this.idEmpleado = event.value;

      this.numEmpleado = event.value.id

      let select = <EmpleadosSub>event.value
      //console.log(this.listSubordinados);
      let subordinado = this.listSubordinados.find(xx => xx.nombre == select.value) ?? {};
      //console.log(subordinado);
      this.subComple.proyecto = subordinado?.proyecto || '';
      this.subComple.noEmpleado = subordinado?.noEmpleado || '';
      this.subComple.unidadDeNegocio = subordinado?.unidadDeNegocio || '';
      this.subComple.direccionEjecutiva = subordinado?.direccionEjecutiva || '';
      this.subComple.centrosdeCostos = subordinado?.centrosdeCostos || '';

      this.getObjetivosPorProyecto(String(this.anio), this.subComple.centrosdeCostos, this.subComple.noEmpleado, subordinado.nivel || '', EstatusObjetivosPorProyecto.inicial, true, this.mes);

      /*       this.docService.getConsultarGPM(this.subComple.centrosdeCostos).subscribe(gpm => {
              //console.log(gpm);
              this.docService.getObjetivosGenerales(subordinado.nivel || '', subordinado?.unidadDeNegocio || '').subscribe(generales => {
                this.listObjGenrales = generales.data;
                //console.log(this.listObjGenrales);
                this.getTablasObjetivosGenerales(gpm);
              });
            }); */
      this.docService.getConsultarMetasProyecto(this.subComple.centrosdeCostos, subordinado.nivel, this.mes, 'Evaluacion', event.value.id, this.anio)
        // .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (gpm) => {
            this.docService.getObjetivosGenerales(subordinado.nivel || '', subordinado?.unidadDeNegocio || '', this.mes, 'Evaluacion', this.anio)
              .subscribe({
                next: (generales) => {
                  this.listObjGenrales = generales.data;
                  this.getTablasObjetivosGenerales(gpm);
                  this.sharedService.cambiarEstado(false)
                },
                error: (err) => this.sharedService.cambiarEstado(false)
              });
          },
          error: (err) => this.sharedService.cambiarEstado(false)
        });
    }
  }

  clearPorcentajes() {
    this.totalObjetivosTipoUno = 0;
    this.totalObjetivosTipoDos = 0;
    this.totalRealTipoUno = 0;
    this.totalRealTipoDos = 0;
    this.totalObjetivosCualitativos = 0;
    this.totalCualitativosResultado = 0;
    this.totalRealCualitativos = 0;
    this.totalObjetivosGeneral = 0;
    this.docService.totalCorporativoResultado = 0;
    this.docService.totalDeProyectoResultado = 0;
  }

  getObjetivosPorProyecto(anio: string, numProyecto: string, noEmpleado: string, nivel: string, tipo: number, isRecursivo: boolean, mes: number) {
    this.clearPorcentajes();
    this.docService.getObjetivosByProyecto(anio, numProyecto, noEmpleado, nivel, tipo, mes).subscribe(objetivos => {

      if (objetivos.data.length == 0 && isRecursivo) {
        this.listObjetivos = [];
        this.objetivos2 = [];
        this.getObjetivosPorProyecto(anio, numProyecto, noEmpleado, nivel, EstatusObjetivosPorProyecto.rechazado_por_empleado, false, mes);
      }
      else {
        this.listObjetivos = objetivos.data;
        this.objetivos2 = objetivos.data;
        this.isObjetivos = true;
        let numId = 1;
        this.listObjetivos.forEach(obj => {
          this.aceptado = (obj.acepto == '5')
          obj.id = numId.toString();
          numId++;
          //obj.descripcion == 'Objetivo personal' ? obj.isComodin = true : obj.isComodin = false;
          obj.descripcion.startsWith("2") ? obj.isComodin = true : obj.isComodin = false;
          obj.descripcion?.includes('Evaluación 360°') ? obj.isEditable = true : obj.isEditable = false;
          //obj.descripcion?.includes('Objetivo personal') ? obj.isEditable = true : obj.isEditable = false;

          // if(obj.descripcion?.includes('Evaluación 360°') || obj.descripcion == 'Objetivo personal') {
          if (obj.descripcion?.includes('Evaluación 360°') || obj.descripcion.startsWith("2")) {
            obj.resultadoTemporal = (obj.real / +obj.meta)
          }

          this.totalObjetivosCualitativos += Number(obj.valor || '');

          if (obj.descripcion.startsWith("2")) {
            this.totalCualitativosResultado += (((+obj.porcentajeReal * 100) / +obj.valor) >= 80 ? +obj.porcentajeReal : 0)
          } else {
            this.totalCualitativosResultado += (+obj.porcentajeReal >= +obj.valor ? +obj.valor : 0)
          }
          //this.totalCualitativosResultado += (+obj.porcentajeReal >= +obj.valor ? +obj.valor : 0)

          this.totalRealCualitativos += Number(obj.real)

          if (obj.motivoR != null && obj.motivoR != '' && +obj.acepto != 2) {
            this.motivoRechazoObjetivos = obj.motivoR;
            this.isMotivoRechazo = true;
          }
          else {
            this.motivoRechazoObjetivos = '';
            this.isMotivoRechazo = false;
          }

          if (+obj.acepto == 2 || +obj.acepto == 5) {
            this.mostrarContenido = true
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
    if (indiceCorporativo == 1) {
      tipos = tipos.reverse();
    }
    this.tiposTablasObjGenerales = tipos;
    this.listObjGenralesTipoUno = this.listObjGenrales.filter(xx => xx.concepto == "CORPORATIVO");
    this.listObjGenralesTipoDos = this.listObjGenrales.filter(xx => xx.concepto != "CORPORATIVO");


    this.listObjGenralesTipoUno.forEach(obj => {
      this.totalObjetivosTipoUno += Number(obj.valor || '');
      this.totalRealTipoUno += Number((obj.descripcion.split(' ').join('') == 'GPMBovis' ? obj.metaMensual : obj.real) || '');
    });

    if (gpm.data.length > 0) {
      if (!tipos.includes('DE PROYECTO')) {
        tipos = [...tipos, 'DE PROYECTO'];
      }
      this.tiposTablasObjGenerales = tipos;

      //let objGPM: ObjetivosGenerales = gpm.data[0];
      let objGPM: ObjetivosGeneralesNuevo[];
      objGPM = gpm.data;

      //objGPM.valor == null ? objGPM.valor = '0' : '';
      //console.log('objGPM');
      //console.log(objGPM);
      objGPM.forEach(function (value) {
        // value.meta = value.meta ? value.meta +' %' : '-'
        value.meta = value.meta ? value.meta : 0
      });

      //this.listObjGenralesTipoDos.splice(0,0, objGPM);
      this.listObjGenralesTipoDos = objGPM.concat(this.listObjGenralesTipoDos);
      this.listObjGenralesTipoDos2 = this.listObjGenralesTipoDos
      console.log(this.listObjGenralesTipoDos)
      //this.listObjGenralesTipoDos.push(objGPM);
    }

    this.listObjGenralesTipoDos.forEach(obj => {
      this.totalObjetivosTipoDos += Number(obj.valor || '');
      this.totalRealTipoDos += Number(obj.real || '');

      // if(!this.idEmpleadoActual) {
      //   this.idEmpleadoActual = obj.empleado
      // }
    });

    //console.log( this.listObjGenralesTipoDos);
    this.tiposTablasObjGenerales = [...new Set([
      ...this.listObjGenralesTipoUno.map(({ concepto }) => concepto),
      ...this.listObjGenralesTipoDos.map(({ concepto }) => concepto)
    ])]

    if (this.tiposTablasObjGenerales.length > 2) {
      this.tiposTablasObjGenerales.pop()
    }

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
      // console.log(udt);
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
        // console.log(udt);
      });
    });
    //console.log(this.listObjetivos);
    this.isObjetivos = false;
    this.messageService.add({ severity: 'success', summary: 'Guardar', detail: 'Todos los objetivos fueron almacenados correctamente' });
  }

  onRowEditInit(product: ObjetivosGeneralesNuevo) {
    this.clonedObjetivoTipoDos2[product.id] = { ...product };
  }

  asignarValorComodin() {

    this.listObjetivos.forEach(obj => {
      obj.descripcion == 'Sustentabilidad?' ? obj.isComodin = true : obj.isComodin = false;
    });
    this.objetivos2.forEach(obj => {
      obj.descripcion == 'Sustentabilidad?' ? obj.isComodin = true : obj.isComodin = false;
    });
  }

  onRowEditSave(objetivo: ObjetivosGeneralesNuevo) {
    if (objetivo.real) {
      this.sharedService.cambiarEstado(true)
      this.docService.actualizarReal({
        id: objetivo.id,
        // id_empleado: this.idEmpleadoActual,
        id_empleado: objetivo.empleado,
        real: objetivo.real
      })
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (data) => {
            this.messageService.add({ severity: 'success', summary: 'Valor actualizado', detail: 'El valor ha sido actualizado.' })
            this.sharedService.cambiarEstado(true)
            this.onChangeEmpleado({ value: this.idEmpleado })
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        })
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Campo Real Requerido' })
    }
  }

  onRowEditCancel(objetivo: ObjetivosGeneralesNuevo, index: number) {
    /* console.log(product);
    console.log(index); */
    this.listObjGenralesTipoDos2[index] = this.clonedObjetivoTipoDos2[objetivo.id];
    delete this.clonedObjetivoTipoDos2[objetivo.id];
  }

  /**
   * Funciones cualitativos
   */

  onRowEditInitCualitativos(product: Objetivos) {
    this.objetivoAModificar = { ...product }
    this.clonedObjetivos[product.id] = { ...product };
  }

  onRowEditSaveCualitativos(objetivo: Objetivos) {

    if (!isNaN(objetivo.real)) {
      if (objetivo.real) {
        if (objetivo.real <= 100) {
          this.sharedService.cambiarEstado(true)
          this.docService.actualizarRealCualitativos({
            id: objetivo.idEmpOb,
            real: objetivo.real
          })
            .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
            .subscribe({
              next: (data) => {
                this.messageService.add({ severity: 'success', summary: 'Valor actualizado', detail: 'El valor ha sido actualizado.' })
                this.sharedService.cambiarEstado(true)
                this.onChangeEmpleado({ value: this.idEmpleado })
              },
              error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
            })
        } else {
          objetivo.real = this.objetivoAModificar.real
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Campo Real debe ser menor o igual a 100' })
        }
      }
      else {
        objetivo.real = this.objetivoAModificar.real
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Campo Real Requerido' })
      }
    } else {
      objetivo.real = this.objetivoAModificar.real
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Campo Real debe ser númerico' })
    }
  }

  onRowEditCancelCualitativos(objetivo: Objetivos, index: number) {
    /* console.log(product);
    console.log(index); */
    this.objetivos2[index] = this.clonedObjetivos[objetivo.id];
    delete this.clonedObjetivos[objetivo.id];
  }

  onSelectFecha(event: any, esMes: boolean = true) {
    if (esMes) {
      this.mes = event.value
    } else {
      this.anio = event.value
      this.cargarMeses(this.anio)
    }
    this.onChangeEmpleado({ value: this.idEmpleado })
  }

  cargarAnios() {
    const fechaActual = new Date()
    const anioActual = +format(fechaActual, 'Y')

    for (let i = anioActual - 10; i <= anioActual; i++) {
      this.anios.unshift({ value: i, label: i.toString() })
    }
  }

  cargarMeses(anio: number) {

    const fechaActual = new Date()
    const anioActual = +format(fechaActual, 'Y')
    const mesActual = +format(fechaActual, 'M')
    const diaActual = +format(fechaActual, 'd')
    const diaLimite = 20// 31
    let mesMaximo = 0

    if (anio === anioActual) {
      if (diaActual >= diaLimite && mesActual > 1) {
        mesMaximo = mesActual - 1
      } else {
        mesMaximo = mesActual - 2
      }

      this.meses = meses.filter(mes => +mes.value <= mesMaximo)
    } else {
      if ((anio + 1) == anioActual) {
        mesMaximo = 12
        if (mesActual == 1 && diaActual < diaLimite) {
          mesMaximo = mesMaximo - 1
        }

        this.meses = meses.filter(mes => +mes.value <= mesMaximo)
      } else {
        this.meses = meses
      }
    }

    this.mes = 0
  }

  actualizarAcepto() {
    this.sharedService.cambiarEstado(true)

    this.docService.actualizarAcepto(this.numEmpleado)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          this.messageService.add({ severity: 'success', summary: TITLES.success, detail: 'El registro ha sido evaluado.' })
          this.aceptado = true
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
  }

  // limpiarMes() {
  //   this.mesCurso = null
  //   this.mes = 0
  //   this.onChangeEmpleado({value: this.idEmpleado})
  // }

}
