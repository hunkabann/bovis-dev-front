import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuditoriaCalidadComponent } from './views/auditoria-calidad/auditoria-calidad.component';
import { SeleccionarDocumentosComponent as SeleccionarCalidad } from './components/auditoria-calidad/seleccionar-documentos/seleccionar-documentos.component';
import { CargarDocumentosComponent as CargarCalidad } from './components/auditoria-calidad/cargar-documentos/cargar-documentos.component';
import { SeguimientoComponent as SeguimientoCalidad } from './components/auditoria-calidad/seguimiento/seguimiento.component';

const routes: Routes = [
  {
    path: '',
    component: AuditoriaCalidadComponent,
    children: [
      {
        path: 'seleccionar',
        component: SeleccionarCalidad
      },
      {
        path: 'cargar',
        component: CargarCalidad
      },
      {
        path: 'seguimiento',
        component: SeguimientoCalidad
      },
      {
        path: '**',
        redirectTo: 'seleccionar',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditoriaRoutingModule { }
