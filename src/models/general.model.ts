
export interface Opcion {
  name: string,
  code: string
}

export interface Item {
  value: string | number | boolean,
  label: string
}

export interface DropdownOpcion {
  name: string,
  value: string
}

export interface Mes {
  mes:  number
  anio: number
  desc: string
}

export interface ListaStringResponse {
  data:          string[];
  success:       boolean;
  message:       null;
  transactionId: null;
}
