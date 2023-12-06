import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DorRoutingModule } from './dor-routing.module';
import { DorComponent } from './container/dor.component';
import { DorCrudComponent } from './components/dor-crud/dor-crud.component';
// import { NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';

import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import { DorService } from './Services/dor.service';
import { DorCapturaComponent } from './components/dor-captura/dor-captura.component';
import { TooltipModule } from 'primeng/tooltip';
import { DorObjetivosComponent } from './components/dor-objetivos/dor-objetivos.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DorEvaluacionComponent } from './components/dor-evaluacion/dor-evaluacion.component';
import { DorEvaluacionNuevoComponent } from './components/dor-evaluacion-nuevo/dor-evaluacion-nuevo.component';
import { CalendarModule } from 'primeng/calendar';
import { CalcularMetaPipe } from './pipes/calcular-meta.pipe';
import { CalcularResultadoPipe } from './pipes/calcular-resultado.pipe';
import { ToolbarModule } from 'primeng/toolbar';
import { CalcularResultadoObjetivosPipe } from './pipes/calcular-resultado-objetivos.pipe';

@NgModule({
  declarations: [
    DorComponent,
    DorCrudComponent,
    DorCapturaComponent,
    DorObjetivosComponent,
    DorEvaluacionComponent,
    DorEvaluacionNuevoComponent,
    CalcularMetaPipe,
    CalcularResultadoPipe,
    CalcularResultadoObjetivosPipe
  ],
  imports: [
    CommonModule,
    DorRoutingModule,
    FormsModule,
    ConfirmPopupModule,
    ToastModule,
    DropdownModule,
    ProgressBarModule,
    InputTextModule,
    InputNumberModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    ToolbarModule,
    ConfirmDialogModule,
    MessagesModule,
    MessageModule,
    DialogModule,
    InputTextareaModule,
    CalendarModule
  ],
  providers: [ConfirmationService, MessageService, DorService]
})
export class DorModule { }
