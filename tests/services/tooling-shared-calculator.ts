
import { CostToolingDto, ToolingMaterialInfoDto } from 'src/app/shared/models/tooling.model';
import { SharedService } from './shared';
import { StampingMetrialLookUp } from 'src/app/shared/models/sheet-metal-lookup.model';
import { StampingMetrialLookUpState } from '../../_state/stamping-material-lookup.state';



import { CommodityType } from '../costing.config';
import { HPDCCastingTool, SheetMetalTool, ToolingMaterialIM } from 'src/app/shared/enums';
import { ViewCostSummaryDto } from 'src/app/shared/models';
import { CostOverHeadProfitDto } from 'src/app/shared/models/overhead-Profit.model';

export class ToolingSharedCalculatorService {
  stampingMetrialLookUpData: StampingMetrialLookUp[] = [];
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();

  _stampingMetrialLookUp$: Observable<StampingMetrialLookUp[]>;

  constructor(
    private store: Store,
    public sharedService: SharedService
  ) {
    this._stampingMetrialLookUp$ = this.store.select(StampingMetrialLookUpState.getStampingMetrialLookUp);
    this._stampingMetrialLookUp$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((response) => {
      if (response && response.length > 0) {
        this.stampingMetrialLookUpData = response;
      }
    });
  }

  calculateMaterialAllowance(matInfo: ToolingMaterialInfoDto): number {
    let materialAllowance = 0;
    if (!matInfo.ismaterialCuttingAllowanceDirty) {
      matInfo.materialCuttingAllowance = 10;
      materialAllowance = 0.1;
    } else {
      materialAllowance = this.sharedService.isValidNumber(matInfo.materialCuttingAllowance / 100);
    }
    return materialAllowance;
  }

  calculateTotalMaterialCost(matInfo: ToolingMaterialInfoDto, selectedToolMaterial: ToolingMaterialInfoDto, fieldColorsList: any) {
    if (matInfo.istotalRawMaterialCostDirty && matInfo.totalRawMaterialCost != null) {
      matInfo.totalRawMaterialCost = Number(matInfo.totalRawMaterialCost);
    } else {
      let totalRawMaterialCost = this.sharedService.isValidNumber(Number(matInfo.totalPlateWeight) * Number(matInfo.materialPrice));
      if (matInfo.totalRawMaterialCost != null) {
        totalRawMaterialCost = this.sharedService.checkDirtyProperty('totalRawMaterialCost', fieldColorsList) ? selectedToolMaterial?.totalRawMaterialCost : totalRawMaterialCost;
      }
      matInfo.totalRawMaterialCost = totalRawMaterialCost;
    }
  }

  getStampingMaterialLookUpValue(categoryId: number, value: number): number {
    const expectedValue = this.stampingMetrialLookUpData.filter(
      (x) => x.categoryId === categoryId && x.min < this.sharedService.isValidNumber(value) && x.max >= this.sharedService.isValidNumber(value)
    );
    if (expectedValue && expectedValue?.length > 0) {
      return expectedValue[0]?.expectedValue;
    }
    return null;
  }

  calculateToolMoldBaseLengthAndWidth(costTooling: CostToolingDto, commodityType: CommodityType) {
    if (commodityType === CommodityType.Casting && costTooling.toolingNameId === HPDCCastingTool.TrimmingDie) {
      return costTooling?.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavitySideClampingPlate);
    }
    return costTooling?.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
  }

  calculateToolLifeInParts(costTooling: CostToolingDto, toolData: any, currentPart: any, toolLife: number) {
    if (
      currentPart.commodityId === CommodityType.SheetMetal &&
      [SheetMetalTool.StampingTool, SheetMetalTool.BalnkAndPierce, SheetMetalTool.FormingTool, SheetMetalTool.CompoundTool, SheetMetalTool.BendingTool].includes(costTooling.toolingNameId)
    ) {
      costTooling.toolLifeInParts = currentPart?.lifeTimeQtyRemaining;
    } else {
      costTooling.toolLifeInParts = Math.min(Number(toolLife), Number(toolData.end));
    }
  }

  getAndSetData(costSummaryViewData: ViewCostSummaryDto, annualVolume: number, lotSize: number, paymentTermId: number, getCostingOverHeadProfit: CostOverHeadProfitDto) {
    const costingOverHeadProfit = new CostOverHeadProfitDto();
    const eXWPartCostAmount = Number(costSummaryViewData?.sumNetMatCost) + Number(costSummaryViewData?.sumNetProcessCost) + +Number(costSummaryViewData?.toolingCost) || 0;
    const eXCostAmount = Number(costSummaryViewData?.sumNetMatCost) + Number(costSummaryViewData?.sumNetProcessCost) || 0;
    const materialOverHeadCost = (getCostingOverHeadProfit.mohPer / 100) * costSummaryViewData?.sumNetMatCost || 0;
    costingOverHeadProfit.mohCost = materialOverHeadCost;

    const factoryOverHeadCost = (getCostingOverHeadProfit.fohPer / 100) * Number(costSummaryViewData?.sumNetProcessCost) || 0;
    costingOverHeadProfit.fohCost = factoryOverHeadCost;

    const SGACost = (getCostingOverHeadProfit.sgaPer / 100) * eXCostAmount || 0;
    costingOverHeadProfit.sgaCost = SGACost;

    const WarrentyCost = (getCostingOverHeadProfit.warrentyPer / 100) * eXWPartCostAmount || 0;
    costingOverHeadProfit.warrentyCost = WarrentyCost;

    const profit =
      (getCostingOverHeadProfit.materialProfitPer / 100) * Number(costSummaryViewData?.sumNetMatCost) +
      (getCostingOverHeadProfit.processProfitPer / 100) * (Number(costSummaryViewData?.sumNetProcessCost) || 0);
    costingOverHeadProfit.profitCost = profit || 0;
    return costingOverHeadProfit;
  }

  public calculateCommonTooling(matInfo: ToolingMaterialInfoDto, tool: CostToolingDto, fieldColorsList: any, selectedToolMaterial: ToolingMaterialInfoDto) {
    let envHeight = 0,
      envWidth = 0,
      envLength = 0;
    if (matInfo.isLengthDirty && matInfo.length != null) {
      matInfo.length = Number(matInfo.length);
    } else {
      let length = Number(matInfo.moldBaseLength);
      if (matInfo.length != null) {
        length = this.sharedService.checkDirtyProperty('length', fieldColorsList) ? selectedToolMaterial?.length : length;
      }
      matInfo.length = length;
    }
    if (matInfo.isWidthDirty && matInfo.width != null) {
      matInfo.width = Number(matInfo.width);
    } else {
      let width = Number(matInfo.moldBaseWidth);
      if (matInfo.width != null) {
        width = this.sharedService.checkDirtyProperty('width', fieldColorsList) ? selectedToolMaterial?.width : width;
      }
      matInfo.width = width;
    }

    if (matInfo.isHeightDirty && matInfo.height != null) {
      matInfo.height = Number(matInfo.height);
    } else {
      let height = Number(matInfo.moldBaseHeight);
      if (matInfo.height != null) {
        height = this.sharedService.checkDirtyProperty('height', fieldColorsList) ? selectedToolMaterial?.height : height;
      }
      matInfo.height = height;
    }
    if (!(matInfo.moldDescription == ToolingMaterialIM.ManifoldPlate)) {
      if (matInfo.isquantityDirty && matInfo.quantity != null) {
        matInfo.quantity = Number(matInfo.quantity);
      } else {
        let quantity = 1;
        if (matInfo.moldDescription == ToolingMaterialIM.CavityInsert || matInfo.moldDescription == ToolingMaterialIM.CoreInsert) {
          quantity = Number(tool.noOfCavity);
        } else if (matInfo.moldDescription == ToolingMaterialIM.ParallelBlock) {
          quantity = 2;
        } else if (matInfo.moldDescription == ToolingMaterialIM.ElectrodeMaterialcost1) {
          quantity = Number(tool.noOfCopperElectrodes);
        } else if (matInfo.moldDescription == ToolingMaterialIM.ElectrodeMaterialcost2) {
          quantity = Number(tool.noOfGraphiteElectrodes);
        }
        if (matInfo.quantity != null) {
          quantity = this.sharedService.checkDirtyProperty('quantity', fieldColorsList) ? selectedToolMaterial?.quantity : quantity;
        }
        matInfo.quantity = quantity;
      }
    }
    if (matInfo.ismaterialPriceDirty && !!matInfo.materialPrice) {
      matInfo.materialPrice = Number(matInfo.materialPrice);
    } else {
      let materialPrice = Number(matInfo.materialPrice);
      if (matInfo.materialPrice != null) {
        materialPrice = this.sharedService.checkDirtyProperty('materialPrice', fieldColorsList) ? selectedToolMaterial?.materialPrice : materialPrice;
      }
      matInfo.materialPrice = materialPrice;
    }

    if (matInfo.isscrapPriceDirty && matInfo.scrapPrice != null) {
      matInfo.scrapPrice = Number(matInfo.scrapPrice);
    } else {
      let scrapPrice = Number(matInfo.scrapPrice);
      if (matInfo.scrapPrice != null) {
        scrapPrice = this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedToolMaterial?.scrapPrice : scrapPrice;
      }
      matInfo.scrapPrice = scrapPrice;
    }

    if (matInfo.isdensityDirty && !!matInfo.density) {
      matInfo.density = Number(matInfo.density);
    } else {
      let density = Number(matInfo.density);
      if (matInfo.density != null) {
        density = this.sharedService.checkDirtyProperty('density', fieldColorsList) ? selectedToolMaterial?.density : density;
      }
      matInfo.density = density;
    }
    envLength = Number(matInfo.length);
    envWidth = Number(matInfo.width);
    envHeight = Number(matInfo.height);

    if (matInfo.isnetWeightDirty && matInfo.netWeight != null) {
      matInfo.netWeight = Number(matInfo.netWeight);
    } else {
      let netWeight = this.sharedService.isValidNumber(
        this.sharedService.isValidNumber(Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density) * Number(matInfo.quantity) * Number(Math.pow(10, -6)))
      );
      if (matInfo.netWeight != null) {
        netWeight = this.sharedService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedToolMaterial?.netWeight : netWeight;
      }
      matInfo.netWeight = netWeight;
    }
    // if (matInfo.isCommodityCasting || matInfo.isCommodityIM) {
    matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + this.calculateMaterialAllowance(matInfo)));
    if (
      matInfo.moldDescription == ToolingMaterialIM.ManifoldPlate ||
      (matInfo.isCommodityIM && !(matInfo.moldDescription == ToolingMaterialIM.ElectrodeMaterialcost1 || matInfo.moldDescription == ToolingMaterialIM.ElectrodeMaterialcost2))
    ) {
      matInfo.totalPlateWeight = this.sharedService.isValidNumber(Number(matInfo.netWeight) * (1 + matInfo.materialCuttingAllowance / 100));
    } else if (matInfo.moldDescription == ToolingMaterialIM.ElectrodeMaterialcost1 || matInfo.moldDescription == ToolingMaterialIM.ElectrodeMaterialcost2) {
      matInfo.totalPlateWeight = this.sharedService.isValidNumber(((Number(envLength) * Number(envWidth) * Number(envHeight) * Number(matInfo.density)) / 1000000) * Number(matInfo.quantity));
    }
    // }
  }

  calculationForCavityHoldingPlate(
    matInfo: ToolingMaterialInfoDto,
    tool: CostToolingDto,
    toolingMaterialInfoList: ToolingMaterialInfoDto[],
    fieldColorsList: any,
    selectedToolMaterial: ToolingMaterialInfoDto
  ) {
    matInfo.moldBaseLength = Number(tool.envelopLength);
    matInfo.moldBaseWidth = this.sharedService.isValidNumber((Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth + Number(tool.sideGapWidth) * 2);
    matInfo.moldBaseHeight = Number(tool.envelopHeight);

    const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityInsert);
    if (toolingMaterial?.length) {
      matInfo.moldBaseLength = this.sharedService.isValidNumber(Number(toolingMaterial.length) * Number(tool.cavityMaxLength) + Number(tool.sideGapLength) * 2);
    }

    if (toolingMaterial?.width) {
      matInfo.moldBaseWidth = this.sharedService.isValidNumber(Number(toolingMaterial.width) * Number(tool.cavityMaxWidth) + Number(tool.sideGapWidth) * 2);
    }

    if (toolingMaterial?.height) {
      matInfo.moldBaseHeight = toolingMaterial.height + 40;
    }
    this.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);
  }

  calculationsForParallelBlock(
    matInfo: ToolingMaterialInfoDto,
    tool: CostToolingDto,
    toolingMaterialInfoList: ToolingMaterialInfoDto[],
    fieldColorsList: any,
    selectedToolMaterial: ToolingMaterialInfoDto
  ) {
    matInfo.moldBaseLength = Number(tool.envelopLength);
    matInfo.moldBaseWidth = Number(tool.envelopWidth);
    matInfo.moldBaseHeight = Number(tool.envelopHeight);
    const cavityHoldingPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
    const coreHoldingPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreHoldingPlate);
    const ejectorPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorPlate);
    const ejectorReturnerPlate = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorReturnerPlate);
    if (cavityHoldingPlate?.length) {
      matInfo.moldBaseLength = Number(cavityHoldingPlate.length);
    }
    if (coreHoldingPlate?.width && ejectorPlate?.width) {
      matInfo.moldBaseWidth = this.sharedService.isValidNumber(Number(coreHoldingPlate.width) - Number(ejectorPlate.width));
    }

    if (ejectorReturnerPlate?.height && ejectorPlate.height) {
      matInfo.moldBaseHeight = this.sharedService.isValidNumber(1.5 * tool.envelopHeight + Number(ejectorReturnerPlate.height) + Number(ejectorPlate.height));
    }
    this.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);
  }

  calculationForCoreSideClampingPlate(
    matInfo: ToolingMaterialInfoDto,
    tool: CostToolingDto,
    toolingMaterialInfoList: ToolingMaterialInfoDto[],
    fieldColorsList: any,
    selectedToolMaterial: ToolingMaterialInfoDto
  ) {
    matInfo.moldBaseLength = Number(tool.envelopLength);
    matInfo.moldBaseWidth = Number(tool.envelopWidth);
    matInfo.moldBaseHeight = Number(tool.envelopHeight);

    const toolingMaterial = toolingMaterialInfoList.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavitySideClampingPlate);
    if (toolingMaterial?.length) {
      matInfo.moldBaseLength = toolingMaterial.length;
    }

    if (toolingMaterial?.width) {
      matInfo.moldBaseWidth = Number(toolingMaterial.width);
    }

    if (toolingMaterial?.height) {
      matInfo.moldBaseHeight = toolingMaterial.height;
    }
    this.calculateCommonTooling(matInfo, tool, fieldColorsList, selectedToolMaterial);
  }
}
