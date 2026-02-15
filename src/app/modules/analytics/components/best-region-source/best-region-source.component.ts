import { Component, inject, ViewChild } from '@angular/core';
//import { SimulationCalculationComponent } from '../simulation-sections/simulation-calculation/simulation-calculation.component';
import { SimulationTotalCostDto } from '../../models/simulationTotalCostDto.model';
import { CountryDataMasterDto, PartInfoDto, ProjectInfoDto, SimulationForm } from 'src/app/shared/models';
import { PageEnum } from 'src/app/shared/enums';
import { SimulationFormComponent } from '../simulation-sections/simulation-form/simulation-form.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BestRegionTableComponent } from '../simulation-sections/best-region-table/best-region-table.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ChartTypeEnum } from 'src/app/shared/components/chart/chart.models';
import { ChartConstructorType } from 'highcharts-angular';
import { ChartComponent } from 'src/app/shared/components/chart/chart.component';
import { SimulationCalculationService } from '../simulation-sections/Services/simulation-calculation.service';
import { SavedAnalysisComponent } from 'src/app/modules/analytics/components/saved-analysis/saved-analysis.component';
import { RouterModule } from '@angular/router';
import { BlockUiService, SimulationService } from 'src/app/shared/services';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { take, filter } from 'rxjs/operators';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { BestRegionAnalyticsDto, ListBestRegionAnalyticsDto } from '../../models/best-region-analytics.model';
import { UserModel } from 'src/app/modules/settings/models';

@Component({
  selector: 'app-best-region-source',
  templateUrl: './best-region-source.component.html',
  styleUrls: ['./best-region-source.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SimulationFormComponent,
    BestRegionTableComponent,
    MatExpansionModule,
    RouterModule,
    MatTabsModule,
    ChartComponent,
    SavedAnalysisComponent,
    MatIconModule,
    MatMenuModule,
  ],
})
export class BestRegionSourceComponent {
  public simulationResult: SimulationTotalCostDto[] = [];
  public simulationFormData: SimulationForm;
  public partInfo: any;
  public pageEnum = PageEnum;
  public isRunAnalysisClicked = false;
  chartType: ChartTypeEnum = ChartTypeEnum.Column;
  chartConstructor: ChartConstructorType = 'chart';
  chartHeight: number = 420;
  selectedCountries: CountryDataMasterDto[];
  simulationCalculationService = inject(SimulationCalculationService);
  public isEditMode = false;
  public analysisName = 'New Analysis';
  public tempAnalysisName = 'New Analysis';
  public selectedProject: ProjectInfoDto;
  public selectedPart: PartInfoDto;
  public isSaving = false;
  public selectedTabIndex = 0;
  public currentAnalysisId: number | null = null;
  public currentUser: UserModel | null = null;
  @ViewChild(SimulationFormComponent) simulationFormComponent: SimulationFormComponent;
  @ViewChild(ChartComponent) chartComponent!: ChartComponent;
  @ViewChild(SavedAnalysisComponent) savedAnalysisComponent: SavedAnalysisComponent;
  private simulationService = inject(SimulationService);
  private blockUiService = inject(BlockUiService);
  private messagingService = inject(MessagingService);
  private userInfoService = inject(UserInfoService);

  constructor() {
    this.userInfoService
      .getUserValue()
      .pipe(
        filter((user): user is UserModel => !!user),
        take(1)
      )
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  compileResult(simulationResult: SimulationTotalCostDto[]) {
    simulationResult.forEach((result) => (result.selectedCountriesCount = this.selectedCountries.length));
    this.simulationResult = simulationResult;
    this.simulationFormComponent && (this.simulationFormComponent.saveNeeded = true);
  }

  assignPart(partInfo: any) {
    this.partInfo = partInfo;
  }

  runSimulation($event) {
    this.isRunAnalysisClicked = true;
    this.simulationResult = [];
    this.selectedProject = $event.selectedProject;
    this.selectedPart = $event.selectedPart;
    this.selectedCountries = $event.selectedCountries;
    this.simulationCalculationService.runSimulation($event).subscribe((result) => {
      this.compileResult(result);
    });
    this.simulationFormComponent.showLoader = true;
  }

  reInitFetch(_event: any) {
    this.isRunAnalysisClicked = false;
    this.simulationResult = [];
    this.simulationFormComponent && (this.simulationFormComponent.saveNeeded = false);
  }
  enableEdit() {
    this.tempAnalysisName = this.analysisName;
    this.isEditMode = true;
  }

  saveEdit() {
    const trimmed = this.tempAnalysisName?.trim();
    this.analysisName = trimmed ? trimmed : 'New Analysis';
    this.isEditMode = false;
  }

  cancelEdit() {
    this.tempAnalysisName = this.analysisName;
    this.isEditMode = false;
  }
  resetToInitialState() {
    this.isRunAnalysisClicked = false;
    this.simulationResult = [];
    this.isEditMode = false;
    this.analysisName = 'New Analysis';
    this.tempAnalysisName = 'New Analysis';
    this.currentAnalysisId = null;
    this.simulationFormComponent && (this.simulationFormComponent.saveNeeded = false);
  }

  loadCopiedAnalysis(analysis: BestRegionAnalyticsDto) {
    if (!analysis) {
      return;
    }
    console.log('Loading saved analysis:', {
      analysisName: analysis.analysisName,
      projectInfoId: analysis.projectInfoId,
      scenarioId: analysis.scenarioId,
      partInfoId: analysis.partInfoId,
      simulationDataCount: analysis.simulationTotalCostDto?.length || 0,
    });
    this.isRunAnalysisClicked = true; // Set this to true so the form header displays
    this.applyAnalysisState(analysis);
    this.patchChildFormAfterStable(analysis);
    setTimeout(() => {
      this.selectedTabIndex = 0;
    }, 0);
  }

  private applyAnalysisState(analysis: BestRegionAnalyticsDto) {
    this.currentAnalysisId = analysis.bestRegionAnalyticsId || null;
    this.analysisName = analysis.analysisName || 'New Analysis';
    this.tempAnalysisName = this.analysisName;
    const simulationData = analysis.simulationTotalCostDto || [];
    this.simulationResult = simulationData.length > 0 ? JSON.parse(JSON.stringify(simulationData)) : [];
    const countryMap = new Map<number, CountryDataMasterDto>();
    this.simulationResult.forEach((result: any) => {
      if (result.countryId && !countryMap.has(result.countryId)) {
        countryMap.set(result.countryId, {
          countryId: result.countryId,
          countryName: result.countryName || `Country #${result.countryId}`,
          countryCode: result.countryCd || '',
          imputeRateOfInterest: 0,
          scrapPriceGroup: '',
          machiningScrapPriceGroup: '',
          selected: false,
          toolingLocationCountryId: 0,
          isO2: '',
          isO3: '',
          packagingPriceMultiplier: 0,
          regionId: result.regionId || 0,
          annualHours: result.annualHours,
        });
      }
    });
    this.selectedCountries = Array.from(countryMap.values());
    this.simulationResult.forEach((result) => (result.selectedCountriesCount = this.selectedCountries.length));

    if (analysis.projectInfoId) {
      this.selectedProject = {
        projectInfoId: analysis.projectInfoId,
        projectName: analysis.projectName,
        // Provide safe defaults to avoid undefined values during rerun
        createDate: (analysis as any).projectCreateDate || new Date().toISOString(),
        marketMonth: (analysis as any).marketMonth,
        marketQuarter: (analysis as any).marketQuarter,
      } as any;
    }

    if (analysis.partInfoId && analysis.scenarioId) {
      const resolvedPartName = analysis.partName || (analysis as any).partInfoName;
      const sampleResult = this.simulationResult?.[0];
      this.selectedPart = {
        partInfoId: analysis.partInfoId,
        scenarioId: analysis.scenarioId,
        partName: resolvedPartName,
        intPartNumber: resolvedPartName,
        scenarioName: analysis.scenarioName,
        // use manufacturing country from saved result if present to avoid missing data on rerun
        mfrCountryId: sampleResult?.mfrCountryId ?? sampleResult?.countryId ?? 0,
      } as any;
    }
  }

  private patchChildFormAfterStable(analysis: BestRegionAnalyticsDto) {
    setTimeout(() => {
      if (!this.simulationFormComponent) {
        console.warn('SimulationFormComponent not ready yet');
        return;
      }

      console.log('Patching child form with analysis data:', {
        selectedProject: this.selectedProject,
        selectedPart: this.selectedPart,
        scenarioId: analysis.scenarioId,
        selectedCountries: this.selectedCountries?.length,
      });

      this.simulationFormComponent.showLoader = false;
      this.simulationFormComponent.saveNeeded = false;
      this.simulationFormData = {
        project: this.selectedProject,
        part: {
          projectInfoId: analysis.projectInfoId,
          setValue: true,
          partId: analysis.partInfoId,
        },
        countries: this.selectedCountries,
        selectAll: false,
        processes: [],
      };

      this.simulationFormComponent.simulationFormData = this.simulationFormData;

      setTimeout(() => {
        console.log('Directly patching project, scenario and part values', {
          projectInfoId: analysis.projectInfoId,
          selectedProject: this.selectedProject,
          scenarioId: analysis.scenarioId,
          partInfoId: analysis.partInfoId,
        });
        if (analysis.projectInfoId && this.selectedProject) {
          this.simulationFormComponent.selectedProject = this.selectedProject;
          this.simulationFormComponent.simulationform.patchValue({ projectInfoId: analysis.projectInfoId });
        }
        if (analysis.scenarioId) {
          this.simulationFormComponent.simulationform.patchValue({ scenarioId: analysis.scenarioId });
        }
        if (analysis.partInfoId) {
          this.simulationFormComponent.simulationform.patchValue({ partId: analysis.partInfoId });
          this.simulationFormComponent.selectedPart = { partInfoId: analysis.partInfoId } as any;
        }
        if (this.selectedCountries && this.selectedCountries.length > 0) {
          this.simulationFormComponent.selectedCountries = this.selectedCountries;
          this.simulationFormComponent.simulationform.patchValue({ countryList: this.selectedCountries });
        }
      }, 300);
    }, 0);
  }

  saveSimulationResult() {
    if (this.isSaving) {
      return;
    }

    if (!this.selectedProject || !this.selectedPart || !this.simulationResult?.length) {
      this.messagingService.openSnackBar('Run analysis before saving.', '', { duration: 3000 });
      return;
    }

    const partLabel = this.selectedPart.partInfoName || this.selectedPart.intPartNumber || '';
    const dto: BestRegionAnalyticsDto = {
      bestRegionAnalyticsId: 0,
      projectInfoId: this.selectedProject.projectInfoId,
      partInfoId: this.selectedPart.partInfoId,
      scenarioId: this.selectedPart.scenarioId,
      analysisName: this.analysisName?.trim() || 'New Analysis',
      simulationTotalCostDto: this.simulationResult,
      isDeleted: false,
      createdUserId: this.currentUser?.userId,
      modifiedUserId: this.currentUser?.userId,
      createdBy: this.currentUser?.userName,
      projectName: this.selectedProject.projectName || '',
      scenarioName: this.selectedPart.scenarioName || '',
      partName: partLabel,
      partInfoName: partLabel,
    };
    console.log(' SAVING Analysis - Data being saved:', {
      analysisName: dto.analysisName,
      projectInfoId: dto.projectInfoId,
      partInfoId: dto.partInfoId,
      scenarioId: dto.scenarioId,
      simulationDataCount: dto.simulationTotalCostDto.length,
      sampleData: dto.simulationTotalCostDto[0],
      allCountries: dto.simulationTotalCostDto.map((x) => ({
        country: x.countryName,
        materialCost: x.materialTotalCost,
        processCost: x.processTotalCost,
        toolingCost: x.toolingTotalCost,
        totalESG: x.totalCostESG,
      })),
    });

    this.isSaving = true;
    this.blockUiService.pushBlockUI('saveBestRegionAnalytics');
    const payload: ListBestRegionAnalyticsDto = {
      BestRegionAnalyticsDtos: [dto],
    };
    this.simulationService.saveBestRegionAnalytics(payload).subscribe({
      next: () => {
        this.messagingService.openSnackBar('Analysis saved successfully.', '', { duration: 4000 });
        this.simulationFormComponent && (this.simulationFormComponent.saveNeeded = false);
        // Pop block UI immediately after successful save
        this.blockUiService.popBlockUI('saveBestRegionAnalytics');
        this.isSaving = false;
        // Refresh Saved tab in background (shows its own loading indicator)
        if (this.savedAnalysisComponent) {
          this.savedAnalysisComponent.loadSavedAnalyses();
        }
        setTimeout(() => {
          this.selectedTabIndex = 1;
        }, 500);
      },
      error: (err) => {
        this.messagingService.openSnackBar('Save failed. Please try again.', '', { duration: 4000 });
        console.error('BestRegion save failed', err);
        this.blockUiService.popBlockUI('saveBestRegionAnalytics');
        this.isSaving = false;
      },
    });
  }

  makeCopyInNewTab() {
    if (!this.simulationResult || this.simulationResult.length === 0) {
      this.messagingService.openSnackBar('No analysis results to copy. Please run analysis first.', '', { duration: 3000 });
      return;
    }
    if (!this.selectedProject || !this.selectedPart) {
      this.messagingService.openSnackBar('Missing project or part information', '', { duration: 3000 });
      return;
    }
    const currentAnalysis: BestRegionAnalyticsDto = {
      bestRegionAnalyticsId: this.currentAnalysisId || 0,
      projectInfoId: this.selectedProject.projectInfoId,
      partInfoId: this.selectedPart.partInfoId,
      scenarioId: this.selectedPart.scenarioId,
      analysisName: this.analysisName,
      simulationTotalCostDto: this.simulationResult,
      isDeleted: false,
    };
    this.loadCopiedAnalysis(currentAnalysis);
  }

  deleteCurrentAnalysis() {
    if (!this.currentAnalysisId) {
      this.messagingService.openSnackBar('No saved analysis to delete. This is an unsaved analysis.', '', { duration: 3000 });
      return;
    }
    this.messagingService
      .openConfirmationDialog({
        data: {
          title: 'Confirm Delete',
          message: `Are you sure you want to delete "${this.analysisName}"?`,
          action: 'DELETE',
          cancelText: 'CANCEL',
        },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed && this.currentAnalysisId) {
          const idToDelete = this.currentAnalysisId;
          this.blockUiService.pushBlockUI('deleteAnalysis');
          this.simulationService.deleteBestRegionAnalytics(idToDelete).subscribe({
            next: () => {
              this.messagingService.openSnackBar('Analysis deleted successfully.', '', { duration: 4000 });
              this.blockUiService.popBlockUI('deleteAnalysis');
              this.resetToInitialState();
              if (this.savedAnalysisComponent) {
                this.savedAnalysisComponent.loadSavedAnalyses();
              }
              setTimeout(() => {
                this.selectedTabIndex = 1;
              }, 300);
            },
            error: (err) => {
              console.error('Failed to delete analysis', err);
              this.messagingService.openSnackBar('Failed to delete analysis. Please try again.', '', { duration: 4000 });
              this.blockUiService.popBlockUI('deleteAnalysis');
            },
          });
        }
      });
  }
}
