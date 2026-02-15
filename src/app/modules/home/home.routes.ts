import { Routes } from '@angular/router';
import * as containers from './containers';
import * as components from './components';
import * as resolvers from './resolvers';
import { CanDeactivateGuard } from 'src/app/shared/guards';
import { MsalGuard } from '@azure/msal-angular';
import { CreateProjectComponent, DraftProjectListComponent } from './components';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: containers.HomeShellPageComponent,
    canActivate: [MsalGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        component: components.OverviewComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'projects',
        redirectTo: 'projects/active',
        pathMatch: 'full',
      },
      {
        path: 'projects',
        component: components.HomeProjectsComponent,
        canActivate: [MsalGuard],
        children: [
          // {
          //   path: 'active_old',
          //   canActivate: [MsalGuard],
          //   component: components.ActiveProjectComponent,
          // },
          {
            path: 'active',
            canActivate: [MsalGuard],
            component: components.ActiveProjectsComponent,
            // uncomment this when integrate new ui and remove the old active project component route
            // component: components.ActiveFolderProjectComponent,
          },
          {
            path: 'archive',
            canActivate: [MsalGuard],
            component: components.ArchivedProjectsComponent,
          },
        ],
      },
      {
        path: 'project',
        redirectTo: 'project/create',
        pathMatch: 'full',
      },
      {
        path: 'project',
        component: components.HomeCreateProjectComponent,
        canActivate: [MsalGuard],
        children: [
          {
            path: 'create',
            component: CreateProjectComponent,
            canDeactivate: [CanDeactivateGuard],
          },
          {
            path: 'edit/:projectId',
            component: CreateProjectComponent,
            resolve: { projectInfoDto: resolvers.CreateProjectResolver },
            canDeactivate: [CanDeactivateGuard],
          },
          {
            path: 'draft-list',
            component: DraftProjectListComponent,
          },
        ],
      },
    ],
  },
];
