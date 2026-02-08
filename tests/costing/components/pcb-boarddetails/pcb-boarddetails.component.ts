import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTab, MatTabChangeEvent, MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { Store } from '@ngxs/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { first, map, startWith, takeUntil } from 'rxjs/operators';
import { SubCommodityState } from 'src/app/modules/_state/subCommodity.state';
import { TechnologyState } from 'src/app/modules/_state/technology.state';
import { BillOfMaterialDto, PartInfoDto, TechnologyMasterDto } from 'src/app/shared/models';
import { CostPriceBookDto } from 'src/app/shared/models/costPrice-book.model';
import { BlockUiService, BomService, ProjectInfoService } from 'src/app/shared/services';
import { SharedService } from '../../services/shared.service';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
// import * as BomActions from 'src/app/modules/_actions/bom.action';
import { AddBOmService, AddBomConfirmationDialogConfig } from '../../services/add-bom-services';
import { PCBAMarketDataDto, PCBAResultDto, SubCategoryDto } from 'src/app/shared/models/pcb-master..model';
import { PCBRPAConfigService } from 'src/app/shared/config/pcba-rpa.config';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { MatIconModule } from '@angular/material/icon';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DropdownModule } from 'primeng/dropdown';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { DeletePcbBomModalComponent } from '../delete-pcb-bom-modal/delete-pcb-bom-modal.component';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PCBAService } from 'src/app/shared/services/pcba-.service';
import { BillOfMaterialService, BOMStatus, PartStatus } from '../../services/billl-of-material.service';
import { MatTooltipModule } from '@angular/material/tooltip';
// import { BomTreeState } from 'src/app/modules/_state/bom.state';
// import { AddBomDto } from 'src/app/shared/models/add-bom.model';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

@Component({
  selector: 'app-pcb-boarddetails',
  templateUrl: './pcb-boarddetails.component.html',
  styleUrls: ['./pcb-boarddetails.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OnlyNumber,
    MatTabsModule,
    MatTabGroup,
    MatTab,
    MatIconModule,
    TableModule,
    RadioButtonModule,
    MatInputModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSelectModule,
    DropdownModule,
    AutoTooltipDirective,
  ],
})
export class PcbBoarddetailsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() part: PartInfoDto;
  currentPart: PartInfoDto;
  selectedComponent: any;
  private selectedTabIndex = 1;
  public subCommodityList: SubCategoryDto[] = [];
  public technologyList: TechnologyMasterDto[] = [];
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  boardComponents: BillOfMaterialDto[] = [];
  _subCategoryMaster$: Observable<SubCategoryDto[]>;
  _technologyMaster$: Observable<TechnologyMasterDto[]>;
  selectedBomId: number = 0;
  selectedpartInfoId: number = 0;
  wiringHarnessForm: FormGroup;
  dialogSub: Subscription;
  showFormForEdit: boolean = false;
  private filterValues: { [key: string]: string } = {};
  filteredBoardComponents: any[] = [];
  modalRef: NgbModalRef;
  bomStatus: any[] = [];
  partStatusList: any[] = [];
  standardCustomList: any[] = [];
  unitOfMeasureList: any[] = [];
  materialMasterList: PCBAMarketDataDto[] = [];
  productAttributes: any;
  additionalAttributes: any;
  filteredFamilies$!: Observable<any[]>;
  showZoom = false;
  zoomImage = '';
  zoomTop = 0;
  zoomLeft = 0;
  selectedBoardComponent: any;
  // _addNewBom$: Observable<AddBomDto> = this._store.select(BomTreeState.getAddNewBillOfMaterial);
  // _bulkUpdateBomDetails$: Observable<BillOfMaterialDto[]> = this._store.select(BomTreeState.getBulkUpdateBomDetails);
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Output() recalculationCompletedEvent = new EventEmitter<any>();
  @Input() recalculateSubject: Subject<PartInfoDto>;
  addBomInfoEffect = effect(() => {
    const addBomInfo = this.bomInfoSignalsService.addBomInfo();
    if (addBomInfo) {
      this.dispatchLoadedComponents();
    }
  });
  bulkBomInfoEffect = effect(() => {
    const bulkBomInfo = this.bomInfoSignalsService.bulkBomInfo();
    if (bulkBomInfo && bulkBomInfo.length > 0) {
      this.dispatchLoadedComponents();
    }
  });

  constructor(
    private _fb: FormBuilder,
    private bomService: BomService,
    private blockUiService: BlockUiService,
    public _shareService: SharedService,
    private messaging: MessagingService,
    private _store: Store,
    private addbomservice: AddBOmService,
    private _bomService: BomService,
    private _pcbConfig: PCBRPAConfigService,
    private projectInfoService: ProjectInfoService,
    private modalService: NgbModal,
    private _pcbaService: PCBAService,
    private bomConfig: BillOfMaterialService,
    private bomInfoSignalsService: BomInfoSignalsService,
    private costSummarySignalsService: CostSummarySignalsService
  ) {
    this._subCategoryMaster$ = this._store.select(SubCommodityState.getSubCommodityData);
    this._technologyMaster$ = this._store.select(TechnologyState.getTechnologyData);
  }

  ngOnInit(): void {
    this.wiringHarnessForm = this._fb.group({
      mpn: [''],
      description: '-',
      commodity: '',
      qty: 0,
      annualVolume: 0,
      currentCost: 0,
      targetCost: 0,
      savingsOpp: 0,
      extendedCost: 0,
      annualSavingOpp: [1],
      unitOfMeasure: [''],
      standardCustom: [''],
      partMatch: 0,
      partStatus: 0,
      supplierName: '',
      categoryName: '',
      mfrName: '',
      series: '',
      packagingType: '',
    });
    this.getTechnologyList();
    this.getSubCommodityList();
    this.recalculateSubject?.pipe(takeUntil(this.unsubscribeAll$)).subscribe((e) => {
      this.recalculateBillOfMaterialCost(e);
    });
    this.filteredBoardComponents = [...this.boardComponents];
    this.bomStatus = this.bomConfig.getBOMStatus();
    this.standardCustomList = this.bomConfig.getStandardCustom();
    this.unitOfMeasureList = this.bomConfig.getUnitOfMeasures();
    this.partStatusList = this.bomConfig.getPartStatusList();
    this.filteredFamilies$ = this.wiringHarnessForm.controls['commodity'].valueChanges.pipe(
      startWith(''),
      map((value) => this._filterFamilies(value))
    );
  }

  onMouseEnter(event: MouseEvent, imageUrl: string) {
    this.showZoom = true;
    this.zoomImage = imageUrl;
    this.updateZoomPosition(event);
  }

  onMouseMove(event: MouseEvent) {
    if (this.showZoom) {
      this.updateZoomPosition(event);
    }
  }

  onMouseLeave() {
    this.showZoom = false;
  }

  private updateZoomPosition(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.zoomTop = rect.top;
    this.zoomLeft = rect.right + 10;
  }

  private _filterFamilies(value: any): any[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return [
      ...new Map(
        this.subCommodityList?.filter((family) => family?.subCategoryName?.toLowerCase().includes(filterValue?.toLowerCase())).map((item) => [item?.subCategoryName?.toLowerCase(), item])
      ).values(),
    ];
  }

  recalculateBillOfMaterialCost(part: any) {
    this.blockUiService.pushBlockUI('recalculateBillOfMaterialCost');
    this._bomService
      .getBoardLoadedComponents(this.currentPart?.projectInfoId, this.currentPart.partInfoId)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((bomResponse: BillOfMaterialDto[]) => {
        if (bomResponse?.length > 0) {
          bomResponse = bomResponse.filter((x) => x.rpaCallRequired || x.isManuallyCreated); //If they are providing price in excel then no need to change the price.
          const mpnNumbers = this._pcbConfig.getMPNForRecalculate(bomResponse, part?.eav);
          if (mpnNumbers?.length > 0) {
            this.projectInfoService
              .getPriceDatasByMPNsAsync(mpnNumbers)
              .pipe(takeUntil(this.unsubscribeAll$))
              .subscribe((result: PCBAMarketDataDto[]) => {
                if (result && result.length > 0) {
                  const resultListToUpdate: BillOfMaterialDto[] = [];
                  this.getDuplicatesByProperty(bomResponse, 'mpn').forEach((bomInfo) => {
                    bomResponse = this.getBomWithDuplicates(bomResponse, bomInfo);
                  });
                  result?.forEach((costInfo) => {
                    const bomInfo = bomResponse?.find((x) => x.mpn === costInfo?.mpn);
                    if (bomInfo) {
                      const volume = part?.eav * bomInfo?.partQty;
                      const discount = this._pcbConfig.getDiscountBasedOnSubcategoryForMpn(costInfo, volume);
                      const countryWiseDisc = this._pcbConfig.getCountryWiseDiscount(part?.mfrCountryId);
                      bomInfo.currentCost = Number(discount * countryWiseDisc);
                      bomInfo.extendedCost = Number(bomInfo?.currentCost) * Number(bomInfo?.partQty);
                      bomInfo.savingOpp = Number(bomInfo?.targetCost) - Number(bomInfo?.currentCost);
                      bomInfo.annualVolume = volume;
                      bomInfo.annualSavingOpp = Number(bomInfo?.savingOpp) * Number(bomInfo?.annualVolume);
                      bomInfo.shouldCost = costInfo?.price;
                      bomInfo.isDirectMatch = costInfo.isDirectMatch;
                      bomInfo.mpn = bomInfo?.mpn?.replace(/\(duplicate\d+\)$/, '');
                      bomInfo.partialMatchMpn = costInfo.partialMatchMpn;
                      bomInfo.mfrName = costInfo.manufacturer;
                      bomInfo.supplierName = costInfo.supplierName;
                      bomInfo.breakQuantity = costInfo.breakQuantity;
                      bomInfo.subCategoryName = costInfo.subCategoryName;
                      bomInfo.isManuallyCreated = false;
                      bomInfo.isLoadingFromTemplate = true;
                      resultListToUpdate.push(bomInfo);
                    }
                  });
                  // this._store.dispatch(new BomActions.BulkUpdateOrCreateBOMInfo(resultListToUpdate));
                  this.bomInfoSignalsService.bulkUpdateOrCreateBOMInfo(resultListToUpdate);
                  this.blockUiService.popBlockUI('recalculateBillOfMaterialCost');
                  this.messaging.openSnackBar(`Recalculation completed for Bill Of Material Section.`, '', { duration: 5000 });
                  this.recalculationCompletedEvent.emit(part);
                } else {
                  console.log('No matching cost info found for recalculation.', mpnNumbers);
                }
              });
          } else {
            this.recalculationCompletedEvent.emit(part);
            this.blockUiService.popBlockUI('recalculateBillOfMaterialCost');
          }
        } else {
          this.recalculationCompletedEvent.emit(part);
          this.blockUiService.popBlockUI('recalculateBillOfMaterialCost');
        }
      });
  }

  private getBomWithDuplicates(bomPartInfos: BillOfMaterialDto[], bomInfo: BillOfMaterialDto): BillOfMaterialDto[] {
    let count = 1;
    let skip = 0;
    return bomPartInfos.map((item) => {
      if (item?.mpn === bomInfo?.mpn) {
        if (skip === 0) {
          skip++;
          return item;
        } else {
          item.mpn = item?.mpn + '(duplicate' + count.toString() + ')';
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && changes['part'].currentValue != changes['part'].previousValue) {
      this.currentPart = { ...changes['part'].currentValue };
      this.dispatchLoadedComponents();
    }
  }

  dispatchLoadedComponents() {
    if (this.currentPart?.projectInfoId && this.currentPart?.partInfoId) {
      this.getBoardLoadedComponents();
    }
  }
  onFormValueChange() {
    this.dirtyCheckEvent.emit(true);
  }

  onUomChange(event: Event): void {
    const uom = (event.target as HTMLSelectElement).value;
    let item = this.boardComponents?.find((x) => x.bomId === this.selectedBomId);
    item.unitOfMeasure = uom;
    if (uom === 'Meter') {
      if (item.lengthHasValue) {
        item.currentCost = this.getCostPerMeter(item.currentCost);
        item.extendedCost = item.currentCost * item.partQty;
      }
    } else if (uom === 'Foot') {
      if (item.lengthHasValue) {
        item.currentCost = this.getCostPerFeet(item.currentCost);
        item.extendedCost = item.currentCost * item.partQty;
      }
    }
    this.onEditData(item);
  }

  getCostPerFeet(costPerMeter: number): number {
    if (costPerMeter <= 0) {
      return 0;
    }
    const FEET_PER_METER = 3.28084;
    return Number((costPerMeter / FEET_PER_METER).toFixed(2));
  }

  getCostPerMeter(costPerFeet: number): number {
    if (costPerFeet <= 0) {
      return 0;
    }
    const FEET_PER_METER = 3.28084;
    return Number((costPerFeet * FEET_PER_METER).toFixed(2));
  }

  getBoardLoadedComponents() {
    this._bomService
      .getBoardLoadedComponents(this.currentPart?.projectInfoId, this.currentPart.partInfoId)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((response: BillOfMaterialDto[]) => {
        if (response?.length > 0) {
          this.boardComponents = [...response];
          const mpnList = response?.map((item) => item?.mpn);
          const payload: any[] = [];
          payload.push({ countryId: this.currentPart.mfrCountryId, mpnList: mpnList });
          this._pcbaService
            .getMaterialMasterByCountryIdMpnAsync(payload)
            .pipe(takeUntil(this.unsubscribeAll$))
            .subscribe((materialResponse: PCBAResultDto) => {
              if (materialResponse.pcbaMarketDataDtos?.length > 0) {
                this.materialMasterList = materialResponse.pcbaMarketDataDtos;
                const mfrPartSet = new Set(materialResponse.pcbaMarketDataDtos.map((item) => item?.mpn));
                this.boardComponents?.forEach((bom, index) => {
                  bom.partMatch = 3; // Default to No Match
                  bom.partStatus = this.partStatusList?.find((x) => x.id === bom.partStatus)?.id || PartStatus.Unknown;
                  let bomMpn = bom?.mpn?.replace(/\(duplicate\d+\)$/, '');
                  const materialInfo = materialResponse?.pcbaMarketDataDtos.find((x) => x.mpn === bomMpn);
                  if (materialInfo) {
                    let subCat = '-';
                    if (bom?.subCategoryName && bom?.subCategoryName.trim() !== '-') {
                      subCat = bom?.subCategoryName;
                    } else if (materialInfo.subCategoryName) {
                      subCat = materialInfo.subCategoryName;
                    } else if (materialInfo.subCategoryId) {
                      subCat = this.getSubCommodityNameById(materialInfo.subCategoryId);
                    }
                    bom.subCategoryName = subCat;
                    bom.image = materialInfo?.imageUrl || '';
                    bom.description = materialInfo?.description || bom?.description || '-';
                    bom.partialMatchMpn = materialInfo?.partialMatchMpn || '';
                    bom.mpn = bomMpn;
                    bom.lengthHasValue = !!materialInfo?.lengthInFeet;
                    if (bom.isLoadingFromTemplate) {
                      if (bom.unitOfMeasure === 'Meter') {
                        if (materialInfo.lengthInFeet) {
                          let lengthInMeter = this.convertFeetToMeters(materialInfo.lengthInFeet);
                          bom.currentCost = this.getPricePerMeter(bom.currentCost, lengthInMeter);
                          bom.extendedCost = bom.currentCost * bom.partQty;
                        }
                      } else if (bom.unitOfMeasure === 'Foot') {
                        if (materialInfo.lengthInFeet) {
                          bom.currentCost = this.getPricePerMeter(bom.currentCost, materialInfo.lengthInFeet);
                          bom.extendedCost = bom.currentCost * bom.partQty;
                        }
                      }
                    }
                    bom.partStatus = this.partStatusList?.find((x) => x.name === materialInfo?.productStatus)?.id || PartStatus.Unknown;
                    if (index === 0 && materialInfo.jsonData) {
                      this.productAttributes = JSON.parse(materialInfo.jsonData);
                      this.additionalAttributes = this.getAdditionalAttributes(materialInfo);
                    }
                    const missingMpnParts: string[] = mpnList?.filter((item) => !mfrPartSet.has(item)).map((item) => item);
                    if (missingMpnParts.includes(bomMpn) || bom.isManuallyCreated) {
                      bom.partMatch = BOMStatus.NoMatch;
                    } else if (bom.isDirectMatch) {
                      bom.partMatch = BOMStatus.Direct;
                    } else if (!bom.isDirectMatch) {
                      bom.partMatch = BOMStatus.Partial;
                    }
                  }
                  bom.partStatusName = this.partStatusList?.find((x) => x.id === bom.partStatus)?.name || '-';
                });
                this.costSummarySignalsService.getCostSummaryByPartInfoId(this.currentPart?.partInfoId);
              } else {
                this.materialMasterList = [];
              }
              this.loadLatestProcessInfo(this.selectedBomId, response);
            });

          //this.loadLatestProcessInfo(this.selectedBomId, response);
        }
      });
  }

  getPricePerMeter(price: number, meters: number): number {
    if (meters <= 0) {
      return 0;
    }
    return Number((price / meters).toFixed(2));
  }

  convertFeetToMeters(feet: number): number {
    if (feet == null || isNaN(feet)) {
      return 0;
    }
    return feet * 0.3048;
  }

  getUniqueValues(data: any[], field: string) {
    const unique = [...new Set(data.map((item) => item[field]).filter(Boolean))];
    return unique.map((value, index) => ({
      id: index + 1,
      name: value,
    }));
  }

  getAdditionalAttributes(materialInfo: PCBAMarketDataDto) {
    return Object.entries(JSON.parse(materialInfo?.jsonData || '{}'))
      .filter(([_, value]) => value != null && typeof value !== 'object')
      .map(([key, value]) => ({
        name: key.replace(/_/g, ' '),
        value,
      }))
      ?.filter((attr) => !this.bomConfig.additionalAttributesToRemove?.some((removeItem) => removeItem.toLowerCase() === attr.name.toLowerCase()));
  }

  setProductAttributes(item: any) {
    if (this.materialMasterList?.length > 0) {
      const materialMaster = this.materialMasterList?.find((x) => x.mpn === item?.mpn);
      if (materialMaster && materialMaster?.jsonData) {
        this.productAttributes = JSON.parse(materialMaster?.jsonData);
        this.additionalAttributes = this.getAdditionalAttributes(materialMaster);
      } else {
        this.productAttributes = null;
        this.additionalAttributes = null;
      }
    }
  }

  private loadLatestProcessInfo(selectedBomId: number, boardComponents: any[]) {
    if (boardComponents && boardComponents?.length > 0) {
      let item = null;
      if (selectedBomId > 0) {
        item = boardComponents?.find((x) => x.bomId === selectedBomId);
      } else {
        item = boardComponents[0];
      }
      this.onEditData(item);
    }
  }

  onEditRowClick(item: any) {
    this.wiringHarnessForm.reset();
    this.onEditData(item);
  }
  onEditData(item: any) {
    if (item) {
      this.selectedBoardComponent = item;
      this.selectedBomId = item?.bomId;
      this.selectedpartInfoId = item?.partInfoId;
      let itemMpn = item?.mpn?.replace(/\(duplicate\d+\)$/, '');
      item.partStatusName = this.partStatusList?.find((x) => x.id === item?.partStatus)?.name || '-';
      this.wiringHarnessForm?.patchValue({
        mpn: itemMpn,
        description: item?.description || '-',
        commodity: item?.subCommodity,
        qty: item?.partQty,
        annualVolume: item?.annualVolume || item?.partEav,
        currentCost: this._shareService.isValidNumber(item?.currentCost),
        targetCost: this._shareService.isValidNumber(item?.targetCost),
        savingsOpp: this._shareService.isValidNumber(item?.savingOpp),
        annualSavingOpp: this._shareService.isValidNumber(item?.annualSavingOpp || item?.annualSavings),
        unitOfMeasure: item?.unitOfMeasure,
        standardCustom: item?.standardOrCustom,
        extendedCost: this._shareService.isValidNumber(item?.extendedCost),
        partMatch: item?.partMatch,
        partStatus: item?.partStatus,
        supplierName: item?.supplierName,
        categoryName: item?.categoryName,
        mfrName: item?.mfrName,
        series: item?.series,
        packagingType: item?.packagingType,
      });

      this.setProductAttributes(item);
      this.showFormForEdit = true;
      this.dirtyCheckEvent.emit(false);
    }
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    console.log('Right click suppressed');
  }

  onDeleteClick(bomId: number) {
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
        if (bomId && confirmed) {
          this._bomService
            .removeSingleBillOfMaterial(bomId)
            .pipe(takeUntil(this.unsubscribeAll$))
            .subscribe((result) => {
              this.getBoardLoadedComponents();
              this.boardComponents = this.boardComponents.filter((x) => x.bomId != bomId);
              this.messaging.openSnackBar(`Data has been Deleted.`, '', {
                duration: 5000,
              });
              console.log(result);
              if (this.boardComponents != null && this.boardComponents.length > 0) {
                this.selectedBomId = this.boardComponents[this.boardComponents.length - 1]?.bomId;
                this.selectedpartInfoId = this.boardComponents[this.boardComponents.length - 1]?.partInfoId;
              } else {
                this.selectedBomId = 0;
                this.selectedpartInfoId = 0;
              }
            });
        }
      });
  }

  addBomMaterial() {
    const dialogRef = this.addbomservice.openAddBomConfirmationDialog(<AddBomConfirmationDialogConfig>{
      data: {
        title: 'Add New Bom',
        message: '',
        showForm: true,
        projectInfoId: this.currentPart?.projectInfoId,
        partInfoId: this.currentPart?.partInfoId,
        action: 'CONFIRM',
        cancelText: 'CANCEL',
        origin: 'pcba-details',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      } else {
        setTimeout(() => {
          this.getBoardLoadedComponents();
        }, 5000);
      }
    });
  }

  onSelectedComponent(componentValue: any) {
    this.selectedComponent = componentValue;
    this.selectedTabIndex = 1;
  }

  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;
  }

  private getSubCommodityList() {
    return this._subCategoryMaster$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: SubCategoryDto[]) => {
      this.subCommodityList = [...result].sort((a, b) => (a.subCategoryName || '').localeCompare(b.subCategoryName || '', undefined, { sensitivity: 'base' }));
    });
  }

  getSubCommodityNameById(subCategoryId: number) {
    return this.subCommodityList?.find((x) => x.subCategoryId === subCategoryId)?.subCategoryName;
  }

  private getTechnologyList() {
    return this._technologyMaster$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: TechnologyMasterDto[]) => {
      this.technologyList = result;
    });
  }

  public onSubCommodityChange(event: any, item: any) {
    const dto = this.setCotsPriceDtoOnvalueChange(item);
    dto.subCommodity = event.currentTarget.value;
    if (!(item?.mpn === 0 || item?.mpn === null)) {
      this.blockUiService.pushBlockUI('updateCostPriceBook');
      this.bomService
        .createOrUpdateCostPriceBook(dto)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: () => {
            this.blockUiService.popBlockUI('updateCostPriceBook');
            this.getBoardLoadedComponents();
          },
          error: () => {
            console.error();
          },
        });
    }
  }
  public onTechnologyChange(event: any, item: any) {
    const dto = this.setCotsPriceDtoOnvalueChange(item);
    dto.technology = event.currentTarget.value;
    if (!(item?.mpn === 0 || item?.mpn === null)) {
      this.blockUiService.pushBlockUI('updateCostPriceBook');
      this.bomService
        .createOrUpdateCostPriceBook(dto)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: () => {
            this.blockUiService.popBlockUI('updateCostPriceBook');
            this.getBoardLoadedComponents();
          },
          error: () => {
            console.error();
          },
        });
    }
  }

  public onTvhPriceChange(event: any, item: any) {
    const dto = this.setCotsPriceDtoOnvalueChange(item);
    dto.tvhPrice = event.currentTarget.value;
    if (!(dto?.mpn == undefined || dto?.mpn == null)) {
      this.blockUiService.pushBlockUI('updateCostPriceBook');
      this.bomService
        .createOrUpdateCostPriceBook(dto)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: () => {
            this.blockUiService.popBlockUI('updateCostPriceBook');
            this.getBoardLoadedComponents();
          },
          error: () => {
            console.error();
          },
        });
    }
  }

  public onPinChange(event: any, item: any) {
    const dto = this.setCotsPriceDtoOnvalueChange(item);
    dto.pins = event.currentTarget.value;
    item.pins = event.currentTarget.value;
    if (!(item?.mpn === 0 || item?.mpn === null)) {
      this.blockUiService.pushBlockUI('updateCostPriceBook');
      this.bomService
        .createOrUpdateCostPriceBook(dto)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: () => {
            this.blockUiService.popBlockUI('updateCostPriceBook');
          },
          error: () => {
            console.error();
          },
        });
    }
  }

  private setCotsPriceDtoOnvalueChange(item: any): CostPriceBookDto {
    item.partEav = this.currentPart.eav ? Number(item?.qty) * Number(item?.partEav) : Number(item?.qty);
    item.savingsOppPart = Number(item?.currentCost) - Math.min(Number(item?.currentCost), Number(item?.tvhPrice));
    item.extendedSaving = Number(item?.savingsOppPart) * Number(item?.qty);
    item.annualSavingsOppPart = Number(item?.savingsOppPart) * Number(item?.partEav);
    const dto = new CostPriceBookDto();
    dto.mpn = item?.mpn;
    dto.tvhPrice = item?.tvhPrice;
    dto.description = item?.description;
    dto.qty = item?.partQty;
    dto.currentCost = item?.currentCost;
    dto.savingsOppPart = item?.savings;
    dto.annualSavingsOppPart = item?.annualSavings;
    dto.projectInfoId = this.currentPart.projectInfoId;
    dto.partInfoId = item?.partInfoId;
    dto.extendedSaving = item?.extSavings;
    dto.partEav = item?.partEav;
    return dto;
  }

  onFormSubmit(): Observable<BillOfMaterialDto> {
    const infoDto = new BillOfMaterialDto();
    infoDto.partInfoId = this.selectedpartInfoId;
    infoDto.parentPartNumber = this.currentPart.intPartNumber;
    infoDto.parentPartInfoId = this.currentPart?.partInfoId;
    infoDto.bomId = this.selectedBomId;
    infoDto.mpn = this.wiringHarnessForm.controls['mpn'].value;
    infoDto.partQty = this.wiringHarnessForm.controls['qty'].value;
    infoDto.currentCost = this.wiringHarnessForm.controls['currentCost'].value;
    infoDto.subCommodity = this.wiringHarnessForm.controls['commodity'].value;
    infoDto.targetCost = this.wiringHarnessForm.controls['targetCost'].value;
    infoDto.unitOfMeasure = this.wiringHarnessForm.controls['unitOfMeasure'].value;
    infoDto.standardOrCustom = this.wiringHarnessForm.controls['standardCustom'].value.toString() || '';
    infoDto.description = this.wiringHarnessForm.controls['description'].value;
    infoDto.annualVolume = this.wiringHarnessForm.controls['annualVolume'].value;
    infoDto.annualSavingOpp = this.wiringHarnessForm.controls['annualSavingOpp'].value;
    infoDto.extendedCost = this.wiringHarnessForm.controls['extendedCost'].value;
    infoDto.savingOpp = this.wiringHarnessForm.controls['savingsOpp'].value;
    infoDto.partMatch = this.wiringHarnessForm.controls['partMatch'].value;
    infoDto.isManuallyCreated = this.selectedBoardComponent?.isManuallyCreated;
    infoDto.isLoadingFromTemplate = false;
    infoDto.categoryName = this.wiringHarnessForm.controls['categoryName'].value;
    infoDto.mfrName = this.wiringHarnessForm.controls['mfrName'].value;
    infoDto.series = this.wiringHarnessForm.controls['series'].value;
    infoDto.packagingType = this.wiringHarnessForm.controls['packagingType'].value;
    infoDto.partStatus = this.wiringHarnessForm.controls['partStatus'].value;
    infoDto.supplierName = this.wiringHarnessForm.controls['supplierName'].value;
    infoDto.lengthInFeet = 0;
    if (this.wiringHarnessForm.controls['currentCost'].dirty) {
      infoDto.rpaCallRequired = false;
    } else {
      infoDto.rpaCallRequired = this.selectedBoardComponent?.rpaCallRequired;
    }
    if (infoDto.bomId > 0) {
      // this._store.dispatch(new BomActions.UpdateBillOfMaterial(this.selectedBomId, this.currentPart?.projectInfoId, this.currentPart.partInfoId, infoDto));
      this.bomInfoSignalsService.updateBillOfMaterial(this.selectedBomId, infoDto, this.currentPart?.projectInfoId, this.currentPart.partInfoId);
      this.dirtyCheckEvent.emit(false);
      setTimeout(() => {
        this.dispatchLoadedComponents();
      }, 1000);
    }
    return new Observable((obs) => {
      obs.next(infoDto);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(undefined);
    this.unsubscribeAll$.complete();
  }

  calculateCost() {
    const targetCost = this.wiringHarnessForm.controls['targetCost'].value;
    const currentCost = this.wiringHarnessForm.controls['currentCost'].value;
    const qty = this.wiringHarnessForm.controls['qty'].value;
    const eav = this.currentPart?.eav;
    const savingsOpp = this._shareService.isValidNumber(Number(targetCost) - Number(currentCost));
    const partAnnualVolume = this._shareService.isValidNumber(eav * qty);
    const annualSavingOpp = this._shareService.isValidNumber(Number(savingsOpp) * Number(partAnnualVolume));
    const currentExtendedCost = this._shareService.isValidNumber(Number(currentCost) * Number(qty));
    if (!this.wiringHarnessForm.controls['annualVolume'].dirty) {
      this.wiringHarnessForm.controls['annualVolume'].setValue(partAnnualVolume);
    }
    if (!this.wiringHarnessForm.controls['extendedCost'].dirty) {
      this.wiringHarnessForm.controls['extendedCost'].setValue(currentExtendedCost);
    }
    if (!this.wiringHarnessForm.controls['savingsOpp'].dirty) {
      this.wiringHarnessForm.controls['savingsOpp'].setValue(savingsOpp);
    }
    if (!this.wiringHarnessForm.controls['annualSavingOpp'].dirty) {
      this.wiringHarnessForm.controls['annualSavingOpp'].setValue(annualSavingOpp);
    }
  }
  applyFilter(event: Event, column: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValues[column] = filterValue.trim().toLowerCase();

    this.filteredBoardComponents = this.boardComponents.filter((item) => {
      let match = true;
      for (const [key, value] of Object.entries(this.filterValues)) {
        if (!value) continue;

        const itemValue = String(item[key] || '').toLowerCase();
        if (!itemValue.includes(value)) {
          match = false;
          break;
        }
      }
      return match;
    });
  }
  public openDeleteMultipleModal(): void {
    this.modalRef = this.modalService.open(DeletePcbBomModalComponent, {
      windowClass: 'fullscreen delete-multiple-modal',
      centered: true,
    });
    this.modalRef.componentInstance.boardComponents = this.boardComponents;
    this.modalRef.componentInstance.bomStatus = this.bomStatus;
    this.modalRef.componentInstance.subCommodityList = this.subCommodityList;
    this.modalRef.componentInstance.standardCustomList = this.standardCustomList;
    this.modalRef.componentInstance.partStatusList = this.partStatusList;
    this.modalRef.result.then((selectedIds) => {
      if (selectedIds) {
        this.boardComponents = this.boardComponents.filter((item) => !selectedIds.includes(item.bomId));
      }
    });
  }

  displayPartMatch = (value: number | null): string => {
    const bomStatusName = this.bomConfig.getBOMStatus()?.find((x) => x.id === value)?.name;
    return value ? bomStatusName : '';
  };

  displayCategoryMatch = (value: number | null): string => {
    const commodityName = this.subCommodityList?.find((x) => x.subCategoryId === value)?.subCategoryName;
    return value ? commodityName : '';
  };

  displayStandardCustomMatch = (value: string | null): string => {
    const typeName = this.standardCustomList?.find((x) => x.name === value)?.name;
    return value ? typeName : '';
  };

  displayPartStatus = (value: number | null): string => {
    const typeName = this.partStatusList?.find((x) => x.id === value)?.name;
    return value ? typeName : '';
  };
}
