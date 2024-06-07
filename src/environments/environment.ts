// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  urlApiBovis: 'https://bovis-dev-api-up.azurewebsites.net/',
  redirectUri: 'http://localhost:4200/',
  clientID: '2a3addef-64ef-407c-a86a-b9913237e5c5',
  urlAuthority: 'https://login.microsoftonline.com/48986ced-d307-4c91-85be-933ccbcbaeb3',
  tokenUser: 'B0V1$-2023',
  tokenSecret: 'P4$w0RD_2023'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
