import { CommodityType, IMProcessGroup, SheetMetalProcessGroup } from '../enums/index';

export class CostingToolingProcessConfigService {
  public processInfo = {
    totCost: 0,
  };

  public processFlags = {
    isMoldDesign: false,
    isProgramming: false,
    isMachineOperations: false,
    isMachinePlishing: false,
    isToolHardening: false,
    isAssembly: false,
    isToolTrialCost: false,
    isValidation: false,
    isTextureCost: false,
  };

  setProcessFlagsOnEditProcessInfo(commodityId: number, processGroupId: number) {
    if (commodityId == CommodityType.PlasticAndRubber) {
      return {
        isMoldDesign: processGroupId === IMProcessGroup.MoldDesign,
        isValidation: processGroupId === IMProcessGroup.Validation,
        isTextureCost: processGroupId === IMProcessGroup.TextureCost,
        isMachineOperations: processGroupId === IMProcessGroup.MachineOperations,
      };
    } else if (commodityId == CommodityType.SheetMetal) {
      return {
        isMoldDesign: processGroupId === SheetMetalProcessGroup.MoldDesign,
        isProgramming: processGroupId === SheetMetalProcessGroup.Programming,
        isMachineOperations: processGroupId === SheetMetalProcessGroup.MachineOperations,
        isMachinePlishing: processGroupId === SheetMetalProcessGroup.MachinePlishing,
        isToolHardening: processGroupId === SheetMetalProcessGroup.ToolHardening,
        isAssembly: processGroupId === SheetMetalProcessGroup.Assembly,
        isToolTrialCost: processGroupId === SheetMetalProcessGroup.ToolTrialCost,
        isValidation: processGroupId === SheetMetalProcessGroup.Validation,
      };
    }
    return {};
  }

  getProcessGroups(commodity: number) {
    let list: any[] = [];
    if (commodity == CommodityType.PlasticAndRubber || commodity == CommodityType.Casting) {
      list = [
        { id: 1, name: 'Mold Design', noOfSkilledLabor: 2 },
        { id: 2, name: 'Machining', noOfSkilledLabor: 2 },
        { id: 3, name: 'Validation', noOfSkilledLabor: 1, machineRate: 8.5 },
        { id: 4, name: 'Texture Cost', noOfSkilledLabor: 1, equipmentRate: 1 },
      ];
    } else if (commodity == CommodityType.SheetMetal) {
      list = [
        { id: 1, name: 'Tool Design', noOfSkilledLabor: 2 },
        { id: 3, name: 'Machining Operations', noOfSkilledLabor: 1, machineRate: 8.5 },
        { id: 8, name: 'Validation', noOfSkilledLabor: 1, cycleTime: 8, machineRate: 10 },
      ];
    }
    return list;
  }
}
