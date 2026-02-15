import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import * as components from './components';
// import * as containers from './containers';
// import * as resolvers from './resolvers';
import * as services from './services';
import { RouterModule } from '@angular/router';
import { costingRoutes } from './costing.routes';
import { CommonModule, DecimalPipe } from '@angular/common';
// Need to fix
// import { TreeModule } from '@circlon/angular-tree-component';
import { MaterialModule } from 'src/app/shared/material.module';
// import { PcbPaneldescriptionComponent } from './components/pcb-paneldescription/pcb-paneldescription.component';
// import { PcbSmdplacementComponent } from './components/pcb-smdplacement/pcb-smdplacement.component';
// import { PcbThroughholeplacementComponent } from './components/pcb-throughholeplacement/pcb-throughholeplacement.component';
// import { PcbTimetestingComponent } from './components/pcb-timetesting/pcb-timetesting.component';
// import { PcbResultComponent } from './components/pcb-result/pcb-result.component';
// import { CustomSlice, SingleDecimalFilterPipe } from '../../shared/pipes';
// import { TwoDigitDecimaNumberDirective } from 'src/app/shared/directives';
// import { FourDigitDecimaNumberDirective } from 'src/app/shared/directives';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { CanDeactivateGuard } from '../../_guards/can-deactivate-guard.service';
// import { BomAnalysisComponent } from './components/bom-analysis/bom-analysis.component';
// import { BomInputAnalysisComponent } from './components/bom-input-analysis/bom-input-analysis.component';
// import { BomOutputAnalysisComponent } from './components/bom-output-analysis/bom-output-analysis.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgCircleProgressModule } from 'ng-circle-progress';
// import { ModelComponent } from './components/model/model.component';
// Need to fix
// import { AgmCoreModule } from '@agm/core';
// import { AgmDirectionModule } from 'agm-direction';
// import { AgmOverlays } from 'agm-overlays';
// import { DutiesAndTariffComponent } from './components/duties-and-tariff/duties-and-tariff.component';
import { SharedService } from './services/shared.service';
// import { CostingDfmComponent } from './components/app-costing-dfm/app-costing-dfm.component';
// import { CostingToolingInfoComponent } from './components/costing-tooling-Info/costing-tooling-info/costing-tooling-info.component';
// import { DocumentViewerComponent } from './components/costing-supporting-documents/document-viewer/document-viewer.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { Store } from '@ngxs/store';
// import { AddBomComponent } from './components/add-bom/add-bom.component';
// import { ImageViewerComponent } from './components/costing-supporting-documents/image-viewer/image-viewer.component';
// import { AddScenarioComponent } from './components/add-scenario/add-scenario.component';
// import { CommentsModule } from '../comments/comments.module';
// import { CompareScenariosComponent } from './components/compare-scenarios/compare-scenarios.component';
// import { EditScenarioComponent } from './components/edit-scenario/edit-scenario.component';
// import { SpecialCharacterDirective } from 'src/app/shared/directives/alpha-numeric.directive';
// import { PcbBoarddetailsComponent } from './components';
// import { CastingMaterialComponent } from './components/costing-material-information/casting-material/casting-material.component';
// import { PCBMaterialComponent } from './components/costing-material-information/pcb-material/pcb-material.component';
// import { NestingAlgoComponent } from './components/nesting-algo/nesting-algo.component';
// import { SustainabilityComponent } from './components/sustainability/sustainability.component';
// import { AssemblyProcessComponent } from './components/costing-manufacturing-information/assembly-process/assembly-process.component';
// import { MachiningProcessComponent } from './components/costing-manufacturing-information/machining-process/machining-process.component';
// import { MetalExtrusionMaterialComponent } from './components/costing-material-information/metal-extrusion-material/metal-extrusion-material.component';
// import { MachiningMaterialComponent } from './components/costing-material-information/machining-material/machining-material.component';
// import { ForgingSubProcessComponent } from './components/costing-manufacturing-information/forging-sub-process/forging-sub-process.component';
// import { TubeBendingComponent } from './components/costing-material-information/tube-bending/tube-bending.component';
// import { TubeBendingProcessComponent } from './components/costing-manufacturing-information/tube-bending-process/tube-bending-process.component';
// import { InsulationJacketComponent } from './components/costing-material-information/insulation-jacket/insulation-jacket.component';
// import { InsulationJacketProcessComponent } from './components/costing-manufacturing-information/insulation-jacket-process/insulation-jacket-process.component';
// import { StackupDiagramComponent } from './components/costing-material-information/stackup-diagram/stackup-diagram.component';
// import { BrazingProcessComponent } from './components/costing-manufacturing-information/brazing-process/brazing-process.component';
// import { BrazingMaterialComponent } from './components/costing-material-information/brazing-material/brazing-material.component';
// import { CastingProcessComponent } from './components/costing-manufacturing-information/casting-process/casting-process.component';
// import { MetalExtrusionProcessComponent } from './components/costing-manufacturing-information/metal-extrusion-process/metal-extrusion-process.component';
// import { PlasticVacuumFormingProcessComponent } from './components/costing-manufacturing-information/plastic-vacuum-forming-process/plastic-vacuum-forming-process.component';
// import { PlasticVacuumFormingComponent } from './components/costing-material-information/plastic-vacuum-forming/plastic-vacuum-forming.component';
// import { PlasticTubeExtrusionComponent } from './components/costing-material-information/plastic-tube-extrusion/plastic-tube-extrusion.component';
// import { PlasticTubeExtrusionProcessComponent } from './components/costing-manufacturing-information/plastic-tube-extrusion-process/plastic-tube-extrusion-process.component';
// import { HotForgingClosedDieHotComponent } from './components/costing-material-information/hot-forging-closed-die-hot/hot-forging-closed-die-hot.component';
// import { ToolingBopInfoComponent } from './components/costing-tooling-Info/tooling-bop-info/tooling-bop-info.component';
// import { CompressionMoldingComponent } from './components/costing-manufacturing-information/compression-molding/compression-molding.component';
// import { ToolingOverheadInfoComponent } from './components/costing-tooling-Info/tooling-overhead-info/tooling-overhead-info.component';
// import { ToolingProcessInfoComponent } from './components/costing-tooling-Info/tooling-process-info/tooling-process-info.component';
// import { ToolingMaterialInfoComponent } from './components/costing-tooling-Info/tooling-material-info/tooling-material-info.component';
// import { ToolingInfoComponent } from './components/costing-tooling-Info/tooling-info/tooling-info.component';
// import { ToolingBopTableComponent } from './components/costing-tooling-Info/tooling-bop-info/tooling-bop-table/tooling-bop-table.component';
// import { ToolingManufacturingTableComponent } from './components/costing-tooling-Info/tooling-process-info/tooling-manufacturing-table/tooling-manufacturing-table.component';
// import { ToolingTableComponent } from './components/costing-tooling-Info/tooling-info/tooling-table/tooling-table.component';
// import { ToolingMaterialTableComponent } from './components/costing-tooling-Info/tooling-material-info/tooling-material-table/tooling-material-table.component';
// import { CleaningForgingProcessComponent } from './components/costing-manufacturing-information/cleaning-forging-process/cleaning-forging-process.component';
// import { MaterialTableComponent } from './components/costing-material-information/material-table/material-table.component';
// import { ManufacturingTableComponent } from './components/costing-manufacturing-information/manufacturing-table/manufacturing-table.component';
// import { environment } from 'src/environments/environment';
// import { CustomCableMaterialComponent } from './components/costing-material-information/custom-cable-material/custom-cable-material.component';
// import { CustomCableProcessComponent } from './components/costing-manufacturing-information/custom-cable-process/custom-cable-process.component';
// import { CostingGdntComponent } from '../ai-search/components/costing-gdnt/costing-gdnt.component';
// import { WiringHarnessProcessComponent } from './components/costing-manufacturing-information/wiring-harness-process/wiring-harness-process.component';
// import { PcbaProcessComponent } from './components/costing-manufacturing-information/pcba-process/pcba-process.component';
// import { ElectronicsProcessComponent } from './components/costing-material-information/pcba-material/electronics-process.component';
// import { CostingAiAttributeComponent } from './components/costing-cost-summary/costing-ai-attribute/costing-ai-attribute-modal.component';
// import { MaterialSustainabilityComponent } from './components/costing-material-information/material-sustainability/material-sustainability.component';
// import { ManufacturingSustainabilityComponent } from './components/costing-manufacturing-information/manufacturing-sustainability/manufacturing-sustainability.component';
// import { CostingNoteComponent } from './components/costing-cost-summary/costing-note/costing-note-component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MaterialModule,
    // TreeModule,
    NgbModule,
    MatProgressBarModule,
    RouterModule.forChild(costingRoutes),
    NgCircleProgressModule.forRoot({}),
    SharedModule,
    //TwoDigitDecimaNumberDirective,
    //FourDigitDecimaNumberDirective,
    //SpecialCharacterDirective,
    //Need to fix
    // AgmCoreModule.forRoot({
    //   apiKey: environment.mapApiKey,
    // }),
    // AgmDirectionModule,
    // AgmOverlays,
    //SingleDecimalFilterPipe,
    NgxDocViewerModule,
    // ImageViewerComponent,
    // CommentsModule,
    // OnlyNumber
    // CustomSlice,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [Store, services.ElectronicsService, DecimalPipe, SharedService],
  exports: [
    // ModelComponent,
    // AddScenarioComponent
  ],
  declarations: [
    // components.NumberFieldComponent,
    // containers.CostingPageComponent,
    // components.CostingProjectBomDetailsComponent,
    // components.CostingInformationComponent,
    // components.CostingCostSummaryComponent,
    // components.CostingPartInformationComponent,
    // components.CostingMaterialInformationComponent,
    // components.CostingManufacturingInformationComponent,
    // components.CostingPurchasedCataloguePartInformationComponent,
    // components.CostingSecondaryProcessComponent,
    // components.CostingOverheadProfitComponent,
    // components.CostingPcbContainerComponent,
    // components.CostingPackagingInformationComponent,
    // components.CostingProjectDetailsComponent,
    // components.PcbBoarddetailsComponent,
    // PcbPaneldescriptionComponent,
    // PcbSmdplacementComponent,
    // PcbThroughholeplacementComponent,
    // PcbTimetestingComponent,
    // PcbResultComponent,
    // components.CostingSupportingDocumentsComponent,
    // components.LogisticsSummaryComponent,
    // FileSizeMbPipe,
    // TwoDigitDecimaNumberDirective,
    // FourDigitDecimaNumberDirective,
    // BomAnalysisComponent,
    // BomInputAnalysisComponent,
    // BomOutputAnalysisComponent,
    // ModelComponent,
    // DutiesAndTariffComponent,
    // SustainabilityComponent,
    // OnlyNumber,
    // CostingDfmComponent,
    // CostingToolingInfoComponent,
    // DocumentViewerComponent,
    // AddBomComponent,
    // ImageViewerComponent,
    // AddScenarioComponent,
    // CompareScenariosComponent,
    // EditScenarioComponent,
    // SpecialCharacterDirective,
    // OnlyIntegerNumber,
    // CastingMaterialComponent,
    // NestingAlgoComponent,
    // PCBMaterialComponent,
    // AssemblyProcessComponent,
    // ElectronicsProcessComponent,
    // MachiningProcessComponent,
    // MetalExtrusionMaterialComponent,
    // MachiningMaterialComponent,
    // ForgingSubProcessComponent,
    // TubeBendingComponent,
    // TubeBendingProcessComponent,
    // InsulationJacketComponent,
    // InsulationJacketProcessComponent,
    // StackupDiagramComponent,
    // BrazingProcessComponent,
    // BrazingMaterialComponent,
    // CastingProcessComponent,
    // MetalExtrusionProcessComponent,
    // PlasticVacuumFormingProcessComponent,
    // PlasticVacuumFormingComponent,
    // PlasticTubeExtrusionComponent,
    // PlasticTubeExtrusionProcessComponent,
    // HotForgingClosedDieHotComponent,
    // ToolingBopInfoComponent,
    // CompressionMoldingComponent,
    // CompressionMoldingComponent,
    // ToolingOverheadInfoComponent,
    // ToolingProcessInfoComponent,
    // ToolingMaterialInfoComponent,
    // ToolingInfoComponent,
    // CostingNoteComponent,
    // ToolingBopTableComponent,
    // ToolingManufacturingTableComponent,
    // ToolingTableComponent,
    // ToolingMaterialTableComponent,
    // CleaningForgingProcessComponent,
    // MaterialTableComponent,
    // ManufacturingTableComponent,
    // CustomCableMaterialComponent,
    // CustomCableProcessComponent,
    // CostingGdntComponent
    // OnlyIntegerNumber,
    // CastingMaterialComponent,
    // NestingAlgoComponent,
    // PCBMaterialComponent,
    // AssemblyProcessComponent,
    // ElectronicsProcessComponent,
    // MachiningProcessComponent,
    // MetalExtrusionMaterialComponent,
    // MachiningMaterialComponent,
    // ForgingSubProcessComponent,
    // TubeBendingComponent,
    // TubeBendingProcessComponent,
    // InsulationJacketComponent,
    // InsulationJacketProcessComponent,
    // StackupDiagramComponent,
    // BrazingProcessComponent,
    // BrazingMaterialComponent,
    // CastingProcessComponent,
    // MetalExtrusionProcessComponent,
    // PlasticVacuumFormingProcessComponent,
    // PlasticVacuumFormingComponent,
    // PlasticTubeExtrusionComponent,
    // PlasticTubeExtrusionProcessComponent,
    // HotForgingClosedDieHotComponent,
    // ToolingBopInfoComponent,
    // CompressionMoldingComponent,
    // CompressionMoldingComponent,
    // ToolingOverheadInfoComponent,
    // ToolingProcessInfoComponent,
    // ToolingMaterialInfoComponent,
    // ToolingInfoComponent,
    // CostingNoteComponent,
    // ToolingBopTableComponent,
    // ToolingManufacturingTableComponent,
    // ToolingTableComponent,
    // ToolingMaterialTableComponent,
    // CleaningForgingProcessComponent,
    // MaterialTableComponent,
    // ManufacturingTableComponent,
    // CustomCableMaterialComponent,
    // CustomCableProcessComponent,
    // CostingGdntComponent,
    // WiringHarnessProcessComponent,
    // PcbaProcessComponent,
    // CostingAiAttributeComponent,
    // MaterialSustainabilityComponent,
    // ManufacturingSustainabilityComponent
  ],
  bootstrap: [],
})
export class CostingModule {}
