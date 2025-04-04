import { Component, OnInit, inject } from '@angular/core';
import { format } from 'date-fns';
import { MessageService } from 'primeng/api';
import { TimesheetService } from '../../services/timesheet.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize, forkJoin } from 'rxjs';
import { Timesheet,Opcion } from '../../models/timesheet.model';
import * as XLSX from 'xlsx';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { TITLES,EXCEL_EXTENSION, PERCENTAGE_FORMAT } from 'src/utils/constants';
import { es } from 'date-fns/locale';

interface ProyectoShort {
  id:           number,
  nombre:       string,
  //dedicacion?:  number
  costo?:  number
}



interface Informacion {
  timesheet: Timesheet,
  participacion: ProyectoShort[]
}

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  providers: [MessageService]
})
export class SummaryComponent implements OnInit {

  timeSheetService  = inject(TimesheetService)
  sharedService     = inject(SharedService)
  messageService  = inject(MessageService)

  proyectos:  ProyectoShort[] = []
  data: Informacion[] = []

  personass:    Opcion[] = []

  TotalTimeSheet: number = 0

  MesConsulta: number = 0

  fechaexcel: Date

  masde100: number = 0

  menosde100: number = 0


  constructor() { }

  ngOnInit(): void {
    this.sharedService.cambiarEstado(true)
    this.timeSheetService.getCatProyectos(false)
      .subscribe(({data}) => {
        //this.proyectos = data.map(({numProyecto, nombre}) => ({id: numProyecto, nombre, dedicacion: 0 }))
        this.proyectos = data.map(({numProyecto, nombre}) => ({id: numProyecto, nombre, costo: 0 }))
        this.sharedService.cambiarEstado(false)
      })

      forkJoin([
        this.timeSheetService.getEmpleados()
      ])
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (value) => {
            
            const [personasR] = value
           
            this.personass = personasR.data.map(persona => ({value: persona.nombre_persona, label: `${persona.nunum_empleado_rr_hh.toString()} - ${persona.nombre_persona}` }))
           
            
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        })
  }

  get totalPorcentaje() {
    let total = 0
    this.data.forEach(({timesheet}) => {
      timesheet.proyectos.forEach(proyecto => {
        //total += Math.round(proyecto.tDedicacion)
        total += Math.round(proyecto.costo)
        //console.log("totalPorcentaje proyecto.costo: " +proyecto.costo)
      }
      
      )
    })

    // se comenta por que otros no tiene costos
   /* this.data.forEach(({timesheet}) => {
      timesheet.otros.forEach(otros => {
        total += Math.round(otros.tDedicacion)
        //console.log("otros.tDedicacion: " +otros.tDedicacion)
      }
      
      )
    })*/

    this.TotalTimeSheet = Math.round(total)

    return Math.round(total)
  }

  onSelectFecha(event: any) {
    
    const mes = format(event, 'M')
    const anio = format(event, 'Y')

    const newFecha = mes+'/02/'+anio+''.replace('/', ' ') // Importante reemplazarlo por un espacio

    this.fechaexcel = new Date(newFecha) // Funciona

    this.MesConsulta = +mes
    
    this.sharedService.cambiarEstado(true)
    this.timeSheetService.getTimeSheetsPorFecha(+mes, +anio)
      .pipe(
        finalize(() => {
          this.sharedService.cambiarEstado(false)
        })
      )
      .subscribe(({data}) => {
        this.data = data.map(timesheet => ({
          timesheet,
          participacion: this.proyectos.map((proyecto, index) => {

            const key = timesheet.proyectos.findIndex(({idProyecto}) => idProyecto === proyecto.id)
            let costo = 0
            if(key >= 0) {
              //console.log("timesheet.proyectos[key].tDedicacion: "+timesheet.proyectos[key].costo)
              costo += Math.round(timesheet.proyectos[key].costo)
              //console.log("timesheet.otros[key].tDedicacion: "+timesheet.otros[key].)
              //dedicacion += timesheet.otros[key].tDedicacion
              this.proyectos[index].costo += Math.round(costo)

                

            }
            return {
              id:         proyecto.id,
              nombre:     proyecto.nombre,
              costo
            }
          })
        }))

        /*this.data = data.map(timesheet => ({
          timesheet,
          participacion: this.proyectos.map((proyecto, index) => {

            const key = timesheet.proyectos.findIndex(({idProyecto}) => idProyecto === proyecto.id)
            let dedicacion = 0
            if(key >= 0) {
              //console.log("timesheet.proyectos[key].tDedicacion: "+timesheet.proyectos[key].tDedicacion)
              dedicacion += timesheet.proyectos[key].tDedicacion
              //console.log("timesheet.otros[key].tDedicacion: "+timesheet.otros[key].tDedicacion)
              //dedicacion += timesheet.otros[key].tDedicacion
              this.proyectos[index].dedicacion += dedicacion

                

            }
            return {
              id:         proyecto.id,
              nombre:     proyecto.nombre,
              dedicacion
            }
          })
        }))*/
        // console.log(this.proyectos)
      })
  }
  
  exportJsonToExcel() {

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Detalle');
    
    // Tìtulos
    this._setXLSXTitles(worksheet)

    this._setXLSXHeader(worksheet)
    
    let row = 8

    row = this._setXLSXContent(worksheet, row)

    this._setXSLXFooter(worksheet, row)

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      saveAs(blob, `Summary_${Date.now()}${EXCEL_EXTENSION}`);
    });
  }

  _setXLSXTitles(worksheet: ExcelJS.Worksheet) {

    worksheet.getCell('G1').value = 'BOVIS - Control Mensual de Tiempos - '
    worksheet.getCell('G2').value = 'Resumen Mensual'

    worksheet.getCell('G4').value = 'Mes'
    worksheet.getCell('H4').value = format(this.fechaexcel, 'LLLL Y', { locale: es })

    worksheet.getCell('G5').value = `Rev. 83- ${format(Date.now(), 'dd/MM/Y')}`

    worksheet.getCell('K1').value = `Nota: cada responsable debe filtrar la columna ""Responsable"" y completar la asignación de tiempo exclusivamente para los empleados que aparecen bajo su responsabilidad.
    NO AÑADIR O ELIMINAR FILAS O COLUMNAS NI CAMBIAR LA ESTRUCTURA DE LA HOJA EN MODO ALGUNO NI CAMBIAR FORMATOS NI MODIFICAR FORMULAS NI CONTENIDOS.
    Al terminar, guardar la hoja añadiendo al nombre las iniciales del Responsable y enviar`

    worksheet.mergeCells('K1:V2');

    const mergedCell = worksheet.getCell('K1');
    mergedCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };  
  }

  _setXLSXHeader(worksheet: ExcelJS.Worksheet) {
    
    const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4681CB' } };
    const fill_baja: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ea899a' } };

    worksheet.getCell('A7').value = 'Count'	

    worksheet.getCell('B7').value = 'COI'	
    worksheet.getCell('B7').fill = fill
    worksheet.getCell('C7').value = 'NOI'	
    worksheet.getCell('C7').fill = fill
    worksheet.getCell('D7').value = 'CVE'	
    worksheet.getCell('D7').fill = fill	
    worksheet.getCell('E7').value = 'Número de empleado (Timesheet de Alma)'
    worksheet.getCell('E7').fill = fill
    worksheet.getCell('F7').value = '3'		
    worksheet.getCell('F7').fill = fill	
    worksheet.getCell('G7').value = 'Employee Name'	
    worksheet.getCell('G7').fill = fill
    worksheet.getCell('H7').value = 'Responsable'	
    worksheet.getCell('H7').fill = fill
    worksheet.getCell('I7').value = 'Total (%)'
    worksheet.getCell('I7').fill = fill
    worksheet.getCell('J7').value = 'Baja'
    worksheet.getCell('J7').fill = fill_baja

    let indice = 11
    this.proyectos.forEach((proyecto, index) => {
      
      let cell = worksheet.getCell(6, indice);
      worksheet.getCell(6, indice).value = proyecto.id
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF009821' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };  

      worksheet.getCell(7, indice).value = proyecto.nombre
      cell = worksheet.getCell(7, indice);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF84CA53' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };  
      
      indice++
    })

   
  }

  _setXLSXContent(worksheet: ExcelJS.Worksheet, row: number): number {

    this.data.forEach(record => {

      let totalTimesheet = 0

      //ATC

        

      let total = 0
      record.timesheet.proyectos.forEach(proyecto => {
        //total += Math.round(proyecto.tDedicacion)
        total += Math.round(proyecto.costo)
      })


      
      //se comenta por que no existe costo en otros
  
      /*record.timesheet.otros.forEach(proyecto => {
        //total += Math.round(proyecto.tDedicacion)
        total += Math.round(proyecto.tDedicacion)
      })*/
  
      //console.log("Valor de suma porcentajes: " + total)
    

      /*record.participacion.forEach((otros) => {
        console.log("+otros.dedicacion: "+ this.totalPorcentaje())
        totalTimesheet += +otros.dedicacion
        
      })*/


        //console.log("this.getDecimal(Math.round(total)) "+ this.getDecimal(Math.round(total)))
        //console.log("Math.round(total) "+ Math.round(total))
        //console.log("total "+ total)
        this.getDecimal(Math.round(total))

        if(this.getDecimal(Math.round(total)) == 0){

          //console.log("ES IGUAL QUE 0: "+ this.getDecimal(Math.round(total)))
          record.participacion.forEach((proyecto, index) => {
            worksheet.getColumn(11 + index).width = 15
            //console.log("this.getDecimal(this.formateaValor(Math.round(proyecto.costo))) "+ this.getDecimal(this.formateaValor(Math.round(proyecto.costo))))
            worksheet.getCell(row, 11 + index).value = this.getDecimal(this.formateaValor(Math.round(proyecto.costo))) || ''
            worksheet.getCell(row, 11 + index).numFmt = '0%';
            totalTimesheet += +proyecto.costo 
            
          })
        
        worksheet.getCell(row, 1).value = 1
        worksheet.getCell(row, 2).value = record.timesheet.coi_empresa
        worksheet.getCell(row, 3).value = record.timesheet.noi_empresa
        worksheet.getCell(row, 4).value = record.timesheet.noi_empleado
        worksheet.getCell(row, 5).value = record.timesheet.num_empleado
        worksheet.getCell(row, 6).value = 1
        worksheet.getCell(row, 7).value = record.timesheet.empleado
        worksheet.getCell(row, 8).value = record.timesheet.responsable
       // worksheet.getCell(row, 9).value = this.getDecimal(totalTimesheet)
        worksheet.getCell(row, 9).value = this.getDecimal(Math.round(total))
        //worksheet.getCell(row, 9).value = Math.round(total)
        worksheet.getCell(row, 9).numFmt = '0%';
        if(this.esElmismomes(record.timesheet.dtfecha_salida)){
          worksheet.getCell(row, 10).value = 'SI'
        }else{
           worksheet.getCell(row, 10).value = 'NO'
        }
        }else{

          if(this.getDecimal(Math.round(total)) == 1){
           // console.log("ES IGUAL QUE 100: "+ this.getDecimal(Math.round(total)))
            record.participacion.forEach((proyecto, index) => {
              worksheet.getColumn(11 + index).width = 15
              worksheet.getCell(row, 11 + index).value = this.getDecimal(this.formateaValor(Math.round(proyecto.costo))) || ''
              worksheet.getCell(row, 11 + index).numFmt = '0%';
              totalTimesheet += +proyecto.costo 
              
            })
          
          worksheet.getCell(row, 1).value = 1
          worksheet.getCell(row, 2).value = record.timesheet.coi_empresa
          worksheet.getCell(row, 3).value = record.timesheet.noi_empresa
          worksheet.getCell(row, 4).value = record.timesheet.noi_empleado
          worksheet.getCell(row, 5).value = record.timesheet.num_empleado
          worksheet.getCell(row, 6).value = 1
          worksheet.getCell(row, 7).value = record.timesheet.empleado
          worksheet.getCell(row, 8).value = record.timesheet.responsable
         // worksheet.getCell(row, 9).value = this.getDecimal(totalTimesheet)
          worksheet.getCell(row, 9).value = this.getDecimal(Math.round(total))
          //worksheet.getCell(row, 9).value = Math.round(total)
          worksheet.getCell(row, 9).numFmt = '0%';
          if(this.esElmismomes(record.timesheet.dtfecha_salida)){
            worksheet.getCell(row, 10).value = 'SI'
          }else{
             worksheet.getCell(row, 10).value = 'NO'
          }
          }else{
            if(this.getDecimal(Math.round(total)) > 1){
              //console.log("this.getDecimal(Math.round(total)) "+ this.getDecimal(Math.round(total)))
              //console.log("Math.round(total) "+ Math.round(total))
              //console.log("total "+ total)
              //console.log("ES MAYOR QUE 100: "+ this.getDecimal(Math.round(total-1)))

              if(this.masde100 > 0){

                record.participacion.forEach((proyecto, index) => {
                  worksheet.getColumn(11 + index).width = 15
                  //console.log("this.getDecimal(this.formateaValor(Math.round(proyecto.costo))) "+ this.getDecimal(this.formateaValor(Math.round(proyecto.costo))))
                  worksheet.getCell(row, 11 + index).value = this.getDecimal(this.formateaValor(Math.round(proyecto.costo))) || ''
                  worksheet.getCell(row, 11 + index).numFmt = '0%';
                  totalTimesheet += +proyecto.costo 
                  
                })
              
                worksheet.getCell(row, 1).value = 1
                worksheet.getCell(row, 2).value = record.timesheet.coi_empresa
                worksheet.getCell(row, 3).value = record.timesheet.noi_empresa
                worksheet.getCell(row, 4).value = record.timesheet.noi_empleado
                worksheet.getCell(row, 5).value = record.timesheet.num_empleado
                worksheet.getCell(row, 6).value = 1
                worksheet.getCell(row, 7).value = record.timesheet.empleado
                worksheet.getCell(row, 8).value = record.timesheet.responsable
               // worksheet.getCell(row, 9).value = this.getDecimal(totalTimesheet)
                worksheet.getCell(row, 9).value = this.getDecimal(Math.round(total))
                //worksheet.getCell(row, 9).value = Math.round(total)
                worksheet.getCell(row, 9).numFmt = '0%';
                if(this.esElmismomes(record.timesheet.dtfecha_salida)){
                  worksheet.getCell(row, 10).value = 'SI'
                }else{
                   worksheet.getCell(row, 10).value = 'NO'
                }

              }else{

                record.participacion.forEach((proyecto, index) => {
                  worksheet.getColumn(11 + index).width = 15
                  //console.log("this.getDecimal(this.formateaValor(Math.round(proyecto.costo))) "+ this.getDecimal(this.formateaValor(Math.round(proyecto.costo))))
                  if(this.masde100 > 0){
                    //if(proyecto.costo > 0.05){

                      worksheet.getCell(row, 11 + index).value = this.getDecimal(this.formateaValor(Math.round(proyecto.costo))) || ''
                      worksheet.getCell(row, 11 + index).numFmt = '0%';

                     // this.menosde100++
                   // }

                  }else{
                    if(proyecto.costo > 0.05){

                      worksheet.getCell(row, 11 + index).value = this.getDecimal(this.formateaValor(Math.round(proyecto.costo-1))) || ''
                      worksheet.getCell(row, 11 + index).numFmt = '0%';

                      this.masde100++
                    }
                  }
                  
                  
                  totalTimesheet += +proyecto.costo 
                  
                })
              
                worksheet.getCell(row, 1).value = 1
                worksheet.getCell(row, 2).value = record.timesheet.coi_empresa
                worksheet.getCell(row, 3).value = record.timesheet.noi_empresa
                worksheet.getCell(row, 4).value = record.timesheet.noi_empleado
                worksheet.getCell(row, 5).value = record.timesheet.num_empleado
                worksheet.getCell(row, 6).value = 1
                worksheet.getCell(row, 7).value = record.timesheet.empleado
                worksheet.getCell(row, 8).value = record.timesheet.responsable
               // worksheet.getCell(row, 9).value = this.getDecimal(totalTimesheet)
                worksheet.getCell(row, 9).value = this.getDecimal(Math.round(total-1))
                //worksheet.getCell(row, 9).value = Math.round(total)
                worksheet.getCell(row, 9).numFmt = '0%';
                if(this.esElmismomes(record.timesheet.dtfecha_salida)){
                  worksheet.getCell(row, 10).value = 'SI'
                }else{
                   worksheet.getCell(row, 10).value = 'NO'
                }

              }

            }else{
              if(this.getDecimal(Math.round(total)) < 1){
                //console.log("this.getDecimal(Math.round(total)) "+ this.getDecimal(Math.round(total)))
                //console.log("Math.round(total) "+ Math.round(total))
                //console.log("total "+ total)
                //console.log("ES MENOR QUE 100: "+ this.getDecimal(Math.round(total+1)))

                if(this.menosde100 > 0){

                  record.participacion.forEach((proyecto, index) => {
                    worksheet.getColumn(11 + index).width = 15
                    //console.log("this.getDecimal(this.formateaValor(Math.round(proyecto.costo))) "+ this.getDecimal(this.formateaValor(Math.round(proyecto.costo))))
                    worksheet.getCell(row, 11 + index).value = this.getDecimal(this.formateaValor(Math.round(proyecto.costo))) || ''
                    worksheet.getCell(row, 11 + index).numFmt = '0%';
                    totalTimesheet += +proyecto.costo 
                    
                  })
                
                  worksheet.getCell(row, 1).value = 1
                  worksheet.getCell(row, 2).value = record.timesheet.coi_empresa
                  worksheet.getCell(row, 3).value = record.timesheet.noi_empresa
                  worksheet.getCell(row, 4).value = record.timesheet.noi_empleado
                  worksheet.getCell(row, 5).value = record.timesheet.num_empleado
                  worksheet.getCell(row, 6).value = 1
                  worksheet.getCell(row, 7).value = record.timesheet.empleado
                  worksheet.getCell(row, 8).value = record.timesheet.responsable
                 // worksheet.getCell(row, 9).value = this.getDecimal(totalTimesheet)
                  worksheet.getCell(row, 9).value = this.getDecimal(Math.round(total))
                  //worksheet.getCell(row, 9).value = Math.round(total)
                  worksheet.getCell(row, 9).numFmt = '0%';
                  if(this.esElmismomes(record.timesheet.dtfecha_salida)){
                    worksheet.getCell(row, 10).value = 'SI'
                  }else{
                     worksheet.getCell(row, 10).value = 'NO'
                  }

                }else{

                  record.participacion.forEach((proyecto, index) => {
                    worksheet.getColumn(11 + index).width = 15
                    //console.log("this.getDecimal(this.formateaValor(Math.round(proyecto.costo))) "+ this.getDecimal(this.formateaValor(Math.round(proyecto.costo))))
                    if(this.menosde100 > 0){
                      //if(proyecto.costo > 0.05){

                        worksheet.getCell(row, 11 + index).value = this.getDecimal(this.formateaValor(Math.round(proyecto.costo))) || ''
                        worksheet.getCell(row, 11 + index).numFmt = '0%';
  
                       // this.menosde100++
                     // }

                    }else{
                      if(proyecto.costo > 0.05){

                        worksheet.getCell(row, 11 + index).value = this.getDecimal(this.formateaValor(Math.round(proyecto.costo+1))) || ''
                        worksheet.getCell(row, 11 + index).numFmt = '0%';
  
                        this.menosde100++
                      }
                    }
                    
                    
                    totalTimesheet += +proyecto.costo 
                    
                  })
                
                  worksheet.getCell(row, 1).value = 1
                  worksheet.getCell(row, 2).value = record.timesheet.coi_empresa
                  worksheet.getCell(row, 3).value = record.timesheet.noi_empresa
                  worksheet.getCell(row, 4).value = record.timesheet.noi_empleado
                  worksheet.getCell(row, 5).value = record.timesheet.num_empleado
                  worksheet.getCell(row, 6).value = 1
                  worksheet.getCell(row, 7).value = record.timesheet.empleado
                  worksheet.getCell(row, 8).value = record.timesheet.responsable
                 // worksheet.getCell(row, 9).value = this.getDecimal(totalTimesheet)
                  worksheet.getCell(row, 9).value = this.getDecimal(Math.round(total+1))
                  //worksheet.getCell(row, 9).value = Math.round(total)
                  worksheet.getCell(row, 9).numFmt = '0%';
                  if(this.esElmismomes(record.timesheet.dtfecha_salida)){
                    worksheet.getCell(row, 10).value = 'SI'
                  }else{
                     worksheet.getCell(row, 10).value = 'NO'
                  }

                }

                            
                
              }
            }
          }

        }

        


        

      worksheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.esElmismomes(record.timesheet.dtfecha_salida) ? 'ea899a' : 'ffffff' } };
      row++
      this.menosde100 = 0
      this.masde100 = 0
    });

    return row
  }

  _setXSLXFooter(worksheet: ExcelJS.Worksheet, row: number) {
    let indice = 11
    this.proyectos.forEach((proyecto, index) => {

     // worksheet.getCell(row, indice).value = this.getDecimal(Math.round(proyecto.costo))
      worksheet.getCell(row, indice).value = Math.round(proyecto.costo)
      worksheet.getCell(row, indice).numFmt = '0%';
      
      indice++
    })
  }

  getDecimal(value: number) {
    return (value / 100)
  }

  formatPercentage(worksheet: XLSX.WorkSheet, row: number, col: number) {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
    const cell = worksheet[cellRef];
    
    cell.t = 'n';
    cell.z = PERCENTAGE_FORMAT;
  }

  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

  buscarempleados(event: any) {
    this.sharedService.cambiarEstado(false)
    const id = event

    if(id === null){
      return ;
      
    }else{
     var arr = event.value.split('-'); //Note the space as well
      //console.log(arr); //Yields ["Apples", "Bananas", "Cherries"]
      return arr;
     
    }

    
  }

  esElmismomes(fechacancela: string): boolean {
    //console.log("fechaemi: " + fechaemi);
    //console.log("fechacancela: " + fechacancela);
    //let mdyEmi: String[] = fechaemi.split('-');

    //console.log("Number(mdy[1]) - 1: " + (Number(mdyEmi[1])));
    //let fIni: Date = this.parseDate(fechaemi);

    if (fechacancela == null || fechacancela == "") {
      // return true;

      // Number(mdy[1])+""
      if (this.MesConsulta == 0) {
        return true;
      } else {
        return false;
      }
    } else {

      let mdyCancela: String[] = fechacancela.split('-');

      // console.log("Number(mdy[1]) - 1: " + (Number(mdyCancela[1])));
      let fFin: Date = this.parseDate(fechacancela);
      if (this.MesConsulta == (Number(mdyCancela[1]))) {
        return true;
      } else {
        return false;
      }

    }
  }

  parseDate(str: string): Date {
    let mdy: String[] = str.split('-');
    return new Date(Number(mdy[0]), Number(mdy[1]), Number(mdy[2]));
  }

}
