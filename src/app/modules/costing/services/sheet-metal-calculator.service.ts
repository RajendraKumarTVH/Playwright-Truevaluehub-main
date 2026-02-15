import { Injectable } from '@angular/core';
import { MaterialInfoDto, PartInfoDto, VendorDto } from 'src/app/shared/models';
import { Observable, Subject } from 'rxjs';
import { SharedService } from './shared.service';
// import { PartInfoState } from '../../_state/part-info.state';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';
import { StampingMetrialLookUp } from 'src/app/shared/models/sheet-metal-lookup.model';
import { StampingMetrialLookUpState } from '../../_state/stamping-material-lookup.state';
import { SheetMetalConfigService } from 'src/app/shared/config/sheetmetal-config';
import { MaterialSustainabilityCalculationService } from './material-sustainability-calculator.service';
import { PrimaryProcessType } from 'src/app/modules/costing/costing.config';
import { WeldingConfigService } from 'src/app/shared/config/welding-config';
import { IMaterialCalculationByCommodity } from './IMaterialCalculationByCommodity';
import { MaterialInsulationJacketCalculatorService } from './material-insulation-jacket-calculator.service';

@Injectable({
  providedIn: 'root',
})
export class SheetMetalCalculatorService implements IMaterialCalculationByCommodity {
  _stampingMetrialLookUpData: StampingMetrialLookUp[] = [];
  isEnableUnitConversion = false;
  conversionValue: any;
  currentPart: PartInfoDto;
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  vendorDto: VendorDto[] = [];
  // _partInfo$: Observable<PartInfoDto>;
  _stampingMetrialLookUp$: Observable<StampingMetrialLookUp[]>;
  constructor(
    private shareService: SharedService,
    public _sheetMetalConfig: SheetMetalConfigService,
    public _materialSustainabilityCalcService: MaterialSustainabilityCalculationService,
    private store: Store,
    private weldingConfigService: WeldingConfigService,
    private materialForgingService: MaterialInsulationJacketCalculatorService
  ) {
    // this._partInfo$ = this.store.select(PartInfoState.getPartInfo);
    this._stampingMetrialLookUp$ = this.store.select(StampingMetrialLookUpState.getStampingMetrialLookUp);
    this._stampingMetrialLookUp$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((response) => {
      if (response && response.length > 0) {
        this._stampingMetrialLookUpData = response;
      }
    });
    [this.isEnableUnitConversion, this.conversionValue] = this.shareService.setUnitMeasurement();
  }

  setCurrentPart(part: PartInfoDto) {
    this.currentPart = part;
  }

  CalculateMaterialCost(processId: number, materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): MaterialInfoDto {
    switch (processId) {
      case PrimaryProcessType.LaserCutting:
        return this.calculationsForCutting(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.PlasmaCutting:
        return this.calculationsForPlasmaCutting(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.OxyCutting:
        return this.calculationsForOxyCutting(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.TubeLaserCutting:
        return this.calculationsForTubeLaserCutting(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.TurretPunch:
        return this.calculationsForTPP(materialInfo, fieldColorsList, selectedMaterial);

      case PrimaryProcessType.StampingProgressive:
      case PrimaryProcessType.StampingStage:
        return this.calculationsForStamping(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.TransferPress:
        return this.calculationsForTransferPress(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.SpotWelding:
      case PrimaryProcessType.SeamWelding:
        return materialInfo;
      case PrimaryProcessType.MigWelding:
      case PrimaryProcessType.TigWelding:
        return this.calculationsForWeldingSubMaterial(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.StickWelding:
        return this.calculationsForCutting(materialInfo, fieldColorsList, selectedMaterial);
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
        return this.materialForgingService.calculationsForPlating(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.Galvanization:
      case PrimaryProcessType.WetPainting:
      case PrimaryProcessType.SiliconCoatingAuto:
      case PrimaryProcessType.SiliconCoatingSemi:
        return this.materialForgingService.calculationsForCoating(materialInfo, fieldColorsList, selectedMaterial);

      default:
        return materialInfo;
    }
  }
  public calculationsForCutting(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto) {
    let netWeight = 0;
    if (materialInfo.isNetweightDirty && materialInfo.netWeight !== null) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight !== null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
    }
    materialInfo.netWeight = netWeight;

    if (!materialInfo.dimUnfoldedZ) {
      materialInfo.dimUnfoldedZ = selectedMaterial.dimUnfoldedZ;
    }

    if (materialInfo?.isPartAllowanceDirty && materialInfo?.partAllowance !== null) {
      materialInfo.partAllowance = Number(materialInfo?.partAllowance);
    } else {
      // if (Number(materialInfo.dimUnfoldedZ) < 4) {
      //   materialInfo.partAllowance = Number(materialInfo.dimUnfoldedZ) * 1.5;
      // } else if (Number(materialInfo.dimUnfoldedZ) < 20) {
      //   materialInfo.partAllowance = 5;
      // }

      if (Number(materialInfo.dimUnfoldedZ) < 2.5) materialInfo.partAllowance = 2;
      if (Number(materialInfo.dimUnfoldedZ) >= 2.5 && Number(materialInfo.dimUnfoldedZ) <= 3.15) materialInfo.partAllowance = 3;
      if (Number(materialInfo.dimUnfoldedZ) > 3.15 && Number(materialInfo.dimUnfoldedZ) < 5) materialInfo.partAllowance = 4;
      if (Number(materialInfo.dimUnfoldedZ) >= 5 && Number(materialInfo.dimUnfoldedZ) <= 6.35) materialInfo.partAllowance = 5;
      if (Number(materialInfo.dimUnfoldedZ) > 6.35 && Number(materialInfo.dimUnfoldedZ) <= 8) materialInfo.partAllowance = 6;
      if (Number(materialInfo.dimUnfoldedZ) > 8 && Number(materialInfo.dimUnfoldedZ) < 10) materialInfo.partAllowance = 8;
      if (Number(materialInfo.dimUnfoldedZ) >= 10 && Number(materialInfo.dimUnfoldedZ) <= 12.7) materialInfo.partAllowance = 10;
      if (Number(materialInfo.dimUnfoldedZ) > 12.7 && Number(materialInfo.dimUnfoldedZ) <= 16) materialInfo.partAllowance = 12;
      if (Number(materialInfo.dimUnfoldedZ) > 16) materialInfo.partAllowance = 15;

      if (materialInfo?.partAllowance !== null) {
        materialInfo.partAllowance = this.checkDirtyProperty('partAllowance', fieldColorsList) ? selectedMaterial?.partAllowance : materialInfo.partAllowance;
      }
    }

    // // Edge Allowances
    // if (materialInfo?.isRunnerTypeDirty && materialInfo?.runnerType !== null) {
    //   materialInfo.runnerType = materialInfo?.runnerType;
    // } else {
    //   const edgeAllownces = 'Uniform';

    //   if (materialInfo?.runnerType !== null) {
    //     materialInfo.runnerType = this.checkDirtyProperty('runnerType', fieldColorsList) ? selectedMaterial?.runnerType : edgeAllownces;
    //   }
    // }

    // Edge Allowance
    if (materialInfo?.isMoldBoxLengthDirty && materialInfo?.moldBoxLength !== null) {
      materialInfo.moldBoxLength = Number(materialInfo?.moldBoxLength);
    } else {
      if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldBoxLength = 3;
      if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldBoxLength = 1.5 * Number(materialInfo.dimUnfoldedZ);
      if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldBoxLength = 10;
      if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldBoxLength = 12.5;

      if (materialInfo?.moldBoxLength !== null) {
        materialInfo.moldBoxLength = this.checkDirtyProperty('moldBoxLength', fieldColorsList) ? selectedMaterial?.moldBoxLength : materialInfo.moldBoxLength;
      }
      if (materialInfo?.partShape === 'Applicable') {
        materialInfo.runnerLength = 10; // 10 - materialInfo.moldBoxLength;
        materialInfo.runnerDia = 10; // 10 - materialInfo.moldBoxLength;
      }
    }

    // if (materialInfo?.runnerType === 'Uniform') {
    //   materialInfo.moldBoxWidth = materialInfo.moldBoxLength;
    //   materialInfo.moldBoxHeight = materialInfo.moldBoxLength;
    //   materialInfo.moldSandWeight = materialInfo.moldBoxLength;
    // } else {
    //   // Left Edge Allowance(D)
    //   if (materialInfo?.isMoldBoxWidthDirty && materialInfo?.moldBoxWidth !== null) {
    //     materialInfo.moldBoxWidth = Number(materialInfo?.moldBoxWidth);
    //   } else {
    //     if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldBoxWidth = 3;
    //     if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldBoxWidth = 1.5 * Number(materialInfo.dimUnfoldedZ);
    //     if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldBoxWidth = 10;
    //     if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldBoxWidth = 12.5;

    //     if (materialInfo?.moldBoxWidth !== null) {
    //       materialInfo.moldBoxWidth = this.checkDirtyProperty('moldBoxWidth', fieldColorsList) ? selectedMaterial?.moldBoxWidth : materialInfo.moldBoxWidth;
    //     }
    //   }

    //   // Top Edge Allowance(S)
    //   if (materialInfo?.isMoldBoxHeightDirty && materialInfo?.moldBoxHeight !== null) {
    //     materialInfo.moldBoxHeight = Number(materialInfo?.moldBoxHeight);
    //   } else {
    //     if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldBoxHeight = 3;
    //     if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldBoxHeight = 1.5 * Number(materialInfo.dimUnfoldedZ);
    //     if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldBoxHeight = 10;
    //     if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldBoxHeight = 12.5;

    //     if (materialInfo?.moldBoxHeight !== null) {
    //       materialInfo.moldBoxHeight = this.checkDirtyProperty('moldBoxHeight', fieldColorsList) ? selectedMaterial?.moldBoxHeight : materialInfo.moldBoxHeight;
    //     }
    //   }

    //   // Right Edge Allowance(N)
    //   if (materialInfo?.isMoldSandWeightDirty && materialInfo?.moldSandWeight !== null) {
    //     materialInfo.moldSandWeight = Number(materialInfo?.moldSandWeight);
    //   } else {
    //     if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldSandWeight = 3;
    //     if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldSandWeight = 1.5 * Number(materialInfo.dimUnfoldedZ);
    //     if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldSandWeight = 10;
    //     if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldSandWeight = 12.5;

    //     if (materialInfo?.moldSandWeight !== null) {
    //       materialInfo.moldSandWeight = this.checkDirtyProperty('moldSandWeight', fieldColorsList) ? selectedMaterial?.moldSandWeight : materialInfo.moldSandWeight;
    //     }
    //   }
    // }

    // Clamping Allowances
    if (materialInfo?.isPartShapeDirty && materialInfo?.partShape !== null) {
      materialInfo.partShape = materialInfo?.partShape || '';
    } else {
      let clampingAllownces = 'Not Applicable';

      if (materialInfo?.partShape !== null) {
        clampingAllownces = this.checkDirtyProperty('partShape', fieldColorsList) ? selectedMaterial?.partShape : clampingAllownces;
      }
      materialInfo.partShape = clampingAllownces;
    }

    // Bottom Clamping A
    if (materialInfo?.isRunnerDiaDirty && materialInfo?.runnerDia !== null) {
      materialInfo.runnerDia = Number(materialInfo?.runnerDia);
    } else {
      let bottomClampingA = 0;
      if (materialInfo.partShape === 'Not Applicable') {
        bottomClampingA = 0;
      } else {
        bottomClampingA = 10; // 10 - materialInfo.moldBoxLength;
      }

      if (materialInfo?.runnerDia !== null) {
        bottomClampingA = this.checkDirtyProperty('runnerDia', fieldColorsList) ? selectedMaterial?.runnerDia : bottomClampingA;
      }
      materialInfo.runnerDia = bottomClampingA;
    }

    // Left Clamping B
    if (materialInfo?.partShape === 'Applicable') {
      materialInfo.runnerLength = materialInfo.runnerDia;
    } else {
      if (materialInfo?.isRunnerLengthDirty && materialInfo?.runnerLength !== null) {
        materialInfo.runnerLength = Number(materialInfo?.runnerLength);
      } else {
        let leftClampingB = 0;
        if (materialInfo.partShape === 'Not Applicable') {
          leftClampingB = 0;
        } else {
          leftClampingB = 10; // 10 - materialInfo.moldBoxLength;
        }

        if (materialInfo?.runnerLength !== null) {
          leftClampingB = this.checkDirtyProperty('runnerLength', fieldColorsList) ? selectedMaterial?.runnerLength : leftClampingB;
        }
        materialInfo.runnerLength = leftClampingB;
      }
    }

    if (materialInfo.partShape === 'Not Applicable') {
      materialInfo.runnerLength = 0;
      materialInfo.runnerDia = 0;
    }

    const bestUtilisation = this._sheetMetalConfig.getBestUtilisationForSheetMetal(materialInfo);

    if (materialInfo.isPartsPerCoilDirty && materialInfo?.partsPerCoil !== null) {
      materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
    } else {
      let partsPerCoil = bestUtilisation?.partsPerCoil;
      // Math.trunc(
      //   this.isValidNumber(
      //     ((materialInfo.coilWidth - edgeAllowance) * (materialInfo.coilLength - edgeAllowance)) /
      //       ((materialInfo.dimUnfoldedX + materialInfo.partAllowance) * (materialInfo.dimUnfoldedY + materialInfo.partAllowance))
      //   )
      // );
      if (materialInfo?.partsPerCoil !== null) {
        partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterial?.partsPerCoil : Math.trunc(partsPerCoil);
      }
      materialInfo.partsPerCoil = this.shareService.isValidNumber(partsPerCoil);
    }

    if (materialInfo.isCoilLengthDirty && !!materialInfo?.coilLength) {
      materialInfo.coilLength = Number(materialInfo?.coilLength);
    } else {
      let coilLength = bestUtilisation?.sheetLength;
      if (materialInfo?.coilLength !== null) {
        coilLength = this.checkDirtyProperty('coilLength', fieldColorsList) ? selectedMaterial?.coilLength : coilLength;
      }
      materialInfo.coilLength = coilLength;
    }

    if (materialInfo.isCoilWidthDirty && !!materialInfo?.coilWidth) {
      materialInfo.coilWidth = Number(materialInfo?.coilWidth);
    } else {
      let coilWidth = bestUtilisation?.sheetWidth;
      if (materialInfo?.coilWidth !== null) {
        coilWidth = this.checkDirtyProperty('coilWidth', fieldColorsList) ? selectedMaterial?.coilWidth : coilWidth;
      }
      materialInfo.coilWidth = coilWidth;
    }

    if (materialInfo.isUnbendPartWeightDirty && materialInfo.unbendPartWeight !== null) {
      materialInfo.unbendPartWeight = Number(materialInfo.unbendPartWeight);
    } else {
      let unbendPartWeight = this.isValidNumber((materialInfo.unfoldedPartVolume * materialInfo.density) / 1000);
      if (materialInfo?.unbendPartWeight !== null) {
        unbendPartWeight = this.checkDirtyProperty('unbendPartWeight', fieldColorsList) ? selectedMaterial?.unbendPartWeight : unbendPartWeight;
      }
      materialInfo.unbendPartWeight = unbendPartWeight;
    }
    if (materialInfo.isutilisationDirty && materialInfo.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = 0;
      let partsPerCoil = 0;
      if (
        materialInfo.isCoilLengthDirty ||
        materialInfo.isCoilWidthDirty ||
        materialInfo.isMoldBoxLengthDirty ||
        materialInfo.isPartShapeDirty ||
        materialInfo.isRunnerDiaDirty ||
        materialInfo.isRunnerLengthDirty ||
        materialInfo?.isPartAllowanceDirty
      ) {
        const utilisationByCoil = this._sheetMetalConfig.getCustomSheetUtilizationData(materialInfo);
        partsPerCoil = utilisationByCoil?.highestParts;
        materialInfo.sheetWeight = utilisationByCoil?.weight;
        materialInfo.coilWeight = utilisationByCoil?.weight;
        utilisation = utilisationByCoil?.utilization;
        // materialInfo.sheetWeight = this.isValidNumber((Number(materialInfo.coilWidth) * Number(materialInfo.coilLength) * Number(materialInfo.dimUnfoldedZ) * Number(materialInfo.density)) / 1000);
        // utilisation = this.shareService.isValidNumber(((materialInfo.partsPerCoil * materialInfo.netWeight) / materialInfo.sheetWeight) * 100);
      } else {
        if (
          this.checkDirtyProperty('coilWidth', fieldColorsList) ||
          this.checkDirtyProperty('coilLength', fieldColorsList) ||
          this.checkDirtyProperty('moldBoxLength', fieldColorsList) ||
          this.checkDirtyProperty('partShape', fieldColorsList) ||
          this.checkDirtyProperty('runnerDia', fieldColorsList) ||
          this.checkDirtyProperty('runnerLength', fieldColorsList) ||
          this.checkDirtyProperty('partAllowance', fieldColorsList)
        ) {
          const utilisationByCoil = this._sheetMetalConfig.getCustomSheetUtilizationData(materialInfo);
          partsPerCoil = utilisationByCoil?.highestParts;
          materialInfo.sheetWeight = utilisationByCoil?.weight;
          materialInfo.coilWeight = utilisationByCoil?.weight;
          utilisation = utilisationByCoil?.utilization;
        } else {
          const bestUtilisation = this._sheetMetalConfig.getBestUtilisationForSheetMetal(materialInfo);
          utilisation = bestUtilisation?.utilisation;
          materialInfo.coilWidth = this.shareService.isValidNumber(bestUtilisation?.sheetWidth);
          materialInfo.coilLength = this.shareService.isValidNumber(bestUtilisation?.sheetLength);
          partsPerCoil = bestUtilisation?.partsPerCoil;
          materialInfo.sheetWeight = this.shareService.isValidNumber(bestUtilisation?.sheetWeight);
          materialInfo.coilWeight = this.shareService.isValidNumber(bestUtilisation?.sheetWeight);
        }
      }
      if (materialInfo.utilisation !== null || materialInfo.utilisation !== 0) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = this.shareService.isValidNumber(utilisation);

      if (materialInfo.isPartsPerCoilDirty && materialInfo?.partsPerCoil !== null) {
        materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
      } else {
        if (materialInfo?.partsPerCoil !== null) {
          partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterial?.partsPerCoil : Math.trunc(partsPerCoil);
        }
        materialInfo.partsPerCoil = this.shareService.isValidNumber(partsPerCoil);
      }
    }

    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight !== null) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      let grossWeight = this.shareService.isValidNumber((materialInfo?.netWeight / materialInfo.utilisation) * 100);
      if (materialInfo?.grossWeight !== null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterial?.grossWeight : Number(grossWeight);
      }
      materialInfo.grossWeight = this.shareService.isValidNumber(grossWeight);
    }

    if (materialInfo?.isScrapRecoveryDirty && materialInfo.scrapRecovery !== null) {
      materialInfo.scrapRecovery = Number(materialInfo.scrapRecovery);
    } else {
      let scrapRecovery = 90;
      if (materialInfo?.scrapRecovery !== null) {
        scrapRecovery = this.shareService.checkDirtyProperty('scrapRecovery', fieldColorsList) ? selectedMaterial?.scrapRecovery : scrapRecovery;
      }
      materialInfo.scrapRecovery = scrapRecovery;
    }

    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight !== null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = this.isValidNumber(materialInfo.grossWeight - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight !== null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : Number(scrapWeight);
      }
      materialInfo.scrapWeight = this.shareService.isValidNumber(scrapWeight);
    }

    materialInfo.materialCostPart = this.isValidNumber((Number(materialInfo.grossWeight) * Number(materialInfo.materialPricePerKg)) / 1000);
    materialInfo.scrapRecCost = this.isValidNumber((Number(materialInfo.scrapWeight) * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg)) / 1000);
    materialInfo.netMatCost = materialInfo.materialCostPart - materialInfo.scrapRecCost;
    // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo);

    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }

    return materialInfo;
    // return new Observable((obs) => {
    //   obs.next(materialInfo);
    // });
  }

  public calculationsForTubeLaserCutting(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto) {
    // Cross Section Shape
    if (materialInfo?.isPartShapeDirty && materialInfo?.partShape !== null) {
      materialInfo.partShape = materialInfo?.partShape;
    } else {
      let crossSectionShape = 'Rectangular';
      if (materialInfo?.partShape !== null) {
        crossSectionShape = this.checkDirtyProperty('partShape', fieldColorsList) ? selectedMaterial?.partShape : crossSectionShape;
      }
      materialInfo.partShape = crossSectionShape;
    }

    // Side A
    if (materialInfo?.isMoldBoxLengthDirty && materialInfo?.moldBoxLength !== null) {
      materialInfo.moldBoxLength = Number(materialInfo?.moldBoxLength);
    } else {
      let sideA = this.shareService.isValidNumber(this.shareService.extractedMaterialData?.DimY);
      if (materialInfo?.moldBoxLength !== null) {
        sideA = this.checkDirtyProperty('moldBoxLength', fieldColorsList) ? selectedMaterial?.moldBoxLength : sideA;
      }
      materialInfo.moldBoxLength = sideA;
    }

    // Side B
    if (materialInfo?.isMoldBoxWidthDirty && materialInfo?.moldBoxWidth !== null) {
      materialInfo.moldBoxWidth = Number(materialInfo?.moldBoxWidth);
    } else {
      let sideB = this.shareService.isValidNumber(this.shareService.extractedMaterialData?.DimZ);
      if (materialInfo?.moldBoxWidth !== null) {
        sideB = this.checkDirtyProperty('moldBoxWidth', fieldColorsList) ? selectedMaterial?.moldBoxWidth : sideB;
      }
      materialInfo.moldBoxWidth = sideB;
    }

    // Thickness
    if (materialInfo?.ispaintCoatingTicknessDirty && materialInfo?.paintCoatingTickness !== null) {
      materialInfo.moldBoxWidth = Number(materialInfo?.paintCoatingTickness);
    } else {
      let thickness = this.shareService.isValidNumber(this.shareService.extractedMaterialData?.DimUnfoldedZ);
      if (materialInfo?.paintCoatingTickness !== null) {
        thickness = this.checkDirtyProperty('paintCoatingTickness', fieldColorsList) ? selectedMaterial?.paintCoatingTickness : thickness;
      }
      materialInfo.paintCoatingTickness = thickness;
    }

    // Tube Length (L) (mm)
    if (materialInfo?.isCoilLengthDirty && materialInfo?.coilLength !== null) {
      materialInfo.coilLength = Number(materialInfo?.coilLength);
    } else {
      let tubeLength = this.shareService.isValidNumber(this.shareService.extractedMaterialData?.DimX);
      if (materialInfo?.coilLength !== null) {
        tubeLength = this.checkDirtyProperty('coilLength', fieldColorsList) ? selectedMaterial?.coilLength : tubeLength;
      }
      materialInfo.coilLength = tubeLength;
    }

    // Stock Length (L) (mm)
    if (materialInfo?.isCoilWidthDirty && materialInfo?.coilWidth !== null) {
      materialInfo.coilWidth = Number(materialInfo?.coilWidth);
    } else {
      let stockLength = 6000;
      if (materialInfo?.coilWidth !== null) {
        stockLength = this.checkDirtyProperty('coilWidth', fieldColorsList) ? selectedMaterial?.coilWidth : stockLength;
      }
      materialInfo.coilWidth = stockLength;
    }

    // Stock tube Weight (gms)
    if (materialInfo?.isMoldSandWeightDirty && materialInfo?.moldSandWeight !== null) {
      materialInfo.moldSandWeight = Number(materialInfo?.moldSandWeight);
    } else {
      let stockTubeWeight = 0;
      if (materialInfo.partShape === 'Circular') {
        stockTubeWeight = this.shareService.isValidNumber(
          ((3.14 / 4) *
            (Number(materialInfo.moldBoxLength) ** 2 - (Number(materialInfo.moldBoxLength) - Number(materialInfo.paintCoatingTickness) * 2) ** 2) *
            Number(materialInfo.coilWidth) *
            Number(materialInfo.density)) /
            1000
        );
      } else {
        stockTubeWeight = this.shareService.isValidNumber(
          ((Number(materialInfo.moldBoxLength) * Number(materialInfo.moldBoxWidth) -
            (Number(materialInfo.moldBoxLength) - 2 * Number(materialInfo.paintCoatingTickness)) * (Number(materialInfo.moldBoxWidth) - 2 * Number(materialInfo.paintCoatingTickness))) *
            Number(materialInfo.coilWidth) *
            Number(materialInfo.density)) /
            1000
        );
      }
      if (materialInfo?.moldSandWeight !== null) {
        stockTubeWeight = this.checkDirtyProperty('moldSandWeight', fieldColorsList) ? selectedMaterial?.moldSandWeight : stockTubeWeight;
      }
      materialInfo.moldSandWeight = stockTubeWeight;
    }

    // Part Cutting Allowance (mm)
    if (materialInfo?.isRunnerDiaDirty && materialInfo?.runnerDia !== null) {
      materialInfo.runnerDia = Number(materialInfo?.runnerDia);
    } else {
      let partCuttingAllowance = this.shareService.isValidNumber(Number(materialInfo.paintCoatingTickness) * 2 * 1.5);
      if (materialInfo?.runnerDia !== null) {
        partCuttingAllowance = this.checkDirtyProperty('runnerDia', fieldColorsList) ? selectedMaterial?.runnerDia : partCuttingAllowance;
      }
      materialInfo.runnerDia = partCuttingAllowance;
    }

    // No: of parts from Stock tube
    if (materialInfo?.isPartsPerCoilDirty && materialInfo?.partsPerCoil !== null) {
      materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
    } else {
      let noOfParts = Math.floor(Number(materialInfo.coilWidth) / (Number(materialInfo.coilLength) + Number(materialInfo.runnerDia)));
      if (materialInfo?.partsPerCoil !== null) {
        noOfParts = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterial?.partsPerCoil : noOfParts;
      }
      materialInfo.partsPerCoil = noOfParts;
    }

    let netWeight = 0;
    if (materialInfo.isNetweightDirty && materialInfo.netWeight !== null) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      if (materialInfo.partShape === 'Circular') {
        netWeight = this.shareService.isValidNumber(
          ((3.14 / 4) *
            (Number(materialInfo.moldBoxLength) ** 2 - (Number(materialInfo.moldBoxLength) - Number(materialInfo.paintCoatingTickness) * 2) ** 2) *
            Number(materialInfo.coilLength) *
            Number(materialInfo.density)) /
            1000
        );
      } else {
        netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      }
      if (materialInfo.netWeight !== null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
    }
    materialInfo.netWeight = netWeight;

    // const startEndScrapLength = this.shareService.isValidNumber(Number(materialInfo.coilWidth) - Number(materialInfo.coilLength) * Number(materialInfo.partsPerCoil)); // mm

    if (materialInfo.isutilisationDirty && materialInfo?.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo?.utilisation);
    } else {
      let utilisation = this.shareService.isValidNumber(((materialInfo.partsPerCoil * Number(materialInfo.netWeight)) / Number(materialInfo.moldSandWeight)) * 100);
      if (materialInfo?.utilisation !== null) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight !== null) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      let grossWeight = this.shareService.isValidNumber((materialInfo?.netWeight / materialInfo.utilisation) * 100);
      if (materialInfo?.grossWeight !== null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterial?.grossWeight : Number(grossWeight);
      }
      materialInfo.grossWeight = this.shareService.isValidNumber(grossWeight);
    }

    if (materialInfo?.isScrapRecoveryDirty && materialInfo.scrapRecovery !== null) {
      materialInfo.scrapRecovery = Number(materialInfo.scrapRecovery);
    } else {
      let scrapRecovery = 90;
      if (materialInfo?.scrapRecovery !== null) {
        scrapRecovery = this.shareService.checkDirtyProperty('scrapRecovery', fieldColorsList) ? selectedMaterial?.scrapRecovery : scrapRecovery;
      }
      materialInfo.scrapRecovery = scrapRecovery;
    }

    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight !== null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = this.isValidNumber(materialInfo.grossWeight - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight !== null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : Number(scrapWeight);
      }
      materialInfo.scrapWeight = this.shareService.isValidNumber(scrapWeight);
    }

    materialInfo.materialCostPart = this.isValidNumber((Number(materialInfo.grossWeight) * Number(materialInfo.materialPricePerKg)) / 1000);
    materialInfo.scrapRecCost = this.isValidNumber((Number(materialInfo.scrapWeight) * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg)) / 1000);
    materialInfo.netMatCost = materialInfo.materialCostPart - materialInfo.scrapRecCost;
    // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo);

    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }

    return materialInfo;
  }

  public calculationsForPlasmaCutting(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto) {
    //: Observable<MaterialInfoDto>
    // const edgeAllowance = 2;

    let netWeight = 0;
    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight !== null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
    }
    materialInfo.netWeight = netWeight;

    if (!materialInfo.dimUnfoldedZ) {
      materialInfo.dimUnfoldedZ = selectedMaterial.dimUnfoldedZ;
    }

    if (materialInfo?.isPartAllowanceDirty && materialInfo?.partAllowance !== null) {
      materialInfo.partAllowance = Number(materialInfo?.partAllowance);
    } else {
      const z = Number(materialInfo.dimUnfoldedZ);

      if (z < 6.0) materialInfo.partAllowance = 5;
      if (z >= 6.0 && z <= 8) materialInfo.partAllowance = 6;
      if (z > 8 && z < 10) materialInfo.partAllowance = 8;
      if (z >= 10 && z <= 12.7) materialInfo.partAllowance = 10;
      if (z > 12.7 && z < 18) materialInfo.partAllowance = 12;
      if (z >= 18 && z < 20) materialInfo.partAllowance = 15;
      if (z >= 20 && z <= 25.4) materialInfo.partAllowance = 16;
      if (z > 25.4 && z <= 38) materialInfo.partAllowance = 18;
      if (z > 38 && z <= 55) materialInfo.partAllowance = 20;
      if (z > 55) materialInfo.partAllowance = 22;

      if (materialInfo?.partAllowance !== null) {
        materialInfo.partAllowance = this.checkDirtyProperty('partAllowance', fieldColorsList) ? selectedMaterial?.partAllowance : materialInfo.partAllowance;
      }
    }

    // // Edge Allowances
    // if (materialInfo?.isRunnerTypeDirty && materialInfo?.runnerType !== null) {
    //   materialInfo.runnerType = materialInfo?.runnerType;
    // } else {
    //   const edgeAllownces = 'Uniform';

    //   if (materialInfo?.runnerType !== null) {
    //     materialInfo.runnerType = this.checkDirtyProperty('runnerType', fieldColorsList) ? selectedMaterial?.runnerType : edgeAllownces;
    //   }
    // }

    // Edge Allowance
    if (materialInfo?.isMoldBoxLengthDirty && materialInfo?.moldBoxLength !== null) {
      materialInfo.moldBoxLength = Number(materialInfo?.moldBoxLength);
    } else {
      if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldBoxLength = 3;
      if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldBoxLength = 1.5 * Number(materialInfo.dimUnfoldedZ);
      if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldBoxLength = 10;
      if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldBoxLength = 12.5;

      if (materialInfo?.moldBoxLength !== null) {
        materialInfo.moldBoxLength = this.checkDirtyProperty('moldBoxLength', fieldColorsList) ? selectedMaterial?.moldBoxLength : materialInfo.moldBoxLength;
      }
      if (materialInfo?.partShape === 'Applicable') {
        materialInfo.runnerLength = 10; // 10 - materialInfo.moldBoxLength;
        materialInfo.runnerDia = 10; // 10 - materialInfo.moldBoxLength;
      }
    }

    // if (materialInfo?.runnerType === 'Uniform') {
    //   materialInfo.moldBoxWidth = materialInfo.moldBoxLength;
    //   materialInfo.moldBoxHeight = materialInfo.moldBoxLength;
    //   materialInfo.moldSandWeight = materialInfo.moldBoxLength;
    // } else {
    //   // Left Edge Allowance(D)
    //   if (materialInfo?.isMoldBoxWidthDirty && materialInfo?.moldBoxWidth !== null) {
    //     materialInfo.moldBoxWidth = Number(materialInfo?.moldBoxWidth);
    //   } else {
    //     if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldBoxWidth = 3;
    //     if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldBoxWidth = 1.5 * Number(materialInfo.dimUnfoldedZ);
    //     if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldBoxWidth = 10;
    //     if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldBoxWidth = 12.5;

    //     if (materialInfo?.moldBoxWidth !== null) {
    //       materialInfo.moldBoxWidth = this.checkDirtyProperty('moldBoxWidth', fieldColorsList) ? selectedMaterial?.moldBoxWidth : materialInfo.moldBoxWidth;
    //     }
    //   }

    //   // Top Edge Allowance(S)
    //   if (materialInfo?.isMoldBoxHeightDirty && materialInfo?.moldBoxHeight !== null) {
    //     materialInfo.moldBoxHeight = Number(materialInfo?.moldBoxHeight);
    //   } else {
    //     if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldBoxHeight = 3;
    //     if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldBoxHeight = 1.5 * Number(materialInfo.dimUnfoldedZ);
    //     if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldBoxHeight = 10;
    //     if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldBoxHeight = 12.5;

    //     if (materialInfo?.moldBoxHeight !== null) {
    //       materialInfo.moldBoxHeight = this.checkDirtyProperty('moldBoxHeight', fieldColorsList) ? selectedMaterial?.moldBoxHeight : materialInfo.moldBoxHeight;
    //     }
    //   }

    //   // Right Edge Allowance(N)
    //   if (materialInfo?.isMoldSandWeightDirty && materialInfo?.moldSandWeight !== null) {
    //     materialInfo.moldSandWeight = Number(materialInfo?.moldSandWeight);
    //   } else {
    //     if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldSandWeight = 3;
    //     if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldSandWeight = 1.5 * Number(materialInfo.dimUnfoldedZ);
    //     if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldSandWeight = 10;
    //     if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldSandWeight = 12.5;

    //     if (materialInfo?.moldSandWeight !== null) {
    //       materialInfo.moldSandWeight = this.checkDirtyProperty('moldSandWeight', fieldColorsList) ? selectedMaterial?.moldSandWeight : materialInfo.moldSandWeight;
    //     }
    //   }
    // }

    // Clamping Allowances
    if (materialInfo?.isPartShapeDirty && materialInfo?.partShape !== null) {
      materialInfo.partShape = materialInfo?.partShape || '';
    } else {
      let clampingAllownces = 'Not Applicable';

      if (materialInfo?.partShape !== null) {
        clampingAllownces = this.checkDirtyProperty('partShape', fieldColorsList) ? selectedMaterial?.partShape : clampingAllownces;
      }
      materialInfo.partShape = clampingAllownces;
    }

    // Bottom Clamping A
    if (materialInfo?.isRunnerDiaDirty && materialInfo?.runnerDia !== null) {
      materialInfo.runnerDia = Number(materialInfo?.runnerDia);
    } else {
      let bottomClampingA = 0;
      if (materialInfo.partShape === 'Not Applicable') {
        bottomClampingA = 0;
      } else {
        bottomClampingA = 10; // 10 - materialInfo.moldBoxLength;
      }

      if (materialInfo?.runnerDia !== null) {
        bottomClampingA = this.checkDirtyProperty('runnerDia', fieldColorsList) ? selectedMaterial?.runnerDia : bottomClampingA;
      }
      materialInfo.runnerDia = bottomClampingA;
    }

    // Left Clamping B
    if (materialInfo?.partShape === 'Applicable') {
      materialInfo.runnerLength = materialInfo.runnerDia;
    } else {
      if (materialInfo?.isRunnerLengthDirty && materialInfo?.runnerLength !== null) {
        materialInfo.runnerLength = Number(materialInfo?.runnerLength);
      } else {
        let leftClampingB = 0;
        if (materialInfo.partShape === 'Not Applicable') {
          leftClampingB = 0;
        } else {
          leftClampingB = 10; // 10 - materialInfo.moldBoxLength;
        }

        if (materialInfo?.runnerLength !== null) {
          leftClampingB = this.checkDirtyProperty('runnerLength', fieldColorsList) ? selectedMaterial?.runnerLength : leftClampingB;
        }
        materialInfo.runnerLength = leftClampingB;
      }
    }

    if (materialInfo.partShape === 'Not Applicable') {
      materialInfo.runnerLength = 0;
      materialInfo.runnerDia = 0;
    }

    const bestUtilisation = this._sheetMetalConfig.getBestUtilisationForSheetMetal(materialInfo);

    if (materialInfo.isPartsPerCoilDirty && materialInfo?.partsPerCoil !== null) {
      materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
    } else {
      let partsPerCoil = bestUtilisation?.partsPerCoil;
      // Math.trunc(
      //   this.isValidNumber(
      //     ((materialInfo.coilWidth - edgeAllowance) * (materialInfo.coilLength - edgeAllowance)) /
      //       ((materialInfo.dimUnfoldedX + materialInfo.partAllowance) * (materialInfo.dimUnfoldedY + materialInfo.partAllowance))
      //   )
      // );
      if (materialInfo?.partsPerCoil !== null) {
        partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterial?.partsPerCoil : Math.trunc(partsPerCoil);
      }
      this.shareService.isValidNumber(partsPerCoil);
    }

    if (materialInfo.isCoilLengthDirty && !!materialInfo?.coilLength) {
      materialInfo.coilLength = Number(materialInfo?.coilLength);
    } else {
      let coilLength = bestUtilisation?.sheetLength;
      if (materialInfo?.coilLength !== null) {
        coilLength = this.checkDirtyProperty('coilLength', fieldColorsList) ? selectedMaterial?.coilLength : coilLength;
      }
      materialInfo.coilLength = this.shareService.isValidNumber(coilLength);
    }

    if (materialInfo.isCoilWidthDirty && !!materialInfo?.coilWidth) {
      materialInfo.coilWidth = Number(materialInfo?.coilWidth);
    } else {
      let coilWidth = bestUtilisation?.sheetWidth;
      if (materialInfo?.coilWidth !== null) {
        coilWidth = this.checkDirtyProperty('coilWidth', fieldColorsList) ? selectedMaterial?.coilWidth : coilWidth;
      }
      materialInfo.coilWidth = this.shareService.isValidNumber(coilWidth);
    }

    if (materialInfo.isUnbendPartWeightDirty && materialInfo.unbendPartWeight !== null) {
      materialInfo.unbendPartWeight = Number(materialInfo.unbendPartWeight);
    } else {
      let unbendPartWeight = this.isValidNumber((materialInfo.unfoldedPartVolume * materialInfo.density) / 1000);
      if (materialInfo?.unbendPartWeight !== null) {
        unbendPartWeight = this.checkDirtyProperty('unbendPartWeight', fieldColorsList) ? selectedMaterial?.unbendPartWeight : unbendPartWeight;
      }
      materialInfo.unbendPartWeight = unbendPartWeight;
    }
    if (materialInfo.isutilisationDirty && materialInfo.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = 0;
      let partsPerCoil = 0;
      if (
        materialInfo.isCoilLengthDirty ||
        materialInfo.isCoilWidthDirty ||
        materialInfo.isMoldBoxLengthDirty ||
        materialInfo.isPartShapeDirty ||
        materialInfo.isRunnerDiaDirty ||
        materialInfo.isRunnerLengthDirty ||
        materialInfo?.isPartAllowanceDirty
      ) {
        const utilisationByCoil = this._sheetMetalConfig.getCustomSheetUtilizationData(materialInfo);
        partsPerCoil = utilisationByCoil?.highestParts;
        materialInfo.sheetWeight = utilisationByCoil?.weight;
        materialInfo.coilWeight = utilisationByCoil?.weight;
        utilisation = utilisationByCoil?.utilization;
        // materialInfo.sheetWeight = this.isValidNumber((Number(materialInfo.coilWidth) * Number(materialInfo.coilLength) * Number(materialInfo.dimUnfoldedZ) * Number(materialInfo.density)) / 1000);
        // utilisation = this.shareService.isValidNumber(((materialInfo.partsPerCoil * materialInfo.netWeight) / materialInfo.sheetWeight) * 100);
      } else {
        if (
          (this.checkDirtyProperty('coilWidth', fieldColorsList) && this.checkDirtyProperty('coilLength', fieldColorsList)) ||
          this.checkDirtyProperty('moldBoxLength', fieldColorsList) ||
          this.checkDirtyProperty('partShape', fieldColorsList) ||
          this.checkDirtyProperty('runnerDia', fieldColorsList) ||
          this.checkDirtyProperty('runnerLength', fieldColorsList) ||
          this.checkDirtyProperty('partAllowance', fieldColorsList)
        ) {
          const utilisationByCoil = this._sheetMetalConfig.getCustomSheetUtilizationData(materialInfo);
          partsPerCoil = utilisationByCoil?.highestParts;
          materialInfo.sheetWeight = utilisationByCoil?.weight;
          materialInfo.coilWeight = utilisationByCoil?.weight;
          utilisation = utilisationByCoil?.utilization;
        } else {
          const bestUtilisation = this._sheetMetalConfig.getBestUtilisationForSheetMetal(materialInfo);
          utilisation = bestUtilisation?.utilisation;
          materialInfo.coilWidth = this.shareService.isValidNumber(bestUtilisation?.sheetWidth);
          materialInfo.coilLength = this.shareService.isValidNumber(bestUtilisation?.sheetLength);
          partsPerCoil = bestUtilisation?.partsPerCoil;
          materialInfo.sheetWeight = this.shareService.isValidNumber(bestUtilisation?.sheetWeight);
          materialInfo.coilWeight = this.shareService.isValidNumber(bestUtilisation?.sheetWeight);
        }
      }
      if (materialInfo.utilisation !== null || materialInfo.utilisation !== 0) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = this.shareService.isValidNumber(utilisation);

      if (materialInfo.isPartsPerCoilDirty && materialInfo?.partsPerCoil !== null) {
        materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
      } else {
        if (materialInfo?.partsPerCoil !== null) {
          partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterial?.partsPerCoil : Math.trunc(partsPerCoil);
        }
        materialInfo.partsPerCoil = this.shareService.isValidNumber(partsPerCoil);
      }
    }

    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight !== null) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      let grossWeight = this.shareService.isValidNumber((materialInfo?.netWeight / materialInfo.utilisation) * 100);
      if (materialInfo?.grossWeight !== null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterial?.grossWeight : Number(grossWeight);
      }
      materialInfo.grossWeight = this.shareService.isValidNumber(grossWeight);
    }
    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight !== null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = this.isValidNumber(materialInfo.grossWeight - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight !== null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : Number(scrapWeight);
      }
      materialInfo.scrapWeight = this.shareService.isValidNumber(scrapWeight);
    }

    if (materialInfo?.isScrapRecoveryDirty && materialInfo.scrapRecovery !== null) {
      materialInfo.scrapRecovery = Number(materialInfo.scrapRecovery);
    } else {
      let scrapRecovery = 90;
      if (materialInfo?.scrapRecovery !== null) {
        scrapRecovery = this.shareService.checkDirtyProperty('scrapRecovery', fieldColorsList) ? selectedMaterial?.scrapRecovery : scrapRecovery;
      }
      materialInfo.scrapRecovery = scrapRecovery;
    }

    materialInfo.materialCostPart = this.isValidNumber((Number(materialInfo.grossWeight) * Number(materialInfo.materialPricePerKg)) / 1000);
    materialInfo.scrapRecCost = this.isValidNumber((Number(materialInfo.scrapWeight) * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg)) / 1000);
    materialInfo.netMatCost = materialInfo.materialCostPart - materialInfo.scrapRecCost;
    // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo);

    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }

    return materialInfo;
    // return new Observable((obs) => {
    //   obs.next(materialInfo);
    // });
  }

  public calculationsForOxyCutting(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto) {
    let netWeight = 0;
    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight !== null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
    }
    materialInfo.netWeight = netWeight;

    if (!materialInfo.dimUnfoldedZ) {
      materialInfo.dimUnfoldedZ = selectedMaterial.dimUnfoldedZ;
    }

    if (materialInfo?.isPartAllowanceDirty && materialInfo?.partAllowance !== null) {
      materialInfo.partAllowance = Number(materialInfo?.partAllowance);
    } else {
      const z = Number(materialInfo.dimUnfoldedZ);

      materialInfo.partAllowance = this._sheetMetalConfig.getOxyPartAllowance(z);

      if (materialInfo?.partAllowance !== null) {
        materialInfo.partAllowance = this.checkDirtyProperty('partAllowance', fieldColorsList) ? selectedMaterial?.partAllowance : materialInfo.partAllowance;
      }
    }

    // Edge Allowance
    if (materialInfo?.isMoldBoxLengthDirty && materialInfo?.moldBoxLength !== null) {
      materialInfo.moldBoxLength = Number(materialInfo?.moldBoxLength);
    } else {
      if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldBoxLength = 3;
      if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldBoxLength = 1.5 * Number(materialInfo.dimUnfoldedZ);
      if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldBoxLength = 10;
      if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldBoxLength = 12.5;

      if (materialInfo?.moldBoxLength !== null) {
        materialInfo.moldBoxLength = this.checkDirtyProperty('moldBoxLength', fieldColorsList) ? selectedMaterial?.moldBoxLength : materialInfo.moldBoxLength;
      }
      if (materialInfo?.partShape === 'Applicable') {
        materialInfo.runnerLength = 10; // 10 - materialInfo.moldBoxLength;
        materialInfo.runnerDia = 10; // 10 - materialInfo.moldBoxLength;
      }
    }

    // Clamping Allowances
    if (materialInfo?.isPartShapeDirty && materialInfo?.partShape !== null) {
      materialInfo.partShape = materialInfo?.partShape || '';
    } else {
      let clampingAllownces = 'Not Applicable';

      if (materialInfo?.partShape !== null) {
        clampingAllownces = this.checkDirtyProperty('partShape', fieldColorsList) ? selectedMaterial?.partShape : clampingAllownces;
      }
      materialInfo.partShape = clampingAllownces;
    }

    // Bottom Clamping A
    if (materialInfo?.isRunnerDiaDirty && materialInfo?.runnerDia !== null) {
      materialInfo.runnerDia = Number(materialInfo?.runnerDia);
    } else {
      let bottomClampingA = 0;
      if (materialInfo.partShape === 'Not Applicable') {
        bottomClampingA = 0;
      } else {
        bottomClampingA = 10; // 10 - materialInfo.moldBoxLength;
      }

      if (materialInfo?.runnerDia !== null) {
        bottomClampingA = this.checkDirtyProperty('runnerDia', fieldColorsList) ? selectedMaterial?.runnerDia : bottomClampingA;
      }
      materialInfo.runnerDia = bottomClampingA;
    }

    // Left Clamping B
    if (materialInfo?.partShape === 'Applicable') {
      materialInfo.runnerLength = materialInfo.runnerDia;
    } else {
      if (materialInfo?.isRunnerLengthDirty && materialInfo?.runnerLength !== null) {
        materialInfo.runnerLength = Number(materialInfo?.runnerLength);
      } else {
        let leftClampingB = 0;
        if (materialInfo.partShape === 'Not Applicable') {
          leftClampingB = 0;
        } else {
          leftClampingB = 10; // 10 - materialInfo.moldBoxLength;
        }

        if (materialInfo?.runnerLength !== null) {
          leftClampingB = this.checkDirtyProperty('runnerLength', fieldColorsList) ? selectedMaterial?.runnerLength : leftClampingB;
        }
        materialInfo.runnerLength = leftClampingB;
      }
    }

    if (materialInfo.partShape === 'Not Applicable') {
      materialInfo.runnerLength = 0;
      materialInfo.runnerDia = 0;
    }

    const bestUtilisation = this._sheetMetalConfig.getBestUtilisationForSheetMetal(materialInfo);

    if (materialInfo.isPartsPerCoilDirty && materialInfo?.partsPerCoil !== null) {
      materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
    } else {
      let partsPerCoil = bestUtilisation?.partsPerCoil;
      if (materialInfo?.partsPerCoil !== null) {
        partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterial?.partsPerCoil : Math.trunc(partsPerCoil);
      }
      materialInfo.partsPerCoil = this.shareService.isValidNumber(partsPerCoil);
    }

    if (materialInfo.isCoilLengthDirty && !!materialInfo?.coilLength) {
      materialInfo.coilLength = Number(materialInfo?.coilLength);
    } else {
      let coilLength = bestUtilisation?.sheetLength;
      if (materialInfo?.coilLength !== null) {
        coilLength = this.checkDirtyProperty('coilLength', fieldColorsList) ? selectedMaterial?.coilLength : coilLength;
      }
      materialInfo.coilLength = this.shareService.isValidNumber(coilLength);
    }

    if (materialInfo.isCoilWidthDirty && !!materialInfo?.coilWidth) {
      materialInfo.coilWidth = Number(materialInfo?.coilWidth);
    } else {
      let coilWidth = bestUtilisation?.sheetWidth;
      if (materialInfo?.coilWidth !== null) {
        coilWidth = this.checkDirtyProperty('coilWidth', fieldColorsList) ? selectedMaterial?.coilWidth : coilWidth;
      }
      materialInfo.coilWidth = this.shareService.isValidNumber(coilWidth);
    }

    if (materialInfo.isUnbendPartWeightDirty && materialInfo.unbendPartWeight !== null) {
      materialInfo.unbendPartWeight = Number(materialInfo.unbendPartWeight);
    } else {
      let unbendPartWeight = this.isValidNumber((materialInfo.unfoldedPartVolume * materialInfo.density) / 1000);
      if (materialInfo?.unbendPartWeight !== null) {
        unbendPartWeight = this.checkDirtyProperty('unbendPartWeight', fieldColorsList) ? selectedMaterial?.unbendPartWeight : unbendPartWeight;
      }
      materialInfo.unbendPartWeight = this.shareService.isValidNumber(unbendPartWeight);
    }
    if (materialInfo.isutilisationDirty && materialInfo.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = 0;
      let partsPerCoil = 0;
      if (
        materialInfo.isCoilLengthDirty ||
        materialInfo.isCoilWidthDirty ||
        materialInfo.isMoldBoxLengthDirty ||
        materialInfo.isPartShapeDirty ||
        materialInfo.isRunnerDiaDirty ||
        materialInfo.isRunnerLengthDirty ||
        materialInfo?.isPartAllowanceDirty
      ) {
        const utilisationByCoil = this._sheetMetalConfig.getCustomSheetUtilizationData(materialInfo);
        partsPerCoil = utilisationByCoil?.highestParts;
        materialInfo.sheetWeight = utilisationByCoil?.weight;
        materialInfo.coilWeight = utilisationByCoil?.weight;
        utilisation = utilisationByCoil?.utilization;
      } else {
        if (
          (this.checkDirtyProperty('coilWidth', fieldColorsList) && this.checkDirtyProperty('coilLength', fieldColorsList)) ||
          this.checkDirtyProperty('moldBoxLength', fieldColorsList) ||
          this.checkDirtyProperty('partShape', fieldColorsList) ||
          this.checkDirtyProperty('runnerDia', fieldColorsList) ||
          this.checkDirtyProperty('runnerLength', fieldColorsList) ||
          this.checkDirtyProperty('partAllowance', fieldColorsList)
        ) {
          const utilisationByCoil = this._sheetMetalConfig.getCustomSheetUtilizationData(materialInfo);
          partsPerCoil = utilisationByCoil?.highestParts;
          materialInfo.sheetWeight = utilisationByCoil?.weight;
          materialInfo.coilWeight = utilisationByCoil?.weight;
          utilisation = utilisationByCoil?.utilization;
        } else {
          const bestUtilisation = this._sheetMetalConfig.getBestUtilisationForSheetMetal(materialInfo);
          utilisation = bestUtilisation?.utilisation;
          materialInfo.coilWidth = bestUtilisation?.sheetWidth;
          materialInfo.coilLength = this.shareService.isValidNumber(bestUtilisation?.sheetLength);
          partsPerCoil = bestUtilisation?.partsPerCoil;
          materialInfo.sheetWeight = this.shareService.isValidNumber(bestUtilisation?.sheetWeight);
          materialInfo.coilWeight = this.shareService.isValidNumber(bestUtilisation?.sheetWeight);
        }
      }
      if (materialInfo.utilisation !== null || materialInfo.utilisation !== 0) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = this.shareService.isValidNumber(utilisation);

      if (materialInfo.isPartsPerCoilDirty && materialInfo?.partsPerCoil !== null) {
        materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
      } else {
        if (materialInfo?.partsPerCoil !== null) {
          partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterial?.partsPerCoil : Math.trunc(partsPerCoil);
        }
        materialInfo.partsPerCoil = this.shareService.isValidNumber(partsPerCoil);
      }
    }

    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight !== null) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      let grossWeight = this.shareService.isValidNumber((materialInfo?.netWeight / materialInfo.utilisation) * 100);
      if (materialInfo?.grossWeight !== null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterial?.grossWeight : Number(grossWeight);
      }
      materialInfo.grossWeight = this.shareService.isValidNumber(grossWeight);
    }
    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight !== null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = this.isValidNumber(materialInfo.grossWeight - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight !== null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : Number(scrapWeight);
      }
      materialInfo.scrapWeight = this.shareService.isValidNumber(scrapWeight);
    }

    if (materialInfo?.isScrapRecoveryDirty && materialInfo.scrapRecovery !== null) {
      materialInfo.scrapRecovery = Number(materialInfo.scrapRecovery);
    } else {
      let scrapRecovery = 90;
      if (materialInfo?.scrapRecovery !== null) {
        scrapRecovery = this.shareService.checkDirtyProperty('scrapRecovery', fieldColorsList) ? selectedMaterial?.scrapRecovery : scrapRecovery;
      }
      materialInfo.scrapRecovery = scrapRecovery;
    }

    materialInfo.materialCostPart = this.isValidNumber((Number(materialInfo.grossWeight) * Number(materialInfo.materialPricePerKg)) / 1000);
    materialInfo.scrapRecCost = this.isValidNumber((Number(materialInfo.scrapWeight) * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg)) / 1000);
    materialInfo.netMatCost = materialInfo.materialCostPart - materialInfo.scrapRecCost;
    // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo);

    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }

    return materialInfo;
  }

  public calculationsForTPP(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto) {
    // const edgeAllowance = 2;

    let netWeight = 0;
    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight !== null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
    }
    materialInfo.netWeight = netWeight;

    if (!materialInfo.dimUnfoldedZ) {
      materialInfo.dimUnfoldedZ = selectedMaterial.dimUnfoldedZ;
    }

    if (materialInfo?.isPartAllowanceDirty && materialInfo?.partAllowance !== null) {
      materialInfo.partAllowance = Number(materialInfo?.partAllowance);
    } else {
      const z = Number(materialInfo.dimUnfoldedZ);

      if (z < 2.5) materialInfo.partAllowance = 2;
      if (z >= 2.5 && z <= 3.15) materialInfo.partAllowance = 3;
      if (z > 3.15 && z < 5) materialInfo.partAllowance = 4;
      if (z >= 5 && z <= 6.35) materialInfo.partAllowance = 5;
      if (z > 6.35 && z <= 8) materialInfo.partAllowance = 6;
      if (z > 8 && z < 10) materialInfo.partAllowance = 8;
      if (z >= 10 && z <= 12.7) materialInfo.partAllowance = 10;
      if (z > 12.7 && z <= 16) materialInfo.partAllowance = 12;
      if (z > 16) materialInfo.partAllowance = 15;

      if (materialInfo?.partAllowance !== null) {
        materialInfo.partAllowance = this.checkDirtyProperty('partAllowance', fieldColorsList) ? selectedMaterial?.partAllowance : materialInfo.partAllowance;
      }
    }

    // Edge Allowances
    // if (materialInfo?.isRunnerTypeDirty && materialInfo?.runnerType !== null) {
    //   materialInfo.runnerType = materialInfo?.runnerType;
    // } else {
    //   const edgeAllownces = 'Uniform';

    //   if (materialInfo?.runnerType !== null) {
    //     materialInfo.runnerType = this.checkDirtyProperty('runnerType', fieldColorsList) ? selectedMaterial?.runnerType : edgeAllownces;
    //   }
    // }

    // Edge Allowance
    if (materialInfo?.isMoldBoxLengthDirty && materialInfo?.moldBoxLength !== null) {
      materialInfo.moldBoxLength = Number(materialInfo?.moldBoxLength);
    } else {
      if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldBoxLength = 3;
      if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldBoxLength = 1.5 * Number(materialInfo.dimUnfoldedZ);
      if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldBoxLength = 10;
      if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldBoxLength = 12.5;

      if (materialInfo?.moldBoxLength !== null) {
        materialInfo.moldBoxLength = this.checkDirtyProperty('moldBoxLength', fieldColorsList) ? selectedMaterial?.moldBoxLength : materialInfo.moldBoxLength;
      }

      if (materialInfo?.partShape === 'Applicable') {
        materialInfo.runnerLength = 10; // 10 - materialInfo.moldBoxLength;
        materialInfo.runnerDia = 10; // 10 - materialInfo.moldBoxLength;
      }
    }

    // if (materialInfo?.runnerType === 'Uniform') {
    //   materialInfo.moldBoxWidth = materialInfo.moldBoxLength;
    //   materialInfo.moldBoxHeight = materialInfo.moldBoxLength;
    //   materialInfo.moldSandWeight = materialInfo.moldBoxLength;
    // } else {
    //   // Left Edge Allowance(D)
    //   if (materialInfo?.isMoldBoxWidthDirty && materialInfo?.moldBoxWidth !== null) {
    //     materialInfo.moldBoxWidth = Number(materialInfo?.moldBoxWidth);
    //   } else {
    //     if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldBoxWidth = 3;
    //     if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldBoxWidth = 1.5 * Number(materialInfo.dimUnfoldedZ);
    //     if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldBoxWidth = 10;
    //     if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldBoxWidth = 12.5;

    //     if (materialInfo?.moldBoxWidth !== null) {
    //       materialInfo.moldBoxWidth = this.checkDirtyProperty('moldBoxWidth', fieldColorsList) ? selectedMaterial?.moldBoxWidth : materialInfo.moldBoxWidth;
    //     }
    //   }

    //   // Top Edge Allowance(S)
    //   if (materialInfo?.isMoldBoxHeightDirty && materialInfo?.moldBoxHeight !== null) {
    //     materialInfo.moldBoxHeight = Number(materialInfo?.moldBoxHeight);
    //   } else {
    //     if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldBoxHeight = 3;
    //     if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldBoxHeight = 1.5 * Number(materialInfo.dimUnfoldedZ);
    //     if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldBoxHeight = 10;
    //     if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldBoxHeight = 12.5;

    //     if (materialInfo?.moldBoxHeight !== null) {
    //       materialInfo.moldBoxHeight = this.checkDirtyProperty('moldBoxHeight', fieldColorsList) ? selectedMaterial?.moldBoxHeight : materialInfo.moldBoxHeight;
    //     }
    //   }

    //   // Right Edge Allowance(N)
    //   if (materialInfo?.isMoldSandWeightDirty && materialInfo?.moldSandWeight !== null) {
    //     materialInfo.moldSandWeight = Number(materialInfo?.moldSandWeight);
    //   } else {
    //     if (Number(materialInfo.dimUnfoldedZ) <= 2) materialInfo.moldSandWeight = 3;
    //     if (Number(materialInfo.dimUnfoldedZ) > 2 && Number(materialInfo.dimUnfoldedZ) <= 6) materialInfo.moldSandWeight = 1.5 * Number(materialInfo.dimUnfoldedZ);
    //     if (Number(materialInfo.dimUnfoldedZ) > 6 && Number(materialInfo.dimUnfoldedZ) <= 25) materialInfo.moldSandWeight = 10;
    //     if (Number(materialInfo.dimUnfoldedZ) > 25) materialInfo.moldSandWeight = 12.5;

    //     if (materialInfo?.moldSandWeight !== null) {
    //       materialInfo.moldSandWeight = this.checkDirtyProperty('moldSandWeight', fieldColorsList) ? selectedMaterial?.moldSandWeight : materialInfo.moldSandWeight;
    //     }
    //   }
    // }

    // Clamping Allowances
    if (materialInfo?.isPartShapeDirty && materialInfo?.partShape !== null) {
      materialInfo.partShape = materialInfo?.partShape || '';
    } else {
      let clampingAllownces = 'Applicable';

      if (materialInfo?.partShape !== null) {
        clampingAllownces = this.checkDirtyProperty('partShape', fieldColorsList) ? selectedMaterial?.partShape : clampingAllownces;
      }
      materialInfo.partShape = clampingAllownces;
    }

    // Bottom Clamping A
    if (materialInfo?.isRunnerDiaDirty && materialInfo?.runnerDia !== null) {
      materialInfo.runnerDia = Number(materialInfo?.runnerDia);
    } else {
      let bottomClampingA = 0;
      if (materialInfo.partShape === 'Not Applicable') {
        bottomClampingA = 0;
      } else {
        bottomClampingA = 10; // 10 - materialInfo.moldBoxLength;
      }

      if (materialInfo?.runnerDia !== null) {
        bottomClampingA = this.checkDirtyProperty('runnerDia', fieldColorsList) ? selectedMaterial?.runnerDia : bottomClampingA;
      }
      materialInfo.runnerDia = bottomClampingA;
    }

    if (materialInfo?.partShape === 'Applicable') {
      materialInfo.runnerLength = materialInfo.runnerDia;
    } else {
      // Left Clamping B
      if (materialInfo?.isRunnerLengthDirty && materialInfo?.runnerLength !== null) {
        materialInfo.runnerLength = Number(materialInfo?.runnerLength);
      } else {
        let leftClampingB = 0;
        if (materialInfo.partShape === 'Not Applicable') {
          leftClampingB = 0;
        } else {
          leftClampingB = 10; // 10 - materialInfo.moldBoxLength;
        }

        if (materialInfo?.runnerLength !== null) {
          leftClampingB = this.checkDirtyProperty('runnerLength', fieldColorsList) ? selectedMaterial?.runnerLength : leftClampingB;
        }
        materialInfo.runnerLength = leftClampingB;
      }
    }

    if (materialInfo.partShape === 'Not Applicable') {
      materialInfo.runnerLength = 0;
      materialInfo.runnerDia = 0;
    }

    const bestUtilisation = this._sheetMetalConfig.getBestUtilisationForSheetMetal(materialInfo);

    if (materialInfo.isPartsPerCoilDirty && materialInfo?.partsPerCoil !== null) {
      materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
    } else {
      let partsPerCoil = bestUtilisation?.partsPerCoil;
      // Math.trunc(
      //   this.isValidNumber(
      //     Number(
      //       ((materialInfo.coilWidth - edgeAllowance) * (materialInfo.coilLength - edgeAllowance)) /
      //         ((materialInfo.dimUnfoldedX + materialInfo.partAllowance) * (materialInfo.dimUnfoldedY + materialInfo.partAllowance))
      //     )
      //   )
      // );
      if (materialInfo?.partsPerCoil !== null) {
        partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterial?.partsPerCoil : Math.trunc(partsPerCoil);
      }
      materialInfo.partsPerCoil = this.shareService.isValidNumber(partsPerCoil);
    }

    if (materialInfo.isCoilLengthDirty && !!materialInfo?.coilLength) {
      materialInfo.coilLength = Number(materialInfo?.coilLength);
    } else {
      let coilLength = bestUtilisation?.sheetLength;
      if (materialInfo?.coilLength !== null) {
        coilLength = this.checkDirtyProperty('coilLength', fieldColorsList) ? selectedMaterial?.coilLength : coilLength;
      }
      materialInfo.coilLength = this.shareService.isValidNumber(coilLength);
    }

    if (materialInfo.isCoilWidthDirty && !!materialInfo?.coilWidth) {
      materialInfo.coilWidth = Number(materialInfo?.coilWidth);
    } else {
      let coilWidth = bestUtilisation?.sheetWidth;
      if (materialInfo?.coilWidth !== null) {
        coilWidth = this.checkDirtyProperty('coilWidth', fieldColorsList) ? selectedMaterial?.coilWidth : coilWidth;
      }
      materialInfo.coilWidth = this.shareService.isValidNumber(coilWidth);
    }

    if (materialInfo.isUnbendPartWeightDirty && materialInfo.unbendPartWeight !== null) {
      materialInfo.unbendPartWeight = Number(materialInfo.unbendPartWeight);
    } else {
      let unbendPartWeight = this.isValidNumber((materialInfo.unfoldedPartVolume * materialInfo.density) / 1000);
      if (materialInfo?.unbendPartWeight !== null) {
        unbendPartWeight = this.checkDirtyProperty('unbendPartWeight', fieldColorsList) ? selectedMaterial?.unbendPartWeight : unbendPartWeight;
      }
      materialInfo.unbendPartWeight = unbendPartWeight;
    }

    if (materialInfo.isutilisationDirty && materialInfo.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = 0;
      let partsPerCoil = 0;
      if (
        materialInfo.isCoilLengthDirty ||
        materialInfo.isCoilWidthDirty ||
        materialInfo.isMoldBoxLengthDirty ||
        materialInfo.isPartShapeDirty ||
        materialInfo.isRunnerDiaDirty ||
        materialInfo.isRunnerLengthDirty ||
        materialInfo?.isPartAllowanceDirty
      ) {
        const utilisationByCoil = this._sheetMetalConfig.getCustomSheetUtilizationData(materialInfo);
        partsPerCoil = utilisationByCoil?.highestParts;
        materialInfo.sheetWeight = utilisationByCoil?.weight;
        materialInfo.coilWeight = utilisationByCoil?.weight;
        utilisation = utilisationByCoil?.utilization;
        // materialInfo.sheetWeight = this.isValidNumber((Number(materialInfo.coilWidth) * Number(materialInfo.coilLength) * Number(materialInfo.dimUnfoldedZ) * Number(materialInfo.density)) / 1000);
        // utilisation = this.shareService.isValidNumber(((materialInfo.partsPerCoil * materialInfo.netWeight) / materialInfo.sheetWeight) * 100);
      } else {
        if (
          (this.checkDirtyProperty('coilWidth', fieldColorsList) && this.checkDirtyProperty('coilLength', fieldColorsList)) ||
          this.checkDirtyProperty('moldBoxLength', fieldColorsList) ||
          this.checkDirtyProperty('partShape', fieldColorsList) ||
          this.checkDirtyProperty('runnerDia', fieldColorsList) ||
          this.checkDirtyProperty('runnerLength', fieldColorsList) ||
          this.checkDirtyProperty('partAllowance', fieldColorsList)
        ) {
          const utilisationByCoil = this._sheetMetalConfig.getCustomSheetUtilizationData(materialInfo);
          partsPerCoil = utilisationByCoil?.highestParts;
          materialInfo.sheetWeight = utilisationByCoil?.weight;
          materialInfo.coilWeight = utilisationByCoil?.weight;
          utilisation = utilisationByCoil?.utilization;
        } else {
          const bestUtilisation = this._sheetMetalConfig.getBestUtilisationForSheetMetal(materialInfo);
          utilisation = bestUtilisation?.utilisation;
          materialInfo.coilWidth = this.shareService.isValidNumber(bestUtilisation?.sheetWidth);
          materialInfo.coilLength = this.shareService.isValidNumber(bestUtilisation?.sheetLength);
          partsPerCoil = bestUtilisation?.partsPerCoil;
          materialInfo.sheetWeight = this.shareService.isValidNumber(bestUtilisation?.sheetWeight);
          materialInfo.coilWeight = this.shareService.isValidNumber(bestUtilisation?.sheetWeight);
        }
      }
      if (materialInfo.isPartsPerCoilDirty && materialInfo?.partsPerCoil !== null) {
        materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
      } else {
        if (materialInfo?.partsPerCoil !== null) {
          partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterial?.partsPerCoil : Math.trunc(partsPerCoil);
        }
        materialInfo.partsPerCoil = this.shareService.isValidNumber(partsPerCoil);
      }
      if (materialInfo.utilisation !== null || materialInfo.utilisation !== 0) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? materialInfo?.utilisation : utilisation;
      }

      materialInfo.utilisation = this.shareService.isValidNumber(utilisation);
    }

    if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight !== null) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      let grossWeight = this.shareService.isValidNumber((materialInfo?.netWeight / materialInfo.utilisation) * 100);
      if (materialInfo?.grossWeight !== null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterial?.grossWeight : Number(grossWeight);
      }
      materialInfo.grossWeight = this.shareService.isValidNumber(grossWeight);
    }

    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight !== null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = this.isValidNumber(materialInfo.grossWeight - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight !== null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : Number(scrapWeight);
      }
      materialInfo.scrapWeight = this.shareService.isValidNumber(scrapWeight);
    }

    if (materialInfo?.isScrapRecoveryDirty && materialInfo.scrapRecovery !== null) {
      materialInfo.scrapRecovery = Number(materialInfo.scrapRecovery);
    } else {
      let scrapRecovery = 90;
      if (materialInfo?.scrapRecovery !== null) {
        scrapRecovery = this.shareService.checkDirtyProperty('scrapRecovery', fieldColorsList) ? selectedMaterial?.scrapRecovery : scrapRecovery;
      }
      materialInfo.scrapRecovery = scrapRecovery;
    }

    const grossMaterialCost = this.isValidNumber((Number(materialInfo.grossWeight) * Number(materialInfo.materialPricePerKg)) / 1000);
    materialInfo.materialCostPart = grossMaterialCost;

    materialInfo.scrapRecCost = this.isValidNumber((Number(materialInfo.scrapWeight) * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg)) / 1000);
    materialInfo.netMatCost = grossMaterialCost - materialInfo.scrapRecCost;
    // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo);

    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }

    // return new Observable((obs) => {
    //   obs.next(materialInfo);
    // });
    return materialInfo;
  }

  public calculationsForStamping(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto) {
    let netWeight = 0;
    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight !== null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      }
    }
    materialInfo.netWeight = netWeight;

    if (materialInfo.isStartEndScrapLengthDirty) {
      materialInfo.enterStartEndScrapLength = Number(materialInfo.enterStartEndScrapLength);
    } else {
      materialInfo.enterStartEndScrapLength = this.checkDirtyProperty('enterStartEndScrapLength', fieldColorsList) ? selectedMaterialInfo?.enterStartEndScrapLength : 20;
    }

    if (materialInfo?.isTypeOfCableDirty && materialInfo?.typeOfCable !== null) {
      materialInfo.typeOfCable = Number(materialInfo?.typeOfCable);
    } else {
      let stripType = 1; // materialInfo.dimUnfoldedX > 100 ? 1 : 2; Defaulted to Single
      if (materialInfo?.typeOfCable !== null) {
        stripType = this.checkDirtyProperty('typeOfCable', fieldColorsList) ? selectedMaterialInfo?.typeOfCable : Number(stripType);
      }
      materialInfo.typeOfCable = stripType;
    }

    // Edge Allowances
    if (materialInfo?.isPartShapeDirty && materialInfo?.partShape !== null) {
      materialInfo.partShape = materialInfo?.partShape || '';
    } else {
      let clampingAllownces = 'Not Applicable';
      if (materialInfo.processId === PrimaryProcessType.StampingProgressive) {
        clampingAllownces = 'Two Sided';
      }
      if (materialInfo?.partShape !== null) {
        clampingAllownces = this.checkDirtyProperty('partShape', fieldColorsList) ? selectedMaterialInfo?.partShape : clampingAllownces;
      }
      materialInfo.partShape = clampingAllownces;
    }

    if (materialInfo?.isPartAllowanceDirty && materialInfo?.partAllowance !== null) {
      materialInfo.partAllowance = Number(materialInfo?.partAllowance);
    } else {
      let partAllowance = 0;
      if (materialInfo.typeOfCable === 2) {
        partAllowance = this.isValidNumber(1.5 * Number(materialInfo.dimUnfoldedZ));
      } else {
        partAllowance = this.isValidNumber(Number(materialInfo.dimUnfoldedX) <= 60 ? 1.25 * Number(materialInfo.dimUnfoldedZ) : 1.5 * Number(materialInfo.dimUnfoldedZ));
      }

      if (materialInfo?.partAllowance !== null) {
        partAllowance = this.checkDirtyProperty('partAllowance', fieldColorsList) ? selectedMaterialInfo?.partAllowance : partAllowance;
      }
      materialInfo.partAllowance = partAllowance;
    }

    // Edge Allowance
    if (materialInfo?.isMoldBoxLengthDirty && materialInfo?.moldBoxLength !== null) {
      materialInfo.moldBoxLength = Number(materialInfo?.moldBoxLength);
    } else {
      let edgeAllowance = 0;
      if (materialInfo.partShape !== 'Not Applicable') {
        if (materialInfo.dimUnfoldedZ <= 2) {
          edgeAllowance = 5;
        } else if (materialInfo.dimUnfoldedZ <= 5) {
          edgeAllowance = Math.round(2 * materialInfo.dimUnfoldedZ);
        } else if (materialInfo.dimUnfoldedZ > 5) {
          edgeAllowance = 10;
        }
      }

      if (materialInfo?.moldBoxLength !== null) {
        edgeAllowance = this.checkDirtyProperty('moldBoxLength', fieldColorsList) ? selectedMaterialInfo?.moldBoxLength : edgeAllowance;
      }
      materialInfo.moldBoxLength = edgeAllowance;
    }

    // coil length
    if (materialInfo?.isCoilLengthDirty && materialInfo?.coilLength !== null) {
      materialInfo.coilLength = Number(materialInfo?.coilLength);
    } else {
      let coilLength = 12000; // default
      if (materialInfo?.grossWeight !== null) {
        coilLength = this.checkDirtyProperty('coilLength', fieldColorsList) ? selectedMaterialInfo?.coilLength : Number(coilLength);
      }
      materialInfo.coilLength = this.shareService.isValidNumber(coilLength);
    }

    // coil width
    if (materialInfo?.isCoilWidthDirty && materialInfo?.coilWidth !== null) {
      materialInfo.coilWidth = Number(materialInfo?.coilWidth);
    } else {
      let coilWidth = 0;

      if (materialInfo.typeOfCable === 2) {
        coilWidth =
          materialInfo.partShape === 'Two Sided'
            ? Math.ceil(2 * materialInfo.dimUnfoldedX + 3 * materialInfo.partAllowance + 2 * materialInfo.moldBoxLength)
            : Math.ceil(2 * materialInfo.dimUnfoldedX + 3 * materialInfo.partAllowance + materialInfo.moldBoxLength);
      } else {
        coilWidth =
          materialInfo.partShape === 'Two Sided'
            ? Math.ceil(materialInfo.dimUnfoldedX + 2 * materialInfo.partAllowance + 2 * materialInfo.moldBoxLength)
            : Math.ceil(materialInfo.dimUnfoldedX + 2 * materialInfo.partAllowance + materialInfo.moldBoxLength);
        if (materialInfo?.coilWidth !== null) {
          coilWidth = this.checkDirtyProperty('coilWidth', fieldColorsList) ? selectedMaterialInfo?.coilWidth : Number(coilWidth);
        }
      }
      materialInfo.coilWidth = this.shareService.isValidNumber(coilWidth);
    }

    // const noOfImpression =
    // this.isValidNumber(
    //   Math.round(
    //     (Number(materialInfo.coilWidth) - materialInfo.enterStartEndScrapLength - materialInfo.enterStartEndScrapLength) /
    //       (materialInfo.dimUnfoldedX + materialInfo.partAllowance + materialInfo.partAllowance)
    //   )
    // );
    // materialInfo.noOfCavities = noOfImpression;

    if (materialInfo?.isNoOfCavitiesDirty && materialInfo?.noOfCavities !== null) {
      materialInfo.noOfCavities = Number(materialInfo?.noOfCavities);
    } else {
      let noOfImpression = materialInfo.typeOfCable;
      if (materialInfo?.noOfCavities !== null) {
        noOfImpression = this.checkDirtyProperty('noOfCavities', fieldColorsList) ? selectedMaterialInfo?.noOfCavities : Number(noOfImpression);
      }
      materialInfo.noOfCavities = noOfImpression;
    }

    // Parts Per Coil
    // if (materialInfo.processId === PrimaryProcessType.StampingProgressive) {
    // as per new formula
    if (materialInfo?.isPartsPerCoilDirty && materialInfo?.partsPerCoil !== null) {
      materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
    } else {
      const frontScrapA = materialInfo?.dimUnfoldedZ + 0.015 * materialInfo?.dimUnfoldedX;
      let C = materialInfo?.dimUnfoldedY + materialInfo.partAllowance;

      let partsPerCoil = 0;
      if (materialInfo.typeOfCable === 2) {
        partsPerCoil = Math.floor((materialInfo.coilLength - frontScrapA - materialInfo.partAllowance) / C) * 2;
      } else {
        partsPerCoil = Math.floor((materialInfo.coilLength - frontScrapA - materialInfo.partAllowance) / C);
      }

      // let partsPerCoil = this.isValidNumber(Math.floor(Number((Number(materialInfo.coilLength) - materialInfo.enterStartEndScrapLength) / C) * materialInfo.typeOfCable));
      if (materialInfo?.partsPerCoil !== null) {
        partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterialInfo?.partsPerCoil : Math.trunc(partsPerCoil);
      }
      materialInfo.partsPerCoil = this.shareService.isValidNumber(partsPerCoil);
    }
    // }

    // else {
    //   if (materialInfo?.isPartsPerCoilDirty && materialInfo?.partsPerCoil !== null) {
    //     materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
    //   } else {
    //     let partsPerCoil = this.isValidNumber(
    //       Number(
    //         (Number(materialInfo.coilWidth) * (Number(materialInfo.coilLength) - materialInfo.enterStartEndScrapLength)) /
    //           ((materialInfo?.dimUnfoldedX + materialInfo.partAllowance) * (materialInfo?.dimUnfoldedY + materialInfo.partAllowance))
    //       )
    //     );
    //     if (materialInfo?.partsPerCoil !== null) {
    //       partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterialInfo?.partsPerCoil : Math.trunc(partsPerCoil);
    //     }
    //     materialInfo.partsPerCoil = partsPerCoil;
    //   }
    // }

    if (materialInfo?.isBlankDiameterDirty && materialInfo?.blankDiameter !== null) {
      materialInfo.blankDiameter = Number(materialInfo?.blankDiameter);
    } else {
      let blankDiameter = this.isValidNumber(Math.sqrt((Number(materialInfo.partSurfaceArea) * 1.05) / 3.14) * 2);
      if (materialInfo?.blankDiameter !== null) {
        blankDiameter = this.checkDirtyProperty('blankDiameter', fieldColorsList) ? selectedMaterialInfo?.blankDiameter : blankDiameter;
      }
      materialInfo.blankDiameter = blankDiameter;
    }
    if (materialInfo.isutilisationDirty && materialInfo.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = 0;
      // if (materialInfo.processId === PrimaryProcessType.StampingStage) {
      //   if (materialInfo.isCoilLengthDirty || materialInfo.isCoilWidthDirty) {
      //     materialInfo.sheetWeight = this.isValidNumber((Number(materialInfo.coilWidth) * Number(materialInfo.coilLength) * Number(materialInfo.dimUnfoldedZ) * Number(materialInfo.density)) / 1000);
      //     utilisation = this.shareService.isValidNumber(((materialInfo.partsPerCoil * materialInfo.netWeight) / materialInfo.sheetWeight) * 100);
      //   } else {
      //     if (this.checkDirtyProperty('coilWidth', fieldColorsList) && this.checkDirtyProperty('coilLength', fieldColorsList)) {
      //       const bestUtilisation = this._sheetMetalConfig.getUtilisationForSheetMetalOld(materialInfo);
      //       materialInfo.partsPerCoil = bestUtilisation?.partsPerCoil;
      //       materialInfo.sheetWeight = bestUtilisation?.sheetWeight;
      //       utilisation = bestUtilisation?.utilisation;
      //     } else {
      //       const bestUtilisation = this._sheetMetalConfig.getBestUtilisationForSheetMetalOld(materialInfo);
      //       utilisation = bestUtilisation?.utilisation;
      //       materialInfo.coilWidth = bestUtilisation?.width;
      //       materialInfo.coilLength = bestUtilisation?.length;
      //       materialInfo.partsPerCoil = bestUtilisation?.partsPerCoil;
      //       materialInfo.sheetWeight = bestUtilisation?.sheetWeight;
      //     }
      //   }
      // } else if (materialInfo.processId === PrimaryProcessType.StampingProgressive) {
      utilisation = this.shareService.isValidNumber(
        ((materialInfo.partsPerCoil * materialInfo.netWeight) / ((materialInfo.coilWidth * materialInfo.coilLength * materialInfo.dimUnfoldedZ * materialInfo.density) / 1000)) * 100
      );

      // let coilWidth =
      //   materialInfo.isCoilWidthDirty || this.checkDirtyProperty('coilWidth', fieldColorsList)
      //     ? materialInfo.coilWidth
      //     : Math.ceil(
      //         materialInfo.typeOfCable === 1
      //           ? Math.ceil(materialInfo.dimUnfoldedX + 2 * materialInfo.partAllowance + 10)
      //           : Math.ceil(2 * materialInfo.dimUnfoldedX + 3 * materialInfo.partAllowance + 10)
      //       );
      // coilWidth += !materialInfo.isCoilWidthDirty || this.checkDirtyProperty('coilWidth', fieldColorsList) ? 10 : 0;
      const sheetWeight = this.shareService.isValidNumber((Number(materialInfo.coilWidth) * Number(materialInfo.coilLength) * Number(materialInfo.dimUnfoldedZ) * Number(materialInfo.density)) / 1000);

      // calc utilisation as per new updated formula
      // let w = materialInfo.typeOfCable === 1 ? Math.ceil(materialInfo.dimUnfoldedX + 2 * materialInfo.partAllowance) : Math.ceil(2 * materialInfo.dimUnfoldedX + 3 * materialInfo.partAllowance);
      // utilisation =
      //   this.shareService.isValidNumber((materialInfo.partsPerCoil * materialInfo.netWeight) / ((w * materialInfo.coilLength * materialInfo.dimUnfoldedZ * materialInfo.density) / 1000)) * 100;
      // materialInfo.coilWidth = coilWidth;
      // materialInfo.partsPerCoil = materialInfo.partsPerCoil;
      materialInfo.sheetWeight = sheetWeight;
      //}
      if (materialInfo.utilisation !== null || materialInfo.utilisation !== 0) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterialInfo?.utilisation : utilisation;
      }
      materialInfo.utilisation = this.shareService.isValidNumber(utilisation);
    }

    if (materialInfo?.isGrossWeightCoilDirty && materialInfo?.grossWeight !== null) {
      materialInfo.grossWeight = Number(materialInfo?.grossWeight);
    } else {
      let grossWeight = this.shareService.isValidNumber((materialInfo?.netWeight / materialInfo.utilisation) * 100);
      if (materialInfo?.grossWeight !== null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : Number(grossWeight);
      }
      materialInfo.grossWeight = grossWeight;
    }

    if (materialInfo?.isScrapWeightDirty && materialInfo?.scrapWeight !== null) {
      materialInfo.scrapWeight = Number(materialInfo?.scrapWeight);
    } else {
      let scrapWeight = this.isValidNumber(materialInfo.grossWeight - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight !== null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterialInfo?.scrapWeight : Number(scrapWeight);
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    if (materialInfo?.isScrapRecoveryDirty && materialInfo.scrapRecovery !== null) {
      materialInfo.scrapRecovery = Number(materialInfo.scrapRecovery);
    } else {
      let scrapRecovery = 90;
      if (materialInfo?.scrapRecovery !== null) {
        scrapRecovery = this.shareService.checkDirtyProperty('scrapRecovery', fieldColorsList) ? selectedMaterialInfo?.scrapRecovery : scrapRecovery;
      }
      materialInfo.scrapRecovery = scrapRecovery;
    }

    if (materialInfo.isMatPriceDirty && materialInfo.materialPricePerKg !== null) {
      materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
    } else {
      materialInfo.materialPricePerKg = this.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterialInfo?.materialPricePerKg : materialInfo.materialPricePerKg;
    }
    if (materialInfo.isScrapPriceDirty && materialInfo.scrapPricePerKg !== null) {
      materialInfo.scrapPricePerKg = Number(materialInfo.scrapPricePerKg);
    } else {
      materialInfo.scrapPricePerKg = this.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedMaterialInfo?.scrapPricePerKg : materialInfo.scrapPricePerKg;
    }
    materialInfo.materialCostPart = this.isValidNumber(Number((Number(materialInfo.grossWeight) / 1000) * Number(materialInfo.materialPricePerKg)));
    materialInfo.scrapRecCost = this.isValidNumber(Number(Number(materialInfo.scrapWeight) / 1000)) * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg);
    materialInfo.netMatCost = Number(materialInfo.materialCostPart) - Number(materialInfo.scrapRecCost);
    // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo);

    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }
    // return new Observable((obs) => {
    //   obs.next(materialInfo);
    // });
    return materialInfo;
  }

  public calculationsForTransferPress(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto) {
    let netWeight = 0;
    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight !== null) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      }
    }
    materialInfo.netWeight = netWeight;

    if (materialInfo?.isTypeOfCableDirty && materialInfo?.typeOfCable !== null) {
      materialInfo.typeOfCable = Number(materialInfo?.typeOfCable);
    } else {
      let stripType = 1; // Defaulted to single // materialInfo.dimUnfoldedX > 100 ? 1 : 2;
      if (materialInfo?.typeOfCable !== null) {
        stripType = this.checkDirtyProperty('typeOfCable', fieldColorsList) ? selectedMaterialInfo?.typeOfCable : Number(stripType);
      }
      materialInfo.typeOfCable = stripType;
    }

    if (materialInfo?.isPartAllowanceDirty && materialInfo?.partAllowance !== null) {
      materialInfo.partAllowance = Number(materialInfo?.partAllowance);
    } else {
      let partAllowance = 0;
      if (materialInfo?.dimUnfoldedZ < 4) partAllowance = this.isValidNumber(Number(materialInfo.dimUnfoldedZ) * 1.5);
      else if (materialInfo?.dimUnfoldedZ < 20) partAllowance = 5;
      // TODO : if > 20 ?
      if (materialInfo?.partAllowance !== null) {
        partAllowance = this.checkDirtyProperty('partAllowance', fieldColorsList) ? selectedMaterialInfo?.partAllowance : partAllowance;
      }
      materialInfo.partAllowance = partAllowance;
    }

    // Coil Size (LxW)
    let H = materialInfo?.dimUnfoldedX ?? 0;
    let I = materialInfo?.dimUnfoldedY ?? 0;
    let T = materialInfo?.dimUnfoldedZ || 0;
    let B = T * 1.5;
    let C = I + B;
    // let A = T + 0.015 * H;
    let L3 = 12000; // default value
    let W = H + 2 * B;

    let startEndScrapLength = 20; // default value

    if (!(materialInfo?.isRunnerTypeDirty && materialInfo?.runnerType !== null)) {
      let coilSize = this.isValidNumber(Number(L3)) + ' x ' + this.isValidNumber(Number(W));
      if (materialInfo?.runnerType !== null) {
        coilSize = this.checkDirtyProperty('runnerType', fieldColorsList) ? selectedMaterialInfo?.runnerType : coilSize;
      }
      materialInfo.runnerType = coilSize;
    }

    if (materialInfo?.isCoilLengthDirty && materialInfo?.coilLength !== null) {
      materialInfo.coilLength = materialInfo?.coilLength ? Number(materialInfo?.coilLength) : materialInfo?.coilLength;
    } else {
      let coilLength = this.isValidNumber(Number(L3));
      if (materialInfo?.coilLength !== null) {
        coilLength = this.checkDirtyProperty('coilLength', fieldColorsList) ? selectedMaterialInfo?.coilLength : coilLength;
      }
      materialInfo.coilLength = coilLength;
    }

    if (materialInfo?.isCoilWidthDirty && materialInfo?.coilWidth !== null) {
      materialInfo.coilWidth = materialInfo?.coilWidth ? Number(materialInfo?.coilWidth) : materialInfo?.coilWidth;
    } else {
      let coilWidth = this.isValidNumber(Number(W));
      if (materialInfo?.coilWidth !== null) {
        coilWidth = this.checkDirtyProperty('coilWidth', fieldColorsList) ? selectedMaterialInfo?.coilWidth : coilWidth;
      }
      materialInfo.coilWidth = coilWidth;
    }

    // Edge Allowances
    if (materialInfo?.isPartShapeDirty && materialInfo?.partShape !== null) {
      materialInfo.partShape = materialInfo?.partShape || '';
    } else {
      let clampingAllownces = 'Not Applicable';
      if (materialInfo?.partShape !== null) {
        clampingAllownces = this.checkDirtyProperty('partShape', fieldColorsList) ? selectedMaterialInfo?.partShape : clampingAllownces;
      }
      materialInfo.partShape = clampingAllownces;
    }

    // Edge Allowance
    if (materialInfo?.isMoldBoxLengthDirty && materialInfo?.moldBoxLength !== null) {
      materialInfo.moldBoxLength = Number(materialInfo?.moldBoxLength);
    } else {
      let edgeAllowance = 0;

      if (materialInfo.partShape !== 'Not Applicable') {
        if (materialInfo?.dimUnfoldedZ < 4) edgeAllowance = this.isValidNumber(Number(materialInfo.dimUnfoldedZ) * 1.5);
        else if (materialInfo?.dimUnfoldedZ < 20) edgeAllowance = 5;
      }

      if (materialInfo?.moldBoxLength !== null) {
        edgeAllowance = this.checkDirtyProperty('moldBoxLength', fieldColorsList) ? selectedMaterialInfo?.moldBoxLength : edgeAllowance;
      }
      materialInfo.moldBoxLength = edgeAllowance;
    }

    if (materialInfo?.isPartsPerCoilDirty && materialInfo?.partsPerCoil !== null) {
      materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
    } else {
      let partsPerCoil = this.isValidNumber(Number(Math.floor((materialInfo.coilLength - startEndScrapLength) / C)));
      if (materialInfo?.partsPerCoil !== null) {
        partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterialInfo?.partsPerCoil : Math.trunc(partsPerCoil);
      }
      materialInfo.partsPerCoil = this.shareService.isValidNumber(partsPerCoil);
    }

    // Coil Weight
    if (materialInfo?.isCoilWeightDirty && materialInfo?.coilWeight !== null) {
      materialInfo.coilWeight = Number(materialInfo?.coilWeight);
    } else {
      let coilWeight = (materialInfo.coilLength * materialInfo.coilWidth * materialInfo?.dimUnfoldedZ * materialInfo.density) / 1000;
      if (materialInfo?.coilWeight !== null) {
        coilWeight = this.checkDirtyProperty('coilWeight', fieldColorsList) ? selectedMaterialInfo?.coilWeight : coilWeight;
      }
      materialInfo.coilWeight = coilWeight;
    }

    // Gross weight per part
    if (materialInfo?.isGrossWeightDirty && materialInfo?.grossWeight !== null) {
      materialInfo.grossWeight = Number(materialInfo?.grossWeight);
    } else {
      let grossWeight = this.shareService.isValidNumber(materialInfo?.coilWeight / materialInfo.partsPerCoil);
      if (materialInfo?.grossWeight !== null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : Number(grossWeight);
      }
      materialInfo.grossWeight = grossWeight;
    }

    if (materialInfo.isutilisationDirty && materialInfo.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = 0;

      utilisation =
        this.shareService.isValidNumber(
          (materialInfo.partsPerCoil * materialInfo.netWeight) / ((materialInfo?.coilWidth * materialInfo?.coilLength * materialInfo?.dimUnfoldedZ * materialInfo.density) / 1000)
        ) * 100;

      if (materialInfo.utilisation !== null) {
        utilisation = this.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterialInfo?.utilisation : utilisation;
      }
      this.shareService.isValidNumber(utilisation);
    }

    // Criticality
    if (materialInfo?.isTypeOfWeldDirty && materialInfo?.typeOfWeld !== null) {
      materialInfo.typeOfWeld = Number(materialInfo?.typeOfWeld);
    } else {
      let criticality = 1;
      if (materialInfo.percentageOfReduction >= 90) {
        criticality = 1; //"Normal";
      } else if (materialInfo.percentageOfReduction >= 70 && materialInfo.percentageOfReduction < 90) {
        criticality = 2; //"Less Critical";
      } else if (materialInfo.percentageOfReduction > 50 && materialInfo.percentageOfReduction < 70) {
        criticality = 3; //"Moderate";
      } else {
        criticality = 4; //"Critical";
      }
      if (materialInfo?.typeOfWeld !== null) {
        criticality = this.checkDirtyProperty('typeOfWeld', fieldColorsList) ? selectedMaterialInfo?.typeOfWeld : Number(criticality);
      }
      materialInfo.typeOfWeld = criticality;
    }

    // Actual Utilisation %
    if (materialInfo?.isYeildUtilizationDirty && materialInfo?.yeildUtilization !== null) {
      materialInfo.yeildUtilization = Number(materialInfo?.yeildUtilization);
    } else {
      let utilization = this.shareService.isValidNumber((materialInfo.partsPerCoil * materialInfo.netWeight) / ((W * L3 * T * materialInfo.density) / 1000)) * 100;
      if (materialInfo?.yeildUtilization !== null) {
        utilization = this.checkDirtyProperty('yeildUtilization', fieldColorsList) ? selectedMaterialInfo?.yeildUtilization : Number(utilization);
      }
      materialInfo.yeildUtilization = utilization;
    }

    // Gross material weight (utilisation based) (gms)
    if (materialInfo?.isUnbendPartWeightDirty && materialInfo?.unbendPartWeight !== null) {
      materialInfo.unbendPartWeight = Number(materialInfo?.unbendPartWeight);
    } else {
      let grossMaterialWeightUtilBased = this.shareService.isValidNumber(materialInfo.netWeight / materialInfo.yeildUtilization) * 100;
      if (materialInfo?.unbendPartWeight !== null) {
        grossMaterialWeightUtilBased = this.checkDirtyProperty('unbendPartWeight', fieldColorsList) ? selectedMaterialInfo?.unbendPartWeight : Number(grossMaterialWeightUtilBased);
      }
      materialInfo.unbendPartWeight = grossMaterialWeightUtilBased;
    }

    // Best gross weight (gms)
    if (materialInfo?.isPouringWeightDirty && materialInfo?.pouringWeight !== null) {
      materialInfo.pouringWeight = Number(materialInfo?.pouringWeight);
    } else {
      let bestGrossWeight = this.shareService.isValidNumber(Math.min(materialInfo.grossWeight, materialInfo.unbendPartWeight));
      if (materialInfo?.pouringWeight !== null) {
        bestGrossWeight = this.checkDirtyProperty('bestGrossWeight', fieldColorsList) ? selectedMaterialInfo?.pouringWeight : Number(bestGrossWeight);
      }
      materialInfo.pouringWeight = bestGrossWeight;
    }

    if (materialInfo?.isScrapWeightDirty && materialInfo?.scrapWeight !== null) {
      materialInfo.scrapWeight = Number(materialInfo?.scrapWeight);
    } else {
      let scrapWeight = this.isValidNumber(materialInfo.pouringWeight - Number(materialInfo.netWeight));
      if (materialInfo?.scrapWeight !== null) {
        scrapWeight = this.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterialInfo?.scrapWeight : Number(scrapWeight);
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    if (materialInfo.isMatPriceDirty && materialInfo.materialPricePerKg !== null) {
      materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
    } else {
      materialInfo.materialPricePerKg = this.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterialInfo?.materialPricePerKg : materialInfo.materialPricePerKg;
    }
    if (materialInfo.isScrapPriceDirty && materialInfo.scrapPricePerKg !== null) {
      materialInfo.scrapPricePerKg = Number(materialInfo.scrapPricePerKg);
    } else {
      materialInfo.scrapPricePerKg = this.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedMaterialInfo?.scrapPricePerKg : materialInfo.scrapPricePerKg;
    }

    if (materialInfo?.isScrapRecoveryDirty && materialInfo.scrapRecovery !== null) {
      materialInfo.scrapRecovery = Number(materialInfo.scrapRecovery);
    } else {
      let scrapRecovery = 90;
      if (materialInfo?.scrapRecovery !== null) {
        scrapRecovery = this.shareService.checkDirtyProperty('scrapRecovery', fieldColorsList) ? selectedMaterialInfo?.scrapRecovery : scrapRecovery;
      }
      materialInfo.scrapRecovery = scrapRecovery;
    }

    materialInfo.materialCostPart = this.isValidNumber(Number((Number(materialInfo.pouringWeight) / 1000) * Number(materialInfo.materialPricePerKg)));
    materialInfo.scrapRecCost = this.isValidNumber(Number(Number(materialInfo.scrapWeight) / 1000)) * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg);
    materialInfo.netMatCost = Number(materialInfo.materialCostPart) - Number(materialInfo.scrapRecCost);
    // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo);

    if (materialInfo.volumeDiscountPer > 0) {
      materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    }
    return materialInfo;
    // return new Observable((obs) => {
    //   obs.next(materialInfo);
    // });
  }
  // no ref
  public calculationsForWelding(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto) {
    let netWeight = 0;
    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      netWeight = Number(materialInfo.netWeight);
    } else {
      netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000) || 0;
      if (materialInfo?.netWeight) {
        netWeight = this.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterialInfo?.netWeight : netWeight;
      }
    }
    materialInfo.netWeight = netWeight;

    // const angleInDegrees: number = 45;
    // if (materialInfo.processId === PrimaryProcessType.StickWelding) {
    //   materialInfo.weldLegLength = Number(materialInfo.dimX) > Number(materialInfo.dimY) ? materialInfo.dimX : materialInfo.dimY;
    // } else {
    //   materialInfo.weldLegLength = Math.sqrt(2) * (materialInfo.dimY / Math.cos(angleInDegrees));
    // }

    // if (materialInfo.iswireDiameterDirty && !!materialInfo.wireDiameter) {
    //   materialInfo.wireDiameter = Number(materialInfo.wireDiameter);
    // } else {
    //   let wireDiameter = 0;
    //   if (materialInfo.processId === PrimaryProcessType.StickWelding) {
    //     wireDiameter = this.costingConfig.weldingValuesForStickWelding().find((x) => x.ToPartThickness >= Number(materialInfo.partTickness))?.WireDiameter;
    //   } else if (materialInfo.processId === PrimaryProcessType.TigWelding) {
    //     wireDiameter = this.costingConfig.tigWeldingValuesForMachineType().find((x) => x.id == 3 && x.ToPartThickness >= Number(materialInfo.partTickness))?.WireDiameter; // 3 is manual
    //   } else {
    //     wireDiameter = this.costingConfig.weldingValuesForMachineType().find((x) => x.id == 3 && x.ToPartThickness >= Number(materialInfo.partTickness))?.WireDiameter;
    //   }
    //   // let wireDiameter = this.shareService.isValidNumber(weldingValues?.WireDiameter);
    //   if (materialInfo.wireDiameter) {
    //     wireDiameter = this.checkDirtyProperty('wireDiameter', fieldColorsList) ? selectedMaterialInfo?.wireDiameter : wireDiameter;
    //   }
    //   materialInfo.wireDiameter = wireDiameter;
    // }

    if (materialInfo.isPartProjectedAreaDirty && materialInfo.partProjectedArea != null) {
      materialInfo.partProjectedArea = Number(materialInfo.partProjectedArea);
    } else {
      let projectedArea = 0;
      if (materialInfo.typeOfWeld == 1 || materialInfo.typeOfWeld == 2) {
        projectedArea = (Number(materialInfo.dimY) * Number(materialInfo.dimZ)) / 2;
      } else if (materialInfo.typeOfWeld == 3) {
        projectedArea = Number(materialInfo.dimY) * Number(materialInfo.dimZ) + Number(materialInfo.partTickness * 1);
      } else if (materialInfo.typeOfWeld == 4) {
        projectedArea = (Number(materialInfo.dimY) * Number(materialInfo.dimZ) + Number(materialInfo.partTickness * 1)) / 2;
      }

      if (materialInfo.partProjectedArea != null) {
        projectedArea = this.checkDirtyProperty('partProjectArea', fieldColorsList) ? selectedMaterialInfo?.partProjectedArea : projectedArea;
      }
      materialInfo.partProjectedArea = projectedArea;
    }

    // if (materialInfo.isPartVolumeDirty && !!materialInfo.partVolume) {
    //   materialInfo.partVolume = Number(materialInfo.partVolume);
    // } else {
    //   let partVolume = materialInfo.dimX * materialInfo.partProjectedArea;
    //   if (materialInfo.partVolume) {
    //     partVolume = this.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterialInfo?.partVolume : partVolume;
    //   }
    //   materialInfo.partVolume = partVolume;
    // }

    let effeciency = 75;
    if (materialInfo.isEffeciencyDirty && !!materialInfo.effeciency) {
      effeciency = materialInfo.effeciency;
    } else {
      effeciency = this.checkDirtyProperty('effeciency', fieldColorsList) ? selectedMaterialInfo?.effeciency : effeciency;
    }
    materialInfo.effeciency = effeciency;

    // let grossWeight = 0;
    // if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight != null) {
    //   // Weld Material Weight
    //   grossWeight = Number(materialInfo.grossWeight);
    // } else {
    //   grossWeight = this.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo?.density)) / 1000);
    //   if (materialInfo?.grossWeight != null) {
    //     grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : grossWeight;
    //   }
    // }
    // materialInfo.grossWeight = grossWeight;

    // let weldWeightWastage = 0;
    // if (materialInfo.isWeldWeightWastageDirty && !!materialInfo.weldWeightWastage) {
    //   weldWeightWastage = Number(materialInfo.weldWeightWastage);
    // } else {
    //   weldWeightWastage = this.isValidNumber((materialInfo.grossWeight * 100) / effeciency);
    //   if (materialInfo?.weldWeightWastage) {
    //     weldWeightWastage = this.checkDirtyProperty('weldWeightWastage', fieldColorsList) ? selectedMaterialInfo?.weldWeightWastage : weldWeightWastage;
    //   }
    // }
    // materialInfo.weldWeightWastage = weldWeightWastage;
    // materialInfo.netMatCost = this.isValidNumber(weldWeightWastage / 1000) * Number(materialInfo.materialPricePerKg);
    // // materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo);
    // if (materialInfo.volumeDiscountPer > 0) {
    //   materialInfo.netMatCost = materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
    // }
    return materialInfo;
    // new Observable((obs) => {
    //   obs.next(materialInfo);
    // });
  }

  /**
   * Moveable helper: perform sub-material (sand for core) conversions, run welding calculations
   * and patch back the provided FormArray in UI units.
   *
   * Note: this method does not call any external patching helpers; it updates the supplied
   * `sandForCoreFormArray` and returns the calculated MaterialInfoDto so the caller can
   * perform any additional UI updates (e.g. `patchMaterialCalculationResult`).
   */
  public calculationsForWeldingSubMaterial(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
    // Ensure the materialInfo uses the supplied form array for calculations
    // get extracted info
    // const extractedInfo = this.shareService.extractedMaterialData;

    let totalWeldLoss = 0;
    const materialType = this._sheetMetalConfig.mapMaterial(materialInfo?.materialDescriptionList[0]?.materialTypeName || '');
    if (materialInfo.coreCostDetails && materialInfo.coreCostDetails.length > 0) {
      materialInfo.coreCostDetails?.forEach((coreCost, index) => {
        coreCost.coreCostDetailsId = 0;
        // Wire Diameter based on material type
        coreCost.coreWidth = this.weldingConfigService.getWeldingData(materialType, coreCost.coreHeight, materialInfo.processId, 'Manual')?.WireDiameter_mm || 0;
        if (coreCost.iscoreWeightDirty && coreCost.coreWeight !== null) {
          coreCost.coreWeight = Number(coreCost.coreWeight);
        } else {
          let weldElementSize = 0;
          if (coreCost.coreHeight <= 8) weldElementSize = Math.round(coreCost.coreHeight);
          else if (coreCost.coreHeight < 12) weldElementSize = 6;
          else if (coreCost.coreHeight >= 12) weldElementSize = 8;

          if (coreCost?.coreWeight !== null) {
            weldElementSize = this.checkFormArrayDirtyField('coreWeight', index, fieldColorsList)
              ? selectedMaterialInfo?.coreCostDetails?.[index]?.coreWeight
              : this.shareService.isValidNumber(weldElementSize);
          }
          coreCost.coreWeight = weldElementSize;
        }

        if (coreCost.isnoOfCoreDirty && coreCost.noOfCore !== null) {
          coreCost.noOfCore = Number(coreCost.noOfCore);
        } else {
          let noOfWeldPasses = 15;
          if (coreCost.coreHeight <= 8) noOfWeldPasses = 1;
          else if (coreCost.coreHeight <= 12) noOfWeldPasses = 2;
          else if (coreCost.coreHeight <= 16) noOfWeldPasses = 3;
          else if (coreCost.coreHeight <= 25) noOfWeldPasses = 4;
          else if (coreCost.coreHeight <= 30) noOfWeldPasses = 5;
          else if (coreCost.coreHeight <= 40) noOfWeldPasses = 6;
          else if (coreCost.coreHeight <= 50) noOfWeldPasses = 8;
          else if (coreCost.coreHeight <= 60) noOfWeldPasses = 10;

          if (coreCost?.noOfCore !== null) {
            noOfWeldPasses = this.checkFormArrayDirtyField('noOfCore', index, fieldColorsList)
              ? selectedMaterialInfo?.coreCostDetails?.[index]?.noOfCore
              : this.shareService.isValidNumber(noOfWeldPasses);
          }
          coreCost.noOfCore = noOfWeldPasses;
        }

        // weldPlaces
        if (coreCost.iscoreVolumeDirty && coreCost.coreVolume !== null) {
          coreCost.coreVolume = Number(coreCost.coreVolume);
        } else {
          let weldPlaces = 1;

          if (coreCost.coreVolume !== null) {
            weldPlaces = this.checkFormArrayDirtyField('coreVolume', index, fieldColorsList) ? selectedMaterialInfo?.coreCostDetails?.[index]?.coreVolume : this.shareService.isValidNumber(weldPlaces);
          }
          coreCost.coreVolume = weldPlaces;
        }
        let weldCrossSection = 0;
        if (Number(coreCost.coreShape) === 1 || Number(coreCost.coreShape) === 2) {
          weldCrossSection = this.isValidNumber(coreCost.coreWeight ** 2 / 2);
        } else if (Number(coreCost.coreShape) === 3) {
          weldCrossSection = this.isValidNumber(coreCost.coreWeight ** 2 + coreCost.coreHeight);
        } else if (Number(coreCost.coreShape) === 4) {
          weldCrossSection = this.isValidNumber(coreCost.coreWeight ** 2 + coreCost.coreHeight / 2);
        } else {
          weldCrossSection = this.isValidNumber((coreCost.coreWeight * coreCost.coreHeight * 3) / 2);
        }
        // totalWeldLength
        coreCost.weldSide = this.isValidNumber(coreCost.noOfCore * coreCost.coreLength * coreCost.coreVolume * coreCost.coreArea);
        // weldVolume
        coreCost.coreSandPrice = this.isValidNumber(coreCost.weldSide * weldCrossSection);
        // weld loss
        const weldLoss = this.weldingConfigService.getMaxNearestWeightLoss(materialType, coreCost.coreWidth) || 0;
        totalWeldLoss += weldLoss;

        coreCost.coreHeight = this.shareService.convertUomToSaveAndCalculation(Number(coreCost.coreHeight), this.conversionValue, this.isEnableUnitConversion);
        coreCost.coreWidth = this.shareService.convertUomToSaveAndCalculation(Number(coreCost.coreWidth), this.conversionValue, this.isEnableUnitConversion);
        coreCost.coreWeight = this.shareService.convertUomToSaveAndCalculation(Number(coreCost.coreWeight), this.conversionValue, this.isEnableUnitConversion);
        // noOfcore:
        coreCost.noOfCore = this.shareService.convertUomToSaveAndCalculation(Number(coreCost.noOfCore), this.conversionValue, this.isEnableUnitConversion);
        coreCost.coreVolume = this.shareService.convertUomToSaveAndCalculation(Number(coreCost.coreVolume), this.conversionValue, this.isEnableUnitConversion);
        coreCost.coreLength = this.shareService.convertUomToSaveAndCalculation(Number(coreCost.coreLength), this.conversionValue, this.isEnableUnitConversion);
        // weldSide:
        // coreSandPrice:
        coreCost.weldSide = this.shareService.convertUomToSaveAndCalculation(this.shareService.isValidNumber(Number(coreCost.weldSide)), this.conversionValue, this.isEnableUnitConversion);
        coreCost.coreSandPrice = this.shareService.convertUomToSaveAndCalculation(Number(coreCost.coreSandPrice), this.conversionValue, this.isEnableUnitConversion);
      });
    }
    // Run welding calculations (use local implementation)
    const result: MaterialInfoDto = this.calculationsForWelding(materialInfo, fieldColorsList, selectedMaterialInfo);
    result.coreCostDetails?.forEach((coreCost) => {
      coreCost.coreHeight = this.shareService.convertUomInUI(Number(coreCost.coreHeight), this.conversionValue, this.isEnableUnitConversion);
      coreCost.coreWidth = this.shareService.convertUomInUI(Number(coreCost.coreWidth), this.conversionValue, this.isEnableUnitConversion);
      coreCost.coreWeight = this.shareService.convertUomInUI(Number(coreCost.coreWeight), this.conversionValue, this.isEnableUnitConversion);
      coreCost.noOfCore = this.shareService.convertUomInUI(Number(coreCost.noOfCore), this.conversionValue, this.isEnableUnitConversion);
      coreCost.coreVolume = this.shareService.convertUomInUI(Number(coreCost.coreVolume), this.conversionValue, this.isEnableUnitConversion);
      coreCost.coreLength = this.shareService.convertUomInUI(Number(coreCost.coreLength), this.conversionValue, this.isEnableUnitConversion);
      coreCost.weldSide = this.shareService.convertUomInUI(this.shareService.isValidNumber(Number(coreCost.weldSide)), this.conversionValue, this.isEnableUnitConversion);
      coreCost.coreSandPrice = this.shareService.convertUomInUI(Number(coreCost.coreSandPrice), this.conversionValue, this.isEnableUnitConversion);
    });

    if (result.isTotalWeldLengthDirty && !!result.totalWeldLength) {
      result.totalWeldLength = Number(result.totalWeldLength);
    } else {
      let totalWeldLength = result.coreCostDetails?.reduce((sum, ctrl) => {
        return sum + this.shareService.convertUomInUI(Number(ctrl.weldSide), this.conversionValue, this.isEnableUnitConversion);
      }, 0);
      if (result.totalWeldLength) {
        totalWeldLength = this.checkDirtyProperty('totalWeldLength', fieldColorsList) ? selectedMaterialInfo?.totalWeldLength : totalWeldLength;
      }
      result.totalWeldLength = this.isValidNumber(totalWeldLength);
    }

    const totalVolume = result.coreCostDetails?.reduce((sum, ctrl) => {
      return sum + this.shareService.convertUomInUI(Number(ctrl.coreSandPrice), this.conversionValue, this.isEnableUnitConversion);
    }, 0);

    if (result.isGrossWeightDirty && !!result.grossWeight) {
      result.grossWeight = Number(result.grossWeight);
    } else {
      let totalWeight = (totalVolume * result.density) / 1000;
      if (result.grossWeight) {
        totalWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : totalWeight;
      }
      result.grossWeight = this.isValidNumber(totalWeight);
    }

    // weld material weight with wastage

    if (result.isWeldWeightWastageDirty && !!result.weldWeightWastage) {
      result.weldWeightWastage = Number(result.weldWeightWastage);
    } else {
      let weldWeightWastage = (result.grossWeight / result.effeciency) * 100 + totalWeldLoss;
      if (result.weldWeightWastage) {
        weldWeightWastage = this.checkDirtyProperty('weldWeightWastage', fieldColorsList) ? selectedMaterialInfo?.weldWeightWastage : weldWeightWastage;
      }
      result.weldWeightWastage = this.isValidNumber(weldWeightWastage);
    }

    result.netMatCost = this.isValidNumber((result.weldWeightWastage / 1000) * Number(result.materialPricePerKg));

    return result;
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

  public isValidNumber(value: any): number {
    return !value || Number.isNaN(value) || !Number.isFinite(Number(value)) || value < 0 ? 0 : value;
  }

  checkFormArrayDirtyField(fieldName: string, index: number, fieldColorsList: any): boolean {
    return fieldColorsList?.find((x) => x.formControlName == fieldName && x.subProcessIndex == index)?.isDirty || false;
  }
}
