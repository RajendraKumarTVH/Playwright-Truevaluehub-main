import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlockUiService } from 'src/app/shared/services';
import { AiSearchService } from 'src/app/shared/services/ai-search.service';
import { SingleModelComponent } from '../../single-model/single-model.component';
import { AISearchImage, AICompareRequest, Query, AICompareResult } from '../../../models/ai-search-image.model';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { Router } from '@angular/router';
import { CadViewerPopupComponent } from 'src/app/modules/costing/components/cad-viewer-popup/cad-viewer-popup.component';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { UserService } from 'src/app/modules/settings/Services/user.service';
import { AiCommonService } from 'src/app/shared/services/ai-common-service';
import { DocumentViewerComponent } from 'src/app/modules/costing/components/costing-supporting-documents/document-viewer/document-viewer.component';
import {
  AiIntegratedInfoDto,
  AiSearchImageInfoDto,
  AiSearchListTileDto,
  AiSearchTileCompletionInfoDto,
  AiSearchTileExtractionInfoDto,
  PdfCostSummaryInfo,
  SimilaritySearchDto,
  SimilaritySearchRequestDto,
  TimeDetails,
} from '../../../models/ai-image-similarity-result';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { AiSearchState } from '../../../models/ai-search-state';
import { CommodityState } from 'src/app/modules/_state/commodity.state';
import { CommodityMasterDto } from 'src/app/shared/models/commodity-master.model';
import { Store } from '@ngxs/store';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressBarComponent } from 'src/app/shared/components/progress-bar/progress-bar.component';
import { DropdownModule } from 'primeng/dropdown';
import { SearchBarModelDto } from 'src/app/shared/models/search-bar-model';
import { AiSearchHeaderComponent } from '../../ai-search-header/ai-search-header.component';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-ai-search-list',
  templateUrl: './ai-search-list.component.html',
  styleUrls: ['./ai-search-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatMenuModule, MatIconModule, PaginatorModule, ProgressBarComponent, DropdownModule, AiSearchHeaderComponent, RouterModule],
})
export class AiSearchListComponent implements OnInit {
  @ViewChild('fileDropRef1', { static: false }) fileDropEl1: ElementRef | undefined;

  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  isLoaded: boolean = false;
  isExpand: boolean = false;
  expanded: boolean = false;
  aiSearchImage: AISearchImage = new AISearchImage();
  clientId: number;
  checkedCount: number = 0;
  checkedParts: any[] = [];
  comparePartsResult: any[] = [];
  recordCount: number = 0;
  currentListingPage: number = 0;
  filterOptions: any[] = [];
  selectedFilterType?: string;
  selectedFilterDisplayText?: string;
  searchedText = '';
  filterSearchResults: any;
  filterRecordsCount = 0;
  pageFirst = 0;
  pageSize = 20;
  currentAiSearchState: AiSearchState = AiSearchState.Listing;
  dataSource: AiSearchListTileDto[];
  defaultListingDataSource: AiSearchListTileDto[];
  defaultRecordCount: number = 0;
  filesUploaded?: FileList;
  searchedPart?: AiSearchListTileDto;
  currentModalPart?: AiSearchListTileDto;
  commodityList?: CommodityMasterDto[];
  searchedCommodity?: CommodityMasterDto;
  similaritySearchOrigin?: string;
  mode = 'donut';
  _commodityMaster$: Observable<CommodityMasterDto[]>;
  unloadedTiles = Array(20).fill({});
  filtersWithPagination = [];
  enablePagination = true;
  searchedModel: SearchBarModelDto[] = [];
  totalTimeOfSql = 0;
  totalTimeOfImages = 0;
  totalTimeOfCosmos = 0;
  timeDetails?: TimeDetails;
  private users: any[] = [];

  constructor(
    private _store: Store,
    private searchService: AiSearchService,
    private blockUiService: BlockUiService,
    private modalService: NgbModal,
    private userInfoService: UserInfoService,
    private readonly router: Router,
    private messaging: MessagingService,
    private userService: UserService,
    private aiCommonSearchService: AiCommonService,
    private sharedService: SharedService
  ) {
    this._commodityMaster$ = this._store.select(CommodityState.getCommodityData);
  }

  ngOnInit(): void {
    this.blockUiService.unBlockUIAngular();
    this.loadDataSource();
    this.filterOptions = this.getFilterOptions();
    this.selectedFilterType = this.filterOptions[0].filterKey;
    this.loadCommodityData();
    this.userInfoService.getUserValue().subscribe((user) => {
      this.clientId = user?.clientId;
      if (this.clientId) {
        this.filtersWithPagination = this.filterOptions.filter((x) => x.isPagination);
        this.loadUsers(this.clientId);
      }
    });

    this.aiCommonSearchService.childPartDetailsClick.subscribe({
      next: (partDetailsAction) => {
        if (partDetailsAction.action === 'viewProperties') {
          this.addScenario(partDetailsAction.partData);
          return;
        }
        if (partDetailsAction.action === 'goToCosting') {
          this.goToCosting(partDetailsAction.partData);
          return;
        }
        this.aiIdSearch(partDetailsAction.partData);
      },
    });
  }

  loadUsers(clientId: number) {
    this.userService.getUsersByClientId(clientId).subscribe((users) => {
      this.users = users;
      this.filterOptions.find((x) => x.key === 'createdBy').dropDownValues = this.users.map((x) => ({ name: x.userName, id: x.userName }));
    });
  }

  getUserName(userId: number): string {
    const user = this.users.find((x) => x.userId === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }

  addScenario(pidSearch: AiSearchListTileDto) {
    this.currentModalPart = pidSearch;
    if (!pidSearch.imgThumbnailData) {
      pidSearch.imageShowing = 'pdf';
    }
    this.blockUiService.pushBlockUI('addScenario');
    this.searchService
      .getHighResThumbnailImage(pidSearch.partId, pidSearch.imageShowing)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((thumbnailImage) => {
        this.blockUiService.popBlockUI('addScenario');
        let thumbnailData = thumbnailImage;
        const modalRef = this.modalService.open(SingleModelComponent, {
          windowClass: 'fullscreen',
        });
        modalRef.componentInstance.partData = {
          imageShowing: pidSearch.imageShowing,
          imageUrl: thumbnailData,
          manufacturingCategory: pidSearch.manufacturingCategory,
          partId: pidSearch.partId,
          partNumber: pidSearch.intPartNumber,
          partDescription: pidSearch.intPartDescription,
          partRevision: pidSearch.partRevision,
          drawingNumber: pidSearch.drawingNumber,
          annualVolume: pidSearch.annualVolume,
          createDate: pidSearch.createdDate,
          createdBy: this.getUserName(pidSearch.createdUserId),
        };
        modalRef.componentInstance.commodityList = this.commodityList;

        modalRef.closed.subscribe(() => (this.currentModalPart = undefined));
      });
  }
  expand() {
    this.isExpand = !this.isExpand;
  }

  async getFile(fileEntry: any): Promise<any> {
    try {
      return await new Promise((resolve, reject) => fileEntry.file(resolve, reject));
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async onFolderDropped($event: any) {
    this.isLoaded = false;
    this.blockUiService.pushBlockUI('onFolderDropped');
    const items = $event.dataTransfer.items;
    const result = await this.getAllFileEntries(items);
    const files: any[] = [];
    for (const i in result) {
      const file: any = await this.getFile(result[i]);
      files.push(file);
    }

    if (files.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        const file = files[i] as File;
        formData.append('formFile', file, file.name);
      }

      this.searchService
        .searchDocument(formData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
          this.blockUiService.popBlockUI('onFolderDropped');
          this.isLoaded = true;
        });
    }
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
        this.loadImageSimilaritySeachData();
        break;
      case AiSearchState.Compare:
        this.loadCompareData();
        break;
      case AiSearchState.Filter:
        this.enablePagination = true;
        this.loadFilterData();
        break;
      default:
        this.loadListingPartData();
    }
  }

  async readAllDirectoryEntries() {
    const entries = [];
    let readEntries: any;
    while (readEntries.length > 0) {
      entries.push(...readEntries);
    }
    return entries;
  }

  async getAllFileEntries(dataTransferItemList: any) {
    const fileEntries = [];
    const queue = [];
    for (let i = 0; i < dataTransferItemList.length; i++) {
      queue.push(dataTransferItemList[i].webkitGetAsEntry());
    }
    while (queue.length > 0) {
      const entry = queue.shift();
      if (entry.isFile) {
        fileEntries.push(entry);
      } else if (entry.isDirectory) {
        queue.push(...(await this.readAllDirectoryEntries()));
      }
    }
    return fileEntries;
  }

  textSearch(event: SearchBarModelDto[]) {
    if (event.length === 0) {
      this.currentAiSearchState = AiSearchState.Listing;
      this.loadDataSource();
      return;
    }
    this.currentAiSearchState = AiSearchState.Filter;
    this.currentListingPage = 0;
    this.searchedModel = event;
    if (this.searchedModel.length > 0) {
      const createdByFilters = this.searchedModel.filter((f) => f.searchKey === 'createdBy');
      createdByFilters.forEach((createdByFilter) => {
        createdByFilter.searchValueId = this.users.find((x) => x.userName === createdByFilter.searchValue)?.userId;
      });
      const categoryFilters = this.searchedModel.filter((f) => f.searchKey === 'manufacturingCategory');
      categoryFilters.forEach((categoryFilter) => {
        categoryFilter.searchValueId = this.commodityList.find((x) => x.commodity === categoryFilter.searchValue)?.commodityId;
      });
    }
    this.loadDataSource();
  }

  aiIdSearch(searchedPart: AiSearchListTileDto) {
    this.searchedPart = searchedPart;
    this.currentAiSearchState = AiSearchState.Similarity;
    this.searchedCommodity = undefined;
    this.selectedFilterType = this.filterOptions[0].filterKey;
    this.loadDataSource();
  }

  goToCosting(pidSearch: any) {
    const url = this.router.serializeUrl(this.router.createUrlTree([`/costing/${pidSearch.projectInfoId}`]));
    window.open(url, '_blank');
  }

  open3DViewer(pidSearch?: any, fileType = 'cad', isCompare = false) {
    const comparedPart = pidSearch ?? this.checkedParts[1];
    if (!comparedPart && this.checkedParts?.length === 0) {
      return;
    }
    this.blockUiService.pushBlockUI('open3DViewer');
    this.searchService
      .getExtractionInfo([comparedPart.partId])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: AiSearchTileExtractionInfoDto[]) => {
          const item = result[0];
          if (fileType === 'pdf') {
            const pdfLocation = item.pdfDocLocation;
            this.openDocumentViewer(pdfLocation);
            this.blockUiService.popBlockUI('open3DViewer');
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
          this.blockUiService.popBlockUI('open3DViewer');
        },
      });
  }

  removeSimilaritySearchImage() {
    this.currentAiSearchState = this.searchedModel?.length > 0 ? AiSearchState.Filter : AiSearchState.Listing;
    this.totalTimeOfCosmos = 0;
    this.totalTimeOfSql = 0;
    this.totalTimeOfImages = 0;
    this.clearAiSearchImage();
    this.loadDataSource();
    this.aiSearchImage.isSearched = false;
    if (this.currentModalPart) {
      this.addScenario(this.currentModalPart);
    }
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
        this.checkedParts.findIndex((item) => item === pidSearch),
        1
      );
    }
  }

  compareParts() {
    this.currentAiSearchState = AiSearchState.Compare;
    this.loadDataSource();
  }

  resetCompare() {
    this.checkedCount = 0;
    this.checkedParts = [];
    const elements = document.getElementsByClassName('form-check-input') as any;
    for (let i = 0; i < elements?.length; i++) {
      (elements.item(i) as any).checked = false;
    }
    // this.currentAiSearchState = AiSearchState.Listing;
    // this.loadDataSource();
  }

  onImageSimilarityUpload(files: FileList | null) {
    this.filesUploaded = files;
    this.currentAiSearchState = AiSearchState.ImageSimilarity;
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

  openDocumentViewer(pdfDocLocation: string) {
    const data: any = { docLocation: pdfDocLocation };
    const modalRef = this.modalService.open(DocumentViewerComponent, { windowClass: 'fullscreen' });
    modalRef.componentInstance.data = data;
  }

  onImageViewChange(mat: any) {
    if (mat.imageShowing === 'cad') {
      mat.imageShowing = 'pdf';
      return;
    }
    mat.imageShowing = 'cad';
  }

  prev(mat: any) {
    mat.imageShowing = 'pdf';
  }

  compareWithSearched(comparedPart?: AiSearchListTileDto) {
    this.open3DViewer(comparedPart, 'cad', true);
  }

  private removeBase64Prefix(base64String: string): string {
    const regex = /^data:image\/(png|jpeg);base64,/;
    return base64String.replace(regex, '');
  }

  private getFilterOptions(): any[] {
    return [
      {
        label: 'Part Number',
        key: 'partNumber',
      },
      {
        label: 'Part Description',
        key: 'partDescription',
      },
      {
        label: 'Project Number',
        key: 'projectNumber',
      },
      {
        label: 'Project Name',
        key: 'projectName',
      },
      {
        label: 'Manufacturing Category',
        key: 'manufacturingCategory',
        isDropDown: true,
        isPagination: true,
      },
      {
        label: 'Tag',
        key: 'tag',
      },
      {
        label: 'Created By',
        key: 'createdBy',
        isDropDown: true,
        isPagination: true,
      },
      {
        label: 'Created Date',
        key: 'createDate',
        isDate: true,
      },
      // {
      //   label: 'Material',
      //   key: 'material',
      // },
      // {
      //   label: 'Vendor',
      //   key: 'vendor',
      // },
      {
        label: 'Part ID',
        key: 'partId',
      },
    ];
  }

  private clearAiSearchImage() {
    this.aiSearchImage.imageUrl = '';
    this.aiSearchImage.manufacturingCategory = '';
    this.aiSearchImage.partId = '';
    this.aiSearchImage.projectInfoId = '';
    this.aiSearchImage.isSearched = false;
    this.aiSearchImage.partNumber = '';
    this.aiSearchImage.partDescription = '';
    // this.searchedText = '';
  }

  private loadListingPartData(): void {
    if (this.defaultListingDataSource && this.defaultListingDataSource.length > 0) {
      this.dataSource = this.defaultListingDataSource;
      this.recordCount = this.defaultRecordCount;
      return;
    }
    this.searchService
      .getDBpartsId(this.currentListingPage, this.pageSize)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: AiIntegratedInfoDto) => {
        if (result) {
          this.dataSource = result.aiSearchListTileDtos;
          this.defaultListingDataSource = this.dataSource;
          this.recordCount = result?.totalRecordCount;
          this.defaultRecordCount = result?.totalRecordCount;
          this.load3dPartData();
          this.loadPdfPartData();
          this.loadManufacturingCategory();
          this.loadPercentageCompletion();
          this.loadPdfCostSummaryInfo();
        }
      });
  }

  private loadManufacturingCategory(): void {
    this.dataSource.forEach((x) => {
      x.manufacturingCategory = this.commodityList.find((c) => c.commodityId.toString() === x.commodityId?.toString())?.commodity;
    });
  }

  private loadCommodityData() {
    this._commodityMaster$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: CommodityMasterDto[]) => {
      this.commodityList = result;
      this.filterOptions.find((x) => x.key === 'manufacturingCategory').dropDownValues = this.commodityList.map((x) => ({ name: x.commodity, id: x.commodity }));
    });
  }

  private loadImageSimilaritySeachData() {
    if (!this.filesUploaded || this.filesUploaded.length !== 1) {
      const message = 'Select only single supported file';
      this.messaging.openSnackBar(message, '', {
        duration: 5000,
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const readerResult = reader.result;
      this.aiSearchImage.imageUrl = this.removeBase64Prefix(readerResult.toString());
    };
    reader.readAsDataURL(this.filesUploaded[0]);
    this.aiSearchImage.manufacturingCategory = '';
    this.aiSearchImage.partId = '';
    this.aiSearchImage.projectInfoId = '';
    this.aiSearchImage.partNumber = '';
    this.aiSearchImage.partDescription = '';
    this.aiSearchImage.isSearched = true;
    const formData = new FormData();
    const file = this.filesUploaded[0] as File;
    formData.append('formFile', file, file.name);
    formData.append('originalFileName', file.name);
    this.totalTimeOfCosmos = 0;
    this.dataSource = [];
    this.searchService
      .getAIImageSimilarSearch(1, formData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: SimilaritySearchDto) => {
        if (result) {
          this.dataSource = result?.aiSearchListTileDtos;
          this.recordCount = this.dataSource.length;
          this.totalTimeOfCosmos = result.totalTimeOfCosmos;
          this.load3dPartData();
          this.loadManufacturingCategory();
          this.loadPercentageCompletion();
          this.loadPdfCostSummaryInfo();
        }
      });
  }

  private loadCompareData() {
    if (this.checkedParts.length < 1) return;
    this.blockUiService.pushBlockUI('compareParts');
    const compareRequest = new AICompareRequest();
    compareRequest.clientId = this.clientId;
    compareRequest.debug = true;
    compareRequest.query = Array<Query>();

    this.checkedParts.forEach((item) => {
      const compareRequestQuery = new Query();
      compareRequestQuery.partsId = item.partId;
      compareRequestQuery.actual_cost_of_parts = 0;
      compareRequestQuery.image_similarity_score = 0.0;
      compareRequest.query.push(compareRequestQuery);
    });
    this.searchService
      .getAIComparisonSearch(compareRequest)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: AICompareResult) => {
        this.blockUiService.popBlockUI('compareParts');
        if (result) {
          this.dataSource = [];
          this.checkedParts.forEach((item) => {
            if (result.results?.length > 0 && (result.results as any) !== 'Data Error') {
              const filteredCompareResult = result.results?.find((compareData) => compareData.partsId === item.partId);
              if (filteredCompareResult) {
                const temporaryCombine = { ...item, ...filteredCompareResult };
                this.dataSource.push(temporaryCombine);
              } else {
                this.dataSource.push(item);
              }
              this.loadManufacturingCategory();
              this.loadPercentageCompletion();
              this.loadPdfCostSummaryInfo();
            }
          });
          this.recordCount = this.dataSource.length;
          this.checkedCount = 0;
          this.checkedParts = [];
          this.isLoaded = true;
        }
      });
  }

  private loadFilterData() {
    this.searchedText = this.searchedText.trim() !== '' ? this.searchedText : (this.searchedCommodity?.commodityId?.toString() ?? '');
    const searchedPart = this.dataSource.find((x) => x.partId.toString() === this.searchedText.toString() || x.intPartNumber.toString() === this.searchedText.toString());
    const searchedPartThumbnail = searchedPart?.imgThumbnailData ?? searchedPart?.pdfThumbnailData;
    this.dataSource = [];
    this.selectedFilterDisplayText = this.getFilterOptionsDisplayText();
    this.searchService
      .getDocumentsByTextSearch(this.searchedModel, this.currentListingPage, this.pageSize)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result?.aiSearchListTileDtos?.length === 0) {
          const message = 'Could not find any results for the searched text.';
          this.messaging.openAlertDialog({
            data: {
              title: 'Files not found',
              message: message,
              buttonText: 'OK',
              buttonColor: 'warn',
            },
          });
          return;
        }
        this.dataSource = result.aiSearchListTileDtos;
        this.recordCount = result?.totalRecordCount;
        const searchedResult = result.aiSearchListTileDtos[0];
        searchedResult.imgThumbnailData = searchedPartThumbnail;
        this.setAiSearchImage(searchedResult);
        this.load3dPartData();
        this.loadManufacturingCategory();
        this.loadPercentageCompletion();
        this.loadPdfCostSummaryInfo();
        this.loadPdfPartData();
        this.searchedText = '';
      });
  }

  private loadSimilaritySeachData() {
    if (!this.searchedPart) return;
    this.similaritySearchOrigin = this.searchedPart?.imageShowing === 'pdf' && !this.searchedPart?.pdfPartName.startsWith('IsometricView') && !!this.searchedPart.pdfThumbnailData ? 'pdf' : 'image';
    if (this.searchedPart.imgThumbnailData == null && !this.searchedPart?.pdfPartName.startsWith('IsometricView')) {
      this.similaritySearchOrigin = 'pdf';
    }
    this.setAiSearchImage(this.searchedPart, this.similaritySearchOrigin);
    this.blockUiService.pushBlockUI('similaritySearch');
    this.dataSource = [];
    if (this.similaritySearchOrigin === 'pdf') {
      const fileData = this.similaritySearchOrigin === 'pdf' ? this.searchedPart.pdfThumbnailData : null;
      const data: SimilaritySearchRequestDto = {
        origin: this.similaritySearchOrigin,
        fileData: fileData,
        pdfPartName: this.searchedPart.pdfPartName,
      };
      this.searchService
        .getPdfAISimilarSearch(parseInt(this.searchedPart.partId), this.searchedPart.manufacturingCategory, data)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: SimilaritySearchDto) => {
          if (result) {
            this.dataSource = result.aiSearchListTileDtos;
            this.recordCount = this.dataSource.length;
            this.dataSource?.forEach((element) => {
              element.similarityScore = this.sharedService.isValidNumber(element.similarityScore).toString();
              element.maxValue = this.sharedService.isValidNumber(element.maxValue) * 100;
              element.avgValue = this.sharedService.isValidNumber(element.avgValue) * 100;
              element.imageShowing = 'pdf';
            });
            this.blockUiService.popBlockUI('similaritySearch');
            this.loadPdfPartData();
            this.loadManufacturingCategory();
            this.loadPercentageCompletion();
            this.loadPdfCostSummaryInfo();
            this.loadExtractionInfo();
            this.load3dPartData();
          }
        });
      return;
    }

    this.searchService
      .get3dAISimilarSearch(parseInt(this.searchedPart.partId), this.searchedPart.manufacturingCategory)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: SimilaritySearchDto) => {
        if (result) {
          this.dataSource = result.aiSearchListTileDtos;
          this.timeDetails = result.timeDetails;
          this.recordCount = this.dataSource.length;
          this.totalTimeOfSql = result.totalTimeOfSql;
          this.totalTimeOfCosmos = result.totalTimeOfCosmos;
          this.dataSource?.forEach((element) => {
            element.similarityScore = this.sharedService.isValidNumber(element.similarityScore).toString();
            element.maxValue = this.sharedService.isValidNumber(element.maxValue) * 100;
            element.avgValue = this.sharedService.isValidNumber(element.avgValue) * 100;
          });
          this.blockUiService.popBlockUI('similaritySearch');
          this.load3dPartData();
          this.loadPdfPartData();
          this.loadManufacturingCategory();
          this.loadPercentageCompletion();
          this.loadPdfCostSummaryInfo();
          this.loadExtractionInfo();
        }
      });
  }

  private getFilterOptionsDisplayText(): string | undefined {
    return this.filterOptions.find((op) => op.filterKey === this.selectedFilterType)?.filterText;
  }

  private setAiSearchImage(searchedPart: AiSearchListTileDto, similaritySearchOrigin?: string) {
    this.aiSearchImage.imageUrl = similaritySearchOrigin === 'pdf' || searchedPart?.pdfPartName?.startsWith('IsometricView') ? searchedPart.pdfThumbnailData : searchedPart.imgThumbnailData;
    this.aiSearchImage.manufacturingCategory = searchedPart.manufacturingCategory;
    this.aiSearchImage.partId = searchedPart.partId;
    this.aiSearchImage.projectInfoId = searchedPart.projectInfoId;
    this.aiSearchImage.isSearched = true;
    this.aiSearchImage.partNumber = searchedPart.intPartNumber;
    this.aiSearchImage.partDescription = searchedPart.intPartDescription;
  }

  private loadPdfPartData() {
    const partIds = this.dataSource.map((x) => Number(x.partId));
    this.searchService
      .getPdfPartData(partIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: AiSearchImageInfoDto[]) => {
          this.dataSource.forEach((tile) => {
            const pdfData = result.find((x) => x.partInfoId.toString() === tile.partId.toString());
            if (pdfData) {
              tile.pdfThumbnailData = pdfData.thumbnailImage;
              tile.pdfPartName = pdfData.viewName;
            }
          });
        },
      });
  }

  private load3dPartData() {
    const partIds = this.dataSource.filter((p) => !p.onlyPdf).map((x) => Number(x.partId));
    this.searchService
      .createImageDataJob(partIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((streamId) => {
        this.searchService
          .getPartImageData(streamId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: (result: any) => {
              this.dataSource.forEach((tile) => {
                if (result?.PartInfoId && tile.partId.toString() === result?.PartInfoId.toString()) {
                  tile.imgThumbnailData = result?.ThumbnailImage;
                  if (this.aiSearchImage) {
                    if (!this.aiSearchImage.imageUrl) {
                      this.aiSearchImage.imageUrl = result?.ThumbnailImage;
                    }
                  }
                }
              });
            },
          });
      });
  }

  private loadPercentageCompletion() {
    const partIds = this.dataSource.map((x) => Number(x.partId));
    this.searchService
      .getPercentageCompletionInfo(partIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: AiSearchTileCompletionInfoDto[]) => {
          this.dataSource.forEach((tile) => {
            const completionPercentage = result.find((x) => x.partInfoId.toString() === tile.partId.toString());
            tile.completionPercentage = completionPercentage.totalPercentage;
          });
        },
      });
  }

  private loadExtractionInfo() {
    const partIds = this.dataSource.map((x) => Number(x.partId));
    this.searchService
      .getExtractionInfo(partIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: AiSearchTileExtractionInfoDto[]) => {
          this.dataSource.forEach((tile) => {
            const extractionInfo = result.find((x) => x.partInfoId.toString() === tile.partId.toString());
            if (extractionInfo) {
              const materialInfo = extractionInfo?.materialInfoJson ? JSON.parse(extractionInfo?.materialInfoJson) : null;
              tile.extractionInfoDto = {
                fileName: extractionInfo.fileName,
                materialInfoJson: extractionInfo.materialInfoJson,
                processInfoJson: extractionInfo.processInfoJson,
                pdfDocLocation: extractionInfo.pdfDocLocation,
                surfaceArea: materialInfo?.DimArea,
                volume: materialInfo?.DimVolume,
              };
            }
          });
        },
      });
  }

  private loadPdfCostSummaryInfo() {
    const partIds = this.dataSource.map((x) => Number(x.partId));
    this.searchService
      .getPdfCostSummaryInfo(partIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: PdfCostSummaryInfo[]) => {
          this.dataSource.forEach((tile) => {
            const pdfCostSummaryInfo = result.find((x) => x.partInfoId.toString() === tile.partId.toString());
            if (pdfCostSummaryInfo) {
              tile.pdfCostSummaryInfo = {
                deburr: pdfCostSummaryInfo.deburr,
                cleaning: pdfCostSummaryInfo.cleaning,
                surfaceFinish: pdfCostSummaryInfo.surfaceFinish,
                welding: pdfCostSummaryInfo.welding,
              };
            }
          });
        },
      });
  }
}
