import { Component, OnInit,ViewChild } from '@angular/core';
import { EmpleadosService } from '../../services/empleados.service';
import { CatEmpleado, UpEmpleado,Empresas, Proyectos,Busqueda } from '../../Models/empleados';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize, forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SUBJECTS, TITLES } from 'src/utils/constants';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Item,Opcion } from 'src/models/general.model';
import { Table } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { MostrarProyectosComponent } from '../mostrar-proyectos/mostrar-proyectos.component';
import { Dropdown } from 'primeng/dropdown';

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

  

 
  
  

}
