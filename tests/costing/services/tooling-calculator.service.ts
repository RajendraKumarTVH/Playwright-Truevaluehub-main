import { Injectable } from '@angular/core';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
import { PartComplexity, ToolingMaterialIM, HPDCCastingTool, SheetMetalTools, SheetMetalTool, ToolingRefName, IMProcessGroup } from 'src/app/shared/enums';
import { MaterialInfoDto, ProcessInfoDto, ViewCostSummaryDto } from 'src/app/shared/models';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { CostOverHeadProfitDto } from 'src/app/shared/models/overhead-Profit.model';
import { BopCostToolingDto, ToolingMaterialInfoDto, ToolingProcessInfoDto, ToolingRefLookup, CostToolingDto } from 'src/app/shared/models/tooling.model';
import { SharedService } from './shared.service';
import { CommodityType, CostingConfig } from '../costing.config';
import { ToolingHpdcCalculatorService } from './tooling-hpdc-calculator.service';
import { ToolingSharedCalculatorService } from './tooling-shared-calculator.service';
import { ToolingImCalculatorService } from './tooling-im-calculator.service';
import { ToolingSmCalculatorService } from './tooling-sm-calculator.service';

@Injectable({
  providedIn: 'root',
})
export class ToolingCalculatorService {
  constructor(
    public sharedService: SharedService,
    private _toolConfig: ToolingConfigService,
    public toolingSharedCalculatorService: ToolingSharedCalculatorService,
    public toolingHpdcCalculatorService: ToolingHpdcCalculatorService,
    public toolingImCalculatorService: ToolingImCalculatorService,
    public toolingSmCalculatorService: ToolingSmCalculatorService,
    public _costingConfig: CostingConfig
  ) {}

  calculateMouldType(costTooling: CostToolingDto, currentPart: any, materialInfo: MaterialInfoDto) {
    if (currentPart.commodityId === CommodityType.PlasticAndRubber && materialInfo) {
      const mouldTypeList = this._toolConfig.getMouldType();
      const type = mouldTypeList.find((x) => x.name === materialInfo.runnerType);
      if (type) {
        costTooling.mouldTypeId = type.id;
        if (costTooling.noOfCavity >= 2) {
          costTooling.mouldSubTypeId = 3;
          costTooling.noOfDrop = 2;
        } else {
          costTooling.mouldSubTypeId = 1;
        }
      }
    } else if (Number(currentPart?.eav) > 100000) {
      costTooling.mouldTypeId = 1;
      if (costTooling.noOfCavity >= 2) {
        costTooling.mouldSubTypeId = 3;
        costTooling.noOfDrop = 2;
      } else {
        costTooling.mouldSubTypeId = 1;
      }
    } else {
      costTooling.mouldTypeId = 2;
      if (costTooling.noOfCavity >= 2) {
        costTooling.noOfDrop = 2;
      }
    }
  }

  calculateMoldCost(
    moldInfo: CostToolingDto,
    currentPart: any,
    selectedTool: CostToolingDto,
    fieldColorsList: any,
    materialInfo: MaterialInfoDto = null,
    processInfo: ProcessInfoDto = null,
    toolingMaterialInfoList: ToolingMaterialInfoDto[] = null
  ) {
    let mouldSubTypeId = 0;
    let noOfDrop = 0;
    let mouldTypeId = 0;
    const cavColsRows = this._costingConfig.cavityColsRows(moldInfo.noOfCavity);
    let cavityMaxLength = cavColsRows.columns;
    let cavityMaxWidth = cavColsRows.rows;
    const cavityHoldingPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
    const coreHoldingPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreHoldingPlate);
    const coreBackPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreBackPlate);
    const ejectorPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorPlate);
    const ejectorReturnerPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorReturnerPlate);
    const cavitySideClampingPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavitySideClampingPlate);
    const CoreSideClampingPlate = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreSideClampingPlate);
    const parallelBlock = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialIM.ParallelBlock);
    const manifold = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialIM.ManifoldPlate);
    const toolingMaterial = toolingMaterialInfoList?.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityInsert);
    if (toolingMaterial?.length) {
      moldInfo.moldBaseLength = this.sharedService.isValidNumber(Number(toolingMaterial.length) * Number(moldInfo.cavityMaxLength) + Number(moldInfo.sideGapLength) * 2);
    }
    if (toolingMaterial?.width) {
      moldInfo.moldBaseWidth = this.sharedService.isValidNumber(Number(toolingMaterial.width) * Number(moldInfo.cavityMaxWidth) + Number(moldInfo.sideGapWidth) * 2);
    }
    moldInfo.moldBaseHeight = this.sharedService.isValidNumber(
      Number(cavityHoldingPlate?.height || 0) +
        Number(coreHoldingPlate?.height || 0) +
        Number(coreBackPlate?.height || 0) +
        Number(cavitySideClampingPlate?.height || 0) +
        Number(CoreSideClampingPlate?.height || 0) +
        Number(parallelBlock?.height || 0) +
        Number(manifold?.height || 0) +
        Number(ejectorPlate?.height || 0) +
        Number(ejectorReturnerPlate?.height || 0)
    );

    if (currentPart.commodityId === CommodityType.PlasticAndRubber && materialInfo) {
      const mouldTypeList = this._toolConfig.getMouldType();
      const type = mouldTypeList.find((x) => x.name === materialInfo.runnerType);
      if (type) {
        mouldTypeId = type.id;
        if (selectedTool.noOfCavity >= 2) {
          mouldSubTypeId = 3;
          noOfDrop = 2;
        } else {
          mouldSubTypeId = 1;
        }
      }
    } else if (Number(currentPart?.eav) > 100000) {
      mouldTypeId = 1;
      if (moldInfo.noOfCavity >= 2) {
        mouldSubTypeId = 3;
        noOfDrop = 2;
      } else {
        mouldSubTypeId = 1;
      }
    } else {
      mouldTypeId = 2;
      if (moldInfo.noOfCavity >= 2) {
        noOfDrop = 2;
      }
    }

    if (moldInfo.iscavityMaxLengthDirty && !!moldInfo.cavityMaxLength) {
      moldInfo.cavityMaxLength = Number(moldInfo.cavityMaxLength);
    } else {
      if (moldInfo.cavityMaxLength) {
        cavityMaxLength = this.sharedService.checkDirtyProperty('cavityMaxLength', fieldColorsList) ? selectedTool?.cavityMaxLength : cavityMaxLength;
      }
      moldInfo.cavityMaxLength = cavityMaxLength;
    }

    if (moldInfo.iscavityMaxWidthDirty && !!moldInfo.cavityMaxWidth) {
      moldInfo.cavityMaxWidth = Number(moldInfo.cavityMaxWidth);
    } else {
      moldInfo.iscavityMaxLengthDirty && (cavityMaxWidth = Number(moldInfo.noOfCavity) / Number(moldInfo.cavityMaxLength));
      if (moldInfo.cavityMaxWidth != null) {
        cavityMaxWidth = this.sharedService.checkDirtyProperty('cavityMaxWidth', fieldColorsList) ? selectedTool?.cavityMaxWidth : cavityMaxWidth;
      }
      moldInfo.cavityMaxWidth = cavityMaxWidth;
    }

    if (moldInfo.ismouldTypeIdDirty && moldInfo.mouldTypeId != null) {
      moldInfo.mouldTypeId = Number(moldInfo.mouldTypeId);
    } else {
      if (moldInfo.mouldTypeId != null) {
        mouldTypeId = this.sharedService.checkDirtyProperty('mouldTypeId', fieldColorsList) ? selectedTool?.mouldTypeId : mouldTypeId;
      }
      moldInfo.mouldTypeId = mouldTypeId;
    }
    if (moldInfo.ismouldSubTypeIdDirty && moldInfo.mouldSubTypeId != null) {
      moldInfo.mouldSubTypeId = Number(moldInfo.mouldSubTypeId);
    } else {
      if (moldInfo.mouldSubTypeId != null) {
        mouldSubTypeId = this.sharedService.checkDirtyProperty('mouldSubTypeId', fieldColorsList) ? selectedTool?.mouldSubTypeId : mouldSubTypeId;
      }
      moldInfo.mouldSubTypeId = mouldSubTypeId;
    }

    if (moldInfo.isnoOfDropDirty && moldInfo.noOfDrop != null) {
      moldInfo.noOfDrop = Number(moldInfo.noOfDrop);
    } else {
      if (moldInfo.noOfDrop != null) {
        noOfDrop = this.sharedService.checkDirtyProperty('noOfDrop', fieldColorsList) ? selectedTool?.noOfDrop : noOfDrop;
      }
      moldInfo.noOfDrop = noOfDrop;
    }

    if (moldInfo.isnoOfToolDirty || moldInfo.noOfTool != null) {
      moldInfo.noOfTool = Number(moldInfo.noOfTool);
    } else {
      let noOfTool = Math.round(this.sharedService.isValidNumber(Number(currentPart?.prodLifeRemaining) / (Number(moldInfo.toolLifeInParts) * Number(moldInfo.noOfCavity))));
      noOfTool = noOfTool == 0 ? 1 : noOfTool;
      if (moldInfo.noOfTool != null) {
        noOfTool = this.sharedService.checkDirtyProperty('noOfTool', fieldColorsList) ? selectedTool?.noOfTool : noOfTool;
      }
      moldInfo.noOfTool = noOfTool;
    }

    if (!moldInfo.isEnvelopLengthDirty) {
      moldInfo.envelopLength = Number(moldInfo.partLength);
    }
    if (!moldInfo.isEnvelopWidthDirty) {
      moldInfo.envelopWidth = Number(moldInfo.partWidth);
    }

    if (moldInfo.isnoOfNewToolDirty && moldInfo.noOfNewTool != null) {
      moldInfo.noOfNewTool = Number(moldInfo.noOfNewTool);
    } else {
      let noOfNewTool = 1;
      if (moldInfo.noOfNewTool != null) {
        noOfNewTool = this.sharedService.checkDirtyProperty('noOfNewTool', fieldColorsList) ? selectedTool?.noOfNewTool : noOfNewTool;
      }
      moldInfo.noOfNewTool = noOfNewTool;
    }

    if (moldInfo.isnoOfCopperElectrodesDirty && moldInfo.noOfCopperElectrodes != null) {
      moldInfo.noOfCopperElectrodes = Number(moldInfo.noOfCopperElectrodes);
    } else {
      let noOfCopperElectrodes = 0; // currentPart?.commodityId === CommodityType.Casting ? moldInfo?.noOfCavity : 0;
      if (moldInfo.noOfCopperElectrodes != null) {
        noOfCopperElectrodes = this.sharedService.checkDirtyProperty('noOfCopperElectrodes', fieldColorsList) ? selectedTool?.noOfCopperElectrodes : noOfCopperElectrodes;
      }
      moldInfo.noOfCopperElectrodes = noOfCopperElectrodes;
    }

    if (moldInfo.isnoOfGraphiteElectrodesDirty && moldInfo.noOfGraphiteElectrodes != null) {
      moldInfo.noOfGraphiteElectrodes = Number(moldInfo.noOfGraphiteElectrodes);
    } else {
      let noOfGraphiteElectrodes = moldInfo.noOfCavity;
      if (moldInfo.noOfGraphiteElectrodes != null) {
        noOfGraphiteElectrodes = this.sharedService.checkDirtyProperty('noOfGraphiteElectrodes', fieldColorsList) ? selectedTool?.noOfGraphiteElectrodes : noOfGraphiteElectrodes;
      }
      moldInfo.noOfGraphiteElectrodes = noOfGraphiteElectrodes;
    }
    moldInfo.noOfSubsequentTool = this.sharedService.isValidNumber(Number(moldInfo.noOfTool) - Number(moldInfo.noOfNewTool));
    moldInfo.electrodeMaterialCostCu = this.sharedService.isValidNumber(((Number(moldInfo.envelopLength) * Number(moldInfo.envelopWidth) * 50 * 10) / 1000000) * 3 * moldInfo.noOfCavity * (1300 / 82));
    moldInfo.electrodeMaterialCostGr = this.sharedService.isValidNumber(((Number(moldInfo.envelopLength) * Number(moldInfo.envelopWidth) * 50 * 2) / 1000000) * 3 * moldInfo.noOfCavity * (5000 / 82));
    //Stamping template tool part fields
    this.toolingSmCalculatorService.calculatePartSectionToolingFields(moldInfo, selectedTool, currentPart, fieldColorsList, processInfo);
    this.toolingSmCalculatorService.calculateStampingToolDieSetHeight(moldInfo, currentPart);
    return moldInfo;
  }

  calculateMaterialCost(matInfo: ToolingMaterialInfoDto, toolingMaterialInfoList: ToolingMaterialInfoDto[], tool: CostToolingDto, selectedToolMaterial: ToolingMaterialInfoDto, fieldColorsList: any) {
    let totalPlateWeight = 0;
    if (matInfo.isCommodityIM) {
      this.toolingImCalculatorService.calculateMaterialCostForIm(matInfo, toolingMaterialInfoList, tool, selectedToolMaterial, fieldColorsList);
      totalPlateWeight = matInfo.totalPlateWeight;
    } else if (matInfo.isCommoditySheetMetal) {
      this.toolingSmCalculatorService.calculateMaterialCostForSm(matInfo, toolingMaterialInfoList, tool, selectedToolMaterial, fieldColorsList);
      totalPlateWeight = matInfo.totalPlateWeight;
    } else if (matInfo.isCommodityCasting) {
      this.toolingHpdcCalculatorService.calculateMaterialCostForHPDCCasting(matInfo, toolingMaterialInfoList, tool, selectedToolMaterial, fieldColorsList);
      totalPlateWeight = matInfo.totalPlateWeight;
    }

    if (matInfo.isCommodityIM) {
      if (
        matInfo.moldDescription != ToolingMaterialIM.HotRunnerCost &&
        matInfo.moldDescription != ToolingMaterialIM.SideCoreCost &&
        matInfo.moldDescription != ToolingMaterialIM.AngularCoreCost &&
        matInfo.moldDescription != ToolingMaterialIM.UnscrewingCost
      ) {
        if (matInfo.istotalRawMaterialCostDirty && matInfo.totalRawMaterialCost != null) {
          matInfo.totalRawMaterialCost = Number(matInfo.totalRawMaterialCost);
        } else {
          let totalRawMaterialCost = Number(totalPlateWeight) * Number(matInfo.materialPrice);
          if (matInfo.totalRawMaterialCost != null) {
            totalRawMaterialCost = this.sharedService.checkDirtyProperty('totalRawMaterialCost', fieldColorsList) ? selectedToolMaterial?.totalRawMaterialCost : totalRawMaterialCost;
          }
          matInfo.totalRawMaterialCost = this.sharedService.isValidNumber(totalRawMaterialCost);
        }
      } else {
        totalPlateWeight = 0;
      }
    } else if (!matInfo.isCommoditySheetMetal && !matInfo.isCommodityCasting) {
      if (matInfo.istotalRawMaterialCostDirty && matInfo.totalRawMaterialCost != null) {
        matInfo.totalRawMaterialCost = Number(matInfo.totalRawMaterialCost);
      } else {
        let totalRawMaterialCost = Number(totalPlateWeight) * Number(matInfo.materialPrice);
        if (matInfo.totalRawMaterialCost != null) {
          totalRawMaterialCost = this.sharedService.checkDirtyProperty('totalRawMaterialCost', fieldColorsList) ? selectedToolMaterial?.totalRawMaterialCost : totalRawMaterialCost;
        }
        matInfo.totalRawMaterialCost = this.sharedService.isValidNumber(totalRawMaterialCost);
      }
    }
    matInfo.totalPlateWeight = totalPlateWeight;
    return matInfo;
  }

  calculateProcessCost(
    processInfo: ToolingProcessInfoDto,
    toolingMaterialInfoList: ToolingMaterialInfoDto[],
    tool: CostToolingDto,
    selectedToolmanufacture: ToolingProcessInfoDto,
    fieldColorsList: any
  ) {
    const complexity = processInfo.complexity;
    const noOfSkilledLabors = Number(processInfo.noOfSkilledLabors);
    let skilledLaborRate = 0;
    let totalProcessCost = Number(processInfo.totalProcessCost);
    const perKgCostHardening = Number(processInfo.perKgCostHardening);
    const equipmentRate = Number(processInfo.equipmentRate);
    const machineRate = Number(processInfo.perKgCostMachining);
    let resultList: ToolingRefLookup[] = [];
    let complexValue = 0;
    const dataValues = tool?.toolingMasterData.filter((x) => x.commodityTypeId === processInfo.commodityTypeId && x.countryId == tool.sourceCountryId && x.ciriticality == tool.mouldCriticality);
    if (processInfo.isCommodityIM || processInfo.isCommodityCasting) {
      if (processInfo.isCommodityCasting && tool.toolingNameId === HPDCCastingTool.TrimmingDie) {
        totalProcessCost = this.toolingHpdcCalculatorService.calculateProcessCostForTrimmingDieTool(processInfo, toolingMaterialInfoList, tool);
        processInfo.isTextureCost = false;
      } else {
        const complexvalues = dataValues?.find((x) => x.costType === processInfo.processGroupId);
        if (complexvalues) {
          const criticalityValue = this._toolConfig._bopConfig.getCriticality();
          const foundItem = criticalityValue.find((item) => item.id === tool.mouldCriticality);
          complexValue = processInfo.processGroupId == 3 ? foundItem.processValue : Number(complexvalues?.cost);
          totalProcessCost = Number(tool?.totalSheetCost) * Number(complexValue);
          processInfo.hourRate = Number(complexvalues?.hourRate);
          processInfo.totalNoOfHours = this.sharedService.isValidNumber(totalProcessCost / processInfo.hourRate);
        } else {
          totalProcessCost = 0;
          processInfo.hourRate = 0;
          processInfo.totalNoOfHours = 0;
        }

        if (processInfo.isTextureCost) {
          if (tool.issurfaceFinishDirty) {
            fieldColorsList = [];
          }

          let values = dataValues.find((x) => x.countryId == tool.sourceCountryId);
          if (!values || values == null) {
            values = dataValues.find((x) => x.countryId == 1);
          }

          if (tool?.surfaceFinish == 1) {
            //'=(((envlope length +envlope width + envlope height )*50)*# of cavaties))/82)+(5000/82)
            const textureCost = this.sharedService.isValidNumber(
              ((Number(tool.envelopLength) + Number(tool.envelopWidth) + Number(tool.envelopHeight)) * Number(tool?.noOfCavity) * 50) / 82 + 5000 / 82
            );
            totalProcessCost = Number(textureCost) * Number(values?.textureRatio);
          } else {
            totalProcessCost = 0;
          }
        }
      }
    } else if (processInfo.isCommoditySheetMetal) {
      totalProcessCost = this.toolingSmCalculatorService.calculateProcessCostForStampingTool(processInfo, toolingMaterialInfoList, tool);
      if (!processInfo.isSkilledLaborRateDirty) {
        skilledLaborRate = processInfo.skilledRate;
      } else {
        skilledLaborRate = processInfo.skilledLaborRate;
      }

      if (processInfo.isCommodityIM || processInfo.isCommodityCasting) {
        resultList = processInfo.toolingIMLookupList;
      } else if (processInfo.isCommoditySheetMetal) {
        if (processInfo.toolingNameId == SheetMetalTools.SheetMetalForming) {
          resultList = processInfo.toolingFormingLookupList;
        } else if (processInfo.toolingNameId == SheetMetalTools.SheetMetalBending) {
          resultList = processInfo.toolingBendingLookupList;
        } else if (processInfo.toolingNameId == SheetMetalTools.SheetMetalCutting) {
          resultList = processInfo.toolingCuttingLookupList;
        }
      }

      let toolingRefName = '';
      if (processInfo.isMoldDesign) {
        toolingRefName = ToolingRefName.ToolDesignTime;
      } else if (processInfo.isMachineOperations) {
        toolingRefName = ToolingRefName.MachiningCost;
      } else if (processInfo.isAssembly) {
        toolingRefName = ToolingRefName.SkilledManualTime;
      }

      let cycleTime = 0;
      if (processInfo.isCycleTimeDirty) {
        cycleTime = Number(processInfo.cycleTime);
      } else {
        if (resultList && resultList?.length > 0) {
          if (complexity == PartComplexity.Low) {
            cycleTime = resultList.find((x) => x.toolingRefName == toolingRefName)?.simple;
          } else if (complexity == PartComplexity.Medium) {
            cycleTime = resultList.find((x) => x.toolingRefName == toolingRefName)?.inter;
          } else if (complexity == PartComplexity.High) {
            cycleTime = resultList.find((x) => x.toolingRefName == toolingRefName)?.complex;
          }
        }
      }

      if (
        (processInfo.isMoldDesign || processInfo.isProgramming) &&
        tool.toolingNameId != SheetMetalTool.StampingTool &&
        tool.toolingNameId != SheetMetalTool.BalnkAndPierce &&
        tool.toolingNameId != SheetMetalTool.FormingTool &&
        tool.toolingNameId != SheetMetalTool.CompoundTool &&
        tool.toolingNameId != SheetMetalTool.BendingTool
      ) {
        totalProcessCost = Number(noOfSkilledLabors) * Number(skilledLaborRate) * Number(cycleTime);
      } else if (processInfo.isToolHardening) {
        const materialInfoCavity = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityInsert);
        const materialInfoCore = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreInsert);
        const materialInfoMainGuide = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.ManifoldPlate);
        const materialInfoEjector = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.ManifoldPlate);
        const materialInfoMovingInsert = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.ManifoldPlate);
        const hardeningWeight =
          this.sharedService.isValidNumber(materialInfoCavity?.totalPlateWeight) +
          this.sharedService.isValidNumber(materialInfoCore?.totalPlateWeight) +
          this.sharedService.isValidNumber(materialInfoMainGuide?.totalPlateWeight) +
          this.sharedService.isValidNumber(materialInfoEjector?.totalPlateWeight) +
          this.sharedService.isValidNumber(materialInfoMovingInsert?.totalPlateWeight);
        totalProcessCost = Number(perKgCostHardening) * Number(hardeningWeight);
      } else if (
        processInfo.isMachineOperations &&
        tool.toolingNameId != SheetMetalTool.StampingTool &&
        tool.toolingNameId != SheetMetalTool.BalnkAndPierce &&
        tool.toolingNameId != SheetMetalTool.FormingTool &&
        tool.toolingNameId != SheetMetalTool.CompoundTool &&
        tool.toolingNameId != SheetMetalTool.BendingTool
      ) {
        const totWeight = Number(processInfo?.totmaterialWeight);
        totalProcessCost = Number(machineRate) * Number(totWeight);
      } else if (processInfo.isMachinePlishing) {
        totalProcessCost = (Number(equipmentRate) + Number(skilledLaborRate)) * Number(noOfSkilledLabors) * Number(cycleTime);
      } else if (processInfo.isAssembly) {
        let semiSkilledCycleTime = 0;
        if (processInfo.isSemiSkilledCycleTimeDirty) {
          semiSkilledCycleTime = Number(processInfo.semiSkilledCycleTime);
        } else {
          if (complexity == PartComplexity.Low) {
            semiSkilledCycleTime = resultList.find((x) => x.toolingRefName == ToolingRefName.SemiSkilledManualTime)?.simple;
          } else if (complexity == PartComplexity.Medium) {
            semiSkilledCycleTime = resultList.find((x) => x.toolingRefName == ToolingRefName.SemiSkilledManualTime)?.inter;
          } else if (complexity == PartComplexity.High) {
            semiSkilledCycleTime = resultList.find((x) => x.toolingRefName == ToolingRefName.SemiSkilledManualTime)?.complex;
          }
        }
        processInfo.semiSkilledCycleTime = semiSkilledCycleTime;
        const skilledTotalCost = (Number(equipmentRate) + Number(skilledLaborRate)) * Number(noOfSkilledLabors) * Number(cycleTime);
        processInfo.skilledTotalCost = skilledTotalCost;

        let semiSkilledLaborRate = 0;
        if (processInfo.isSemiSkilledLaborRateDirty) {
          semiSkilledLaborRate = Number(processInfo.semiSkilledLaborRate);
        } else {
          semiSkilledLaborRate = processInfo.lowSkilledRate;
        }

        processInfo.semiSkilledLaborRate = semiSkilledLaborRate;
        const noOfSemiSkilledLabors = Number(processInfo.noOfSemiSkilledLabors);
        const semiSkilledTotalCost = (Number(equipmentRate) + Number(semiSkilledLaborRate)) * Number(noOfSemiSkilledLabors) * Number(semiSkilledCycleTime);
        processInfo.semiSkilledTotalCost = semiSkilledTotalCost;
        totalProcessCost = Number(skilledTotalCost) + Number(semiSkilledTotalCost);
      } else if (processInfo.isToolTrialCost) {
        totalProcessCost = (Number(machineRate) + Number(skilledLaborRate)) * Number(processInfo.cycleTime);
        cycleTime = Number(processInfo.cycleTime);
      }
      processInfo.cycleTime = Number(cycleTime);
    }

    if (processInfo.istotalProcessCostDirty && processInfo.totalProcessCost != null) {
      processInfo.totalProcessCost = Number(processInfo.totalProcessCost);
    } else {
      if (processInfo.totalProcessCost != null) {
        totalProcessCost = this.sharedService.checkDirtyProperty('totalProcessCost', fieldColorsList) ? selectedToolmanufacture?.totalProcessCost : totalProcessCost;
      }
      processInfo.totalProcessCost = this.sharedService.isValidNumber(totalProcessCost);
    }
    return processInfo;
  }

  calculateOVHCost(costSummaryViewData: ViewCostSummaryDto, medOverHeadProfitData, dirtyList: FieldColorsDto[], costingOverHeadProfit: CostOverHeadProfitDto, ovhObj: CostOverHeadProfitDto) {
    if (costSummaryViewData) {
      if (costingOverHeadProfit?.isMohPerDirty && costingOverHeadProfit?.mohPer != null) {
        costingOverHeadProfit.mohPer = Number(costingOverHeadProfit.mohPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medOverHeadProfitData?.medbMohList?.categoryA * 100);
        if (costingOverHeadProfit?.mohPer != null) {
          calPerc = this.sharedService.checkDirtyProperty('MaterialOHPercentage', dirtyList) ? ovhObj.mohPer : calPerc;
        }
        costingOverHeadProfit.mohPer = calPerc;
      }

      if (costingOverHeadProfit?.isFohPerDirty && costingOverHeadProfit?.fohPer != null) {
        costingOverHeadProfit.fohPer = Number(costingOverHeadProfit.fohPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medOverHeadProfitData?.medbFohList?.categoryA * 100);
        if (costingOverHeadProfit?.fohPer != null) {
          calPerc = this.sharedService.checkDirtyProperty('FactoryOHPercentage', dirtyList) ? ovhObj.fohPer : calPerc;
        }
        costingOverHeadProfit.fohPer = calPerc;
      }

      if (costingOverHeadProfit?.isSgaPerDirty && costingOverHeadProfit?.sgaPer != null) {
        costingOverHeadProfit.sgaPer = Number(costingOverHeadProfit.sgaPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medOverHeadProfitData?.medbSgaList?.categoryA * 100);
        if (costingOverHeadProfit?.sgaPer != null) {
          calPerc = this.sharedService.checkDirtyProperty('SGandAPercentage', dirtyList) ? ovhObj.sgaPer : calPerc;
        }
        costingOverHeadProfit.sgaPer = calPerc;
      }

      if (costingOverHeadProfit?.isMaterialProfitPerDirty && costingOverHeadProfit?.materialProfitPer != null) {
        costingOverHeadProfit.materialProfitPer = Number(costingOverHeadProfit.materialProfitPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medOverHeadProfitData?.medbProfitList?.categoryA * 100);
        if (costingOverHeadProfit?.materialProfitPer != null) {
          calPerc = this.sharedService.checkDirtyProperty('MaterialProfitPercentage', dirtyList) ? ovhObj.materialProfitPer : calPerc;
        }
        costingOverHeadProfit.materialProfitPer = calPerc;
      }
      if (costingOverHeadProfit?.isProcessProfitPerDirty && costingOverHeadProfit?.processProfitPer != null) {
        costingOverHeadProfit.processProfitPer = Number(costingOverHeadProfit.processProfitPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medOverHeadProfitData?.medbProfitList?.categoryA * 100);
        if (costingOverHeadProfit?.processProfitPer != null) {
          calPerc = this.sharedService.checkDirtyProperty('ProcessProfitPercentage', dirtyList) ? ovhObj.processProfitPer : calPerc;
        }
        costingOverHeadProfit.processProfitPer = calPerc;
      }

      if (costingOverHeadProfit?.isWarrentyPercentageDirty && costingOverHeadProfit?.warrentyPer != null) {
        costingOverHeadProfit.warrentyPer = Number(costingOverHeadProfit.warrentyPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(0.03 * 100);
        if (costingOverHeadProfit?.warrentyPer != null) {
          calPerc = this.sharedService.checkDirtyProperty('warrentyPercentage', dirtyList) ? ovhObj.warrentyPer : calPerc;
        }
        costingOverHeadProfit.warrentyPer = calPerc;
      }
    }
    const ohCost = this.toolingSharedCalculatorService.getAndSetData(costSummaryViewData, null, null, null, costingOverHeadProfit);
    costingOverHeadProfit.mohCost = ohCost.mohCost;
    costingOverHeadProfit.fohCost = ohCost.fohCost;
    costingOverHeadProfit.sgaCost = ohCost.sgaCost;
    costingOverHeadProfit.warrentyCost = ohCost.warrentyCost;
    costingOverHeadProfit.profitCost = ohCost.profitCost;
    const total = ohCost.mohCost + ohCost.fohCost + ohCost.sgaCost + ohCost.warrentyCost;
    costingOverHeadProfit.OverheadandProfitAmount = total;
    return costingOverHeadProfit;
  }

  calculateBopCost(bopObj: BopCostToolingDto, tool: CostToolingDto, selectedBop: BopCostToolingDto, fieldColorsList: any) {
    let totalProcessCost = 0;
    if (bopObj.isCommoditySheetMetal) {
      //totalProcessCost = this.sharedService.isValidNumber(Number(bopObj.quantity) * Number(bopObj.totalCost));
      if (tool.toolingNameId === SheetMetalTool.CompoundTool) {
        totalProcessCost = this.sharedService.isValidNumber(Number(tool.totalSheetCost) * 0.4);
      } else {
        totalProcessCost = this.sharedService.isValidNumber(Number(tool.totalSheetCost) * 0.3);
      }
    } else if (bopObj.isCommodityCasting && tool.toolingNameId === HPDCCastingTool.TrimmingDie) {
      totalProcessCost = this.sharedService.isValidNumber(Number(tool.totalSheetCost) * 0.35);
    } else {
      // im or casting
      const commodityTypeId = bopObj.isCommodityCasting ? 3 : 1;
      const data = tool?.toolingMasterData.find((x) => x.countryId == tool.sourceCountryId && x.ciriticality == tool.mouldCriticality && x.commodityTypeId === commodityTypeId);
      totalProcessCost = this.sharedService.isValidNumber(Number(data?.bopCost) * Number(tool?.totalSheetCost));
    }

    if (bopObj.istotalProcessCostDirty && !!bopObj.totalProcessCost) {
      bopObj.totalProcessCost = Number(bopObj.totalProcessCost);
    } else {
      if (bopObj.totalProcessCost != null) {
        totalProcessCost = this.sharedService.checkDirtyProperty('bopTotalProcessCost', fieldColorsList) ? selectedBop?.totalProcessCost : totalProcessCost;
      }
      bopObj.totalProcessCost = totalProcessCost;
    }
    return bopObj;
  }

  calculateSubsequentToolCost(costTooling: any, bopCost: number, mouldDescriptionIds: number[], multiplyByNoOfTools = false): number {
    let subsequentToolCost = 0;
    subsequentToolCost += bopCost;

    // Mould material costs
    const mouldMaterials = costTooling?.toolingMaterialInfos?.filter((el) => mouldDescriptionIds.includes(el.moldDescriptionId));
    mouldMaterials?.forEach((mat) => {
      subsequentToolCost += this.sharedService.isValidNumber(mat?.totalRawMaterialCost);
    });

    let baseMouldCost = 0;
    const baseMaterials = costTooling?.toolingMaterialInfos?.filter((el) => !mouldDescriptionIds.includes(el.moldDescriptionId));
    baseMaterials?.forEach((mat) => {
      baseMouldCost += this.sharedService.isValidNumber(mat?.totalRawMaterialCost);
    });
    subsequentToolCost += baseMouldCost * 0.2;

    const processCall = costTooling?.toolingProcessInfos?.filter((el) => el.processGroupId === IMProcessGroup.MachineOperations || el.processGroupId === IMProcessGroup.TextureCost);
    processCall?.forEach((mat) => {
      subsequentToolCost += this.sharedService.isValidNumber(mat?.totalProcessCost);
    });

    const processCall2 = costTooling?.toolingProcessInfos?.filter((el) => el.processGroupId === IMProcessGroup.Validation);
    processCall2?.forEach((mat) => {
      subsequentToolCost += this.sharedService.isValidNumber(mat?.totalProcessCost) * 0.5;
    });

    if (multiplyByNoOfTools && costTooling.noOfSubsequentTool > 0) {
      return subsequentToolCost * costTooling.noOfSubsequentTool;
    } else if (costTooling.noOfSubsequentTool > 0) {
      return subsequentToolCost;
    } else {
      return 0;
    }
  }
}
