import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-carga-horas',
  templateUrl: './carga-horas.component.html',
  styleUrls: ['./carga-horas.component.css']
})
export class CargaHorasComponent implements OnInit {

  isConsulta: boolean = false;
  hoy!: Date;
  mes!: Date;
  minDate!: Date;
  maxDate!: Date;

  constructor(private config: PrimeNGConfig) { }

  ngOnInit(): void {
    this.getConfigCalendar();
    this.hoy = new Date();
 
  // Mes seleccionado por defecto (mes actual)
  this.mes = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), 1);
 
  // Quita el año pasado
  this.minDate = new Date(this.hoy.getFullYear(), 0, 1);
 
  // No permitir meses futuros
  this.maxDate = this.hoy;
  }

  getConfigCalendar() {
    this.config.setTranslation({
      firstDayOfWeek: 1,
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
      today: 'Hoy',
      clear: 'Limpiar',
    });
  }

}

