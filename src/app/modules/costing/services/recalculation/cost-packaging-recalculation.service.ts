import { Injectable } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { CountryDataMasterDto, MaterialInfoDto, PartInfoDto, ProcessInfoDto } from '../../../../shared/models';
import { Freight, Environmental, PackagingUnit } from 'src/app/shared/enums/package.enum';
import { PackagingInfoService } from 'src/app/shared/services/packaging-info.service';
import { AdditionalPackagingDto, PackagingInfoDto } from 'src/app/shared/models/packaging-info.model';
import { map, Observable, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { PackingMode } from 'src/app/shared/enums';
import { PackagingMapDto, PackagingSizeDefinitionDto } from 'src/app/shared/models/PackagingMaterialMasterDto.model';
import { Store } from '@ngxs/store';
import { PackagingInfoState } from 'src/app/modules/_state/packaging-info.state';
import { LogisticsSummaryService } from 'src/app/shared/services/logistics-summary.service';
import { ModeOfTransportEnum } from 'src/app/shared/models/logistics-summary.model';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { PackagingMappingService } from 'src/app/shared/mapping/cost-packaging-mapping.service';

@Injectable({
  providedIn: 'root',
})
export class CostPackagingingRecalculationService {
  materialInfo: MaterialInfoDto;
  processInfoDtoOut: ProcessInfoDto;
  showBoxMessage = false;
  showPalletMessage = false;
  currentPart: PartInfoDto;
  defaultFrightId = 0;
  packagingSizeDefinitionMasterList: PackagingSizeDefinitionDto[] = [];
  _packagingSizeDefinitionMasterData$: Observable<PackagingSizeDefinitionDto[]> = this.store.select(PackagingInfoState.getPackagingSizeDefinitionMasterData);
  _countryMaster$: Observable<CountryDataMasterDto[]> = this.store.select(CountryDataState.getCountryData);
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  countryList: CountryDataMasterDto[] = [];

  constructor(
    private sharedService: SharedService,
    private store: Store,
    private PackgSvc: PackagingInfoService,
    private logisticsSummaryService: LogisticsSummaryService,
    private _packagingMappingService: PackagingMappingService
  ) {
    this._packagingSizeDefinitionMasterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((packagingSizeDefinitionList: PackagingSizeDefinitionDto[]) => {
      if (packagingSizeDefinitionList) {
        this.packagingSizeDefinitionMasterList = Object.values(packagingSizeDefinitionList || {});
      }
    });
    this._countryMaster$.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      this.countryList = res;
    });
  }

  public calculateBoxesNeeded(
    box: { x: number; y: number; z: number },
    part: { x: number; y: number; z: number },
    totalParts: number,
    maxBoxWeight: number, // in grams
    partWeight: number // in grams
  ): { partsPerBox: number; boxesNeeded: number } {
    const perms = [
      { x: part.x, y: part.y, z: part.z },
      { x: part.x, y: part.z, z: part.y },
      { x: part.y, y: part.x, z: part.z },
      { x: part.y, y: part.z, z: part.x },
      { x: part.z, y: part.x, z: part.y },
      { x: part.z, y: part.y, z: part.x },
    ];

    let bestPartsPerBox = 0;

    for (const p of perms) {
      const fitX = Math.floor(box.x / p.x);
      const fitY = Math.floor(box.y / p.y);
      const fitZ = Math.floor(box.z / p.z);

      const countByVolume = fitX * fitY * fitZ;
      const countByWeight = Math.floor(maxBoxWeight / partWeight);

      const count = Math.min(countByVolume, countByWeight);

      if (count > bestPartsPerBox) bestPartsPerBox = count;
    }

    const boxesNeeded = bestPartsPerBox > 0 ? Math.ceil(totalParts / bestPartsPerBox) : 0;

    return { partsPerBox: bestPartsPerBox, boxesNeeded };
  }

  private simulationForAdditionalPackaging(data: any): AdditionalPackagingDto[] {
    const partsPerShipment = data.partsPerShipment ?? 0;
    let boxPerShipment = 0;
    const totalPart = data.partsPerShipment;
    const partWeight = (data.weightPerShipment / totalPart) * 1000; // convert to gms
    // const partVolume = (this.materialInfo?.dimX * this.materialInfo?.dimY * this.materialInfo?.dimZ) || (data.volumePerShipment / totalPart) * 1000000000; // convert to mm3

    let boxWidth = 0;
    let boxLength = 0;
    let boxHeight = 0;
    let partsPerBox = 0;
    let boxWeight = 0;
    // let noOfBoxCanFitInPallet = 0;

    const allPackages = data.adnlProtectPkgs
      .sort((a: any, b: any) => a.unitId - b.unitId)
      .map((pckg: any) => {
        let pkg = { ...pckg };
        const unitId = pkg.unitId;
        let units = 0;
        let totalPackagingTime = 0;
        let directLaborRate = 0;
        let laborCostPerPart = 0;
        let partsPerContainer = 0;

        // const weightInGms = pkg.weightInGms || 0;
        // const volumeInCm3 = (pkg.lengthInMm ?? 0) / 10 * (pkg.heightInMm ?? 0) / 10 * (pkg.widthInMm ?? 0) / 10;

        const maxWeight = pkg.maxWeightInGms ?? pkg.packageMaxCapacity ?? 0;
        let maxVolume = pkg.maxVolumeInCm3 / 1000 || pkg.packageMaxVolume || 0;

        if (pkg.unitsDirty) {
          units = pkg.units;
        } else {
          if (maxVolume === 0) {
            maxVolume = Math.floor(pkg.lengthInMm * pkg.widthInMm * pkg.heightInMm);
          }
          if (unitId === PackagingUnit.Box) {
            boxWidth = pkg.widthInMm ?? 0;
            boxLength = pkg.lengthInMm ?? 0;
            boxHeight = pkg.heightInMm ?? 0;

            const dimResult = this.calculateBoxesNeeded(
              { x: boxLength, y: boxWidth, z: boxHeight },
              {
                x: this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
                y: this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
                z: this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1,
              },
              partsPerShipment,
              maxWeight,
              this.materialInfo?.netWeight || 0
            );

            const minCapacity = Math.floor(Math.min(maxWeight / partWeight, dimResult.partsPerBox));
            units = (minCapacity > 0 ? Math.ceil(partsPerShipment / minCapacity) : 0) || 0;
            // this.showBoxMessage = dimResult.boxesNeeded === 0;
            partsPerContainer = dimResult.partsPerBox;
            partsPerBox = partsPerContainer;
            boxPerShipment = units;
            boxWeight = pkg.weightInGms || 0;
          } else if (unitId === PackagingUnit.Each) {
            units = partsPerShipment;
            // boxPerShipment = units;
          } else if (unitId === PackagingUnit.Pallet) {
            // ROUNDUP ( [Boxes Per Shipment] / (ROUNDDOWN( PalletWidth(mm)/BoxWidth(mm)) * (PalletLength(mm)/BoxLength(mm)) * (PalletHeight(mm)/BoxHeight(mm)))
            const palletWidth = pkg.widthInMm ?? 1;
            const palletLength = pkg.lengthInMm ?? 1;
            const palletHeight = pkg.heightInMm ?? 1;
            const dimResult = this.calculateBoxesNeeded(
              { x: palletLength, y: palletWidth, z: palletHeight },
              {
                x: boxLength || this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
                y: boxWidth || this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
                z: boxHeight || this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1,
              },
              boxPerShipment || partsPerShipment,
              maxWeight,
              this.materialInfo?.netWeight || 0 + boxWeight
            );
            // const palletCapacity = Math.floor(palletWidth / boxWidth) * Math.floor(palletLength / boxLength) * Math.floor(palletHeight / boxHeight);
            // units = palletCapacity > 0 ? Math.ceil(boxPerShipment / palletCapacity) : 1;
            units = dimResult.boxesNeeded || 1;
            units = units || 1;
            partsPerContainer = dimResult.boxesNeeded === 0 ? 1 : dimResult.partsPerBox;
            // noOfBoxCanFitInPallet = partsPerContainer;
            partsPerContainer = partsPerBox ? partsPerContainer * partsPerBox : partsPerContainer;
            // this.showPalletMessage = dimResult.boxesNeeded === 0;
          } else if (unitId === PackagingUnit.PerBox) {
            units = boxPerShipment > 0 ? Math.ceil(boxPerShipment) : 1;
            // boxPerShipment = units;
          } else if (unitId === PackagingUnit.Wrap) {
            let l = this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
              y = this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
              z = this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1;
            let boundingBoxSurfaceArea = 2 * (l * y + l * z + y * z);
            let wrapLength = pkg.lengthInMm ?? 1;
            let wrapWidth = pkg.widthInMm ?? 1;
            units = boundingBoxSurfaceArea / (wrapLength * wrapWidth);
            // units = boxPerShipment > 0 ? Math.ceil(boxPerShipment) : 1;
          } else if (unitId === PackagingUnit.Fill) {
            let l = this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
              y = this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
              z = this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1;
            units = Math.floor(maxVolume / (l * y * z || 1));
            // units = boxPerShipment > 0 ? Math.ceil(boxPerShipment) : 1;
          } else {
            units = 1; // Default case if unitId is not recognized
            // boxPerShipment = units;
          }
        }

        // calculate other values
        if (!pkg.isTotalPackagingTimeDirty) {
          totalPackagingTime = pkg.laborTimeSec; // this.sharedService.isValidNumber((pkg.laborTimeSec / 60) * totalPart);
        } else {
          totalPackagingTime = pkg.totalPackagingTime;
        }

        if (!pkg.isDirectLaborRateDirty) {
          directLaborRate = this.sharedService.isValidNumber(this.processInfoDtoOut?.lowSkilledLaborRatePerHour || 0);
        } else {
          directLaborRate = pkg.directLaborRate;
        }

        if (!pkg.isPartsPerContainerDirty) {
          pkg.partsPerContainer = partsPerContainer || this.sharedService.isValidNumber(Math.ceil(totalPart / units));
        }

        // Labor Cost / Part = [LaborTimeSec] * [Direct Labor Rate] / 3600 / [Parts per Container] , totalPackagingTime -> LaborTimeSec
        if (!pkg.isCostPerContainerDirty) {
          laborCostPerPart = this.sharedService.isValidNumber((totalPackagingTime * (directLaborRate / 3600)) / pkg.partsPerContainer);
        } else {
          laborCostPerPart = pkg.laborTimeSec;
        }

        if (!pkg.isQtyNeededPerShipmentDirty) {
          if (unitId === PackagingUnit.Pallet) {
            pkg.qtyNeededPerShipment = this.sharedService.isValidNumber(totalPart / pkg.partsPerContainer);
            // pkg.qtyNeededPerShipment = this.sharedService.isValidNumber(units / noOfBoxCanFitInPallet);
          } else {
            pkg.qtyNeededPerShipment = this.sharedService.isValidNumber(Math.ceil(totalPart / pkg.partsPerContainer));
          }
        }

        if (!pkg.isCostPerContainerDirty) {
          pkg.costPerUnit = this.sharedService.isValidNumber(pkg.costPerContainer / pkg.partsPerContainer + laborCostPerPart);
        }

        if (!pkg.isCO2PerUnitDirty) {
          pkg.cO2PerUnit = this.sharedService.isValidNumber(pkg.esgkgCo2 / pkg.partsPerContainer);
        }

        return {
          ...pkg,
          units,
          totalPackagingTime,
          directLaborRate,
          laborCostPerPart,
        };
      })
      .filter((x) => x.units !== 0)
      .sort((a: any, b: any) => a.packagingTypeId - b.packagingTypeId);

    const unit1Packages = allPackages.filter((pkg: any) => pkg.unitId === PackagingUnit.Box);
    const lowestCostUnit1 = unit1Packages.reduce((min, curr) => (curr.costPerUnit < min.costPerUnit ? curr : min), unit1Packages[0]);

    const unit3Packages = allPackages.filter((pkg: any) => pkg.unitId === PackagingUnit.Pallet);
    const lowestCostUnit3 = unit3Packages.reduce((min, curr) => (curr.costPerUnit < min.costPerUnit ? curr : min), unit3Packages[0]);

    const otherPackages = allPackages.filter((pkg: any) => pkg.unitId !== PackagingUnit.Box && pkg.unitId !== PackagingUnit.Pallet);

    return [...otherPackages, lowestCostUnit1, lowestCostUnit3].sort((a: any, b: any) => a.packagingTypeId - b.packagingTypeId);
  }

  public calculateForAdditionalPackaging(
    dataSim: any,
    materialInfo: MaterialInfoDto,
    processInfo: ProcessInfoDto,
    simulationNeeded?: boolean,
    isPalletDataChanged?: boolean,
    isBoxDataChanged?: any
  ): AdditionalPackagingDto[] {
    this.materialInfo = { ...materialInfo };
    this.processInfoDtoOut = { ...processInfo };
    let data: any = dataSim;
    if (simulationNeeded) {
      data.adnlProtectPkgs = this.simulationForAdditionalPackaging(dataSim);
    }
    const partsPerShipment = data.partsPerShipment ?? 0;
    let boxPerShipment = 0;
    const totalPart = data.partsPerShipment;
    const partWeight = (data.weightPerShipment / totalPart) * 1000; // convert to gms

    let boxWidth = 0;
    let boxLength = 0;
    let boxHeight = 0;
    let partsPerBox = 0;
    let boxWeight = 0;

    return data.adnlProtectPkgs
      .sort((a: any, b: any) => a.unitId - b.unitId)
      .map((pckg: any) => {
        let pkg = { ...pckg };
        const unitId = pkg.unitId;
        let units = 0;
        let totalPackagingTime = 0;
        let directLaborRate = 0;
        let laborCostPerPart = 0;
        let partsPerContainer = 0;
        const maxWeight = pkg.maxWeightInGms ?? pkg.packageMaxCapacity ?? 0;
        let maxVolume = pkg.maxVolumeInCm3 / 1000 || pkg.packageMaxVolume || 0;

        if (pkg.unitsDirty) {
          units = pkg.units;
        } else {
          if (maxVolume === 0) {
            maxVolume = Math.floor(pkg.lengthInMm * pkg.widthInMm * pkg.heightInMm);
          }
          if (unitId === PackagingUnit.Box) {
            boxWidth = pkg.widthInMm ?? 0;
            boxLength = pkg.lengthInMm ?? 0;
            boxHeight = pkg.heightInMm ?? 0;

            let dimResult = this.calculateBoxesNeeded(
              { x: boxLength, y: boxWidth, z: boxHeight },
              {
                x: this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
                y: this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
                z: this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1,
              },
              partsPerShipment,
              maxWeight,
              this.materialInfo?.netWeight || 0
            );

            if (pkg.isPartsPerContainerDirty && isBoxDataChanged) {
              dimResult.partsPerBox = pkg.partsPerContainer;
            }

            const minCapacity = Math.floor(Math.min(maxWeight / partWeight, dimResult.partsPerBox));
            units = (minCapacity > 0 ? Math.ceil(partsPerShipment / minCapacity) : 0) || 0;
            this.showBoxMessage = dimResult.boxesNeeded === 0;
            partsPerContainer = dimResult.partsPerBox;
            partsPerBox = partsPerContainer;
            boxPerShipment = units;
            boxWeight = pkg.weightInGms || 0;
          } else if (unitId === PackagingUnit.Each) {
            units = 1; // partsPerShipment;
            // boxPerShipment = units;
          } else if (unitId === PackagingUnit.Pallet) {
            // ROUNDUP ( [Boxes Per Shipment] / (ROUNDDOWN( PalletWidth(mm)/BoxWidth(mm)) * (PalletLength(mm)/BoxLength(mm)) * (PalletHeight(mm)/BoxHeight(mm)))
            const palletWidth = pkg.widthInMm ?? 1;
            const palletLength = pkg.lengthInMm ?? 1;
            const palletHeight = pkg.heightInMm ?? 1;
            const dimResult = this.calculateBoxesNeeded(
              { x: palletLength, y: palletWidth, z: palletHeight },
              {
                x: boxLength || this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
                y: boxWidth || this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
                z: boxHeight || this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1,
              },
              boxPerShipment || partsPerShipment,
              maxWeight,
              this.materialInfo?.netWeight || 0 + boxWeight
            );
            // const palletCapacity = Math.floor(palletWidth / boxWidth) * Math.floor(palletLength / boxLength) * Math.floor(palletHeight / boxHeight);
            // units = palletCapacity > 0 ? Math.ceil(boxPerShipment / palletCapacity) : 1;
            if (isPalletDataChanged) {
              dimResult.partsPerBox = pkg.partsPerContainer;
            }
            units = dimResult.boxesNeeded || 1;
            units = units || 1;
            partsPerContainer = dimResult.boxesNeeded === 0 ? 1 : dimResult.partsPerBox;
            // noOfBoxCanFitInPallet = partsPerContainer;
            partsPerContainer = partsPerBox ? partsPerContainer * partsPerBox : partsPerContainer;
            this.showPalletMessage = dimResult.boxesNeeded === 0;
          } else if (unitId === PackagingUnit.PerBox) {
            units = boxPerShipment > 0 ? Math.ceil(boxPerShipment) : 1;
          } else if (unitId === PackagingUnit.Wrap) {
            let l = this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
              y = this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
              z = this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1;
            let boundingBoxSurfaceArea = 2 * (l * y + l * z + y * z);
            let wrapLength = pkg.lengthInMm ?? 1;
            let wrapWidth = pkg.widthInMm ?? 1;
            units = boundingBoxSurfaceArea / (wrapLength * wrapWidth);
            // units = boxPerShipment > 0 ? Math.ceil(boxPerShipment) : 1;
          } else if (unitId === PackagingUnit.Fill) {
            let l = this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
              y = this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
              z = this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1;
            units = Math.floor(maxVolume / (l * y * z || 1));
            // units = boxPerShipment > 0 ? Math.ceil(boxPerShipment) : 1;
          } else {
            units = 1; // Default case if unitId is not recognized
            // boxPerShipment = units;
          }
        }

        // calculate other values
        if (!pkg.isTotalPackagingTimeDirty) {
          totalPackagingTime = pkg.laborTimeSec; // this.sharedService.isValidNumber((pkg.laborTimeSec / 60) * totalPart);
        } else {
          totalPackagingTime = pkg.totalPackagingTime;
        }

        if (!pkg.isDirectLaborRateDirty) {
          directLaborRate = this.sharedService.isValidNumber(this.processInfoDtoOut?.lowSkilledLaborRatePerHour || 0);
        } else {
          directLaborRate = pkg.directLaborRate;
        }

        if (!pkg.isPartsPerContainerDirty) {
          pkg.partsPerContainer = partsPerContainer || this.sharedService.isValidNumber(Math.ceil(totalPart / units));
        }

        if (isBoxDataChanged && unitId === PackagingUnit.Pallet) {
          pkg.partsPerContainer = partsPerContainer || this.sharedService.isValidNumber(Math.ceil(totalPart / units));
        }

        // Labor Cost / Part = [LaborTimeSec] * [Direct Labor Rate] / 3600 / [Parts per Container] , totalPackagingTime -> LaborTimeSec
        laborCostPerPart = this.sharedService.isValidNumber((totalPackagingTime * (directLaborRate / 3600)) / pkg.partsPerContainer);

        if (!pkg.isQtyNeededPerShipmentDirty) {
          if (unitId === PackagingUnit.Pallet) {
            // pkg.qtyNeededPerShipment = this.sharedService.isValidNumber(units / noOfBoxCanFitInPallet);
            pkg.qtyNeededPerShipment = this.sharedService.isValidNumber(totalPart / pkg.partsPerContainer);
          } else {
            pkg.qtyNeededPerShipment = this.sharedService.isValidNumber(Math.ceil(totalPart / pkg.partsPerContainer));
          }
          // pkg.qtyNeededPerShipment = this.sharedService.isValidNumber(totalPart / pkg.partsPerContainer);
        }

        if (isBoxDataChanged && unitId === PackagingUnit.Pallet) {
          pkg.qtyNeededPerShipment = this.sharedService.isValidNumber(totalPart / pkg.partsPerContainer);
        }

        if (!pkg.isCostPerContainerDirty) {
          pkg.costPerUnit = this.sharedService.isValidNumber(pkg.costPerContainer / pkg.partsPerContainer + laborCostPerPart);
        }

        if (isBoxDataChanged && unitId === PackagingUnit.Pallet) {
          pkg.costPerContainer = this.sharedService.isValidNumber(pkg.costPerContainer / pkg.partsPerContainer + laborCostPerPart);
        }

        if (!pkg.isCO2PerUnitDirty) {
          pkg.cO2PerUnit = this.sharedService.isValidNumber(pkg.esgkgCo2 / pkg.partsPerContainer);
        }

        if (isBoxDataChanged && unitId === PackagingUnit.Pallet) {
          pkg.cO2PerUnit = this.sharedService.isValidNumber(pkg.esgkgCo2 / pkg.partsPerContainer);
        }
        return {
          ...pkg,
          units,
          totalPackagingTime,
          directLaborRate,
          laborCostPerPart,
        };
      })
      .filter((x) => x.packageDescriptionId)
      .sort((a: any, b: any) => a.packagingTypeId - b.packagingTypeId);
  }
  public packingModeToEnvironmental(packingMode: PackingMode): Environmental | null {
    switch (packingMode) {
      case PackingMode.Reusable:
        return Environmental.Reusable;
      case PackingMode.NonReusable:
        return Environmental.Disposable;
      case PackingMode.NoPacking:
        return null; // NoPacking means nothing
      default:
        return null;
    }
  }
  private comparePackingModes(oldEnvironmentalId: number | undefined, newPackingModeId: number): { changed: boolean; environmentalId: number | null } {
    const newEnvironmentalId = this.packingModeToEnvironmental(newPackingModeId);

    // If new packing mode is NoPacking, return false with null
    if (newEnvironmentalId === null) {
      return { changed: false, environmentalId: null };
    }

    // If old value doesn't exist, consider it changed
    if (oldEnvironmentalId === undefined) {
      return { changed: true, environmentalId: newEnvironmentalId };
    }

    // Compare old and new values
    const changed = oldEnvironmentalId !== newEnvironmentalId;

    return {
      changed,
      environmentalId: changed ? newEnvironmentalId : oldEnvironmentalId,
    };
  }

  public getPartSizeId(weightKg: number, lengthMm: number, widthMm: number, heightMm: number): number {
    const maxDimension = Math.max(lengthMm, widthMm, heightMm);

    const match = this.packagingSizeDefinitionMasterList.find((config) => config.commodityId === this.currentPart?.commodityId && weightKg <= config.maxWeightKG && maxDimension <= config.maxLengthMM);

    // TODO: -1 is untill new mapping updatedbfor sizes
    return match ? (match.sizeId > 1 ? match.sizeId - 1 : 1) : 4; // Default if no match
  }

  public recalculatePackagingCost(currentPart: PartInfoDto, processInfoDtoOut: ProcessInfoDto, materialInfo: MaterialInfoDto, pkgInfoState: PackagingInfoDto): Observable<PackagingInfoDto> {
    // this.materialInfo = { ...materialInfo };
    //this.currentPart = { ...currentPart };
    this.processInfoDtoOut = { ...processInfoDtoOut };
    const packagedbObj: PackagingInfoDto = { ...pkgInfoState };
    packagedbObj.partInfoId = currentPart?.partInfoId;
    packagedbObj.projectInfoId = currentPart?.projectInfoId;
    packagedbObj.partsPerShipment = this.sharedService.isValidNumber(Math.ceil(currentPart?.eav * (currentPart?.deliveryFrequency / 365)));
    packagedbObj.weightPerShipment = this.sharedService.isValidNumber((packagedbObj.partsPerShipment * (materialInfo?.netWeight || 0)) / 1000 || 0);
    packagedbObj.volumePerShipment = this.sharedService.isValidNumber(
      packagedbObj.partsPerShipment *
        ((materialInfo.dimX ||
          this.sharedService.extractedMaterialData?.DimX * materialInfo.dimY ||
          this.sharedService.extractedMaterialData?.DimY * materialInfo.dimZ ||
          this.sharedService.extractedMaterialData?.DimZ) /
          1000000000) || 0
    );
    const isPackingModeChanged = this.comparePackingModes(packagedbObj?.environmentalId, currentPart.packingModeId);
    const sizeId = this.getPartSizeId(
      materialInfo.netWeight / 1000,
      materialInfo.dimX || this.sharedService.extractedMaterialData?.DimX,
      materialInfo.dimY || this.sharedService.extractedMaterialData?.DimY,
      materialInfo.dimZ || this.sharedService.extractedMaterialData?.DimZ
    );
    const freight$ =
      currentPart?.mfrCountryId && currentPart?.deliveryCountryId && (packagedbObj?.mfrCountryId !== currentPart?.mfrCountryId || packagedbObj?.deliveryCountryId !== currentPart?.deliveryCountryId)
        ? this.logisticsSummaryService.getDefaultModeOfTransport(currentPart?.mfrCountryId, currentPart?.deliveryCountryId)
        : of(null);

    return freight$.pipe(
      take(1),
      switchMap((response: number | null) => {
        let isFreightChanged = false;

        if (response) {
          this.defaultFrightId = response === ModeOfTransportEnum.Ocean ? Freight.Sea : Freight.LandOrAir;
          if (packagedbObj.freightId !== this.defaultFrightId) {
            isFreightChanged = true;
            packagedbObj.freightId = this.defaultFrightId;
          }
        }

        const needsNewPackData =
          packagedbObj.materialFinishId &&
          packagedbObj.fragileId &&
          packagedbObj.freightId &&
          (packagedbObj?.sizeId !== sizeId || isFreightChanged || (packagedbObj?.adnlProtectPkgs && packagedbObj?.adnlProtectPkgs.length === 1 && !packagedbObj?.adnlProtectPkgs[0].packagingTypeId));

        if (!needsNewPackData) {
          packagedbObj.adnlProtectPkgs = this.calculateForAdditionalPackaging(packagedbObj, materialInfo, this.processInfoDtoOut, false);
          return of(packagedbObj);
        }

        packagedbObj.sizeId = sizeId;
        packagedbObj.mfrCountryId = currentPart?.mfrCountryId;
        packagedbObj.deliveryCountryId = currentPart?.deliveryCountryId;
        packagedbObj.environmentalId = isPackingModeChanged.environmentalId;

        return this.PackgSvc.getPackagingMaterialDetails(
          currentPart?.commodityId,
          packagedbObj.materialFinishId,
          packagedbObj.fragileId,
          packagedbObj.sizeId,
          packagedbObj.freightId,
          packagedbObj.environmentalId
        ).pipe(
          take(1),
          map((res: PackagingMapDto) => {
            if (res && res.packingMaterials && res.packingMaterials.length > 0) {
              const packagingPriceMultiplier = this.countryList?.find((x) => x.countryId === currentPart.mfrCountryId)?.packagingPriceMultiplier || 1;
              packagedbObj.adnlProtectPkgs = this._packagingMappingService.mapToAdditionalPackagingDto(res.packingMaterials, packagingPriceMultiplier);
              packagedbObj.adnlProtectPkgs = this.calculateForAdditionalPackaging(packagedbObj, materialInfo, this.processInfoDtoOut, true);
            }
            return packagedbObj;
          })
        );
      })
    );
  }
}
