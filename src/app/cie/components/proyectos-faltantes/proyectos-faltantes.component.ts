import { Component, OnInit, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-proyectos-faltantes',
  templateUrl: './proyectos-faltantes.component.html',
  styleUrls: ['./proyectos-faltantes.component.css']
})
export class ProyectosFaltantesComponent implements OnInit {

  ref                 = inject(DynamicDialogRef)
  config              = inject(DynamicDialogConfig)

  proyectosFaltantes: string[] = []

  constructor() { }

  ngOnInit(): void {
    if(this.config.data) {
      this.proyectosFaltantes = this.config.data.proyectos
    }
  }

}
