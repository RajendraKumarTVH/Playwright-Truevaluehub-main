
import { SharedService } from './shared';
import { MaterialInfoDto } from 'src/app/shared/models';

import { Layer, MaterialPCBConfigService, PCBLayer } from 'src/app/shared/config/material-pcb-config';
import { SurfaceFinish } from 'src/app/shared/config/manufacturing-pcb-config';

export class PCBCalculatorService {
  constructor(
    private shareService: SharedService,
    private configService: MaterialPCBConfigService
  ) { }

  getControlsByCore(materialInfo: MaterialInfoDto, noOfCore: number) {
    return materialInfo?.sandForCoreFormArray?.controls?.filter((ctrl) => ctrl.get('noOfCore')?.value === noOfCore) || [];
  }

  public calculationsForConventionalPCB(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): Observable<MaterialInfoDto> {
    const noOfCopperLayers = this.shareService.isValidNumber(materialInfo.typeOfWeld);
    const OuterLayerCopperThickness = this.shareService.isValidNumber(materialInfo.partTickness);
    const solderMaskThickness = this.shareService.isValidNumber(materialInfo.typeOfConductor);

    if (materialInfo.isStockLengthDirty && materialInfo.stockLength !== null) {
      materialInfo.stockLength = Number(materialInfo.stockLength);
    } else {
      let stockLength = noOfCopperLayers === 2 ? 1 : noOfCopperLayers / 2 - 1;
      if (materialInfo?.blockLength !== null) {
        stockLength = this.shareService.checkDirtyProperty('stockLength', fieldColorsList) ? selectedMaterialInfo?.stockLength : stockLength;
      }
      materialInfo.stockLength = stockLength;
    }
    const prePregList: any[] = this.getControlsByCore(materialInfo, PCBLayer.Prepreg);
    const coreList: any[] = this.getControlsByCore(materialInfo, PCBLayer.Core);
    const drillingList: any[] = this.getControlsByCore(materialInfo, PCBLayer.Drilling);

    for (let i = 0; i < materialInfo?.sandForCoreFormArray?.controls?.length; i++) {
      const subProcessForm = materialInfo.sandForCoreFormArray.at(i) as FormGroup;
      const info = materialInfo?.sandForCoreFormArray?.controls[i];
      const subArrayType = Number(info?.value?.noOfCore) || 1;
      if (subArrayType === PCBLayer.Copper) {
        let noOfInnerLayerCopperThickness = noOfCopperLayers === 2 ? 0 : noOfCopperLayers - 2;
        if (subProcessForm.controls['coreWidth'].dirty) {
          noOfInnerLayerCopperThickness = subProcessForm.controls['coreWidth'].value;
        } else {
          if (Number(info?.value?.coreWidth) !== null) {
            noOfInnerLayerCopperThickness = this.shareService.checkSubProcessDirtyProperty('coreWidth', fieldColorsList)
              ? Number(info?.value?.coreWidth)
              : this.shareService.isValidNumber(noOfInnerLayerCopperThickness);
          }
        }
        (materialInfo?.sandForCoreFormArray.controls as FormGroup[])[i].patchValue({
          coreWidth: noOfInnerLayerCopperThickness,
        });
      }
    }

    if (materialInfo.isPrimerCoatingTicknessDirty && materialInfo.primerCoatingTickness !== null) {
      materialInfo.primerCoatingTickness = Number(materialInfo.primerCoatingTickness);
    } else {
      let primerCoatingTickness = this.generateStackupLayers(
        noOfCopperLayers,
        OuterLayerCopperThickness,
        solderMaskThickness,
        materialInfo?.sandForCoreFormArray,
        materialInfo?.prepregList,
        materialInfo?.laminatesList,
        materialInfo.stockLength
      )?.reduce((sum, item) => sum + item?.value, 0);
      if (materialInfo?.primerCoatingTickness !== null) {
        primerCoatingTickness = this.shareService.checkDirtyProperty('primerCoatingTickness', fieldColorsList) ? selectedMaterialInfo?.primerCoatingTickness : primerCoatingTickness;
      }
      materialInfo.primerCoatingTickness = primerCoatingTickness;
    }

    //Array
    const pcbSizeX = Number(materialInfo.openingTime);
    const pcbSizeY = Number(materialInfo.colorantPer);

    if (materialInfo.isColorantCostDirty && materialInfo.colorantCost !== null) {
      materialInfo.colorantCost = Number(materialInfo.colorantCost);
    } else {
      materialInfo.colorantCost = this.shareService.checkDirtyProperty('colorantCost', fieldColorsList) ? selectedMaterialInfo?.colorantCost : 2.4;
    } //boardSpacingX
    if (materialInfo.isColorantPriceDirty && materialInfo.colorantPrice !== null) {
      materialInfo.colorantPrice = Number(materialInfo.colorantPrice);
    } else {
      materialInfo.colorantPrice = this.shareService.checkDirtyProperty('colorantPrice', fieldColorsList) ? selectedMaterialInfo?.colorantPrice : 2.4;
    } //boardSpacingY

    const matrixX = Number(materialInfo.runnerDia);
    const matrixY = Number(materialInfo.runnerLength);

    if (materialInfo.isFlowFactorDirty && materialInfo.flowFactor !== null) {
      materialInfo.flowFactor = Number(materialInfo.flowFactor);
    } else {
      materialInfo.flowFactor = this.shareService.checkDirtyProperty('flowFactor', fieldColorsList) ? selectedMaterialInfo?.flowFactor : 10;
    } //handlingAreaLeft
    if (materialInfo.isWallThickFactorDirty && materialInfo.wallThickFactor !== null) {
      materialInfo.wallThickFactor = Number(materialInfo.wallThickFactor);
    } else {
      materialInfo.wallThickFactor = this.shareService.checkDirtyProperty('wallThickFactor', fieldColorsList) ? selectedMaterialInfo?.wallThickFactor : 10;
    } //handlingAreaRight

    if (materialInfo.isMaxFlowlengthDirty && materialInfo.maxFlowlength !== null) {
      materialInfo.maxFlowlength = Number(materialInfo.maxFlowlength);
    } else {
      materialInfo.maxFlowlength = this.shareService.checkDirtyProperty('maxFlowlength', fieldColorsList) ? selectedMaterialInfo?.maxFlowlength : 10;
    } //handlingAreaTop

    if (materialInfo.isInjPressureDirty && materialInfo.injPressure !== null) {
      materialInfo.injPressure = Number(materialInfo.injPressure);
    } else {
      materialInfo.injPressure = this.shareService.checkDirtyProperty('injPressure', fieldColorsList) ? selectedMaterialInfo?.injPressure : 10;
    } //handlingAreaTop

    const noOfPCBArray = matrixX * matrixY;
    materialInfo.txtWindows = noOfPCBArray;
    const arraySizeX = this.shareService.isValidNumber(
      pcbSizeX * matrixX + Number(materialInfo.colorantCost) * (matrixX - 1) + (Number(materialInfo.flowFactor) + Number(materialInfo.wallThickFactor))
    );
    const arraySizeY = this.shareService.isValidNumber(
      pcbSizeY * matrixY + Number(materialInfo.colorantPrice) * (matrixY - 1) + (Number(materialInfo.maxFlowlength) + Number(materialInfo.injPressure))
    );

    if (materialInfo.isInjectionTimeDirty && materialInfo.injectionTime !== null) {
      materialInfo.injectionTime = Number(materialInfo.injectionTime);
    } else {
      materialInfo.injectionTime = this.shareService.checkDirtyProperty('injectionTime', fieldColorsList) ? selectedMaterialInfo?.injectionTime : arraySizeY;
    }

    if (materialInfo.isClosingTimeDirty && materialInfo.closingTime !== null) {
      materialInfo.closingTime = Number(materialInfo.closingTime);
    } else {
      materialInfo.closingTime = this.shareService.checkDirtyProperty('closingTime', fieldColorsList) ? selectedMaterialInfo?.closingTime : arraySizeX;
    }

    const arraySizeXInch = this.shareService.isValidNumber(materialInfo.closingTime / 25.4);
    materialInfo.holdingTime = arraySizeXInch;

    const arraySizeYInch = this.shareService.isValidNumber(materialInfo.injectionTime / 25.4);
    materialInfo.coolingTime = arraySizeYInch;

    materialInfo.ejectionTime = materialInfo.closingTime;
    materialInfo.pickPlaceTime = materialInfo.injectionTime;

    const lookupInfo = this.configService.getLinXList(arraySizeXInch, arraySizeYInch);
    const panelData = lookupInfo?.panelInfo;
    const sortedArray = panelData.sort((a, b) => b.percent - a.percent);

    if (materialInfo.isNoOfDrawStepsDirty && materialInfo.noOfDrawSteps !== null) {
      materialInfo.noOfDrawSteps = Number(materialInfo.noOfDrawSteps);
    } else {
      let utilisation = sortedArray[0]?.index;
      if (materialInfo.noOfDrawSteps !== null) {
        utilisation = this.shareService.checkDirtyProperty('noOfDrawSteps', fieldColorsList) ? selectedMaterialInfo?.noOfDrawSteps : utilisation;
      }
      materialInfo.noOfDrawSteps = utilisation;
    }

    const selectedUtilization = sortedArray?.find((x) => x.index === Number(materialInfo.noOfDrawSteps));
    materialInfo.coilLength = selectedUtilization?.percent * 100;
    materialInfo.partInnerDiameter = selectedUtilization?.x;
    materialInfo.coilDiameter = selectedUtilization?.y;
    const arrayMatrixX = selectedUtilization?.noOfArrayX;
    const arrayMatrixY = selectedUtilization?.noOfArrayY;

    if (materialInfo.isCoilWeightDirty && !!materialInfo.coilWeight) {
      materialInfo.coilWeight = Number(materialInfo.coilWeight);
    } else {
      let coilWeight = arrayMatrixX * arrayMatrixY;
      if (materialInfo?.coilWeight) {
        coilWeight = this.shareService.checkDirtyProperty('coilWeight', fieldColorsList) ? selectedMaterialInfo?.coilWeight : coilWeight;
      }
      materialInfo.coilWeight = coilWeight;
    }

    const noOfPCB = Math.round(arrayMatrixX * arrayMatrixY * materialInfo?.txtWindows);
    materialInfo.standardDeviation = noOfPCB;
    const factorFromBookup = this.configService.getLaminatesLookupData(materialInfo.partInnerDiameter, materialInfo.coilDiameter);
    let totalLaminateCost = 0,
      totalPrepregCost = 0;
    coreList?.forEach((core, index) => {
      const costForLaminate = this.getControlsByCore(materialInfo, PCBLayer.CoreCost);
      let laminateCost = this.shareService.isValidNumber(((factorFromBookup * Number(costForLaminate[index]?.value?.coreLength)) / noOfPCB) * Number(core?.value?.coreWeight));
      totalLaminateCost += Number(laminateCost);
      this.getControlsByCore(materialInfo, 5)[index]?.patchValue({
        coreWidth: laminateCost,
      });
    });

    prePregList?.forEach((prepreg, index) => {
      const costPrepreg = this.getControlsByCore(materialInfo, PCBLayer.PrepregCost);
      let prePregCost = this.shareService.isValidNumber(((factorFromBookup * Number(costPrepreg[index]?.value?.coreLength)) / noOfPCB) * Number(prepreg?.value?.coreWeight));
      totalPrepregCost += Number(prePregCost);
      this.getControlsByCore(materialInfo, 6)[index]?.patchValue({
        coreWidth: prePregCost,
      });
    });

    if (materialInfo.isMoldBoxHeightDirty && materialInfo.moldBoxHeight !== null) {
      materialInfo.moldBoxHeight = Number(materialInfo.moldBoxHeight);
    } else {
      let actualLaminatePrice = totalLaminateCost;
      if (materialInfo.moldBoxHeight !== null) {
        actualLaminatePrice = this.shareService.checkDirtyProperty('moldBoxHeight', fieldColorsList) ? selectedMaterialInfo?.moldBoxHeight : actualLaminatePrice;
      }
      materialInfo.moldBoxHeight = actualLaminatePrice;
    }

    if (materialInfo.isMoldBoxWidthDirty && materialInfo.moldBoxWidth !== null) {
      materialInfo.moldBoxWidth = Number(materialInfo.moldBoxWidth);
    } else {
      let actualPrepregPrice = totalPrepregCost;
      if (materialInfo.moldBoxWidth !== null) {
        actualPrepregPrice = this.shareService.checkDirtyProperty('moldBoxWidth', fieldColorsList) ? selectedMaterialInfo?.moldBoxWidth : actualPrepregPrice;
      }
      materialInfo.moldBoxWidth = actualPrepregPrice;
    }

    if (materialInfo.isMoldSandWeightDirty && !!materialInfo.moldSandWeight) {
      materialInfo.moldSandWeight = Number(materialInfo.moldSandWeight);
    } else {
      const calculatedUsage = this.shareService.isValidNumber((materialInfo.openingTime * materialInfo.colorantPer * materialInfo.eav) / 1000000);
      const consumableLookupPrice = this.configService.getConsumableLookupData(calculatedUsage, noOfCopperLayers);
      const panelSize = this.shareService.isValidNumber((Number(materialInfo.partInnerDiameter) * Number(materialInfo.coilDiameter) * 6.4516) / 10000 / Number(noOfPCB));
      let finalConsumablePrice = panelSize * (consumableLookupPrice / 7.26);
      if (materialInfo.moldSandWeight !== null) {
        materialInfo.moldSandWeight = this.shareService.checkDirtyProperty('moldSandWeight', fieldColorsList) ? selectedMaterialInfo?.moldSandWeight : finalConsumablePrice;
      }
      materialInfo.moldSandWeight = finalConsumablePrice;
    }

    let noOfHoleItems = 0,
      totalHoleQty = 0,
      platingSurface = 0;
    const defaultDrillEntries = this.configService.getDefaultDrillingEntries(pcbSizeX, pcbSizeY);
    drillingList?.forEach((drill, index) => {
      noOfHoleItems++;
      if (Number(drill?.value?.coreHeight) === 1) {
        let quantity = Math.round(defaultDrillEntries[index]?.quantity);
        let drillDiameter = defaultDrillEntries[index]?.drill;
        if (drill.controls['coreShape'].dirty) {
          quantity = drill.controls['coreShape'].value;
        } else {
          if (Number(drill?.value?.coreShape) !== null) {
            quantity = Number(drill?.value?.coreShape) > 0 && Number(drill?.value?.coreShape) !== quantity ? Number(drill?.value?.coreShape) : quantity;
          }
        }

        if (drill.controls['coreLength'].dirty) {
          drillDiameter = drill.controls['coreLength'].value;
        } else {
          if (Number(drill?.value?.coreLength) !== null) {
            drillDiameter = Number(drill?.value?.coreLength) > 0 && Number(drill?.value?.coreLength) !== drillDiameter ? Number(drill?.value?.coreLength) : drillDiameter;
          }
        }
        this.getControlsByCore(materialInfo, PCBLayer.Drilling)[index]?.patchValue({
          coreShape: quantity,
          coreLength: drillDiameter,
        });
        const holeQty = (Number(drill?.value?.coreVolume - Number(drill?.value?.coreLength)) / 0.05 + 1) * Number(drill?.value?.coreShape);
        const quantityValue = Number(drill?.value?.coreArea) === 2 ? holeQty : Number(drill?.value?.coreShape);
        const platedSurface = this.shareService.isValidNumber(Number(drill?.value?.coreLength) * Number(quantityValue) * 3.14 * (materialInfo?.totalCableLength / 1000));
        platingSurface += platedSurface;
        this.getControlsByCore(materialInfo, PCBLayer.Drilling)[index]?.patchValue({
          coreWeight: platedSurface,
          coreArea: Number(drill?.value?.coreArea),
        });
        totalHoleQty += Math.round(this.shareService.isValidNumber(quantityValue));
      }
    });
    materialInfo.stockCrossSectionWidth = noOfHoleItems;
    materialInfo.stockCrossSectionHeight = totalHoleQty;
    materialInfo.stockCrossSectionArea = platingSurface;

    const Surfaceareathicnkess = this.configService.getSurfaceFInishThickness(materialInfo?.secondaryCount);
    const Drillholeplatingarea = Surfaceareathicnkess * materialInfo.stockCrossSectionArea;
    const SMDAreaTop = pcbSizeX * pcbSizeY * (30 / 100);
    const SMDAreaBottom = pcbSizeX * pcbSizeY * (40 / 100);
    const TotalSurfacefinishareareauired = SMDAreaTop * Surfaceareathicnkess + SMDAreaBottom * Surfaceareathicnkess + Drillholeplatingarea;

    const WeightHASLLF =
      materialInfo?.secondaryCount === SurfaceFinish.HASLLF ? (((((((pcbSizeX * pcbSizeY) / 100) * Surfaceareathicnkess) / 10) * 2) / 10 + TotalSurfacefinishareareauired / 10000) * 5.75) / 1000 : 0;
    const WeightEnig =
      materialInfo?.secondaryCount === SurfaceFinish.ENIG ? (((((((pcbSizeX * pcbSizeY) / 100) * Surfaceareathicnkess) / 10) * 2) / 10 + TotalSurfacefinishareareauired / 1000) * 19.32) / 10000 : 0;
    const WeightImmersionTin =
      materialInfo?.secondaryCount === SurfaceFinish.ImmersionTin
        ? (((((((pcbSizeX * pcbSizeY) / 100) * Surfaceareathicnkess) / 10) * 2) / 10 + TotalSurfacefinishareareauired / 1000) * 5.75) / 10000
        : 0;
    const WeightImmersionSilver =
      materialInfo?.secondaryCount === SurfaceFinish.ImmersionSilver
        ? (((((((pcbSizeX * pcbSizeY) / 100) * Surfaceareathicnkess) / 10) * 2) / 10 + TotalSurfacefinishareareauired / 1000) * 10.53) / 1000
        : 0;
    const WeightOSP =
      materialInfo?.secondaryCount === SurfaceFinish.OSP ? (((((((pcbSizeX * pcbSizeY) / 100) * Surfaceareathicnkess) / 10) * 2) / 10 + TotalSurfacefinishareareauired / 1000) * 1.3) / 1000 : 0;
    const WeightofSurfacefinishrequired = WeightHASLLF + WeightEnig + WeightImmersionTin + WeightImmersionSilver + WeightOSP;
    const surfaceFinishCost = this.configService.getSurfaceFInishThickness(materialInfo?.secondaryCount, false, true);
    const SurfacefinishcostPCB = WeightofSurfacefinishrequired * surfaceFinishCost;
    materialInfo.cavityEnvelopHeight = SurfacefinishcostPCB;

    if (materialInfo.isPercentageOfReductionDirty && !!materialInfo.percentageOfReduction) {
      materialInfo.percentageOfReduction = Number(materialInfo.percentageOfReduction);
    } else {
      const outerLayerStartTickness = Number(this.configService.getCopperThicknessList()?.find((x) => x.id === Number(materialInfo?.partTickness))?.name);
      const outerLayerFinishTickness = Number(this.configService.getCopperThicknessList()?.find((x) => x.id === Number(materialInfo?.primerMatPrice))?.name);
      const olCopperStart = (outerLayerFinishTickness - outerLayerStartTickness) * 0.0035 * 2;
      const shortestSide = (materialInfo?.coilDiameter * 2.54) / 100;
      const longestSide = (materialInfo?.partInnerDiameter * 2.54) / 100;
      const panelArea = shortestSide * longestSide * 10000;
      const foilCost = (panelArea * olCopperStart * 8.93) / 1000;
      const noOfPCB = arrayMatrixX * arrayMatrixY * materialInfo?.txtWindows;
      const finalCoilCost = this.shareService.isValidNumber(Number(materialInfo?.typeOfWeld) > 2 ? (foilCost * 10.5) / noOfPCB : 0);
      if (materialInfo.percentageOfReduction !== null) {
        materialInfo.percentageOfReduction = this.shareService.checkDirtyProperty('percentageOfReduction', fieldColorsList) ? selectedMaterialInfo?.percentageOfReduction : finalCoilCost;
      }
      materialInfo.percentageOfReduction = finalCoilCost;
    }

    materialInfo.netMatCost =
      Number(materialInfo.moldBoxHeight) + Number(materialInfo.moldBoxWidth) + Number(materialInfo.moldSandWeight) + Number(materialInfo.percentageOfReduction) + SurfacefinishcostPCB;
    return new Observable((obs) => {
      obs.next(materialInfo);
    });
  }

  resetLists(layer) {
    for (const key in layer) {
      if (Object.prototype.hasOwnProperty.call(layer, key)) {
        layer[key] = 0;
      }
    }
  }
  generateStackupLayers(noOfCopperLayers: number, outerLayerTicknessId: number, solderMaskThickness, subFormArray, pregPregList = null, coreThicknessList = null, noOfCores: number): Layer[] {
    const layers: Layer[] = [];
    const thicknessList = this.configService.getCopperThicknessList();
    const outerLayerThickness = Number(thicknessList?.find((x) => x.id === outerLayerTicknessId)?.name);
    const coreList = subFormArray?.controls?.filter((x) => x.value?.noOfCore === PCBLayer.Core);
    const prePregList = subFormArray?.controls?.filter((x) => x.value?.noOfCore === PCBLayer.Prepreg);
    let ppCount = pregPregList?.length > 0 ? 1 : 0;
    let cCount = coreThicknessList?.length > 0 ? 1 : 0;
    let cIndex = 0;

    if (noOfCores <= 0) {
      return layers;
    }

    const coreThicknessSequence: (number | undefined)[] = new Array(noOfCores);
    const coreGroups = coreList.map((core) => ({
      thickness: Number(coreThicknessList?.find((x) => x.electronicsMaterialMasterId === core?.value?.coreWidth)?.coreThickness),
      count: Number(core.value?.coreWeight || 0),
    }));
    const totalCoreCount = coreGroups.reduce((sum, g) => sum + g.count, 0);
    const maxFill = Math.min(noOfCores, totalCoreCount);
    if (coreGroups.length === 1) {
      const group = coreGroups[0];
      const fillCount = Math.min(group.count, maxFill);

      for (let i = 0; i < fillCount; i++) {
        coreThicknessSequence[i] = group.thickness;
      }
    } else if (coreGroups.length > 1 && maxFill > 0) {
      const centerGroup = coreGroups.reduce((a, b) => (a.count <= b.count ? a : b));
      const centerCount = Math.min(centerGroup.count, maxFill);
      const start = Math.floor((maxFill - centerCount) / 2);
      for (let i = 0; i < centerCount; i++) {
        coreThicknessSequence[start + i] = centerGroup.thickness;
      }
      let left = start - 1;
      let right = start + centerCount;

      coreGroups
        .filter((g) => g !== centerGroup)
        .forEach((group) => {
          let remaining = group.count;
          while (remaining > 0 && (left >= 0 || right < maxFill)) {
            if (left >= 0 && remaining > 0) {
              coreThicknessSequence[left--] = group.thickness;
              remaining--;
            }
            if (right < maxFill && remaining > 0) {
              coreThicknessSequence[right++] = group.thickness;
              remaining--;
            }
          }
        });
    }

    let ppValue = 0;
    const ppLayerCount = noOfCopperLayers > 2 ? Math.ceil((noOfCopperLayers - 1) / 2) : 0;
    if (prePregList?.length > 0) {
      const { totalPP, coreWeightTotal } = prePregList.reduce(
        (acc, pp) => {
          const coreWeight = Number(pp.value?.coreWeight || 0);
          const coreArea = Number(pp.value?.coreArea || 0);
          acc.totalPP += coreWeight * coreArea;
          acc.coreWeightTotal += coreWeight;
          return acc;
        },
        { totalPP: 0, coreWeightTotal: 0 }
      );
      ppValue = coreWeightTotal > 0 && ppLayerCount > 0 ? Math.round(totalPP / ppLayerCount) : 0;
    }

    layers.push({
      name: 'M1',
      type: 'M',
      value: solderMaskThickness,
      color: 'green',
    });
    let lMax = noOfCopperLayers === 1 ? 1 : noOfCopperLayers;
    for (let l = 1; l <= lMax; l++) {
      layers.push({
        name: `L${l}`,
        type: 'L',
        value: outerLayerThickness * 35,
        color: 'red',
      });

      if (l < lMax) {
        if (noOfCopperLayers === 2) {
          layers.push({
            name: `C${cCount}`,
            type: 'C',
            value: coreThicknessSequence[cIndex],
            color: 'grey',
          });
          cCount++;
          cIndex++;
        } else if (l % 2 === 1) {
          layers.push({
            name: `PP${ppCount}`,
            type: 'PP',
            value: ppValue,
            color: 'green',
          });
          ppCount++;
        } else {
          layers.push({
            name: `C${cCount}`,
            type: 'C',
            value: coreThicknessSequence[cIndex],
            color: 'grey',
          });
          cCount++;
          cIndex++;
        }
      }
    }
    if (noOfCopperLayers === 1) {
      layers.push({
        name: 'C1',
        type: 'C',
        value: coreThicknessSequence[0],
        color: 'grey',
      });
    } else {
      layers.push({
        name: 'M2',
        type: 'M',
        value: solderMaskThickness,
        color: 'green',
      });
    }
    return layers;
  }
}
