import { Item } from "src/models/general.model";

export const errorsArray = Object.freeze([
  {
    tipo: 'required',
    mensaje: 'Este campo es requerido.'
  }, 
  {
    tipo: 'maxlength',
    mensaje: 'Este campo es inválido.'
  },
  {
    tipo: 'minlength',
    mensaje: 'Este campo es inválido.'
  },
  {
    tipo: 'email',
    mensaje: 'El formato de correo es inválido.'
  }
])

export const cieHeaders = [
    'NOMBRE CUENTA',
    'CUENTA',
    'TIPO POLIZA',
    'NUMERO',
    'FECHA',
    'MES',
    'CONCEPTO',
    'CENTRO DE COSTOS',
    'PROYECTOS',
    'SALDO INICIAL',
    'DEBE',
    'HABER',
    'MOVIMIENTO',
    'EMPRESA',
    'NUM PROYECTO',
    'TIPO',
    'EDO DE RESULTADOS',
    'RESPONSABLE',
    'UNIDAD',
    'TIPO PY',
    'CLASIFICACION PY'
]

export const cieHeadersFields = {
  'NOMBRE CUENTA': 'nombre_cuenta',
  'CUENTA': 'cuenta',
  'TIPO POLIZA': 'tipo_poliza',
  'NUMERO': 'numero',
  'FECHA': 'fecha',
  'MES': 'mes',
  'CONCEPTO': 'concepto',
  'CENTRO DE COSTOS': 'centro_costos',
  'PROYECTOS': 'proyectos',
  'SALDO INICIAL': 'saldo_inicial',
  'DEBE': 'debe',
  'HABER': 'haber',
  'MOVIMIENTO': 'movimiento',
  'EMPRESA': 'empresa',
  'NUM PROYECTO': 'num_proyecto',
  'TIPO': 'tipo_proyecto',
  'EDO DE RESULTADOS': 'edo_resultados',
  'RESPONSABLE': 'responsable',
  'UNIDAD': 'tipo_cuenta',
  'TIPO PY': 'tipo_py',
  'CLASIFICACION PY': 'clasificacion_py'
}

export const cieHeadersFieldsLazy = {
  'NOMBRE CUENTA':      'NombreCuenta',
  'CUENTA':             'Cuenta',
  'TIPO POLIZA':        'TipoPoliza',
  'NUMERO':             'Numero',
  'FECHA':              'Fecha',
  'MES':                'Mes',
  'CONCEPTO':           'Concepto',
  'CENTRO DE COSTOS':   'CentroCostos',
  'PROYECTOS':          'Proyectos',
  'SALDO INICIAL':      'SaldoInicial',
  'DEBE':               'Debe',
  'HABER':              'Haber',
  'MOVIMIENTO':         'Movimiento',
  'EMPRESA':            'Empresa',
  'NUM PROYECTO':       'NumProyecto',
  'TIPO':               'TipoProyecto',
  'EDO DE RESULTADOS':  'EdoResultados',
  'RESPONSABLE':        'Responsable',
  'UNIDAD':             'TipoCuenta',
  'TIPO PY':            'TipoPy',
  'CLASIFICACION PY':   'ClasificacionPy'
}

export const EXCEL_EXTENSION = '.xlsx';

export const PERCENTAGE_FORMAT = '0.00%'

export const TITLES = Object.freeze({
  error:    'Oh no...',
  success:  '¡Éxito!'
})

export const SUBJECTS = Object.freeze({
  error:  'Ha ocurrido un error inesperado.'
})

/**
 * Calendar constants
 */
export const CALENDAR = Object.freeze({
  dayNames: [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ],
  dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  monthNamesShort: [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ]
})

export const meses: Item[] = [
  {value: 0, label: 'Todos'},
  {value: 1, label: 'Enero'},
  {value: 2, label: 'Febrero'},
  {value: 3, label: 'Marzo'},
  {value: 4, label: 'Abril'},
  {value: 5, label: 'Mayo'},
  {value: 6, label: 'Junio'},
  {value: 7, label: 'Julio'},
  {value: 8, label: 'Agosto'},
  {value: 9, label: 'Septiembre'},
  {value: 10, label: 'Octubre'},
  {value: 11, label: 'Noviembre'},
  {value: 12, label: 'Diciembre2'},
]

export const mesesString: Item[] = [
  {value: '1', label: 'Enero'},
  {value: '2', label: 'Febrero'},
  {value: '3', label: 'Marzo'},
  {value: '4', label: 'Abril'},
  {value: '5', label: 'Mayo'},
  {value: '6', label: 'Junio'},
  {value: '7', label: 'Julio'},
  {value: '8', label: 'Agosto'},
  {value: '9', label: 'Septiembre'},
  {value: '10', label: 'Octubre'},
  {value: '11', label: 'Noviembre'},
  {value: '12', label: 'Diciembre2'},
]

export const PERMISOS = Object.freeze({
  LECTURA:  'Lectura',
  ADMIN:    'Administrador'
})

export const MODULOS = Object.freeze({
  TIMESHEET_CARGA_DE_HORAS: 'timesheet.carga-de-horas',
  TIMESHEET_CONSULTA_MODIFICACION: 'timesheet.consulta-y-modificacion'
})

export const MENU = [
  {
    title: 'EMPLEADOS',
    icon: 'icon-empleado',
    id: 'empleados',
    items: [
      [
        {
          label: 'EMPLEADOS',
          items: [
            {
              label: 'Requerimientos',
              routerLink: ['empleados/requerimientos'],
              id: 'requerimientos',
              command: () =>
                localStorage.setItem('pageTitle', 'Requerimientos'.toUpperCase()),
            },
            {
              label: 'Personas',
              routerLink: ['empleados/persona'],
              id: 'personas',
              command: () =>
                localStorage.setItem('pageTitle', 'Registro de Persona'.toUpperCase()),
            },
            {
              label: 'Empleados',
              routerLink: ['empleados/empleado-pri'],
              id: 'empleados',
              command: () =>
                localStorage.setItem('pageTitle', 'Registro de Empleado'.toUpperCase()),
            },
          ],
        },
      ],
    ],
  },
  {
    title: 'TIMESHEET',
    icon: 'icon-timesheet',
    id: 'timesheet',
    items: [
      [
        {
          label: 'TIMESHEET',
          items: [
            {
              label: 'Cargar Horas',
              routerLink: ['timesheet/cargar-horas'],
              id: 'carga-de-horas',
              command: () =>
                localStorage.setItem('pageTitle', 'Timesheet'.toUpperCase()),
            },
            {
              label: 'Consultar / Modificar',
              routerLink: ['timesheet/consultar'],
              id: 'consulta-y-modificacion',
              command: () =>
                localStorage.setItem('pageTitle', 'Timesheet'.toUpperCase()),
            },
            {
              label: 'Summary',
              routerLink: ['timesheet/summary'],
              id: 'summary',
              command: () =>
                localStorage.setItem('pageTitle', 'Timesheet'.toUpperCase()),
            },
          ],
        },
      ],
    ],
  },
  {
    title: 'COSTO DE EMPLEADOS',
    icon: 'icon-costos',
    id: 'costo-de-empleados',
    items: [
      [
        {
          label: 'COSTO DE EMPLEADOS',
          items: [
            {
              label: 'Costo por empleado',
              routerLink: ['costos/costo-empleado'],
              id: 'costo-por-empleado',
              command: () =>
                localStorage.setItem('pageTitle', 'Costos'.toUpperCase()),
            },
            {
              label: 'Captura de beneficios',
              routerLink: ['costos/costo-proyecto'],
              id: 'costo-por-proyecto',
              command: () =>
                localStorage.setItem('pageTitle', 'Costos'.toUpperCase()),
            },
          ],
        },
      ],
    ],
  },
  {
    title: 'CIE',
    icon: 'icon-cie',
    id: 'cie',
    items: [
      [
        {
          label: 'CIE',
          items: [
            {
              label: 'Carga de SAE',
              routerLink: ['cie/carga-sae'],
              id: 'carga-de-sae',
              command: () =>
                localStorage.setItem('pageTitle', 'CIE'.toUpperCase()),
            },
            {
              label: 'CIE – Resultado búsqueda',
              routerLink: ['cie/resultado-busqueda'],
              id: 'resultado',
              command: () =>
                localStorage.setItem('pageTitle', 'CIE'.toUpperCase()),
            },
          ],
        },
      ],
    ],
  },
  {
    title: 'PCS',
    icon: 'icon-pcs',
    id: 'pcs',
    routerLink: ['pcs/ip'],
    command: () =>
      localStorage.setItem('pageTitle', 'PCS'.toUpperCase()),
  },
  {
    title: 'AUDITORIA',
    icon: 'icon-auditoria-legal',
    id: 'auditoria',
    items: [
      [
        {
          label: 'AUDITORIA',
          items: [
            {
              label: 'Auditoría Legal',
              routerLink: ['auditoria'],
              id: 'auditoria-legal',
              queryParams: {tipo: 'legal'},
              command: () => {
                localStorage.setItem('pageTitle', 'Auditoría Legal'.toUpperCase())
                localStorage.removeItem('esLegal')
              }
            },
            {
              label: 'Auditoría de Calidad',
              routerLink: ['auditoria'],
              id: 'auditoria-de-calidad',
              command: () =>
                localStorage.setItem('pageTitle', 'Auditoría de Calidad'.toUpperCase()),
            }
          ],
        },
      ],
    ],
  },
  {
    title: 'REPORTES',
    icon: 'icon-reportes',
    id: 'reportes',
    routerLink: ['reportes/lista'],
    command: () =>
      localStorage.setItem('pageTitle', 'REPORTES'.toUpperCase()),
  },
  {
    title: 'PEC',
    icon: 'icon-pec',
    id: 'pec',
    items: [
      [
        {
          label: 'PEC',
          items: [
            {
              label: 'Captura',
              routerLink: ['pec/captura'],
              id: 'captura',
              command: () =>
                localStorage.setItem('pageTitle', 'PLATAFORMA DE EXCELENCIA CORPORATIVA'.toUpperCase()),
            },
            {
              label: 'Consulta/Evaluación',
              routerLink: ['pec/evaluacion'],
              id: 'consulta-/-evaluacion',
              command: () =>
                localStorage.setItem('pageTitle', 'PLATAFORMA DE EXCELENCIA CORPORATIVA'.toUpperCase()),
            },
            {
              label: 'Aceptar objetivos',
              routerLink: ['pec/objetivos'],
              id: 'aceptar-objetivos',
              command: () =>
                localStorage.setItem('pageTitle', 'PLATAFORMA DE EXCELENCIA CORPORATIVA'.toUpperCase()),
            },
          ],
        },
      ],
    ],
  },
  {
    title: 'FACTURACIÓN',
    icon: 'icon-facturacion',
    id: 'facturacion',
    items: [
      [
        {
          label: 'FACTURACIÓN',
          items: [
            {
              label: 'Carga CFDI',
              routerLink: ['facturacion/carga-cfdi'],
              id: 'carga-de-cfdi',
              command: () =>
                localStorage.setItem('pageTitle', 'FACTURACIÓN - CARGA CFDI'.toUpperCase()),
            },
            {
              label: 'NC',
              routerLink: ['facturacion/nota-credito'],
              id: 'nc',
              command: () =>
              localStorage.setItem('pageTitle', 'FACTURACIÓN - NC'.toUpperCase()),
            },
            {
              label: 'NC Sin Factura',
              routerLink: ['facturacion/nota-credito-sin-factura'],
              id: 'nc-sin-factura',
              command: () =>
              localStorage.setItem('pageTitle', 'FACTURACIÓN - NC Sin Factura'.toUpperCase()),
            },
            {
              label: 'CRP',
              routerLink: ['facturacion/crp'],
              id: 'crp',
              command: () =>
              localStorage.setItem('pageTitle', 'FACTURACIÓN - CRP'.toUpperCase()),
            },
            {
              label: 'Busqueda/Cancelación',
              routerLink: ['facturacion/cancelacion'],
              id: 'busqueda-/-cancelacion',
              command: () =>
              localStorage.setItem('pageTitle', 'FACTURACIÓN - CANCELACIÓN'.toUpperCase()),
            },
          ],
        },
      ],
    ],
  },
  {
    title: 'ADMINISTRACIÓN',
    icon: 'icon-admin',
    id: 'administracion',
    items: [
      [
        {
          label: 'ADMINISTRACIÓN',
          items: [
            {
              label: 'Contratos',
              routerLink: ['contratos/plantillas'],
              id: 'contratos',
              command: () =>
              localStorage.setItem('pageTitle', 'CONTRATOS'.toUpperCase()),
            },
            {
              label: 'Usuarios',
              routerLink: ['usuarios/principal'],
              id: 'usuarios',
              command: () =>
              localStorage.setItem('pageTitle', 'USUARIOS'.toUpperCase()),
            }
          ]
        }
      ]
    ]
  },
  {
    title: 'CATÁLOGOS',
    icon: 'icon-catalogos',
    id: 'catalogos',
    items: [
      [
        {
          label: 'CATÁLOGOS',
          items: [
            {
              label: 'Catálogos',
              id: 'catalogos',
              routerLink: ['catalogos'],
              command: () =>
              localStorage.setItem('pageTitle', 'Catálogos'.toUpperCase())
            },
          ],
        },
      ],
    ],
  },
];

export const emailsDatos = Object.freeze({
  emailNuevoRequerimiento: {
    subject:  'Requerimiento de personal',
    body:     `Buen día, nombre_usuario.
              El área de Recursos Humanos ha recibido su requerimiento de persoal y comenzará el proceso de búsqueda.
              Lo mantendremos al tanto de los avances.
              Saludos.`,
    emailsTo: [
      'jmmorales@hunkabann.com.mx'
    ]
  }
})