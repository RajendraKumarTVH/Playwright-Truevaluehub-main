import { Component, OnDestroy } from '@angular/core';
import { AiSearchHeaderComponent } from '../../ai-search-header/ai-search-header.component';
import { SimilaritySearchComponent } from './similarity-search/similarity-search.component';
import { Router, RouterModule } from '@angular/router';
import { AiSearchListTileDto } from '../../../models/ai-image-similarity-result';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserService } from 'src/app/modules/settings/Services/user.service';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { UserModel } from 'src/app/modules/settings/models';
import { GridViewComponent } from './grid-view/grid-view.component';
import { TableViewComponent } from './table-view/table-view.component';
import { BlockUiService } from 'src/app/shared/services/block-ui.service';
import { AiSearchService } from 'src/app/shared/services/ai-search.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SingleModelComponent } from '../../single-model/single-model.component';
import { CommodityMasterDto } from 'src/app/shared/models/commodity-master.model';
import { ColumnViewComponent } from './column-view/column-view.component';
import { CompetitiveAnalysisViewComponent } from './competitive-analysis-view/competitive-analysis-view.component';
import { AiSearchHelperService } from '../../../services/ai-search-helper-service';
@Component({
  selector: 'app-ai-search-list-view',
  imports: [AiSearchHeaderComponent, SimilaritySearchComponent, RouterModule, CommonModule, GridViewComponent, TableViewComponent, ColumnViewComponent, CompetitiveAnalysisViewComponent],
  templateUrl: './ai-search-list-view.component.html',
  styleUrls: ['./ai-search-list-view.component.scss'],
})
export class AiSearchListViewComponent implements OnDestroy {
  similaritySearchPart?: AiSearchListTileDto;
  users: UserModel[] = [];
  currentViewMode: 'grid' | 'column' | 'table' | 'chart' = 'grid';
  commodityList?: CommodityMasterDto[];
  _commodityMaster$: Observable<CommodityMasterDto[]>;
  private readonly $unsubscribe: Subject<undefined> = new Subject<undefined>();

  constructor(
    private readonly aiSearchHelperService: AiSearchHelperService,
    private readonly userService: UserService,
    private readonly userInfoService: UserInfoService,
    private readonly router: Router,
    private readonly blockUiService: BlockUiService,
    private readonly searchService: AiSearchService,
    private readonly modalService: NgbModal
  ) {
    this.aiSearchHelperService.$similaritySearchApplied.pipe(takeUntil(this.$unsubscribe)).subscribe((part) => {
      this.similaritySearchPart = part;
    });
    this.aiSearchHelperService.$viewModeChanged.pipe(takeUntil(this.$unsubscribe)).subscribe((viewMode) => {
      // this.router.navigate([`ai-search/search-list/${viewMode}`])
      this.currentViewMode = viewMode;
    });
    this.userInfoService
      .getUserValue()
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((user) => {
        const clientId = user?.clientId;
        if (clientId) {
          this.loadUsers(clientId);
        }
      });
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next(undefined);
    this.$unsubscribe.complete();
  }

  closeSimilaritySearch() {
    this.similaritySearchPart = undefined;
    this.aiSearchHelperService.$similaritySearchClosed.next();
  }

  onImageUploadSearch(files: FileList | null) {
    if (files?.length > 0) {
      this.aiSearchHelperService.$imageUploadSearch.next(files);
    }
  }

  loadUsers(clientId: number) {
    this.userService.getUsersByClientId(clientId).subscribe((users) => {
      this.users = users;
    });
  }

  openProperties(part: AiSearchListTileDto) {
    // this.currentModalPart = pidSearch;
    if (!part.imgThumbnailData) {
      part.imageShowing = 'pdf';
    }
    this.blockUiService.pushBlockUI('addScenario');
    this.searchService
      .getHighResThumbnailImage(part.partId, part.imageShowing)
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((thumbnailImage) => {
        this.blockUiService.popBlockUI('addScenario');
        let thumbnailData = thumbnailImage;
        const modalRef = this.modalService.open(SingleModelComponent, {
          windowClass: 'fullscreen',
        });
        modalRef.componentInstance.partData = {
          imageShowing: part.imageShowing,
          imageUrl: thumbnailData,
          manufacturingCategory: part.manufacturingCategory,
          partId: part.partId,
          partNumber: part.intPartNumber,
          partDescription: part.intPartDescription,
          partRevision: part.partRevision,
          drawingNumber: part.drawingNumber,
          annualVolume: part.annualVolume,
          createDate: part.createdDate,
          createdBy: this.getUserName(part.createdUserId),
        };
        modalRef.componentInstance.commodityList = this.commodityList;

        // modalRef.closed.subscribe(() => (this.currentModalPart = undefined));
      });
  }

  goToCosting(part: AiSearchListTileDto) {
    const url = this.router.serializeUrl(this.router.createUrlTree([`/costing/${part.projectInfoId}`]));
    window.open(url, '_blank');
  }

  getUserName(userId: number): string {
    const user = this.users.find((x) => x.userId === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}
