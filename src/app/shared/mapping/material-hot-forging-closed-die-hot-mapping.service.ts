import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MaterialInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MaterialHotForgingClosedDieHotMappingService {
  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService
  ) {}
  getHotForgingClosedDieHotFormFields(materialInfoList, conversionValue, isEnableUnitConversion) {
    return {
      netWeight: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].netWeight) : 0, [Validators.required]],
      partProjectArea: [0, [Validators.required]],
      projectedArea: [0, [Validators.required]],
      partVolume: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimVolume), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      length: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimX), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      width: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimY), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      height: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimZ), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      // density: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].density) : 0],
      blockLength: [0],
      blockWidth: [0],
      blockHeight: [0],
      stockDiameter: [0],
      grossWeight: [0, [Validators.required]],
      scrapWeight: [0, [Validators.required]],
      scrapRecCost: [0, [Validators.required]],
      utilisation: [0, [Validators.required]],
      perimeter: 0,
      flashVolume: 0,
      scaleLoss: 0,
      yeildUtilization: 0,
      totalCostOfRawMaterials: 0,
      partSurfaceArea: 0,
      stockOuterDiameter: [0],
      stockInnerDiameter: [0],
      cuttingLoss: 0,
      grossVolumne: 0,
      netMaterialCost: [{ value: 0, disabled: true }],
    };
  }
  hotForgingClosedDieHotFormFieldsReset() {
    return {
      netWeight: 0,
      partProjectArea: 0,
      projectedArea: 0,
      partVolume: 0,
      length: 0,
      width: 0,
      height: 0,
      // density: 0,
      blockLength: 0,
      blockWidth: 0,
      blockHeight: 0,
      stockDiameter: 0,
      grossWeight: 0,
      scrapWeight: 0,
      scrapRecCost: 0,
      utilisation: 0,
      perimeter: 0,
      flashVolume: 0,
      scaleLoss: 0,
      yeildUtilization: 0,
      totalCostOfRawMaterials: 0,
      partSurfaceArea: 0,
      stockOuterDiameter: 0,
      stockInnerDiameter: 0,
      cuttingLoss: 0,
      grossVolumne: 0,
      netMaterialCost: 0,
    };
  }
  hotForgingClosedDieHotFormPatch(materialInfo: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      netWeight: this.sharedService.isValidNumber(materialInfo?.netWeight),
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimArea), conversionValue, isEnableUnitConversion),
      projectedArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.projectedArea), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimVolume), conversionValue, isEnableUnitConversion),
      length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimX), conversionValue, isEnableUnitConversion),
      width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimY), conversionValue, isEnableUnitConversion),
      height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimZ), conversionValue, isEnableUnitConversion),
      // density: this.sharedService.isValidNumber(materialInfo?.density),
      blockLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.blockLength) || 0, conversionValue, isEnableUnitConversion),
      blockWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.blockWidth) || 0, conversionValue, isEnableUnitConversion),
      blockHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.blockHeight) || 0, conversionValue, isEnableUnitConversion),
      stockDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockDiameter) || 0, conversionValue, isEnableUnitConversion),
      grossWeight: this.sharedService.isValidNumber(Number(materialInfo.grossWeight)),
      scrapWeight: this.sharedService.isValidNumber(Number(materialInfo.scrapWeight)),
      scrapRecCost: this.sharedService.isValidNumber(Number(materialInfo.scrapRecCost)),
      utilisation: this.sharedService.isValidNumber(Number(materialInfo.utilisation)),
      perimeter: materialInfo.perimeter,
      flashVolume: materialInfo.flashVolume,
      scaleLoss: materialInfo.scaleLoss,
      yeildUtilization: materialInfo.yeildUtilization,
      totalCostOfRawMaterials: materialInfo.totalCostOfRawMaterials,
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partSurfaceArea), conversionValue, isEnableUnitConversion),
      stockOuterDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockOuterDiameter) || 0, conversionValue, isEnableUnitConversion),
      stockInnerDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockInnerDiameter) || 0, conversionValue, isEnableUnitConversion),
      cuttingLoss: materialInfo.cuttingLoss,
      grossVolumne: materialInfo.grossVolumne,
      netMaterialCost: this.sharedService.isValidNumber(materialInfo?.netMatCost),
    };
  }
  hotForgingClosedDieHotSetCalculationObject(materialInfo, material, conversionValue, isEnableUnitConversion) {
    materialInfo.netWeight = material['netWeight'].value;
    materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(material['partProjectArea'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfo.projectedArea = this.sharedService.convertUomToSaveAndCalculation(material['projectedArea'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(material['partVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.length = this.sharedService.convertUomToSaveAndCalculation(material['length'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfo.width = this.sharedService.convertUomToSaveAndCalculation(Number(material['width'].value), conversionValue, isEnableUnitConversion);
    materialInfo.height = this.sharedService.convertUomToSaveAndCalculation(Number(material['height'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.density = material['density'].value != null ? material['density'].value : defaultValues.density;
    materialInfo.blockLength = this.sharedService.convertUomToSaveAndCalculation(Number(material['blockLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.blockWidth = this.sharedService.convertUomToSaveAndCalculation(Number(material['blockWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.blockHeight = this.sharedService.convertUomToSaveAndCalculation(Number(material['blockHeight'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(material['stockDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.grossWeight = material['grossWeight'].value;
    materialInfo.scrapWeight = material['scrapWeight'].value;
    materialInfo.utilisation = material['utilisation'].value;
    materialInfo.perimeter = this.sharedService.convertUomToSaveAndCalculation(Number(material['perimeter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.flashVolume = this.sharedService.convertUomToSaveAndCalculation(Number(material['flashVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.scaleLoss = this.sharedService.convertUomToSaveAndCalculation(Number(material['scaleLoss'].value), conversionValue, isEnableUnitConversion);
    materialInfo.yeildUtilization = this.sharedService.convertUomToSaveAndCalculation(Number(material['yeildUtilization'].value), conversionValue, isEnableUnitConversion);
    materialInfo.totalCostOfRawMaterials = this.sharedService.convertUomToSaveAndCalculation(Number(material['totalCostOfRawMaterials'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(Number(material['partSurfaceArea'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockOuterDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(material['stockOuterDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockInnerDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(material['stockInnerDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.cuttingLoss = this.sharedService.convertUomToSaveAndCalculation(Number(material['cuttingLoss'].value), conversionValue, isEnableUnitConversion);
    materialInfo.grossVolumne = this.sharedService.convertUomToSaveAndCalculation(Number(material['grossVolumne'].value), conversionValue, isEnableUnitConversion);

    materialInfo.isNetweightDirty = material['netWeight'].dirty;
    materialInfo.isPartProjectedAreaDirty = material['partProjectArea'].dirty;
    materialInfo.isProjectedAreaDirty = material['projectedArea'].dirty;
    materialInfo.isPartVolumeDirty = material['partVolume'].dirty;
    // materialInfo.isDensityDirty = material['density'].dirty;
    materialInfo.isBlockLengthDirty = material['blockLength'].dirty;
    materialInfo.isStockDiameterDirty = material['stockDiameter'].dirty;
    materialInfo.isGrossWeightDirty = material['grossWeight'].dirty;
    materialInfo.isScrapWeightDirty = material['scrapWeight'].dirty;
    materialInfo.isutilisationDirty = material['utilisation'].dirty;
    materialInfo.isPerimeterDirty = material['perimeter'].dirty;
    materialInfo.isFlashVolumeDirty = material['flashVolume'].dirty;
    materialInfo.isScaleLossDirty = material['scaleLoss'].dirty;
    materialInfo.isYeildUtilizationDirty = material['yeildUtilization'].dirty;
    materialInfo.isTotalCostOfRawMaterialsDirty = material['totalCostOfRawMaterials'].dirty;
    materialInfo.isPartSurfaceAreaDirty = material['partSurfaceArea'].dirty;
    materialInfo.isStockOuterDiameterDirty = material['stockOuterDiameter'].dirty;
    materialInfo.isStockInnerDiameterDirty = material['stockInnerDiameter'].dirty;
    materialInfo.isCuttingLoss = material['cuttingLoss'].dirty;
    materialInfo.isGrossVolumneDirty = material['grossVolumne'].dirty;
  }
  hotForgingClosedDieHotFormPatchResults(result: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      netWeight: this.sharedService.isValidNumber(Number(result.netWeight)),
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partProjectedArea)), conversionValue, isEnableUnitConversion),
      projectedArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.projectedArea)), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partVolume)), conversionValue, isEnableUnitConversion),
      // density: this.sharedService.isValidNumber(Number(result.density)),
      blockLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result?.blockLength)), conversionValue, isEnableUnitConversion),
      blockWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result?.blockWidth)), conversionValue, isEnableUnitConversion),
      blockHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result?.blockHeight)), conversionValue, isEnableUnitConversion),
      stockDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockDiameter), conversionValue, isEnableUnitConversion),
      grossWeight: this.sharedService.isValidNumber(Number(result.grossWeight)),
      scrapWeight: this.sharedService.isValidNumber(Number(result.scrapWeight)),
      scrapRecCost: this.sharedService.isValidNumber(Number(result.scrapRecCost)),
      utilisation: this.sharedService.isValidNumber(Number(result.utilisation)),
      perimeter: this.sharedService.isValidNumber(result.perimeter),
      flashVolume: this.sharedService.isValidNumber(result.flashVolume),
      scaleLoss: this.sharedService.isValidNumber(result.scaleLoss),
      yeildUtilization: this.sharedService.isValidNumber(result.yeildUtilization),
      totalCostOfRawMaterials: this.sharedService.isValidNumber(result.totalCostOfRawMaterials),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.partSurfaceArea), conversionValue, isEnableUnitConversion),
      stockOuterDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockOuterDiameter), conversionValue, isEnableUnitConversion),
      stockInnerDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockInnerDiameter), conversionValue, isEnableUnitConversion),
      cuttingLoss: this.sharedService.isValidNumber(result.cuttingLoss),
      grossVolumne: this.sharedService.isValidNumber(result.grossVolumne),
      netMaterialCost: this.sharedService.isValidNumber(Number(result.netMatCost)),
    };
  }
  hotForgingClosedDieHotSetPayload(material, conversionValue, isEnableUnitConversion) {
    return {
      netWeight: material['netWeight'].value,
      partProjectedArea: this.sharedService.convertUomToSaveAndCalculation(material['partProjectArea'].value || 0, conversionValue, isEnableUnitConversion),
      projectedArea: this.sharedService.convertUomToSaveAndCalculation(material['projectedArea'].value || 0, conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomToSaveAndCalculation(material['partVolume'].value, conversionValue, isEnableUnitConversion),
      length: this.sharedService.convertUomToSaveAndCalculation(material['length'].value || 0, conversionValue, isEnableUnitConversion),
      width: this.sharedService.convertUomToSaveAndCalculation(Number(material['width'].value), conversionValue, isEnableUnitConversion),
      height: this.sharedService.convertUomToSaveAndCalculation(material['height'].value || 0, conversionValue, isEnableUnitConversion),
      dimX: this.sharedService.convertUomToSaveAndCalculation(material['length'].value || 0, conversionValue, isEnableUnitConversion),
      dimY: this.sharedService.convertUomToSaveAndCalculation(Number(material['width'].value), conversionValue, isEnableUnitConversion),
      dimZ: this.sharedService.convertUomToSaveAndCalculation(material['height'].value || 0, conversionValue, isEnableUnitConversion),
      // density: material['density'].value || 0,
      blockLength: this.sharedService.convertUomToSaveAndCalculation(material['blockLength'].value || 0, conversionValue, isEnableUnitConversion),
      blockWidth: this.sharedService.convertUomToSaveAndCalculation(material['blockWidth'].value || 0, conversionValue, isEnableUnitConversion),
      blockHeight: this.sharedService.convertUomToSaveAndCalculation(material['blockHeight'].value || 0, conversionValue, isEnableUnitConversion),
      stockDiameter: this.sharedService.convertUomToSaveAndCalculation(material['stockDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      grossWeight: material['grossWeight'].value || 0,
      scrapWeight: material['scrapWeight'].value || 0,
      scrapRecCost: material['scrapRecCost'].value || 0,
      utilisation: material['utilisation'].value || 0,
      perimeter: this.sharedService.convertUomToSaveAndCalculation(material['perimeter'].value, conversionValue, isEnableUnitConversion),
      flashVolume: this.sharedService.convertUomToSaveAndCalculation(material['flashVolume'].value, conversionValue, isEnableUnitConversion),
      scaleLoss: this.sharedService.convertUomToSaveAndCalculation(material['scaleLoss'].value, conversionValue, isEnableUnitConversion),
      yeildUtilization: this.sharedService.convertUomToSaveAndCalculation(material['yeildUtilization'].value, conversionValue, isEnableUnitConversion),
      totalCostOfRawMaterials: this.sharedService.convertUomToSaveAndCalculation(material['totalCostOfRawMaterials'].value, conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomToSaveAndCalculation(material['partSurfaceArea'].value || 0, conversionValue, isEnableUnitConversion),
      stockOuterDiameter: this.sharedService.convertUomToSaveAndCalculation(material['stockOuterDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      stockInnerDiameter: this.sharedService.convertUomToSaveAndCalculation(material['stockInnerDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      cuttingLoss: this.sharedService.convertUomToSaveAndCalculation(material['cuttingLoss'].value, conversionValue, isEnableUnitConversion),
      grossVolumne: this.sharedService.convertUomToSaveAndCalculation(material['grossVolumne'].value, conversionValue, isEnableUnitConversion),
      netMaterialCost: material['netMaterialCost'].value || 0,
    };
  }
}
