import { Routes } from '@angular/router';
import { CanDeactivateGuard } from 'src/app/_guards/can-deactivate-guard.service';
// import * as components from './components';
import * as containers from './containers';
import * as resolvers from './resolvers';

export const costingRoutes: Routes = [
  {
    path: '',
    component: containers.CostingPageComponent,
    resolve: { projectInfoList: resolvers.CostingPageResolver },
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: ':projectId',
    component: containers.CostingPageComponent,
    resolve: { projectInfoList: resolvers.CostingPageResolver },
    canDeactivate: [CanDeactivateGuard],
  },
];
