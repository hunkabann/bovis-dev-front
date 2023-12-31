// Generated by https://quicktype.io

export interface CieEmpresasResponse {
  data:          CieEmpresa[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface CieEmpresa {
  nukidempresa: number;
  chempresa:    string;
  rfc:          string;
  nucoi:        number;
  nunoi:        number;
  nusae:        number;
  boactivo:     boolean;
}

export interface CieElementPost {
  nombre_cuenta:      string;
  cuenta:             string;
  tipo_poliza:        string;
  numero:             number;
  fecha:              string;
  mes:                string;
  concepto:           string;
  centro_costos:      string;
  proyectos:          string;
  saldo_inicial:      number;
  debe:               number;
  haber:              number;
  movimiento:         number;
  empresa:            string;
  num_proyecto:       number;
  tipo_num_proyecto:  string;
  edo_resultados:     string;
  responsable:        string;
  tipo_responsable:   string;
  tipo_py:            string;
  clasificacion_py:   string;
}

export interface CieProyectosResponse {
  data:          CieProyecto[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface CieProyecto {
  proyecto:     string;
  numProyecto:  number;
  responsable:  string;
  tipoProyecto: string;
}

export interface CieCuentasResponse {
  data:          CieCuenta[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface CieCuenta {
  cuenta:          string;
  tipoCuenta:      string;
  tipoResultado:   string;
  tipoPY:          string;
  clasificacionPY: string;
}

export interface CieRegistrosPaginadosResponse {
  data:           CieRegistrosPaginadosData;
  success:        boolean;
  message:        null;
  transactionId:  null;
}

export interface CieRegistrosPaginadosData {
  registros:       CieRegistro[];
  totalRegistros:  number;
}

export interface CieRegistro {
  idCie:           number;
  nombreCuenta:    string;
  cuenta:          string;
  tipoPoliza:      string;
  numero:          number;
  fecha:           string;
  mes:             number;
  concepto:        string;
  centroCostos:    string;
  proyecto:       string;
  saldoInicial:    number;
  debe:            number;
  haber:           number;
  movimiento:      number;
  empresa:         string;
  numProyecto:     number;
  tipoCuenta:      string;
  edoResultados:   string;
  responsable:     string;
  tipoProyecto:    null | string;
  tipoPy:          string;
  clasificacionPy: string;
  activo:          boolean;
  idArchivo:       null;
  nombreArchivo:   null;
}

export interface CieCuentasListaResponse {
  data:          string[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface CieConceptosResponse {
  data:          string[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface CieEmpresasResponse {
  data:          CieEmpresaOpcion[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface CieNumsProyectoResponse {
  data:          number[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface CieResponsablesResponse {
  data:          string[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface CieClasificacionesPYResponse {
  data:          Array<null | string>;
  success:       boolean;
  message:       null;
  transactionId: null;
}


export interface CieEmpresaOpcion {
  nukidempresa: number;
  chempresa:    string;
  rfc:          string;
  nucoi:        number;
  nunoi:        number;
  nusae:        number;
  boactivo:     boolean;
}

export interface CieRegistroUResponse {
  data:          CieRegistroU;
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface CieRegistroU {
  idCie:           number;
  nombreCuenta:    string;
  cuenta:          string;
  tipoPoliza:      string;
  numero:          string;
  fecha:           string;
  mes:             number;
  concepto:        string;
  centroCostos:    string;
  proyectos:       string;
  proyecto?:       string;
  saldoInicial:    number;
  debe:            number;
  haber:           number;
  movimiento:      number;
  empresa:         string;
  numProyecto:     number;
  tipoCuenta:      string;
  edoResultados:   string;
  responsable:     string;
  tipoProyecto:    null;
  tipoPy:          string;
  clasificacionPy: string;
  activo:          boolean;
  idArchivo:       null;
  nombreArchivo:   null;
}

export interface CargaCuentasResponse {
  data:          CargaCuenta[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface CargaCuenta {
  ctaContable:                 string;
  nombreCtaContable:           string;
  concepto:                    string;
  tipoCtaContableMayor:        string;
  tipoCtaContablePrimerNivel:  string;
  tipoCtaContableSegundoNivel: string;
  idTipoCuenta:                number;
  tipoCuenta:                  string;
  idTipoResultado:             number;
  tipoResultado:               string;
  idPcs:                       null;
  pcs:                         string;
  idPcs2:                      null;
  pcs2:                        string;
}
