import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CostosRoutingModule } from './costos-routing.module';
import { CostoEmpleadoComponent } from './components/costo-empleado/costo-empleado.component';
import { CostoProyectoComponent } from './components/costo-proyecto/costo-proyecto.component';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    CostoEmpleadoComponent,
    CostoProyectoComponent
  ],
  imports: [
    CommonModule,
    CostosRoutingModule,
    TableModule,
    ToastModule,
    HttpClientModule
  ]
})
export class CostosModule { }
