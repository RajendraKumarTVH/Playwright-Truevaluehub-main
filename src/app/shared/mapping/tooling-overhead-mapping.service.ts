import { Injectable } from '@angular/core';
import { CostOverHeadProfitDto } from '../models/overhead-Profit.model';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ToolingConfigService } from '../config/cost-tooling-config';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ToolingOverheadMappingService {
  constructor(
    private sharedService: SharedService,
    public _toolConfig: ToolingConfigService
  ) {}

  getDefaultOhFormFields() {
    return {
      CostOverHeadProfitId: 0,
      OverheadandProfitAmount: [0],
      MaterialOHPercentage: [0],
      MaterialOHAmount: [0],
      FactoryOHPercentage: [0],
      FactoryOHAmount: [0],
      SGandAPercentage: [0],
      SGandAAmount: [0],
      warrentyPercentage: [3],
      warrentyAmount: [0],
      MaterialProfitPercentage: [0],
      ProcessProfitPercentage: [0],
      ProfitAmount: [0],
    };
  }

  setOHFormPatch(costOverHeadProfitobj: CostOverHeadProfitDto, total) {
    return {
      CostOverHeadProfitId: costOverHeadProfitobj?.costOverHeadProfitId || 0,
      MaterialOHAmount: this.sharedService.isValidNumber(costOverHeadProfitobj?.mohCost),
      MaterialOHPercentage: this._toolConfig.transformNumberTwoDecimal(costOverHeadProfitobj?.mohPer),
      FactoryOHAmount: this.sharedService.isValidNumber(costOverHeadProfitobj?.fohCost),
      FactoryOHPercentage: this._toolConfig.transformNumberTwoDecimal(costOverHeadProfitobj?.fohPer),
      SGandAAmount: this.sharedService.isValidNumber(costOverHeadProfitobj?.sgaCost),
      SGandAPercentage: this._toolConfig.transformNumberTwoDecimal(costOverHeadProfitobj?.sgaPer),
      warrentyAmount: this.sharedService.isValidNumber(costOverHeadProfitobj?.warrentyCost),
      warrentyPercentage: this._toolConfig.transformNumberTwoDecimal(costOverHeadProfitobj?.warrentyPer || 3),
      ProfitAmount: this.sharedService.isValidNumber(costOverHeadProfitobj?.profitCost),
      MaterialProfitPercentage: this._toolConfig.transformNumberTwoDecimal(costOverHeadProfitobj?.materialProfitPer),
      ProcessProfitPercentage: this._toolConfig.transformNumberTwoDecimal(costOverHeadProfitobj?.processProfitPer),
      OverheadandProfitAmount: this.sharedService.isValidNumber(total),
    };
  }

  onOverHeadSubmitPayLoad(costingToolingform: FormGroup, partInfoId, selectedToolId): CostOverHeadProfitDto {
    const model = new CostOverHeadProfitDto();
    model.toolingId = selectedToolId || null;
    model.costOverHeadProfitId = costingToolingform.controls['CostOverHeadProfitId'].value || 0;
    model.partInfoId = partInfoId;
    model.mohPer = Number(costingToolingform.controls['MaterialOHPercentage'].value) || 0;
    model.mohCost = Number(costingToolingform.controls['MaterialOHAmount'].value) || 0;
    model.fohPer = Number(costingToolingform.controls['FactoryOHPercentage'].value) || 0;
    model.fohCost = Number(costingToolingform.controls['FactoryOHAmount'].value) || 0;
    model.sgaPer = Number(costingToolingform.controls['SGandAPercentage'].value) || 0;
    model.sgaCost = Number(costingToolingform.controls['SGandAAmount'].value) || 0;
    model.materialProfitPer = Number(costingToolingform.controls['MaterialProfitPercentage'].value) || 0;
    model.processProfitPer = Number(costingToolingform.controls['ProcessProfitPercentage'].value) || 0;
    model.profitCost = Number(costingToolingform.controls['ProfitAmount'].value) || 0;
    model.warrentyPer = Number(costingToolingform.controls['warrentyPercentage'].value) || 0;
    model.warrentyCost = Number(costingToolingform.controls['warrentyAmount'].value) || 0;
    model.iccPer = 0;
    model.iccCost = 0;
    model.paymentTermsPer = 0;
    model.paymentTermsCost = 0;
    model.fgiccPer = 0;
    model.fgiccCost = 0;
    return model;
  }

  setAllOverHeadModel(costingToolingform: FormGroup, currentPart): CostOverHeadProfitDto {
    const costOverHeadProfit = new CostOverHeadProfitDto();
    costOverHeadProfit.costOverHeadProfitId = costingToolingform.controls['CostOverHeadProfitId'].value || 0;
    costOverHeadProfit.partInfoId = currentPart?.partInfoId;
    costOverHeadProfit.mohPer = Number(costingToolingform.controls['MaterialOHPercentage'].value) || 0;
    costOverHeadProfit.mohCost = Number(costingToolingform.controls['MaterialOHAmount'].value) || 0;
    costOverHeadProfit.fohPer = Number(costingToolingform.controls['FactoryOHPercentage'].value) || 0;
    costOverHeadProfit.fohCost = Number(costingToolingform.controls['FactoryOHAmount'].value) || 0;
    costOverHeadProfit.sgaPer = Number(costingToolingform.controls['SGandAPercentage'].value) || 0;
    costOverHeadProfit.sgaCost = Number(costingToolingform.controls['SGandAAmount'].value) || 0;
    costOverHeadProfit.materialProfitPer = Number(costingToolingform.controls['MaterialProfitPercentage'].value) || 0;
    costOverHeadProfit.processProfitPer = Number(costingToolingform.controls['ProcessProfitPercentage'].value) || 0;
    costOverHeadProfit.profitCost = Number(costingToolingform.controls['ProfitAmount'].value) || 0;
    costOverHeadProfit.warrentyPer = Number(costingToolingform.controls['warrentyPercentage'].value) || 0;
    costOverHeadProfit.warrentyCost = Number(costingToolingform.controls['warrentyAmount'].value) || 0;
    costOverHeadProfit.iccPer = 0;
    costOverHeadProfit.iccCost = 0;
    costOverHeadProfit.paymentTermsPer = 0;
    costOverHeadProfit.paymentTermsCost = 0;
    costOverHeadProfit.fgiccPer = 0;
    costOverHeadProfit.fgiccCost = 0;
    return costOverHeadProfit;
  }

  ohCostPatchResult(percentageResult, costResult) {
    return {
      MaterialOHPercentage: this._toolConfig.transformNumberTwoDecimal(percentageResult.mohPer),
      FactoryOHPercentage: this._toolConfig.transformNumberTwoDecimal(percentageResult.fohPer),
      SGandAPercentage: this._toolConfig.transformNumberTwoDecimal(percentageResult.sgaPer),
      MaterialProfitPercentage: this._toolConfig.transformNumberTwoDecimal(percentageResult.materialProfitPer),
      ProcessProfitPercentage: this._toolConfig.transformNumberTwoDecimal(percentageResult.processProfitPer),
      warrentyPercentage: this._toolConfig.transformNumberTwoDecimal(percentageResult.warrentyPer),
      MaterialOHAmount: this.sharedService.isValidNumber(costResult.mohCost),
      FactoryOHAmount: this.sharedService.isValidNumber(costResult.fohCost),
      SGandAAmount: this.sharedService.isValidNumber(costResult.sgaCost),
      warrentyAmount: this.sharedService.isValidNumber(costResult.warrentyCost),
      ProfitAmount: this.sharedService.isValidNumber(costResult.profitCost),
    };
  }

  setCalculationObject(frmctrl, costOverHeadProfitDto) {
    costOverHeadProfitDto.isMohPerDirty = frmctrl['MaterialOHPercentage'].dirty;
    costOverHeadProfitDto.isFohPerDirty = frmctrl['FactoryOHPercentage'].dirty;
    costOverHeadProfitDto.isSgaPerDirty = frmctrl['SGandAPercentage'].dirty;
    costOverHeadProfitDto.isMaterialProfitPerDirty = frmctrl['MaterialProfitPercentage'].dirty;
    costOverHeadProfitDto.isProcessProfitPerDirty = frmctrl['ProcessProfitPercentage'].dirty;
    costOverHeadProfitDto.isWarrentyPercentageDirty = frmctrl['warrentyPercentage'].dirty;

    costOverHeadProfitDto.mohPer = frmctrl['MaterialOHPercentage'].value;
    costOverHeadProfitDto.fohPer = frmctrl['FactoryOHPercentage'].value;
    costOverHeadProfitDto.sgaPer = frmctrl['SGandAPercentage'].value;
    costOverHeadProfitDto.materialProfitPer = frmctrl['MaterialProfitPercentage'].value;
    costOverHeadProfitDto.processProfitPer = frmctrl['ProcessProfitPercentage'].value;
    costOverHeadProfitDto.warrentyPer = frmctrl['warrentyPercentage'].value;
  }
}
