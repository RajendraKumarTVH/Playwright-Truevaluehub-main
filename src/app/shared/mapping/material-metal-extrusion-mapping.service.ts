import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../modules/costing/services/shared.service';
import { MaterialInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MaterialMetalExtrusionMappingService {
  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService
  ) {}

  getMetalExtrusionMaterialFormFields(materialInfoList, conversionValue, isEnableUnitConversion) {
    return {
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
      stockType: [1],
      partProjectArea: [0, [Validators.required]],
      partVolume: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimVolume), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      inputBilletDiameter: [0],
      ultimateTensileStrength: [0],
      netWeight: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].netWeight) : 0, [Validators.required]],
      utilisation: [0, [Validators.required]],
      grossWeight: [0, [Validators.required]],
      scrapWeight: [0, [Validators.required]],
      grossMaterialCost: [0, [Validators.required]],
      scrapRecCost: [0, [Validators.required]],
      netMaterialCost: [{ value: 0, disabled: true }],
    };
  }
  metalExtrusionMaterialFormFieldsReset() {
    return {
      length: 0,
      width: 0,
      height: 0,
      stockType: 1,
      partProjectArea: 0,
      partVolume: 0,
      inputBilletDiameter: 0,
      ultimateTensileStrength: 0,
      netWeight: 0,
      utilisation: 1,
      grossWeight: 0,
      scrapWeight: 0,
      grossMaterialCost: 0,
      scrapRecCost: 0,
      netMaterialCost: 0,
    };
  }
  metalExtrusionMaterialFormPatch(materialInfo: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimX), conversionValue, isEnableUnitConversion),
      width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimY), conversionValue, isEnableUnitConversion),
      height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimZ), conversionValue, isEnableUnitConversion),
      stockType: materialInfo?.stockType,
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimArea), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimVolume), conversionValue, isEnableUnitConversion),
      inputBilletDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.inputBilletDiameter), conversionValue, isEnableUnitConversion),
      ultimateTensileStrength: this.sharedService.isValidNumber(materialInfo?.ultimateTensileStrength),
      netWeight: this.sharedService.isValidNumber(materialInfo?.netWeight),
      utilisation: this.sharedService.isValidNumber(materialInfo?.utilisation),
      grossWeight: this.sharedService.isValidNumber(Number(materialInfo?.grossWeight)),
      scrapWeight: this.sharedService.isValidNumber(Number(materialInfo?.scrapWeight)),
      grossMaterialCost: this.sharedService.isValidNumber(Number(materialInfo?.materialCostPart)),
      scrapRecCost: this.sharedService.isValidNumber(Number(materialInfo?.scrapRecCost)),
      netMaterialCost: this.sharedService.isValidNumber(materialInfo?.netMatCost),
    };
  }
  metalExtrusionSetCalculationObject(materialInfo, material, conversionValue, isEnableUnitConversion) {
    materialInfo.dimX = this.sharedService.convertUomToSaveAndCalculation(Number(material['length'].value), conversionValue, isEnableUnitConversion);
    materialInfo.dimY = this.sharedService.convertUomToSaveAndCalculation(Number(material['width'].value), conversionValue, isEnableUnitConversion);
    materialInfo.dimZ = this.sharedService.convertUomToSaveAndCalculation(Number(material['height'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockType = material['stockType'];
    materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(material['partProjectArea'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(material['partVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.inputBilletDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(material['inputBilletDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.ultimateTensileStrength = material['ultimateTensileStrength'].value;
    materialInfo.netWeight = material['netWeight'].value;
    materialInfo.utilisation = material['utilisation'].value;
    materialInfo.grossWeight = material['grossWeight'].value;
    materialInfo.scrapWeight = material['scrapWeight'].value;
    materialInfo.materialCostPart = material['grossMaterialCost'].value;
    materialInfo.scrapRecCost = material['scrapRecCost'].value;
    materialInfo.netMatCost = material['netMaterialCost'].value;

    materialInfo.isPartProjectedAreaDirty = material['partProjectArea'].dirty;
    materialInfo.isPartVolumeDirty = material['partVolume'].dirty;
    materialInfo.isInputBilletLengthDirty = material['inputBilletDiameter'].dirty;
    materialInfo.isNetweightDirty = material['netWeight'].dirty;
    materialInfo.isutilisationDirty = material['utilisation'].dirty;
    materialInfo.isGrossWeightCoilDirty = material['grossWeight'].dirty;
    materialInfo.isScrapWeightDirty = material['scrapWeight'].dirty;
  }

  metalExtrusionMaterialFormPatchResults(result: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partProjectedArea)), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partVolume)), conversionValue, isEnableUnitConversion),
      inputBilletDiameter: this.sharedService.isValidNumber(Number(result.inputBilletDiameter)),
      netWeight: this.sharedService.isValidNumber(Number(result.netWeight)),
      utilisation: this.sharedService.isValidNumber(Number(result.utilisation)),
      grossWeight: this.sharedService.isValidNumber(Number(result.grossWeight)),
      scrapWeight: this.sharedService.isValidNumber(Number(result.scrapWeight)),
      grossMaterialCost: this.sharedService.isValidNumber(Number(result.materialCostPart)),
      scrapRecCost: this.sharedService.isValidNumber(Number(result.scrapRecCost)),
      netMaterialCost: this.sharedService.isValidNumber(Number(result.netMatCost)),
    };
  }

  metalExtrusionMaterialPayload(material, conversionValue, isEnableUnitConversion) {
    return {
      dimX: this.sharedService.convertUomToSaveAndCalculation(material['length'].value || 0, conversionValue, isEnableUnitConversion),
      dimY: this.sharedService.convertUomToSaveAndCalculation(material['width'].value || 0, conversionValue, isEnableUnitConversion),
      dimZ: this.sharedService.convertUomToSaveAndCalculation(material['height'].value || 0, conversionValue, isEnableUnitConversion),
      stockType: material['stockType'].value,
      partProjectedArea: this.sharedService.convertUomToSaveAndCalculation(material['partProjectArea'].value, conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomToSaveAndCalculation(material['partVolume'].value, conversionValue, isEnableUnitConversion),
      inputBilletDiameter: this.sharedService.convertUomToSaveAndCalculation(material['inputBilletDiameter'].value, conversionValue, isEnableUnitConversion),
      ultimateTensileStrength: material['ultimateTensileStrength'].value,
      netWeight: material['netWeight'].value,
      utilisation: material['utilisation'].value,
      grossWeight: material['grossWeight'].value || 0,
      scrapWeight: material['scrapWeight'].value || 0,
      materialCostPart: material['grossMaterialCost'].value || 0,
      scrapRecCost: material['scrapRecCost'].value || 0,
      netMatCost: material['netMaterialCost'].value || 0,
    };
  }
}
