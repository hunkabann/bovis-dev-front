import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimesheetRoutingModule } from './timesheet-routing.module';
import { CargarHorasComponent } from './views/cargar-horas/cargar-horas.component';
import { ConsultarComponent } from './views/consultar/consultar.component';
import { PrimengModule } from '../shared/primeng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProyectoJoinPipe } from './pipes/proyecto-join.pipe';
import { SummaryComponent } from './views/summary/summary.component';
import { ModificarComponent } from './views/modificar/modificar.component';
import { SumaPorcentajesPipe } from './pipes/suma-porcentajes.pipe';
import { AgregarProyectoComponent } from './views/agregar-proyecto/agregar-proyecto.component';
import { DiasTimesheetComponent } from './views/dias-timesheet/dias-timesheet.component';
import { ModificarFeriadosComponent } from './components/modificar-feriados/modificar-feriados.component';


@NgModule({
  declarations: [
    CargarHorasComponent,
    ConsultarComponent,
    ProyectoJoinPipe,
    SummaryComponent,
    ModificarComponent,
    SumaPorcentajesPipe,
    AgregarProyectoComponent,
    DiasTimesheetComponent,
    ModificarFeriadosComponent
  ],
  imports: [
    CommonModule,
    TimesheetRoutingModule,
    PrimengModule,
    ReactiveFormsModule,
    FormsModule,
    RadioButtonModule
  ]
})
export class TimesheetModule { }
