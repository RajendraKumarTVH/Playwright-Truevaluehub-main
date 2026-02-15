
// Playwright-compatible imports - using test models instead of Angular models
import { ContainerSize } from '../models/container-size.model';
import { MaterialInfoDto, PartInfoDto, BuLocationDto } from '../models';
import { FreightCostCalcResponseDto } from '../models/freight-cost-response';
import { ManualFreightCostRequestDto } from '../models/freight-cost-request';
import { ContainerTypeEnum, LogisticsSummaryDto, ModeOfTransportEnum, ShipmentTypeEnum } from '../models/logistics-summary.model';
import { PackagingInfoDto } from '../models/packaging-info.model';
import { FieldColorsDto } from '../models/field-colors.model';
import { min } from 'lodash';
import { SharedService } from './shared';
import { DigitalFactoryDtoNew } from '../../src/app/modules/digital-factory/Models/digital-factory-dto';

// RxJS types (implementations are mocked in plastic-rubber-logic.ts)
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

// Type definitions for services (actual implementations are mocked)
export interface NumberConversionService {
  transformNumberTwoDecimal(value: number): number;
}

export interface LogisticsSummaryService {
  getOfflineFreightCost(dto: ManualFreightCostRequestDto): Observable<any>;
}


export class LogisticsSummaryCalculatorService {
  constructor(
    private _numberConversionService: NumberConversionService,
    private logisticsSummaryService: LogisticsSummaryService,
    private sharedService: SharedService
  ) { }

  public getPercentageOfContainerRequired(
    modeOfTransportId: number,
    containerTypeId: number,
    shipmentTypeId: number,
    containerSize: ContainerSize[],
    part: PartInfoDto,
    materialList: MaterialInfoDto[],
    packagingInfo: PackagingInfoDto
  ): any {
    const currentContainer = containerSize.find((x) => x.modeOfTransportId == Number(modeOfTransportId) && x.containerTypeId == Number(containerTypeId) && x.shipmentTypeId == Number(shipmentTypeId));
    let maxVolumePerContainer = 0;
    let maxWeightPerContainer = 0;
    let totalShipmentWeight = 0;
    let totalShipmentVolume = 0;
    let partsPerShipment = 0;
    let maxShipmentVolumePerContainer = 0;
    let maxShipmentWeightPerContainer = 0;
    let shipmentPerContainer = 0;
    let percentageOfShipment = 0;
    if (currentContainer) {
      maxVolumePerContainer = currentContainer.maxVolume;
      maxWeightPerContainer = currentContainer.maxWeight;
    }

    if (packagingInfo?.partsPerShipment) {
      partsPerShipment = packagingInfo.partsPerShipment;
    } else {
      partsPerShipment = Math.floor((part.eav * part.deliveryFrequency) / 365);
    }

    if (materialList) {
      for (let i = 0; i < materialList.length; i++) {
        const material = materialList[i];
        if (material && material?.netWeight) {
          totalShipmentWeight += partsPerShipment * material?.netWeight;
        }
      }
    }

    if (Array.isArray(packagingInfo?.adnlProtectPkgs)) {
      packagingInfo.adnlProtectPkgs.forEach((pkg) => {
        if (pkg.packagingTypeId === 3) {
          const { lengthInMm, widthInMm, heightInMm, qtyNeededPerShipment } = pkg;

          if (lengthInMm && widthInMm && heightInMm && qtyNeededPerShipment) {
            totalShipmentVolume += (lengthInMm * widthInMm * heightInMm * qtyNeededPerShipment) / 1000;
          }
        }
      });
    }

    if (maxVolumePerContainer > 0 && totalShipmentVolume) {
      maxShipmentVolumePerContainer = (maxVolumePerContainer * 0.8) / totalShipmentVolume;
    }
    if (maxWeightPerContainer > 0 && totalShipmentWeight) {
      maxShipmentWeightPerContainer = maxWeightPerContainer / totalShipmentWeight;
    }

    shipmentPerContainer = min([maxShipmentWeightPerContainer, maxShipmentVolumePerContainer]);
    if (shipmentPerContainer > 0) {
      percentageOfShipment = Number((1 / shipmentPerContainer) * 100);
    }
    return {
      percentageOfShipment: percentageOfShipment,
      partsPerShipment: partsPerShipment,
    };
  }

  public partPerShipment(part: PartInfoDto, packagingInfo: PackagingInfoDto) {
    if (packagingInfo?.partsPerShipment) {
      const partsPerShipment = packagingInfo.partsPerShipment;
      return partsPerShipment;
    } else {
      const partsPerShipment = Math.floor((part.eav / part.deliveryFrequency) * 365);
      return partsPerShipment;
    }
  }

  public perUnitCost(shipmentCost: number, partsPerShipment: number) {
    const perUnitCost = this._numberConversionService.transformNumberTwoDecimal(shipmentCost / partsPerShipment);
    return perUnitCost;
  }

  public carbonFootPrint(totalCarbonFootPrint: number, containerPercent: number) {
    const carbonFootPrint = Math.round(totalCarbonFootPrint * (containerPercent / 100));
    return carbonFootPrint;
  }

  public perUnitesg(shipmentEsg: number, partsPerShipment: number) {
    const perUnitesg = this._numberConversionService.transformNumberTwoDecimal(shipmentEsg / partsPerShipment);
    return perUnitesg;
  }

  public getWeightAndVolume(materialList: MaterialInfoDto[], part: PartInfoDto, packagingInfo: PackagingInfoDto) {
    let weightPerShipment = 0;
    let volumePerShipment = 0;
    if (materialList?.length > 0) {
      for (let i = 0; i < materialList.length; i++) {
        const material = materialList[i];
        const partsPerShipment = this.partPerShipment(part, packagingInfo);
        if (material?.netWeight && partsPerShipment) {
          weightPerShipment +=
            partsPerShipment *
            //Convert gms to kg
            (Number(material?.netWeight) / 1000);
        }
        const volume = Number(material?.dimX) * Number(material?.dimY) * Number(material?.dimZ) * 0.000000001; //convert cubic mm to cubic m

        volumePerShipment += volume;
      }
    }
    return {
      weight: weightPerShipment,
      volume: volumePerShipment,
    };
  }

  getCostCalculation(
    modeOfTransportTypeId: number,
    containerTypeId: number,
    shipmentTypeId: number,
    currentVendor: DigitalFactoryDtoNew,
    currentBuLocation: BuLocationDto,
    containerSize: ContainerSize[],
    part: PartInfoDto,
    materialList: MaterialInfoDto[],
    originCountryId: number,
    packagingInfo: PackagingInfoDto
  ) {
    const dto = new ManualFreightCostRequestDto();
    dto.modeOfTransportTypeId = modeOfTransportTypeId;
    if (dto.modeOfTransportTypeId == ModeOfTransportEnum.Surface) {
      dto.landShipmentTypeId = shipmentTypeId;
      dto.landContainerTypeId = containerTypeId;
    } else if (dto.modeOfTransportTypeId == ModeOfTransportEnum.Air) {
      dto.landShipmentTypeId = ShipmentTypeEnum.FTL;
      dto.landContainerTypeId = ContainerTypeEnum.Container20Ft;
      dto.airShipmentTypeId = shipmentTypeId;
      dto.airContainerTypeId = containerTypeId;
    } else if (dto.modeOfTransportTypeId == ModeOfTransportEnum.Ocean) {
      dto.oceanShipmentTypeId = shipmentTypeId;
      dto.oceanContainerTypeId = containerTypeId;

      dto.landShipmentTypeId = dto.oceanShipmentTypeId == ShipmentTypeEnum.FCL ? ShipmentTypeEnum.FTL : ShipmentTypeEnum.LTL;
      dto.landContainerTypeId =
        dto.oceanContainerTypeId == ContainerTypeEnum.Container20Ft
          ? ContainerTypeEnum.Container20Ft
          : dto.oceanContainerTypeId == ContainerTypeEnum.Container40Ft
            ? ContainerTypeEnum.Container40Ft
            : ContainerTypeEnum.LTL;
    }

    dto.originCountryId = originCountryId;
    dto.destinationCountryId = part.deliveryCountryId;

    dto.originCity = currentVendor?.supplierDirectoryMasterDto?.city ?? '';
    dto.destinationCity = currentBuLocation?.city ?? '';
    dto.annualShipment = 1;
    dto.part = part;
    dto.incoTerm = 'EXW';
    if (currentVendor && currentVendor?.supplierDirectoryMasterDto?.latitude && currentVendor?.supplierDirectoryMasterDto?.longitude) {
      dto.sourceCoordinates = currentVendor.supplierDirectoryMasterDto.latitude.toString() + ',' + currentVendor.supplierDirectoryMasterDto.longitude.toString();
    } else {
      dto.sourceCoordinates = '';
    }
    if (currentBuLocation?.latitude && currentBuLocation?.longitude) {
      dto.destinationCoordinates = currentBuLocation.latitude.toString() + ',' + currentBuLocation.longitude.toString();
    } else {
      dto.destinationCoordinates = '';
    }

    const weightVolume = this.getWeightAndVolume(materialList, part, packagingInfo);
    // dto.weightPerShipment = weightVolume.weight;
    const rawWeight = weightVolume.weight;
    dto.weightPerShipment = !isFinite(rawWeight) || rawWeight == null ? 0 : rawWeight;
    dto.volumePerShipment = weightVolume.volume;

    const containerInfo = this.getPercentageOfContainerRequired(modeOfTransportTypeId, containerTypeId, shipmentTypeId, containerSize, part, materialList, packagingInfo);
    dto.annualShipment = 1;

    containerInfo.percentageOfShipment = this.sharedService.isValidNumber(containerInfo.percentageOfShipment);

    if (currentVendor == undefined || currentBuLocation == undefined || !dto.destinationCoordinates || !dto.originCity || !dto.destinationCity || !dto.modeOfTransportTypeId) {
      const freightCost = new FreightCostCalcResponseDto();

      freightCost.containerTypeId = containerTypeId;
      freightCost.shipmentTypeId = shipmentTypeId;
      freightCost.modeOfTransportId = modeOfTransportTypeId;

      const pershipmentCost = 0;
      freightCost.freightCostPerShipment = this.sharedService.isValidNumber(pershipmentCost);

      const partCost = pershipmentCost / containerInfo.partsPerShipment;
      freightCost.freightCostPerPart = this.sharedService.isValidNumber(partCost);

      freightCost.percentageOfShipment = this.sharedService.isValidNumber(containerInfo.percentageOfShipment);
      freightCost.partsPerShipment = this.sharedService.isValidNumber(containerInfo.partsPerShipment);
      freightCost.containerCost = this.sharedService.isValidNumber(containerInfo.totalAnnualCost);
      return of(freightCost);
    }

    return this.logisticsSummaryService.getOfflineFreightCost(dto).pipe(
      map((result: any) => {
        if (result) {
          const freightCost = Object.assign({}, result);
          if (freightCost?.sourceToPortCost) {
            freightCost.sourceToPortCost = this.sharedService.isValidNumber(result.sourceToPortCost);
          }
          if (!freightCost?.deliveryCost) {
            freightCost.deliveryCost = this.sharedService.isValidNumber(result.portToDestinationCost);
          }
          freightCost.containerCost = this.sharedService.isValidNumber(result.containerCost);

          const pershipmentCost = result.totalAnnualCost * (containerInfo.percentageOfShipment / 100);
          freightCost.freightCostPerShipment = this.sharedService.isValidNumber(pershipmentCost);
          freightCost.freightCostPerPart = this.sharedService.isValidNumber(pershipmentCost / containerInfo.partsPerShipment);
          freightCost.percentageOfShipment = this.sharedService.isValidNumber(containerInfo.percentageOfShipment);
          freightCost.partsPerShipment = this.sharedService.isValidNumber(containerInfo.partsPerShipment);
          freightCost.containerTypeId = containerTypeId;
          freightCost.shipmentTypeId = shipmentTypeId;
          freightCost.modeOfTransportId = modeOfTransportTypeId;
          return freightCost;
        }
        return null;
      })
    );
  }

  calculateLogisticsCost(logistic: LogisticsSummaryDto, dirtyList: FieldColorsDto[], summaryObj: LogisticsSummaryDto): Observable<LogisticsSummaryDto> {
    if (logistic?.isContainerPercentDirty && logistic?.containerPercent != null) {
      logistic.containerPercent = Number(logistic.containerPercent);
    } else {
      let containerPercent = logistic.containerPercent ?? summaryObj?.containerPercent;
      if (logistic?.containerPercent != null) {
        containerPercent = this.checkDirtyProperty('ContainerPercent', dirtyList) ? summaryObj?.containerPercent : containerPercent;
      }
      logistic.containerPercent = containerPercent;
    }
    if (logistic?.isContainerCostDirty && logistic?.containerCost != null) {
      logistic.containerCost = Number(logistic.containerCost);
    } else {
      let containerCost = logistic?.containerCost ?? summaryObj?.containerCost;
      if (logistic?.containerCost != null) {
        containerCost = this.checkDirtyProperty('ContainerCost', dirtyList) ? summaryObj?.containerCost : containerCost;
      }
      logistic.containerCost = containerCost;
    }
    if (logistic?.isFreightCostPerShipmentDirty && logistic?.freightCostPerShipment != null) {
      logistic.freightCostPerShipment = Number(logistic.freightCostPerShipment);
    } else {
      let freightCostPerShipment =
        logistic?.containerCost == null || logistic?.containerPercent == null
          ? this.sharedService.isValidNumber(Number(summaryObj?.containerCost) * (Number(summaryObj?.containerPercent) / 100))
          : this.sharedService.isValidNumber(Number(logistic.containerCost) * (Number(logistic.containerPercent) / 100));

      if (logistic?.freightCostPerShipment != null) {
        freightCostPerShipment = this.checkDirtyProperty('FreightCostPerShipment', dirtyList) ? summaryObj?.freightCostPerShipment : freightCostPerShipment;
      }
      logistic.freightCostPerShipment = freightCostPerShipment;
    }
    let partsPerShipment = 0;
    if (logistic?.packagingInfo?.partsPerShipment) {
      partsPerShipment = Number(logistic?.packagingInfo.partsPerShipment);
    } else {
      partsPerShipment = this.sharedService.isValidNumber(Math.ceil((Number(logistic?.currentPart?.deliveryFrequency) / 365) * logistic?.currentPart?.eav));
    }

    if (logistic?.isFreightCostDirty && logistic?.freightCost != null) {
      logistic.freightCost = Number(logistic.freightCost);
    } else {
      let freightCost =
        logistic?.freightCostPerShipment == null
          ? this.sharedService.isValidNumber(summaryObj?.freightCostPerShipment / partsPerShipment)
          : this.sharedService.isValidNumber(logistic.freightCostPerShipment / partsPerShipment);

      if (logistic?.freightCost != null) {
        freightCost = this.checkDirtyProperty('FreightCost', dirtyList) ? summaryObj?.freightCost : freightCost;
      }
      logistic.freightCost = freightCost;
    }
    return new Observable((obs) => {
      obs.next(logistic);
    });
  }

  calculateLogisticsCostDirtyCheckOnly(logistic: LogisticsSummaryDto, dirtyList: FieldColorsDto[], summaryObj: LogisticsSummaryDto): Observable<LogisticsSummaryDto> {
    if (logistic?.isContainerPercentDirty && logistic?.containerPercent != null) {
      logistic.containerPercent = Number(logistic.containerPercent);
    } else {
      if (logistic?.containerPercent != null && this.checkDirtyProperty('ContainerPercent', dirtyList)) {
        logistic.containerPercent = summaryObj?.containerPercent;
      }
    }

    if (logistic?.isContainerCostDirty && logistic?.containerCost != null) {
      logistic.containerCost = Number(logistic.containerCost);
    } else {
      if (logistic?.containerCost != null && this.checkDirtyProperty('ContainerCost', dirtyList)) {
        logistic.containerCost = summaryObj?.containerCost;
      }
    }

    if (logistic?.isFreightCostPerShipmentDirty && logistic?.freightCostPerShipment != null) {
      logistic.freightCostPerShipment = Number(logistic.freightCostPerShipment);
    } else {
      if (logistic?.freightCostPerShipment != null && this.checkDirtyProperty('FreightCostPerShipment', dirtyList)) {
        logistic.freightCostPerShipment = summaryObj?.freightCostPerShipment;
      }
    }

    if (logistic?.isFreightCostDirty && logistic?.freightCost != null) {
      logistic.freightCost = Number(logistic.freightCost);
    } else {
      if (logistic?.freightCost != null && this.checkDirtyProperty('FreightCost', dirtyList)) {
        logistic.freightCost = summaryObj?.freightCost;
      }
    }

    return new Observable((obs) => {
      obs.next(logistic);
    });
  }

  private checkDirtyProperty(formCotrolName: string, fieldList: any[]) {
    let res = false;
    if (fieldList) {
      const info = fieldList.filter((x) => x.formControlName == formCotrolName && x.isDirty == true);
      if (info.length > 0) {
        res = true;
      }
    }
    return res;
  }
}