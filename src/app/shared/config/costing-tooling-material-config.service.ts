import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';

@Injectable({
  providedIn: 'root',
})
export class CostingToolingMaterialConfigService {
  constructor(public sharedService: SharedService) {}

  public materialInfo = {
    totWeight: 0,
    totCost: 0,
    totCoreCost: 0,
    totCoreWeight: 0,
    totMouldWieght: 0,
    totMouldCost: 0,
    totCopperCost: 0,
    totCopperWeight: 0,
    totOtherCost: 0,
    totOtherWeight: 0,
    totElectrodCost: 0,
    totElectrodWeight: 0,
    totDiePunchCost: 0,
    totDiePunchWeight: 0,
  };

  public materialDefaults = {
    totCost: 0,
    totWeight: 0,
    totCoreCost: 0,
    totCoreWeight: 0,
    totMouldWieght: 0,
    totMouldCost: 0,
    totElectrodWeight: 0,
    totElectrodCost: 0,
  };

  clearToolingMaterialInfoValues() {
    return {
      familyId: '',
      gradeId: '',
      materialPrice: '',
      scrapPrice: '',
      density: '',
      tensileStrength: '',
    };
  }

  // setMaterialDetails(moldInfo: CostToolingDto, toolingFormCtrl, conversionValue, isEnableUnitConversion, commodity) {
  //   if (!moldInfo.toolingMaterialInfos) return moldInfo;
  //   let toolingMaterial = this.getToolingMaterial(moldInfo, commodity);
  //   this.updateMoldBaseDimensions(moldInfo, toolingMaterial, toolingFormCtrl);
  //   this.updateMoldBaseHeight(moldInfo, toolingFormCtrl, commodity, conversionValue, isEnableUnitConversion);
  //   return moldInfo;
  // }

  // getToolingMaterial(moldInfo: CostToolingDto, commodity) {
  //   let toolingMaterial = moldInfo.toolingMaterialInfos.find(x => x.moldDescriptionId == ToolingMaterialIM.CavityInsert);
  //   if (commodity.isCasting && moldInfo.toolingNameId === HPDCCastingTool.TrimmingDie) {
  //     // toolingMaterial = this._toolingCalculator.toolingSharedCalculatorService.calculateToolMoldBaseLengthAndWidth(moldInfo, CommodityType.Casting);
  //   }
  //   return toolingMaterial;
  // }

  // updateMoldBaseDimensions(moldInfo: CostToolingDto, toolingMaterial: any, toolingFormCtrl) {
  //   if (toolingMaterial?.length && !toolingFormCtrl['moldBaseLength'].dirty) {
  //     moldInfo.moldBaseLength = this.sharedService.isValidNumber((Number(toolingMaterial.length) * Number(moldInfo.cavityMaxLength)) + (Number(moldInfo.sideGapLength) * 2));
  //   }
  //   if (toolingMaterial?.width && !toolingFormCtrl['moldBaseWidth'].dirty) {
  //     moldInfo.moldBaseWidth = this.sharedService.isValidNumber((Number(toolingMaterial.width) * Number(moldInfo.cavityMaxWidth)) + (Number(moldInfo.sideGapWidth) * 2));
  //   }
  // }

  // updateMoldBaseHeight(moldInfo: CostToolingDto, toolingFormCtrl, commodity, conversionValue, isEnableUnitConversion) {
  //   if (toolingFormCtrl['moldBaseHeight'].dirty) return;
  //   const plateHeights = ['CavityHoldingPlate', 'CoreHoldingPlate', 'CoreBackPlate', 'CavitySideClampingPlate', 'CoreSideClampingPlate', 'ParallelBlock', 'ManifoldPlate', 'EjectorPlate', 'EjectorReturnerPlate']
  //     .map(id => Number(moldInfo.toolingMaterialInfos.find(x => x.moldDescriptionId == ToolingMaterialIM[id])?.height || 0));
  //   moldInfo.moldBaseHeight = this.sharedService.convertUomToSaveAndCalculation(plateHeights.reduce((acc, val) => acc + val, 0), conversionValue, isEnableUnitConversion);
  //   if (commodity.isCasting && moldInfo.toolingNameId === HPDCCastingTool.TrimmingDie) {
  //     const castingHeights = ['CavityInsert', 'CoreInsert', 'CavitySideClampingPlate', 'CoreSideClampingPlate']
  //       .map(id => Number(moldInfo.toolingMaterialInfos.find(x => x.moldDescriptionId == ToolingMaterialIM[id])?.height || 0));
  //     moldInfo.moldBaseHeight = this.sharedService.convertUomToSaveAndCalculation(castingHeights.reduce((acc, val) => acc + val, 0), conversionValue, isEnableUnitConversion);
  //   }
  // }
}
