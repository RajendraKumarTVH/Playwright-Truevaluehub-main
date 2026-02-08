import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MaterialInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared.service';
import { PrimaryProcessType } from '../costing.config';

@Injectable({
  providedIn: 'root',
})
export class MaterialSecondaryProcessCalculatorService {
  constructor(private shareService: SharedService) {}

  public assemblyCalculation(materialInfo: MaterialInfoDto): Observable<MaterialInfoDto> {
    return new Observable((obs) => {
      obs.next(materialInfo);
    });
  }

  public calculationsForMetalTubeExtrusion(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): MaterialInfoDto {
    const processTypeID = Number(materialInfo.processId);
    if (materialInfo.isScrapPriceDirty && !!materialInfo.scrapPricePerKg) {
      materialInfo.scrapPricePerKg = Number(materialInfo.scrapPricePerKg);
    } else {
      let scrapPricePerKg = this.shareService.isValidNumber(Number(materialInfo.materialPricePerKg) * 0.6);
      if (processTypeID === PrimaryProcessType.MetalExtrusion) {
        scrapPricePerKg = Number(materialInfo.scrapPricePerKg);
      }
      if (materialInfo.scrapPricePerKg) {
        scrapPricePerKg = this.shareService.checkDirtyProperty('scrapPricePerKg', fieldColorsList) ? selectedMaterial?.scrapPricePerKg : scrapPricePerKg;
      }
      materialInfo.scrapPricePerKg = scrapPricePerKg;
    }

    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      let netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight) {
        netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    if (materialInfo.isInputBilletLengthDirty && !!materialInfo.inputBilletDiameter) {
      materialInfo.inputBilletDiameter = Number(materialInfo.inputBilletDiameter);
    } else {
      let inputBilletDiameter = 67;
      if (materialInfo.inputBilletDiameter) {
        inputBilletDiameter = this.shareService.checkDirtyProperty('inputBilletDiameter', fieldColorsList) ? selectedMaterial?.inputBilletDiameter : inputBilletDiameter;
      }
      materialInfo.inputBilletDiameter = inputBilletDiameter;
    }

    if (materialInfo.isutilisationDirty && !!materialInfo.utilisation) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      if (materialInfo.utilisation) {
        materialInfo.utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : 0.95;
      } else {
        materialInfo.utilisation = 0.95;
      }
    }

    if (materialInfo.isGrossWeightDirty && !!materialInfo.grossWeight) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      let grossWeight = this.shareService.isValidNumber(Number(materialInfo.netWeight) / Number(materialInfo.utilisation));
      if (materialInfo.grossWeight) {
        grossWeight = this.shareService.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterial?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    if (materialInfo.isScrapWeightDirty && !!materialInfo.scrapWeight) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = this.shareService.isValidNumber(Number(materialInfo.grossWeight) - Number(materialInfo.netWeight));
      if (materialInfo.scrapWeight) {
        scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    materialInfo.materialCostPart = this.shareService.isValidNumber(Number(materialInfo.grossWeight) * (Number(materialInfo.materialPricePerKg) / 1000));
    materialInfo.scrapRecCost = this.shareService.isValidNumber(Number(materialInfo.scrapWeight) * Number(materialInfo.scrapPricePerKg)) / 1000;
    materialInfo.netMatCost = this.shareService.isValidNumber(materialInfo.materialCostPart - materialInfo.scrapRecCost);
    // let runnerProjectedArea = Number(materialInfo.runnerDia) * Number(materialInfo.runnerLength);
    // materialInfo.runnerProjectedArea = runnerProjectedArea;
    // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo);
    // if (materialInfo.volumeDiscountPer > 0) {
    //     materialInfo.netMatCost = materialInfo.netMatCost * materialInfo.volumeDiscountPer;
    // }
    return materialInfo;
  }
}
