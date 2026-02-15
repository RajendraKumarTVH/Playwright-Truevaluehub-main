import { Injectable } from '@angular/core';
import { BopCostToolingDto, CostToolingDto } from '../models/tooling.model';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { FormGroup } from '@angular/forms';
import { CommodityType } from 'src/app/modules/costing/costing.config';
import { ToolingConfigService } from '../config/cost-tooling-config';

@Injectable({
  providedIn: 'root',
})
export class ToolingBopInfoMappingService {
  constructor(
    private sharedService: SharedService,
    public _toolConfig: ToolingConfigService
  ) {}

  getDefaultBopFormFields() {
    return {
      bopCostId: 0,
      descriptionId: 0,
      bopQuantity: 0,
      bopTotalProcessCost: 0,
      bopTotalCost: [0],
    };
  }

  clearBOPForm() {
    return {
      bopCostId: [0],
      descriptionId: [0],
      bopQuantity: [0],
      bopTotalCost: [0],
      bopTotalProcessCost: [0],
    };
  }

  onEditBOPPatch(bop: BopCostToolingDto) {
    return {
      bopCostId: bop.bopCostId,
      descriptionId: bop.descriptionId,
      bopQuantity: this.sharedService.isValidNumber(bop.quantity),
      bopTotalCost: this.sharedService.isValidNumber(bop.totalCost),
      bopTotalProcessCost: this.sharedService.isValidNumber(bop.totalProcessCost),
    };
  }

  setAllBOPModel(bopCostTooling, bopFormGroup: FormGroup, selectedToolBopId, selectedToolId) {
    bopCostTooling.bopCostId = selectedToolBopId;
    bopCostTooling.toolingId = selectedToolId;
    bopCostTooling.descriptionId = Number(bopFormGroup.controls['descriptionId'].value);
    bopCostTooling.totalProcessCost = Number(bopFormGroup.controls['bopTotalProcessCost'].value);
  }

  getAllDefaultBopModel(element, tool: CostToolingDto, currentPart, selectedToolId): BopCostToolingDto {
    const bopObj = new BopCostToolingDto();
    bopObj.toolingId = selectedToolId;
    bopObj.descriptionId = element.id;
    const data = this._toolConfig._bopConfig.getCriticality();
    const complexValue = data.find((x) => x.id == tool.mouldCriticality);
    if (currentPart?.commodityId == CommodityType.PlasticAndRubber) {
      bopObj.totalProcessCost = Number(complexValue?.value) * Number(tool.totalSheetCost);
    } else if (currentPart?.commodityId == CommodityType.SheetMetal) {
      bopObj.totalProcessCost = 0.3 * Number(tool.totalSheetCost);
      bopObj.quantity = element.Quantity;
      bopObj.totalCost = element.Cost;
    } else {
      bopObj.quantity = element.Quantity;
      bopObj.totalCost = element.Cost;
      bopObj.totalProcessCost = Number(bopObj.quantity) * Number(bopObj.totalCost);
    }
    return bopObj;
  }

  bopFormAssignValue(bop, bopFormCtrl, commodity) {
    bop.isCommodityIM = commodity.isInjMoulding;
    bop.isCommoditySheetMetal = commodity.isSheetMetal;
    bop.isCommodityCasting = commodity.isCasting;
    bop.quantity = Number(bopFormCtrl['bopQuantity'].value);
    bop.totalCost = Number(bopFormCtrl['bopTotalCost'].value);
    bop.totalProcessCost = Number(bopFormCtrl['bopTotalProcessCost'].value);
    bop.istotalProcessCostDirty = bopFormCtrl['bopTotalProcessCost'].dirty;
  }
}
