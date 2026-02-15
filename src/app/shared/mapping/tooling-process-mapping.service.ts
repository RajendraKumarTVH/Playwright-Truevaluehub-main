import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { CostToolingDto, ToolingProcessInfoDto } from '../models/tooling.model';
import { ToolingConfigService } from '../config/cost-tooling-config';
import { FormGroup } from '@angular/forms';
import { CommodityType } from 'src/app/modules/costing/costing.config';
@Injectable({
  providedIn: 'root',
})
export class ToolingProcessMappingService {
  constructor(
    private sharedService: SharedService,
    public _toolConfig: ToolingConfigService
  ) {}

  getDefaultProcessFormFields() {
    return {
      toolingProcessId: 0,
      processGroupId: 0,
      skilledLaborRate: 0,
      noOfSkilledLabors: 0,
      totalMaterialWeight: 0,
      perKgCostMachining: 0,
      hardeningWeight: 0,
      perKgCostHardening: 0,
      equipmentRate: 0,
      cycleTime: 0,
      totalProcessCost: 0,
      semiSkilledLaborRate: 0,
      noOfSemiSkilledLabors: 0,
      semiSkilledCycleTime: 0,
      semiSkilledTotalCost: 0,
      skilledTotalCost: 0,
      hourRate: 0,
      totalNoOfHours: 0,
    };
  }

  onEditProcessPatch(process: ToolingProcessInfoDto) {
    return {
      toolingProcessId: process?.toolingProcessId,
      processGroupId: process?.processGroupId,
      skilledLaborRate: this.sharedService.isValidNumber(process?.skilledLaborRate),
      noOfSkilledLabors: this.sharedService.isValidNumber(process?.noOfSkilledLabors),
      totalMaterialWeight: this.sharedService.isValidNumber(process?.totalMaterialWeight),
      perKgCostMachining: this.sharedService.isValidNumber(process?.perKgCostMachining),
      hardeningWeight: this.sharedService.isValidNumber(process?.hardeningWeight),
      perKgCostHardening: this.sharedService.isValidNumber(process?.perKgCostHardening),
      equipmentRate: this.sharedService.isValidNumber(process?.equipmentRate),
      cycleTime: this.sharedService.isValidNumber(process?.cycleTime),
      totalProcessCost: this.sharedService.isValidNumber(process?.totalProcessCost),
      semiSkilledLaborRate: this.sharedService.isValidNumber(process?.semiSkilledLaborRate),
      noOfSemiSkilledLabors: this.sharedService.isValidNumber(process?.noOfSemiSkilledLabors),
      semiSkilledCycleTime: this.sharedService.isValidNumber(process?.semiSkilledCycleTime),
      semiSkilledTotalCost: this.sharedService.isValidNumber(process?.semiSkilledTotalCost),
      skilledTotalCost: this.sharedService.isValidNumber(process?.skilledTotalCost),
      hourRate: this.sharedService.isValidNumber(process?.hourRate),
      totalNoOfHours: this.sharedService.isValidNumber(process?.totalNoOfHours),
    };
  }

  getAllDefaultProcessModel(element, tool: CostToolingDto, currentPart, selectedToolId, toolingLookupData, totToolingMaterialWeight): ToolingProcessInfoDto {
    const processObj = new ToolingProcessInfoDto();
    processObj.toolingId = selectedToolId;
    processObj.processGroupId = element.id;
    processObj.perKgCostMachining = element?.machineRate;
    processObj.noOfSkilledLabors = Number(element?.noOfSkilledLabor);
    processObj.noOfSemiSkilledLabors = Number(element?.noOfSkilledLabor);
    processObj.perKgCostHardening = Number(element?.hardeningCost);
    processObj.equipmentRate = Number(element?.equipmentRate);
    processObj.cycleTime = Number(element?.cycleTime);
    processObj.skilledRate = this._toolConfig.laborRate.skilledRate;
    processObj.lowSkilledRate = this._toolConfig.laborRate.lowSkilledRate;
    processObj.skilledLaborRate = this._toolConfig.laborRate.skilledLaborRate;
    processObj.toolingNameId = tool?.toolingNameId;
    processObj.complexity = tool ? tool.mouldCriticality : currentPart?.partComplexity;
    processObj.commodityTypeId = currentPart.commodityId;
    processObj.isCommodityIM = currentPart?.commodityId === CommodityType.PlasticAndRubber;
    processObj.isCommoditySheetMetal = currentPart?.commodityId === CommodityType.SheetMetal;
    processObj.isCommodityCasting = currentPart?.commodityId === CommodityType.Casting;
    processObj.toolingIMLookupList = toolingLookupData.toolingIMLookupList;
    processObj.toolingFormingLookupList = toolingLookupData.toolingFormingLookupList;
    processObj.toolingBendingLookupList = toolingLookupData.toolingBendingLookupList;
    processObj.toolingCuttingLookupList = toolingLookupData.toolingCuttingLookupList;
    processObj.totmaterialWeight = totToolingMaterialWeight;
    return processObj;
  }

  setAllProcessModel(toolingProcess, processFormGroup: FormGroup) {
    toolingProcess.processGroupId = Number(processFormGroup.controls['processGroupId'].value);
    toolingProcess.skilledLaborRate = Number(processFormGroup.controls['skilledLaborRate'].value);
    toolingProcess.noOfSkilledLabors = Number(processFormGroup.controls['noOfSkilledLabors'].value);
    toolingProcess.totalMaterialWeight = Number(processFormGroup.controls['totalMaterialWeight'].value);
    toolingProcess.perKgCostMachining = Number(processFormGroup.controls['perKgCostMachining'].value);
    toolingProcess.hardeningWeight = Number(processFormGroup.controls['hardeningWeight'].value);
    toolingProcess.perKgCostHardening = Number(processFormGroup.controls['perKgCostHardening'].value);
    toolingProcess.equipmentRate = Number(processFormGroup.controls['equipmentRate'].value);
    toolingProcess.cycleTime = Number(processFormGroup.controls['cycleTime'].value);
    toolingProcess.totalProcessCost = Number(processFormGroup.controls['totalProcessCost'].value);
    toolingProcess.semiSkilledLaborRate = Number(processFormGroup.controls['semiSkilledLaborRate'].value);
    toolingProcess.noOfSemiSkilledLabors = Number(processFormGroup.controls['noOfSemiSkilledLabors'].value);
    toolingProcess.semiSkilledCycleTime = Number(processFormGroup.controls['semiSkilledCycleTime'].value);
    toolingProcess.semiSkilledTotalCost = Number(processFormGroup.controls['semiSkilledTotalCost'].value);
    toolingProcess.skilledTotalCost = Number(processFormGroup.controls['skilledTotalCost'].value);
    toolingProcess.hourRate = Number(processFormGroup.controls['hourRate'].value);
    toolingProcess.totalNoOfHours = Number(processFormGroup.controls['totalNoOfHours'].value);
  }

  processCostPatchResults(result) {
    return {
      skilledLaborRate: this.sharedService.isValidNumber(result?.skilledLaborRate),
      hardeningWeight: this.sharedService.isValidNumber(result?.hardeningWeight),
      totalMaterialWeight: this.sharedService.isValidNumber(result?.totmaterialWeight),
      cycleTime: this.sharedService.isValidNumber(result?.cycleTime),
      semiSkilledCycleTime: this.sharedService.isValidNumber(result?.semiSkilledCycleTime),
      skilledTotalCost: this.sharedService.isValidNumber(result?.skilledTotalCost),
      semiSkilledLaborRate: this.sharedService.isValidNumber(result?.semiSkilledLaborRate),
      semiSkilledTotalCost: this.sharedService.isValidNumber(result?.semiSkilledTotalCost),
      totalProcessCost: this.sharedService.isValidNumber(result?.totalProcessCost),
      hourRate: this.sharedService.isValidNumber(result?.hourRate),
      totalNoOfHours: this.sharedService.isValidNumber(result?.totalNoOfHours),
    };
  }

  setCalculalationObject(tool, processInfo, currentPart, frmctrl, toolingFormCntrl, toolingLookupData, processFlags, laborRate, commodity) {
    processInfo.complexity = tool ? tool?.mouldCriticality : currentPart?.partComplexity;
    processInfo.noOfSkilledLabors = Number(frmctrl['noOfSkilledLabors'].value);
    processInfo.skilledLaborRate = Number(frmctrl['skilledLaborRate'].value);
    processInfo.perKgCostHardening = Number(frmctrl['perKgCostHardening'].value);
    processInfo.equipmentRate = Number(frmctrl['equipmentRate'].value);
    processInfo.perKgCostMachining = Number(frmctrl['perKgCostMachining'].value);
    processInfo.noOfSemiSkilledLabors = Number(frmctrl['noOfSemiSkilledLabors'].value);
    processInfo.processGroupId = Number(frmctrl['processGroupId'].value);
    processInfo.cycleTime = Number(frmctrl['cycleTime'].value);
    processInfo.semiSkilledCycleTime = Number(frmctrl['semiSkilledCycleTime'].value);
    processInfo.totalProcessCost = frmctrl['totalProcessCost'].value;
    processInfo.semiSkilledLaborRate = Number(frmctrl['semiSkilledLaborRate'].value);
    processInfo.toolingNameId = Number(toolingFormCntrl['toolingNameId'].value);
    processInfo.commodityTypeId = currentPart.commodityId;
    processInfo.toolingIMLookupList = toolingLookupData.toolingIMLookupList;
    processInfo.toolingFormingLookupList = toolingLookupData.toolingFormingLookupList;
    processInfo.toolingBendingLookupList = toolingLookupData.toolingBendingLookupList;
    processInfo.toolingCuttingLookupList = toolingLookupData.toolingCuttingLookupList;
    if (currentPart.commodityId == CommodityType.PlasticAndRubber) {
      processInfo.isValidation = processFlags.isValidation;
      processInfo.isTextureCost = processFlags.isTextureCost;
      processInfo.isMoldDesign = processFlags.isMoldDesign;
      processInfo.isMachineOperations = processFlags.isMachineOperations;
    } else if (currentPart.commodityId == CommodityType.SheetMetal) {
      processInfo.isMoldDesign = processFlags.isMoldDesign;
      processInfo.isProgramming = processFlags.isProgramming;
      processInfo.isMachineOperations = processFlags.isMachineOperations;
      processInfo.isMachinePlishing = processFlags.isMachinePlishing;
      processInfo.isToolHardening = processFlags.isToolHardening;
      processInfo.isAssembly = processFlags.isAssembly;
      processInfo.isToolTrialCost = processFlags.isToolTrialCost;
    }
    processInfo.skilledRate = laborRate.skilledRate;
    processInfo.lowSkilledRate = laborRate.lowSkilledRate;
    processInfo.skilledLaborRate = laborRate.skilledLaborRate;
    processInfo.isCommodityIM = commodity.isInjMoulding;
    processInfo.isCommoditySheetMetal = commodity.isSheetMetal;
    processInfo.isCommodityCasting = commodity.isCasting;

    processInfo.isSkilledLaborRateDirty = frmctrl['skilledLaborRate'].dirty;
    processInfo.isCycleTimeDirty = frmctrl['cycleTime'].dirty;
    processInfo.isSemiSkilledCycleTimeDirty = frmctrl['semiSkilledCycleTime'].dirty;
    processInfo.isSemiSkilledLaborRateDirty = frmctrl['semiSkilledLaborRate'].dirty;
    processInfo.istotalProcessCostDirty = frmctrl['totalProcessCost'].dirty;
  }

  recalculateModel(toolManufactInfo, manufactureInfoSimulationresult) {
    toolManufactInfo.skilledLaborRate = this.sharedService.isValidNumber(manufactureInfoSimulationresult?.skilledLaborRate);
    toolManufactInfo.hardeningWeight = this.sharedService.isValidNumber(manufactureInfoSimulationresult?.hardeningWeight);
    toolManufactInfo.totalMaterialWeight = this.sharedService.isValidNumber(manufactureInfoSimulationresult?.totmaterialWeight);
    toolManufactInfo.cycleTime = this.sharedService.isValidNumber(manufactureInfoSimulationresult?.cycleTime);
    toolManufactInfo.semiSkilledCycleTime = this.sharedService.isValidNumber(manufactureInfoSimulationresult?.semiSkilledCycleTime);
    toolManufactInfo.skilledTotalCost = this.sharedService.isValidNumber(manufactureInfoSimulationresult?.skilledTotalCost);
    toolManufactInfo.semiSkilledLaborRate = this.sharedService.isValidNumber(manufactureInfoSimulationresult?.semiSkilledLaborRate);
    toolManufactInfo.semiSkilledTotalCost = this.sharedService.isValidNumber(manufactureInfoSimulationresult?.semiSkilledTotalCost);
    toolManufactInfo.totalProcessCost = this.sharedService.isValidNumber(manufactureInfoSimulationresult?.totalProcessCost);
    toolManufactInfo.hourRate = this.sharedService.isValidNumber(manufactureInfoSimulationresult?.hourRate);
    toolManufactInfo.totalNoOfHours = this.sharedService.isValidNumber(manufactureInfoSimulationresult?.totalNoOfHours);
  }
}
