import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CostoEmpleadoComponent } from './components/costo-empleado/costo-empleado.component';
import { CostoProyectoComponent } from './components/costo-proyecto/costo-proyecto.component';

const routes: Routes = [
  { path: 'costo-empleado', component: CostoEmpleadoComponent },
  { path: 'costo-proyecto', component: CostoProyectoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CostosRoutingModule { }
