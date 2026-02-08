import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { BillOfMaterialDto, MaterialInfoDto } from 'src/app/shared/models';
import { MaterialPCBAConfigService } from 'src/app/shared/config/material-pcba-config';

@Injectable({
  providedIn: 'root',
})
export class PCBACalculatorService {
  constructor(
    private shareService: SharedService,
    private eleService: MaterialPCBAConfigService
  ) {}

  public calculationsForPCBA(materialInfo: MaterialInfoDto): MaterialInfoDto {
    materialInfo.inputBilletHeight = materialInfo.sheetLength * materialInfo.sheetWidth;
    return materialInfo;
  }

  public calculationsForAdditionalBOMEntries(materialInfo: MaterialInfoDto, costSummaryViewData: any): BillOfMaterialDto[] {
    let bomEntries: BillOfMaterialDto[] = [];
    const num = (v: any) => this.shareService.isValidNumber(v);
    const totalCost =
      num(costSummaryViewData?.sumBillOfMaterial) +
      num(costSummaryViewData?.sumNetProcessCost) +
      num(costSummaryViewData?.packingCost) +
      num(costSummaryViewData?.sumOverHeadCost) +
      num(costSummaryViewData?.freightCost) +
      num(costSummaryViewData?.toolingCost) +
      num(costSummaryViewData?.dutiesTariffCost);

    bomEntries.push(this.createBomEntry('Bare PCB', totalCost, 'PCB', materialInfo));

    const solderCost = this.getMaterialCost(this.eleService.getSolderPasteMaterialList(), materialInfo.yeildUtilization);
    const ccCost = this.getMaterialCost(this.eleService.getConformalCoatingList(), materialInfo.grossVolumne);
    const apCost = this.getMaterialCost(this.eleService.getAdhesivePottingList(), materialInfo.scaleLoss);
    let pcbArea = materialInfo.sheetLength * materialInfo.sheetWidth;

    if (materialInfo.yeildUtilization) {
      const solderPasteThickness = (0.004 * 25.4) / 10;
      const spWeight = 4.14 * solderPasteThickness * 0.3 * (pcbArea / 100);
      const spCost = num((solderCost / 1000) * spWeight * 1.25);
      bomEntries.push(this.createBomEntry('Solder Paste Material Cost', spCost, 'Solder Paste Material', materialInfo));
    }
    if (materialInfo.grossVolumne) {
      const areaPercent = materialInfo.ultimateTensileStrength || 0;
      const volume = (pcbArea * (areaPercent / 100) * 0.075 * 100) / 17.5 / 1000;
      const ccCostWithScrap = num((ccCost / 1000) * volume * 1.05);
      bomEntries.push(this.createBomEntry('Conformal Coat 1A33', ccCostWithScrap, 'Coatingmtl', materialInfo));
    }
    if (materialInfo.scaleLoss) {
      const areaPercent = materialInfo.partOuterDiameter || 0;
      const volume = (pcbArea * areaPercent * 2 * 100) / 17.5 / 1000;
      const pottingCost = num((apCost / 1000) * volume * 1.05);
      bomEntries.push(this.createBomEntry('Adhesive RTV162', pottingCost, 'RTV', materialInfo));
    }

    bomEntries.push(this.createBomEntry('Consumables', this.shareService.isValidNumber(0.5 * materialInfo.flashVolume), 'Consumables', materialInfo));
    return bomEntries;
  }

  private applyDefaultBomFields(entry: BillOfMaterialDto, materialInfo: MaterialInfoDto) {
    entry.isManuallyCreated = true;
    entry.rpaCallRequired = false;
    entry.doYouHaveCostBreakdown = false;
    entry.isThisPartBeingPurchasedCurrently = false;
    entry.isArchived = false;
    entry.partQty = 1;
    entry.partInfoId = materialInfo?.partInfoId;
    entry.parentPartInfoId = materialInfo?.partInfoId;
    entry.unitOfMeasure = 'Nos';
    entry.standardOrCustom = 'Custom';
    entry.subCommodity = 1033;
    entry.supplierName = '-';
  }

  private createBomEntry(mpn: string, cost: number, description: string, materialInfo: MaterialInfoDto): BillOfMaterialDto {
    const entry = new BillOfMaterialDto();
    entry.mpn = mpn;
    entry.currentCost = cost || 0;
    entry.description = description;
    this.applyDefaultBomFields(entry, materialInfo);
    return entry;
  }

  private getMaterialCost(list: any[] | undefined, id: any): number {
    return list?.find((x) => x.id === id)?.cost || 0;
  }
}
