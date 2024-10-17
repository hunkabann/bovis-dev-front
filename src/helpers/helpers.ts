
import * as base64js from 'base64-js'
import { addMonths, differenceInCalendarMonths, format} from 'date-fns';
import { es } from 'date-fns/locale';
import { SeccionData } from 'src/app/pcs/models/pcs.model';
import { Mes } from 'src/models/general.model';



export const descargarArchivo = async (base64Datos: string, nombreArchivo: string): Promise<void>  => {
  const base64String = base64Datos.split(';base64,').pop()
  const byteArray = base64js.toByteArray(base64String);
  const blob = new Blob([byteArray], { type: 'application/octet-stream' });
  const downloadUrl = URL.createObjectURL(blob)

  const mimeType = base64Datos.split(';')[0].split(':')[1]

  let extension = ''
  if (mimeTypeExtensions.hasOwnProperty(mimeType)) {
    extension = mimeTypeExtensions[mimeType];
  }

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${nombreArchivo}.${extension}`;
  link.click();
}

const mimeTypeExtensions: any = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':        'xlsx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':  'docx',
  'application/pdf':  'pdf',
  'image/png':        'png',
  'image/jpg':        'jpg',
  'image/jpeg':       'jpeg'
};

export const obtenerMeses = (fechaInicio: Date, fechaFin: Date): Mes[] => {

  const diferenciaMeses = differenceInCalendarMonths(fechaFin, fechaInicio);
  const meses: Mes[] = []
  
  for (let i = 0; i <= diferenciaMeses; i++) {
    const fecha = addMonths(fechaInicio, i)
    const mes   = +format(fecha, 'M')
    const anio  = +format(fecha, 'Y')
    const desc  = format(fecha, 'LLL/Y', {locale: es})

    meses.push({
      mes:  mes,
      anio: anio,
      desc: desc
    })
  }

  return meses
}

export const obtenerMesesTrans = (fechaInicio: Date, fechaFin: Date):number => {

  
 
  const diferenciaMeses = differenceInCalendarMonths(fechaFin, fechaInicio);
          console.log("diferenciaMeses: " + diferenciaMeses)

        
          
          for (let i = 0; i <= diferenciaMeses; i++) {
            const fecha = addMonths(fechaInicio, i)
            const mes   = +format(fecha, 'M')
            const anio  = +format(fecha, 'Y')
     
           
          }

  return diferenciaMeses
}

export const obtenerMesesFecha = (fechaInicio: Date, fechaFin: Date): Mes[] => {

  const diferenciaMeses = differenceInCalendarMonths(fechaFin, fechaInicio);
  const meses: Mes[] = []
  
  for (let i = 0; i <= diferenciaMeses; i++) {
    const fecha = addMonths(fechaInicio, i)
    const mes   = +format(fecha, 'M')
    const anio  = +format(fecha, 'Y')
    const desc  = format(fecha, 'LLL/Y', {locale: es})

    meses.push({
      mes:  mes,
      anio: anio,
      desc: desc
    })
  }

  return meses
}


export const formatCurrency = (valor: number) => {
  return valor.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
}

/**
 * Función para dar formato a las tablas de PCS Control
 */
export const formatearInformacionControl = (data: SeccionData) => {
  
  // Paso 1: Unir y ordenar los meses y años de ambos arreglos
  const fechasCombinadas = [...data.previsto.fechas, ...data.real.fechas]
    .map(f => ({ mes: f.mes, anio: f.anio }))
    .filter(
      (v, i, a) => a.findIndex(t => t.mes === v.mes && t.anio === v.anio) === i
    ) // Eliminar duplicados
    .sort((a, b) => a.anio - b.anio || a.mes - b.mes); // Ordenar por año y luego por mes;
  
  // Paso 2: Crear los nombres de los meses en formato 'ENE/2024'
  let encabezados = fechasCombinadas.map(f => {
    const mesNombres = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return `${mesNombres[f.mes - 1]}/${f.anio}`;
  });

  encabezados = ['Nombre', 'Subtotal', ...encabezados];
  
  // Paso 3: Crear los valores correspondientes para "previsto" y "real"
  let registros = [];

  const valoresPrevisto = fechasCombinadas.map(f => {
    const entry = data.previsto.fechas.find(e => e.mes === f.mes && e.anio === f.anio);
    return entry ? entry.porcentaje : 0;
  });

  registros.push(['Previsto', data.previsto.subTotal || 0, ...valoresPrevisto]);
  
  const valoresReal = fechasCombinadas.map(f => {
    const entry = data.real.fechas.find(e => e.mes === f.mes && e.anio === f.anio);
    return entry ? entry.porcentaje : 0;
  });
  
  registros.push(['REAL', data.real.subTotal || 0, ...valoresReal]);
  
  return {encabezados, registros};
  
}