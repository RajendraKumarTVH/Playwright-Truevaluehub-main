import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';
import { ConfigKeyEnum } from './app/shared/enums/config-key.enum';

import { MsalService, MsalBroadcastService, MsalGuard, MsalRedirectComponent, MsalModule } from '@azure/msal-angular';
import { msalInterceptorConfigFactory, msalGuardConfigFactory, createAndInitializeMsalInstance } from './app/_helpers/msal.factory';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MsalInterceptor, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MSAL_GUARD_CONFIG } from '@azure/msal-angular';

if (environment.production) {
  enableProdMode();
}

(async () => {
  const configFilename = './assets/' + environment.config.configFilename;
  const response = await fetch(configFilename);
  const json = await response.json();

  // Dynamically update environment with remote config
  Object.entries(json).forEach(([key, value]) => {
    if (key == ConfigKeyEnum.apiBaseUrl) {
      environment.apiConfig.uri[0] = `${value}/api`;
      environment.apiUrl = value.toString();
    }
    if (key == ConfigKeyEnum.masterApiBaseUrl) {
      environment.apiConfig.uri[1] = `${value}/api`;
    }
    if (key == ConfigKeyEnum.azureBlobUrl) {
      environment.azureBlobUrl = value.toString();
    }
    if (key == ConfigKeyEnum.authClientId) {
      environment.msalConfig.auth.clientId = value.toString();
    }
    if (key == ConfigKeyEnum.scopes) {
      environment.apiConfig.scopes[0] = value.toString();
    }
    if (key == ConfigKeyEnum.baseAuthority) {
      environment.b2cPolicies.authorities.signUpSignIn.authority = value + 'B2C_1_B2C_SignUpSignIn';
      environment.b2cPolicies.authorities.resetPassword.authority = value + 'B2C_1_PasswordReset';
      environment.b2cPolicies.authorities.editProfile.authority = value + 'B2C_1_Profile_editing';
    }
    if (key == ConfigKeyEnum.authorityDomain) {
      environment.b2cPolicies.authorityDomain = value.toString();
    }
    if (key == ConfigKeyEnum.mapApiKey) {
      environment.mapApiKey = value.toString();
    }
  });

  const msalInstance = await createAndInitializeMsalInstance();
  const msalProviders = [
    importProvidersFrom(MsalModule),
    { provide: MSAL_INSTANCE, useValue: msalInstance },
    { provide: MSAL_GUARD_CONFIG, useFactory: msalGuardConfigFactory },
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: msalInterceptorConfigFactory },
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    MsalRedirectComponent,
    provideHttpClient(withInterceptorsFromDi()),
  ];

  await bootstrapApplication(AppComponent, {
    ...appConfig,
    providers: [...appConfig.providers!, ...msalProviders],
  }).catch((err) => console.error(err));
})();
// This code initializes the Angular application, dynamically loads configuration from a JSON file,
// and sets up MSAL for authentication with Azure AD B2C. It modifies the environment settings based on the loaded configuration,
