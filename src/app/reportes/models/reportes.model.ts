// Generated by https://quicktype.io

export interface ReportesResponse {
  data:          Reporte[];
  success:       boolean;
  message:       null;
  transactionId: null;
}

export interface Reporte {
  idReporte:           number;
  query:               string;
  nombre:              string;
  descripcion:         string;
  fechaCreacion:       string;
  idEmpleadoCrea:      number;
  empleadoCrea:        string;
  fechaActualizacion:  null;
  idEmpleadoActualiza: null;
  empleadoActualiza:   string;
  activo:              boolean;
}

export interface EjecucionResponse {
  data:          any[];
  success:       boolean;
  message:       null;
  transactionId: null;
}