import { Injectable } from '@angular/core';
import { MaterialInfoDto } from '../models';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { FormBuilder } from '@angular/forms';
import { PCBLayer } from '../config/material-pcb-config';

@Injectable({
  providedIn: 'root',
})
export class MaterialPCBMappingService {
  constructor(
    public sharedService: SharedService,
    private formbuilder: FormBuilder
  ) {}

  getMaterialFormFields() {
    return {
      partTickness: 0,
      netMaterialCost: 0,
      typeOfWeld: 0,
      stockLength: 0,
      typeOfCable: 0,
      typeOfConductor: 0,
      totalCableLength: 0,
      colorantPer: 0,
      colorantCost: 0,
      colorantPrice: 0,
      runnerDia: 0,
      runnerLength: 0,
      flowFactor: 0,
      wallThickFactor: 0,
      maxFlowlength: 0,
      injPressure: 0,
      txtWindows: 0,
      closingTime: 0,
      injectionTime: 0,
      holdingTime: 0,
      coolingTime: 0,
      ejectionTime: 0,
      pickPlaceTime: 0,
      openingTime: 0,
      coilWidth: 0,
      coilLength: 0,
      coilWeight: 0,
      partOuterDiameter: 0,
      partInnerDiameter: 0,
      coilDiameter: 0,
      moldBoxHeight: 0,
      moldBoxWidth: 0,
      moldSandWeight: 0,
      primaryCount: 0,
      primaryWeight: 0,
      primaryPrice: 0,
      secondaryCount: 0,
      secondaryWeight: 0,
      secondaryPrice: 0,
      cavityEnvelopLength: 0,
      cavityEnvelopWidth: 0,
      cavityEnvelopHeight: 0,
      stockCrossSectionWidth: 0,
      stockCrossSectionHeight: 0,
      stockCrossSectionArea: 0,
      beadSize: 0,
      primerDensity: 0,
      scaleLoss: 0,
      noOfCables: 0,
      noOfCablesWithSameDia: 0,
      unfoldedSheetweight: 0,
      weldLegLength: 0,
      partFinish: 0,
      cuttingAllowance: 0,
      totalPartStockLength: 0,
      castingVolume: 0,
      wireDiameter: 0,
      standardDeviation: 0,

      primerMatPrice: 0,
      primerCoatingTickness: 0,
      primerNetWeight: 0,
      mainCableSheathingMaterial: 0,
      mainInsulatorID: 0,
      mainInsulatorOD: 0,
      percentageOfReduction: 0,
      noOfDrawSteps: 0,
      materialPkgs: this.formbuilder.array([]),
    };
  }
  formFieldsReset() {
    return {
      partTickness: 0,
      netMaterialCost: 0,
      typeOfWeld: 0,
      stockLength: 0,
      typeOfConductor: 0,
      totalCableLength: 0,
      typeOfCable: 0,
      colorantPer: 0,
      colorantCost: 0,
      colorantPrice: 0,
      runnerDia: 0,
      runnerLength: 0,
      flowFactor: 0,
      wallThickFactor: 0,
      maxFlowlength: 0,
      injPressure: 0,
      txtWindows: 0,
      closingTime: 0,
      injectionTime: 0,
      holdingTime: 0,
      coolingTime: 0,
      ejectionTime: 0,
      pickPlaceTime: 0,
      openingTime: 0,
      coilWidth: 0,
      coilLength: 0,
      coilWeight: 0,
      partOuterDiameter: 0,
      partInnerDiameter: 0,
      coilDiameter: 0,
      primaryCount: 0,
      primaryWeight: 0,
      primaryPrice: 0,
      secondaryCount: 0,
      secondaryWeight: 0,
      secondaryPrice: 0,
      cavityEnvelopLength: 0,
      cavityEnvelopWidth: 0,
      cavityEnvelopHeight: 0,
      stockCrossSectionWidth: 0,
      stockCrossSectionHeight: 0,
      stockCrossSectionArea: 0,
      beadSize: 0,
      primerDensity: 0,
      scaleLoss: 0,
      noOfCables: 0,
      noOfCablesWithSameDia: 0,
      unfoldedSheetweight: 0,
      weldLegLength: 0,
      partFinish: 0,
      cuttingAllowance: 0,
      totalPartStockLength: 0,
      castingVolume: 0,
      wireDiameter: 0,
      standardDeviation: 0,
      primerMatPrice: 0,
      primerCoatingTickness: 0,
      primerNetWeight: 0,
      mainCableSheathingMaterial: 0,
      mainInsulatorID: 0,
      mainInsulatorOD: 0,
      percentageOfReduction: 0,
      noOfDrawSteps: 0,
    };
  }
  formPatch(materialInfo: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      partTickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partTickness), conversionValue, isEnableUnitConversion),
      netMaterialCost: this.sharedService.isValidNumber(materialInfo?.netMatCost),
      stockLength: this.sharedService.isValidNumber(Number(materialInfo.stockLength)),
      typeOfWeld: this.sharedService.isValidNumber(Number(materialInfo.typeOfWeld)),
      typeOfCable: this.sharedService.isValidNumber(Number(materialInfo.typeOfCable)),
      typeOfConductor: this.sharedService.isValidNumber(Number(materialInfo.typeOfConductor)),
      totalCableLength: this.sharedService.isValidNumber(Number(materialInfo.totalCableLength)),
      colorantPer: this.sharedService.isValidNumber(Number(materialInfo.colorantPer)),
      colorantCost: this.sharedService.isValidNumber(Number(materialInfo.colorantCost)),
      colorantPrice: this.sharedService.isValidNumber(Number(materialInfo.colorantPrice)),
      runnerDia: this.sharedService.isValidNumber(Number(materialInfo.runnerDia)),
      runnerLength: this.sharedService.isValidNumber(Number(materialInfo.runnerLength)),
      flowFactor: this.sharedService.isValidNumber(Number(materialInfo.flowFactor)),
      wallThickFactor: this.sharedService.isValidNumber(Number(materialInfo.wallThickFactor)),
      maxFlowlength: this.sharedService.isValidNumber(Number(materialInfo.maxFlowlength)),
      injPressure: this.sharedService.isValidNumber(Number(materialInfo.injPressure)),
      txtWindows: this.sharedService.isValidNumber(Number(materialInfo.txtWindows)),
      closingTime: this.sharedService.isValidNumber(Number(materialInfo.closingTime)),
      injectionTime: this.sharedService.isValidNumber(Number(materialInfo.injectionTime)),
      holdingTime: this.sharedService.isValidNumber(Number(materialInfo.holdingTime)),
      coolingTime: this.sharedService.isValidNumber(Number(materialInfo.coolingTime)),
      ejectionTime: this.sharedService.isValidNumber(Number(materialInfo.ejectionTime)),
      pickPlaceTime: this.sharedService.isValidNumber(Number(materialInfo.pickPlaceTime)),
      openingTime: this.sharedService.isValidNumber(Number(materialInfo.openingTime)),
      coilWidth: this.sharedService.isValidNumber(Number(materialInfo.coilWidth)),
      coilLength: this.sharedService.isValidNumber(Number(materialInfo.coilLength)),
      coilWeight: this.sharedService.isValidNumber(Number(materialInfo.coilWeight)),
      partOuterDiameter: this.sharedService.isValidNumber(Number(materialInfo.partOuterDiameter)),
      partInnerDiameter: this.sharedService.isValidNumber(Number(materialInfo.partInnerDiameter)),
      coilDiameter: this.sharedService.isValidNumber(Number(materialInfo.coilDiameter)),
      moldBoxHeight: this.sharedService.isValidNumber(Number(materialInfo.moldBoxHeight)),
      moldBoxWidth: this.sharedService.isValidNumber(Number(materialInfo.moldBoxWidth)),
      moldSandWeight: this.sharedService.isValidNumber(Number(materialInfo.moldSandWeight)),
      primaryCount: this.sharedService.isValidNumber(Number(materialInfo.primaryCount)),
      primaryWeight: this.sharedService.isValidNumber(Number(materialInfo.primaryWeight)),
      primaryPrice: this.sharedService.isValidNumber(Number(materialInfo.primaryPrice)),
      secondaryCount: this.sharedService.isValidNumber(Number(materialInfo.secondaryCount)),
      secondaryWeight: this.sharedService.isValidNumber(Number(materialInfo.secondaryWeight)),
      secondaryPrice: this.sharedService.isValidNumber(Number(materialInfo.secondaryPrice)),
      cavityEnvelopLength: this.sharedService.isValidNumber(Number(materialInfo.cavityEnvelopLength)),
      cavityEnvelopWidth: this.sharedService.isValidNumber(Number(materialInfo.cavityEnvelopWidth)),
      cavityEnvelopHeight: this.sharedService.isValidNumber(Number(materialInfo.cavityEnvelopHeight)),
      stockCrossSectionWidth: this.sharedService.isValidNumber(Number(materialInfo.stockCrossSectionWidth)),
      stockCrossSectionHeight: this.sharedService.isValidNumber(Number(materialInfo.stockCrossSectionHeight)),
      stockCrossSectionArea: this.sharedService.isValidNumber(Number(materialInfo.stockCrossSectionArea)),
      beadSize: this.sharedService.isValidNumber(Number(materialInfo.beadSize)),
      primerDensity: this.sharedService.isValidNumber(Number(materialInfo.primerDensity)),
      scaleLoss: this.sharedService.isValidNumber(Number(materialInfo.scaleLoss)),
      noOfCables: this.sharedService.isValidNumber(Number(materialInfo.noOfCables)),
      noOfCablesWithSameDia: this.sharedService.isValidNumber(Number(materialInfo.noOfCablesWithSameDia)),
      unfoldedSheetweight: this.sharedService.isValidNumber(Number(materialInfo.unfoldedSheetweight)),
      weldLegLength: this.sharedService.isValidNumber(Number(materialInfo.weldLegLength)),
      partFinish: this.sharedService.isValidNumber(Number(materialInfo.partFinish)),
      cuttingAllowance: this.sharedService.isValidNumber(Number(materialInfo.cuttingAllowance)),
      totalPartStockLength: this.sharedService.isValidNumber(Number(materialInfo.totalPartStockLength)),
      castingVolume: this.sharedService.isValidNumber(Number(materialInfo.castingVolume)),
      wireDiameter: this.sharedService.isValidNumber(Number(materialInfo.wireDiameter)),
      standardDeviation: this.sharedService.isValidNumber(Number(materialInfo.standardDeviation)),
      primerMatPrice: this.sharedService.isValidNumber(Number(materialInfo.primerMatPrice)),
      primerCoatingTickness: this.sharedService.isValidNumber(Number(materialInfo.primerCoatingTickness)),
      primerNetWeight: this.sharedService.isValidNumber(Number(materialInfo.primerNetWeight)),
      mainCableSheathingMaterial: this.sharedService.isValidNumber(Number(materialInfo.mainCableSheathingMaterial)),
      mainInsulatorID: this.sharedService.isValidNumber(Number(materialInfo.mainInsulatorID)),
      mainInsulatorOD: this.sharedService.isValidNumber(Number(materialInfo.mainInsulatorOD)),
      percentageOfReduction: this.sharedService.isValidNumber(Number(materialInfo.percentageOfReduction)),
      noOfDrawSteps: this.sharedService.isValidNumber(Number(materialInfo.noOfDrawSteps)),
    };
  }
  setCalculationObject(materialInfo, material, conversionValue, isEnableUnitConversion) {
    materialInfo.partTickness = this.sharedService.convertUomToSaveAndCalculation(material['partTickness'].value, conversionValue, isEnableUnitConversion);
    materialInfo.netMaterialCost = material['netMaterialCost'].value;
    materialInfo.typeOfWeld = material['typeOfWeld'].value;
    materialInfo.stockLength = material['stockLength'].value || 0;
    materialInfo.typeOfCable = material['typeOfCable'].value || 0;
    materialInfo.typeOfConductor = material['typeOfConductor'].value || 0;
    materialInfo.totalCableLength = material['totalCableLength'].value || 0;
    materialInfo.colorantPer = material['colorantPer'].value || 0;
    materialInfo.colorantCost = material['colorantCost'].value || 0;
    materialInfo.colorantPrice = material['colorantPrice'].value || 0;
    materialInfo.runnerDia = material['runnerDia'].value || 0;
    materialInfo.runnerLength = material['runnerLength'].value || 0;
    materialInfo.flowFactor = material['flowFactor'].value || 0;
    materialInfo.wallThickFactor = material['wallThickFactor'].value || 0;
    materialInfo.maxFlowlength = material['maxFlowlength'].value || 0;
    materialInfo.injPressure = material['injPressure'].value || 0;
    materialInfo.txtWindows = material['txtWindows'].value || 0;
    materialInfo.closingTime = material['closingTime'].value || 0;
    materialInfo.injectionTime = material['injectionTime'].value || 0;
    materialInfo.holdingTime = material['holdingTime'].value || 0;
    materialInfo.coolingTime = material['coolingTime'].value || 0;
    materialInfo.ejectionTime = material['ejectionTime'].value || 0;
    materialInfo.pickPlaceTime = material['pickPlaceTime'].value || 0;
    materialInfo.openingTime = material['openingTime'].value || 0;
    materialInfo.coilWidth = material['coilWidth'].value || 0;
    materialInfo.coilLength = material['coilLength'].value || 0;
    materialInfo.coilWeight = material['coilWeight'].value || 0;
    materialInfo.partOuterDiameter = material['partOuterDiameter'].value || 0;
    materialInfo.partInnerDiameter = material['partInnerDiameter'].value || 0;
    materialInfo.coilDiameter = material['coilDiameter'].value || 0;

    materialInfo.moldBoxHeight = material['moldBoxHeight'].value || 0;
    materialInfo.moldBoxWidth = material['moldBoxWidth'].value || 0;
    materialInfo.moldSandWeight = material['moldSandWeight'].value || 0;
    materialInfo.primaryCount = material['primaryCount'].value || 0;
    materialInfo.primaryWeight = material['primaryWeight'].value || 0;
    materialInfo.primaryPrice = material['primaryPrice'].value || 0;
    materialInfo.secondaryCount = material['secondaryCount'].value || 0;
    materialInfo.secondaryWeight = material['secondaryWeight'].value || 0;
    materialInfo.secondaryPrice = material['secondaryPrice'].value || 0;
    materialInfo.cavityEnvelopLength = material['cavityEnvelopLength'].value || 0;
    materialInfo.cavityEnvelopWidth = material['cavityEnvelopWidth'].value || 0;
    materialInfo.cavityEnvelopHeight = material['cavityEnvelopHeight'].value || 0;
    materialInfo.stockCrossSectionWidth = material['stockCrossSectionWidth'].value || 0;
    materialInfo.stockCrossSectionHeight = material['stockCrossSectionHeight'].value || 0;
    materialInfo.stockCrossSectionArea = material['stockCrossSectionArea'].value || 0;
    materialInfo.beadSize = material['beadSize'].value || 0;
    materialInfo.primerDensity = material['primerDensity'].value || 0;
    materialInfo.scaleLoss = material['scaleLoss'].value || 0;
    materialInfo.noOfCables = material['noOfCables'].value || 0;
    materialInfo.noOfCablesWithSameDia = material['noOfCablesWithSameDia'].value || 0;
    materialInfo.unfoldedSheetweight = material['unfoldedSheetweight'].value || 0;
    materialInfo.weldLegLength = material['weldLegLength'].value || 0;
    materialInfo.partFinish = material['partFinish'].value || 0;
    materialInfo.cuttingAllowance = material['cuttingAllowance'].value || 0;
    materialInfo.totalPartStockLength = material['totalPartStockLength'].value || 0;
    materialInfo.castingVolume = material['castingVolume'].value || 0;
    materialInfo.wireDiameter = material['wireDiameter'].value || 0;
    materialInfo.standardDeviation = material['standardDeviation'].value || 0;
    materialInfo.primerMatPrice = material['primerMatPrice'].value || 0;
    materialInfo.primerCoatingTickness = material['primerCoatingTickness'].value || 0;
    materialInfo.primerNetWeight = material['primerNetWeight'].value || 0;
    materialInfo.mainCableSheathingMaterial = material['mainCableSheathingMaterial'].value || 0;
    materialInfo.mainInsulatorID = material['mainInsulatorID'].value || 0;
    materialInfo.mainInsulatorOD = material['mainInsulatorOD'].value || 0;
    materialInfo.percentageOfReduction = material['percentageOfReduction'].value || 0;
    materialInfo.noOfDrawSteps = material['noOfDrawSteps'].value || 0;
  }
  materialPayload(material, conversionValue, isEnableUnitConversion) {
    return {
      partTickness: this.sharedService.convertUomToSaveAndCalculation(material['partTickness'].value || 0, conversionValue, isEnableUnitConversion),
      netMaterialCost: material['netMaterialCost'].value || 0,
      typeOfWeld: material['typeOfWeld'].value,
      stockLength: material['stockLength'].value || 0,
      typeOfCable: material['typeOfCable'].value || 0,
      typeOfConductor: material['typeOfConductor'].value || 0,
      totalCableLength: material['totalCableLength'].value || 0,
      colorantPer: material['colorantPer'].value || 0,
      colorantCost: material['colorantCost'].value || 0,
      colorantPrice: material['colorantPrice'].value || 0,
      runnerDia: material['runnerDia'].value || 0,
      runnerLength: material['runnerLength'].value || 0,
      flowFactor: material['flowFactor'].value || 0,
      wallThickFactor: material['wallThickFactor'].value || 0,
      maxFlowlength: material['maxFlowlength'].value || 0,
      injPressure: material['injPressure'].value || 0,
      txtWindows: material['txtWindows'].value || 0,
      closingTime: material['closingTime'].value || 0,
      injectionTime: material['injectionTime'].value || 0,
      holdingTime: material['holdingTime'].value || 0,
      coolingTime: material['coolingTime'].value || 0,
      ejectionTime: material['ejectionTime'].value || 0,
      pickPlaceTime: material['pickPlaceTime'].value || 0,
      openingTime: material['openingTime'].value || 0,
      coilWidth: material['coilWidth'].value || 0,
      coilLength: material['coilLength'].value || 0,
      coilWeight: material['coilWeight'].value || 0,
      partOuterDiameter: material['partOuterDiameter'].value || 0,
      partInnerDiameter: material['partInnerDiameter'].value || 0,
      coilDiameter: material['coilDiameter'].value || 0,
      moldBoxHeight: material['moldBoxHeight'].value || 0,
      moldBoxWidth: material['moldBoxWidth'].value || 0,
      moldSandWeight: material['moldSandWeight'].value || 0,
      primaryCount: material['primaryCount'].value || 0,
      primaryWeight: material['primaryWeight'].value || 0,
      primaryPrice: material['primaryPrice'].value || 0,
      secondaryCount: material['secondaryCount'].value || 0,
      secondaryWeight: material['secondaryWeight'].value || 0,
      secondaryPrice: material['secondaryPrice'].value || 0,
      cavityEnvelopLength: material['cavityEnvelopLength'].value || 0,
      cavityEnvelopWidth: material['cavityEnvelopWidth'].value || 0,
      cavityEnvelopHeight: material['cavityEnvelopHeight'].value || 0,
      stockCrossSectionWidth: material['stockCrossSectionWidth'].value || 0,
      stockCrossSectionHeight: material['stockCrossSectionHeight'].value || 0,
      stockCrossSectionArea: material['stockCrossSectionArea'].value || 0,
      beadSize: material['beadSize'].value || 0,
      primerDensity: material['primerDensity'].value || 0,
      scaleLoss: material['scaleLoss'].value || 0,
      noOfCables: material['noOfCables'].value || 0,
      noOfCablesWithSameDia: material['noOfCablesWithSameDia'].value || 0,
      unfoldedSheetweight: material['unfoldedSheetweight'].value || 0,
      weldLegLength: material['weldLegLength'].value || 0,
      partFinish: material['partFinish'].value || 0,
      cuttingAllowance: material['cuttingAllowance'].value || 0,
      totalPartStockLength: material['totalPartStockLength'].value || 0,
      castingVolume: material['castingVolume'].value || 0,
      wireDiameter: material['wireDiameter'].value || 0,
      standardDeviation: material['standardDeviation'].value || 0,
      primerMatPrice: material['primerMatPrice'].value || 0,
      primerCoatingTickness: material['primerCoatingTickness'].value || 0,
      primerNetWeight: material['primerNetWeight'].value || 0,
      mainCableSheathingMaterial: material['mainCableSheathingMaterial'].value || 0,
      mainInsulatorID: material['mainInsulatorID'].value || 0,
      mainInsulatorOD: material['mainInsulatorOD'].value || 0,
      percentageOfReduction: material['percentageOfReduction'].value || 0,
      noOfDrawSteps: material['noOfDrawSteps'].value || 0,
    };
  }

  sandForCoreFormGroup(selectedMaterialInfoId = 0, coreTypeId = 0) {
    return this.formbuilder.group({
      coreCostDetailsId: 0,
      materialInfoId: selectedMaterialInfoId || 0,
      coreLength: 0,
      coreWidth: 0,
      coreHeight: coreTypeId === PCBLayer.Drilling ? 1 : 0,
      coreShape: 1,
      coreArea: coreTypeId === PCBLayer.Drilling ? 1 : 0,
      coreVolume: 0,
      noOfCore: coreTypeId,
      coreWeight: 0,
    });
  }

  materialDirtyCheck(materialInfo: MaterialInfoDto, formCtrl) {
    materialInfo.isStockLengthDirty = formCtrl['stockLength'].dirty;
    materialInfo.isMoldBoxHeightDirty = formCtrl['moldBoxHeight'].dirty;
    materialInfo.isMoldBoxWidthDirty = formCtrl['moldBoxWidth'].dirty;
    materialInfo.isTypeOfCableDirty = formCtrl['typeOfCable'].dirty;
    materialInfo.isInjectionTimeDirty = formCtrl['injectionTime'].dirty;
    materialInfo.isClosingTimeDirty = formCtrl['closingTime'].dirty;
    materialInfo.isCoilWeightDirty = formCtrl['coilWeight'].dirty;
    materialInfo.isPartOuterDiameterDirty = formCtrl['partOuterDiameter'].dirty;
    materialInfo.isMoldSandWeightDirty = formCtrl['moldSandWeight'].dirty;
    materialInfo.isColorantCostDirty = formCtrl['colorantCost'].dirty;
    materialInfo.isColorantPriceDirty = formCtrl['colorantPrice'].dirty;
    materialInfo.isFlowFactorDirty = formCtrl['flowFactor'].dirty;
    materialInfo.isWallThickFactorDirty = formCtrl['wallThickFactor'].dirty;
    materialInfo.isMaxFlowlengthDirty = formCtrl['maxFlowlength'].dirty;
    materialInfo.isInjPressureDirty = formCtrl['injPressure'].dirty;
    materialInfo.isPrimerCoatingTicknessDirty = formCtrl['primerCoatingTickness'].dirty;
    materialInfo.isPercentageOfReductionDirty = formCtrl['percentageOfReduction'].dirty;
    materialInfo.isNoOfDrawStepsDirty = formCtrl['noOfDrawSteps'].dirty;
  }
}
