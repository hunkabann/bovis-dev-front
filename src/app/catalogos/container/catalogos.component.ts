import { Component, OnInit } from '@angular/core';
import { CatalogoOpcion } from '../Models/catalogos';

@Component({
  selector: 'app-catalogos',
  templateUrl: './catalogos.component.html',
  styleUrls: ['./catalogs.component.scss']
})
export class CatalogosComponent implements OnInit {

  catalogos: CatalogoOpcion[] = [
   /*  {
      catalogo: 'cat_viaticos',
      id: null,
      nombre: 'Viaticos',
      nameService: ''
    }, */
    {
      catalogo: 'cat_beneficios',
      id: null,
      nombre: 'Beneficios',
      nameService: 'beneficio'
    },
    {
      catalogo: 'cat_categoria',
      id: null,
      nombre: 'Categoria',
      nameService: 'categoria'
    },
    {
      catalogo: 'cat_clasificacion',
      id: null,
      nombre: 'Clasificación',
      nameService: 'Clasificacion'
    },
    {
      catalogo: 'cat_clientes',
      id: null,
      nombre: 'Clientes',
      nameService: 'clientes'
    },
    {
      catalogo: 'cat_costos_indirectos_salarios',
      id: null,
      nombre: 'Costos Indirectos Salarios',
      nameService: 'CostoIndirectoSalarios'
    },
    {
      catalogo: 'cat_departamento',
      id: null,
      nombre: 'Departamento',
      nameService: 'Departamento'
    },
    {
      catalogo: 'cat_documento',
      id: null,
      nombre: 'Documento',
      nameService: ''
    },
    {
      catalogo: 'cat_estatus_proyecto',
      id: null,
      nombre: 'Estatus Proyecto',
      nameService: 'Estatus'
    },
    {
      catalogo: 'cat_experiencia',
      id: null,
      nombre: 'Experiencia',
      nameService: 'Experiencia'
    },
    {
      catalogo: 'cat_habilidad',
      id: null,
      nombre: 'Habilidad',
      nameService: 'Habilidad'
    },
    {
      catalogo: 'cat_ingreso',
      id: null,
      nombre: 'Ingreso',
      nameService: 'Ingreso'
    },
    {
      catalogo: 'cat_nivel_puesto',
      id: null,
      nombre: 'Nivel de Puestos',
      nameService: 'NivelPuesto'
    },
    {
      catalogo: 'cat_prestacion',
      id: null,
      nombre: 'Prestación',
      nameService: 'Prestacion'
    },
    {
      catalogo: 'cat_puesto',
      id: null,
      nombre: 'Puesto',
      nameService: ''
    },
    {
      catalogo: 'cat_profesion',
      id: null,
      nombre: 'Profesion',
      nameService: 'Profesion'
    },
    {
      catalogo: 'cat_rubro_ingreso',
      id: null,
      nombre: 'Rubro ingreso rembomsable, no rembomsable',
      nameService: 'RubroIngresoReembolsable'
    },
    {
      catalogo: 'cat_sector',
      id: null,
      nombre: 'Sector',
      nameService: 'Sector'
    },
    {
      catalogo: 'cat_cie',
      id: null,
      nombre: 'Tipo Cie',
      nameService: 'TipoCie'
    },
    {
       catalogo: 'cat_cta_contable',
      id: null,
      nombre: 'Tipo Cta Contable',
      nameService: 'TipoCtacontable'
    },
    {
      catalogo: 'cat_tipo_cuenta',
      id: null,
      nombre: 'Tipo cuenta',
      nameService: 'TipoCuenta'
    },
    {
      catalogo: 'cat_tipo_documento',
      id: null,
      nombre: 'Tipo Documento',
      nameService: 'TipoDocumento'
    },
    {
      catalogo: 'cat_dias',
      id: null,
      nombre: 'Días Timesheet',
      nameService: 'DiasTimesheet'
    }


  ];

  constructor() { }

  ngOnInit(): void {
  }

  asignarUrlService(nameServise: string){
    localStorage.setItem('nombreService', nameServise)
  }

}
