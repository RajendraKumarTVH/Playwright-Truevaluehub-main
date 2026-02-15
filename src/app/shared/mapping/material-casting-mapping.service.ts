import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { FormBuilder, Validators } from '@angular/forms';
import { MaterialInfoDto } from '../models';
import { SubProcessType } from 'src/app/modules/costing/costing.config';

@Injectable({
  providedIn: 'root',
})
export class MaterialCastingMappingService {
  public defaultNetWeightPercentage = 5;
  public defaultRunnerRiserPercentage = 60;
  public defaultOxidationLossWeightPercentage = 6;
  public defaultSandRecoveryPercentage = 2;

  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService
  ) {}

  getCastingMaterialFormFields(materialInfoList, conversionValue, isEnableUnitConversion) {
    return {
      length: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimX), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      width: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimY), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      height: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimZ), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      matPrice: [0, [Validators.required]],
      maxWallthick: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].wallThickessMm) : 0, [Validators.required]],
      wallAverageThickness: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].wallAverageThickness) : 0, [Validators.required]],
      standardDeviation: 0,
      projectedArea: 0,
      partTickness: 0,
      partSurfaceArea: 0,
      partProjectArea: [0, [Validators.required]],
      partVolume: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimVolume), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      netWeight: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].netWeight) : 0, [Validators.required]],
      netWeightPercentage: [this.defaultNetWeightPercentage],
      moldSandWeight: [0],
      // noOfCavities: [1, [Validators.required]],
      runnerRiser: [0],
      runnerRiserPercentage: [this.defaultRunnerRiserPercentage],
      oxidationLossWeight: [0],
      oxidationLossWeightPercentage: [this.defaultOxidationLossWeightPercentage],
      sandRecovery: [0],
      sandRecoveryPercentage: [this.defaultSandRecoveryPercentage],
      scrapWeight: [0, [Validators.required]],
      pouringWeight: [0],
      grossWeight: [0, [Validators.required]],
      totalPouringWeight: [0],
      machiningScrapPrice: [0],
      grossMaterialCost: [0, [Validators.required]],
      scrapRecovery: [90, [Validators.required]],
      scrapRecCost: [0, [Validators.required]],
      netMaterialCost: [{ value: 0, disabled: true }],
      moldBoxLength: [0],
      moldBoxWidth: [0],
      moldBoxHeight: [0],
      sandWeightAfterRecovery: [0],
      sandMetalRatio: '0:0',
      primaryCount: [0],
      primaryWeight: [0],
      primaryPrice: [0],
      secondaryCount: [0],
      secondaryWeight: [0],
      secondaryPrice: [0],
      totalSandVolume: [0],
      totalCoreWeight: [0],
      totalMaterialCost: [0],
      materialPkgs: this.formbuilder.array([]),
    };
  }

  castingMaterialFormFieldsReset() {
    return {
      length: 0,
      width: 0,
      height: 0,
      matPrice: 0,
      maxWallthick: 0,
      wallAverageThickness: 0,
      standardDeviation: 0,
      projectedArea: 0,
      partTickness: 0,
      partSurfaceArea: 0,
      partProjectArea: 0,
      partVolume: 0,
      netWeight: 0,
      netWeightPercentage: this.defaultNetWeightPercentage,
      moldSandWeight: 0,
      // noOfCavities: 1,
      runnerRiser: 0,
      runnerRiserPercentage: this.defaultRunnerRiserPercentage,
      oxidationLossWeight: 0,
      oxidationLossWeightPercentage: this.defaultOxidationLossWeightPercentage,
      sandRecovery: 0,
      sandRecoveryPercentage: this.defaultSandRecoveryPercentage,
      scrapWeight: 0,
      pouringWeight: 0,
      grossWeight: 0,
      totalPouringWeight: 0,
      machiningScrapPrice: 0,
      grossMaterialCost: 0,
      scrapRecovery: 0,
      scrapRecCost: 0,
      netMaterialCost: 0,
      moldBoxLength: 0,
      moldBoxWidth: 0,
      moldBoxHeight: 0,
      sandWeightAfterRecovery: 0,
      sandMetalRatio: '0:0',
      primaryCount: 0,
      primaryWeight: 0,
      primaryPrice: 0,
      secondaryCount: 0,
      secondaryWeight: 0,
      secondaryPrice: 0,
      totalSandVolume: 0,
      totalCoreWeight: 0,
      totalMaterialCost: 0,
      // materialPkgs: this.formbuilder.array([]),
    };
  }

  castingMaterialFormPatch(materialInfo: MaterialInfoDto, conversionValue, isEnableUnitConversion, totalSandVolume) {
    return {
      length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimX), conversionValue, isEnableUnitConversion),
      width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimY), conversionValue, isEnableUnitConversion),
      height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimZ), conversionValue, isEnableUnitConversion),
      matPrice: this.sharedService.isValidNumber(materialInfo?.materialPricePerKg) || this.sharedService.isValidNumber(Number(materialInfo?.materialMarketData?.price)),
      maxWallthick: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.wallThickessMm), conversionValue, isEnableUnitConversion),
      wallAverageThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.wallAverageThickness), conversionValue, isEnableUnitConversion),
      standardDeviation: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.standardDeviation), conversionValue, isEnableUnitConversion),
      projectedArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.projectedArea), conversionValue, isEnableUnitConversion),
      partTickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partTickness), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partSurfaceArea), conversionValue, isEnableUnitConversion),
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimArea), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimVolume), conversionValue, isEnableUnitConversion),
      netWeight: this.sharedService.isValidNumber(materialInfo?.netWeight) || 0,
      netWeightPercentage: this.sharedService.isValidNumber(materialInfo?.netWeightPercentage),
      // noOfCavities: materialInfo.noOfCavities,
      runnerRiser: this.sharedService.isValidNumber(materialInfo?.runnerRiser) || 0,
      runnerRiserPercentage: this.sharedService.isValidNumber(materialInfo?.runnerRiserPercentage),
      oxidationLossWeight: this.sharedService.isValidNumber(materialInfo?.oxidationLossWeight) || 0,
      oxidationLossWeightPercentage: this.sharedService.isValidNumber(materialInfo?.oxidationLossWeightPercentage),
      sandRecovery: this.sharedService.isValidNumber(materialInfo?.sandRecovery) || 0,
      sandRecoveryPercentage: this.sharedService.isValidNumber(materialInfo?.sandRecoveryPercentage),
      scrapWeight: this.sharedService.isValidNumber(Number(materialInfo.scrapWeight)),
      grossWeight: this.sharedService.isValidNumber(Number(materialInfo.grossWeight)),
      grossMaterialCost: this.sharedService.isValidNumber(Number(materialInfo.materialCostPart)),
      scrapRecCost: this.sharedService.isValidNumber(Number(materialInfo.scrapRecCost)),
      pouringWeight: this.sharedService.isValidNumber(materialInfo?.pouringWeight) || 0,
      totalPouringWeight: this.sharedService.isValidNumber(materialInfo?.totalPouringWeight) || 0,
      machiningScrapPrice: this.sharedService.isValidNumber(materialInfo?.machiningScrapPrice) || 0,
      scrapRecovery: materialInfo.scrapRecovery || 90,
      netMaterialCost: this.sharedService.isValidNumber(materialInfo?.netMatCost),
      moldBoxLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.moldBoxLength) || 0, conversionValue, isEnableUnitConversion),
      moldBoxHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.moldBoxHeight) || 0, conversionValue, isEnableUnitConversion),
      moldBoxWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.moldBoxWidth) || 0, conversionValue, isEnableUnitConversion),
      moldSandWeight: this.sharedService.isValidNumber(materialInfo?.moldSandWeight) || 0,
      sandWeightAfterRecovery: this.sharedService.isValidNumber(materialInfo?.sandWeightAfterRecovery) || 0,
      sandMetalRatio: `1:${materialInfo?.sandMetalRatio || 0}`,
      primaryCount: this.sharedService.isValidNumber(materialInfo?.primaryCount) || 0,
      primaryWeight: this.sharedService.isValidNumber(materialInfo?.primaryWeight) || 0,
      primaryPrice: this.sharedService.isValidNumber(materialInfo?.primaryPrice) || 0,
      secondaryCount: this.sharedService.isValidNumber(materialInfo?.secondaryCount) || 0,
      secondaryWeight: this.sharedService.isValidNumber(materialInfo?.secondaryWeight) || 0,
      secondaryPrice: this.sharedService.isValidNumber(materialInfo?.secondaryPrice) || 0,
      totalSandVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.totalSandVolume) || totalSandVolume, conversionValue, isEnableUnitConversion),
      totalCoreWeight: this.sharedService.isValidNumber(materialInfo?.totalCoreWeight) || 0,
    };
  }

  materialFormAssignValue(materialInfo: MaterialInfoDto, castingMaterial, conversionValue, isEnableUnitConversion) {
    materialInfo.dimX = this.sharedService.convertUomToSaveAndCalculation(Number(castingMaterial['length'].value), conversionValue, isEnableUnitConversion);
    materialInfo.dimY = this.sharedService.convertUomToSaveAndCalculation(Number(castingMaterial['width'].value), conversionValue, isEnableUnitConversion);
    materialInfo.dimZ = this.sharedService.convertUomToSaveAndCalculation(Number(castingMaterial['height'].value), conversionValue, isEnableUnitConversion);
    materialInfo.wallThickessMm = this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(castingMaterial['maxWallthick'].value), conversionValue, isEnableUnitConversion);
    materialInfo.wallAverageThickness = this.sharedService.convertUomToSaveAndCalculation(
      this.sharedService.isValidNumber(castingMaterial['wallAverageThickness'].value),
      conversionValue,
      isEnableUnitConversion
    );
    materialInfo.standardDeviation = this.sharedService.convertUomToSaveAndCalculation(
      this.sharedService.isValidNumber(castingMaterial['standardDeviation'].value),
      conversionValue,
      isEnableUnitConversion
    );
    materialInfo.projectedArea = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['projectedArea'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partTickness = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['partTickness'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['partSurfaceArea'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['partProjectArea'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(castingMaterial['partVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.netWeight = castingMaterial['netWeight'].value;
    materialInfo.netWeightPercentage = castingMaterial['netWeightPercentage'].value;
    materialInfo.moldSandWeight = castingMaterial['moldSandWeight'].value;
    // materialInfo.noOfCavities = Number(castingMaterial['noOfCavities'].value);
    materialInfo.runnerRiser = castingMaterial['runnerRiser'].value;
    materialInfo.runnerRiserPercentage = castingMaterial['runnerRiserPercentage'].value;
    materialInfo.oxidationLossWeight = castingMaterial['oxidationLossWeight'].value;
    materialInfo.oxidationLossWeightPercentage = castingMaterial['oxidationLossWeightPercentage'].value;
    materialInfo.sandRecovery = castingMaterial['sandRecovery'].value;
    materialInfo.sandRecoveryPercentage = castingMaterial['sandRecoveryPercentage'].value;
    materialInfo.scrapWeight = castingMaterial['scrapWeight'].value;
    materialInfo.pouringWeight = castingMaterial['pouringWeight'].value;
    materialInfo.grossWeight = castingMaterial['grossWeight'].value;
    materialInfo.totalPouringWeight = castingMaterial['totalPouringWeight'].value;
    materialInfo.machiningScrapPrice = castingMaterial['machiningScrapPrice'].value;
    materialInfo.scrapRecovery = Number(castingMaterial['scrapRecovery'].value);
    materialInfo.moldBoxLength = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['moldBoxLength'].value, conversionValue, isEnableUnitConversion);
    materialInfo.moldBoxWidth = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['moldBoxWidth'].value, conversionValue, isEnableUnitConversion);
    materialInfo.moldBoxHeight = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['moldBoxHeight'].value, conversionValue, isEnableUnitConversion);
    materialInfo.sandWeightAfterRecovery = castingMaterial['sandWeightAfterRecovery'].value;
    materialInfo.primaryCount = castingMaterial['primaryCount'].value;
    materialInfo.primaryWeight = castingMaterial['primaryWeight'].value;
    materialInfo.primaryPrice = castingMaterial['primaryPrice'].value;
    materialInfo.secondaryCount = castingMaterial['secondaryCount'].value;
    materialInfo.secondaryWeight = castingMaterial['secondaryWeight'].value;
    materialInfo.secondaryPrice = castingMaterial['secondaryPrice'].value;
    materialInfo.totalSandVolume = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['totalSandVolume'].value, conversionValue, isEnableUnitConversion);
    materialInfo.totalCoreWeight = castingMaterial['totalCoreWeight'].value;
  }

  materialDirtyCheck(materialInfo, castingMaterial) {
    // materialInfo.dimX = this.sharedService.convertUomToSaveAndCalculation(Number(castingMaterial['length'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.dimY = this.sharedService.convertUomToSaveAndCalculation(Number(castingMaterial['width'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.dimZ = this.sharedService.convertUomToSaveAndCalculation(Number(castingMaterial['height'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.wallThickessMm = this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(castingMaterial['maxWallthick'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.wallAverageThickness = this.sharedService.convertUomToSaveAndCalculation(
    //   this.sharedService.isValidNumber(castingMaterial['wallAverageThickness'].value),
    //   conversionValue,
    //   isEnableUnitConversion
    // );
    // materialInfo.standardDeviation = this.sharedService.convertUomToSaveAndCalculation(
    //   this.sharedService.isValidNumber(castingMaterial['standardDeviation'].value),
    //   conversionValue,
    //   isEnableUnitConversion
    // );
    // materialInfo.projectedArea = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['projectedArea'].value, conversionValue, isEnableUnitConversion);
    // materialInfo.partTickness = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['partTickness'].value, conversionValue, isEnableUnitConversion);
    // materialInfo.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['partSurfaceArea'].value, conversionValue, isEnableUnitConversion);
    // materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['partProjectArea'].value, conversionValue, isEnableUnitConversion);
    // materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(castingMaterial['partVolume'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.netWeight = castingMaterial['netWeight'].value;
    // materialInfo.netWeightPercentage = castingMaterial['netWeightPercentage'].value;
    // materialInfo.moldSandWeight = castingMaterial['moldSandWeight'].value;
    // // materialInfo.noOfCavities = Number(castingMaterial['noOfCavities'].value);
    // materialInfo.runnerRiser = castingMaterial['runnerRiser'].value;
    // materialInfo.runnerRiserPercentage = castingMaterial['runnerRiserPercentage'].value;
    // materialInfo.oxidationLossWeight = castingMaterial['oxidationLossWeight'].value;
    // materialInfo.oxidationLossWeightPercentage = castingMaterial['oxidationLossWeightPercentage'].value;
    // materialInfo.sandRecovery = castingMaterial['sandRecovery'].value;
    // materialInfo.sandRecoveryPercentage = castingMaterial['sandRecoveryPercentage'].value;
    // materialInfo.scrapWeight = castingMaterial['scrapWeight'].value;
    // materialInfo.pouringWeight = castingMaterial['pouringWeight'].value;
    // materialInfo.grossWeight = castingMaterial['grossWeight'].value;
    // materialInfo.totalPouringWeight = castingMaterial['totalPouringWeight'].value;
    // materialInfo.machiningScrapPrice = castingMaterial['machiningScrapPrice'].value;
    // materialInfo.scrapRecovery = Number(castingMaterial['scrapRecovery'].value);
    // materialInfo.moldBoxLength = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['moldBoxLength'].value, conversionValue, isEnableUnitConversion);
    // materialInfo.moldBoxWidth = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['moldBoxWidth'].value, conversionValue, isEnableUnitConversion);
    // materialInfo.moldBoxHeight = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['moldBoxHeight'].value, conversionValue, isEnableUnitConversion);
    // materialInfo.sandWeightAfterRecovery = castingMaterial['sandWeightAfterRecovery'].value;
    // materialInfo.primaryCount = castingMaterial['primaryCount'].value;
    // materialInfo.primaryWeight = castingMaterial['primaryWeight'].value;
    // materialInfo.primaryPrice = castingMaterial['primaryPrice'].value;
    // materialInfo.secondaryCount = castingMaterial['secondaryCount'].value;
    // materialInfo.secondaryWeight = castingMaterial['secondaryWeight'].value;
    // materialInfo.secondaryPrice = castingMaterial['secondaryPrice'].value;
    // materialInfo.totalSandVolume = this.sharedService.convertUomToSaveAndCalculation(castingMaterial['totalSandVolume'].value, conversionValue, isEnableUnitConversion);
    // materialInfo.totalCoreWeight = castingMaterial['totalCoreWeight'].value;

    materialInfo.isMatPriceDirty = castingMaterial['matPrice'].dirty;
    materialInfo.isAvgWallthickDirty = castingMaterial['wallAverageThickness'].dirty;
    materialInfo.isStdDeviationDirty = castingMaterial['standardDeviation'].dirty;
    materialInfo.isProjectedAreaDirty = castingMaterial['projectedArea'].dirty;
    materialInfo.ispartTicknessDirty = castingMaterial['partTickness'].dirty;
    materialInfo.isPartSurfaceAreaDirty = castingMaterial['partSurfaceArea'].dirty;
    materialInfo.isPartProjectedAreaDirty = castingMaterial['partProjectArea'].dirty;
    materialInfo.isPartVolumeDirty = castingMaterial['partVolume'].dirty;
    Number(materialInfo.secondaryProcessId) !== SubProcessType.PatternWax && (materialInfo.isNetweightDirty = castingMaterial['netWeight'].dirty);
    materialInfo.isNetweightPercentageDirty = castingMaterial['netWeightPercentage'].dirty;
    materialInfo.isMoldSandWeightDirty = castingMaterial['moldSandWeight'].dirty;
    // materialInfo.isNoOfCavitiesDirty = castingMaterial['noOfCavities'].dirty;
    materialInfo.isRunnerRiserDirty = castingMaterial['runnerRiser'].dirty;
    materialInfo.isRunnerRiserPercentageDirty = castingMaterial['runnerRiserPercentage'].dirty;
    materialInfo.isOxidationLossWeightDirty = castingMaterial['oxidationLossWeight'].dirty;
    materialInfo.isOxidationLossWeightPercentageDirty = castingMaterial['oxidationLossWeightPercentage'].dirty;
    materialInfo.isScrapWeightDirty = castingMaterial['scrapWeight'].dirty;
    materialInfo.isPouringWeightDirty = castingMaterial['pouringWeight'].dirty;
    materialInfo.isGrossWeightCoilDirty = castingMaterial['grossWeight'].dirty;
    materialInfo.isTotalPouringWeightDirty = castingMaterial['totalPouringWeight'].dirty;
    materialInfo.isMachiningScrapPriceDirty = castingMaterial['machiningScrapPrice'].dirty;
    materialInfo.isScrapRecoveryDirty = castingMaterial['scrapRecovery'].dirty;
    materialInfo.isSandRecoveryDirty = castingMaterial['sandRecovery'].dirty;
    materialInfo.isSandRecoveryPercentageDirty = castingMaterial['sandRecoveryPercentage'].dirty;
    materialInfo.isMoldBoxLengthDirty = castingMaterial['moldBoxLength'].dirty;
    materialInfo.isMoldBoxWidthDirty = castingMaterial['moldBoxWidth'].dirty;
    materialInfo.isMoldBoxHeightDirty = castingMaterial['moldBoxHeight'].dirty;
    materialInfo.isSandWeightAfterRecoveryDirty = castingMaterial['sandWeightAfterRecovery'].dirty;
    materialInfo.isPrimaryCountDirty = castingMaterial['primaryCount'].dirty;
    materialInfo.isPrimaryWeightDirty = castingMaterial['primaryWeight'].dirty;
    materialInfo.isPrimaryPriceDirty = castingMaterial['primaryPrice'].dirty;
    materialInfo.isSecondaryCountDirty = castingMaterial['secondaryCount'].dirty;
    materialInfo.isSecondaryWeightDirty = castingMaterial['secondaryWeight'].dirty;
    materialInfo.isSecondaryPriceDirty = castingMaterial['secondaryPrice'].dirty;
    materialInfo.isTotalSandVolumeDirty = castingMaterial['totalSandVolume'].dirty;
    materialInfo.isTotalCoreWeightDirty = castingMaterial['totalCoreWeight'].dirty;
  }

  castingMaterialFormPatchResults(result: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      matPrice: this.sharedService.isValidNumber(Number(result.materialPricePerKg)),
      partTickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partTickness), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.partSurfaceArea), conversionValue, isEnableUnitConversion),
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partProjectedArea)), conversionValue, isEnableUnitConversion),
      netWeight: this.sharedService.isValidNumber(Number(result.netWeight)),
      netWeightPercentage: this.sharedService.isValidNumber(Number(result.netWeightPercentage)),
      scrapWeight: this.sharedService.isValidNumber(Number(result.scrapWeight)),
      grossWeight: this.sharedService.isValidNumber(Number(result.grossWeight)),
      grossMaterialCost: this.sharedService.isValidNumber(Number(result.materialCostPart)),
      netMaterialCost: this.sharedService.isValidNumber(Number(result.netMatCost)),
      scrapRecCost: this.sharedService.isValidNumber(Number(result.scrapRecCost)),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partVolume)), conversionValue, isEnableUnitConversion),
      // noOfCavities: this.sharedService.isValidNumber(Number(result?.noOfCavities)),
      scrapRecovery: this.sharedService.isValidNumber(Number(result?.scrapRecovery)),
      totalPouringWeight: this.sharedService.isValidNumber(Number(result?.totalPouringWeight)),
      pouringWeight: this.sharedService.isValidNumber(Number(result?.pouringWeight)),
      oxidationLossWeight: this.sharedService.isValidNumber(Number(result?.oxidationLossWeight)),
      oxidationLossWeightPercentage: this.sharedService.isValidNumber(Number(result?.oxidationLossWeightPercentage)),
      runnerRiser: this.sharedService.isValidNumber(Number(result?.runnerRiser)),
      runnerRiserPercentage: this.sharedService.isValidNumber(Number(result?.runnerRiserPercentage)),
      machiningScrapPrice: this.sharedService.isValidNumber(Number(result?.machiningScrapPrice)),
      sandRecovery: this.sharedService.isValidNumber(result?.sandRecovery),
      sandRecoveryPercentage: this.sharedService.isValidNumber(result?.sandRecoveryPercentage),
      moldBoxLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.moldBoxLength), conversionValue, isEnableUnitConversion),
      moldBoxHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.moldBoxHeight), conversionValue, isEnableUnitConversion),
      moldBoxWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.moldBoxWidth), conversionValue, isEnableUnitConversion),
      moldSandWeight: this.sharedService.isValidNumber(result?.moldSandWeight),
      sandWeightAfterRecovery: this.sharedService.isValidNumber(result?.sandWeightAfterRecovery),
      sandMetalRatio: `1:${result?.sandMetalRatio}`,
      primaryCount: this.sharedService.isValidNumber(result?.primaryCount),
      primaryWeight: this.sharedService.isValidNumber(result?.primaryWeight),
      primaryPrice: this.sharedService.isValidNumber(result?.primaryPrice),
      secondaryCount: this.sharedService.isValidNumber(result?.secondaryCount),
      secondaryWeight: this.sharedService.isValidNumber(result?.secondaryWeight),
      secondaryPrice: this.sharedService.isValidNumber(result?.secondaryPrice),
      totalCoreWeight: this.sharedService.isValidNumber(Number(result?.totalCoreWeight)),
      totalSandVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.totalSandVolume), conversionValue, isEnableUnitConversion),
    };
  }

  castingMaterialPayload(castingMaterial, conversionValue, isEnableUnitConversion) {
    return {
      dimX: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['length'].value || 0, conversionValue, isEnableUnitConversion),
      dimY: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['width'].value || 0, conversionValue, isEnableUnitConversion),
      dimZ: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['height'].value || 0, conversionValue, isEnableUnitConversion),
      materialPricePerKg: castingMaterial['matPrice'].value || 0,
      wallThickFactor: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['wallAverageThickness'].value || 0, conversionValue, isEnableUnitConversion),
      wallAverageThickness: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['wallAverageThickness'].value || 0, conversionValue, isEnableUnitConversion),
      wallThickessMm: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['maxWallthick'].value || 0, conversionValue, isEnableUnitConversion),
      standardDeviation: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['standardDeviation'].value || 0, conversionValue, isEnableUnitConversion),
      projectedArea: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['projectedArea'].value || 0, conversionValue, isEnableUnitConversion),
      partTickness: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['partTickness'].value || 0, conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['partSurfaceArea'].value || 0, conversionValue, isEnableUnitConversion),
      partProjectedArea: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['partProjectArea'].value, conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['partVolume'].value, conversionValue, isEnableUnitConversion),
      netWeight: castingMaterial['netWeight'].value || 0,
      netWeightPercentage: castingMaterial['netWeightPercentage'].value,
      moldSandWeight: castingMaterial['moldSandWeight'].value || 0,
      // noOfCavities: castingMaterial['noOfCavities'].value || 1,
      runnerRiser: castingMaterial['runnerRiser'].value || 0,
      runnerRiserPercentage: castingMaterial['runnerRiserPercentage'].value,
      oxidationLossWeight: castingMaterial['oxidationLossWeight'].value || 0,
      oxidationLossWeightPercentage: castingMaterial['oxidationLossWeightPercentage'].value,
      sandRecovery: Number(castingMaterial['sandRecovery'].value) || 0,
      sandRecoveryPercentage: Number(castingMaterial['sandRecoveryPercentage'].value),
      scrapWeight: castingMaterial['scrapWeight'].value || 0,
      pouringWeight: castingMaterial['pouringWeight'].value || 0,
      grossWeight: castingMaterial['grossWeight'].value || 0,
      totalPouringWeight: castingMaterial['totalPouringWeight'].value || 0,
      machiningScrapPrice: castingMaterial['machiningScrapPrice'].value || 0,
      materialCostPart: castingMaterial['grossMaterialCost'].value || 0,
      scrapRecovery: castingMaterial['scrapRecovery'].value || 90,
      scrapRecCost: castingMaterial['scrapRecCost'].value || 0,
      netMatCost: castingMaterial['netMaterialCost'].value || 0,
      moldBoxLength: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['moldBoxLength'].value || 0, conversionValue, isEnableUnitConversion),
      moldBoxHeight: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['moldBoxHeight'].value || 0, conversionValue, isEnableUnitConversion),
      moldBoxWidth: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['moldBoxWidth'].value || 0, conversionValue, isEnableUnitConversion),
      sandWeightAfterRecovery: castingMaterial['sandWeightAfterRecovery'].value || 0,
      primaryCount: castingMaterial['primaryCount'].value || 0,
      primaryWeight: castingMaterial['primaryWeight'].value || 0,
      primaryPrice: castingMaterial['primaryPrice'].value || 0,
      secondaryCount: castingMaterial['secondaryCount'].value || 0,
      secondaryWeight: castingMaterial['secondaryWeight'].value || 0,
      secondaryPrice: castingMaterial['secondaryPrice'].value || 0,
      totalSandVolume: this.sharedService.convertUomToSaveAndCalculation(castingMaterial['totalSandVolume'].value || 0, conversionValue, isEnableUnitConversion),
      totalCoreWeight: castingMaterial['totalCoreWeight'].value || 0,
    };
  }

  setSecondaryProcessTypeFlags(secondaryProcessId: number) {
    return {
      IsProcessTypePouring: secondaryProcessId === SubProcessType.MetalForPouring,
      IsProcessTypeSandForCore: secondaryProcessId === SubProcessType.SandForCore,
      IsProcessTypeSandForMold: secondaryProcessId === SubProcessType.SandForMold,
      IsProcessTypePatternWax: secondaryProcessId === SubProcessType.PatternWax,
      IsProcessTypeSlurryCost: secondaryProcessId === SubProcessType.SlurryCost,
      IsProcessTypeZirconSand: secondaryProcessId === SubProcessType.ZirconSand,
    };
  }
}
