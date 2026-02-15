import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { AiSearchTileExtractionInfoDto } from 'src/app/modules/ai-search/models/ai-image-similarity-result';
import { CadViewerPopupComponent } from 'src/app/modules/costing/components/cad-viewer-popup/cad-viewer-popup.component';
import { BlockUiService, AiSearchService } from '../services';

@Injectable({
  providedIn: 'root',
})
export class PartThumbnailHelperService {
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  constructor(
    private blockUiService: BlockUiService,
    private searchService: AiSearchService,
    private modalService: NgbModal
  ) {}
  public onPartThumbnailClick(partInfoId: number) {
    this.blockUiService.pushBlockUI('open3DViewer');
    this.searchService
      .getExtractionInfo([partInfoId])
      .pipe(takeUntil(this.unsubscribeAll$))
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
            partId: partInfoId,
            volume: extractedData?.material?.DimVolume,
            surfaceArea: extractedData?.material?.DimArea,
            projectedArea: extractedData?.material?.ProjectedArea,
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
}
