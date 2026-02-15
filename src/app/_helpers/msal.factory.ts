import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { environment } from 'src/environments/environment';
import { MsalInterceptorConfiguration, MsalGuardConfiguration } from '@azure/msal-angular';

let msalInstance: PublicClientApplication;

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(logLevel, message);
}

export function createAndInitializeMsalInstance(): Promise<IPublicClientApplication> {
  msalInstance = new PublicClientApplication({
    auth: {
      clientId: environment.msalConfig.auth.clientId,
      authority: environment.b2cPolicies.authorities.signUpSignIn.authority,
      redirectUri: '/',
      postLogoutRedirectUri: '/',
      knownAuthorities: [environment.b2cPolicies.authorityDomain],
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false,
      },
    },
  });

  return msalInstance.initialize().then(() => msalInstance);
}

export function msalInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(environment.apiConfig.uri[0].toString(), [...environment.apiConfig.scopes]);
  protectedResourceMap.set(environment.apiConfig.uri[1].toString(), [...environment.apiConfig.scopes]);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function msalGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['openid', 'profile', ...environment.apiConfig.scopes],
    },
    loginFailedRoute: '/login-failed',
  };
}
