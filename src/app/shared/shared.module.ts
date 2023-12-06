import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrimengModule } from './primeng.module';

//Components
import { FailedComponent } from './components/failed/failed.component';
import { MenuSidebarComponent } from './components/menu-sidebar/menu-sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { BackdropComponent } from './components/backdrop/backdrop.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingRolesComponent } from './components/loading-roles/loading-roles.component';
import { CardModule } from 'primeng/card';


@NgModule({
  declarations: [
    HeaderComponent,
    FailedComponent,
    MenuSidebarComponent,
    BackdropComponent,
    LoadingRolesComponent
  ],
  imports: [
    CommonModule,
    PrimengModule,
    ProgressSpinnerModule,
    CardModule
  ],
  exports: [
    HeaderComponent,
    FailedComponent,
    MenuSidebarComponent,
    BackdropComponent,
    LoadingRolesComponent
  ]
})
export class SharedModule { }
