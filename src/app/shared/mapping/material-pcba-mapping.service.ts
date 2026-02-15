import { Injectable } from '@angular/core';
import { MaterialInfoDto } from '../models';
import { SharedService } from 'src/app/modules/costing/services/shared.service';

@Injectable({
  providedIn: 'root',
})
export class MaterialPCBAMappingService {
  constructor(public sharedService: SharedService) {}

  getFormFields() {
    return {
      typeOfCable: 0,
      typeOfConductor: 0,
      totalCableLength: 0,
      noOfCables: 0,
      flashVolume: 0,
      sheetLength: 0,
      sheetWidth: 0,
      sheetThickness: 0,
      inputBilletWidth: 0,
      inputBilletHeight: 0,
      closingTime: 0,
      injectionTime: 0,
      holdingTime: 0,
      coolingTime: 0,
      ejectionTime: 0,
      pickPlaceTime: 0,
      openingTime: 0,
      coilWidth: 0,
      coilLength: 0,
      partsPerCoil: 0,
      coilWeight: 0,
      partOuterDiameter: 0,
      partInnerDiameter: 0,
      runnerRiser: 0,
      oxidationLossWeight: 0,
      pouringWeight: 0,
      cavityArrangementLength: 0,
      cavityArrangementWidth: 0,
      moldBoxLength: 0,
      moldBoxHeight: 0,
      noOfCablesWithSameDia: 0,
      mainInsulatorID: 0,
      mainInsulatorOD: 0,
      mainCableSheathingMaterial: 0,
      widthAllowance: 0,
      yeildUtilization: 0,
      grossVolumne: 0,
      scaleLoss: 0,
    };
  }

  formFieldsReset() {
    return {
      typeOfCable: 0,
      typeOfConductor: 0,
      totalCableLength: 0,
      noOfCables: 0,
      flashVolume: 0,
      sheetLength: 0,
      sheetWidth: 0,
      sheetThickness: 0,
      inputBilletWidth: 0,
      inputBilletHeight: 0,
      closingTime: 0,
      injectionTime: 0,
      holdingTime: 0,
      coolingTime: 0,
      ejectionTime: 0,
      pickPlaceTime: 0,
      openingTime: 0,
      coilWidth: 0,
      coilLength: 0,
      partsPerCoil: 0,
      coilWeight: 0,
      partOuterDiameter: 0,
      partInnerDiameter: 0,
      runnerRiser: 0,
      oxidationLossWeight: 0,
      pouringWeight: 0,
      cavityArrangementLength: 0,
      cavityArrangementWidth: 0,
      moldBoxLength: 0,
      moldBoxHeight: 0,
      noOfCablesWithSameDia: 0,
      mainInsulatorID: 0,
      mainInsulatorOD: 0,
      mainCableSheathingMaterial: 0,
      widthAllowance: 0,
      yeildUtilization: 0,
      grossVolumne: 0,
      scaleLoss: 0,
    };
  }

  formPatch(materialInfo: MaterialInfoDto) {
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
      sheetLength: this.sharedService.isValidNumber(materialInfo?.sheetLength),
      sheetWidth: this.sharedService.isValidNumber(materialInfo?.sheetWidth),
      sheetThickness: this.sharedService.isValidNumber(materialInfo?.sheetThickness),
      inputBilletWidth: this.sharedService.isValidNumber(materialInfo?.inputBilletWidth),
      inputBilletHeight: this.sharedService.isValidNumber(materialInfo?.inputBilletHeight),
      closingTime: this.sharedService.isValidNumber(materialInfo?.closingTime),
      injectionTime: this.sharedService.isValidNumber(materialInfo?.injectionTime),
      holdingTime: this.sharedService.isValidNumber(materialInfo?.holdingTime),
      coolingTime: this.sharedService.isValidNumber(materialInfo?.coolingTime),
      ejectionTime: this.sharedService.isValidNumber(materialInfo?.ejectionTime),
      pickPlaceTime: this.sharedService.isValidNumber(materialInfo?.pickPlaceTime),
      openingTime: this.sharedService.isValidNumber(materialInfo?.openingTime),
      coilWidth: this.sharedService.isValidNumber(materialInfo?.coilWidth),
      coilLength: this.sharedService.isValidNumber(materialInfo?.coilLength),
      partsPerCoil: this.sharedService.isValidNumber(materialInfo?.partsPerCoil),
      coilWeight: this.sharedService.isValidNumber(materialInfo?.coilWeight),
      partOuterDiameter: this.sharedService.isValidNumber(materialInfo?.partOuterDiameter),
      partInnerDiameter: this.sharedService.isValidNumber(materialInfo?.partInnerDiameter),
      runnerRiser: this.sharedService.isValidNumber(materialInfo?.runnerRiser),
      oxidationLossWeight: this.sharedService.isValidNumber(materialInfo?.oxidationLossWeight),
      pouringWeight: this.sharedService.isValidNumber(materialInfo?.pouringWeight),
      cavityArrangementLength: this.sharedService.isValidNumber(materialInfo?.cavityArrangementLength),
      cavityArrangementWidth: this.sharedService.isValidNumber(materialInfo?.cavityArrangementWidth),
      moldBoxLength: this.sharedService.isValidNumber(materialInfo?.moldBoxLength),
      moldBoxHeight: this.sharedService.isValidNumber(materialInfo?.moldBoxHeight),
      widthAllowance: materialInfo?.widthAllowance,
      yeildUtilization: materialInfo?.yeildUtilization,
      grossVolumne: materialInfo?.grossVolumne,
      scaleLoss: materialInfo?.scaleLoss,
    };
  }

  materialDirtyCheck(materialInfo: MaterialInfoDto, formCtrl) {
    materialInfo.isTypeOfCableDirty = formCtrl['typeOfCable'].dirty;
    materialInfo.isFlashVolumeDirty = formCtrl['flashVolume'].dirty;
    materialInfo.isSheetWidthDirty = formCtrl['sheetWidth'].dirty;
    materialInfo.isSheetLengthDirty = formCtrl['sheetLength'].dirty;
    materialInfo.isPartOuterDiameterDirty = formCtrl['partOuterDiameter'].dirty;
    materialInfo.isPartInnerDiameterDirty = formCtrl['partInnerDiameter'].dirty;
    materialInfo.isPouringWeightDirty = formCtrl['pouringWeight'].dirty;
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
    materialInfo.sheetLength = formCtrl['sheetLength'].value;
    materialInfo.sheetWidth = formCtrl['sheetWidth'].value;
    materialInfo.sheetThickness = formCtrl['sheetThickness'].value;
    materialInfo.inputBilletWidth = formCtrl['inputBilletWidth'].value;
    materialInfo.inputBilletHeight = formCtrl['inputBilletHeight'].value;
    materialInfo.closingTime = formCtrl['closingTime'].value;
    materialInfo.injectionTime = formCtrl['injectionTime'].value;
    materialInfo.holdingTime = formCtrl['holdingTime'].value;
    materialInfo.coolingTime = formCtrl['coolingTime'].value;
    materialInfo.ejectionTime = formCtrl['ejectionTime'].value;
    materialInfo.pickPlaceTime = formCtrl['pickPlaceTime'].value;
    materialInfo.openingTime = formCtrl['openingTime'].value;
    materialInfo.coilWidth = formCtrl['coilWidth'].value;
    materialInfo.coilLength = formCtrl['coilLength'].value;
    materialInfo.partsPerCoil = formCtrl['partsPerCoil'].value;
    materialInfo.coilWeight = formCtrl['coilWeight'].value;
    materialInfo.partOuterDiameter = formCtrl['partOuterDiameter'].value;
    materialInfo.partInnerDiameter = formCtrl['partInnerDiameter'].value;
    materialInfo.runnerRiser = formCtrl['runnerRiser'].value;
    materialInfo.oxidationLossWeight = formCtrl['oxidationLossWeight'].value;
    materialInfo.pouringWeight = formCtrl['pouringWeight'].value;
    materialInfo.cavityArrangementLength = formCtrl['cavityArrangementLength'].value;
    materialInfo.cavityArrangementWidth = formCtrl['cavityArrangementWidth'].value;
    materialInfo.moldBoxLength = formCtrl['moldBoxLength'].value;
    materialInfo.moldBoxHeight = formCtrl['moldBoxHeight'].value;
    materialInfo.widthAllowance = formCtrl['widthAllowance'].value;
    materialInfo.yeildUtilization = formCtrl['yeildUtilization'].value;
    materialInfo.grossVolumne = formCtrl['grossVolumne'].value;
    materialInfo.scaleLoss = formCtrl['scaleLoss'].value;
  }

  formPatchResults(result: MaterialInfoDto) {
    return {
      typeOfCable: this.sharedService.isValidNumber(result.typeOfCable),
      totalCableLength: this.sharedService.isValidNumber(result.totalCableLength),
      noOfCables: this.sharedService.isValidNumber(result.noOfCables),
      flashVolume: this.sharedService.isValidNumber(result.flashVolume),
      noOfCablesWithSameDia: this.sharedService.isValidNumber(result.noOfCablesWithSameDia),
      mainInsulatorID: this.sharedService.isValidNumber(result.mainInsulatorID),
      mainInsulatorOD: this.sharedService.isValidNumber(result.mainInsulatorOD),
      mainCableSheathingMaterial: this.sharedService.isValidNumber(result?.mainCableSheathingMaterial),
      sheetLength: this.sharedService.isValidNumber(result?.sheetLength),
      sheetWidth: this.sharedService.isValidNumber(result?.sheetWidth),
      sheetThickness: this.sharedService.isValidNumber(result?.sheetThickness),
      inputBilletWidth: this.sharedService.isValidNumber(result?.inputBilletWidth),
      inputBilletHeight: this.sharedService.isValidNumber(result?.inputBilletHeight),
      closingTime: this.sharedService.isValidNumber(result?.closingTime),
      injectionTime: this.sharedService.isValidNumber(result?.injectionTime),
      holdingTime: this.sharedService.isValidNumber(result?.holdingTime),
      coolingTime: this.sharedService.isValidNumber(result?.coolingTime),
      ejectionTime: this.sharedService.isValidNumber(result?.ejectionTime),
      pickPlaceTime: this.sharedService.isValidNumber(result?.pickPlaceTime),
      openingTime: this.sharedService.isValidNumber(result?.openingTime),
      coilWidth: this.sharedService.isValidNumber(result?.coilWidth),
      coilLength: this.sharedService.isValidNumber(result?.coilLength),
      partsPerCoil: this.sharedService.isValidNumber(result?.partsPerCoil),
      coilWeight: this.sharedService.isValidNumber(result?.coilWeight),
      partOuterDiameter: this.sharedService.isValidNumber(result?.partOuterDiameter),
      partInnerDiameter: this.sharedService.isValidNumber(result?.partInnerDiameter),
      runnerRiser: this.sharedService.isValidNumber(result?.runnerRiser),
      oxidationLossWeight: this.sharedService.isValidNumber(result?.oxidationLossWeight),
      pouringWeight: this.sharedService.isValidNumber(result?.pouringWeight),
      cavityArrangementLength: this.sharedService.isValidNumber(result?.cavityArrangementLength),
      cavityArrangementWidth: this.sharedService.isValidNumber(result?.cavityArrangementWidth),
      moldBoxLength: this.sharedService.isValidNumber(result?.moldBoxLength),
      moldBoxHeight: this.sharedService.isValidNumber(result?.moldBoxHeight),
      widthAllowance: this.sharedService.isValidNumber(result?.widthAllowance),
      yeildUtilization: this.sharedService.isValidNumber(result?.yeildUtilization),
      grossVolumne: this.sharedService.isValidNumber(result?.grossVolumne),
      scaleLoss: this.sharedService.isValidNumber(result?.scaleLoss),
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
      sheetLength: formCtrl['sheetLength'].value,
      sheetWidth: formCtrl['sheetWidth'].value,
      sheetThickness: formCtrl['sheetThickness'].value,
      inputBilletWidth: formCtrl['inputBilletWidth'].value,
      inputBilletHeight: formCtrl['inputBilletHeight'].value,
      closingTime: formCtrl['closingTime'].value,
      injectionTime: formCtrl['injectionTime'].value,
      holdingTime: formCtrl['holdingTime'].value,
      coolingTime: formCtrl['coolingTime'].value,
      ejectionTime: formCtrl['ejectionTime'].value,
      pickPlaceTime: formCtrl['pickPlaceTime'].value,
      openingTime: formCtrl['openingTime'].value,
      coilWidth: formCtrl['coilWidth'].value,
      coilLength: formCtrl['coilLength'].value,
      partsPerCoil: formCtrl['partsPerCoil'].value,
      coilWeight: formCtrl['coilWeight'].value,
      partOuterDiameter: formCtrl['partOuterDiameter'].value,
      partInnerDiameter: formCtrl['partInnerDiameter'].value,
      runnerRiser: formCtrl['runnerRiser'].value,
      oxidationLossWeight: formCtrl['oxidationLossWeight'].value,
      pouringWeight: formCtrl['pouringWeight'].value,
      cavityArrangementLength: formCtrl['cavityArrangementLength'].value,
      cavityArrangementWidth: formCtrl['cavityArrangementWidth'].value,
      moldBoxLength: formCtrl['moldBoxLength'].value,
      moldBoxHeight: formCtrl['moldBoxHeight'].value,
      widthAllowance: formCtrl['widthAllowance'].value,
      yeildUtilization: formCtrl['yeildUtilization'].value,
      grossVolumne: formCtrl['grossVolumne'].value,
      scaleLoss: formCtrl['scaleLoss'].value,
    };
  }
}
