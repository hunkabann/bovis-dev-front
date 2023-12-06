import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CieComponent } from './container/cie.component';
import { CargaSaeComponent } from './components/carga-sae/carga-sae.component';
import { ResultadoBusquedaComponent } from './components/resultado-busqueda/resultado-busqueda.component';
import { ModificarRegistroComponent } from './components/modificar-registro/modificar-registro.component';

const routes: Routes = [
  { path: '', component: CieComponent },
  { path: 'carga-sae', component: CargaSaeComponent },
  { path: 'resultado-busqueda', component: ResultadoBusquedaComponent },
  { path: 'modificar-registro/:id', component: ModificarRegistroComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CieRoutingModule { }
