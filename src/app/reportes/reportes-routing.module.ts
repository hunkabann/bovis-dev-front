import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaComponent } from './components/lista/lista.component';
import { RegistroComponent } from './components/registro/registro.component';
import { EjecucionComponent } from './components/ejecucion/ejecucion.component';

const routes: Routes = [
  {path: 'lista', component: ListaComponent},
  {path: 'registro', component: RegistroComponent},
  {path: 'registro/:id', component: RegistroComponent},
  {path: 'ejecucion/:id', component: EjecucionComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesRoutingModule { }
