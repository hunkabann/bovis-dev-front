import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DorComponent } from './container/dor.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MsalGuard, MsalInterceptor } from '@azure/msal-angular';
import { DorCapturaComponent } from './components/dor-captura/dor-captura.component';
import { DorObjetivosComponent } from './components/dor-objetivos/dor-objetivos.component';
import { DorEvaluacionNuevoComponent } from './components/dor-evaluacion-nuevo/dor-evaluacion-nuevo.component';

const routes: Routes = [
  { path: '', component: DorComponent },
  { path: 'captura', component: DorCapturaComponent, canActivate: [MsalGuard] },
  { path: 'evaluacion', component: DorEvaluacionNuevoComponent, canActivate: [MsalGuard] },
  //{ path: 'evaluacion', component: DorEvaluacionComponent, canActivate: [MsalGuard] },
  { path: 'objetivos', component: DorObjetivosComponent, canActivate: [MsalGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: MsalInterceptor,
    multi: true
  },],
  exports: [RouterModule]
})
export class DorRoutingModule { }
