export interface ICatalogo{
  id: string;
  descripcion: string;
  activo: boolean;
}

export interface ICatalogoCombos {
  name: string;
  value: string;
}

export interface ICatalogoCliente{
  idCliente: string;
  rfc: string;
  cliente: boolean;
}

export interface IEmpleado{
  numEmpleadoRrHh: string;
  idPersona: number;
  cvePuesto: string;
  idEmpresa: number;
  activo: boolean;
  nombre: string;
  apPaterno: string;
  apMaterno: string;
  idNivel: number;
  puesto: string;
  empresa: string;
}


export interface IEmpleadoNew{
  nukid_empleado: number;
  idPersona: number;
  cvePuesto: string;
  idEmpresa: number;
  activo: boolean;
  chnombre: string;
  chap_paterno: string;
  chap_materno: string;
  idNivel: number;
  chpuesto: string;
  empresa: string;
}

export interface CostosEmpleadoResponse {
  data:          CostoEmpleado[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface CostoEmpleado {
  idCosto:                        number;
  numEmpleadoRrHh:                string;
  nuAnno:                         number;
  nuMes:                          number;
  numEmpleadoNoi:                 number;
  idpersona:                      number;
  nombrePersona:                  number;
  reubicacion:                    string;
  idpuesto:                       number;
  puesto:                         string;
  numProyecto:                    number;
  proyecto:                       string;
  idUnidadNegocio:                number;
  unidadNegocio:                  string;
  idEmpresa:                      number;
  Empresa:                        string;
  timesheet:                      string;
  idEmpleadoJefe:                 string;
  nombreJefe:                     string;
  fechaIngreso:                   string;
  antiguedad:                     number;
  avgDescuentoEmpleado:           number;
  montoDescuentoMensual:          number;
  sueldoNetoPercibidoMensual:     number;
  retencionImss:                  number;
  ispt:                           number;
  sueldoBrutoInflacion:           number;
  anual:                          number;
  aguinaldoCantMeses:             number;
  aguinaldoMontoProvisionMensual: number;
  pvDiasVacasAnuales:             number;
  pvProvisionMensual:             number;
  indemProvisionMensual:          number;
  avgBonoAnualEstimado:           number;
  bonoAnualProvisionMensual:      number;
  sgmmCostoTotalAnual:            number;
  sgmmCostoMensual:               number;
  svCostoTotalAnual:              number;
  svCostoMensual:                 number;
  vaidCostoMensual:               number;
  vaidComisionCostoMensual:       number;
  ptuProvision:                   number;
  impuesto3sNomina:               number;
  imss:                           number;
  retiro2:                        number;
  cesantesVejez:                  number;
  infonavit:                      number;
  cargasSociales:                 number;
  costoMensualEmpleado:           number;
  costoMensualProyecto:           number;
  costoAnualEmpleado:             number;
  indiceCostoLaboral:             number;
  indiceCargaLaboral:             number;
  fechaActualizacion:             string;
  regHistorico:                   boolean;
  ciudad:                         string;
  costoSalarioBruto:              number;
  costoSalarioNeto:               number;
  empresa:                        string;
  aguinaldoCantidadMeses:         number;
  nombreCompletoEmpleado:         string;
  salarioDiarioIntegrado:         number;
  
}