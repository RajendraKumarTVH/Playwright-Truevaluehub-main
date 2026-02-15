
import { ToolingMaterialIM } from 'src/app/shared/enums';
import { ToolingMaterialInfoDto, CostToolingDto } from 'src/app/shared/models/tooling.model';
import { SharedService } from './shared';
import { ToolingSharedCalculatorService } from './tooling-shared-calculator';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';


export class ToolingImCalculatorService {
  constructor(
    public sharedService: SharedService,
    protected toolingSharedCalculatorService: ToolingSharedCalculatorService,
    protected _toolConfig: ToolingConfigService
  ) { }

  public calculateMaterialCostForIm(
    matInfo: ToolingMaterialInfoDto,
    toolingMaterialInfoList: ToolingMaterialInfoDto[],
    tool: CostToolingDto,
    selectedToolMaterial: ToolingMaterialInfoDto,
    fieldColorsList: any
  ) {
    const dataValues = tool?.toolingMasterData.find((x) => x.countryId === tool.sourceCountryId && x.ciriticality === tool.mouldCriticality && x.commodityTypeId === 1);

    if (matInfo.moldDescription == ToolingMaterialIM.CavityInsert) {
      matInfo.moldBaseLength = Number(tool.envelopLength) + Number(tool.runnerGapLength) * 2;
      matInfo.moldBaseWidth = Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2;
      matInfo.moldBaseHeight = Number(tool.envelopHeight) + 40;
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

    } else if (matInfo.moldDescription == ToolingMaterialIM.CoreInsert) {
      matInfo.moldBaseLength = Number(tool.envelopLength) + Number(tool.runnerGapLength) * 2;
      matInfo.moldBaseWidth = Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2;
      matInfo.moldBaseHeight = Number(tool.envelopHeight) + 40 + 20;
      const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityInsert);
      if (toolingMaterial?.length) {
        matInfo.moldBaseLength = toolingMaterial.length;
      }
      if (toolingMaterial?.width) {
        matInfo.moldBaseWidth = toolingMaterial.width;
      }
      if (toolingMaterial?.height) {
        matInfo.moldBaseHeight = toolingMaterial.height + 20;
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);


      // // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.CavityHoldingPlate) {
      this.toolingSharedCalculatorService.calculationForCavityHoldingPlate(matInfo, tool, toolingMaterialInfoList, fieldColorsList, selectedToolMaterial);
      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.CoreHoldingPlate) {
      matInfo.moldBaseLength = Number(tool.envelopLength);
      matInfo.moldBaseWidth = (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth + Number(tool.sideGapWidth) * 2;
      matInfo.moldBaseHeight = Number(tool.envelopHeight);
      const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
      if (toolingMaterial?.length) {
        matInfo.moldBaseLength = toolingMaterial.length;
      }
      if (toolingMaterial?.width) {
        matInfo.moldBaseWidth = toolingMaterial.width;
      }
      if (toolingMaterial?.length) {
        matInfo.moldBaseHeight = toolingMaterial.height + 20;
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.CoreBackPlate) {
      matInfo.moldBaseLength = Number(tool.envelopLength);
      matInfo.moldBaseWidth = (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth + Number(tool.sideGapWidth) * 2;
      matInfo.moldBaseHeight = 50;

      const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreHoldingPlate);
      if (toolingMaterial?.length) {
        matInfo.moldBaseLength = toolingMaterial.length;
      }
      if (toolingMaterial?.width) {
        matInfo.moldBaseWidth = toolingMaterial.width;
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.CavitySideClampingPlate) {
      matInfo.moldBaseLength = Number(tool.envelopLength);
      matInfo.moldBaseWidth = Number(tool.envelopWidth);
      matInfo.moldBaseHeight = 40;
      const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
      if (toolingMaterial?.length) {
        matInfo.moldBaseLength = toolingMaterial.length;
      }
      if (toolingMaterial?.width) {
        matInfo.moldBaseWidth = Number(toolingMaterial.width) + 30 * 2;
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.CoreSideClampingPlate) {
      this.toolingSharedCalculatorService.calculationForCoreSideClampingPlate(matInfo, tool, toolingMaterialInfoList, fieldColorsList, selectedToolMaterial);
      matInfo.moldBaseLength = (Number(tool.envelopLength) + Number(tool.runnerGapLength) * 2) * tool.cavityMaxLength;
      matInfo.moldBaseWidth = (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth;
      matInfo.moldBaseHeight = 25;
      const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityInsert);
      if (toolingMaterial?.length) {
        matInfo.moldBaseLength = Number(toolingMaterial.length) * Number(tool.cavityMaxLength);
      }
      if (toolingMaterial?.width) {
        matInfo.moldBaseWidth = Number(toolingMaterial.width) * Number(tool.cavityMaxWidth);
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);


      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.EjectorReturnerPlate) {
      matInfo.moldBaseLength = (Number(tool.envelopLength) + Number(tool.runnerGapLength) * 2) * tool.cavityMaxLength;
      matInfo.moldBaseWidth = (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth;
      matInfo.moldBaseHeight = 30;
      const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorPlate);
      if (toolingMaterial?.length) {
        matInfo.moldBaseLength = Number(toolingMaterial.length);
      }
      if (toolingMaterial?.width) {
        matInfo.moldBaseWidth = Number(toolingMaterial.width);
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.ParallelBlock) {
      this.toolingSharedCalculatorService.calculationsForParallelBlock(matInfo, tool, toolingMaterialInfoList, fieldColorsList, selectedToolMaterial);

      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.ManifoldPlate) {
      matInfo.moldBaseLength = Number(tool.envelopLength);
      matInfo.moldBaseWidth = Number(tool.envelopWidth);
      matInfo.moldBaseHeight = 0;
      if (tool.mouldTypeId == 1) {
        // hot runner
        matInfo.moldBaseHeight = this._toolConfig.getMouldSubtype().find((x) => x.id == Number(tool.mouldSubTypeId)).manifoldPlate || 0;
      }
      const cavityHoldingPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
      const coreSideClampingPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreSideClampingPlate);
      if (cavityHoldingPlate?.length) {
        matInfo.moldBaseLength = Number(cavityHoldingPlate.length);
      }
      if (coreSideClampingPlate?.width) {
        matInfo.moldBaseWidth = this.sharedService.isValidNumber(Number(coreSideClampingPlate.width));
      }
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);



      if (matInfo.isquantityDirty && matInfo.quantity != null) {
        matInfo.quantity = Number(matInfo.quantity);
      } else {
        let quantity = 0;
        if (tool.mouldTypeId == 1) {

          quantity = [3, 4].includes(Number(tool.mouldSubTypeId)) ? 1 : 0;
          // } else {
          //   quantity = 0;
        }
        if (matInfo.quantity != null) {
          quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
        }
        matInfo.quantity = quantity;
      }

      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.ElectrodeMaterialcost1) {
      // copper
      matInfo.moldBaseLength = Number(tool.envelopLength);
      matInfo.moldBaseWidth = Number(tool.envelopWidth);
      matInfo.moldBaseHeight = 50;
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(((Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density)) / 1000000) * Number(matInfo.quantity));
    } else if (matInfo.moldDescription == ToolingMaterialIM.ElectrodeMaterialcost2) {
      // graphite
      matInfo.moldBaseLength = Number(tool.envelopLength);
      matInfo.moldBaseWidth = Number(tool.envelopWidth);
      matInfo.moldBaseHeight = 50;
      this.toolingSharedCalculatorService.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);

      // matInfo.totalPlateWeight = this.sharedService.isValidNumber(((Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density)) / 1000000) * Number(matInfo.quantity));
    } else if (matInfo.moldDescription == ToolingMaterialIM.SideCoreCost) {
      matInfo.quantity = 0;
      matInfo.totalPlateWeight = 1;
      let values = dataValues;
      if (!values || values == null) {
        values = tool.toolingMasterData.find((x) => x.countryId == 1);
      }

      if (matInfo.istotalRawMaterialCostDirty && matInfo.totalRawMaterialCost != null) {
        matInfo.totalRawMaterialCost = Number(matInfo.totalRawMaterialCost);
      } else {
        let totalRawMaterialCost = Math.round(Number(values?.sideCoreCostDefault / values?.sideCoreCostDivider) * values?.sideCoreRatio) * Number(tool.undercutsSideCores) * Number(tool.noOfCavity);

        if (matInfo.totalRawMaterialCost != null) {
          totalRawMaterialCost = this.sharedService.checkDirtyProperty('totalRawMaterialCost', fieldColorsList) ? selectedToolMaterial?.totalRawMaterialCost : totalRawMaterialCost;
        }
        matInfo.totalRawMaterialCost = totalRawMaterialCost;
      }
    } else if (matInfo.moldDescription == ToolingMaterialIM.AngularCoreCost) {
      matInfo.quantity = 0;
      matInfo.totalPlateWeight = 1;
      let values = dataValues;
      if (!values || values == null) {
        values = tool.toolingMasterData.find((x) => x.countryId == 1);
      }

      if (matInfo.istotalRawMaterialCostDirty && matInfo.totalRawMaterialCost != null) {
        matInfo.totalRawMaterialCost = Number(matInfo.totalRawMaterialCost);
      } else {
        let totalRawMaterialCost =
          Math.round(Number(values?.angularCostDefault / values?.angularCostDivider) * values?.angularSlideRatio) * Number(tool.undercutsAngularSlides) * Number(tool.noOfCavity);

        if (matInfo.totalRawMaterialCost != null) {
          totalRawMaterialCost = this.sharedService.checkDirtyProperty('totalRawMaterialCost', fieldColorsList) ? selectedToolMaterial?.totalRawMaterialCost : totalRawMaterialCost;
        }
        matInfo.totalRawMaterialCost = totalRawMaterialCost;
      }
    } else if (matInfo.moldDescription == ToolingMaterialIM.UnscrewingCost) {
      matInfo.quantity = 0;
      matInfo.totalPlateWeight = 1;
      let values = dataValues;
      if (!values || values == null) {
        values = tool.toolingMasterData.find((x) => x.countryId == 1);
      }

      if (matInfo.istotalRawMaterialCostDirty && matInfo.totalRawMaterialCost != null) {
        matInfo.totalRawMaterialCost = Number(matInfo.totalRawMaterialCost);
      } else {
        let totalRawMaterialCost =
          Math.round(Number(values?.unscrewingCostDefault / values?.unscrewingCostDivider) * values?.unscrewingRatio) * Number(tool.undercutsUnscrewing) * Number(tool.noOfCavity);
        if (matInfo.totalRawMaterialCost != null) {
          totalRawMaterialCost = this.sharedService.checkDirtyProperty('totalRawMaterialCost', fieldColorsList) ? selectedToolMaterial?.totalRawMaterialCost : totalRawMaterialCost;
        }
        matInfo.totalRawMaterialCost = totalRawMaterialCost;
      }
    } else if (matInfo.moldDescription == ToolingMaterialIM.HotRunnerCost) {
      matInfo.quantity = 0;
      matInfo.totalPlateWeight = 1;
      let values = dataValues;
      if (!values || values == null) {
        values = tool.toolingMasterData.find((x) => x.countryId == 1);
      }
      let hotRunnerCalc = Number(75000 / 82);
      if (tool.mouldTypeId == 1) {
        if (tool.mouldSubTypeId == 1) {
          tool.hotRunnerCost = Number(hotRunnerCalc) * values?.hotRatio;
        } else if (tool.mouldSubTypeId == 2) {
          hotRunnerCalc = Number(150000 / 82);
          tool.hotRunnerCost = Number(hotRunnerCalc) * values?.hotRatio;
        } else if (tool.mouldSubTypeId == 3) {
          hotRunnerCalc = Number(130000 / 82);
          tool.hotRunnerCost = Number(tool.noOfDrop) * Number(hotRunnerCalc) * values?.hotRatio;
        } else if (tool.mouldSubTypeId == 4) {
          hotRunnerCalc = Number(225000 / 82);
          tool.hotRunnerCost = Number(tool.noOfDrop) * Number(hotRunnerCalc) * values?.hotRatio;
        }
      } else {
        tool.hotRunnerCost = 0;
        matInfo.quantity = 0;
      }

      if (matInfo.istotalRawMaterialCostDirty && matInfo.totalRawMaterialCost != null) {
        matInfo.totalRawMaterialCost = Number(matInfo.totalRawMaterialCost);
      } else {
        let totalRawMaterialCost = tool.hotRunnerCost;
        if (matInfo.totalRawMaterialCost != null) {
          totalRawMaterialCost = this.sharedService.checkDirtyProperty('totalRawMaterialCost', fieldColorsList) ? selectedToolMaterial?.totalRawMaterialCost : totalRawMaterialCost;
        }
        matInfo.totalRawMaterialCost = totalRawMaterialCost;
      }
    }
  }
}
