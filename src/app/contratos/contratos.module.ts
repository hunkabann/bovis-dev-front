import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContratosRoutingModule } from './contratos-routing.module';
import { PlantillasComponent } from './plantillas/plantillas.component';
import { RegistroPlantillaComponent } from './registro-plantilla/registro-plantilla.component';
import { ToastModule } from 'primeng/toast';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { PintarValorPipe } from './pipes/pintar-valor.pipe';

import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';



@NgModule({
  declarations: [
    PlantillasComponent,
    RegistroPlantillaComponent,
    PintarValorPipe
  ],
  imports: [
    CommonModule,
    ContratosRoutingModule,
    ToastModule,
    InputTextModule,
    EditorModule,
    ToolbarModule,
    TableModule,
    InputSwitchModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ReactiveFormsModule,
    HttpClientModule,
    InputNumberModule,
    DropdownModule,
    FormsModule,
    TagModule,
    ProgressSpinnerModule,
    CalendarModule
  ],
  exports: [
    PintarValorPipe
  ]
})
export class ContratosModule { }
