import { Injectable, effect } from '@angular/core';
import { SharedService } from './shared.service';
import { MaterialInfoDto, MaterialMasterDto, PartInfoDto, VendorDto } from 'src/app/shared/models';
// import { Subject } from 'rxjs';
import { AnnualRevenueTypeEnum, AnnualRevenueTypeNameMap } from 'src/app/shared/enums';
// import { takeUntil } from 'rxjs/operators';
// import { PartInfoState } from '../../_state/part-info.state';
import { Store } from '@ngxs/store';
import { VendorService } from '../../data/Service/vendor.service';
import { CavityConfigService } from 'src/app/shared/config/cavity-config';
import { IMaterialCalculationByCommodity } from './IMaterialCalculationByCommodity';
import { PrimaryProcessType } from '../costing.config';
import { MaterialMatalFormingCalculationService } from './material-hot-forging-closed-die-hot-calculator.service';
import { MaterialInsulationJacketCalculatorService } from './material-insulation-jacket-calculator.service';
import { MaterialConfigService } from 'src/app/shared/config/cost-material-config';
import { PartInfoSignalsService } from 'src/app/shared/signals/part-info-signals.service';
import { PlasticRubberConfigService } from 'src/app/shared/config/plastic-rubber-config.service';
import { BlowMoldingConfigService } from 'src/app/shared/config/cost-blow-molding-config';

@Injectable({
  providedIn: 'root',
})
export class PlasticRubberCalculatorService implements IMaterialCalculationByCommodity {
  // _partInfo$: Observable<PartInfoDto>;
  currentPart: PartInfoDto;
  // private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  vendorDto: VendorDto[] = [];
  private partInfoEffect = effect(() => {
    const partInfo = this.partInfoSignalsService.partInfo();
    if (partInfo) {
      this.currentPart = { ...partInfo };
    }
  });
  constructor(
    private store: Store,
    private shareService: SharedService,
    private vendorService: VendorService,
    private cavityConfigService: CavityConfigService,
    private materialForgingService: MaterialInsulationJacketCalculatorService,
    private _materialHotForgingClosedDieHotCalcService: MaterialMatalFormingCalculationService,
    private materialConfigService: MaterialConfigService,
    private partInfoSignalsService: PartInfoSignalsService,
    private plasticRubberConfigService: PlasticRubberConfigService,
    private _blowMoldingConfig: BlowMoldingConfigService
  ) {
    // this._partInfo$ = this.store.select(PartInfoState.getPartInfo);
    // this.getPartDetailsById();
  }

  setCurrentPart(part: PartInfoDto) {
    this.currentPart = part;
  }

  CalculateMaterialCost(processId: number, materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto, processMachinesList): MaterialInfoDto {
    switch (processId) {
      case PrimaryProcessType.RubberExtrusion:
        return this.calculationsForRubberExtrusion(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.InjectionMouldingSingleShot:
      case PrimaryProcessType.InjectionMouldingDoubleShot:
        return this.calculationsForInjectionMoulding(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.CompressionMoulding:
        return this.calculationsForCompressionMolding(materialInfo, fieldColorsList, selectedMaterial, processMachinesList);
      case PrimaryProcessType.BlowMoulding:
        return this.blowMolding(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.ThermoForming:
        return this.materialForgingService.calculationsForThermalForming(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.PlasticVacuumForming:
        return this.materialForgingService.calculationsForVacuumForming(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.TransferMolding:
        return this.calculationsForTransferMolding(materialInfo, fieldColorsList, selectedMaterial, processMachinesList);
      case PrimaryProcessType.RubberInjectionMolding:
        return this.calculationsForRubberInjectionMoulding(materialInfo, fieldColorsList, selectedMaterial, processMachinesList);
      case PrimaryProcessType.PlasticTubeExtrusion:
        return this.calculationsForPlasticTubeExtrusion(materialInfo, fieldColorsList, selectedMaterial);
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
      case PrimaryProcessType.MetalTubeExtrusion:
      case PrimaryProcessType.MetalExtrusion:
        return this._materialHotForgingClosedDieHotCalcService.calculationsForMetalTubeExtrusion(materialInfo, fieldColorsList, selectedMaterial);
      default:
        throw new Error('Unsupported Commodity Type');
    }
  }

  public calculationsForInjectionMoulding(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto) {
    if (materialInfo.isColorantPerDirty && materialInfo.colorantPer !== null) {
      materialInfo.colorantPer = Number(materialInfo.colorantPer);
    } else {
      let colorantPer = 0;
      if (materialInfo.colorantPer !== null) {
        colorantPer = this.shareService.checkDirtyProperty('colorantPer', fieldColorsList) ? selectedMaterial?.colorantPer : colorantPer;
      }
      materialInfo.colorantPer = colorantPer;
    }

    if (materialInfo.isColorantPriceDirty && materialInfo.colorantPrice !== null) {
      materialInfo.colorantPrice = Number(materialInfo.colorantPrice);
    } else {
      let colorantPrice = 0;
      if (materialInfo.colorantPrice !== null) {
        colorantPrice = this.shareService.checkDirtyProperty('colorantPrice', fieldColorsList) ? selectedMaterial?.colorantPrice : colorantPrice;
      }
      materialInfo.colorantPrice = colorantPrice;
    }

    if (materialInfo.isPrimaryPriceDirty && materialInfo.primaryPrice !== null) {
      materialInfo.primaryPrice = Number(materialInfo.primaryPrice);
    } else {
      let primaryPrice = 0;
      if (materialInfo.primaryPrice !== null) {
        primaryPrice = this.shareService.checkDirtyProperty('primaryPrice', fieldColorsList) ? selectedMaterial?.primaryPrice : primaryPrice;
      }
      materialInfo.primaryPrice = primaryPrice;
    }

    if (materialInfo.isColorantCostDirty && materialInfo.colorantCost !== null) {
      materialInfo.colorantCost = Number(materialInfo.colorantCost);
    } else {
      let colorantCost = this.shareService.isValidNumber(Number(materialInfo.colorantPrice - (materialInfo.colorantPrice * materialInfo.primaryPrice) / 100));
      if (materialInfo.colorantCost !== null) {
        colorantCost = this.shareService.checkDirtyProperty('colorantCost', fieldColorsList) ? selectedMaterial?.colorantCost : colorantCost;
      }
      materialInfo.colorantCost = colorantCost;
    }

    if (materialInfo.isNoOfCavitiesDirty && !!materialInfo.noOfCavities) {
      materialInfo.noOfCavities = Number(materialInfo.noOfCavities);
    } else {
      let noOfCavities = this.cavityConfigService.getNumberOfCavities(this.currentPart?.lotSize || this.currentPart?.eav / 12, materialInfo?.partProjectedArea);
      if (materialInfo.noOfCavities !== null) {
        noOfCavities = this.shareService.checkDirtyProperty('noOfCavities', fieldColorsList) ? selectedMaterial?.noOfCavities : noOfCavities;
      }
      materialInfo.noOfCavities = noOfCavities;
    }

    if (materialInfo.isCavityArrangementLengthDirty && !!materialInfo.cavityArrangementLength) {
      materialInfo.cavityArrangementLength = Number(materialInfo.cavityArrangementLength);
      const cavityPairs = this.cavityConfigService.generateCavityPairs(materialInfo.noOfCavities);
      if (!cavityPairs.some(([_, a]) => a === materialInfo.cavityArrangementLength)) {
        materialInfo.cavityArrangementLength = null;
      }
    } else {
      let cavityArrangementLength =
        materialInfo.noOfCavities <= 128
          ? this.cavityConfigService.getCavityLayout(materialInfo.noOfCavities).cavitiesAlongLength
          : this.cavityConfigService.getDefaultLayout(materialInfo.noOfCavities).length;
      if (materialInfo.cavityArrangementLength !== null) {
        cavityArrangementLength = this.shareService.checkDirtyProperty('cavityArrangementLength', fieldColorsList) ? selectedMaterial?.cavityArrangementLength : cavityArrangementLength;
      }
      materialInfo.cavityArrangementLength = cavityArrangementLength;
    }

    if (materialInfo.isCavityArrangementWidthDirty && !!materialInfo.cavityArrangementWidth) {
      materialInfo.cavityArrangementWidth = Number(materialInfo.cavityArrangementWidth);
    } else {
      let cavityArrangementWidth = this.cavityConfigService.getLayoutByLength(materialInfo.noOfCavities, materialInfo.cavityArrangementLength).width;
      if (materialInfo.cavityArrangementWidth !== null) {
        cavityArrangementWidth = this.shareService.checkDirtyProperty('cavityArrangementWidth', fieldColorsList) ? selectedMaterial?.cavityArrangementWidth : cavityArrangementWidth;
      }
      materialInfo.cavityArrangementWidth = cavityArrangementWidth;
    }

    if (materialInfo.isNetweightDirty && materialInfo.netWeight !== null) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      let netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight !== null) {
        netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    if (materialInfo.isRegrindAllowanceDirty && materialInfo.regrindAllowance != null) {
      materialInfo.regrindAllowance = Number(materialInfo.regrindAllowance);
    } else {
      materialInfo.regrindAllowance = this.shareService.checkDirtyProperty('regrindAllowance', fieldColorsList) ? selectedMaterial?.regrindAllowance : 10;
    }

    const partAllowance = this.shareService.isValidNumber(0.01 * Number(materialInfo.dimZ) * Math.pow(Number(materialInfo.shearingStrength) / 10, 1 / 2));
    materialInfo.partAllowance = partAllowance;

    let runnerType = 'Hot Runner';
    if (materialInfo.isRunnerTypeDirty) {
      runnerType = materialInfo.runnerType;
    } else {
      // runnerType = materialInfo.eav < 100000 && Number(materialInfo.netWeight) < 100 ? "Cold Runner" : "Hot Runner";
      runnerType = materialInfo.eav < 100000 ? 'Cold Runner' : 'Hot Runner';
      runnerType = this.shareService.checkDirtyProperty('runnerType', fieldColorsList) ? selectedMaterial?.runnerType : runnerType;
    }
    materialInfo.runnerType = runnerType;

    if (materialInfo.isRunnerDiaDirty && materialInfo.runnerDia != null) {
      materialInfo.runnerDia = Number(materialInfo.runnerDia);
    } else {
      let runnerDia =
        Number(materialInfo.netWeight) <= 0
          ? 0
          : Number(materialInfo.netWeight) <= 20
            ? 3
            : Number(materialInfo.netWeight) <= 50
              ? 4
              : Number(materialInfo.netWeight) <= 100
                ? 5
                : Number(materialInfo.netWeight) <= 250
                  ? 6
                  : 7;
      if (materialInfo.runnerDia != null) {
        runnerDia = this.shareService.checkDirtyProperty('runnerDia', fieldColorsList) ? selectedMaterial?.runnerDia : runnerDia;
      }
      materialInfo.runnerDia = runnerDia;
    }

    if (materialInfo.isRunnerLengthDirty && materialInfo.runnerLength != null) {
      materialInfo.runnerLength = Number(materialInfo.runnerLength);
    } else {
      let runnerLength = 0;
      if (materialInfo.runnerType == 'Cold Runner') {
        runnerLength = materialInfo.dimX > 0 ? materialInfo.dimZ + 20 + 25 + Number(materialInfo.noOfCavities) * 20 : 0;
      } else if (materialInfo.runnerType == 'Hot Runner') {
        runnerLength = 0;
      } else if (materialInfo.runnerType == 'Cold/Hot(hybrid)') {
        runnerLength = materialInfo.dimX > 0 ? materialInfo.dimZ + Number(materialInfo.noOfCavities) * 20 : 0;
      }
      if (materialInfo.runnerLength != null) {
        runnerLength = this.shareService.checkDirtyProperty('runnerLength', fieldColorsList) ? selectedMaterial?.runnerLength : runnerLength;
      }
      materialInfo.runnerLength = runnerLength;
    }

    materialInfo.runnerPartVolume = this.shareService.isValidNumber((22 / 7) * (Number(materialInfo.runnerDia) / 2) * ((Number(materialInfo.runnerDia) / 2) * Number(materialInfo.runnerLength)));
    materialInfo.runnerScrapWeight = this.shareService.isValidNumber(Number(materialInfo.runnerPartVolume) * (Number(materialInfo.density) / 1000));
    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight != null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = materialInfo.runnerScrapWeight;
      if (materialInfo.scrapWeight != null) {
        scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight !== null) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      let grossWeight = this.shareService.isValidNumber(materialInfo.scrapWeight + Number(materialInfo.netWeight));
      if (materialInfo.grossWeight !== null) {
        grossWeight = this.shareService.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterial?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    if (materialInfo.isutilisationDirty && materialInfo.utilisation != null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = this.shareService.isValidNumber((Number(materialInfo.netWeight) / materialInfo.grossWeight) * 100);
      if (materialInfo.utilisation != null) {
        utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }
    let scrapRecCost = materialInfo.scrapWeight * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg);
    const grossMaterialCost = this.shareService.isValidNumber(materialInfo.grossWeight * (Number(materialInfo.materialPricePerKg) / 1000));
    materialInfo.materialCostPart = grossMaterialCost;
    if (this.shareService.isValidNumber(materialInfo.scrapWeight / Number(materialInfo.netWeight)) < Number(materialInfo.regrindAllowance / 100)) {
      scrapRecCost = this.shareService.isValidNumber(materialInfo.scrapWeight * ((Number(materialInfo.materialPricePerKg) * 0.7) / 1000));
    } else {
      scrapRecCost = this.shareService.isValidNumber(
        (Number(materialInfo.netWeight) * Number(materialInfo.regrindAllowance / 100) * Number(materialInfo.materialPricePerKg) * 0.7) / 1000 +
          ((materialInfo.scrapWeight - Number(materialInfo.netWeight) * Number(materialInfo.regrindAllowance / 100)) * Number(materialInfo.scrapPricePerKg)) / 1000
      );
    }
    materialInfo.scrapRecCost = scrapRecCost;

    materialInfo.netMatCost = this.shareService.isValidNumber(grossMaterialCost - scrapRecCost);

    materialInfo.runnerProjectedArea = Number(materialInfo.runnerDia) * Number(materialInfo.runnerLength);
    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }
    if (materialInfo.stockForm === 'Granules (Natural) + Master batch') {
      materialInfo.netMatCost =
        (materialInfo.grossWeight * ((100 - materialInfo.colorantPer) / 100) * Number(materialInfo.materialPricePerKg) +
          materialInfo.grossWeight * (materialInfo.colorantPer / 100) * materialInfo.colorantCost -
          (materialInfo.colorantCost - materialInfo.netWeight) * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg)) /
        1000;
    }
    return materialInfo;
  }

  public calculationsForRubberInjectionMoulding(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto, machinesList: any = []): MaterialInfoDto {
    if (materialInfo.isScrapPriceDirty && materialInfo.scrapPricePerKg !== null) {
      materialInfo.scrapPricePerKg = Number(materialInfo.scrapPricePerKg);
    } else {
      let scrapPricePerKg = 0;
      if (materialInfo.scrapPricePerKg !== null) {
        scrapPricePerKg = this.shareService.checkDirtyProperty('scrapPricePerKg', fieldColorsList) ? selectedMaterial?.scrapPricePerKg : scrapPricePerKg;
      }
      materialInfo.scrapPricePerKg = scrapPricePerKg;
    }

    if (materialInfo.isStdDeviationDirty && materialInfo.standardDeviation !== null) {
      materialInfo.standardDeviation = Number(materialInfo.standardDeviation);
    } else {
      let stv = this.stdev([materialInfo.wallThickessMm, materialInfo.wallAverageThickness]);
      if (materialInfo.standardDeviation !== null) {
        stv = this.shareService.checkDirtyProperty('standardDeviation', fieldColorsList) ? selectedMaterial?.standardDeviation : stv;
      }
      materialInfo.standardDeviation = stv;
    }

    if (materialInfo.isNoOfCavitiesDirty && materialInfo.noOfCavities !== null) {
      materialInfo.noOfCavities = Number(materialInfo.noOfCavities);
    } else {
      let noOfCavities = this.cavityConfigService.getNumberOfCavitiesForRubberMolding(machinesList, this.currentPart, materialInfo);
      if (materialInfo.noOfCavities !== null) {
        noOfCavities = this.shareService.checkDirtyProperty('noOfCavities', fieldColorsList) ? selectedMaterial?.noOfCavities : noOfCavities;
      }
      materialInfo.noOfCavities = noOfCavities;
    }

    if (materialInfo.isCavityArrangementLengthDirty && materialInfo.cavityArrangementLength !== null) {
      materialInfo.cavityArrangementLength = Number(materialInfo.cavityArrangementLength);
      const cavityPairs = this.cavityConfigService.generateCavityPairs(materialInfo.noOfCavities);
      if (!cavityPairs.some(([_, a]) => a === materialInfo.cavityArrangementLength)) {
        materialInfo.cavityArrangementLength = null;
      }
    } else {
      let cavityArrangementLength =
        materialInfo.noOfCavities <= 128
          ? this.cavityConfigService.getCavityLayout(materialInfo.noOfCavities).cavitiesAlongLength
          : this.cavityConfigService.getDefaultLayout(materialInfo.noOfCavities).length;
      if (materialInfo.cavityArrangementLength !== null) {
        cavityArrangementLength = this.shareService.checkDirtyProperty('cavityArrangementLength', fieldColorsList) ? selectedMaterial?.cavityArrangementLength : cavityArrangementLength;
      }
      materialInfo.cavityArrangementLength = cavityArrangementLength;
    }

    if (materialInfo.isCavityArrangementWidthDirty && materialInfo.cavityArrangementWidth !== null) {
      materialInfo.cavityArrangementWidth = Number(materialInfo.cavityArrangementWidth);
    } else {
      let cavityArrangementWidth = this.cavityConfigService.getLayoutByLength(materialInfo.noOfCavities, materialInfo.cavityArrangementLength).width;
      if (materialInfo.cavityArrangementWidth !== null) {
        cavityArrangementWidth = this.shareService.checkDirtyProperty('cavityArrangementWidth', fieldColorsList) ? selectedMaterial?.cavityArrangementWidth : cavityArrangementWidth;
      }
      materialInfo.cavityArrangementWidth = cavityArrangementWidth;
    }

    if (materialInfo.isNetweightDirty && materialInfo.netWeight !== null) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      let netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight !== null) {
        netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    if (materialInfo.isRegrindAllowanceDirty && materialInfo.regrindAllowance !== null) {
      materialInfo.regrindAllowance = Number(materialInfo.regrindAllowance);
    } else {
      materialInfo.regrindAllowance = this.shareService.checkDirtyProperty('regrindAllowance', fieldColorsList) ? selectedMaterial?.regrindAllowance : 10;
    }

    const partAllowance = this.shareService.isValidNumber(0.01 * Number(materialInfo.dimZ) * Math.pow(Number(materialInfo.shearingStrength) / 10, 1 / 2));
    materialInfo.partAllowance = partAllowance;

    let runnerType = 'Cold Runner';
    if (materialInfo.isRunnerTypeDirty) {
      runnerType = materialInfo.runnerType;
    } else {
      // // runnerType = materialInfo.eav < 100000 && Number(materialInfo.netWeight) < 100 ? "Cold Runner" : "Hot Runner";
      // runnerType = materialInfo.eav < 100000 ? 'Cold Runner' : 'Hot Runner';
      runnerType = this.shareService.checkDirtyProperty('runnerType', fieldColorsList) ? selectedMaterial?.runnerType : runnerType;
    }
    materialInfo.runnerType = runnerType;

    if (materialInfo.isRunnerDiaDirty && materialInfo.runnerDia !== null) {
      materialInfo.runnerDia = Number(materialInfo.runnerDia);
    } else {
      let runnerDia =
        runnerType === 'Hot Runner'
          ? 0
          : materialInfo.netWeight <= 0
            ? 0
            : materialInfo.netWeight <= 20
              ? 3
              : materialInfo.netWeight <= 50
                ? 4
                : materialInfo.netWeight <= 100
                  ? 5
                  : materialInfo.netWeight <= 250
                    ? 6
                    : 7;
      if (materialInfo.runnerDia !== null) {
        runnerDia = this.shareService.checkDirtyProperty('runnerDia', fieldColorsList) ? selectedMaterial?.runnerDia : runnerDia;
      }
      materialInfo.runnerDia = runnerDia;
    }

    if (materialInfo.isRunnerLengthDirty && materialInfo.runnerLength !== null) {
      materialInfo.runnerLength = Number(materialInfo.runnerLength);
    } else {
      let runnerLength = materialInfo.dimZ > 0 ? materialInfo.dimZ * 1.15 + materialInfo.noOfCavities * 15 : 0;

      if (materialInfo.runnerLength !== null) {
        runnerLength = this.shareService.checkDirtyProperty('runnerLength', fieldColorsList) ? selectedMaterial?.runnerLength : runnerLength;
      }
      materialInfo.runnerLength = runnerLength;
    }

    materialInfo.runnerPartVolume = this.shareService.isValidNumber((22 * (Number(materialInfo.runnerDia) * Number(materialInfo.runnerDia)) * Number(materialInfo.runnerLength)) / 28); // this.shareService.isValidNumber((22 / 7) * (Number(materialInfo.runnerDia) / 2) * ((Number(materialInfo.runnerDia) / 2) * Number(materialInfo.runnerLength)));
    materialInfo.runnerVolume = materialInfo.runnerPartVolume;
    materialInfo.runnerScrapWeight = this.shareService.isValidNumber(Number(materialInfo.runnerPartVolume) * (Number(materialInfo.density) / 1000));

    // if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight !== null) {
    //   materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    // } else {
    //   let scrapWeight = materialInfo.runnerScrapWeight;
    //   if (materialInfo.scrapWeight !== null) {
    //     scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : scrapWeight;
    //   }
    //   materialInfo.scrapWeight = scrapWeight;
    // }

    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight !== null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = Number(materialInfo.grossWeight) - Number(materialInfo.netWeight);
      if (materialInfo.scrapWeight !== null) {
        scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight !== null) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      const grossWeightFactor = this.plasticRubberConfigService.getGrossWeightFactor(materialInfo.netWeight);
      let grossWeight = this.shareService.isValidNumber(grossWeightFactor * Number(materialInfo.netWeight)); // this.shareService.isValidNumber(materialInfo.scrapWeight + Number(materialInfo.netWeight));
      if (materialInfo.grossWeight !== null) {
        grossWeight = this.shareService.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterial?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    if (materialInfo.isutilisationDirty && materialInfo.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = this.shareService.isValidNumber((Number(materialInfo.netWeight) / materialInfo.grossWeight) * 100);
      if (materialInfo.utilisation !== null) {
        utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    // let scrapRecCost = materialInfo.scrapWeight * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg);
    // const grossMaterialCost = this.shareService.isValidNumber(materialInfo.grossWeight * (Number(materialInfo.materialPricePerKg) / 1000));
    // materialInfo.materialCostPart = grossMaterialCost;
    // if (materialInfo.scrapWeight / Number(materialInfo.netWeight) < Number(materialInfo.regrindAllowance / 100)) {
    //   scrapRecCost = this.shareService.isValidNumber(materialInfo.scrapWeight * ((Number(materialInfo.materialPricePerKg) * 0.7) / 1000));
    // } else {
    //   scrapRecCost = this.shareService.isValidNumber(
    //     (Number(materialInfo.netWeight) * Number(materialInfo.regrindAllowance / 100) * Number(materialInfo.materialPricePerKg) * 0.7) / 1000 +
    //       ((materialInfo.scrapWeight - Number(materialInfo.netWeight) * Number(materialInfo.regrindAllowance / 100)) * Number(materialInfo.scrapPricePerKg)) / 1000
    //   );
    // }

    let scrapRecCost = this.shareService.isValidNumber(Number(materialInfo.scrapWeight / 1000) * Number(materialInfo.scrapPricePerKg));
    materialInfo.scrapRecCost = scrapRecCost;

    materialInfo.netMatCost = this.shareService.isValidNumber(Number(materialInfo.grossWeight / 1000) * Number(materialInfo.materialPricePerKg));
    // materialInfo.runnerProjectedArea = (((22 / 7) * Number(materialInfo.runnerDia)) / 2) * Number(materialInfo.runnerLength);
    // if (materialInfo.volumeDiscountPer > 0) {
    //   materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    // }
    return materialInfo;
  }

  public calculationsForCompressionMolding(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto, machinesList: any = []): MaterialInfoDto {
    materialInfo.partFinish = materialInfo.partFinish || 40;

    if (materialInfo.isStdDeviationDirty && materialInfo.standardDeviation !== null) {
      materialInfo.standardDeviation = Number(materialInfo.standardDeviation);
    } else {
      let stv = this.stdev([materialInfo.wallThickessMm, materialInfo.wallAverageThickness]);
      if (materialInfo.standardDeviation !== null) {
        stv = this.shareService.checkDirtyProperty('standardDeviation', fieldColorsList) ? selectedMaterial?.standardDeviation : stv;
      }
      materialInfo.standardDeviation = stv;
    }

    if (materialInfo.isNoOfCavitiesDirty && !!materialInfo.noOfCavities) {
      materialInfo.noOfCavities = Number(materialInfo.noOfCavities);
    } else {
      let noOfCavities = this.cavityConfigService.getNumberOfCavitiesForRubberMolding(machinesList, this.currentPart, materialInfo);
      if (materialInfo.noOfCavities != null) {
        noOfCavities = this.shareService.checkDirtyProperty('noOfCavities', fieldColorsList) ? selectedMaterial?.noOfCavities : noOfCavities;
      }
      materialInfo.noOfCavities = noOfCavities;
    }

    if (materialInfo.isCavityArrangementLengthDirty && !!materialInfo.cavityArrangementLength) {
      materialInfo.cavityArrangementLength = Number(materialInfo.cavityArrangementLength);
    } else {
      let cavityArrangementLength = this.cavityConfigService.getCavityLayout(materialInfo.noOfCavities).cavitiesAlongLength;
      if (materialInfo.cavityArrangementLength !== null) {
        cavityArrangementLength = this.shareService.checkDirtyProperty('cavityArrangementLength', fieldColorsList) ? selectedMaterial?.cavityArrangementLength : cavityArrangementLength;
      }
      materialInfo.cavityArrangementLength = cavityArrangementLength;
    }

    if (materialInfo.isCavityArrangementWidthDirty && !!materialInfo.cavityArrangementWidth) {
      materialInfo.cavityArrangementWidth = Number(materialInfo.cavityArrangementWidth);
    } else {
      let cavityArrangementWidth = this.cavityConfigService.getCavityWidth(materialInfo.noOfCavities, materialInfo.cavityArrangementLength);
      if (materialInfo.cavityArrangementWidth !== null) {
        cavityArrangementWidth = this.shareService.checkDirtyProperty('cavityArrangementWidth', fieldColorsList) ? selectedMaterial?.cavityArrangementWidth : cavityArrangementWidth;
      }
      materialInfo.cavityArrangementWidth = cavityArrangementWidth;
    }

    if (materialInfo.isNetweightDirty && materialInfo.netWeight !== null) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      let netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight !== null) {
        netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    if (materialInfo.isutilisationDirty && materialInfo.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      if (materialInfo.utilisation !== null) {
        materialInfo.utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : 0.95;
      } else {
        materialInfo.utilisation = selectedMaterial?.utilisation || 0.95;
      }
    }

    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight !== null) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      const grossWeightFactor = this.plasticRubberConfigService.getGrossWeightFactorForCompression(materialInfo.netWeight);
      let grossWeight = this.shareService.isValidNumber(grossWeightFactor * Number(materialInfo.netWeight)); // this.shareService.isValidNumber(materialInfo.scrapWeight + Number(materialInfo.netWeight));
      if (materialInfo.grossWeight !== null) {
        grossWeight = this.shareService.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterial?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight !== null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = Number(materialInfo.grossWeight) - Number(materialInfo.netWeight);
      if (materialInfo.scrapWeight !== null) {
        scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    // materialInfo.materialCostPart = this.shareService.isValidNumber(materialInfo.grossWeight * (Number(materialInfo.materialPricePerKg) / 1000));
    // materialInfo.scrapRecCost = this.shareService.isValidNumber(materialInfo.scrapWeight * Number(materialInfo.scrapPricePerKg)) / 1000;

    // materialInfo.netMatCost = this.shareService.isValidNumber(materialInfo.materialCostPart - materialInfo.scrapRecCost);
    // const runnerProjectedArea = Number(materialInfo.runnerDia) * Number(materialInfo.runnerLength);
    // materialInfo.runnerProjectedArea = runnerProjectedArea;
    // // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo); // commenting for now to test calculation
    // if (materialInfo.volumeDiscountPer > 0) {
    //   materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    // }

    let scrapRecCost = this.shareService.isValidNumber(Number(materialInfo.scrapWeight / 1000) * Number(materialInfo.scrapPricePerKg));
    materialInfo.scrapRecCost = scrapRecCost;

    materialInfo.netMatCost = this.shareService.isValidNumber(Number(materialInfo.grossWeight / 1000) * Number(materialInfo.materialPricePerKg));
    return materialInfo;
  }

  public blowMolding(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto) {
    if (materialInfo.isNoOfCavitiesDirty && !!materialInfo.noOfCavities) {
      materialInfo.noOfCavities = Number(materialInfo.noOfCavities);
    } else {
      let noOfCavities = this.cavityConfigService.getNumberOfCavities(this.currentPart?.lotSize || this.currentPart?.eav / 12, materialInfo?.partProjectedArea);
      if (materialInfo.noOfCavities !== null) {
        noOfCavities = this.shareService.checkDirtyProperty('noOfCavities', fieldColorsList) ? selectedMaterial?.noOfCavities : noOfCavities;
      }
      materialInfo.noOfCavities = noOfCavities;
    }

    if (materialInfo.isCavityArrangementLengthDirty && !!materialInfo.cavityArrangementLength) {
      materialInfo.cavityArrangementLength = Number(materialInfo.cavityArrangementLength);
    } else {
      let cavityArrangementLength = this.cavityConfigService.getCavityLayout(materialInfo.noOfCavities).cavitiesAlongLength;
      if (materialInfo.cavityArrangementLength !== null) {
        cavityArrangementLength = this.shareService.checkDirtyProperty('cavityArrangementLength', fieldColorsList) ? selectedMaterial?.cavityArrangementLength : cavityArrangementLength;
      }
      materialInfo.cavityArrangementLength = cavityArrangementLength;
    }

    if (materialInfo.isCavityArrangementWidthDirty && !!materialInfo.cavityArrangementWidth) {
      materialInfo.cavityArrangementWidth = Number(materialInfo.cavityArrangementWidth);
    } else {
      let cavityArrangementWidth = this.cavityConfigService.getCavityWidth(materialInfo.noOfCavities, materialInfo.cavityArrangementLength);
      if (materialInfo.cavityArrangementWidth !== null) {
        cavityArrangementWidth = this.shareService.checkDirtyProperty('cavityArrangementWidth', fieldColorsList) ? selectedMaterial?.cavityArrangementWidth : cavityArrangementWidth;
      }
      materialInfo.cavityArrangementWidth = cavityArrangementWidth;
    }

    if (materialInfo.isNetweightDirty && materialInfo.netWeight !== null) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      let netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight !== null) {
        netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    if (materialInfo.isutilisationDirty && materialInfo.utilisation != null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = this.shareService.isValidNumber((Number(materialInfo.netWeight) / materialInfo.grossWeight) * 100);
      if (materialInfo.utilisation != null) {
        utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight != null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = Number(materialInfo.netWeight) * (4 / 100);
      if (materialInfo.scrapWeight != null) {
        scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }
    materialInfo.grossWeight = Number(materialInfo.netWeight) + Number(materialInfo.scrapWeight);

    materialInfo.materialCostPart = this.shareService.isValidNumber(materialInfo.grossWeight * (Number(materialInfo.materialPricePerKg) / 1000));
    materialInfo.scrapRecCost = this.shareService.isValidNumber(materialInfo.scrapWeight * Number(materialInfo.scrapPricePerKg)) / 1000;

    materialInfo.netMatCost = this.shareService.isValidNumber(materialInfo.materialCostPart - materialInfo.scrapRecCost);
    const runnerProjectedArea = Number(materialInfo.runnerDia) * Number(materialInfo.runnerLength);
    materialInfo.runnerProjectedArea = runnerProjectedArea;
    materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo);
    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }

    return materialInfo;
  }

  public calculationsForTransferMolding(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto, machinesList: any = []): MaterialInfoDto {
    // const materialUtilRatio = 0.9;

    if (materialInfo.isStdDeviationDirty && materialInfo.standardDeviation !== null) {
      materialInfo.standardDeviation = Number(materialInfo.standardDeviation);
    } else {
      let stv = this.stdev([materialInfo.wallThickessMm, materialInfo.wallAverageThickness]);
      if (materialInfo.standardDeviation !== null) {
        stv = this.shareService.checkDirtyProperty('standardDeviation', fieldColorsList) ? selectedMaterial?.standardDeviation : stv;
      }
      materialInfo.standardDeviation = stv;
    }

    // if (materialInfo.isRegrindAllowanceDirty && materialInfo.regrindAllowance !== null) {
    //   materialInfo.regrindAllowance = Number(materialInfo.regrindAllowance);
    // } else {
    //   let regrindAllowance = 0;
    //   if (materialInfo.regrindAllowance !== null) {
    //     regrindAllowance = this.shareService.checkDirtyProperty('regrindAllowance', fieldColorsList) ? selectedMaterial?.regrindAllowance : regrindAllowance;
    //   }
    //   materialInfo.regrindAllowance = regrindAllowance;
    // }

    // if (materialInfo.isPerimeterDirty && materialInfo.perimeter !== null) {
    //   materialInfo.perimeter = Number(materialInfo.perimeter);
    // } else {
    //   let perimeter = this.shareService.extractedMaterialData?.Perimeter;
    //   if (materialInfo.perimeter !== null) {
    //     perimeter = this.shareService.checkDirtyProperty('perimeter', fieldColorsList) ? selectedMaterial?.perimeter : perimeter;
    //   }
    //   materialInfo.perimeter = perimeter;
    // }

    if (materialInfo.isNetweightDirty && materialInfo.netWeight !== null) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      let netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight !== null) {
        netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    if (materialInfo.isNoOfCavitiesDirty && !!materialInfo.noOfCavities) {
      materialInfo.noOfCavities = Number(materialInfo.noOfCavities);
    } else {
      let noOfCavities = this.cavityConfigService.getNumberOfCavitiesForRubberMolding(machinesList, this.currentPart, materialInfo); // materialInfo?.partProjectedArea < 100000 ? 1 : 2;
      this.cavityConfigService.getNumberOfCavities(this.currentPart?.lotSize || this.currentPart?.eav / 12, materialInfo?.partProjectedArea);
      if (materialInfo.noOfCavities !== null) {
        noOfCavities = this.shareService.checkDirtyProperty('noOfCavities', fieldColorsList) ? selectedMaterial?.noOfCavities : noOfCavities;
      }
      materialInfo.noOfCavities = noOfCavities;
    }

    if (materialInfo.isCavityArrangementLengthDirty && !!materialInfo.cavityArrangementLength) {
      materialInfo.cavityArrangementLength = Number(materialInfo.cavityArrangementLength);
    } else {
      let cavityArrangementLength = this.cavityConfigService.getCavityLayout(materialInfo.noOfCavities).cavitiesAlongLength;
      if (materialInfo.cavityArrangementLength !== null) {
        cavityArrangementLength = this.shareService.checkDirtyProperty('cavityArrangementLength', fieldColorsList) ? selectedMaterial?.cavityArrangementLength : cavityArrangementLength;
      }
      materialInfo.cavityArrangementLength = cavityArrangementLength;
    }

    if (materialInfo.isCavityArrangementWidthDirty && !!materialInfo.cavityArrangementWidth) {
      materialInfo.cavityArrangementWidth = Number(materialInfo.cavityArrangementWidth);
    } else {
      let cavityArrangementWidth = this.cavityConfigService.getCavityWidth(materialInfo.noOfCavities, materialInfo.cavityArrangementLength);
      if (materialInfo.cavityArrangementWidth !== null) {
        cavityArrangementWidth = this.shareService.checkDirtyProperty('cavityArrangementWidth', fieldColorsList) ? selectedMaterial?.cavityArrangementWidth : cavityArrangementWidth;
      }
      materialInfo.cavityArrangementWidth = cavityArrangementWidth;
    }

    // materialInfo.grossWeight = this.shareService.isValidNumber(materialInfo.netWeight / materialUtilRatio);

    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight !== null) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      const grossWeightFactor = this.plasticRubberConfigService.getGrossWeightFactorForTransferMolding(materialInfo.netWeight);
      let grossWeight = this.shareService.isValidNumber(grossWeightFactor * Number(materialInfo.netWeight)); // this.shareService.isValidNumber(materialInfo.scrapWeight + Number(materialInfo.netWeight));
      if (materialInfo.grossWeight !== null) {
        grossWeight = this.shareService.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterial?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight !== null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = this.shareService.isValidNumber(Number(materialInfo.grossWeight - materialInfo.netWeight));
      if (materialInfo.scrapWeight !== null) {
        scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    if (materialInfo.isutilisationDirty && materialInfo.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = this.shareService.isValidNumber((Number(materialInfo.netWeight) / materialInfo.grossWeight) * 100);
      if (materialInfo.utilisation !== null) {
        utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    // materialInfo.grossWeight = Number(materialInfo.netWeight) + Number(materialInfo.scrapWeight);

    // materialInfo.materialCostPart = this.shareService.isValidNumber(materialInfo.grossWeight * (Number(materialInfo.materialPricePerKg) / 1000));
    // materialInfo.scrapRecCost = this.shareService.isValidNumber(materialInfo.scrapWeight * Number(materialInfo.scrapPricePerKg)) / 1000;

    // materialInfo.netMatCost = this.shareService.isValidNumber(materialInfo.materialCostPart - materialInfo.scrapRecCost);

    let scrapRecCost = this.shareService.isValidNumber(Number(materialInfo.scrapWeight / 1000) * Number(materialInfo.scrapPricePerKg));
    materialInfo.scrapRecCost = scrapRecCost;

    materialInfo.netMatCost = this.shareService.isValidNumber(Number(materialInfo.grossWeight / 1000) * Number(materialInfo.materialPricePerKg));

    return materialInfo;
  }

  public calculationsForRubberExtrusion(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): MaterialInfoDto {
    if (materialInfo.isutilisationDirty && materialInfo.utilisation != null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      if (materialInfo.utilisation != null) {
        materialInfo.utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : 0.95;
      }
    }
    materialInfo.grossWeight = Number(materialInfo.netWeight) / Number(materialInfo.utilisation);

    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight != null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = Number(materialInfo.grossWeight) - Number(materialInfo.netWeight);
      if (materialInfo.scrapWeight != null) {
        scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    materialInfo.materialCostPart = this.shareService.isValidNumber(materialInfo.grossWeight * (Number(materialInfo.materialPricePerKg) / 1000));
    materialInfo.scrapRecCost = this.shareService.isValidNumber(materialInfo.scrapWeight * Number(materialInfo.scrapPricePerKg)) / 1000;

    materialInfo.netMatCost = this.shareService.isValidNumber(materialInfo.materialCostPart - materialInfo.scrapRecCost);
    const runnerProjectedArea = Number(materialInfo.runnerDia) * Number(materialInfo.runnerLength);
    materialInfo.runnerProjectedArea = runnerProjectedArea;
    materialInfo.volumeDiscountPer = materialInfo?.volumeDiscountPer ?? this.getVolumeDiscount(materialInfo);
    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }
    return materialInfo;
    // return new Observable((obs) => {
    //   obs.next(materialInfo);
    // });
  }

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
  public calculationsForPlasticVacuumForming(materialInfo: MaterialInfoDto): MaterialInfoDto {
    return materialInfo;
  }

  async getSupplier() {
    await this.vendorService.getVendorList().subscribe((result: VendorDto[]) => {
      if (result && result?.length > 0) {
        this.vendorDto = [...result];
      }
    });
  }

  // private getPartDetailsById() {
  //   this._partInfo$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: PartInfoDto) => {
  //     if (result) {
  //       this.currentPart = {
  //         ...result,
  //       };
  //     }
  //   });
  // }

  private getSupplierRevenueValue(revValueType: number, revMapList: Map<number, string>) {
    for (const item of revMapList) {
      if (item[0] === revValueType) {
        return item[0];
      }
    }
    return '';
  }

  getVolumeDiscount(materialInfo: MaterialInfoDto) {
    let volumeDiscountPer: number = 0;
    let materialdeta = new MaterialMasterDto();
    // this.getPartDetailsById();
    this.getSupplier();
    if (materialInfo?.materialDescriptionList?.length > 0) {
      materialdeta = materialInfo?.materialDescriptionList?.find((x) => x?.materialMasterId == Number(materialInfo?.materialMasterId));
    }
    let supplierRevenue;
    if (this.currentPart !== null && this.vendorDto?.length > 0) {
      const supplier = this.currentPart?.supplierInfoId && this.currentPart?.supplierInfoId > 0 ? this.vendorDto?.find((x) => x?.id == this.currentPart?.supplierInfoId) : null;
      supplierRevenue = supplier !== null && supplier?.anulRevType > 0 ? this.getSupplierRevenueValue(supplier?.anulRevType, AnnualRevenueTypeNameMap) : null;
    }
    if (supplierRevenue === AnnualRevenueTypeEnum.FIVEMTO25M) {
      volumeDiscountPer = this.shareService.isValidNumber(materialdeta?.oneMTDiscount);
    } else if (supplierRevenue === AnnualRevenueTypeEnum.TWENTYFIVEMTO100M) {
      volumeDiscountPer = this.shareService.isValidNumber(materialdeta?.twentyFiveMTDiscount);
    } else if (supplierRevenue === AnnualRevenueTypeEnum.MT100M) {
      volumeDiscountPer = this.shareService.isValidNumber(materialdeta?.fiftyMTDiscount);
    } else {
      volumeDiscountPer = 1.0;
    }
    return volumeDiscountPer;
  }

  stdev(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0; // Standard deviation is undefined for <2 values

    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
    return Math.sqrt(variance);
  }
}
