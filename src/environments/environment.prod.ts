export const environment = {
  config: {
    configFilename: 'config.json',
  },
  auth: {
    devApiToken: 'XXXXXX-XXXX-XXX-XXXXX-XXXXXXXXXX',
  },
  azureBlobUrl: 'https://truevaluehubdev.blob.core.windows.net',
  apiUrl: '',
  production: true,
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
