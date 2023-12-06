import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportesRoutingModule } from './reportes-routing.module';
import { ListaComponent } from './components/lista/lista.component';
import { RegistroComponent } from './components/registro/registro.component';
import { EjecucionComponent } from './components/ejecucion/ejecucion.component';
import { ToastModule } from 'primeng/toast';
import { HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';


@NgModule({
  declarations: [
    ListaComponent,
    RegistroComponent,
    EjecucionComponent
  ],
  imports: [
    CommonModule,
    ReportesRoutingModule,
    ToastModule,
    HttpClientModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule
  ]
})
export class ReportesModule { }
