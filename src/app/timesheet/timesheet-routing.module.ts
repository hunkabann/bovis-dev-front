import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CargarHorasComponent } from './views/cargar-horas/cargar-horas.component';
import { ConsultarComponent } from './views/consultar/consultar.component';
import { SummaryComponent } from './views/summary/summary.component';
import { ModificarComponent } from './views/modificar/modificar.component';

const routes: Routes = [
  {
    path: 'cargar-horas',
    component: CargarHorasComponent
  },
  {
    path: 'cargar-horas/:id',
    component: ModificarComponent
  },
  {
    path: 'consultar',
    component: ConsultarComponent
  },
  {
    path: 'summary',
    component: SummaryComponent
  },
  {
    path: '**',
    redirectTo: 'cargar-horas'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimesheetRoutingModule { }
