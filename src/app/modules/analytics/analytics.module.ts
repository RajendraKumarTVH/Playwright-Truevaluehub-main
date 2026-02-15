import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import { NgChartsModule } from 'ng2-charts';
import { reportsRoutes } from './analytics.route';
import { AnalyticsService } from './services/analytics.service';
import { MaterialModule } from 'src/app/shared/material.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(reportsRoutes),
    FormsModule,
    MaterialModule,
    // NgChartsModule,
    SharedModule,
  ],
  declarations: [
    //PlaybookComponent,
    // AnalyticsContainerComponent,
    // SimulationFormComponent,
    // BestRegionGraphicalComponent,
    // BestProcessComponent,
    // ToolingOptimizationComponent,
    // LotSizeOptimizationComponent,
    // BestRegionTableComponent,
    // BestRegionSourceComponent,
    // SimulationCalculationComponent,
    // BestProcessTableComponent,
    // BestProcessGraphicalComponent,
    // ToolingOptimizationGraphicalComponent,
    // LotsizeOptimizationGraphicalComponent,
    // PredictiveAnalyticsComponent,
    // PredictiveAnalyticsGraphicalComponent
  ],
  exports: [],
  providers: [AnalyticsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AnalyticsModule {}
