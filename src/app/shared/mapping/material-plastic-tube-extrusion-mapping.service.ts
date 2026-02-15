import { Injectable } from '@angular/core';
import { MaterialInfoDto } from '../models';
import { SharedService } from '../../modules/costing/services/shared.service';
import { Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class MaterialPlasticTubeExtrusionMappingService {
  constructor(public sharedService: SharedService) {}
  getPlasticTubeExtrusionFormFields(materialInfoList, conversionValue, isEnableUnitConversion) {
    return {
      length: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimX), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      // width: [materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimY), conversionValue, isEnableUnitConversion) : 0, [Validators.required]],
      // height: [materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimZ), conversionValue, isEnableUnitConversion) : 0, [Validators.required]],
      wallAverageThickness: [0],
      partOuterDiameter: [0],
      partInnerDiameter: [0],
      partProjectArea: [0, [Validators.required]],
      partSurfaceArea: 0,
      noOfInserts: [0, [Validators.required]],

      partVolume: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimVolume), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      netWeight: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].netWeight) : 0, [Validators.required]],
      utilisation: [0, [Validators.required]],
      grossWeight: [0, [Validators.required]],
      scrapWeight: [0, [Validators.required]],
      grossMaterialCost: [0, [Validators.required]],
      scrapRecCost: [0, [Validators.required]],
      scrapRecovery: [90, [Validators.required]],
      regrindAllowance: [10, [Validators.required]],
      netMaterialCost: [{ value: 0, disabled: true }],
    };
  }

  plasticTubeExtrusionFormFieldsReset() {
    return {
      length: 0,
      // width: 0,
      // height: 0,
      wallAverageThickness: 0,
      partOuterDiameter: 0,
      partInnerDiameter: 0,
      partProjectArea: 0,
      partSurfaceArea: 0,
      noOfInserts: 0,
      partVolume: 0,
      netWeight: 0,
      utilisation: 1,
      grossWeight: 0,
      scrapWeight: 0,
      grossMaterialCost: 0,
      scrapRecCost: 0,
      scrapRecovery: 90,
      regrindAllowance: 10,
      netMaterialCost: 0,
    };
  }

  plasticTubeExtrusionFormPatch(materialInfo: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimX), conversionValue, isEnableUnitConversion),
      // width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimY), conversionValue, isEnableUnitConversion),
      // height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimZ), conversionValue, isEnableUnitConversion),
      wallAverageThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.wallAverageThickness), conversionValue, isEnableUnitConversion),
      partOuterDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partOuterDiameter), conversionValue, isEnableUnitConversion),
      partInnerDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo.partInnerDiameter), conversionValue, isEnableUnitConversion),
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimArea), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partSurfaceArea), conversionValue, isEnableUnitConversion),
      noOfInserts: this.sharedService.isValidNumber(materialInfo.noOfInserts),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimVolume), conversionValue, isEnableUnitConversion),
      netWeight: this.sharedService.isValidNumber(materialInfo?.netWeight),
      utilisation: this.sharedService.isValidNumber(materialInfo?.utilisation),
      grossWeight: this.sharedService.isValidNumber(Number(materialInfo?.grossWeight)),
      scrapWeight: this.sharedService.isValidNumber(Number(materialInfo?.scrapWeight)),
      grossMaterialCost: this.sharedService.isValidNumber(Number(materialInfo?.materialCostPart)),
      scrapRecCost: this.sharedService.isValidNumber(Number(materialInfo?.scrapRecCost)),
      scrapRecovery: materialInfo.scrapRecovery || 90,
      regrindAllowance: materialInfo.regrindAllowance || 10,
      netMaterialCost: this.sharedService.isValidNumber(materialInfo?.netMatCost),
    };
  }

  plasticTubeExtrusionSetCalculationObject(materialInfo: MaterialInfoDto, material, conversionValue, isEnableUnitConversion) {
    materialInfo.dimX = this.sharedService.convertUomToSaveAndCalculation(Number(material['length'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.dimY = this.sharedService.convertUomToSaveAndCalculation(Number(material['width'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.dimZ = this.sharedService.convertUomToSaveAndCalculation(Number(material['height'].value), conversionValue, isEnableUnitConversion);
    materialInfo.wallAverageThickness = this.sharedService.convertUomToSaveAndCalculation(material['wallAverageThickness'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partOuterDiameter = this.sharedService.convertUomToSaveAndCalculation(material['partOuterDiameter'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partInnerDiameter = this.sharedService.convertUomToSaveAndCalculation(material['partInnerDiameter'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(material['partProjectArea'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(Number(material['partSurfaceArea'].value), conversionValue, isEnableUnitConversion);
    materialInfo.noOfInserts = material['noOfInserts'].value || 0;
    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(material['partVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.netWeight = material['netWeight'].value;
    materialInfo.utilisation = material['utilisation'].value;
    materialInfo.grossWeight = material['grossWeight'].value;
    materialInfo.scrapWeight = material['scrapWeight'].value;
    materialInfo.materialCostPart = material['grossMaterialCost'].value;
    materialInfo.scrapRecCost = material['scrapRecCost'].value;
    materialInfo.scrapRecovery = Number(material['scrapRecovery'].value);
    materialInfo.regrindAllowance = Number(material['regrindAllowance'].value) || 10;
    materialInfo.netMatCost = material['netMaterialCost'].value;

    materialInfo.isAvgWallthickDirty = material['wallAverageThickness'].dirty;
    materialInfo.isPartOuterDiameterDirty = material['partOuterDiameter'].dirty;
    materialInfo.isPartInnerDiameterDirty = material['partInnerDiameter'].dirty;
    materialInfo.isPartProjectedAreaDirty = material['partProjectArea'].dirty;
    materialInfo.isPartSurfaceAreaDirty = material['partSurfaceArea'].dirty;
    materialInfo.isNoOfInsertsDirty = material['noOfInserts'].dirty;
    materialInfo.isPartVolumeDirty = material['partVolume'].dirty;
    materialInfo.isNetweightDirty = material['netWeight'].dirty;
    materialInfo.isutilisationDirty = material['utilisation'].dirty;
    materialInfo.isGrossWeightCoilDirty = material['grossWeight'].dirty;
    materialInfo.isScrapWeightDirty = material['scrapWeight'].dirty;
    materialInfo.isScrapRecoveryDirty = material['scrapRecovery'].dirty;
    materialInfo.isRegrindAllowanceDirty = material['regrindAllowance'].dirty;
  }

  plasticTubeExtrusionFormPatchResults(result: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      wallAverageThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.wallAverageThickness)), conversionValue, isEnableUnitConversion),
      partOuterDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partOuterDiameter)), conversionValue, isEnableUnitConversion),
      partInnerDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partInnerDiameter)), conversionValue, isEnableUnitConversion),
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partProjectedArea)), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partSurfaceArea)), conversionValue, isEnableUnitConversion),
      noOfInserts: this.sharedService.isValidNumber(Number(result.noOfInserts)),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partVolume)), conversionValue, isEnableUnitConversion),
      netWeight: this.sharedService.isValidNumber(Number(result.netWeight)),
      utilisation: this.sharedService.isValidNumber(Number(result.utilisation)),
      grossWeight: this.sharedService.isValidNumber(Number(result.grossWeight)),
      scrapWeight: this.sharedService.isValidNumber(Number(result.scrapWeight)),
      grossMaterialCost: this.sharedService.isValidNumber(Number(result.materialCostPart)),
      scrapRecCost: this.sharedService.isValidNumber(Number(result.scrapRecCost)),
      scrapRecovery: this.sharedService.isValidNumber(Number(result?.scrapRecovery)),
      regrindAllowance: this.sharedService.isValidNumber(Number(result?.regrindAllowance)) || 10,
      netMaterialCost: this.sharedService.isValidNumber(Number(result.netMatCost)),
    };
  }

  plasticTubeExtrusionSetPayload(material, conversionValue, isEnableUnitConversion) {
    return {
      dimX: this.sharedService.convertUomToSaveAndCalculation(material['length'].value || 0, conversionValue, isEnableUnitConversion),
      // dimY: this.sharedService.convertUomToSaveAndCalculation((material['width'].value || 0), conversionValue, isEnableUnitConversion),
      // dimZ: this.sharedService.convertUomToSaveAndCalculation((material['height'].value || 0), conversionValue, isEnableUnitConversion),
      wallAverageThickness: this.sharedService.convertUomToSaveAndCalculation(material['wallAverageThickness'].value || 0, conversionValue, isEnableUnitConversion),
      partOuterDiameter: this.sharedService.convertUomToSaveAndCalculation(material['partOuterDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      partInnerDiameter: this.sharedService.convertUomToSaveAndCalculation(material['partInnerDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      partProjectedArea: this.sharedService.convertUomToSaveAndCalculation(material['partProjectArea'].value, conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomToSaveAndCalculation(material['partSurfaceArea'].value || 0, conversionValue, isEnableUnitConversion),
      noOfInserts: material['noOfInserts'].value || 0,
      partVolume: this.sharedService.convertUomToSaveAndCalculation(material['partVolume'].value, conversionValue, isEnableUnitConversion),
      netWeight: material['netWeight'].value,
      utilisation: material['utilisation'].value,
      grossWeight: material['grossWeight'].value || 0,
      scrapWeight: material['scrapWeight'].value || 0,
      materialCostPart: material['grossMaterialCost'].value || 0,
      scrapRecCost: material['scrapRecCost'].value || 0,
      scrapRecovery: material['scrapRecovery'].value || 90,
      regrindAllowance: material['regrindAllowance'].value || 10,
      netMatCost: material['netMaterialCost'].value || 0,
    };
  }
}
