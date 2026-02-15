import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { ProcessInfoDto } from '../models';
import { SharedService } from '../../modules/costing/services/shared.service';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingCastingMappingService {
  constructor(public sharedService: SharedService) {}
  getFormFields(conversionValue, isEnableUnitConversion) {
    return {
      subProcessTypeID: [0],
      tableSizeRequired: [''],
      partArea: 0,
      flashArea: 0,
      drillDiameter: this.sharedService.convertUomInUI(60, conversionValue, isEnableUnitConversion),
      allowanceAlongLength: this.sharedService.convertUomInUI(75, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(75, conversionValue, isEnableUnitConversion),
      allowanceBetweenParts: this.sharedService.convertUomInUI(50, conversionValue, isEnableUnitConversion),
      efficiency: [0],
      meltingWeight: [0],
      totalTonnageRequired: [0, [Validators.required]],
      noOfParts: [0],
      utilisation: [80],
      theoreticalForce: [0, [Validators.required]],
      cuttingSpeed: [0, [Validators.required]],
      machineCapacity: [0],
      machcineCapacity: [0],
      flashThickness: this.sharedService.convertUomInUI(2.5, conversionValue, isEnableUnitConversion),
      shotSize: 0,
      powerSupply: [700],
      noOfBends: [0, [Validators.required]],
      noOfCore: 0,
      sandShooting: 0,
      platenSizeLength: 0,
      platenSizeWidth: 0,
      noOfHitsRequired: 0,
      dryCycleTime: [0],
      lengthOfCoated: 0,
      widthOfCoated: 0,
      directProcessCost: [0, [Validators.required]],
    };
  }

  manufacturingFormReset(conversionValue, isEnableUnitConversion) {
    return {
      subProcessTypeID: 0,
      tableSizeRequired: '',
      partArea: 0,
      flashArea: 0,
      drillDiameter: this.sharedService.convertUomInUI(60, conversionValue, isEnableUnitConversion),
      allowanceAlongLength: this.sharedService.convertUomInUI(75, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(75, conversionValue, isEnableUnitConversion),
      allowanceBetweenParts: this.sharedService.convertUomInUI(50, conversionValue, isEnableUnitConversion),
      efficiency: 0,
      meltingWeight: 0,
      totalTonnageRequired: 0,
      noOfParts: 0,
      utilisation: 80,
      theoreticalForce: 0,
      cuttingSpeed: 0,
      machineCapacity: 0,
      machcineCapacity: 0,
      flashThickness: this.sharedService.convertUomInUI(2.5, conversionValue, isEnableUnitConversion),
      shotSize: 0,
      noOfBends: 0,
      powerSupply: 700,
      noOfCore: 0,
      sandShooting: 0,
      platenSizeLength: 0,
      platenSizeWidth: 0,
      noOfHitsRequired: 0,
      dryCycleTime: 0,
      lengthOfCoated: 0,
      widthOfCoated: 0,
      directProcessCost: 0,
    };
  }

  manufacturingFormPatch(obj: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      // subProcessTypeID: obj.subProcessTypeID,
      partArea: this.sharedService.convertUomInUI(obj.partArea, conversionValue, isEnableUnitConversion),
      flashArea: this.sharedService.convertUomInUI(obj.flashArea, conversionValue, isEnableUnitConversion),
      drillDiameter: this.sharedService.convertUomInUI(obj.drillDiameter || 60, conversionValue, isEnableUnitConversion),
      allowanceAlongLength: this.sharedService.convertUomInUI(obj.allowanceAlongLength || 75, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(obj.allowanceAlongWidth || 75, conversionValue, isEnableUnitConversion),
      allowanceBetweenParts: this.sharedService.convertUomInUI(obj.allowanceBetweenParts || 50, conversionValue, isEnableUnitConversion),
      efficiency: obj.efficiency,
      meltingWeight: obj.meltingWeight || 0,
      totalTonnageRequired: this.sharedService.isValidNumber(obj.totalTonnageRequired),
      noOfParts: obj.noOfParts || 0,
      utilisation: obj.utilisation || 80,
      theoreticalForce: this.sharedService.isValidNumber(obj.theoreticalForce),
      cuttingSpeed: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(obj.cuttingSpeed), conversionValue, isEnableUnitConversion),
      machineCapacity: this.sharedService.convertUomInUI(obj.machineCapacity, conversionValue, isEnableUnitConversion),
      machcineCapacity: obj.machcineCapacity || 0,
      flashThickness: this.sharedService.convertUomInUI(obj.flashThickness, conversionValue, isEnableUnitConversion),
      shotSize: obj.shotSize,
      noOfBends: obj.noOfbends || 1,
      powerSupply: obj.powerSupply || 700,
      noOfCore: obj.noOfCore || 0,
      sandShooting: this.sharedService.convertUomInUI(obj.sandShooting, conversionValue, isEnableUnitConversion),
      platenSizeLength: this.sharedService.convertUomInUI(obj.platenSizeLength, conversionValue, isEnableUnitConversion),
      platenSizeWidth: this.sharedService.convertUomInUI(obj.platenSizeWidth, conversionValue, isEnableUnitConversion),
      // sliderRequired: !!obj.platenSizeLength || !!obj.platenSizeWidth ? 'y' : 'n',
      noOfHitsRequired: obj.noOfHitsRequired,
      dryCycleTime: obj.dryCycleTime || 0,
      lengthOfCoated: this.sharedService.convertUomInUI(obj.lengthOfCoated || 0, conversionValue, isEnableUnitConversion),
      widthOfCoated: this.sharedService.convertUomInUI(obj.widthOfCoated || 0, conversionValue, isEnableUnitConversion),
      directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost),
    };
  }

  manufacturingFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl, defaultValues, conversionValue, isEnableUnitConversion) {
    // manufactureInfo.subProcessTypeID = formCtrl['subProcessTypeID'].value;
    manufactureInfo.partArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partArea'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.flashArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['flashArea'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.drillDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['drillDiameter'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.allowanceAlongLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongLength'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.allowanceAlongWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongWidth'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.allowanceBetweenParts = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceBetweenParts'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.efficiency = formCtrl['efficiency'].value != null ? formCtrl['efficiency'].value : defaultValues.machineEfficiency;
    manufactureInfo.meltingWeight = formCtrl['meltingWeight'].value;
    manufactureInfo.totalTonnageRequired = this.sharedService.isValidNumber(formCtrl['totalTonnageRequired'].value);
    manufactureInfo.noOfParts = formCtrl['noOfParts'].value;
    manufactureInfo.utilisation = formCtrl['utilisation'].value;
    manufactureInfo.theoreticalForce = formCtrl['theoreticalForce'].value;
    manufactureInfo.cuttingSpeed = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingSpeed'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.machineCapacity = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['machineCapacity'].value), conversionValue, isEnableUnitConversion);
    manufactureInfo.machcineCapacity = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['machcineCapacity'].value), conversionValue, isEnableUnitConversion);
    manufactureInfo.flashThickness = this.sharedService.convertUomToSaveAndCalculation(formCtrl['flashThickness'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.shotSize = formCtrl['shotSize'].value;
    manufactureInfo.noOfbends = formCtrl['noOfBends'].value || 1;
    manufactureInfo.powerSupply = formCtrl['powerSupply'].value;
    manufactureInfo.noOfCore = formCtrl['noOfCore'].value;
    manufactureInfo.sandShooting = this.sharedService.convertUomToSaveAndCalculation(formCtrl['sandShooting'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.platenSizeLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['platenSizeLength'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.platenSizeWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['platenSizeWidth'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.noOfHitsRequired = formCtrl['noOfHitsRequired'].value;
    manufactureInfo.dryCycleTime = formCtrl['dryCycleTime'].value != null ? formCtrl['dryCycleTime'].value : defaultValues.dryCycleTime;
    manufactureInfo.lengthOfCoated = this.sharedService.convertUomToSaveAndCalculation(formCtrl['lengthOfCoated'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.widthOfCoated = this.sharedService.convertUomToSaveAndCalculation(formCtrl['widthOfCoated'].value, conversionValue, isEnableUnitConversion);
  }

  manufacturingDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.ispartAreaDirty = formCtrl['partArea'].dirty;
    manufactureInfo.isflashAreaDirty = formCtrl['flashArea'].dirty;
    manufactureInfo.isDrillDiameterDirty = formCtrl['drillDiameter'].dirty;
    manufactureInfo.isallowanceAlongLengthDirty = formCtrl['allowanceAlongLength'].dirty;
    manufactureInfo.isallowanceAlongWidthDirty = formCtrl['allowanceAlongWidth'].dirty;
    manufactureInfo.isallowanceBetweenPartsDirty = formCtrl['allowanceBetweenParts'].dirty;
    manufactureInfo.isefficiencyDirty = formCtrl['efficiency'].dirty;
    manufactureInfo.ismeltingWeightDirty = formCtrl['meltingWeight'].dirty;
    manufactureInfo.isTotalTonnageRequiredDirty = formCtrl['totalTonnageRequired'].dirty;
    manufactureInfo.isnoOfPartsDirty = formCtrl['noOfParts'].dirty;
    manufactureInfo.isutilisationDirty = formCtrl['utilisation'].dirty;
    manufactureInfo.isTheoreticalForceDirty = formCtrl['theoreticalForce'].dirty;
    manufactureInfo.iscuttingSpeedDirty = formCtrl['cuttingSpeed'].dirty;
    manufactureInfo.isflashThicknessDirty = formCtrl['flashThickness'].dirty;
    manufactureInfo.isMachcineCapacityDirty = formCtrl['machcineCapacity'].dirty;
    manufactureInfo.isshotSizeDirty = formCtrl['shotSize'].dirty;
    manufactureInfo.isNoOfBends = formCtrl['noOfBends'].dirty;
    manufactureInfo.isPowerSupplyDirty = formCtrl['powerSupply'].dirty;
    manufactureInfo.isNoOfCoreDirty = formCtrl['noOfCore'].dirty;
    manufactureInfo.issandShootingDirty = formCtrl['sandShooting'].dirty;
    manufactureInfo.islengthOfCoatedDirty = formCtrl['lengthOfCoated'].dirty;
    manufactureInfo.isDryCycleTimeDirty = formCtrl['dryCycleTime'].dirty;
    manufactureInfo.iswidthOfCoatedDirty = formCtrl['widthOfCoated'].dirty;
    manufactureInfo.isplatenSizeLengthDirty = formCtrl['platenSizeLength'].dirty;
    manufactureInfo.isplatenSizeWidthDirty = formCtrl['platenSizeWidth'].dirty;
  }

  manufacturingFormPatchResults(result: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      // subProcessTypeID: result.subProcessTypeID,
      partArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partArea), conversionValue, isEnableUnitConversion),
      flashArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.flashArea), conversionValue, isEnableUnitConversion),
      drillDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.drillDiameter), conversionValue, isEnableUnitConversion),
      allowanceAlongLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.allowanceAlongLength), conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.allowanceAlongWidth), conversionValue, isEnableUnitConversion),
      allowanceBetweenParts: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.allowanceBetweenParts), conversionValue, isEnableUnitConversion),
      efficiency: this.sharedService.isValidNumber(result.efficiency),
      meltingWeight: this.sharedService.isValidNumber(result.meltingWeight),
      totalTonnageRequired: this.sharedService.isValidNumber(result.totalTonnageRequired),
      noOfParts: this.sharedService.isValidNumber(result.noOfParts),
      utilisation: this.sharedService.isValidNumber(result?.utilisation),
      theoreticalForce: this.sharedService.isValidNumber(result.theoreticalForce),
      cuttingSpeed: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.cuttingSpeed), conversionValue, isEnableUnitConversion),
      machineCapacity: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.machineCapacity), conversionValue, isEnableUnitConversion),
      machcineCapacity: this.sharedService.isValidNumber(result.machcineCapacity),
      flashThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.flashThickness), conversionValue, isEnableUnitConversion),
      shotSize: this.sharedService.isValidNumber(Number(result.shotSize)),
      noOfBends: this.sharedService.isValidNumber(result.noOfbends) || 1,
      powerSupply: this.sharedService.isValidNumber(result.powerSupply),
      noOfCore: this.sharedService.isValidNumber(result.noOfCore),
      sandShooting: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.sandShooting), conversionValue, isEnableUnitConversion),
      platenSizeLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.platenSizeLength), conversionValue, isEnableUnitConversion),
      platenSizeWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.platenSizeWidth), conversionValue, isEnableUnitConversion),
      noOfHitsRequired: result.noOfHitsRequired,
      dryCycleTime: this.sharedService.isValidNumber(result.dryCycleTime),
      lengthOfCoated: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.lengthOfCoated), conversionValue, isEnableUnitConversion),
      widthOfCoated: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.widthOfCoated), conversionValue, isEnableUnitConversion),
      directProcessCost: this.sharedService.isValidNumber(result.directProcessCost),
    };
  }

  manufacturingFormSubmitPayLoad(formCtrl, conversionValue, isEnableUnitConversion) {
    return {
      // subProcessTypeID: formCtrl['subProcessTypeID'].value || 0,
      partArea: this.sharedService.convertUomToSaveAndCalculation(formCtrl['partArea'].value, conversionValue, isEnableUnitConversion),
      flashArea: this.sharedService.convertUomToSaveAndCalculation(formCtrl['flashArea'].value, conversionValue, isEnableUnitConversion),
      drillDiameter: this.sharedService.convertUomToSaveAndCalculation(formCtrl['drillDiameter'].value, conversionValue, isEnableUnitConversion),
      allowanceAlongLength: this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongLength'].value, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongWidth'].value, conversionValue, isEnableUnitConversion),
      allowanceBetweenParts: this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceBetweenParts'].value, conversionValue, isEnableUnitConversion),
      efficiency: formCtrl['efficiency'].value || 0,
      meltingWeight: formCtrl['meltingWeight'].value,
      totalTonnageRequired: formCtrl['totalTonnageRequired'].value || 0,
      noOfParts: formCtrl['noOfParts'].value || 0,
      utilisation: formCtrl['utilisation'].value || 0,
      theoreticalForce: formCtrl['theoreticalForce'].value || 0,
      cuttingSpeed: this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingSpeed'].value || 0, conversionValue, isEnableUnitConversion),
      machineCapacity: this.sharedService.convertUomToSaveAndCalculation(formCtrl['machineCapacity'].value || 0, conversionValue, isEnableUnitConversion),
      machcineCapacity: this.sharedService.convertUomToSaveAndCalculation(formCtrl['machcineCapacity'].value || 0, conversionValue, isEnableUnitConversion),
      flashThickness: this.sharedService.convertUomToSaveAndCalculation(formCtrl['flashThickness'].value, conversionValue, isEnableUnitConversion),
      shotSize: formCtrl['shotSize'].value,
      noOfBends: formCtrl['noOfBends'].value || 1,
      powerSupply: formCtrl['powerSupply'].value || 0,
      noOfCore: formCtrl['noOfCore'].value || 0,
      sandShooting: this.sharedService.convertUomToSaveAndCalculation(formCtrl['sandShooting'].value, conversionValue, isEnableUnitConversion),
      platenSizeLength: this.sharedService.convertUomToSaveAndCalculation(formCtrl['platenSizeLength'].value, conversionValue, isEnableUnitConversion),
      platenSizeWidth: this.sharedService.convertUomToSaveAndCalculation(formCtrl['platenSizeWidth'].value, conversionValue, isEnableUnitConversion),
      noOfHitsRequired: formCtrl['noOfHitsRequired'].value,
      dryCycleTime: formCtrl['dryCycleTime'].value || 0,
      lengthOfCoated: this.sharedService.convertUomToSaveAndCalculation(formCtrl['lengthOfCoated'].value, conversionValue, isEnableUnitConversion),
      widthOfCoated: this.sharedService.convertUomToSaveAndCalculation(formCtrl['widthOfCoated'].value, conversionValue, isEnableUnitConversion),
      directProcessCost: formCtrl['directProcessCost'].value || 0,
    };
  }

  setMoldPreparationData(materialInfoList, castingFormGroup) {
    if (castingFormGroup) {
      const matMold = materialInfoList.filter((rec) => rec.secondaryProcessId === 3)[0] || null;
      const moldBoxLength = matMold?.moldBoxLength || 0;
      const moldBoxWidth = matMold?.moldBoxWidth || 0;
      // const moldBoxSize = moldBoxLength * moldBoxWidth;
      castingFormGroup.patchValue({
        tableSizeRequired: `${moldBoxLength} x ${moldBoxWidth}`,
      });
    }
  }
}
