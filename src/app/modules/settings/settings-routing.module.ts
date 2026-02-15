import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { AddUserComponent } from './Components/add-user/add-user.component';
import { CustomerComponent } from './Components/customer/customer.component';
import { SettingContainerComponent } from './Components/setting-container/setting-container.component';
import { UserComponent } from './Components/user/user.component';

export const settingsRoutes: Routes = [
  {
    path: '',
    component: SettingContainerComponent,
    canActivate: [MsalGuard],
    children: [
      {
        path: '',
        redirectTo: 'customer',
        pathMatch: 'full',
      },
      {
        path: 'customer',
        canActivate: [MsalGuard],
        component: CustomerComponent,
      },
      {
        path: 'profile',
        canActivate: [MsalGuard],
        component: UserComponent,
      },
      {
        path: 'add-user',
        canActivate: [MsalGuard],
        component: AddUserComponent,
      },
    ],
  },
];
