import { Injectable } from '@angular/core';
import { MaterialInfoDto } from '../models';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class MaterialCustomCableMappingService {
  constructor(
    public sharedService: SharedService,
    private formbuilder: FormBuilder
  ) {}
  getFormFields(materialInfoList, conversionValue, isEnableUnitConversion) {
    return {
      typeOfCable: 0,
      typeOfConductor: 0,
      totalCableLength: 0,
      noOfCables: 0,
      flashVolume: 0,
      noOfCablesWithSameDia: 0,
      mainInsulatorID: 0,
      mainInsulatorOD: 0,
      mainCableSheathingMaterial: 0,
      materialPkgs: this.formbuilder.array([]),
      netMaterialCost: [{ value: 0, disabled: true }],
      partProjectArea: 0,
      totalPouringWeight: [0],
      grossWeight: [0, [Validators.required]],
      sheetLength: 0,
      partOuterDiameter: [0],
      partInnerDiameter: [0],
      stockLength: [0],
      pouringWeight: [0],
      netWeight: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].netWeight) : 0, [Validators.required]],
      percentageOfReduction: 0,
      noOfDrawSteps: 12,
      noOfCavities: [1, [Validators.required]],
      partVolume: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimVolume), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      matPrice: [0, [Validators.required]],
      scrapPrice: [0, [Validators.required]],
      density: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].density) : 0, [Validators.required]],
      grossMaterialCost: [0, [Validators.required]],
    };
  }

  formFieldsReset() {
    return {
      typeOfCable: 0,
      typeOfConductor: 0,
      totalCableLength: 0,
      noOfCables: 0,
      flashVolume: 0,
      noOfCablesWithSameDia: 0,
      mainInsulatorID: 0,
      mainInsulatorOD: 0,
      mainCableSheathingMaterial: 0,
      netMaterialCost: 0,
      partProjectArea: 0,
      totalPouringWeight: 0,
      grossWeight: 0,
      sheetLength: 0,
      partOuterDiameter: 0,
      partInnerDiameter: 0,
      stockLength: 0,
      pouringWeight: 0,
      netWeight: 0,
      percentageOfReduction: 0,
      noOfDrawSteps: 12,
      noOfCavities: 1,
      partVolume: 0,
      matPrice: 0,
      scrapPrice: 0,
      grossMaterialCost: 0,
      density: 0,
    };
  }

  formPatch(materialInfo: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      typeOfCable: materialInfo?.typeOfCable,
      typeOfConductor: materialInfo?.typeOfConductor,
      totalCableLength: materialInfo?.totalCableLength,
      noOfCables: materialInfo?.noOfCables,
      flashVolume: materialInfo.flashVolume,
      noOfCablesWithSameDia: materialInfo?.noOfCablesWithSameDia,
      mainInsulatorID: materialInfo?.mainInsulatorID,
      mainInsulatorOD: materialInfo?.mainInsulatorOD,
      mainCableSheathingMaterial: this.sharedService.isValidNumber(materialInfo?.mainCableSheathingMaterial),
      netMaterialCost: this.sharedService.isValidNumber(materialInfo?.netMatCost),
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimArea), conversionValue, isEnableUnitConversion),
      totalPouringWeight: this.sharedService.isValidNumber(materialInfo?.totalPartStockLength) || 0,
      grossWeight: this.sharedService.isValidNumber(Number(materialInfo.grossWeight)),
      sheetLength: this.sharedService.isValidNumber(materialInfo?.sheetLength),
      partOuterDiameter: this.sharedService.convertUomInUI(materialInfo.partOuterDiameter, conversionValue, isEnableUnitConversion),
      partInnerDiameter: this.sharedService.convertUomInUI(materialInfo.partInnerDiameter, conversionValue, isEnableUnitConversion),
      stockLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockLength) || 0, conversionValue, isEnableUnitConversion),
      pouringWeight: this.sharedService.isValidNumber(materialInfo?.pouringWeight) || 0,
      netWeight: this.sharedService.isValidNumber(materialInfo?.netWeight),
      percentageOfReduction: materialInfo?.percentageOfReduction,
      noOfDrawSteps: materialInfo?.noOfDrawSteps,
      noOfCavities: materialInfo.noOfCavities,
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimVolume), conversionValue, isEnableUnitConversion),
      matPrice: this.sharedService.isValidNumber(materialInfo?.materialPricePerKg) || this.sharedService.isValidNumber(Number(materialInfo?.materialMarketData?.price)),
      scrapPrice: this.sharedService.isValidNumber(materialInfo.scrapPricePerKg) || this.sharedService.isValidNumber(materialInfo?.materialMarketData?.generalScrapPrice),
      grossMaterialCost: this.sharedService.isValidNumber(Number(materialInfo.materialCostPart)),
      density: this.sharedService.isValidNumber(materialInfo?.density),
    };
  }

  materialDirtyCheck(materialInfo: MaterialInfoDto, formCtrl) {
    materialInfo.isTypeOfCableDirty = formCtrl['typeOfCable'].dirty;
    materialInfo.isFlashVolumeDirty = formCtrl['flashVolume'].dirty;
    materialInfo.isPartProjectedAreaDirty = formCtrl['partProjectArea'].dirty;
    materialInfo.isTotalPouringWeightDirty = formCtrl['totalPouringWeight'].dirty;
    materialInfo.isSheetLengthDirty = formCtrl['sheetLength'].dirty;
    materialInfo.isPartOuterDiameterDirty = formCtrl['partOuterDiameter'].dirty;
    materialInfo.isPartInnerDiameterDirty = formCtrl['partInnerDiameter'].dirty;
    materialInfo.isStockLengthDirty = formCtrl['stockLength'].dirty;
    materialInfo.isPouringWeightDirty = formCtrl['pouringWeight'].dirty;
    materialInfo.isNetweightDirty = formCtrl['netWeight'].dirty;
    materialInfo.isNoOfDrawStepsDirty = formCtrl['noOfDrawSteps'].dirty;
    materialInfo.isPercentageOfReductionDirty = formCtrl['percentageOfReduction'].dirty;
    materialInfo.isNoOfCavitiesDirty = formCtrl['noOfCavities'].dirty;
    materialInfo.isPartVolumeDirty = formCtrl['partVolume'].dirty;
    materialInfo.isMatPriceDirty = formCtrl['matPrice'].dirty;
    materialInfo.isScrapPriceDirty = formCtrl['scrapPrice'].dirty;
    materialInfo.isDensityDirty = formCtrl['density'].dirty;
  }

  materialFormAssignValue(materialInfo: MaterialInfoDto, formCtrl, conversionValue, isEnableUnitConversion) {
    materialInfo.typeOfCable = formCtrl['typeOfCable'].value;
    materialInfo.typeOfConductor = formCtrl['typeOfConductor'].value;
    materialInfo.totalCableLength = formCtrl['totalCableLength'].value;
    materialInfo.noOfCables = formCtrl['noOfCables'].value;
    materialInfo.flashVolume = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['flashVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.noOfCablesWithSameDia = formCtrl['noOfCablesWithSameDia'].value;
    materialInfo.mainInsulatorID = formCtrl['mainInsulatorID'].value;
    materialInfo.mainInsulatorOD = formCtrl['mainInsulatorOD'].value;
    materialInfo.mainCableSheathingMaterial = formCtrl['mainCableSheathingMaterial'].value;
    materialInfo.netMatCost = formCtrl['netMaterialCost'].value;
    materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partProjectArea'].value, conversionValue, isEnableUnitConversion);
    materialInfo.totalPouringWeight = formCtrl['totalPouringWeight'].value;
    materialInfo.grossWeight = formCtrl['grossWeight'].value;
    materialInfo.sheetLength = formCtrl['sheetLength'].value;
    materialInfo.partOuterDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partOuterDiameter'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partInnerDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partInnerDiameter'].value, conversionValue, isEnableUnitConversion);
    materialInfo.stockLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['stockLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.pouringWeight = formCtrl['pouringWeight'].value;
    materialInfo.netWeight = formCtrl['netWeight'].value;
    materialInfo.percentageOfReduction = formCtrl['percentageOfReduction'].value;
    materialInfo.noOfDrawSteps = formCtrl['noOfDrawSteps'].value;
    materialInfo.noOfCavities = Number(formCtrl['noOfCavities'].value);
    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partVolume'].value), conversionValue, isEnableUnitConversion);
  }

  defaultValuesForCalculation(materialInfo: MaterialInfoDto, customCableMarketDataDto) {
    const materialMaster = customCableMarketDataDto?.materialMarketData?.materialMaster;
    materialInfo.materialMarketData = customCableMarketDataDto?.materialMarketData;
    materialInfo.density = Number(materialMaster?.density);
    materialInfo.materialPricePerKg = customCableMarketDataDto?.materialMarketData?.price;
    materialInfo.scrapPricePerKg = customCableMarketDataDto?.materialMarketData?.generalScrapPrice;
    materialInfo.materialMasterId = materialMaster.materialMasterId;
    materialInfo.materialDescriptionList = customCableMarketDataDto?.materialMasterDto;
  }

  formPatchResults(result: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      typeOfCable: this.sharedService.isValidNumber(result.typeOfCable),
      totalCableLength: this.sharedService.isValidNumber(result.totalCableLength),
      noOfCables: this.sharedService.isValidNumber(result.noOfCables),
      flashVolume: this.sharedService.isValidNumber(result.flashVolume),
      noOfCablesWithSameDia: this.sharedService.isValidNumber(result.noOfCablesWithSameDia),
      mainInsulatorID: this.sharedService.isValidNumber(result.mainInsulatorID),
      mainInsulatorOD: this.sharedService.isValidNumber(result.mainInsulatorOD),
      netMaterialCost: this.sharedService.isValidNumber(Number(result.netMatCost)),
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partProjectedArea)), conversionValue, isEnableUnitConversion),
      totalPouringWeight: this.sharedService.isValidNumber(Number(result?.totalPouringWeight)),
      grossWeight: this.sharedService.isValidNumber(Number(result.grossWeight)),
      sheetLength: this.sharedService.isValidNumber(result.sheetLength),
      partOuterDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partOuterDiameter)), conversionValue, isEnableUnitConversion),
      partInnerDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partInnerDiameter)), conversionValue, isEnableUnitConversion),
      stockLength: this.sharedService.isValidNumber(result.stockLength),
      pouringWeight: this.sharedService.isValidNumber(Number(result?.pouringWeight)),
      netWeight: this.sharedService.isValidNumber(Number(result.netWeight)),
      percentageOfReduction: this.sharedService.isValidNumber(result.percentageOfReduction),
      noOfDrawSteps: this.sharedService.isValidNumber(result.noOfDrawSteps),
      noOfCavities: this.sharedService.isValidNumber(Number(result?.noOfCavities)),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partVolume)), conversionValue, isEnableUnitConversion),
      matPrice: this.sharedService.isValidNumber(Number(result.materialPricePerKg)),
      scrapPrice: this.sharedService.isValidNumber(Number(result.scrapPricePerKg)),
      grossMaterialCost: this.sharedService.isValidNumber(Number(result.materialCostPart)),
      density: this.sharedService.isValidNumber(Number(result.density)),
    };
  }

  setPayload(formCtrl, materialMarketData, conversionValue, isEnableUnitConversion) {
    return {
      typeOfCable: Number(formCtrl['typeOfCable'].value),
      typeOfConductor: Number(formCtrl['typeOfConductor'].value),
      totalCableLength: Number(formCtrl['totalCableLength'].value) || 0,
      noOfCables: Number(formCtrl['noOfCables'].value) || 0,
      flashVolume: this.sharedService.convertUomToSaveAndCalculation(formCtrl['flashVolume'].value, conversionValue, isEnableUnitConversion),
      noOfCablesWithSameDia: formCtrl['noOfCablesWithSameDia'].value || 0,
      mainInsulatorID: formCtrl['mainInsulatorID'].value,
      mainInsulatorOD: formCtrl['mainInsulatorOD'].value,
      mainCableSheathingMaterial: formCtrl['mainCableSheathingMaterial'].value,
      netMatCost: formCtrl['netMaterialCost'].value || 0,
      partProjectedArea: this.sharedService.convertUomToSaveAndCalculation(formCtrl['partProjectArea'].value, conversionValue, isEnableUnitConversion),
      totalPouringWeight: formCtrl['totalPouringWeight'].value || 0,
      grossWeight: formCtrl['grossWeight'].value || 0,
      sheetLength: formCtrl['sheetLength'].value || 0,
      partOuterDiameter: this.sharedService.convertUomToSaveAndCalculation(formCtrl['partOuterDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      partInnerDiameter: this.sharedService.convertUomToSaveAndCalculation(formCtrl['partInnerDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      stockLength: this.sharedService.convertUomToSaveAndCalculation(formCtrl['stockLength'].value || 0, conversionValue, isEnableUnitConversion),
      pouringWeight: formCtrl['pouringWeight'].value || 0,
      netWeight: formCtrl['netWeight'].value,
      percentageOfReduction: formCtrl['percentageOfReduction'].value,
      noOfDrawSteps: formCtrl['noOfDrawSteps'].value,
      noOfCavities: formCtrl['noOfCavities'].value || 1,
      dimVolume: this.sharedService.convertUomToSaveAndCalculation(formCtrl['partVolume'].value || 0, conversionValue, isEnableUnitConversion),
      materialPricePerKg: formCtrl['matPrice'].value || 0,
      scrapPricePerKg: formCtrl['scrapPrice'].value || 0,
      materialCostPart: formCtrl['grossMaterialCost'].value || 0,
      density: formCtrl['density'].value || 0,
    };
  }
}
