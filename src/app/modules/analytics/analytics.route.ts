import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { PlaybookComponent } from './components/playbook/playbook.component';
import { AnalyticsContainerComponent } from './components/analytics-container/analytics-container.component';
import { BestProcessComponent } from './components/best-process/best-process.component';
import { ToolingOptimizationComponent } from './components/tooling-optimization/tooling-optimization.component';
import { LotSizeOptimizationComponent } from './components/lot-size-optimization/lot-size-optimization.component';
import { BestRegionSourceComponent } from './components/best-region-source/best-region-source.component';
import { PredictiveAnalyticsComponent } from './components/predictive-analytics/predictive-analytics.component';
import { CompetitiveAnalysisComponent } from './components/competitive-analysis/competitive-analysis.component';
import { SimulationFormComponent } from './components/simulation-sections/simulation-form/simulation-form.component';
import { SavedAnalysisComponent } from './components/saved-analysis/saved-analysis.component';
import { SensitivityAnalysisComponent } from './components/sensitivity-analysis/sensitivity-analysis.component';

export const reportsRoutes: Routes = [
  {
    path: '',
    component: AnalyticsContainerComponent,
    children: [
      {
        path: '',
        redirectTo: 'playbook',
        pathMatch: 'full',
      },
      {
        path: 'playbook',
        component: PlaybookComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'simulation',
        component: BestRegionSourceComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'bestprocess',
        component: BestProcessComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'predictiveanalytics',
        component: PredictiveAnalyticsComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'toolingoptimization',
        component: ToolingOptimizationComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'lotsizeoptimization',
        component: LotSizeOptimizationComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'competitiveanalysis',
        component: CompetitiveAnalysisComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'sumilationform',
        component: SimulationFormComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'savedanalysis',
        component: SavedAnalysisComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'sensitivityanalysis',
        component: SensitivityAnalysisComponent,
        canActivate: [MsalGuard],
      },
    ],
  },
];
