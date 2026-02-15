import { Injectable, effect } from '@angular/core';
import { SharedService } from './shared.service';
import { MaterialInfoDto, MaterialMasterDto, PartInfoDto, VendorDto } from 'src/app/shared/models';
import { IMaterialCalculationByCommodity } from './IMaterialCalculationByCommodity';
import { PrimaryProcessType } from '../costing.config';
import { MaterialConfigService } from 'src/app/shared/config/cost-material-config';
import { CavityConfigService } from 'src/app/shared/config/cavity-config';
import { PlasticRubberConfigService } from 'src/app/shared/config/plastic-rubber-config.service';
import { StampingMetrialLookUp } from 'src/app/shared/models/sheet-metal-lookup.model';
import { StampingMetrialLookUpState } from '../../_state/stamping-material-lookup.state';
import { AnnualRevenueTypeEnum, AnnualRevenueTypeNameMap, StampingMaterialLookUpCatEnum } from 'src/app/shared/enums';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';
// import { PartInfoState } from '../../_state/part-info.state';
import { VendorService } from '../../data/Service/vendor.service';
import { PartInfoSignalsService } from 'src/app/shared/signals/part-info-signals.service';

@Injectable({
  providedIn: 'root',
})
export class MaterialInsulationJacketCalculatorService implements IMaterialCalculationByCommodity {
  currentPart: PartInfoDto;
  // _partInfo$: Observable<PartInfoDto>;
  _stampingMetrialLookUp$: Observable<StampingMetrialLookUp[]>;
  _stampingMetrialLookUpData: StampingMetrialLookUp[] = [];
  vendorDto: VendorDto[] = [];
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  partInfoEffect = effect(() => {
    const partInfo = this.partInfoSignalsService.partInfo();
    if (partInfo) {
      this.currentPart = { ...partInfo };
    }
  });
  constructor(
    private store: Store,
    private shareService: SharedService,
    private materialConfigService: MaterialConfigService,
    private cavityConfigService: CavityConfigService,
    private plasticRubberConfigService: PlasticRubberConfigService,
    private vendorService: VendorService,
    private partInfoSignalsService: PartInfoSignalsService
  ) {
    // this._partInfo$ = this.store.select(PartInfoState.getPartInfo);
    this._stampingMetrialLookUp$ = this.store.select(StampingMetrialLookUpState.getStampingMetrialLookUp);
    this._stampingMetrialLookUp$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((response) => {
      if (response && response.length > 0) {
        this._stampingMetrialLookUpData = response;
      }
    });
  }
  setCurrentPart(part: PartInfoDto) {
    this.currentPart = part;
  }
  CalculateMaterialCost(processId: number, materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): MaterialInfoDto {
    switch (processId) {
      case PrimaryProcessType.InsulationJacket:
        let insulationJacketResult = this.calculationsForInsulationJacket(materialInfo, fieldColorsList, selectedMaterial);
        return insulationJacketResult;
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
        return this.calculationsForPlating(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.Galvanization:
      case PrimaryProcessType.WetPainting:
      case PrimaryProcessType.SiliconCoatingAuto:
      case PrimaryProcessType.SiliconCoatingSemi:
        return this.calculationsForCoating(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.ThermoForming:
        return this.calculationsForThermalForming(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.PlasticVacuumForming:
        return this.calculationsForVacuumForming(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.WireCuttingTermination:
        return this.calculationsForWireCuttingTermination(materialInfo, fieldColorsList, selectedMaterial);
      default:
        return materialInfo;
    }
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
  async getSupplier() {
    await this.vendorService.getVendorList().subscribe((result: VendorDto[]) => {
      if (result && result?.length > 0) {
        this.vendorDto = [...result];
      }
    });
  }
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

  public calculationsForInsulationJacket(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
    if (materialInfo.isDensityDirty && !!materialInfo.density) {
      materialInfo.density = Number(materialInfo.density);
    } else {
      materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterialInfo?.density : materialInfo.density;
    }

    if (materialInfo.isScrapPriceDirty && !!materialInfo.scrapPricePerKg) {
      materialInfo.scrapPricePerKg = Number(materialInfo.scrapPricePerKg);
    } else {
      materialInfo.scrapPricePerKg = this.shareService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedMaterialInfo?.scrapPricePerKg : materialInfo.scrapPricePerKg;
    }

    if (materialInfo.isMatPriceDirty && !!materialInfo.materialPricePerKg) {
      materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
    } else {
      materialInfo.materialPricePerKg = this.shareService.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterialInfo?.materialPricePerKg : materialInfo.materialPricePerKg;
    }

    if (materialInfo.isPartVolumeDirty && !!materialInfo.partVolume) {
      materialInfo.partVolume = Number(materialInfo.partVolume);
    } else {
      materialInfo.partVolume = this.shareService.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterialInfo?.partVolume : Number(materialInfo.partVolume);
    }

    if (materialInfo.isPerimeterDirty && !!materialInfo?.perimeter) {
      materialInfo.perimeter = Number(materialInfo?.perimeter);
    } else {
      materialInfo.perimeter = this.shareService.checkDirtyProperty('perimeter', fieldColorsList) ? selectedMaterialInfo?.perimeter : materialInfo.perimeter;
    }

    if (materialInfo.isPartProjectedAreaDirty && !!materialInfo.partProjectedArea) {
      materialInfo.partProjectedArea = Number(materialInfo.partProjectedArea);
    } else {
      materialInfo.partProjectedArea = this.shareService.checkDirtyProperty('partProjectArea', fieldColorsList) ? selectedMaterialInfo?.partProjectedArea : Number(materialInfo.partProjectedArea);
    }

    return materialInfo;
    // return new Observable((obs) => { obs.next(materialInfo); });
  }

  public calculationsForPlating(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): MaterialInfoDto {
    // let volumeOfBarrel = 1000 * 1000 * 1000;
    // if (materialInfo.processId === PrimaryProcessType.ZincPlating) {
    //   volumeOfBarrel = (3.142 * 280 * 280 * 1065);
    // } else if (materialInfo.processId === PrimaryProcessType.ChromePlating) {
    //   volumeOfBarrel = 3000 * 3000 * 3000;
    // }
    const pType = Number(materialInfo.processId);

    const platingAreaLength = Number(materialInfo.dimX);
    const platingAreaWidth = Number(materialInfo.dimY);
    // if (materialInfo.isDensityDirty && materialInfo.density != null && materialInfo.density != 0) {
    //   materialInfo.density = Number(materialInfo.density);
    // } else {
    //   materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterial?.density : 7.14;
    // }

    // if (materialInfo.isMatPriceDirty && materialInfo.materialPricePerKg != null && materialInfo.materialPricePerKg != 0) {
    //   materialInfo.materialPricePerKg = Number(materialInfo.materialPricePerKg);
    // } else {
    //   materialInfo.materialPricePerKg = this.shareService.checkDirtyProperty('matPrice', fieldColorsList) ? selectedMaterial?.materialPricePerKg : 3.28;
    // }

    // if (materialInfo.ispaintCoatingTicknessDirty && materialInfo.paintCoatingTickness != null && materialInfo.paintCoatingTickness != 0) {
    //   materialInfo.paintCoatingTickness = Number(materialInfo.paintCoatingTickness);
    // } else {
    //   materialInfo.paintCoatingTickness = this.shareService.checkDirtyProperty('paintCoatingTickness', fieldColorsList) ? selectedMaterial?.paintCoatingTickness : 12;
    // }

    if (materialInfo.ispaintAreaDirty && !!materialInfo.paintArea) {
      materialInfo.paintArea = Number(materialInfo.paintArea);
    } else {
      let paintArea = Number(materialInfo.paintArea) || this.shareService.isValidNumber(platingAreaLength * platingAreaWidth * 2);
      if (materialInfo.paintArea) {
        paintArea = this.shareService.checkDirtyProperty('paintArea', fieldColorsList) ? selectedMaterial?.paintArea : paintArea;
      }
      materialInfo.paintArea = paintArea;
    }

    // if (materialInfo.isPartVolumeDirty && !!materialInfo.partVolume) {
    //   materialInfo.partVolume = Number(materialInfo.partVolume);
    // } else {
    //   let partVolume = this.shareService.isValidNumber(Number(materialInfo.paintArea) * Number(materialInfo.partTickness)); // only if not found in extracted values
    //   if (materialInfo.partVolume) {
    //     partVolume = materialInfo.isPartVolumeDirty ? selectedMaterial?.partVolume : partVolume;
    //   }
    //   materialInfo.partVolume = partVolume;
    // }

    // const volumeOfPartForPlating = this.shareService.isValidNumber(Number(materialInfo.partVolume * 1.3));

    const totalPlatingVolume = this.shareService.isValidNumber(Number(materialInfo.partSurfaceArea) * Number(materialInfo.paintCoatingTickness / 1000)); // divided by 1000 to change micron to mm

    if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      let netWeight = this.shareService.isValidNumber((Number(totalPlatingVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight) {
        netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }

    if (materialInfo.isutilisationDirty && materialInfo.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = 85;
      if (pType === PrimaryProcessType.PowderCoating || pType === PrimaryProcessType.Painting) {
        utilisation = 70;
      }
      if (materialInfo.utilisation !== null) {
        utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    // if (materialInfo.isPercentageOfReductionDirty && !!materialInfo.percentageOfReduction) {
    //   materialInfo.percentageOfReduction = Number(materialInfo.percentageOfReduction);
    // } else {
    //   materialInfo.percentageOfReduction = this.shareService.checkDirtyProperty('percentageOfReduction', fieldColorsList) ? selectedMaterial?.percentageOfReduction : 10;
    // }

    // const availableVolume = Math.floor(volumeOfBarrel * (materialInfo.percentageOfReduction / 100));

    // if (materialInfo.isPartsPerCoilDirty && !!materialInfo.partsPerCoil) {
    //   materialInfo.partsPerCoil = Number(materialInfo.partsPerCoil);
    // } else {
    //   let partsPerCoil = Math.floor(availableVolume / Number(materialInfo.partVolume));
    //   if (!!materialInfo.partsPerCoil) {
    //     partsPerCoil = this.shareService.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterial?.partsPerCoil : partsPerCoil;
    //   }
    //   materialInfo.partsPerCoil = partsPerCoil;
    // }

    if (materialInfo.isGrossWeightDirty && !!materialInfo.grossWeight) {
      // with losses
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      let grossWeight = this.shareService.isValidNumber(Number(materialInfo.netWeight) / (Number(materialInfo.utilisation) / 100));
      if (materialInfo.grossWeight) {
        grossWeight = this.shareService.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterial?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    // weight of plating
    if (materialInfo.isPouringWeightDirty && !!materialInfo.pouringWeight) {
      materialInfo.pouringWeight = Number(materialInfo.pouringWeight);
    } else {
      let weightOfPlating = this.shareService.isValidNumber(Number(totalPlatingVolume) * (Number(materialInfo.density) / 1000));
      if (materialInfo.pouringWeight) {
        weightOfPlating = this.shareService.checkDirtyProperty('pouringWeight', fieldColorsList) ? selectedMaterial?.pouringWeight : weightOfPlating;
      }
      materialInfo.pouringWeight = weightOfPlating;
    }

    // plating weight with loss
    if (materialInfo.isOxidationLossWeightDirty && !!materialInfo.oxidationLossWeight) {
      materialInfo.oxidationLossWeight = Number(materialInfo.oxidationLossWeight);
    } else {
      let weightLossPlating = this.shareService.isValidNumber(Number(materialInfo.pouringWeight) / Number(materialInfo.utilisation / 100));
      if (materialInfo.oxidationLossWeight) {
        weightLossPlating = this.shareService.checkDirtyProperty('oxidationLossWeight', fieldColorsList) ? selectedMaterial?.oxidationLossWeight : weightLossPlating;
      }
      materialInfo.oxidationLossWeight = weightLossPlating;
    }

    // if (materialInfo.processId === PrimaryProcessType.ChromePlating) {
    //   materialInfo.netMatCost = this.shareService.isValidNumber((Math.floor(materialInfo.totalPaintCostsqm / 7) / 80) / Number(materialInfo.partsPerCoil));
    // } else {
    materialInfo.netMatCost = this.shareService.isValidNumber((materialInfo.grossWeight * materialInfo.materialPricePerKg) / 1000);
    // }
    return materialInfo;
  }

  public calculationsForCoating(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): MaterialInfoDto {
    const platingAreaLength = Number(materialInfo.dimX);
    const platingAreaWidth = Number(materialInfo.dimY);
    const platingAreaHeight = Number(materialInfo.dimZ);

    const pType = Number(materialInfo.processId);
    let defaultUtilisation = 85;
    let defaultPaintCoatingTickness = 0;
    if (pType === PrimaryProcessType.SiliconCoatingAuto) {
      defaultUtilisation = 70;
      defaultPaintCoatingTickness = 70;
      materialInfo.percentageOfReduction = 0;
    } else if (pType === PrimaryProcessType.SiliconCoatingSemi) {
      defaultUtilisation = 70;
      defaultPaintCoatingTickness = 70;
      materialInfo.percentageOfReduction = 0;
    } else if (pType === PrimaryProcessType.WetPainting) {
      defaultUtilisation = 70;
      defaultPaintCoatingTickness = 70;
      // materialInfo.percentageOfReduction = 0;
      materialInfo.noOfCavities = 2;
    }

    let coatingGrade = this.materialConfigService.coatingGrade.filter((x) => x.id === Number(materialInfo.typeOfMaterialBase));
    if (pType === PrimaryProcessType.Galvanization) {
      const coatingGradeData = this.materialConfigService.getMaxCoatingThicknessRecord(materialInfo.dimUnfoldedZ);
      coatingGrade = [coatingGradeData];

      if (materialInfo.isTypeOfMaterialBaseDirty && !!materialInfo.typeOfMaterialBase) {
        materialInfo.typeOfMaterialBase = Number(materialInfo.typeOfMaterialBase);
      } else {
        let grade = coatingGrade.length > 0 ? coatingGrade[0].id : 0;
        if (materialInfo.typeOfMaterialBase) {
          grade = this.shareService.checkDirtyProperty('typeOfMaterialBase', fieldColorsList) ? selectedMaterial?.typeOfMaterialBase : grade;
        }
        materialInfo.typeOfMaterialBase = grade || 0;
      }
    }

    if (materialInfo.ispaintCoatingTicknessDirty && !!materialInfo.paintCoatingTickness) {
      materialInfo.paintCoatingTickness = Number(materialInfo.paintCoatingTickness);
    } else {
      let paintCoatingTickness = defaultPaintCoatingTickness;
      pType === PrimaryProcessType.Galvanization && (paintCoatingTickness = coatingGrade.length > 0 ? coatingGrade[0].thickness : 0);
      if (materialInfo.paintCoatingTickness) {
        paintCoatingTickness = this.shareService.checkDirtyProperty('paintCoatingTickness', fieldColorsList) ? selectedMaterial?.paintCoatingTickness : paintCoatingTickness;
      }
      materialInfo.paintCoatingTickness = paintCoatingTickness;
    }

    if (materialInfo.ispaintAreaDirty && !!materialInfo.paintArea) {
      materialInfo.paintArea = Number(materialInfo.paintArea);
    } else {
      let paintArea = 0;
      if (pType === PrimaryProcessType.Galvanization) {
        paintArea =
          Number(materialInfo.paintArea) || this.shareService.isValidNumber((platingAreaLength * platingAreaWidth + platingAreaWidth * platingAreaHeight + platingAreaLength * platingAreaHeight) * 2);
      } else {
        paintArea = Number(materialInfo.paintArea) || this.shareService.isValidNumber(platingAreaLength * platingAreaWidth * materialInfo.noOfCavities);
      }
      if (materialInfo.paintArea) {
        paintArea = this.shareService.checkDirtyProperty('paintArea', fieldColorsList) ? selectedMaterial?.paintArea : paintArea;
      }
      materialInfo.paintArea = paintArea;
    }

    if (materialInfo.isutilisationDirty && !!materialInfo.utilisation) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = defaultUtilisation;
      if (materialInfo.utilisation) {
        utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    let totalCoatingArea = 0;
    let coatingVolume = 0;
    let coatingWeight = 0;
    if (pType === PrimaryProcessType.Galvanization) {
      totalCoatingArea = this.shareService.isValidNumber(Number(materialInfo.paintArea) * (1 - Number(materialInfo.percentageOfReduction) / 100)) || Number(materialInfo.paintArea);
      coatingVolume = this.shareService.isValidNumber(Number(materialInfo.paintCoatingTickness * totalCoatingArea) / 1000);

      // coating Weight
      if (materialInfo.isPouringWeightDirty && !!materialInfo.pouringWeight) {
        materialInfo.pouringWeight = Number(materialInfo.pouringWeight);
      } else {
        coatingWeight = this.shareService.isValidNumber((coatingVolume * Number(materialInfo.density)) / 1000);
        if (materialInfo.pouringWeight) {
          coatingWeight = this.shareService.checkDirtyProperty('pouringWeight', fieldColorsList) ? selectedMaterial?.pouringWeight : coatingWeight;
        }
        materialInfo.pouringWeight = coatingWeight;
      }

      // coating Weight with losses
      if (materialInfo.isOxidationLossWeightDirty && !!materialInfo.oxidationLossWeight) {
        materialInfo.oxidationLossWeight = Number(materialInfo.oxidationLossWeight);
      } else {
        let coatingWeightLoss = this.shareService.isValidNumber(materialInfo.pouringWeight / (materialInfo.utilisation / 100));
        if (materialInfo.oxidationLossWeight) {
          coatingWeightLoss = this.shareService.checkDirtyProperty('oxidationLossWeight', fieldColorsList) ? selectedMaterial?.oxidationLossWeight : coatingWeightLoss;
        }
        materialInfo.oxidationLossWeight = coatingWeightLoss;
      }
    } else {
      coatingWeight = this.shareService.isValidNumber((coatingVolume * Number(materialInfo.density)) / 1000);
      coatingVolume = this.shareService.isValidNumber((Number(materialInfo.paintArea) * Number(materialInfo.paintCoatingTickness) * (1 - Number(materialInfo.percentageOfReduction) / 100)) / 1000); // divided by 1000 to change micron to mm
      materialInfo.pouringWeight = coatingWeight;
    }

    if (pType !== PrimaryProcessType.Galvanization) {
      if (materialInfo.isPartVolumeDirty && !!materialInfo.partVolume) {
        materialInfo.partVolume = Number(materialInfo.partVolume);
      } else {
        let partVolume = Number(materialInfo.partVolume) || platingAreaLength * platingAreaWidth * platingAreaHeight; // only if not found in extracted values
        if (materialInfo.partVolume) {
          partVolume = this.shareService.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterial?.partVolume : partVolume;
        }
        materialInfo.partVolume = partVolume;
      }

      if (materialInfo.isPartSurfaceAreaDirty && !!materialInfo.partSurfaceArea) {
        materialInfo.partSurfaceArea = Number(materialInfo.partSurfaceArea);
      } else {
        let partSurfaceArea = this.shareService.isValidNumber(Number(materialInfo.paintArea) * (1 - Number(materialInfo.percentageOfReduction) / 100)) || Number(materialInfo.paintArea);
        if (materialInfo.partSurfaceArea) {
          partSurfaceArea = this.shareService.checkDirtyProperty('partSurfaceArea', fieldColorsList) ? selectedMaterial?.partSurfaceArea : partSurfaceArea;
        }
        materialInfo.partSurfaceArea = partSurfaceArea;
      }
    }

    if (pType !== PrimaryProcessType.Galvanization) {
      if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
        materialInfo.netWeight = Number(materialInfo.netWeight);
      } else {
        let netWeight = coatingWeight;
        if (pType === PrimaryProcessType.Galvanization) {
          netWeight = Number(materialInfo.netWeight) || this.shareService.isValidNumber((Number(materialInfo.partVolume) * 7.85) / 1000);
        }
        if (materialInfo.netWeight) {
          netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
        }
        materialInfo.netWeight = netWeight;
      }
    }

    if (materialInfo.isGrossWeightDirty && !!materialInfo.grossWeight) {
      materialInfo.grossWeight = Number(materialInfo.grossWeight);
    } else {
      let grossWeight = this.shareService.isValidNumber((materialInfo.pouringWeight || coatingWeight) / (Number(materialInfo.utilisation) / 100));
      if (materialInfo.grossWeight) {
        grossWeight = this.shareService.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterial?.grossWeight : grossWeight;
      }
      materialInfo.grossWeight = grossWeight;
    }

    materialInfo.netMatCost = this.shareService.isValidNumber((materialInfo.grossWeight * materialInfo.materialPricePerKg) / 1000);
    return materialInfo;
  }
  public calculationsForThermalForming(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto) {
    if (materialInfo.isAvgWallthickDirty && materialInfo.wallAverageThickness !== null) {
      materialInfo.wallAverageThickness = Number(materialInfo.wallAverageThickness);
    } else {
      let wallAverageThickness = this.shareService.extractedMaterialData?.WallAverageThickness || 0;
      if (materialInfo.wallAverageThickness !== null) {
        wallAverageThickness = this.shareService.checkDirtyProperty('wallAverageThickness', fieldColorsList) ? selectedMaterial?.wallAverageThickness : wallAverageThickness;
      }
      materialInfo.wallAverageThickness = wallAverageThickness;
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

    // let matMaster = materialInfo.materialDescriptionList.find((x) => x.materialMasterId === Number(materialInfo.materialMasterId));
    // const materialType = matMaster?.materialTypeName; // materialInfo?.materialMarketData?.materialMaster?.materialTypeName;
    // const lookupInfo = materialInfo.thermoFormingList?.find((x) => x.rawMaterial === materialType);
    if (materialInfo.isSheetLengthDirty && materialInfo.sheetLength !== null) {
      materialInfo.sheetLength = Number(materialInfo.sheetLength);
    } else {
      const sorted = this.plasticRubberConfigService.thermoStdSheetLengthList.map((item) => item.length).sort((a, b) => a - b);
      const nearest = sorted.find((length) => length >= materialInfo.dimX);
      let sheetLength = this.shareService.isValidNumber(nearest);
      if (materialInfo.sheetLength !== null) {
        sheetLength = this.shareService.checkDirtyProperty('sheetLength', fieldColorsList) ? selectedMaterial?.sheetLength : sheetLength;
      }
      materialInfo.sheetLength = sheetLength;
    }

    if (materialInfo.isSheetWidthDirty && materialInfo.sheetWidth !== null) {
      materialInfo.sheetWidth = Number(materialInfo.sheetWidth);
    } else {
      const sorted = this.plasticRubberConfigService.thermoStdSheetWidthList.map((item) => item.width).sort((a, b) => a - b);
      const nearest = sorted.find((length) => length >= materialInfo.dimY);
      let sheetWidth = this.shareService.isValidNumber(nearest);
      if (materialInfo.sheetWidth !== null) {
        sheetWidth = this.shareService.checkDirtyProperty('sheetWidth', fieldColorsList) ? selectedMaterial?.sheetWidth : sheetWidth;
      }
      materialInfo.sheetWidth = sheetWidth;
    }

    if (materialInfo.isSheetThicknessDirty && materialInfo.sheetThickness !== null) {
      materialInfo.sheetThickness = Number(materialInfo.sheetThickness);
    } else {
      let sheetThickness = this.shareService.isValidNumber(Math.ceil(Number(materialInfo.wallAverageThickness)));
      if (materialInfo.sheetThickness !== null) {
        sheetThickness = this.shareService.checkDirtyProperty('sheetThickness', fieldColorsList) ? selectedMaterial?.sheetThickness : sheetThickness;
      }
      materialInfo.sheetThickness = sheetThickness;
    }

    // formingSheetLength
    materialInfo.blockLength = this.shareService.isValidNumber(Number(materialInfo?.dimX) * 1.25);
    // formingSheetWidth
    materialInfo.blockWidth = this.shareService.isValidNumber(Number(materialInfo?.dimY) * 1.25);

    const partsPerRowRatio = this.shareService.isValidNumber(Number(materialInfo?.sheetLength) / materialInfo?.dimX);
    const noOfPartsPerRow = Math.floor(partsPerRowRatio);

    const partsPerColumnRatio = this.shareService.isValidNumber(Number(materialInfo?.sheetWidth) / materialInfo?.dimY);
    const noOfPartsPerColumn = Math.floor(partsPerColumnRatio);

    if (materialInfo.isNoOfCavitiesDirty && !!materialInfo.noOfCavities) {
      materialInfo.noOfCavities = Number(materialInfo.noOfCavities);
    } else {
      let noOfCavities = Number(noOfPartsPerRow) * Number(noOfPartsPerColumn);
      if (materialInfo.noOfCavities !== null) {
        noOfCavities = this.shareService.checkDirtyProperty('noOfCavities', fieldColorsList) ? selectedMaterial?.noOfCavities : noOfCavities;
      }
      materialInfo.noOfCavities = noOfCavities;
    }

    if (materialInfo.isCavityArrangementLengthDirty && !!materialInfo.cavityArrangementLength) {
      materialInfo.cavityArrangementLength = Number(materialInfo.cavityArrangementLength);
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

    const sheetVolume = this.shareService.isValidNumber(Number(materialInfo.sheetThickness) * Number(materialInfo?.sheetWidth) * Number(materialInfo?.sheetLength));
    const sheetWeight = (Number(sheetVolume) * Number(materialInfo?.density)) / 1000;
    materialInfo.grossWeight = sheetWeight;

    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight !== null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = this.shareService.isValidNumber(Number(sheetWeight) / Number(materialInfo.noOfCavities) - Number(materialInfo?.netWeight));
      // let scrapWeight = this.shareService.isValidNumber(Number(sheetWeight) - Number(materialInfo?.netWeight));

      if (materialInfo.scrapWeight !== null) {
        scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }
    if (materialInfo.isutilisationDirty && materialInfo.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = this.shareService.isValidNumber(((Number(materialInfo.dimY) * Number(materialInfo.dimX)) / (Number(materialInfo.sheetLength) * Number(materialInfo.sheetWidth))) * 100);
      if (materialInfo.utilisation !== null) {
        utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    const sheetMaterialCost = this.shareService.isValidNumber(Number(sheetWeight / 1000) * Number(materialInfo.materialPricePerKg));
    const grossMaterialCost = this.shareService.isValidNumber(Number(sheetMaterialCost) / Number(materialInfo.noOfCavities));
    materialInfo.materialCostPart = grossMaterialCost;

    // const regrindPerPart = this.shareService.isValidNumber(Number(sheetWeight) / Number(materialInfo.noOfCavities) - Number(materialInfo.netWeight));
    // const scrapRecCost = this.shareService.isValidNumber(regrindPerPart * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg));

    const scrapRecCost = this.shareService.isValidNumber((materialInfo.scrapWeight / 1000) * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg));

    materialInfo.scrapRecCost = scrapRecCost;
    const netMaterialCost = grossMaterialCost - scrapRecCost;
    materialInfo.netMatCost = netMaterialCost;

    return materialInfo;
  }

  public calculationsForVacuumForming(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto) {
    if (materialInfo.isAvgWallthickDirty && materialInfo.wallAverageThickness !== null) {
      materialInfo.wallAverageThickness = Number(materialInfo.wallAverageThickness);
    } else {
      let wallAverageThickness = this.shareService.extractedMaterialData?.DimUnfoldedZ || this.shareService.extractedMaterialData?.WallAverageThickness || 0;
      if (materialInfo.wallAverageThickness !== null) {
        wallAverageThickness = this.shareService.checkDirtyProperty('wallAverageThickness', fieldColorsList) ? selectedMaterial?.wallAverageThickness : wallAverageThickness;
      }
      materialInfo.wallAverageThickness = wallAverageThickness;
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

    if (materialInfo.isSheetLengthDirty && materialInfo.sheetLength !== null) {
      materialInfo.sheetLength = Number(materialInfo.sheetLength);
    } else {
      const sorted = this.plasticRubberConfigService.thermoStdSheetLengthList.map((item) => item.length).sort((a, b) => a - b);
      const nearest = sorted.find((length) => length >= materialInfo.dimX);
      let sheetLength = this.shareService.isValidNumber(nearest);
      if (materialInfo.sheetLength !== null) {
        sheetLength = this.shareService.checkDirtyProperty('sheetLength', fieldColorsList) ? selectedMaterial?.sheetLength : sheetLength;
      }
      materialInfo.sheetLength = sheetLength;
    }

    if (materialInfo.isSheetWidthDirty && materialInfo.sheetWidth !== null) {
      materialInfo.sheetWidth = Number(materialInfo.sheetWidth);
    } else {
      const sorted = this.plasticRubberConfigService.thermoStdSheetWidthList.map((item) => item.width).sort((a, b) => a - b);
      const nearest = sorted.find((length) => length >= materialInfo.dimY);
      let sheetWidth = this.shareService.isValidNumber(nearest);
      if (materialInfo.sheetWidth !== null) {
        sheetWidth = this.shareService.checkDirtyProperty('sheetWidth', fieldColorsList) ? selectedMaterial?.sheetWidth : sheetWidth;
      }
      materialInfo.sheetWidth = sheetWidth;
    }

    if (materialInfo.isSheetThicknessDirty && materialInfo.sheetThickness !== null) {
      materialInfo.sheetThickness = Number(materialInfo.sheetThickness);
    } else {
      let sheetThickness = this.shareService.isValidNumber(Math.ceil(Number(materialInfo.wallAverageThickness)));
      if (materialInfo.sheetThickness !== null) {
        sheetThickness = this.shareService.checkDirtyProperty('sheetThickness', fieldColorsList) ? selectedMaterial?.sheetThickness : sheetThickness;
      }
      materialInfo.sheetThickness = sheetThickness;
    }

    const partsPerRowRatio = this.shareService.isValidNumber(Number(materialInfo?.sheetLength) / materialInfo?.dimX);
    const noOfPartsPerRow = Math.floor(partsPerRowRatio);

    const partsPerColumnRatio = this.shareService.isValidNumber(Number(materialInfo?.sheetWidth) / materialInfo?.dimY);
    const noOfPartsPerColumn = Math.floor(partsPerColumnRatio);

    if (materialInfo.isNoOfCavitiesDirty && !!materialInfo.noOfCavities) {
      materialInfo.noOfCavities = Number(materialInfo.noOfCavities);
    } else {
      let noOfCavities = Number(noOfPartsPerRow) * Number(noOfPartsPerColumn);
      if (materialInfo.noOfCavities !== null) {
        noOfCavities = this.shareService.checkDirtyProperty('noOfCavities', fieldColorsList) ? selectedMaterial?.noOfCavities : noOfCavities;
      }
      materialInfo.noOfCavities = noOfCavities;
    }

    if (materialInfo.isCavityArrangementLengthDirty && !!materialInfo.cavityArrangementLength) {
      materialInfo.cavityArrangementLength = Number(materialInfo.cavityArrangementLength);
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

    if (materialInfo.isutilisationDirty && materialInfo.utilisation !== null) {
      materialInfo.utilisation = Number(materialInfo.utilisation);
    } else {
      let utilisation = this.shareService.isValidNumber(((Number(materialInfo.dimY) * Number(materialInfo.dimX)) / (Number(materialInfo.sheetLength) * Number(materialInfo.sheetWidth))) * 100);
      if (materialInfo.utilisation !== null) {
        utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? selectedMaterial?.utilisation : utilisation;
      }
      materialInfo.utilisation = utilisation;
    }

    materialInfo.grossWeight = materialInfo.netWeight / (materialInfo.utilisation / 100);

    if (materialInfo.isScrapWeightDirty && materialInfo.scrapWeight !== null) {
      materialInfo.scrapWeight = Number(materialInfo.scrapWeight);
    } else {
      let scrapWeight = this.shareService.isValidNumber(Number(materialInfo?.grossWeight) - Number(materialInfo.netWeight));

      if (materialInfo.scrapWeight !== null) {
        scrapWeight = this.shareService.checkDirtyProperty('scrapWeight', fieldColorsList) ? selectedMaterial?.scrapWeight : scrapWeight;
      }
      materialInfo.scrapWeight = scrapWeight;
    }

    const sheetMaterialCost = this.shareService.isValidNumber(Number(materialInfo.grossWeight / 1000) * Number(materialInfo.materialPricePerKg));
    const grossMaterialCost = sheetMaterialCost; // this.shareService.isValidNumber(Number(sheetMaterialCost) / Number(materialInfo.noOfCavities));
    materialInfo.materialCostPart = grossMaterialCost;

    const scrapRecCost = this.shareService.isValidNumber((materialInfo.scrapWeight / 1000) * Number(materialInfo.scrapRecovery / 100) * Number(materialInfo.scrapPricePerKg));

    materialInfo.scrapRecCost = scrapRecCost;
    const netMaterialCost = grossMaterialCost - scrapRecCost;
    materialInfo.netMatCost = netMaterialCost;

    return materialInfo;
  }

  public calculationsForWireCuttingTermination(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
    materialInfo.materialCostPart = this.isValidNumber(Number((Number(materialInfo.netWeight) * Number(materialInfo.materialPricePerKg)) / 1000));

    if (materialInfo.isCoilLengthDirty && materialInfo.coilLength != null) {
      materialInfo.coilLength = Number(materialInfo.coilLength);
    } else {
      let coilLength = this.getLookUpValue(StampingMaterialLookUpCatEnum.WireCuttingTerminationCoilLength, materialInfo?.sheetThickness); //600 * 10000;
      if (materialInfo?.coilLength != null) {
        coilLength = this.checkDirtyProperty('coilLength', fieldColorsList) ? selectedMaterialInfo?.coilLength : coilLength;
      }
      materialInfo.coilLength = coilLength;
    }

    if (materialInfo.isUnfoldedLength && materialInfo.dimUnfoldedX != null) {
      materialInfo.dimUnfoldedX = Number(materialInfo.dimUnfoldedX);
    } else {
      let dimUnfoldedX = this.shareService.isValidNumber(this.shareService.isValidNumber(materialInfo.partVolume) / this.shareService.isValidNumber(materialInfo.partProjectedArea));
      if (materialInfo?.dimUnfoldedX != null) {
        dimUnfoldedX = this.checkDirtyProperty('unfoldedLength', fieldColorsList) ? selectedMaterialInfo?.dimUnfoldedX : dimUnfoldedX;
      }
      materialInfo.dimUnfoldedX = dimUnfoldedX;
    }

    if (materialInfo.isPitchForWireCutting && materialInfo.pitchForWireCutting != null) {
      materialInfo.pitchForWireCutting = Number(materialInfo.pitchForWireCutting);
    } else {
      let pitchForWireCutting = materialInfo.dimUnfoldedX * 1.15;
      if (materialInfo?.pitchForWireCutting != null) {
        pitchForWireCutting = this.checkDirtyProperty('pitchForWireCutting', fieldColorsList) ? selectedMaterialInfo?.pitchForWireCutting : pitchForWireCutting;
      }
      materialInfo.pitchForWireCutting = pitchForWireCutting;
    }

    if (materialInfo?.isGrossWeightCoilDirty && materialInfo?.grossWeight != null) {
      materialInfo.grossWeight = Number(materialInfo?.grossWeight);
    } else {
      let grossWeight = this.isValidNumber(Number(materialInfo.pitchForWireCutting * materialInfo.partProjectedArea) * Number(materialInfo.density / 1000));
      if (materialInfo?.grossWeight != null) {
        grossWeight = this.checkDirtyProperty('grossWeight', fieldColorsList) ? selectedMaterialInfo?.grossWeight : Number(grossWeight);
      }
      materialInfo.grossWeight = grossWeight;
    }

    if (materialInfo.isPartsPerCoilDirty && materialInfo?.partsPerCoil != null) {
      materialInfo.partsPerCoil = Number(materialInfo?.partsPerCoil);
    } else {
      let partsPerCoil = Math.trunc(this.isValidNumber(materialInfo.coilLength / materialInfo.pitchForWireCutting));
      if (materialInfo?.partsPerCoil != null) {
        partsPerCoil = this.checkDirtyProperty('partsPerCoil', fieldColorsList) ? selectedMaterialInfo?.partsPerCoil : Math.trunc(partsPerCoil);
      }
      materialInfo.partsPerCoil = partsPerCoil;
    }

    if (materialInfo.isScrapRecoveryDirty && materialInfo.scrapRecCost != null) {
      materialInfo.scrapRecCost = Number(materialInfo.scrapRecCost);
    } else {
      const scrapCost = this.isValidNumber(((this.isValidNumber(materialInfo.grossWeight) - this.isValidNumber(materialInfo.netWeight)) * this.isValidNumber(materialInfo.scrapPricePerKg)) / 1000);
      materialInfo.scrapRecCost = this.checkDirtyProperty('scrapRecCost', fieldColorsList) ? selectedMaterialInfo?.scrapPricePerKg : scrapCost;
    }
    materialInfo.netMatCost = this.isValidNumber(materialInfo.materialCostPart) + this.isValidNumber(materialInfo.scrapRecCost);
    return materialInfo;
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

  private getLookUpValue(categoryId: number, value: number): number {
    const expectedValue = this._stampingMetrialLookUpData.filter(
      (x) => x.categoryId === categoryId && x.min < this.shareService.isValidNumber(value) && x.max >= this.shareService.isValidNumber(value)
    );
    if (expectedValue && expectedValue?.length > 0) {
      return expectedValue[0]?.expectedValue;
    }
    return null;
  }
}
