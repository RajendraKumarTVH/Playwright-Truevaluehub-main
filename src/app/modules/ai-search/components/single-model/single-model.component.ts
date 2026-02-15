import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AiSearchService, BlockUiService } from 'src/app/shared/services';
import { AiCommonService } from 'src/app/shared/services/ai-common-service';
import { AiIntegratedInfoDto } from '../../models/ai-image-similarity-result';
import { CommodityMasterDto } from 'src/app/shared/models';
@Component({
  selector: 'app-single-model',
  templateUrl: './single-model.component.html',
  styleUrls: ['./single-model.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatTabsModule],
})
export class SingleModelComponent {
  @Input() public url: string;
  @Input() public partData: { [key: string]: any };
  @Input() public commodityList: CommodityMasterDto[];
  @ViewChild('iframeContainer') iframeContainer: ElementRef;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  existingUploadedData: AiIntegratedInfoDto;

  constructor(
    private modelService: NgbModal,
    private searchService: AiSearchService,
    private blockUiService: BlockUiService,
    private aiCommonSearchService: AiCommonService,
    private activeModal: NgbActiveModal
  ) {}

  dismissAll() {
    this.activeModal.close();
  }

  // ngAfterViewInit(): void {
  //   //this.injectIframe();
  // }

  onTabChange(event: MatTabChangeEvent) {
    const tab = event.tab.ariaLabelledby;
    if (tab === 'Parts') {
      if (this.existingUploadedData?.aiSearchListTileDtos?.length > 0) return;
      this.blockUiService.pushBlockUI('loadChildParts');
      if (this.partData.imageShowing === 'cad') {
        this.searchService
          .getAIAllChildParts(this.partData.partId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((result: any) => {
            this.blockUiService.popBlockUI('loadChildParts');
            if (result) {
              this.updateUploadedData(result);
            }
          });
        return;
      }
      this.searchService
        .getAIAllPdfParts(this.partData.partId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: any) => {
          this.blockUiService.popBlockUI('loadChildParts');
          if (result) {
            this.updateUploadedData(result);
          }
        });
    }
  }

  updateUploadedData(data: any) {
    this.existingUploadedData = data;
    this.loadManufacturingCategory();
  }

  viewProperties(part: any) {
    this.aiCommonSearchService.childPartDetailsClick.next({
      action: 'viewProperties',
      partData: part,
    });
  }

  goToCosting(part: any) {
    this.aiCommonSearchService.childPartDetailsClick.next({
      action: 'goToCosting',
      partData: part,
    });
  }

  findSimilar(part: any) {
    this.modelService.dismissAll();
    this.aiCommonSearchService.childPartDetailsClick.next({
      action: 'findSimilar',
      partData: part,
    });
  }

  private loadManufacturingCategory(): void {
    this.existingUploadedData?.aiSearchListTileDtos?.forEach((x) => {
      x.manufacturingCategory = this.commodityList.find((c) => c.commodityId.toString() === x.commodityId?.toString())?.commodity;
    });
  }
}
