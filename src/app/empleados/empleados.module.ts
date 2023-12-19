import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadosRoutingModule } from './empleados-routing.module';
import { EmpleadosComponent } from './container/empleados.component';
import { EmpleadosRegistroComponent } from './components/empleados-registro/empleados-registro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ToastModule } from "primeng/toast";
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from "primeng/api";
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
import { PersonaRegistroComponent } from './components/persona-registro/persona-registro.component';
import { MessagesModule } from 'primeng/messages';
import { EmpleadosPrincipalComponent } from './components/empleados-principal/empleados-principal.component';
import { GenerarRequerimientoComponent } from './components/generar-requerimiento/generar-requerimiento.component';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { RequerimientosComponent } from './components/requerimientos/requerimientos.component';
import { TableModule } from 'primeng/table';
import { ModificarRequerimientoComponent } from './components/modificar-requerimiento/modificar-requerimiento.component';
import { ToolbarModule } from 'primeng/toolbar';
import { FullNamePipe } from './pipes/full-name.pipe';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ContratosComponent } from './components/contratos/contratos.component';
import { ContratosRegistroComponent } from './components/contratos-registro/contratos-registro.component';
import { EditorModule } from 'primeng/editor';
import { TagModule } from 'primeng/tag';
import { MostrarProyectosComponent } from './components/mostrar-proyectos/mostrar-proyectos.component';
import { ContratosModule } from '../contratos/contratos.module';

@NgModule({
  declarations: [
    EmpleadosComponent,
    EmpleadosRegistroComponent,
    PersonaRegistroComponent,
    EmpleadosPrincipalComponent,
    GenerarRequerimientoComponent,
    RequerimientosComponent,
    ModificarRequerimientoComponent,
    FullNamePipe,
    ContratosComponent,
    ContratosRegistroComponent,
    MostrarProyectosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EmpleadosRoutingModule,
    ConfirmPopupModule,
    ToastModule,
    DropdownModule,
    ProgressBarModule,
    CalendarModule,
    AccordionModule,
    MessagesModule,
    InputTextModule,
    MultiSelectModule,
    InputNumberModule,
    CheckboxModule,
    TableModule,
    ToolbarModule,
    ReactiveFormsModule,
    InputSwitchModule,
    DialogModule,
    RadioButtonModule,
    InputTextareaModule,
    EditorModule,
    TagModule,
    ContratosModule
  ],
  exports:[

  ],
  providers: [ConfirmationService, MessageService]
})
export class EmpleadosModule { }
