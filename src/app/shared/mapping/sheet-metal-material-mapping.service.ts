import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MaterialInfoDto } from '../models';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class SheetMetalMaterialMappingService {
  constructor(
    public sharedService: SharedService,
    private formbuilder: FormBuilder
  ) {}
  getFormFields() {
    return {
      length: 0,
      width: 0,
      height: 0,
      thickness: 0,
      partSurfaceArea: 0,
      partVolume: 0,
      netWeight: 0,
      utilisation: 0,
      grossWeight: 0,
      scrapWeight: 0,
      scrapRecovery: 0,
      grossMaterialCost: 0,
      scrapRecCost: 0,
      netMaterialCost: 0,
      runnerType: '', // Edge Allowances
      partShape: '', // Clamping Allownace
      runnerDia: 0, // Bottom Side A
      runnerLength: 0, // Left Side B

      coilLength: 0,
      coilWidth: 0,
      unfoldedLength: 0,
      unfoldedWidth: 0,
      partAllowance: 0,
      partsPerCoil: 0,

      moldBoxLength: 0, // Bottom Edge Allowance(U)
      moldBoxWidth: 0, // Left Edge Allowance(D)
      moldBoxHeight: 0, // Top Edge Allowance(S)
      moldSandWeight: 0, // Right Edge Allowance(N)
      typeOfCable: 0,

      // materialDesc:'',
      // countryName:'',
      // density: 0,
      totalWeldLength: 0,
      effeciency: 0,
      weldWeightWastage: 0,
      // materialYield:0,
      // ultimateTensileStrength:0,
      // shearingStrength:0,
      materialPkgs: this.formbuilder.array([]),

      // Plating
      paintCoatingTickness: 0,
      pouringWeight: 0,
      oxidationLossWeight: 0,

      //galvanization
      typeOfMaterialBase: 0,
      percentageOfReduction: 0,
      paintArea: 0,
    };
  }

  formFieldsReset() {
    return {
      length: 0,
      width: 0,
      height: 0,
      thickness: 0,
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
      netMaterialCost: 0,
      runnerType: '', // Edge Allowances
      partShape: '', // Clamping Allownace
      runnerDia: 0,
      runnerLength: 0,
      coilLength: 0,
      coilWidth: 0,
      unfoldedLength: 0,
      unfoldedWidth: 0,
      partAllowance: 0,
      partsPerCoil: 0,
      moldBoxLength: 0,
      moldBoxWidth: 0,
      moldBoxHeight: 0,
      moldSandWeight: 0,
      typeOfCable: 0,

      // density: 0,
      totalWeldLength: 0,
      effeciency: 0,
      weldWeightWastage: 0,

      // Plating
      paintCoatingTickness: 0,
      pouringWeight: 0,
      oxidationLossWeight: 0,

      //galvanization
      typeOfMaterialBase: 0,
      percentageOfReduction: 0,
      paintArea: 0,
    };
  }

  formPatch(materialInfo: MaterialInfoDto, conversionValue: any, isEnableUnitConversion: boolean) {
    return {
      length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimX), conversionValue, isEnableUnitConversion),
      width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimY), conversionValue, isEnableUnitConversion),
      height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimZ), conversionValue, isEnableUnitConversion),
      thickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimUnfoldedZ), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partSurfaceArea), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partVolume), conversionValue, isEnableUnitConversion),
      netWeight: materialInfo?.netWeight,
      utilisation: materialInfo?.utilisation,
      grossWeight: materialInfo?.grossWeight,
      scrapWeight: materialInfo?.scrapWeight,
      scrapRecovery: materialInfo?.scrapRecovery,
      grossMaterialCost: materialInfo?.materialCostPart,
      scrapRecCost: materialInfo?.scrapRecCost,
      netMaterialCost: materialInfo?.netMatCost,
      runnerType: materialInfo?.runnerType,
      partShape: materialInfo?.partShape,
      runnerDia: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.runnerDia), conversionValue, isEnableUnitConversion),
      runnerLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.runnerLength), conversionValue, isEnableUnitConversion),
      coilLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.coilLength), conversionValue, isEnableUnitConversion),
      coilWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.coilWidth), conversionValue, isEnableUnitConversion),
      unfoldedLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimUnfoldedX), conversionValue, isEnableUnitConversion),
      unfoldedWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimUnfoldedY), conversionValue, isEnableUnitConversion),
      partAllowance: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partAllowance), conversionValue, isEnableUnitConversion),
      partsPerCoil: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partsPerCoil), conversionValue, isEnableUnitConversion),

      moldBoxLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.moldBoxLength), conversionValue, isEnableUnitConversion),
      moldBoxWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.moldBoxWidth), conversionValue, isEnableUnitConversion),
      moldBoxHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.moldBoxHeight), conversionValue, isEnableUnitConversion),
      moldSandWeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.moldSandWeight), conversionValue, isEnableUnitConversion),
      typeOfCable: materialInfo?.typeOfCable,
      // density: materialInfo?.density,
      totalWeldLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.totalWeldLength), conversionValue, isEnableUnitConversion),
      effeciency: materialInfo.effeciency,
      weldWeightWastage: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.weldWeightWastage), conversionValue, isEnableUnitConversion),

      // Plating
      paintCoatingTickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.paintCoatingTickness), conversionValue, isEnableUnitConversion),
      pouringWeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.pouringWeight), conversionValue, isEnableUnitConversion),
      oxidationLossWeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.oxidationLossWeight), conversionValue, isEnableUnitConversion),

      //galvanization
      typeOfMaterialBase: materialInfo?.typeOfMaterialBase,
      percentageOfReduction: materialInfo?.percentageOfReduction,
      paintArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.paintArea), conversionValue, isEnableUnitConversion),
    };
  }

  materialDirtyCheck(materialInfo: MaterialInfoDto, formCtrl) {
    //materialInfo.isThickness = formCtrl['thickness'].dirty;
    materialInfo.isScrapWeightDirty = formCtrl['scrapWeight'].dirty;
    materialInfo.isScrapRecoveryDirty = formCtrl['scrapRecovery'].dirty;
    materialInfo.isGrossWeightDirty = formCtrl['grossWeight'].dirty;
    materialInfo.isNetweightDirty = formCtrl['netWeight'].dirty;
    materialInfo.isutilisationDirty = formCtrl['utilisation'].dirty;
    materialInfo.isRunnerTypeDirty = formCtrl['runnerType'].dirty;
    materialInfo.isPartShapeDirty = formCtrl['partShape'].dirty;

    materialInfo.isRunnerDiaDirty = formCtrl['runnerDia'].dirty;
    materialInfo.isRunnerLengthDirty = formCtrl['runnerLength'].dirty;
    materialInfo.isCoilLengthDirty = formCtrl['coilLength'].dirty;
    materialInfo.isCoilWidthDirty = formCtrl['coilWidth'].dirty;

    materialInfo.isUnfoldedLength = formCtrl['unfoldedLength'].dirty;
    // materialInfo.isUnfoldedWidth = formCtrl['unfoldedLength'].dirty;
    materialInfo.isPartAllowanceDirty = formCtrl['partAllowance'].dirty;
    materialInfo.isPartsPerCoilDirty = formCtrl['partsPerCoil'].dirty;

    materialInfo.isMoldBoxLengthDirty = formCtrl['moldBoxLength'].dirty;
    materialInfo.isMoldBoxWidthDirty = formCtrl['moldBoxWidth'].dirty;
    materialInfo.isMoldBoxHeightDirty = formCtrl['moldBoxHeight'].dirty;
    materialInfo.isMoldSandWeightDirty = formCtrl['moldSandWeight'].dirty;
    materialInfo.isTypeOfCableDirty = formCtrl['typeOfCable'].dirty;

    // materialInfo.isDensityDirty = formCtrl['density'].dirty;
    materialInfo.isTotalWeldLengthDirty = formCtrl['totalWeldLength'].dirty;
    materialInfo.isEffeciencyDirty = formCtrl['effeciency'].dirty;
    materialInfo.isWeldWeightWastageDirty = formCtrl['weldWeightWastage'].dirty;

    materialInfo.ispaintCoatingTicknessDirty = formCtrl['paintCoatingTickness'].dirty;
    materialInfo.isPouringWeightDirty = formCtrl['pouringWeight'].dirty;
    materialInfo.isOxidationLossWeightDirty = formCtrl['oxidationLossWeight'].dirty;

    //galvanization
    materialInfo.isTypeOfMaterialBaseDirty = formCtrl['typeOfMaterialBase'].dirty;
    materialInfo.isPercentageOfReductionDirty = formCtrl['percentageOfReduction'].dirty;
    materialInfo.ispaintAreaDirty = formCtrl['paintArea'].dirty;
  }

  materialFormAssignValue(materialInfo: MaterialInfoDto, formCtrl, conversionValue: any, isEnableUnitConversion: boolean) {
    materialInfo.dimX = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['length']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimY = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['width']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimZ = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['height']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimUnfoldedZ = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['thickness']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partSurfaceArea']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partVolume']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.utilisation = formCtrl['utilisation'].value;
    materialInfo.grossWeight = formCtrl['grossWeight'].value;
    materialInfo.scrapWeight = formCtrl['scrapWeight'].value;
    materialInfo.scrapRecovery = formCtrl['scrapRecovery'].value;
    materialInfo.materialCostPart = formCtrl['grossMaterialCost'].value;
    materialInfo.scrapRecCost = formCtrl['scrapRecCost'].value;
    materialInfo.netMatCost = formCtrl['netMaterialCost'].value;
    materialInfo.runnerType = formCtrl['runnerType'].value;
    materialInfo.partShape = formCtrl['partShape'].value;
    materialInfo.runnerDia = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['runnerDia']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.runnerLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['runnerLength']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.coilLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['coilLength']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.coilWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['coilWidth']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimUnfoldedX = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['unfoldedLength']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimUnfoldedY = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['unfoldedWidth']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.netWeight = formCtrl['netWeight'].value;
    // materialInfo.unfoldedLength = formCtrl['unfoldedLength'].value;
    // materialInfo.unfoldedWidth = formCtrl['unfoldedWidth'].value;
    materialInfo.partAllowance = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partAllowance']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.partsPerCoil = Number(formCtrl['partsPerCoil']?.value);

    materialInfo.moldBoxLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['moldBoxLength']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.moldBoxWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['moldBoxWidth']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.moldBoxHeight = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['moldBoxHeight']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.moldSandWeight = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['moldSandWeight']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.typeOfCable = formCtrl['typeOfCable'].value;

    // materialInfo.density = formCtrl['density'].value;
    materialInfo.totalWeldLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['totalWeldLength']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.effeciency = formCtrl['effeciency'].value;
    materialInfo.weldWeightWastage = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['weldWeightWastage']?.value), conversionValue, isEnableUnitConversion);

    materialInfo.paintCoatingTickness = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['paintCoatingTickness']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.pouringWeight = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['pouringWeight']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.oxidationLossWeight = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['oxidationLossWeight']?.value), conversionValue, isEnableUnitConversion);

    //galvanization
    materialInfo.typeOfMaterialBase = formCtrl['typeOfMaterialBase'].value;
    materialInfo.percentageOfReduction = formCtrl['percentageOfReduction'].value;
    materialInfo.paintArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['paintArea']?.value), conversionValue, isEnableUnitConversion);
  }

  formPatchResults(result: MaterialInfoDto, conversionValue: any, isEnableUnitConversion: boolean) {
    return {
      length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.dimX), conversionValue, isEnableUnitConversion),
      width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.dimY), conversionValue, isEnableUnitConversion),
      height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.dimZ), conversionValue, isEnableUnitConversion),
      thickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.dimUnfoldedZ), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partSurfaceArea), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partVolume), conversionValue, isEnableUnitConversion),
      netWeight: this.sharedService.isValidNumber(result.netWeight),
      utilisation: this.sharedService.isValidNumber(result.utilisation),
      grossWeight: this.sharedService.isValidNumber(result.grossWeight),
      scrapWeight: this.sharedService.isValidNumber(result.scrapWeight),
      scrapRecovery: this.sharedService.isValidNumber(result.scrapRecovery),
      grossMaterialCost: this.sharedService.isValidNumber(result.materialCostPart),
      scrapRecCost: this.sharedService.isValidNumber(result.scrapRecCost),
      netMaterialCost: this.sharedService.isValidNumber(result.netMatCost),
      runnerType: result.runnerType,
      partShape: result.partShape,
      runnerDia: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.runnerDia), conversionValue, isEnableUnitConversion),
      runnerLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.runnerLength), conversionValue, isEnableUnitConversion),
      coilLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.coilLength), conversionValue, isEnableUnitConversion),
      coilWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.coilWidth), conversionValue, isEnableUnitConversion),
      unfoldedLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.dimUnfoldedX), conversionValue, isEnableUnitConversion),
      unfoldedWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.dimUnfoldedY), conversionValue, isEnableUnitConversion),
      partAllowance: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partAllowance), conversionValue, isEnableUnitConversion),
      partsPerCoil: this.sharedService.isValidNumber(result.partsPerCoil),

      moldBoxLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.moldBoxLength), conversionValue, isEnableUnitConversion),
      moldBoxWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.moldBoxWidth), conversionValue, isEnableUnitConversion),
      moldBoxHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.moldBoxHeight), conversionValue, isEnableUnitConversion),
      moldSandWeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.moldSandWeight), conversionValue, isEnableUnitConversion),
      typeOfCable: this.sharedService.isValidNumber(result.typeOfCable),

      // density: this.sharedService.isValidNumber(result.density),
      totalWeldLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.totalWeldLength), conversionValue, isEnableUnitConversion),
      effeciency: this.sharedService.isValidNumber(result.effeciency),
      weldWeightWastage: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.weldWeightWastage), conversionValue, isEnableUnitConversion),

      paintCoatingTickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.paintCoatingTickness), conversionValue, isEnableUnitConversion),
      pouringWeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.pouringWeight), conversionValue, isEnableUnitConversion),
      oxidationLossWeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.oxidationLossWeight), conversionValue, isEnableUnitConversion),

      //galvanization
      typeOfMaterialBase: this.sharedService.isValidNumber(result.typeOfMaterialBase),
      percentageOfReduction: this.sharedService.isValidNumber(result.percentageOfReduction),
      paintArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.paintArea), conversionValue, isEnableUnitConversion),
    };
  }

  setCalculationObject(materialInfo: MaterialInfoDto, formCtrl, conversionValue: any, isEnableUnitConversion: boolean) {
    materialInfo.dimX = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['length']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimY = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['width']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimZ = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['height']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimUnfoldedZ = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['thickness']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partSurfaceArea']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partVolume']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.netWeight = formCtrl['netWeight'].value;
    materialInfo.utilisation = formCtrl['utilisation'].value;
    materialInfo.grossWeight = formCtrl['grossWeight'].value;
    materialInfo.scrapWeight = formCtrl['scrapWeight'].value;
    materialInfo.scrapRecovery = formCtrl['scrapRecovery'].value;
    materialInfo.materialCostPart = formCtrl['grossMaterialCost'].value;
    materialInfo.scrapRecCost = formCtrl['scrapRecCost'].value;
    materialInfo.netMatCost = formCtrl['netMaterialCost'].value;
    materialInfo.runnerType = formCtrl['runnerType'].value;
    materialInfo.partShape = formCtrl['partShape'].value;
    materialInfo.runnerDia = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['runnerDia']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.runnerLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['runnerLength']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.coilLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['coilLength']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.coilWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['coilWidth']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimUnfoldedX = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['unfoldedLength']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.dimUnfoldedY = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['unfoldedWidth']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.partAllowance = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partAllowance']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.partsPerCoil = Number(formCtrl['partsPerCoil']?.value);

    materialInfo.moldBoxLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['moldBoxLength']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.moldBoxWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['moldBoxWidth']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.moldBoxHeight = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['moldBoxHeight']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.moldSandWeight = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['moldSandWeight']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.typeOfCable = formCtrl['typeOfCable'].value;

    // materialInfo.density = formCtrl['density'].value;
    materialInfo.totalWeldLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['totalWeldLength']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.effeciency = formCtrl['effeciency'].value;
    materialInfo.weldWeightWastage = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['weldWeightWastage']?.value), conversionValue, isEnableUnitConversion);

    materialInfo.paintCoatingTickness = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['paintCoatingTickness']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.pouringWeight = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['pouringWeight']?.value), conversionValue, isEnableUnitConversion);
    materialInfo.oxidationLossWeight = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['oxidationLossWeight']?.value), conversionValue, isEnableUnitConversion);

    //galvanization
    materialInfo.typeOfMaterialBase = formCtrl['typeOfMaterialBase'].value;
    materialInfo.percentageOfReduction = formCtrl['percentageOfReduction'].value;
    materialInfo.paintArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['paintArea']?.value), conversionValue, isEnableUnitConversion);
  }

  setPayload(materialInfo, conversionValue, isEnableUnitConversion) {
    return {
      dimX: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['length'].value), conversionValue, isEnableUnitConversion),
      dimY: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['width'].value), conversionValue, isEnableUnitConversion),
      dimZ: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['height'].value), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['partVolume'].value), conversionValue, isEnableUnitConversion),
      dimUnfoldedZ: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['thickness']?.value || 0), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['partSurfaceArea']?.value || 0), conversionValue, isEnableUnitConversion),
      netWeight: materialInfo['netWeight']?.value || 0,
      utilisation: materialInfo['utilisation']?.value || 0,
      grossWeight: materialInfo['grossWeight']?.value || 0,
      scrapWeight: materialInfo['scrapWeight']?.value || 0,
      scrapRecovery: materialInfo['scrapRecovery']?.value || 0,
      materialCostPart: materialInfo['grossMaterialCost']?.value || 0,
      scrapRecCost: materialInfo['scrapRecCost']?.value || 0,
      netMatCost: materialInfo['netMaterialCost']?.value || 0,
      runnerType: materialInfo['runnerType']?.value || '',
      partShape: materialInfo['partShape']?.value || '',
      runnerDia: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['runnerDia']?.value || 0), conversionValue, isEnableUnitConversion),
      runnerLength: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['runnerLength']?.value || 0), conversionValue, isEnableUnitConversion),
      coilLength: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['coilLength']?.value || 0), conversionValue, isEnableUnitConversion),
      coilWidth: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['coilWidth']?.value || 0), conversionValue, isEnableUnitConversion),
      // unfoldedLength: materialInfo['unfoldedLength'].value,
      // unfoldedWidth: materialInfo['unfoldedWidth'].value,
      dimUnfoldedX: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['unfoldedLength']?.value || 0), conversionValue, isEnableUnitConversion),
      dimUnfoldedY: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['unfoldedWidth']?.value || 0), conversionValue, isEnableUnitConversion),
      partAllowance: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['partAllowance']?.value || 0), conversionValue, isEnableUnitConversion),
      partsPerCoil: materialInfo['partsPerCoil']?.value || 0,

      moldBoxLength: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['moldBoxLength']?.value || 0), conversionValue, isEnableUnitConversion),
      moldBoxWidth: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['moldBoxWidth']?.value || 0), conversionValue, isEnableUnitConversion),
      moldBoxHeight: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['moldBoxHeight']?.value || 0), conversionValue, isEnableUnitConversion),
      moldSandWeight: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['moldSandWeight']?.value || 0), conversionValue, isEnableUnitConversion),
      typeOfCable: materialInfo['typeOfCable']?.value || 0,

      // density: materialInfo['density'].value,
      totalWeldLength: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['totalWeldLength']?.value || 0), conversionValue, isEnableUnitConversion),
      effeciency: materialInfo['effeciency']?.value || 0,
      weldWeightWastage: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['weldWeightWastage']?.value || 0), conversionValue, isEnableUnitConversion),

      paintCoatingTickness: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['paintCoatingTickness']?.value || 0), conversionValue, isEnableUnitConversion),
      pouringWeight: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['pouringWeight']?.value || 0), conversionValue, isEnableUnitConversion),
      oxidationLossWeight: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['oxidationLossWeight']?.value || 0), conversionValue, isEnableUnitConversion),

      //galvanization
      typeOfMaterialBase: materialInfo['typeOfMaterialBase']?.value || 0,
      percentageOfReduction: materialInfo['percentageOfReduction']?.value || 0,
      paintArea: this.sharedService.convertUomToSaveAndCalculation(Number(materialInfo['paintArea']?.value || 0), conversionValue, isEnableUnitConversion),
    };
  }
}
