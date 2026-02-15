import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MaterialInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MaterialTubeBendingMappingService {
  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService
  ) {}
  getTubeBendingFormFields(materialInfoList, conversionValue, isEnableUnitConversion) {
    return {
      partLength: [0],
      partWidth: [0],
      partHeight: [0],
      partOuterDiameter: [0],
      partVolume: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimVolume), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      netWeight: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].netWeight) : 0, [Validators.required]],
      utilisation: [0, [Validators.required]],
      netMaterialCost: [{ value: 0, disabled: true }],
      partTickness: 0,
      stockType: [1],
      noOfInserts: [0, [Validators.required]],
      totalCostOfRawMaterials: 0,
      cuttingLoss: 0,
      lengthAllowance: [0],
      cuttingAllowance: [0],
      scaleLoss: 0,
      sheetLength: 0,
      scrapWeight: [0, [Validators.required]],
      grossWeight: [0, [Validators.required]],
      scrapRecCost: [0, [Validators.required]],
    };
  }

  tubeBendingFormFieldsReset() {
    return {
      partLength: 0,
      partWidth: 0,
      partHeight: 0,
      partOuterDiameter: 0,
      partVolume: 0,
      netWeight: 0,
      utilisation: 1,
      netMaterialCost: 0,
      partTickness: 0,
      stockType: 1,
      totalCostOfRawMaterials: 0,
      cuttingLoss: 0,
      lengthAllowance: 5,
      cuttingAllowance: 0,
      noOfInserts: 0,
      scaleLoss: 0,
      sheetLength: 0,
      scrapWeight: 0,
      grossWeight: 0,
      scrapRecCost: 0,
    };
  }

  tubeBendingFormPatch(materialInfo: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      partLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partLength) || 0, conversionValue, isEnableUnitConversion),
      partWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partWidth) || 0, conversionValue, isEnableUnitConversion),
      partHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partHeight) || 0, conversionValue, isEnableUnitConversion),
      partOuterDiameter: this.sharedService.convertUomInUI(materialInfo.partOuterDiameter, conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimVolume), conversionValue, isEnableUnitConversion),
      netWeight: this.sharedService.isValidNumber(materialInfo?.netWeight),
      cuttingAllowance: this.sharedService.isValidNumber(materialInfo?.cuttingAllowance),
      utilisation: this.sharedService.isValidNumber(materialInfo?.utilisation),
      netMaterialCost: this.sharedService.isValidNumber(materialInfo?.netMatCost),
      partTickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partTickness), conversionValue, isEnableUnitConversion),
      stockType: materialInfo?.stockType,
      totalCostOfRawMaterials: this.sharedService.isValidNumber(materialInfo.totalCostOfRawMaterials),
      cuttingLoss: this.sharedService.isValidNumber(materialInfo.cuttingLoss),
      scaleLoss: this.sharedService.isValidNumber(materialInfo.scaleLoss),
      lengthAllowance: this.sharedService.isValidNumber(materialInfo?.lengthAllowance),
      noOfInserts: this.sharedService.isValidNumber(materialInfo.noOfInserts),
      sheetLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.sheetLength) || 0, conversionValue, isEnableUnitConversion),
      scrapWeight: this.sharedService.isValidNumber(Number(materialInfo.scrapWeight)),
      grossWeight: this.sharedService.isValidNumber(Number(materialInfo.grossWeight)),
      scrapRecCost: this.sharedService.isValidNumber(Number(materialInfo.scrapRecCost)),
    };
  }

  tubeBendingSetCalculationObject(materialInfo, material, conversionValue, isEnableUnitConversion) {
    materialInfo.partLength = this.sharedService.convertUomToSaveAndCalculation(Number(material['partLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partWidth = this.sharedService.convertUomToSaveAndCalculation(Number(material['partWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partHeight = this.sharedService.convertUomToSaveAndCalculation(Number(material['partHeight'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partOuterDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(material['partOuterDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(material['partVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.netWeight = material['netWeight'].value;
    materialInfo.utilisation = material['utilisation'].value;
    materialInfo.grossWeight = material['grossWeight'].value;
    materialInfo.scrapWeight = material['scrapWeight'].value;
    materialInfo.scrapRecCost = material['scrapRecCost'].value;
    materialInfo.netMatCost = material['netMaterialCost'].value;
    materialInfo.sheetLength = this.sharedService.convertUomToSaveAndCalculation(Number(material['sheetLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.cuttingLoss = material['cuttingLoss'].value;
    materialInfo.partTickness = this.sharedService.convertUomToSaveAndCalculation(Number(material['partTickness'].value), conversionValue, isEnableUnitConversion);
    materialInfo.totalCostOfRawMaterials = material['totalCostOfRawMaterials'].value;
    materialInfo.stockType = material['stockType'].value;
    materialInfo.noOfInserts = material['noOfInserts'].value;
    materialInfo.scaleLoss = material['scaleLoss'].value;
    materialInfo.lengthAllowance = this.sharedService.convertUomToSaveAndCalculation(Number(material['lengthAllowance'].value), conversionValue, isEnableUnitConversion);
    materialInfo.cuttingAllowance = material['cuttingAllowance'].value;

    materialInfo.isPartLengthDirty = material['partLength'].dirty;
    materialInfo.isPartWidthDirty = material['partWidth'].dirty;
    materialInfo.isPartHeightDirty = material['partHeight'].dirty;
    materialInfo.isPartOuterDiameterDirty = material['partOuterDiameter'].dirty;
    materialInfo.isPartVolumeDirty = material['partVolume'].dirty;
    materialInfo.isSheetLengthDirty = material['sheetLength'].dirty;
    materialInfo.isStockTypeDirty = material['stockType'].dirty;
    materialInfo.isNetweightDirty = material['netWeight'].dirty;
    materialInfo.isGrossWeightCoilDirty = material['grossWeight'].dirty;
    materialInfo.isScrapWeightDirty = material['scrapWeight'].dirty;
    materialInfo.ispartTicknessDirty = material['partTickness'].dirty;
  }

  tubeBendingFormPatchResults(result: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      partLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partLength)), conversionValue, isEnableUnitConversion),
      partWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partWidth), conversionValue, isEnableUnitConversion),
      partTickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partTickness), conversionValue, isEnableUnitConversion),
      partOuterDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partOuterDiameter)), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partVolume)), conversionValue, isEnableUnitConversion),
      netWeight: this.sharedService.isValidNumber(Number(result.netWeight)),
      utilisation: this.sharedService.isValidNumber(Number(result.utilisation)),
      netMaterialCost: this.sharedService.isValidNumber(Number(result.netMatCost)),
      scrapWeight: this.sharedService.isValidNumber(Number(result.scrapWeight)),
      grossWeight: this.sharedService.isValidNumber(Number(result.grossWeight)),
      scrapRecCost: this.sharedService.isValidNumber(Number(result.scrapRecCost)),
      cuttingLoss: this.sharedService.isValidNumber(Number(result.cuttingLoss)),
      scaleLoss: this.sharedService.isValidNumber(result.scaleLoss),
      sheetLength: this.sharedService.isValidNumber(Number(result.sheetLength)),
      partHeight: this.sharedService.isValidNumber(Number(result.partHeight)),
      lengthAllowance: this.sharedService.isValidNumber(Number(result.lengthAllowance)),
      cuttingAllowance: this.sharedService.isValidNumber(Number(result.cuttingAllowance)),
      totalCostOfRawMaterials: this.sharedService.isValidNumber(Number(result.totalCostOfRawMaterials)),
      noOfInserts: this.sharedService.isValidNumber(Number(result.noOfInserts)),
    };
  }

  tubeBendingSetPayload(material, conversionValue, isEnableUnitConversion) {
    return {
      partLength: this.sharedService.convertUomToSaveAndCalculation(Number(material['partLength'].value), conversionValue, isEnableUnitConversion),
      partWidth: this.sharedService.convertUomToSaveAndCalculation(Number(material['partWidth'].value), conversionValue, isEnableUnitConversion),
      partHeight: this.sharedService.convertUomToSaveAndCalculation(material['partHeight'].value || 0, conversionValue, isEnableUnitConversion),
      partOuterDiameter: this.sharedService.convertUomToSaveAndCalculation(Number(material['partOuterDiameter'].value), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomToSaveAndCalculation(Number(material['partVolume'].value), conversionValue, isEnableUnitConversion),
      netWeight: material['netWeight'].value,
      utilisation: material['utilisation'].value,
      netMatCost: material['netMaterialCost'].value || 0,
      grossWeight: material['grossWeight'].value || 0,
      scrapWeight: material['scrapWeight'].value || 0,
      scrapRecCost: material['scrapRecCost'].value || 0,
      partTickness: this.sharedService.convertUomToSaveAndCalculation(Number(material['partTickness'].value), conversionValue, isEnableUnitConversion),
      totalCostOfRawMaterials: material['totalCostOfRawMaterials'].value,
      cuttingLoss: material['cuttingLoss'].value,
      stockType: material['stockType'].value,
      scaleLoss: material['scaleLoss'].value,
      noOfInserts: material['noOfInserts'].value,
      cuttingAllowance: material['cuttingAllowance'].value,
      lengthAllowance: this.sharedService.convertUomToSaveAndCalculation(Number(material['lengthAllowance'].value), conversionValue, isEnableUnitConversion),
      sheetLength: this.sharedService.convertUomToSaveAndCalculation(Number(material['sheetLength'].value), conversionValue, isEnableUnitConversion),
    };
  }
}
