import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogosComponent } from './container/catalogos.component';
import { ViaticosComponent } from './components/viaticos/viaticos.component';
import { MsalGuard, MsalInterceptor } from '@azure/msal-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CatalogosGeneralesComponent } from './components/catalogos-generales/catalogos-generales.component';
import { DiasTimesheetComponent } from '../timesheet/views/dias-timesheet/dias-timesheet.component';
import { PrincipalComponent } from './components/clientes/principal/principal.component';

const routes: Routes = [
  { path: '', component: CatalogosComponent },
  { path: 'cat_viaticos', component: ViaticosComponent },
  { path: 'cat_beneficios', component: CatalogosGeneralesComponent },
  { path: 'cat_clasificacion', component: CatalogosGeneralesComponent },
  { path: 'cat_clientes', component: PrincipalComponent },
  { path: 'cat_categoria', component: CatalogosGeneralesComponent },
  { path: 'cat_costos_indirectos_salarios', component: CatalogosGeneralesComponent },
  { path: 'cat_departamento', component: CatalogosGeneralesComponent },
  { path: 'cat_estatus_proyecto', component: CatalogosGeneralesComponent },
  { path: 'cat_ingreso', component: CatalogosGeneralesComponent },
  { path: 'cat_nivel_puesto', component: CatalogosGeneralesComponent },
  { path: 'cat_prestacion', component: CatalogosGeneralesComponent },
  { path: 'cat_rubro_ingreso', component: CatalogosGeneralesComponent },
  { path: 'cat_sector', component: CatalogosGeneralesComponent },
  { path: 'cat_cie', component: CatalogosGeneralesComponent },
  { path: 'cat_tipo_cuenta', component: CatalogosGeneralesComponent },
  { path: 'cat_tipo_documento', component: CatalogosGeneralesComponent },
  { path: 'cat_habilidad', component: CatalogosGeneralesComponent },
  { path: 'cat_experiencia', component: CatalogosGeneralesComponent },
  { path: 'cat_profesion', component: CatalogosGeneralesComponent },
  { path: 'cat_dias', component: DiasTimesheetComponent },
  { path: 'cat_cta_contable', component: CatalogosGeneralesComponent }
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
export class CatalogosRoutingModule { }
