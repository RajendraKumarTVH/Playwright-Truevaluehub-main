import { Routes } from '@angular/router';
import { CostingReportComponent } from './components/costing-report-component/costing-report-component';
import { MsalGuard } from '@azure/msal-angular';
import { GraphicalReportComponent } from './components/graphical-report-component/graphical-report-component';
import { ReportsPageComponent } from './containers';
import { MaterialReportComponent } from './components/material-report-component/material-report-component';
import { DetailedPartCostReportComponent } from './components/detailed-part-cost-report/detailed-part-cost-report-component';
import { InputOutputAnalysisComponentComponent } from './components/input-output-analysis-component/input-output-analysis-component.component';
import { PcbaReportComponent } from './components/pcba-report-component/pcba-report-component';
import { PcbReportComponent } from './components/pcb-report-component/pcb-report-component';
import { GerberReaderComponent } from './components/gerber-reader/gerber-reader.component';
import { WireHarnessComponent } from './components/wire-harness-report/wire-harness-report.component';
import { FactPackComponent } from './components/fact-pack/fact-pack.component';
import { CostBreakdownReportComponent } from './components/cost-breakdown-report/cost-breakdown-report.component';
import { CostComparisonReportComponent } from './components/cost-comparison-report/cost-comparison-report.component';

export const reportsRoutes: Routes = [
  {
    path: '',
    component: ReportsPageComponent,
    children: [
      {
        path: '',
        redirectTo: 'costingreport',
        pathMatch: 'full',
      },
      {
        path: 'costingreport',
        component: CostingReportComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'costBreakdownreport',
        component: CostBreakdownReportComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'costcomparisonreport',
        component: CostComparisonReportComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'graphicalreport',
        component: GraphicalReportComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'materialreport',
        component: MaterialReportComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'detailedpartcostreport',
        component: DetailedPartCostReportComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'inputoutputanalysisreport',
        component: InputOutputAnalysisComponentComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'pcbareport',
        component: PcbaReportComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'pcbreport',
        component: PcbReportComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'gerber',
        component: GerberReaderComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'wireHarness',
        component: WireHarnessComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'factpack',
        component: FactPackComponent,
        canActivate: [MsalGuard],
      },
    ],
  },
];
