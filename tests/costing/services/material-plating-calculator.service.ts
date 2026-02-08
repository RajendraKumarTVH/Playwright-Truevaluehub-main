import { Injectable, OnDestroy } from '@angular/core';
import { CountryPlatingMasterDto, MaterialInfoDto } from 'src/app/shared/models';
import { Observable, Subject } from 'rxjs';
import { SharedService } from './shared.service';
import { MaterialConfigService } from 'src/app/shared/config/cost-material-config';
import { PrimaryProcessType } from '../costing.config';

@Injectable({
  providedIn: 'root',
})
export class MaterialPlatingCalculatorService implements OnDestroy {
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();

  countryPlatingData: CountryPlatingMasterDto[] = [];

  constructor(
    private shareService: SharedService,
    private materialConfigService: MaterialConfigService
  ) {
    // this._countryPlatingData$
    //   .pipe(takeUntil(this.unsubscribeAll$))
    //   .subscribe((response) => {
    //     if (response && response.length > 0) {
    //       this.countryPlatingData = response;
    //     }
    //   });
  }

  public calculationsForPlating(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): Observable<MaterialInfoDto> {
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

    if (materialInfo.ispaintCoatingTicknessDirty && !!materialInfo.paintCoatingTickness) {
      materialInfo.paintCoatingTickness = Number(materialInfo.paintCoatingTickness);
    } else {
      let paintCoatingTickness = 0;
      if (pType === PrimaryProcessType.PowderCoating || pType === PrimaryProcessType.Painting) {
        paintCoatingTickness = 63.5;
      }
      if (materialInfo.paintCoatingTickness) {
        paintCoatingTickness = this.shareService.checkDirtyProperty('paintCoatingTickness', fieldColorsList) ? selectedMaterial?.paintCoatingTickness : paintCoatingTickness;
      }
      materialInfo.paintCoatingTickness = paintCoatingTickness;
    }

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

    let totalPlatingVolume = this.shareService.isValidNumber(Number(materialInfo.partSurfaceArea) * Number(materialInfo.paintCoatingTickness / 1000)); // divided by 1000 to change micron to mm
    if (pType === PrimaryProcessType.PowderCoating || pType === PrimaryProcessType.Painting) {
      totalPlatingVolume = this.shareService.isValidNumber(Number(materialInfo.partSurfaceArea) * Number((materialInfo.paintCoatingTickness * (1 - materialInfo.percentageOfReduction / 100)) / 1000)); // divided by 1000 to change micron to mm
    }

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
    return new Observable((obs) => {
      obs.next(materialInfo);
    });
  }

  public calculationsForCoating(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): Observable<MaterialInfoDto> {
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
    return new Observable((obs) => {
      obs.next(materialInfo);
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll$.next(undefined);
    this.unsubscribeAll$.complete();
  }
}
