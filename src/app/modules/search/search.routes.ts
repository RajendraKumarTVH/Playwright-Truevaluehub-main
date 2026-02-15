import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import * as containers from './containers';

export const searchRoutes: Routes = [
  {
    path: '',
    component: containers.SearchShellPageComponent,
    canActivate: [MsalGuard],
  },
];
