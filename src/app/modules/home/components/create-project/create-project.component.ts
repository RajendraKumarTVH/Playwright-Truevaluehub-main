import { Component, OnInit, ViewChild, ElementRef, Inject, OnDestroy, AfterViewInit, effect } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DndDraggableDirective, DndDropEvent, DndDropzoneDirective } from 'ngx-drag-drop';
import { tvhAzureBlobUrlToken } from 'src/app/app.token';
import { ProjectCreationService } from '../../services/project-creation.service';
import * as XLSX from 'xlsx';
import { ProjectInfoService } from 'src/app/shared/services/project-info.service';
import { BomUploadPartViewModel, FileInfo, ProjectBasicDetailsModel, ProjectPartsUploadModel } from '../../models';
import { BillOfMaterialDto, CommodityMasterDto, CountryDataMasterDto, FileEntry, PartInfoDto, ProjectInfoDto, BuLocationDto, isFileEntry } from 'src/app/shared/models';
import { ProjectStatus } from 'src/app/shared/enums/project-status.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, takeUntil, first, map, startWith, debounceTime, concatAll } from 'rxjs/operators';
import { Observable, Subject, Subscription, from } from 'rxjs';
import { BlockUiService, PartInfoService } from 'src/app/shared/services';
import { homeEndpoints } from '../../home.endpoints';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { DocumentRecordDto } from 'src/app/shared/models/document-records.model';
import { VendorService } from 'src/app/modules/data/Service/vendor.service';
import { PartComplexity } from 'src/app/shared/enums';
import { Store } from '@ngxs/store';
import { CommodityState } from 'src/app/modules/_state/commodity.state';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { DraftProjectPartInfoUpdateDto } from 'src/app/shared/models/draft-part-info.model';
import { BuLocationService } from 'src/app/modules/data/Service/bu-location.service';
import { CommodityType, CostingConfig, MountingType } from 'src/app/modules/costing/costing.config';
import { SupportingFileTypeEnum } from 'src/app/shared/enums/file-types.enum';
import _ from 'lodash';
// import * as BomActions from 'src/app/modules/_actions/bom.action';
// import { BomTreeState } from 'src/app/modules/_state/bom.state';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { DigitalFactoryDtoNew } from 'src/app/modules/digital-factory/Models/digital-factory-dto';
import { PCBAMarketDataDto } from 'src/app/shared/models/pcb-master..model';
import { PCBRPAConfigService } from 'src/app/shared/config/pcba-rpa.config';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgbDropdownModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';

import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import moment from 'moment';
import { Moment } from 'moment';
import { SharedModule } from 'src/app/shared/shared.module';
import { DndDirective } from 'src/app/shared/directives';

import * as stringSimilarity from 'string-similarity';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    DndDraggableDirective,
    NgbProgressbarModule,
    NgbDropdownModule,
    DropdownModule,
    TableModule,
    DndDropzoneDirective,
    MatDatepickerModule,
    SharedModule,
    DndDirective,
    AutoCompleteModule,
  ],
})
export class CreateProjectComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly projectDate = new FormControl(moment());
  today = new Date();
  @ViewChild('fileDropRef', { static: false }) fileDropEl: ElementRef | undefined;
  @ViewChild('fileDropRef1', { static: false }) fileDropEl1: ElementRef | undefined;
  parts: BomUploadPartViewModel[] = [];
  clonedParts: { [s: string]: BomUploadPartViewModel } = {};
  tempPartData: BomUploadPartViewModel = {} as BomUploadPartViewModel;
  tempFileNames: string[] = [];
  commodityList: CommodityMasterDto[] = [];
  // vendorList: VendorDto[] = [];
  vendorList: DigitalFactoryDtoNew[] = [];
  buLocationList: BuLocationDto[] = [];
  countryList: CountryDataMasterDto[] = [];
  removedTempFileNames: string[] = [];
  remainingpartImage: string[] = [];
  templateFileName: string = '';
  projectname = new FormControl('');
  projectdescription = new FormControl('');
  tag = new FormControl('');
  quarter = new FormControl('');
  partsFormData: FormData | undefined;
  isProjectCreation: boolean = true;
  isBomTemplate: boolean = true;
  currentProjectId: number = 0;
  showProgressBar: boolean = false;
  progressBarValue: number;
  math = Math;
  unAssociatedDocuments: any[] = [];
  projdetails: any;
  editProjectInfoDto: ProjectInfoDto;
  private readonly tvhAzureBlobUrl: string;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  disabledActivateButton = false;
  stopApiCall = false;
  removeUnused = false;
  deletePartsInfoDto: BillOfMaterialDto[];
  rejectedExtensions = ['exe', 'sh', 'bat', 'js', 'php', 'asp', 'aspx', 'jsp', 'html'];

  public options: any[] = [
    { value: 'Q1', months: ['Jan', 'Feb', 'Mar'] },
    { value: 'Q2', months: ['Apr', 'May', 'Jun'] },
    { value: 'Q3', months: ['Jul', 'Aug', 'Sep'] },
    { value: 'Q4', months: ['Oct', 'Nov', 'Dec'] },
  ];
  public control: FormControl = new FormControl();
  public year: number | null;
  public yearDefault = new Date().getFullYear();
  public quarterDefault = 'Q' + (1 + Math.floor(new Date().getMonth() / 3));
  public quarterText: string | null;
  public showQuarter: boolean = true;
  public year10: number;
  dialogSub: Subscription;
  private electronicUploadValid = true;
  _commodityMaster$: Observable<CommodityMasterDto[]>;
  _countryMaster$: Observable<CountryDataMasterDto[]>;
  // _bomTree$: Observable<BillOfMaterialDto[]>;
  cols: any[];
  selectedCommodity: CommodityMasterDto = null;
  selectedSupplier: DigitalFactoryDtoNew = null;
  selectedDeliverySite: BuLocationDto = null;

  selectedTags: string[] = ['Tag A', 'Tag B', 'Plastic'];
  availableTags: string[] = [];
  allTags: string[] = ['Tag A', 'Tag B', 'Tag C', 'Plastic', 'Metal', 'Rubber', 'Wood', 'Glass'];
  bomInfoEffect = effect(() => {
    const bomInfo = this.bomInfoSignalsService.bomInfo();
    if (bomInfo) {
      this.deletePartsInfoDto = bomInfo;
    }
  });

  constructor(
    private projectCreationservice: ProjectCreationService,
    private route: ActivatedRoute,
    private projectInfoService: ProjectInfoService,
    private messaging: MessagingService,
    private router: Router,
    private blockUiService: BlockUiService,
    private partInfoService: PartInfoService,
    private vendorService: VendorService,
    private buLocationSvc: BuLocationService,
    private costingConfig: CostingConfig,
    private digitalFactoryService: DigitalFactoryService,
    private _store: Store,
    private _pcbConfig: PCBRPAConfigService,
    private bomInfoSignalsService: BomInfoSignalsService,
    @Inject(tvhAzureBlobUrlToken) tvhAzureBlobUrl: string
  ) {
    this._commodityMaster$ = this._store.select(CommodityState.getCommodityData);
    this._countryMaster$ = this._store.select(CountryDataState.getCountryData);
    // this._bomTree$ = this._store.select(BomTreeState.getBomsByProjectId);
    this.tvhAzureBlobUrl = tvhAzureBlobUrl;
  }

  ngOnInit(): void {
    this.cols = this.costingConfig.getBOMColumns();
    this.stopApiCall = false;
    this.route.data
      .pipe(
        map<any, ProjectInfoDto>((data) => data['projectInfoDto']),
        filter((projectInfoDto) => !!projectInfoDto),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectInfoDto) => (this.editProjectInfoDto = projectInfoDto));
    this.getCommodityData();
    this.getSupplierData();
    this.getSiteList();
    this.getCountryData();
    if (this.editProjectInfoDto) {
      this.mapPartsData(this.editProjectInfoDto);
    }

    this.quarter.valueChanges.pipe(takeUntil(this.unsubscribe$), startWith(this.quarterText + ' ' + this.year), debounceTime(200)).subscribe((res) => {
      if (res) {
        res = res.toUpperCase();
        if (res[0] != 'Q') res = 'Q' + res;
        const value = res.replace(/[^Q|0-9]/g, '');
        let quarter;
        let year;
        if (value.length >= 2) quarter = value[0] + value[1];
        if (value.length >= 6) {
          year = value.substr(2, 4);
          this.year = +year;
          this.quarterText = quarter || null;
          this.quarter.setValue(this.quarterText + ' ' + this.year, {
            emitEvent: false,
          });
        } else {
          this.year = null;
          this.quarterText = null;
        }
      }
    });

    // this._bomTree$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: BillOfMaterialDto[]) => {
    //   if (result) {
    //     this.deletePartsInfoDto = result;
    //   }
    // });
  }

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.projectDate.value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.projectDate.setValue(ctrlValue);
    datepicker.close();
  }

  public ngAfterViewInit(): void {
    if (!this.editProjectInfoDto) {
      this.quarter.setValue(this.quarterDefault + ' ' + this.yearDefault);
    } else {
      if (this.editProjectInfoDto.marketQuarter) {
        const splitted = this.editProjectInfoDto.marketQuarter?.split('-');
        const year = +(splitted[0] || new Date().getFullYear());
        const quarter = 'Q' + +((splitted[1] || '0').match(/\d+/) || [0])[0];
        this.quarter.setValue(quarter + ' ' + year);
      }
    }
  }

  private getCommodityData() {
    this._commodityMaster$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: CommodityMasterDto[]) => {
      const selectPart: CommodityMasterDto = {
        commodityId: undefined,
        commodity: 'Select Category',
        isActive: false,
        priority: 0,
      };
      // this.commodityList.push(selectPart);
      // this.commodityList = this.commodityList.concat(result);
      this.commodityList = [selectPart, ...result];
    });
  }

  private getSupplierData() {
    return this.digitalFactoryService
      .getAllDigitalFactorySuppliers()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        const selectPart: DigitalFactoryDtoNew = {
          supplierId: undefined,
          supplierDirectoryMasterDto: {
            supplierId: undefined,
            vendorName: 'Select Supplier',
            countryId: 0,
            regionId: 0,
            companyType: 0,
            financialRisk: 0,
          },
        };
        this.vendorList.push(selectPart);
        this.vendorList = this.vendorList.concat(res);
      });
  }

  // private getSiteList() {
  //   return this.buLocationSvc
  //     .getBuLocation()
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe((result: BuLocationDto[]) => {
  //       if (result?.length > 0) {
  //         this.buLocationList = [...result];
  //       }
  //     });
  // }

  private getSiteList() {
    return this.buLocationSvc
      .getBuLocation()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: BuLocationDto[]) => {
        if (result?.length > 0) {
          const defaultOption: BuLocationDto = {
            buId: undefined,
            buName: 'Select Delivery Site',
            regionId: undefined,
            type: undefined,
            latitude: undefined,
            longitude: undefined,
            address: '',
            city: '',
            state: '',
            zipCode: '',
            lat: 0,
            lng: 0,
            country: 0,
          };

          this.buLocationList = [defaultOption, ...result];
        }
      });
  }

  private getCountryData() {
    return this._countryMaster$.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      this.countryList = res;
    });
  }

  // public onModelChange(_e: any) {}

  _keyUp(event: any) {
    const pattern = /[0-9]|\./;
    const inputChar = String.fromCharCode(event.key);
    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  public removeUploadedDocument(documentRecordId: number, part: BomUploadPartViewModel, file?: any): void {
    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Confirm Delete',
        message: 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
        action: 'CONFIRM',
        cancelText: 'CANCEL',
      },
    });
    this.dialogSub = dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((confirmed) => {
        if (!confirmed) return;

        if (documentRecordId > 0) {
          this.deleteUploadedDocumentFromServer(documentRecordId, part);
        } else {
          this.removeUploadedDocumentLocally(part, file);
        }
      });
  }

  private deleteUploadedDocumentFromServer(documentRecordId: number, part: BomUploadPartViewModel): void {
    this.blockUiService.pushBlockUI('deleteDocument');
    this.partInfoService
      .deleteDocument(+part.partId, documentRecordId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result) => {
          this.blockUiService.popBlockUI('deleteDocument');
          if (result) {
            part.fileList = part.fileList.filter((x) => x.documentId !== documentRecordId);
            this.tempPartData = JSON.parse(JSON.stringify(part));
          }
        },
        error: (error) => {
          this.blockUiService.popBlockUI('deleteDocument');
          console.error('Failed to delete document:', error);
        },
      });
  }

  private removeUploadedDocumentLocally(part: BomUploadPartViewModel, file?: any): void {
    if (file) {
      part.fileList = part.fileList.filter((x) => x.documentName !== file.documentName);
    } else {
      part.fileList = [];
    }
    this.tempPartData = JSON.parse(JSON.stringify(part));
  }

  public removeMultipleExtractionDocument(documentRecordId: number, part: BomUploadPartViewModel): any {
    if (documentRecordId > 0) {
      this.blockUiService.pushBlockUI('deleteDocument');
      this.partInfoService
        .deleteDocument(+part.partId, documentRecordId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          (result) => {
            this.blockUiService.popBlockUI('deleteDocument');
            if (result) {
              part.fileList = part.fileList.filter((x) => x.documentId !== documentRecordId) || [];
              this.tempPartData = JSON.parse(JSON.stringify(part));
            }
          },
          (error) => {
            console.error(error);
          }
        );
    }
  }

  public removeUnassociatedDocuments(index: number) {
    if (index > -1) {
      this.unAssociatedDocuments.splice(index, 1);
    }
  }

  cancelClick() {
    this.parts.forEach((x, i) => {
      if (x.isEdit) {
        this.tempPartData.isEdit = false;
        this.parts[i] = JSON.parse(JSON.stringify(this.tempPartData));
      }
    });
    this.tempPartData = {} as BomUploadPartViewModel;
  }

  saveClick() {
    if (this.currentProjectId > 0) {
      this.parts.forEach((x) => {
        if (x.isEdit) {
          const draftPartInfoUpdate = new DraftProjectPartInfoUpdateDto();
          draftPartInfoUpdate.projectInfoId = +x.projectId;
          draftPartInfoUpdate.bomId = x.id;
          draftPartInfoUpdate.partInfoId = +x.partId;
          draftPartInfoUpdate.commodityId = x.commodityId;
          draftPartInfoUpdate.partQty = Number(x.partQty);
          draftPartInfoUpdate.partInfoDescription = x.partDescription;
          draftPartInfoUpdate.annualVolume = +x.annualVolume;
          draftPartInfoUpdate.unitOfMeasure = +x.unitofMeasure;
          draftPartInfoUpdate.vendorId = x.vendorId;
          draftPartInfoUpdate.mfrCountryId = x.mfrCountryId;
          draftPartInfoUpdate.buId = x.buId;
          draftPartInfoUpdate.deliveryCountryId = x.deliveryCountryId;

          this.partInfoService
            .draftPartInfoUpdate(+x.partId, draftPartInfoUpdate)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {});
        }
        x.isEdit = false;
      });
    }
  }

  editClick(partItem: any) {
    this.parts.forEach((x) => {
      x.isEdit = false;
    });
    this.tempPartData = JSON.parse(JSON.stringify(partItem));
    partItem.isEdit = true;
  }

  //Method for file drop which is for tempalte
  // async onTemplateFileDropped($event: any) {
  //   if (this.validateOnUploadTemplate($event.dataTransfer.files) && $event.dataTransfer.files?.length > 0) {
  //     this.templateFileName = $event.dataTransfer?.files[0]?.name;
  //     const file = $event.dataTransfer?.files[0];
  //     this.uploadData($event.dataTransfer.id, file);
  //   }
  // }

  async onTemplateFileDropped($event: any) {
    const files: File[] = Array.from($event.dataTransfer.files || []);

    const acceptedFiles = files?.filter((file) => {
      const extension = file?.name?.split('.').pop()?.toLowerCase();
      return extension && !this.rejectedExtensions.includes(extension);
    });

    if (this.validateOnUploadTemplate(acceptedFiles) && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      this.templateFileName = file.name;

      this.uploadData($event.dataTransfer.id, file);
    }
  }

  public validate() {
    return this.validateOnUploadTemplate();
  }

  private validateOnUploadTemplate(files: any = null) {
    const fileElement = <HTMLInputElement>document.getElementById('fileDropRef');
    const filesDropped = files;
    if (!this.projectname.value || this.projectname.value.trim() == '') {
      this.messaging.openSnackBar('Please enter project name.', '', {
        duration: 3000,
      });
      return false;
    } else if (this.quarter.value == '') {
      this.messaging.openSnackBar('Please select market quarter.', '', {
        duration: 3000,
      });
      return false;
    } else if (this.currentProjectId > 0 && (files ? filesDropped?.length > 0 && this.templateFileName : fileElement.value)) {
      this.confirmationDialog()
        .afterClosed()
        .pipe(
          map((result) => {
            if (result) {
              if (!(files && filesDropped?.length > 0)) {
                fileElement.value = '';
              }
              this.templateFileName = '';
              return true;
            } else {
              return false;
            }
          })
        )
        .subscribe();
      return false;
    }
    return true;
  }

  uploadData(id: string, file: any) {
    try {
      //upload template
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      const projectInfo = new ProjectInfoDto();
      fileReader.onload = () => {
        const arrayBufferResult = fileReader.result as ArrayBuffer;
        const uint8ArrayData = new Uint8Array(arrayBufferResult);
        const arrayData = [];
        let isValid = true;

        for (let i = 0; i != uint8ArrayData.length; ++i) arrayData[i] = String.fromCharCode(uint8ArrayData[i]);
        const workbook = XLSX.read(arrayData.join(''), { type: 'binary' });
        const firstSheetName = 'Custom Parts & Assemblies';
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, {
          raw: true,
        }) as any[];
        const bomList = data?.filter((x) => x?.Description?.indexOf('Part ') > -1 && Object.prototype.hasOwnProperty.call(x, 'Part Number'));
        let partInfoList = new Array<PartInfoDto>();
        if (!bomList || bomList.length <= 0) {
          isValid = false;
          this.messaging.openSnackBar('Atleast one BOM should exist.', '', {
            duration: 5000,
          });
          return;
        }

        const partNumbers = bomList.filter((x) => (x['Part Number'] || '').toString().trim())?.map((x) => x['Part Number']?.toString());
        for (let i = 0; i < bomList?.length; i++) {
          const bom = bomList[i];
          const partInfo = new PartInfoDto();
          const bomData = new BillOfMaterialDto();
          const partNumber = (bom['Part Number'] || '').toString().trim();
          if (!partNumber) {
            isValid = false;
            this.messaging.openSnackBar(`Part number is required for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
            return;
          }
          partInfo.intPartNumber = partNumber;
          const revisionLevel = (bom['Revision Level'] || '').toString().trim();
          if (revisionLevel) {
            if (revisionLevel.length > 10000) {
              isValid = false;
              this.messaging.openSnackBar(`Revision Level should not be more than 10000 for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
          }

          partInfo.partRevision = revisionLevel || '';
          const partDesc = (bom['Part Description'] || '').toString().trim();
          if (partDesc && partDesc.length > 64) {
            isValid = false;
            this.messaging.openSnackBar(`Part Description should not be more than 64 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
            return;
          }

          partInfo.intPartDescription = partDesc;
          const parentPartNumber = (bom['Parent Part Number'] || '').toString().trim();
          if (parentPartNumber && !partNumbers?.includes(parentPartNumber)) {
            isValid = false;
            this.messaging.openSnackBar(`Parent Part Number is not valid for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
            return;
          }
          if (parentPartNumber === partNumber) {
            bomData.parentPartNumber = '';
          } else {
            bomData.parentPartNumber = parentPartNumber;
          }

          const bomQty = (bom['Part Number Quantity (Nos)'] || '').toString().trim();
          if (!bomQty) {
            isValid = false;
            this.messaging.openSnackBar(`Part Quantity is required for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
            return;
          }

          if (bomQty) {
            if (!Number(bomQty) || isNaN(+bomQty)) {
              isValid = false;
              this.messaging.openSnackBar(`Bom Quantity should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
            if (bomQty.length > 10000000) {
              isValid = false;
              this.messaging.openSnackBar(`Bom Quantity should not be more than 10000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
          }

          bomData.partQty = bomQty || 0;
          const totalannualQty = (bom['Total Annual Quantity (Nos)'] || '').toString().trim();
          if (totalannualQty) {
            if (!Number(totalannualQty) || isNaN(+totalannualQty)) {
              isValid = false;
              this.messaging.openSnackBar(`Total Annual Quantity should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
            if (totalannualQty.length > 10000000) {
              isValid = false;
              this.messaging.openSnackBar(`Total Annual Quantity should not be more than 10000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
          }
          partInfo.eav = totalannualQty || 0;

          const lifeTimeRemainningYears = (bom['Product life remaining (years)'] || '').toString().trim();
          if (lifeTimeRemainningYears) {
            if (!Number(lifeTimeRemainningYears) || isNaN(+lifeTimeRemainningYears)) {
              isValid = false;
              this.messaging.openSnackBar(`Lifetime Remaining (Years) should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
            if (lifeTimeRemainningYears.length > 10000000) {
              isValid = false;
              this.messaging.openSnackBar(`Lifetime Remaining (Years) should not be more than 10000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
          }

          bomData.lifetimeRemainingYears = +lifeTimeRemainningYears || 10;
          partInfo.prodLifeRemaining = bomData.lifetimeRemainingYears;
          partInfo.partComplexity = PartComplexity.Low;
          let lifeTimeQuantity = (bom['Lifetime quantity remaining (Nos)'] || '').toString().trim();
          if (lifeTimeQuantity) {
            if (!Number(lifeTimeQuantity) || isNaN(+lifeTimeQuantity)) {
              isValid = false;
              this.messaging.openSnackBar(`Lifetime Quantity (UOM) should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }

            if (lifeTimeQuantity.length > 10000000) {
              isValid = false;
              this.messaging.openSnackBar(`Lifetime Quantity (UOM) should not be more than 10000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
          } else {
            lifeTimeQuantity = partInfo.eav && partInfo.prodLifeRemaining ? Number(partInfo.eav) * Number(partInfo.prodLifeRemaining) : 0;
          }

          bomData.lifetimeQuantityUOM = +lifeTimeQuantity || 0;
          partInfo.lifeTimeQtyRemaining = bomData.lifetimeQuantityUOM;

          const commodity = (bom['Manufacturing Process/Commodity'] || '').toString().trim();
          if (commodity) {
            const commodityId = this.commodityList?.find((x) => x.commodity == commodity)?.commodityId;
            if (commodityId) {
              partInfo.commodityId = commodityId;
            } else {
              // partInfo.commodityId = this.commodityList[0].commodityId;
              partInfo.commodityId = null;
            }
          } else {
            // partInfo.commodityId = this.commodityList[0].commodityId;
            partInfo.commodityId = null;
          }

          let preferredLotSize = (bom['Preferred Lot Size (Nos)'] || '').toString().trim();
          if (preferredLotSize) {
            if (!Number(preferredLotSize) || isNaN(+preferredLotSize)) {
              isValid = false;
              this.messaging.openSnackBar(`Preferred Lot Size should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }

            if (preferredLotSize.length > 1000000) {
              isValid = false;
              this.messaging.openSnackBar(`Preferred Lot Size should not be more than 1000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
          } else {
            preferredLotSize = partInfo.eav ? Math.round(partInfo.eav / 12) : 0;
          }

          partInfo.lotSize = +preferredLotSize || 0;
          const isPartPurchased = (bom['Is this part being purchased currently? (Yes/NO)'] || '').toString().trim();
          if (!isPartPurchased) {
            isValid = false;
            this.messaging.openSnackBar(`Is this part being purchased currently? is required for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
            return;
          }
          bomData.isThisPartBeingPurchasedCurrently = isPartPurchased == 'Y';
          if (bomData.isThisPartBeingPurchasedCurrently) {
            const currentSupplier = (bom['Current Supplier Name'] || '').toString().trim();
            bomData.currentSupplierName = currentSupplier;
            if (currentSupplier) {
              const supplierId = this.vendorList?.find((x) => x.supplierDirectoryMasterDto?.vendorName == currentSupplier)?.supplierId; //.vendorId;
              if (supplierId) {
                bomData.currentSupplierName = currentSupplier;
                partInfo.supplierInfoId = supplierId;
              } else {
                bomData.currentSupplierName = '';
                partInfo.supplierInfoId = this.vendorList[0]?.supplierId;
              }
            } else {
              bomData.currentSupplierName = '';
              partInfo.supplierInfoId = this.vendorList[0]?.supplierId;
            }

            const currentPurchasePrice = (bom['Current Purchase Price (USD)'] || '').toString().trim();
            if (currentPurchasePrice) {
              if (!Number(currentPurchasePrice) || isNaN(+currentPurchasePrice)) {
                isValid = false;
                this.messaging.openSnackBar(`Current Purchase Price should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
                return;
              }

              if (currentPurchasePrice.length > 10000000) {
                isValid = false;
                this.messaging.openSnackBar(`Current Purchase Price should not be more than 10000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
                return;
              }
            }

            bomData.shouldCost = currentPurchasePrice || 0;

            let latestPricingNegotiation = (bom['Latest Pricing Negotiation (Date format - MM/YY)'] || '').toString().trim();
            if (latestPricingNegotiation) {
              latestPricingNegotiation = this.excelDateToJSDate(latestPricingNegotiation);
              const latestPricingNegotiationStr = this.excelDateToJSDate(latestPricingNegotiation)?.toLocaleDateString();
              if (this.dateCheck('01/01/2000', '31/12/2024', latestPricingNegotiationStr)) {
                isValid = false;
                this.messaging.openSnackBar(`Latest Pricing Negotiation should be between 01/01/2000 to 31/12/2024 for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
                return;
              }
            }

            bomData.latestPricingNegotiation = !latestPricingNegotiation ? new Date('1900/01/01') : latestPricingNegotiation;
            const targetManufacturatingCountry = (bom['Supplier Manufacturing Location'] || '').toString().trim();
            if (targetManufacturatingCountry) {
              const mfrCountryId = this.countryList?.find((x) => x.countryName.toLowerCase() == targetManufacturatingCountry?.toLowerCase())?.countryId;
              if (mfrCountryId) {
                partInfo.mfrCountryId = mfrCountryId;
                const vendor = this.vendorList?.find((x) => x.supplierDirectoryMasterDto?.countryId == mfrCountryId);
                if (vendor) {
                  partInfo.supplierInfoId = Number(vendor.supplierId);
                }
              }
            }
          } else {
            bomData.currentSupplierName = '';
            bomData.shouldCost = 0;
            bomData.latestPricingNegotiation = new Date('1900-01-01');
            const targetManufacturatingCountry = (bom['Target Manufacturing Region'] || '').toString().trim();
            if (targetManufacturatingCountry) {
              const mfrCountryId = this.countryList?.find((x) => x.countryName.toLowerCase() == targetManufacturatingCountry?.toLowerCase())?.countryId;
              if (mfrCountryId) {
                partInfo.mfrCountryId = mfrCountryId;
                const vendor = this.vendorList?.find((x) => x.supplierDirectoryMasterDto?.countryId == mfrCountryId);
                if (vendor) {
                  partInfo.supplierInfoId = Number(vendor.supplierId);
                }
              }
            }
            partInfo.paymentTermId = 1;
          }

          const isCostBreakdown = (bom['Do you have a Cost Breakdown? (Yes/No)'] || '').toString().trim();
          bomData.doYouHaveCostBreakdown = isCostBreakdown == 'Y';
          const rawMaterialCost = (bom['Raw Material Cost'] || '').toString().trim();
          if (rawMaterialCost) {
            if (!Number(rawMaterialCost) || isNaN(+rawMaterialCost)) {
              isValid = false;
              this.messaging.openSnackBar(`Raw Material Cost should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
            if (rawMaterialCost.length > 1000000) {
              isValid = false;
              this.messaging.openSnackBar(`Raw Material Cost should not be more than 1000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
          }

          bomData.rawMaterialCost = +rawMaterialCost || 0;
          const conversionCost = (bom['Conversion Cost'] || '').toString().trim();
          if (conversionCost) {
            if (!Number(conversionCost) || isNaN(+conversionCost)) {
              isValid = false;
              this.messaging.openSnackBar(`Conversion Cost should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }

            if (conversionCost.length > 1000000) {
              isValid = false;
              this.messaging.openSnackBar(`Conversion Cost should not be more than 1000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
          }

          bomData.conversionCost = +conversionCost || 0;
          const overheadProfit = (bom['Overhead & Profit'] || '').toString().trim();
          if (overheadProfit) {
            if (!Number(overheadProfit) || isNaN(+overheadProfit)) {
              isValid = false;
              this.messaging.openSnackBar(`Overhead & Profit should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }

            if (overheadProfit.length > 1000000) {
              isValid = false;
              this.messaging.openSnackBar(`Overhead & Profit should not be more than 1000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
          }

          bomData.overheadProfit = +overheadProfit || 0;
          const packaging = (bom['Packaging'] || '').toString().trim();
          if (packaging) {
            if (!Number(packaging) || isNaN(+packaging)) {
              isValid = false;
              this.messaging.openSnackBar(`Packaging should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }

            if (packaging.length > 1000000) {
              isValid = false;
              this.messaging.openSnackBar(`Packaging should not be more than 1000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
          }

          bomData.packaging = +packaging || 0;
          const logistics = (bom['Logistics'] || '').toString().trim();
          if (logistics) {
            if (!Number(logistics) || isNaN(+logistics)) {
              isValid = false;
              this.messaging.openSnackBar(`Logistics should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }

            if (logistics.length > 1000000) {
              isValid = false;
              this.messaging.openSnackBar(`Logistics should not be more than 1000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
          }

          bomData.logistics = +logistics || 0;
          const dutiesTariff = (bom['Duties & Tariff'] || '').toString().trim();
          if (dutiesTariff) {
            if (!Number(dutiesTariff) || isNaN(+dutiesTariff)) {
              isValid = false;
              this.messaging.openSnackBar(`Duties & Tariff should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }

            if (dutiesTariff.length > 1000000) {
              isValid = false;
              this.messaging.openSnackBar(`Duties & Tariff should not be more than 1000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
              return;
            }
          }

          bomData.dutiesTariff = +dutiesTariff || 0;
          partInfo.hscode = '';
          partInfo.remarksAssumptions = '';
          partInfo.costingMethodId = undefined;
          partInfo.processTypeId = 42; // TODO Commodity from Bom template
          partInfo.paymentTermId = 1;
          partInfo.termId = 1;
          partInfo.packingModeId = 1;
          partInfo.azureFileSharedId = '';
          bomData.isArchived = false;
          bomData.partInfoId = 0;
          const index = partInfoList.findIndex((x) => x.intPartNumber == partInfo.intPartNumber);
          if (index > -1) {
            partInfoList[index].billOfMaterialPartInfos?.push(bomData);
          } else {
            partInfo.billOfMaterialPartInfos = partInfo.billOfMaterialPartInfos || [];
            partInfo.billOfMaterialPartInfos.push(bomData);
            partInfo.projectInfoId = this.currentProjectId;
            partInfoList.push(partInfo);
          }
        }

        if (!isValid) {
          this.templateFileName = '';
          (<HTMLInputElement>document.getElementById(id)).value = '';
          return;
        }

        const elePartInfoList = this.getElectronicsBom(id, workbook, partNumbers, partInfoList);
        if (!this.electronicUploadValid) {
          this.templateFileName = '';
          if (id) {
            (<HTMLInputElement>document.getElementById(id)).value = '';
          }
          return;
        }
        if (elePartInfoList?.length > 0) {
          partInfoList[0].billOfMaterialPartInfos = [...partInfoList[0].billOfMaterialPartInfos, ...elePartInfoList[0].billOfMaterialPartInfos];
        }

        partInfoList = this.calculateLevels(partInfoList);
        projectInfo.projectInfoId = this.currentProjectId || 0;
        projectInfo.projectName = this.projectname.value || '';
        projectInfo.projectDesc = this.projectdescription.value || '';
        projectInfo.tag = this.tag.value || '';
        projectInfo.marketQuarter = '';
        if (this.quarter.value) {
          const year = this.year || this.yearDefault;
          const quarter = this.quarterText || this.quarterDefault;
          projectInfo.marketQuarter = year + '-' + quarter + 'F';
        }
        projectInfo.projectStatusId = ProjectStatus.Draft;
        const mon = (this.projectDate?.value?.month() + 1).toString().padStart(2, '0');
        const year = this.projectDate.value.year();
        projectInfo.marketMonth = mon + year.toString();
        projectInfo.isArchived = false;

        if (partInfoList && partInfoList?.length > 0 && [CommodityType.Electronics, CommodityType.WiringHarness].includes(partInfoList[0]?.commodityId)) {
          if (elePartInfoList && elePartInfoList?.length > 0) {
            const filteredResult = this._pcbConfig.getList(elePartInfoList);
            if (filteredResult?.listWithOutShouldCost?.length > 0) {
              const mpnNumbers = this._pcbConfig.getMPNs(filteredResult?.listWithOutShouldCost);
              this.blockUiService.pushBlockUI('MPN Search');
              this.projectInfoService
                .getPriceDatasByMPNsAsync(mpnNumbers)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((result: PCBAMarketDataDto[]) => {
                  if (result) {
                    this.getDuplicatesByProperty(partInfoList[0].billOfMaterialPartInfos, 'mpn').forEach((bomInfo) => {
                      partInfoList[0].billOfMaterialPartInfos = this.GetBOMWithDuplicates(partInfoList[0].billOfMaterialPartInfos, bomInfo);
                    });
                    const partList: PartInfoDto[] = Object.assign({}, partInfoList);
                    result?.forEach((costInfo) => {
                      const bomInfo = this._pcbConfig.getBOMDetailsByMPN(filteredResult?.listWithOutShouldCost, costInfo.mpn);
                      const volume = bomInfo?.globalAnnualVolume || bomInfo?.totalSubPartQty;
                      const discount = this._pcbConfig.getDiscountBasedOnSubcategoryForMpn(costInfo, volume);
                      const countryWiseDisc = this._pcbConfig.getCountryWiseDiscount(partList[0].mfrCountryId);
                      Object.keys(partInfoList).forEach((key) => {
                        const partInfos: BillOfMaterialDto[] = partInfoList[key].billOfMaterialPartInfos;
                        const item = partInfos.find((item) => item.mpn === costInfo?.mpn);
                        if (item) {
                          item.currentCost = Number(discount * countryWiseDisc);
                          item.targetCost = Number(bomInfo?.targetCost);
                          item.description = costInfo.description;
                          item.subCommodity = costInfo.subCategoryId;
                          item.extendedCost = Number(item.currentCost) * Number(bomInfo.partQty);
                          item.savingOpp = Number(bomInfo?.targetCost) - Number(item.currentCost);
                          item.annualVolume = Number(partList[0].eav) * Number(bomInfo.partQty);
                          item.annualSavingOpp = Number(item.savingOpp) * Number(item.annualVolume);
                          item.shouldCost = costInfo?.price;
                          item.isDirectMatch = costInfo.isDirectMatch ?? false;
                          item.mpn = item.mpn.replace(/\(duplicate\d+\)$/, '');
                          item.partialMatchMpn = costInfo.partialMatchMpn;
                          item.mfrName = costInfo.manufacturer;
                          item.supplierName = costInfo.supplierName;
                          item.breakQuantity = costInfo.breakQuantity;
                          item.subCategoryName = costInfo.subCategoryName;
                          item.isManuallyCreated = false;
                          item.isLoadingFromTemplate = true;
                        }
                      });
                    });
                    if (mpnNumbers?.length != result?.length) {
                      const mfrPartSet = new Set(result.map((item) => item.mpn));
                      const missingMpnParts: string[] = mpnNumbers?.filter((item) => !mfrPartSet.has(item.mPN)).map((item) => item.mPN);
                      const missingMpnPartsStr = missingMpnParts?.join(', ');
                      this.messaging.openSnackBar('Data not available for MPN : ' + missingMpnPartsStr, '', { duration: 50000 });
                    }
                    if (filteredResult?.listWithShouldCost?.length > 0) {
                      partInfoList = this._pcbConfig.setUpdatedValueForManualCostEntries(partInfoList);
                    }
                    projectInfo.partInfoList = partInfoList;
                    this.saveUpdateData(projectInfo);
                    this.blockUiService.popBlockUI('MPN Search');
                  }
                });
            } else {
              projectInfo.partInfoList = this._pcbConfig.getCostForManualCostEntries(partInfoList);
              this.saveUpdateData(projectInfo);
              this.blockUiService.popBlockUI('MPN Search');
            }
          }
        } else {
          projectInfo.partInfoList = partInfoList;
          this.saveUpdateData(projectInfo);
        }
      };
    } catch (e) {
      console.log('Error', e);
      this.messaging.openSnackBar('Template Upload Data is invalid. Please try again.', '', { duration: 5000 });
      (<HTMLInputElement>document.getElementById(id)).value = '';
    }
  }

  private GetBOMWithDuplicates(bomPartInfos: BillOfMaterialDto[], bomInfo: BillOfMaterialDto): BillOfMaterialDto[] {
    let count = 1;
    let skip = 0;
    return bomPartInfos.map((item) => {
      if (item.mpn === bomInfo.mpn) {
        if (skip === 0) {
          skip++;
          return item;
        } else {
          item.mpn = item.mpn + '(duplicate' + count.toString() + ')';
          count++;
          return item;
        }
      }
      return item;
    });
  }
  private getDuplicatesByProperty<T>(array: T[], property: keyof T): T[] {
    const duplicates: T[] = array.filter((obj, index, self) => index !== self.findIndex((item) => item[property] === obj[property]));
    return duplicates;
  }

  private getElectronicsBom(id: string, workbook: any, mechPartNumbers: any, partInfos: any) {
    this.electronicUploadValid = true;
    const sheetName = 'Electronic Components';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: true,
    }) as any[];

    const bomList = data?.filter((x) => x?.Description?.indexOf('Part ') > -1 && Object.prototype.hasOwnProperty.call(x, 'MPN'));
    const partInfoList = new Array<PartInfoDto>();
    if (!bomList || bomList.length <= 0) {
      return partInfoList;
    }
    const partNumbers = bomList.filter((x) => (x['MPN'] || '').toString().trim())?.map((x) => x['MPN']?.toString());
    for (let i = 0; i < bomList?.length; i++) {
      const bom = bomList[i];
      const partInfo = new PartInfoDto();
      const bomData = new BillOfMaterialDto();

      partInfo.intPartNumber = partInfos[0]?.intPartNumber;
      partInfo.supplierInfoId = partInfos[0].supplierInfoId;
      const mpn = (bom['MPN'] || '').toString().trim();
      if (mpn == '') {
        this.electronicUploadValid = false;
        this.messaging.openSnackBar(`Manufacturer Part Number is not valid for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
        return partInfoList;
      }
      bomData.mpn = mpn;

      const parentPartNumber = (bom['Parent Part Number'] || '').toString().trim();
      if (parentPartNumber && !(partNumbers?.includes(parentPartNumber) || mechPartNumbers?.includes(parentPartNumber))) {
        this.electronicUploadValid = false;
        this.messaging.openSnackBar(`Parent Part Number is not valid for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
        return partInfoList;
      }
      bomData.parentPartNumber = parentPartNumber;
      const unitOfMeasure = (bom['Unit of Measure'] || '').toString().trim();
      if (!unitOfMeasure) {
        this.electronicUploadValid = false;
        this.messaging.openSnackBar(`Unit of Measure should be required for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
        return partInfoList;
      }
      bomData.unitOfMeasure = unitOfMeasure;

      const standardOrCustom = (bom['Standard / Custom Material'] || '').toString().trim();
      if (!standardOrCustom) {
        this.electronicUploadValid = false;
        this.messaging.openSnackBar(`Standard / Custom Material should be required for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
        return partInfoList;
      }
      bomData.standardOrCustom = standardOrCustom;

      const bomQty = (bom['BOM Quantity (Nos)'] || '').toString().trim();
      if (bomQty) {
        if (!Number(bomQty) || isNaN(+bomQty)) {
          this.electronicUploadValid = false;
          this.messaging.openSnackBar(`Bom Quantity should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
          return partInfoList;
        }
        if (bomQty.length > 10000000) {
          this.electronicUploadValid = false;
          this.messaging.openSnackBar(`Bom Quantity should not be more than 10000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
          return partInfoList;
        }
      }
      bomData.partQty = bomQty || 0;

      const totalannualQty = (bom['Total Annual Quantity'] || '').toString().trim();
      if (totalannualQty) {
        if (!Number(totalannualQty) || isNaN(+totalannualQty)) {
          this.electronicUploadValid = false;
          this.messaging.openSnackBar(`Total Annual Quantity should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
          return partInfoList;
        }
        if (totalannualQty.length > 10000000) {
          this.electronicUploadValid = false;
          this.messaging.openSnackBar(`Total Annual Quantity should not be more than 10000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
          return partInfoList;
        }
      }
      bomData.annualVolume = totalannualQty;

      const isPartPurchased = (bom['Is this part being purchased currently? (Yes/No)'] || '').toString().trim();
      if (!isPartPurchased) {
        this.electronicUploadValid = false;
        this.messaging.openSnackBar(`Is this part being purchased currently? is required for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
        return partInfoList;
      }
      bomData.isThisPartBeingPurchasedCurrently = isPartPurchased == 'Y';
      if (bomData.isThisPartBeingPurchasedCurrently) {
        const currentPurchasePrice = (bom['Purchased Unit Price (USD)'] || '').toString().trim();
        if (currentPurchasePrice) {
          if (!Number(currentPurchasePrice) || isNaN(+currentPurchasePrice)) {
            this.electronicUploadValid = false;
            this.messaging.openSnackBar(`Purchase Price should be number for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
            return partInfoList;
          }

          if (currentPurchasePrice.length > 10000000) {
            this.electronicUploadValid = false;
            this.messaging.openSnackBar(`Purchase Price should not be more than 10000000 characters for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
            return partInfoList;
          }
        }
        bomData.targetCost = currentPurchasePrice || 0;
      }

      const totalSubPartQty = (bom['Total Sub-Part Quantity'] || '').toString().trim();
      if (!totalSubPartQty) {
        this.electronicUploadValid = false;
        this.messaging.openSnackBar(`Total Sub-Part Quantity is required for row - ${bom.__rowNum__ + 1}`, '', { duration: 5000 });
        return partInfoList;
      }
      bomData.totalSubPartQty = totalSubPartQty;

      const globalAnnualVolume = (bom['Global Annual Volume'] || '').toString().trim();
      bomData.globalAnnualVolume = globalAnnualVolume || 0;

      const mountingSide = (bom['Mounting Side'] || '').toString().trim();
      bomData.mountingSide = mountingSide === 'Top' ? MountingType.Top : mountingSide === 'Bottom' ? MountingType.Bottom : 0;

      const shouldCost = (bom['Should cost (USD)'] || '').toString().trim();
      bomData.currentCost = shouldCost || 0;

      partInfo.hscode = '';
      partInfo.remarksAssumptions = '';
      partInfo.costingMethodId = undefined;
      partInfo.processTypeId = 42;
      partInfo.paymentTermId = 1;
      partInfo.termId = 1;
      partInfo.packingModeId = 1;
      partInfo.azureFileSharedId = '';
      partInfo.commodityId = partInfos[0]?.commodityId || CommodityType.Electronics;
      partInfo.mfrCountryId = partInfos[0]?.mfrCountryId;
      bomData.isArchived = false;
      bomData.partInfoId = 0;

      const index = partInfoList?.findIndex((x) => x.intPartNumber == partInfo?.intPartNumber);
      if (index > -1) {
        partInfoList[index].billOfMaterialPartInfos?.push(bomData);
      } else {
        //  partInfo.billOfMaterialPartInfos = partInfo?.billOfMaterialPartInfos || [];
        partInfo.billOfMaterialPartInfos.push(bomData);
        partInfo.projectInfoId = this.currentProjectId;
        partInfoList.push(partInfo);
      }
    }
    if (!this.electronicUploadValid) {
      this.templateFileName = '';
      (<HTMLInputElement>document.getElementById(id)).value = '';
      return partInfoList;
    }
    return partInfoList;
  }

  private calculateLevels(partInfoList: PartInfoDto[]) {
    for (let index = 0; index < partInfoList.length; index++) {
      const partInfo = partInfoList[index];
      let lvl = 0;
      if (!partInfo.billOfMaterialPartInfos[0].parentPartNumber) {
        partInfoList[index].billOfMaterialPartInfos[0].level = lvl;
      } else {
        lvl++;
        partInfoList[index].billOfMaterialPartInfos[0].level = lvl;
        let parentPart = this.getParentPart(partInfoList, partInfo);
        while (parentPart != null && parentPart != undefined) {
          if (!parentPart?.billOfMaterialPartInfos[0]?.parentPartNumber) {
            partInfoList[index].billOfMaterialPartInfos[0].level = lvl;
            break;
          } else {
            parentPart = this.getParentPart(partInfoList, parentPart);
            lvl++;
          }
        }
      }
    }
    return partInfoList;
  }

  private getParentPart(partInfoList: PartInfoDto[], partInfo: PartInfoDto) {
    return partInfoList.find((x) => x.intPartNumber == partInfo.billOfMaterialPartInfos[0].parentPartNumber && partInfo.intPartNumber != partInfo.billOfMaterialPartInfos[0].parentPartNumber);
  }

  private excelDateToJSDate(serial: number) {
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
    const fractionalDay = serial - Math.floor(serial) + 0.0000001;
    let totalSeconds = Math.floor(86400 * fractionalDay);
    const seconds = totalSeconds % 60;
    totalSeconds -= seconds;
    const hours = Math.floor(totalSeconds / (60 * 60));
    const minutes = Math.floor(totalSeconds / 60) % 60;

    return new Date(dateInfo.getFullYear(), dateInfo.getMonth(), dateInfo.getDate(), hours, minutes, seconds);
  }

  private dateCheck(from: string, to: string, check: string) {
    const fDate = Date.parse(from);
    const lDate = Date.parse(to);
    const cDate = Date.parse(check);

    if (cDate <= lDate && cDate >= fDate) {
      return true;
    }
    return false;
  }

  private validateFields() {
    if (!this.projectname.value || this.projectname.value.trim() == '') {
      this.messaging.openSnackBar('Please enter project name.', '', {
        duration: 5000,
      });

      return false;
    } else if (this.quarter.value == '') {
      this.messaging.openSnackBar('Please select market quarter.', '', {
        duration: 5000,
      });

      return false;
    }

    return true;
  }

  private validateActivateFields() {
    if (!this.projectname.value || this.projectname.value.trim() == '') {
      this.messaging.openSnackBar('Please enter project name.', '', {
        duration: 5000,
      });

      return false;
    } else if (this.quarter.value == '') {
      this.messaging.openSnackBar('Please select market quarter.', '', {
        duration: 5000,
      });

      return false;
    } else if (!this.parts || this.parts.length <= 0) {
      this.messaging.openSnackBar('Please upload BOM template.', '', {
        duration: 5000,
      });

      return false;
    }

    return true;
  }

  private makeFieldsPristine() {
    this.projectname.markAsPristine();
    this.quarter.markAsPristine();
    this.projectdescription.markAsPristine();
    this.tag.markAsPristine();

    this.projectname.updateValueAndValidity();
    this.quarter.updateValueAndValidity();
    this.projectdescription.updateValueAndValidity();
    this.tag.updateValueAndValidity();
  }

  validateParts(): boolean {
    // let isPartsValuesValid = true;
    // this.parts.forEach(element => {
    //   if (!element.commodityId) {
    //     isPartsValuesValid = false;
    //   }
    // });

    // if (!isPartsValuesValid) {
    //   this.messaging.openSnackBar('Please select commodity for parts.', '', {
    //     duration: 5000,
    //   });

    //   return isPartsValuesValid;
    // }

    let isPartsValuesValid = true;
    this.parts.forEach((element) => {
      if (!element.annualVolume || element.annualVolume < 0) {
        isPartsValuesValid = false;
      }
    });

    if (!isPartsValuesValid) {
      this.messaging.openSnackBar('Please enter valid annual volume for parts.', '', { duration: 5000 });
      return isPartsValuesValid;
    }
    return true;
  }
  private saveDraft(issaveDraft: boolean): any {
    if (this.withoutTemplateOption) {
      if (!this.validateParts()) {
        return;
      }
      // const projectInfo = new ProjectInfoDto();
      // projectInfo.projectInfoId = this.currentProjectId || 0;
      // projectInfo.projectName = this.projectname.value || '';
      // projectInfo.projectDesc = this.projectdescription.value || '';
      // projectInfo.tag = this.tag.value || '';
      // projectInfo.marketQuarter = '';
      // if (this.quarter.value) {
      //   const year = this.year || this.yearDefault;
      //   const quarter = this.quarterText || this.quarterDefault;
      //   projectInfo.marketQuarter = year + '-' + quarter + 'F';
      // }
      // projectInfo.projectStatusId = ProjectStatus.Draft;
      // const mon = (this.projectDate?.value?.month() + 1).toString().padStart(2, '0');
      // const year = this.projectDate.value.year();
      // projectInfo.marketMonth = mon + year.toString();
      // projectInfo.isArchived = false;
      // projectInfo.partInfoList = [];
      // this.parts.forEach((part) => {
      //   const partInfo = new PartInfoDto();
      //   partInfo.intPartNumber = part.partNumber;
      //   partInfo.intPartDescription = part.partDescription;
      //   partInfo.commodityId = part.commodityId;
      //   partInfo.supplierInfoId = part.vendorId;
      //   partInfo.mfrCountryId = part.mfrCountryId;
      //   partInfo.buId = part.buId;
      //   partInfo.deliveryCountryId = part.deliveryCountryId;
      //   partInfo.eav = part.annualVolume;
      //   part.partRevision = '0';
      //   partInfo.hscode = '';
      //   partInfo.remarksAssumptions = '';
      //   partInfo.costingMethodId = undefined;
      //   partInfo.processTypeId = 42; // TODO Commodity from Bom template
      //   partInfo.paymentTermId = 1;
      //   partInfo.termId = 1;
      //   partInfo.packingModeId = 1;
      //   partInfo.partComplexity = PartComplexity.Low;
      //   partInfo.azureFileSharedId = '';

      //   const bomData = new BillOfMaterialDto();

      //   bomData.level = 0;
      //   bomData.partQty = 1;
      //   bomData.lifetimeRemainingYears = 10;
      //   bomData.lifetimeQuantityUOM = 0;
      //   bomData.isThisPartBeingPurchasedCurrently = false;
      //   bomData.currentSupplierName = '';
      //   bomData.currentCost = 0;
      //   bomData.rawMaterialCost = 0;
      //   bomData.conversionCost = 0;
      //   bomData.overheadProfit = 0;
      //   bomData.packaging = 0;
      //   bomData.logistics = 0;
      //   bomData.mpn = '';
      //   bomData.doYouHaveCostBreakdown = false;
      //   bomData.dutiesTariff = 0;
      //   bomData.isArchived = false;
      //   bomData.partInfoId = 0;
      //   partInfo.billOfMaterialPartInfos?.push(bomData);
      //   projectInfo.partInfoList.push(partInfo);
      // });

      const expandedParts: any[] = [];

      this.parts.forEach((part) => {
        const allFiles = part.fileList || [];
        const supportingDocs = allFiles.filter((f) => f.isSupportingDocument === true);
        const nonSupportingDocs = allFiles.filter((f) => !f.isSupportingDocument);

        if (nonSupportingDocs.length <= 1) {
          // No duplication
          expandedParts.push(part);
        } else {
          // First part
          const firstPart = { ...part };
          firstPart.fileList = [...supportingDocs, nonSupportingDocs[0]];
          expandedParts.push(firstPart);

          // Duplicated parts
          for (let i = 1; i < nonSupportingDocs.length; i++) {
            const currentFile = nonSupportingDocs[i];
            const duplicatedPart = { ...part };

            // Set fileList
            duplicatedPart.fileList = [currentFile];

            // Set partNumber
            const fileNameWithoutExt = currentFile.documentName?.split('.')?.slice(0, -1)?.join('.');
            duplicatedPart.partNumber = fileNameWithoutExt;

            // Set commodityId as Stock Machining
            duplicatedPart.commodityId = 4;

            expandedParts.push(duplicatedPart);
          }
        }
      });

      // Replace original parts
      this.parts = expandedParts;

      const projectInfo = new ProjectInfoDto();
      projectInfo.projectInfoId = this.currentProjectId || 0;
      projectInfo.projectName = this.projectname.value || '';
      projectInfo.projectDesc = this.projectdescription.value || '';
      projectInfo.tag = this.tag.value || '';
      projectInfo.marketQuarter = '';

      if (this.quarter.value) {
        const year = this.year || this.yearDefault;
        const quarter = this.quarterText || this.quarterDefault;
        projectInfo.marketQuarter = year + '-' + quarter + 'F';
      }

      projectInfo.projectStatusId = ProjectStatus.Draft;

      const mon = (this.projectDate?.value?.month() + 1).toString().padStart(2, '0');
      const year = this.projectDate.value.year();
      projectInfo.marketMonth = mon + year.toString();
      projectInfo.isArchived = false;
      projectInfo.partInfoList = [];

      this.parts.forEach((part) => {
        const partInfo = new PartInfoDto();
        partInfo.intPartNumber = part.partNumber;
        partInfo.intPartDescription = part.partDescription;
        partInfo.commodityId = part.commodityId;
        partInfo.supplierInfoId = part.vendorId;
        partInfo.mfrCountryId = part.mfrCountryId;
        partInfo.buId = part.buId;
        partInfo.deliveryCountryId = part.deliveryCountryId;
        partInfo.eav = part.annualVolume;
        part.partRevision = '0';
        partInfo.hscode = '';
        partInfo.remarksAssumptions = '';
        partInfo.costingMethodId = undefined;
        partInfo.processTypeId = 42;
        partInfo.paymentTermId = 1;
        partInfo.termId = 1;
        partInfo.packingModeId = 1;
        partInfo.partComplexity = PartComplexity.Low;
        partInfo.azureFileSharedId = '';

        const bomData = new BillOfMaterialDto();
        bomData.level = 0;
        bomData.partQty = 1;
        bomData.lifetimeRemainingYears = 10;
        bomData.lifetimeQuantityUOM = 0;
        bomData.isThisPartBeingPurchasedCurrently = false;
        bomData.currentSupplierName = '';
        bomData.currentCost = 0;
        bomData.rawMaterialCost = 0;
        bomData.conversionCost = 0;
        bomData.overheadProfit = 0;
        bomData.packaging = 0;
        bomData.logistics = 0;
        bomData.mpn = '';
        bomData.doYouHaveCostBreakdown = false;
        bomData.dutiesTariff = 0;
        bomData.isArchived = false;
        bomData.partInfoId = 0;

        partInfo.billOfMaterialPartInfos?.push(bomData);
        projectInfo.partInfoList.push(partInfo);
      });

      const updateDocuments$: Observable<PartInfoDto>[] = [];
      this.blockUiService.pushBlockUI('saveProjectDetails');
      this.projectInfoService
        .saveProjectDetails(projectInfo)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          if (result) {
            this.currentProjectId = result.projectInfoId;
            for (let index = 0; index < this.parts.length; index++) {
              const element = this.parts[index];
              const pInfo = result.partInfoList.find((x) => x.intPartNumber == element.partNumber);
              if (pInfo) {
                element.projectId = result.projectInfoId.toString();
                element.id = pInfo.billOfMaterialPartInfos[0] ? pInfo.billOfMaterialPartInfos[0].bomId : 0;
                element.partId = pInfo.partInfoId.toString();
                element.commodityId = pInfo.commodityId;
                element.partQty = pInfo.bomQty.toString();
              }

              const draftPartInfoUpdate = new DraftProjectPartInfoUpdateDto();
              draftPartInfoUpdate.projectInfoId = +element.projectId;
              draftPartInfoUpdate.bomId = element.id;
              draftPartInfoUpdate.partInfoId = +element.partId;
              draftPartInfoUpdate.commodityId = pInfo.commodityId;
              draftPartInfoUpdate.partInfoDescription = element.partDescription;
              draftPartInfoUpdate.partQty = +element.partQty;
              draftPartInfoUpdate.unitOfMeasure = +element.unitofMeasure;
              draftPartInfoUpdate.annualVolume = +element.annualVolume;
              draftPartInfoUpdate.vendorId = element.vendorId;
              draftPartInfoUpdate.mfrCountryId = element.mfrCountryId;
              draftPartInfoUpdate.buId = element.buId;
              draftPartInfoUpdate.deliveryCountryId = element.deliveryCountryId;
              this.partInfoService
                .draftPartInfoUpdate(+element.partId, draftPartInfoUpdate)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(() => {});
              // .toPromise()
              // .then(() => {});

              if (element?.fileList?.length > 0) {
                element?.fileList?.sort((b, a) => Number(a.isSupportingDocument) - Number(b.isSupportingDocument));
                element?.fileList?.forEach((value) => {
                  const file = this.tempFileContainer.find((x) => x?.name == value?.documentName);
                  // let file = this.tempFileContainer.find(x => x?.name?.split('.').slice(0, -1).join('.') == element.partNumber);
                  if (file) {
                    const formData = new FormData();
                    const revisionLevel = '0';
                    const fileName = element.partNumber + '-' + revisionLevel + '-' + file.name;
                    formData.append('partInfoId', element.partId);
                    formData.append('formFile', file, fileName);
                    formData.append('originalFileName', file.name);
                    let isSupportingDocument = 'false';
                    if (value?.isSupportingDocument) {
                      isSupportingDocument = 'true';
                    } else {
                      isSupportingDocument = 'false';
                    }
                    formData.append('isSupportingDocument', isSupportingDocument);
                    updateDocuments$.push(this.projectInfoService.updateDocument(formData).pipe(first()));
                  }
                });
              }
            }

            this.blockUiService.pushBlockUI('updateDocument$');
            from(updateDocuments$)
              .pipe(concatAll())
              .subscribe({
                complete: () => {
                  this.blockUiService.popBlockUI('updateDocument$');
                  this.blockUiService.popBlockUI('saveProjectDetails');
                  // if (x && x[0]?.projectInfoId) {
                  this.onActivateProject(issaveDraft);
                  this.messaging.openSnackBar(`Project created as draft successfully and initiated for Data Extraction`, '', { duration: 7000 });
                  this.makeFieldsPristine();
                  setTimeout(() => {
                    this.router.navigate(['/home/projects/active']);
                  }, 1000);
                  // }
                  // },
                  // err => {
                  // this.blockUiService.popBlockUI('saveProjectDetails');
                  // this.blockUiService.popBlockUI('updateDocument$');
                  // this.messaging.openSnackBar(`Project saved as draft successfully.`, '', { duration: 7000 });
                  // this.makeFieldsPristine();
                  // setTimeout(() => {
                  //   this.router.navigate(['/home/project/draft-list']);
                  // }, 1000);
                },
              });
          }
        });
    } else {
      const projectInfo = new ProjectInfoDto();
      projectInfo.projectInfoId = this.currentProjectId || 0;
      projectInfo.projectName = this.projectname.value || '';
      projectInfo.projectDesc = this.projectdescription.value || '';
      projectInfo.tag = this.tag.value || '';
      projectInfo.marketQuarter = '';
      if (this.quarter.value) {
        const year = this.year || this.yearDefault;
        const quarter = this.quarterText || this.quarterDefault;
        projectInfo.marketQuarter = year + '-' + quarter + 'F';
      }
      projectInfo.projectStatusId = ProjectStatus.Draft;
      const mon = (this.projectDate?.value?.month() + 1).toString().padStart(2, '0');
      const year = this.projectDate.value.year();
      projectInfo.marketMonth = mon + year.toString();
      projectInfo.isArchived = false;
      projectInfo.partInfoList = [];

      this.blockUiService.pushBlockUI('saveProjectDetails');
      this.projectInfoService
        .saveProjectDetails(projectInfo)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          this.blockUiService.popBlockUI('saveProjectDetails');
          if (result) {
            this.makeFieldsPristine();
            this.messaging.openSnackBar(`Project saved as draft successfully.`, '', { duration: 3000 });
            setTimeout(() => {
              this.router.navigate(['/home/project/draft-list']);
            }, 1000);
          }
        });
    }
  }

  private updateDraft() {
    const projectName = this.projectname.value || '';
    const projectDesc = this.projectdescription.value || '';
    const tag = this.tag.value || '';
    const model: ProjectBasicDetailsModel = {
      projectInfoId: this.currentProjectId,
      projectStatusId: ProjectStatus.Draft,
      projectName: projectName,
      projectDescription: projectDesc,
      tag: tag,
      quarter: '',
      marketMonth: '',
    };
    if (this.quarter.value) {
      const year = this.year || this.yearDefault;
      const quarter = this.quarterText || this.quarterDefault;
      model.quarter = year + '-' + quarter + 'F';
    }
    if (this.projectDate.value) {
      const mon = (this.projectDate?.value?.month() + 1).toString().padStart(2, '0');
      const year = this.projectDate.value.year();
      model.marketMonth = mon + year.toString();
    }

    this.blockUiService.pushBlockUI('updateProjectBasicdata');
    this.updateProjectBasicdata(model).subscribe((x) => {
      this.blockUiService.popBlockUI('updateProjectBasicdata');
      if (x) {
        this.makeFieldsPristine();
        this.messaging.openSnackBar(`Project updated as draft successfully.`, '', { duration: 5000 });
        setTimeout(() => {
          this.router.navigate(['/home/project/draft-list']);
        }, 1000);
      }
    });
  }

  public saveDraftProject(issaveDrafts: boolean): any {
    if (!this.validateFields()) {
      return false;
    }

    if (this.currentProjectId > 0) {
      this.updateDraft();
    } else {
      this.saveDraft(issaveDrafts);
    }
  }

  public onActivateProject(isClicked: boolean): any {
    if (this.withoutTemplateOption && isClicked === true) {
      this.saveDraftProject(false);
    } else {
      if (!this.validateActivateFields()) {
        return false;
      }
      if (!this.validateParts()) {
        return;
      }
      this.disabledActivateButton = true;
      const projectName = this.projectname.value || '';
      const projectDesc = this.projectdescription.value || '';
      const tag = this.tag.value || '';
      const model: ProjectBasicDetailsModel = {
        projectInfoId: this.currentProjectId,
        projectStatusId: ProjectStatus.DataExtractionInprogress,
        projectName: projectName,
        projectDescription: projectDesc,
        tag: tag,
        quarter: '',
        marketMonth: '',
      };

      if (this.quarter.value) {
        const year = this.year || this.yearDefault;
        const quarter = this.quarterText || this.quarterDefault;
        model.quarter = year + '-' + quarter + 'F';
      }
      if (this.projectDate.value) {
        const mon = (this.projectDate?.value?.month() + 1).toString().padStart(2, '0');
        const year = this.projectDate.value.year();
        model.marketMonth = mon + year.toString();
      }
      if (!this.stopApiCall) {
        this.stopApiCall = true;
        this.updateProjectBasicdata(model).subscribe(() => {});
      }

      this.makeFieldsPristine();
      this.messaging.openSnackBar(`Project activated successfully.`, '', {
        duration: 5000,
      });
      setTimeout(() => {
        this.router.navigate(['/home/projects/active']);
      }, 1000);
      //}
      //});
    }
  }

  private saveUpdateData(projectInfo: ProjectInfoDto) {
    if (projectInfo.projectInfoId > 0) {
      this.blockUiService.pushBlockUI('updateProjectDetails');
    } else {
      this.blockUiService.pushBlockUI('saveProjectDetails');
    }

    const saveUpdate$ = projectInfo.projectInfoId > 0 ? this.projectInfoService.updateProjectDetails(projectInfo) : this.projectInfoService.saveProjectDetails(projectInfo);
    saveUpdate$.pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
      if (projectInfo.projectInfoId > 0) {
        this.blockUiService.popBlockUI('updateProjectDetails');
      } else {
        this.blockUiService.popBlockUI('saveProjectDetails');
      }

      if (result) {
        this.makeFieldsPristine();
        this.mapPartsData(result);
        // this._store.dispatch(new BomActions.GetBomsByProjectId(result?.projectInfoId));
        this.bomInfoSignalsService.getBomsByProjectId(result?.projectInfoId || 0);
      }
    });
  }

  private updateProjectBasicdata(data: ProjectBasicDetailsModel) {
    return this.projectInfoService.updateProjectBasicDetails(this.currentProjectId, data).pipe(takeUntil(this.unsubscribe$));
  }

  private mapPartsData(projectInfoDto: ProjectInfoDto) {
    this.currentProjectId = projectInfoDto.projectInfoId;
    this.projectname.setValue(projectInfoDto.projectName || '');
    this.projectdescription.setValue(projectInfoDto.projectDesc || '');
    this.tag.setValue(projectInfoDto.tag || '');
    if (projectInfoDto.marketQuarter) {
      const splitted = projectInfoDto.marketQuarter?.split('-');
      const year = +(splitted[0] || new Date().getFullYear());
      const quarter = 'Q' + +((splitted[1] || '0').match(/\d+/) || [0])[0];
      this.quarter.setValue(quarter + ' ' + year);
    }
    const mon = +projectInfoDto.marketMonth.slice(0, 2);
    const yr = +projectInfoDto.marketMonth.slice(2);
    const momentObj = moment();
    momentObj.year(yr);
    momentObj.month(mon - 1);
    this.projectDate.setValue(momentObj);
    this.parts = [];
    projectInfoDto.partInfoList.forEach((part) => {
      this.mapPart(part);
    });
  }

  private mapPart(part: PartInfoDto, specificPartInfoId = 0) {
    part.billOfMaterialPartInfos?.forEach((bom) => {
      const res = new BomUploadPartViewModel();
      res.level = bom.level?.toString() || '';
      res.partNumber = part.intPartNumber || '';
      res.partDescription = part.intPartDescription || bom.description || '';
      res.partQty = bom.partQty.toString() || '';
      res.partId = bom.partInfoId.toString();
      res.partRevision = part.partRevision;
      res.commodityId = part.commodityId;
      res.vendorId = part.supplierInfoId;
      res.mfrCountryId = part.mfrCountryId;
      res.buId = part.buId;
      res.deliveryCountryId = part.deliveryCountryId;
      res.annualVolume = part.eav || bom.annualVolume;
      if (part.documentCollectionDto) {
        res.fileList = this.getFileNamesFromDocumentCollection(part.documentCollectionDto.documentRecords) || [];
      }
      res.isEdit = false;
      res.id = bom.bomId;
      res.projectId = part.projectInfoId.toString() || '';
      if (specificPartInfoId > 0) {
        const index = this.parts.findIndex((x) => x.partId == specificPartInfoId.toString());
        if (index > -1) {
          this.parts[index] = res;
        }
      } else {
        this.parts.push(res);
      }
    });
  }

  private getFileNamesFromDocumentCollection(documentRecords: DocumentRecordDto[]): FileInfo[] {
    const records = documentRecords.filter((x) => !x.deleted) || [];
    return (
      records?.map(
        (x) =>
          <FileInfo>{
            documentId: x.documentRecordId,
            documentName: x.docName,
            isSupportingDocument: x.isSupportingDoc,
          }
      ) || []
    );
  }

  public compareTwoStrings(first: string, second: string): number {
    first = first.replace(/\s+/g, '');
    second = second.replace(/\s+/g, '');

    if (first === second) return 1; // identical or empty
    if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

    const firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;

      firstBigrams.set(bigram, count);
    }

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;

      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }

    return ((2.0 * intersectionSize) / (first.length + second.length - 2)) * 100;
  }

  async onFolderDropped($event: any) {
    const items = $event.dataTransfer.items;
    const result = await this.getAllFileEntries(items);

    const files: any[] = [];

    for (const i in result) {
      const file: any = await this.getFile(result[i]);
      files.push(file);
    }

    if (this.currentProjectId <= 0 || !this.parts || this.parts.length <= 0) {
      // this.messaging.openSnackBar('Please upload template.', '', { duration: 3000 });
      this.createProject(files);
      return;
    } else {
      if (files.length > 0) {
        const projectParts = new Array<ProjectPartsUploadModel>();
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          const file = files[i] as File;
          const fileNameWithoutExt = file?.name?.split('.').slice(0, -1).join('.');

          const part = this.parts.find((x) => fileNameWithoutExt.toLowerCase() == x.partNumber.toLowerCase());

          if (part) {
            const obj = new ProjectPartsUploadModel();
            obj.partInfoId = +part.partId;
            //obj.fileName = file.name;
            const revisionLevel = part.partRevision ? part.partRevision : '0';
            obj.fileName = part.partNumber + '-' + revisionLevel + '-' + file.name;
            obj.originalFileName = file.name;
            const ext = file.name.substring(file.name.lastIndexOf('.') + 1);
            obj.isSupportingDocument = Object.values(SupportingFileTypeEnum).includes(ext);

            formData.append('formFiles', file, obj.fileName);
            formData.append('originalFileName', file.name);
            projectParts.push(obj);
          } else {
            this.unAssociatedDocuments = this.unAssociatedDocuments || [];
            this.unAssociatedDocuments.push(file);
          }
        }

        if (projectParts?.length > 0) {
          const uniquePartInfoIds = [...new Set(projectParts.map((item) => item.partInfoId))];
          for (let uniquePart = 0; uniquePart < uniquePartInfoIds.length; uniquePart++) {
            if (this.parts.length > 0) {
              const existingPartData = this.parts.filter((p) => p.partId === uniquePartInfoIds[uniquePart].toString());
              if (existingPartData[0].fileList.filter((p) => p.isSupportingDocument == false).length > 0) {
                existingPartData[0].fileList
                  .filter((p) => p.isSupportingDocument == false)
                  .forEach((element) => {
                    if (projectParts.filter((x) => x.partInfoId.toString() === existingPartData[0].partId && !x.isSupportingDocument).length > 0) {
                      this.removeMultipleExtractionDocument(element.documentId, existingPartData[0]);
                    }
                  });
              }
            }

            if (projectParts.filter((p) => p.partInfoId === uniquePartInfoIds[uniquePart] && !p.isSupportingDocument).length > 1) {
              const uniquePartFiles = [...new Set(projectParts.filter((p) => p.partInfoId === uniquePartInfoIds[uniquePart] && !p.isSupportingDocument).map((item) => item.fileName))];
              for (let uniquePartRow = 1; uniquePartRow < uniquePartFiles.length; uniquePartRow++) {
                _.remove(projectParts, (x) => x.fileName === uniquePartFiles[uniquePartRow]);
              }
            }
          }

          formData.append('partFileNamePairs', JSON.stringify(projectParts));
          this.blockUiService.pushBlockUI('projectPartsUpload');
          this.projectInfoService
            .projectPartsUpload(this.currentProjectId, formData)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              this.blockUiService.popBlockUI('projectPartsUpload');
              if (x) {
                this.mapPartsData(x);
              }
            });
        }
      }
    }
  }

  // UploadFiles(files: any) {
  //   //this.progressBarValue = 100 / files.length;
  //   this.showProgressBar = true;
  //   for (let i in files) {
  //     let formData = new FormData();
  //     formData.append('file', files[i]);
  //     formData.append('originalFileName', files[i]?.name);
  //     this.projectCreationservice
  //       .partsFileUpload(formData, this.currentProjectId)
  //       .subscribe((x) => {
  //         if (x) {
  //           let average = 100 / files.length;
  //           this.progressBarValue = this.progressBarValue + average;
  //           if (this.progressBarValue >= 99) {
  //             setTimeout(() => {
  //               this.showProgressBar = false;
  //               this.parts.forEach((x) => {
  //                 x.status = true;
  //               });
  //             }, 1500);
  //           }
  //         }
  //       });
  //   }
  // }

  downloadMyFile() {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');

    link.setAttribute('href', homeEndpoints.bomTemplateDownload(this.tvhAzureBlobUrl));
    link.setAttribute('download', `bom_template.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  private validateData(): boolean {
    if (this.currentProjectId != 0) {
      const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
        data: {
          title: 'Confirm Delete',
          message: 'Project already created. Are you sure you want to upload template again?. Confirm upload again by selecting CONFIRM, or cancel this action by selecting CANCEL.',
          action: 'CONFIRM',
          cancelText: 'CANCEL',
        },
      });
      dialogRef
        .afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .pipe(first())
        .subscribe((result) => {
          if (result) {
            return true;
          } else {
            return false;
          }
        });
    } else {
      this.validate();
    }
    return true;
  }

  private confirmationDialog() {
    return this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Confirm Delete',
        message: 'Project already created. Are you sure you want to upload template again?. Confirm upload again by selecting CONFIRM, or cancel this action by selecting CANCEL.',
        action: 'CONFIRM',
        cancelText: 'CANCEL',
      },
    });
  }

  // fileBrowseHandler($event: any) {
  //   if ($event.target.files?.length > 0) {
  //     this.templateFileName = $event.target.files[0]?.name;
  //     const file = $event.target.files[0];
  //     this.uploadData($event.target.id, file);
  //   } else {
  //     (<HTMLInputElement>document.getElementById($event.target.id)).value = '';
  //   }
  // }

  fileBrowseHandler($event: any) {
    const inputEl = $event.target as HTMLInputElement;
    const files = inputEl.files;

    if (files && files.length > 0) {
      const file = files[0];
      const extension = file?.name?.split('.').pop()?.toLowerCase();

      if (extension && this.rejectedExtensions.includes(extension)) {
        console.warn(`Files with .${extension} extension are not allowed.`);

        inputEl.value = '';
        return;
      }

      this.templateFileName = file.name;
      this.uploadData(inputEl.id, file);
    } else {
      inputEl.value = '';
    }
  }

  public canDeactivate() {
    if (this.quarter.dirty || this.projectname.dirty || this.projectdescription.dirty || this.tag.dirty) {
      const confirmationDialogRef = this.messaging.openPendingChangesDialog();

      return confirmationDialogRef.afterClosed().pipe(
        map((result) => {
          if (result) {
            return true;
          } else {
            return false;
          }
        }),
        first()
      );
    } else {
      return true;
    }
  }

  // public folderBrowseHandler(file: any): void {
  //   if (this.currentProjectId <= 0 || !this.parts || this.parts.length <= 0) {
  //     (<HTMLInputElement>document.getElementById(file.target.id)).value = '';
  //     this.messaging.openSnackBar('Please upload template.', '', {
  //       duration: 3000,
  //     });
  //     return;
  //   }
  //   const files: FileList = file.target.files || [];
  //   if (files.length > 0) {
  //     const projectParts = new Array<ProjectPartsUploadModel>();
  //     const formData = new FormData();
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i] as File;
  //       const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');

  //       const part = this.parts.find((x) => fileNameWithoutExt.toLowerCase() == x.partNumber.toLowerCase());
  //       if (part) {
  //         const obj = new ProjectPartsUploadModel();
  //         obj.partInfoId = +part.partId;
  //         obj.fileName = file.name;
  //         const revisionLevel = part.partRevision ? part.partRevision : '0';
  //         obj.fileName = part.partNumber + '-' + revisionLevel + '-' + file.name;
  //         formData.append('formFiles', file, obj.fileName);
  //         formData.append('originalFileName', file.name);
  //         projectParts.push(obj);
  //       } else {
  //         this.unAssociatedDocuments = this.unAssociatedDocuments || [];
  //         this.unAssociatedDocuments.push(file);
  //       }
  //     }

  //     if (projectParts?.length > 0) {
  //       formData.append('partFileNamePairs', JSON.stringify(projectParts));
  //       this.blockUiService.pushBlockUI('projectPartsUpload');
  //       this.projectInfoService
  //         .projectPartsUpload(this.currentProjectId, formData)
  //         .pipe(takeUntil(this.unsubscribe$))
  //         .subscribe((x) => {
  //           this.blockUiService.popBlockUI('projectPartsUpload');
  //           if (x) {
  //             this.mapPartsData(x);
  //             (<HTMLInputElement>document.getElementById(file.target.id)).value = '';
  //           }
  //         });
  //     }
  //   }
  // }

  public folderBrowseHandler(file: any): void {
    if (this.currentProjectId <= 0 || !this.parts || this.parts.length <= 0) {
      (<HTMLInputElement>document.getElementById(file.target.id)).value = '';
      this.messaging.openSnackBar('Please upload template.', '', {
        duration: 3000,
      });
      return;
    }

    const files: FileList = file.target.files || [];

    if (files.length > 0) {
      const projectParts = new Array<ProjectPartsUploadModel>();
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i] as File;
        const extension = fileObj?.name?.split('.').pop()?.toLowerCase();

        if (extension && this.rejectedExtensions.includes(extension)) {
          console.warn(`File with .${extension} is not allowed: ${fileObj.name}`);
          continue;
        }

        const fileNameWithoutExt = fileObj?.name?.split('.').slice(0, -1).join('.');
        const part = this.parts.find((x) => fileNameWithoutExt.toLowerCase() === x.partNumber.toLowerCase());

        if (part) {
          const obj = new ProjectPartsUploadModel();
          obj.partInfoId = +part.partId;
          const revisionLevel = part.partRevision ? part.partRevision : '0';
          obj.fileName = `${part.partNumber}-${revisionLevel}-${fileObj.name}`;
          formData.append('formFiles', fileObj, obj.fileName);
          formData.append('originalFileName', fileObj.name);
          projectParts.push(obj);
        } else {
          this.unAssociatedDocuments = this.unAssociatedDocuments || [];
          this.unAssociatedDocuments.push(fileObj);
        }
      }

      if (projectParts.length > 0) {
        formData.append('partFileNamePairs', JSON.stringify(projectParts));
        this.blockUiService.pushBlockUI('projectPartsUpload');
        this.projectInfoService
          .projectPartsUpload(this.currentProjectId, formData)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((x) => {
            this.blockUiService.popBlockUI('projectPartsUpload');
            if (x) {
              this.mapPartsData(x);
              (<HTMLInputElement>document.getElementById(file.target.id)).value = '';
            }
          });
      }
    }
  }

  //Helper methods for file drop events
  async getFile(fileEntry: any): Promise<File> {
    try {
      return await new Promise<File>((resolve, reject) => fileEntry.file(resolve, reject));
    } catch (err) {
      console.error(err);
      throw err; // rethrow to let caller handle
    }
  }
  // Drop handler function to get all files
  // async getAllFileEntries(dataTransferItemList: any) {
  //   const fileEntries = [];
  //   // Use BFS to traverse entire directory/file structure
  //   const queue = [];
  //   // Unfortunately dataTransferItemList is not iterable i.e. no forEach
  //   for (let i = 0; i < dataTransferItemList.length; i++) {
  //     queue.push(dataTransferItemList[i].webkitGetAsEntry());
  //   }
  //   while (queue.length > 0) {
  //     let entry: any;
  //     entry = queue.shift();
  //     if (entry.isFile) {
  //       fileEntries.push(entry);
  //     } else if (entry.isDirectory) {
  //       const reader = entry.createReader();
  //       queue.push(...(await this.readAllDirectoryEntries(reader)));
  //     }
  //   }
  //   return fileEntries;
  // }

  async getAllFileEntries(dataTransferItemList: DataTransferItemList): Promise<FileEntry[]> {
    const fileEntries: FileEntry[] = [];
    const queue: (FileSystemEntry | null)[] = [];

    for (let i = 0; i < dataTransferItemList.length; i++) {
      const entry = dataTransferItemList[i].webkitGetAsEntry?.();
      if (entry) queue.push(entry);
    }

    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) continue;

      if (entry.isFile && isFileEntry(entry)) {
        const file = await this.getFileFromEntry(entry);
        const extension = file?.name?.split('.').pop()?.toLowerCase();

        if (extension && !this.rejectedExtensions.includes(extension)) {
          fileEntries.push(entry);
        }
      } else if (entry.isDirectory) {
        const reader = (entry as FileSystemDirectoryEntry).createReader();
        const entries = await this.readAllDirectoryEntries(reader);
        queue.push(...entries);
      }
    }

    return fileEntries;
  }

  getFileFromEntry(entry: FileEntry): Promise<File> {
    return new Promise((resolve, reject) => {
      entry.file(resolve, reject);
    });
  }

  // Get all the entries (files or sub-directories) in a directory by calling readEntries until it returns empty array
  async readAllDirectoryEntries(directoryReader: any) {
    const entries = [];
    let readEntries: any;
    readEntries = await this.readEntriesPromise(directoryReader);
    while (readEntries.length > 0) {
      entries.push(...readEntries);
      readEntries = await this.readEntriesPromise(directoryReader);
    }
    return entries;
  }

  // Wrap readEntries in a promise to make working with readEntries easier
  async readEntriesPromise(directoryReader: any): Promise<any[]> {
    try {
      return await new Promise<any[]>((resolve, reject) => {
        directoryReader.readEntries(resolve, reject);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  onDrop(event: DndDropEvent, part: BomUploadPartViewModel) {
    const index = +event.data;
    const file = this.unAssociatedDocuments[index];
    if (file) {
      const formData = new FormData();
      const revisionLevel = part.partRevision ? part.partRevision : '0';
      const fileName = part.partNumber + '-' + revisionLevel + '-' + file.name;
      formData.append('partInfoId', part.partId);
      formData.append('formFile', file, fileName);
      formData.append('originalFileName', file.name);
      this.blockUiService.pushBlockUI('updateDocument');
      this.projectInfoService
        .updateDocument(formData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((x) => {
          this.blockUiService.popBlockUI('updateDocument');
          if (x) {
            this.mapPart(x, +part.partId);
            this.unAssociatedDocuments.splice(index, 1);
          }
        });
    }
  }

  onDropExtractionFile(event: DndDropEvent, part: BomUploadPartViewModel, indexValue: any) {
    const index = +event.data;
    const file = this.unAssociatedDocuments[index];
    if (this.withoutTemplateOption) {
      const fileInfo = new FileInfo();
      fileInfo.documentName = event?.data?.documentName;
      fileInfo.isSupportingDocument = false;
      this.parts[indexValue]?.fileList?.push(fileInfo);
    }
    if (file) {
      // if (part.fileList.filter((p) => p.isSupportingDocument == false).length > 0) {
      //   part.fileList
      //     .filter((p) => p.isSupportingDocument == false)
      //     .forEach((element) => {
      //       this.removeMultipleExtractionDocument(element.documentId, part);
      //     });
      // }

      const formData = new FormData();
      const revisionLevel = part.partRevision ? part.partRevision : '0';
      const fileName = part.partNumber + '-' + revisionLevel + '-' + file.name;
      formData.append('partInfoId', part.partId);
      formData.append('formFile', file, fileName);
      formData.append('originalFileName', file.name);
      formData.append('isSupportingDocument', 'false');
      this.blockUiService.pushBlockUI('updateDocument');
      this.projectInfoService
        .updateDocument(formData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((x) => {
          this.blockUiService.popBlockUI('updateDocument');
          if (x) {
            this.mapPart(x, +part.partId);
            this.unAssociatedDocuments.splice(index, 1);
          }
        });
    }
  }

  onDropSupportingFile(event: DndDropEvent, part: BomUploadPartViewModel, indexValue: any) {
    const index = +event.data;
    const file = this.unAssociatedDocuments[index];
    if (this.withoutTemplateOption) {
      const fileInfo = new FileInfo();
      fileInfo.documentName = event?.data?.documentName;
      fileInfo.isSupportingDocument = true;
      this.parts[indexValue]?.fileList?.push(fileInfo);
    }
    if (file) {
      const formData = new FormData();
      const revisionLevel = part.partRevision ? part.partRevision : '0';
      const fileName = part.partNumber + '-' + revisionLevel + '-' + file.name;
      formData.append('partInfoId', part.partId);
      formData.append('formFile', file, fileName);
      formData.append('originalFileName', file.name);
      formData.append('isSupportingDocument', 'true');
      this.blockUiService.pushBlockUI('updateDocument');
      this.projectInfoService
        .updateDocument(formData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((x) => {
          this.blockUiService.popBlockUI('updateDocument');
          if (x) {
            this.mapPart(x, +part.partId);
            this.unAssociatedDocuments.splice(index, 1);
          }
        });
    }
  }

  public changeYear(year: number) {
    this.year = year || this.yearDefault;
    this.quarterText = this.quarterText || this.quarterDefault;
    this.quarter.setValue(this.quarterText + ' ' + this.year, {
      emitEvent: false,
    });
  }

  public changeShowQuarter() {
    this.showQuarter = !this.showQuarter;
    if (!this.showQuarter) this.year10 = this.year ? 10 * Math.floor(this.year / 10) : 10 * Math.floor(this.yearDefault / 10);
  }

  public click(quarterText: any, drop: any): void {
    this.quarterText = quarterText;
    this.year = this.year || this.yearDefault;
    this.quarter.setValue(this.quarterText + ' ' + this.year, {
      emitEvent: false,
    });
    drop.close();
  }

  async onDropped($event) {
    const fileList: FileList = $event.dataTransfer.files;
    const filesArray: File[] = Array.from(fileList);

    const acceptedFiles = filesArray.filter((file) => {
      const extension = file?.name?.split('.').pop()?.toLowerCase();
      return extension && !this.rejectedExtensions.includes(extension);
    });

    const dataTransfer = new DataTransfer();
    acceptedFiles.forEach((file) => dataTransfer.items.add(file));
    const cleanedFileList = dataTransfer.files;

    //const files = $event.dataTransfer.files;
    const files = cleanedFileList;
    if (files?.length > 0) {
      if (files?.length == 1) {
        const fileName = files[0].name;
        const ext = fileName.substr(fileName.lastIndexOf('.') + 1);
        const arrExt = ['xlsx', 'xls', 'csv'];
        if (arrExt.includes(ext)) {
          this.onTemplateFileDropped($event);
        } else {
          this.onFolderDropped($event);
        }
      } else {
        this.onFolderDropped($event);
      }
    }
  }

  onBrowseHandler($event) {
    const fileList: FileList = $event.target.files;
    const filesArray: File[] = Array.from(fileList);

    const acceptedFiles = filesArray.filter((file) => {
      const extension = file?.name?.split('.').pop()?.toLowerCase();
      return extension && !this.rejectedExtensions.includes(extension);
    });

    const dataTransfer = new DataTransfer();
    acceptedFiles.forEach((file) => dataTransfer.items.add(file));
    const cleanedFileList = dataTransfer.files;

    //const files = $event.target.files;
    const files = cleanedFileList;
    if (files?.length > 0) {
      if (files.length == 1) {
        const fileName = files[0]?.name;
        const ext = fileName.substr(fileName?.lastIndexOf('.') + 1);
        const arrExt = ['xlsx', 'xls', 'csv'];
        if (arrExt.includes(ext)) {
          this.fileBrowseHandler($event);
        } else {
          this.folderBrowseHandler($event);
        }
      } else {
        this.folderBrowseHandler($event);
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const forbiddenChars = /[^a-zA-Z0-9\s]/;
    if (forbiddenChars.test(event.key)) {
      event.preventDefault();
    }
  }

  getCommodityName(commodityId: number) {
    const commodity = this.commodityList.find((x) => x.commodityId == commodityId);
    return commodity?.commodity;
  }

  getSupplierName(vendorId: number) {
    const supplier = this.vendorList.find((x) => x.supplierId == vendorId);
    return supplier?.supplierDirectoryMasterDto?.vendorName;
  }

  getDeliverySiteName(buId: number) {
    const deliverySite = this.buLocationList.find((x) => x.buId == buId);
    return deliverySite?.buName;
  }

  changeCommodity(commodity, part) {
    if (commodity.commodityId) {
      part.commodityId = commodity.commodityId;
    } else {
      part.commodityId = undefined;
    }
  }

  changeSupplier(vendor, part) {
    if (vendor.supplierId) {
      part.vendorId = vendor.supplierId;
      part.mfrCountryId = vendor.supplierDirectoryMasterDto?.countryId;
    } else {
      part.vendorId = undefined;
      part.mfrCountryId = undefined;
    }
  }

  changeDeliverySite(deliverySite, part) {
    if (deliverySite.buId) {
      part.buId = deliverySite.buId;
      part.deliveryCountryId = deliverySite.country;
    } else {
      part.buId = undefined;
      part.deliveryCountryId = undefined;
    }
  }

  onRowEditInit(index: number) {
    this.clonedParts[index] = { ...this.parts[index] };
    this.selectedCommodity = this.commodityList.find((x) => x.commodityId == this.clonedParts[index].commodityId);
    // this.selectedSupplier = this.vendorList.find(x => x.id == this.clonedParts[index]?.vendorId);
    this.selectedSupplier = this.vendorList.find((x) => x.supplierId == this.clonedParts[index]?.vendorId);
    this.selectedDeliverySite = this.buLocationList.find((x) => x.buId == this.clonedParts[index]?.buId);
  }

  onRowEditSave(data: BomUploadPartViewModel, index: number) {
    this.parts[index] = data;
    this.parts[index].isEdit = true;
    delete this.clonedParts[index];
    this.saveClick();
  }

  onRowEditCancel(index: number) {
    this.parts[index] = this.clonedParts[index];
    delete this.clonedParts[index];
  }

  onRowDeleteInit(rowData: BomUploadPartViewModel, index: number) {
    if (rowData) {
      const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
        data: {
          title: 'Confirm Delete',
          message: 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
          action: 'CONFIRM',
          cancelText: 'CANCEL',
        },
      });
      this.dialogSub = dialogRef
        .afterClosed()
        .pipe(first())
        .subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.parts.splice(index, 1);
            if (!this.withoutTemplateOption) {
              if (this.editProjectInfoDto) {
                const filteredPartData = this.editProjectInfoDto?.partInfoList?.filter((data) => data.partInfoId.toString() === rowData.partId);
                const filteredBomData = filteredPartData[0]?.billOfMaterialPartInfos?.filter((data) => data.partInfoId.toString() === rowData.partId);
                const deleteBomId = filteredBomData[0]?.bomId;
                if (deleteBomId) {
                  // this._store.dispatch(new BomActions.RemoveBillOfMaterial(Number(deleteBomId), Number(rowData.projectId), 0));
                  this.bomInfoSignalsService.removeBillOfMaterial(Number(deleteBomId), Number(rowData.projectId), 0);
                }
              } else {
                if (this.deletePartsInfoDto) {
                  const filteredBomData = this.deletePartsInfoDto?.filter((data) => data.partInfoId.toString() === rowData.partId);
                  const deleteBomId = filteredBomData[0]?.bomId;
                  if (deleteBomId) {
                    // this._store.dispatch(new BomActions.RemoveBillOfMaterial(Number(deleteBomId), Number(rowData.projectId), 0));
                    this.bomInfoSignalsService.removeBillOfMaterial(Number(deleteBomId), Number(rowData.projectId), 0);
                  }
                }
              }
            }
          }
        });
    }
  }

  tempProjectInfo = {} as ProjectInfoDto;
  tempFileContainer: any[] = [];
  withoutTemplateOption = false;
  // createProject(files: any[]) {
  //   if (!this.projectname.value || this.projectname.value.trim() == '') {
  //     this.messaging.openSnackBar('Please enter project name.', '', {
  //       duration: 3000,
  //     });
  //     return;
  //   } else if (this.quarter.value == '') {
  //     this.messaging.openSnackBar('Please select market quarter.', '', {
  //       duration: 3000,
  //     });
  //     return;
  //   }

  //   this.withoutTemplateOption = true;
  //   const projectInfo = new ProjectInfoDto();
  //   projectInfo.projectInfoId = this.currentProjectId || 0;
  //   projectInfo.projectName = this.projectname.value || '';
  //   projectInfo.projectDesc = this.projectdescription.value || '';
  //   projectInfo.tag = this.tag.value || '';
  //   projectInfo.marketQuarter = '';
  //   if (this.quarter.value) {
  //     const year = this.year || this.yearDefault;
  //     const quarter = this.quarterText || this.quarterDefault;
  //     projectInfo.marketQuarter = year + '-' + quarter + 'F';
  //   }
  //   projectInfo.projectStatusId = ProjectStatus.Draft;
  //   const mon = (this.projectDate?.value?.month() + 1).toString().padStart(2, '0');
  //   const year = this.projectDate.value.year();
  //   projectInfo.marketMonth = mon + year.toString();

  //   projectInfo.isArchived = false;
  //   projectInfo.partInfoList = [];

  //   for (let index = 0; index < files.length; index++) {
  //     const file = files[index];

  //     const partInfo = new PartInfoDto();
  //     const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
  //     partInfo.intPartNumber = fileNameWithoutExt;
  //     partInfo.commodityId = 1;
  //     projectInfo.partInfoList.push(partInfo);

  //     const uploadPartViewModel = new BomUploadPartViewModel();
  //     uploadPartViewModel.partNumber = fileNameWithoutExt;

  //     const fileInfo = new FileInfo();
  //     fileInfo.documentName = file.name;
  //     const ext = file.name.substring(file.name.lastIndexOf('.') + 1);
  //     fileInfo.isSupportingDocument = Object.values(SupportingFileTypeEnum).includes(ext);

  //     uploadPartViewModel.fileList = [];
  //     uploadPartViewModel.fileList.push(fileInfo);

  //     this.parts.push(uploadPartViewModel);
  //   }

  //   this.tempProjectInfo = projectInfo;
  //   this.tempFileContainer = this.tempFileContainer.concat(files);
  // }

  // createProject(files: File[]): void {
  //   const projectName = this.projectname.value?.trim();
  //   const selectedQuarter = this.quarter.value;

  //   if (!projectName) {
  //     this.messaging.openSnackBar('Please enter project name.', '', { duration: 3000 });
  //     return;
  //   }

  //   if (!selectedQuarter) {
  //     this.messaging.openSnackBar('Please select market quarter.', '', { duration: 3000 });
  //     return;
  //   }

  //   this.withoutTemplateOption = true;

  //   const projectInfo = new ProjectInfoDto();
  //   projectInfo.projectInfoId = this.currentProjectId || 0;
  //   projectInfo.projectName = projectName;
  //   projectInfo.projectDesc = this.projectdescription.value || '';
  //   projectInfo.tag = this.tag.value || '';
  //   projectInfo.projectStatusId = ProjectStatus.Draft;
  //   projectInfo.isArchived = false;
  //   projectInfo.partInfoList = [];

  //   const year = this.year || this.yearDefault;
  //   const quarter = this.quarterText || this.quarterDefault;
  //   projectInfo.marketQuarter = `${year}-${quarter}F`;

  //   const mon = (this.projectDate?.value?.month() + 1).toString().padStart(2, '0');
  //   const projectYear = this.projectDate?.value?.year();
  //   projectInfo.marketMonth = `${mon}${projectYear}`;

  //   const partMap = new Map<string, { partInfo: PartInfoDto; uploadPart: BomUploadPartViewModel }>();

  //   for (const file of files) {
  //     const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
  //     const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

  //     if (!partMap.has(fileNameWithoutExt)) {
  //       const partInfo = new PartInfoDto();
  //       partInfo.intPartNumber = fileNameWithoutExt;
  //       partInfo.commodityId = 1;

  //       const uploadPart = new BomUploadPartViewModel();
  //       uploadPart.partNumber = fileNameWithoutExt;
  //       uploadPart.fileList = [];

  //       partMap.set(fileNameWithoutExt, { partInfo, uploadPart });
  //     }

  //     const fileInfo = new FileInfo();
  //     fileInfo.documentName = file.name;
  //     fileInfo.isSupportingDocument = Object.values(SupportingFileTypeEnum).includes(fileExtension);

  //     partMap.get(fileNameWithoutExt)!.uploadPart.fileList.push(fileInfo);
  //   }

  //   for (const { partInfo, uploadPart } of partMap.values()) {
  //     projectInfo.partInfoList.push(partInfo);
  //     this.parts.push(uploadPart);
  //   }

  //   this.tempProjectInfo = projectInfo;
  //   this.tempFileContainer = [...this.tempFileContainer, ...files];
  // }

  createProject(files: File[]): void {
    const projectName = this.projectname.value?.trim();
    const selectedQuarter = this.quarter.value;

    if (!projectName) {
      this.messaging.openSnackBar('Please enter project name.', '', { duration: 3000 });
      return;
    }

    if (!selectedQuarter) {
      this.messaging.openSnackBar('Please select market quarter.', '', { duration: 3000 });
      return;
    }

    this.withoutTemplateOption = true;

    const projectInfo = new ProjectInfoDto();
    projectInfo.projectInfoId = this.currentProjectId || 0;
    projectInfo.projectName = projectName;
    projectInfo.projectDesc = this.projectdescription.value || '';
    projectInfo.tag = this.tag.value || '';
    projectInfo.projectStatusId = ProjectStatus.Draft;
    projectInfo.isArchived = false;
    projectInfo.partInfoList = [];

    const year = this.year || this.yearDefault;
    const quarter = this.quarterText || this.quarterDefault;
    projectInfo.marketQuarter = `${year}-${quarter}F`;

    const mon = (this.projectDate?.value?.month() + 1).toString().padStart(2, '0');
    const projectYear = this.projectDate?.value?.year();
    projectInfo.marketMonth = `${mon}${projectYear}`;

    const partMap = new Map<string, { partInfo: PartInfoDto; uploadPart: BomUploadPartViewModel }>();

    // Normalize and count all names in the batch
    const nameCountMap = new Map<string, number>();
    const fileGroups = new Map<string, File[]>();

    for (const file of files) {
      const fileNameWithoutExt = file.name?.split('.')?.slice(0, -1)?.join('.');
      const normalizedName = fileNameWithoutExt?.toUpperCase()?.trim();

      if (!normalizedName) continue;

      nameCountMap.set(normalizedName, (nameCountMap.get(normalizedName) || 0) + 1);

      if (!fileGroups.has(normalizedName)) {
        fileGroups.set(normalizedName, []);
      }
      fileGroups.get(normalizedName)!.push(file);
    }

    const exactMatchNames = new Set(
      Array.from(nameCountMap.entries())
        .filter(([_, count]) => count > 1)
        .map(([name]) => name)
    );

    // Group files
    for (const [normalizedName, fileGroup] of fileGroups.entries()) {
      let matchedKey: string | null = null;
      let matchType: 'exact' | 'fuzzy' | 'new' = 'new';

      if (partMap.has(normalizedName)) {
        matchedKey = normalizedName;
        matchType = 'exact';
      } else if (exactMatchNames.has(normalizedName)) {
        // This name has an exact group, create new entry
        matchedKey = normalizedName;
        matchType = 'exact';

        const partInfo = new PartInfoDto();
        partInfo.intPartNumber = normalizedName;
        partInfo.commodityId = 1;

        const uploadPart = new BomUploadPartViewModel();
        uploadPart.partNumber = normalizedName;
        uploadPart.fileList = [];

        partMap.set(matchedKey, { partInfo, uploadPart });
      } else {
        // Fuzzy match attempt
        const fuzzyCandidates = Array.from(partMap.keys()).filter((key) => !exactMatchNames.has(key));

        if (fuzzyCandidates.length > 0) {
          const result = stringSimilarity.findBestMatch(normalizedName, fuzzyCandidates);
          const bestMatch = result.bestMatch;

          if (bestMatch.rating >= 0.5) {
            matchedKey = bestMatch.target;
            matchType = 'fuzzy';
          }
        }

        // If still not matched, create new
        if (!matchedKey) {
          matchedKey = normalizedName;
          matchType = 'new';

          const partInfo = new PartInfoDto();
          partInfo.intPartNumber = normalizedName;
          partInfo.commodityId = 1;

          const uploadPart = new BomUploadPartViewModel();
          uploadPart.partNumber = normalizedName;
          uploadPart.fileList = [];

          partMap.set(matchedKey, { partInfo, uploadPart });
        }
      }
      // Keeping for now
      console.log(`[GROUP] Normalized: "${normalizedName}" → MatchedKey: "${matchedKey}" → Type: ${matchType}`);

      for (const file of fileGroup) {
        const fileExtension = file.name?.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

        const fileInfo = new FileInfo();
        fileInfo.documentName = file.name;
        fileInfo.isSupportingDocument = Object.values(SupportingFileTypeEnum).includes(fileExtension);

        partMap.get(matchedKey)!.uploadPart.fileList.push(fileInfo);
      }
    }

    // Finally
    for (const { partInfo, uploadPart } of partMap.values()) {
      this.parts.push(uploadPart);
      projectInfo.partInfoList.push(partInfo);
    }

    this.tempProjectInfo = projectInfo;
    this.tempFileContainer = [...this.tempFileContainer, ...files];
  }

  findSupportingDocuments(fileList: FileInfo[]): any {
    return fileList.filter((p) => p.isSupportingDocument == true);
  }

  findExtractionDocument(fileList: FileInfo[]): any {
    return fileList.filter((p) => p.isSupportingDocument == false);
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();

    if (this.dialogSub) {
      this.dialogSub.unsubscribe();
    }
  }

  showAvailableTags() {
    this.availableTags = this.allTags.filter((tag) => !this.selectedTags.includes(tag));
  }
  searchTags(event: any) {
    const query = event.query.toLowerCase().trim();

    if (!query) {
      this.showAvailableTags();
      return;
    }

    // Filter existing tags that match the query and are not already selected
    this.availableTags = this.allTags.filter((tag) => tag.toLowerCase().includes(query) && !this.selectedTags.includes(tag));

    // Check if the query exactly matches any existing tag
    const exactMatch = this.allTags.some((tag) => tag.toLowerCase() === query);

    // If no exact match exists and query is not empty and not already selected, add the new tag option
    if (!exactMatch && !this.selectedTags.includes(event.query)) {
      this.availableTags.push(event.query);
    }
  }
}
