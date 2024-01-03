
import * as base64js from 'base64-js'
import { addMonths, differenceInCalendarMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
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

export const formatCurrency = (valor: number) => {
  return valor.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
}