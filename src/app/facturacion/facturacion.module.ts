import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import { FacturacionService } from './services/facturacion.service';
import { ConfirmationService, MessageService } from 'primeng/api';

import { FacturacionRoutingModule } from './facturacion-routing.module';
import { PrimengModule } from '../shared/primeng.module';

import { FacturacionComponent } from './container/facturacion.component';
import { UploadFileComponent } from './components/upload-file/upload-file.component';
import { NotaCreditoComponent } from './components/nota-credito/nota-credito.component';
import { FacturaCrpComponent } from './components/factura-crp/factura-crp.component';
import { BusquedaCancelacionComponent } from './components/busqueda-cancelacion/busqueda-cancelacion.component';
import { BadgeModule } from 'primeng/badge';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { NotaCreditoSinFacturaComponent } from './components/nota-credito-sin-factura/nota-credito-sin-factura.component';
import { VincularNotaCreditoComponent } from './components/vincular-nota-credito/vincular-nota-credito.component';

@NgModule({
  declarations: [
    FacturacionComponent,
    UploadFileComponent,
    NotaCreditoComponent,
    FacturaCrpComponent,
    BusquedaCancelacionComponent,
    NotaCreditoSinFacturaComponent,
    VincularNotaCreditoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FacturacionRoutingModule,
    HttpClientModule,
    PrimengModule,
    BadgeModule,
    InputTextareaModule,
    ReactiveFormsModule,
    MessagesModule
  ],
  providers: [
    ConfirmationService,
    FacturacionService,
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class FacturacionModule { }
