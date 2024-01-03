export interface EmpleadosSub {
  name: string;
  value: string;
}

export interface Subordinados {
  numEmpleadoRrHh: string;
  idPersona: number;
  idJefeDirecto: number;
  nombre: string;
  apPaterno: string;
  apMaterno: string;
}

export interface DiasHabiles {
  id: number;
  mes: number;
  anio: number;
  dias: number;
  sabados: number;
  feriados: number;
}

export interface BaseOtros {
  idCatOtros: number;
  descripcion: string;
  activo: boolean;
  dias: number;
  dedicacion: string;
  costo: string;
}

export interface ProyectosEmpleados {
  numProyecto: number;
  numEmpleadoRrHh: string;
  porcentajeParticipacion: number;
  aliasPuesto: string;
  grupoProyecto: string;
  fechaIni: string;
  fechaFin: string;
  idPersona: 5;
  nombre: string;
  apPaterno: string;
  apMaterno: string;
  proyecto: string;
}

export class dtTotales {
  totalDias: number = 0;
  totalDedicacion: number = 0;
  totalCostos: number = 0;
}
