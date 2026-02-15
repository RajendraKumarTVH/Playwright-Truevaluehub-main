
import { MaterialInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';


export class MaterialTubeBendingCalculationService {
  constructor(private shareService: SharedService) { }

  public calculationsForTubeBending(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): Observable<MaterialInfoDto> {
    if (materialInfo.isDensityDirty && !!materialInfo.density) {
      materialInfo.density = Number(materialInfo.density);
    } else {
      materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterialInfo?.density : materialInfo.density;
    }

    if (materialInfo.isPartOuterDiameterDirty && !!materialInfo.partOuterDiameter) {
      materialInfo.partOuterDiameter = Number(materialInfo.partOuterDiameter);
    } else {
      materialInfo.partOuterDiameter = this.shareService.checkDirtyProperty('partOuterDiameter', fieldColorsList) ? selectedMaterialInfo?.partOuterDiameter : Number(materialInfo.partOuterDiameter);
    }

    if (materialInfo.isPartHeightDirty && !!materialInfo.partHeight) {
      materialInfo.partHeight = Number(materialInfo.partHeight);
    } else {
      materialInfo.partHeight = this.shareService.checkDirtyProperty('partHeight', fieldColorsList) ? selectedMaterialInfo?.partHeight : Number(materialInfo.partHeight);
    }

    if (materialInfo.isPartWidthDirty && !!materialInfo.partWidth) {
      materialInfo.partWidth = Number(materialInfo.partWidth);
    } else {
      materialInfo.partWidth = this.shareService.checkDirtyProperty('partWidth', fieldColorsList) ? selectedMaterialInfo?.partWidth : Number(materialInfo.partWidth);
    }

    if (materialInfo.ispartTicknessDirty && !!materialInfo.partTickness) {
      materialInfo.partTickness = Number(materialInfo.partTickness);
    } else {
      materialInfo.partTickness = this.shareService.checkDirtyProperty('partTickness', fieldColorsList) ? selectedMaterialInfo?.partTickness : materialInfo.partTickness;
    }

    if (materialInfo.isSheetLengthDirty && !!materialInfo.sheetLength) {
      materialInfo.sheetLength = Number(materialInfo.sheetLength);
    } else {
      materialInfo.sheetLength = this.shareService.checkDirtyProperty('sheetLength', fieldColorsList) ? selectedMaterialInfo?.sheetLength : materialInfo.sheetLength;
    }

    if (materialInfo.isMatPriceDirty && !!materialInfo.materialPricePerKg) {
      materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
    } else {
      materialInfo.materialPricePerKg = this.shareService.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterialInfo?.materialPricePerKg : materialInfo.materialPricePerKg;
    }

    if (materialInfo.isPartLengthDirty && !!materialInfo.partLength) {
      materialInfo.partLength = Number(materialInfo.partLength);
    } else {
      materialInfo.partLength = this.shareService.checkDirtyProperty('partLength', fieldColorsList) ? selectedMaterialInfo?.partLength : Number(materialInfo.partLength);
    }

    if (materialInfo.isPartVolumeDirty && !!materialInfo.partVolume) {
      materialInfo.partVolume = Number(materialInfo.partVolume);
    } else {
      materialInfo.partVolume = this.shareService.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterialInfo?.partVolume : Number(materialInfo.partVolume);
    }

    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      let netWeight = this.shareService.isValidNumber(Number(materialInfo.density) * (Number(materialInfo.partVolume) / 1000));
      if (materialInfo?.netWeight) {
        netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    if (materialInfo.isGrossWeightDirty && !!materialInfo.grossWeight) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      let partOuterDiameter = Number(materialInfo?.partOuterDiameter);
      if (Number(materialInfo?.stockType) === 2) {
        partOuterDiameter = Number(materialInfo?.partWidth) >= Number(materialInfo?.partHeight) ? Number(materialInfo?.partWidth) : Number(materialInfo?.partHeight);
      }
      let grossWeight = this.shareService.isValidNumber(
        Math.PI *
        (Number(materialInfo.sheetLength) * 100) *
        ((Math.pow(partOuterDiameter / 20, 2) - Math.pow(partOuterDiameter / 20 - Number(materialInfo.partTickness) / 10, 2)) * materialInfo.density)
      );
      if (materialInfo?.grossWeight) {
        grossWeight = this.shareService.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    if (materialInfo.isScrapWeightDirty && !!materialInfo.scrapWeight) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = this.shareService.isValidNumber(Number(materialInfo.grossWeight) - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight) {
        scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterialInfo?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    // if (materialInfo.isutilisationDirty && !!materialInfo.utilisation) {
    //   materialInfo.utilisation = Number(materialInfo.utilisation);
    // } else {
    //   let utilisation = this.shareService.isValidNumber((Number(materialInfo.netWeight) / Number(materialInfo.grossWeight)) * 100);
    //   if (!!materialInfo.utilisation) {
    //     utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterialInfo?.utilisation : utilisation;
    //   }
    //   materialInfo.utilisation = utilisation;
    // }
    materialInfo.utilisation = this.shareService.isValidNumber((Number(materialInfo.netWeight) / Number(materialInfo.grossWeight)) * 100);

    if (materialInfo.isScrapPriceDirty && !!materialInfo.scrapPricePerKg) {
      materialInfo.scrapPricePerKg = Number(materialInfo.scrapPricePerKg);
    } else {
      materialInfo.scrapPricePerKg = this.shareService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedMaterialInfo?.scrapPricePerKg : materialInfo.scrapPricePerKg;
    }

    // if (materialInfo.isTotalCostOfRawMaterialsDirty && !!materialInfo.totalCostOfRawMaterials) {
    //   materialInfo.totalCostOfRawMaterials = Number(materialInfo.totalCostOfRawMaterials);
    // } else {
    //   let totalCostOfRawMaterials = this.shareService.isValidNumber(Number(materialInfo.grossWeight) / 1000 * Number(materialInfo.materialPricePerKg));
    //   if (!!materialInfo?.totalCostOfRawMaterials) {
    //     totalCostOfRawMaterials = this.shareService.checkDirtyProperty('totalCostOfRawMaterials', fieldColorsList) ? selectedMaterialInfo?.totalCostOfRawMaterials : totalCostOfRawMaterials;
    //   }
    //   materialInfo.totalCostOfRawMaterials = totalCostOfRawMaterials;
    // }
    materialInfo.totalCostOfRawMaterials = this.shareService.isValidNumber((Number(materialInfo.grossWeight) / 1000) * Number(materialInfo.materialPricePerKg));

    if (Number(materialInfo.stockType) === 2) {
      // rectangle
      materialInfo.cuttingAllowance = this.shareService.isValidNumber((Number(materialInfo.partWidth) * 2 + Number(materialInfo.partHeight) * 2) * Number(materialInfo.partTickness));
    } else {
      materialInfo.cuttingAllowance = this.shareService.isValidNumber(
        (3.14 / 4) * (Math.pow(Number(materialInfo.partOuterDiameter), 2) - Math.pow(Number(materialInfo.partOuterDiameter) - Number(materialInfo.partTickness) * 2, 2))
      );
    }

    materialInfo.noOfInserts = this.shareService.isValidNumber(
      Math.floor(((Number(materialInfo.sheetLength) * 1000) / (Number(materialInfo.partLength) + Number(materialInfo.lengthAllowance))) * 10) / 10
    );
    materialInfo.scrapRecCost = this.shareService.isValidNumber((Number(materialInfo.scrapWeight) / 1000) * Number(materialInfo.scrapPricePerKg));
    materialInfo.cuttingLoss = this.shareService.isValidNumber((Number(materialInfo.cuttingAllowance) / 1000) * Number(materialInfo.density));
    materialInfo.scaleLoss = this.shareService.isValidNumber(((Number(materialInfo.cuttingAllowance) * 200) / 1000) * Number(materialInfo.density));
    materialInfo.netMatCost = this.shareService.isValidNumber(Number(materialInfo.totalCostOfRawMaterials) - Number(materialInfo.scrapRecCost));

    return new Observable((obs) => {
      obs.next(materialInfo);
    });
  }
}
