import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsuarioRoutingModule } from './usuario-routing.module';
import { PrincipalComponent } from './components/principal/principal.component';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AsignarPerfilesComponent } from './components/asignar-perfiles/asignar-perfiles.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ContenedorComponent } from './components/contenedor/contenedor.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { PerfilesComponent } from './components/perfiles/perfiles.component';
import { ModulosComponent } from './components/modulos/modulos.component';
import { AsignarModulosComponent } from './components/asignar-modulos/asignar-modulos.component';
import { BadgeModule } from 'primeng/badge';
import { AsignarPermisosComponent } from './components/asignar-permisos/asignar-permisos.component';
import { PerfilRegistroComponent } from './components/perfil-registro/perfil-registro.component';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
  declarations: [
    PrincipalComponent,
    AsignarPerfilesComponent,
    ContenedorComponent,
    PerfilesComponent,
    ModulosComponent,
    AsignarModulosComponent,
    AsignarPermisosComponent,
    PerfilRegistroComponent
  ],
  imports: [
    CommonModule,
    UsuarioRoutingModule,
    ReactiveFormsModule,
    ToastModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputSwitchModule,
    TabMenuModule,
    BadgeModule
  ]
})
export class UsuarioModule { }
