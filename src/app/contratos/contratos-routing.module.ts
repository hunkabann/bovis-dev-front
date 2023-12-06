import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlantillasComponent } from './plantillas/plantillas.component';
import { RegistroPlantillaComponent } from './registro-plantilla/registro-plantilla.component';

const routes: Routes = [
  {path: 'plantillas', component: PlantillasComponent},
  {path: 'plantillas/registro', component: RegistroPlantillaComponent},
  {path: 'plantillas/registro/:id', component: RegistroPlantillaComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContratosRoutingModule { }
