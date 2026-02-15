import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { CostToolingDto, ToolingMaterialInfoDto } from '../models/tooling.model';
import { MaterialCategory, ToolingMaterialIM } from '../enums';
import { CommodityType } from 'src/app/modules/costing/costing.config';

@Injectable({
  providedIn: 'root',
})
export class ToolingMaterialMappingService {
  constructor(private sharedService: SharedService) {}
  getFormFields() {
    return {
      toolingMaterialId: 0,
      moldDescriptionId: 0,
      catergoryId: 0,
      familyId: 0,
      gradeId: 0,
      volumePurchased: 0,
      materialPrice: 0,
      scrapPrice: 0,
      density: 0,
      length: 0,
      width: 0,
      height: 0,
      totalPlateWeight: 0,
      quantity: 0,
      netWeight: 0,
      totalRawMaterialCost: 0,
      materialCuttingAllowance: 10,
      tensileStrength: 0,
    };
  }

  resetForm() {
    return {
      toolingMaterialId: 0,
      moldDescriptionId: 0,
      catergoryId: 0,
      familyId: 0,
      gradeId: 0,
      volumePurchased: 0,
      materialPrice: 0,
      scrapPrice: 0,
      density: 0,
      length: 0,
      width: 0,
      height: 0,
      totalPlateWeight: 0,
      quantity: 0,
      netWeight: 0,
      totalRawMaterialCost: 0,
      materialCuttingAllowance: 10,
      tensileStrength: 0,
    };
  }

  clearMaterialForm() {
    return {
      toolingMaterialId: 0,
      moldDescriptionId: 0,
      catergoryId: 0,
      familyId: 0,
      gradeId: 0,
      volumePurchased: 0,
      materialPrice: 0,
      scrapPrice: 0,
      density: 0,
      length: 0,
      width: 0,
      height: 0,
      totalPlateWeight: 0,
      quantity: 0,
      netWeight: 0,
      totalRawMaterialCost: 0,
      materialCuttingAllowance: 10,
      tensileStrength: 0,
    };
  }

  onEditMaterialPatch(material: ToolingMaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      toolingMaterialId: material.toolingMaterialId,
      moldDescriptionId: material.moldDescriptionId,
      catergoryId: material.catergoryId,
      familyId: material.familyId,
      gradeId: material.gradeId,
      volumePurchased: this.sharedService.isValidNumber(material.volumePurchased),
      materialPrice: this.sharedService.isValidNumber(material.materialPrice),
      scrapPrice: this.sharedService.isValidNumber(material.scrapPrice),
      density: this.sharedService.isValidNumber(material.density),
      length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(material.length), conversionValue, isEnableUnitConversion),
      width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(material.width), conversionValue, isEnableUnitConversion),
      height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(material.height), conversionValue, isEnableUnitConversion),
      totalPlateWeight: this.sharedService.isValidNumber(material.totalPlateWeight),
      quantity: this.sharedService.isValidNumber(material.quantity),
      totalRawMaterialCost: this.sharedService.isValidNumber(material.totalRawMaterialCost),
      netWeight: this.sharedService.isValidNumber(material.netWeight),
      materialCuttingAllowance: this.sharedService.isValidNumber(material.materialCuttingAllowance),
    };
  }

  onMoldDescriptionPatch(defaultOrCustomData, density, tensileStrength) {
    return {
      familyId: defaultOrCustomData?.materialMaster?.materialTypeId,
      gradeId: defaultOrCustomData?.materialMasterId,
      materialPrice: this.sharedService.isValidNumber(defaultOrCustomData?.price),
      scrapPrice: this.sharedService.isValidNumber(defaultOrCustomData?.generalScrapPrice),
      density: this.sharedService.isValidNumber(density || defaultOrCustomData?.materialMaster?.density),
      tensileStrength: this.sharedService.isValidNumber(tensileStrength || defaultOrCustomData?.materialMaster?.tensileStrength),
    };
  }

  getAllDefaultMaterialModel(element, defaultData, moldInfo: CostToolingDto, commodityId, quantity) {
    const materialObj = new ToolingMaterialInfoDto();
    materialObj.moldDescriptionId = element.id;
    materialObj.catergoryId = MaterialCategory.Ferrous;
    materialObj.familyId = defaultData?.materialMaster?.materialTypeId;
    materialObj.gradeId = defaultData?.materialMasterId;
    materialObj.materialPrice = Number(defaultData?.price);
    materialObj.scrapPrice = Number(defaultData?.generalScrapPrice);
    materialObj.density = Number(defaultData?.materialMaster?.density) || 0;
    materialObj.tensileStrength = Number(defaultData?.materialMaster?.tensileStrength) || 0;
    materialObj.moldDescription = element.id;
    materialObj.moldBaseLength = Number(moldInfo.moldBaseLength);
    materialObj.moldBaseWidth = Number(moldInfo.moldBaseWidth);
    materialObj.moldBaseHeight = Number(moldInfo.moldBaseHeight);
    materialObj.length = Number(moldInfo.envelopLength);
    materialObj.width = Number(moldInfo.envelopWidth);
    materialObj.height = Number(moldInfo.envelopHeight);
    materialObj.isCommodityIM = commodityId === CommodityType.PlasticAndRubber;
    materialObj.isCommoditySheetMetal = commodityId === CommodityType.SheetMetal;
    materialObj.isCommodityCasting = commodityId === CommodityType.Casting;
    if (materialObj.isCommodityIM) {
      if (element.id === ToolingMaterialIM.ElectrodeMaterialcost1 || element.id === ToolingMaterialIM.ElectrodeMaterialcost2) {
        materialObj.catergoryId = MaterialCategory.NonFerrous;
        if (element.id === ToolingMaterialIM.ElectrodeMaterialcost1) {
          // copper
          quantity = moldInfo.noOfCopperElectrodes || 0;
        } else if (element.id === ToolingMaterialIM.ElectrodeMaterialcost2) {
          // graphite
          quantity = moldInfo.noOfGraphiteElectrodes || 0;
        }
      }
    }
    materialObj.quantity = Number(quantity);
    if (materialObj.isCommoditySheetMetal) {
      materialObj.length = Number(moldInfo.envelopLength);
      materialObj.width = Number(moldInfo.envelopWidth);
      materialObj.height = Number(moldInfo.envelopHeight);
    }
    materialObj.materialCuttingAllowance = 10;
    return materialObj;
  }

  setAllMaterialModel(toolingmaterial, materialFormGroup, conversionValue, isEnableUnitConversion) {
    toolingmaterial.moldDescriptionId = Number(materialFormGroup.controls['moldDescriptionId'].value);
    toolingmaterial.catergoryId = Number(materialFormGroup.controls['catergoryId'].value);
    toolingmaterial.familyId = Number(materialFormGroup.controls['familyId'].value);
    toolingmaterial.gradeId = Number(materialFormGroup.controls['gradeId'].value);
    toolingmaterial.volumePurchased = Number(materialFormGroup.controls['volumePurchased'].value);
    toolingmaterial.quantity = Number(materialFormGroup.controls['quantity'].value);
    toolingmaterial.materialPrice = Number(materialFormGroup.controls['materialPrice'].value);
    toolingmaterial.scrapPrice = Number(materialFormGroup.controls['scrapPrice'].value);
    toolingmaterial.density = Number(materialFormGroup.controls['density'].value);
    toolingmaterial.length = this.sharedService.convertUomToSaveAndCalculation(Number(materialFormGroup.controls['length'].value), conversionValue, isEnableUnitConversion);
    toolingmaterial.width = this.sharedService.convertUomToSaveAndCalculation(Number(materialFormGroup.controls['width'].value), conversionValue, isEnableUnitConversion);
    toolingmaterial.height = this.sharedService.convertUomToSaveAndCalculation(Number(materialFormGroup.controls['height'].value), conversionValue, isEnableUnitConversion);
    toolingmaterial.totalPlateWeight = Number(materialFormGroup.controls['totalPlateWeight'].value);
    toolingmaterial.totalRawMaterialCost = Number(materialFormGroup.controls['totalRawMaterialCost'].value);
    toolingmaterial.materialCuttingAllowance = Number(materialFormGroup.controls['materialCuttingAllowance'].value);
    toolingmaterial.netWeight = Number(materialFormGroup.controls['netWeight'].value);
  }

  calculateMaterialCostPatch(result, tool, conversionValue, isEnableUnitConversion) {
    return {
      // moldBaseLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.moldBaseLength), conversionValue, isEnableUnitConversion),
      // moldBaseWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.moldBaseWidth), conversionValue, isEnableUnitConversion),
      // moldBaseHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(tool?.moldBaseHeight), conversionValue, isEnableUnitConversion),
      length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.length), conversionValue, isEnableUnitConversion),
      width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.width), conversionValue, isEnableUnitConversion),
      height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.height), conversionValue, isEnableUnitConversion),
      quantity: this.sharedService.isValidNumber(result?.quantity),
      netWeight: this.sharedService.isValidNumber(result?.netWeight),
      totalPlateWeight: this.sharedService.isValidNumber(result?.totalPlateWeight),
      totalRawMaterialCost: this.sharedService.isValidNumber(result?.totalRawMaterialCost),
      density: this.sharedService.isValidNumber(result?.density),
      materialPrice: this.sharedService.isValidNumber(result?.materialPrice),
      scrapPrice: this.sharedService.isValidNumber(result?.scrapPrice),
      materialCuttingAllowance: this.sharedService.isValidNumber(result.materialCuttingAllowance),
    };
  }

  setCalculationObject(matInfo, frmctrl, conversionValue, isEnableUnitConversion, defaultValues, commodity) {
    matInfo.isdensityDirty = frmctrl['density'].dirty;
    matInfo.ismaterialPriceDirty = frmctrl['materialPrice'].dirty;
    matInfo.isscrapPriceDirty = frmctrl['scrapPrice'].dirty;
    matInfo.isquantityDirty = frmctrl['quantity'].dirty;
    matInfo.isTotalPlateWeightDirty = frmctrl['totalPlateWeight'].dirty;
    matInfo.isLengthDirty = frmctrl['length'].dirty;
    matInfo.isWidthDirty = frmctrl['width'].dirty;
    matInfo.isHeightDirty = frmctrl['height'].dirty;
    matInfo.ismaterialCuttingAllowanceDirty = frmctrl['materialCuttingAllowance'].dirty;
    matInfo.isnetWeightDirty = frmctrl['netWeight'].dirty;
    matInfo.istotalRawMaterialCostDirty = frmctrl['totalRawMaterialCost'].dirty;

    matInfo.moldDescription = Number(frmctrl['moldDescriptionId'].value);
    matInfo.tensileStrength = Number(frmctrl['tensileStrength'].value) || 0;
    matInfo.quantity = frmctrl['quantity'].value;
    matInfo.totalPlateWeight = Number(frmctrl['totalPlateWeight'].value);
    matInfo.length = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['length'].value), conversionValue, isEnableUnitConversion);
    matInfo.width = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['width'].value), conversionValue, isEnableUnitConversion);
    matInfo.height = this.sharedService.convertUomToSaveAndCalculation(Number(frmctrl['height'].value), conversionValue, isEnableUnitConversion);
    matInfo.materialCuttingAllowance = Number(frmctrl['materialCuttingAllowance'].value);
    matInfo.netWeight = frmctrl['netWeight'].value;
    matInfo.totalRawMaterialCost = frmctrl['totalRawMaterialCost'].value;
    matInfo.density = frmctrl['density'].value != null ? frmctrl['density'].value : defaultValues.density;
    matInfo.materialPrice = frmctrl['materialPrice'].value != null ? frmctrl['materialPrice'].value : defaultValues.materialPrice;
    matInfo.scrapPrice = frmctrl['scrapPrice'].value != null ? frmctrl['scrapPrice'].value : defaultValues.scrapPrice;
    matInfo.isCommodityIM = commodity.isInjMoulding;
    matInfo.isCommoditySheetMetal = commodity.isSheetMetal;
    matInfo.isCommodityCasting = commodity.isCasting;
  }

  recalculateModel(toolingMaterialResult, matInfo) {
    matInfo.moldBaseLength = Number(toolingMaterialResult?.moldBaseLength);
    matInfo.moldBaseWidth = Number(toolingMaterialResult?.moldBaseWidth);
    matInfo.moldBaseHeight = Number(toolingMaterialResult?.moldBaseHeight);
    matInfo.length = Number(toolingMaterialResult?.length);
    matInfo.width = Number(toolingMaterialResult?.width);
    matInfo.height = Number(toolingMaterialResult?.height);
    matInfo.density = Number(toolingMaterialResult?.density);
    matInfo.tensileStrength = Number(toolingMaterialResult?.tensileStrength);
    matInfo.materialPrice = Number(toolingMaterialResult?.materialPrice);
    matInfo.scrapPrice = Number(toolingMaterialResult?.scrapPrice);
    matInfo.netWeight = Number(toolingMaterialResult?.netWeight);
  }
}
