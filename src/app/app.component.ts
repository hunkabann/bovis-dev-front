import { Component, OnInit, Inject, OnDestroy, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, PopupRequest, RedirectRequest, EventMessage, EventType, BrowserCacheLocation } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MediaMatcher } from '@angular/cdk/layout';
import { NavigationEnd, Router } from '@angular/router';
import { SharedService } from './shared/services/shared.service';
import { AuthService } from './auth/services/auth.service';
import { UserService } from './services/user.service';
import { AuditoriaService } from './auditoria/services/auditoria.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Bovis';
  isIframe = false;
  loginDisplay = false;
  textLogin = 'Iniciar sesion';
  private readonly _destroying$ = new Subject<void>();
  isLogeado = false;
  collapsedNav: boolean | undefined;
  mobileQuery: MediaQueryList;
  currentModule = '';
  sidenavWidth = 4;
  //ngStyle: string;
  user: string = '';
  isModulos = false;
  roles: any = null;
  private _mobileQueryListener!: () => void;

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private router: Router,
    public sharedService: SharedService,
    private authLocalService: AuthService,
    private userService: UserService,
    private auditoriaService: AuditoriaService
  ) {

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.router.events.subscribe(value => {
      if (value instanceof NavigationEnd)
        //console.log(this.router.url.toString());
        if (this.router.url.toString() == '/') {
          this.currentModule = '';
        }
        else {
          this.asignarTituloModulo(this.router.url.toString())
        }
    });
  }

  asignarTituloModulo(url: string) {
    if(url.includes('dor')){
      this.currentModule = 'PLATAFORMA DE EXCELENCIA CORPORATIVA';
    }
    else if(url.includes('empleados')){
      this.currentModule = 'EMPLEADOS';
    }
  }

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener; // Remove this line to use Angular Universal
    this.setLoginDisplay();

    this.authService.instance.enableAccountStorageEvents(); // Optional - This will enable ACCOUNT_ADDED and ACCOUNT_REMOVED events emitted when a user logs in or out of another tab or window
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.ACCOUNT_ADDED || msg.eventType === EventType.ACCOUNT_REMOVED),
      )
      .subscribe((result: EventMessage) => {
        if (this.authService.instance.getAllAccounts().length === 0) {
          window.location.pathname = "/";

          console.log(BrowserCacheLocation.LocalStorage);
          let datosLogin = JSON.stringify(BrowserCacheLocation.LocalStorage);
          console.log(datosLogin);
        } else {
          this.setLoginDisplay();
        }
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
      })


  }

  setLoginDisplay() {
    //console.log(this.authService.instance.getAllAccounts());
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    //console.log(this.loginDisplay);
    if (this.loginDisplay) {
      type IdTokenClaims = {
        name: string,
        roles: any,
        preferred_username: string
      }
      let accounts = this.authService.instance.getAllAccounts();
      this.roles = (accounts[0].idTokenClaims as IdTokenClaims).roles;
      //console.log(this.roles);
      //console.log((accounts[0].idTokenClaims as IdTokenClaims).preferred_username);
      localStorage.setItem('userMail', (accounts[0].idTokenClaims as IdTokenClaims).preferred_username)
      localStorage.setItem('userName', (accounts[0].idTokenClaims as IdTokenClaims).name)
      const preferred_username = (accounts[0].idTokenClaims as IdTokenClaims).name;
      //console.log(preferred_username);
      this.isModulos = true;
      this.user = 'Bienvenido: ' + preferred_username;
    }
  }

  checkAndSetActiveAccount() {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    let activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      /*  console.log(accounts);
       console.log(accounts[0].idTokenClaims); */
      //this.textLogin = 'Cerrar sesion';
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  // loginRedirect() {
  //   if (this.msalGuardConfig.authRequest) {
  //     this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
  //   } else {
  //     this.authService.loginRedirect(); 
  //   }
  // }

  // loginPopup() {
  //   if (this.msalGuardConfig.authRequest) {
  //     this.authService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
  //       .subscribe((response: AuthenticationResult) => {
  //         this.authService.instance.setActiveAccount(response.account);
  //       });
  //   } else {
  //     this.authService.loginPopup()
  //       .subscribe((response: AuthenticationResult) => {
  //         this.authService.instance.setActiveAccount(response.account); 
  //       });
  //   }
  // }

  // logout(popup?: boolean) {
  //   this.user = "";
  //   this.textLogin = 'Login';
  //   if (popup) {
  //     this.authService.logoutPopup({
  //       mainWindowRedirectUri: "/"
  //     });
  //   } else {
  //     this.authService.logoutRedirect();
  //   }
  // }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();


    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  status: boolean = false;
  clickEvent() {
    this.status = !this.status;
  }

  onEmitter(event: any) {
    console.log('Received: ' + event);
    this.currentModule = event;
  }

}
