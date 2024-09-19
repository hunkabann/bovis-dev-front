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

export interface UpEmpleadoResponse {
  data:          UpEmpleado[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface UpEmpleado {
  [key: string]:            any;
  nunum_empleado_rr_hh:     number;
  nukidpersona:             number;
  nombre_persona:           string;
  nukidtipo_empleado:       number;
  chtipo_emplado:           string;
  nukidcategoria:           number;
  chcategoria:              string;
  nukidtipo_contrato:       number;
  chtipo_contrato:          string;
  chcve_puesto:             number;
  chpuesto:                 string;
  nukidempresa:             number;
  chempresa:                string;
  chcalle:                  null;
  nunumero_interior:        null;
  nunumero_exterior:        null;
  chcolonia:                null;
  chalcaldia:               null;
  nukidciudad:              number;
  chciudad:                 string;
  nukidestado:              number;
  chestado:                 string;
  chcp:                     null;
  nukidpais:                number;
  chpais:                   string;
  nukidnivel_estudios:      number;
  chnivel_estudios:         string;
  nukidforma_pago:          number;
  chforma_pago:             string;
  nukidjornada:             number;
  chjornada:                string;
  nukiddepartamento:        number;
  chdepartamento:           string;
  nukidclasificacion:       number;
  chclasificacion:          string;
  nukidjefe_directo:        number;
  chjefe_directo:           string;
  nukidunidad_negocio:      number;
  chunidad_negocio:         string;
  nukidtipo_contrato_sat:   number;
  chtipo_contrato_sat:      string;
  nudescuento_pension:      number;
  chporcentaje_pension:     'SI' | 'NO' | 'NA';
  nunum_empleado:           number;
  dtfecha_ingreso:          string;
  dtfecha_salida:           string;
  dtfecha_ultimo_reingreso: string;
  chnss:                    string;
  chemail_bovis:            string;
  chexperiencias:           string;
  chhabilidades:            string;
  churl_repositorio:        string;
  nusalario:                number;
  nukidprofesion:           number;
  chprofesion:              string;
  nuantiguedad:             number;
  nukidturno:               number;
  chturno:                  string;
  nuunidad_medica:          number;
  chregistro_patronal:      string;
  chcotizacion:             string;
  nuduracion:               number;
  boactivo:                 boolean;
  bodescuento_pension:      boolean;
  nuporcentaje_pension:     number;
  nufondo_fijo:             number;
  nucredito_infonavit:      string;
  chtipo_descuento:         string;
  nuvalor_descuento:        number;
  nuno_empleado_noi:        string;
  chrol:                    string;
  nuproyecto_principal:     number;
}