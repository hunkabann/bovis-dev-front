import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MediaMatcher } from '@angular/cdk/layout';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { MsalGuard, MsalInterceptor, MsalBroadcastService, MsalInterceptorConfiguration, MsalModule, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalGuardConfiguration, MsalRedirectComponent } from '@azure/msal-angular';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AuthInterceptor } from './interceptors/auth.interceptor';

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1; // Remove this line to use Angular Universal

const uriRedirect = environment.redirectUri;
const clientID = environment.clientID;
const urlAuthority = environment.urlAuthority;

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: clientID,
      authority: urlAuthority,
      redirectUri: uriRedirect,
      postLogoutRedirectUri: uriRedirect,

    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE, // set to true for IE 11. Remove this line to use Angular Universal
    },
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  /*
  //Forma 1
   protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read']); // Prod environment. Uncomment to use.
   protectedResourceMap.set('https://bovis-api-dev.azurewebsites.net/api/*', ['api://e264ed0b-c9d3-4bea-a9d9-7ff456cc23f7/apibovis.scope']); */

  /*
    //Forma2
  const protectedResourceMap:[string, string[]][]= [
      ['https://buildtodoservice.azurewebsites.net/api/todolist', [ 'api://a88bb933-319c-41b5-9f04-eff36d985612/access_as_user' ]],
      ['https://graph.microsoft.com/v1.0/me', ['user.read']]
  ];*/

  return {
    interactionType: InteractionType.Redirect,
    //protectedResourceMap
    protectedResourceMap: new Map<string, Array<string> | null>([
      ['https://bovis-dev-api.azurewebsites.net/api/*', ['api://f0ab1f6a-a436-4722-a2a1-4156b7bd8b90/apibovis.scope']],
    ]),
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['user.read']
    },
    loginFailedRoute: '/login-failed'
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule, // Animations cause delay which interfere with E2E tests
    AppRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MsalModule,
    BrowserModule,
    BrowserAnimationsModule,
  ],
  exports: [
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    MediaMatcher
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
