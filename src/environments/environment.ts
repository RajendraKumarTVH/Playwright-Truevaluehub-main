// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {
//   production: false,
//   baseUrl: 'https://localhost:7256/api'
// };
export const environment = {
  config: {
    configFilename: 'config.local.json',
  },
  auth: {
    devApiToken: 'XXXXXX-XXXX-XXX-XXXXX-XXXXXXXXXX',
  },
  azureBlobUrl: 'https://truevaluehubdev.blob.core.windows.net',
  apiUrl: '',
  production: false,
  msalConfig: {
    auth: {
      clientId: '',
    },
  },
  apiConfig: {
    scopes: [''],
    uri: ['', ''],
  },
  b2cPolicies: {
    names: {
      signUpSignIn: 'B2C_1_signin',
      resetPassword: 'B2C_1_PasswordReset',
      editProfile: 'B2C_1_Profile_editing',
    },
    authorities: {
      signUpSignIn: {
        authority: '',
      },
      resetPassword: {
        authority: '',
      },
      editProfile: {
        authority: '',
      },
    },
    authorityDomain: '',
  },
  GRAPH_ENDPOINT: 'https://graph.microsoft-ppe.com/v1.0/me',
  mapApiKey: '',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
