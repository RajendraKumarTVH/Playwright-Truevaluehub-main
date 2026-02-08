import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import * as MaterialInfoActions from 'src/app/modules/_actions/material-info.action';
// import * as ProcessInfoActions from 'src/app/modules/_actions/process-info.action';
// import * as PartInfoActions from 'src/app/modules/_actions/part-info.action';
import * as LogisticsSummaryActions from 'src/app/modules/_actions/logistics-summary.action';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { NumberConversionService } from 'src/app/services/number-conversion-service/number-conversion-service';
import { LaborRateMasterDto, MaterialInfoDto, MaterialMarketDataDto, MedbMachinesMasterDto, PartInfoDto, ProcessInfoDto } from 'src/app/shared/models';
import { BlockUiService, BomService, MaterialMasterService, MedbMasterService } from 'src/app/shared/services';
import { PackagingInfoDto } from 'src/app/shared/models/packaging-info.model';
import { SavePackagingInfo } from 'src/app/modules/_actions/packaging-info.action';
import { LogisticsSummaryDto } from 'src/app/shared/models/logistics-summary.model';
import { CostingCompletionPercentageCalculator } from '../../services/costing-completion-percentage-calculator';
import { SharedService } from '../../services/shared.service';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { ScreeName } from '../../costing.config';
// import { ContentObserver } from '@angular/cdk/observers';
import { LaborService } from 'src/app/shared/services/labor.service';
import { SustainabilityMappingService } from 'src/app/shared/mapping/sustainability-mapping.service';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { PartInfoSignalsService } from 'src/app/shared/signals/part-info-signals.service';

@Component({
  selector: 'app-sustainability',
  templateUrl: './sustainability.component.html',
  styleUrls: ['./sustainability.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, MatExpansionModule, MatIconModule, MatTableModule, AutoTooltipDirective],
})
export class SustainabilityComponent implements OnInit, OnChanges {
  fieldColorsLogistcsList: FieldColorsDto[] = [];
  fieldColorsList: FieldColorsDto[] = [];
  materialForm: FormGroup;
  manufacturingInfoform: FormGroup;
  packaginform: FormGroup;
  sustainabilityForm: FormGroup;
  mateForm: FormGroup;
  afterChange = false;
  materialMarketDatas: MaterialMarketDataDto[];
  machineDatas: MedbMachinesMasterDto[];
  @Input() esgImpactCO2Kg: any;
  @Input() part: PartInfoDto;
  @Input() selectedMaterialInfo: MaterialInfoDto;
  @Input() listMaterialInfo: MaterialInfoDto[];
  @Input() processInfoDtoOut: ProcessInfoDto;
  @Input() listProcessInfoDtoOut: ProcessInfoDto[];
  @Input() laborRateInfoDtoOut: LaborRateMasterDto[];
  @Input() packagingInfoDto: PackagingInfoDto;
  @Input() logisticsSummaryDtoOut: LogisticsSummaryDto;
  @Input() bomId: number;

  @Output() formProcessInfoDto = new EventEmitter<ProcessInfoDto>();

  completionPctg: number;
  @Output() completionPercentageChange = new EventEmitter<number>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Output() dirtyMaterialCheckEvent = new EventEmitter<boolean>();
  @Output() dirtyManufacturingCheckEvent = new EventEmitter<boolean>();
  @Output() dirtyPackageCheckEvent = new EventEmitter<boolean>();

  displayedColumns: string[] = ['materialDescription', 'esgImpactCO2Kg', 'esgAnnualVolumeKg', 'esgAnnualKgCO2', 'esgAnnualKgCO2Part'];

  displayedColumnsManufacturing: string[] = ['processType', 'esgImpactElectricityConsumption', 'esgImpactAnnualUsageHrs', 'esgImpactAnnualKgCO2', 'esgImpactAnnualKgCO2Part'];

  totalEsgImpactCO2Kg = 0;
  totalEsgAnnualVolumeKg = 0;
  totalEsgAnnualKgCO2 = 0;
  totalEsgAnnualKgCO2Part = 0;

  totalEsgImpactElectricityConsumption = 0;
  totalEsgImpactAnnualUsageHrs = 0;
  totalEsgImpactAnnualKgCO2 = 0;
  totalEsgImpactAnnualKgCO2Part = 0;

  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private percentageCalculator: CostingCompletionPercentageCalculator;
  constructor(
    private fb: FormBuilder,
    private messageService: MessagingService,
    private blockUiService: BlockUiService,
    private _store: Store,
    public sharedService: SharedService,
    public laborRateService: LaborService,
    private _numberConversionService: NumberConversionService,
    private materialMasterService: MaterialMasterService,
    private medbMasterService: MedbMasterService,
    private bomService: BomService,
    public _processMapper: SustainabilityMappingService,
    private partInfoSignalsService: PartInfoSignalsService
  ) {}

  ngOnInit(): void {
    this.createMaterialForm();
  }
  ngOnChanges(changes: SimpleChanges): void {
    // if (this.materialForm && this.selectedMaterialInfo?.esgImpactCO2Kg) {
    //   this.materialForm.controls["esgImpactCO2Kg"].setValue(this.selectedMaterialInfo.esgImpactCO2Kg);
    //   this.completionPctChng();
    // }
    if (this.materialForm && this.listMaterialInfo?.length > 0 && this.selectedMaterialInfo) {
      this.totalEsgImpactCO2Kg = this.listMaterialInfo.reduce((sum, item) => sum + item.esgImpactCO2Kg, 0);
      this.totalEsgAnnualVolumeKg = this.listMaterialInfo.reduce((sum, item) => sum + item.esgAnnualVolumeKg, 0);
      this.totalEsgAnnualKgCO2 = this.listMaterialInfo.reduce((sum, item) => sum + item.esgAnnualKgCO2, 0);
      this.totalEsgAnnualKgCO2Part = this.listMaterialInfo.reduce((sum, item) => sum + item.esgAnnualKgCO2Part, 0);

      // this.sharedService
      //   .getColorInfos(this.selectedMaterialInfo?.partInfoId, ScreeName.SustainabilityMaterial, this.selectedMaterialInfo?.partInfoId)
      //   .pipe(takeUntil(this.unsubscribe$))
      //   .subscribe((sustainabilityDirtyFields: FieldColorsDto[]) => {
      //     let materialMarketIdsString = this.listMaterialInfo
      //       .map(item => item.materialMarketId)
      //       .join(',');
      //     this.calculateESGCostsMaterial(this.listMaterialInfo, materialMarketIdsString, sustainabilityDirtyFields);
      //   });
    } else {
      if (this.listMaterialInfo?.length === 0) {
        this.listMaterialInfo = [];
        this.totalEsgImpactCO2Kg = 0;
        this.totalEsgAnnualVolumeKg = 0;
        this.totalEsgAnnualKgCO2 = 0;
        this.totalEsgAnnualKgCO2Part = 0;
      }
    }

    if (this.manufacturingInfoform && this.listProcessInfoDtoOut?.length > 0 && this.laborRateInfoDtoOut?.length > 0) {
      this.totalEsgImpactElectricityConsumption = this.listProcessInfoDtoOut.reduce((sum, item) => sum + item.esgImpactElectricityConsumption, 0);
      this.totalEsgImpactAnnualUsageHrs = this.listProcessInfoDtoOut.reduce((sum, item) => sum + item.esgImpactAnnualUsageHrs, 0);
      this.totalEsgImpactAnnualKgCO2 = this.listProcessInfoDtoOut.reduce((sum, item) => sum + item.esgImpactAnnualKgCO2, 0);
      this.totalEsgImpactAnnualKgCO2Part = this.listProcessInfoDtoOut.reduce((sum, item) => sum + item.esgImpactAnnualKgCO2Part, 0);

      // this.sharedService
      //   .getColorInfos(this.processInfoDtoOut?.partInfoId, ScreeName.SustainabilityManufacturing, this.processInfoDtoOut?.partInfoId)
      //   .pipe(takeUntil(this.unsubscribe$))
      //   .subscribe((sustainabilityDirtyFields: FieldColorsDto[]) => {
      //     this.calculateESGCosts(this.listProcessInfoDtoOut, this.laborRateInfoDtoOut, sustainabilityDirtyFields);
      //   });
    } else {
      if (this.listProcessInfoDtoOut?.length === 0) {
        this.listProcessInfoDtoOut = [];
        this.totalEsgImpactElectricityConsumption = 0;
        this.totalEsgImpactAnnualUsageHrs = 0;
        this.totalEsgImpactAnnualKgCO2 = 0;
        this.totalEsgImpactAnnualKgCO2Part = 0;
      }
    }

    if (changes['packagingInfoDto'] && changes['packagingInfoDto'].currentValue?.partInfoId && changes['packagingInfoDto'].currentValue != changes['packagingInfoDto'].previousValue) {
      if (
        changes['packagingInfoDto'].currentValue?.partInfoId != changes['packagingInfoDto'].previousValue?.partInfoId ||
        changes['packagingInfoDto'].currentValue?.boxPerShipment != changes['packagingInfoDto'].previousValue?.boxPerShipment ||
        changes['packagingInfoDto'].currentValue?.palletPerShipment != changes['packagingInfoDto'].previousValue?.palletPerShipment ||
        changes['packagingInfoDto'].currentValue?.partsPerShipment != changes['packagingInfoDto'].previousValue?.partsPerShipment
      ) {
        if (this.packaginform && this.packagingInfoDto && this.packagingInfoDto?.partInfoId && this.packagingInfoDto?.packagingId) {
          this.sharedService
            .getColorInfos(this.packagingInfoDto?.partInfoId, ScreeName.SustainabilityPackaging, this.packagingInfoDto.packagingId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((sustainabilityDirtyFields: FieldColorsDto[]) => {
              this.packagingInfoDto = this.calculateESGCostsPackage(this.packagingInfoDto, sustainabilityDirtyFields);
              this.packaginform.patchValue(this._processMapper.packagingPatch(this.packagingInfoDto));
              this.completionPctChng();
            });
        }
      }
    }

    if (this.sustainabilityForm && !!this.logisticsSummaryDtoOut && this.logisticsSummaryDtoOut?.partInfoId && this.logisticsSummaryDtoOut?.costingLogisticsId) {
      this.sharedService
        .getColorInfos(this.logisticsSummaryDtoOut?.partInfoId, ScreeName.SustainabilityLogistic, this.logisticsSummaryDtoOut.costingLogisticsId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((sustainabilityDirtyFields: FieldColorsDto[]) => {
          this.logisticsSummaryDtoOut = this.calculateESGCostsLogistics(this.logisticsSummaryDtoOut, this.packagingInfoDto, this.part, sustainabilityDirtyFields);
          this.sustainabilityForm.patchValue(this._processMapper.logisticsPatch(this.logisticsSummaryDtoOut));
          this.getColorInfoLogistic();
          this.completionPctChng();
        });
    }

    // if (this.manufacturingInfoform && !!this.processInfoDtoOut) {
    //   this.sharedService
    //     .getColorInfos(this.processInfoDtoOut?.partInfoId, ScreeName.SustainabilityManufacturing, this.processInfoDtoOut.processInfoId)
    //     .pipe(takeUntil(this.unsubscribe$))
    //     .subscribe((sustainabilityDirtyFields: FieldColorsDto[]) => {
    //       this.laborRateService.getLaborRatesByCountry(this.processInfoDtoOut.mfrCountryId)
    //         .pipe(takeUntil(this.unsubscribe$)).subscribe((laborRateDto: any) => {
    //           if (laborRateDto) {
    //             this.processInfoDtoOut = this.calculateESGCosts(this.processInfoDtoOut, sustainabilityDirtyFields, laborRateDto);
    //             if (this.manufacturingInfoform && this.processInfoDtoOut?.esgImpactElectricityConsumption) {
    //               this.manufacturingInfoform.controls["esgImpactElectricityConsumption"].setValue(this.processInfoDtoOut.esgImpactElectricityConsumption);
    //             }
    //           }
    //         });
    //       this.completionPctChng();
    //     });
    // }
  }

  public calculateESGCostsLogistics(logistic: LogisticsSummaryDto, packagingInfo: PackagingInfoDto, currentPart: PartInfoDto, sustainabilityDirtyFields: any) {
    let partsPerShipment = 0;
    if (packagingInfo?.partsPerShipment) {
      partsPerShipment = Number(packagingInfo.partsPerShipment);
    } else {
      partsPerShipment = this.sharedService.isValidNumber((currentPart?.eav / Number(currentPart?.deliveryFrequency)) * 365);
    }
    if (logistic?.isTotalCarbonFootPrintDirty && logistic?.totalCarbonFootPrint != null) {
      logistic.totalCarbonFootPrint = Number(logistic.totalCarbonFootPrint);
    } else {
      let totalCarbonFootPrint = logistic?.totalCarbonFootPrint;
      if (logistic?.totalCarbonFootPrint != null) {
        totalCarbonFootPrint = this.checkDirtyProperty('TotalCarbonFootPrint', sustainabilityDirtyFields) ? logistic?.totalCarbonFootPrint : totalCarbonFootPrint;
      }
      logistic.totalCarbonFootPrint = totalCarbonFootPrint;
    }
    if (logistic?.isCarbonFootPrintDirty && logistic?.carbonFootPrint != null) {
      logistic.carbonFootPrint = Number(logistic.carbonFootPrint);
    } else {
      let carbonFootPrint = this.sharedService.isValidNumber(Number(logistic.totalCarbonFootPrint) * (Number(logistic.containerPercent) / 100));
      if (logistic?.carbonFootPrint != null) {
        carbonFootPrint = this.checkDirtyProperty('CarbonFootPrint', sustainabilityDirtyFields) ? logistic?.carbonFootPrint : carbonFootPrint;
      }
      logistic.carbonFootPrint = carbonFootPrint;
    }

    if (logistic?.isCarbonFootPrintPerUnitDirty && logistic?.carbonFootPrintPerUnit != null) {
      logistic.carbonFootPrintPerUnit = Number(logistic.carbonFootPrintPerUnit);
    } else {
      let carbonFootPrintPerUnit = this.sharedService.isValidNumber(Number(logistic.carbonFootPrint) / partsPerShipment);
      if (logistic?.carbonFootPrintPerUnit != null) {
        carbonFootPrintPerUnit = this.checkDirtyProperty('CarbonFootPrintPerUnit', sustainabilityDirtyFields) ? logistic?.carbonFootPrintPerUnit : carbonFootPrintPerUnit;
      }
      logistic.carbonFootPrintPerUnit = carbonFootPrintPerUnit;
    }
    return logistic;
  }
  public calculateESGCostsPackage(packagingInfo: PackagingInfoDto, fieldColorsList: any) {
    if (packagingInfo.esgImpactperBoxDirty && packagingInfo.esgImpactperBox != null) {
      packagingInfo.esgImpactperBox = Number(packagingInfo.esgImpactperBox);
    } else {
      let esgImpactperBox = 0.082; //this.sharedService.isValidNumber(packagingInfo?.corrugatedBoxList?.find((x) => x.materialMasterId == packagingInfo.corrugatedBox)?.esgImpactCO2Kg || 0);
      if (packagingInfo.esgImpactperBox != null) {
        esgImpactperBox = this.sharedService.checkDirtyProperty('esgImpactperBox', fieldColorsList) ? packagingInfo?.esgImpactperBox : esgImpactperBox;
      }
      packagingInfo.esgImpactperBox = esgImpactperBox;
    }

    if (packagingInfo.esgImpactperPalletDirty && packagingInfo.esgImpactperPallet != null) {
      packagingInfo.esgImpactperPallet = Number(packagingInfo.esgImpactperPallet);
    } else {
      let esgImpactperPallet = 0.805; //this.sharedService.isValidNumber(packagingInfo?.palletList?.find((x) => x.materialMasterId == packagingInfo.pallet)?.esgImpactCO2Kg || 0);
      if (packagingInfo.esgImpactperPallet != null) {
        esgImpactperPallet = this.sharedService.checkDirtyProperty('esgImpactperPallet', fieldColorsList) ? packagingInfo?.esgImpactperPallet : esgImpactperPallet;
      }
      packagingInfo.esgImpactperPallet = esgImpactperPallet;
    }

    if (packagingInfo.totalESGImpactperPartDirty && packagingInfo.totalESGImpactperPart != null) {
      packagingInfo.totalESGImpactperPart = Number(packagingInfo.totalESGImpactperPart);
    } else {
      let totalESGImpactperPart = this.sharedService.isValidNumber(
        (Number(packagingInfo.esgImpactperBox) * Number(packagingInfo.boxPerShipment) + Number(packagingInfo.esgImpactperPallet) * Number(packagingInfo.palletPerShipment)) /
          Number(packagingInfo.partsPerShipment)
      );
      if (packagingInfo.totalESGImpactperPart != null) {
        totalESGImpactperPart = this.sharedService.checkDirtyProperty('totalESGImpactperPart', fieldColorsList) ? packagingInfo?.totalESGImpactperPart : totalESGImpactperPart;
      }
      packagingInfo.totalESGImpactperPart = totalESGImpactperPart;
    }

    // if (packagingInfo.totalPackagCostPerShipmentDirty && packagingInfo.totalPackagCostPerShipment != null) {
    //   packagingInfo.totalPackagCostPerShipment = Number(packagingInfo.totalPackagCostPerShipment);
    // } else {
    //   packagingInfo.totalPackagCostPerShipment = this.sharedService.checkDirtyProperty('totalPackagCostPerShipment', fieldColorsList) ? packagingInfo?.totalPackagCostPerShipment : packagingInfo.totalPackagCostPerShipment;
    // }

    return packagingInfo;
  }

  public calculateESGCostsMaterial(listMaterialInfo: MaterialInfoDto[], materialMarketIdsString: string, fieldColorsList: any) {
    let totalImpact: number = 0;
    if (listMaterialInfo?.length > 0 && listMaterialInfo[0]?.materialMarketId > 0) {
      if (this.part?.ismaterialEsgDirty && this.part?.materialEsg != null) {
        totalImpact = Number(this.part?.materialEsg);
        this.materialForm.controls['esgImpactCO2Kg'].setValue(totalImpact);
        this.completionPctChng();
      } else {
        this.materialMasterService
          .getMaterialMarketDataListByMaterialMarketIds(materialMarketIdsString)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((materialMarketData: MaterialMarketDataDto[]) => {
            totalImpact = listMaterialInfo?.reduce((sum, materialInfo) => {
              const marketData = materialMarketData?.find((m) => m.materialMarketId === materialInfo.materialMarketId);
              if (marketData) {
                const impact = (marketData.esgImpactCO2Kg * materialInfo.netWeight) / 1000;
                return sum + impact;
              }
              return sum;
            }, 0);
            this.materialMarketDatas = materialMarketData;
            totalImpact = this.sharedService.isValidNumber(totalImpact);
            if (this.part?.materialEsg != null) {
              totalImpact = this.checkDirtyProperty('esgImpactCO2Kg', fieldColorsList) ? this.part?.materialEsg : totalImpact;
            }
            this.materialForm.controls['esgImpactCO2Kg'].setValue(totalImpact);
            this.completionPctChng();
          });
      }
    }
  }

  // public calculateESGCosts(manufactureInfo: ProcessInfoDto, fieldColorsList: any, laborRateDto: LaborRateMasterDto[]) {
  //   manufactureInfo.totalElectricityConsumption = this.sharedService.isValidNumber((manufactureInfo.cycleTime * manufactureInfo?.machineMaster?.ratedPower) / 3600);
  //   if (manufactureInfo.isesgImpactElectricityConsumptionDirty && manufactureInfo.esgImpactElectricityConsumption != null) {
  //     manufactureInfo.esgImpactElectricityConsumption = Number(manufactureInfo.esgImpactElectricityConsumption);
  //   } else {
  //     let esgImpactElectricityConsumption = 0;
  //     if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
  //       let country = manufactureInfo.countryList.find(x => x.countryId == manufactureInfo.mfrCountryId);
  //       if (country) {
  //         esgImpactElectricityConsumption = this.sharedService.isValidNumber((manufactureInfo.totalElectricityConsumption * Number(laborRateDto?.length > 0 ? laborRateDto[0].powerESG : 0)));
  //         if (manufactureInfo.esgImpactElectricityConsumption != null) {
  //           esgImpactElectricityConsumption = this.checkDirtyProperty('esgImpactElectricityConsumption', fieldColorsList) ? manufactureInfo?.esgImpactElectricityConsumption : esgImpactElectricityConsumption;
  //         }
  //       }
  //     }
  //     manufactureInfo.esgImpactElectricityConsumption = esgImpactElectricityConsumption;
  //   }
  //   manufactureInfo.totalFactorySpaceRequired = this.sharedService.isValidNumber((manufactureInfo?.machineMaster?.maxLength * manufactureInfo?.machineMaster?.maxWidth) / 1000000);
  //   if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
  //     let country = manufactureInfo.countryList.find(x => x.countryId == manufactureInfo.mfrCountryId);
  //     if (country) {
  //       manufactureInfo.esgImpactFactoryImpact = this.sharedService.isValidNumber((manufactureInfo.totalFactorySpaceRequired * Number(laborRateDto?.length > 0 ? laborRateDto[0].factorESG : 0) * manufactureInfo.cycleTime) / 3600);
  //     }
  //   }
  //   return manufactureInfo;
  // }

  public calculateESGCosts(manufactureInfo: ProcessInfoDto[], laborRateDto: LaborRateMasterDto[], fieldColorsList: any) {
    let totalImpact: number = 0;
    if (this.part?.ismanufacturingEsgDirty && this.part?.manufacturingEsg != null) {
      totalImpact = Number(this.part?.manufacturingEsg);
      this.manufacturingInfoform.controls['esgImpactElectricityConsumption'].setValue(totalImpact);
      this.completionPctChng();
    } else {
      const machineMarketIdsString = manufactureInfo.map((item) => item.machineMarketId).join(',');
      if (machineMarketIdsString) {
        this.medbMasterService
          .getMachineDatasByMachineMarketIdsAsync(machineMarketIdsString)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((machineData: MedbMachinesMasterDto[]) => {
            totalImpact = manufactureInfo.reduce((sum, manufactureInfoItem) => {
              const machineFilteredData = machineData?.find((x) => x.machineMarketDtos.find((y) => y.machineMarketID == manufactureInfoItem?.machineMarketId));
              if (machineFilteredData && laborRateDto?.length > 0) {
                const impact = (machineFilteredData.totalPowerKW * laborRateDto[0]?.powerESG * manufactureInfoItem.cycleTime) / 1000;
                return sum + impact;
              }
              return sum;
            }, 0);
            this.machineDatas = machineData;
            totalImpact = this.sharedService.isValidNumber(totalImpact);
            if (this.part?.manufacturingEsg != null) {
              totalImpact = this.checkDirtyProperty('esgImpactElectricityConsumption', fieldColorsList) ? this.part?.manufacturingEsg : totalImpact;
            }
            this.manufacturingInfoform.controls['esgImpactElectricityConsumption'].setValue(totalImpact);
            this.completionPctChng();
          });
      }
    }
  }

  public checkDirtyProperty(formCotrolName: string, fieldList: any[]) {
    let res = false;
    if (fieldList) {
      const info = fieldList.filter((x) => x.formControlName == formCotrolName && x.isDirty == true);
      if (info.length > 0) {
        res = true;
      }
    }
    return res;
  }

  get f() {
    return this.sustainabilityForm?.controls;
  }
  get fmaterial() {
    return this.materialForm?.controls;
  }
  get fmanufacturing() {
    return this.manufacturingInfoform?.controls;
  }
  get fpackaging() {
    return this.packaginform?.controls;
  }
  onFormValueChange() {
    this.dirtyCheckEvent.emit(true);
    this.completionPctChng();
  }
  onMaterialFormValueChange() {
    this.dirtyMaterialCheckEvent.emit(true);
    this.completionPctChng();
  }

  onPackageFormValueChange() {
    this.dirtyPackageCheckEvent.emit(true);
    this.completionPctChng();
  }
  onManufacturingInfoChange() {
    this.dirtyManufacturingCheckEvent.emit(true);
    this.completionPctChng();
  }

  private createMaterialForm() {
    this.materialForm = this.fb.group({
      esgImpactCO2Kg: [0],
    });
    this.manufacturingInfoform = this.fb.group({
      esgImpactElectricityConsumption: [0],
    });
    this.packaginform = this.fb.group({
      esgImpactperBox: [0],
      esgImpactperPallet: [0],
      totalESGImpactperPart: [0],
    });

    this.sustainabilityForm = this.fb.group({
      TotalCarbonFootPrint: [0],
      CarbonFootPrint: [0],
      CarbonFootPrintPerUnit: [0],
    });
  }

  private completionPctChng() {
    const value = this.sustainablityCount();
    this.completionPercentageChange.emit(value);
    this.completionPctg = value;
  }

  private getColorInfoMaterial() {
    this.fieldColorsList = [];
    if (this.selectedMaterialInfo) {
      this.sharedService
        .getColorInfos(this.selectedMaterialInfo.partInfoId, ScreeName.SustainabilityMaterial, this.selectedMaterialInfo.materialInfoId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: FieldColorsDto[]) => {
          if (result) {
            this.fieldColorsList = result;
          }

          result?.forEach((element) => {
            if (element.isTouched) {
              this.materialForm.get(element.formControlName)?.markAsTouched();
              this.materialForm.get(element.formControlName)?.markAsTouched();
              this.materialForm.get(element.formControlName)?.markAsTouched();
            }
            if (element.isDirty) {
              this.materialForm.get(element.formControlName)?.markAsDirty();
              this.materialForm.get(element.formControlName)?.markAsDirty();
              this.materialForm.get(element.formControlName)?.markAsDirty();
            }
          });
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  private getColorInfoManufacturing() {
    this.fieldColorsList = [];
    if (this.processInfoDtoOut) {
      this.sharedService
        .getColorInfos(this.processInfoDtoOut.partInfoId, ScreeName.SustainabilityManufacturing, this.processInfoDtoOut.projectInfoId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: FieldColorsDto[]) => {
          if (result) {
            this.fieldColorsList = result;
          }

          result?.forEach((element) => {
            if (element.isTouched) {
              this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
              this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
              this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
            }
            if (element.isDirty) {
              this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
              this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
              this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
            }
          });
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  private getColorInfoPackaging() {
    this.fieldColorsList = [];
    if (this.packagingInfoDto && this.packagingInfoDto?.partInfoId && this.packagingInfoDto?.packagingId) {
      this.sharedService
        .getColorInfos(this.packagingInfoDto.partInfoId, ScreeName.SustainabilityPackaging, this.packagingInfoDto.packagingId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: FieldColorsDto[]) => {
          if (result) {
            this.fieldColorsList = result;
          }

          result?.forEach((element) => {
            if (element.isTouched) {
              this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
              this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
              this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
            }
            if (element.isDirty) {
              this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
              this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
              this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
            }
          });
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  private getColorInfoLogistic() {
    this.fieldColorsLogistcsList = [];
    if (!!this.processInfoDtoOut && !!this.logisticsSummaryDtoOut && this.logisticsSummaryDtoOut?.partInfoId && this.logisticsSummaryDtoOut?.costingLogisticsId) {
      this.sharedService
        .getColorInfos(this.logisticsSummaryDtoOut.partInfoId, ScreeName.SustainabilityLogistic, this.logisticsSummaryDtoOut.costingLogisticsId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: FieldColorsDto[]) => {
          if (result) {
            this.fieldColorsLogistcsList = result;
          }

          result?.forEach((element) => {
            if (element.isTouched) {
              this.sustainabilityForm.get(element.formControlName)?.markAsTouched();
              this.sustainabilityForm.get(element.formControlName)?.markAsTouched();
              this.sustainabilityForm.get(element.formControlName)?.markAsTouched();
            }
            if (element.isDirty) {
              this.sustainabilityForm.get(element.formControlName)?.markAsDirty();
              this.sustainabilityForm.get(element.formControlName)?.markAsDirty();
              this.sustainabilityForm.get(element.formControlName)?.markAsDirty();
            }
          });
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  sustainablityCount() {
    let nonEmptyFieldWeightage: number = 0;
    const totalFields = 6;
    // if (this.checkforNonEmpty(this.fmaterial?.esgImpactCO2Kg.value))
    //   nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(this.fpackaging?.esgImpactperBox.value)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(this.fpackaging?.esgImpactperPallet.value)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(this.fpackaging?.totalESGImpactperPart.value)) nonEmptyFieldWeightage += 1;
    // if (this.checkforNonEmpty(this.fmanufacturing?.esgImpactElectricityConsumption.value))
    //   nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(this.f?.TotalCarbonFootPrint.value)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(this.f?.CarbonFootPrint.value)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(this.f?.CarbonFootPrintPerUnit.value)) nonEmptyFieldWeightage += 1;

    return this.calculatePercentage(nonEmptyFieldWeightage, totalFields);
  }
  calculatePercentage(nonEmptyWeightage: number, totalFields: number) {
    let percentage: number = 0;
    if (totalFields > 0) {
      percentage = (nonEmptyWeightage / totalFields) * 100;
      percentage = Math.ceil(percentage);
      percentage = percentage > 100 ? 100 : percentage;
    }
    return Math.round(percentage);
  }
  checkforNonEmpty(data: any) {
    let result = false;
    if (data != '' && data != null && data != undefined) result = true;
    return result;
  }
  public onFormSubmit() {
    this.blockUiService.pushBlockUI('save');
    this.logisticsSummaryDtoOut.totalCarbonFootPrint = this.f.TotalCarbonFootPrint.value;
    this.logisticsSummaryDtoOut.carbonFootPrint = this.f.CarbonFootPrint.value;
    this.logisticsSummaryDtoOut.carbonFootPrintPerUnit = this.f.CarbonFootPrintPerUnit.value;
    this._store.dispatch(new LogisticsSummaryActions.SaveSummaryInfo(this.logisticsSummaryDtoOut));
    this.saveColoringInfoLogistics();
    this.afterChange = false;
    this.dirtyCheckEvent.emit(this.afterChange);
    this.blockUiService.popBlockUI('save');
  }

  public onMatrialFormSubmit() {
    this.blockUiService.pushBlockUI('save');
    if (this.fmaterial.esgImpactCO2Kg.dirty) {
      // this.selectedMaterialInfo.esgImpactCO2Kg = this.fmaterial.esgImpactCO2Kg.value;
      this.part.materialEsg = this.fmaterial.esgImpactCO2Kg.value;
      this.part.ismaterialEsgDirty = true;
      // this._store.dispatch(new PartInfoActions.UpdatePartInfo(this.part));
      this.partInfoSignalsService.updatePartInfo(this.part);
      // this._store.dispatch(new MaterialInfoActions.UpdateMaterialInfo(this.selectedMaterialInfo));
      this.saveColoringInfoMaterial();
      this.afterChange = false;
      this.dirtyMaterialCheckEvent.emit(this.afterChange);
    }
    this.blockUiService.popBlockUI('save');
  }
  public onManufacturingFormSubmit() {
    this.blockUiService.pushBlockUI('save');
    if (this.fmanufacturing.esgImpactElectricityConsumption.dirty) {
      // this.processInfoDtoOut.esgImpactElectricityConsumption = this.fmanufacturing.esgImpactElectricityConsumption.value;
      this.part.manufacturingEsg = this.fmanufacturing.esgImpactElectricityConsumption.value;
      this.part.ismanufacturingEsgDirty = true;
      // this._store.dispatch(new PartInfoActions.UpdatePartInfo(this.part));
      this.partInfoSignalsService.updatePartInfo(this.part);
      //this._store.dispatch(new ProcessInfoActions.UpdateProcessInfo(this.processInfoDtoOut));
      this.saveColoringInfoManufacturing();
      this.afterChange = false;
      this.dirtyManufacturingCheckEvent.emit(this.afterChange);
    }
    this.blockUiService.popBlockUI('save');
  }

  public onPackagingFormSubmit() {
    this.blockUiService.pushBlockUI('save');
    if (this.fpackaging.esgImpactperBox.dirty) {
      this.packagingInfoDto.esgImpactperBox = this.fpackaging.esgImpactperBox.value;
      this.packagingInfoDto.esgImpactperBoxDirty = true;
    }
    if (this.fpackaging.esgImpactperPallet.dirty) {
      this.packagingInfoDto.esgImpactperPallet = this.fpackaging.esgImpactperPallet.value;
      this.packagingInfoDto.esgImpactperPalletDirty = true;
    }
    if (this.fpackaging.totalESGImpactperPart.dirty) {
      this.packagingInfoDto.totalESGImpactperPart = this.fpackaging.totalESGImpactperPart.value;
      this.packagingInfoDto.totalESGImpactperPartDirty = true;
    }
    delete this.packagingInfoDto.calcultionadnlProtectPkgs;
    this.packagingInfoDto.isFromSustainability = true;
    const payload = { ...this.packagingInfoDto };
    console.log('SavePackagingInfo', payload);
    this.saveColoringPackaging();
    this._store.dispatch(new SavePackagingInfo(payload));
    this.afterChange = false;
    this.dirtyPackageCheckEvent.emit(this.afterChange);
    this.blockUiService.popBlockUI('save');
  }
  private saveColoringPackaging() {
    const dirtyItems = [];
    this.fieldColorsList = [];
    for (const el in this.packaginform.controls) {
      if (this.packaginform.controls[el].dirty || this.packaginform.controls[el].touched) {
        const fieldColorsDto = new FieldColorsDto();
        fieldColorsDto.isDirty = this.packaginform.controls[el].dirty;
        fieldColorsDto.formControlName = el;
        fieldColorsDto.isTouched = this.packaginform.controls[el].touched;
        // fieldColorsDto.materialInfoId = this.selectedMaterialInfoId;
        fieldColorsDto.partInfoId = this.packagingInfoDto?.partInfoId;
        fieldColorsDto.screenId = ScreeName.SustainabilityPackaging;
        fieldColorsDto.primaryId = this.packagingInfoDto.packagingId;
        dirtyItems.push(fieldColorsDto);
      }
    }
    if (dirtyItems.length > 0) {
      this.blockUiService.pushBlockUI('saveColor');
      this.sharedService
        .updateColorInfo(dirtyItems)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          this.blockUiService.popBlockUI('saveColor');
          if (result) {
            this.fieldColorsList = result;
            result.forEach((element) => {
              if (element.isTouched) {
                this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
                this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
                this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
              }
              if (element.isDirty) {
                this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
                this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
                this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
              }
            });
          }
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  private saveColoringInfoManufacturing() {
    const dirtyItems = [];
    this.fieldColorsList = [];
    for (const el in this.manufacturingInfoform.controls) {
      if (this.manufacturingInfoform.controls[el].dirty || this.manufacturingInfoform.controls[el].touched) {
        const fieldColorsDto = new FieldColorsDto();
        fieldColorsDto.isDirty = this.manufacturingInfoform.controls[el].dirty;
        fieldColorsDto.formControlName = el;
        fieldColorsDto.isTouched = this.manufacturingInfoform.controls[el].touched;
        // fieldColorsDto.materialInfoId = this.selectedMaterialInfoId;
        fieldColorsDto.partInfoId = this.processInfoDtoOut?.partInfoId;
        fieldColorsDto.screenId = ScreeName.SustainabilityManufacturing;
        // fieldColorsDto.primaryId = this.processInfoDtoOut.processInfoId;
        fieldColorsDto.primaryId = this.processInfoDtoOut?.partInfoId;
        dirtyItems.push(fieldColorsDto);
      }
    }
    if (dirtyItems.length > 0) {
      this.blockUiService.pushBlockUI('saveColor');
      this.sharedService
        .updateColorInfo(dirtyItems)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          this.blockUiService.popBlockUI('saveColor');
          if (result) {
            this.fieldColorsList = result;
            result.forEach((element) => {
              if (element.isTouched) {
                this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
              }
              if (element.isDirty) {
                this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
              }
            });
          }
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  private saveColoringInfoMaterial() {
    const dirtyItems = [];
    this.fieldColorsList = [];
    for (const el in this.materialForm.controls) {
      if (this.materialForm.controls[el].dirty || this.materialForm.controls[el].touched) {
        const fieldColorsDto = new FieldColorsDto();
        fieldColorsDto.isDirty = this.materialForm.controls[el].dirty;
        fieldColorsDto.formControlName = el;
        fieldColorsDto.isTouched = this.materialForm.controls[el].touched;
        // fieldColorsDto.materialInfoId = this.selectedMaterialInfoId;
        fieldColorsDto.partInfoId = this.selectedMaterialInfo?.partInfoId;
        fieldColorsDto.screenId = ScreeName.SustainabilityMaterial;
        // fieldColorsDto.primaryId = this.processInfoDtoOut.processInfoId;
        fieldColorsDto.primaryId = this.selectedMaterialInfo?.partInfoId;
        dirtyItems.push(fieldColorsDto);
      }
    }
    if (dirtyItems.length > 0) {
      this.blockUiService.pushBlockUI('saveColor');
      this.sharedService
        .updateColorInfo(dirtyItems)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          this.blockUiService.popBlockUI('saveColor');
          if (result) {
            this.fieldColorsList = result;
            result.forEach((element) => {
              if (element.isTouched) {
                this.materialForm.get(element.formControlName)?.markAsTouched();
              }
              if (element.isDirty) {
                this.materialForm.get(element.formControlName)?.markAsDirty();
              }
            });
          }
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  private saveColoringInfoLogistics() {
    if (this.logisticsSummaryDtoOut.costingLogisticsId === null || this.logisticsSummaryDtoOut.partInfoId === null) {
      return;
    }
    const dirtyItems = [];
    this.fieldColorsList = [];
    for (const el in this.sustainabilityForm.controls) {
      if (this.sustainabilityForm.controls[el].dirty || this.sustainabilityForm.controls[el].touched) {
        const fieldColorsDto = new FieldColorsDto();
        fieldColorsDto.isDirty = this.sustainabilityForm.controls[el].dirty;
        fieldColorsDto.formControlName = el;
        fieldColorsDto.isTouched = this.sustainabilityForm.controls[el].touched;
        // fieldColorsDto.materialInfoId = this.selectedMaterialInfoId;
        fieldColorsDto.partInfoId = this.logisticsSummaryDtoOut?.partInfoId;
        fieldColorsDto.screenId = ScreeName.SustainabilityLogistic;
        fieldColorsDto.primaryId = this.logisticsSummaryDtoOut.costingLogisticsId;
        dirtyItems.push(fieldColorsDto);
      }
    }

    console.log('saveColoringInfoLogistics:', dirtyItems);
    if (dirtyItems.length > 0) {
      this.blockUiService.pushBlockUI('saveColor');
      this.sharedService
        .updateColorInfo(dirtyItems)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          this.blockUiService.popBlockUI('saveColor');
          if (result) {
            this.fieldColorsList = result;
            result.forEach((element) => {
              if (element.isTouched) {
                this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
                this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
                this.manufacturingInfoform.get(element.formControlName)?.markAsTouched();
              }
              if (element.isDirty) {
                this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
                this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
                this.manufacturingInfoform.get(element.formControlName)?.markAsDirty();
              }
            });
          }
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  public calculateESGCostsMaterialForSustainability(materialInfo: MaterialInfoDto, fieldColorsList: any) {
    if (materialInfo.isEsgImpactCO2KgDirty && materialInfo.esgImpactCO2Kg != null) {
      materialInfo.esgImpactCO2Kg = Number(materialInfo.esgImpactCO2Kg);
    } else {
      let totalImpact: number = 0;
      totalImpact = this.listMaterialInfo?.reduce((sum, materialInfo) => {
        const marketData = this.materialMarketDatas?.find((m) => m.materialMarketId === materialInfo.materialMarketId);
        if (marketData) {
          const impact = (marketData.esgImpactCO2Kg * materialInfo.netWeight) / 1000;
          return sum + impact;
        }
        return sum;
      }, 0);
      totalImpact = this.sharedService.isValidNumber(totalImpact);
      if (materialInfo.esgImpactCO2Kg != null) {
        totalImpact = this.sharedService.checkDirtyProperty('esgImpactCO2Kg', fieldColorsList) ? materialInfo.esgImpactCO2Kg : totalImpact;
      }
      materialInfo.esgImpactCO2Kg = totalImpact;
    }
    this.materialForm.controls['esgImpactCO2Kg'].setValue(materialInfo.esgImpactCO2Kg);
  }

  public calculateESGCostsForSustainability(manufactureInfo: ProcessInfoDto, laborRateDto: LaborRateMasterDto[], fieldColorsList: any) {
    if (manufactureInfo.isesgImpactElectricityConsumptionDirty && manufactureInfo.esgImpactElectricityConsumption != null) {
      manufactureInfo.esgImpactElectricityConsumption = Number(manufactureInfo.esgImpactElectricityConsumption);
    } else {
      let totalImpact: number = 0;
      totalImpact = this.listProcessInfoDtoOut?.reduce((sum, manufactureInfoItem) => {
        const machineFilteredData = this.machineDatas?.find((x) => x.machineMarketDtos.find((y) => y.machineMarketID == manufactureInfoItem?.machineMarketId));
        if (machineFilteredData && laborRateDto?.length > 0) {
          const impact = (machineFilteredData.totalPowerKW * laborRateDto[0]?.powerESG * manufactureInfoItem.cycleTime) / 1000;
          return sum + impact;
        }
        return sum;
      }, 0);
      totalImpact = this.sharedService.isValidNumber(totalImpact);
      if (manufactureInfo.esgImpactElectricityConsumption != null) {
        totalImpact = this.sharedService.checkDirtyProperty('esgImpactElectricityConsumption', fieldColorsList) ? manufactureInfo.esgImpactElectricityConsumption : totalImpact;
      }
      manufactureInfo.esgImpactElectricityConsumption = totalImpact;
    }
    this.manufacturingInfoform.controls['esgImpactElectricityConsumption'].setValue(manufactureInfo.esgImpactElectricityConsumption);
  }

  public calculateSustainability() {
    const materialInfo = new MaterialInfoDto();
    this._processMapper.materialCheck(materialInfo, this.materialForm.controls);
    this.calculateESGCostsMaterialForSustainability(materialInfo, this.fieldColorsList);
    this.completionPctChng();

    const manufactureInfo = new ProcessInfoDto();
    this._processMapper.manufacturingCheck(manufactureInfo, this.manufacturingInfoform.controls);
    this.calculateESGCostsForSustainability(manufactureInfo, this.laborRateInfoDtoOut, this.fieldColorsList);
    this.completionPctChng();

    const packagingInfo = new PackagingInfoDto();
    packagingInfo.boxPerShipment = this.packagingInfoDto.boxPerShipment;
    packagingInfo.partsPerShipment = this.packagingInfoDto.partsPerShipment;
    packagingInfo.palletPerShipment = this.packagingInfoDto.palletPerShipment;
    this._processMapper.packagingCheck(packagingInfo, this.packaginform.controls);
    this.calculateESGCostsPackage(packagingInfo, this.fieldColorsList);
    this.packaginform.patchValue(this._processMapper.packagingPatch(packagingInfo));
    this.completionPctChng();

    const logisticInfo = new LogisticsSummaryDto();
    logisticInfo.containerPercent = this.logisticsSummaryDtoOut.containerPercent;
    this._processMapper.logisticsCheck(logisticInfo, this.sustainabilityForm.controls);
    if (logisticInfo.totalCarbonFootPrint == null) {
      logisticInfo.totalCarbonFootPrint = this.logisticsSummaryDtoOut.totalCarbonFootPrint;
    }
    this.calculateESGCostsLogistics(logisticInfo, this.packagingInfoDto, this.part, this.fieldColorsList);
    this.sustainabilityForm.patchValue(this._processMapper.logisticsPatch(logisticInfo));
    this.completionPctChng();
  }
}
