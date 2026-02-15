import { Routes } from '@angular/router';
import { DigitalFactoryMainComponent } from './Components/digital-factory/digital-factory-main/digital-factory-main.component';

export const digitalFactoryRoutes: Routes = [
  {
    path: '',
    component: DigitalFactoryMainComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: DigitalFactoryMainComponent,
      },
      {
        path: 'supplier-info/:id',
        loadChildren: () => import('./Components/digital-factory/supplier-info/supplier-info.module').then((x) => x.SupplierInfoModule),
      },
    ],
  },
];
