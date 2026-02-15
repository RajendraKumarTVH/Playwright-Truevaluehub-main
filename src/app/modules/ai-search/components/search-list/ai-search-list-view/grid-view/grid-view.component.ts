import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PaginatorModule } from 'primeng/paginator';
import { SidebarModule } from 'primeng/sidebar';
import { AiSearchHelperBase } from 'src/app/modules/ai-search/services/ai-search-helper-base';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AiSearchService } from 'src/app/shared/services/ai-search.service';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { AiSearchListTileDto, AiSearchTileExtractionInfoDto } from 'src/app/modules/ai-search/models/ai-image-similarity-result';
import { AiSearchState } from 'src/app/modules/ai-search/models/ai-search-state';
import { AISearchImage } from 'src/app/modules/ai-search/models/ai-search-image.model';
import { CommodityMasterDto } from 'src/app/shared/models/commodity-master.model';
import { CommodityState } from 'src/app/modules/_state/commodity.state';
import { Store } from '@ngxs/store';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentViewerComponent } from 'src/app/modules/costing/components/costing-supporting-documents/document-viewer/document-viewer.component';
import { CadViewerPopupComponent } from 'src/app/modules/costing/components/cad-viewer-popup/cad-viewer-popup.component';
import { SearchBarModelDto } from 'src/app/shared/models/search-bar-model';
import { UserService } from 'src/app/modules/settings/Services/user.service';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { ComparisonViewComponent } from '../comparison-view/comparison-view.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AiSearchHelperService } from 'src/app/modules/ai-search/services/ai-search-helper-service';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { BlockUiService } from 'src/app/shared/services';
@Component({
  selector: 'app-grid-view',
  imports: [CommonModule, MatIconModule, MatButtonModule, PaginatorModule, SidebarModule, MatDialogModule],
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss'],
})
export class GridViewComponent extends AiSearchHelperBase implements OnInit, OnDestroy {
  @Output() openPropertiesEvent = new EventEmitter<AiSearchListTileDto>();
  @Output() gotoCostingEvent = new EventEmitter<AiSearchListTileDto>();
  items: Array<any> = [];
  displayedItems: Array<any> = [];
  defaultListingDataSource: AiSearchListTileDto[];
  currentAiSearchState: AiSearchState = AiSearchState.Listing;
  defaultRecordCount: number = 0;
  aiSearchImage: AISearchImage = new AISearchImage();
  commodityList?: CommodityMasterDto[];
  _commodityMaster$: Observable<CommodityMasterDto[]>;
  searchedText = '';
  similaritySearchOrigin?: string;
  searchedCommodity?: CommodityMasterDto;
  checkedParts: any[] = [];
  searchedModel: SearchBarModelDto[] = [];
  enablePagination = true;
  currentModalPart?: AiSearchListTileDto;
  checkedCount: number = 0;
  private readonly $unsubscribe: Subject<undefined> = new Subject<undefined>();
  showInfoSidebar = false;
  selectedItem: any = null;
  constructor(
    readonly searchService: AiSearchService,
    private readonly aiSearchHelperService: AiSearchHelperService,
    readonly messaging: MessagingService,
    readonly _store: Store,
    readonly sharedService: SharedService,
    readonly modalService: NgbModal,
    readonly userService: UserService,
    readonly userInfoService: UserInfoService,
    readonly matDialog: MatDialog,
    readonly digitalFactoryService: DigitalFactoryService,
    readonly blockUiService: BlockUiService
  ) {
    super(userInfoService, userService, _store, searchService, messaging, sharedService, modalService, matDialog, digitalFactoryService, blockUiService);
    this._commodityMaster$ = this._store.select(CommodityState.getCommodityData);
    this.aiSearchHelperService.$filterChanged.pipe(takeUntil(this.$unsubscribe)).subscribe((searchedModel) => {
      if (searchedModel.length === 0) {
        this.currentAiSearchState = AiSearchState.Listing;
        this.loadDataSource();
        return;
      }
      this.currentAiSearchState = AiSearchState.Filter;
      this.searchedModel = searchedModel;
      this.loadDataSource();
    });

    this.aiSearchHelperService.$similaritySearchClosed.pipe(takeUntil(this.$unsubscribe)).subscribe(() => {
      this.currentAiSearchState = AiSearchState.Listing;
      this.loadDataSource();
    });

    this.aiSearchHelperService.$imageUploadSearch.pipe(takeUntil(this.$unsubscribe)).subscribe((files: FileList) => {
      this.filesUploaded = files;
      const reader = new FileReader();
      reader.onload = () => {
        const readerResult = reader.result;
        const imageUrl = this.removeBase64Prefix(readerResult.toString());
        const imageSearchPart: AiSearchListTileDto = {
          imgThumbnailData: imageUrl,
        };
        this.aiSearchHelperService.$similaritySearchApplied.next(imageSearchPart);
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

  loadDataSource() {
    this.enablePagination = false;
    switch (this.currentAiSearchState) {
      case AiSearchState.Listing:
        this.enablePagination = true;
        this.loadListingPartData();
        break;
      case AiSearchState.Similarity:
        this.loadSimilaritySeachData();
        break;
      case AiSearchState.ImageSimilarity:
        this.loadImageSimilaritySeachData(this.filesUploaded);
        break;
      case AiSearchState.Filter:
        this.enablePagination = true;
        this.loadFilterData();
        break;
      default:
        this.loadListingPartData();
    }
  }

  goToCosting(pidSearch: any) {
    this.gotoCostingEvent.emit(pidSearch);
  }

  openProperties(pidSearch: AiSearchListTileDto) {
    this.openPropertiesEvent.next(pidSearch);
  }

  aiSimilaritySearchClicked(searchedPart: AiSearchListTileDto) {
    this.searchedPart = searchedPart;
    this.currentAiSearchState = AiSearchState.Similarity;
    this.searchedCommodity = undefined;
    this.aiSearchHelperService.$similaritySearchApplied.next(searchedPart);
    this.loadDataSource();
  }

  paginatorPageChanged(event: any) {
    this.dataSource = [];
    this.pageFirst = event.first;
    if (this.currentListingPage !== event.page || this.pageSize !== event.rows) {
      this.defaultListingDataSource = [];
    }
    this.pageSize = event.rows;
    this.currentListingPage = event.page;
    this.loadDataSource();
  }

  compareWithSearched(comparedPart?: AiSearchListTileDto) {
    this.open3DViewer(comparedPart, 'cad', true);
  }

  resetCompare() {
    this.checkedCount = 0;
    this.checkedParts = [];
    const elements = document.getElementsByClassName('form-check-input') as any;
    for (let i = 0; i < elements?.length; i++) {
      elements.item(i).checked = false;
    }
  }

  compareParts() {
    this.matDialog
      .open(ComparisonViewComponent, {
        width: '980px',
        maxHeight: '90vh',
        disableClose: true,
        panelClass: 'comparison-dialog-panel',
        data: { partIds: this.checkedParts.map((x) => x.partId), users: this.users, commodityList: this.commodityList },
      })
      .afterClosed()
      .subscribe(() => {
        this.resetCompare();
      });
  }

  onCheckboxChange(event: Event, pidSearch: any): void {
    const checkbox = event.target as HTMLInputElement;
    pidSearch.isChecked = !pidSearch.isChecked;
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

  updateDisplayedItems() {
    this.displayedItems = this.items.slice(this.pageFirst, this.pageFirst + this.pageSize);
  }

  trackById(_index: number, item: any) {
    return item?.id;
  }

  showDetails(item: AiSearchListTileDto) {
    this.selectedItem = item;
    this.showInfoSidebar = true;
  }

  openDocumentViewer(pdfDocLocation: string) {
    const data: any = { docLocation: pdfDocLocation };
    const modalRef = this.modalService.open(DocumentViewerComponent, { windowClass: 'fullscreen' });
    modalRef.componentInstance.data = data;
  }

  open3DViewer(pidSearch?: any, fileType = 'cad', isCompare = false) {
    const comparedPart = pidSearch ?? this.checkedParts[1];
    if (!comparedPart && this.checkedParts?.length === 0) {
      return;
    }
    this.searchService
      .getExtractionInfo([comparedPart.partId])
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe({
        next: (result: AiSearchTileExtractionInfoDto[]) => {
          const item = result[0];
          if (fileType === 'pdf') {
            const pdfLocation = item.pdfDocLocation;
            this.openDocumentViewer(pdfLocation);
            return;
          }
          const extractedData = {
            material: JSON.parse(item?.materialInfoJson),
            process: JSON.parse(item?.processInfoJson),
          };

          const fileName = item.fileName;
          const modalRef = this.modalService.open(CadViewerPopupComponent, {
            windowClass: 'fullscreen',
          });
          modalRef.componentInstance.fileName = fileName;
          if (isCompare) {
            modalRef.componentInstance.isCompare = isCompare;
            modalRef.componentInstance.mainPartId = !!pidSearch ? this.aiSearchImage?.partId : this.checkedParts[0].partId;
            modalRef.componentInstance.comparePartId = comparedPart.partId;
          }
          modalRef.componentInstance.partData = {
            caller: 'bom-details',
            partId: comparedPart.partId,
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
        },
      });
  }
}
