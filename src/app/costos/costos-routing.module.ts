import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CostoEmpleadoComponent } from './components/costo-empleado/costo-empleado.component';
import { CapturaBeneficiosComponent } from './components/captura-beneficios/captura-beneficios.component';

const routes: Routes = [
  { path: 'costo-empleado', component: CostoEmpleadoComponent },
  { path: 'costo-proyecto/:id', component: CapturaBeneficiosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CostosRoutingModule { }
