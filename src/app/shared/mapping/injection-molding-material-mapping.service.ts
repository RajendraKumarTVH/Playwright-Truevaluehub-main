import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MaterialInfoDto } from '../models';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InjectionMoldingMaterialMappingService {
  constructor(public sharedService: SharedService) {}
  getFormFields() {
    return {
      length: 0,
      width: 0,
      height: 0,
      maxWallthick: 0,
      wallAverageThickness: 0,
      standardDeviation: 0,
      partProjectArea: 0,
      partSurfaceArea: 0,
      partVolume: 0,
      netWeight: 0,
      utilisation: 0,
      grossWeight: 0,
      scrapWeight: 0,
      scrapRecovery: 0,
      grossMaterialCost: 0,
      scrapRecCost: 0,
      regrindAllowance: 0,
      netMaterialCost: 0,
      noOfInserts: 0,
      primaryCount: 0,
      colorantPer: 0,
      colorantPrice: 0,
      primaryWeight: 0,
      primaryPrice: 0,
      colorantCost: 0,
    };
  }

  formFieldsReset() {
    return {
      length: 0,
      width: 0,
      height: 0,
      maxWallthick: 0,
      wallAverageThickness: 0,
      standardDeviation: 0,
      partProjectArea: 0,
      partSurfaceArea: 0,
      partVolume: 0,
      netWeight: 0,
      utilisation: 0,
      grossWeight: 0,
      scrapWeight: 0,
      scrapRecovery: 0,
      grossMaterialCost: 0,
      scrapRecCost: 0,
      regrindAllowance: 0,
      netMaterialCost: 0,
      noOfInserts: 0,
      primaryCount: '',
      colorantPer: 0,
      colorantPrice: 0,
      primaryWeight: 0,
      primaryPrice: 0,
      colorantCost: 0,
    };
  }

  formPatch(materialInfo: MaterialInfoDto, conversionValue: any, isEnableUnitConversion: boolean) {
    return {
      length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimX), conversionValue, isEnableUnitConversion),
      width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimY), conversionValue, isEnableUnitConversion),
      height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimZ), conversionValue, isEnableUnitConversion),
      maxWallthick: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.wallThickessMm), conversionValue, isEnableUnitConversion),
      wallAverageThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.wallAverageThickness), conversionValue, isEnableUnitConversion),
      standardDeviation: materialInfo?.standardDeviation,
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partProjectedArea), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partSurfaceArea), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partVolume), conversionValue, isEnableUnitConversion),
      netWeight: materialInfo?.netWeight,
      utilisation: materialInfo?.utilisation,
      grossWeight: materialInfo?.grossWeight,
      scrapWeight: materialInfo?.scrapWeight,
      scrapRecovery: materialInfo?.scrapRecovery,
      grossMaterialCost: materialInfo?.materialCostPart,
      scrapRecCost: materialInfo?.scrapRecCost,
      regrindAllowance: materialInfo?.regrindAllowance,
      netMaterialCost: materialInfo?.netMatCost,
      noOfInserts: materialInfo?.noOfInserts,

      primaryCount: materialInfo?.primaryCount,
      colorantPer: materialInfo?.colorantPer,
      colorantPrice: materialInfo?.colorantPrice,
      primaryWeight: materialInfo?.primaryWeight,
      primaryPrice: materialInfo?.primaryPrice,
      colorantCost: materialInfo?.colorantCost,
    };
  }

  materialDirtyCheck(materialInfo: MaterialInfoDto, formCtrl) {
    materialInfo.isRegrindAllowanceDirty = formCtrl['regrindAllowance'].dirty;
    // materialInfo.isRunnerTypeDirty = formCtrl['runnerType'].dirty;
    // materialInfo.isRunnerDiaDirty = formCtrl['runnerDia'].dirty;
    // materialInfo.isRunnerLengthDirty = formCtrl['runnerLength'].dirty;
    materialInfo.isScrapWeightDirty = formCtrl['scrapWeight'].dirty;
    materialInfo.isutilisationDirty = formCtrl['utilisation'].dirty;
    materialInfo.isNetweightDirty = formCtrl['netWeight'].dirty;
    materialInfo.isNoOfInsertsDirty = formCtrl['noOfInserts'].dirty;
    materialInfo.isGrossWeightDirty = formCtrl['grossWeight'].dirty;

    materialInfo.isPrimaryCountDirty = formCtrl['primaryCount'].dirty;
    materialInfo.isColorantPerDirty = formCtrl['colorantPer'].dirty;
    materialInfo.isColorantPriceDirty = formCtrl['colorantPrice'].dirty;
    materialInfo.isPrimaryWeightDirty = formCtrl['primaryWeight'].dirty;
    materialInfo.isPrimaryPriceDirty = formCtrl['primaryPrice'].dirty;
    materialInfo.isColorantCostDirty = formCtrl['colorantCost'].dirty;
  }

  materialFormAssignValue(materialInfo: MaterialInfoDto, formCtrl, conversionValue: any, isEnableUnitConversion: boolean) {
    materialInfo.dimX = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['length']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimY = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['width'].value), conversionValue, isEnableUnitConversion);
    materialInfo.dimZ = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['height'].value), conversionValue, isEnableUnitConversion);

    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.wallThickessMm = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['maxWallthick'].value), conversionValue, isEnableUnitConversion);
    materialInfo.wallAverageThickness = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['wallAverageThickness'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partProjectArea'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partSurfaceArea'].value), conversionValue, isEnableUnitConversion);
    materialInfo.standardDeviation = formCtrl['standardDeviation'].value;
    // materialInfo.netWeight = formCtrl['netWeight'].value;
    materialInfo.utilisation = formCtrl['utilisation'].value;
    materialInfo.grossWeight = formCtrl['grossWeight'].value;
    materialInfo.scrapWeight = formCtrl['scrapWeight'].value;
    materialInfo.scrapRecovery = formCtrl['scrapRecovery'].value;
    materialInfo.materialCostPart = formCtrl['grossMaterialCost'].value;
    materialInfo.scrapRecCost = formCtrl['scrapRecCost'].value;
    materialInfo.regrindAllowance = formCtrl['regrindAllowance'].value;
    materialInfo.netMatCost = formCtrl['netMaterialCost'].value;
    materialInfo.noOfInserts = formCtrl['noOfInserts'].value;

    materialInfo.primaryCount = formCtrl['primaryCount'].value;
    materialInfo.colorantPer = formCtrl['colorantPer'].value;
    materialInfo.colorantPrice = formCtrl['colorantPrice'].value;
    materialInfo.primaryWeight = formCtrl['primaryWeight'].value;
    materialInfo.primaryPrice = formCtrl['primaryPrice'].value;
    materialInfo.colorantCost = formCtrl['colorantCost'].value;
  }

  formPatchResults(result: MaterialInfoDto, conversionValue: any, isEnableUnitConversion: boolean) {
    return {
      length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.dimX), conversionValue, isEnableUnitConversion),
      width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.dimY), conversionValue, isEnableUnitConversion),
      height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.dimZ), conversionValue, isEnableUnitConversion),
      maxWallthick: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.wallThickessMm), conversionValue, isEnableUnitConversion),
      wallAverageThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.wallAverageThickness), conversionValue, isEnableUnitConversion),
      standardDeviation: result.standardDeviation,
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partProjectedArea), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partSurfaceArea), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partVolume), conversionValue, isEnableUnitConversion),
      netWeight: this.sharedService.isValidNumber(result.netWeight),
      utilisation: this.sharedService.isValidNumber(result.utilisation),
      grossWeight: this.sharedService.isValidNumber(result.grossWeight),
      scrapWeight: this.sharedService.isValidNumber(result.scrapWeight),
      scrapRecovery: this.sharedService.isValidNumber(result.scrapRecovery),
      grossMaterialCost: this.sharedService.isValidNumber(result.materialCostPart),
      scrapRecCost: this.sharedService.isValidNumber(result.scrapRecCost),
      regrindAllowance: result.regrindAllowance,
      netMaterialCost: this.sharedService.isValidNumber(result.netMatCost),
      noOfInserts: result.noOfInserts,

      primaryCount: result.primaryCount,
      colorantPer: result.colorantPer,
      colorantPrice: result.colorantPrice,
      primaryWeight: result.primaryWeight,
      primaryPrice: result.primaryPrice,
      colorantCost: result.colorantCost,
    };
  }

  setCalculationObject(materialInfo: MaterialInfoDto, formCtrl, conversionValue: any, isEnableUnitConversion: boolean) {
    materialInfo.dimX = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['length']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimY = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['width'].value), conversionValue, isEnableUnitConversion);
    materialInfo.dimZ = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['height'].value), conversionValue, isEnableUnitConversion);

    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.wallThickessMm = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['maxWallthick'].value), conversionValue, isEnableUnitConversion);
    materialInfo.wallAverageThickness = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['wallAverageThickness'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partProjectArea'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partSurfaceArea'].value), conversionValue, isEnableUnitConversion);

    materialInfo.standardDeviation = formCtrl['standardDeviation'].value;
    materialInfo.netWeight = formCtrl['netWeight'].value;
    materialInfo.utilisation = formCtrl['utilisation'].value;
    materialInfo.grossWeight = formCtrl['grossWeight'].value;
    materialInfo.scrapWeight = formCtrl['scrapWeight'].value;
    materialInfo.scrapRecovery = formCtrl['scrapRecovery'].value;
    materialInfo.materialCostPart = formCtrl['grossMaterialCost'].value;
    materialInfo.scrapRecCost = formCtrl['scrapRecCost'].value;
    materialInfo.regrindAllowance = formCtrl['regrindAllowance'].value;
    materialInfo.netMatCost = formCtrl['netMaterialCost'].value;
    materialInfo.noOfInserts = formCtrl['noOfInserts'].value;

    materialInfo.primaryCount = formCtrl['primaryCount'].value;
    materialInfo.colorantPer = formCtrl['colorantPer'].value;
    materialInfo.colorantPrice = formCtrl['colorantPrice'].value;
    materialInfo.primaryWeight = formCtrl['primaryWeight'].value;
    materialInfo.primaryPrice = formCtrl['primaryPrice'].value;
    materialInfo.colorantCost = formCtrl['colorantCost'].value;
  }

  setPayload(materialInfo: any, conversionValue: any, isEnableUnitConversion: boolean) {
    return {
      dimX: this.sharedService.convertUomToSaveAndCalculation(materialInfo['length']?.value || 0, conversionValue, isEnableUnitConversion),
      dimY: this.sharedService.convertUomToSaveAndCalculation(materialInfo['width']?.value || 0, conversionValue, isEnableUnitConversion),
      dimZ: this.sharedService.convertUomToSaveAndCalculation(materialInfo['height']?.value || 0, conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomToSaveAndCalculation(materialInfo['partVolume']?.value || 0, conversionValue, isEnableUnitConversion),
      wallThickessMm: this.sharedService.convertUomToSaveAndCalculation(materialInfo['maxWallthick']?.value || 0, conversionValue, isEnableUnitConversion),
      wallAverageThickness: this.sharedService.convertUomToSaveAndCalculation(materialInfo['wallAverageThickness']?.value || 0, conversionValue, isEnableUnitConversion),
      standardDeviation: materialInfo['standardDeviation']?.value || 0,
      partProjectedArea: this.sharedService.convertUomToSaveAndCalculation(materialInfo['partProjectArea']?.value || 0, conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomToSaveAndCalculation(materialInfo['partSurfaceArea']?.value || 0, conversionValue, isEnableUnitConversion),
      netWeight: materialInfo['netWeight']?.value || 0,
      utilisation: materialInfo['utilisation']?.value || 0,
      grossWeight: materialInfo['grossWeight']?.value || 0,
      scrapWeight: materialInfo['scrapWeight']?.value || 0,
      scrapRecovery: materialInfo['scrapRecovery']?.value || 0,
      materialCostPart: materialInfo['grossMaterialCost']?.value || 0,
      scrapRecCost: materialInfo['scrapRecCost']?.value || 0,
      regrindAllowance: materialInfo['regrindAllowance']?.value || 0,
      netMatCost: materialInfo['netMaterialCost']?.value || 0,
      noOfInserts: materialInfo['noOfInserts']?.value || 0,

      primaryCount: materialInfo['primaryCount']?.value || 0,
      colorantPer: materialInfo['colorantPer']?.value || 0,
      colorantPrice: materialInfo['colorantPrice']?.value || 0,
      primaryWeight: materialInfo['primaryWeight']?.value || 0,
      primaryPrice: materialInfo['primaryPrice']?.value || 0,
      colorantCost: materialInfo['colorantCost']?.value || 0,
    };
  }
}
