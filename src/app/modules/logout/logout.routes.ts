import { Routes } from '@angular/router';
import * as containers from './containers';

export const logoutRoutes: Routes = [
  {
    path: '',
    component: containers.LogoutPageComponent,
  },
];
