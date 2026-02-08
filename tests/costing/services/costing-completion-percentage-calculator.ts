import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PartInfoDto } from 'src/app/shared/models';
import { CommodityType } from '../costing.config';
@Injectable({
  providedIn: 'root',
})
export class CostingCompletionPercentageCalculator {
  private hasPartSectionDataUpdate$: Subject<any> = new Subject();

  getHasPartSectionDataUpdate(): Observable<any> {
    return this.hasPartSectionDataUpdate$.asObservable();
  }
  dispatchHasPartSectionDataUpdateEvent(data: any) {
    this.hasPartSectionDataUpdate$.next(data);
  }

  partInformation(formData: any) {
    let totWeightage = 0;
    if (this.checkforNonEmpty(formData.IntPartNumber)) totWeightage += 10;
    if (this.checkforNonEmpty(formData.commdityvalue)) totWeightage += 20;
    if (this.checkforNonEmpty(formData.supplierName)) totWeightage += 20;
    if (this.checkforNonEmpty(formData.DeliverySite)) totWeightage += 10;
    if (this.checkforNonEmpty(formData.AnnualVolume)) totWeightage += 10;
    if (this.checkforNonEmpty(formData.lotsize)) totWeightage += 10;
    if (this.checkforNonEmpty(formData.prodLifeRemaining)) totWeightage += 10;
    if (this.checkforNonEmpty(formData.packingtype)) totWeightage += 10;
    return Math.round(totWeightage);
  }

  materialInformation(formData: any, processFlag: any = null, currentPart: PartInfoDto, hasMaterial: boolean) {
    let totWeightage = 0;
    if (currentPart?.commodityId === CommodityType.PlasticAndRubber && (processFlag?.IsProcessTypeInjectionMolding || processFlag?.IsProcessTypeRubberInjectionMolding)) {
      if (hasMaterial) {
        if (this.checkforNonEmpty(formData.materialCategory)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.materialFamily)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.matPrice)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.scrapPrice)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.injectionMoldingMaterial.length)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.injectionMoldingMaterial.width)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.injectionMoldingMaterial.height)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.injectionMoldingMaterial.maxWallthick)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.injectionMoldingMaterial.partProjectArea)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.injectionMoldingMaterial.netWeight)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.noOfCavities)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.runnerType)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.runnerDia)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.runnerLength)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.injectionMoldingMaterial.regrindAllowance)) totWeightage += 5;
      }
    } else if (currentPart?.commodityId !== CommodityType.Electronics) {
      if (processFlag?.IsProcessConventionalPCB) {
        totWeightage += 80;
      } else {
        if (hasMaterial) {
          if (this.checkforNonEmpty(formData.materialCategory)) totWeightage += 15;
          if (this.checkforNonEmpty(formData.materialFamily)) totWeightage += 15;
          if (this.checkforNonEmpty(formData.materialDescription)) totWeightage += 20;
          if (this.checkforNonEmpty(formData.matPrice)) totWeightage += 5;
          if (this.checkforNonEmpty(formData.scrapPrice)) totWeightage += 5;
        }
      }
      if (hasMaterial) {
        if (this.checkforNonEmpty(formData.matPrimaryProcessName)) totWeightage += 20;
        if (this.checkforNonEmpty(formData.length)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.width)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.height)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.netWeight)) totWeightage += 5;
      }
    } else {
      this.checkforNonEmpty(formData?.pcbaMaterial?.typeOfCable) && (totWeightage += 10);
      this.checkforNonEmpty(formData?.pcbaMaterial?.typeOfConductor) && (totWeightage += 10);
      this.checkforNonEmpty(formData?.pcbaMaterial?.noOfCables) && (totWeightage += 10);
      this.checkforNonEmpty(formData?.pcbaMaterial?.sheetLength) && (totWeightage += 10);
      this.checkforNonEmpty(formData?.pcbaMaterial?.sheetWidth) && (totWeightage += 10);
      this.checkforNonEmpty(formData?.pcbaMaterial?.sheetThickness) && (totWeightage += 5);
      this.checkforNonEmpty(formData?.pcbaMaterial?.inputBilletWidth) && (totWeightage += 5);
      this.checkforNonEmpty(formData?.pcbaMaterial?.inputBilletHeight) && (totWeightage += 5);
      this.checkforNonEmpty(formData?.pcbaMaterial?.totalCableLength) && (totWeightage += 5);
      this.checkforNonEmpty(formData?.pcbaMaterial?.flashVolume) && (totWeightage += 5);
      this.checkforNonEmpty(formData?.pcbaMaterial?.closingTime) && (totWeightage += 5);
      this.checkforNonEmpty(formData?.pcbaMaterial?.injectionTime) && (totWeightage += 5);
      this.checkforNonEmpty(formData?.pcbaMaterial?.holdingTime) && (totWeightage += 5);
      this.checkforNonEmpty(formData?.pcbaMaterial?.coolingTime) && (totWeightage += 5);
      this.checkforNonEmpty(formData?.pcbaMaterial?.ejectionTime) && (totWeightage += 5);
    }
    return Math.round(totWeightage);
  }

  manufacturingInformation(formData: any, processFlag: any = null) {
    let totWeightage = 0;
    if (formData.processTypeID) {
      if (processFlag?.IsProcessTypeInjectionMolding) {
        if (this.checkforNonEmpty(formData.processTypeID)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.machineId)) totWeightage += 30;
        if (this.checkforNonEmpty(formData.yieldPer)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.machineHourRate)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.cycleTime)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.noOfLowSkilledLabours)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.lowSkilledLaborRatePerHour)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.skilledLaborRatePerHour)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.setUpTime)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.samplingRate)) totWeightage += 5;
      } else {
        if (this.checkforNonEmpty(formData.processTypeID)) totWeightage += 5;
        // selectedTonnage is typically readonly/calculated, not user-input, so removed from percentage calculation
        if (this.checkforNonEmpty(formData.machineId)) totWeightage += 20;
        if (this.checkforNonEmpty(formData.yieldPer)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.machineHourRate)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.cycleTime)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.noOfLowSkilledLabours)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.lowSkilledLaborRatePerHour)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.skilledLaborRatePerHour)) totWeightage += 10;
        if (this.checkforNonEmpty(formData.setUpTime)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.qaOfInspectorRate)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.inspectionTime)) totWeightage += 5;
        if (this.checkforNonEmpty(formData.samplingRate)) totWeightage += 5;
        if (processFlag?.IsProcessElectronics) {
          totWeightage += 5 + 5 + 5 + 10; //samplingRate,qaOfInspectorRate,inspectionTime,selectedTonnage
        } else if (processFlag?.IsProcessWiringHarness) {
          totWeightage += 10; //for tonnage
        } else if (processFlag?.IsConventionalPCB) {
          totWeightage += 20;
        }
      }
    }
    return Math.round(totWeightage);
  }

  secondaryProcess(formData: any) {
    let nonEmptyFieldWeightage: number = 0;
    const totalFields = 8;
    if (this.checkforNonEmpty(formData.Secondary_Process)) nonEmptyFieldWeightage += 2;
    if (this.checkforNonEmpty(formData.InHouse_Outsourced)) nonEmptyFieldWeightage += 2;
    if (this.checkforNonEmpty(formData.platingMaterial)) nonEmptyFieldWeightage += 2;
    if (this.checkforNonEmpty(formData.Plating_area)) nonEmptyFieldWeightage += 2;
    if (this.checkforNonEmpty(formData.platingMachineDescription)) nonEmptyFieldWeightage += 2;
    if (this.checkforNonEmpty(formData.Plating_Thick)) nonEmptyFieldWeightage += 2;
    if (this.checkforNonEmpty(formData.platingCost)) nonEmptyFieldWeightage += 2;
    if (this.checkforNonEmpty(formData.Plating_Thick)) nonEmptyFieldWeightage += 2;

    if (this.checkforNonEmpty(formData.ProcessRemarks)) nonEmptyFieldWeightage += 2;
    return this.calculatePercentage(nonEmptyFieldWeightage, totalFields);
  }
  purchaseCatalouge(formData: any) {
    let nonEmptyFieldWeightage: number = 0;
    const totalFields = 5;
    if (this.checkforNonEmpty(formData.PartNo)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.PartDescription)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.Description)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.PartCost)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.Qty)) nonEmptyFieldWeightage += 1;

    return this.calculatePercentage(nonEmptyFieldWeightage, totalFields);
  }
  overheadProfit(formData: any) {
    let totWeightage = 0;
    if (this.checkforNonEmpty(formData.iccPer)) totWeightage += 12.5;
    if (this.checkforNonEmpty(formData.mohPer)) totWeightage += 12.5;
    if (this.checkforNonEmpty(formData.fohPer)) totWeightage += 12.5;
    if (this.checkforNonEmpty(formData.sgaPer)) totWeightage += 12.5;
    if (this.checkforNonEmpty(formData.materialProfitPer)) totWeightage += 12.5;
    if (this.checkforNonEmpty(formData.processProfitPer)) totWeightage += 12.5;
    if (this.checkforNonEmpty(formData.paymentTermsPer)) totWeightage += 12.5;
    if (this.checkforNonEmpty(formData.fgiccPer)) totWeightage += 12.5;
    return Math.round(totWeightage);
  }

  packageInformation(formData: any) {
    let nonEmptyFieldWeightage: number = 0;
    const totalFields = 16;
    if (this.checkforNonEmpty(formData.EnvelopLength)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.EnvelopWidth)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.EnvelopHeight)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.PartWeight)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.CorrugatedBox)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.Pallet)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.Cushions)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.IndPackMaterial)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.PaperPulp)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.IndPackMaterial)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.BulkPack)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.BulkPackLength)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.BulkPackWidth)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.NoofPartsBulkPack)) nonEmptyFieldWeightage += 1;

    if (this.checkforNonEmpty(formData.NoOfLabors)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.cycleTime)) nonEmptyFieldWeightage += 1;

    return this.calculatePercentage(nonEmptyFieldWeightage, totalFields);
  }
  logistics(formData: any) {
    let nonEmptyFieldWeightage: number = 0;
    const totalFields = 7;
    if (this.checkforNonEmpty(formData.ModeOfTransport)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.ShipmentType)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.ContainerType)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.ContainerCost)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.ContainerPercent)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.FreightCostPerShipment)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.FreightCost)) nonEmptyFieldWeightage += 1;

    return this.calculatePercentage(nonEmptyFieldWeightage, totalFields);
  }
  sustainablity(formData: any, formDataMatrial: any, formDataManufactring: any, formDataPackage: any) {
    let nonEmptyFieldWeightage: number = 0;
    const totalFields = 8;
    if (this.checkforNonEmpty(formDataMatrial.esgImpactCO2Kg)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formDataPackage.TotalCarbonFootPrint)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formDataPackage.CarbonFootPrint)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formDataPackage.CarbonFootPrintPerUnit)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formDataManufactring.esgImpactElectricityConsumption)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.ContainerPercent)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.FreightCostPerShipment)) nonEmptyFieldWeightage += 1;
    if (this.checkforNonEmpty(formData.FreightCost)) nonEmptyFieldWeightage += 1;

    return this.calculatePercentage(nonEmptyFieldWeightage, totalFields);
  }
  checkforNonEmpty(data: any) {
    let result = false;
    if (data != '' && data != null && data != undefined) result = true;
    return result;
  }
  calculatePercentage(nonEmptyWeightage: number, totalFields: number) {
    let percentage: number = 0;
    if (totalFields > 0) {
      percentage = (nonEmptyWeightage / totalFields) * 100;
      percentage = Math.ceil(percentage);
      percentage = percentage > 100 ? 100 : percentage;
    }
    return Math.round(percentage);
  }
}
