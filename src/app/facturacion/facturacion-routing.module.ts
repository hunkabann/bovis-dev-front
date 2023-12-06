import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturacionComponent } from './container/facturacion.component';
import { UploadFileComponent } from './components/upload-file/upload-file.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MsalInterceptor } from '@azure/msal-angular';
import { NotaCreditoComponent } from './components/nota-credito/nota-credito.component';
import { FacturaCrpComponent } from './components/factura-crp/factura-crp.component';
import { BusquedaCancelacionComponent } from './components/busqueda-cancelacion/busqueda-cancelacion.component';
import { NotaCreditoSinFacturaComponent } from './components/nota-credito-sin-factura/nota-credito-sin-factura.component';

const routes: Routes = [
  { path: '', component: FacturacionComponent },
  { path: 'carga-cfdi', component: UploadFileComponent },
  { path: 'nota-credito', component: NotaCreditoComponent },
  { path: 'nota-credito-sin-factura', component: NotaCreditoSinFacturaComponent },
  { path: 'crp', component: FacturaCrpComponent },
  { path: 'cancelacion', component: BusquedaCancelacionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: MsalInterceptor,
    multi: true
  },],
})
export class FacturacionRoutingModule { }
