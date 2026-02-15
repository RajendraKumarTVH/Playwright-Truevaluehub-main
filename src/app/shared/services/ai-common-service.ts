import { Injectable } from '@angular/core';
import { AiSuggestedData } from '../models/ai-suggested-data';
import { filter, Observable, Subject, take, takeUntil } from 'rxjs';
import { AiImageAction } from '../models/ai-image-action';
import { AiCostingMaterialSuggestionInfo, AiSearchTileExtractionInfoDto } from 'src/app/modules/ai-search/models/ai-image-similarity-result';
import { BlockUiService } from './block-ui.service';
import { AiSearchService } from './ai-search.service';
import { CadViewerPopupComponent } from 'src/app/modules/costing/components/cad-viewer-popup/cad-viewer-popup.component';
import { CommodityMasterDto, PartInfoDto } from '../models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MaterialInfoService } from './material-info.service';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { Store } from '@ngxs/store';
import { CommodityState } from 'src/app/modules/_state/commodity.state';
import { MaterialSearchResultDto } from '../models/material-search-result-dto';
import { MaterialMasterService } from './material-master.service';

@Injectable({
  providedIn: 'root',
})
export class AiCommonService {
  private aiSuggestedData: AiSuggestedData[] = [];
  public materialDescriptionDetails?: string;
  childPartDetailsClick = new Subject<AiImageAction>();
  aiSuggestionRetrivedSubject = new Subject<any>();
  _commodityMasterData$: Observable<CommodityMasterDto[]>;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private blockUiService: BlockUiService,
    private searchService: AiSearchService,
    private modalService: NgbModal,
    private materialInfoService: MaterialInfoService,
    private messaging: MessagingService,
    private _store: Store,
    private aiSearchService: AiSearchService,
    private materialMasterService: MaterialMasterService
  ) {
    this._commodityMasterData$ = this._store.select(CommodityState.getCommodityData);
  }

  public addAiSuggestedCommentData(aiSuggestedData: AiSuggestedData): void {
    const existingData = this.aiSuggestedData.find((x) => x.partInfoId === aiSuggestedData.partInfoId && x.fieldName === aiSuggestedData.fieldName);
    if (!existingData) this.aiSuggestedData.push(aiSuggestedData);
  }

  public getAiSuggestedCommentData(data: AiSuggestedData): AiSuggestedData | undefined {
    return this.aiSuggestedData.find((x) => x.partInfoId.toString() === data.partInfoId.toString() && x.fieldName === data.fieldName);
  }

  public clearAiSuggestedData(aiSuggestedData: AiSuggestedData) {
    const existingDataIndex = this.aiSuggestedData.findIndex((x) => x.partInfoId === aiSuggestedData.partInfoId && x.fieldName === aiSuggestedData.fieldName);
    if (existingDataIndex != -1) this.aiSuggestedData = this.aiSuggestedData.splice(existingDataIndex, 1);
  }

  open3DViewer(pidSearch: PartInfoDto) {
    this.blockUiService.pushBlockUI('open3DViewer');
    this.searchService
      .getExtractionInfo([pidSearch.partInfoId])
      .pipe(take(1))
      .subscribe({
        next: (result: AiSearchTileExtractionInfoDto[]) => {
          const item = result[0];
          const extractedData = {
            material: JSON.parse(item?.materialInfoJson),
            process: JSON.parse(item?.processInfoJson),
          };

          const fileName = item.fileName;
          const modalRef = this.modalService.open(CadViewerPopupComponent, {
            windowClass: 'fullscreen',
          });
          modalRef.componentInstance.fileName = fileName;
          modalRef.componentInstance.partData = {
            caller: 'bom-details',
            partId: pidSearch.partInfoId,
            volume: extractedData?.material?.DimVolume,
            surfaceArea: extractedData?.material?.DimArea,
            dimentions: {
              dimX: extractedData?.material?.DimX,
              dimY: extractedData?.material?.DimY,
              dimZ: extractedData?.material?.DimZ,
            },
            centerMass: {
              centroidX: extractedData?.process?.CentroidX,
              centroidY: extractedData?.process?.CentroidY,
              centroidZ: extractedData?.process?.CentroidZ,
            },
          };
          this.blockUiService.popBlockUI('open3DViewer');
        },
      });
  }

  getAiSuggestedMaterialInfo(currentPart: PartInfoDto) {
    if (currentPart?.partInfoId && currentPart?.mfrCountryId && currentPart?.mfrCountryId != 0) {
      // this.materialInfoService
      //   .getMaterialInfosByPartInfoId(currentPart.partInfoId)
      //   .pipe(takeUntil(this.unsubscribe$))
      //   .subscribe((result) => {
      // if (!result || result.length === 0) {
      this._commodityMasterData$
        .pipe(
          filter((r) => r?.length > 0),
          takeUntil(this.unsubscribe$)
        )
        .subscribe({
          next: (commodityData) => {
            const currentPartCommodity = commodityData.find((commodity) => commodity.commodityId === currentPart.commodityId)?.commodity;
            let aiMaterialInfoDtos: AiCostingMaterialSuggestionInfo[] = [];
            this.aiSearchService
              .getSuggestedMaterialDescriptionFrom3d(currentPart.partInfoId, currentPartCommodity)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe({
                next: (res: any) => {
                  if (!res || Object.keys(res).length === 0 || res?.length === 0) {
                    return;
                  }
                  this.messaging.openSnackBar(`Our AI is costing this part, please wait for a moment to see the costing details...`, '', {
                    duration: 50000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                  });
                  res.forEach((item) => {
                    item.materialInfoDtos?.forEach((material) => {
                      if (item.avgScore > 0.9) {
                        aiMaterialInfoDtos.push({
                          partInfoId: item.partInfoId,
                          projectInfoId: item.projectInfoId,
                          materialDescription: material.materialDescription,
                          materialFamily: material.materialFamily,
                          materialGroupId: material.categoryId,
                          processId: material.processId,
                          // processName: this.processMasterDataList.find((x) => x.processId === material.processId)?.primaryProcess,
                          // similarityScore: this.sharedService.isValidNumber(item.similarityScore),
                          // avgScore: this.sharedService.isValidNumber(item.avgScore) * 100
                        });
                      }
                    });
                  });
                  if (aiMaterialInfoDtos.length > 0) {
                    const mostSuggestedPart = aiMaterialInfoDtos[aiMaterialInfoDtos.length - 1];
                    this.materialMasterService
                      .getMaterialDataByDescription(mostSuggestedPart.materialDescription)
                      .pipe(takeUntil(this.unsubscribe$))
                      .subscribe((result: MaterialSearchResultDto[]) => {
                        if (result && result.length > 0) {
                          this.aiSuggestionRetrivedSubject.next({ materialSearchResult: result, mostSuggestedPart: mostSuggestedPart });
                        }
                      });
                  } else {
                    this.messaging.openSnackBar(`AI could not cost this part...`, '', { duration: 2000, horizontalPosition: 'center' });
                  }
                },
              });
          },
        });
      // }
      // });
    }
  }
}
