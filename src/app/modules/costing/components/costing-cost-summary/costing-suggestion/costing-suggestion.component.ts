import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, effect } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AiSearchService, BlockUiService } from 'src/app/shared/services';
import { AICategoryDto, CommodityMasterDto, PartInfoDto, ProcessInfoDto, ProcessMasterDto, ViewCostSummaryDto } from 'src/app/shared/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from '../../../services/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { Store } from '@ngxs/store';
import { ProcessMasterState } from 'src/app/modules/_state/process-master.state';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AiCommonService } from 'src/app/shared/services/ai-common-service';
import { ProcessType } from '../../../costing.config';
import { ManufacturingConfigService } from 'src/app/shared/config/cost-manufacturing-config';
import { CommodityState } from 'src/app/modules/_state/commodity.state';
// import { CostSummaryState } from 'src/app/modules/_state/cost-summary.state';
import { AiCostingManufacturingSuggestionInfo, AiCostingMaterialSuggestionInfo, AiCostingSuggestionDto } from 'src/app/modules/ai-search/models/ai-image-similarity-result';
import { CostSummaryHelper } from 'src/app/shared/services/cost-summary-helper';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

@Component({
  selector: 'app-costing-suggestion',
  templateUrl: './costing-suggestion.component.html',
  styleUrls: ['./costing-suggestion.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatIconModule],
})
export class CostingSuggestionComponent implements OnInit, AfterViewInit {
  @Input() partId: number;
  @Input() commodityId?: number;
  @ViewChild('notesEditor') notesEditor!: ElementRef<HTMLDivElement>;
  partInfoDtos?: PartInfoDto[];
  displayedColumns: string[] = ['materialDescription', 'similarityScore', 'avgScore', 'projectInfoIds'];
  displayedColumnsManufacturing: string[] = ['machineDescription', 'similarityScore', 'avgScore', 'projectInfoIds'];
  displayedColumnsCategory: string[] = ['category', 'accuracy'];
  displayedColumnsProcess: string[] = ['processGroup', 'accuracy'];
  currentSuggestedPart?: PartInfoDto;
  _processMasterData$: Observable<ProcessMasterDto[]>;
  _commodityMasterData$: Observable<CommodityMasterDto[]>;
  processMasterDict: { [key: number]: ProcessMasterDto } = {};
  // _costAllSummary$: Observable<{ [key: number]: ViewCostSummaryDto }>;
  processMasterDataList: ProcessMasterDto[] = [];
  currentPartCommodity?: CommodityMasterDto;
  secondaryProcesses: ProcessMasterDto[] = [];
  currentSuggestedThumbnail = '';
  processTypeId = ProcessType;
  costSummaryViewData: ViewCostSummaryDto;
  costingNotesText?: HTMLDivElement;
  dataSource: AiCostingSuggestionDto[] = [];
  materialInfoDataSource: AiCostingMaterialSuggestionInfo[] = [];
  manufacturingCategory = '';
  manufactutingCategoryDto?: AICategoryDto[];
  processGroupDto?: { processGroup: string; accuracy: number; projectInfoIds?: number[] }[] = [];
  processInfoDataSource: AiCostingManufacturingSuggestionInfo[] = [];
  aiSuggestionFinal: any;
  manufacturingCategoryFromPdf = '';
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();
  costSummaryEffect = effect(() => {
    const costAllSummarys = this.costSummarySignalsService.costSummaryAll();
    if (this.partId && costAllSummarys && costAllSummarys?.[this.partId]) {
      this.costSummaryViewData = costAllSummarys[this.partId];
      this.getPdfExtractionInfo();
    }
  });

  constructor(
    private readonly aiService: AiSearchService,
    private readonly activeModal: NgbActiveModal,
    private readonly sharedService: SharedService,
    private readonly store: Store,
    private readonly router: Router,
    private readonly aiCommonService: AiCommonService,
    private readonly _manufacturingConfig: ManufacturingConfigService,
    private readonly blockUIService: BlockUiService,
    private readonly costSummaryHelper: CostSummaryHelper,
    private readonly costSummarySignalsService: CostSummarySignalsService
  ) {
    this._processMasterData$ = this.store.select(ProcessMasterState.getAllProcessMasterData);
    this._commodityMasterData$ = this.store.select(CommodityState.getCommodityData);
    // this._costAllSummary$ = this.store.select(CostSummaryState.getAllCostSummarys);
  }

  ngOnInit(): void {
    this.getProcessMaster();
  }

  dismissAll() {
    this.activeModal.close();
  }

  ngAfterViewInit(): void {
    this.costingNotesText = this.notesEditor?.nativeElement;
    this.getPdfExtractionInfo();
  }

  private setDataSource() {
    this.blockUIService.pushBlockUI('loading suggestions');
    this.aiService
      .getSuggestedMaterialDescriptionFrom3d(this.partId, this.currentPartCommodity?.commodity, true)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          if (!Array.isArray(response)) {
            this.blockUIService.popBlockUI('loading suggestions');
            return;
          }
          this.dataSource = response;

          this.materialInfoDataSource = [];
          this.processInfoDataSource = [];
          this.processGroupDto = [];

          this.populateSuggestionLists(response);

          this.processGroupDto = this.processGroupDto?.filter((obj, index, self) => index === self.findIndex((t) => t.processGroup === obj.processGroup));

          this.formatMaterialDataSource();
          this.formatManufacturingDataSource();
          this.blockUIService.popBlockUI('loading suggestions');
        },
      });
  }

  private populateSuggestionLists(response: AiCostingSuggestionDto[]): void {
    for (const item of response ?? []) {
      if (item.materialInfoDtos) {
        for (const material of item.materialInfoDtos) {
          this.materialInfoDataSource.push({
            partInfoId: item.partInfoId,
            projectInfoId: item.projectInfoId,
            materialDescription: material.materialDescription,
            processName: this.processMasterDataList.find((x) => x.processId === material.processId)?.primaryProcess,
            similarityScore: this.sharedService.isValidNumber(item.similarityScore),
            avgScore: this.sharedService.isValidNumber(item.avgScore * 100),
            manufacturingCategory: this.manufacturingCategory ?? 'Fetching Manufacturing Category...',
          });
          this.processGroupDto?.push({
            processGroup: this.processMasterDataList.find((x) => x.processId === material.processId)?.primaryProcess ?? '',
            accuracy: this.sharedService.isValidNumber(item.avgScore * 100),
          });
        }
      }

      if (item.processInfoDtos) {
        for (const process of item.processInfoDtos) {
          const secondaryProcess = this.secondaryProcesses.find((x) => x.processId === process.processTypeID);
          if (secondaryProcess) {
            this.processInfoDataSource.push({
              partInfoId: item.partInfoId,
              projectInfoId: item.projectInfoId,
              processName: secondaryProcess?.primaryProcess,
              machineDescription: process.machineDescription,
              similarityScore: this.sharedService.isValidNumber(item.similarityScore),
              avgScore: this.sharedService.isValidNumber(item.avgScore) * 100,
            });
          }
        }
      }
    }
  }

  getProcessMaster() {
    this._processMasterData$
      .pipe(
        filter((r) => r?.length > 0),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: ProcessMasterDto[]) => {
        this._commodityMasterData$
          .pipe(
            filter((r) => r?.length > 0),
            takeUntil(this.unsubscribe$)
          )
          .subscribe({
            next: (commodityData) => {
              this.currentPartCommodity = commodityData.find((commodity) => commodity.commodityId === this.commodityId);
              this.processMasterDataList = result;
              this.secondaryProcesses = result.filter((process) => process.groupName === 'Secondary Process');
              this.processMasterDict = result.map((x) => ({ [x.processId ?? 0]: x })).reduce((a, b) => ({ ...a, ...b }), {});
              this.setDataSource();
              this.loadAiSuggestion();
            },
          });
      });
  }

  getPdfExtractionInfo() {
    // this.costingNotesText = '';
    // this.aiService
    //   .getUpdatedManufacturingCategory(this.partId)
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe({
    //     next: (manufacturingCategory) => {
    //       if (manufacturingCategory) {
    //         if (this.materialInfoDataSource.length > 0) {
    //           for (const material of this.materialInfoDataSource) {
    //             material.manufacturingCategory = manufacturingCategory;
    //           }
    //         } else {
    //           this.manufacturingCategory = manufacturingCategory;
    //         }
    //         this.costingNotesText = `Suggested Manufacturing Category: ${manufacturingCategory}` + '\r\n' + this.costingNotesText;
    //       }
    //     },
    //   });
    // this._costAllSummary$.pipe(takeUntil(this.unsubscribe$)).subscribe((summaryResult: { [key: number]: ViewCostSummaryDto }) => {
    // if (this.partId && summaryResult?.[this.partId]) {
    //   this.costSummaryViewData = summaryResult[this.partId];
    const summaryNotes = this.costSummaryHelper.getSummaryNotes(this.costSummaryViewData?.suggestedCategoryNotes, this.costSummaryViewData?.nestingNotes, this.costSummaryViewData?.costingNotes);
    this.costingNotesText = this.notesEditor?.nativeElement;
    if (this.costingNotesText) {
      this.costingNotesText.innerHTML = summaryNotes;
    }
    // }
    // });
  }

  goToCosting(projectInfoId: number) {
    const url = this.router.serializeUrl(this.router.createUrlTree([`/costing/${projectInfoId}`]));
    window.open(url, '_blank');
  }

  open3DViewer() {
    if (this.currentSuggestedPart) {
      this.aiCommonService.open3DViewer(this.currentSuggestedPart);
    }
  }

  getSubTypeNamebyId(processInfo: ProcessInfoDto) {
    if (processInfo.processTypeID === ProcessType.ColdHeading || processInfo.processTypeID === ProcessType.ClosedDieForging) {
      return this._manufacturingConfig._manufacturingForgingSubProcessConfigService.getSubTypeNamebyId(processInfo);
    } else if ([ProcessType.Stage, ProcessType.Progressive].includes(processInfo.processTypeID)) {
      return this._manufacturingConfig._sheetMetalConfig.getSubTypeNamebyId(processInfo);
    } else {
      return this._manufacturingConfig._electronics.getSubTypeNamebyId(processInfo);
    }
  }

  private formatMaterialDataSource(): void {
    const materialDescriptionProjectInfos = this.materialInfoDataSource.reduce(
      (acc, suggestion) => {
        const key = suggestion.materialDescription;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(suggestion.projectInfoId);
        return acc;
      },
      {} as { [key: string]: number[] }
    );
    for (const material of this.materialInfoDataSource) {
      material.projectInfoIds = materialDescriptionProjectInfos[material.materialDescription];
    }

    this.materialInfoDataSource = this.materialInfoDataSource.filter((person, index, self) => index === self.findIndex((p) => p.materialDescription === person.materialDescription));
  }

  private formatManufacturingDataSource(): void {
    const materialDescriptionProjectInfos = this.processInfoDataSource.reduce(
      (acc, suggestion) => {
        const key = suggestion.machineDescription;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(suggestion.projectInfoId);
        return acc;
      },
      {} as { [key: string]: number[] }
    );
    for (const material of this.processInfoDataSource) {
      material.projectInfoIds = materialDescriptionProjectInfos[material.machineDescription];
    }

    this.processInfoDataSource = this.processInfoDataSource.filter((person, index, self) => index === self.findIndex((p) => p.machineDescription === person.machineDescription));
  }

  private loadAiSuggestion() {
    this.blockUIService.pushBlockUI('loadAiSuggestion');
    this.aiService
      .getComprehensiveSuggestion(this.partId, this.currentPartCommodity?.commodity)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (respose: AiCostingSuggestionDto[]) => {
          this.aiSuggestionFinal = respose;
          this.blockUIService.popBlockUI('loadAiSuggestion');
        },
        error: () => {
          this.blockUIService.popBlockUI('loadAiSuggestion');
        },
      });
  }
}
