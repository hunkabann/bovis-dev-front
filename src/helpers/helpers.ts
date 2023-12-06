
import * as base64js from 'base64-js'

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