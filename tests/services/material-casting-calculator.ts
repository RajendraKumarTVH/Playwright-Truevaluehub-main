import { SharedService } from './shared';
import { MaterialInfoDto, PartInfoDto } from 'src/app/shared/models';
import { PrimaryProcessType, SubProcessType } from '../utils/constants';
import { MaterialCastingConfigService } from './material-casting-config';
import { CastingConfigService } from './casting-config';
import { MaterialCastingMappingService } from './material-casting-mapping';
import { IMaterialCalculationByCommodity } from './IMaterialCalculationByCommodity';
import { MaterialInsulationJacketCalculatorService } from './material-insulation-jacket-calculator.service';

export class MaterialCastingCalculatorService implements IMaterialCalculationByCommodity {
  currentPart?: PartInfoDto;
  ss?: SubProcessType;
  constructor(
    private shareService: SharedService,
    private castingConfigService: CastingConfigService,
    private materialCastingConfigService: MaterialCastingConfigService,
    private materialCastingMapper: MaterialCastingMappingService,
    private materialForgingService: MaterialInsulationJacketCalculatorService
  ) { }

  CalculateMaterialCost(processId: number, materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): MaterialInfoDto {
    switch (processId) {
      case PrimaryProcessType.HPDCCasting:
        const result = this.calculationsForPouringCasting(materialInfo, fieldColorsList, selectedMaterial, this.currentPart!);
        return result;
      case PrimaryProcessType.NoBakeCasting:
      case PrimaryProcessType.InvestmentCasting:
      case PrimaryProcessType.GreenCastingAuto:
      case PrimaryProcessType.GreenCastingSemiAuto:
      case PrimaryProcessType.GDCCasting:
      case PrimaryProcessType.LPDCCasting:
        switch (materialInfo.secondaryProcessId) {
          case SubProcessType.MetalForPouring:
            return this.calculationsForPouringCasting(materialInfo, fieldColorsList, selectedMaterial, this.currentPart!);
          case SubProcessType.SandForCore:
            return this.calculationsForSandForCoreCasting(materialInfo, fieldColorsList, selectedMaterial);
          case SubProcessType.SandForMold:
            return this.calculationsForSandForMoldCasting(materialInfo, fieldColorsList, selectedMaterial);
          case SubProcessType.PatternWax:
            return this.calculationsForPatternWaxCasting(materialInfo, fieldColorsList, selectedMaterial);
          case SubProcessType.SlurryCost:
            return this.calculationsForSlurryCostCasting(materialInfo, fieldColorsList, selectedMaterial);
          case SubProcessType.ZirconSand:
            return this.calculationsForZirconSandCasting(materialInfo, fieldColorsList, selectedMaterial);
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
            const platingResult = this.materialForgingService.calculationsForPlating(materialInfo, fieldColorsList, selectedMaterial);
            return platingResult;
          case PrimaryProcessType.Galvanization:
          case PrimaryProcessType.WetPainting:
          case PrimaryProcessType.SiliconCoatingAuto:
          case PrimaryProcessType.SiliconCoatingSemi:
            return this.materialForgingService.calculationsForCoating(materialInfo, fieldColorsList, selectedMaterial);
          default:
            return materialInfo;
        }

      default:
        return materialInfo;
    }
  }

  setCurrentPart(part: PartInfoDto) {
    this.currentPart = part;
  }

  public calculationsForPouringCasting(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto, currentPart: PartInfoDto): MaterialInfoDto {
    if (materialInfo.isDensityDirty && !!materialInfo.density) {
      materialInfo.density = Number(materialInfo.density);
    } else {
      materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterialInfo?.density : materialInfo.density;
    }

    if (materialInfo?.isScrapRecoveryDirty && !!materialInfo.scrapRecovery) {
      // Scrap Revovery rate %
      materialInfo.scrapRecovery = Number(materialInfo.scrapRecovery);
    } else {
      materialInfo.scrapRecovery = this.shareService.checkDirtyProperty('scrapRecovery', fieldColorsList) ? selectedMaterialInfo?.scrapRecovery : 85;
    }

    if (materialInfo.isMatPriceDirty && !!materialInfo.materialPricePerKg) {
      // Material price ($/Kg) || Mold Sand price($/Kg) :
      materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
    } else {
      materialInfo.materialPricePerKg = this.shareService.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterialInfo?.materialPricePerKg : materialInfo.materialPricePerKg;
    }
    const matDiscountedPricePerKg = materialInfo.materialPricePerKg * (1 - Number(materialInfo.volumeDiscountPer) / 100);

    if (materialInfo.isScrapPriceDirty && !!materialInfo.scrapPricePerKg) {
      materialInfo.scrapPricePerKg = Number(materialInfo.scrapPricePerKg);
    } else {
      const scrapPricePerKg = this.shareService.isValidNumber(Number(materialInfo.materialPricePerKg) * 0.3);
      if (materialInfo?.scrapPricePerKg) {
        materialInfo.scrapPricePerKg = this.shareService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedMaterialInfo?.scrapPricePerKg : materialInfo.scrapPricePerKg;
      } else {
        materialInfo.scrapPricePerKg = scrapPricePerKg;
      }
    }

    if (materialInfo.isPartVolumeDirty && !!materialInfo.partVolume) {
      materialInfo.partVolume = Number(materialInfo.partVolume);
    } else {

      materialInfo.partVolume = this.shareService.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterialInfo?.partVolume : materialInfo.partVolume;

    }

    if (materialInfo.isPartSurfaceAreaDirty && !!materialInfo.partSurfaceArea) {

      materialInfo.partSurfaceArea = Number(materialInfo.partSurfaceArea);
    } else {
      materialInfo.partSurfaceArea = this.shareService.checkDirtyProperty('partSurfaceArea', fieldColorsList) ? selectedMaterialInfo?.partSurfaceArea : materialInfo.partSurfaceArea;

    }

    if (materialInfo.isPartProjectedAreaDirty && !!materialInfo.partProjectedArea) {
      // projected area
      materialInfo.partProjectedArea = Number(materialInfo.partProjectedArea);
    } else {
      // const area =
      //   Number(materialInfo.processId) === PrimaryProcessType.HPDCCasting
      //     ? this.shareService.isValidNumber(Number(materialInfo.dimX) * Number(materialInfo.dimY))
      //     : this.shareService.isValidNumber(Number(materialInfo.partVolume) / Number(materialInfo.dimZ));
      // if (materialInfo?.partProjectedArea) {
      materialInfo.partProjectedArea = this.shareService.checkDirtyProperty('partProjectArea', fieldColorsList) ? selectedMaterialInfo?.partProjectedArea : materialInfo.partProjectedArea;
      // } else {
      //   materialInfo.partProjectedArea = materialInfo.partProjectedArea;
      // }
    }

    // let netWeight = this.shareService.isValidNumber(Number(materialInfo.dimX) * Number(materialInfo.dimY) * Number(materialInfo.dimZ) * Number(materialInfo.density) * (Math.pow(10, -3)));
    let netWeight =
      Number(materialInfo.processId) === PrimaryProcessType.HPDCCasting
        ? this.shareService.isValidNumber(Number(materialInfo.partVolume) * Number(materialInfo.density) * Math.pow(10, -3))
        : this.shareService.isValidNumber(Number(materialInfo.partVolume) * Number(materialInfo.density) * Math.pow(10, -6));

    if (materialInfo.isMoldSandWeightDirty && !!materialInfo.moldSandWeight) {
      // Net finish weight (Kg) (old)
      // Part Net Weight (new):
      materialInfo.moldSandWeight = Number(materialInfo.moldSandWeight);
    } else {
      materialInfo.moldSandWeight = this.shareService.checkDirtyProperty('moldSandWeight', fieldColorsList) ? selectedMaterialInfo?.moldSandWeight : materialInfo.moldSandWeight || netWeight;
    }

    if (materialInfo.isNetweightPercentageDirty && !!materialInfo.netWeightPercentage) {
      // Net weight % || Machining Stock (%)
      materialInfo.netWeightPercentage = Number(materialInfo.netWeightPercentage);
    } else {
      const netWeightPercentage = [PrimaryProcessType.LPDCCasting, PrimaryProcessType.HPDCCasting].includes(Number(materialInfo.processId)) ? 3 : this.materialCastingMapper.defaultNetWeightPercentage;
      materialInfo.netWeightPercentage =
        (this.shareService.checkDirtyProperty('netWeightPercentage', fieldColorsList) ? selectedMaterialInfo?.netWeightPercentage : materialInfo.netWeightPercentage) || netWeightPercentage;
    }

    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      // Part Casting weight (Kg):
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      if ([PrimaryProcessType.InvestmentCasting].includes(Number(materialInfo.processId))) {
        netWeight = this.shareService.isValidNumber(Number(materialInfo.moldSandWeight) * 1.03);
      } else if ([PrimaryProcessType.GDCCasting, PrimaryProcessType.HPDCCasting, PrimaryProcessType.LPDCCasting].includes(Number(materialInfo.processId))) {
        netWeight = this.shareService.isValidNumber(Number(materialInfo.moldSandWeight) * (materialInfo.netWeightPercentage / 100) + Number(materialInfo.moldSandWeight));
      } else if ([PrimaryProcessType.NoBakeCasting, PrimaryProcessType.GreenCastingAuto, PrimaryProcessType.GreenCastingSemiAuto].includes(Number(materialInfo.processId))) {
        const moldDraftAllowance = Number(materialInfo.moldSandWeight) * 0.03;
        netWeight = this.shareService.isValidNumber(Number(materialInfo.moldSandWeight) * (materialInfo.netWeightPercentage / 100) + moldDraftAllowance + Number(materialInfo.moldSandWeight));
      }
      if (materialInfo?.netWeight) {
        materialInfo.netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      } else {
        materialInfo.netWeight = netWeight;
      }
    }

    // const matMold = materialInfo?.materialInfoList.filter((rec) => rec.secondaryProcessId === 3)[0];
    if (materialInfo.isNoOfCavitiesDirty && !!materialInfo.noOfCavities) {
      // No of cavity
      materialInfo.noOfCavities = Number(materialInfo.noOfCavities);
    } else {
      const cavities = PrimaryProcessType.GreenCastingAuto === Number(materialInfo.processId) ? 2 : 1;
      // let cavities = this.materialCastingConfigService.cavityCalculation(Number(materialInfo.processId), (matMold?.moldBoxLength || 0), (matMold?.moldBoxWidth || 0), Number(materialInfo.dimX), Number(materialInfo.dimY));
      if (materialInfo?.noOfCavities) {
        materialInfo.noOfCavities = this.shareService.checkDirtyProperty('noOfCavities', fieldColorsList) ? selectedMaterialInfo?.noOfCavities : cavities;
      } else {
        materialInfo.noOfCavities = cavities;
      }
    }

    if (materialInfo.isRunnerRiserPercentageDirty && !!materialInfo.runnerRiserPercentage) {
      // Runner, Riser, Spru and overflow (%):
      materialInfo.runnerRiserPercentage = Number(materialInfo.runnerRiserPercentage);
    } else {
      const runnerRiserPercentage = [PrimaryProcessType.HPDCCasting, PrimaryProcessType.GDCCasting, PrimaryProcessType.LPDCCasting].includes(materialInfo.processId!)
        ? this.materialCastingConfigService.getRunnerRaiserPercentageByThickness(materialInfo.partTickness!, (currentPart?.partComplexity ?? PartComplexity.Low), materialInfo.processId!)
        : this.materialCastingConfigService.getRunnerRaiserPercentageByWeight(materialInfo.materialFamily!, materialInfo.netWeight!, (currentPart?.partComplexity ?? PartComplexity.Low)) ||
        this.materialCastingMapper.defaultRunnerRiserPercentage;
      if (materialInfo?.runnerRiserPercentage) {
        materialInfo.runnerRiserPercentage = this.shareService.checkDirtyProperty('runnerRiserPercentage', fieldColorsList) ? selectedMaterialInfo?.runnerRiserPercentage : runnerRiserPercentage;
      } else {
        materialInfo.runnerRiserPercentage = runnerRiserPercentage;
      }
    }

    if (materialInfo.isOxidationLossWeightPercentageDirty && !!materialInfo.oxidationLossWeightPercentage) {
      // Irretrieval loss: (Melting loss) (%):
      materialInfo.oxidationLossWeightPercentage = Number(materialInfo.oxidationLossWeightPercentage);
    } else {
      const oxidationLossWeightPercentage =
        this.materialCastingConfigService.getIrretrivalLossPercentage(materialInfo.materialFamily!) || this.materialCastingMapper.defaultOxidationLossWeightPercentage;
      if (materialInfo?.oxidationLossWeightPercentage) {
        materialInfo.oxidationLossWeightPercentage = this.shareService.checkDirtyProperty('oxidationLossWeightPercentage', fieldColorsList)
          ? selectedMaterialInfo?.oxidationLossWeightPercentage
          : oxidationLossWeightPercentage;
      } else {
        materialInfo.oxidationLossWeightPercentage = oxidationLossWeightPercentage;
      }
    }
    // }

    if (materialInfo.isSandRecoveryPercentageDirty && !!materialInfo.sandRecoveryPercentage) {
      // Overflow and Spillage loss (%)
      materialInfo.sandRecoveryPercentage = Number(materialInfo.sandRecoveryPercentage);
    } else {
      const sandRecoveryPercentage = this.materialCastingMapper.defaultSandRecoveryPercentage;
      // [PrimaryProcessType.LPDCCasting, PrimaryProcessType.HPDCCasting].includes(Number(materialInfo.processId))
      //   ? 60
      //   : this.materialCastingMapper.defaultSandRecoveryPercentage;
      materialInfo.sandRecoveryPercentage =
        (this.shareService.checkDirtyProperty('sandRecoveryPercentage', fieldColorsList) ? selectedMaterialInfo?.sandRecoveryPercentage : materialInfo.sandRecoveryPercentage) ||
        sandRecoveryPercentage;
    }

    if (materialInfo.isRunnerRiserDirty && !!materialInfo.runnerRiser) {
      // Runner, Riser, Spru and overflow (kg):
      materialInfo.runnerRiser = Number(materialInfo.runnerRiser);
    } else {
      const runnerRiser =
        materialInfo.processId === PrimaryProcessType.InvestmentCasting
          ? // ? this.materialCastingConfigService.sprueGateWeightCalculation(Number(materialInfo.density)).totMetalWeightkg / this.castingConfigService.castingConstants.finalCavitiesPerTree
          this.shareService.isValidNumber(this.materialCastingConfigService.sprueGateWeightCalculation(Number(materialInfo.density ?? 0)).totMetalWeightkg / (materialInfo.noOfCavities || 1))
          : this.shareService.isValidNumber(Number(materialInfo.netWeight ?? 0) * (Number(materialInfo.runnerRiserPercentage ?? 0) / 100));
      if (materialInfo?.runnerRiser) {
        materialInfo.runnerRiser = this.shareService.checkDirtyProperty('runnerRiser', fieldColorsList) ? selectedMaterialInfo?.runnerRiser : runnerRiser;
      } else {
        materialInfo.runnerRiser = runnerRiser;
      }
    }

    if (materialInfo.isOxidationLossWeightDirty && !!materialInfo.oxidationLossWeight) {
      // Irretrieval loss: (Oxidation, Scaling & Spilage loss weight (kg)):
      materialInfo.oxidationLossWeight = Number(materialInfo.oxidationLossWeight);
    } else {
      const oxidationLossWeight = this.shareService.isValidNumber((Number(materialInfo.netWeight) + Number(materialInfo.runnerRiser)) * (Number(materialInfo.oxidationLossWeightPercentage) / 100));
      if (materialInfo?.oxidationLossWeight) {
        materialInfo.oxidationLossWeight = this.shareService.checkDirtyProperty('oxidationLossWeight', fieldColorsList) ? selectedMaterialInfo?.oxidationLossWeight : oxidationLossWeight;
      } else {
        materialInfo.oxidationLossWeight = oxidationLossWeight;
      }
    }

    if (materialInfo.isSandRecoveryDirty && !!materialInfo.sandRecovery) {
      // Recovery Loss -Runner, Riser, Spru and overflow  (kg)(old):
      // Overflow and Spillage loss weight (kg)(new):
      materialInfo.sandRecovery = Number(materialInfo.sandRecovery);
    } else {
      let sandRecovery = this.shareService.isValidNumber(materialInfo.runnerRiser * (Number(materialInfo.sandRecoveryPercentage) / 100));
      if (materialInfo.sandRecovery) {
        sandRecovery = this.shareService.checkDirtyProperty('sandRecovery', fieldColorsList) ? selectedMaterialInfo?.sandRecovery ?? 0 : sandRecovery;
      }
      materialInfo.sandRecovery = sandRecovery;
    }

    if (materialInfo.isPouringWeightDirty && !!materialInfo.pouringWeight) {
      // Melting shot weight Per Part (Kg):
      materialInfo.pouringWeight = Number(materialInfo.pouringWeight);
    } else {
      const pouringWeight = this.shareService.isValidNumber(
        Number(materialInfo.netWeight) + Number(materialInfo.runnerRiser) + Number(materialInfo.sandRecovery) + Number(materialInfo.oxidationLossWeight)
      );
      if (materialInfo?.pouringWeight) {
        materialInfo.pouringWeight = this.shareService.checkDirtyProperty('pouringWeight', fieldColorsList) ? selectedMaterialInfo?.pouringWeight : pouringWeight;
      } else {
        materialInfo.pouringWeight = pouringWeight;
      }
    }

    if (materialInfo.isTotalPouringWeightDirty && !!materialInfo.totalPouringWeight) {
      // Total Melting shot Weight Per Mold (Kg):
      materialInfo.totalPouringWeight = Number(materialInfo.totalPouringWeight);
    } else {
      const totalPouringWeight = this.shareService.isValidNumber(Number(materialInfo.pouringWeight) * Number(materialInfo.noOfCavities));
      if (materialInfo?.totalPouringWeight) {
        materialInfo.totalPouringWeight = this.shareService.checkDirtyProperty('totalPouringWeight', fieldColorsList) ? selectedMaterialInfo?.totalPouringWeight : totalPouringWeight;
      } else {
        materialInfo.totalPouringWeight = totalPouringWeight;
      }
    }

    if (materialInfo.isScrapWeightDirty && !!materialInfo.scrapWeight) {
      // Machining Scrap weight per part(Kg) :
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      const scrapWeight = this.shareService.isValidNumber(Number(materialInfo.netWeight) - Number(materialInfo.moldSandWeight));
      if (materialInfo?.scrapWeight) {
        materialInfo.scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterialInfo?.scrapWeight : scrapWeight;
      } else {
        materialInfo.scrapWeight = scrapWeight;
      }
    }

    let grossWeight = 0;
    if (materialInfo.isGrossWeightDirty && !!materialInfo.grossWeight) {
      grossWeight = Number(materialInfo.grossWeight);
    } else {
      grossWeight = Number(materialInfo.netWeight) + Number(materialInfo.oxidationLossWeight) + Number(materialInfo.sandRecovery); // Gross Material Weight (kg) :
      if (materialInfo?.grossWeight) {
        grossWeight = this.shareService.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : Number(grossWeight);
      }
    }
    materialInfo.grossWeight = grossWeight;

    if (Number(materialInfo.processId) === PrimaryProcessType.HPDCCasting) {
      // grams
      materialInfo.materialCostPart = this.shareService.isValidNumber((Number(materialInfo.grossWeight) / 1000) * matDiscountedPricePerKg); // Gross Material cost/part ($) :
      materialInfo.scrapRecCost = this.shareService.isValidNumber((Number(materialInfo.scrapWeight) / 1000) * (Number(materialInfo.scrapRecovery) / 100) * Number(materialInfo.scrapPricePerKg)); // Scrap Recovery Cost ($) :
    } else {
      // kgs
      materialInfo.materialCostPart = this.shareService.isValidNumber(materialInfo.grossWeight * matDiscountedPricePerKg); // Gross Material cost/part ($) :
      materialInfo.scrapRecCost = this.shareService.isValidNumber(Number(materialInfo.scrapWeight) * (Number(materialInfo.scrapRecovery) / 100) * Number(materialInfo.scrapPricePerKg)); // Scrap Recovery Cost ($) :
    }
    materialInfo.netMatCost = this.shareService.isValidNumber(Number(materialInfo.materialCostPart) - Number(materialInfo.scrapRecCost)); // Net Material cost ($) :

    return materialInfo;
  }

  public calculationsForSandForCoreCasting(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
    if (materialInfo.isDensityDirty && !!materialInfo.density) {
      materialInfo.density = Number(materialInfo.density);
    } else {
      materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterialInfo?.density : materialInfo.density;
    }
    if (materialInfo.isMatPriceDirty && !!materialInfo.materialPricePerKg) {
      // Material price ($/Kg) :
      materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
    } else {
      materialInfo.materialPricePerKg = this.shareService.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterialInfo?.materialPricePerKg : materialInfo.materialPricePerKg;
    }
    const matDiscountedPricePerKg = materialInfo.materialPricePerKg * (1 - Number(materialInfo.volumeDiscountPer) / 100);

    let coreWeightCalcualtion = 0;
    let coreVolumeCalcualtion = 0;
    materialInfo.coreCostDetails.forEach((coreDetail) => {
      coreDetail.coreCostDetailsId = coreDetail.coreCostDetailsId || 0;
      coreDetail.coreShape = Number(coreDetail.coreShape) || 1;
      coreDetail.noOfCore = Number(coreDetail.noOfCore) || 1;
      coreDetail.coreArea = Number(coreDetail.coreArea) || this.shareService.isValidNumber(Number(coreDetail.coreLength) * Number(coreDetail.coreWidth));
      const coreVolumeCalc =
        coreDetail.coreShape === 1 // 1 for Rectangle
          ? this.shareService.isValidNumber(Number(coreDetail.coreLength) * Number(coreDetail.coreWidth) * Number(coreDetail.coreHeight))
          : this.shareService.isValidNumber(((3.142 * Number(coreDetail.coreLength) * Number(coreDetail.coreLength)) / 4) * Number(coreDetail.coreHeight));
      coreDetail.coreVolume = Number(coreDetail.coreVolume) || coreVolumeCalc;
      coreDetail.coreWeight = this.shareService.isValidNumber(coreDetail.coreVolume * Number(materialInfo?.density) * Math.pow(10, -6) * coreDetail.noOfCore * 1.2);
      coreDetail.coreSandPrice = coreDetail.coreWeight * matDiscountedPricePerKg; // core sand price(kg)
      coreWeightCalcualtion += coreDetail.coreWeight;
      coreVolumeCalcualtion += coreDetail.coreVolume;
    });
    materialInfo.totalCoreWeight = coreWeightCalcualtion;
    materialInfo.totalSandVolume = coreVolumeCalcualtion;

    materialInfo.netMatCost = this.shareService.isValidNumber(materialInfo.totalCoreWeight * matDiscountedPricePerKg);

    return materialInfo;
  }

  public calculationsForSandForMoldCasting(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
    const matMetal = materialInfo?.materialInfoList.filter((rec) => rec.secondaryProcessId === 1)[0];
    const matCore = materialInfo?.materialInfoList.filter((rec) => rec.secondaryProcessId === 2)[0];
    if (materialInfo.isDensityDirty && !!materialInfo.density) {
      materialInfo.density = Number(materialInfo.density);
    } else {
      materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterialInfo?.density : materialInfo.density;
    }

    if (materialInfo.isMatPriceDirty && !!materialInfo.materialPricePerKg) {
      // Material price ($/Kg) :
      materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
    } else {
      materialInfo.materialPricePerKg = this.shareService.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterialInfo?.materialPricePerKg : materialInfo.materialPricePerKg;
    }

    const matDiscountedPricePerKg = materialInfo.materialPricePerKg * (1 - Number(materialInfo.volumeDiscountPer) / 100);

    if (materialInfo.isMoldBoxLengthDirty && !!materialInfo.moldBoxLength) {
      // Mould Length (mm) :
      materialInfo.moldBoxLength = Number(materialInfo.moldBoxLength);
    } else {
      const moldBoxLength = [PrimaryProcessType.NoBakeCasting, PrimaryProcessType.GreenCastingAuto, PrimaryProcessType.GreenCastingSemiAuto].includes(Number(materialInfo.processId))
        ? this.shareService.isValidNumber((Number(matMetal?.dimX) || 0) + 100 + 100)
        : this.shareService.isValidNumber((Number(matMetal?.dimX) || 0) * (Number(matMetal?.noOfCavities) || 0) + 150 + 110);
      if (materialInfo?.moldBoxLength) {
        materialInfo.moldBoxLength = this.shareService.checkDirtyProperty('moldBoxLength', fieldColorsList) ? selectedMaterialInfo?.moldBoxLength : moldBoxLength;
      } else {
        materialInfo.moldBoxLength = moldBoxLength;
      }
    }

    if (materialInfo.isMoldBoxWidthDirty && !!materialInfo.moldBoxWidth) {
      // Mould width(mm) :
      materialInfo.moldBoxWidth = Number(materialInfo.moldBoxWidth);
    } else {
      const moldBoxWidth = [PrimaryProcessType.NoBakeCasting, PrimaryProcessType.GreenCastingAuto, PrimaryProcessType.GreenCastingSemiAuto].includes(Number(materialInfo.processId))
        ? this.shareService.isValidNumber((Number(matMetal?.dimY) || 0) + 100 + 100)
        : this.shareService.isValidNumber((Number(matMetal?.dimY) || 0) * (Number(matMetal?.noOfCavities) || 0) + 150 + 110);
      if (materialInfo?.moldBoxWidth) {
        materialInfo.moldBoxWidth = this.shareService.checkDirtyProperty('moldBoxWidth', fieldColorsList) ? selectedMaterialInfo?.moldBoxWidth : moldBoxWidth;
      } else {
        materialInfo.moldBoxWidth = moldBoxWidth;
      }
    }

    if (materialInfo.isMoldBoxHeightDirty && !!materialInfo.moldBoxHeight) {
      // Mould Height (mm):
      materialInfo.moldBoxHeight = Number(materialInfo.moldBoxHeight);
    } else {
      const moldBoxHeight = [PrimaryProcessType.NoBakeCasting, PrimaryProcessType.GreenCastingAuto, PrimaryProcessType.GreenCastingSemiAuto].includes(Number(materialInfo.processId))
        ? this.shareService.isValidNumber((Number(matMetal?.dimZ) || 0) + (PrimaryProcessType.NoBakeCasting ? 100 : 150) + 100)
        : this.shareService.isValidNumber((Number(matMetal?.dimZ) || 0) + 150 + 110);
      if (materialInfo?.moldBoxHeight) {
        materialInfo.moldBoxHeight = this.shareService.checkDirtyProperty('moldBoxHeight', fieldColorsList) ? selectedMaterialInfo?.moldBoxHeight : moldBoxHeight;
      } else {
        materialInfo.moldBoxHeight = moldBoxHeight;
      }
    }
    // const totalMoldWeight = Number(materialInfo.moldBoxLength) * Number(materialInfo.moldBoxWidth) * Number(materialInfo.moldBoxHeight) * (Number(materialInfo.density) / Math.pow(10, 6)); //Total Mold weight (kg):
    // materialInfo.sandMetalRatio = Math.round(totalMoldWeight / materialInfo.materialInfoList[0].netWeight) || 0; //Sand to Metal Ratio
    // let ratio = totalMoldWeight / materialInfo.materialInfoList[0].netWeight;
    let ratio = Number(materialInfo.moldSandWeight) / Number(matMetal?.totalPouringWeight);
    materialInfo.sandMetalRatio = isFinite(ratio) ? Math.round(ratio) : 0;

    if (materialInfo.isMoldSandWeightDirty && !!materialInfo.moldSandWeight) {
      // Mold Sand weight (kg) 70% recycled
      materialInfo.moldSandWeight = Number(materialInfo.moldSandWeight);
    } else {
      const moldBox = Number(materialInfo.moldBoxLength) * Number(materialInfo.moldBoxWidth) * Number(materialInfo.moldBoxHeight);
      let moldSandWeight = 0;
      if ([PrimaryProcessType.GreenCastingAuto, PrimaryProcessType.GreenCastingSemiAuto].includes(Number(materialInfo.processId))) {
        moldSandWeight = this.shareService.isValidNumber((moldBox * Number(materialInfo.density)) / Math.pow(10, 6));
      } else if ([PrimaryProcessType.NoBakeCasting].includes(Number(materialInfo.processId))) {
        moldSandWeight = this.shareService.isValidNumber(((moldBox - (Number(matMetal?.partVolume) || 0)) * Number(materialInfo.density)) / Math.pow(10, 6));
      } else {
        moldSandWeight = this.shareService.isValidNumber(
          (((moldBox - (Number(matCore?.totalSandVolume) || 0) - (Number(matMetal?.partVolume) || 0)) * Number(materialInfo.density)) / Math.pow(10, 6)) * 0.3
        );
      }
      if (materialInfo?.moldSandWeight) {
        moldSandWeight = this.shareService.checkDirtyProperty('moldSandWeight', fieldColorsList) ? selectedMaterialInfo?.moldSandWeight : moldSandWeight;
      }
      materialInfo.moldSandWeight = moldSandWeight;
    }

    if ([PrimaryProcessType.GreenCastingAuto, PrimaryProcessType.GreenCastingSemiAuto, PrimaryProcessType.NoBakeCasting].includes(Number(materialInfo.processId))) {
      if (materialInfo.isSandWeightAfterRecoveryDirty && !!materialInfo.sandWeightAfterRecovery) {
        materialInfo.sandWeightAfterRecovery = Number(materialInfo.sandWeightAfterRecovery);
      } else {
        let sandWeightAfterRecovery = 0;
        if (PrimaryProcessType.GreenCastingAuto === Number(materialInfo.processId)) {
          sandWeightAfterRecovery = this.shareService.isValidNumber(((Number(matMetal?.totalPouringWeight) || 0) * 0.1) / Number(matMetal?.noOfCavities));
        } else if (PrimaryProcessType.GreenCastingSemiAuto === Number(materialInfo.processId)) {
          sandWeightAfterRecovery = this.shareService.isValidNumber((Number(materialInfo?.moldSandWeight) || 0) * 0.1);
        } else {
          sandWeightAfterRecovery = this.shareService.isValidNumber((Number(materialInfo?.moldSandWeight) || 0) * 0.3);
        }
        if (materialInfo?.sandWeightAfterRecovery) {
          sandWeightAfterRecovery = this.shareService.checkDirtyProperty('sandWeightAfterRecovery', fieldColorsList) ? selectedMaterialInfo?.sandWeightAfterRecovery : sandWeightAfterRecovery;
        }
        materialInfo.sandWeightAfterRecovery = sandWeightAfterRecovery;
      }
    }

    if ([PrimaryProcessType.GreenCastingSemiAuto].includes(Number(materialInfo.processId))) {
      materialInfo.netMatCost = Number(materialInfo?.sandWeightAfterRecovery) * matDiscountedPricePerKg;
    } else if ([PrimaryProcessType.GreenCastingAuto, PrimaryProcessType.NoBakeCasting].includes(Number(materialInfo.processId))) {
      materialInfo.netMatCost = (Number(materialInfo?.sandWeightAfterRecovery) * matDiscountedPricePerKg) / Number(matMetal?.noOfCavities);
    } else {
      materialInfo.netMatCost = Number(materialInfo?.moldSandWeight) * matDiscountedPricePerKg;
    }

    return materialInfo;
  }

  public calculationsForPatternWaxCasting(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
    const matMetal = materialInfo?.materialInfoList.filter((rec) => rec.secondaryProcessId === 1)[0];

    if (materialInfo.isDensityDirty && !!materialInfo.density) {
      materialInfo.density = Number(materialInfo.density);
    } else {
      materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterialInfo?.density : materialInfo.density;
    }

    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      // Wax weight (g):
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      // const netWeight = this.shareService.isValidNumber(
      //   (matMetal.partVolume * Number(materialInfo.density)) / 1000 +
      //     this.materialCastingConfigService.sprueGateWeightCalculation().totWaxWeightkg / this.castingConfigService.castingConstants.finalCavitiesPerTree
      // );
      const netWeight = this.shareService.isValidNumber(
        (matMetal.partVolume * Number(materialInfo.density)) / 1000 + this.materialCastingConfigService.sprueGateWeightCalculation().totWaxWeightkg / matMetal.noOfCavities
      );
      if (materialInfo?.netWeight) {
        materialInfo.netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      } else {
        materialInfo.netWeight = netWeight;
      }
    }

    if (materialInfo.isMatPriceDirty && !!materialInfo.materialPricePerKg) {
      // Wax Cost ($/Kg) :
      materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
    } else {
      materialInfo.materialPricePerKg = this.shareService.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterialInfo?.materialPricePerKg : materialInfo.materialPricePerKg;
    }

    const matDiscountedPricePerKg = materialInfo.materialPricePerKg * (1 - Number(materialInfo.volumeDiscountPer) / 100);

    materialInfo.netMatCost = this.shareService.isValidNumber((materialInfo.netWeight / 1000) * matDiscountedPricePerKg);

    return materialInfo;
  }

  public calculationsForSlurryCostCasting(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
    const matMetal = materialInfo?.materialInfoList.filter((rec) => rec.secondaryProcessId === 1)[0];

    if (materialInfo.isDensityDirty && !!materialInfo.density) {
      materialInfo.density = Number(materialInfo.density);
    } else {
      materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterialInfo?.density : materialInfo.density;
    }

    if (materialInfo.isPartSurfaceAreaDirty && !!materialInfo.partSurfaceArea) {
      materialInfo.partSurfaceArea = Number(materialInfo.partSurfaceArea);
    } else {
      const partSurfaceArea = matMetal.partSurfaceArea || 0;
      if (materialInfo?.partSurfaceArea) {
        materialInfo.partSurfaceArea = this.shareService.checkDirtyProperty('partSurfaceArea', fieldColorsList) ? selectedMaterialInfo?.partSurfaceArea : partSurfaceArea;
      } else {
        materialInfo.partSurfaceArea = partSurfaceArea;
      }
    }

    // if (materialInfo.isPartProjectedAreaDirty && !!materialInfo.partProjectedArea) {
    //   materialInfo.partProjectedArea = Number(materialInfo.partProjectedArea);
    // } else {
    //   const partProjectedArea = matMetal.partProjectedArea || 0;
    //   if (materialInfo?.partProjectedArea) {
    //     materialInfo.partProjectedArea = this.shareService.checkDirtyProperty('partProjectArea', fieldColorsList) ? selectedMaterialInfo?.partProjectedArea : partProjectedArea;
    //   } else {
    //     materialInfo.partProjectedArea = partProjectedArea;
    //   }
    // }

    if (materialInfo.ispartTicknessDirty && !!materialInfo.partTickness) {
      // Part Tickness:
      materialInfo.partTickness = Number(materialInfo.partTickness) || 2;
    } else {
      materialInfo.partTickness = this.shareService.checkDirtyProperty('partTickness', fieldColorsList) ? selectedMaterialInfo?.partTickness : materialInfo.partTickness;
    }

    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      // Sand weight (Kg):
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      const netWeight = this.shareService.isValidNumber((Number(materialInfo.partSurfaceArea) * 1.2 * Number(materialInfo.partTickness) * Number(materialInfo.density)) / 1000);
      if (materialInfo?.netWeight) {
        materialInfo.netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      } else {
        materialInfo.netWeight = netWeight;
      }
    }

    if (materialInfo.isPrimaryCountDirty && !!materialInfo.primaryCount) {
      materialInfo.primaryCount = Number(materialInfo.primaryCount);
    } else {
      materialInfo.primaryCount = this.shareService.checkDirtyProperty('primaryCount', fieldColorsList) ? selectedMaterialInfo?.primaryCount : materialInfo.primaryCount;
      !materialInfo.primaryCount && (materialInfo.primaryCount = 2);
    }

    if (materialInfo.isPrimaryWeightDirty && !!materialInfo.primaryWeight) {
      materialInfo.primaryWeight = Number(materialInfo.primaryWeight);
    } else {
      const primaryCoatWeight = this.shareService.isValidNumber(Number(materialInfo.primaryCount) * Number(materialInfo.netWeight));
      if (materialInfo?.primaryWeight) {
        materialInfo.primaryWeight = this.shareService.checkDirtyProperty('primaryWeight', fieldColorsList) ? selectedMaterialInfo?.primaryWeight : primaryCoatWeight;
      } else {
        materialInfo.primaryWeight = primaryCoatWeight;
      }
    }

    if (materialInfo.isPrimaryPriceDirty && !!materialInfo.primaryPrice) {
      materialInfo.primaryPrice = Number(materialInfo.primaryPrice);
    } else {
      materialInfo.primaryPrice = this.shareService.checkDirtyProperty('primaryPrice', fieldColorsList) ? selectedMaterialInfo?.primaryPrice : materialInfo.primaryPrice;
    }

    if (materialInfo.isSecondaryCountDirty && !!materialInfo.secondaryCount) {
      materialInfo.secondaryCount = Number(materialInfo.secondaryCount);
    } else {
      materialInfo.secondaryCount = this.shareService.checkDirtyProperty('secondaryCount', fieldColorsList) ? selectedMaterialInfo?.secondaryCount : materialInfo.secondaryCount;
      !materialInfo.secondaryCount && (materialInfo.secondaryCount = 4);
    }

    if (materialInfo.isSecondaryWeightDirty && !!materialInfo.secondaryWeight) {
      materialInfo.secondaryWeight = Number(materialInfo.secondaryWeight);
    } else {
      const secCoatWeight = this.shareService.isValidNumber(Number(materialInfo.secondaryCount) * Number(materialInfo.netWeight));
      if (materialInfo?.secondaryWeight) {
        materialInfo.secondaryWeight = this.shareService.checkDirtyProperty('secondaryWeight', fieldColorsList) ? selectedMaterialInfo?.secondaryWeight : secCoatWeight;
      } else {
        materialInfo.secondaryWeight = secCoatWeight;
      }
    }

    if (materialInfo.isSecondaryPriceDirty && !!materialInfo.secondaryPrice) {
      materialInfo.secondaryPrice = Number(materialInfo.secondaryPrice);
    } else {
      materialInfo.secondaryPrice = this.shareService.checkDirtyProperty('secondaryPrice', fieldColorsList) ? selectedMaterialInfo?.secondaryPrice : materialInfo.secondaryPrice;
    }

    materialInfo.netMatCost = this.shareService.isValidNumber((materialInfo.primaryWeight / 1000) * materialInfo.primaryPrice + (materialInfo.secondaryWeight / 1000) * materialInfo.secondaryPrice);

    return materialInfo;
  }

  // public calculationsForSandForMoldCastingInvestment(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
  //   const matMetal = materialInfo?.materialInfoList.filter((rec) => rec.secondaryProcessId === 1)[0];

  //   if (materialInfo.isDensityDirty && !!materialInfo.density) {
  //     materialInfo.density = Number(materialInfo.density);
  //   } else {
  //     materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterialInfo?.density : materialInfo.density;
  //   }

  //   if (materialInfo.isMatPriceDirty && !!materialInfo.materialPricePerKg) {
  //     // Material price ($/Kg) :
  //     materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
  //   } else {
  //     materialInfo.materialPricePerKg = this.shareService.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterialInfo?.materialPricePerKg : materialInfo.materialPricePerKg;
  //   }

  // const matDiscountedPricePerKg = materialInfo.materialPricePerKg * (1 - Number(materialInfo.volumeDiscountPer) / 100);

  //   // if (materialInfo.isMoldSandWeightDirty && !!materialInfo.moldSandWeight) { // Mold Sand weight (Kg) :
  //   //   materialInfo.moldSandWeight = Number(materialInfo.moldSandWeight);
  //   // } else {
  //   //   materialInfo.moldSandWeight = this.shareService.checkDirtyProperty('moldSandWeight', fieldColorsList) ? selectedMaterialInfo?.moldSandWeight : materialInfo.moldSandWeight;
  //   // }

  //   if (materialInfo.isSandWeightAfterRecoveryDirty && !!materialInfo.sandWeightAfterRecovery) {
  //     materialInfo.sandWeightAfterRecovery = Number(materialInfo.sandWeightAfterRecovery);
  //   } else {
  //     let sandWeightAfterRecovery = this.shareService.isValidNumber(matMetal.pouringWeight * 0.1);
  //     if (materialInfo?.sandWeightAfterRecovery) {
  //       sandWeightAfterRecovery = this.shareService.checkDirtyProperty('sandWeightAfterRecovery', fieldColorsList) ? selectedMaterialInfo?.sandWeightAfterRecovery : sandWeightAfterRecovery;
  //     }
  //     materialInfo.sandWeightAfterRecovery = sandWeightAfterRecovery;
  //   }

  //   materialInfo.netMatCost = this.shareService.isValidNumber(matDiscountedPricePerKg * materialInfo.sandWeightAfterRecovery);

  //   return materialInfo;
  // }

  public calculationsForZirconSandCasting(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
    // const matMetal = materialInfo?.materialInfoList.filter((rec) => rec.secondaryProcessId === 1)[0];
    const matSlurry = materialInfo?.materialInfoList.filter((rec) => rec.secondaryProcessId === 5)[0];

    if (materialInfo.isDensityDirty && !!materialInfo.density) {
      materialInfo.density = Number(materialInfo.density);
    } else {
      materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterialInfo?.density : materialInfo.density;
    }

    if (materialInfo.ispartTicknessDirty && !!materialInfo.partTickness) {
      // Part Tickness:
      materialInfo.partTickness = Number(materialInfo.partTickness) || 1.5;
    } else {
      materialInfo.partTickness = this.shareService.checkDirtyProperty('partTickness', fieldColorsList) ? selectedMaterialInfo?.partTickness : materialInfo.partTickness;
    }

    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      // Sand weight (Kg):
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      const netWeight = this.shareService.isValidNumber(((matSlurry.partSurfaceArea * materialInfo.partTickness * materialInfo.density) / Math.pow(10, 6)) * matSlurry.primaryCount);
      if (materialInfo?.netWeight) {
        materialInfo.netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      } else {
        materialInfo.netWeight = netWeight;
      }
    }

    if (materialInfo.isMatPriceDirty && !!materialInfo.materialPricePerKg) {
      // Material price ($/Kg) :
      materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
    } else {
      materialInfo.materialPricePerKg = this.shareService.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterialInfo?.materialPricePerKg : materialInfo.materialPricePerKg;
    }

    const matDiscountedPricePerKg = materialInfo.materialPricePerKg * (1 - Number(materialInfo.volumeDiscountPer) / 100);

    materialInfo.netMatCost = this.shareService.isValidNumber(matDiscountedPricePerKg * materialInfo.netWeight);

    return materialInfo;
  }
}
