import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PcsComponent } from './container/pcs.component';
import { IpComponent } from './components/ip/ip.component';
import { StaffingPlanComponent } from './components/staffing-plan/staffing-plan.component';
import { GastosComponent } from './components/gastos/gastos.component';
import { IngresosComponent } from './components/ingresos/ingresos.component';
import { ControlComponent } from './components/control/control.component';
import { PpaKpiComponent } from './components/ppa-kpi/ppa-kpi.component';

const routes: Routes = [
  { 
    path: '', 
    component: PcsComponent, 
    children: [
      { path: 'ip', component: IpComponent },
      { path: 'staffing-plan', component: StaffingPlanComponent },
      { path: 'gastos', component: GastosComponent },
      { path: 'ingresos', component: IngresosComponent },
      { path: 'control', component: ControlComponent },
      { path: 'ppa-kpi', component: PpaKpiComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PcsRoutingModule { }
