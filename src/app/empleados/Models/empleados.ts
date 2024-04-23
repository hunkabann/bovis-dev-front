// import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct";
export class Empleado {

  id: number;
  nombre: string = '';
  apellido_paterno: string = '';
  apellido_materno: string = '';
  datosContacto: string = '';
  fechaNacimiento: Date;
  edad: number;
  sexo: string = 'Masculino';
  direccion: string = '';
  clave_id_fed: string = '';
  email: string = '';
  telefono: string = '';
  kfc: string = '';
  curp: string = '';
  nss: string = '';
  porcentajeCaptura: number = 35;

}
export class Catalogo{
  id: string = '';
  descripcion: string = '';
  activo: boolean;
}

export class Persona{

  IdEdoCivil: number = 0;
  IdTipoSangre: number = 0;
  Nombre: string = '';
  ApPaterno: string = '';
  ApMaterno: string = '';
  Sexo: number = 0;
  Rfc: string = '';
  FechaNacimiento: string = '';
  Email: string = '';
  Telefono: string = '';
  Celular: string = '';
  Curp: string = '';
  TipoPersona: number = 0;
}

export class CatPersona{

  idPersona: number = 0;
  idEdoCivil: number = 0;
  idTipoSangre: number = 0;
  nombre: string = '';
  id: string = '';
  apPaterno: string = '';
  apMaterno: string = '';
  Sexo: number = 0;
  sexo: string = '';
  rfc: string = '';
  fechaNacimiento: string = '';
  email: string = '';
  telefono: string = '';
  celular: string = '';
  curp: string = '';
  activo: boolean = true;
  tipoPersona: number = 0;

}

export class CatEmpleado {

  numEmpleadoRrHh: string = null;
  idPersona: number = null;
  idTipoEmpleado: number = null;
  idCategoria: number = null;
  idTipoContrato: number = null;
  cvePuesto: string = '';
  idEmpresa: number = 0;
  idCiudad: number = null;
  idNivelEstudios: number = null;
  idFormaPago: number = null;
  idJornada: number = null;
  idDepartamento: number = null;
  idClasificacion: number = null;
  idJefeDirecto: number = 0;
  idUnidadNegocio: number = null;
  idTipoContratoSat: number = 0;
  numEmpleado: number = null;
  fechaIngreso: string = '';
  fechaSalida: string = '';;
  fechaUltimoReingreso: string = '';
  nss: number = null;;
  emailBovis: string = '';
  experiencias: string = '';
  habilidades: string = '';
  urlRepositorio: string = '';
  salario: number = null;
  profesion: string = '';
  antiguedad: number = null;
  turno: string = 'M';
  unidadMedica: number = null;
  registroPatronal: string = '';
  cotizacion: string = '';
  duracion: number = null;
  activo: boolean = false;
  descuentoPension: boolean = false;
  porcentajePension: number = null;
  fondoFijo: number = null;
  creditoInfonavit: number = null;
  tipoDescuento: string = '';
  valorDescuento: number = null;
  empleadoNoi: number = null;

}

// Generated by https://quicktype.io

export interface CatalogoResponse {
  data:          CatItem[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface CatItem {
  id:          number;
  descripcion: string;
  activo:      boolean;
}

export interface GenericResponse {
  data:          null;
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface GenerarRequerimientoResponse {
  data:          null;
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface ActualizarRequerimientoResponse {
  data:          null;
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface RequerimientosResponse {
  data:          Requerimiento[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface RequerimientoResponse {
  data:          Requerimiento;
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface Requerimiento {
  nukidrequerimiento:      number;
  nukidcategoria:          number;
  chcategoria:             string;
  nukidpuesto:             number;
  chpuesto:                string;
  nukidnivel_estudios:     number;
  chnivel_estudios:        string;
  nukidprofesion:          number;
  chprofesion:             string;
  nukidjornada:            number;
  chjornada:               string;
  nusueldo_min:            number;
  nusueldo_max:            number;
  nusueldo_real:           number;
  nunumempleado_rr_hh:     number;
  chempleado_rr_hh:        string;
  nukiddirector_ejecutivo: number;
  chdirector_ejecutivo:    string;
  nukidproyecto:           number;
  chproyecto:              string;
  nukidjefe_inmediato:     number;
  chjefe_inmediato:        string;
  nukidtipo_contrato:      number;
  chtipo_contrato:         string;
  nukidestado:             number;
  chestado:                string;
  nukidciudad:             number;
  chciudad:                string;
  bodisponibilidad_viajar: boolean;
  nuanios_experiencia:     number;
  chnivel_ingles:          null;
  chcomentarios:           null;
  habilidades:             Habilidad[];
  experiencias:            Experiencia[];
  boactivo:                boolean;
}

interface Experiencia {
  idRequerimiento: number;
  idExperiencia:   number;
  activo:          boolean;
}

interface Habilidad {
  idRequerimiento: number;
  idHabilidad:     number;
  activo:          boolean;
}

export interface UpPersonasResponse {
  data:          UpPersona[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface UpPersonaResponse {
  data:          UpPersona;
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

export interface UpEmpleadoResponse {
  data:          UpEmpleado[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface OneEmpleadoResponse {
  data:          UpEmpleado;
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
  experiencias:             Experiencia[];
  habilidades:              Habilidad[];
}

export interface TurnoResponse {
  data:          Turno[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface Turno {
  id:          number;
  descripcion: string;
  activo:      boolean;
}

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

export interface ReqProyectosResponse {
  data:          ReqProyecto[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface ReqProyecto {
  numProyecto:                  number;
  proyecto:                     string;
  alcance:                      string;
  cp:                           string;
  ciudad:                       string;
  idEstatus:                    number;
  idSector:                     number;
  idTipoProyecto:               number;
  idResponsablePreconstruccion: number;
  idResponsableConstruccion:    number;
  idResponsableEhs:             number;
  idResponsableSupervisor:      number;
  idCliente:                    number;
  idEmpresa:                    number;
  idPais:                       number;
  idDirectorEjecutivo:          number;
  costoPromedioM2:              number;
  fechaIni:                     string;
  fechaFin:                     string;
}

export interface TiposContratoResponse {
  data:          TipoContrato[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface TipoContrato {
  nukid_contrato: number;
  chcontrato:     string;
  chve_contrato:  string;
  boactivo:       boolean;
}

export interface PaisesResponse {
  data:          Pais[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface Pais {
  id:          number;
  descripcion: string;
  activo:      boolean;
}


export interface EstadosResponse {
  data:          Estado[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface Estado {
  idEstado:   number;
  idPais:     number;
  estado:     string;
  cveEntidad: string;
  activo:     boolean;
}

export interface FiltrosRequerimientos {
  idDirector?: number,
  idProyecto?: number,
  idPuesto?:   number
}

export interface ContratosResponse {
  data:          ContratoPlantilla[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface ContratoResponse {
  data:          ContratoPlantilla;
  success:       boolean;
  message:       null;
  transactionId: null;
}
 
export interface ContratoPlantilla {
  idContratoEmpleado: number;
  titulo:             string;
  contrato:           string;
  numEmpleadoRrHh:    string;
  activo:             boolean;
}

// Generated by https://quicktype.io

export interface CostoEmpleadoResponse {
  data:          CostoEmpleado[];
  success:       boolean;
  message:       string;
  transactionId: null;
}

export interface CostoEmpleado {
  idCostoEmpleado:                number;
  idCosto:                        number;
  numEmpleadoRrHh:                string;
  nuAnno:                         number;
  nuMes:                          number;
  numEmpleadoNoi:                 number;
  idPersona:                      number;
  reubicacion:                    null;
  idPuesto:                       number;
  numProyecto:                    number;
  idUnidadNegocio:                number;
  idEmpresa:                      number;
  timesheet:                      null;
  idEmpleadoJefe:                 number;
  fechaIngreso:                   string;
  antiguedad:                     number;
  avgDescuentoEmpleado:           number;
  montoDescuentoMensual:          number;
  sueldoNetoPercibidoMensual:     number;
  retencionImss:                  number;
  ispt:                           number;
  sueldoBruto:                    number;
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
  beneficios:                     null;
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
}


export class Proyectos{
  numProyecto: number;
  nombre: string;
  alcance: string;
}

export class Empresas{
  idEmpresa: number;
  empresa: string;
  rfc: string;
}

export class Busqueda{
  idProyecto: any = null;
  //idCliente: any = null;
  idEmpresa: any = null;
  //fechaIni: string = null;
  //fechaFin: string = null;
  //noFactura: string = null;
}

export const encabezados = Object.freeze([
  // {id: 'id', label: 'Id'},
  {id: 'nunum_empleado_rr_hh', label: 'Número de empleado RRHH'},
  {id: 'nombre_persona', label: 'Persona'},
  {id: 'chtipo_emplado', label: 'Tipo empleado'},
  {id: 'chcategoria', label: 'Categoría'},
  {id: 'chtipo_contrato', label: 'Tipo de contrato'},
  {id: 'chpuesto', label: 'Puesto'},
  {id: 'chempresa', label: 'Empresa'},
  {id: 'chciudad', label: 'Ciudad'},
  {id: 'nukidjefe_directo', label: 'Jefe directo'},
  {id: 'chunidad_negocio', label: 'Unidad de negocio'},
  {id: 'dtfecha_ingreso', label: 'Fecha de ingreso'},
  {id: 'dtfecha_salida', label: 'Fecha de salida'},
  {id: 'dtfecha_ultimo_reingreso', label: 'Fecha de reingreso'},
  {id: 'chnss', label: 'Nss'},
  {id: 'chemail_bovis', label: 'Email Bovis'},
  {id: 'nuantiguedad', label: 'Antiguedad'},
  {id: 'nufondo_fijo', label: 'Fondo fijo'}
])
