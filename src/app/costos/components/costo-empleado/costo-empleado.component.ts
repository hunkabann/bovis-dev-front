import { Component, OnInit, inject,ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CostosService } from '../../services/costos.service';
import { SharedService } from '../../../shared/services/shared.service';
import { finalize, forkJoin } from 'rxjs';
import { SUBJECTS, TITLES,EXCEL_EXTENSION } from 'src/utils/constants';
import { CostoEmpleado,encabezados,Beneficio,BeneficiosProyectos,Opcion,OpcionEmp } from '../../models/costos.model';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Item } from 'src/models/general.model';
import { Table } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { Dropdown } from 'primeng/dropdown';
import {TableModule} from 'primeng/table';
import { TagModule } from 'primeng/tag';

interface ICatalogo {
  name: string;
  value: string;
}



@Component({
  selector: 'app-costo-empleado',
  templateUrl: './costo-empleado.component.html',
  styleUrls: ['./costo-empleado.component.css'],
  providers: [MessageService, DialogService]
})
export class CostoEmpleadoComponent implements OnInit {

  costosService   = inject(CostosService)
  messageService  = inject(MessageService)
  sharedService   = inject(SharedService)

  today: Date = new Date();
  pipe = new DatePipe('en-US');
  todayWithPipe = null;
  FechaIngre = null;

  maxDate: Date;
  fechaInicio: Date = null;
  fechaFin: Date = null;

  fetchIni: string  = '1900-01-01';

  today1 = new Date();
  datePipe1 = new DatePipe('en-IN');
      //return datePipe.transform(today, 'dd/MM/yyyy');
  fetchFin: string  = this.datePipe1.transform(this.today1, 'yyyy-MM-dd');
  

  costos: CostoEmpleado[] = []

  arraybeneficio: Beneficio[] = []
  arraybeneficiosProyectos: BeneficiosProyectos[] = []

  Costomenualproy = 0;

  personass:    Opcion[] = []
  puestos:    Opcion[] = []
  proyectos:    Opcion[] = []
  catUnidadNegocio: Opcion[] = []
  empresas:    Opcion[] = []
  estados:    Item[] = [
    {label: 'Activo', value: true},
    {label: 'Inactivo', value: false}
  ]

  vivienda = 0;
  Automovil = 0;
  ViaticosaComprobar = 0;
  BonoAdicionalReubicacion = 0;
  Gasolina = 0;
  Casetas = 0;
  AyudaDeTransporte = 0;
  VuelosDeAvion = 0;
  ProvisionImpuestosExpatsr = 0;
  FringeExpats = 0;
  ProgramaDeEntretenimiento = 0;
  EventosEspeciales = 0;
  CostoIt = 0;
  CostoTelefonia = 0;
  SvDirectivos = 0;
  FacturacionBpm = 0;

  Proy_vivienda = 0;
  Proy_Automovil = 0;
  Proy_ViaticosaComprobar = 0;
  Proy_BonoAdicionalReubicacion = 0;
  Proy_Gasolina = 0;
  Proy_Casetas = 0;
  Proy_AyudaDeTransporte = 0;
  Proy_VuelosDeAvion = 0;
  Proy_ProvisionImpuestosExpatsr = 0;
  Proy_FringeExpats = 0;
  Proy_ProgramaDeEntretenimiento = 0;
  Proy_EventosEspeciales = 0;
  Proy_CostoIt = 0;
  Proy_CostoTelefonia = 0;
  Proy_SvDirectivos = 0;
  Proy_FacturacionBpm = 0;

  @ViewChild('dropDownEmpleado') dropDownEmpleado: Dropdown;
  @ViewChild('dropDownPuesto') dropDownPuesto: Dropdown;
  @ViewChild('dropDownProyecto') dropDownProyecto: Dropdown;
  @ViewChild('dropDownEmpresa') dropDownEmpresa: Dropdown;  
  @ViewChild('dropDownUnidadNegocio') dropDownUnidadNegocio: Dropdown;

  isClear: boolean = false;
  filtroValue: number;

  IDEmpleado: string = '0';
  IDPuesto: number = 0;
  IDProyecto: number = 0;
  IDEmpresa: number = 0;
  IDUnidadNegocio: number = 0;

  opcionFiltro: number = 0;
  constructor() { }

  ngOnInit(): void {
    this.sharedService.cambiarEstado(true)

    forkJoin([
      this.costosService.getEmpleados(),
      this.costosService.getPuestos(),
      this.costosService.getProyectos(),
      this.costosService.getCatUnidadNegocio(),
      this.costosService.getEmpresas()
    ])
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (value) => {
          
          const [personasR, puestosR,proyectosR,unidadNegocioR,EmplresaR] = value
          //const [empleadosR, puestosR] = value 
          //this.personass = personasR.data.map(persona => ({value: persona.chnombre_completo, label: persona.chnombre_completo}))
          //this.personass = personasR.data.map(empleado => ({ code: empleado.nombre_persona.toString(), name: `${empleado.nunum_empleado_rr_hh.toString()} - ${empleado.nombre_persona}` }))
          this.personass = personasR.data.map(persona => ({value: persona.nunum_empleado_rr_hh.toString(), label: `${persona.nunum_empleado_rr_hh.toString()} - ${persona.nombre_persona}` }))
         //this.puestos = puestosR.data.map(puesto => ({value: puesto.chpuesto, label: puesto.chpuesto}))
          this.puestos = puestosR.data.map(puesto => ({value: puesto.nukid_puesto.toString(), label: `${puesto.nukid_puesto} - ${puesto.chpuesto}` }))
          //this.proyectos = proyectosR.data.map(proyecto => ({ code: proyecto.numProyecto.toString(), name: `${proyecto.numProyecto} - ${proyecto.nombre}` }))
          this.proyectos = proyectosR.data.map(proyecto => ({ value: proyecto.numProyecto, label: `${proyecto.numProyecto} -${proyecto.nombre}` }))
          this.catUnidadNegocio = unidadNegocioR.data.map(unidadnegocio => ({ value: unidadnegocio.id.toString(), label: `${unidadnegocio.id.toString()} -${unidadnegocio.descripcion}` }))
          
          //this.empresas = EmplresaR.data.map(empresa => ({ code: empresa.idEmpresa.toString(), name: `${empresa.empresa}` }))
          this.empresas = EmplresaR.data.map(empresa => ({value: empresa.idEmpresa, label: `${empresa.rfc} -${empresa.empresa}`}))
          //this.proyectos = proyectosR.data.map(proyecto => ({value: proyecto.nombre, label: proyecto.nombre }))
         
          
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })

    this.costosService.getCostosEmpleado(true,this.IDEmpleado,this.IDPuesto,this.IDProyecto,this.IDEmpresa,this.IDUnidadNegocio,this.fetchIni,this.fetchFin)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.costos = data
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  exportJsonToExcel(): void {

    const workbook = new ExcelJS.Workbook()

    const worksheet = workbook.addWorksheet('Detalle')

    // Tìtulos
    this._setXLSXTitles(worksheet)

    // Encabezados
    this._setXLSXHeader(worksheet)

    let row = 5
    // Contenido
    row = this._setXLSXContent(worksheet, row)

    // Contenido
    //this._setXLSXContent(worksheet)

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      //saveAs(blob, `FacturacionCancelacion_${Date.now()}${EXCEL_EXTENSION}`)
      this.todayWithPipe = this.pipe.transform(Date.now(), 'dd_MM_yyyy');

      saveAs(blob, `Costos_X_Empleados_` + this.todayWithPipe + `${EXCEL_EXTENSION}`)
    });
  }

  _setXLSXTitles(worksheet: ExcelJS.Worksheet) {

    const fillNota: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } }
    //const fillNotaCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillCobranza: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffa4ffa4' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }


    worksheet.getCell('K3').value = 'Seniority'
    worksheet.getCell('K3').fill = fillNota
    worksheet.getCell('K3').alignment = alignment
    worksheet.mergeCells('K3:L3')

    worksheet.getCell('M3').value = 'Sueldo Neto Mensual (MN)'
    worksheet.getCell('M3').fill = fillNota
    worksheet.getCell('M3').alignment = alignment
    worksheet.mergeCells('M3:O3')

    worksheet.getCell('P3').value = 'Sueldo Bruto'
    worksheet.getCell('P3').fill = fillNota
    worksheet.getCell('P3').alignment = alignment
    worksheet.mergeCells('P3:R3')

    worksheet.getCell('S3').value = 'Aguinaldo'
    worksheet.getCell('S3').fill = fillNota
    worksheet.getCell('S3').alignment = alignment
    worksheet.mergeCells('S3:T3')

    worksheet.getCell('U3').value = 'Prima Vacacional'
    worksheet.getCell('U3').fill = fillNota
    worksheet.getCell('U3').alignment = alignment
    worksheet.mergeCells('U3:V3')

    worksheet.getCell('W3').value = 'Indemnizacion'
    worksheet.getCell('W3').fill = fillNota
    worksheet.getCell('W3').alignment = alignment
   // worksheet.mergeCells('W3:X3')

    worksheet.getCell('X3').value = 'Provision Bono Anual'
    worksheet.getCell('X3').fill = fillNota
    worksheet.getCell('X3').alignment = alignment
    worksheet.mergeCells('X3:Y3')

    worksheet.getCell('Z3').value = 'GMM'
    worksheet.getCell('Z3').fill = fillNota
    worksheet.getCell('Z3').alignment = alignment
    worksheet.mergeCells('Z3:AA3')

    worksheet.getCell('AB3').value = 'Seguro de Vida'
    worksheet.getCell('AB3').fill = fillNota
    worksheet.getCell('AB3').alignment = alignment
    worksheet.mergeCells('AB3:AC3')

    worksheet.getCell('AD3').value = 'Vales de Despensa'
    worksheet.getCell('AD3').fill = fillNota
    worksheet.getCell('AD3').alignment = alignment
    worksheet.mergeCells('AD3:AE3')

    worksheet.getCell('AF3').value = 'PTU'
    worksheet.getCell('AF3').fill = fillNota
    worksheet.getCell('AF3').alignment = alignment

    worksheet.getCell('AU3').value = 'BENEFICIOS DEL EMPLEADO'
    worksheet.getCell('AU3').fill = fillNota
    worksheet.getCell('AU3').alignment = alignment
    worksheet.mergeCells('AU3:BJ3')

    worksheet.getCell('BK3').value = 'BENEFICIOS DEL PROYECTO'
    worksheet.getCell('BK3').fill = fillCobranza
    worksheet.getCell('BK3').alignment = alignment
    worksheet.mergeCells('BK3:BZ3')
  }

  _setXLSXHeader(worksheet: ExcelJS.Worksheet) {
    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff91d2ff' } }
    const alignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }

    encabezados.forEach((encabezado, index) => {
      let cell = worksheet.getCell(4, index + 1)
      cell.value = encabezado.label
      cell.fill = fill
      cell.alignment = alignment
    })
  }

  _setXLSXContent(worksheet: ExcelJS.Worksheet, row: number): number {

    const fillCancelada: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } }
    const fillFactura: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } }

    this.costos.forEach(record => {
      //worksheet.getCell(row).fill = record.fechaCancelacion ? fillCancelada : fillFactura
      //const col = row.getCell(row);

      
      
      if(record.beneficios[0] == undefined){
        this.Costomenualproy = 0

        this.vivienda = 0
        this.Automovil = 0
        this.ViaticosaComprobar = 0
        this.BonoAdicionalReubicacion = 0
        this.Gasolina = 0
        this.Casetas = 0
        this.AyudaDeTransporte = 0
        this.VuelosDeAvion = 0
        this.ProvisionImpuestosExpatsr = 0
        this.FringeExpats = 0
        this.ProgramaDeEntretenimiento = 0
        this.EventosEspeciales = 0
        this.CostoIt = 0
        this.CostoTelefonia = 0
        this.SvDirectivos = 0
        this.FacturacionBpm = 0
        
       
        //console.log("Entra Aquio --------------> " +this.Costomenualproy);
      }else{
        //console.log("Entra Aquio --------------> " +record.beneficios[0].costo);
        this.arraybeneficio = record.beneficios
      

      const dato = this.arraybeneficio;
         dato?.forEach(paso=>{
             //console.log("paso.beneficio --------------> " +paso.beneficio);
             //console.log("paso.cost-------------->> " +paso.costo);

             this.Costomenualproy += +paso.costo

             if(paso.beneficio === "Automóvil"){
              this.Automovil = paso.costo;
            }
            
              if(paso.beneficio === "Vivienda"){

                this.vivienda = paso.costo;
            }

            if(paso.beneficio === "Viáticos a comprobar"){

              this.ViaticosaComprobar = paso.costo;
            
            }

            if(paso.beneficio === "Bono Adicional"){

              this.BonoAdicionalReubicacion = paso.costo;            
            }

            if(paso.beneficio === "Gasolina"){

              this.Gasolina = paso.costo;
            }

            if(paso.beneficio === "Casetas"){

              this.Casetas = paso.costo;
            
            }

            if(paso.beneficio === "Ayuda de transporte"){

              this.AyudaDeTransporte = paso.costo;
            }

            if(paso.beneficio === "Vuelos de avión"){

              this.VuelosDeAvion = paso.costo;
            }

            if(paso.beneficio === "Provisión Impuestos Expats"){

              this.ProvisionImpuestosExpatsr = paso.costo;
            }

            if(paso.beneficio === "Programa de entrenamiento"){

              this.ProgramaDeEntretenimiento = paso.costo;
            }

            if(paso.beneficio === "Eventos especiales"){

              this.EventosEspeciales = paso.costo;
            }

            if(paso.beneficio === "Costo IT"){

              this.CostoIt = paso.costo;
            }

            if(paso.beneficio === "Costo telefonia"){

              this.CostoTelefonia = paso.costo;
            }

            if(paso.beneficio === "S.V. Directivos"){

              this.SvDirectivos = paso.costo;
            }

            if(paso.beneficio === "Facturación BPM"){

              this.FacturacionBpm = paso.costo;
            }

            if(paso.beneficio === "Fringe Expats"){

              this.FringeExpats = paso.costo;
            
            }

            
         })



        // console.log("suma fuerapaso.cost-------------->> " +this.Costomenualproy);

        this.arraybeneficiosProyectos = record.beneficiosproyecto
      

      const datoProyecto = this.arraybeneficiosProyectos;
      datoProyecto?.forEach(pasoProyec=>{
             //console.log("paso.beneficio --------------> " +paso.beneficio);
             //console.log("paso.cost-------------->> " +paso.costo);

             

             if(pasoProyec.beneficio === "Automóvil"){
              this.Proy_Automovil = pasoProyec.nucostobeneficio;
            }
            
              if(pasoProyec.beneficio === "Vivienda"){

                this.Proy_vivienda = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Viáticos a comprobar"){

              this.Proy_ViaticosaComprobar = pasoProyec.nucostobeneficio;
            
            }

            if(pasoProyec.beneficio === "Bono Adicional"){

              this.Proy_BonoAdicionalReubicacion = pasoProyec.nucostobeneficio;            
            }

            if(pasoProyec.beneficio === "Gasolina"){

              this.Proy_Gasolina = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Casetas"){

              this.Proy_Casetas = pasoProyec.nucostobeneficio;
            
            }

            if(pasoProyec.beneficio === "Ayuda de transporte"){

              this.Proy_AyudaDeTransporte = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Vuelos de avión"){

              this.Proy_VuelosDeAvion = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Provisión Impuestos Expats"){

              this.Proy_ProvisionImpuestosExpatsr = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Programa de entrenamiento"){

              this.Proy_ProgramaDeEntretenimiento = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Eventos especiales"){

              this.Proy_EventosEspeciales = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Costo IT"){

              this.Proy_CostoIt = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Costo telefonia"){

              this.Proy_CostoTelefonia = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "S.V. Directivos"){

              this.Proy_SvDirectivos = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Facturación BPM"){

              this.Proy_FacturacionBpm = pasoProyec.nucostobeneficio;
            }

            if(pasoProyec.beneficio === "Fringe Expats"){

              this.Proy_FringeExpats = pasoProyec.nucostobeneficio;
            
            }

            
         })

      }
      

      worksheet.getCell(row, 1).value = record.numEmpleadoRrHh
      worksheet.getCell(row, 2).value = record.numEmpleadoNoi
      worksheet.getCell(row, 3).value = record.nombreCompletoEmpleado
      worksheet.getCell(row, 4).value = record.ciudad
      worksheet.getCell(row, 5).value = record.puesto
     
        worksheet.getCell(row, 6).value = record.proyecto
     

      worksheet.getCell(row, 7).value = this.formatCurrency(record.sueldoBrutoInflacion)
      //worksheet.getCell(row, 8).value = this.formatCurrency(record.cargasSociales)
     // worksheet.getCell(row, 9).value = this.formatCurrency(record.costoMensualEmpleado)
      worksheet.getCell(row, 8).value = record.unidadNegocio
      worksheet.getCell(row, 9).value = record.empresa
      worksheet.getCell(row, 10).value = record.nombreJefe
      let newDate = new Date(record.fechaIngreso);
      this.FechaIngre = this.pipe.transform(newDate, 'dd-MM-yyyy');
      worksheet.getCell(row, 11).value = this.FechaIngre
      worksheet.getCell(row, 12).value = record.antiguedad
      worksheet.getCell(row, 13).value = this.formatCurrency(record.avgDescuentoEmpleado)
      worksheet.getCell(row, 14).value = this.formatCurrency(record.montoDescuentoMensual)
      console.log('valor de sueldo ------>>>>    ' + record.sueldoNetoPercibidoMensual)
      worksheet.getCell(row, 15).value = record.sueldoNetoPercibidoMensual == null ? 0 : this.formatCurrency(record.sueldoNetoPercibidoMensual)
      worksheet.getCell(row, 16).value = this.formatCurrency(record.retencionImss)
      let numero_ispt = Number(record.ispt)
      worksheet.getCell(row, 17).value = this.formatCurrency(numero_ispt)
      //worksheet.getCell(row, 19).value = record.ispt
      //worksheet.getCell(row, 20).value = this.formatCurrency(record.sueldoBrutoInflacion)
      worksheet.getCell(row, 18).value =this.formatCurrency( record.anual)
      worksheet.getCell(row, 19).value = this.formatCurrency(record.aguinaldoCantidadMeses)
      worksheet.getCell(row, 20).value = this.formatCurrency(record.aguinaldoMontoProvisionMensual)
      worksheet.getCell(row, 21).value = record.pvDiasVacasAnuales
      worksheet.getCell(row, 22).value = this.formatCurrency(record.pvProvisionMensual)
      worksheet.getCell(row, 23).value = this.formatCurrency(record.indemProvisionMensual)
      worksheet.getCell(row, 24).value = this.formatCurrency(record.avgBonoAnualEstimado)
      worksheet.getCell(row, 25).value = this.formatCurrency(record.bonoAnualProvisionMensual)
      worksheet.getCell(row, 26).value = record.sgmmCostoTotalAnual
      worksheet.getCell(row, 27).value = this.formatCurrency(record.sgmmCostoMensual)
      worksheet.getCell(row, 28).value = this.formatCurrency(record.svCostoTotalAnual)
      worksheet.getCell(row, 29).value = this.formatCurrency(record.svCostoMensual)
      worksheet.getCell(row, 30).value = this.formatCurrency(record.vaidCostoMensual)
      worksheet.getCell(row, 31).value = this.formatCurrency(record.vaidComisionCostoMensual)
      worksheet.getCell(row, 32).value = this.formatCurrency(record.ptuProvision)
      worksheet.getCell(row, 33).value = this.formatCurrency(record.impuesto3sNomina)
      worksheet.getCell(row, 34).value = this.formatCurrency(record.imss)
      worksheet.getCell(row, 35).value = this.formatCurrency(record.retiro2)
      worksheet.getCell(row, 36).value = this.formatCurrency(record.cesantesVejez)
      worksheet.getCell(row, 37).value = this.formatCurrency(record.infonavit)
      worksheet.getCell(row, 38).value = this.formatCurrency(record.cargasSociales)
      worksheet.getCell(row, 39).value = this.formatCurrency(record.costoMensualEmpleado+this.Costomenualproy)
      worksheet.getCell(row, 40).value = this.formatCurrency(record.costoMensualProyecto)
      worksheet.getCell(row, 41).value = this.formatCurrency(record.costoAnualEmpleado)
      worksheet.getCell(row, 42).value = this.formatCurrency(record.costoSalarioBruto)
      worksheet.getCell(row, 43).value = this.formatCurrency(record.costoSalarioNeto)
      worksheet.getCell(row, 44).value = record.nuAnno
      worksheet.getCell(row, 45).value = record.nuMes
      let numero_salarioDiarioIntegrado = Number(record.salarioDiarioIntegrado)
      worksheet.getCell(row, 46).value = this.formatCurrency(numero_salarioDiarioIntegrado)
      //worksheet.getCell(row, 49).value = record.salarioDiarioIntegrado

      //BENEFICIOS POR EMPLEADO

      worksheet.getCell(row, 47).value = this.formatCurrency(this.vivienda)
      worksheet.getCell(row, 48).value = this.formatCurrency(this.Automovil)
      worksheet.getCell(row, 49).value = this.formatCurrency(this.ViaticosaComprobar)
      worksheet.getCell(row, 50).value = this.formatCurrency(this.BonoAdicionalReubicacion)
      worksheet.getCell(row, 51).value = this.formatCurrency(this.Gasolina)
      worksheet.getCell(row, 52).value = this.formatCurrency(this.Casetas)
      worksheet.getCell(row, 53).value = this.formatCurrency(this.AyudaDeTransporte)
      worksheet.getCell(row, 54).value = this.formatCurrency(this.VuelosDeAvion)
      worksheet.getCell(row, 55).value = this.formatCurrency(this.ProvisionImpuestosExpatsr)
      worksheet.getCell(row, 56).value = this.formatCurrency(this.FringeExpats)
      worksheet.getCell(row, 57).value = this.formatCurrency(this.ProgramaDeEntretenimiento)
      worksheet.getCell(row, 58).value = this.formatCurrency(this.EventosEspeciales)
      worksheet.getCell(row, 59).value = this.formatCurrency(this.CostoIt)
      worksheet.getCell(row, 60).value = this.formatCurrency(this.CostoTelefonia)
      worksheet.getCell(row, 61).value = this.formatCurrency(this.SvDirectivos)
      worksheet.getCell(row, 62).value = this.formatCurrency(this.FacturacionBpm)

      //BENEFICIOS POR PROYECTO

      worksheet.getCell(row, 63).value = this.formatCurrency(this.Proy_vivienda)
      worksheet.getCell(row, 64).value = this.formatCurrency(this.Proy_Automovil)
      worksheet.getCell(row, 65).value = this.formatCurrency(this.Proy_ViaticosaComprobar)
      worksheet.getCell(row, 66).value = this.formatCurrency(this.Proy_BonoAdicionalReubicacion)
      worksheet.getCell(row, 67).value = this.formatCurrency(this.Proy_Gasolina)
      worksheet.getCell(row, 68).value = this.formatCurrency(this.Proy_Casetas)
      worksheet.getCell(row, 69).value = this.formatCurrency(this.Proy_AyudaDeTransporte)
      worksheet.getCell(row, 70).value = this.formatCurrency(this.Proy_VuelosDeAvion)
      worksheet.getCell(row, 71).value = this.formatCurrency(this.Proy_ProvisionImpuestosExpatsr)
      worksheet.getCell(row, 72).value = this.formatCurrency(this.Proy_FringeExpats)
      worksheet.getCell(row, 73).value = this.formatCurrency(this.Proy_ProgramaDeEntretenimiento)
      worksheet.getCell(row, 74).value = this.formatCurrency(this.Proy_EventosEspeciales)
      worksheet.getCell(row, 75).value = this.formatCurrency(this.Proy_CostoIt)
      worksheet.getCell(row, 76).value = this.formatCurrency(this.Proy_CostoTelefonia)
      worksheet.getCell(row, 77).value = this.formatCurrency(this.Proy_SvDirectivos)
      worksheet.getCell(row, 78).value = this.formatCurrency(this.Proy_FacturacionBpm)
      worksheet.getCell(row, 79).value = this.formatCurrency(record.costoMensualEmpleado + this.Costomenualproy + record.costoMensualProyecto)

      
      //worksheet.getCell(row).fill = {  type: 'pattern', pattern: 'solid', fgColor: { argb: record.fechaCancelacion ?  'FFC000':  '70AD47'}};
      //worksheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: record.fechaCancelacion ? 'ea899a' : 'ffffff' } };
      row++
    });

    return row

  }

  formatCurrency(valor: number) {
    return valor.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    })
  }

  buscarempleados(event: any) {
    this.sharedService.cambiarEstado(false)
    const id = event

    

    if(id === null){
      return ;
      
    }else{
      console.log ('id ------------------<<<<<<<<<<<<<<<<<<<<<'+id)

    var arr = event.value.split('-'); //Note the space as well
    console.log(arr); //Yields ["Apples", "Bananas", "Cherries"]
      return arr;
     
    }

    
  }

  buscarProyectos(event: any) {
    this.sharedService.cambiarEstado(false)
    const id = event

    

    if(id === null){
      return ;
      
    }else{
      console.log ('id ------------------<<<<<<<<<<<<<<<<<<<<<'+id)

    var arr = event.value.split('-'); //Note the space as well
    console.log(arr); //Yields ["Apples", "Bananas", "Cherries"]
      return arr;
     
    }

    
  }

  buscarEmpresa(event: any) {
    this.sharedService.cambiarEstado(false)
    const id = event

    

    if(id === null){
      return ;
      
    }else{
      console.log ('id ------------------<<<<<<<<<<<<<<<<<<<<<'+id)

    var arr = event.value.split('-'); //Note the space as well
    console.log(arr); //Yields ["Apples", "Bananas", "Cherries"]
      return arr;
     
    }

    
  }

  onChangeCombo(event: any, opcion: number) {
    console.log('event :' + event);
    console.log(event.value);
    if (event.value != null) {
      this.isClear = true;
      this.disableFiltros(opcion, event.value['value']);
       this.opcionFiltro = opcion;
      //this.fechaFin = new Date();
      this.filtroValue = event.value['value'];
      console.log(this.filtroValue);
    } else {
      this.isClear = false;
    }
  }

  disableFiltros(opcion: number, value: number) {
    switch (opcion) {
      case 1:
        this.IDEmpleado = value + '';
        // this.isDisableEmpresa = true;
        // this.isDisableCliente = true;
        break;
      case 2:
        this.IDPuesto = value;
        // this.isDisableProyecto = true;
        // this.isDisableCliente = true;
        break;
      case 3:
        this.IDProyecto = value;
        // this.isDisableProyecto = true;
        // this.isDisableEmpresa = true;
        break;
      case 4:
        this.IDEmpresa= value;
          // this.isDisableProyecto = true;
          // this.isDisableEmpresa = true;
        break;
      case 5:
        this.IDUnidadNegocio= value;
            // this.isDisableProyecto = true;
            // this.isDisableEmpresa = true;
        break;
    }
  }

  clearFiltros() {
    this.dropDownProyecto.clear(null);
    this.dropDownEmpresa.clear(null);
    this.dropDownPuesto.clear(null);
    this.dropDownEmpleado.clear(null);
    this.dropDownUnidadNegocio.clear(null);

    /*#elsetotalthis.isDisableProyecto = false;
    this.isDisableEmpresa = false;
    this.isDisableCliente = false;

    

    this.noFactura = null

    this.IDProyecto = null
    this.IDEmpresa = null
    this.IDCliente = null

    this.opcionFiltro = 0;*/

    this.fechaInicio = null;
    this.fechaFin = null;

    this.IDEmpleado= '0';
    this.IDPuesto = 0;
    this.IDProyecto = 0;
    this.IDEmpresa = 0;
    this.IDUnidadNegocio = 0;

    const today = new Date();
      const datePipe = new DatePipe('en-IN');
      //return datePipe.transform(today, 'dd/MM/yyyy');
      this.fetchFin= datePipe.transform(today, 'yyyy-MM-dd')

     this.fetchIni= '1900-01-01'


    this.costosService.getCostosEmpleado(true,this.IDEmpleado,this.IDPuesto,this.IDProyecto,this.IDEmpresa,this.IDUnidadNegocio,this.fetchIni,this.fetchFin)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.costos = data
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
      
  }

  busqueda() {
    if (this.fechaFin != null) {
      let utcFin = this.fechaFin.toJSON().slice(0, 10).replace(/-/g, '-');
      this.fetchFin= utcFin
      //objBusqueda.fechaFin = utcFin;
    } else {
      
      //objBusqueda.fechaFin = utc;
      const today = new Date();
      const datePipe = new DatePipe('en-IN');
      //return datePipe.transform(today, 'dd/MM/yyyy');
      this.fetchFin= datePipe.transform(today, 'yyyy-MM-dd')
    }

    if (this.fechaInicio != null) {
      let utcInicio = this.fechaInicio
        .toJSON()
        .slice(0, 10)
        .replace(/-/g, '-');
      //objBusqueda.fechaIni = utcInicio;
      this.fetchIni= utcInicio
    }else{
      this.fetchIni= '1900-01-01'
    }

    console.log('FECHA INICIAL --- >> ' + this.fetchIni)
    console.log('FECHA FINAL --- >> ' + this.fetchFin)

    this.costosService.getCostosEmpleado(false,this.IDEmpleado,this.IDPuesto,this.IDProyecto,this.IDEmpresa,this.IDUnidadNegocio,this.fetchIni,this.fetchFin)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.costos = data
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  
  

}
