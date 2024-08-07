import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CostosRoutingModule } from './costos-routing.module';
import { CostoEmpleadoComponent } from './components/costo-empleado/costo-empleado.component';
import { CostoProyectoComponent } from './components/costo-proyecto/costo-proyecto.component';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { CapturaBeneficiosComponent } from './components/captura-beneficios/captura-beneficios.component';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


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
    FormsModule,
    ButtonModule,
    ToolbarModule,
    TagModule,
    ProgressSpinnerModule,
    CalendarModule
    
  ]
})
export class CostosModule { }
