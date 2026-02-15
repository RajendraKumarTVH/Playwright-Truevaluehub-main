
import { SharedService } from '../services/shared';
import { MaterialInfoDto } from '../models/material-info.model';

export class MaterialInsulationJacketMappingService {
    constructor(public sharedService: SharedService) { }

    getInsulationJacketFormFields(materialInfoList, conversionValue, isEnableUnitConversion) {
        return {
            length: [
                materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimX), conversionValue, isEnableUnitConversion) : 0,
                [],
            ],
            width: [
                materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimY), conversionValue, isEnableUnitConversion) : 0,
                [],
            ],
            height: [
                materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimZ), conversionValue, isEnableUnitConversion) : 0,
                [],
            ],
            scrapRecCost: [0, []],
            partVolume: [
                materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimVolume), conversionValue, isEnableUnitConversion) : 0,
                [],
            ],
            grossMaterialCost: [0, []],
            perimeter: 0,
            partProjectArea: [0, []],
            netMaterialCost: [{ value: 0, disabled: true }],
        };
    }

    insulationJacketFormFieldsReset() {
        return {
            length: 0,
            width: 0,
            height: 0,
            partVolume: 0,
            scrapRecCost: 0,
            grossMaterialCost: 0,
            perimeter: 0,
            partProjectArea: 0,
            netMaterialCost: 0,
        };
    }

    insulationJacketFormPatch(materialInfo: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
        return {
            length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimX), conversionValue, isEnableUnitConversion),
            width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimY), conversionValue, isEnableUnitConversion),
            height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimZ), conversionValue, isEnableUnitConversion),
            partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimVolume), conversionValue, isEnableUnitConversion),
            scrapRecCost: this.sharedService.isValidNumber(Number(materialInfo.scrapRecCost)),
            grossMaterialCost: this.sharedService.isValidNumber(Number(materialInfo.materialCostPart)),
            perimeter: this.sharedService.isValidNumber(Number(materialInfo.perimeter)),
            partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimArea), conversionValue, isEnableUnitConversion),
            netMaterialCost: this.sharedService.isValidNumber(materialInfo?.netMatCost),
        };
    }

    insulationJacketSetCalculationObject(materialInfo, material, conversionValue, isEnableUnitConversion) {
        materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(material['partVolume'].value), conversionValue, isEnableUnitConversion);
        materialInfo.scrapRecCost = material['scrapRecCost'].value;
        materialInfo.materialCostPart = material['grossMaterialCost'].value;
        materialInfo.perimeter = material['perimeter'].value;
        materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(material['partProjectArea'].value, conversionValue, isEnableUnitConversion);
        materialInfo.netMatCost = material['netMaterialCost'].value;

        if (material['partVolume'].dirty !== undefined) materialInfo.isPartVolumeDirty = material['partVolume'].dirty;
        if (material['partProjectArea'].dirty !== undefined) materialInfo.isPartProjectedAreaDirty = material['partProjectArea'].dirty;
        if (material['perimeter'].dirty !== undefined) materialInfo.isPerimeterDirty = material['perimeter'].dirty;
    }

    insulationJacketFormPatchResults(result: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
        return {
            partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partVolume)), conversionValue, isEnableUnitConversion),
            scrapRecCost: this.sharedService.isValidNumber(Number(result.scrapRecCost)),
            grossMaterialCost: this.sharedService.isValidNumber(Number(result.materialCostPart)),
            perimeter: this.sharedService.isValidNumber(result.perimeter),
            partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partProjectedArea)), conversionValue, isEnableUnitConversion),
            netMaterialCost: this.sharedService.isValidNumber(Number(result.netMatCost)),
        };
    }

    insulationJacketSetPayload(material, conversionValue, isEnableUnitConversion) {
        return {
            dimX: this.sharedService.convertUomToSaveAndCalculation(Number(material['length'].value), conversionValue, isEnableUnitConversion),
            dimY: this.sharedService.convertUomToSaveAndCalculation(Number(material['width'].value), conversionValue, isEnableUnitConversion),
            dimZ: this.sharedService.convertUomToSaveAndCalculation(Number(material['height'].value), conversionValue, isEnableUnitConversion),
            partVolume: this.sharedService.convertUomToSaveAndCalculation(Number(material['partVolume'].value), conversionValue, isEnableUnitConversion),
            scrapRecCost: material['scrapRecCost'].value || 0,
            materialCostPart: material['grossMaterialCost'].value || 0,
            perimeter: material['perimeter'].value || 0,
            partProjectedArea: this.sharedService.convertUomToSaveAndCalculation(material['partProjectArea'].value, conversionValue, isEnableUnitConversion),
            netMatCost: material['netMaterialCost'].value || 0,
        };
    }
}
