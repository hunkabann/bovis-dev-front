
export class Viaticos {

  id: number;
  descripcion: string;
  activo: string;

}

export class CatalogosGenerales {

  id: number;
  descripcion: string;
  activo: number;

}


export interface Estatus {
  label: string,
  value: boolean
}


export interface CatalogoOpcion {
  catalogo:     string,
  id:           null,
  nombre:       string,
  // orden:        number,
  nameService:  string
}