// LineaBase
export class DateUtils {
  

//getToday_ddMMyyyy
  static getToday_yyyyMMdd(opcion:string, separador: string): string {
    const hoy = new Date();
    var cadena = "";
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    if(opcion == "dd/MM/yyyy"){
      cadena = `${dia}${separador}${mes}${separador}${anio}`;
    }
    else if(opcion == "yyyy/MM/dd"){
      cadena = `${anio}${separador}${mes}${separador}${dia}`;
    }
    else {
      cadena = `${anio}${separador}${mes}${separador}${dia}`;
    }
    //return `${anio}-${mes}-${dia}`;
    return cadena;
  }
//formatDate_ddMMyyyy
  static formatDate_yyyyMMdd(date: Date, separador: string): string {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();

    return `${anio}${separador}${mes}${separador}${dia}`;
  }
  
}
