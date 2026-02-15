import { Directive, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SearchBarModelDto } from 'src/app/shared/models/search-bar-model';
import {
  AiIntegratedInfoDto,
  AiSearchImageInfoDto,
  AiSearchListTileDto,
  AiSearchTileCompletionInfoDto,
  AiSearchTileExtractionInfoDto,
  PdfCostSummaryInfo,
  SimilaritySearchDto,
  SimilaritySearchRequestDto,
} from '../models/ai-image-similarity-result';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { UserService } from '../../settings/Services/user.service';
import { CommodityMasterDto } from 'src/app/shared/models/commodity-master.model';
import { Store } from '@ngxs/store';
import { CommodityState } from '../../_state/commodity.state';
import { AiSearchService, BlockUiService } from 'src/app/shared/services';
import { AISearchImage } from '../models/ai-search-image.model';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { SharedService } from '../../costing/services/shared.service';
import { ComparisonViewComponent } from '../components/search-list/ai-search-list-view/comparison-view/comparison-view.component';
import { MatDialog } from '@angular/material/dialog';
import { DocumentViewerComponent } from '../../costing/components/costing-supporting-documents/document-viewer/document-viewer.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CadViewerPopupComponent } from '../../costing/components/cad-viewer-popup/cad-viewer-popup.component';
import { CountryDataMasterDto } from 'src/app/shared/models';
import { CountryDataState } from '../../_state/country.state';
import { DigitalFactoryService } from '../../digital-factory/Service/digital-factory.service';
import { DfSupplierDirectoryMasterDto } from '../../digital-factory/Models/df-supplier-directory-master-dto';

@Directive()
export abstract class AiSearchHelperBase implements OnDestroy {
  dataSource: AiSearchListTileDto[] = [];
  recordCount: number = 0;
  defaultListingDataSource: AiSearchListTileDto[] = [];
  defaultRecordCount: number = 0;
  currentListingPage: number = 0;
  aiSearchImage: AISearchImage = new AISearchImage();
  pageFirst = 0;
  pageSize: number = 20;
  rowsPerPageOptions = [20, 30, 50, 70, 100];
  searchedPart?: AiSearchListTileDto;
  checkedCount = 0;
  checkedParts: any[] = [];
  filesUploaded?: FileList;
  _commodityMaster$: Observable<CommodityMasterDto[]>;
  commodityList?: CommodityMasterDto[];
  _countryDataMaster$: Observable<CountryDataMasterDto[]>;
  countryDataList: { [key: number]: CountryDataMasterDto } = {};
  searchedModel: SearchBarModelDto[] = [];
  similaritySearchOrigin?: string;
  users: any[] = [];
  userInfos: { [key: number]: string };
  isColumnView = false;
  supplierInfo: { [key: number]: DfSupplierDirectoryMasterDto } = {};
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();

  protected abstract loadDataSource(): void;
  protected afterLoadDataSource?(): void;

  protected constructor(
    readonly userInfoService: UserInfoService,
    readonly userService: UserService,
    readonly store: Store,
    readonly searchService: AiSearchService,
    readonly messaging: MessagingService,
    readonly sharedService: SharedService,
    readonly modalService: NgbModal,
    readonly matDialog: MatDialog,
    readonly digitalFactoryService: DigitalFactoryService,
    readonly blockUiService: BlockUiService
  ) {
    this._commodityMaster$ = this.store.select(CommodityState.getCommodityData);
    this._countryDataMaster$ = this.store.select(CountryDataState.getCountryData);
    this.userInfoService.getUserValue().subscribe((user) => {
      const clientId = user?.clientId;
      if (clientId) {
        this.loadUsers(clientId);
      }
    });
    this.loadCommodityData();
    this.loadCountryData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  protected loadListingPartData(): void {
    if (this.defaultListingDataSource && this.defaultListingDataSource.length > 0 && !this.isColumnView) {
      this.dataSource = this.defaultListingDataSource;
      this.recordCount = this.defaultRecordCount;
      return;
    }
    this.blockUiService.pushBlockUI('aiSearchListing');
    this.searchService
      .getDBpartsId(this.currentListingPage, this.pageSize)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: AiIntegratedInfoDto) => {
          if (result) {
            this.blockUiService.popBlockUI('aiSearchListing');
            if (this.isColumnView) {
              this.dataSource.push(...result.aiSearchListTileDtos);
            } else {
              this.dataSource = result.aiSearchListTileDtos;
            }
            this.defaultListingDataSource = this.dataSource;
            this.recordCount = result?.totalRecordCount;
            this.defaultRecordCount = result?.totalRecordCount;
            this.load3dPartData();
            this.loadPdfPartData();
            this.loadManufacturingCategory();
            this.loadMaterialInfoJson();
            // this.loadExtractionInfo();
            this.loadVendorInfo();
            if (this.afterLoadDataSource) {
              this.afterLoadDataSource();
            }
          }
        },
      });
  }

  protected loadPdfPartData() {
    const partIds = this.dataSource.map((x) => Number(x.partId));
    this.searchService
      .getPdfPartData(partIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: AiSearchImageInfoDto[]) => {
          for (const tile of this.dataSource) {
            const pdfData = result.find((x) => x.partInfoId.toString() === tile.partId.toString());
            if (pdfData) {
              tile.pdfThumbnailData = pdfData.thumbnailImage;
              tile.pdfPartName = pdfData.viewName;
            }
          }
        },
      });
  }

  protected loadFilterData() {
    this.blockUiService.pushBlockUI('aiSearchFilter');
    this.dataSource = [];
    this.searchService
      .getDocumentsByTextSearch(this.searchedModel, this.currentListingPage, this.pageSize)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result) => {
          this.blockUiService.popBlockUI('aiSearchFilter');
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
          this.setAiSearchImage(searchedResult);
          this.load3dPartData();
          this.loadManufacturingCategory();
          this.loadPdfPartData();
          this.loadExtractionInfo();
          // this.searchedText = '';
        },
      });
  }

  protected loadManufacturingCategory(): void {
    if (!this.dataSource || !this.commodityList) {
      return;
    }
    for (const x of this.dataSource) {
      x.manufacturingCategory = this.commodityList.find((c) => c.commodityId.toString() === x.commodityId?.toString())?.commodity;
    }
  }

  protected loadExtractionInfo() {
    const partIds = this.dataSource.map((x) => Number(x.partId));
    this.searchService
      .getExtractionInfo(partIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: AiSearchTileExtractionInfoDto[]) => {
          for (const tile of this.dataSource) {
            const extractionInfo = result.find((x) => x.partInfoId.toString() === tile.partId.toString());
            if (extractionInfo) {
              const materialInfo = extractionInfo?.materialInfoJson ? JSON.parse(extractionInfo?.materialInfoJson) : null;
              tile.extractionInfoDto = {
                fileName: extractionInfo.fileName,
                materialInfoJson: extractionInfo.materialInfoJson,
                processInfoJson: extractionInfo.processInfoJson,
                pdfDocLocation: extractionInfo.pdfDocLocation,
                surfaceArea: this.sharedService.isValidNumber(materialInfo?.DimArea).toString(),
                volume: this.sharedService.isValidNumber(materialInfo?.DimVolume).toString(),
                dimArea: this.sharedService.isValidNumber(materialInfo?.DimArea).toString(),
              };
            }
          }
        },
      });
  }

  protected initPageData() {
    this.load3dPartData();
  }

  protected load3dPartData() {
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
              for (const tile of this.dataSource) {
                if (result?.PartInfoId && tile.partId.toString() === result?.PartInfoId.toString()) {
                  tile.imgThumbnailData = result?.ThumbnailImage;
                  if (this.aiSearchImage) {
                    if (!this.aiSearchImage.imageUrl) {
                      this.aiSearchImage.imageUrl = result?.ThumbnailImage;
                    }
                  }
                }
              }
            },
          });
      });
  }

  protected loadPercentageCompletion() {
    const partIds = this.dataSource.map((x) => Number(x.partId));
    this.searchService
      .getPercentageCompletionInfo(partIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: AiSearchTileCompletionInfoDto[]) => {
          for (const tile of this.dataSource) {
            const completionPercentage = result.find((x) => x.partInfoId.toString() === tile.partId.toString());
            tile.completionPercentage = completionPercentage.totalPercentage;
          }
        },
      });
  }

  protected getUserName(userId: number): string {
    const user = this.users.find((x) => x.userId === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }

  protected removeBase64Prefix(base64String: string): string {
    const regex = /^data:image\/(png|jpeg);base64,/;
    return base64String.replace(regex, '');
  }

  // carousel controls for grid cards
  protected onImageViewChange(item: any, dir: 'next' | 'prev' = 'next') {
    if (!item?.imgThumbnailData || !item?.pdfThumbnailData) {
      return;
    }
    if (dir === 'next' || dir === 'prev') {
      item.imageShowing = item.imageShowing === 'cad' ? 'pdf' : 'cad';
    }
  }

  protected setImageView(item: any, view: 'cad' | 'pdf') {
    if (!item) {
      return;
    }
    item.imageShowing = view;
  }

  private loadCommodityData() {
    this._commodityMaster$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: CommodityMasterDto[]) => {
      this.commodityList = result;
    });
  }

  private loadCountryData() {
    this._countryDataMaster$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: CountryDataMasterDto[]) => {
      this.countryDataList = result.reduce(
        (acc, country) => {
          acc[country.countryId] = country;
          return acc;
        },
        {} as { [key: number]: CountryDataMasterDto }
      );
    });
  }

  private loadVendorInfo() {
    return this.digitalFactoryService
      .getMasterSupplierInfoByIds(this.dataSource.map((x) => Number(x.vendorId)).filter((v) => v && v > 0))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: DfSupplierDirectoryMasterDto[]) => {
          this.supplierInfo = result.reduce(
            (acc, vendor) => {
              acc[vendor.supplierId] = vendor;
              return acc;
            },
            {} as { [key: number]: DfSupplierDirectoryMasterDto }
          );
        },
      });
  }

  private loadMaterialInfoJson() {
    for (const tile of this.dataSource) {
      if (tile.materialInfoJson) {
        const materialInfo = JSON.parse(tile.materialInfoJson);
        tile.dimArea = this.sharedService.isValidNumber(materialInfo?.DimArea);
        tile.volume = this.sharedService.isValidNumber(materialInfo?.DimVolume);
        tile.surfaceArea = this.sharedService.isValidNumber(materialInfo?.SurfaceArea);
        tile.netWeight = this.sharedService.isValidNumber(materialInfo?.NetWeight);
      }
    }
  }

  protected setAiSearchImage(searchedPart: AiSearchListTileDto, similaritySearchOrigin?: string) {
    this.aiSearchImage.imageUrl = similaritySearchOrigin === 'pdf' || searchedPart?.pdfPartName?.startsWith('IsometricView') ? searchedPart.pdfThumbnailData : searchedPart.imgThumbnailData;
    this.aiSearchImage.manufacturingCategory = searchedPart.manufacturingCategory;
    this.aiSearchImage.partId = searchedPart.partId;
    this.aiSearchImage.projectInfoId = searchedPart.projectInfoId;
    this.aiSearchImage.isSearched = true;
    this.aiSearchImage.partNumber = searchedPart.intPartNumber;
    this.aiSearchImage.partDescription = searchedPart.intPartDescription;
  }

  protected loadPdfCostSummaryInfo() {
    const partIds = this.dataSource.map((x) => Number(x.partId));
    this.searchService
      .getPdfCostSummaryInfo(partIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: PdfCostSummaryInfo[]) => {
          for (const tile of this.dataSource) {
            const pdfCostSummaryInfo = result?.find((x) => x.partInfoId.toString() === tile.partId.toString());
            if (pdfCostSummaryInfo) {
              tile.pdfCostSummaryInfo = {
                deburr: pdfCostSummaryInfo.deburr,
                cleaning: pdfCostSummaryInfo.cleaning,
                surfaceFinish: pdfCostSummaryInfo.surfaceFinish,
                welding: pdfCostSummaryInfo.welding,
              };
            }
          }
        },
      });
  }

  protected loadSimilaritySeachData() {
    if (!this.searchedPart) return;
    this.similaritySearchOrigin = this.searchedPart?.imageShowing === 'pdf' && !this.searchedPart?.pdfPartName.startsWith('IsometricView') && !!this.searchedPart.pdfThumbnailData ? 'pdf' : 'image';
    if (this.searchedPart.imgThumbnailData == null && !this.searchedPart?.pdfPartName.startsWith('IsometricView')) {
      this.similaritySearchOrigin = 'pdf';
    }
    this.setAiSearchImage(this.searchedPart, this.similaritySearchOrigin);
    this.dataSource = [];
    if (this.similaritySearchOrigin === 'pdf') {
      const fileData = this.similaritySearchOrigin === 'pdf' ? this.searchedPart.pdfThumbnailData : null;
      const data: SimilaritySearchRequestDto = {
        origin: this.similaritySearchOrigin,
        fileData: fileData,
        pdfPartName: this.searchedPart.pdfPartName,
      };
      this.blockUiService.pushBlockUI('aiSearchSimilarityPdf');
      this.searchService
        .getPdfAISimilarSearch(parseInt(this.searchedPart.partId), this.searchedPart.manufacturingCategory, data)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: SimilaritySearchDto) => {
          this.blockUiService.popBlockUI('aiSearchSimilarityPdf');
          if (result) {
            this.dataSource = result.aiSearchListTileDtos;
            this.recordCount = this.dataSource.length;
            if (this.dataSource) {
              for (const element of this.dataSource) {
                element.similarityScore = this.sharedService.isValidNumber(element.similarityScore).toString();
                element.maxValue = this.sharedService.isValidNumber(element.maxValue) * 100;
                element.avgValue = this.sharedService.isValidNumber(element.avgValue) * 100;
                element.imageShowing = 'pdf';
              }
            }
            this.loadPdfPartData();
            this.loadManufacturingCategory();
            this.loadExtractionInfo();
            this.load3dPartData();
          }
        });
      return;
    }

    this.blockUiService.pushBlockUI('aiSearchSimilarity');
    this.searchService
      .get3dAISimilarSearch(parseInt(this.searchedPart.partId), this.searchedPart.manufacturingCategory)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: SimilaritySearchDto) => {
        if (result) {
          this.blockUiService.popBlockUI('aiSearchSimilarity');
          this.dataSource = result.aiSearchListTileDtos;
          this.recordCount = this.dataSource.length;
          this.dataSource?.forEach((element) => {
            element.similarityScore = this.sharedService.isValidNumber(element.similarityScore).toString();
            element.maxValue = this.sharedService.isValidNumber(element.maxValue) * 100;
            element.avgValue = this.sharedService.isValidNumber(element.avgValue) * 100;
          });
          this.load3dPartData();
          this.loadPdfPartData();
          this.loadManufacturingCategory();
          this.loadExtractionInfo();
        }
      });
  }

  protected loadImageSimilaritySeachData(filesUploaded: FileList | null) {
    if (filesUploaded?.length !== 1) {
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
    reader.readAsDataURL(filesUploaded[0]);
    this.aiSearchImage.manufacturingCategory = '';
    this.aiSearchImage.partId = '';
    this.aiSearchImage.projectInfoId = '';
    this.aiSearchImage.partNumber = '';
    this.aiSearchImage.partDescription = '';
    this.aiSearchImage.isSearched = true;
    const formData = new FormData();
    const file = filesUploaded[0];
    formData.append('formFile', file, file.name);
    formData.append('originalFileName', file.name);
    this.dataSource = [];
    this.blockUiService.pushBlockUI('aiImageSimilarity');
    this.searchService
      .getAIImageSimilarSearch(1, formData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: SimilaritySearchDto) => {
          this.blockUiService.popBlockUI('aiImageSimilarity');
          if (result) {
            this.dataSource = result?.aiSearchListTileDtos;
            this.recordCount = this.dataSource.length;
            this.load3dPartData();
            this.loadManufacturingCategory();
          }
        },
      });
  }

  protected onCheckboxChange(event: Event, pidSearch: any): void {
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

  protected resetCompare() {
    this.checkedCount = 0;
    this.checkedParts = [];
    const elements = document.getElementsByClassName('form-check-input') as any;
    for (let i = 0; i < elements?.length; i++) {
      elements.item(i).checked = false;
    }
  }

  protected compareParts() {
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

  protected compareWithSearched(comparedPart?: AiSearchListTileDto) {
    this.open3DViewer(comparedPart, 'cad', true);
  }

  protected open3DViewer(pidSearch?: any, fileType = 'cad', isCompare = false) {
    const comparedPart = pidSearch ?? this.checkedParts[1];
    if (!comparedPart && this.checkedParts?.length === 0) {
      return;
    }
    this.searchService
      .getExtractionInfo([comparedPart.partId])
      .pipe(takeUntil(this.unsubscribe$))
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

  protected openDocumentViewer(pdfDocLocation: string) {
    const data: any = { docLocation: pdfDocLocation };
    const modalRef = this.modalService.open(DocumentViewerComponent, { windowClass: 'fullscreen' });
    modalRef.componentInstance.data = data;
  }

  private loadUsers(clientId: number) {
    this.userService.getUsersByClientId(clientId).subscribe((users) => {
      this.users = users;
      this.userInfos = this.users.reduce((acc: { [key: number]: string }, user) => {
        acc[user.userId] = `${user.firstName} ${user.lastName}`;
        return acc;
      });
    });
  }
}
