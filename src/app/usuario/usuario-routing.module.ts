import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrincipalComponent } from './components/principal/principal.component';
import { AsignarPerfilesComponent } from './components/asignar-perfiles/asignar-perfiles.component';
import { ContenedorComponent } from './components/contenedor/contenedor.component';
import { PerfilesComponent } from './components/perfiles/perfiles.component';
import { ModulosComponent } from './components/modulos/modulos.component';
import { AsignarModulosComponent } from './components/asignar-modulos/asignar-modulos.component';
import { AsignarPermisosComponent } from './components/asignar-permisos/asignar-permisos.component';

const routes: Routes = [{
  path: '',
  component: ContenedorComponent,
  children: [
    {path: 'principal', component: PrincipalComponent},
    {path: 'principal/asignar-perfiles/:id', component: AsignarPerfilesComponent},
    {path: 'perfiles', component: PerfilesComponent},
    {path: 'perfiles/asignar-modulos/:id', component: AsignarModulosComponent},
    {path: 'perfiles/asignar-permisos/:id', component: AsignarPermisosComponent},
    {path: 'modulos', component: ModulosComponent},
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }
