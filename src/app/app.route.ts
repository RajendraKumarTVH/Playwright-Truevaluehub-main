import { Routes } from '@angular/router';
import { MsalGuard, MsalRedirectComponent } from '@azure/msal-angular';
import { FailedComponent } from './shared/components/failed/failed.component';
import { RoleBasedAuthGuard } from './shared/guards/roleBasedAuth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    canActivate: [MsalGuard, RoleBasedAuthGuard],
    loadChildren: () => import('./modules/home/home.module').then((x) => x.HomeModule),
  },
  {
    path: 'costing',
    canActivate: [MsalGuard, RoleBasedAuthGuard],
    loadChildren: () => import('./modules/costing/costing.module').then((x) => x.CostingModule),
  },
  {
    path: 'data',
    canActivate: [MsalGuard, RoleBasedAuthGuard],
    loadChildren: () => import('./modules/data/data.module').then((x) => x.DataModule),
  },
  {
    path: 'digitalFactory',
    canActivate: [MsalGuard],
    loadChildren: () => import('./modules/digital-factory/digital-factory.module').then((x) => x.DigitalFactoryModule),
  },
  {
    path: 'settings',
    canActivate: [MsalGuard, RoleBasedAuthGuard],
    loadChildren: () => import('./modules/settings/settings.module').then((x) => x.SettingsModule),
  },
  {
    path: 'reports',
    canActivate: [MsalGuard, RoleBasedAuthGuard],
    loadChildren: () => import('./modules/reports/reports.module').then((x) => x.ReportsModule),
  },
  {
    path: 'analytics',
    canActivate: [MsalGuard, RoleBasedAuthGuard],
    loadChildren: () => import('./modules/analytics/analytics.module').then((x) => x.AnalyticsModule),
  },
  {
    path: 'search',
    loadChildren: () => import('./modules/search/search.module').then((x) => x.SearchModule),
  },
  {
    path: 'ai-search',
    canActivate: [MsalGuard, RoleBasedAuthGuard],
    loadChildren: () => import('./modules/ai-search/ai-search.module').then((x) => x.AiSearchModule),
  },
  {
    path: 'login-failed',
    component: FailedComponent,
  },
  {
    path: 'auth',
    component: MsalRedirectComponent,
  },
];
