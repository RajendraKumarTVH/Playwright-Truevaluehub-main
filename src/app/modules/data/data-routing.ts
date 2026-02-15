import { Routes } from '@angular/router';
import { DataContainerComponent } from './Components/data-container/data-container.component';

export const dataRoutes: Routes = [
  {
    path: '',
    component: DataContainerComponent,
    children: [
      {
        path: '',
        redirectTo: 'supplier',
        pathMatch: 'full',
      },
    ],
  },
];
