import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MaterialInfoDto } from '../models';
import { MachiningTypes } from 'src/app/modules/costing/costing.config';

@Injectable({
  providedIn: 'root',
})
export class MaterialMachiningConfigService {
  public machiningFlags = {
    isRod: false,
    isTube: false,
    isSquareBar: false,
    isRectangularBar: false,
    isHexagonalBar: false,
    isBlock: false,
    isWire: false,
    isOtherShapes: false,
    isLAngle: false,
    isIBeam: false,
    isChannel: false,
    isWBeams: false,
    isHss: false,
  };

  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService
  ) {}

  getMachiningFlags(processValueId: number) {
    return {
      isRod: processValueId === MachiningTypes.Rod ? true : false,
      isTube: processValueId === MachiningTypes.Tube ? true : false,
      isSquareBar: processValueId === MachiningTypes.SquareBar ? true : false,
      isRectangularBar: processValueId === MachiningTypes.RectangularBar ? true : false,
      isHexagonalBar: processValueId === MachiningTypes.HexagonalBar ? true : false,
      isBlock: processValueId === MachiningTypes.Block ? true : false,
      isWire: processValueId === MachiningTypes.Wire ? true : false,
      isOtherShapes: processValueId === MachiningTypes.OtherShapes ? true : false,
      isLAngle: processValueId === MachiningTypes.LAngle ? true : false,
      isIBeam: processValueId === MachiningTypes.IBeam ? true : false,
      isChannel: processValueId === MachiningTypes.Channel ? true : false,
      isWBeams: processValueId === MachiningTypes.WBeams ? true : false,
      isHss: processValueId === MachiningTypes.HSS ? true : false,
    };
  }

  getMachiningAllowance() {
    return [
      { start: 0, end: 20, machineAllowance: 2, taperAllowance: 0.5, bladeAllowance: 2, barLengthMachineAllowance: 1, lengthAllowance: 3.5 },
      { start: 21, end: 40, machineAllowance: 3, taperAllowance: 0.8, bladeAllowance: 2, barLengthMachineAllowance: 1, lengthAllowance: 3.8 },
      { start: 41, end: 65, machineAllowance: 4, taperAllowance: 1, bladeAllowance: 2, barLengthMachineAllowance: 1, lengthAllowance: 4 },
      { start: 66, end: 100, machineAllowance: 5, taperAllowance: 1.5, bladeAllowance: 2.5, barLengthMachineAllowance: 2, lengthAllowance: 6 },
      { start: 101, end: 150, machineAllowance: 8, taperAllowance: 3, bladeAllowance: 3, barLengthMachineAllowance: 3, lengthAllowance: 9 },
      { start: 151, end: 1000000, machineAllowance: 12, taperAllowance: 6, bladeAllowance: 3.5, barLengthMachineAllowance: 3, lengthAllowance: 12.5 },
    ];
  }

  getFormFields(materialInfoList, conversionValue, isEnableUnitConversion) {
    return {
      partOuterDiameter: [0],
      partInnerDiameter: [0],
      partLength: [0],
      maxWallthick: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].wallThickessMm), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      partWidth: [0],
      partHeight: [0],
      stockDiameter: [0],
      stockLength: [0],
      stockOuterDiameter: [0],
      stockInnerDiameter: [0],
      stockCrossSectionWidth: [0],
      stockCrossSectionHeight: [0],
      stockHexSideDimension: [0],
      enterStartEndScrapLength: [0, [Validators.required]],
      blockLength: [0],
      blockWidth: [0],
      blockHeight: [0],
      stockCrossSectionArea: [0],
      partsPerCoil: [0, [Validators.required]],
      cuttingAllowance: [this.sharedService.convertUomInUI(0.1, conversionValue, isEnableUnitConversion)],
      // length: [materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimX), conversionValue, isEnableUnitConversion) : 0, [Validators.required]],
      // width: [materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimY), conversionValue, isEnableUnitConversion) : 0, [Validators.required]],
      // height: [materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimZ), conversionValue, isEnableUnitConversion) : 0, [Validators.required]],
      // stockType: [1],
      partProjectArea: [0, [Validators.required]],
      partVolume: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimVolume), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      // inputBilletDiameter: [0],
      // ultimateTensileStrength: [0],
      netWeight: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].netWeight) : 0, [Validators.required]],
      utilisation: [0, [Validators.required]],
      partSurfaceArea: [0],
      netMaterialCost: [{ value: 0, disabled: true }],
      volumeDiscountPer: [0],
      scrapWeight: [0, [Validators.required]],
      grossWeight: [0, [Validators.required]],
      grossMaterialCost: [0, [Validators.required]],
      scrapRecCost: [0, [Validators.required]],
      scrapRecovery: [90, [Validators.required]],
      coilLength: [0, [Validators.required]],
      coilWeight: [0, [Validators.required]],
      matPriceGross: [0],
    };
  }
  formFieldsReset(conversionValue, isEnableUnitConversion) {
    return {
      partOuterDiameter: 0,
      partInnerDiameter: 0,
      partLength: 0,
      maxWallthick: 0,
      partWidth: 0,
      partHeight: 0,
      stockDiameter: 0,
      stockLength: 0,
      stockOuterDiameter: 0,
      stockInnerDiameter: 0,
      stockCrossSectionWidth: 0,
      stockCrossSectionHeight: 0,
      stockHexSideDimension: 0,
      blockLength: 0,
      blockWidth: 0,
      blockHeight: 0,
      stockCrossSectionArea: 0,
      enterStartEndScrapLength: 0,
      partsPerCoil: 0,
      cuttingAllowance: this.sharedService.convertUomInUI(0.1, conversionValue, isEnableUnitConversion),
      // length: 0,
      // width: 0,
      // height: 0,
      // stockType: 1,
      partProjectArea: 0,
      partVolume: 0,
      // inputBilletDiameter: 0,
      // ultimateTensileStrength: 0,
      netWeight: 0,
      utilisation: 1,
      partSurfaceArea: 0,
      netMaterialCost: 0,
      volumeDiscountPer: 0,
      scrapWeight: 0,
      grossWeight: 0,
      grossMaterialCost: 0,
      scrapRecCost: 0,
      scrapRecovery: 90,
      coilLength: 0,
      coilWeight: 0,
      matPriceGross: 0,
    };
  }
  formPatch(materialInfo: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      partOuterDiameter: this.sharedService.convertUomInUI(materialInfo.partOuterDiameter, conversionValue, isEnableUnitConversion),
      partInnerDiameter: this.sharedService.convertUomInUI(materialInfo.partInnerDiameter, conversionValue, isEnableUnitConversion),
      partLength: this.sharedService.convertUomInUI(materialInfo.partLength, conversionValue, isEnableUnitConversion),
      maxWallthick: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.wallThickessMm) || 0, conversionValue, isEnableUnitConversion),
      partWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partWidth) || 0, conversionValue, isEnableUnitConversion),
      partHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partHeight) || 0, conversionValue, isEnableUnitConversion),
      stockDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockDiameter) || 0, conversionValue, isEnableUnitConversion),
      stockLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockLength) || 0, conversionValue, isEnableUnitConversion),
      stockOuterDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockOuterDiameter) || 0, conversionValue, isEnableUnitConversion),
      stockInnerDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockInnerDiameter) || 0, conversionValue, isEnableUnitConversion),
      stockCrossSectionWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockCrossSectionWidth) || 0, conversionValue, isEnableUnitConversion),
      stockCrossSectionHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockCrossSectionHeight) || 0, conversionValue, isEnableUnitConversion),
      stockHexSideDimension: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockHexSideDimension) || 0, conversionValue, isEnableUnitConversion),
      blockLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.blockLength) || 0, conversionValue, isEnableUnitConversion),
      blockWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.blockWidth) || 0, conversionValue, isEnableUnitConversion),
      blockHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.blockHeight) || 0, conversionValue, isEnableUnitConversion),
      stockCrossSectionArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockCrossSectionArea) || 0, conversionValue, isEnableUnitConversion),
      enterStartEndScrapLength: this.sharedService.convertUomInUI(materialInfo.enterStartEndScrapLength || 0, conversionValue, isEnableUnitConversion),
      partsPerCoil: this.sharedService.convertUomInUI(materialInfo.partsPerCoil, conversionValue, isEnableUnitConversion),
      cuttingAllowance: this.sharedService.convertUomInUI(materialInfo.cuttingAllowance || 0.2, conversionValue, isEnableUnitConversion),
      // length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimX), conversionValue, isEnableUnitConversion),
      // width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimY), conversionValue, isEnableUnitConversion),
      // height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimZ), conversionValue, isEnableUnitConversion),
      // stockType: materialInfo?.stockType,
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimArea), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimVolume), conversionValue, isEnableUnitConversion),
      // inputBilletDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.inputBilletDiameter), conversionValue, isEnableUnitConversion),
      // ultimateTensileStrength: this.sharedService.isValidNumber(materialInfo?.ultimateTensileStrength),
      netWeight: this.sharedService.isValidNumber(materialInfo?.netWeight),
      utilisation: this.sharedService.isValidNumber(materialInfo?.utilisation),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partSurfaceArea), conversionValue, isEnableUnitConversion),
      netMaterialCost: this.sharedService.isValidNumber(materialInfo?.netMatCost),
      volumeDiscountPer: this.sharedService.isValidNumber(materialInfo?.volumeDiscountPer),
      scrapWeight: this.sharedService.isValidNumber(Number(materialInfo.scrapWeight)),
      grossWeight: this.sharedService.isValidNumber(Number(materialInfo.grossWeight)),
      grossMaterialCost: this.sharedService.isValidNumber(Number(materialInfo.materialCostPart)),
      scrapRecCost: this.sharedService.isValidNumber(Number(materialInfo.scrapRecCost)),
      scrapRecovery: materialInfo.scrapRecovery || 90,
      coilLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo.coilLength), conversionValue, isEnableUnitConversion),
      coilWeight: this.sharedService.isValidNumber(Number(materialInfo.coilWeight)),
    };
  }

  setCalculationObject(materialInfo: MaterialInfoDto, material, conversionValue, isEnableUnitConversion) {
    materialInfo.partOuterDiameter = this.sharedService.convertUomToSaveAndCalculation(material['partOuterDiameter'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partInnerDiameter = this.sharedService.convertUomToSaveAndCalculation(material['partInnerDiameter'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partLength = this.sharedService.convertUomToSaveAndCalculation(Number(material['partLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.wallThickessMm = this.sharedService.convertUomToSaveAndCalculation(Number(material['maxWallthick'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partWidth = this.sharedService.convertUomToSaveAndCalculation(Number(material['partWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partHeight = this.sharedService.convertUomToSaveAndCalculation(Number(material['partHeight'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(material['stockDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockLength = this.sharedService.convertUomToSaveAndCalculation(Number(material['stockLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockOuterDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(material['stockOuterDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockInnerDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(material['stockInnerDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockCrossSectionWidth = this.sharedService.convertUomToSaveAndCalculation(Number(material['stockCrossSectionWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockCrossSectionHeight = this.sharedService.convertUomToSaveAndCalculation(Number(material['stockCrossSectionHeight'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockHexSideDimension = this.sharedService.convertUomToSaveAndCalculation(Number(material['stockHexSideDimension'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockCrossSectionArea = this.sharedService.convertUomToSaveAndCalculation(Number(material['stockCrossSectionArea'].value), conversionValue, isEnableUnitConversion);
    materialInfo.blockLength = this.sharedService.convertUomToSaveAndCalculation(Number(material['blockLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.blockWidth = this.sharedService.convertUomToSaveAndCalculation(Number(material['blockWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.blockHeight = this.sharedService.convertUomToSaveAndCalculation(Number(material['blockHeight'].value), conversionValue, isEnableUnitConversion);
    materialInfo.enterStartEndScrapLength = this.sharedService.convertUomToSaveAndCalculation(material['enterStartEndScrapLength'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partsPerCoil = this.sharedService.convertUomToSaveAndCalculation(material['partsPerCoil'].value, conversionValue, isEnableUnitConversion);
    materialInfo.cuttingAllowance = this.sharedService.convertUomToSaveAndCalculation(material['cuttingAllowance'].value, conversionValue, isEnableUnitConversion);
    materialInfo.coilLength = this.sharedService.convertUomToSaveAndCalculation(Number(material['coilLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.coilWeight = material['coilWeight'].value;

    materialInfo.isPartOuterDiameterDirty = material['partOuterDiameter'].dirty;
    materialInfo.isPartInnerDiameterDirty = material['partInnerDiameter'].dirty;
    materialInfo.isPartLengthDirty = material['partLength'].dirty;
    materialInfo.isMaxWallthickDirty = material['maxWallthick'].dirty;
    materialInfo.isPartWidthDirty = material['partWidth'].dirty;
    materialInfo.isPartHeightDirty = material['partHeight'].dirty;
    materialInfo.isStockDiameterDirty = material['stockDiameter'].dirty;
    materialInfo.isStockLengthDirty = material['stockLength'].dirty;
    materialInfo.isStockOuterDiameterDirty = material['stockOuterDiameter'].dirty;
    materialInfo.isStockInnerDiameterDirty = material['stockInnerDiameter'].dirty;
    materialInfo.isStockCrossSectionWidthDirty = material['stockCrossSectionWidth'].dirty;
    materialInfo.isStockCrossSectionHeightDirty = material['stockCrossSectionHeight'].dirty;
    materialInfo.isStockHexSideDimensionDirty = material['stockHexSideDimension'].dirty;
    materialInfo.isBlockLengthDirty = material['blockLength'].dirty;
    materialInfo.isStockHeightDirty = material['blockWidth'].dirty;
    materialInfo.isStockWidthDirty = material['blockHeight'].dirty;
    materialInfo.isEnterStartEndScrapLengthDirty = material['enterStartEndScrapLength'].dirty;
    materialInfo.isPartsPerCoilDirty = material['partsPerCoil'].dirty;
    materialInfo.isCoilLengthDirty = material['coilLength'].dirty;
    materialInfo.isCoilWeightDirty = material['coilWeight'].dirty;
    materialInfo.isCuttingAllowanceDirty = material['cuttingAllowance'].dirty;

    // materialInfo.dimX = this.sharedService.convertUomToSaveAndCalculation(Number(material['length'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.dimY = this.sharedService.convertUomToSaveAndCalculation(Number(material['width'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.dimZ = this.sharedService.convertUomToSaveAndCalculation(Number(material['height'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.stockType = material['stockType'];
    materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(material['partProjectArea'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(material['partVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(material['partSurfaceArea'].value, conversionValue, isEnableUnitConversion);
    // materialInfo.inputBilletDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(material['inputBilletDiameter'].value), conversionValue, isEnableUnitConversion);
    // materialInfo.ultimateTensileStrength = material['ultimateTensileStrength'].value;
    materialInfo.netWeight = material['netWeight'].value;
    materialInfo.utilisation = material['utilisation'].value;
    materialInfo.grossWeight = material['grossWeight'].value;
    materialInfo.scrapWeight = material['scrapWeight'].value;
    materialInfo.materialCostPart = material['grossMaterialCost'].value;
    materialInfo.scrapRecCost = material['scrapRecCost'].value;
    materialInfo.netMatCost = material['netMaterialCost'].value;
    materialInfo.volumeDiscountPer = material['volumeDiscountPer'].value;
    materialInfo.scrapRecovery = material['scrapRecovery'].value;

    materialInfo.isPartProjectedAreaDirty = material['partProjectArea'].dirty;
    materialInfo.isPartVolumeDirty = material['partVolume'].dirty;
    materialInfo.isNetweightDirty = material['netWeight'].dirty;
    materialInfo.isutilisationDirty = material['utilisation'].dirty;
    materialInfo.isPartSurfaceAreaDirty = material['partSurfaceArea'].dirty;
    // materialInfo.isGrossWeightCoilDirty = material['grossWeight'].dirty;
    materialInfo.isScrapWeightDirty = material['scrapWeight'].dirty;
    materialInfo.isScrapRecoveryDirty = material['scrapRecovery'].dirty;
  }

  formPatchResults(result: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      partOuterDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partOuterDiameter)), conversionValue, isEnableUnitConversion),
      partInnerDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partInnerDiameter)), conversionValue, isEnableUnitConversion),
      partLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partLength)), conversionValue, isEnableUnitConversion),
      maxWallthick: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.wallThickessMm)), conversionValue, isEnableUnitConversion),
      stockDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockDiameter), conversionValue, isEnableUnitConversion),
      stockLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockLength), conversionValue, isEnableUnitConversion),
      stockOuterDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockOuterDiameter), conversionValue, isEnableUnitConversion),
      stockInnerDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockInnerDiameter), conversionValue, isEnableUnitConversion),
      stockCrossSectionWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockCrossSectionWidth), conversionValue, isEnableUnitConversion),
      stockCrossSectionHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockCrossSectionHeight), conversionValue, isEnableUnitConversion),
      blockLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result?.blockLength)), conversionValue, isEnableUnitConversion),
      blockHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result?.blockHeight)), conversionValue, isEnableUnitConversion),
      blockWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result?.blockWidth)), conversionValue, isEnableUnitConversion),
      enterStartEndScrapLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.enterStartEndScrapLength)), conversionValue, isEnableUnitConversion),
      partsPerCoil: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partsPerCoil), conversionValue, isEnableUnitConversion),
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partProjectedArea)), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partVolume)), conversionValue, isEnableUnitConversion),
      netWeight: this.sharedService.isValidNumber(Number(result.netWeight)),
      utilisation: this.sharedService.isValidNumber(Number(result.utilisation)),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.partSurfaceArea), conversionValue, isEnableUnitConversion),
      netMaterialCost: this.sharedService.isValidNumber(Number(result.netMatCost)),
      volumeDiscountPer: this.sharedService.isValidNumber(Number(result.volumeDiscountPer)),
      scrapWeight: this.sharedService.isValidNumber(Number(result.scrapWeight)),
      grossWeight: this.sharedService.isValidNumber(Number(result.grossWeight)),
      grossMaterialCost: this.sharedService.isValidNumber(Number(result.materialCostPart)),
      scrapRecCost: this.sharedService.isValidNumber(Number(result.scrapRecCost)),
      scrapRecovery: this.sharedService.isValidNumber(Number(result?.scrapRecovery)),
      coilLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result?.coilLength)), conversionValue, isEnableUnitConversion),
      coilWeight: this.sharedService.isValidNumber(Number(result?.coilWeight)),
      cuttingAllowance: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result?.cuttingAllowance)), conversionValue, isEnableUnitConversion),
    };
  }

  setPayload(material, conversionValue, isEnableUnitConversion) {
    return {
      partOuterDiameter: this.sharedService.convertUomToSaveAndCalculation(material['partOuterDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      partInnerDiameter: this.sharedService.convertUomToSaveAndCalculation(material['partInnerDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      partLength: this.sharedService.convertUomToSaveAndCalculation(material['partLength'].value || 0, conversionValue, isEnableUnitConversion),
      wallThickessMm: this.sharedService.convertUomToSaveAndCalculation(material['maxWallthick'].value || 0, conversionValue, isEnableUnitConversion),
      stockDiameter: this.sharedService.convertUomToSaveAndCalculation(material['stockDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      stockLength: this.sharedService.convertUomToSaveAndCalculation(material['stockLength'].value || 0, conversionValue, isEnableUnitConversion),
      stockOuterDiameter: this.sharedService.convertUomToSaveAndCalculation(material['stockOuterDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      stockInnerDiameter: this.sharedService.convertUomToSaveAndCalculation(material['stockInnerDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      partWidth: this.sharedService.convertUomToSaveAndCalculation(material['partWidth'].value || 0, conversionValue, isEnableUnitConversion),
      partHeight: this.sharedService.convertUomToSaveAndCalculation(material['partHeight'].value || 0, conversionValue, isEnableUnitConversion),
      stockCrossSectionWidth: this.sharedService.convertUomToSaveAndCalculation(material['stockCrossSectionWidth'].value || 0, conversionValue, isEnableUnitConversion),
      stockCrossSectionHeight: this.sharedService.convertUomToSaveAndCalculation(material['stockCrossSectionHeight'].value || 0, conversionValue, isEnableUnitConversion),
      stockHexSideDimension: this.sharedService.convertUomToSaveAndCalculation(material['stockHexSideDimension'].value || 0, conversionValue, isEnableUnitConversion),
      blockLength: this.sharedService.convertUomToSaveAndCalculation(material['blockLength'].value || 0, conversionValue, isEnableUnitConversion),
      blockWidth: this.sharedService.convertUomToSaveAndCalculation(material['blockWidth'].value || 0, conversionValue, isEnableUnitConversion),
      blockHeight: this.sharedService.convertUomToSaveAndCalculation(material['blockHeight'].value || 0, conversionValue, isEnableUnitConversion),
      stockCrossSectionArea: this.sharedService.convertUomToSaveAndCalculation(material['stockCrossSectionArea'].value || 0, conversionValue, isEnableUnitConversion),
      enterStartEndScrapLength: this.sharedService.convertUomToSaveAndCalculation(material['enterStartEndScrapLength'].value || 0, conversionValue, isEnableUnitConversion),
      partsPerCoil: this.sharedService.convertUomToSaveAndCalculation(material['partsPerCoil'].value || 0, conversionValue, isEnableUnitConversion),
      cuttingAllowance: this.sharedService.convertUomToSaveAndCalculation(material['cuttingAllowance'].value || 0, conversionValue, isEnableUnitConversion),

      // dimX: this.sharedService.convertUomToSaveAndCalculation((material['length'].value || 0), conversionValue, isEnableUnitConversion),
      // dimY: this.sharedService.convertUomToSaveAndCalculation((material['width'].value || 0), conversionValue, isEnableUnitConversion),
      // dimZ: this.sharedService.convertUomToSaveAndCalculation((material['height'].value || 0), conversionValue, isEnableUnitConversion),
      // stockType: material['stockType'].value,
      partProjectedArea: this.sharedService.convertUomToSaveAndCalculation(material['partProjectArea'].value, conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomToSaveAndCalculation(material['partVolume'].value, conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomToSaveAndCalculation(material['partSurfaceArea'].value, conversionValue, isEnableUnitConversion),
      coilLength: this.sharedService.convertUomToSaveAndCalculation(material['coilLength'].value, conversionValue, isEnableUnitConversion),
      coilWeight: material['coilWeight'].value || 0,

      // inputBilletDiameter: this.sharedService.convertUomToSaveAndCalculation(material['inputBilletDiameter'].value, conversionValue, isEnableUnitConversion),
      // ultimateTensileStrength: material['ultimateTensileStrength'].value,
      netWeight: material['netWeight'].value,
      utilisation: material['utilisation'].value,
      netMatCost: material['netMaterialCost'].value || 0,
      volumeDiscountPer: material['volumeDiscountPer'].value || 0,
      grossWeight: material['grossWeight'].value || 0,
      scrapWeight: material['scrapWeight'].value || 0,
      materialCostPart: material['grossMaterialCost'].value || 0,
      scrapRecCost: material['scrapRecCost'].value || 0,
      scrapRecovery: material['scrapRecovery'].value || 90,
    };
  }

  machiningDefaults(extractedMaterialData) {
    const dimX = extractedMaterialData.DimX;
    const dimY = extractedMaterialData.DimY;
    const dimZ = extractedMaterialData.DimZ;
    // const partMinDiameter = extractedMaterialData.PartInnerDiameter;
    const partMaxDiameter = extractedMaterialData.PartOuterDiameter;
    const partLength = extractedMaterialData.PartLength;

    const isPartCircular = dimX == dimY || dimZ == dimY || dimX == dimZ;
    let stockLength = 0;
    let stockHeight = 0;
    let stockWidth = 0;
    const stockDiameter = partMaxDiameter + this.getStockLenDia(partMaxDiameter)?.addDiameter || 0;

    if (isPartCircular) {
      stockLength = partLength + this.getStockLenDia(partMaxDiameter)?.addLength || 0;
    } else {
      stockLength = dimX + this.getStockValue(dimX)?.stockLength || 0;
      stockWidth = dimY + this.getStockValue(dimY)?.stockWidth || 0;
      stockHeight = dimZ + this.getStockValue(dimZ)?.stockHeight || 0;
    }

    return {
      stockDiameter,
      stockLength,
      stockWidth,
      stockHeight,
    };
  }

  getStockLenDia(dimension) {
    const stockRanges = [
      { max: 20, addDiameter: 2, addLength: 3.5 },
      { max: 40, addDiameter: 3, addLength: 3.8 },
      { max: 65, addDiameter: 4, addLength: 4.0 },
      { max: 100, addDiameter: 5, addLength: 6.0 },
      { max: 150, addDiameter: 8, addLength: 9.0 },
      { max: Number.MAX_VALUE, addDiameter: 12, addLength: 12.5 },
    ];
    return stockRanges.find((r) => dimension <= r.max);
  }

  getStockValue(dimension) {
    const stockTable = [
      { max: 200, stockLength: 4, stockWidth: 4, stockHeight: 5 },
      { max: 400, stockLength: 6, stockWidth: 6, stockHeight: 5 },
      { max: 600, stockLength: 8, stockWidth: 8, stockHeight: 6 },
      { max: Number.MAX_VALUE, stockLength: 10, stockWidth: 10, stockHeight: 8 },
    ];
    return stockTable.find((x) => dimension <= x.max);
  }
}
