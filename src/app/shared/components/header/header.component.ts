import { Component, Inject, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RedirectRequest } from '@azure/msal-browser';
// Services
import {
  MsalService,
  MsalBroadcastService,
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration,
} from '@azure/msal-angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() hInfo: any;
  loginDisplay = false;
  isModulos = false;
  objUsuario: { user: string; textLogin: string; roles: any } = {
    user: '',
    textLogin: '',
    roles: null,
  };
  items: MenuItem[] = [];
  @Input() currentModule: string = '';
  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService
  ) {
  }

  ngOnInit(): void {
    this.setLoginDisplay();


  }

  loginRedirect() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({
        ...this.msalGuardConfig.authRequest,
      } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  logout() {
    this.objUsuario.user = '';
    this.objUsuario.textLogin = 'Login';
    this.authService.logoutRedirect();
  }

  setLoginDisplay() {
    // console.log(this.authService.instance.getAllAccounts());
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    // console.log(this.loginDisplay);
    if (this.loginDisplay) {
      type IdTokenClaims = {
        name: string;
        roles: any;
        preferred_username: string;
      };
      let accounts = this.authService.instance.getAllAccounts();
      this.objUsuario.roles = (
        accounts[0].idTokenClaims as IdTokenClaims
      ).roles;
      //console.log(this.roles);
      //console.log((accounts[0].idTokenClaims as IdTokenClaims).preferred_username);
      localStorage.setItem(
        'userMail',
        (accounts[0].idTokenClaims as IdTokenClaims).preferred_username
      );
      const preferred_username = (accounts[0].idTokenClaims as IdTokenClaims)
        .name;
      //console.log(preferred_username);
      this.isModulos = true;
      this.objUsuario.user = 'Bienvenido: ' + preferred_username;
    }
  }
}
