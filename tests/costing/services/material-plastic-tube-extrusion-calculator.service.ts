import { Injectable } from '@angular/core';
import { MaterialInfoDto, PartInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root',
})
export class MaterialPlasticTubeExtrusionCalculatorService {
  constructor(public shareService: SharedService) {}
  currentPart: PartInfoDto;

  public calculationsForPlasticTubeExtrusion(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): MaterialInfoDto {
    if (materialInfo.isMatPriceDirty && !!materialInfo.materialPricePerKg) {
      materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
    } else {
      materialInfo.materialPricePerKg = this.shareService.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterial?.materialPricePerKg : materialInfo.materialPricePerKg;
    }

    if (materialInfo.isScrapPriceDirty && !!materialInfo.scrapPricePerKg) {
      materialInfo.scrapPricePerKg = Number(materialInfo.scrapPricePerKg);
    } else {
      let scrapPricePerKg = this.shareService.isValidNumber(Number(materialInfo.materialPricePerKg) * 0.6);
      if (materialInfo.scrapPricePerKg) {
        scrapPricePerKg = this.shareService.checkDirtyProperty('scrapPricePerKg', fieldColorsList) ? selectedMaterial?.scrapPricePerKg : scrapPricePerKg;
      }
      materialInfo.scrapPricePerKg = scrapPricePerKg;
    }

    if (materialInfo.isDensityDirty && !!materialInfo.density) {
      materialInfo.density = Number(materialInfo.density);
    } else {
      materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterial?.density : materialInfo.density;
    }

    if (materialInfo.isPartOuterDiameterDirty && !!materialInfo.partOuterDiameter) {
      materialInfo.partOuterDiameter = Number(materialInfo.partOuterDiameter);
    } else {
      materialInfo.partOuterDiameter = this.shareService.checkDirtyProperty('partOuterDiameter', fieldColorsList) ? selectedMaterial?.partOuterDiameter : Number(materialInfo.partOuterDiameter);
    }

    if (materialInfo.isPartInnerDiameterDirty && !!materialInfo.partInnerDiameter) {
      materialInfo.partInnerDiameter = Number(materialInfo.partInnerDiameter);
    } else {
      materialInfo.partInnerDiameter = this.shareService.checkDirtyProperty('partInnerDiameter', fieldColorsList) ? selectedMaterial?.partInnerDiameter : Number(materialInfo.partInnerDiameter);
    }

    if (materialInfo.isAvgWallthickDirty && !!materialInfo.wallAverageThickness) {
      materialInfo.wallAverageThickness = Number(materialInfo.wallAverageThickness);
    } else {
      let wallAverageThickness = (Number(materialInfo.partOuterDiameter) - Number(materialInfo.partInnerDiameter)) / 2;
      if (materialInfo.wallAverageThickness) {
        wallAverageThickness = this.shareService.checkDirtyProperty('wallAverageThickness', fieldColorsList) ? selectedMaterial?.wallAverageThickness : wallAverageThickness;
      }
      materialInfo.wallAverageThickness = wallAverageThickness;
    }

    if (materialInfo.isPartProjectedAreaDirty && !!materialInfo.partProjectedArea) {
      materialInfo.partProjectedArea = Number(materialInfo.partProjectedArea);
    } else {
      materialInfo.partProjectedArea = this.shareService.checkDirtyProperty('partProjectArea', fieldColorsList) ? selectedMaterial?.partProjectedArea : Number(materialInfo.partProjectedArea);
    }

    if (materialInfo.isNoOfInsertsDirty && !!materialInfo.noOfInserts) {
      materialInfo.noOfInserts = Number(materialInfo.noOfInserts);
    } else {
      materialInfo.noOfInserts = this.shareService.checkDirtyProperty('noOfInserts', fieldColorsList) ? selectedMaterial?.noOfInserts : Number(materialInfo.noOfInserts);
    }

    if (materialInfo.isPartVolumeDirty && !!materialInfo.partVolume) {
      materialInfo.partVolume = Number(materialInfo.partVolume);
    } else {
      materialInfo.partVolume = this.shareService.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterial?.partVolume : Number(materialInfo.partVolume);
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

    if (materialInfo.isutilisationDirty && !!materialInfo.utilisation) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      if (materialInfo.utilisation) {
        materialInfo.utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : 95;
      } else {
        materialInfo.utilisation = 95;
      }
    }
    materialInfo.utilisation <= 1 && (materialInfo.utilisation = materialInfo.utilisation * 100);
    const utilisation = Number(materialInfo.utilisation) / 100;

    if (materialInfo.isGrossWeightDirty && !!materialInfo.grossWeight) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      let grossWeight = this.shareService.isValidNumber(Number(materialInfo.netWeight) / utilisation);
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
    return materialInfo;
  }
}
