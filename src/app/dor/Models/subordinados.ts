export class Subordinados {
  centrosdeCostos?: string = '';
  nombre?: string = '';
  noEmpleado?: string = '';
  puesto?: string = '';
  direccionEjecutiva?: string = '';
  unidadDeNegocio?: string = '';
  jefeDirecto?: string = '';
  nivel?: string;
  proyecto?: string = '';
}

export class Objetivos {
  id: string = '';
  concepto?: string = '';
  descripcion?: string = '';
  idEmpOb?: string = '';
  meta?: string = '';
  tooltip?: string = '';
  unidadDeNegocio?: string = '';
  isComodin: boolean = false;
  isEditable: boolean = false;
  valor?: string = '';
  acepto: string = '';
  motivoR: string = '';
  fechaAceptado: string = '';
  fechaCarga: string = '';
  fechaRechazo: string = '';
  nivel: string = '';
  porcentajeEstimado: number;
  porcentajeReal: number;
  real: number;
  esPersonal: boolean;
  resultadoTemporal: number;
}

export class ObjetivosGenerales {
  // [key: string]: any;
  id: string = '';
  concepto?: string = '';
  descripcion?: string = '';
  meta?: string = '';
  nivel?: string;
  tooltip?: string = '';
  unidadDeNegocio?: string = '';
  valor?: string = '';
  porcentajeEstimado: number;
  porcentajeReal: number;
  promedioReal: number;
  real: number;
  ingreso: number;
  gasto: number;
  mesReal: number;
}

export interface ObjetivosGeneralesNuevo {
  id:                   number;
  unidadDeNegocio:      string;
  concepto:             string;
  descripcion:          string;
  meta:                 number;
  metaValor:            number | null;
  real:                 number;
  promedioReal:         string;
  porcentajeEstimado:   string;
  porcentajeReal:       string;
  nivel:                string;
  valor:                string;
  tooltip:              string;
  ingresoTotal:         number | null;
  gastoTotal:           number | null;
  proyectadoTotal:      number | null;
  metaMensual:          number | null;
  empleado:             number | null;
}

export class EstatusObjetivosPorProyecto {
  public static readonly inicial: number = 0;
  public static readonly capturado_por_ejecutivo: number = 1;
  public static readonly aceptado_por_empleado: number = 2;
  public static readonly rechazado_por_empleado: number = 3;
  public static readonly evaluado: number = 4;
}

export class MensajesObjetivosCualitativos {
  public static readonly sin_datos_captura: string =
    'No se encontraron objetivos para cargar';
  public static readonly sin_datos_evaluacion: string =
    'Los objetivos no han sido aceptados/evaluados';
  public static readonly sin_datos_objetivos: string =
    'Los objetivos no han sido cargados';
}
