import { Injectable } from '@angular/core';
import { MaterialInfoDto, PartInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared.service';
import { PrimaryProcessType } from '../costing.config';
import { PartComplexity } from 'src/app/shared/enums';
import { MaterialForgingConfigService } from 'src/app/shared/config/material-forging-config';
import { IMaterialCalculationByCommodity } from './IMaterialCalculationByCommodity';
import { MaterialInsulationJacketCalculatorService } from './material-insulation-jacket-calculator.service';

@Injectable({
  providedIn: 'root',
})
export class MaterialMatalFormingCalculationService implements IMaterialCalculationByCommodity {
  currentPart: PartInfoDto;
  constructor(
    private shareService: SharedService,
    private materialForgingConfigService: MaterialForgingConfigService,
    private materialInsulationService: MaterialInsulationJacketCalculatorService
  ) {}

  setCurrentPart(part: PartInfoDto) {
    this.currentPart = part;
  }

  CalculateMaterialCost(processId: number, materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): MaterialInfoDto {
    switch (processId) {
      case PrimaryProcessType.HotForgingClosedDieHot:
        return this.calculationForHotForgingClosedDie(materialInfo, fieldColorsList, selectedMaterial, this.currentPart);
      case PrimaryProcessType.TubeBending:
        return this.calculationsForTubeBending(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.HotForgingOpenDieHot:
        return this.calculationForHotForgingOpenDie(materialInfo, fieldColorsList, selectedMaterial, this.currentPart);
      case PrimaryProcessType.ColdForgingClosedDieHot:
      case PrimaryProcessType.ColdForgingColdHeading:
        return this.calculationForColdForging(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.ZincPlating:
      case PrimaryProcessType.ChromePlating:
      case PrimaryProcessType.NickelPlating:
      case PrimaryProcessType.CopperPlating:
      case PrimaryProcessType.R2RPlating: //2,12
      case PrimaryProcessType.TinPlating:
      case PrimaryProcessType.GoldPlating:
      case PrimaryProcessType.SilverPlating:
      case PrimaryProcessType.PowderCoating:
      case PrimaryProcessType.Painting:
        return this.materialInsulationService.calculationsForPlating(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.Galvanization:
      case PrimaryProcessType.WetPainting:
      case PrimaryProcessType.SiliconCoatingAuto:
      case PrimaryProcessType.SiliconCoatingSemi:
        return this.materialInsulationService.calculationsForCoating(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.WireCuttingTermination:
        return this.materialInsulationService.calculationsForWireCuttingTermination(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.MetalTubeExtrusion:
      case PrimaryProcessType.MetalExtrusion:
        return this.calculationsForMetalTubeExtrusion(materialInfo, fieldColorsList, selectedMaterial);

      default:
        return materialInfo;
    }
  }

  public isValidNumber(value: any): number {
    return !value || Number.isNaN(value) || !Number.isFinite(Number(value)) || value < 0 ? 0 : value;
  }

  private checkDirtyProperty(formCotrolName: string, fieldList: any[]) {
    let res = false;
    if (fieldList) {
      const info = fieldList?.filter((x) => x.formControlName == formCotrolName && x.isDirty == true);
      if (info.length > 0) {
        res = true;
      }
    }
    return res;
  }

  public calculationForHotForgingClosedDie(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto, currentPart: PartInfoDto): MaterialInfoDto {
    //Net (Forging)Part Weight (g / part):
    let netWeight = 0;
    if (materialInfo.isNetweightDirty && materialInfo.netWeight != null) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo?.density)) / 1000);
      if (materialInfo?.netWeight != null) {
        netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    if (materialInfo.isProjectedAreaDirty && !!materialInfo.projectedArea) {
      materialInfo.projectedArea = Number(materialInfo.projectedArea);
    } else {
      materialInfo.projectedArea = this.shareService.checkDirtyProperty('projectedArea', fieldColorsList) ? selectedMaterialInfo?.projectedArea : Number(materialInfo.projectedArea);
    }

    //Material Utilization Ratio:
    if (materialInfo.isutilisationDirty && materialInfo.utilisation != null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = 0.95;
      if (materialInfo.utilisation != null) {
        utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterialInfo?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    //Diameter

    let stockOuterDiameter = 0;
    if (materialInfo.isInputBilletDiameterDirty && materialInfo.inputBilletDiameter != null) {
      materialInfo.inputBilletDiameter = Number(materialInfo.inputBilletDiameter);
    } else {
      stockOuterDiameter = Number(materialInfo.inputBilletDiameter);
      if (materialInfo?.inputBilletDiameter != null) {
        stockOuterDiameter = this.shareService.checkDirtyProperty('inputBilletDiameter', fieldColorsList) ? selectedMaterialInfo?.inputBilletDiameter : stockOuterDiameter;
      }
      materialInfo.inputBilletDiameter = stockOuterDiameter;
    }

    if (materialInfo.isStockOuterDiameterDirty && materialInfo.stockOuterDiameter != null) {
      materialInfo.stockOuterDiameter = Number(materialInfo.stockOuterDiameter);
    } else {
      stockOuterDiameter = Number(materialInfo.stockOuterDiameter);
      if (materialInfo?.stockOuterDiameter != null) {
        stockOuterDiameter = this.shareService.checkDirtyProperty('stockOuterDiameter', fieldColorsList) ? selectedMaterialInfo?.stockOuterDiameter : stockOuterDiameter;
      }
      materialInfo.stockOuterDiameter = stockOuterDiameter;
    }

    if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      stockOuterDiameter = materialInfo.stockOuterDiameter;
    } else if (materialInfo.processId === PrimaryProcessType.HotForgingOpenDieHot) {
      stockOuterDiameter = materialInfo.inputBilletDiameter;
    }

    //Cutting Loss mm^3
    if (materialInfo.stockForm === 'Round Bar') {
      const divided = this.shareService.isValidNumber(Number(stockOuterDiameter / 2));
      materialInfo.cuttingLoss = this.shareService.isValidNumber(3.142 * Number(Math.pow(divided, 2)) * 1);
    } else {
      materialInfo.cuttingLoss = this.shareService.isValidNumber(Number(materialInfo.stockWidth * materialInfo.stockHeight * 1));
    }

    //flash volume
    let flashVolume = 0;
    if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      const complexity = currentPart?.partComplexity;

      let widthGutter = 0;
      if (complexity === PartComplexity.High) {
        let thickGutter = 0;
        let widthLand = 0;
        let thickLand = 0;
        const forgWeight = this.shareService.isValidNumber(Number(materialInfo.netWeight / 1000));
        const forgingtbl1 = this.materialForgingConfigService.getForgingComplexity().filter((x) => x.wt < forgWeight);
        if (forgingtbl1?.length > 0) {
          widthGutter = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].cmplexb : 0;
          thickGutter = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].h1 : 0;
          widthLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].complexb1 : 0;
          thickLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].hf : 0;
          flashVolume = this.shareService.isValidNumber(
            Number(widthGutter) * Number(thickGutter) * Number(materialInfo.perimeter) + Number(widthLand) * Number(thickLand) * Number(materialInfo.perimeter)
          );
        }
      }

      if (complexity === PartComplexity.Medium) {
        let thickGutter = 0;
        let widthLand = 0;
        let thickLand = 0;
        const forgWeight = this.shareService.isValidNumber(Number(materialInfo.netWeight / 1000));
        const forgingtbl1 = this.materialForgingConfigService.getForgingComplexity().filter((x) => x.wt < forgWeight);
        if (forgingtbl1.length > 0) {
          widthGutter = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].simpleb : 0;
          thickGutter = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].h1 : 0;
          widthLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].simpleb1 : 0;
          thickLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].hf : 0;
          flashVolume = this.shareService.isValidNumber(
            Number(widthGutter) * Number(thickGutter) * Number(materialInfo.perimeter) + Number(widthLand) * Number(thickLand) * Number(materialInfo.perimeter)
          );
        }
      }
    } else {
      flashVolume = 0;
    }

    if (materialInfo.isFlashVolumeDirty && materialInfo.flashVolume != null) {
      materialInfo.flashVolume = Number(materialInfo.flashVolume);
    } else {
      if (materialInfo?.flashVolume != null) {
        flashVolume = this.shareService.checkDirtyProperty('flashVolume', fieldColorsList) ? selectedMaterialInfo?.flashVolume : flashVolume;
      }
      materialInfo.flashVolume = flashVolume;
    }

    //Scale loss
    let scaleloss = 0;
    if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      scaleloss = this.shareService.isValidNumber((Number(materialInfo?.flashVolume) + Number(materialInfo?.partVolume)) * 0.03);
    } else {
      scaleloss = this.shareService.isValidNumber((Number(materialInfo?.flashVolume) + Number(materialInfo?.cuttingLoss) + Number(materialInfo?.partVolume)) * 0.03);
    }
    if (materialInfo.isScaleLossDirty && materialInfo.scaleLoss != null) {
      materialInfo.scaleLoss = Number(materialInfo.scaleLoss);
    } else {
      if (materialInfo?.scaleLoss != null) {
        scaleloss = this.shareService.checkDirtyProperty('scaleLoss', fieldColorsList) ? selectedMaterialInfo?.scaleLoss : scaleloss;
      }
      materialInfo.scaleLoss = scaleloss;
    }

    //Gross Volume

    materialInfo.grossVolumne = this.shareService.isValidNumber(
      Number(materialInfo?.scaleLoss) + Number(materialInfo?.flashVolume) + Number(materialInfo?.cuttingLoss) + Number(materialInfo?.partVolume)
    );

    //Stock Length / Billet Bar length
    let blockLength = 0;
    if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      if (materialInfo.isBlockLengthDirty && materialInfo.blockLength != null) {
        materialInfo.blockLength = Number(materialInfo.blockLength);
      } else {
        if (materialInfo.stockForm === 'Round Bar') {
          blockLength = this.shareService.isValidNumber(Number(4 * materialInfo?.grossVolumne) / Number(3.142 * Math.pow(Number(stockOuterDiameter), 2)));
        } else {
          blockLength = this.shareService.isValidNumber(Number(materialInfo?.grossVolumne) / (Number(materialInfo.stockWidth) * Number(materialInfo.stockHeight)));
        }

        if (materialInfo?.blockLength != null) {
          blockLength = this.shareService.checkDirtyProperty('blockLength', fieldColorsList) ? selectedMaterialInfo?.blockLength : blockLength;
        }
        materialInfo.blockLength = blockLength;
      }
    }
    if (materialInfo.processId === PrimaryProcessType.HotForgingOpenDieHot) {
      // Billet Bar length
      if (materialInfo.isInputBilletLengthDirty && materialInfo.inputBilletLength != null) {
        materialInfo.blockLength = Number(materialInfo.inputBilletLength);
      } else {
        if (materialInfo.stockForm === 'Round Bar') {
          blockLength = this.shareService.isValidNumber(Number(4 * materialInfo?.grossVolumne) / Number(3.142 * Math.pow(Number(stockOuterDiameter), 2)));
        } else {
          blockLength = this.shareService.isValidNumber(Number(materialInfo?.grossVolumne) / (Number(materialInfo.stockWidth) * Number(materialInfo.stockHeight)));
        }

        if (materialInfo?.inputBilletLength != null) {
          blockLength = this.shareService.checkDirtyProperty('inputBilletLength', fieldColorsList) ? selectedMaterialInfo?.inputBilletLength : blockLength;
        }
        materialInfo.inputBilletLength = blockLength;
      }
    }

    let grossWeight = 0;
    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight != null) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      grossWeight = this.shareService.isValidNumber(Number(materialInfo.grossVolumne) * (Number(materialInfo.density) / 1000));
      if (materialInfo?.grossWeight != null) {
        grossWeight = this.shareService.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    let scrapWeight = 0;
    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight != null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      scrapWeight = this.shareService.isValidNumber(Number(materialInfo.grossWeight) - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight != null) {
        scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterialInfo?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    let totalCostOfRawMaterials = 0;
    if (materialInfo.isTotalCostOfRawMaterialsDirty && materialInfo.totalCostOfRawMaterials != null) {
      materialInfo.totalCostOfRawMaterials = Number(materialInfo.totalCostOfRawMaterials);
    } else {
      totalCostOfRawMaterials = this.shareService.isValidNumber(Number((materialInfo.grossWeight / 1000) * Number(materialInfo.materialPricePerKg)));
      if (materialInfo?.totalCostOfRawMaterials != null) {
        totalCostOfRawMaterials = this.shareService.checkDirtyProperty('totalCostOfRawMaterials', fieldColorsList) ? selectedMaterialInfo?.totalCostOfRawMaterials : totalCostOfRawMaterials;
      }
      materialInfo.totalCostOfRawMaterials = totalCostOfRawMaterials;
    }

    let yeildUtilization = 0;
    if (materialInfo.isYeildUtilizationDirty && materialInfo.yeildUtilization != null) {
      materialInfo.yeildUtilization = Number(materialInfo.yeildUtilization);
    } else {
      yeildUtilization = this.shareService.isValidNumber((Number(materialInfo.netWeight) / Number(materialInfo.grossWeight)) * 100);
      if (materialInfo?.yeildUtilization != null) {
        yeildUtilization = this.shareService.checkDirtyProperty('yeildUtilization', fieldColorsList) ? selectedMaterialInfo?.yeildUtilization : yeildUtilization;
      }
      materialInfo.yeildUtilization = yeildUtilization;
    }

    let scrapRecCost = 0;
    if (materialInfo.isScrapRecoveryDirty && materialInfo.scrapRecCost != null) {
      materialInfo.scrapRecCost = Number(materialInfo.scrapRecCost);
    } else {
      if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
        scrapRecCost = this.shareService.isValidNumber(((((materialInfo.cuttingLoss + materialInfo.flashVolume) / 1000) * materialInfo.density) / 1000) * materialInfo.scrapPricePerKg);
      } else {
        scrapRecCost = this.shareService.isValidNumber(
          // this.isValidNumber(
          //   ((
          //     (Number(materialInfo.grossWeight) - Number(materialInfo.scaleLoss)) -
          //     materialInfo.netWeight)
          //     / 1000
          //   )) * materialInfo.scrapPricePerKg
          (materialInfo.scrapWeight / 1000) * materialInfo.scrapPricePerKg
        );
      }
      if (materialInfo?.scrapRecCost != null) {
        scrapRecCost = this.shareService.checkDirtyProperty('scrapRecCost', fieldColorsList) ? selectedMaterialInfo?.scrapRecCost : scrapRecCost;
      }
      materialInfo.scrapRecCost = scrapRecCost;
    }

    materialInfo.netMatCost = this.shareService.isValidNumber(Number(materialInfo.totalCostOfRawMaterials) - Number(materialInfo.scrapRecCost));

    return materialInfo;
  }

  public calculationsForTubeBending(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
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
    return materialInfo;
  }

  calculationForHotForgingOpenDie(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto, currentPart: PartInfoDto): MaterialInfoDto {
    //Net (Forging)Part Weight (g / part):
    let netWeight = 0;
    if (materialInfo.isNetweightDirty && materialInfo.netWeight != null) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo?.density)) / 1000);
      if (materialInfo?.netWeight != null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    //Material Utilization Ratio:
    if (materialInfo.isutilisationDirty && materialInfo.utilisation != null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = 0.95;
      if (materialInfo.utilisation != null) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterialInfo?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    //Diameter

    let stockOuterDiameter = 0;
    if (materialInfo.isInputBilletDiameterDirty && materialInfo.inputBilletDiameter != null) {
      materialInfo.inputBilletDiameter = Number(materialInfo.inputBilletDiameter);
    } else {
      stockOuterDiameter = Number(materialInfo.inputBilletDiameter);
      if (materialInfo?.inputBilletDiameter != null) {
        stockOuterDiameter = this.checkDirtyProperty('inputBilletDiameter', fieldColorsList) ? selectedMaterialInfo?.inputBilletDiameter : stockOuterDiameter;
      }
      materialInfo.inputBilletDiameter = stockOuterDiameter;
    }

    if (materialInfo.isStockOuterDiameterDirty && materialInfo.stockOuterDiameter != null) {
      materialInfo.stockOuterDiameter = Number(materialInfo.stockOuterDiameter);
    } else {
      stockOuterDiameter = Number(materialInfo.stockOuterDiameter);
      if (materialInfo?.stockOuterDiameter != null) {
        stockOuterDiameter = this.checkDirtyProperty('stockOuterDiameter', fieldColorsList) ? selectedMaterialInfo?.stockOuterDiameter : stockOuterDiameter;
      }
      materialInfo.stockOuterDiameter = stockOuterDiameter;
    }

    if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      stockOuterDiameter = materialInfo.stockOuterDiameter;
    } else if (materialInfo.processId === PrimaryProcessType.HotForgingOpenDieHot) {
      stockOuterDiameter = materialInfo.inputBilletDiameter;
    }

    //Cutting Loss mm^3
    if (materialInfo.stockForm === 'Round Bar') {
      const divided = this.shareService.isValidNumber(Number(stockOuterDiameter / 2));
      materialInfo.cuttingLoss = this.shareService.isValidNumber(3.142 * Number(Math.pow(divided, 2)) * 1);
    } else {
      materialInfo.cuttingLoss = this.shareService.isValidNumber(Number(materialInfo.stockWidth * materialInfo.stockHeight * 1));
    }

    //flash volume
    let flashVolume = 0;
    if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      const complexity = currentPart?.partComplexity;

      let widthGutter = 0;
      if (complexity === PartComplexity.High) {
        let thickGutter = 0;
        let widthLand = 0;
        let thickLand = 0;
        const forgWeight = this.shareService.isValidNumber(Number(materialInfo.netWeight / 1000));
        const forgingtbl1 = this.materialForgingConfigService.getForgingComplexity().filter((x) => x.wt < forgWeight);
        if (forgingtbl1?.length > 0) {
          widthGutter = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].cmplexb : 0;
          thickGutter = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].h1 : 0;
          widthLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].complexb1 : 0;
          thickLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].hf : 0;
          flashVolume = this.isValidNumber(Number(widthGutter) * Number(thickGutter) * Number(materialInfo.perimeter) + Number(widthLand) * Number(thickLand) * Number(materialInfo.perimeter));
        }
      }

      if (complexity === PartComplexity.Medium) {
        let thickGutter = 0;
        let widthLand = 0;
        let thickLand = 0;
        const forgWeight = this.shareService.isValidNumber(Number(materialInfo.netWeight / 1000));
        const forgingtbl1 = this.materialForgingConfigService.getForgingComplexity().filter((x) => x.wt < forgWeight);
        if (forgingtbl1.length > 0) {
          widthGutter = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].simpleb : 0;
          thickGutter = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].h1 : 0;
          widthLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].simpleb1 : 0;
          thickLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].hf : 0;
          flashVolume = this.isValidNumber(Number(widthGutter) * Number(thickGutter) * Number(materialInfo.perimeter) + Number(widthLand) * Number(thickLand) * Number(materialInfo.perimeter));
        }
      }
    } else {
      flashVolume = 0;
    }

    if (materialInfo.isFlashVolumeDirty && materialInfo.flashVolume != null) {
      materialInfo.flashVolume = Number(materialInfo.flashVolume);
    } else {
      if (materialInfo?.flashVolume != null) {
        flashVolume = this.checkDirtyProperty('flashVolume', fieldColorsList) ? selectedMaterialInfo?.flashVolume : flashVolume;
      }
      materialInfo.flashVolume = flashVolume;
    }

    //Scale loss
    let scaleloss = 0;
    if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      scaleloss = this.isValidNumber((Number(materialInfo?.flashVolume) + Number(materialInfo?.partVolume)) * 0.03);
    } else {
      scaleloss = this.isValidNumber((Number(materialInfo?.flashVolume) + Number(materialInfo?.cuttingLoss) + Number(materialInfo?.partVolume)) * 0.03);
    }
    if (materialInfo.isScaleLossDirty && materialInfo.scaleLoss != null) {
      materialInfo.scaleLoss = Number(materialInfo.scaleLoss);
    } else {
      if (materialInfo?.scaleLoss != null) {
        scaleloss = this.checkDirtyProperty('scaleLoss', fieldColorsList) ? selectedMaterialInfo?.scaleLoss : scaleloss;
      }
      materialInfo.scaleLoss = scaleloss;
    }

    //Gross Volume

    materialInfo.grossVolumne = this.shareService.isValidNumber(
      Number(materialInfo?.scaleLoss) + Number(materialInfo?.flashVolume) + Number(materialInfo?.cuttingLoss) + Number(materialInfo?.partVolume)
    );

    //Stock Length / Billet Bar length
    let blockLength = 0;
    if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      if (materialInfo.isBlockLengthDirty && materialInfo.blockLength != null) {
        materialInfo.blockLength = Number(materialInfo.blockLength);
      } else {
        if (materialInfo.stockForm === 'Round Bar') {
          blockLength = this.isValidNumber(Number(4 * materialInfo?.grossVolumne) / Number(3.142 * Math.pow(Number(stockOuterDiameter), 2)));
        } else {
          blockLength = this.isValidNumber(Number(materialInfo?.grossVolumne) / (Number(materialInfo.stockWidth) * Number(materialInfo.stockHeight)));
        }

        if (materialInfo?.blockLength != null) {
          blockLength = this.checkDirtyProperty('blockLength', fieldColorsList) ? selectedMaterialInfo?.blockLength : blockLength;
        }
        materialInfo.blockLength = blockLength;
      }
    }
    if (materialInfo.processId === PrimaryProcessType.HotForgingOpenDieHot) {
      // Billet Bar length
      if (materialInfo.isInputBilletLengthDirty && materialInfo.inputBilletLength != null) {
        materialInfo.blockLength = Number(materialInfo.inputBilletLength);
      } else {
        if (materialInfo.stockForm === 'Round Bar') {
          blockLength = this.isValidNumber(Number(4 * materialInfo?.grossVolumne) / Number(3.142 * Math.pow(Number(stockOuterDiameter), 2)));
        } else {
          blockLength = this.isValidNumber(Number(materialInfo?.grossVolumne) / (Number(materialInfo.stockWidth) * Number(materialInfo.stockHeight)));
        }

        if (materialInfo?.inputBilletLength != null) {
          blockLength = this.checkDirtyProperty('inputBilletLength', fieldColorsList) ? selectedMaterialInfo?.inputBilletLength : blockLength;
        }
        materialInfo.inputBilletLength = blockLength;
      }
    }

    let grossWeight = 0;
    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight != null) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      grossWeight = this.isValidNumber(Number(materialInfo.grossVolumne) * (Number(materialInfo.density) / 1000));
      if (materialInfo?.grossWeight != null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    let scrapWeight = 0;
    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight != null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      scrapWeight = this.isValidNumber(Number(materialInfo.grossWeight) - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight != null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterialInfo?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    let totalCostOfRawMaterials = 0;
    if (materialInfo.isTotalCostOfRawMaterialsDirty && materialInfo.totalCostOfRawMaterials != null) {
      materialInfo.totalCostOfRawMaterials = Number(materialInfo.totalCostOfRawMaterials);
    } else {
      totalCostOfRawMaterials = this.isValidNumber(Number((materialInfo.grossWeight / 1000) * Number(materialInfo.materialPricePerKg)));
      if (materialInfo?.totalCostOfRawMaterials != null) {
        totalCostOfRawMaterials = this.checkDirtyProperty('totalCostOfRawMaterials', fieldColorsList) ? selectedMaterialInfo?.totalCostOfRawMaterials : totalCostOfRawMaterials;
      }
      materialInfo.totalCostOfRawMaterials = totalCostOfRawMaterials;
    }

    let yeildUtilization = 0;
    if (materialInfo.isYeildUtilizationDirty && materialInfo.yeildUtilization != null) {
      materialInfo.yeildUtilization = Number(materialInfo.yeildUtilization);
    } else {
      yeildUtilization = this.isValidNumber((Number(materialInfo.netWeight) / Number(materialInfo.grossWeight)) * 100);
      if (materialInfo?.yeildUtilization != null) {
        yeildUtilization = this.checkDirtyProperty('yeildUtilization', fieldColorsList) ? selectedMaterialInfo?.yeildUtilization : yeildUtilization;
      }
      materialInfo.yeildUtilization = yeildUtilization;
    }

    let scrapRecCost = 0;
    if (materialInfo.isScrapRecoveryDirty && materialInfo.scrapRecCost != null) {
      materialInfo.scrapRecCost = Number(materialInfo.scrapRecCost);
    } else {
      if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot) {
        scrapRecCost = this.shareService.isValidNumber(((((materialInfo.cuttingLoss + materialInfo.flashVolume) / 1000) * materialInfo.density) / 1000) * materialInfo.scrapPricePerKg);
      } else {
        scrapRecCost = this.shareService.isValidNumber(
          // this.isValidNumber(
          //   ((
          //     (Number(materialInfo.grossWeight) - Number(materialInfo.scaleLoss)) -
          //     materialInfo.netWeight)
          //     / 1000
          //   )) * materialInfo.scrapPricePerKg
          (materialInfo.scrapWeight / 1000) * materialInfo.scrapPricePerKg
        );
      }
      if (materialInfo?.scrapRecCost != null) {
        scrapRecCost = this.checkDirtyProperty('scrapRecCost', fieldColorsList) ? selectedMaterialInfo?.scrapRecCost : scrapRecCost;
      }
      materialInfo.scrapRecCost = scrapRecCost;
    }

    materialInfo.netMatCost = this.isValidNumber(Number(materialInfo.totalCostOfRawMaterials) - Number(materialInfo.scrapRecCost));

    return materialInfo;
  }

  public calculationForColdForging(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
    //Net (Forging)Part Weight (g / part):
    let netWeight = 0;
    if (materialInfo.isNetweightDirty && materialInfo.netWeight != null) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      //if (materialInfo.processId === PrimaryProcessType.ColdForgingClosedDieHot) {
      netWeight = this.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo?.density)) / 1000);
      //}
      // else {
      //   netWeight = this.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo?.density)));
      // }
      if (materialInfo?.netWeight != null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    //Material Utilization Ratio:
    if (materialInfo.isutilisationDirty && materialInfo.utilisation != null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = 0.95;
      if (materialInfo.utilisation != null) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterialInfo?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    //Raw Material Diameter (mm)
    let stockOuterDiameter = 0;
    if (materialInfo.isStockDiameterDirty && materialInfo.stockDiameter != null) {
      stockOuterDiameter = Number(materialInfo.stockDiameter);
    } else {
      stockOuterDiameter = Number(materialInfo.stockDiameter);
      if (materialInfo?.stockDiameter != null) {
        stockOuterDiameter = this.shareService.checkDirtyProperty('stockDiameter', fieldColorsList) ? selectedMaterialInfo?.stockDiameter : stockOuterDiameter;
      }
      materialInfo.stockDiameter = stockOuterDiameter;
    }

    //cutting Loss
    // if (materialInfo.processId === PrimaryProcessType.ColdForgingClosedDieHot) {
    //   materialInfo.cuttingLoss = this.shareService.isValidNumber((3.142 * this.isValidNumber(Number(Math.pow(Number(stockOuterDiameter / 2), 2) * 1)) * Number(materialInfo.density)) / 1000);
    // } else {
    materialInfo.cuttingLoss = this.shareService.isValidNumber((3.142 * this.isValidNumber(Number(Math.pow(Number(stockOuterDiameter / 2), 2) * 1)) * Number(materialInfo.density)) / 1000);
    // }
    //Coil end loss (gm)
    //Need to check
    if (materialInfo.isUnbendPartWeightDirty && materialInfo.unbendPartWeight != null) {
      materialInfo.unbendPartWeight = this.shareService.isValidNumber(materialInfo.unbendPartWeight);
    } else {
      let unbendPartWeight = 0;
      if (materialInfo.processId === PrimaryProcessType.ColdForgingClosedDieHot) {
        unbendPartWeight = this.shareService.isValidNumber(((Math.pow(Number(materialInfo.density), 2) * 3.142) / 4) * 2000 * this.shareService.isValidNumber(stockOuterDiameter / 1000));
      } else {
        unbendPartWeight = this.shareService.isValidNumber(((Math.pow(Number(materialInfo.density), 2) * 3.142) / 4) * 1000 * this.shareService.isValidNumber(stockOuterDiameter / 1000));
      }
      if (materialInfo?.unbendPartWeight != null) {
        materialInfo.unbendPartWeight = this.checkDirtyProperty('unbendPartWeight', fieldColorsList) ? selectedMaterialInfo?.unbendPartWeight : materialInfo.unbendPartWeight;
      }
      materialInfo.unbendPartWeight = unbendPartWeight;
    }

    //Coil Weight(in Tonne) cold forging
    if (materialInfo.isVolumePurchasedDirty && materialInfo.volumePurchased != null) {
      materialInfo.volumePurchased = this.shareService.isValidNumber(materialInfo.volumePurchased);
    } else {
      const volumePurchased = 2;
      if (materialInfo?.volumePurchased != null) {
        materialInfo.volumePurchased = this.checkDirtyProperty('volumePurchased', fieldColorsList) ? selectedMaterialInfo?.volumePurchased : volumePurchased;
      }
    }

    //No of Parts Produced per Coil
    if (materialInfo.isPartsPerCoilDirty && materialInfo.partsPerCoil != null) {
      materialInfo.partsPerCoil = this.shareService.isValidNumber(materialInfo.partsPerCoil);
    } else {
      const partsPerCoil = this.shareService.isValidNumber(Math.round((materialInfo.volumePurchased * 1000000 - materialInfo.unbendPartWeight) / materialInfo.netWeight));

      if (materialInfo?.partsPerCoil != null) {
        materialInfo.partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterialInfo?.partsPerCoil : partsPerCoil;
      }
      materialInfo.partsPerCoil = partsPerCoil;
    }

    //Coil End loss Per part (gm)
    if (materialInfo.isWeldWeightWastageDirty && materialInfo.weldWeightWastage != null) {
      materialInfo.weldWeightWastage = this.shareService.isValidNumber(materialInfo.weldWeightWastage);
    } else {
      const endLoss = this.shareService.isValidNumber(materialInfo.unbendPartWeight / materialInfo.partsPerCoil);

      if (materialInfo?.weldWeightWastage != null) {
        materialInfo.weldWeightWastage = this.checkDirtyProperty('weldWeightWastage', fieldColorsList) ? selectedMaterialInfo?.weldWeightWastage : materialInfo.weldWeightWastage;
      }
      materialInfo.weldWeightWastage = endLoss;
    }

    let grossWeight = 0;
    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight != null) {
      grossWeight = Number(materialInfo.grossWeight);
    } else {
      grossWeight = this.isValidNumber(Number(materialInfo.weldWeightWastage) + Number(materialInfo.netWeight) + Number(materialInfo.cuttingLoss));
      if (materialInfo?.grossWeight != null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    let scrapWeight = 0;
    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight != null) {
      scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      scrapWeight = this.isValidNumber(Number(materialInfo.grossWeight) - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight != null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterialInfo?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }
    //Length of raw material
    if (materialInfo?.grossWeight != null) {
      materialInfo.sheetLength = this.shareService.isValidNumber((materialInfo.grossWeight * 1000) / materialInfo.density / (3.142 * Math.pow(Number(stockOuterDiameter / 2), 2)));
    }

    let totalCostOfRawMaterials = 0;
    if (materialInfo.isTotalCostOfRawMaterialsDirty && materialInfo.totalCostOfRawMaterials != null) {
      totalCostOfRawMaterials = Number(materialInfo.totalCostOfRawMaterials);
    } else {
      totalCostOfRawMaterials = this.isValidNumber(Number(materialInfo.grossWeight / 1000) * Number(materialInfo.materialPricePerKg));
      if (materialInfo?.totalCostOfRawMaterials != null) {
        totalCostOfRawMaterials = this.checkDirtyProperty('totalCostOfRawMaterials', fieldColorsList) ? selectedMaterialInfo?.totalCostOfRawMaterials : totalCostOfRawMaterials;
      }
      materialInfo.totalCostOfRawMaterials = totalCostOfRawMaterials;
    }

    let yeildUtilization = 0;
    if (materialInfo.yeildUtilization && materialInfo.yeildUtilization != null) {
      yeildUtilization = Number(materialInfo.yeildUtilization);
    } else {
      yeildUtilization = this.isValidNumber((Number(materialInfo.netWeight) / Number(materialInfo.grossWeight)) * 100);
      if (materialInfo?.yeildUtilization != null) {
        yeildUtilization = this.checkDirtyProperty('yeildUtilization', fieldColorsList) ? selectedMaterialInfo?.yeildUtilization : yeildUtilization;
      }
      materialInfo.yeildUtilization = yeildUtilization;
    }

    if (materialInfo.isScrapRecoveryDirty && materialInfo.scrapRecCost != null) {
      materialInfo.scrapRecCost = Number(materialInfo.scrapRecCost);
    } else {
      let scrapRecCost = this.shareService.isValidNumber(this.isValidNumber((Number(materialInfo.scrapWeight) / 1000) * Number(materialInfo.scrapPricePerKg)));
      if (materialInfo?.scrapRecCost != null) {
        scrapRecCost = this.checkDirtyProperty('scrapRecCost', fieldColorsList) ? selectedMaterialInfo?.scrapRecCost : scrapRecCost;
      }
      materialInfo.scrapRecCost = scrapRecCost;
    }

    materialInfo.netMatCost = this.isValidNumber(Number(materialInfo.totalCostOfRawMaterials) - Number(materialInfo.scrapRecCost));

    return materialInfo;
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
