import { Injectable } from '@angular/core';
import { LaborRateMasterDto, MaterialInfoDto, PartInfoDto, ProcessInfoDto } from 'src/app/shared/models';
import { BopCostToolingDto, CostToolingDto, ToolingMaterialInfoDto, ToolingProcessInfoDto, ToolingRefLookup } from 'src/app/shared/models/tooling.model';
import { BlockUiService, MaterialMasterService } from 'src/app//shared/services';
import { LaborService } from 'src/app/shared/services/labor.service';
import { CostToolingService } from 'src/app//shared/services/cost-tooling.service';
import { combineLatest, defer, forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { CommodityType, CostingConfig, PrimaryProcessType, ScreeName } from 'src/app/modules/costing/costing.config';
import {
  HPDCCastingTool,
  IMProcessGroup,
  InjectionMouldingTool,
  MaterialCategory,
  SheetMetalProcessGroup,
  SheetMetalTool,
  SheetMetalTools,
  ToolingMaterialIM,
  ToolingMaterialSheetMetal,
} from 'src/app/shared/enums';
import { CostOverHeadProfitDto } from 'src/app/shared/models/overhead-Profit.model';
import { Store } from '@ngxs/store';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { ToolingCalculatorService } from 'src/app/modules/costing/services/tooling-calculator.service';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
import { CostingToolingMappingService } from 'src/app/shared/mapping/costing-tooling-mapping.service';
// import { ToolingInfoState } from 'src/app/modules/_state/costing-tooling-info.state';
import { ToolingLookupState } from 'src/app/modules/_state/tooling-lookup.state';
interface ToolingCalcContext {
  laborRates: any;
  toolingInfo: CostToolingDto[];
  marketData: any[];
  colorInfos: any[];
  currentPart: PartInfoDto;
  changeFlags: any;
  toolingLookupData: any;
  toolingMasterData: any;
  costSummaryViewData: any;
  medOverHeadProfitData: any;
  costOverHeadProfitobj: any;
  conversionValue: string;
  isEnableUnitConversion: boolean;
  sourceCountryId: number;
  info: any;
}

@Injectable({
  providedIn: 'root',
})
export class CostToolingRecalculationService {
  public processGroupList: any = [];
  public bopDescriptionList: any = [];
  public moldItemDescsriptionsList: any = [];
  public toolingMaterialInfoList: ToolingMaterialInfoDto[] = [];
  public toolingIMLookupList: ToolingRefLookup[] = [];
  public toolingFormingLookupList: ToolingRefLookup[] = [];
  public toolingBendingLookupList: ToolingRefLookup[] = [];
  public toolingCuttingLookupList: ToolingRefLookup[] = [];
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private recalculationCompletedEvent = new Subject<any>();
  recalculationCompleted$ = this.recalculationCompletedEvent.asObservable();
  // _bulkToolingUpdateLoading$ = this._store.select(ToolingInfoState.getBulkToolingUpdateStatus);
  // _bulkToolingUpdateLoadingSubscription$: Subscription = Subscription.EMPTY;
  _lookup$: Observable<ToolingRefLookup[]>;

  constructor(
    private messaging: MessagingService,
    private materialMasterService: MaterialMasterService,
    private blockUiService: BlockUiService,
    public _toolConfig: ToolingConfigService,
    private laborService: LaborService,
    private _store: Store,
    private _toolingCalculator: ToolingCalculatorService,
    private _toolingService: CostToolingService,
    public sharedService: SharedService,
    private _costingConfig: CostingConfig,
    private _toolingMapper: CostingToolingMappingService
  ) {
    this._lookup$ = this._store.select(ToolingLookupState.getToolingLookup);
  }

  getToolingLookupValues() {
    this._lookup$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: ToolingRefLookup[]) => {
      if (result?.length > 0) {
        this.toolingIMLookupList = result?.filter((x) => x.toolingRefType == InjectionMouldingTool.InjectionMoulding);
        this.toolingBendingLookupList = result?.filter((x) => x.toolingRefType == SheetMetalTools.SheetMetalBending);
        this.toolingCuttingLookupList = result?.filter((x) => x.toolingRefType == SheetMetalTools.SheetMetalCutting);
        this.toolingFormingLookupList = result?.filter((x) => x.toolingRefType == SheetMetalTools.SheetMetalForming);
      }
    });
  }

  supplierRegionCheck(result, supplierRegionId) {
    let selectedItem = supplierRegionId ? result.find((item) => item.regionId === supplierRegionId) : null;
    !selectedItem && (selectedItem = result[0]);
    return selectedItem;
  }

  recalculateToolingCost(
    info: any,
    marketMonth,
    toolSourceCountryId,
    countryList,
    changeFlags,
    conversionValue,
    isEnableUnitConversion,
    toolingLookupData,
    toolingMasterData,
    costSummaryViewData,
    medOverHeadProfitData,
    costOverHeadProfitobj
  ): Observable<CostToolingDto[]> {
    const currentPart: PartInfoDto = info?.currentPart;
    let sourceCountryId = toolSourceCountryId || 0;
    if (countryList?.length > 0 && (changeFlags.isSupplierCountryChanged || !sourceCountryId)) {
      const sourceCountry = countryList.find((x) => x.countryId === currentPart?.mfrCountryId) ?? countryList[0];
      sourceCountryId = sourceCountry.toolingLocationCountryId;
    }

    return combineLatest([
      this.laborService.getLaborRatesByCountry(sourceCountryId, marketMonth).pipe(take(1)),
      this._toolingService.getCostToolingByPartId(currentPart?.partInfoId).pipe(take(1)),
      this.materialMasterService.getMaterialMarketDataListByCountryId(sourceCountryId).pipe(take(1)),
      this.sharedService.getColorInfosByPartinfo(info?.currentPart?.partInfoId).pipe(take(1)),
    ]).pipe(
      take(1),
      switchMap(([laborRates, toolingInfo, marketData, colorInfos]) => {
        if (!toolingInfo?.length) {
          return of([]);
        }
        const context: ToolingCalcContext = {
          laborRates,
          toolingInfo,
          marketData,
          colorInfos,
          currentPart,
          changeFlags,
          toolingLookupData,
          toolingMasterData,
          costSummaryViewData,
          medOverHeadProfitData,
          costOverHeadProfitobj,
          conversionValue,
          isEnableUnitConversion,
          sourceCountryId,
          info,
        };
        return forkJoin(toolingInfo.map((tool) => defer(() => of(this.recalculateSingleTool(tool, context)))));
      })
    );
  }

  private recalculateSingleTool(tools: CostToolingDto, ctx: ToolingCalcContext): CostToolingDto {
    let tool = structuredClone(tools);
    let {
      laborRates,
      marketData,
      colorInfos,
      currentPart,
      changeFlags,
      toolingLookupData,
      toolingMasterData,
      costSummaryViewData,
      medOverHeadProfitData,
      costOverHeadProfitobj,
      conversionValue,
      isEnableUnitConversion,
      sourceCountryId,
      info,
    } = ctx;
    const processInfoList: ProcessInfoDto[] = info?.calculateResults;
    const materialInfoList: MaterialInfoDto[] = info?.materialInfoList;
    const selectedMaterial = materialInfoList?.[0];
    const selectedProcess = processInfoList?.[0];
    if (changeFlags.isSupplierCountryChanged || changeFlags.isCountryChanged || changeFlags.isToollifeChanged || changeFlags.lifeTimeRemainingChange) {
      colorInfos = [];
    }
    let toolingColorList = colorInfos?.filter((x) => x.primaryId == tool.toolingId && x.screenId == ScreeName.Tooling);
    let boolnoofcavity = false;
    if (tool.noOfCavity != selectedMaterial?.noOfCavities) {
      boolnoofcavity = true;
      colorInfos = [];
    }

    const countryRates = this.supplierRegionCheck(laborRates, currentPart.supplierRegionId);
    tool.toolingMasterData = toolingMasterData;
    tool.countryChanged = changeFlags.isSupplierCountryChanged || changeFlags.isCountryChanged;
    tool.IsToollifeChanged = changeFlags.isToollifeChanged;
    tool.complexityChanged = changeFlags.complexityChanged;
    tool.surfaceFinishChanged = changeFlags.surfaceFinishChanged;
    this._toolingMapper._toolingInfoMapper.recalculateModel(tool, selectedMaterial, currentPart);
    const cavColsRows = this._costingConfig.cavityColsRows(tool.noOfCavity);
    if (boolnoofcavity || changeFlags.lifeTimeRemainingChange) {
      const toolLife = Math.round(this.sharedService.isValidNumber(Number(info?.currentPart?.lifeTimeQtyRemaining) / Number(tool.noOfCavity)));
      const toolingNoOfShots = Math.round(this.sharedService.isValidNumber(Number(info?.currentPart?.lifeTimeQtyRemaining)));
      const toolData = this._toolConfig.getToolingNoOfShot().find((range) => toolingNoOfShots >= range.start && toolingNoOfShots <= range.end);
      tool.toolLifeNoOfShots = toolData ? toolData.id : 4;
      tool.cavityMaxLength = cavColsRows.columns;
      tool.cavityMaxWidth = cavColsRows.rows;
      this._toolingCalculator.toolingSharedCalculatorService.calculateToolLifeInParts(tool, toolData, info?.currentPart, toolLife);
    } else if (changeFlags.isToollifeChanged) {
      const toolData = this._toolConfig.getToolingNoOfShot().find((range) => range.id === tool.toolLifeNoOfShots);
      this._toolingCalculator.toolingSharedCalculatorService.calculateToolLifeInParts(tool, toolData, info?.currentPart, tool.toolLifeInParts);
    }
    tool.sourceCountryId = sourceCountryId;
    tool.noOfSubProcessTypeInfos = processInfoList?.[0]?.subProcessTypeInfos?.length ?? 0;
    tool = this._toolingCalculator.calculateMoldCost(tool, currentPart, tool, toolingColorList, selectedMaterial, selectedProcess);
    let toolingData;
    if (info?.currentPart?.commodityId == CommodityType.Casting) {
      toolingData = this._toolConfig.getToolingGradeForHPDCTool(tool?.toolingNameId).find((x) => x.id === 1);
    } else {
      toolingData = this._toolConfig.getToolingNoOfShot().find((x) => x.id === tool.toolLifeNoOfShots);
    }
    let totalMaterialCost = 0;
    let totalMaterialWeight = 0;

    tool.toolingMaterialInfos?.forEach((mat) => {
      mat.isCommodityIM = currentPart?.commodityId === CommodityType.PlasticAndRubber;
      mat.isCommoditySheetMetal = currentPart?.commodityId === CommodityType.SheetMetal;
      mat.isCommodityCasting = currentPart?.commodityId === CommodityType.Casting;
      let toolingMaterialColorList = [];
      if (mat.toolingMaterialId && mat.toolingMaterialId > 0) {
        toolingMaterialColorList = colorInfos?.filter((x) => x.primaryId == mat.toolingMaterialId && x.screenId == ScreeName.ToolingMaterial);
      }
      if (tool.IsToollifeChanged || boolnoofcavity || changeFlags.lifeTimeRemainingChange || changeFlags.isCountryChanged || changeFlags.isSupplierCountryChanged) {
        let market = marketData.find((m) => m.materialMasterId === mat.gradeId);
        if (mat.isCommodityIM || mat.isCommodityCasting) {
          const isCavityOrCore = [ToolingMaterialIM.CavityInsert, ToolingMaterialIM.CoreInsert].includes(mat.moldDescriptionId);
          const isCoreCavity = isCavityOrCore ? toolingData?.coreCavityGrade : null;
          const isMoldGrade = this._toolConfig.materialIds.includes(mat.moldDescriptionId) ? toolingData?.moldGrade : null;
          const gradeType = isCoreCavity ?? isMoldGrade ?? null;
          if (gradeType) {
            market = marketData.find((x) => x.materialMaster?.materialDescription?.trim() === gradeType.trim());
            mat.gradeId = market?.materialMasterId ?? mat.gradeId;
          }
        }
        mat.familyId = market?.materialMaster?.materialTypeId ?? mat.familyId;
        mat.materialPrice = Number(market?.price) || mat.materialPrice;
        mat.scrapPrice = Number(market?.generalScrapPrice) || mat.scrapPrice;
        mat.density = Number(market?.materialMaster?.density) || mat.density;
        mat.tensileStrength = Number(market?.materialMaster?.tensileStrength) || mat.tensileStrength;
      }
      mat.moldDescription = mat.moldDescriptionId;
      const toolingMaterialResult = this._toolingCalculator.calculateMaterialCost(mat, tool.toolingMaterialInfos, tool, mat, toolingMaterialColorList);
      this._toolingMapper._materialMapper.recalculateModel(toolingMaterialResult, mat);
      totalMaterialWeight += toolingMaterialResult?.totalPlateWeight;
      totalMaterialCost += Number(toolingMaterialResult?.totalRawMaterialCost);
    });

    tool.totalSheetCost = this.sharedService.isValidNumber(totalMaterialCost);
    let processCost = 0;

    tool.toolingProcessInfos?.forEach((toolManufactInfo) => {
      let toolingManufactureColorList = [];
      if (toolManufactInfo.toolingProcessId && toolManufactInfo.toolingProcessId > 0) {
        toolingManufactureColorList = colorInfos?.filter((x) => x.primaryId == toolManufactInfo.toolingProcessId && x.screenId == ScreeName.ToolingManufacturing);
      }
      let partComplexity = currentPart?.partComplexity;
      if (tool) {
        partComplexity = tool?.mouldCriticality;
      }
      toolManufactInfo.complexity = partComplexity;
      toolManufactInfo.skilledRate = countryRates.laborSkilledCost;
      toolManufactInfo.lowSkilledRate = countryRates.laborLowSkilledCost;
      toolManufactInfo.skilledLaborRate = countryRates.laborSkilledCost;
      const processGroupList = this._toolConfig._toolingProcessConfig.getProcessGroups(currentPart?.commodityId);
      const process = processGroupList.find((x) => x.id == toolManufactInfo.processGroupId);
      toolManufactInfo.perKgCostMachining = process?.machineRate;
      toolManufactInfo.totmaterialWeight = Number(totalMaterialWeight);
      toolManufactInfo.toolingIMLookupList = toolingLookupData?.toolingIMLookupList;
      toolManufactInfo.toolingFormingLookupList = toolingLookupData?.toolingFormingLookupList;
      toolManufactInfo.toolingBendingLookupList = toolingLookupData?.toolingBendingLookupList;
      toolManufactInfo.toolingCuttingLookupList = toolingLookupData?.toolingCuttingLookupList;
      toolManufactInfo.toolingNameId = tool?.toolingNameId;
      toolManufactInfo.isCommodityIM = currentPart?.commodityId === CommodityType.PlasticAndRubber;
      toolManufactInfo.isCommoditySheetMetal = currentPart?.commodityId === CommodityType.SheetMetal;
      toolManufactInfo.isCommodityCasting = currentPart?.commodityId === CommodityType.Casting;
      if (currentPart.commodityId == CommodityType.PlasticAndRubber || currentPart.commodityId == CommodityType.Casting) {
        toolManufactInfo.isMoldDesign = toolManufactInfo?.processGroupId === IMProcessGroup.MoldDesign;
        toolManufactInfo.isValidation = toolManufactInfo?.processGroupId === IMProcessGroup.Validation;
        toolManufactInfo.isTextureCost = toolManufactInfo?.processGroupId === IMProcessGroup.TextureCost;
        toolManufactInfo.isMachineOperations = toolManufactInfo?.processGroupId === IMProcessGroup.MachineOperations;
      } else if (currentPart.commodityId == CommodityType.SheetMetal) {
        toolManufactInfo.isMoldDesign = toolManufactInfo?.processGroupId === SheetMetalProcessGroup.MoldDesign;
        toolManufactInfo.isProgramming = toolManufactInfo?.processGroupId === SheetMetalProcessGroup.Programming;
        toolManufactInfo.isMachineOperations = toolManufactInfo?.processGroupId === SheetMetalProcessGroup.MachineOperations;
        toolManufactInfo.isMachinePlishing = toolManufactInfo?.processGroupId === SheetMetalProcessGroup.MachinePlishing;
        toolManufactInfo.isToolHardening = toolManufactInfo?.processGroupId === SheetMetalProcessGroup.ToolHardening;
        toolManufactInfo.isAssembly = toolManufactInfo?.processGroupId === SheetMetalProcessGroup.Assembly;
        toolManufactInfo.isToolTrialCost = toolManufactInfo?.processGroupId === SheetMetalProcessGroup.ToolTrialCost;
      }
      toolManufactInfo.commodityTypeId = currentPart.commodityId;
      const manufactureInfoSimulationresult = this._toolingCalculator.calculateProcessCost(toolManufactInfo, tool?.toolingMaterialInfos, tool, toolManufactInfo, toolingManufactureColorList);
      this._toolingMapper._processMapper.recalculateModel(toolManufactInfo, manufactureInfoSimulationresult);
      processCost += this.sharedService.isValidNumber(manufactureInfoSimulationresult?.totalProcessCost);
    });
    let bopCost = 0;
    tool.bopCostTooling?.forEach((bop) => {
      let toolingBopColorList = [];
      if (bop.bopCostId && bop.bopCostId > 0) {
        toolingBopColorList = colorInfos?.filter((x) => x.primaryId == bop.bopCostId && x.screenId == ScreeName.ToolingBOP);
      }
      bop.isCommodityIM = currentPart?.commodityId === CommodityType.PlasticAndRubber;
      bop.isCommoditySheetMetal = currentPart?.commodityId === CommodityType.SheetMetal;
      bop.isCommodityCasting = currentPart?.commodityId === CommodityType.Casting;
      tool.toolingMasterData = toolingMasterData;
      const resultbop = this._toolingCalculator.calculateBopCost(bop, tool, bop, toolingBopColorList);
      bop.totalProcessCost = this.sharedService.isValidNumber(resultbop?.totalProcessCost);
      bopCost += this.sharedService.isValidNumber(bop?.totalProcessCost);
    });
    tool.toolingCost = this.sharedService.isValidNumber(
      Number(bopCost) + Number(processCost) + (currentPart.commodityId == CommodityType.PlasticAndRubber ? Number(tool.totalSheetCost) : Number(totalMaterialCost))
    );
    if (tool.toolingMaterialInfos) {
      let costMaterial = tool.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
      if (this._toolConfig.commodity.isCasting && tool.toolingNameId === HPDCCastingTool.TrimmingDie) {
        costMaterial = this._toolingCalculator.toolingSharedCalculatorService.calculateToolMoldBaseLengthAndWidth(tool, CommodityType.Casting);
      }
      costMaterial?.length && (tool.moldBaseLength = costMaterial?.length);
      costMaterial?.width && (tool.moldBaseWidth = costMaterial?.width);
      const cavityInsert = tool.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityInsert);
      const coreInsert = tool.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreInsert);
      const cavityHoldingPlate = tool.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
      const coreHoldingPlate = tool.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreHoldingPlate);
      const coreBackPlate = tool.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreBackPlate);
      const ejectorPlate = tool.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorPlate);
      const ejectorReturnerPlate = tool.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorReturnerPlate);
      const cavitySideClampingPlate = tool.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavitySideClampingPlate);
      const CoreSideClampingPlate = tool.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreSideClampingPlate);
      const parallelBlock = tool.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.ParallelBlock);
      const manifold = tool.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.ManifoldPlate);
      tool.moldBaseHeight = this.sharedService.convertUomToSaveAndCalculation(
        Number(cavityHoldingPlate?.height || 0) +
          Number(coreHoldingPlate?.height || 0) +
          Number(coreBackPlate?.height || 0) +
          Number(cavitySideClampingPlate?.height || 0) +
          Number(CoreSideClampingPlate?.height || 0) +
          Number(parallelBlock?.height || 0) +
          Number(manifold?.height || 0) +
          Number(ejectorPlate?.height || 0) +
          Number(ejectorReturnerPlate?.height || 0),
        conversionValue,
        isEnableUnitConversion
      );
      if (this._toolConfig.commodity.isCasting && tool.toolingNameId === HPDCCastingTool.TrimmingDie) {
        tool.moldBaseHeight = this.sharedService.convertUomToSaveAndCalculation(
          Number(cavityInsert?.height || 0) + Number(coreInsert?.height || 0) + Number(cavitySideClampingPlate?.height || 0) + Number(CoreSideClampingPlate?.height || 0),
          conversionValue,
          isEnableUnitConversion
        );
      }
    }
    if (this._toolConfig.commodity.isInjMoulding) {
      tool.subsequentToolCost = this._toolingCalculator.calculateSubsequentToolCost(tool, bopCost, this._toolConfig.mouldDescriptionIds, true);
    } else if (this._toolConfig.commodity.isCasting) {
      this._toolingCalculator.toolingHpdcCalculatorService.calculateSubSequenctialCostForHPDCCastinTool(tool);
    } else if (this._toolConfig.commodity.isSheetMetal) {
      this._toolingCalculator.toolingSmCalculatorService.calculateSubSequenctialCostForSheetMetal(tool);
      this._toolingCalculator.toolingSmCalculatorService.calculateStampingToolDieSetHeight(tool, currentPart);
    } else {
      tool.subsequentToolCost = 0;
    }
    tool.toolCostPerPart = this.sharedService.isValidNumber(Number(tool.toolingCost) / Number(currentPart.lifeTimeQtyRemaining));
    if (tool.costOverHeadProfit?.length > 0) {
      tool.costOverHeadProfit?.forEach((ovh, index) => {
        ovh.costOverHeadProfitId = 0;
        let costOverHeadProfitDto: CostOverHeadProfitDto = Object.assign({}, ovh);
        costOverHeadProfitDto = this._toolingCalculator.calculateOVHCost(costSummaryViewData, medOverHeadProfitData, colorInfos, costOverHeadProfitDto, costOverHeadProfitobj);
        tool.costOverHeadProfit[index] = costOverHeadProfitDto;
      });
    } else {
      let costOverHeadProfitDto = new CostOverHeadProfitDto();
      costOverHeadProfitDto = this._toolingCalculator.calculateOVHCost(costSummaryViewData, medOverHeadProfitData, colorInfos, costOverHeadProfitDto, costOverHeadProfitobj);
      costOverHeadProfitDto.toolingId = tool.toolingId;
      costOverHeadProfitDto.partInfoId = tool.partInfoId;
      tool.costOverHeadProfit.push(costOverHeadProfitDto);
    }
    tool.toolingMasterData = [];
    return tool;
  }
  private resetRecalculationFlags() {
    return {
      isSupplierCountryChanged: false,
      isCountryChanged: false,
      complexityChanged: false,
      surfaceFinishChanged: false,
      isToollifeChanged: false,
      lifeTimeRemainingChange: false,
    };
  }
  private buildBaseTooling(
    materialInfo,
    processInfo,
    toolNameId,
    currentPart,
    toolingMasterData,
    commodity,
    laborRateInfo,
    countryList,
    defaultMarketData,
    conversionValue,
    isEnableUnitConversion
  ): CostToolingDto {
    let costTooling = new CostToolingDto();
    costTooling.toolingId = 0;
    costTooling.partInfoId = currentPart?.partInfoId;
    costTooling.annualVolume = currentPart?.eav;
    costTooling.projectInfoId = 0;
    costTooling.toolingCost = 0;
    costTooling.toolLifeInParts = 0;
    costTooling.qtyRemains = 0;
    costTooling.toolCostPerPart = 0;
    costTooling.processInfoId = 0;
    costTooling.region = '';
    let country = currentPart?.mfrCountryId;
    costTooling.toolingMasterData = toolingMasterData;
    if (countryList.length > 0) {
      country = countryList.find((x) => x.countryId == currentPart?.mfrCountryId)?.toolingLocationCountryId;
    }
    costTooling.sourceCountryId = country;
    costTooling.noOfCavity = materialInfo?.noOfCavities || 8;
    const toolLife = Math.round(this.sharedService.isValidNumber(Number(currentPart.lifeTimeQtyRemaining)));
    const toolData = this._toolConfig.getToolingNoOfShot().find((range) => toolLife >= range.start && toolLife <= range.end);
    costTooling.toolLifeNoOfShots = toolData ? toolData.id : 4;
    costTooling.toolingNameId = toolNameId;
    this._toolingCalculator.toolingSharedCalculatorService.calculateToolLifeInParts(costTooling, toolData, currentPart, toolLife);
    costTooling.partLength = materialInfo?.dimX;
    costTooling.partWidth = materialInfo?.dimY;
    costTooling.partHeight = materialInfo?.dimZ;
    costTooling.partThickness = materialInfo.dimUnfoldedZ;
    costTooling.dimUnfoldedX = materialInfo.dimUnfoldedX;
    costTooling.dimUnfoldedY = materialInfo.dimUnfoldedY;
    const cavColsRows = this._costingConfig.cavityColsRows(costTooling.noOfCavity);
    costTooling.cavityMaxLength = cavColsRows.columns;
    costTooling.cavityMaxWidth = cavColsRows.rows;
    this._toolConfig._toolingInfoConfig.setDefaultValuesForTooling(costTooling, currentPart?.commodityId);
    costTooling.envelopLength = Number(costTooling.partLength);
    costTooling.envelopWidth = Number(costTooling.partWidth);
    costTooling.envelopHeight = Number(costTooling.partHeight);
    costTooling.mouldCriticality = currentPart?.partComplexity;
    const noOftool = Math.round(this.sharedService.isValidNumber(Number(currentPart?.prodLifeRemaining) / (Number(costTooling.toolLifeInParts) * Number(costTooling.noOfCavity))));
    costTooling.noOfTool = noOftool == 0 ? 1 : noOftool;
    costTooling.noOfNewTool = 1;
    costTooling.noOfSubsequentTool = this.sharedService.isValidNumber(Number(costTooling.noOfTool) - Number(costTooling.noOfNewTool));
    costTooling.noOfCopperElectrodes = 0;
    costTooling.noOfGraphiteElectrodes = costTooling.noOfCavity;
    costTooling.surfaceFinish = 2;
    costTooling.textureGrade = 'YS Number';
    costTooling.undercutsSideCores = 0;
    costTooling.undercutsAngularSlides = 0;
    costTooling.undercutsUnscrewing = 0;
    costTooling.noOfSubProcessTypeInfos = processInfo?.subProcessTypeInfos?.length;
    this._toolingCalculator.calculateMouldType(costTooling, currentPart, materialInfo);
    const colorField = [];
    costTooling = this._toolingCalculator.calculateMoldCost(costTooling, currentPart, costTooling, colorField, materialInfo, processInfo);
    if (costTooling?.toolingMaterialInfos == null) {
      costTooling.toolingMaterialInfos = [];
    }
    if (costTooling?.toolingProcessInfos == null) {
      costTooling.toolingProcessInfos = [];
    }
    if (costTooling.bopCostTooling == null) {
      costTooling.bopCostTooling = [];
    }
    costTooling.toolingMaterialInfos = this.getAllDefaultMaterialEntriesForTooling(costTooling, currentPart, defaultMarketData);
    const materialCost = this.calculateTotalMaterialCost(costTooling, materialInfo?.processId);
    this._toolingCalculator.toolingSmCalculatorService.calculateStampingToolDieSetHeight(costTooling, currentPart); // Total of few materials height
    //Total Material cost
    costTooling.totalSheetCost = this.sharedService.isValidNumber(Number(materialCost));
    costTooling.toolingProcessInfos = this.getAllDefaultProcessEntriesForTooling(costTooling, laborRateInfo, currentPart);
    costTooling.bopCostTooling = this.getAllDefaultBOPEntriesForTooling(costTooling, currentPart);
    let bopCost = 0;
    costTooling.bopCostTooling?.forEach((bop) => {
      bopCost += this.sharedService.isValidNumber(bop.totalProcessCost);
    });
    if (
      [SheetMetalTool.StampingTool, SheetMetalTool.BalnkAndPierce, SheetMetalTool.FormingTool, SheetMetalTool.CompoundTool, SheetMetalTool.BendingTool].includes(costTooling?.toolingNameId) &&
      (materialInfo.processId === PrimaryProcessType.StampingProgressive || materialInfo.processId === PrimaryProcessType.StampingStage)
    ) {
      bopCost = this.sharedService.isValidNumber(costTooling?.totalSheetCost * 0.3);
    }
    if (costTooling.toolingMaterialInfos) {
      let costMaterial = costTooling.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
      if (commodity.isCasting && costTooling.toolingNameId === HPDCCastingTool.TrimmingDie) {
        costMaterial = this._toolingCalculator.toolingSharedCalculatorService.calculateToolMoldBaseLengthAndWidth(costTooling, CommodityType.Casting);
      }
      if (costMaterial?.length) {
        costTooling.moldBaseLength = costMaterial?.length;
      }
      if (costMaterial?.width) {
        costTooling.moldBaseWidth = costMaterial?.width;
      }
      const cavityInsert = costTooling.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityInsert);
      const coreInsert = costTooling.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreInsert);
      const cavityHoldingPlate = costTooling.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavityHoldingPlate);
      const coreHoldingPlate = costTooling.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreHoldingPlate);
      const coreBackPlate = costTooling.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreBackPlate);
      const ejectorPlate = costTooling.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorPlate);
      const ejectorReturnerPlate = costTooling.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.EjectorReturnerPlate);
      const cavitySideClampingPlate = costTooling.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CavitySideClampingPlate);
      const CoreSideClampingPlate = costTooling.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.CoreSideClampingPlate);
      const parallelBlock = costTooling.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.ParallelBlock);
      const manifold = costTooling.toolingMaterialInfos.find((x) => x.moldDescriptionId == ToolingMaterialIM.ManifoldPlate);
      costTooling.moldBaseHeight = this.sharedService.convertUomToSaveAndCalculation(
        Number(cavityHoldingPlate?.height || 0) +
          Number(coreHoldingPlate?.height || 0) +
          Number(coreBackPlate?.height || 0) +
          Number(cavitySideClampingPlate?.height || 0) +
          Number(CoreSideClampingPlate?.height || 0) +
          Number(parallelBlock?.height || 0) +
          Number(manifold?.height || 0) +
          Number(ejectorPlate?.height || 0) +
          Number(ejectorReturnerPlate?.height || 0),
        conversionValue,
        isEnableUnitConversion
      );

      if (commodity.isCasting && costTooling.toolingNameId === HPDCCastingTool.TrimmingDie) {
        costTooling.moldBaseHeight = this.sharedService.convertUomToSaveAndCalculation(
          Number(cavityInsert?.height || 0) + Number(coreInsert?.height || 0) + Number(cavitySideClampingPlate?.height || 0) + Number(CoreSideClampingPlate?.height || 0),
          conversionValue,
          isEnableUnitConversion
        );
      }
    }
    let processCost = 0;
    costTooling.toolingProcessInfos?.forEach((process) => {
      processCost += this.sharedService.isValidNumber(process.totalProcessCost);
    });
    if (currentPart.commodityId == CommodityType.PlasticAndRubber) {
      costTooling.subsequentToolCost = this._toolingCalculator.calculateSubsequentToolCost(costTooling, bopCost, this._toolConfig.mouldDescriptionIds, true);
    } else if (currentPart.commodityId === CommodityType.Casting) {
      this._toolingCalculator.toolingHpdcCalculatorService.calculateSubSequenctialCostForHPDCCastinTool(costTooling);
    } else if (commodity.isSheetMetal) {
      this._toolingCalculator.toolingSmCalculatorService.calculateSubSequenctialCostForSheetMetal(costTooling);
    } else {
      costTooling.subsequentToolCost = 0;
    }
    costTooling.toolingCost = [CommodityType.PlasticAndRubber, CommodityType.SheetMetal].includes(currentPart.commodityId)
      ? this.sharedService.isValidNumber(Number(bopCost) + Number(processCost) + Number(costTooling.totalSheetCost))
      : this.sharedService.isValidNumber(Number(bopCost) + Number(processCost) + Number(materialCost));
    costTooling.toolCostPerPart = this.sharedService.isValidNumber(Number(costTooling.toolingCost) / Number(currentPart.lifeTimeQtyRemaining));

    return costTooling;
  }

  automationForToolingEntry(
    materialInfo: MaterialInfoDto,
    processInfo: ProcessInfoDto,
    laborRateInfo: LaborRateMasterDto[],
    toolNameId: number,
    currentPart,
    toolingMasterData,
    countryList,
    commodity,
    conversionValue,
    isEnableUnitConversion
  ): Observable<{
    costTooling: CostToolingDto;
    totToolingMaterialWeight: number;
    isNewProcessinfo: boolean;
  }> {
    const totToolingMaterialWeight = 0;
    const country = countryList?.length ? countryList.find((x) => x.countryId === currentPart?.mfrCountryId)?.toolingLocationCountryId : currentPart?.mfrCountryId;

    return this.materialMasterService.getMaterialMarketDataListByCountryId(country).pipe(
      map((defaultMarketData) => {
        const costTooling = this.buildBaseTooling(
          materialInfo,
          processInfo,
          toolNameId,
          currentPart,
          toolingMasterData,
          commodity,
          laborRateInfo,
          countryList,
          defaultMarketData,
          conversionValue,
          isEnableUnitConversion
        );
        return {
          costTooling,
          totToolingMaterialWeight,
          isNewProcessinfo: true,
        };
      }),

      catchError((error) => {
        console.error('automationForToolingEntry error', error);
        return of({
          costTooling: new CostToolingDto(),
          totToolingMaterialWeight: 0,
          isNewProcessinfo: false,
        });
      })
    );
  }

  getAllDefaultMaterialEntriesForTooling(models: CostToolingDto, currentPart, defaultMarketDataList) {
    this.moldItemDescsriptionsList = this._toolConfig.getMoldItemDescription(currentPart?.commodityId);
    const materialArray: ToolingMaterialInfoDto[] = [];
    this.toolingMaterialInfoList = [];
    if (!this.moldItemDescsriptionsList || this.moldItemDescsriptionsList == null || this.moldItemDescsriptionsList.length == 0 || models.toolingNameId) {
      this.moldItemDescsriptionsList = this._toolConfig.getMoldItemDescription(currentPart?.commodityId, models.toolingNameId);
    } else if (currentPart.commodityId === CommodityType.Casting && models.toolingNameId === HPDCCastingTool.TrimmingDie) {
      this.moldItemDescsriptionsList = this._toolConfig.getMoldItemDescription(currentPart?.commodityId, models.toolingNameId);
    }
    this.moldItemDescsriptionsList.forEach((element: { grade: string; id: number }) => {
      let grade = element.grade;
      const materialObj = new ToolingMaterialInfoDto();
      materialObj.toolingId = 0;
      materialObj.moldDescriptionId = element.id;
      materialObj.moldDescription = element.id;
      materialObj.isCommodityIM = currentPart?.commodityId == CommodityType.PlasticAndRubber;
      materialObj.isCommoditySheetMetal = currentPart?.commodityId == CommodityType.SheetMetal;
      materialObj.isCommodityCasting = currentPart?.commodityId == CommodityType.Casting;
      let quantity = models.noOfCavity;
      materialObj.catergoryId = MaterialCategory.Ferrous;
      if (materialObj.isCommodityIM || materialObj.isCommodityCasting) {
        let toolingData;
        if (materialObj.isCommodityIM) {
          toolingData = this._toolConfig.getToolingNoOfShot().find((x) => x.id === models.toolLifeNoOfShots);
        } else {
          toolingData = this._toolConfig.getToolingGradeForHPDCTool(models.toolingNameId).find((x) => x.id === 1);
        }
        if (element.id === ToolingMaterialIM.CavityInsert || element.id === ToolingMaterialIM.CoreInsert) {
          grade = toolingData ? (toolingData.coreCavityGrade ? toolingData.coreCavityGrade : element.grade) : element.grade;
        } else if (
          element.id === ToolingMaterialIM.CavityHoldingPlate ||
          element.id === ToolingMaterialIM.CoreHoldingPlate ||
          element.id === ToolingMaterialIM.CoreBackPlate ||
          element.id === ToolingMaterialIM.CavitySideClampingPlate ||
          element.id === ToolingMaterialIM.CoreSideClampingPlate ||
          element.id === ToolingMaterialIM.EjectorPlate ||
          element.id === ToolingMaterialIM.EjectorReturnerPlate ||
          element.id === ToolingMaterialIM.ParallelBlock ||
          element.id === ToolingMaterialIM.ManifoldPlate
        ) {
          grade = toolingData ? (toolingData.moldGrade ? toolingData.moldGrade : element.grade) : element.grade;
        } else if (element.id === ToolingMaterialIM.ElectrodeMaterialcost1 || element.id === ToolingMaterialIM.ElectrodeMaterialcost2) {
          materialObj.catergoryId = MaterialCategory.NonFerrous;
          if (element.id === ToolingMaterialIM.ElectrodeMaterialcost1) {
            // copper
            quantity = models.noOfCopperElectrodes || 0;
          } else if (element.id === ToolingMaterialIM.ElectrodeMaterialcost2) {
            // graphite
            quantity = models.noOfGraphiteElectrodes || 0;
          }
        }
      }
      // let defaultData = defaultMarketDataList.find((x) => x.materialMaster?.materialDescription == grade);
      let defaultData = defaultMarketDataList.find((x) => x.materialMaster?.materialDescription?.trim() === grade.trim());
      if (!defaultData && defaultMarketDataList.length > 0) {
        // defaultData = defaultMarketDataList[0];
        defaultData =
          defaultMarketDataList.find((item) => MaterialCategory[item.materialMaster.materialGroup.replace(/\s+/g, '') as keyof typeof MaterialCategory] === materialObj.catergoryId) ||
          defaultMarketDataList[0];
      }
      materialObj.familyId = defaultData?.materialMaster?.materialTypeId;
      materialObj.gradeId = defaultData?.materialMasterId;
      materialObj.materialPrice = Number(defaultData?.price);
      materialObj.scrapPrice = Number(defaultData?.generalScrapPrice);
      materialObj.density = Number(defaultData?.materialMaster?.density) || 0;
      materialObj.tensileStrength = Number(defaultData?.materialMaster?.tensileStrength) || 0;
      materialObj.quantity = quantity;
      materialObj.materialCuttingAllowance = 10;
      const colorField = [];
      const materialResult = this._toolingCalculator.calculateMaterialCost(materialObj, this.toolingMaterialInfoList, models, materialObj, colorField);
      materialObj.length = Number(materialResult?.length);
      materialObj.width = Number(materialResult?.width);
      materialObj.height = Number(materialResult?.height);
      materialObj.moldBaseLength = Number(materialResult?.moldBaseLength);
      materialObj.moldBaseWidth = Number(materialResult?.moldBaseWidth);
      materialObj.moldBaseHeight = Number(materialResult?.moldBaseHeight);
      materialObj.netWeight = Number(materialResult?.netWeight);
      materialArray.push(materialResult);
      // models.toolingMaterialInfos.push(materialResult);
      this.toolingMaterialInfoList.push(materialObj);
    });
    return materialArray;
  }

  calculateTotalMaterialCost(costTooling: CostToolingDto, processId): number {
    let materialCost = 0;
    if (
      (costTooling.toolingNameId === SheetMetalTool.StampingTool ||
        costTooling.toolingNameId === SheetMetalTool.BalnkAndPierce ||
        costTooling.toolingNameId === SheetMetalTool.FormingTool ||
        costTooling.toolingNameId === SheetMetalTool.CompoundTool) &&
      (processId === PrimaryProcessType.StampingProgressive || processId === PrimaryProcessType.StampingStage)
    ) {
      const dieInserTotalMaterialCost = costTooling.toolingMaterialInfos.find((x) => x.moldDescription === ToolingMaterialSheetMetal.Die);
      costTooling.toolingMaterialInfos?.forEach((material) => {
        materialCost += this.sharedService.isValidNumber(material.totalRawMaterialCost);
      });
      materialCost += dieInserTotalMaterialCost.totalRawMaterialCost;
    } else {
      costTooling.toolingMaterialInfos?.forEach((material) => {
        materialCost += this.sharedService.isValidNumber(material.totalRawMaterialCost);
      });
    }
    return materialCost;
  }

  getAllDefaultBOPEntriesForTooling(tool: CostToolingDto, currentPart) {
    this.bopDescriptionList = this._toolConfig._bopConfig.getBOPDescription(currentPart?.commodityId);
    const bopArray: BopCostToolingDto[] = [];
    this.bopDescriptionList.forEach((element: { id: number; quantity: number; cost: number }) => {
      const bopObj = new BopCostToolingDto();
      bopObj.toolingId = 0;
      bopObj.descriptionId = element.id;
      bopObj.quantity = element.quantity;
      bopObj.totalCost = element.cost;
      const colorField = [];
      const bopresult = this._toolingCalculator.calculateBopCost(bopObj, tool, bopObj, colorField);
      bopObj.totalProcessCost = bopresult.totalProcessCost;
      bopArray.push(bopObj);
    });
    return bopArray;
  }

  getAllDefaultProcessEntriesForTooling(costTooling: CostToolingDto, laborRateInfo: LaborRateMasterDto[], currentPart) {
    this.processGroupList = this._toolConfig._toolingProcessConfig.getProcessGroups(currentPart?.commodityId);
    this.getToolingLookupValues();
    const procesArray: ToolingProcessInfoDto[] = [];
    this.processGroupList.forEach((element: { equipmentRate: any; machineRate: any; cycleTime: any; hardeningCost: any; noOfSkilledLabor: any; id: number }) => {
      const processObj = new ToolingProcessInfoDto();
      processObj.toolingId = 0;
      processObj.processGroupId = element.id;
      processObj.noOfSkilledLabors = Number(element?.noOfSkilledLabor);
      processObj.noOfSemiSkilledLabors = Number(element?.noOfSkilledLabor);
      processObj.perKgCostHardening = Number(element?.hardeningCost);
      processObj.equipmentRate = Number(element?.equipmentRate);
      processObj.cycleTime = Number(element?.cycleTime);
      processObj.perKgCostMachining = element?.machineRate;
      processObj.isCommodityIM = currentPart?.commodityId == CommodityType.PlasticAndRubber ? true : false;
      processObj.isCommoditySheetMetal = currentPart?.commodityId == CommodityType.SheetMetal ? true : false;
      processObj.isCommodityCasting = currentPart?.commodityId == CommodityType.Casting ? true : false;
      // processObj.totmaterialWeight = Number(this.totToolingMaterialWeight);
      processObj.totmaterialWeight = 0;
      processObj.toolingIMLookupList = this.toolingIMLookupList;
      processObj.toolingFormingLookupList = this.toolingFormingLookupList;
      processObj.toolingBendingLookupList = this.toolingBendingLookupList;
      processObj.toolingCuttingLookupList = this.toolingCuttingLookupList;
      processObj.toolingNameId = costTooling?.toolingNameId;
      if (currentPart.commodityId == CommodityType.PlasticAndRubber || currentPart.commodityId === CommodityType.Casting) {
        processObj.isMoldDesign = processObj?.processGroupId == IMProcessGroup.MoldDesign ? true : false;
        processObj.isValidation = processObj?.processGroupId == IMProcessGroup.Validation ? true : false;
        processObj.isTextureCost = processObj?.processGroupId == IMProcessGroup.TextureCost ? true : false;
        processObj.isMachineOperations = processObj?.processGroupId == IMProcessGroup.MachineOperations ? true : false;
      } else if (currentPart.commodityId == CommodityType.SheetMetal) {
        processObj.isMoldDesign = processObj?.processGroupId == SheetMetalProcessGroup.MoldDesign ? true : false;
        processObj.isProgramming = processObj?.processGroupId == SheetMetalProcessGroup.Programming ? true : false;
        processObj.isMachineOperations = processObj?.processGroupId == SheetMetalProcessGroup.MachineOperations ? true : false;
        processObj.isMachinePlishing = processObj?.processGroupId == SheetMetalProcessGroup.MachinePlishing ? true : false;
        processObj.isToolHardening = processObj?.processGroupId == SheetMetalProcessGroup.ToolHardening ? true : false;
        processObj.isAssembly = processObj?.processGroupId == SheetMetalProcessGroup.Assembly ? true : false;
        processObj.isToolTrialCost = processObj?.processGroupId == SheetMetalProcessGroup.ToolTrialCost ? true : false;
        processObj.isValidation = processObj?.processGroupId == SheetMetalProcessGroup.Validation ? true : false;
      }
      const colorField = [];
      processObj.complexity = currentPart?.partComplexity;
      if (laborRateInfo?.length > 0) {
        processObj.lowSkilledRate = laborRateInfo[0].laborLowSkilledCost;
        processObj.skilledRate = laborRateInfo[0].laborSkilledCost;
        processObj.skilledLaborRate = laborRateInfo[0].laborSkilledCost;
      }
      processObj.commodityTypeId = currentPart.commodityId;
      procesArray.push(this._toolingCalculator.calculateProcessCost(processObj, costTooling?.toolingMaterialInfos, costTooling, processObj, colorField));
    });
    return procesArray;
  }
}
