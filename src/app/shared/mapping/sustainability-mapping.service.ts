import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { LogisticsSummaryDto } from '../models/logistics-summary.model';
import { PackagingInfoDto } from '../models/packaging-info.model';

@Injectable({
  providedIn: 'root',
})
export class SustainabilityMappingService {
  constructor(private sharedService: SharedService) {}

  logisticsPatch(logisticsSummaryDtoOut: LogisticsSummaryDto) {
    return {
      CarbonFootPrintPerUnit: this.sharedService.isValidNumber(logisticsSummaryDtoOut.carbonFootPrintPerUnit),
      CarbonFootPrint: this.sharedService.isValidNumber(logisticsSummaryDtoOut.carbonFootPrint),
      TotalCarbonFootPrint: this.sharedService.isValidNumber(logisticsSummaryDtoOut.totalCarbonFootPrint),
    };
  }

  packagingPatch(packagingInfoDto: PackagingInfoDto) {
    return {
      esgImpactperBox: this.sharedService.isValidNumber(packagingInfoDto.esgImpactperBox),
      esgImpactperPallet: this.sharedService.isValidNumber(packagingInfoDto.esgImpactperPallet),
      totalESGImpactperPart: this.sharedService.isValidNumber(packagingInfoDto.totalESGImpactperPart),
    };
  }

  materialCheck(materialInfo, formControl) {
    materialInfo.esgImpactCO2Kg = formControl['esgImpactCO2Kg'].value;
    formControl['esgImpactCO2Kg'].dirty && (materialInfo.isEsgImpactCO2KgDirty = true);
  }

  manufacturingCheck(manufactureInfo, formControl) {
    manufactureInfo.esgImpactElectricityConsumption = formControl['esgImpactElectricityConsumption'].value;
    formControl['esgImpactElectricityConsumption'].dirty && (manufactureInfo.isesgImpactElectricityConsumptionDirty = true);
  }

  packagingCheck(packagingInfo, formControl) {
    packagingInfo.esgImpactperBox = formControl['esgImpactperBox'].value;
    packagingInfo.esgImpactperPallet = formControl['esgImpactperPallet'].value;
    packagingInfo.totalESGImpactperPart = formControl['totalESGImpactperPart'].value;
    formControl['esgImpactperBox'].dirty && (packagingInfo.esgImpactperBoxDirty = true);
    formControl['esgImpactperPallet'].dirty && (packagingInfo.esgImpactperPalletDirty = true);
    formControl['totalESGImpactperPart'].dirty && (packagingInfo.totalESGImpactperPartDirty = true);
  }

  logisticsCheck(logisticInfo, formControl) {
    logisticInfo.totalCarbonFootPrint = formControl['TotalCarbonFootPrint'].value;
    logisticInfo.carbonFootPrint = formControl['CarbonFootPrint'].value;
    logisticInfo.carbonFootPrintPerUnit = formControl['CarbonFootPrintPerUnit'].value;
    formControl['TotalCarbonFootPrint'].dirty && (logisticInfo.isTotalCarbonFootPrintDirty = true);
    formControl['CarbonFootPrint'].dirty && (logisticInfo.isCarbonFootPrintDirty = true);
    formControl['CarbonFootPrintPerUnit'].dirty && (logisticInfo.isCarbonFootPrintPerUnitDirty = true);
  }
}
