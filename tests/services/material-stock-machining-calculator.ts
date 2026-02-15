
import { MaterialInfoDto, PartInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';
import { MaterialMachiningConfigService } from 'src/app/shared/config/material-machining-config';
import { IMaterialCalculationByCommodity } from './IMaterialCalculationByCommodity';
import { PrimaryProcessType } from 'src/app/modules/costing/costing.config';
import { MaterialInsulationJacketCalculatorService } from './material-insulation-jacket-calculator.service';


export class MaterialStockMachiningCalculatorService implements IMaterialCalculationByCommodity {
  currentPart: PartInfoDto;
  constructor(
    private shareService: SharedService,
    private machiningConfig: MaterialMachiningConfigService,
    private materialForgingService: MaterialInsulationJacketCalculatorService
  ) { }

  CalculateMaterialCost(processId: number, materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): MaterialInfoDto {
    switch (processId) {
      case PrimaryProcessType.ZincPlating:
      case PrimaryProcessType.ChromePlating:
      case PrimaryProcessType.NickelPlating:
      case PrimaryProcessType.CopperPlating:
      case PrimaryProcessType.R2RPlating:
      case PrimaryProcessType.TinPlating:
      case PrimaryProcessType.GoldPlating:
      case PrimaryProcessType.SilverPlating:
      case PrimaryProcessType.PowderCoating:
      case PrimaryProcessType.Painting:
        return this.materialForgingService.calculationsForPlating(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.Galvanization:
      case PrimaryProcessType.WetPainting:
      case PrimaryProcessType.SiliconCoatingAuto:
      case PrimaryProcessType.SiliconCoatingSemi:
        return this.materialForgingService.calculationsForCoating(materialInfo, fieldColorsList, selectedMaterial);

      default:
        return this.calculationsForMachining(materialInfo, fieldColorsList, selectedMaterial);
    }
  }
  setCurrentPart(part: PartInfoDto) {
    this.currentPart = part;
  }

  public calculationsForMachining(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
    if (materialInfo.isDensityDirty && !!materialInfo.density) {
      materialInfo.density = Number(materialInfo.density);
    } else {
      materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterialInfo?.density : materialInfo.density;
    }

    if (materialInfo.isMatPriceDirty && !!materialInfo.materialPricePerKg) {
      materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
    } else {
      materialInfo.materialPricePerKg = this.shareService.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterialInfo?.materialPricePerKg : materialInfo.materialPricePerKg;
    }

    if (materialInfo.isScrapPriceDirty && !!materialInfo.scrapPricePerKg) {
      materialInfo.scrapPricePerKg = Number(materialInfo.scrapPricePerKg);
    } else {
      let scrapPricePerKg = materialInfo.materialPricePerKg * 0.3; // 30% of material price
      if (materialInfo?.scrapPricePerKg) {
        scrapPricePerKg = this.shareService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedMaterialInfo?.scrapPricePerKg : materialInfo.scrapPricePerKg; // db value to stay if not null and not dirty
      }
      materialInfo.scrapPricePerKg = scrapPricePerKg;
    }

    if (materialInfo.isPartOuterDiameterDirty && !!materialInfo.partOuterDiameter) {
      materialInfo.partOuterDiameter = Number(materialInfo.partOuterDiameter);
    } else {
      materialInfo.partOuterDiameter = this.shareService.checkDirtyProperty('partOuterDiameter', fieldColorsList) ? selectedMaterialInfo?.partOuterDiameter : Number(materialInfo.partOuterDiameter);
    }

    if (materialInfo.isPartInnerDiameterDirty && !!materialInfo.partInnerDiameter) {
      materialInfo.partInnerDiameter = Number(materialInfo.partInnerDiameter);
    } else {
      materialInfo.partInnerDiameter = this.shareService.checkDirtyProperty('partInnerDiameter', fieldColorsList) ? selectedMaterialInfo?.partInnerDiameter : Number(materialInfo.partInnerDiameter);
    }

    if (materialInfo.isPartLengthDirty && !!materialInfo.partLength) {
      // length
      materialInfo.partLength = Number(materialInfo.partLength);
    } else {
      materialInfo.partLength = this.shareService.checkDirtyProperty('partLength', fieldColorsList) ? selectedMaterialInfo?.partLength : Number(this.shareService.extractedMaterialData?.DimX);
    }

    if (materialInfo.isMaxWallthickDirty && !!materialInfo.wallThickessMm) {
      // thickness(t)
      materialInfo.wallThickessMm = Number(materialInfo.wallThickessMm);
    } else {
      materialInfo.wallThickessMm = this.shareService.checkDirtyProperty('maxWallthick', fieldColorsList)
        ? selectedMaterialInfo?.wallThickessMm
        : Number(this.shareService.extractedMaterialData?.DimZ);
    }

    if (materialInfo.isPartWidthDirty && !!materialInfo.partWidth) {
      materialInfo.partWidth = Number(materialInfo.partWidth);
    } else {
      materialInfo.partWidth = this.shareService.checkDirtyProperty('partWidth', fieldColorsList) ? selectedMaterialInfo?.partWidth : Number(this.shareService.extractedMaterialData?.DimY);
    }

    if (materialInfo.isPartHeightDirty && !!materialInfo.partHeight) {
      materialInfo.partHeight = Number(materialInfo.partHeight);
    } else {
      materialInfo.partHeight = this.shareService.checkDirtyProperty('partHeight', fieldColorsList) ? selectedMaterialInfo?.partHeight : Number(this.shareService.extractedMaterialData?.DimZ);
    }

    if (materialInfo.isPartVolumeDirty && !!materialInfo.partVolume) {
      materialInfo.partVolume = Number(materialInfo.partVolume);
    } else {
      materialInfo.partVolume = this.shareService.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterialInfo?.partVolume : Number(materialInfo.partVolume);
      // let partVolume = 0;
      // if (materialInfo.machiningIsRod) { // round bar
      //   partVolume = (2.4 * Math.pow(10, 6)) / Number(materialInfo.density);
      // } else if (materialInfo.machiningIsTube) { // round tube
      //   partVolume = materialInfo?.partVolume;
      // } else if (materialInfo.machiningIsSquareBar || materialInfo.machiningIsRectangularBar) { // square/rectangle bar
      //   partVolume = Number(materialInfo.wallThickessMm) * Number(materialInfo.partWidth) * Number(materialInfo.partHeight);
      // } else if (materialInfo.machiningIsHexagonalBar) { // hexagonal bar
      //   partVolume = ((3 * Math.sqrt(3)) / 2) * Math.pow(Number(materialInfo.partHeight), 2) * Number(materialInfo.partLength) * 0.7;
      // }

      // if (!!materialInfo?.partVolume) {
      //   partVolume = this.shareService.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterialInfo?.partVolume : partVolume;
      // }
      // materialInfo.partVolume = partVolume;
    }

    if (materialInfo.isPartProjectedAreaDirty && !!materialInfo.partProjectedArea) {
      materialInfo.partProjectedArea = Number(materialInfo.partProjectedArea);
    } else {
      materialInfo.partProjectedArea = this.shareService.checkDirtyProperty('partProjectArea', fieldColorsList) ? selectedMaterialInfo?.partProjectedArea : Number(materialInfo.partProjectedArea);
    }

    if (materialInfo.isCoilLengthDirty && !!materialInfo.coilLength) {
      // Standard bar length / HSS Stock Length
      materialInfo.coilLength = Number(materialInfo.coilLength);
    } else {
      let coilLength = 6000;
      if (materialInfo?.coilLength) {
        coilLength = this.shareService.checkDirtyProperty('coilLength', fieldColorsList) ? selectedMaterialInfo?.coilLength : coilLength;
      }
      materialInfo.coilLength = coilLength;
    }

    const machineAllowanceList = this.machiningConfig.getMachiningAllowance();
    const partOuterDiameter = Number(materialInfo.partOuterDiameter);
    const partInnerDiameter = Number(materialInfo.partInnerDiameter);
    let stockLength = 0;
    if (materialInfo.machiningIsRod) {
      // round bar
      // const maxDiameter = partInnerDiameter > partOuterDiameter ? partInnerDiameter : partOuterDiameter; //TODO:extraction
      const machineAllowance = machineAllowanceList?.filter((x) => x.end >= partOuterDiameter)[0]?.machineAllowance;
      if (materialInfo.isStockDiameterDirty && !!materialInfo.stockDiameter) {
        materialInfo.stockDiameter = Number(materialInfo.stockDiameter);
      } else {
        let stockDiameter = this.shareService.isValidNumber(machineAllowance) + partOuterDiameter;
        if (materialInfo?.stockDiameter) {
          stockDiameter = this.shareService.checkDirtyProperty('stockDiameter', fieldColorsList) ? selectedMaterialInfo?.stockDiameter : stockDiameter;
        }
        materialInfo.stockDiameter = stockDiameter;
      }

      const lengthAllowance = machineAllowanceList?.filter((x) => x.end >= Number(materialInfo.stockDiameter))[0]?.lengthAllowance;
      stockLength = this.shareService.isValidNumber(lengthAllowance + Number(materialInfo?.partLength));

      // const roundBarSizeList = this.machiningConfig.getRoundBarSize();
      // let BarSize = roundBarSizeList?.filter(x => x.size > Number(materialInfo.stockDiameter));
      // let barDiameter = this.shareService.isValidNumber(BarSize[0]?.size);
    } else if (materialInfo.machiningIsTube) {
      // round tube
      const machineAllowance = machineAllowanceList?.filter((x) => x.end >= partOuterDiameter)[0]?.machineAllowance;
      if (materialInfo.isStockOuterDiameterDirty && !!materialInfo.stockOuterDiameter) {
        materialInfo.stockOuterDiameter = Number(materialInfo.stockOuterDiameter);
      } else {
        let stockOuterDiameter = this.shareService.isValidNumber(machineAllowance) + partOuterDiameter;
        if (materialInfo?.stockOuterDiameter) {
          stockOuterDiameter = this.shareService.checkDirtyProperty('stockOuterDiameter', fieldColorsList) ? selectedMaterialInfo?.stockOuterDiameter : stockOuterDiameter;
        }
        materialInfo.stockOuterDiameter = stockOuterDiameter;
      }

      if (materialInfo.isStockInnerDiameterDirty && !!materialInfo.stockInnerDiameter) {
        materialInfo.stockInnerDiameter = Number(materialInfo.stockInnerDiameter);
      } else {
        let stockInnerDiameter = partInnerDiameter - this.shareService.isValidNumber(machineAllowance);
        if (materialInfo?.stockInnerDiameter) {
          stockInnerDiameter = this.shareService.checkDirtyProperty('stockInnerDiameter', fieldColorsList) ? selectedMaterialInfo?.stockInnerDiameter : stockInnerDiameter;
        }
        materialInfo.stockInnerDiameter = stockInnerDiameter;
      }

      const lengthAllowance = machineAllowanceList?.filter((x) => x.end >= Number(materialInfo.stockOuterDiameter))[0]?.lengthAllowance;
      stockLength = this.shareService.isValidNumber(lengthAllowance + Number(materialInfo?.partLength));
    } else if (materialInfo.machiningIsSquareBar || materialInfo.machiningIsRectangularBar) {
      // square/rectangle bar
      const lengthAllowance = machineAllowanceList?.filter((x) => x.end >= Number(materialInfo.wallThickessMm))[0]?.lengthAllowance;
      stockLength = this.shareService.isValidNumber(lengthAllowance + Number(materialInfo?.partLength));

      if (materialInfo.isStockCrossSectionWidthDirty && !!materialInfo.stockCrossSectionWidth) {
        materialInfo.stockCrossSectionWidth = Number(materialInfo.stockCrossSectionWidth);
      } else {
        materialInfo.stockCrossSectionWidth = this.shareService.checkDirtyProperty('stockCrossSectionWidth', fieldColorsList)
          ? selectedMaterialInfo?.stockCrossSectionWidth
          : materialInfo.stockCrossSectionWidth;
      }

      if (materialInfo.isStockCrossSectionHeightDirty && !!materialInfo.stockCrossSectionHeight) {
        materialInfo.stockCrossSectionHeight = Number(materialInfo.stockCrossSectionHeight);
      } else {
        materialInfo.stockCrossSectionHeight = this.shareService.checkDirtyProperty('stockCrossSectionHeight', fieldColorsList)
          ? selectedMaterialInfo?.stockCrossSectionHeight
          : materialInfo.stockCrossSectionHeight;
      }
    } else if (materialInfo.machiningIsHexagonalBar) {
      const lengthAllowance = machineAllowanceList?.filter((x) => x.end >= Number(materialInfo.partWidth))[0]?.lengthAllowance;
      stockLength = this.shareService.isValidNumber(lengthAllowance + Number(materialInfo?.partLength));
    } else {
      stockLength = Number(materialInfo.stockLength);
    }

    if (materialInfo.machiningIsHexagonalBar || materialInfo.machiningIsIBeam || materialInfo.machiningIsChannel) {
      if (materialInfo.isStockHexSideDimensionDirty && !!materialInfo.stockHexSideDimension) {
        materialInfo.stockHexSideDimension = Number(materialInfo.stockHexSideDimension);
      } else {
        materialInfo.stockHexSideDimension = this.shareService.checkDirtyProperty('stockHexSideDimension', fieldColorsList)
          ? selectedMaterialInfo?.stockHexSideDimension
          : Number(materialInfo.stockHexSideDimension);
      }
    }

    // materialInfo.stockLength = (!!materialInfo.stockLength) ? Number(materialInfo.stockLength) : stockLength;
    if (materialInfo.isStockLengthDirty && !!materialInfo.stockLength) {
      materialInfo.stockLength = Number(materialInfo.stockLength);
    } else {
      if (materialInfo?.stockLength) {
        stockLength = this.shareService.checkDirtyProperty('stockLength', fieldColorsList) ? selectedMaterialInfo?.stockLength : stockLength;
      }
      materialInfo.stockLength = stockLength;
    }

    if (materialInfo.machiningIsHss) {
      const allowanceParam = Math.round(Number(materialInfo.partWidth) > Number(materialInfo.partHeight) ? materialInfo.partWidth : materialInfo.partHeight);
      if (materialInfo.isCuttingAllowanceDirty && !!materialInfo.cuttingAllowance) {
        // Part cutting allowance
        materialInfo.cuttingAllowance = Number(materialInfo.cuttingAllowance);
      } else {
        let cuttingAllowance = machineAllowanceList?.filter((x) => x.end >= allowanceParam)[0]?.machineAllowance || 2;
        if (materialInfo?.cuttingAllowance) {
          cuttingAllowance = this.shareService.checkDirtyProperty('cuttingAllowance', fieldColorsList) ? selectedMaterialInfo?.cuttingAllowance : cuttingAllowance;
        }
        materialInfo.cuttingAllowance = cuttingAllowance;
      }

      if (materialInfo.isCoilWeightDirty && !!materialInfo.coilWeight) {
        // HSS weight
        materialInfo.coilWeight = Number(materialInfo.coilWeight);
      } else {
        let coilWeight =
          (Number(materialInfo.coilLength) *
            (Number(materialInfo.partWidth) * Number(materialInfo.partHeight) -
              (Number(materialInfo.partWidth) - 2 * Number(materialInfo.wallThickessMm)) * (Number(materialInfo.partHeight) - 2 * Number(materialInfo.wallThickessMm))) *
            Number(materialInfo.density)) /
          1000;
        if (materialInfo?.coilWeight) {
          coilWeight = this.shareService.checkDirtyProperty('coilWeight', fieldColorsList) ? selectedMaterialInfo?.coilWeight : coilWeight;
        }
        materialInfo.coilWeight = coilWeight;
      }
    }

    let partsPerCoil = materialInfo.partsPerCoil;
    if (materialInfo.machiningIsHss) {
      partsPerCoil = Math.floor(Number(materialInfo.coilLength) / (Number(materialInfo.stockLength) + Number(materialInfo.cuttingAllowance)));
      // } else if (materialInfo.machiningIsSquareBar || materialInfo.machiningIsRectangularBar) {
      //   partsPerCoil = Math.floor(Number(materialInfo.stockLength) / Number(materialInfo.partHeight));
    } else if (materialInfo.machiningIsRod || materialInfo.machiningIsTube || materialInfo.machiningIsSquareBar || materialInfo.machiningIsRectangularBar || materialInfo.machiningIsHexagonalBar) {
      partsPerCoil = Math.floor(Number(materialInfo.coilLength) / Number(materialInfo.stockLength));
    }

    if (materialInfo.isPartsPerCoilDirty && !!materialInfo.partsPerCoil) {
      // No. of parts/stocks
      materialInfo.partsPerCoil = Number(materialInfo.partsPerCoil);
    } else {
      if (materialInfo?.partsPerCoil) {
        partsPerCoil = this.shareService.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterialInfo?.partsPerCoil : partsPerCoil;
      }
      materialInfo.partsPerCoil = partsPerCoil;
    }

    if (materialInfo.isEnterStartEndScrapLengthDirty && !!materialInfo.enterStartEndScrapLength) {
      materialInfo.enterStartEndScrapLength = Number(materialInfo.enterStartEndScrapLength);
    } else {
      const enterStartEndScrapLength =
        materialInfo.machiningIsRod || materialInfo.machiningIsTube || materialInfo.machiningIsSquareBar || materialInfo.machiningIsRectangularBar || materialInfo.machiningIsHexagonalBar
          ? (Number(materialInfo.coilLength) - Number(materialInfo.stockLength) * Number(materialInfo.partsPerCoil)) / Number(materialInfo.partsPerCoil)
          : materialInfo.enterStartEndScrapLength;
      if (materialInfo?.enterStartEndScrapLength) {
        materialInfo.enterStartEndScrapLength = this.shareService.checkDirtyProperty('enterStartEndScrapLength', fieldColorsList)
          ? selectedMaterialInfo?.enterStartEndScrapLength
          : Number(materialInfo.enterStartEndScrapLength);
      }
      materialInfo.enterStartEndScrapLength = enterStartEndScrapLength;
    }

    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      let netWeight = (Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000;
      if (materialInfo?.netWeight) {
        netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    if (materialInfo.isutilisationDirty && !!materialInfo.utilisation) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = materialInfo.machiningIsHss
        ? this.shareService.isValidNumber(((Number(materialInfo.partsPerCoil) * Number(materialInfo.netWeight)) / Number(materialInfo.coilWeight)) * 100)
        : this.shareService.isValidNumber((Number(materialInfo.netWeight) / Number(materialInfo.grossWeight)) * 100);
      if (materialInfo.utilisation) {
        utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterialInfo?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    // materialInfo.grossWeight = this.shareService.isValidNumber(((3.14 * (Math.pow(Number(barDiameter / 2), 2)) * Number(materialInfo.stockLength) * Number(materialInfo.density)) / (Math.pow(10, 6))) * 1000);
    let grossVolume = 0;
    if (materialInfo.machiningIsRod) {
      // round bar
      grossVolume = Math.PI * Math.pow(Number(materialInfo.stockDiameter) / 2, 2) * (Number(materialInfo.stockLength) + Number(materialInfo.enterStartEndScrapLength));
    } else if (materialInfo.machiningIsTube) {
      // round tube
      grossVolume =
        Math.PI * (Math.pow(Number(materialInfo.stockOuterDiameter) / 2, 2) * (Number(materialInfo.stockLength) + Number(materialInfo.enterStartEndScrapLength))) -
        Math.PI * Math.pow(Number(materialInfo.stockInnerDiameter) / 2, 2) * (Number(materialInfo.stockLength) + Number(materialInfo.enterStartEndScrapLength));
    } else if (materialInfo.machiningIsSquareBar || materialInfo.machiningIsRectangularBar) {
      // square/rectangle bar
      grossVolume = Number(materialInfo.stockCrossSectionHeight) * Number(materialInfo.stockCrossSectionWidth) * (Number(materialInfo.stockLength) + Number(materialInfo.enterStartEndScrapLength));
    } else if (materialInfo.machiningIsHexagonalBar) {
      // hexagonal bar
      grossVolume = ((3 * Math.sqrt(3)) / 2) * Math.pow(Number(materialInfo.partHeight), 2) * (Number(materialInfo.partLength) + Number(materialInfo.enterStartEndScrapLength));
    } else if (materialInfo.machiningIsLAngle) {
      grossVolume =
        Number(materialInfo.stockLength) * Number(materialInfo.wallThickessMm) * Number(materialInfo.partHeight) +
        (Number(materialInfo.partWidth) - Number(materialInfo.wallThickessMm)) * Number(materialInfo.wallThickessMm) * Number(materialInfo.stockLength);
    } else if (materialInfo.machiningIsIBeam || materialInfo.machiningIsChannel || materialInfo.machiningIsWBeams) {
      grossVolume =
        2 * (Number(materialInfo.partWidth) * Number(materialInfo.wallThickessMm) * Number(materialInfo.stockLength)) +
        (Number(materialInfo.partHeight) - 2 * Number(materialInfo.wallThickessMm)) * Number(materialInfo.stockHexSideDimension) * Number(materialInfo.stockLength);
    } else if (materialInfo.machiningIsHss) {
      // grossVolume = (Number(materialInfo.partWidth) * Number(materialInfo.partHeight) * Number(materialInfo.stockLength)) -
      //   ((Number(materialInfo.partWidth) - (2 * Number(materialInfo.wallThickessMm))) * (Number(materialInfo.partHeight) - (2 * Number(materialInfo.wallThickessMm))) * Number(materialInfo.stockLength));
      grossVolume = Number(materialInfo.partVolume) / (Number(materialInfo.utilisation) / 100);
    }

    materialInfo.grossWeight = materialInfo.machiningIsHss
      ? this.shareService.isValidNumber(Number(materialInfo.netWeight) / (Number(materialInfo.utilisation) / 100))
      : this.shareService.isValidNumber((grossVolume * Number(materialInfo.density)) / Math.pow(10, 3));

    if (materialInfo.isScrapWeightDirty && !!materialInfo.scrapWeight) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = Number(materialInfo.grossWeight) - Number(materialInfo.netWeight);
      if (materialInfo?.scrapWeight) {
        scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterialInfo?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    materialInfo.materialCostPart = (Number(materialInfo.grossWeight) / 1000) * Number(materialInfo.materialPricePerKg);
    // materialInfo.scrapRecCost = (Number(scrapWeight) * (Number(materialInfo.scrapRecovery) / 100)) * Number(materialInfo.scrapPricePerKg) / 1000;
    materialInfo.scrapRecCost = ((Number(materialInfo.grossWeight) - Number(materialInfo.netWeight)) / 1000) * (Number(materialInfo.scrapRecovery) / 100) * Number(materialInfo.scrapPricePerKg);
    materialInfo.netMatCost = Number(materialInfo.materialCostPart) - Number(materialInfo.scrapRecCost);

    // materialInfo.volumeDiscountPer = this.materialCalculatorService.getVolumeDiscount(materialInfo); // commenting now to test new logic, will removed later
    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }

    if (materialInfo?.isEsgImpactCO2KgDirty && !!materialInfo.esgImpactCO2Kg) {
      materialInfo.esgImpactCO2Kg = Number(materialInfo?.esgImpactCO2Kg);
    } else {
      materialInfo.esgImpactCO2Kg = this.shareService.checkDirtyProperty('esgImpactCO2Kg', fieldColorsList)
        ? selectedMaterialInfo?.esgImpactCO2Kg
        : this.shareService.isValidNumber(Number(materialInfo.esgImpactCO2Kg));
    }
    materialInfo.totalEsgImpactCO2Kg = this.shareService.isValidNumber((Number(materialInfo.esgImpactCO2Kg) * Number(materialInfo.netWeight)) / 1000);

    return materialInfo;
  }
}
