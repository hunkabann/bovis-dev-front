import { Component, OnInit,ViewChild } from '@angular/core';
import { EmpleadosService } from '../../services/empleados.service';
import { CatEmpleado, UpEmpleado,Empresas, Proyectos,Busqueda,encabezados } from '../../Models/empleados';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize, forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SUBJECTS, TITLES,EXCEL_EXTENSION } from 'src/utils/constants';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Item,Opcion } from 'src/models/general.model';
import { Table } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { MostrarProyectosComponent } from '../mostrar-proyectos/mostrar-proyectos.component';
import { Dropdown } from 'primeng/dropdown';
import * as XLSX from 'xlsx';
import { formatCurrency } from 'src/helpers/helpers';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';

interface FiltroCancelacion {
  name: string;
  value: string;
}

@Component({
  selector: 'app-empleados-principal',
  templateUrl: './empleados-principal.component.html',
  styleUrls: ['./empleados-principal.component.css'],
  providers: [MessageService, DialogService]
})
export class EmpleadosPrincipalComponent implements OnInit {

  empleados:  UpEmpleado[] = []
  puestos:    Item[] = []
  estados:    Item[] = [
    {label: 'Activo', value: true},
    {label: 'Inactivo', value: false}
  ]

  today: Date = new Date();
  pipe = new DatePipe('en-US');
  todayWithPipe = null;

  //allData: CieRegistro[] = []

  filtroProyectos: FiltroCancelacion[] = [];
  filtroEmpresas: FiltroCancelacion[] = [];

  private empleadosService: EmpleadosService

  listProyectos: Proyectos[] = [];
  listEmpresas: Empresas[] = [];
  opcionFiltro: number = 0;

  //proyectos: Opcion[] = []
  //empresas: Opcion[] = []
  proyectos:    Item[] = []
  empresas:    Item[] = []

  isDisableProyecto: boolean = false;
  isDisableEmpresa: boolean = false;
  isDisableCliente: boolean = false;
  isClear: boolean = false;

  @ViewChild('dropDownProyecto') dropDownProyecto: Dropdown;
  @ViewChild('dropDownEmpresa') dropDownEmpresa: Dropdown;


  IDProyecto: number;
  IDEmpresa: number;
  IDCliente: number;
  filtroValue: number;

  constructor( 
    private empleadosServ: EmpleadosService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.verificarEstado()
    

    this.sharedService.cambiarEstado(true)

    forkJoin([
      this.empleadosServ.getEmpleados(),
      this.empleadosServ.getPuestos(),
      this.empleadosServ.getProyectos(),
      this.empleadosServ.getEmpresas()
    ])
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (value) => {
          
          const [empleadosR, puestosR,proyectosR,EmplresaR] = value
          //const [empleadosR, puestosR] = value
          this.empleados = empleadosR.data
          this.puestos = puestosR.data.map(puesto => ({value: puesto.chpuesto, label: puesto.chpuesto}))
          //this.proyectos = proyectosR.data.map(proyecto => ({ code: proyecto.numProyecto.toString(), name: `${proyecto.numProyecto} - ${proyecto.nombre}` }))
          //this.empresas = EmplresaR.data.map(empresa => ({ code: empresa.idEmpresa.toString(), name: `${empresa.empresa}` }))
          this.proyectos = proyectosR.data.map(proyecto => ({value: proyecto.nombre, label: proyecto.nombre }))
          this.empresas = EmplresaR.data.map(empresa => ({value: empresa.empresa, label: empresa.empresa}))
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })

     
  }

  verificarEstado() {

    this.activatedRoute.queryParams.subscribe(params => {
      // Access query parameters
      const success = params['success']

      if(success) {
        Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Registro guardado', detail: 'El registro ha sido guardado.' }))
      }

      const urlWithoutQueryParams = this.location.path().split('?')[0];
      this.location.replaceState(urlWithoutQueryParams);
    });
  }
  
  toggleActivo(id: number, activo: boolean) {
    console.log(activo)
    const index = this.empleados.findIndex(({nunum_empleado_rr_hh}) => nunum_empleado_rr_hh === id)
    if(index >= 0) {
      this.sharedService.cambiarEstado(true)
      this.empleadosServ.toggleEstado(!activo, id, false)
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (data) => {
            this.empleados.at(index).boactivo = !activo
            this.messageService.add({ severity: 'success', summary: 'Registro actualizado', detail: `El registro ha sido ${activo ? 'deshabilitado' : 'habilitado'}.` })
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: SUBJECTS.error })
        })
    }
  }

  mostrarProyectos(id: number) {
    this.dialogService.open(MostrarProyectosComponent, {
      header: 'Proyectos del empleado',
      width: '50%',
      contentStyle: {overflow: 'auto'},
      data: {
        id
      }
    })
  }

  getPoblarProyectos() {
    this.empleadosService.getProyectos().subscribe({
      next: (data) => {
        if (data.success) {
          this.listProyectos = data.data;

          this.listProyectos.forEach((element) => {
            this.filtroProyectos.push({
              name: `${String(element.numProyecto)} - ${String(element.nombre)}`,
              value: String(element.numProyecto),
            });
          });
        } else {
          this.messageError(data.message, 'Información de Proyectos');
        }
      },
      error: (e) => {
        this.messageError(e.message, 'Información de Proyectos');
      }
    });
  }

  getPoblarEmpresas() {
    this.empleadosService.getEmpresas().subscribe({
      next: (data) => {
        if (data.success) {
          this.listEmpresas = data.data;
          this.listEmpresas.forEach((element) => {
            this.filtroEmpresas.push({
              name: `${String(element.rfc)} / ${String(element.empresa)}`,
              value: String(element.idEmpresa),
            });
          });
        }
        else {
          this.messageError(data.message, 'Información de Empresas');
        }
      },
      error: (e) => {
        this.messageError(e.message, 'Información de Empresas');
      }
    });
  }

  messageError(message: string, tipo: string) {
    this.messageService.add({
      severity: "error",
      summary: tipo,
      detail: String(message)
    });

  }

  onChangeCombo(event: any, opcion: number) {
    console.log('event :' + event);
    console.log(event.value);
    if (event.value != null) {
      this.isClear = true;
      this.disableFiltros(opcion, event.value['value']);
      //this. = opcion;
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
        this.IDProyecto = value;
        // this.isDisableEmpresa = true;
        // this.isDisableCliente = true;
        break;
      case 2:
        this.IDEmpresa = value;
        // this.isDisableProyecto = true;
        // this.isDisableCliente = true;
        break;
      case 3:
        this.IDCliente = value;
        // this.isDisableProyecto = true;
        // this.isDisableEmpresa = true;
        break;
    }
  }

  clearFiltros() {
    this.dropDownProyecto.clear(null);
    this.dropDownEmpresa.clear(null);

    this.isDisableProyecto = false;
    this.isDisableEmpresa = false;
    this.isDisableCliente = false;

    //this.fechaInicio = null;
    //this.fechaFin = null;

    

    this.IDProyecto = null
    this.IDEmpresa = null
    
    this.opcionFiltro = 0;
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

      saveAs(blob, `Empleados_` + this.todayWithPipe + `${EXCEL_EXTENSION}`)
    });
  }

  _setXLSXTitles(worksheet: ExcelJS.Worksheet) {
  }

  _setXLSXHeader(worksheet: ExcelJS.Worksheet) {
    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } }
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

    this.empleados.forEach(record => {
      //worksheet.getCell(row).fill = record.fechaCancelacion ? fillCancelada : fillFactura
      //const col = row.getCell(row);

      worksheet.getCell(row, 1).value = record.nunum_empleado_rr_hh
      worksheet.getCell(row, 2).value = record.nombre_persona
      worksheet.getCell(row, 3).value = record.chtipo_emplado
      worksheet.getCell(row, 4).value = record.chcategoria
      worksheet.getCell(row, 5).value = record.chtipo_contrato
     
        worksheet.getCell(row, 6).value = record.chpuesto
     

      worksheet.getCell(row, 7).value = record.chempresa
      worksheet.getCell(row, 8).value = record.chciudad
      worksheet.getCell(row, 9).value = record.nukidjefe_directo
      worksheet.getCell(row, 10).value = record.chunidad_negocio
      worksheet.getCell(row, 11).value = record.dtfecha_ingreso
      worksheet.getCell(row, 12).value = record.dtfecha_salida
      worksheet.getCell(row, 13).value = record.dtfecha_ultimo_reingreso
      worksheet.getCell(row, 14).value = record.chnss
      worksheet.getCell(row, 15).value = record.chemail_bovis
      worksheet.getCell(row, 16).value = record.nuantiguedad
      worksheet.getCell(row, 17).value = record.nufondo_fijo
      //worksheet.getCell(row, 18).value = record.responsable
      //worksheet.getCell(row, 19).value = record.tipoProyecto
      //worksheet.getCell(row, 20).value = record.tipoPy
      //worksheet.getCell(row, 21).value = record.clasificacionPy
      //worksheet.getCell(row).fill = {  type: 'pattern', pattern: 'solid', fgColor: { argb: record.fechaCancelacion ?  'FFC000':  '70AD47'}};
      //worksheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: record.fechaCancelacion ? 'ea899a' : 'ffffff' } };
      row++
    });

    return row

  }
  
  
  

 
  
  

}
