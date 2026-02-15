import { Routes } from '@angular/router';
import { SupplierInfoComponent } from './supplier-info.component';
import { SupplierFactoryAssumptionComponent } from './supplier-factory-assumption/supplier-factory-assumption.component';
import { SupplierLabourAssumptionComponent } from './supplier-labour-assumption/supplier-labour-assumption.component';
import { SupplierPowerAssumptionComponent } from './supplier-power-assumption/supplier-power-assumption.component';
import { MaterialCostInfoComponent } from './digital-factory-info/material-cost-info/material-cost-info.component';
import { MachineCostInfoComponent } from './digital-factory-info/machine-cost-info/machine-cost-info.component';

export const supplierInfoRoutes: Routes = [
  {
    path: 'supplier-info/:id',
    component: SupplierInfoComponent,
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
      {
        path: 'factory-assumptions',
        component: SupplierFactoryAssumptionComponent,
      },
      {
        path: 'labour-assumptions',
        component: SupplierLabourAssumptionComponent,
      },
      {
        path: 'power-assumptions',
        component: SupplierPowerAssumptionComponent,
      },
      {
        path: 'material-cost',
        component: MaterialCostInfoComponent,
      },
      {
        path: 'machine-cost',
        component: MachineCostInfoComponent,
      },
    ],
  },
];
