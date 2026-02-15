import { MaterialPriceDto } from '../models/packaging-info.model';
import { MaterialTypeEnum, PackagingInfoDto, AdditionalPackagingDto } from '../models/packaging-info.model';
import { SharedService } from './shared';
import { GetMaterialPriceByCountryModel } from '../models/simulation/packaging-simulation.model';

export class CostingPackagingInformationCalculatorService {
  materialDescription: string = '';

  constructor(
    private sharedService: SharedService
  ) { }

  private roundDnNum = (num: number): number => Math.round(num);

  private roundUp = (num: number): number => Math.ceil(num);

  private transformNumberRemoveDecimals(value: number) {
    if (value && !Number.isNaN(value) && value > 0) return Number(value.toFixed(0));
    else {
      return 0;
    }
  }

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
    const totalPkgCostPerShipment = Number(totalBoxCostPerShipment) + Number(totalPalletCostPerShipment) + Number(totalShrinkWrapCost) + adnlProtectPkgCost;
    return totalPkgCostPerShipment;
  }

  public clcPkgCostPerUnit(totalPackagCostPerShipment: number, partsPerShipment: number) {
    const costPerUnit = (Number(partsPerShipment) > 0) ? Number(totalPackagCostPerShipment) / Number(partsPerShipment) : 0;
    const costPerProtectivePackagingUnit = this.sharedService.isValidNumber(costPerUnit) || 0;
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
      perShipment = maxWeight && this.roundUp((Number(weightPerShipment) || 0) / maxWeight);
    } else {
      perShipment = volume && this.roundUp((Number(volumePerShipment) || 0) / volume);
    }
    return perShipment;
  }

  public weightPerShipment(partsPerShipment: number, netWeight: number) {
    const weightPerShipment = this.transformNumberRemoveDecimals((partsPerShipment * (netWeight || 0)) / 1000 || 0);
    return weightPerShipment;
  }

  public volumePerShipment(partsPerShipment: number, dimX: number, dimY: number, dimZ: number) {
    const volumePerShipment = this.transformNumberRemoveDecimals((partsPerShipment * dimX * dimY * dimZ) / 1000 || 0);
    return volumePerShipment;
  }

  public partsPerShipmentSubscribeState(eav: number, deliveryFrequency: number = 30) {
    if (!eav) return 0;
    return Math.ceil(eav / deliveryFrequency);
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
    if (Number(partsPerShipment) > 0) {
      totalESGImpactperPart = (Number(eSGImpactperBox) * Number(boxPerShipment) + Number(eSGImpactperPallet) * Number(palletPerShipment)) / Number(partsPerShipment);
    }
    return totalESGImpactperPart;
  }

  public findMaterialFromList(masterId: number, type: MaterialTypeEnum, packagingInfo: PackagingInfoDto) {
    let materialDescription = '';
    let list: MaterialPriceDto[] = [];

    if (type === MaterialTypeEnum.Box) {
      list = packagingInfo.corrugatedBoxList || [];
    } else if (type === MaterialTypeEnum.Pallet) {
      list = packagingInfo.palletList || [];
    } else {
      list = packagingInfo.protectList || [];
    }

    materialDescription = list.find((x: any) => x.materialMasterId === masterId)?.materialDescription || '';
    this.materialDescription = materialDescription;
    return materialDescription;
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
        partsPerShipment = this.sharedService.checkDirtyProperty('partsPerShipment', fieldColorsList) ? packagedbObj?.partsPerShipment || 0 : partsPerShipment;
      }
      packagingInfo.partsPerShipment = partsPerShipment;
    }

    if (packagingInfo.weightPerShipmentDirty && packagingInfo.weightPerShipment != null) {
      packagingInfo.weightPerShipment = Number(packagingInfo.weightPerShipment);
    } else {
      let weightPerShipment = 0;
      if (packagingInfo.materialInfo) {
        const { netWeight } = packagingInfo.materialInfo;
        weightPerShipment = this.weightPerShipment(packagingInfo.partsPerShipment || 0, netWeight);
      }
      if (packagingInfo.weightPerShipment != null) {
        weightPerShipment = this.sharedService.checkDirtyProperty('weightPerShipment', fieldColorsList) ? packagedbObj?.weightPerShipment || 0 : weightPerShipment;
      }
      packagingInfo.weightPerShipment = weightPerShipment;
    }

    if (packagingInfo.volumePerShipmentDirty && packagingInfo.volumePerShipment != null) {
      packagingInfo.volumePerShipment = Number(packagingInfo.volumePerShipment);
    } else {
      let volumePerShipment = 0;
      if (packagingInfo.materialInfo) {
        const { dimX, dimY, dimZ } = packagingInfo.materialInfo;
        volumePerShipment = this.volumePerShipment(packagingInfo.partsPerShipment || 0, dimX, dimY, dimZ);
      }
      if (packagingInfo.volumePerShipment != null) {
        volumePerShipment = this.sharedService.checkDirtyProperty('volumePerShipment', fieldColorsList) ? packagedbObj?.volumePerShipment || 0 : volumePerShipment;
      }
      packagingInfo.volumePerShipment = volumePerShipment;
    }

    if (packagingInfo.boxPerShipmentDirty && packagingInfo.boxPerShipment != null) {
      packagingInfo.boxPerShipment = Number(packagingInfo.boxPerShipment);
    } else {
      let boxPerShipment = this.sharedService.isValidNumber(this.onMaterialMasterIdChange(packagingInfo.corrugatedBox || 0, MaterialTypeEnum.Box, packagingInfo));
      if (packagingInfo.boxPerShipment != null) {
        boxPerShipment = this.sharedService.checkDirtyProperty('boxPerShipment', fieldColorsList) ? packagedbObj?.boxPerShipment || 0 : boxPerShipment;
      }
      packagingInfo.boxPerShipment = boxPerShipment;
    }

    if (packagingInfo.palletPerShipmentDirty && packagingInfo.palletPerShipment != null) {
      packagingInfo.palletPerShipment = Number(packagingInfo.palletPerShipment);
    } else {
      let palletPerShipment = this.sharedService.isValidNumber(this.onMaterialMasterIdChange(packagingInfo.pallet || 0, MaterialTypeEnum.Pallet, packagingInfo));
      if (packagingInfo.palletPerShipment != null) {
        palletPerShipment = this.sharedService.checkDirtyProperty('palletPerShipment', fieldColorsList) ? packagedbObj?.palletPerShipment || 0 : palletPerShipment;
      }
      packagingInfo.palletPerShipment = palletPerShipment;
    }

    if (packagingInfo.corrugatedBoxCostPerUnitDirty && packagingInfo.corrugatedBoxCostPerUnit != null) {
      packagingInfo.corrugatedBoxCostPerUnit = Number(packagingInfo.corrugatedBoxCostPerUnit);
    } else {
      const costPerProtectivePackagingUnit = packagingInfo?.corrugatedBoxList?.find((x) => x.materialMasterId == packagingInfo.corrugatedBox)?.price || 0;
      let corrugatedBoxCostPerUnit = this.sharedService.isValidNumber(costPerProtectivePackagingUnit);
      if (packagingInfo.corrugatedBoxCostPerUnit != null) {
        corrugatedBoxCostPerUnit = this.sharedService.checkDirtyProperty('corrugatedBoxCostPerUnit', fieldColorsList) ? packagedbObj?.corrugatedBoxCostPerUnit || 0 : corrugatedBoxCostPerUnit;
      }
      packagingInfo.corrugatedBoxCostPerUnit = corrugatedBoxCostPerUnit;
    }
    if (packagingInfo.totalBoxCostPerShipmentDirty && packagingInfo.totalBoxCostPerShipment != null) {
      packagingInfo.totalBoxCostPerShipment = Number(packagingInfo.totalBoxCostPerShipment);
    } else {
      let totalBoxCostPerShipment = (packagingInfo.corrugatedBoxCostPerUnit || 0) * (packagingInfo.boxPerShipment || 0);
      if (packagingInfo.totalBoxCostPerShipment != null) {
        totalBoxCostPerShipment = this.sharedService.checkDirtyProperty('totalBoxCostPerShipment', fieldColorsList) ? packagedbObj?.totalBoxCostPerShipment || 0 : totalBoxCostPerShipment;
      }
      packagingInfo.totalBoxCostPerShipment = totalBoxCostPerShipment;
    }

    if (packagingInfo.palletCostPerUnitDirty && packagingInfo.palletCostPerUnit != null) {
      packagingInfo.palletCostPerUnit = Number(packagingInfo.palletCostPerUnit);
    } else {
      const costPerProtectivePackagingUnit = packagingInfo?.palletList?.find((x: any) => x.materialMasterId == packagingInfo.pallet)?.price || 0;
      let palletCostPerUnit = this.sharedService.isValidNumber(costPerProtectivePackagingUnit);
      if (packagingInfo.palletCostPerUnit != null) {
        palletCostPerUnit = this.sharedService.checkDirtyProperty('palletCostPerUnit', fieldColorsList) ? packagedbObj?.palletCostPerUnit || 0 : palletCostPerUnit;
      }
      packagingInfo.palletCostPerUnit = palletCostPerUnit;
    }

    if (packagingInfo.totalPalletCostPerShipmentDirty && packagingInfo.totalPalletCostPerShipment != null) {
      packagingInfo.totalPalletCostPerShipment = Number(packagingInfo.totalPalletCostPerShipment);
    } else {
      let totalPalletCostPerShipment = (packagingInfo.palletCostPerUnit || 0) * (packagingInfo.palletPerShipment || 0);
      if (packagingInfo.totalPalletCostPerShipment != null) {
        totalPalletCostPerShipment = this.sharedService.checkDirtyProperty('totalPalletCostPerShipment', fieldColorsList) ? packagedbObj?.totalPalletCostPerShipment || 0 : totalPalletCostPerShipment;
      }
      packagingInfo.totalPalletCostPerShipment = totalPalletCostPerShipment;
    }

    if (packagingInfo.shrinkWrap) {
      if (packagingInfo.shrinkWrapCostPerUnitDirty && packagingInfo.shrinkWrapCostPerUnit != null) {
        packagingInfo.shrinkWrapCostPerUnit = Number(packagingInfo.shrinkWrapCostPerUnit);
      } else {
        // Note: ShrinkWrapCost data source is not available in Playwright tests, defaulting to 0
        const shrinkWrapCost = 0;
        let shrinkWrapCostPerUnit = this.sharedService.isValidNumber(shrinkWrapCost);
        if (packagingInfo.shrinkWrapCostPerUnit != null) {
          shrinkWrapCostPerUnit = this.sharedService.checkDirtyProperty('shrinkWrapCostPerUnit', fieldColorsList) ? packagedbObj?.shrinkWrapCostPerUnit || 0 : shrinkWrapCostPerUnit;
        }
        packagingInfo.shrinkWrapCostPerUnit = shrinkWrapCostPerUnit;
      }
    } else {
      packagingInfo.shrinkWrapCostPerUnit = 0;
    }
    if (packagingInfo.totalShrinkWrapCostDirty && packagingInfo.totalShrinkWrapCost != null) {
      packagingInfo.totalShrinkWrapCost = Number(packagingInfo.totalShrinkWrapCost);
    } else {
      const cost = this.calcTotalShrinkWrapCost(!!packagingInfo.shrinkWrap, packagingInfo.shrinkWrapCostPerUnit || 0, packagingInfo.palletPerShipment || 0);
      let totalShrinkWrapCost = this.sharedService.isValidNumber(cost);
      if (packagingInfo.totalShrinkWrapCost != null) {
        totalShrinkWrapCost = this.sharedService.checkDirtyProperty('totalShrinkWrapCost', fieldColorsList) ? packagedbObj?.totalShrinkWrapCost || 0 : totalShrinkWrapCost;
      }
      packagingInfo.totalShrinkWrapCost = totalShrinkWrapCost;
    }

    let adnlProtCosts = 0;
    const adnlPkgs = packagingInfo.adnlProtectPkgs || [];

    for (let i = 0; i < adnlPkgs.length; i++) {
      const item = adnlPkgs[i];
      let costPerProtectivePackagingUnit = item.costPerProtectivePackagingUnit;

      if (item.costPerProtectivePackagingUnitDirty && costPerProtectivePackagingUnit != null) {
        // Keep as is
      } else {
        if (recalculationcall) {
          const matid = item.protectivePkg;
          costPerProtectivePackagingUnit = packagingInfo?.protectList?.find((x) => x.materialMasterId == matid)?.price;
          costPerProtectivePackagingUnit = this.sharedService.isValidNumber(costPerProtectivePackagingUnit);
        } else {
          const adnlId = item.adnlId || 0;
          const values = packagedbObj?.adnlProtectPkgs?.find((x) => x.adnlId == adnlId);
          if (values && costPerProtectivePackagingUnit != null) {
            costPerProtectivePackagingUnit = this.sharedService.isValidNumber(values.costPerProtectivePackagingUnit);
          } else {
            const matid = item.protectivePkg;
            costPerProtectivePackagingUnit = packagingInfo?.protectList?.find((x) => x.materialMasterId == matid)?.price;
            costPerProtectivePackagingUnit = this.sharedService.isValidNumber(costPerProtectivePackagingUnit);
          }
        }
      }

      item.costPerProtectivePackagingUnit = this.sharedService.isValidNumber(Number(costPerProtectivePackagingUnit));
      const totalNumberOfProtectivePackaging = item.totalNumberOfProtectivePackaging || 0;
      adnlProtCosts += this.adnlProtCost(Number(costPerProtectivePackagingUnit), Number(totalNumberOfProtectivePackaging));
    }

    if (packagingInfo.totalPackagCostPerShipmentDirty && packagingInfo.totalPackagCostPerShipment != null) {
      packagingInfo.totalPackagCostPerShipment = Number(packagingInfo.totalPackagCostPerShipment);
    } else {
      let totalPackagCostPerShipment = this.totalpackageCostPerShipment(
        packagingInfo.totalBoxCostPerShipment || 0,
        packagingInfo.totalPalletCostPerShipment || 0,
        packagingInfo.totalShrinkWrapCost || 0,
        packagingInfo.costPerUnit || 0,
        packagingInfo.units || 0,
        packagingInfo.splBoxType || 0,
        adnlProtCosts
      );
      if (packagingInfo.totalPackagCostPerShipment != null) {
        totalPackagCostPerShipment = this.sharedService.checkDirtyProperty('totalPackagCostPerShipment', fieldColorsList) ? packagedbObj?.totalPackagCostPerShipment || 0 : totalPackagCostPerShipment;
      }
      packagingInfo.totalPackagCostPerShipment = totalPackagCostPerShipment;
    }

    if (packagingInfo.totalPackagCostPerUnitDirty && packagingInfo.totalPackagCostPerUnit != null) {
      packagingInfo.totalPackagCostPerUnit = Number(packagingInfo.totalPackagCostPerUnit);
    } else {
      let totalPackagCostPerUnit = this.clcPkgCostPerUnit(packagingInfo.totalPackagCostPerShipment || 0, packagingInfo.partsPerShipment || 0);
      if (packagingInfo.totalPackagCostPerUnit != null) {
        totalPackagCostPerUnit = this.sharedService.checkDirtyProperty('totalPackagCostPerUnit', fieldColorsList) ? packagedbObj?.totalPackagCostPerUnit || 0 : totalPackagCostPerUnit;
      }
      packagingInfo.totalPackagCostPerUnit = totalPackagCostPerUnit;
    }
    return packagingInfo;
  }

  private getLWH(description: string) {
    const matDescAry = description?.split('x');
    if (matDescAry && matDescAry?.length > 0) {
      return {
        length: +matDescAry[0]?.trim() || 0,
        width: +matDescAry[1]?.trim() || 0,
        height: +matDescAry[2]?.trim() || 0,
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
      // Note: MaxWeight data source is not available in Playwright tests, defaulting to 0
      const maxWeight = 0; // MaxWeight?.find((x: any) => x.description == desc && x.type == type)?.maxWeight || 0;
      const maxDensity = volume > 0 ? maxWeight / (volume * 0.8) : 0;
      const shipmentDensity = this.calcShipmentDensity(packageInfo.weightPerShipment || 0, packageInfo.volumePerShipment || 0);
      if (type == MaterialTypeEnum.Box) {
        result = this.partPerShipmentonMaterial(shipmentDensity, maxDensity, maxWeight, volume, packageInfo.weightPerShipment || 0, packageInfo.volumePerShipment || 0);
        packageInfo.totalBoxVol = this.sharedService.isValidNumber(volume * result);
      } else {
        result = this.partPerShipmentonMaterial(shipmentDensity, maxDensity, maxWeight, volume, packageInfo.weightPerShipment || 0, packageInfo.volumePerShipment || 0);
      }
    }
    return result;
  }

  private getMaterialFromList(masterId: number, type: MaterialTypeEnum, packageInfo: PackagingInfoDto) {
    let list: MaterialPriceDto[] = [];
    if (type == MaterialTypeEnum.Box) {
      list = packageInfo?.corrugatedBoxList || [];
    } else if (type == MaterialTypeEnum.Pallet) {
      list = packageInfo?.palletList || [];
    } else {
      list = packageInfo?.protectList || [];
    }
    return list.find((x: any) => x.materialMasterId == masterId);
  }
}