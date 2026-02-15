import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AiSearchListTileDto } from 'src/app/modules/ai-search/models/ai-image-similarity-result';
import { Subject, takeUntil } from 'rxjs';
import { AiSearchService } from 'src/app/shared/services/ai-search.service';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { UserService } from 'src/app/modules/settings/Services/user.service';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { AiSearchState } from 'src/app/modules/ai-search/models/ai-search-state';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { AiSearchHelperBase } from 'src/app/modules/ai-search/services/ai-search-helper-base';
import { AiSearchHelperService } from 'src/app/modules/ai-search/services/ai-search-helper-service';
import { Store } from '@ngxs/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { BlockUiService } from 'src/app/shared/services';

@Component({
  selector: 'app-column-view',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './column-view.component.html',
  styleUrl: './column-view.component.scss',
})
export class ColumnViewComponent extends AiSearchHelperBase implements OnInit {
  dataSource: any[] = [];
  selectedItem: any = null;
  override pageSize = 5;
  currentAiSearchState: AiSearchState = AiSearchState.Listing;
  checkedItems: Set<AiSearchListTileDto> = new Set<AiSearchListTileDto>();
  private readonly $unsubscribe: Subject<undefined> = new Subject<undefined>();

  constructor(
    readonly searchService: AiSearchService,
    readonly sharedService: SharedService,
    readonly userService: UserService,
    readonly userInfoService: UserInfoService,
    readonly messaging: MessagingService,
    readonly _store: Store,
    readonly searchHelperService: AiSearchHelperService,
    readonly modalService: NgbModal,
    readonly matDialog: MatDialog,
    readonly digitalFactoryService: DigitalFactoryService,
    readonly blockUiService: BlockUiService
  ) {
    super(userInfoService, userService, _store, searchService, messaging, sharedService, modalService, matDialog, digitalFactoryService, blockUiService);
    this.searchHelperService.$filterChanged.pipe(takeUntil(this.$unsubscribe)).subscribe((searchedModel) => {
      if (searchedModel.length === 0) {
        this.currentAiSearchState = AiSearchState.Listing;
        this.loadDataSource();
        return;
      }
      this.currentAiSearchState = AiSearchState.Filter;
      this.searchedModel = searchedModel;
      this.loadDataSource();
    });
    this.searchHelperService.$imageUploadSearch.pipe(takeUntil(this.$unsubscribe)).subscribe((files: FileList) => {
      this.filesUploaded = files;
      const reader = new FileReader();
      reader.onload = () => {
        const readerResult = reader.result;
        const imageUrl = this.removeBase64Prefix(readerResult.toString());
        const imageSearchPart: AiSearchListTileDto = {
          imgThumbnailData: imageUrl,
        };
        this.searchHelperService.$similaritySearchApplied.next(imageSearchPart);
        this.currentAiSearchState = AiSearchState.ImageSimilarity;
        this.loadDataSource();
      };
      reader.readAsDataURL(this.filesUploaded[0]);
    });
  }

  ngOnInit() {
    this.isColumnView = true;
    this.loadDataSource();
  }

  loadDataSource(): void {
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

  protected afterLoadDataSource(): void {
    if (this.dataSource.length > 0) this.selectItem(this.dataSource[0]);
  }

  selectItem(item: any): void {
    this.selectedItem = item;
  }

  override onCheckboxChange(event: any, item: any): void {
    if (event.target.checked) {
      this.checkedItems.add(item);
    } else {
      this.checkedItems.delete(item);
    }
    this.checkedParts = Array.from(this.checkedItems);
  }

  isItemChecked(item: any): boolean {
    return this.checkedItems.has(item);
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;

    const isFullyScrolled = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
    if (isFullyScrolled) {
      this.currentListingPage++;
      this.loadDataSource();
    }
  }
}
