import { Injectable } from '@angular/core';
import { CommodityType } from 'src/app/modules/costing/costing.config';
import { HPDCCastingTool, SheetMetalTool, DefaultMaterialDesc, ToolingCountry, ToolingMaterialIM, ToolingMaterialSheetMetal } from 'src/app/shared/enums';
import { CostingToolingBopConfigService } from './costing-tooling-bop-config.service';
import { CostingToolingProcessConfigService } from './costing-tooling-process-config.service';
import { CostingToolingMaterialConfigService } from './costing-tooling-material-config.service';
import { ToolingInfoConfigService } from './tooling-info-config.service';

@Injectable({
  providedIn: 'root',
})
export class ToolingConfigService {
  toolingCountry = [ToolingCountry.China, ToolingCountry.Czech, ToolingCountry.India, ToolingCountry.Mexico, ToolingCountry.SouthKorea, ToolingCountry.Taiwan, ToolingCountry.USA];
  materialIds = [
    ToolingMaterialIM.CavityHoldingPlate,
    ToolingMaterialIM.CoreHoldingPlate,
    ToolingMaterialIM.CoreBackPlate,
    ToolingMaterialIM.CavitySideClampingPlate,
    ToolingMaterialIM.CoreSideClampingPlate,
    ToolingMaterialIM.EjectorPlate,
    ToolingMaterialIM.EjectorReturnerPlate,
    ToolingMaterialIM.ParallelBlock,
    ToolingMaterialIM.ManifoldPlate,
  ];
  excludedMaterialIds = [ToolingMaterialIM.SideCoreCost, ToolingMaterialIM.AngularCoreCost, ToolingMaterialIM.UnscrewingCost, ToolingMaterialIM.HotRunnerCost];
  mouldDescriptionIds = [
    ToolingMaterialIM.CavityInsert,
    ToolingMaterialIM.CoreInsert,
    ToolingMaterialIM.ElectrodeMaterialcost1,
    ToolingMaterialIM.ElectrodeMaterialcost2,
    ToolingMaterialIM.SideCoreCost,
    ToolingMaterialIM.AngularCoreCost,
    ToolingMaterialIM.UnscrewingCost,
  ];
  moldItems = [ToolingMaterialIM.CavitySideClampingPlate, ToolingMaterialIM.ElectrodeMaterialcost1, ToolingMaterialIM.ElectrodeMaterialcost2];
  moldItemsSheetMetal = [
    ToolingMaterialSheetMetal.BottomPlate,
    ToolingMaterialSheetMetal.TopPlate,
    ToolingMaterialSheetMetal.StripperPlate,
    ToolingMaterialSheetMetal.TopPunchBackPlate,
    ToolingMaterialSheetMetal.TopPunchHolderPlate,
    ToolingMaterialSheetMetal.BottomDieBackPlate,
    ToolingMaterialSheetMetal.BottomDieHolderPlate,
    ToolingMaterialSheetMetal.Die,
    ToolingMaterialSheetMetal.Punch,
  ];

  constructor(
    public _bopConfig: CostingToolingBopConfigService,
    public _toolingProcessConfig: CostingToolingProcessConfigService,
    public _toolingMaterialConfig: CostingToolingMaterialConfigService,
    public _toolingInfoConfig: ToolingInfoConfigService
  ) {}

  public defaultValues = {
    scrapPrice: 0,
    materialPrice: 0,
    density: 0,
    sandCost: 0,
  };

  public laborRate = {
    skilledRate: 0,
    lowSkilledRate: 0,
    skilledLaborRate: 0,
  };

  public addNewFlags = {
    isNewTool: false,
    isNewMaterial: false,
    isNewProcess: false,
    isNewBOP: false,
  };

  public toolingTotal = {
    totCost: 0,
    amortizationTot: 0,
  };

  public commodity = {
    isInjMoulding: false,
    isSheetMetal: false,
    isCasting: false,
  };

  initializeToolConfig = (toolConfig: any) => {
    toolConfig._bopConfig.bopInfo.totCost = 0;
    toolConfig._bopConfig.bopInfo.totProcessCost = 0;
    toolConfig._bopConfig.bopInfo.totQty = 0;
    toolConfig._toolingProcessConfig.processInfo.totCost = 0;
    toolConfig._toolingMaterialConfig.materialInfo.totCost = 0;
    toolConfig._toolingMaterialConfig.materialInfo.totWeight = 0;
  };

  public getVolumeCategory(annualVolume: number): string {
    let txtVolumeCat: string = '';
    if (annualVolume <= 500) {
      txtVolumeCat = 'Low Volume <=500';
    } else if (annualVolume >= 500 && annualVolume <= 1000) {
      txtVolumeCat = 'Low Volume >500 to <=1,000';
    } else if (annualVolume >= 1000 && annualVolume <= 5000) {
      txtVolumeCat = 'Low Volume >1,000 to <=5,000';
    } else if (annualVolume >= 5000 && annualVolume <= 20000) {
      txtVolumeCat = 'Low Volume >5,000 to <=20,000';
    } else if (annualVolume >= 20000 && annualVolume <= 100000) {
      txtVolumeCat = 'Medium Volume >20,000 to <=100,000';
    } else {
      txtVolumeCat = 'High Volume >100,000';
    }
    return txtVolumeCat;
  }

  transformNumberTwoDecimal(value: number) {
    if (value && !Number.isNaN(value) && value > 0) return value.toFixed(2);
    else {
      return 0;
    }
  }

  getToolNames(commodity: number) {
    let list: any[] = [];
    if (commodity == CommodityType.PlasticAndRubber) {
      list = [{ id: 1, name: 'Injection Molding Die' }];
    } else if (commodity == CommodityType.SheetMetal) {
      list = [
        { id: 1, name: 'Forming Tool' },
        { id: 2, name: 'Bending Tool' },
        { id: 3, name: 'Cutting Tool' },
        { id: 4, name: 'Stamping Tool - Progressive' },
        { id: 5, name: 'Blank & Pierce Tool' },
        { id: 6, name: 'Blank & Pierce Tool(Compound Die)' },
      ];
    } else if (commodity == CommodityType.Casting) {
      list = [
        { id: 1, name: 'HPDC Tool' },
        { id: 2, name: 'Trimming Die Tool' },
      ];
    }
    return list;
  }

  getMouldSubtype() {
    return [
      { id: 1, name: 'Hot Sprue', manifoldPlate: 0 },
      { id: 2, name: 'Hot Valve', manifoldPlate: 0 },
      { id: 3, name: 'Manifold open type', manifoldPlate: 100 },
      { id: 4, name: 'Manifold Valve type', manifoldPlate: 120 },
    ];
  }

  getMouldType() {
    return [
      { id: 1, name: 'Hot Runner' },
      { id: 2, name: 'Cold Runner' },
      { id: 3, name: 'Cold/Hot(hybrid)' },
    ];
  }

  surfaceFinish() {
    return [
      { id: 1, name: 'Texture' },
      { id: 2, name: 'Polish finish' },
      { id: 3, name: 'Mirror finish' },
    ];
  }

  changeFlags = {
    isSupplierCountryChanged: false,
    isCountryChanged: false,
    lifeTimeRemainingChange: false,
    isToollifeChanged: false,
    complexityChanged: false,
    surfaceFinishChanged: false,
  };

  // setTotalperCost(moldInfo: CostToolingDto, commodityId) {
  //     let materialCost = 0;
  //     moldInfo.toolingMaterialInfos?.forEach(material => {
  //         materialCost += this.sharedService.isValidNumber(material.totalRawMaterialCost);
  //     });
  //     let processCost = 0;
  //     moldInfo.toolingProcessInfos?.forEach(process => {
  //         processCost += this.sharedService.isValidNumber(process.totalProcessCost);
  //     });
  //     let bopCost = 0;
  //     moldInfo.bopCostTooling?.forEach(bop => {
  //         bopCost += this.sharedService.isValidNumber(bop.totalProcessCost);
  //     });
  //     moldInfo.totalSheetCost = this.sharedService.isValidNumber(Number(materialCost));
  //     if (commodityId == CommodityType.PlasticAndRubber) {
  //         moldInfo.toolingCost = this.sharedService.isValidNumber(Number(bopCost) + Number(processCost) + Number(moldInfo.totalSheetCost));
  //     } else {
  //         moldInfo.toolingCost = this.sharedService.isValidNumber(Number(bopCost) + Number(processCost) + Number(materialCost));
  //     }
  //     return moldInfo.toolingCost;
  // }

  // savetoolingTotalCostPart(costTooling: CostToolingDto, toolingFormcontrols, conversionValue, isEnableUnitConversion, commodity, currentPart) {
  //     costTooling.toolCostPerPart = 0;
  //     costTooling = this._toolingMaterialConfig.setMaterialDetails(costTooling, toolingFormcontrols, conversionValue, isEnableUnitConversion, commodity);
  //     // let lifeInParts = Math.min(this.currentPart.lifeTimeQtyRemaining, costTooling.toolLifeInParts);
  //     let bopCost = 0;
  //     costTooling?.bopCostTooling?.forEach(bop => {
  //         bopCost += this.sharedService.isValidNumber(bop.totalProcessCost);
  //     });
  //     if (commodity.isInjMoulding || commodity.isCasting) {
  //         let subsiquentToolCost = 0;
  //         const toolcpstist = costTooling?.toolingMaterialInfos?.filter(element => this.mouldDescriptionIds.includes(element.moldDescriptionId));
  //         toolcpstist?.forEach(mat => {
  //             subsiquentToolCost += this.sharedService.isValidNumber(mat?.totalRawMaterialCost);
  //         });
  //         let totalMouldBaseMaterialCost = 0;
  //         const toolcpstists = costTooling?.toolingMaterialInfos?.filter(element => !this.mouldDescriptionIds.includes(element.moldDescriptionId));
  //         toolcpstists?.forEach(mat => {
  //             totalMouldBaseMaterialCost += this.sharedService.isValidNumber(mat?.totalRawMaterialCost);
  //         });
  //         subsiquentToolCost += totalMouldBaseMaterialCost * 0.2;
  //         const processCall = costTooling?.toolingProcessInfos?.filter(element => element.processGroupId === IMProcessGroup.MachineOperations || element.processGroupId === IMProcessGroup.TextureCost);
  //         processCall?.forEach(mat => {
  //             subsiquentToolCost += this.sharedService.isValidNumber(mat?.totalProcessCost);
  //         });
  //         const processCall2 = costTooling?.toolingProcessInfos?.filter(element => element.processGroupId === IMProcessGroup.Validation);
  //         processCall2?.forEach(mat => {
  //             subsiquentToolCost += this.sharedService.isValidNumber(mat?.totalProcessCost) * 0.5;
  //         });
  //         subsiquentToolCost += bopCost;
  //         costTooling.subsiquentToolCost = costTooling.noOfSubsequentTool > 0 ? subsiquentToolCost : 0;
  //     } else {
  //         costTooling.subsiquentToolCost = 0;
  //     }
  //     // costTooling.toolCostPerPart = this.sharedService.isValidNumber((Number(costTooling.toolingCost) + Number(costTooling.subsiquentToolCost)) / Number(lifeInParts));
  //     costTooling.toolCostPerPart = this.sharedService.isValidNumber(Number(costTooling.toolingCost) / Number(currentPart.lifeTimeQtyRemaining));
  //     this._store.dispatch(new ToolingInfoActions.UpdateToolingCostPerPart(costTooling, currentPart?.partInfoId));
  // }

  // getMedbOverHeadProfitData(medbohp: MedbOverHeadProfitDto[], countryId: number, txtVolumeCat: string) {
  //     const filteredMasterList = medbohp.filter((s: any) => s.countryId == countryId && s.volumeCategory == txtVolumeCat);
  //     const medOverHeadProfitData = {
  //         medbMohList: filteredMasterList.find((s: any) => s.overHeadProfitType == 'MOH'),
  //         medbFohList: filteredMasterList.find((s: any) => s.overHeadProfitType == 'FOH'),
  //         medbSgaList: filteredMasterList.find((s: any) => s.overHeadProfitType == 'SGA'),
  //         medbProfitList: filteredMasterList.find((s: any) => s.overHeadProfitType == 'Profit')
  //     }
  //     return medOverHeadProfitData;
  // }

  getToolingNoOfShot() {
    let list: any[] = [];
    list = [
      { id: 1, name: 'upto 250,000', defaulValue: 250000, start: 0, end: 250000, moldGrade: DefaultMaterialDesc.MouldC45, coreCavityGrade: DefaultMaterialDesc.EN31 },
      { id: 2, name: '250,000 to 500,000', defaulValue: 500000, start: 250000, end: 500000, moldGrade: DefaultMaterialDesc.S12311, coreCavityGrade: DefaultMaterialDesc.EN31 },
      { id: 3, name: '500,000 +', defaulValue: 1000000, start: 500000, end: 9000000000000, moldGrade: DefaultMaterialDesc.S12311, coreCavityGrade: DefaultMaterialDesc.HDS },
      {
        id: 4,
        name: 'Special cases - SS Mold and Cavity',
        defaulValue: 1000000,
        start: 9000000000001,
        end: 91000000000000,
        moldGrade: DefaultMaterialDesc.SS,
        coreCavityGrade: DefaultMaterialDesc.ERS,
      },
    ];
    return list;
  }

  getToolingGradeForHPDCTool(toolNameId: number) {
    let list: any[] = [];
    if (toolNameId === HPDCCastingTool.TrimmingDie) {
      list = [{ id: 1, name: 'upto 250,000', defaulValue: 250000, start: 0, end: 250000, moldGrade: DefaultMaterialDesc.MouldC45, coreCavityGrade: DefaultMaterialDesc.HCHCR }];
    } else {
      list = [{ id: 1, name: 'upto 250,000', defaulValue: 250000, start: 0, end: 250000, moldGrade: DefaultMaterialDesc.MouldC45, coreCavityGrade: DefaultMaterialDesc.HDS }];
    }
    return list;
  }

  getMoldItemDescription(commodity: number, toolNameId: number = null) {
    let list: any[] = [];
    if (commodity == CommodityType.PlasticAndRubber) {
      list = this.getMaterialList();
    } else if (commodity === CommodityType.Casting) {
      if (toolNameId === HPDCCastingTool.TrimmingDie) {
        list = [
          { id: 1, name: 'Cavity Insert', grade: DefaultMaterialDesc.HCHCR },
          { id: 2, name: 'Core Insert', grade: DefaultMaterialDesc.HCHCR },
          { id: 6, name: 'Cavity Side Clamping Plate', grade: DefaultMaterialDesc.HCHCR },
          { id: 7, name: 'Core Side Clamping Plate', grade: DefaultMaterialDesc.HCHCR },
        ];
      } else {
        list = [
          { id: 1, name: 'Cavity Insert', grade: DefaultMaterialDesc.HDS },
          { id: 2, name: 'Core Insert', grade: DefaultMaterialDesc.HDS },
          { id: 3, name: 'Cavity Holding Plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 4, name: 'Core Holding Plate ', grade: DefaultMaterialDesc.MouldC45 },
          { id: 5, name: 'Core Back Plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 6, name: 'Cavity Side Clamping Plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 7, name: 'Core Side Clamping Plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 8, name: 'Ejector Plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 9, name: 'Ejector Returner Plate ', grade: DefaultMaterialDesc.MouldC45 },
          { id: 10, name: 'Parallel Block ', grade: DefaultMaterialDesc.MouldC45 },
          //{ id: 11, name: "Manifold Plate / Runner Plate", grade: DefaultMaterialDesc.MouldC45 },
          { id: 12, name: 'Electrode Material Cost -Copper', grade: DefaultMaterialDesc.Copper },
          { id: 13, name: 'Electrode Material Cost -Graphite ', grade: DefaultMaterialDesc.Graphite },
          { id: 14, name: 'Side Core Cost', grade: DefaultMaterialDesc.C45 },
          { id: 15, name: 'Angular Slider Cost', grade: DefaultMaterialDesc.C45 },
          //{ id: 16, name: "Unscrewing Cost", grade: DefaultMaterialDesc.C45 },
          //{ id: 17, name: "Hot Runner", grade: DefaultMaterialDesc.C45 },
        ];
      }
    } else if (commodity == CommodityType.SheetMetal) {
      if ([SheetMetalTool.CompoundTool, SheetMetalTool.BalnkAndPierce, SheetMetalTool.FormingTool, SheetMetalTool.BendingTool].includes(toolNameId)) {
        list = [
          // { id: 1, name: "Die Block", grade: DefaultMaterialDesc.HDS },
          // { id: 2, name: "Punch Block", grade: DefaultMaterialDesc.HDS },
          { id: 3, name: 'Die Insert', grade: DefaultMaterialDesc.HCHCR },
          { id: 4, name: 'Punches', grade: DefaultMaterialDesc.HCHCR },
          { id: 10, name: 'Die Holder Plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 9, name: 'Die Back plate', grade: DefaultMaterialDesc.HCHCR },
          { id: 7, name: 'Punch Holder plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 6, name: 'Punch back plate', grade: DefaultMaterialDesc.HCHCR },
          { id: 11, name: 'Stripper Plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 5, name: 'Top Clamping Plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 8, name: 'Bottom Clamping plate', grade: DefaultMaterialDesc.MouldC45 },
          // { id: 12, name: "Knock Out Plate", grade: DefaultMaterialDesc.MS },
          // { id: 13, name: "Guide Pillar", grade: DefaultMaterialDesc.EN31 },
          // { id: 14, name: "Guide Bush", grade: DefaultMaterialDesc.EN31 },
        ];
      } else {
        list = [
          // { id: 1, name: "Die Block", grade: DefaultMaterialDesc.HDS },
          // { id: 2, name: "Punch Block", grade: DefaultMaterialDesc.HDS },
          { id: 3, name: 'Die Insert', grade: DefaultMaterialDesc.HCHCR },
          { id: 4, name: 'Punches', grade: DefaultMaterialDesc.HCHCR },
          { id: 10, name: 'Die Holder Plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 9, name: 'Die Back plate', grade: DefaultMaterialDesc.MS },
          { id: 7, name: 'Punch Holder plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 6, name: 'Punch back plate', grade: DefaultMaterialDesc.MS },
          { id: 11, name: 'Stripper Plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 5, name: 'Top Clamping Plate', grade: DefaultMaterialDesc.MouldC45 },
          { id: 8, name: 'Bottom Clamping plate', grade: DefaultMaterialDesc.MouldC45 },
          // { id: 12, name: "Knock Out Plate", grade: DefaultMaterialDesc.MS },
          // { id: 13, name: "Guide Pillar", grade: DefaultMaterialDesc.EN31 },
          // { id: 14, name: "Guide Bush", grade: DefaultMaterialDesc.EN31 },
        ];
      }
    } else {
      list = this.getMaterialList();
    }
    return list;
  }

  getMaterialList() {
    return [
      { id: 1, name: 'Cavity Insert', grade: DefaultMaterialDesc.HDS },
      { id: 2, name: 'Core Insert', grade: DefaultMaterialDesc.HDS },
      { id: 3, name: 'Cavity Holding Plate', grade: DefaultMaterialDesc.MouldC45 },
      { id: 4, name: 'Core Holding Plate ', grade: DefaultMaterialDesc.MouldC45 },
      { id: 5, name: 'Core Back Plate', grade: DefaultMaterialDesc.MouldC45 },
      { id: 6, name: 'Cavity Side Clamping Plate', grade: DefaultMaterialDesc.MouldC45 },
      { id: 7, name: 'Core Side Clamping Plate', grade: DefaultMaterialDesc.MouldC45 },
      { id: 8, name: 'Ejector Plate', grade: DefaultMaterialDesc.MouldC45 },
      { id: 9, name: 'Ejector Returner Plate ', grade: DefaultMaterialDesc.MouldC45 },
      { id: 10, name: 'Parallel Block ', grade: DefaultMaterialDesc.MouldC45 },
      { id: 11, name: 'Manifold Plate / Runner Plate', grade: DefaultMaterialDesc.MouldC45 },
      { id: 12, name: 'Electrode Material Cost -Copper', grade: DefaultMaterialDesc.Copper },
      { id: 13, name: 'Electrode Material Cost -Graphite ', grade: DefaultMaterialDesc.Graphite },
      { id: 14, name: 'Side Core Cost', grade: DefaultMaterialDesc.C45 },
      { id: 15, name: 'Angular Slider Cost', grade: DefaultMaterialDesc.C45 },
      { id: 16, name: 'Unscrewing Cost', grade: DefaultMaterialDesc.C45 },
      { id: 17, name: 'Hot Runner', grade: DefaultMaterialDesc.C45 },
    ];
  }

  getDefaultMaterialDescriptions() {
    return [
      DefaultMaterialDesc.HDS,
      DefaultMaterialDesc.MS,
      DefaultMaterialDesc.EN31,
      DefaultMaterialDesc.C45,
      // DefaultMaterialDesc.P20,
      DefaultMaterialDesc.Copper,
      DefaultMaterialDesc.Graphite,
      DefaultMaterialDesc.SS,
      DefaultMaterialDesc.ERS,
      DefaultMaterialDesc.S12311,
      DefaultMaterialDesc.MouldC45,
      DefaultMaterialDesc.HCHCR,
    ];
  }

  // updateToolingMaterials(costTooling: CostToolingDto, selectedToolId, selectedToolMaterialId, materialFormGroup, conversionValue, isEnableUnitConversion, toolingMaterialInfoList, moldItemDescsriptionsList) {
  //     if (!costTooling.toolingMaterialInfos?.length) return;
  //     let toolingMaterial = costTooling.toolingMaterialInfos.find(x => x.toolingMaterialId === selectedToolMaterialId);
  //     if (!toolingMaterial) return;
  //     toolingMaterial.toolingMaterialId = selectedToolMaterialId;
  //     toolingMaterial.toolingId = selectedToolId;
  //     // this._toolingMapper._materialMapper.setAllMaterialModel(toolingMaterial, materialFormGroup, conversionValue, isEnableUnitConversion);
  //     toolingMaterialInfoList = [...toolingMaterialInfoList.filter(x => x.toolingMaterialId !== selectedToolMaterialId), toolingMaterial].sort((a, b) => a.toolingMaterialId - b.toolingMaterialId);
  //     this.materialIdToNameConversion(toolingMaterialInfoList, moldItemDescsriptionsList);
  //     costTooling.toolingMaterialInfos = [...toolingMaterialInfoList];
  //     costTooling.totalSheetCost = costTooling.toolingMaterialInfos.reduce((sum, material) => sum + this.sharedService.isValidNumber(material.totalRawMaterialCost), 0);
  //     return toolingMaterialInfoList;
  // }

  // updateToolingProcess(costTooling: CostToolingDto, selectedToolId, selectedToolProcessId, processFormGroup, toolingProcessInfoList, commodityId) {
  //     if (!costTooling.toolingProcessInfos?.length) return;
  //     let toolingProcess = costTooling.toolingProcessInfos.find(x => x.toolingProcessId === selectedToolProcessId);
  //     if (!toolingProcess) return;
  //     toolingProcess.toolingProcessId = selectedToolProcessId;
  //     toolingProcess.toolingId = selectedToolId;
  //     toolingProcess.totalProcessCost = Number(processFormGroup.controls["totalProcessCost"].value);
  //     toolingProcessInfoList = [...toolingProcessInfoList.filter(x => x.toolingProcessId !== selectedToolProcessId), toolingProcess].sort((a, b) => a.toolingProcessId - b.toolingProcessId);
  //     costTooling.toolingProcessInfos = [...toolingProcessInfoList];
  //     if (commodityId === CommodityType.PlasticAndRubber) {
  //         toolingProcess.processGroupId = Number(processFormGroup.controls["processGroupId"].value);
  //     } else {
  //         // this._toolingMapper._processMapper.setAllProcessModel(toolingProcess, processFormGroup);
  //     }
  //     return toolingProcessInfoList;
  // }

  // updateBopCostTooling(costTooling: CostToolingDto, selectedToolId, selectedToolBopId, bopFormGroup, toolingBOPInfoList, commodityId) {
  //     if (!costTooling.bopCostTooling?.length) return;
  //     let bopCostTooling = costTooling.bopCostTooling.find(x => x.bopCostId === selectedToolBopId);
  //     if (!bopCostTooling) return;
  //     // this._toolingMapper._bopMapper.setAllBOPModel(bopCostTooling, bopFormGroup, selectedToolBopId, selectedToolId);
  //     toolingBOPInfoList = [...toolingBOPInfoList.filter(x => x.bopCostId !== selectedToolBopId), bopCostTooling].sort((a, b) => a.bopCostId - b.bopCostId);
  //     costTooling.bopCostTooling = [...toolingBOPInfoList];
  //     if (commodityId !== CommodityType.PlasticAndRubber) {
  //         bopCostTooling.quantity = Number(bopFormGroup.controls["bopQuantity"].value);
  //         bopCostTooling.totalCost = Number(bopFormGroup.controls["bopTotalCost"].value);
  //     }
  //     return toolingBOPInfoList;
  // }

  // updateCostOverHeadProfit(costTooling: CostToolingDto, selectedToolId, OhFormGroup, currentPart) {
  //     let costOverHeadProfit = new CostOverHeadProfitDto();
  //     costOverHeadProfit.toolingId = selectedToolId || null;
  //     // costOverHeadProfit = { ...costOverHeadProfit, ...this._toolingMapper._OHMapper.setAllOverHeadModel(OhFormGroup, currentPart) };
  //     costTooling.costOverHeadProfit = [costOverHeadProfit];
  // }

  // materialIdToNameConversion(toolingMaterialInfoList, moldItemDescsriptionsList) {
  //     toolingMaterialInfoList.forEach((tool) => {
  //         tool.toolingMaterialName = moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null;
  //     });
  // }
}
