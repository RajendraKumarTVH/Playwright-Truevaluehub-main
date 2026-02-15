import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AiSearchListTileDto } from 'src/app/modules/ai-search/models/ai-image-similarity-result';
import { AiSearchState } from 'src/app/modules/ai-search/models/ai-search-state';
import { BlockUiService } from 'src/app/shared/services/block-ui.service';
import { Subject, takeUntil } from 'rxjs';
import { AiSearchService } from 'src/app/shared/services/ai-search.service';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { AiSearchHelperService } from 'src/app/modules/ai-search/services/ai-search-helper-service';
import { AiSearchHelperBase } from 'src/app/modules/ai-search/services/ai-search-helper-base';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { UserService } from 'src/app/modules/settings/Services/user.service';
import { Store } from '@ngxs/store';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';

interface PartRow {
  id: number;
  img: string;
  partNumber: string;
  description: string;
  drawingNumber: string;
  dateCreated: string;
  projectNumber: string;
  supplierCountry: string;
  supplierCity: string;
  partSize: string;
  surfaceArea: string;
  partVolume: string;
  annualVolume: string;
  competitivenessScore: string;
  complexityScore: string;
  annualSpend: string;
  purchasePrice: string;
  shouldCost: string;
}
@Component({
  selector: 'app-table-view',
  imports: [CommonModule, TableModule, PaginatorModule, CheckboxModule, ButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.scss',
})
export class TableViewComponent extends AiSearchHelperBase implements OnInit, OnDestroy {
  @Output() openPropertiesEvent = new EventEmitter<AiSearchListTileDto>();
  @Output() gotoCostingEvent = new EventEmitter<AiSearchListTileDto>();
  rows = 10;
  currentAiSearchState: AiSearchState = AiSearchState.Listing;

  private readonly $unsubscribe: Subject<undefined> = new Subject<undefined>();

  constructor(
    readonly blockUiService: BlockUiService,
    readonly searchService: AiSearchService,
    readonly sharedService: SharedService,
    private readonly aiSearchHelper: AiSearchHelperService,
    readonly messaging: MessagingService,
    readonly userService: UserService,
    readonly userInfoService: UserInfoService,
    readonly _store: Store,
    readonly matDialog: MatDialog,
    readonly modalService: NgbModal,
    readonly digitalFactoryService: DigitalFactoryService
  ) {
    super(userInfoService, userService, _store, searchService, messaging, sharedService, modalService, matDialog, digitalFactoryService, blockUiService);
    this.aiSearchHelper.$filterChanged.pipe(takeUntil(this.$unsubscribe)).subscribe((searchedModel) => {
      if (searchedModel.length === 0) {
        this.currentAiSearchState = AiSearchState.Listing;
        this.loadDataSource();
        return;
      }
      this.currentAiSearchState = AiSearchState.Filter;
      this.searchedModel = searchedModel;
      this.loadDataSource();
    });
    this.aiSearchHelper.$similaritySearchClosed.pipe(takeUntil(this.$unsubscribe)).subscribe(() => {
      this.currentAiSearchState = AiSearchState.Listing;
      this.loadDataSource();
    });
    this.aiSearchHelper.$imageUploadSearch.pipe(takeUntil(this.$unsubscribe)).subscribe((files: FileList) => {
      this.filesUploaded = files;
      const reader = new FileReader();
      reader.onload = () => {
        const readerResult = reader.result;
        const imageUrl = this.removeBase64Prefix(readerResult.toString());
        const imageSearchPart: AiSearchListTileDto = {
          imgThumbnailData: imageUrl,
        };
        this.aiSearchHelper.$similaritySearchApplied.next(imageSearchPart);
        this.currentAiSearchState = AiSearchState.ImageSimilarity;
        this.loadDataSource();
      };
      reader.readAsDataURL(this.filesUploaded[0]);
    });
  }

  ngOnInit(): void {
    this.loadDataSource();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.$unsubscribe.next(undefined);
    this.$unsubscribe.complete();
  }

  openProperties(part: AiSearchListTileDto) {
    this.openPropertiesEvent.next(part);
  }

  goToCosting(part: AiSearchListTileDto) {
    this.gotoCostingEvent.next(part);
  }

  trackById(_index: number, item: PartRow) {
    return item?.id;
  }

  loadDataSource() {
    switch (this.currentAiSearchState) {
      case AiSearchState.Listing:
        this.loadListingPartData();
        break;
      case AiSearchState.Similarity:
        this.loadSimilaritySeachData();
        break;
      case AiSearchState.ImageSimilarity:
        this.loadImageSimilaritySeachData(this.filesUploaded);
        break;
      case AiSearchState.Filter:
        this.loadFilterData();
        break;
      default:
        this.loadListingPartData();
    }
  }

  paginatorPageChanged(event: any) {
    this.dataSource = [];
    this.pageFirst = event.first;
    this.pageSize = event.rows;
    this.currentListingPage = event.page;
    this.loadDataSource();
  }

  aiSimilaritySearchClicked(searchedPart: AiSearchListTileDto) {
    this.aiSearchHelper.$similaritySearchApplied.next(searchedPart);
    this.searchedPart = searchedPart;
    this.currentAiSearchState = AiSearchState.Similarity;
    this.loadDataSource();
  }

  onCheckboxChange(event: Event, pidSearch: any): void {
    pidSearch.isChecked = !pidSearch.isChecked;
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.checkedCount++;
      this.checkedParts.push(pidSearch);
    } else {
      this.checkedCount--;
      this.checkedParts.splice(
        this.checkedParts.indexOf((item) => item === pidSearch),
        1
      );
    }
  }
}
