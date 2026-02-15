import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import * as components from './components';
// import * as services from './services';
// import { RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgCircleProgressModule } from 'ng-circle-progress';
// import { CamelcaseToWordsPipe, CustomizeSimulationTextPipe } from 'src/app/shared/pipes';
// import { MmToInchesPipe } from './pipes/UnitConversion/mmToInches.pipe';
// import { MmToCmPipe } from './pipes/UnitConversion/mmToCm.pipe';
// import { InchesToMmPipe } from './pipes/UnitConversion/inchesToMm.pipe';
// import { CmToMmPipe } from './pipes/UnitConversion/cmToMm.pipe';
// import { CmToInchesPipe } from './pipes/UnitConversion/cmToInches.pipe';
// import { InchesToCmPipe } from './pipes/UnitConversion/inchesToCm.pipe';
// import { MmToMetersPipe } from './pipes/UnitConversion/mmToMeters.pipe';
// import { MToMmPipe } from './pipes/UnitConversion/mToMm.pipe';
// import { MmToFeetPipe } from './pipes/UnitConversion/mmToFeet.pipe';
// import { FeetToMmPipe } from './pipes/UnitConversion/feetToMm.pipe';
// import { DynamicComponentDirective } from '../directives/dynamic-component-directive';
//import { DndDirective } from './directives';
// import { CustomSplit } from './pipes/custom-split.pipe';
// import { TruncatePipe } from './pipes/truncate.pipe';
// import { SidebarComponent } from './components/sidebar/sidebar.component';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { NavLeftMenuComponent } from './components/nav-left-menu/nav-left-menu.component';
// import { SearchBarComponent } from './components/search-bar/search-bar.component';
// import { MatSelectModule } from '@angular/material/select';
// import { GenericDataTableComponent } from './components/generic-data-table/generic-data-table.component';
// import { TableModule } from 'primeng/table';

@NgModule({
  imports: [
    // CommonModule,
    // RouterModule,
    // FormsModule,
    MaterialModule,
    // MatProgressBarModule,
    NgCircleProgressModule.forRoot({}),
    // MatSidenavModule,
    // MatSelectModule,
    // CamelcaseToWordsPipe,
    // CustomizeSimulationTextPipe,
    // DndDirective,
    // components.IndustrisComponent,
    // components.NavMenuComponent,
    // MmToInchesPipe,
    // MmToCmPipe,
    // InchesToMmPipe,
    // CmToMmPipe,
    // CmToInchesPipe,
    // InchesToCmPipe,
    // MmToMetersPipe,
    // MToMmPipe,
    // MmToFeetPipe,
    // FeetToMmPipe,
    // TruncatePipe,
  ],
  declarations: [
    // NewlineBrPipe,
    // CustomSplit,
    // DynamicComponentDirective,
    // DndDirective,
    // NavLeftMenuComponent,
    // SidebarComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    // services.ProjectInfoService,
    // services.PartInfoService,
    // services.CommodityService,
    // services.CountryDataService,
    // services.CostSummaryService,
    // services.ProcessInfoService,
    // services.ProcessMasterService,
    // services.BomService,
    // services.CadService,
    // services.MaterialInfoService,
    // services.MaterialMasterService,
    // services.MedbMasterService,
    // services.CotsInfoService,
    // services.OverviewService,
    // services.OverHeadProfitMasterService,
    // services.BlockUiService,
    // services.ApiCacheService,
    // services.SecondaryProcessService,
    // services.SimulationService,
    // services.ProjectInfoService,
    // services.ScenarioService,
    // services.CommentFieldService,
    // services.IdleTimeoutService,
    // services.NestingAlgoService,
    // services.AiSearchService,
    // services.UnspscMasterService,
    // services.HtsMasterService,
    // MmToInchesPipe,
    // MmToCmPipe,
    // InchesToMmPipe,
    // CmToMmPipe,
    // CmToInchesPipe,
    // InchesToCmPipe,
    // MmToMetersPipe,
    // MToMmPipe,
    // MmToFeetPipe,
    // FeetToMmPipe,
    // CustomSplit,
    // TruncatePipe,
    // DynamicComponentDirective,
    //DndDirective,
  ],
  exports: [
    // components.NavMenuComponent,
    // components.IndustrisComponent,
    // CamelcaseToWordsPipe,
    // NewlineBrPipe,
    // CustomizeSimulationTextPipe,
    // MmToInchesPipe,
    // MmToCmPipe,
    // InchesToMmPipe,
    // CmToMmPipe,
    // CmToInchesPipe,
    // InchesToCmPipe,
    // MmToMetersPipe,
    // MToMmPipe,
    // MmToFeetPipe,
    // FeetToMmPipe,
    // CustomSplit,
    // TruncatePipe,
    // DynamicComponentDirective,
    //DndDirective,
    // NavLeftMenuComponent,
    // SidebarComponent
  ],
})
export class SharedModule {}
