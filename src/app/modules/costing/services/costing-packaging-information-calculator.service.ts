import { Injectable } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MaterialPriceDto } from '../../../shared/models/packaging-info.model';
import { MaxWeight, PackagingInfoService, ProtectivePkgTypes, ShrinkWrapCost } from '../../../../app/shared/services/packaging-info.service';
import { MaterialTypeEnum, PackagingInfoDto } from '../../../../app/shared/models/packaging-info.model';
import { PartInfoDto } from '../../../shared/models';
import { NumberConversionService } from '../../../services/number-conversion-service/number-conversion-service';
import { AppConfigurationService, ProjectInfoService } from '../../../../app/shared/services';
import { GetMaterialPriceByCountryModel } from '../../../shared/models/simulation/packaging-simulation.model';
import { FormGroup } from '@angular/forms';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root',
})
export class CostingPackagingInformationCalculatorService {
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  matarialDescription: string;
  constructor(
    private _numberConversionService: NumberConversionService,
    private PackgSvc: PackagingInfoService,
    private ProjectInfoService: ProjectInfoService,
    private configservice: AppConfigurationService,
    private sharedService: SharedService
  ) {}

  // corrugatedBoxList: MaterialPriceDto[] = [];
  // palletList: MaterialPriceDto[] = [];

  // protectList: MaterialPriceDto[] = [];
  // packagingInfoDto?: PackagingInfoDto;
  totalBoxVol: number = 0;
  currentPart: PartInfoDto;
  private roundDnNum = (num: number): number => Math.round(num);

  public totalpkgCostPerShipment(
    totalBoxCostPerShipment: number,
    totalPalletCostPerShipment: number,
    totalShrinkWrapCost: number,
    costPerUnit: number,
    units: number,
    splBoxType: number,
    adnlProtectPkgCost: () => number
  ) {
    const splBoxTypeCost = (Number(splBoxType) != 0 && Number(costPerUnit) * Number(units)) || 0;
    const totalPkgCostPerShipment = Number(totalBoxCostPerShipment) + Number(totalPalletCostPerShipment) + Number(totalShrinkWrapCost) + splBoxTypeCost + adnlProtectPkgCost();
    return totalPkgCostPerShipment;
  }

  public totalpackageCostPerShipment(
    totalBoxCostPerShipment: number,
    totalPalletCostPerShipment: number,
    totalShrinkWrapCost: number,
    costPerUnit: number,
    units: number,
    splBoxType: number,
    adnlProtectPkgCost: number
  ) {
    // const splBoxTypeCost = (Number(splBoxType) != 0 && Number(costPerUnit) * Number(units)) || 0;
    const totalPkgCostPerShipment = Number(totalBoxCostPerShipment) + Number(totalPalletCostPerShipment) + Number(totalShrinkWrapCost) + adnlProtectPkgCost;
    return totalPkgCostPerShipment;
  }

  public clcPkgCostPerUnit(totalPackagCostPerShipment: number, partsPerShipment: number) {
    const costPerProtectivePackagingUnit = this.sharedService.isValidNumber(Number(partsPerShipment) && Number(totalPackagCostPerShipment) / Number(partsPerShipment)) || 0;
    return costPerProtectivePackagingUnit;
  }

  public calcTotalShrinkWrapCost(shrinkWrap: boolean, shrinkWrapCostPerUnit: number, palletPerShipment: number) {
    let totalShrinkWrapCost: number = 0;
    if (shrinkWrap) {
      totalShrinkWrapCost = Number(shrinkWrapCostPerUnit) * Number(palletPerShipment);
    }
    return Number(totalShrinkWrapCost.toFixed(4));
  }

  public calcShipmentDensity(weightPerShipment: number, volumePerShipment: number) {
    let density = 0;
    if (Number(volumePerShipment)) {
      density = (Number(weightPerShipment) || 0) / Number(volumePerShipment);
    }
    return density;
  }

  public adnlProtCost(costPerProtectivePackagingUnit: number, totalNumberOfProtectivePackaging: number) {
    return Number(costPerProtectivePackagingUnit) * Number(totalNumberOfProtectivePackaging);
  }

  public partPerShipmentonMaterial(shipmentDensity: number, maxDensity: number, maxWeight: any, volume: any, weightPerShipment: number, volumePerShipment: number) {
    let perShipment = 0;
    if (shipmentDensity > maxDensity) {
      perShipment = maxWeight && this._numberConversionService.roundUp((Number(weightPerShipment) || 0) / maxWeight);
    } else {
      perShipment = volume && this._numberConversionService.roundUp((Number(volumePerShipment) || 0) / volume);
    }
    return perShipment;
  }

  public weightPerShipment(partsPerShipment: number, netWeight: number) {
    const weightPerShipment = this._numberConversionService.transformNumberRemoveDecimals((partsPerShipment * (netWeight || 0)) / 1000 || 0);
    return weightPerShipment;
  }

  public volumePerShipment(partsPerShipment: number, dimX: number, dimY: number, dimZ: number) {
    const volumePerShipment = this._numberConversionService.transformNumberRemoveDecimals((partsPerShipment * dimX * dimY * dimZ) / 1000 || 0);
    return volumePerShipment;
  }

  public partsPerShipmentSubscribeState(eav: number, deliveryFrequency: number) {
    const partsPerShipment = this.roundDnNum(eav * (deliveryFrequency / 365));
    return partsPerShipment;
  }

  public totalPalletCostPerShipment(palletPerShipment: number, palletCostPerUnit: number) {
    const totalPalletCostPerShipmentLocal = palletPerShipment * palletCostPerUnit;
    return totalPalletCostPerShipmentLocal;
  }

  public totalBoxCostPerShipment(boxPerShipment: number, corrugatedBoxCostPerUnit: number): number {
    const totalBoxCostPerShipmentLocal = boxPerShipment * corrugatedBoxCostPerUnit;
    return Number(totalBoxCostPerShipmentLocal.toFixed(4));
  }

  public totalESGImpactPerPart(palletPerShipment: number, boxPerShipment: number, partsPerShipment: number, eSGImpactperPallet: number, eSGImpactperBox: number) {
    let totalESGImpactperPart = 0;
    totalESGImpactperPart = (Number(eSGImpactperBox) * Number(boxPerShipment) + Number(eSGImpactperPallet) * Number(palletPerShipment)) / Number(partsPerShipment);
    return totalESGImpactperPart;
  }

  private getQuarter(month: number): string {
    if (month <= 3) {
      return 'Q1';
    } else if (month > 3 && month <= 6) {
      return 'Q2';
    } else if (month > 6 && month <= 9) {
      return 'Q3';
    } else {
      return 'Q4';
    }
  }

  packagingGetMaterialPriceByCountryId(countryId: number, marketMonth: string) {
    const returnData = new GetMaterialPriceByCountryModel();
    if (countryId && marketMonth) {
      this.PackgSvc.getAllMaterialPrice(countryId, marketMonth)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res: MaterialPriceDto[]) => {
          if (res?.length) {
            returnData.corrugatedBoxList = res.filter((x) => x.materialTypeName.toLowerCase().includes('carton')).sort((a, b) => a.price - b.price);

            returnData.palletList = res.filter((x) => x.materialTypeName.toLowerCase().includes('pallet')).sort((a, b) => a.price - b.price);

            const protectivePkgType = [...ProtectivePkgTypes].map((x) => x.toLowerCase());

            returnData.protectList = res.filter((item) => protectivePkgType.includes(item.materialDescription.toLowerCase())).sort((a, b) => a.price - b.price);

            return returnData;
            // const _dto = this.packagingInfoDto;
            // const boxType =
            //   _dto?.corrugatedBox ||
            //   (this.corrugatedBoxList?.length &&
            //     this.corrugatedBoxList[0].materialMasterId);
            // this.f?.corrugatedBox?.setValue(boxType);
            // if (_dto.boxPerShipment == 0 || _dto.boxPerShipment == null || this.dataFromMaterialInfo == 1) {
            //   this.onMaterialMasterIdChange(boxType, MaterialTypeEnum.Box);
            // }
            // const palletType =
            //   _dto?.pallet ||
            //   (this.palletList?.length && this.palletList[0].materialMasterId);
            // this.f?.pallet?.setValue(palletType);
            // if (_dto.palletPerShipment == 0 || _dto.palletPerShipment == null || this.dataFromMaterialInfo == 1) {
            //   this.onMaterialMasterIdChange(palletType, MaterialTypeEnum.Pallet);
            //   this.dataFromMaterialInfo = 0;
            // }

            // const adnlPkgs = _dto.adnlProtectPkgs;
            // this.adnlPkgFormAry.clear();

            // if (adnlPkgs?.length) {
            //   adnlPkgs.forEach((item) => {
            //     this.adnlPkgFormAry.push(this.adnlProtPkgFormGroup(item));
            //   });
            // } else {
            //   this.adnlPkgFormAry.push(this.adnlProtPkgFormGroup());
            // }
          }
          return returnData;
        });
    }

    return returnData;
  }
  public findMaterialFromList(masterId: number, type: MaterialTypeEnum, countryId: number, marketMonth: string) {
    const returnData = new GetMaterialPriceByCountryModel();
    if (countryId && marketMonth) {
      this.PackgSvc.getAllMaterialPrice(countryId, marketMonth)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res: MaterialPriceDto[]) => {
          if (res?.length) {
            returnData.corrugatedBoxList = res.filter((x) => x.materialTypeName.toLowerCase().includes('carton')).sort((a, b) => a.price - b.price);

            returnData.palletList = res.filter((x) => x.materialTypeName.toLowerCase().includes('pallet')).sort((a, b) => a.price - b.price);

            const protectivePkgType = [...ProtectivePkgTypes].map((x) => x.toLowerCase());

            returnData.protectList = res.filter((item) => protectivePkgType.includes(item.materialDescription.toLowerCase())).sort((a, b) => a.price - b.price);
          }
          if (type == MaterialTypeEnum.Box) {
            this.matarialDescription = returnData?.corrugatedBoxList?.find((x) => x.materialMasterId == masterId)?.materialDescription;
            return this.matarialDescription;
          } else if (type == MaterialTypeEnum.Pallet) {
            this.matarialDescription = returnData?.palletList?.find((x) => x.materialMasterId == masterId)?.materialDescription;
            return this.matarialDescription;
          } else {
            this.matarialDescription = returnData?.protectList?.find((x) => x.materialMasterId == masterId)?.materialDescription;
            return this.matarialDescription;
          }
        });
      return this.matarialDescription;
    }

    return this.matarialDescription;
  }

  public calculationsForPackaging(packagingInfo: PackagingInfoDto, fieldColorsList: any, packagedbObj: PackagingInfoDto, recalculationcall: boolean = false): PackagingInfoDto {
    if (packagingInfo.partsPerShipmentDirty && packagingInfo.partsPerShipment != null) {
      packagingInfo.partsPerShipment = Number(packagingInfo.partsPerShipment);
    } else {
      let partsPerShipment = 0;
      if (packagingInfo.deliveryFrequency && packagingInfo.eav) {
        partsPerShipment = this.partsPerShipmentSubscribeState(packagingInfo.eav, packagingInfo.deliveryFrequency);
      }
      if (packagingInfo.partsPerShipment != null) {
        partsPerShipment = this.sharedService.checkDirtyProperty('partsPerShipment', fieldColorsList) ? packagedbObj?.partsPerShipment : partsPerShipment;
      }
      packagingInfo.partsPerShipment = partsPerShipment;
    }

    if (packagingInfo.weightPerShipmentDirty && packagingInfo.weightPerShipment != null) {
      packagingInfo.weightPerShipment = Number(packagingInfo.weightPerShipment);
    } else {
      let weightPerShipment = 0;
      if (packagingInfo.materialInfo) {
        const { netWeight } = packagingInfo.materialInfo;
        weightPerShipment = this.weightPerShipment(packagingInfo.partsPerShipment, netWeight);
      }
      if (packagingInfo.weightPerShipment != null) {
        weightPerShipment = this.sharedService.checkDirtyProperty('weightPerShipment', fieldColorsList) ? packagedbObj?.weightPerShipment : weightPerShipment;
      }
      packagingInfo.weightPerShipment = weightPerShipment;
    }

    if (packagingInfo.volumePerShipmentDirty && packagingInfo.volumePerShipment != null) {
      packagingInfo.volumePerShipment = Number(packagingInfo.volumePerShipment);
    } else {
      let volumePerShipment = 0;
      if (packagingInfo.materialInfo) {
        const { dimX, dimY, dimZ } = packagingInfo.materialInfo;
        volumePerShipment = this.volumePerShipment(packagingInfo.partsPerShipment, dimX, dimY, dimZ);
      }
      if (packagingInfo.volumePerShipment != null) {
        volumePerShipment = this.sharedService.checkDirtyProperty('volumePerShipment', fieldColorsList) ? packagedbObj?.volumePerShipment : volumePerShipment;
      }
      packagingInfo.volumePerShipment = volumePerShipment;
    }

    if (packagingInfo.boxPerShipmentDirty && packagingInfo.boxPerShipment != null) {
      packagingInfo.boxPerShipment = Number(packagingInfo.boxPerShipment);
    } else {
      let boxPerShipment = this.sharedService.isValidNumber(this.onMaterialMasterIdChange(packagingInfo.corrugatedBox, MaterialTypeEnum.Box, packagingInfo));
      if (packagingInfo.boxPerShipment != null) {
        boxPerShipment = this.sharedService.checkDirtyProperty('boxPerShipment', fieldColorsList) ? packagedbObj?.boxPerShipment : boxPerShipment;
      }
      packagingInfo.boxPerShipment = boxPerShipment;
    }

    if (packagingInfo.palletPerShipmentDirty && packagingInfo.palletPerShipment != null) {
      packagingInfo.palletPerShipment = Number(packagingInfo.palletPerShipment);
    } else {
      let palletPerShipment = this.sharedService.isValidNumber(this.onMaterialMasterIdChange(packagingInfo.pallet, MaterialTypeEnum.Pallet, packagingInfo));
      if (packagingInfo.palletPerShipment != null) {
        palletPerShipment = this.sharedService.checkDirtyProperty('palletPerShipment', fieldColorsList) ? packagedbObj?.palletPerShipment : palletPerShipment;
      }
      packagingInfo.palletPerShipment = palletPerShipment;
    }

    if (packagingInfo.corrugatedBoxCostPerUnitDirty && packagingInfo.corrugatedBoxCostPerUnit != null) {
      packagingInfo.corrugatedBoxCostPerUnit = Number(packagingInfo.corrugatedBoxCostPerUnit);
    } else {
      const costPerProtectivePackagingUnit = packagingInfo?.corrugatedBoxList?.find((x) => x.materialMasterId == packagingInfo.corrugatedBox)?.price || 0;
      let corrugatedBoxCostPerUnit = this.sharedService.isValidNumber(costPerProtectivePackagingUnit);
      if (packagingInfo.corrugatedBoxCostPerUnit != null) {
        corrugatedBoxCostPerUnit = this.sharedService.checkDirtyProperty('corrugatedBoxCostPerUnit', fieldColorsList) ? packagedbObj?.corrugatedBoxCostPerUnit : corrugatedBoxCostPerUnit;
      }
      packagingInfo.corrugatedBoxCostPerUnit = corrugatedBoxCostPerUnit;
    }
    if (packagingInfo.totalBoxCostPerShipmentDirty && packagingInfo.totalBoxCostPerShipment != null) {
      packagingInfo.totalBoxCostPerShipment = Number(packagingInfo.totalBoxCostPerShipment);
    } else {
      let totalBoxCostPerShipment = packagingInfo.corrugatedBoxCostPerUnit * packagingInfo.boxPerShipment;
      if (packagingInfo.totalBoxCostPerShipment != null) {
        totalBoxCostPerShipment = this.sharedService.checkDirtyProperty('totalBoxCostPerShipment', fieldColorsList) ? packagedbObj?.totalBoxCostPerShipment : totalBoxCostPerShipment;
      }
      packagingInfo.totalBoxCostPerShipment = totalBoxCostPerShipment;
    }

    if (packagingInfo.palletCostPerUnitDirty && packagingInfo.palletCostPerUnit != null) {
      packagingInfo.palletCostPerUnit = Number(packagingInfo.palletCostPerUnit);
    } else {
      const costPerProtectivePackagingUnit = packagingInfo?.palletList?.find((x) => x.materialMasterId == packagingInfo.pallet)?.price || 0;
      let palletCostPerUnit = this.sharedService.isValidNumber(costPerProtectivePackagingUnit);
      if (packagingInfo.palletCostPerUnit != null) {
        palletCostPerUnit = this.sharedService.checkDirtyProperty('palletCostPerUnit', fieldColorsList) ? packagedbObj?.palletCostPerUnit : palletCostPerUnit;
      }
      packagingInfo.palletCostPerUnit = palletCostPerUnit;
    }

    if (packagingInfo.totalPalletCostPerShipmentDirty && packagingInfo.totalPalletCostPerShipment != null) {
      packagingInfo.totalPalletCostPerShipment = Number(packagingInfo.totalPalletCostPerShipment);
    } else {
      let totalPalletCostPerShipment = packagingInfo.palletCostPerUnit * packagingInfo.palletPerShipment;
      if (packagingInfo.totalPalletCostPerShipment != null) {
        totalPalletCostPerShipment = this.sharedService.checkDirtyProperty('totalPalletCostPerShipment', fieldColorsList) ? packagedbObj?.totalPalletCostPerShipment : totalPalletCostPerShipment;
      }
      packagingInfo.totalPalletCostPerShipment = totalPalletCostPerShipment;
    }

    if (packagingInfo.shrinkWrap) {
      if (packagingInfo.shrinkWrapCostPerUnitDirty && packagingInfo.shrinkWrapCostPerUnit != null) {
        packagingInfo.shrinkWrapCostPerUnit = Number(packagingInfo.shrinkWrapCostPerUnit);
      } else {
        let shrinkWrapCostPerUnit = this.sharedService.isValidNumber(ShrinkWrapCost);
        if (packagingInfo.shrinkWrapCostPerUnit != null) {
          shrinkWrapCostPerUnit = this.sharedService.checkDirtyProperty('shrinkWrapCostPerUnit', fieldColorsList) ? packagedbObj?.shrinkWrapCostPerUnit : shrinkWrapCostPerUnit;
        }
        packagingInfo.shrinkWrapCostPerUnit = shrinkWrapCostPerUnit;
      }
    } else {
      packagingInfo.shrinkWrapCostPerUnit = 0;
    }
    if (packagingInfo.totalShrinkWrapCostDirty && packagingInfo.totalShrinkWrapCost != null) {
      packagingInfo.totalShrinkWrapCost = Number(packagingInfo.totalShrinkWrapCost);
    } else {
      const cost = this.calcTotalShrinkWrapCost(packagingInfo.shrinkWrap, packagingInfo.shrinkWrapCostPerUnit, packagingInfo.palletPerShipment);
      let totalShrinkWrapCost = this.sharedService.isValidNumber(cost);
      if (packagingInfo.totalShrinkWrapCost != null) {
        totalShrinkWrapCost = this.sharedService.checkDirtyProperty('totalShrinkWrapCost', fieldColorsList) ? packagedbObj?.totalShrinkWrapCost : totalShrinkWrapCost;
      }
      packagingInfo.totalShrinkWrapCost = totalShrinkWrapCost;
    }

    // if (packagingInfo.esgImpactperBoxDirty && packagingInfo.esgImpactperBox != null) {
    //   packagingInfo.esgImpactperBox = Number(packagingInfo.esgImpactperBox);
    // } else {
    //   let esgImpactperBox = this.sharedService.isValidNumber(packagingInfo?.corrugatedBoxList?.find((x) => x.materialMasterId == packagingInfo.corrugatedBox)?.esgImpactCO2Kg || 0);
    //   if (packagingInfo.esgImpactperBox != null) {
    //     esgImpactperBox = this.sharedService.checkDirtyProperty('esgImpactperBox', fieldColorsList) ? packagedbObj?.esgImpactperBox : esgImpactperBox;
    //   }
    //   packagingInfo.esgImpactperBox = esgImpactperBox;
    // }

    // if (packagingInfo.esgImpactperPalletDirty && packagingInfo.esgImpactperPallet != null) {
    //   packagingInfo.esgImpactperPallet = Number(packagingInfo.esgImpactperPallet);
    // } else {
    //   let esgImpactperPallet = this.sharedService.isValidNumber(packagingInfo?.palletList?.find((x) => x.materialMasterId == packagingInfo.pallet)?.esgImpactCO2Kg || 0);
    //   if (packagingInfo.esgImpactperPallet != null) {
    //     esgImpactperPallet = this.sharedService.checkDirtyProperty('esgImpactperPallet', fieldColorsList) ? packagedbObj?.esgImpactperPallet : esgImpactperPallet;
    //   }
    //   packagingInfo.esgImpactperPallet = esgImpactperPallet;
    // }

    // if (packagingInfo.totalESGImpactperPartDirty && packagingInfo.totalESGImpactperPart != null) {
    //   packagingInfo.totalESGImpactperPart = Number(packagingInfo.totalESGImpactperPart);
    // } else {
    //   let totalESGImpactperPart = this.sharedService.isValidNumber(((Number(packagingInfo.esgImpactperBox) * Number(packagingInfo.boxPerShipment)) + (Number(packagingInfo.esgImpactperPallet) * Number(packagingInfo.palletPerShipment))) / Number(packagingInfo.partsPerShipment));
    //   if (packagingInfo.totalESGImpactperPart != null) {
    //     totalESGImpactperPart = this.sharedService.checkDirtyProperty('totalESGImpactperPart', fieldColorsList) ? packagedbObj?.totalESGImpactperPart : totalESGImpactperPart;
    //   }
    //   packagingInfo.totalESGImpactperPart = totalESGImpactperPart;
    // }

    // if (packagingInfo.totalPackagCostPerShipmentDirty && packagingInfo.totalPackagCostPerShipment != null) {
    //   packagingInfo.totalPackagCostPerShipment = Number(packagingInfo.totalPackagCostPerShipment);
    // } else {
    //   packagingInfo.totalPackagCostPerShipment = this.sharedService.checkDirtyProperty('totalPackagCostPerShipment', fieldColorsList) ? packagedbObj?.totalPackagCostPerShipment : packagingInfo.totalPackagCostPerShipment;
    // }

    // if (packagingInfo.totalPackagCostPerUnitDirty && packagingInfo.totalPackagCostPerUnit != null) {
    //   packagingInfo.totalPackagCostPerUnit = Number(packagingInfo.totalPackagCostPerUnit);
    // } else {
    //   packagingInfo.totalPackagCostPerUnit = this.sharedService.checkDirtyProperty('totalPackagCostPerUnit', fieldColorsList) ? packagedbObj?.totalPackagCostPerUnit : packagingInfo.totalPackagCostPerUnit;
    // }

    let adnlProtCosts = 0;
    for (let i = 0; i < packagingInfo?.calcultionadnlProtectPkgs?.controls?.length; i++) {
      let costPerProtectivePackagingUnit = (packagingInfo.calcultionadnlProtectPkgs.controls as FormGroup[])[i].controls['costPerProtectivePackagingUnit'].value;
      if ((packagingInfo.calcultionadnlProtectPkgs.controls as FormGroup[])[i].controls['costPerProtectivePackagingUnit'].dirty && costPerProtectivePackagingUnit != null) {
        costPerProtectivePackagingUnit = (packagingInfo.calcultionadnlProtectPkgs.controls as FormGroup[])[i].controls['costPerProtectivePackagingUnit'].value;
      } else {
        if (recalculationcall) {
          const matid = (packagingInfo.calcultionadnlProtectPkgs.controls as FormGroup[])[i].controls['protectivePkg'].value;
          costPerProtectivePackagingUnit = packagingInfo?.protectList?.find((x) => x.materialMasterId == matid)?.price;
          costPerProtectivePackagingUnit = this.sharedService.isValidNumber(costPerProtectivePackagingUnit);
        } else {
          const adnlId = (packagingInfo.calcultionadnlProtectPkgs.controls as FormGroup[])[i].controls['adlnalid'].value || 0;
          const values = packagedbObj?.adnlProtectPkgs?.find((x) => x.adnlId == adnlId);
          if (values && costPerProtectivePackagingUnit != null) {
            costPerProtectivePackagingUnit = this.sharedService.isValidNumber(values.costPerProtectivePackagingUnit);
          } else {
            const matid = (packagingInfo.calcultionadnlProtectPkgs.controls as FormGroup[])[i].controls['protectivePkg'].value;
            costPerProtectivePackagingUnit = packagingInfo?.protectList?.find((x) => x.materialMasterId == matid)?.price;
            costPerProtectivePackagingUnit = this.sharedService.isValidNumber(costPerProtectivePackagingUnit);
          }
        }
      }
      (packagingInfo.calcultionadnlProtectPkgs.controls as FormGroup[])[i].patchValue({ costPerProtectivePackagingUnit: this.sharedService.isValidNumber(Number(costPerProtectivePackagingUnit)) });
      const totalNumberOfProtectivePackaging = (packagingInfo.calcultionadnlProtectPkgs.controls as FormGroup[])[i].controls['totalNumberOfProtectivePackaging'].value || 0;
      adnlProtCosts += this.adnlProtCost(Number(costPerProtectivePackagingUnit), Number(totalNumberOfProtectivePackaging));
    }
    if (packagingInfo.totalPackagCostPerShipmentDirty && packagingInfo.totalPackagCostPerShipment != null) {
      packagingInfo.totalPackagCostPerShipment = Number(packagingInfo.totalPackagCostPerShipment);
    } else {
      let totalPackagCostPerShipment = this.totalpackageCostPerShipment(
        packagingInfo.totalBoxCostPerShipment,
        packagingInfo.totalPalletCostPerShipment,
        packagingInfo.totalShrinkWrapCost,
        packagingInfo.costPerUnit,
        packagingInfo.units,
        packagingInfo.splBoxType,
        adnlProtCosts
      );
      if (packagingInfo.totalPackagCostPerShipment != null) {
        totalPackagCostPerShipment = this.sharedService.checkDirtyProperty('totalPackagCostPerShipment', fieldColorsList) ? packagedbObj?.totalPackagCostPerShipment : totalPackagCostPerShipment;
      }
      packagingInfo.totalPackagCostPerShipment = totalPackagCostPerShipment;
    }

    if (packagingInfo.totalPackagCostPerUnitDirty && packagingInfo.totalPackagCostPerUnit != null) {
      packagingInfo.totalPackagCostPerUnit = Number(packagingInfo.totalPackagCostPerUnit);
    } else {
      let totalPackagCostPerUnit = this.clcPkgCostPerUnit(packagingInfo.totalPackagCostPerShipment, packagingInfo.partsPerShipment);
      if (packagingInfo.totalPackagCostPerUnit != null) {
        totalPackagCostPerUnit = this.sharedService.checkDirtyProperty('totalPackagCostPerUnit', fieldColorsList) ? packagedbObj?.totalPackagCostPerUnit : totalPackagCostPerUnit;
      }
      packagingInfo.totalPackagCostPerUnit = totalPackagCostPerUnit;
    }
    // return new Observable((obs) => { obs.next(packagingInfo); });
    return packagingInfo;
  }

  private getLWH(description: string) {
    const matDescAry = description?.split('x');
    if (matDescAry && matDescAry?.length > 0) {
      return {
        length: +matDescAry[0]?.trim(),
        width: +matDescAry[1]?.trim(),
        height: +matDescAry[2]?.trim(),
      };
    }
    return {
      length: 0,
      width: 0,
      height: 0,
    };
  }

  onMaterialMasterIdChange(masterId: number, type: MaterialTypeEnum, packageInfo: PackagingInfoDto) {
    const material = this.getMaterialFromList(masterId, type, packageInfo);
    let result = 0;
    if (material) {
      const desc = material.materialDescription;
      const { length, width, height } = this.getLWH(desc);
      const volume = (length * width * height) / 1000;
      const maxWeight = MaxWeight?.find((x) => x.description == desc && x.type == type)?.maxWeight || 0;
      const maxDencity = maxWeight / (volume * 0.8);
      const shipmentDencity = this.calcShipmentDensity(packageInfo.weightPerShipment, packageInfo.volumePerShipment);
      if (type == MaterialTypeEnum.Box) {
        result = this.partPerShipmentonMaterial(shipmentDencity, maxDencity, maxWeight, volume, packageInfo.weightPerShipment, packageInfo.volumePerShipment);
        packageInfo.totalBoxVol = this.sharedService.isValidNumber(volume * result);
      } else {
        result = this.partPerShipmentonMaterial(shipmentDencity, maxDencity, maxWeight, volume, packageInfo.weightPerShipment, packageInfo.volumePerShipment);
      }
    }
    return result;
  }

  private getMaterialFromList(masterId: number, type: MaterialTypeEnum, packageInfo: PackagingInfoDto) {
    if (type == MaterialTypeEnum.Box) {
      return packageInfo?.corrugatedBoxList?.find((x) => x.materialMasterId == masterId);
    } else if (type == MaterialTypeEnum.Pallet) {
      return packageInfo?.palletList?.find((x) => x.materialMasterId == masterId);
    } else {
      return packageInfo?.protectList?.find((x) => x.materialMasterId == masterId);
    }
  }
}
