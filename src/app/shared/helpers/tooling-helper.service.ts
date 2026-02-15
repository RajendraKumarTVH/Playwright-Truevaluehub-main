import { Injectable } from '@angular/core';
import { CostToolingDto } from '../models/tooling.model';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
// import * as ToolingInfoActions from 'src/app/modules/_actions/tooling-info.action';
import { Store } from '@ngxs/store';
import { CostOverHeadProfitDto, MedbOverHeadProfitDto } from '../models/overhead-Profit.model';
import { CostingToolingMappingService } from '../mapping/costing-tooling-mapping.service';
import { CommodityType } from 'src/app/modules/costing/costing.config';
import { ToolingConfigService } from '../config/cost-tooling-config';
import { HPDCCastingTool, ToolingMaterialIM } from '../enums';
import { ToolingCalculatorService } from 'src/app/modules/costing/services/tooling-calculator.service';
import { CostToolingSignalsService } from '../signals/cost-tooling-signals.service';

@Injectable({
  providedIn: 'root',
})
export class ToolingHelperService {
  constructor(
    public sharedService: SharedService,
    private _store: Store,
    private _toolingMapper: CostingToolingMappingService,
    private _toolingConfig: ToolingConfigService,
    public _toolingCalculator: ToolingCalculatorService,
    private toolingInfoSignalsService: CostToolingSignalsService
  ) {}

  getMedbOverHeadProfitData(medbohp: MedbOverHeadProfitDto[], countryId: number, txtVolumeCat: string) {
    const filteredMasterList = medbohp.filter((s: any) => s.countryId == countryId && s.volumeCategory == txtVolumeCat);
    const medOverHeadProfitData = {
      medbMohList: filteredMasterList.find((s: any) => s.overHeadProfitType == 'MOH'),
      medbFohList: filteredMasterList.find((s: any) => s.overHeadProfitType == 'FOH'),
      medbSgaList: filteredMasterList.find((s: any) => s.overHeadProfitType == 'SGA'),
      medbProfitList: filteredMasterList.find((s: any) => s.overHeadProfitType == 'Profit'),
    };
    return medOverHeadProfitData;
  }

  calculateToolingCosts(tool: CostToolingDto, toolConfig: any) {
    tool?.toolingMaterialInfos?.forEach((material) => {
      toolConfig._toolingMaterialConfig.materialInfo.totCost += Number(material.totalRawMaterialCost);
      toolConfig._toolingMaterialConfig.materialInfo.totWeight += Number(material.totalPlateWeight);
    });
    toolConfig._toolingMaterialConfig.materialInfo.totCost = this.sharedService.isValidNumber(toolConfig._toolingMaterialConfig.materialInfo.totCost);
    toolConfig._toolingMaterialConfig.materialInfo.totWeight = this.sharedService.isValidNumber(toolConfig._toolingMaterialConfig.materialInfo.totWeight);
    tool?.toolingProcessInfos?.forEach((process) => {
      toolConfig._toolingProcessConfig.processInfo.totCost += Number(process.totalProcessCost);
    });
    toolConfig._toolingProcessConfig.processInfo.totCost = this.sharedService.isValidNumber(toolConfig._toolingProcessConfig.processInfo.totCost);
    tool?.bopCostTooling?.forEach((bop) => {
      toolConfig._bopConfig.bopInfo.totCost += Number(bop.totalCost);
      toolConfig._bopConfig.bopInfo.totProcessCost += Number(bop.totalProcessCost);
      toolConfig._bopConfig.bopInfo.totQty += Number(bop.quantity);
    });
    toolConfig._bopConfig.bopInfo.totCost = this.sharedService.isValidNumber(toolConfig._bopConfig.bopInfo.totCost);
    toolConfig._bopConfig.bopInfo.totProcessCost = this.sharedService.isValidNumber(toolConfig._bopConfig.bopInfo.totProcessCost);
    toolConfig._bopConfig.bopInfo.totQty = this.sharedService.isValidNumber(toolConfig._bopConfig.bopInfo.totQty);
  }

  calculateTotalCosts(tool: CostToolingDto) {
    let totalCoreCavityWeight = 0;
    let totalCoreCavityMaterialCost = 0;
    let totalMouldBaseWeight = 0;
    let totalMouldBaseMaterialCost = 0;
    const toolcpstist = tool?.toolingMaterialInfos?.filter((element) => element.moldDescriptionId === ToolingMaterialIM.CavityInsert || element.moldDescriptionId === ToolingMaterialIM.CoreInsert);
    toolcpstist?.forEach((mat) => {
      totalCoreCavityWeight += Number(mat?.totalPlateWeight);
      totalCoreCavityMaterialCost += Number(mat?.totalRawMaterialCost);
    });
    tool.totalCoreCavityWeight = this.sharedService.isValidNumber(totalCoreCavityWeight);
    tool.totalCoreCavityMaterialCost = this.sharedService.isValidNumber(totalCoreCavityMaterialCost);
    const toolcpstists = tool?.toolingMaterialInfos?.filter(
      (element) => !this._toolingConfig.mouldDescriptionIds.includes(element.moldDescriptionId) && element.moldDescriptionId !== ToolingMaterialIM.HotRunnerCost
    );
    toolcpstists?.forEach((mat) => {
      totalMouldBaseWeight += Number(mat?.totalPlateWeight);
      totalMouldBaseMaterialCost += Number(mat?.totalRawMaterialCost);
    });
    tool.totalMouldBaseWeight = this.sharedService.isValidNumber(totalMouldBaseWeight);
    tool.totalMouldBaseMaterialCost = this.sharedService.isValidNumber(totalMouldBaseMaterialCost);
    return {
      totalCoreCavityWeight: tool.totalCoreCavityWeight,
      totalCoreCavityMaterialCost: tool.totalCoreCavityMaterialCost,
      totalMouldBaseWeight: tool.totalMouldBaseWeight,
      totalMouldBaseMaterialCost: tool.totalMouldBaseMaterialCost,
    };
  }

  setTotalperCost(moldInfo: CostToolingDto, commodityId) {
    let materialCost = 0;
    moldInfo.toolingMaterialInfos?.forEach((material) => {
      materialCost += this.sharedService.isValidNumber(material.totalRawMaterialCost);
    });
    let processCost = 0;
    moldInfo.toolingProcessInfos?.forEach((process) => {
      processCost += this.sharedService.isValidNumber(process.totalProcessCost);
    });
    let bopCost = 0;
    moldInfo.bopCostTooling?.forEach((bop) => {
      bopCost += this.sharedService.isValidNumber(bop.totalProcessCost);
    });
    moldInfo.totalSheetCost = this.sharedService.isValidNumber(Number(materialCost));
    if (commodityId == CommodityType.PlasticAndRubber) {
      moldInfo.toolingCost = this.sharedService.isValidNumber(Number(bopCost) + Number(processCost) + Number(moldInfo.totalSheetCost));
    } else {
      moldInfo.toolingCost = this.sharedService.isValidNumber(Number(bopCost) + Number(processCost) + Number(materialCost));
    }
    return moldInfo.toolingCost;
  }

  savetoolingTotalCostPart(costTooling: CostToolingDto, toolingFormcontrols, conversionValue, isEnableUnitConversion, commodity, currentPart) {
    costTooling.toolCostPerPart = 0;
    costTooling = this.setMaterialDetails(costTooling, toolingFormcontrols, conversionValue, isEnableUnitConversion, commodity);
    // let lifeInParts = Math.min(this.currentPart.lifeTimeQtyRemaining, costTooling.toolLifeInParts);
    let bopCost = 0;
    costTooling?.bopCostTooling?.forEach((bop) => {
      bopCost += this.sharedService.isValidNumber(bop.totalProcessCost);
    });
    if (commodity.isInjMoulding || commodity.isCasting) {
      costTooling.subsequentToolCost = this._toolingCalculator.calculateSubsequentToolCost(costTooling, bopCost, this._toolingConfig.mouldDescriptionIds, false);
      // let subsequentToolCost = 0;
      // const toolcpstist = costTooling?.toolingMaterialInfos?.filter((element) => this._toolingConfig.mouldDescriptionIds.includes(element.moldDescriptionId));
      // toolcpstist?.forEach((mat) => {
      //   subsequentToolCost += this.sharedService.isValidNumber(mat?.totalRawMaterialCost);
      // });
      // let totalMouldBaseMaterialCost = 0;
      // const toolcpstists = costTooling?.toolingMaterialInfos?.filter((element) => !this._toolingConfig.mouldDescriptionIds.includes(element.moldDescriptionId));
      // toolcpstists?.forEach((mat) => {
      //   totalMouldBaseMaterialCost += this.sharedService.isValidNumber(mat?.totalRawMaterialCost);
      // });
      // subsequentToolCost += totalMouldBaseMaterialCost * 0.2;
      // const processCall = costTooling?.toolingProcessInfos?.filter((element) => element.processGroupId === IMProcessGroup.MachineOperations || element.processGroupId === IMProcessGroup.TextureCost);
      // processCall?.forEach((mat) => {
      //   subsequentToolCost += this.sharedService.isValidNumber(mat?.totalProcessCost);
      // });
      // const processCall2 = costTooling?.toolingProcessInfos?.filter((element) => element.processGroupId === IMProcessGroup.Validation);
      // processCall2?.forEach((mat) => {
      //   subsequentToolCost += this.sharedService.isValidNumber(mat?.totalProcessCost) * 0.5;
      // });
      // subsequentToolCost += bopCost;
      // costTooling.subsequentToolCost = costTooling.noOfSubsequentTool > 0 ? subsequentToolCost : 0;
    } else {
      costTooling.subsequentToolCost = 0;
    }
    // costTooling.toolCostPerPart = this.sharedService.isValidNumber((Number(costTooling.toolingCost) + Number(costTooling.subsiquentToolCost)) / Number(lifeInParts));
    costTooling.toolCostPerPart = this.sharedService.isValidNumber(Number(costTooling.toolingCost) / Number(currentPart.lifeTimeQtyRemaining));
    // this._store.dispatch(new ToolingInfoActions.UpdateToolingCostPerPart(costTooling, currentPart?.partInfoId));
    this.toolingInfoSignalsService.updateToolingCostPerPart(costTooling, currentPart?.partInfoId);
  }

  updateToolingMaterials(
    costTooling: CostToolingDto,
    selectedToolId,
    selectedToolMaterialId,
    materialFormGroup,
    conversionValue,
    isEnableUnitConversion,
    toolingMaterialInfoList,
    moldItemDescsriptionsList
  ) {
    if (!costTooling.toolingMaterialInfos?.length) return;
    const toolingMaterial = structuredClone(costTooling.toolingMaterialInfos.find((x) => x.toolingMaterialId === selectedToolMaterialId));
    if (!toolingMaterial) return;
    toolingMaterial.toolingMaterialId = selectedToolMaterialId;
    toolingMaterial.toolingId = selectedToolId;
    this._toolingMapper._materialMapper.setAllMaterialModel(toolingMaterial, materialFormGroup, conversionValue, isEnableUnitConversion);
    toolingMaterialInfoList = [...toolingMaterialInfoList.filter((x) => x.toolingMaterialId !== selectedToolMaterialId), toolingMaterial].sort((a, b) => a.toolingMaterialId - b.toolingMaterialId);
    this.materialIdToNameConversion(toolingMaterialInfoList, moldItemDescsriptionsList);
    costTooling.toolingMaterialInfos = [...toolingMaterialInfoList];
    costTooling.totalSheetCost = costTooling.toolingMaterialInfos.reduce((sum, material) => sum + this.sharedService.isValidNumber(material.totalRawMaterialCost), 0);
    return toolingMaterialInfoList;
  }

  updateToolingProcess(costTooling: CostToolingDto, selectedToolId, selectedToolProcessId, processFormGroup, toolingProcessInfoList, commodityId) {
    if (!costTooling.toolingProcessInfos?.length) return;
    const toolingProcess = structuredClone(costTooling.toolingProcessInfos.find((x) => x.toolingProcessId === selectedToolProcessId));
    if (!toolingProcess) return;
    toolingProcess.toolingProcessId = selectedToolProcessId;
    toolingProcess.toolingId = selectedToolId;
    toolingProcess.totalProcessCost = Number(processFormGroup.controls['totalProcessCost'].value);
    toolingProcessInfoList = [...toolingProcessInfoList.filter((x) => x.toolingProcessId !== selectedToolProcessId), toolingProcess].sort((a, b) => a.toolingProcessId - b.toolingProcessId);
    costTooling.toolingProcessInfos = [...toolingProcessInfoList];
    if (commodityId === CommodityType.PlasticAndRubber) {
      toolingProcess.processGroupId = Number(processFormGroup.controls['processGroupId'].value);
    } else {
      this._toolingMapper._processMapper.setAllProcessModel(toolingProcess, processFormGroup);
    }
    return toolingProcessInfoList;
  }

  updateBopCostTooling(costTooling: CostToolingDto, selectedToolId, selectedToolBopId, bopFormGroup, toolingBOPInfoList, commodityId) {
    if (!costTooling.bopCostTooling?.length) return;
    const bopCostTooling = structuredClone(costTooling.bopCostTooling.find((x) => x.bopCostId === selectedToolBopId));
    if (!bopCostTooling) return;
    this._toolingMapper._bopMapper.setAllBOPModel(bopCostTooling, bopFormGroup, selectedToolBopId, selectedToolId);
    toolingBOPInfoList = [...toolingBOPInfoList.filter((x) => x.bopCostId !== selectedToolBopId), bopCostTooling].sort((a, b) => a.bopCostId - b.bopCostId);
    costTooling.bopCostTooling = [...toolingBOPInfoList];
    if (commodityId !== CommodityType.PlasticAndRubber) {
      bopCostTooling.quantity = Number(bopFormGroup.controls['bopQuantity'].value);
      bopCostTooling.totalCost = Number(bopFormGroup.controls['bopTotalCost'].value);
    }
    return toolingBOPInfoList;
  }

  updateCostOverHeadProfit(costTooling: CostToolingDto, selectedToolId, ohFormGroup, currentPart) {
    let costOverHeadProfit = new CostOverHeadProfitDto();
    costOverHeadProfit.toolingId = selectedToolId || null;
    costOverHeadProfit = { ...costOverHeadProfit, ...this._toolingMapper.ohMapper.setAllOverHeadModel(ohFormGroup, currentPart) };
    costTooling.costOverHeadProfit = [costOverHeadProfit];
  }

  materialIdToNameConversion(toolingMaterialInfoList, moldItemDescsriptionsList) {
    // toolingMaterialInfoList.forEach((tool) => {
    //   tool.toolingMaterialName = moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null;
    // });
    return toolingMaterialInfoList.map((tool) => ({
      ...tool,
      toolingMaterialName: moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null,
    }));
  }

  setMaterialDetails(moldInfo: CostToolingDto, toolingFormCtrl, conversionValue, isEnableUnitConversion, commodity) {
    if (!moldInfo.toolingMaterialInfos) return moldInfo;
    const toolingMaterial = this.getToolingMaterial(moldInfo, commodity);
    this.updateMoldBaseDimensions(moldInfo, toolingMaterial, toolingFormCtrl);
    this.updateMoldBaseHeight(moldInfo, toolingFormCtrl, commodity, conversionValue, isEnableUnitConversion);
    return moldInfo;
  }

  getToolingMaterial(moldInfo: CostToolingDto, commodity) {
    let toolingMaterial = moldInfo.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityInsert);
    if (commodity.isCasting && moldInfo.toolingNameId === HPDCCastingTool.TrimmingDie) {
      toolingMaterial = this._toolingCalculator.toolingSharedCalculatorService.calculateToolMoldBaseLengthAndWidth(moldInfo, CommodityType.Casting);
    }
    return toolingMaterial;
  }

  updateMoldBaseDimensions(moldInfo: CostToolingDto, toolingMaterial: any, toolingFormCtrl) {
    if (toolingMaterial?.length && !toolingFormCtrl['moldBaseLength'].dirty) {
      moldInfo.moldBaseLength = this.sharedService.isValidNumber(Number(toolingMaterial.length) * Number(moldInfo.cavityMaxLength) + Number(moldInfo.sideGapLength) * 2);
    }
    if (toolingMaterial?.width && !toolingFormCtrl['moldBaseWidth'].dirty) {
      moldInfo.moldBaseWidth = this.sharedService.isValidNumber(Number(toolingMaterial.width) * Number(moldInfo.cavityMaxWidth) + Number(moldInfo.sideGapWidth) * 2);
    }
  }

  updateMoldBaseHeight(moldInfo: CostToolingDto, toolingFormCtrl, commodity, conversionValue, isEnableUnitConversion) {
    if (toolingFormCtrl['moldBaseHeight'].dirty) return;
    const plateHeights = [
      'CavityHoldingPlate',
      'CoreHoldingPlate',
      'CoreBackPlate',
      'CavitySideClampingPlate',
      'CoreSideClampingPlate',
      'ParallelBlock',
      'ManifoldPlate',
      'EjectorPlate',
      'EjectorReturnerPlate',
    ].map((id) => Number(moldInfo.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM[id])?.height || 0));
    moldInfo.moldBaseHeight = this.sharedService.convertUomToSaveAndCalculation(
      plateHeights.reduce((acc, val) => acc + val, 0),
      conversionValue,
      isEnableUnitConversion
    );
    if (commodity.isCasting && moldInfo.toolingNameId === HPDCCastingTool.TrimmingDie) {
      const castingHeights = ['CavityInsert', 'CoreInsert', 'CavitySideClampingPlate', 'CoreSideClampingPlate'].map((id) =>
        Number(moldInfo.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM[id])?.height || 0)
      );
      moldInfo.moldBaseHeight = this.sharedService.convertUomToSaveAndCalculation(
        castingHeights.reduce((acc, val) => acc + val, 0),
        conversionValue,
        isEnableUnitConversion
      );
    }
  }
}
