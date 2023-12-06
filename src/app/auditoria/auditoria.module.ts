import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuditoriaRoutingModule } from './auditoria-routing.module';
import { AuditoriaLegalComponent } from './views/auditoria-legal/auditoria-legal.component';
import { AuditoriaCalidadComponent } from './views/auditoria-calidad/auditoria-calidad.component';
import { SeleccionarDocumentosComponent } from './components/auditoria-calidad/seleccionar-documentos/seleccionar-documentos.component';
import { CargarDocumentosComponent } from './components/auditoria-calidad/cargar-documentos/cargar-documentos.component';
import { SeguimientoComponent } from './components/auditoria-calidad/seguimiento/seguimiento.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FileUploadModule } from 'primeng/fileupload';
import { SubirArchivoComponent } from './components/auditoria-calidad/subir-archivo/subir-archivo.component';
import { VerDocumentosComponent } from './components/ver-documentos/ver-documentos.component';
import { TableModule } from 'primeng/table';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    AuditoriaLegalComponent,
    AuditoriaCalidadComponent,
    SeleccionarDocumentosComponent,
    CargarDocumentosComponent,
    SeguimientoComponent,
    SubirArchivoComponent,
    VerDocumentosComponent
  ],
  imports: [
    CommonModule,
    AuditoriaRoutingModule,
    TabMenuModule,
    ToastModule,
    FormsModule,
    ReactiveFormsModule,
    DividerModule,
    CheckboxModule,
    DropdownModule,
    InputSwitchModule,
    FileUploadModule,
    TableModule,
    SharedModule
  ]
})
export class AuditoriaModule { }
