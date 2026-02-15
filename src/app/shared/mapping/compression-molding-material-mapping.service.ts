import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MaterialInfoDto } from '../models';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CompressionMoldingMaterialMappingService {
  constructor(public sharedService: SharedService) {}
  getFormFields() {
    return {
      length: 0,
      width: 0,
      height: 0,
      maxWallthick: 0,
      wallAverageThickness: 0,
      standardDeviation: 0,
      perimeter: 0,
      partProjectArea: 0,
      partSurfaceArea: 0,
      partVolume: 0,
      netWeight: 0,
      noOfInserts: 0,
      utilisation: 0,
      grossWeight: 0,
      scrapWeight: 0,
      scrapRecovery: 0,
      grossMaterialCost: 0,
      scrapRecCost: 0,
      regrindAllowance: 0,
      netMaterialCost: 0,
      noOfCavities: 0,
      runnerType: '',
      runnerDia: 0,
      runnerLength: 0,
      cavityArrangementLength: 0,
      cavityArrangementWidth: 0,

      sheetLength: 0,
      sheetWidth: 0,
      sheetThickness: 0,
      // density: 0,
      // clampingPressure: 0,
      // meltTemp: 0,
      // moldTemp: 0,
      // ejectTemp: 0,
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
      perimeter: 0,
      partProjectArea: 0,
      partSurfaceArea: 0,
      partVolume: 0,
      netWeight: 0,
      noOfInserts: 0,
      utilisation: 0,
      grossWeight: 0,
      scrapWeight: 0,
      scrapRecovery: 0,
      grossMaterialCost: 0,
      scrapRecCost: 0,
      regrindAllowance: 0,
      netMaterialCost: 0,
      noOfCavities: 0,
      runnerType: '',
      runnerDia: 0,
      runnerLength: 0,
      cavityArrangementLength: 0,
      cavityArrangementWidth: 0,
      sheetLength: 0,
      sheetWidth: 0,
      sheetThickness: 0,
      // density: 0,
      // clampingPressure: 0,
      // meltTemp: 0,
      // moldTemp: 0,
      // ejectTemp: 0,
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
      perimeter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.perimeter), conversionValue, isEnableUnitConversion),
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partProjectedArea), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partSurfaceArea), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partVolume), conversionValue, isEnableUnitConversion),
      netWeight: materialInfo?.netWeight,
      noOfInserts: materialInfo?.noOfInserts,
      utilisation: materialInfo?.utilisation,
      grossWeight: materialInfo?.grossWeight,
      scrapWeight: materialInfo?.scrapWeight,
      scrapRecovery: materialInfo?.scrapRecovery,
      grossMaterialCost: materialInfo?.materialCostPart,
      scrapRecCost: materialInfo?.scrapRecCost,
      regrindAllowance: materialInfo?.regrindAllowance,
      netMaterialCost: materialInfo?.netMatCost,
      noOfCavities: materialInfo?.noOfCavities,
      runnerType: materialInfo?.runnerType,
      runnerDia: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.runnerDia), conversionValue, isEnableUnitConversion),
      runnerLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.runnerLength), conversionValue, isEnableUnitConversion),
      cavityArrangementLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.cavityArrangementLength), conversionValue, isEnableUnitConversion),
      cavityArrangementWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.cavityArrangementWidth), conversionValue, isEnableUnitConversion),
      sheetLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.sheetLength), conversionValue, isEnableUnitConversion),
      sheetWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.sheetWidth), conversionValue, isEnableUnitConversion),
      sheetThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.sheetThickness), conversionValue, isEnableUnitConversion),
      // density: materialInfo?.density,
    };
  }

  materialDirtyCheck(materialInfo: MaterialInfoDto, formCtrl) {
    materialInfo.isRegrindAllowanceDirty = formCtrl['regrindAllowance'].dirty;
    materialInfo.isScrapWeightDirty = formCtrl['scrapWeight'].dirty;
    materialInfo.isGrossWeightDirty = formCtrl['grossWeight'].dirty;
    materialInfo.isNetweightDirty = formCtrl['netWeight'].dirty;
    materialInfo.isNoOfCavitiesDirty = formCtrl['noOfCavities'].dirty;
    materialInfo.isRunnerTypeDirty = formCtrl['runnerType'].dirty;
    materialInfo.isRunnerDiaDirty = formCtrl['runnerDia'].dirty;
    materialInfo.isRunnerLengthDirty = formCtrl['runnerLength'].dirty;
    materialInfo.isPerimeterDirty = formCtrl['perimeter'].dirty;
    materialInfo.isCavityArrangementLengthDirty = formCtrl['cavityArrangementLength'].dirty;
    materialInfo.isCavityArrangementWidthDirty = formCtrl['cavityArrangementWidth'].dirty;

    materialInfo.isSheetLengthDirty = formCtrl['sheetLength'].dirty;
    materialInfo.isSheetWidthDirty = formCtrl['sheetWidth'].dirty;
    materialInfo.isSheetThicknessDirty = formCtrl['sheetThickness'].dirty;
    materialInfo.isutilisationDirty = formCtrl['utilisation'].dirty;
    materialInfo.isAvgWallthickDirty = formCtrl['wallAverageThickness'].dirty;
  }

  materialFormAssignValue(materialInfo: MaterialInfoDto, formCtrl, conversionValue: any, isEnableUnitConversion: boolean) {
    materialInfo.dimX = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['length']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimY = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['width']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimZ = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['height']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.wallThickessMm = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['maxWallthick'].value), conversionValue, isEnableUnitConversion);
    materialInfo.wallAverageThickness = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['wallAverageThickness'].value), conversionValue, isEnableUnitConversion);
    materialInfo.standardDeviation = formCtrl['standardDeviation'].value;
    materialInfo.perimeter = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['perimeter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partProjectArea'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partSurfaceArea'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.noOfInserts = formCtrl['noOfInserts'].value;
    materialInfo.utilisation = formCtrl['utilisation'].value;
    materialInfo.grossWeight = formCtrl['grossWeight'].value;
    materialInfo.scrapWeight = formCtrl['scrapWeight'].value;
    materialInfo.scrapRecovery = formCtrl['scrapRecovery'].value;
    materialInfo.materialCostPart = formCtrl['grossMaterialCost'].value;
    materialInfo.scrapRecCost = formCtrl['scrapRecCost'].value;
    materialInfo.regrindAllowance = formCtrl['regrindAllowance'].value;
    materialInfo.netMatCost = formCtrl['netMaterialCost'].value;
    materialInfo.noOfCavities = formCtrl['noOfCavities'].value;
    materialInfo.runnerType = formCtrl['runnerType'].value;
    materialInfo.runnerDia = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['runnerDia'].value), conversionValue, isEnableUnitConversion);
    materialInfo.runnerLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['runnerLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.cavityArrangementLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['cavityArrangementLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.cavityArrangementWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['cavityArrangementWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.sheetLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['sheetLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.sheetWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['sheetWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.sheetThickness = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['sheetThickness'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.density = formCtrl['density'].value;
  }

  formPatchResults(result: MaterialInfoDto, conversionValue: any, isEnableUnitConversion: boolean) {
    return {
      length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.dimX), conversionValue, isEnableUnitConversion),
      width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.dimY), conversionValue, isEnableUnitConversion),
      height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.dimZ), conversionValue, isEnableUnitConversion),
      maxWallthick: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.wallThickessMm), conversionValue, isEnableUnitConversion),
      wallAverageThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.wallAverageThickness), conversionValue, isEnableUnitConversion),
      standardDeviation: this.sharedService.isValidNumber(result.standardDeviation),
      perimeter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.perimeter), conversionValue, isEnableUnitConversion),
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partProjectedArea), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partSurfaceArea), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partVolume), conversionValue, isEnableUnitConversion),
      netWeight: this.sharedService.isValidNumber(result.netWeight),
      noofInserts: result.noOfInserts,
      utilisation: this.sharedService.isValidNumber(result.utilisation),
      grossWeight: this.sharedService.isValidNumber(result.grossWeight),
      scrapWeight: this.sharedService.isValidNumber(result.scrapWeight),
      scrapRecovery: this.sharedService.isValidNumber(result.scrapRecovery),
      grossMaterialCost: this.sharedService.isValidNumber(result.materialCostPart),
      scrapRecCost: this.sharedService.isValidNumber(result.scrapRecCost),
      regrindAllowance: result.regrindAllowance,
      netMaterialCost: this.sharedService.isValidNumber(result.netMatCost),
      noOfCavities: result.noOfCavities,
      runnerType: result.runnerType,
      runnerDia: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.runnerDia), conversionValue, isEnableUnitConversion),
      runnerLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.runnerLength), conversionValue, isEnableUnitConversion),
      cavityArrangementLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.cavityArrangementLength), conversionValue, isEnableUnitConversion),
      cavityArrangementWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.cavityArrangementWidth), conversionValue, isEnableUnitConversion),
      sheetLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.sheetLength), conversionValue, isEnableUnitConversion),
      sheetWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.sheetWidth), conversionValue, isEnableUnitConversion),
      sheetThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.sheetThickness), conversionValue, isEnableUnitConversion),
    };
  }

  setCalculationObject(materialInfo: MaterialInfoDto, formCtrl, conversionValue: any, isEnableUnitConversion: boolean) {
    materialInfo.dimX = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['length']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimY = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['width']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimZ = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['height']?.value), conversionValue, isEnableUnitConversion);

    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.wallThickessMm = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['maxWallthick'].value), conversionValue, isEnableUnitConversion);
    materialInfo.wallAverageThickness = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['wallAverageThickness'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partProjectArea'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partSurfaceArea'].value), conversionValue, isEnableUnitConversion);
    materialInfo.standardDeviation = formCtrl['standardDeviation'].value;
    materialInfo.netWeight = formCtrl['netWeight'].value;
    materialInfo.utilisation = formCtrl['utilisation'].value;
    materialInfo.noOfInserts = formCtrl['noOfInserts'].value;
    materialInfo.grossWeight = formCtrl['grossWeight'].value;
    materialInfo.scrapWeight = formCtrl['scrapWeight'].value;
    materialInfo.scrapRecovery = formCtrl['scrapRecovery'].value;
    materialInfo.materialCostPart = formCtrl['grossMaterialCost'].value;
    materialInfo.scrapRecCost = formCtrl['scrapRecCost'].value;
    materialInfo.regrindAllowance = formCtrl['regrindAllowance'].value;
    materialInfo.netMatCost = formCtrl['netMaterialCost'].value;
    materialInfo.noOfCavities = formCtrl['noOfCavities'].value;
    materialInfo.runnerType = formCtrl['runnerType'].value;
    materialInfo.runnerDia = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['runnerDia'].value), conversionValue, isEnableUnitConversion);
    materialInfo.runnerLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['runnerLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.cavityArrangementLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['cavityArrangementLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.cavityArrangementWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['cavityArrangementWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.sheetLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['sheetLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.sheetWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['sheetWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.sheetThickness = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['sheetThickness'].value), conversionValue, isEnableUnitConversion);
  }

  setPayload(materialInfo, conversionValue, isEnableUnitConversion) {
    return {
      dimX: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['length'].value), conversionValue, isEnableUnitConversion),
      dimY: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['width'].value), conversionValue, isEnableUnitConversion),
      dimZ: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['height'].value), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['partVolume'].value), conversionValue, isEnableUnitConversion),
      wallThickessMm: this.sharedService.convertUomToSaveAndCalculation(materialInfo['maxWallthick']?.value || 0, conversionValue, isEnableUnitConversion),
      wallAverageThickness: this.sharedService.convertUomToSaveAndCalculation(materialInfo['wallAverageThickness']?.value || 0, conversionValue, isEnableUnitConversion),
      standardDeviation: materialInfo['standardDeviation'].value || 0,
      perimeter: this.sharedService.convertUomToSaveAndCalculation(materialInfo['perimeter']?.value || 0, conversionValue, isEnableUnitConversion),
      partProjectedArea: this.sharedService.convertUomToSaveAndCalculation(materialInfo['partProjectArea']?.value || 0, conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomToSaveAndCalculation(materialInfo['partSurfaceArea']?.value || 0, conversionValue, isEnableUnitConversion),
      netWeight: materialInfo['netWeight']?.value || 0,
      noOfInserts: materialInfo['noOfInserts']?.value || 0,
      utilisation: materialInfo['utilisation']?.value || 0,
      grossWeight: materialInfo['grossWeight']?.value || 0,
      scrapWeight: materialInfo['scrapWeight']?.value || 0,
      scrapRecovery: materialInfo['scrapRecovery']?.value || 0,
      materialCostPart: materialInfo['grossMaterialCost']?.value || 0,
      scrapRecCost: materialInfo['scrapRecCost']?.value || 0,
      regrindAllowance: materialInfo['regrindAllowance']?.value || 0,
      netMatCost: materialInfo['netMaterialCost']?.value || 0,
      noOfCavities: materialInfo['noOfCavities']?.value || 0,
      runnerType: materialInfo['runnerType']?.value || '',
      runnerDia: this.sharedService.convertUomToSaveAndCalculation(materialInfo['runnerDia']?.value || 0, conversionValue, isEnableUnitConversion),
      runnerLength: this.sharedService.convertUomToSaveAndCalculation(materialInfo['runnerLength']?.value || 0, conversionValue, isEnableUnitConversion),
      cavityArrangementLength: this.sharedService.convertUomToSaveAndCalculation(materialInfo['cavityArrangementLength']?.value || 0, conversionValue, isEnableUnitConversion),
      cavityArrangementWidth: this.sharedService.convertUomToSaveAndCalculation(materialInfo['cavityArrangementWidth']?.value || 0, conversionValue, isEnableUnitConversion),
      sheetLength: this.sharedService.convertUomToSaveAndCalculation(materialInfo['sheetLength']?.value || 0, conversionValue, isEnableUnitConversion),
      sheetWidth: this.sharedService.convertUomToSaveAndCalculation(materialInfo['sheetWidth']?.value || 0, conversionValue, isEnableUnitConversion),
      sheetThickness: this.sharedService.convertUomToSaveAndCalculation(materialInfo['sheetThickness']?.value || 0, conversionValue, isEnableUnitConversion),
    };
  }
}
