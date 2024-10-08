// Generated by https://quicktype.io

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
  beneficios:                     Beneficio[];
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
  beneficiosproyecto:             BeneficiosProyectos[];
  
}

export interface Beneficio {
  id:                  number;
  idBeneficio:         number;
  beneficio:           string;
  numEmpleadoRrHh:     string;
  costo:               number;
  mes:                 number;
  anio:                number;
  fechaActualizacion:  string;
  regHistorico:        number;
}

export interface BeneficiosProyectos {
  id:                  number;
  idBeneficio:         number;
  beneficio:           string;
  numEmpleadoRrHh:     string;
  costo:               number;
  mes:                 number;
  anio:                number;
  fechaActualizacion:  string;
  regHistorico:        number;
  nucostobeneficio:    number;
  numProyecto:         string;
}


export const encabezados = Object.freeze([
  // {id: 'id', label: 'Id'},
  {id: 'numEmpleadoRrHh', label: 'Número de empleado RRHH'},
  {id: 'numEmpleadoNoi', label: 'Número de empleado NOI'},
  {id: 'nombreCompletoEmpleado', label: 'Nombre'},
  {id: 'ciudad', label: 'Ciudad base de trabajo'},
  {id: 'puesto', label: 'Puesto'},
  {id: 'numProyecto', label: 'Proyecto'},
  {id: 'sueldoBrutoInflacion', label: 'Sueldo bruto (inflación %)'},
  //{id: 'cargasSociales', label: 'Cargas Sociales'},
  //{id: 'costoMensualEmpleado', label: 'Costo Mensual Empleado'},
  {id: 'unidadNegocio', label: 'Unidad de negocio'},
  {id: 'empresa', label: 'Empresa'},
  {id: 'nombreJefe', label: 'Nombre del Jefe'},
  {id: 'fechaIngreso', label: 'Fecha de ingreso'},
  {id: 'antiguedad', label: 'Antiguedad'},
  {id: 'avgDescuentoEmpleado', label: 'Descuento empleado'},
  {id: 'montoDescuentoMensual', label: 'Descuento Mensual'},
  {id: 'sueldoNetoPercibidoMensual', label: 'Sueldo neto mensual'},
  {id: 'retencionImss', label: 'Retencion IMMS'},
  {id: 'ispt', label: 'ispt'},
  //{id: 'sueldoBrutoInflacion', label: 'sueldo Bruto Inflacion'},
  {id: 'anual', label: 'anual'},
  {id: 'aguinaldoCantidadMeses', label: 'aguinaldo Cantidad Meses'},
  {id: 'aguinaldoMontoProvisionMensual', label: 'aguinaldo Monto Provision Mensual'},
  {id: 'pvDiasVacasAnuales', label: 'Dias Vacas Anuales'},
  {id: 'pvProvisionMensual', label: 'Prima Vacacional (provisión Mensual)'},
  {id: 'indemProvisionMensual', label: 'Provisión Mensual'},
  {id: 'avgBonoAnualEstimado', label: '% Bono Anual estimado'},
  {id: 'bonoAnualProvisionMensual', label: 'Provisión Mensual'},
  {id: 'sgmmCostoTotalAnual', label: 'Costo total Anual'},
  {id: 'sgmmCostoMensual', label: 'Seguro de Gastos Medicos Menores y S.V'},
  {id: 'svCostoTotalAnual', label: 'Costo total Anual'},
  {id: 'svCostoMensual', label: 'Costo Mensual'},
  {id: 'vaidCostoMensual', label: 'Costo Mensual'},
  {id: 'vaidComisionCostoMensual', label: 'Comisión (Costo Mensual)'},
  {id: 'ptuProvision', label: 'Provisión PTU'},
  {id: 'impuesto3sNomina', label: 'IMPUESTO 3% S/Nomina'},
  {id: 'imss', label: 'IMSS'},
  {id: 'retiro2', label: 'RETIRO 2%'},
  {id: 'cesantesVejez', label: 'C Y V'},
  {id: 'infonavit', label: 'INFONAVIT'},
  {id: 'cargasSociales', label: 'CARGAS SOCIALES'},
  {id: 'costoMensualEmpleado', label: 'Costo Mensual Empleado'},
  {id: 'costoMensualProyecto', label: 'Costo Mensual Proyecto'},
  {id: 'costoAnualEmpleado', label: 'Costo Empleado Anual MN '},
  {id: 'costoSalarioBruto', label: '% Costo total / Salario Bruto'},
  {id: 'costoSalarioNeto', label: '% Costo total / Salario Neto'},
  {id: 'nuAnno', label: 'AÑO'},
  {id: 'nuMes', label: 'MES'},
  {id: 'salarioDiarioIntegrado', label: 'Salario Diario Integrado'},
  {id: 'Vivienda', label: 'Vivienda'},
  {id: 'Automóvil', label: 'Automóvil'},
  {id: 'Viáticos a comprobar', label: 'Viáticos a comprobar'},			
  {id: 'Bono Adicional', label: 'Bono Adicional'},
  {id: 'Gasolina', label: 'Gasolina'},
  {id: 'Casetas', label: 'Casetas'},
  {id: 'Ayuda de transporte', label: 'Ayuda de transporte'},
  {id: 'Vuelos de avión', label: 'Vuelos de avión'},
  {id: 'Provisión Impuestos Expats', label: 'Provisión Impuestos Expats'},
  {id: 'Programa de entrenamiento', label: 'Programa de entrenamiento'},
  {id: 'Eventos especiales', label: 'Eventos especiales'},
  {id: 'Costo IT', label: 'Costo IT'},
  {id: 'Costo telefonia', label: 'Costo telefonia'},
  {id: 'S.V. Directivos', label: 'S.V. Directivos'},
  {id: 'Facturación BPM', label: 'Facturación BPM'},
  {id: 'Fringe Expats', label: 'Fringe Expats'},
  {id: 'Vivienda', label: 'Vivienda'},
  {id: 'Automóvil', label: 'Automóvil'},
  {id: 'Viáticos a comprobar', label: 'Viáticos a comprobar'},			
  {id: 'Bono Adicional', label: 'Bono Adicional'},
  {id: 'Gasolina', label: 'Gasolina'},
  {id: 'Casetas', label: 'Casetas'},
  {id: 'Ayuda de transporte', label: 'Ayuda de transporte'},
  {id: 'Vuelos de avión', label: 'Vuelos de avión'},
  {id: 'Provisión Impuestos Expats', label: 'Provisión Impuestos Expats'},
  {id: 'Programa de entrenamiento', label: 'Programa de entrenamiento'},
  {id: 'Eventos especiales', label: 'Eventos especiales'},
  {id: 'Costo IT', label: 'Costo IT'},
  {id: 'Costo telefonia', label: 'Costo telefonia'},
  {id: 'S.V. Directivos', label: 'S.V. Directivos'},
  {id: 'Facturación BPM', label: 'Facturación BPM'},
  {id: 'Fringe Expats', label: 'Fringe Expats'},
  {id: 'CostoTotal', label: 'Costo Total'}
  
 
  
])

export interface PuestosResponse {
  data:          Puesto[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface Puesto {
  nukid_puesto:   number;
  nukidnivel:     number;
  chpuesto:       string;
  boactivo:       boolean;
  nusalario_min:  number;
  nusalario_max:  number;
  nusalario_prom: number;
}

export interface UpPersonasResponse {
  data:          UpPersona[];
  success:       boolean;
  message:       null;
  transactionId: null;
}



export interface UpPersona {
  nukidpersona:       number;
  nukidedo_civil:     number;
  chedo_civil:        string;
  nukidtipo_sangre:   number;
  chtipo_sangre:      string;
  chnombre:           string;
  chap_paterno:       string;
  chap_materno:       null | string;
  nukidsexo:          number;
  chsexo:             string;
  chrfc:              string;
  dtfecha_nacimiento: string;
  chemail:            string;
  chtelefono:         string;
  chcelular:          null | string;
  chcurp:             null | string;
  nukidtipo_persona:  number;
  chtipo_persona:     string;
  boactivo:           boolean;
  boempleado:         boolean;
  chnombre_completo?: string
}

export interface Opcion {
  value: string,
  label: string
}

export interface OpcionEmp {
  name: string,
  code: string
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

