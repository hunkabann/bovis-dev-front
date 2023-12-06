import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { BrowserUtils } from '@azure/msal-browser';
import { ProfileComponent } from './profile/profile.component';
import { HomeComponent } from './home/home.component';
import { FailedComponent } from './shared/components/failed/failed.component';
import { RoleResolver } from './resolver/role.resolver';
import { TokenResolver } from './resolver/token.resolver';

const routes: Routes = [
 /*  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [MsalGuard]
  }, */
  {
    path: '',
    children: [
      {
        path: 'auditoria',
        loadChildren: () => 
          import('./auditoria/auditoria.module').then((m) => m.AuditoriaModule),
      },
      {
        path: 'contratos',
        loadChildren: () =>
          import('./contratos/contratos.module').then((m) => m.ContratosModule),
      },
      {
        path: 'costos',
        loadChildren: () =>
          import('./costos/costos.module').then((m) => m.CostosModule),
      },
      {
        path: 'empleados',
        loadChildren: () =>
          import('./empleados/empleados.module').then((m) => m.EmpleadosModule),
      },
      {
        path: 'cie',
        loadChildren: () =>
          import('./cie/cie.module').then((m) => m.CieModule),
      },
      {
        path: 'pec',
        loadChildren: () =>
          import('./dor/dor.module').then((m) => m.DorModule),
      },
      {
        path: 'pcs',
        loadChildren: () =>
          import('./pcs/pcs.module').then((m) => m.PcsModule),
      },
      {
        path: 'catalogos',
        loadChildren: () =>
          import('./catalogos/catalogos.module').then((m) => m.CatalogosModule),
      },
      {
        path: 'facturacion',
        loadChildren: () =>
          import('./facturacion/facturacion.module').then((m) => m.FacturacionModule),
      },
      {
        path: 'reportes',
        loadChildren: () => 
          import('./reportes/reportes.module').then((m) => m.ReportesModule)
      },
      {
        path: 'timesheet',
        loadChildren: () => 
          import('./timesheet/timesheet.module').then((m) => m.TimesheetModule)
      },
      {
        path: 'usuarios',
        loadChildren: () => 
          import('./usuario/usuario.module').then((m) => m.UsuarioModule)
      }
    ],
    resolve: {
      token: TokenResolver,
      roles: RoleResolver
    },
    canActivate: [MsalGuard]
  },
 /*  {
    path: '',
    component: HomeComponent
  } */
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // Don't perform initial navigation in iframes or popups
    initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? 'enabledNonBlocking' : 'disabled' // Set to enabledBlocking to use Angular Universal
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
