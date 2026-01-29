// LineaBase
export class DateUtils {

  static getToday_ddMMyyyy(): string {
    const hoy = new Date();

    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();

    return `${anio}/${mes}/${dia}`;
  }

  static formatDate_ddMMyyyy(date: Date): string {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();

    return `${anio}/${mes}/${dia}`;
  }
}
