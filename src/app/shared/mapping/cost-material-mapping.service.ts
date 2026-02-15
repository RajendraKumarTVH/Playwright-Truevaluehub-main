import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MaterialInfoDto } from '../models';
// import { MaterialCastingConfigService } from '../config/material-casting-config';
import { MaterialInsulationJacketMappingService } from './material-insulation-jacket-mapping.service';
import { MaterialMachiningConfigService } from '../config/material-machining-config';
import { MaterialMetalExtrusionMappingService } from './material-metal-extrusion-mapping.service';
import { MaterialPCBConfigService } from '../config/material-pcb-config';
import { MaterialPlasticTubeExtrusionMappingService } from './material-plastic-tube-extrusion-mapping.service';
import { MaterialTubeBendingMappingService } from './material-tube-bending-mapping.service';
import { MaterialHotForgingClosedDieHotMappingService } from './material-hot-forging-closed-die-hot-mapping.service';
import { MaterialCoreCostDetailMappingService } from './material-core-cost-detail-mapping-service';
import { MaterialCustomCableMappingService } from './material-custom-cable-mapping.service';
import { MaterialPCBAMappingService } from './material-pcba-mapping.service';
import { MaterialSustainabilityMappingService } from './material-sustainability-mapping.service';
import { MaterialPCBMappingService } from './material-pcb-mapping.service';
import { RigidFlexMaterialMappingService } from './rigidFlex-material-mapping.service';
import { InjectionMoldingMaterialMappingService } from './injection-molding-material-mapping.service';
import { CompressionMoldingMaterialMappingService } from './compression-molding-material-mapping.service';
import { MaterialCastingMappingService } from './material-casting-mapping.service';
import { SheetMetalMaterialMappingService } from './sheet-metal-material-mapping.service';

@Injectable({
  providedIn: 'root',
})
export class CostMaterialMappingService {
  constructor(
    private formbuilder: FormBuilder,
    private sharedService: SharedService,
    public materialCastingMapper: MaterialCastingMappingService,
    private materialPCBConfigService: MaterialPCBConfigService,
    public materialMetalExtrusionMapper: MaterialMetalExtrusionMappingService,
    public materialMachiningConfigService: MaterialMachiningConfigService,
    public materialTubeBendingMapper: MaterialTubeBendingMappingService,
    public materialInsulationJacketMapper: MaterialInsulationJacketMappingService,
    public materialPlasticTubeExtrusionMapper: MaterialPlasticTubeExtrusionMappingService,
    // public materialPlasticVacuumFormingMapper: MaterialPlasticVacuumFormingMappingService,
    public materialHotForgingClosedDieHotMapper: MaterialHotForgingClosedDieHotMappingService,
    public coreCostDetailMapper: MaterialCoreCostDetailMappingService,
    public materialCustomCableMapper: MaterialCustomCableMappingService,
    public materialPcbaMapper: MaterialPCBAMappingService,
    public materialSustainabilityMapper: MaterialSustainabilityMappingService,
    public materialPcbMapper: MaterialPCBMappingService,
    public rigidFlexMapper: RigidFlexMaterialMappingService,
    public injectionMoldingMapper: InjectionMoldingMaterialMappingService,
    public compressionMoldingMapper: CompressionMoldingMaterialMappingService,
    public sheetMetalMaterialMapper: SheetMetalMaterialMappingService
  ) {}

  getMaterialFormFields(materialInfoList, conversionValue, isEnableUnitConversion) {
    return {
      materialInfoId: [0],
      materialgroup: ['', [Validators.required]],
      density: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].density) : 0],
      clampingPressure: [0],
      meltTemp: [0],
      moldTemp: [0],
      ejectTemp: [0],
      materialDesc: [''],
      countryName: [''],
      matPrice: [0, [Validators.required]],
      scrapPrice: [0, [Validators.required]],
      materialCategory: ['', [Validators.required]],
      materialFamily: ['', [Validators.required]],
      materialDescription: ['', [Validators.required]],
      baseMaterialFamily: ['', [Validators.required]],
      baseMaterialDescription: ['', [Validators.required]],
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
      wallAverageThickness: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].wallAverageThickness), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      maxWallthick: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].wallThickessMm), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      netWeight: [materialInfoList?.length > 0 ? this.sharedService.isValidNumber(materialInfoList[0].netWeight) : 0, [Validators.required]],
      netWeightPercentage: [0],
      netMaterialCost: [{ value: 0, disabled: true }],
      runnerType: ['Hot Runner', [Validators.required]],
      partAllowance: [0, [Validators.required]],
      utilisation: [0, [Validators.required]],
      partFinish: [0, [Validators.required]],
      noOfInserts: [0, [Validators.required]],
      windowsArea: [this.sharedService.isValidNumber(200), [Validators.required]],
      noOfCavities: [1, [Validators.required]],
      runnerDia: [0, [Validators.required]],
      scrapWeight: [0, [Validators.required]],
      grossWeight: [0, [Validators.required]],
      grossMaterialCost: [0, [Validators.required]],
      scrapRecCost: [0, [Validators.required]],
      matno: [{ value: 0, disabled: true }],
      matPrimaryProcessName: ['', [Validators.required]],
      coilWidth: [0, [Validators.required]],
      coilLength: [0, [Validators.required]],
      enterStartEndScrapLength: [0, [Validators.required]],
      partsPerCoil: [0, [Validators.required]],
      coilWeight: [0, [Validators.required]],
      unfoldedSheetWeight: [0, [Validators.required]],
      stageSheetWidth: [this.sharedService.isValidNumber(500), [Validators.required]],
      stageUnfoldedSheetWeight: [0, [Validators.required]],
      regrindAllowance: [10, [Validators.required]],
      scrapRecovery: [90, [Validators.required]],
      partProjectArea: [0, [Validators.required]],
      projectedArea: [0],
      partVolume: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimVolume), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      runnerProjectedArea: [0, [Validators.required]],
      runnerVolume: [0, [Validators.required]],
      volumePurchased: [0],
      runnerLength: [0],
      shearStrengthOfMaterial: [0],
      partOuterDiameter: [0],
      partInnerDiameter: [0],
      partLength: [0],
      coilDiameter: [this.sharedService.convertUomInUI(5, conversionValue, isEnableUnitConversion)],
      cuttingAllowance: [this.sharedService.convertUomInUI(0.1, conversionValue, isEnableUnitConversion)],
      totalPartStockLength: [0],
      unfoldedLength: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimUnfoldedX), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      unfoldedWidth: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimUnfoldedY), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      thickness: [
        materialInfoList?.length > 0 ? this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfoList[0].dimUnfoldedZ), conversionValue, isEnableUnitConversion) : 0,
        [Validators.required],
      ],
      machiningScrapPrice: [0],
      esgImpactCO2Kg: [0],
      totalEsgImpactCO2Kg: [0],
      runnerRiser: [0],
      runnerRiserPercentage: [0],
      secondaryProcessId: [''],
      oxidationLossWeight: [0],
      oxidationLossWeightPercentage: [0],
      pouringWeight: [0],
      cavityArrangementLength: [2],
      cavityArrangementWidth: [2],
      totalPouringWeight: [0],
      moldBoxLength: [0],
      moldBoxWidth: [0],
      moldBoxHeight: [0],
      moldSandWeight: [0],
      sandRecovery: [0],
      sandRecoveryPercentage: [0],
      sandWeightAfterRecovery: [0],
      cavityEnvelopLength: [0],
      cavityEnvelopWidth: [0],
      cavityEnvelopHeight: [0],
      boxVolume: [0],
      castingVolume: [0],
      coreVolume: [0],
      totalSandVolume: [0],
      totalCoreWeight: [0],
      machineScrapWeight: [0],
      stockDiameter: [0],
      stockLength: [0],
      stockOuterDiameter: [0],
      stockInnerDiameter: [0],
      partWidth: [0],
      partHeight: [0],
      stockCrossSectionWidth: [0],
      stockCrossSectionHeight: [0],
      stockHexSideDimension: [0],
      blockLength: [0],
      blockWidth: [0],
      blockHeight: [0],
      stockCrossSectionArea: [0],
      wireDiameter: [0],
      beadSize: [0],
      totalWeldLength: [0],
      totalWeldBeadArea: [0],
      effeciency: [0],
      weldWeightWastage: [0],
      materialPkgs: this.formbuilder.array([]),
      stockType: [0],
      lengthAllowance: [0],
      diameterAllowance: [0],
      widthAllowance: [0],
      heightAllowance: [0],
      cableHarnessType: this.formbuilder.array([]),
      volumeDiscountPer: [0],
      unbendPartWeight: [0],
      unfoldedPartVolume: [0],
      blankDiameter: [0],
      finalComponentDiameter: [0],
      partSurfaceArea: 0,
      stockForm: '',
      paintArea: 0,
      paintCoatingTickness: 0,
      partTickness: 0,
      typeOfMaterialBase: 0,
      typeOfWeld: 0,
      totalPaintCostsqm: 0,
      sheetLength: 0,
      sheetWidth: 0,
      sheetThickness: 0,
      searchText: '',
      primerMatPrice: 0,
      primerCoatingTickness: 0,
      primerNetWeight: 0,
      primerDensity: 0,
      standardDeviation: 0,
      inputBilletLength: 0,
      inputBilletWidth: 0,
      inputBilletHeight: 0,
      inputBilletDiameter: 0,
      weldLegLength: 0,

      typeOfCable: 0,
      typeOfConductor: 0,
      totalCableLength: 0,
      noOfCables: 0,
      noOfCablesWithSameDia: 0,
      mainInsulatorID: 0,
      mainInsulatorOD: 0,
      mainCableSheathingMaterial: 0,
      percentageOfReduction: 0,
      noOfDrawSteps: 12,

      noOfChildParts: 0,
      totalPinPopulation: 0,
      noOfTypesOfPins: 0,
      maxBomQuantityOfIndividualPinTypes: 0,
      noOfStitchingStationsRequired: 0,
      costOfPinHeader: 0,
      pitchForWireCutting: 0,
      totalCostOfRawMaterials: 0,
      perimeter: 0,
      flashVolume: 0,
      scaleLoss: 0,
      grossVolumne: 0,
      yeildUtilization: 0,
      ultimateTensileStrength: 0,
      cuttingLoss: 0,
      matPriceGross: 0,
      numOfConductors: 0,
      castingMaterial: this.formbuilder.group(this.materialCastingMapper.getCastingMaterialFormFields(materialInfoList, conversionValue, isEnableUnitConversion)),
      metalExtrusionMaterial: this.formbuilder.group(this.materialMetalExtrusionMapper.getMetalExtrusionMaterialFormFields(materialInfoList, conversionValue, isEnableUnitConversion)),
      machiningMaterial: this.formbuilder.group(this.materialMachiningConfigService.getFormFields(materialInfoList, conversionValue, isEnableUnitConversion)),
      tubeBendingMaterial: this.formbuilder.group(this.materialTubeBendingMapper.getTubeBendingFormFields(materialInfoList, conversionValue, isEnableUnitConversion)),
      insulationJacketMaterial: this.formbuilder.group(this.materialInsulationJacketMapper.getInsulationJacketFormFields(materialInfoList, conversionValue, isEnableUnitConversion)),
      pcbMaterial: this.formbuilder.group(this.materialPcbMapper.getMaterialFormFields()),
      plasticTubeExtrusionMaterial: this.formbuilder.group(this.materialPlasticTubeExtrusionMapper.getPlasticTubeExtrusionFormFields(materialInfoList, conversionValue, isEnableUnitConversion)),
      // plasticVacuumFormingMaterial: this.formbuilder.group(this.materialPlasticVacuumFormingMapper.getPlasticVacuumFormingFormFields(materialInfoList)),
      hotForgingClosedDieHotMaterial: this.formbuilder.group(this.materialHotForgingClosedDieHotMapper.getHotForgingClosedDieHotFormFields(materialInfoList, conversionValue, isEnableUnitConversion)),
      customCableMaterial: this.formbuilder.group(this.materialCustomCableMapper.getFormFields(materialInfoList, conversionValue, isEnableUnitConversion)),
      pcbaMaterial: this.formbuilder.group(this.materialPcbaMapper.getFormFields()),
      materialSustainability: this.formbuilder.group(this.materialSustainabilityMapper.getMaterialSustainabilityFormFields(materialInfoList)),
      rigidFlexMaterial: this.formbuilder.group(this.rigidFlexMapper.getFormFields()),
      injectionMoldingMaterial: this.formbuilder.group(this.injectionMoldingMapper.getFormFields()),
      compressionMoldingMaterial: this.formbuilder.group(this.compressionMoldingMapper.getFormFields()),
      sheetMetalMaterial: this.formbuilder.group(this.sheetMetalMaterialMapper.getFormFields()),
    };
  }

  materialFormReset(conversionValue, isEnableUnitConversion) {
    return {
      materialInfoId: 0,
      materialgroup: '',
      density: 0,
      clampingPressure: 0,
      meltTemp: 0,
      moldTemp: 0,
      matPrice: 0,
      ejectTemp: 0,
      materialDesc: '',
      countryName: '',
      scrapPrice: 0,
      materialCategory: '',
      materialFamily: '',
      materialDescription: '',
      baseMaterialFamily: '',
      baseMaterialDescription: '',
      length: 0,
      width: 0,
      height: 0,
      inputBilletLength: 0,
      inputBilletWidth: 0,
      inputBilletHeight: 0,
      inputBilletDiameter: 0,
      wallAverageThickness: 0,
      maxWallthick: 0,
      netWeight: 0,
      netWeightPercentage: 0,
      netMaterialCost: 0,
      runnerType: 'Hot Runner',
      partAllowance: 0,
      utilisation: 0,
      partFinish: 0,
      noOfInserts: 0,
      windowsArea: 200,
      noOfCavities: 1,
      runnerDia: 0,
      scrapWeight: 0,
      grossWeight: 0,
      grossMaterialCost: 0,
      scrapRecCost: 0,
      matno: 0,
      matPrimaryProcessName: '',
      coilWidth: 0,
      coilLength: 0,
      enterStartEndScrapLength: 0,
      partsPerCoil: 0,
      coilWeight: 0,
      unfoldedSheetWeight: 0,
      stageSheetWidth: 500,
      stageUnfoldedSheetWeight: 0,
      regrindAllowance: 10,
      scrapRecovery: 90,
      partProjectedArea: 0,
      partVolume: 0,
      runnerProjectedArea: 0,
      runnerVolume: 0,
      runnerLength: 0,
      volumePurchased: 0,
      shearStrengthOfMaterial: 0,
      partOuterDiameter: 0,
      partInnerDiameter: 0,
      partLength: 0,
      coilDiameter: this.sharedService.convertUomInUI(5, conversionValue, isEnableUnitConversion),
      partProjectArea: 0,
      projectedArea: 0,
      cuttingAllowance: this.sharedService.convertUomInUI(0.1, conversionValue, isEnableUnitConversion),
      totalPartStockLength: 0,
      unfoldedLength: 0,
      unfoldedWidth: 0,
      thickness: 0,
      secondaryProcessId: '',
      machiningScrapPrice: 0,
      esgImpactCO2Kg: 0,
      totalEsgImpactCO2Kg: 0,
      runnerRiser: 0,
      runnerRiserPercentage: 0,
      oxidationLossWeight: 0,
      oxidationLossWeightPercentage: 0,
      pouringWeight: 0,
      cavityArrangementLength: 2,
      cavityArrangementWidth: 2,
      totalPouringWeight: 0,
      moldBoxLength: 0,
      moldBoxWidth: 0,
      moldBoxHeight: 0,
      moldSandWeight: 0,
      sandRecovery: 0,
      sandRecoveryPercentage: 0,
      sandWeightAfterRecovery: 0,
      cavityEnvelopLength: 0,
      cavityEnvelopWidth: 0,
      cavityEnvelopHeight: 0,
      boxVolume: 0,
      castingVolume: 0,
      coreVolume: 0,
      totalSandVolume: 0,
      totalCoreWeight: 0,
      machineScrapWeight: 0,
      stockDiameter: 0,
      stockLength: 0,
      stockOuterDiameter: 0,
      stockInnerDiameter: 0,
      partWidth: 0,
      partHeight: 0,
      stockCrossSectionWidth: 0,
      stockCrossSectionHeight: 0,
      stockHexSideDimension: 0,
      blockLength: 0,
      blockWidth: 0,
      blockHeight: 0,
      stockCrossSectionArea: 0,
      wireDiameter: 0,
      beadSize: 0,
      totalWeldLength: 0,
      totalWeldBeadArea: 0,
      effeciency: 0,
      weldWeightWastage: 0,
      stockType: 0,
      lengthAllowance: 5,
      diameterAllowance: 5,
      widthAllowance: 5,
      heightAllowance: 10,
      volumeDiscountPer: 0,
      unbendPartWeight: 0,
      unfoldedPartVolume: 0,
      blankDiameter: 0,
      finalComponentDiameter: 0,
      partSurfaceArea: 0,
      stockForm: '',
      paintArea: 0,
      paintCoatingTickness: 0,
      partTickness: 0,
      typeOfWeld: 0,
      typeOfMaterialBase: 0,
      totalPaintCostsqm: 0,
      sheetLength: 0,
      sheetWidth: 0,
      sheetThickness: 0,
      searchText: '',
      primerMatPrice: 0,
      primerCoatingTickness: 0,
      primerNetWeight: 0,
      primerDensity: 0,
      standardDeviation: 0,
      weldLegLength: 0,
      typeOfCable: 0,
      typeOfConductor: 0,
      numOfConductors: 0,
      totalCableLength: 0,
      noOfCables: 0,
      noOfCablesWithSameDia: 0,
      mainInsulatorID: 0,
      mainInsulatorOD: 0,
      mainCableSheathingMaterial: 0,
      percentageOfReduction: 0,
      noOfDrawSteps: 12,
      noOfChildParts: 0,
      totalPinPopulation: 0,
      noOfTypesOfPins: 0,
      maxBomQuantityOfIndividualPinTypes: 0,
      noOfStitchingStationsRequired: 0,
      totalCostOfTerminals: 0,
      costOfPinHeader: 0,
      totatCostOfRawMaterials: 0,
      pitchForWireCutting: 0,
      totalCostOfRawMaterials: 0,
      perimeter: 0,
      flashVolume: 0,
      scaleLoss: 0,
      grossVolumne: 0,
      yeildUtilization: 0,
      ultimateTensileStrength: 0,
      cuttingLoss: 0,
      castingMaterial: this.materialCastingMapper.castingMaterialFormFieldsReset(),
      metalExtrusionMaterial: this.materialMetalExtrusionMapper.metalExtrusionMaterialFormFieldsReset(),
      machiningMaterial: this.materialMachiningConfigService.formFieldsReset(conversionValue, isEnableUnitConversion),
      tubeBendingMaterial: this.materialTubeBendingMapper.tubeBendingFormFieldsReset(),
      insulationJacketMaterial: this.materialInsulationJacketMapper.insulationJacketFormFieldsReset(),
      pcbMaterial: this.materialPcbMapper.formFieldsReset(),
      plasticTubeExtrusionMaterial: this.materialPlasticTubeExtrusionMapper.plasticTubeExtrusionFormFieldsReset(),
      // plasticVacuumFormingMaterial: this.materialPlasticVacuumFormingMapper.plasticVacuumFormingFormFieldsReset(),
      hotForgingClosedDieHotMaterial: this.materialHotForgingClosedDieHotMapper.hotForgingClosedDieHotFormFieldsReset(),
      customCableMaterial: this.materialCustomCableMapper.formFieldsReset(),
      pcbaMaterial: this.materialPcbaMapper.formFieldsReset(),
      materialSustainability: this.materialSustainabilityMapper.materialSustainabilityFormFieldsReset(),
      rigidFlexMaterial: this.rigidFlexMapper.formFieldsReset(),
      injectionMoldingMaterial: this.injectionMoldingMapper.formFieldsReset(),
      compressionMoldingMaterial: this.compressionMoldingMapper.formFieldsReset(),
      sheetMetalMaterial: this.sheetMetalMaterialMapper.formFieldsReset(),
    };
  }

  materialFormPatch(materialInfo: MaterialInfoDto, conversionValue, isEnableUnitConversion, totalSandVolume) {
    return {
      netMaterialCost: this.sharedService.isValidNumber(materialInfo?.netMatCost),
      density: this.sharedService.isValidNumber(materialInfo?.density),
      matPrice: this.sharedService.isValidNumber(materialInfo?.materialPricePerKg) || 0,
      scrapPrice: this.sharedService.isValidNumber(materialInfo.scrapPricePerKg) || 0,
      length: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimX), conversionValue, isEnableUnitConversion),
      width: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimY), conversionValue, isEnableUnitConversion),
      height: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimZ), conversionValue, isEnableUnitConversion),
      wallAverageThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.wallAverageThickness), conversionValue, isEnableUnitConversion),
      maxWallthick: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.wallThickessMm), conversionValue, isEnableUnitConversion),
      standardDeviation: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.standardDeviation), conversionValue, isEnableUnitConversion),
      netWeight: this.sharedService.isValidNumber(materialInfo?.netWeight),
      netWeightPercentage: this.sharedService.isValidNumber(materialInfo?.netWeightPercentage),
      runnerType: materialInfo.runnerType,
      partAllowance: materialInfo.partAllowance,
      utilisation: this.sharedService.isValidNumber(Number(materialInfo.utilisation)),
      noOfInserts: materialInfo.noOfInserts,
      windowsArea: materialInfo.txtWindows,
      noOfCavities: materialInfo.noOfCavities,
      runnerDia: this.sharedService.convertUomInUI(materialInfo.runnerDia, conversionValue, isEnableUnitConversion),
      scrapWeight: this.sharedService.isValidNumber(Number(materialInfo.scrapWeight)),
      grossWeight: this.sharedService.isValidNumber(Number(materialInfo.grossWeight)),
      grossMaterialCost: this.sharedService.isValidNumber(Number(materialInfo.materialCostPart)),
      scrapRecCost: this.sharedService.isValidNumber(Number(materialInfo.scrapRecCost)),
      matno: materialInfo.materialInfoId,
      matPrimaryProcessName: materialInfo.processId || '',
      coilWidth: this.sharedService.convertUomInUI(materialInfo.coilWidth, conversionValue, isEnableUnitConversion),
      coilLength: this.sharedService.convertUomInUI(materialInfo.coilLength, conversionValue, isEnableUnitConversion),
      enterStartEndScrapLength: this.sharedService.convertUomInUI(materialInfo.enterStartEndScrapLength || 0, conversionValue, isEnableUnitConversion),
      partsPerCoil: this.sharedService.convertUomInUI(materialInfo.partsPerCoil, conversionValue, isEnableUnitConversion),
      coilWeight: materialInfo.coilWeight,
      unfoldedSheetWeight: materialInfo.unfoldedSheetweight,
      partFinish: materialInfo.partFinish || 40,
      regrindAllowance: materialInfo.regrindAllowance || 10,
      scrapRecovery: materialInfo.scrapRecovery || 90,
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimArea), conversionValue, isEnableUnitConversion),
      projectedArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.projectedArea), conversionValue, isEnableUnitConversion),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimVolume), conversionValue, isEnableUnitConversion),
      runnerProjectedArea: materialInfo.runnerProjectedArea,
      runnerVolume: materialInfo.runnerVolume,
      volumePurchased: materialInfo.volumePurchased,
      runnerLength: this.sharedService.convertUomInUI(materialInfo.runnerLength, conversionValue, isEnableUnitConversion),
      partOuterDiameter: this.sharedService.convertUomInUI(materialInfo.partOuterDiameter, conversionValue, isEnableUnitConversion),
      partInnerDiameter: this.sharedService.convertUomInUI(materialInfo.partInnerDiameter, conversionValue, isEnableUnitConversion),
      partLength: this.sharedService.convertUomInUI(materialInfo.partLength, conversionValue, isEnableUnitConversion),
      coilDiameter: this.sharedService.convertUomInUI(materialInfo.coilDiameter || 5, conversionValue, isEnableUnitConversion),
      cuttingAllowance: this.sharedService.convertUomInUI(materialInfo.cuttingAllowance || 0.2, conversionValue, isEnableUnitConversion),
      totalPartStockLength: materialInfo.totalPartStockLength || 0,
      unfoldedLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimUnfoldedX), conversionValue, isEnableUnitConversion),
      unfoldedWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimUnfoldedY), conversionValue, isEnableUnitConversion),
      thickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.dimUnfoldedZ), conversionValue, isEnableUnitConversion),
      secondaryProcessId: materialInfo?.secondaryProcessId || '',
      machiningScrapPrice: this.sharedService.isValidNumber(materialInfo?.machiningScrapPrice) || 0,
      runnerRiser: this.sharedService.isValidNumber(materialInfo?.runnerRiser) || 0,
      runnerRiserPercentage: this.sharedService.isValidNumber(materialInfo?.runnerRiserPercentage) || 0,
      oxidationLossWeight: this.sharedService.isValidNumber(materialInfo?.oxidationLossWeight) || 0,
      oxidationLossWeightPercentage: this.sharedService.isValidNumber(materialInfo?.oxidationLossWeightPercentage) || 0,
      pouringWeight: this.sharedService.isValidNumber(materialInfo?.pouringWeight) || 0,
      sandRecovery: materialInfo?.sandRecovery || 0,
      sandRecoveryPercentage: materialInfo?.sandRecoveryPercentage || 0,
      cavityArrangementLength: this.sharedService.isValidNumber(materialInfo?.cavityArrangementLength) || 0,
      cavityArrangementWidth: this.sharedService.isValidNumber(materialInfo?.cavityArrangementWidth) || 0,
      totalPouringWeight: this.sharedService.isValidNumber(materialInfo?.totalPartStockLength) || 0,
      moldBoxLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.moldBoxLength) || 0, conversionValue, isEnableUnitConversion),
      moldBoxHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.moldBoxHeight) || 0, conversionValue, isEnableUnitConversion),
      moldBoxWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.moldBoxWidth) || 0, conversionValue, isEnableUnitConversion),
      moldSandWeight: this.sharedService.isValidNumber(materialInfo?.moldSandWeight) || 0,
      sandWeightAfterRecovery: this.sharedService.isValidNumber(materialInfo?.sandWeightAfterRecovery) || 0,
      cavityEnvelopLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.cavityEnvelopLength) || 0, conversionValue, isEnableUnitConversion),
      cavityEnvelopWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.cavityEnvelopWidth) || 0, conversionValue, isEnableUnitConversion),
      cavityEnvelopHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.cavityEnvelopHeight) || 0, conversionValue, isEnableUnitConversion),
      boxVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.boxVolume) || 0, conversionValue, isEnableUnitConversion),
      castingVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.castingVolume) || 0, conversionValue, isEnableUnitConversion),
      coreVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.coreVolume) || 0, conversionValue, isEnableUnitConversion),
      totalSandVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.totalSandVolume) || totalSandVolume, conversionValue, isEnableUnitConversion),
      totalCoreWeight: this.sharedService.isValidNumber(materialInfo?.totalCoreWeight) || 0,
      machineScrapWeight: this.sharedService.isValidNumber(materialInfo?.machineScrapWeight) || 0,
      stockDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockDiameter) || 0, conversionValue, isEnableUnitConversion),
      stockLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockLength) || 0, conversionValue, isEnableUnitConversion),
      stockOuterDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockOuterDiameter) || 0, conversionValue, isEnableUnitConversion),
      stockInnerDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockInnerDiameter) || 0, conversionValue, isEnableUnitConversion),
      partWidth: this.sharedService.isValidNumber(materialInfo?.partWidth) || 0,
      partHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partHeight) || 0, conversionValue, isEnableUnitConversion),
      stockCrossSectionWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockCrossSectionWidth) || 0, conversionValue, isEnableUnitConversion),
      stockCrossSectionHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockCrossSectionHeight) || 0, conversionValue, isEnableUnitConversion),
      stockHexSideDimension: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockHexSideDimension) || 0, conversionValue, isEnableUnitConversion),
      blockLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.blockLength) || 0, conversionValue, isEnableUnitConversion),
      blockWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.blockWidth) || 0, conversionValue, isEnableUnitConversion),
      blockHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.blockHeight) || 0, conversionValue, isEnableUnitConversion),
      stockCrossSectionArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.stockCrossSectionArea) || 0, conversionValue, isEnableUnitConversion),
      wireDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.wireDiameter) || 0, conversionValue, isEnableUnitConversion),
      beadSize: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.beadSize) || 0, conversionValue, isEnableUnitConversion),
      totalWeldLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.totalWeldLength) || 0, conversionValue, isEnableUnitConversion),
      totalWeldBeadArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.totalWeldBeadArea) || 0, conversionValue, isEnableUnitConversion),
      effeciency: this.sharedService.isValidNumber(materialInfo?.effeciency) || 0,
      weldWeightWastage: this.sharedService.isValidNumber(materialInfo?.weldWeightWastage) || 0,
      lengthAllowance: this.sharedService.isValidNumber(materialInfo?.lengthAllowance),
      diameterAllowance: this.sharedService.isValidNumber(materialInfo?.diameterAllowance),
      widthAllowance: this.sharedService.isValidNumber(materialInfo?.widthAllowance),
      heightAllowance: this.sharedService.isValidNumber(materialInfo?.heightAllowance),
      esgImpactCO2Kg: this.sharedService.isValidNumber(materialInfo?.esgImpactCO2Kg),
      totalEsgImpactCO2Kg: this.sharedService.isValidNumber(materialInfo?.totalEsgImpactCO2Kg),
      volumeDiscountPer: this.sharedService.isValidNumber(materialInfo?.volumeDiscountPer),
      unbendPartWeight: this.sharedService.isValidNumber(materialInfo?.unbendPartWeight),
      blankDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.blankDiameter), conversionValue, isEnableUnitConversion),
      finalComponentDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.finalComponentDiameter), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partSurfaceArea), conversionValue, isEnableUnitConversion),
      stockForm: materialInfo?.stockForm,
      paintArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.paintArea), conversionValue, isEnableUnitConversion),
      paintCoatingTickness: this.sharedService.isValidNumber(materialInfo?.paintCoatingTickness),
      partTickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(materialInfo?.partTickness), conversionValue, isEnableUnitConversion),
      typeOfWeld: materialInfo?.typeOfWeld,
      typeOfMaterialBase: materialInfo?.typeOfMaterialBase,
      totalPaintCostsqm: this.sharedService.isValidNumber(materialInfo?.totalPaintCostsqm),
      sheetLength: this.sharedService.isValidNumber(materialInfo?.sheetLength),
      sheetWidth: this.sharedService.isValidNumber(materialInfo?.sheetWidth),
      sheetThickness: this.sharedService.isValidNumber(materialInfo?.sheetThickness),
      primerMatPrice: this.sharedService.isValidNumber(materialInfo?.primerMatPrice),
      primerCoatingTickness: this.sharedService.isValidNumber(materialInfo?.primerCoatingTickness),
      primerNetWeight: this.sharedService.isValidNumber(materialInfo?.primerNetWeight),
      primerDensity: this.sharedService.isValidNumber(materialInfo?.primerDensity),
      inputBilletLength: this.sharedService.convertUomInUI(materialInfo?.inputBilletLength, conversionValue, isEnableUnitConversion),
      inputBilletWidth: this.sharedService.convertUomInUI(materialInfo?.inputBilletWidth, conversionValue, isEnableUnitConversion),
      inputBilletHeight: this.sharedService.convertUomInUI(materialInfo?.inputBilletHeight, conversionValue, isEnableUnitConversion),
      inputBilletDiameter: this.sharedService.convertUomInUI(materialInfo?.inputBilletDiameter, conversionValue, isEnableUnitConversion),
      weldLegLength: this.sharedService.convertUomInUI(materialInfo?.weldLegLength, conversionValue, isEnableUnitConversion),

      typeOfCable: materialInfo?.typeOfCable,
      typeOfConductor: materialInfo?.typeOfConductor,
      totalCableLength: materialInfo?.totalCableLength,
      noOfCables: materialInfo?.noOfCables,
      noOfCablesWithSameDia: materialInfo?.noOfCablesWithSameDia,
      mainInsulatorID: materialInfo?.mainInsulatorID,
      mainInsulatorOD: materialInfo?.mainInsulatorOD,
      mainCableSheathingMaterial: this.sharedService.isValidNumber(materialInfo?.mainCableSheathingMaterial),
      percentageOfReduction: materialInfo?.percentageOfReduction,
      noOfDrawSteps: materialInfo?.noOfDrawSteps,
      pitchForWireCutting: materialInfo?.pitchForWireCutting,
      totalCostOfRawMaterials: materialInfo.totalCostOfRawMaterials,
      perimeter: materialInfo.perimeter,
      flashVolume: materialInfo.flashVolume,
      scaleLoss: materialInfo.scaleLoss,
      grossVolumne: materialInfo.grossVolumne,
      yeildUtilization: materialInfo.yeildUtilization,
      ultimateTensileStrength: materialInfo.ultimateTensileStrength,
      cuttingLoss: materialInfo.cuttingLoss,
      castingMaterial: this.materialCastingMapper.castingMaterialFormPatch(materialInfo, conversionValue, isEnableUnitConversion, totalSandVolume),
      metalExtrusionMaterial: this.materialMetalExtrusionMapper.metalExtrusionMaterialFormPatch(materialInfo, conversionValue, isEnableUnitConversion),
      machiningMaterial: this.materialMachiningConfigService.formPatch(materialInfo, conversionValue, isEnableUnitConversion),
      tubeBendingMaterial: this.materialTubeBendingMapper.tubeBendingFormPatch(materialInfo, conversionValue, isEnableUnitConversion),
      insulationJacketMaterial: this.materialInsulationJacketMapper.insulationJacketFormPatch(materialInfo, conversionValue, isEnableUnitConversion),
      pcbMaterial: this.materialPcbMapper.formPatch(materialInfo, conversionValue, isEnableUnitConversion),
      plasticTubeExtrusionMaterial: this.materialPlasticTubeExtrusionMapper.plasticTubeExtrusionFormPatch(materialInfo, conversionValue, isEnableUnitConversion),
      // plasticVacuumFormingMaterial: this.materialPlasticVacuumFormingMapper.plasticVacuumFormingFormPatch(materialInfo),
      hotForgingClosedDieHotMaterial: this.materialHotForgingClosedDieHotMapper.hotForgingClosedDieHotFormPatch(materialInfo, conversionValue, isEnableUnitConversion),
      customCableMaterial: this.materialCustomCableMapper.formPatch(materialInfo, conversionValue, isEnableUnitConversion),
      pcbaMaterial: this.materialPcbaMapper.formPatch(materialInfo),
      materialSustainability: this.materialSustainabilityMapper.materialSustainabilityFormPatch(materialInfo),
      rigidFlexMaterial: this.rigidFlexMapper.formPatch(materialInfo),
      injectionMoldingMaterial: this.injectionMoldingMapper.formPatch(materialInfo, conversionValue, isEnableUnitConversion),
      compressionMoldingMaterial: this.compressionMoldingMapper.formPatch(materialInfo, conversionValue, isEnableUnitConversion),
      sheetMetalMaterial: this.sheetMetalMaterialMapper.formPatch(materialInfo, conversionValue, isEnableUnitConversion),
    };
  }

  materialDirtyCheck(materialInfo: MaterialInfoDto, formCtrl) {
    materialInfo.isAvgWallthickDirty = formCtrl['wallAverageThickness'].dirty;
    materialInfo.isMaxWallthickDirty = formCtrl['maxWallthick'].dirty;
    materialInfo.isStdDeviationDirty = formCtrl['standardDeviation'].dirty;
    materialInfo.isScrapRecoveryDirty = formCtrl['scrapRecovery'].dirty;
    materialInfo.isNetweightDirty = formCtrl['netWeight'].dirty;
    materialInfo.isNetweightPercentageDirty = formCtrl['netWeightPercentage'].dirty;
    materialInfo.isRegrindAllowanceDirty = formCtrl['regrindAllowance'].dirty;
    materialInfo.isPartProjectedAreaDirty = formCtrl['partProjectArea'].dirty;
    materialInfo.isPartSurfaceAreaDirty = formCtrl['partSurfaceArea'].dirty;
    materialInfo.isProjectedAreaDirty = formCtrl['projectedArea'].dirty;
    materialInfo.isutilisationDirty = formCtrl['utilisation'].dirty;
    materialInfo.isPartVolumeDirty = formCtrl['partVolume'].dirty;
    materialInfo.isRunnerDiaDirty = formCtrl['runnerDia'].dirty;
    materialInfo.isRunnerLengthDirty = formCtrl['runnerLength'].dirty;
    materialInfo.isScrapWeightDirty = formCtrl['scrapWeight'].dirty;
    materialInfo.isMatPriceDirty = formCtrl['matPrice'].dirty;
    materialInfo.isprimerMatPriceDirty = formCtrl['primerMatPrice'].dirty;
    materialInfo.isprimerCoatingTicknessDirty = formCtrl['primerCoatingTickness'].dirty;
    materialInfo.isprimerNetWeightDirty = formCtrl['primerNetWeight'].dirty;
    materialInfo.isprimerDensityDirty = formCtrl['primerDensity'].dirty;
    materialInfo.isScrapPriceDirty = formCtrl['scrapPrice'].dirty;
    materialInfo.isDensityDirty = formCtrl['density'].dirty;
    materialInfo.isRunnerTypeDirty = formCtrl['runnerType'].dirty;
    materialInfo.isCoilDiameterDirty = formCtrl['coilDiameter'].dirty;
    materialInfo.isCoilLengthDirty = formCtrl['coilLength'].dirty;
    materialInfo.isCoilWeightDirty = formCtrl['coilWeight'].dirty;
    materialInfo.isCuttingAllowanceDirty = formCtrl['cuttingAllowance'].dirty;
    materialInfo.isCoilWidthDirty = formCtrl['coilWidth'].dirty;
    materialInfo.iswireDiameterDirty = formCtrl['wireDiameter'].dirty;
    materialInfo.isUnbendPartWeightDirty = formCtrl['unbendPartWeight'].dirty;
    materialInfo.ispaintAreaDirty = formCtrl['paintArea'].dirty;
    materialInfo.ispaintCoatingTicknessDirty = formCtrl['paintCoatingTickness'].dirty;
    materialInfo.ispartTicknessDirty = formCtrl['partTickness'].dirty;
    materialInfo.isprimerCoatingTicknessDirty = formCtrl['primerCoatingTickness'].dirty;
    materialInfo.isprimerDensityDirty = formCtrl['primerDensity'].dirty;
    materialInfo.istotalPaintCostsqmDirty = formCtrl['totalPaintCostsqm'].dirty;
    materialInfo.isPartAllowanceDirty = formCtrl['partAllowance'].dirty;
    materialInfo.isPartsPerCoilDirty = formCtrl['partsPerCoil'].dirty;
    materialInfo.isGrossWeightCoilDirty = formCtrl['grossWeight'].dirty;
    materialInfo.isGrossWeightDirty = formCtrl['grossWeight'].dirty;
    materialInfo.isBlankDiameterDirty = formCtrl['blankDiameter'].dirty;
    materialInfo.isFinalComponentDiameterDirty = formCtrl['finalComponentDiameter'].dirty;
    materialInfo.isStartEndScrapLengthDirty = formCtrl['enterStartEndScrapLength'].dirty;
    materialInfo.isMachiningScrapPriceDirty = formCtrl['machiningScrapPrice'].dirty;
    materialInfo.isNoOfCavitiesDirty = formCtrl['noOfCavities'].dirty;
    materialInfo.isCavityArrangementLengthDirty = formCtrl['cavityArrangementLength'].dirty;
    materialInfo.isCavityArrangementWidthDirty = formCtrl['cavityArrangementWidth'].dirty;
    materialInfo.isRunnerRiserDirty = formCtrl['runnerRiser'].dirty;
    materialInfo.isRunnerRiserPercentageDirty = formCtrl['runnerRiserPercentage'].dirty;
    materialInfo.isMachiningScrapWeightDirty = formCtrl['machineScrapWeight'].dirty;
    materialInfo.isOxidationLossWeightDirty = formCtrl['oxidationLossWeight'].dirty;
    materialInfo.isOxidationLossWeightPercentageDirty = formCtrl['oxidationLossWeightPercentage'].dirty;
    materialInfo.isPouringWeightDirty = formCtrl['pouringWeight'].dirty;
    materialInfo.isTotalPouringWeightDirty = formCtrl['totalPouringWeight'].dirty;
    materialInfo.isSandRecoveryDirty = formCtrl['sandRecovery'].dirty;
    materialInfo.isSandRecoveryPercentageDirty = formCtrl['sandRecoveryPercentage'].dirty;
    materialInfo.isCavityEnvelopLengthDirty = formCtrl['cavityEnvelopLength'].dirty;
    materialInfo.isCavityEnvelopWidthDirty = formCtrl['cavityEnvelopWidth'].dirty;
    materialInfo.isCavityEnvelopHeightDirty = formCtrl['cavityEnvelopHeight'].dirty;
    materialInfo.isCastingVolumeDirty = formCtrl['castingVolume'].dirty;
    materialInfo.isMoldBoxLengthDirty = formCtrl['moldBoxLength'].dirty;
    materialInfo.isMoldBoxHeightDirty = formCtrl['moldBoxHeight'].dirty;
    materialInfo.isMoldBoxWidthDirty = formCtrl['moldBoxWidth'].dirty;
    materialInfo.isBoxVolumeDirty = formCtrl['boxVolume'].dirty;
    materialInfo.isCoreVolumeDirty = formCtrl['coreVolume'].dirty;
    materialInfo.isTotalSandVolumeDirty = formCtrl['totalSandVolume'].dirty;
    materialInfo.isMoldSandWeightDirty = formCtrl['moldSandWeight'].dirty;
    materialInfo.isSandWeightAfterRecoveryDirty = formCtrl['sandWeightAfterRecovery'].dirty;
    materialInfo.isTotalCoreWeightDirty = formCtrl['totalCoreWeight'].dirty;
    materialInfo.isSandWeightAfterRecoveryDirty = formCtrl['sandWeightAfterRecovery'].dirty;
    materialInfo.isStockDiameterDirty = formCtrl['stockDiameter'].dirty;
    materialInfo.isStockOuterDiameterDirty = formCtrl['stockOuterDiameter'].dirty;
    materialInfo.isStockInnerDiameterDirty = formCtrl['stockInnerDiameter'].dirty;
    materialInfo.isStockCrossSectionWidthDirty = formCtrl['stockCrossSectionWidth'].dirty;
    materialInfo.isStockCrossSectionHeightDirty = formCtrl['stockCrossSectionHeight'].dirty;
    materialInfo.isdiameterAllowanceDirty = formCtrl['diameterAllowance'].dirty;
    materialInfo.isStockHeightDirty = formCtrl['blockHeight'].dirty;
    materialInfo.isStockWidthDirty = formCtrl['blockWidth'].dirty;
    materialInfo.isEffeciencyDirty = formCtrl['effeciency'].dirty;
    materialInfo.isTotalWeldBeadAreaDirty = formCtrl['totalWeldBeadArea'].dirty;
    materialInfo.isTotalWeldLengthDirty = formCtrl['totalWeldLength'].dirty;
    materialInfo.isWeldWeightWastageDirty = formCtrl['weldWeightWastage'].dirty;
    materialInfo.isTypeOfCableDirty = formCtrl['typeOfCable'].dirty;
    materialInfo.isStockLengthDirty = formCtrl['stockLength'].dirty;
    materialInfo.isSheetThicknessDirty = formCtrl['sheetThickness'].dirty;
    materialInfo.isSheetWidthDirty = formCtrl['sheetWidth'].dirty;
    materialInfo.isSheetLengthDirty = formCtrl['sheetLength'].dirty;
    materialInfo.isPartOuterDiameterDirty = formCtrl['partOuterDiameter'].dirty;
    materialInfo.isPartInnerDiameterDirty = formCtrl['partInnerDiameter'].dirty;
    materialInfo.isPartLengthDirty = formCtrl['partLength'].dirty;
    materialInfo.isPartWidthDirty = formCtrl['partWidth'].dirty;
    materialInfo.isPartHeightDirty = formCtrl['partHeight'].dirty;
    materialInfo.isStockHexSideDimensionDirty = formCtrl['stockHexSideDimension'].dirty;
    materialInfo.isEnterStartEndScrapLengthDirty = formCtrl['enterStartEndScrapLength'].dirty;
    // materialInfo.isPercentageOfReductionDirty = formCtrl['percentageOfReduction'].dirty;
    materialInfo.isTotalCostOfRawMaterialsDirty = formCtrl['totalCostOfRawMaterials'].dirty;
    materialInfo.isPerimeterDirty = formCtrl['perimeter'].dirty;
    materialInfo.isFlashVolumeDirty = formCtrl['flashVolume'].dirty;
    materialInfo.isScaleLossDirty = formCtrl['scaleLoss'].dirty;
    materialInfo.isGrossVolumneDirty = formCtrl['grossVolumne'].dirty;
    materialInfo.isYeildUtilizationDirty = formCtrl['yeildUtilization'].dirty;
    materialInfo.isUltimateTensileStrength = formCtrl['ultimateTensileStrength'].dirty;
    materialInfo.isCuttingLoss = formCtrl['cuttingLoss'].dirty;
    materialInfo.isBlockLengthDirty = formCtrl['blockLength'].dirty;
    materialInfo.isInputBilletDiameterDirty = formCtrl['inputBilletDiameter'].dirty;
    materialInfo.isVolumePurchasedDirty = formCtrl['volumePurchased'].dirty;
    materialInfo.isNoOfDrawStepsDirty = formCtrl['noOfDrawSteps'].dirty;
    materialInfo.isPercentageOfReductionDirty = formCtrl['percentageOfReduction'].dirty;
  }

  materialFormAssignValue(materialInfo: MaterialInfoDto, formCtrl, conversionValue, isEnableUnitConversion, defaultValues, currentPart, materialDescriptionList, processFlag, thermoFormingList) {
    materialInfo.processId = Number(formCtrl['matPrimaryProcessName'].value);
    materialInfo.categoryId = Number(formCtrl['materialCategory'].value);
    materialInfo.dimX = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['length'].value), conversionValue, isEnableUnitConversion);
    materialInfo.dimY = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['width'].value), conversionValue, isEnableUnitConversion);
    materialInfo.dimZ = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['height'].value), conversionValue, isEnableUnitConversion);
    materialInfo.dimUnfoldedX = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['unfoldedLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.dimUnfoldedY = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['unfoldedWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.dimUnfoldedZ = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['thickness'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partVolume = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partHeight = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partHeight'].value), conversionValue, isEnableUnitConversion);
    materialInfo.eav = currentPart?.eav;
    materialInfo.lotSize = currentPart?.lotSize;
    materialInfo.stockForm = formCtrl['stockForm'].value;
    materialInfo.shearingStrength = materialDescriptionList?.length > 0 ? materialDescriptionList[0]?.shearingStrength : 0;
    materialInfo.wallThickessMm = this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(formCtrl['maxWallthick'].value), conversionValue, isEnableUnitConversion);
    materialInfo.wallAverageThickness = this.sharedService.convertUomToSaveAndCalculation(
      this.sharedService.isValidNumber(formCtrl['wallAverageThickness'].value),
      conversionValue,
      isEnableUnitConversion
    );
    materialInfo.standardDeviation = this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(formCtrl['standardDeviation'].value), conversionValue, isEnableUnitConversion);
    materialInfo.scrapRecovery = Number(formCtrl['scrapRecovery'].value);
    materialInfo.netWeight = formCtrl['netWeight'].value;
    materialInfo.netWeightPercentage = formCtrl['netWeightPercentage'].value;
    materialInfo.totalEsgImpactCO2Kg = formCtrl['totalEsgImpactCO2Kg'].value;
    materialInfo.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partProjectArea'].value, conversionValue, isEnableUnitConversion);
    materialInfo.projectedArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['projectedArea'].value, conversionValue, isEnableUnitConversion);
    materialInfo.utilisation = formCtrl['utilisation'].value;
    materialInfo.runnerDia = this.sharedService.convertUomToSaveAndCalculation(formCtrl['runnerDia'].value, conversionValue, isEnableUnitConversion);
    materialInfo.runnerLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['runnerLength'].value, conversionValue, isEnableUnitConversion);
    materialInfo.scrapWeight = formCtrl['scrapWeight'].value;
    materialInfo.primerMatPrice = formCtrl['primerMatPrice'].value || 7.73;
    materialInfo.primerCoatingTickness = formCtrl['primerCoatingTickness'].value;
    materialInfo.primerNetWeight = formCtrl['primerNetWeight'].value;
    materialInfo.primerDensity = formCtrl['primerDensity'].value;
    materialInfo.runnerType = formCtrl['runnerType'].value || 'Hot Runner';
    materialInfo.volumePurchased = formCtrl['volumePurchased'].value;
    materialInfo.volumeDiscountPer = formCtrl['volumeDiscountPer'].value;
    materialInfo.coilDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['coilDiameter'].value || 5, conversionValue, isEnableUnitConversion);
    materialInfo.coilLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['coilLength'].value, conversionValue, isEnableUnitConversion) || 300000;
    materialInfo.cuttingAllowance = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingAllowance'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partOuterDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partOuterDiameter'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partInnerDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partInnerDiameter'].value, conversionValue, isEnableUnitConversion);
    materialInfo.inputBilletLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['inputBilletLength'].value, conversionValue, isEnableUnitConversion);
    materialInfo.inputBilletWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['inputBilletWidth'].value, conversionValue, isEnableUnitConversion);
    materialInfo.inputBilletHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['inputBilletHeight'].value, conversionValue, isEnableUnitConversion);
    materialInfo.inputBilletDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['inputBilletDiameter'].value, conversionValue, isEnableUnitConversion);
    materialInfo.wireDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['wireDiameter'].value, conversionValue, isEnableUnitConversion);
    materialInfo.unfoldedPartVolume = formCtrl['unfoldedPartVolume'].value;
    materialInfo.unbendPartWeight = formCtrl['unbendPartWeight'].value;
    materialInfo.paintArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['paintArea'].value, conversionValue, isEnableUnitConversion);
    materialInfo.partTickness = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partTickness'].value, conversionValue, isEnableUnitConversion);
    materialInfo.typeOfWeld = formCtrl['typeOfWeld'].value;
    materialInfo.typeOfMaterialBase = formCtrl['typeOfMaterialBase'].value || (processFlag.IsProcessTypeGalvanization ? 1 : 0);
    materialInfo.primerCoatingTickness = formCtrl['primerCoatingTickness'].value;
    // materialInfo.primerDensity = formCtrl['primerDensity'].value;
    materialInfo.totalPaintCostsqm = formCtrl['totalPaintCostsqm'].value;
    materialInfo.partAllowance = formCtrl['partAllowance'].value;
    materialInfo.coilWidth = this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(formCtrl['coilWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.coilLength = this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(formCtrl['coilLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partsPerCoil = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partsPerCoil'].value, conversionValue, isEnableUnitConversion);
    materialInfo.grossWeight = formCtrl['grossWeight'].value;
    materialInfo.blankDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['blankDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partSurfaceArea'].value), conversionValue, isEnableUnitConversion);
    materialInfo.finalComponentDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['finalComponentDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.enterStartEndScrapLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['enterStartEndScrapLength'].value, conversionValue, isEnableUnitConversion);
    materialInfo.machiningScrapPrice = formCtrl['machiningScrapPrice'].value;
    materialInfo.cavityArrangementLength = this.sharedService.isValidNumber(formCtrl['cavityArrangementLength'].value);
    materialInfo.cavityArrangementWidth = this.sharedService.isValidNumber(formCtrl['cavityArrangementWidth'].value);
    materialInfo.noOfCavities = Number(formCtrl['noOfCavities'].value);
    materialInfo.runnerRiser = formCtrl['runnerRiser'].value;
    materialInfo.runnerRiserPercentage = formCtrl['runnerRiserPercentage'].value;
    materialInfo.machineScrapWeight = formCtrl['machineScrapWeight'].value;
    materialInfo.oxidationLossWeight = formCtrl['oxidationLossWeight'].value;
    materialInfo.oxidationLossWeightPercentage = formCtrl['oxidationLossWeightPercentage'].value;
    materialInfo.sandRecovery = formCtrl['sandRecovery'].value;
    materialInfo.sandRecoveryPercentage = formCtrl['sandRecoveryPercentage'].value;
    materialInfo.pouringWeight = formCtrl['pouringWeight'].value;
    materialInfo.totalPouringWeight = formCtrl['totalPouringWeight'].value;
    materialInfo.cavityEnvelopLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cavityEnvelopLength'].value, conversionValue, isEnableUnitConversion);
    materialInfo.cavityEnvelopWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cavityEnvelopWidth'].value, conversionValue, isEnableUnitConversion);
    materialInfo.cavityEnvelopHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cavityEnvelopHeight'].value, conversionValue, isEnableUnitConversion);
    materialInfo.castingVolume = this.sharedService.convertUomToSaveAndCalculation(formCtrl['castingVolume'].value, conversionValue, isEnableUnitConversion);
    materialInfo.moldBoxLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['moldBoxLength'].value, conversionValue, isEnableUnitConversion);
    materialInfo.moldBoxHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['moldBoxHeight'].value, conversionValue, isEnableUnitConversion);
    materialInfo.moldBoxWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['moldBoxWidth'].value, conversionValue, isEnableUnitConversion);
    materialInfo.boxVolume = this.sharedService.convertUomToSaveAndCalculation(formCtrl['boxVolume'].value, conversionValue, isEnableUnitConversion);
    materialInfo.coreVolume = this.sharedService.convertUomToSaveAndCalculation(formCtrl['coreVolume'].value, conversionValue, isEnableUnitConversion);
    materialInfo.totalSandVolume = this.sharedService.convertUomToSaveAndCalculation(formCtrl['totalSandVolume'].value, conversionValue, isEnableUnitConversion);
    materialInfo.moldSandWeight = formCtrl['moldSandWeight'].value;
    materialInfo.sandWeightAfterRecovery = formCtrl['sandWeightAfterRecovery'].value;
    materialInfo.totalCoreWeight = formCtrl['totalCoreWeight'].value;
    materialInfo.sandWeightAfterRecovery = formCtrl['sandWeightAfterRecovery'].value;
    materialInfo.partLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['partLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['stockDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['stockLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockOuterDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['stockOuterDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockInnerDiameter = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['stockInnerDiameter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockCrossSectionWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['stockCrossSectionWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockCrossSectionHeight = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['stockCrossSectionHeight'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockHexSideDimension = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['stockHexSideDimension'].value), conversionValue, isEnableUnitConversion);
    materialInfo.stockCrossSectionArea = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['stockCrossSectionArea'].value), conversionValue, isEnableUnitConversion);
    materialInfo.blockLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['blockLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.blockWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['blockWidth'].value), conversionValue, isEnableUnitConversion);
    materialInfo.blockHeight = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['blockHeight'].value), conversionValue, isEnableUnitConversion);
    materialInfo.diameterAllowance = Number(formCtrl['diameterAllowance'].value);
    materialInfo.lengthAllowance = Number(formCtrl['lengthAllowance'].value);
    materialInfo.heightAllowance = Number(formCtrl['heightAllowance'].value);
    materialInfo.widthAllowance = Number(formCtrl['widthAllowance'].value);
    materialInfo.stockHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['blockHeight'].value, conversionValue, isEnableUnitConversion);
    materialInfo.stockWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['blockWidth'].value, conversionValue, isEnableUnitConversion);
    materialInfo.effeciency = formCtrl['effeciency'].value;
    materialInfo.totalWeldLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['totalWeldLength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.beadSize = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['beadSize'].value), conversionValue, isEnableUnitConversion);
    materialInfo.totalWeldBeadArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['totalWeldBeadArea'].value, conversionValue, isEnableUnitConversion);
    materialInfo.weldWeightWastage = formCtrl['weldWeightWastage'].value;
    materialInfo.sheetLength = formCtrl['sheetLength'].value;
    materialInfo.sheetWidth = formCtrl['sheetWidth'].value;
    materialInfo.sheetThickness = formCtrl['sheetThickness'].value;
    materialInfo.sandCost = defaultValues.sandCost;
    materialInfo.thermoFormingList = thermoFormingList;
    materialInfo.typeOfCable = formCtrl['typeOfCable'].value;
    materialInfo.typeOfConductor = formCtrl['typeOfConductor'].value;
    materialInfo.totalCableLength = formCtrl['totalCableLength'].value;
    materialInfo.noOfCables = formCtrl['noOfCables'].value;
    materialInfo.noOfCablesWithSameDia = formCtrl['noOfCablesWithSameDia'].value;
    materialInfo.mainInsulatorID = formCtrl['mainInsulatorID'].value;
    materialInfo.mainInsulatorOD = formCtrl['mainInsulatorOD'].value;
    materialInfo.mainCableSheathingMaterial = formCtrl['mainCableSheathingMaterial'].value;
    materialInfo.percentageOfReduction = formCtrl['percentageOfReduction'].value;
    materialInfo.noOfDrawSteps = formCtrl['noOfDrawSteps'].value;
    materialInfo.pitchForWireCutting = formCtrl['pitchForWireCutting'].value;
    materialInfo.totalCostOfRawMaterials = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['totalCostOfRawMaterials'].value), conversionValue, isEnableUnitConversion);
    materialInfo.perimeter = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['perimeter'].value), conversionValue, isEnableUnitConversion);
    materialInfo.flashVolume = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['flashVolume'].value), conversionValue, isEnableUnitConversion);
    materialInfo.scaleLoss = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['scaleLoss'].value), conversionValue, isEnableUnitConversion);
    materialInfo.grossVolumne = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['grossVolumne'].value), conversionValue, isEnableUnitConversion);
    materialInfo.yeildUtilization = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['yeildUtilization'].value), conversionValue, isEnableUnitConversion);
    materialInfo.ultimateTensileStrength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['ultimateTensileStrength'].value), conversionValue, isEnableUnitConversion);
    materialInfo.cuttingLoss = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['cuttingLoss'].value), conversionValue, isEnableUnitConversion);
  }

  materialFormPatchResults(result: MaterialInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      runnerProjectedArea: this.sharedService.isValidNumber(result.runnerProjectedArea),
      runnerPartVolume: this.sharedService.isValidNumber(result.runnerPartVolume),
      runnerDia: this.sharedService.convertUomInUI(result.runnerDia, conversionValue, isEnableUnitConversion),
      runnerType: result.runnerType,
      scrapWeight: this.sharedService.isValidNumber(Number(result.scrapWeight)),
      grossWeight: this.sharedService.isValidNumber(Number(result.grossWeight)),
      grossMaterialCost: this.sharedService.isValidNumber(Number(result.materialCostPart)),
      netMaterialCost: this.sharedService.isValidNumber(Number(result.netMatCost)),
      scrapRecCost: this.sharedService.isValidNumber(Number(result.scrapRecCost)),
      partVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partVolume)), conversionValue, isEnableUnitConversion),
      utilisation: this.sharedService.isValidNumber(Number(result.utilisation)),
      partAllowance: this.sharedService.isValidNumber(Number(result.partAllowance)),
      runnerLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.runnerLength)), conversionValue, isEnableUnitConversion),
      partProjectArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partProjectedArea)), conversionValue, isEnableUnitConversion),
      netWeight: this.sharedService.isValidNumber(Number(result.netWeight)),
      netWeightPercentage: this.sharedService.isValidNumber(Number(result.netWeightPercentage)),
      esgImpactCO2Kg: this.sharedService.isValidNumber(Number(result.esgImpactCO2Kg)),
      totalEsgImpactCO2Kg: this.sharedService.isValidNumber(Number(result.totalEsgImpactCO2Kg)),
      scrapPrice: this.sharedService.isValidNumber(Number(result.scrapPricePerKg)),
      matPrice: this.sharedService.isValidNumber(Number(result.materialPricePerKg)),
      density: this.sharedService.isValidNumber(Number(result.density)),
      volumeDiscountPer: this.sharedService.isValidNumber(Number(result.volumeDiscountPer)),
      coilLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.coilLength), conversionValue, isEnableUnitConversion),
      coilWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.coilWidth), conversionValue, isEnableUnitConversion),
      coilWeight: this.sharedService.isValidNumber(result.coilWeight),
      partsPerCoil: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partsPerCoil), conversionValue, isEnableUnitConversion),
      partLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partLength)), conversionValue, isEnableUnitConversion),
      partOuterDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partOuterDiameter)), conversionValue, isEnableUnitConversion),
      partInnerDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.partInnerDiameter)), conversionValue, isEnableUnitConversion),
      enterStartEndScrapLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result.enterStartEndScrapLength)), conversionValue, isEnableUnitConversion),
      totalPartStockLength: this.sharedService.isValidNumber(Number(result.totalPartStockLength)),
      sheetWeight: this.sharedService.isValidNumber(Number(result?.sheetWeight)),
      unbendPartWeight: this.sharedService.isValidNumber(Number(result.unbendPartWeight)),
      noOfCavities: this.sharedService.isValidNumber(Number(result?.noOfCavities)),
      cavityArrangementLength: this.sharedService.isValidNumber(Number(result?.cavityArrangementLength)),
      cavityArrangementWidth: this.sharedService.isValidNumber(Number(result?.cavityArrangementWidth)),
      blankDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.blankDiameter), conversionValue, isEnableUnitConversion),
      finalComponentDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.finalComponentDiameter), conversionValue, isEnableUnitConversion),
      partSurfaceArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.partSurfaceArea), conversionValue, isEnableUnitConversion),
      scrapRecovery: this.sharedService.isValidNumber(Number(result?.scrapRecovery)),
      totalPouringWeight: this.sharedService.isValidNumber(Number(result?.totalPouringWeight)),
      pouringWeight: this.sharedService.isValidNumber(Number(result?.pouringWeight)),
      oxidationLossWeight: this.sharedService.isValidNumber(Number(result?.oxidationLossWeight)),
      oxidationLossWeightPercentage: this.sharedService.isValidNumber(Number(result?.oxidationLossWeightPercentage)),
      runnerRiser: this.sharedService.isValidNumber(Number(result?.runnerRiser)),
      runnerRiserPercentage: this.sharedService.isValidNumber(Number(result?.runnerRiserPercentage)),
      machineScrapWeight: this.sharedService.isValidNumber(Number(result?.machineScrapWeight)),
      materialCostPart: this.sharedService.isValidNumber(Number(result.materialCostPart)),
      machiningScrapPrice: this.sharedService.isValidNumber(Number(result?.machiningScrapPrice)),
      sandRecovery: this.sharedService.isValidNumber(result?.sandRecovery),
      sandRecoveryPercentage: this.sharedService.isValidNumber(result?.sandRecoveryPercentage),
      cavityEnvelopLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.cavityEnvelopLength), conversionValue, isEnableUnitConversion),
      cavityEnvelopWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.cavityEnvelopWidth), conversionValue, isEnableUnitConversion),
      cavityEnvelopHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.cavityEnvelopHeight), conversionValue, isEnableUnitConversion),
      castingVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.castingVolume), conversionValue, isEnableUnitConversion),
      moldBoxLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.moldBoxLength), conversionValue, isEnableUnitConversion),
      moldBoxHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.moldBoxHeight), conversionValue, isEnableUnitConversion),
      moldBoxWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.moldBoxWidth), conversionValue, isEnableUnitConversion),
      coreVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.coreVolume), conversionValue, isEnableUnitConversion),
      boxVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.boxVolume), conversionValue, isEnableUnitConversion),
      totalSandVolume: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result?.totalSandVolume), conversionValue, isEnableUnitConversion),
      moldSandWeight: this.sharedService.isValidNumber(result?.moldSandWeight),
      sandWeightAfterRecovery: this.sharedService.isValidNumber(result?.sandWeightAfterRecovery),
      totalCoreWeight: this.sharedService.isValidNumber(Number(result?.totalCoreWeight)),
      volumePurchased: this.sharedService.isValidNumber(Number(result?.volumePurchased)),
      blockLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result?.blockLength)), conversionValue, isEnableUnitConversion),
      blockHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result?.blockHeight)), conversionValue, isEnableUnitConversion),
      blockWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result?.blockWidth)), conversionValue, isEnableUnitConversion),
      effeciency: this.sharedService.isValidNumber(Number(result.effeciency)),
      totalWeldBeadArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.totalWeldBeadArea), conversionValue, isEnableUnitConversion),
      weldWeightWastage: this.sharedService.isValidNumber(result.weldWeightWastage),
      paintArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.paintArea), conversionValue, isEnableUnitConversion),
      paintCoatingTickness: this.sharedService.isValidNumber(result.paintCoatingTickness),
      partTickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partTickness), conversionValue, isEnableUnitConversion),
      typeOfWeld: result.typeOfWeld,
      typeOfMaterialBase: result.typeOfMaterialBase,
      totalPaintCostsqm: this.sharedService.isValidNumber(result.totalPaintCostsqm),
      stockDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockDiameter), conversionValue, isEnableUnitConversion),
      stockOuterDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockOuterDiameter), conversionValue, isEnableUnitConversion),
      stockInnerDiameter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockInnerDiameter), conversionValue, isEnableUnitConversion),
      stockCrossSectionWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockCrossSectionWidth), conversionValue, isEnableUnitConversion),
      stockCrossSectionHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.stockCrossSectionHeight), conversionValue, isEnableUnitConversion),
      sheetLength: this.sharedService.isValidNumber(result.sheetLength),
      sheetWidth: this.sharedService.isValidNumber(result.sheetWidth),
      sheetThickness: this.sharedService.isValidNumber(result.sheetThickness),
      primerMatPrice: this.sharedService.isValidNumber(result.primerMatPrice),
      primerCoatingTickness: this.sharedService.isValidNumber(result.primerCoatingTickness),
      primerNetWeight: this.sharedService.isValidNumber(result.primerNetWeight),
      primerDensity: this.sharedService.isValidNumber(result.primerDensity),
      inputBilletLength: this.sharedService.convertUomInUI(result.inputBilletLength, conversionValue, isEnableUnitConversion),
      inputBilletWidth: this.sharedService.convertUomInUI(result.inputBilletWidth, conversionValue, isEnableUnitConversion),
      inputBilletHeight: this.sharedService.convertUomInUI(result.inputBilletHeight, conversionValue, isEnableUnitConversion),
      inputBilletDiameter: this.sharedService.convertUomInUI(result.inputBilletDiameter, conversionValue, isEnableUnitConversion),
      weldLegLength: this.sharedService.convertUomInUI(result.weldLegLength, conversionValue, isEnableUnitConversion),
      wireDiameter: this.sharedService.convertUomInUI(result.wireDiameter, conversionValue, isEnableUnitConversion),
      numOfConductors: this.sharedService.isValidNumber(result.numOfConductors),
      totalCableLength: this.sharedService.isValidNumber(result.totalCableLength),
      noOfCables: this.sharedService.isValidNumber(result.noOfCables),
      noOfCablesWithSameDia: this.sharedService.isValidNumber(result.noOfCablesWithSameDia),
      mainInsulatorID: this.sharedService.isValidNumber(result.mainInsulatorID),
      mainInsulatorOD: this.sharedService.isValidNumber(result.mainInsulatorOD),
      percentageOfReduction: this.sharedService.isValidNumber(result.percentageOfReduction),
      noOfDrawSteps: this.sharedService.isValidNumber(result.noOfDrawSteps),
      pitchForWireCutting: this.sharedService.isValidNumber(result.pitchForWireCutting),
      totalCostOfRawMaterials: this.sharedService.isValidNumber(result.totalCostOfRawMaterials),
      perimeter: this.sharedService.isValidNumber(result.perimeter),
      flashVolume: this.sharedService.isValidNumber(result.flashVolume),
      scaleLoss: this.sharedService.isValidNumber(result.scaleLoss),
      grossVolumne: this.sharedService.isValidNumber(result.grossVolumne),
      yeildUtilization: this.sharedService.isValidNumber(result.yeildUtilization),
      ultimateTensileStrength: this.sharedService.isValidNumber(result.ultimateTensileStrength),
      cuttingLoss: this.sharedService.isValidNumber(result.cuttingLoss),
      stockLength: this.sharedService.isValidNumber(result.stockLength),
      typeOfCable: this.sharedService.isValidNumber(result.typeOfCable),
      castingMaterial: this.materialCastingMapper.castingMaterialFormPatchResults(result, conversionValue, isEnableUnitConversion),
      metalExtrusionMaterial: this.materialMetalExtrusionMapper.metalExtrusionMaterialFormPatchResults(result, conversionValue, isEnableUnitConversion),
      machiningMaterial: this.materialMachiningConfigService.formPatchResults(result, conversionValue, isEnableUnitConversion),
      tubeBendingMaterial: this.materialTubeBendingMapper.tubeBendingFormPatchResults(result, conversionValue, isEnableUnitConversion),
      insulationJacketMaterial: this.materialInsulationJacketMapper.insulationJacketFormPatchResults(result, conversionValue, isEnableUnitConversion),
      pcbMaterial: this.materialPcbMapper.formPatch(result, conversionValue, isEnableUnitConversion),
      plasticTubeExtrusionMaterial: this.materialPlasticTubeExtrusionMapper.plasticTubeExtrusionFormPatchResults(result, conversionValue, isEnableUnitConversion),
      // plasticVacuumFormingMaterial: this.materialPlasticVacuumFormingMapper.plasticVacuumFormingFormPatchResults(result),
      hotForgingClosedDieHotMaterial: this.materialHotForgingClosedDieHotMapper.hotForgingClosedDieHotFormPatchResults(result, conversionValue, isEnableUnitConversion),
      customCableMaterial: this.materialCustomCableMapper.formPatchResults(result, conversionValue, isEnableUnitConversion),
      pcbaMaterial: this.materialPcbaMapper.formPatchResults(result),
      materialSustainability: this.materialSustainabilityMapper.materialSustainabilityFormPatchResults(result),
      rigidFlexMaterial: this.rigidFlexMapper.formPatchResults(result),
      injectionMoldingMaterial: this.injectionMoldingMapper.formPatchResults(result, conversionValue, isEnableUnitConversion),
      compressionMoldingMaterial: this.compressionMoldingMapper.formPatchResults(result, conversionValue, isEnableUnitConversion),
      sheetMetalMaterial: this.sheetMetalMaterialMapper.formPatchResults(result, conversionValue, isEnableUnitConversion),
    };
  }

  materialFormSubmit(formCtrl, conversionValue, isEnableUnitConversion, partInfoId, isPartialCreate, materialMarketDto, materialMasterDto, materialMarketData, dataCompletionPercentage) {
    const materialInfoDto = new MaterialInfoDto();
    materialInfoDto.materialMarketData = materialMarketDto;
    materialInfoDto.materialInfoId = isPartialCreate ? 0 : formCtrl['materialInfoId'].value || 0;
    materialInfoDto.baseMaterialDescription = formCtrl['baseMaterialDescription'].value || 0;
    materialInfoDto.baseMaterialTypeId = formCtrl['baseMaterialFamily'].value || 0;
    materialInfoDto.partInfoId = partInfoId || 0;
    materialInfoDto.materialMarketId = materialMarketData.materialMarketId || undefined;
    materialInfoDto.materialDescription = materialMasterDto.materialDescription;
    materialInfoDto.processId = formCtrl['matPrimaryProcessName'].value || null;
    materialInfoDto.density = formCtrl['density'].value || 0;
    materialInfoDto.netWeight = formCtrl['netWeight'].value;
    materialInfoDto.netWeightPercentage = formCtrl['netWeightPercentage'].value;
    materialInfoDto.grossWeight = formCtrl['grossWeight'].value || 0;
    materialInfoDto.scrapWeight = formCtrl['scrapWeight'].value || 0;
    materialInfoDto.materialYield = materialInfoDto.grossWeight > 0 && materialInfoDto.netWeight > 0 ? (materialInfoDto.netWeight ?? (0 / materialInfoDto.grossWeight) * 100) : 0;
    materialInfoDto.maxFlowlength =
      materialInfoDto.noOfCavities == 1
        ? materialInfoDto.dimX + 70
        : (materialInfoDto.noOfCavities == 2
            ? materialInfoDto.dimX + 70 + 30
            : materialInfoDto.noOfCavities == 4
              ? materialInfoDto.dimX + materialInfoDto.dimX + 30 + 30 + 70
              : materialInfoDto.noOfCavities == 6
                ? materialInfoDto.dimX + materialInfoDto.dimX + 40 + 40 + 70
                : materialInfoDto.noOfCavities == 8
                  ? materialInfoDto.dimX + materialInfoDto.dimX + 40 + 40 + 40 + 70
                  : 0) / materialInfoDto.noOfCavities;
    // materialInfoDto.runnerLength =
    //   materialInfoDto.dimZ + 20 + 25 + materialInfoDto.noOfCavities * 20;
    materialInfoDto.volumeDiscountPer = formCtrl['volumeDiscountPer'].value || 0;
    materialInfoDto.runnerLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['runnerLength'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.regrindAllowance = formCtrl['regrindAllowance'].value || 10;
    materialInfoDto.scrapRecovery = formCtrl['scrapRecovery'].value || 90;
    materialInfoDto.materialPricePerKg = formCtrl['matPrice'].value || 0;
    materialInfoDto.scrapPricePerKg = formCtrl['scrapPrice'].value || 0;
    materialInfoDto.materialCostPart = formCtrl['grossMaterialCost'].value || 0;
    materialInfoDto.partFinish = parseInt(formCtrl['partFinish'].value) || 0;
    materialInfoDto.noOfInserts = formCtrl['noOfInserts'].value || 0;
    materialInfoDto.calculationMethod = '';
    materialInfoDto.dimX = this.sharedService.convertUomToSaveAndCalculation(formCtrl['length'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.dimY = this.sharedService.convertUomToSaveAndCalculation(formCtrl['width'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.dimZ = this.sharedService.convertUomToSaveAndCalculation(formCtrl['height'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.dimArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partProjectArea'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.dimVolume = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partVolume'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.dimUnfoldedX = this.sharedService.convertUomToSaveAndCalculation(formCtrl['unfoldedLength'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.dimUnfoldedY = this.sharedService.convertUomToSaveAndCalculation(formCtrl['unfoldedWidth'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.dimUnfoldedZ = this.sharedService.convertUomToSaveAndCalculation(formCtrl['thickness'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.partAllowance = formCtrl['partAllowance'].value || 0;
    materialInfoDto.utilisation = formCtrl['utilisation'].value || 0;
    materialInfoDto.netMatCost = formCtrl['netMaterialCost'].value || 0;
    materialInfoDto.scrapRecCost = formCtrl['scrapRecCost'].value || 0;
    materialInfoDto.noOfCavities = formCtrl['noOfCavities'].value || 1;
    materialInfoDto.runnerDia = this.sharedService.convertUomToSaveAndCalculation(formCtrl['runnerDia'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.runnerType = formCtrl['runnerType'].value || 'Hot Runner';
    materialInfoDto.wallThickFactor = this.sharedService.convertUomToSaveAndCalculation(formCtrl['wallAverageThickness'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.wallAverageThickness = this.sharedService.convertUomToSaveAndCalculation(formCtrl['wallAverageThickness'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.wallThickessMm = this.sharedService.convertUomToSaveAndCalculation(formCtrl['maxWallthick'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.txtWindows = formCtrl['windowsArea'].value || 200;
    materialInfoDto.coilWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['coilWidth'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.coilLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['coilLength'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.coilWeight = formCtrl['coilWeight'].value || 0;
    materialInfoDto.unfoldedSheetweight = formCtrl['unfoldedSheetWeight'].value || 0;
    materialInfoDto.partsPerCoil = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partsPerCoil'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.enterStartEndScrapLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['enterStartEndScrapLength'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.standardDeviation = this.sharedService.convertUomToSaveAndCalculation(formCtrl['standardDeviation'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.unfoldedPartVolume = formCtrl['unfoldedPartVolume'].value;
    materialInfoDto.colorant = '';
    materialInfoDto.colorantPer = 0;
    materialInfoDto.colorantCost = 0;
    materialInfoDto.partShape = '';
    materialInfoDto.colorantPrice = 0;
    //materialInfoDto.runnerLength = 0;
    materialInfoDto.flowFactor = 0;
    materialInfoDto.maxFlowlength = 0;
    materialInfoDto.injPressure = 0;
    materialInfoDto.projectedArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['projectedArea'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.calcTonn = 0;
    materialInfoDto.closingTime = 0;
    materialInfoDto.injectionTime = 0;
    materialInfoDto.holdingTime = 0;
    materialInfoDto.coolingTime = 0;
    materialInfoDto.ejectionTime = 0;
    materialInfoDto.pickPlaceTime = 0;
    materialInfoDto.openingTime = 0;
    materialInfoDto.totCycleTime = 0;
    materialInfoDto.dataCompletionPercentage = dataCompletionPercentage;
    materialInfoDto.partProjectedArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partProjectArea'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.partVolume = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partVolume'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.runnerProjectedArea = formCtrl['runnerProjectedArea'].value;
    materialInfoDto.runnerVolume = formCtrl['runnerVolume'].value;
    materialInfoDto.volumePurchased = formCtrl['volumePurchased'].value;
    materialInfoDto.partOuterDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partOuterDiameter'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.partInnerDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partInnerDiameter'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.partLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partLength'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.coilDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['coilDiameter'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.cuttingAllowance = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingAllowance'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.totalPartStockLength = formCtrl['totalPartStockLength'].value || 0;
    materialInfoDto.secondaryProcessId = formCtrl['secondaryProcessId'].value || null;
    materialInfoDto.machiningScrapPrice = formCtrl['machiningScrapPrice'].value || 0;
    //materialInfoDto.esgImpactCO2Kg = formCtrl['esgImpactCO2Kg'].value || 0;
    //materialInfoDto.totalEsgImpactCO2Kg = formCtrl['totalEsgImpactCO2Kg'].value || 0;
    materialInfoDto.runnerRiser = formCtrl['runnerRiser'].value || 0;
    materialInfoDto.runnerRiserPercentage = formCtrl['runnerRiserPercentage'].value || 0;
    materialInfoDto.oxidationLossWeight = formCtrl['oxidationLossWeight'].value || 0;
    materialInfoDto.oxidationLossWeightPercentage = formCtrl['oxidationLossWeightPercentage'].value || 0;
    materialInfoDto.pouringWeight = formCtrl['pouringWeight'].value || 0;
    materialInfoDto.cavityArrangementLength = formCtrl['cavityArrangementLength'].value || 0;
    materialInfoDto.cavityArrangementWidth = formCtrl['cavityArrangementWidth'].value || 0;
    materialInfoDto.totalPouringWeight = formCtrl['totalPouringWeight'].value || 0;
    materialInfoDto.moldBoxLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['moldBoxLength'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.moldBoxHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['moldBoxHeight'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.moldBoxWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['moldBoxWidth'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.moldSandWeight = formCtrl['moldSandWeight'].value || 0;
    materialInfoDto.sandRecovery = Number(formCtrl['sandRecovery'].value) || 0;
    materialInfoDto.sandRecoveryPercentage = Number(formCtrl['sandRecoveryPercentage'].value) || 0;
    materialInfoDto.sandWeightAfterRecovery = formCtrl['sandWeightAfterRecovery'].value || 0;
    materialInfoDto.cavityEnvelopLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cavityEnvelopLength'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.cavityEnvelopWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cavityEnvelopWidth'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.cavityEnvelopHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cavityEnvelopHeight'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.boxVolume = this.sharedService.convertUomToSaveAndCalculation(formCtrl['boxVolume'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.castingVolume = this.sharedService.convertUomToSaveAndCalculation(formCtrl['castingVolume'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.coreVolume = this.sharedService.convertUomToSaveAndCalculation(formCtrl['coreVolume'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.totalSandVolume = this.sharedService.convertUomToSaveAndCalculation(formCtrl['totalSandVolume'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.totalCoreWeight = formCtrl['totalCoreWeight'].value || 0;
    materialInfoDto.machineScrapWeight = formCtrl['machineScrapWeight'].value || 0;
    materialInfoDto.wireDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['wireDiameter'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.beadSize = this.sharedService.convertUomToSaveAndCalculation(formCtrl['beadSize'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.totalWeldLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['totalWeldLength'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.totalWeldBeadArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['totalWeldBeadArea'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.effeciency = formCtrl['effeciency'].value || 0;
    materialInfoDto.weldWeightWastage = formCtrl['weldWeightWastage'].value || 0;
    materialInfoDto.stockDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['stockDiameter'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.stockLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['stockLength'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.stockOuterDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['stockOuterDiameter'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.stockInnerDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['stockInnerDiameter'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.partWidth = formCtrl['partWidth'].value || 0;
    materialInfoDto.partHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partHeight'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.stockCrossSectionWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['stockCrossSectionWidth'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.stockCrossSectionHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['stockCrossSectionHeight'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.stockHexSideDimension = this.sharedService.convertUomToSaveAndCalculation(formCtrl['stockHexSideDimension'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.blockLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['blockLength'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.blockWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['blockWidth'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.blockHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['blockHeight'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.stockCrossSectionArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['stockCrossSectionArea'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.stockType = formCtrl['stockType'].value || 0;
    materialInfoDto.diameterAllowance = formCtrl['diameterAllowance'].value || 0;
    materialInfoDto.lengthAllowance = formCtrl['lengthAllowance'].value || 0;
    materialInfoDto.widthAllowance = formCtrl['widthAllowance'].value || 0;
    materialInfoDto.heightAllowance = formCtrl['heightAllowance'].value || 0;
    materialInfoDto.unbendPartWeight = formCtrl['unbendPartWeight'].value || 0;
    materialInfoDto.blankDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['blankDiameter'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.finalComponentDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['finalComponentDiameter'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.partSurfaceArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partSurfaceArea'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.stockForm = formCtrl['stockForm'].value;
    materialInfoDto.paintArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['paintArea'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.paintCoatingTickness = formCtrl['paintCoatingTickness'].value || 0;
    materialInfoDto.partTickness = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partTickness'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.typeOfWeld = formCtrl['typeOfWeld'].value || 0;
    materialInfoDto.typeOfMaterialBase = formCtrl['typeOfMaterialBase'].value || 0;
    materialInfoDto.totalPaintCostsqm = formCtrl['totalPaintCostsqm'].value || 0;
    materialInfoDto.sheetLength = formCtrl['sheetLength'].value || 0;
    materialInfoDto.sheetWidth = formCtrl['sheetWidth'].value || 0;
    materialInfoDto.sheetThickness = formCtrl['sheetThickness'].value || 0;
    materialInfoDto.primerMatPrice = formCtrl['primerMatPrice'].value || 0;
    materialInfoDto.primerCoatingTickness = formCtrl['primerCoatingTickness'].value || 0;
    materialInfoDto.primerNetWeight = formCtrl['primerNetWeight'].value;
    materialInfoDto.primerDensity = formCtrl['primerDensity'].value || 0;
    materialInfoDto.inputBilletLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['inputBilletLength'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.inputBilletWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['inputBilletWidth'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.inputBilletHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['inputBilletHeight'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.inputBilletDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['inputBilletDiameter'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.weldLegLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['weldLegLength'].value || 0, conversionValue, isEnableUnitConversion);
    materialInfoDto.typeOfCable = Number(formCtrl['typeOfCable'].value);
    materialInfoDto.typeOfConductor = Number(formCtrl['typeOfConductor'].value);
    materialInfoDto.totalCableLength = Number(formCtrl['totalCableLength'].value) || 0;
    materialInfoDto.noOfCables = Number(formCtrl['noOfCables'].value) || 0;
    materialInfoDto.noOfCablesWithSameDia = formCtrl['noOfCablesWithSameDia'].value || 0;
    materialInfoDto.mainInsulatorID = formCtrl['mainInsulatorID'].value;
    materialInfoDto.mainInsulatorOD = formCtrl['mainInsulatorOD'].value;
    materialInfoDto.mainCableSheathingMaterial = formCtrl['mainCableSheathingMaterial'].value;
    materialInfoDto.percentageOfReduction = formCtrl['percentageOfReduction'].value;
    materialInfoDto.noOfDrawSteps = formCtrl['noOfDrawSteps'].value;
    materialInfoDto.pitchForWireCutting = this.sharedService.convertUomToSaveAndCalculation(formCtrl['pitchForWireCutting'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.totalCostOfRawMaterials = this.sharedService.convertUomToSaveAndCalculation(formCtrl['totalCostOfRawMaterials'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.perimeter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['perimeter'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.flashVolume = this.sharedService.convertUomToSaveAndCalculation(formCtrl['flashVolume'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.scaleLoss = this.sharedService.convertUomToSaveAndCalculation(formCtrl['scaleLoss'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.grossVolumne = this.sharedService.convertUomToSaveAndCalculation(formCtrl['grossVolumne'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.yeildUtilization = this.sharedService.convertUomToSaveAndCalculation(formCtrl['yeildUtilization'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.ultimateTensileStrength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['ultimateTensileStrength'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.cuttingLoss = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingLoss'].value, conversionValue, isEnableUnitConversion);
    materialInfoDto.numOfConductors = formCtrl['numOfConductors'].value;
    return materialInfoDto;
  }
}
