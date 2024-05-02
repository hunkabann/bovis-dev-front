import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CostosRoutingModule } from './costos-routing.module';
import { CostoEmpleadoComponent } from './components/costo-empleado/costo-empleado.component';
import { CostoProyectoComponent } from './components/costo-proyecto/costo-proyecto.component';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { HttpClientModule } from '@angular/common/http';
import { CapturaBeneficiosComponent } from './components/captura-beneficios/captura-beneficios.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';


@NgModule({
  declarations: [
    CostoEmpleadoComponent,
    CostoProyectoComponent,
    CapturaBeneficiosComponent
  ],
  imports: [
    CommonModule,
    CostosRoutingModule,
    TableModule,
    ToastModule,
    HttpClientModule,
    ReactiveFormsModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    ToolbarModule
  ]
})
export class CostosModule { }
