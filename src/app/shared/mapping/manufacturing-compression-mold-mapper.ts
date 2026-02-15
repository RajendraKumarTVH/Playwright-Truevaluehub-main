import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';
@Injectable({
  providedIn: 'root',
})
export class CompressionMoldingMapperService {
  constructor(public sharedService: SharedService) {}
  getFormFields() {
    return {
      loadingTime: 0,
      processTime: 0,
      moldOpening: 0,
      coolingTime: 0,
      dryCycleTime: 0,
      pouringTime: 0,
      dieOpeningTime: 0,
      partExtractionTime: 0,
    };
  }

  formReset() {
    return {
      loadingTime: 0,
      processTime: 0,
      moldOpening: 0,
      coolingTime: 0,
      dryCycleTime: 0,
      pouringTime: 0,
      dieOpeningTime: 0,
      partExtractionTime: 0,
    };
  }

  formPatch(manufactureInfo: ProcessInfoDto) {
    return {
      loadingTime: manufactureInfo.loadingTime,
      processTime: manufactureInfo.processTime,
      moldOpening: manufactureInfo.moldOpening,
      coolingTime: manufactureInfo.coolingTime,
      dryCycleTime: manufactureInfo.dryCycleTime,
      pouringTime: manufactureInfo.pouringTime,
      dieOpeningTime: manufactureInfo.dieOpeningTime,
      partExtractionTime: manufactureInfo.partExtractionTime,
    };
  }

  setCalculationObject(manufactureInfo, formCtrl) {
    manufactureInfo.loadingTime = formCtrl['loadingTime'].value;
    manufactureInfo.processTime = formCtrl['processTime'].value;
    manufactureInfo.moldOpening = formCtrl['moldOpening'].value;
    manufactureInfo.coolingTime = formCtrl['coolingTime'].value;
    manufactureInfo.dryCycleTime = formCtrl['dryCycleTime'].value;
    manufactureInfo.pouringTime = formCtrl['pouringTime'].value;
    manufactureInfo.dieOpeningTime = formCtrl['dieOpeningTime'].value;
    manufactureInfo.partExtractionTime = formCtrl['partExtractionTime'].value;
  }

  dirtyCheck(manufactureInfo, formCtrl) {
    manufactureInfo.isProcessTimeDirty = formCtrl['processTime']?.dirty;
    manufactureInfo.iscoolingTimeDirty = formCtrl['coolingTime']?.dirty;
    manufactureInfo.ispouringTimeDirty = formCtrl['pouringTime']?.dirty;
    manufactureInfo.isdieOpeningTimeDirty = formCtrl['dieOpeningTime']?.dirty;
    manufactureInfo.isMoldOpeningDirty = formCtrl['moldOpening'].dirty;
    manufactureInfo.ispartExtractionTimeDirty = formCtrl['partExtractionTime']?.dirty;
    manufactureInfo.isLoadingTimeDirty = formCtrl['loadingTime']?.dirty;
    manufactureInfo.iscycleTimeDirty = formCtrl['cycleTime']?.dirty;
    manufactureInfo.isdirectMachineCostDirty = formCtrl['directMachineCost']?.dirty;
    manufactureInfo.isdirectSetUpCostDirty = formCtrl['directSetUpCost']?.dirty;
    manufactureInfo.isdirectLaborCostDirty = formCtrl['directLaborCost']?.dirty;
    manufactureInfo.isinspectionCostDirty = formCtrl['inspectionCost']?.dirty;
    manufactureInfo.isyieldCostDirty = formCtrl['yieldCost']?.dirty;
    return manufactureInfo;
  }

  processPayload(formCtrl) {
    return {
      loadingTime: formCtrl['loadingTime'].value,
      processTime: formCtrl['processTime'].value,
      moldOpening: formCtrl['moldOpening'].value,
      coolingTime: formCtrl['coolingTime'].value,
      dryCycleTime: formCtrl['dryCycleTime'].value,
      pouringTime: formCtrl['pouringTime'].value,
      dieOpeningTime: formCtrl['dieOpeningTime'].value,
      partExtractionTime: formCtrl['partExtractionTime'].value,
    };
  }
}
