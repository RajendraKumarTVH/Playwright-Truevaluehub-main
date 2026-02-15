import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, inject, Output, EventEmitter } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SimulationService } from 'src/app/shared/services';
import { BestRegionAnalyticsDto } from '../../models/best-region-analytics.model';
import { SimulationTotalCostDto } from '../../models/simulationTotalCostDto.model';
import { CommonModule } from '@angular/common';
import { finalize, filter, take } from 'rxjs/operators';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { UserModel } from 'src/app/modules/settings/models';
// import { MatSort } from '@angular/material/sort';
const ELEMENT_DATA: Analysis[] = [];

export interface Analysis {
  bestRegionAnalyticsId?: number;
  analysisName: string;
  projectName: string;
  scenario: string;
  partName: string;
  partModel: string;
  createdBy: string;
  createdDate: string;
  fullData?: BestRegionAnalyticsDto; // Store full data for copying
}

@Component({
  selector: 'app-saved-analysis',
  templateUrl: './saved-analysis.component.html',
  styleUrls: ['./saved-analysis.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    MatTabsModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TableModule,
  ],
})
export class SavedAnalysisComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @Output() copyAnalysisEmit = new EventEmitter<BestRegionAnalyticsDto>();
  @Output() openAnalysisEmit = new EventEmitter<BestRegionAnalyticsDto>();

  displayedColumns: string[] = ['analysisName', 'projectName', 'scenario', 'partName', 'partModel', 'createdBy', 'createdDate', 'actions'];
  public dataSource = new MatTableDataSource(ELEMENT_DATA);
  analyses: Analysis[] = [];
  isLoading = false;
  private simulationService = inject(SimulationService);
  private messagingService = inject(MessagingService);
  private userInfoService = inject(UserInfoService);
  private currentUser: UserModel | null = null;

  ngAfterViewInit() {
    this.userInfoService
      .getUserValue()
      .pipe(
        filter((user): user is UserModel => !!user),
        take(1)
      )
      .subscribe((user) => {
        this.currentUser = user;
      });

    this.dataSource.sort = this.sort;
    this.loadSavedAnalyses();
  }

  loadSavedAnalyses() {
    this.isLoading = true;
    this.simulationService
      .getBestRegionAnalyticsList()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data: BestRegionAnalyticsDto[]) => {
          const activeRecords = data.filter((item) => !item.isDeleted);
          this.analyses = activeRecords.map((item) => this.mapAnalysisData(item));
          this.dataSource.data = this.analyses;
        },
        error: (err) => {
          console.error('Failed to load saved analyses', err);
          this.messagingService.openSnackBar('Failed to load saved analyses', '', { duration: 3000 });
        },
      });
  }

  openAnalysis(analysisId: number) {
    if (!analysisId) {
      return;
    }
    const selectedAnalysisItem = this.analyses.find((item) => item.bestRegionAnalyticsId === analysisId);
    if (!selectedAnalysisItem?.fullData) {
      this.messagingService.openSnackBar('Analysis data not found', '', { duration: 3000 });
      return;
    }
    const baseData = selectedAnalysisItem.fullData;
    const simulationData = Array.isArray(baseData.simulationTotalCostDto) ? baseData.simulationTotalCostDto : [];
    this.emitAnalysis(baseData, simulationData);
  }

  private emitAnalysis(baseData: BestRegionAnalyticsDto, simulationData: SimulationTotalCostDto[]) {
    const analysis: BestRegionAnalyticsDto = {
      bestRegionAnalyticsId: baseData.bestRegionAnalyticsId!,
      projectInfoId: baseData.projectInfoId!,
      partInfoId: baseData.partInfoId!,
      scenarioId: baseData.scenarioId!,
      analysisName: baseData.analysisName || 'Analysis',
      simulationTotalCostDto: simulationData && simulationData.length > 0 ? JSON.parse(JSON.stringify(simulationData)) : [],
      isDeleted: false,
      createDate: baseData.createDate,
      modifiedDate: baseData.modifiedDate,
      createdUserId: baseData.createdUserId,
      modifiedUserId: baseData.modifiedUserId,
      projectName: baseData.projectName,
      scenarioName: baseData.scenarioName,
      partName: baseData.partName || (baseData as any).partInfoName,
      partInfoName: (baseData as any).partInfoName || baseData.partName,
      partModel: baseData.partModel,
      createdBy: baseData.createdBy,
    };
    this.openAnalysisEmit.emit(analysis);
  }

  makeACopy(analysisId: number) {
    if (!analysisId) {
      return;
    }
    const selectedAnalysisItem = this.analyses.find((item) => item.bestRegionAnalyticsId === analysisId);
    if (!selectedAnalysisItem?.fullData) {
      this.messagingService.openSnackBar('Analysis data not found', '', { duration: 3000 });
      return;
    }
    const baseData = selectedAnalysisItem.fullData;

    this.simulationService.getBestRegionAnalyticsList().subscribe({
      next: (latestData: BestRegionAnalyticsDto[]) => {
        const activeRecords = latestData.filter((item) => !item.isDeleted);
        this.analyses = activeRecords.map((item) => this.mapAnalysisData(item));
        this.dataSource.data = this.analyses;
        const refreshed = this.analyses.find((a) => a.bestRegionAnalyticsId === analysisId)?.fullData;
        this.processSourceForCopy(refreshed || baseData);
      },
      error: () => {
        this.processSourceForCopy(baseData);
      },
    });
  }

  private mapAnalysisData(item: BestRegionAnalyticsDto): Analysis {
    const createdBy = item.createdBy || (item.createdUserId && this.currentUser?.userId === item.createdUserId ? this.currentUser?.userName : '') || '';

    return {
      bestRegionAnalyticsId: item.bestRegionAnalyticsId,
      analysisName: item.analysisName || 'N/A',
      projectName: item.projectName || `${item.projectInfoId}`,
      scenario: item.scenarioName || `${item.scenarioId}`,
      partName: item.partName || (item as any).partInfoName || `${item.partInfoId}`,
      partModel: 'assets/images/no-image-available.png',
      createdBy,
      createdDate: item.createDate ? new Date(item.createDate).toLocaleDateString() : 'N/A',
      fullData: item,
    };
  }

  private processSourceForCopy(source: BestRegionAnalyticsDto) {
    const snapshot = source.simulationTotalCostDto;
    if (Array.isArray(snapshot) && snapshot.length > 0) {
      this.buildAndEmitCopy(source, snapshot);
    } else {
      this.simulationService.getSimulationResult(source.partInfoId!).subscribe({
        next: (simulationData: SimulationTotalCostDto[]) => this.buildAndEmitCopy(source, simulationData),
        error: (err) => {
          console.error('Failed to load simulation data for copying', err);
          this.messagingService.openSnackBar('Failed to load simulation data', '', { duration: 3000 });
        },
      });
    }
  }

  private buildAndEmitCopy(source: BestRegionAnalyticsDto, simulationData: SimulationTotalCostDto[] | undefined) {
    const newAnalysisName = this.generateNewAnalysisName(source.analysisName || 'New');
    const selectedAnalysis: BestRegionAnalyticsDto = {
      bestRegionAnalyticsId: 0,
      projectInfoId: source.projectInfoId!,
      partInfoId: source.partInfoId!,
      scenarioId: source.scenarioId!,
      analysisName: newAnalysisName,
      simulationTotalCostDto: Array.isArray(simulationData) && simulationData.length > 0 ? JSON.parse(JSON.stringify(simulationData)) : [],
      isDeleted: false,
      createDate: undefined,
      modifiedDate: undefined,
      createdUserId: source.createdUserId,
      modifiedUserId: source.modifiedUserId,
      projectName: source.projectName,
      scenarioName: source.scenarioName,
      partName: source.partName || (source as any).partInfoName,
      partInfoName: (source as any).partInfoName || source.partName,
      partModel: source.partModel,
      createdBy: source.createdBy,
    };
    this.copyAnalysisEmit.emit(selectedAnalysis);
  }

  private generateNewAnalysisName(currentName: string): string {
    const match = currentName.match(/^(.+?)(\d+)?$/);
    const baseName = match?.[1]?.trim() || currentName;
    const relatedAnalyses = this.analyses.filter((a) => a.analysisName.startsWith(baseName));

    if (relatedAnalyses.length === 0) {
      return `${baseName}1`;
    }
    const numbers = relatedAnalyses
      .map((a) => {
        const m = a.analysisName.match(/(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => n > 0);
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `${baseName}${maxNumber + 1}`;
  }

  deleteAnalysis(analysisId: number, analysisName: string) {
    this.messagingService
      .openConfirmationDialog(<ConfirmationDialogConfig>{
        data: {
          title: 'Confirm Delete',
          message: `Are you sure you want to delete "${analysisName}"?`,
          action: 'DELETE',
          cancelText: 'CANCEL',
        },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.isLoading = true;
          this.simulationService
            .deleteBestRegionAnalytics(analysisId)
            .pipe(
              finalize(() => {
                this.isLoading = false;
              })
            )
            .subscribe({
              next: () => {
                this.messagingService.openSnackBar('Analysis deleted successfully.', '', { duration: 4000 });
                this.loadSavedAnalyses();
              },
              error: (err) => {
                console.error('Failed to delete analysis', err);
                this.messagingService.openSnackBar('Failed to delete analysis. Please try again.', '', { duration: 4000 });
              },
            });
        }
      });
  }

  applyFilter(event: Event, column: string) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: any, filter: string) => data[column].toLowerCase().includes(filter);
    this.dataSource.filter = filterValue;
  }
}
