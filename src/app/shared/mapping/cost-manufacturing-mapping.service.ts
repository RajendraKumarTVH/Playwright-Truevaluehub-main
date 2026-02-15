import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ElectronicsConfigService } from '../config/manufacturing-electronics-config';
import { ManufacturingMachiningConfigService } from '../config/manufacturing-machining-config';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ManufacturingForgingSubProcessConfigService } from '../config/costing-manufacturing-forging-sub-process-config';
import { AssemblyConfigService } from '../config/manufacturing-assembly-config';
// import { ManufacturingCastingConfigService } from '../config/manufacturing-casting-config.service';
import { ManufacturingCastingMappingService } from './manufacturing-casting-mapping.service';
import { ManufacturingInsulationJacketMappingService } from './manufacturing-insulation-jacket-mapping.service';
import { ManufacturingMetalExtrusionMappingService } from './manufacturing-metal-extrusion-mapping.service';
import { TubeBendingConfigService } from '../config/tube-bending-config';
import { ProcessInfoDto } from '../models';
import { ManufacturingMachiningMappingService } from './manufacturing-machining-mapping.service';
import { ManufacturingCleaningForgingMappingService } from './manufacturing-cleaning-forging-mapping.service';
import { ManufacturingBilletHeatingForgingMappingService } from './manufacturing-billet-heating-forging-mapping.service';
import { ManufacturingTrimmingHydraulicForgingMappingService } from './manufacturing-trimming-hydraulic-forging-mapping.service';
import { ManufacturingStraighteningOptionalForgingMappingService } from './manufacturing-straightening-optional-forging-mapping.service';
import { ManufacturingPiercingHydraulicForgingMappingService } from './manufacturing-piercing-hydraulic-forging-mapping.service';
import { ManufacturingTestingMpiForgingMappingService } from './manufacturing-testing-mpi-forging-mapping.service';
import { ManufacturingTubeBendingMappingService } from './manufacturing-tube-bending-mapping.service';
import { ManufacturingConfigService } from '../config/cost-manufacturing-config';
import { ManufacturingPlasticTubeExtrusionMappingService } from './manufacturing-plastic-tube-extrusion-mapping.service';
import { ManufacturingBrazingMappingService } from './manufacturing-brazing-mapping.service';
import { CompressionMoldingMapperService } from './manufacturing-compression-mold-mapper';
import { SheetMetalProcessMapperService } from 'src/app/shared/mapping/sheet-metal-process-mapper';
import { ManufacturingCustomCableMappingService } from './manufacturing-custom-cable-mapping.service';
import { ManufacturingWiringHarnessMappingService } from './manufacturing-wiring-harness-mapping.service';
import { ManufacturingSustainabilityMappingService } from './manufacturing-sustainability-mapping.service';
import { CommodityType } from '../../modules/costing/costing.config';

@Injectable({
  providedIn: 'root',
})
export class CostManufacturingMappingService {
  constructor(
    private formbuilder: FormBuilder,
    private sharedService: SharedService,
    private _assembly: AssemblyConfigService,
    private _ele: ElectronicsConfigService,
    public _machining: ManufacturingMachiningConfigService,
    public tubeBendingConfig: TubeBendingConfigService,
    public insulationJacketMapper: ManufacturingInsulationJacketMappingService,
    private _forgingSubProcess: ManufacturingForgingSubProcessConfigService,
    public _brazingMapper: ManufacturingBrazingMappingService,
    public _castingMapper: ManufacturingCastingMappingService,
    public _metalExtrusionMapper: ManufacturingMetalExtrusionMappingService,
    public _machiningMapper: ManufacturingMachiningMappingService,
    public _cleaningForgingMapper: ManufacturingCleaningForgingMappingService,
    public _billetHeatingForgingMapper: ManufacturingBilletHeatingForgingMappingService,
    public _trimmingHydraulicForgingMapper: ManufacturingTrimmingHydraulicForgingMappingService,
    public _straighteningOptionalForgingMapper: ManufacturingStraighteningOptionalForgingMappingService,
    public _piercingHydraulicForgingMapper: ManufacturingPiercingHydraulicForgingMappingService,
    public _testingMpiForgingMapper: ManufacturingTestingMpiForgingMappingService,
    public _tubeBendingMapper: ManufacturingTubeBendingMappingService,
    public _manufacturingConfig: ManufacturingConfigService,
    public _plasticTubeExtrusionMapper: ManufacturingPlasticTubeExtrusionMappingService,
    // public _plasticVacuumFormingMapper: ManufacturingPlasticVacuumFormingMappingService,
    public _wiringHarnessMapper: ManufacturingWiringHarnessMappingService,
    public _compressionMoldMapper: CompressionMoldingMapperService,
    public _sheetMetalProcessMapperConfig: SheetMetalProcessMapperService,
    public _customCableMapper: ManufacturingCustomCableMappingService,
    public _sustainabilityMapper: ManufacturingSustainabilityMappingService
  ) {}

  getManufacturingFormFields(conversionValue, isEnableUnitConversion) {
    return {
      processInfoId: [0],
      semiAutoOrAuto: [0],
      sortOrder: [0],
      noOfImpressionsOrCavities: [4],
      cycleTime: [0],
      setUpTime: [0, [Validators.required]],
      noOfLowSkilledLabours: [0, [Validators.required]],
      noOfSkilledLabours: [0, [Validators.required]],
      noOfSemiSkilledLabours: [0],
      lowSkilledLaborRatePerHour: [0, [Validators.required]],
      skilledLaborRatePerHour: [0, [Validators.required]],
      machineHourRate: [0],
      directLaborCost: [0],
      directMachineCost: [0],
      directSetUpCost: [0],
      directTooling: [0],
      yieldPer: [98.5, [Validators.required]],
      yieldCost: [0],
      inspectionTime: [0.5, [Validators.required]],
      inspectionCost: [0],
      samplingRate: [0],
      newToolingRequired: [false],
      directProcessCost: [0, [Validators.required]],
      tableSizeRequired: [''],
      processTypeID: ['', [Validators.required]],
      machineId: ['', [Validators.required]],
      selectedTonnage: [0, [Validators.required]],
      recommendedForce: [0, [Validators.required]],
      totalToolLendingTime: [0, [Validators.required]],
      sheetLoadUloadTime: [0, [Validators.required]],
      theoreticalForce: [0, [Validators.required]],
      noOfBends: [0, [Validators.required]],
      totalTonnageRequired: [0, [Validators.required]],
      bendingLineLength: [0, [Validators.required]],
      shoulderWidth: [0, [Validators.required]],
      bendingCoeffecient: [1.33, Validators.required],
      recommendTonnage: [0, [Validators.required]],
      lengthOfCut: [0, [Validators.required]],
      lineOfInspector: [0, [Validators.required]],
      qaOfInspector: [0, [Validators.required]],
      lineOfInspectorRate: [0, [Validators.required]],
      qaOfInspectorRate: [0, [Validators.required]],
      netGoodParts: [98.5, [Validators.required]],
      noOfStartsPierce: [0, [Validators.required]],
      cuttingSpeed: [0, [Validators.required]],
      cuttingTime: [0, [Validators.required]],
      piercingTime: [0, [Validators.required]],
      totalTime: [0, [Validators.required]],
      insertsPlacement: [0, [Validators.required]],
      sideCoreMechanisms: [0, [Validators.required]],
      moldClosing: [3, [Validators.required]],
      materialInjectionFillTime: [2, [Validators.required]],
      injectionHoldingTime: [4, [Validators.required]],
      moldOpening: [6, [Validators.required]],
      partEjection: [0, [Validators.required]],
      pickAndPlace: [3, [Validators.required]],
      others: [0, [Validators.required]],
      meltTemp: [0],
      ejecTemp: [0],
      mouldTemp: [0],
      thermalDiffusivity: [0],
      maxWallThickess: [0],
      argonGasCost: [0],
      co2GasCost: [0],
      coolingTime: [0],
      rawMaterialCost: [0],
      conversionCost: [0],
      partCost: [0],
      dryCycleTime: [0],
      injectionPressure: [150000],
      qaInspectionCostPerHr: [0],
      lineInspectorCostPerHr: [0],
      inspectionType: [0],
      inspectionLevelValue: [0],
      formLength: [0],
      formHeight: [0],
      totalElectricityConsumption: [0],
      // esgImpactElectricityConsumption: [0],
      totalFactorySpaceRequired: [0],
      // esgImpactFactoryImpact: [0],
      hlFactor: [0],
      subProcessTypeID: [0],
      partDiameter: [0],
      rivetHeadDiameter: [0],
      rivetShankDiameter: [0],
      specificHeatCapacity: [2.13],
      thermalConductivity: [0.187],
      workpieceStockDiameter: [0],
      workpieceStockLength: [0],
      noOfHitsRequired: [0],
      feedPerRev: [0],
      spindleRpm: [0],
      drillDiameter: [0],
      drillDepth: [0],
      yieldStrength: [0],
      formPerimeter: [0],
      moldMaking: [0],
      corePlacement: [0],
      shakeout: [0],
      sandShooting: [0],
      gasingVenting: [30],
      efficiency: [0],
      totalCycleTime: [0],
      noOfParts: [0],
      powerSupply: [700],
      meltingPower: [0],
      totalMeltingTime: [0],
      chargeIntoFurance: [0],
      liquidMetalTransfer: [0],
      idleTimeMelt: [8],
      idleTimeMouldBox: [30],
      efficiencyFactor: [75],
      gravitationalAccelaration: [9.8],
      effectiveMetalHead: [0.02],
      machineCapacity: [0],
      utilisation: [80],
      furnaceCapacityTon: [0],
      workCenterId: [0],
      totalPowerCost: [0],
      totalGasCost: [0],
      muffleLength: [0],
      muffleWidth: [0],
      furanceEfficiency: [60],
      initialTemp: [300],
      finalTemp: [0],
      partEnvelopHeight: [0],
      initialStockHeight: [0],
      punchPerimeter: [0],
      soakingTime: [0],
      forgingShapeFactor: 0,
      partArea: 0,
      flashArea: 0,
      flashThickness: this.sharedService.convertUomInUI(2.5, conversionValue, isEnableUnitConversion),
      cuttingArea: 0,
      furnaceOutput: 0,
      meltingWeight: 0,
      allowanceBetweenParts: this.sharedService.convertUomInUI(50, conversionValue, isEnableUnitConversion),
      allowanceAlongLength: this.sharedService.convertUomInUI(75, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(75, conversionValue, isEnableUnitConversion),
      platenSizeLength: 0,
      platenSizeWidth: 0,
      shotSize: 0,
      clampingPressure: 0,
      injectionTemp: 0,
      liquidTemp: 0,
      moldTemp: 0,
      coolingFactor: 0,
      injectionRate: 0,
      dieClosingTime: 0,
      totalInjectionTime: 0,
      pouringTime: 0,
      dieOpeningTime: 0,
      partExtractionTime: 5,
      lubeTime: 3,
      yieldTimeLoss: 0.95,
      wireGuage: 0,
      noOfWireCableCutting: 0,
      wireCuttingStrippingSpeed: 0,
      noofStroke: 0,
      noOfCore: 0,
      noOfWireOrCrimp: 0,
      noOfConnector: 0,
      moldedPartCost: 0,
      lengthOfCable: 0,
      noOfCable: 0,
      noOfStamping: 0,
      cycleTimeSolderingJoint: 0,
      pricePerWet: 0,
      pricePerthinner: 0,
      ratioCoatingthinner: 0,
      // sliderRequired: 'y',
      lengthOfCoated: 0,
      widthOfCoated: 0,
      coatingthickness: 0,
      solidPercentageCoating: 0,
      appliedPerCentagethin: 0,
      appliedthinnerDollars: 0,
      timeReqPickPlace: 0,
      timeReqClampFixing: 0,
      timeReqRollTape: 0,
      noOfROllReq: 0,
      noOfCableTie: 0,
      noOfLabel: 0,
      addAssemblyTime: 0,
      noOfJointRequired: 0,
      timeRequiredCableTie: 0,
      cycleTimeLabelRequired: 0,
      wireTwistingSpeed: 0,
      lengthOfCutInternal: 0,
      noOfHoles: 0,
      loadingTime: 0,
      processTime: 0,
      rotationTime: 0,
      unloadingTime: 0,
      innerRadius: 0,
      partThickness: 0,
      requiredCurrent: 0,
      requiredWeldingVoltage: 0,
      weldingPosition: 0,
      noOfIntermediateStartAndStop: 0,
      noOfTackWeld: 0,
      noOfWeldPasses: 0,
      travelSpeed: 0,
      powerConsumption: 0,
      electricityUnitCost: 0,
      dieOpeningThickness: 0,
      packAndHoldTime: 0,
      speedOfConveyer: 0,
      injectionTime: 0,
      ejectionUnloadingTime: 0,
      processDetails: '',
      featureDetails: '',
      bourdanRate: 0,
      drawSpeed: 0,
      subProcessList: this.formbuilder.array([]),
      // machiningOperationType: this.formbuilder.array([]),
      coreCycleTimes: this.formbuilder.array([]),
      machineStrokes: 0,
      stitchingCycleTime: 0,
      eolInspectionSamplingRate: 0,
      totalPinPopulation: 0,
      noOfTypesOfPins: 0,
      maxBomQuantityOfIndividualPinTypes: 0,
      noOfStitchingStationsRequired: 0,
      cuttingLength: 0,
      ultimateTensileMaterial: 0,
      shearStrengthMaterial: 0,
      typeOfOperationId: 3,
      blankArea: 0,
      recBedSize: '',
      selectedBedSize: '',
      recommendedDimension: '',
      selectedDimension: '',

      assemblyFormGroup: this.formbuilder.group(this._assembly.getAssemblyFormFields()),
      electronicsFormGroup: this.formbuilder.group(this._ele.getElectronicsFormFields()),
      machiningFormGroup: this.formbuilder.group(this._machiningMapper.getMachiningFormFields()),
      cleaningForgingFormGroup: this.formbuilder.group(this._cleaningForgingMapper.getCleaningForgingFormFields()),
      billetHeatingForgingFormGroup: this.formbuilder.group(this._billetHeatingForgingMapper.getBilletHeatingForgingFormFields()),
      trimmingHydraulicForgingFormGroup: this.formbuilder.group(this._trimmingHydraulicForgingMapper.getTrimmingHydraulicForgingFormFields(conversionValue, isEnableUnitConversion)),
      straighteningOptionalForgingFormGroup: this.formbuilder.group(this._straighteningOptionalForgingMapper.getStraighteningOptionalForgingFormFields(conversionValue, isEnableUnitConversion)),
      piercingHydraulicForgingFormGroup: this.formbuilder.group(this._piercingHydraulicForgingMapper.getPiercingHydraulicForgingFormFields(conversionValue, isEnableUnitConversion)),
      testingMpiForgingFormGroup: this.formbuilder.group(this._testingMpiForgingMapper.getTestingMpiForgingFormFields()),
      tubeBendingFormGroup: this.formbuilder.group(this._tubeBendingMapper.getTubeBendingFormFields()),
      insulationJacketFormGroup: this.formbuilder.group(this.insulationJacketMapper.getInsulationJacketFormFields()),
      forgingSubProcessFormGroup: this.formbuilder.group(this._forgingSubProcess.getForgingFormFields()),
      brazingFormGroup: this.formbuilder.group(this._brazingMapper.getBrazingFormFields()),
      castingFormGroup: this.formbuilder.group(this._castingMapper.getFormFields(conversionValue, isEnableUnitConversion)),
      metalExtrusionFormGroup: this.formbuilder.group(this._metalExtrusionMapper.getMetalExtrusionFormFields()),
      plasticTubeExtrusionFormGroup: this.formbuilder.group(this._plasticTubeExtrusionMapper.getPlasticTubeExtrusionFormFields()),
      // plasticVacuumFormingFormGroup: this.formbuilder.group(this._plasticVacuumFormingMapper.getPlasticVacuumFormingFormFields()),
      compressionMoldingFormGroup: this.formbuilder.group(this._compressionMoldMapper.getFormFields()),
      sheetMetalProcessFormGroup: this.formbuilder.group(this._sheetMetalProcessMapperConfig.getFormFields()),
      customCableFormGroup: this.formbuilder.group(this._customCableMapper.getFormFields()),
      wiringHarnessFormGroup: this.formbuilder.group(this._wiringHarnessMapper.getFormFields()),
      sustainabilityFormGroup: this.formbuilder.group(this._sustainabilityMapper.getSustainabilityFormFields()),
    };
  }

  manufacturingFormReset(conversionValue, isEnableUnitConversion) {
    return {
      processInfoId: 0,
      semiAutoOrAuto: 0,
      // sortOrder: 0,
      noOfImpressionsOrCavities: 4,
      cycleTime: 0,
      samplingRate: 0,
      setUpTime: 0,
      noOfLowSkilledLabours: 0,
      noOfSkilledLabours: 0,
      noOfSemiSkilledLabours: 0,
      lowSkilledLaborRatePerHour: 0,
      skilledLaborRatePerHour: 0,
      machineHourRate: 0,
      directLaborCost: 0,
      directMachineCost: 0,
      directSetUpCost: 0,
      directTooling: 0,
      yieldPer: 98.5,
      yieldCost: 0,
      inspectionTime: 0,
      inspectionCost: 0,
      directProcessCost: 0,
      tableSizeRequired: '',
      processTypeID: '',
      machineId: '',
      selectedTonnage: 0,
      recommendedForce: 0,
      totalToolLendingTime: 0,
      sheetLoadUloadTime: 0,
      theoreticalForce: 0,
      noOfBends: 0,
      totalTonnageRequired: 0,
      bendingLineLength: 0,
      shoulderWidth: 0,
      bendingCoeffecient: 1.33,
      recommendTonnage: 0,
      lineOfInspector: 0,
      qaOfInspector: 0,
      lineOfInspectorrate: 0,
      qaOfInspectorRate: 0,
      netGoodParts: 98.5,
      lengthOfCut: 0,
      noOfStartsPierce: 0,
      cuttingSpeed: 0,
      cuttingTime: 0,
      piercingTime: 0,
      totalTime: 0,
      insertsPlacement: 0,
      sideCoreMechanisms: 0,
      moldClosing: 3,
      materialInjectionFillTime: 2,
      injectionHoldingTime: 4,
      moldOpening: 6,
      partEjection: 0,
      pickAndPlace: 3,
      others: 0,
      meltTemp: 0,
      ejecTemp: 0,
      mouldTemp: 0,
      thermalDiffusivity: 0,
      maxWallThickess: 0,
      argonGasCost: 0,
      co2GasCost: 0,
      coolingTime: 0,
      rawMaterialCost: 0,
      conversionCost: 0,
      partCost: 0,
      dryCycleTime: 0,
      injectionPressure: 150000,
      qaInspectionCostPerHr: 0,
      lineInspectorCostPerHr: 0,
      inspectionType: 0,
      inspectionLevelValue: 0,
      formLength: 0,
      formHeight: 0,
      totalElectricityConsumption: 0,
      // esgImpactElectricityConsumption: 0,
      totalFactorySpaceRequired: 0,
      // esgImpactFactoryImpact: 0,
      hlFactor: 0,
      subProcessTypeID: 0,
      thermalConductivity: 0.187,
      specificHeatCapacity: 2.13,
      workpieceStockDiameter: 0,
      workpieceStockLength: 0,
      noOfHitsRequired: 0,
      feedPerRev: 0,
      spindleRpm: 0,
      drillDiameter: 0,
      drillDepth: 0,
      yieldStrength: 0,
      formPerimeter: 0,
      moldMaking: 0,
      corePlacement: 0,
      shakeout: 0,
      sandShooting: 0,
      gasingVenting: 30,
      efficiency: 0,
      totalCycleTime: 0,
      noOfParts: 0,
      powerSupply: 700,
      meltingPower: 0,
      totalMeltingTime: 0,
      chargeIntoFurance: 0,
      liquidMetalTransfer: 0,
      idleTimeMelt: 8,
      idleTimeMouldBox: 30,
      efficiencyFactor: 75,
      gravitationalAccelaration: 9.8,
      effectiveMetalHead: 0.02,
      machineCapacity: 0,
      utilisation: 80,
      furnaceCapacityTon: 0,
      newToolingRequired: false,
      muffleLength: 0,
      muffleWidth: 0,
      furanceEfficiency: 60,
      initialTemp: 300,
      finalTemp: 0,
      partEnvelopHeight: 0,
      initialStockHeight: 0,
      punchPerimeter: 0,
      soakingTime: 0,
      forgingShapeFactor: 0,
      bourdanRate: 0,
      partArea: 0,
      flashArea: 0,
      flashThickness: this.sharedService.convertUomInUI(2.5, conversionValue, isEnableUnitConversion),
      cuttingArea: 0,
      furnaceOutput: 0,
      meltingWeight: 0,
      allowanceBetweenParts: this.sharedService.convertUomInUI(50, conversionValue, isEnableUnitConversion),
      allowanceAlongLength: this.sharedService.convertUomInUI(75, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(75, conversionValue, isEnableUnitConversion),
      platenSizeLength: 0,
      platenSizeWidth: 0,
      shotSize: 0,
      clampingPressure: 0,
      injectionTemp: 0,
      liquidTemp: 0,
      moldTemp: 0,
      coolingFactor: 0,
      injectionRate: 0,
      dieClosingTime: 0,
      totalInjectionTime: 0,
      pouringTime: 0,
      dieOpeningTime: 0,
      partExtractionTime: 5,
      lubeTime: 3,
      yieldTimeLoss: 0.95,
      wireGuage: 0,
      noOfWireCableCutting: 0,
      wireCuttingStrippingSpeed: 0,
      noofStroke: 0,
      noOfCore: 0,
      noOfWireOrCrimp: 0,
      noOfConnector: 0,
      moldedPartCost: 0,
      lengthOfCable: 0,
      noOfCable: 0,
      noOfStamping: 0,
      cycleTimeSolderingJoint: 0,
      pricePerWet: 0,
      pricePerthinner: 0,
      ratioCoatingthinner: 0,
      // sliderRequired: 'y',
      lengthOfCoated: 0,
      widthOfCoated: 0,
      coatingthickness: 0,
      solidPercentageCoating: 0,
      appliedPerCentagethin: 0,
      appliedthinnerDollars: 0,
      timeReqPickPlace: 0,
      timeReqClampFixing: 0,
      timeReqRollTape: 0,
      noOfROllReq: 0,
      noOfCableTie: 0,
      noOfLabel: 0,
      addAssemblyTime: 0,
      noOfJointRequired: 0,
      timeRequiredCableTie: 0,
      cycleTimeLabelRequired: 0,
      wireTwistingSpeed: 0,
      lengthOfCutInternal: 0,
      noOfHoles: 0,
      loadingTime: 0,
      processTime: 0,
      rotationTime: 0,
      unloadingTime: 0,
      innerRadius: 0,
      partThickness: 0,
      requiredCurrent: 0,
      requiredWeldingVoltage: 0,
      weldingPosition: 0,
      noOfIntermediateStartAndStop: 0,
      noOfTackWeld: 0,
      noOfWeldPasses: 0,
      travelSpeed: 0,
      powerConsumption: 0,
      electricityUnitCost: 0,
      dieOpeningThickness: 0,
      packAndHoldTime: 0,
      speedOfConveyer: 0,
      injectionTime: 0,
      ejectionUnloadingTime: 0,
      processDetails: '',
      featureDetails: '',
      drawSpeed: 0,
      machineStrokes: 0,
      stitchingCycleTime: 0,
      eolInspectionSamplingRate: 0,
      totalPinPopulation: 0,
      noOfTypesOfPins: 0,
      maxBomQuantityOfIndividualPinTypes: 0,
      // cycleTimeForTesting: 0,
      // totalCycleTimeAssemblyTesting: 0,
      // totalCostForAssemblyTesting: 0,
      noOfStitchingStationsRequired: 0,
      cuttingLength: 0,
      ultimateTensileMaterial: 0,
      shearStrengthMaterial: 0,
      typeOfOperationId: 3,
      machiningFormGroup: this._machiningMapper.manufacturingMachiningFormReset(),
      cleaningForgingFormGroup: this._cleaningForgingMapper.manufacturingCleaningForgingFormReset(),
      billetHeatingForgingFormGroup: this._billetHeatingForgingMapper.manufacturingBilletHeatingForgingFormReset(),
      trimmingHydraulicForgingFormGroup: this._trimmingHydraulicForgingMapper.manufacturingTrimmingHydraulicForgingFormReset(conversionValue, isEnableUnitConversion),
      straighteningOptionalForgingFormGroup: this._straighteningOptionalForgingMapper.manufacturingStraighteningOptionalForgingFormReset(conversionValue, isEnableUnitConversion),
      piercingHydraulicForgingFormGroup: this._piercingHydraulicForgingMapper.manufacturingPiercingHydraulicForgingFormReset(conversionValue, isEnableUnitConversion),
      testingMpiForgingFormGroup: this._testingMpiForgingMapper.manufacturingTestingMpiForgingFormReset(),
      tubeBendingFormGroup: this._tubeBendingMapper.manufacturingTubeBendingFormReset(),
      insulationJacketFormGroup: this.insulationJacketMapper.manufacturingInsulationJacketFormReset(),
      brazingFormGroup: this._brazingMapper.manufacturingBrazingFormReset(),
      castingFormGroup: this._castingMapper.manufacturingFormReset(conversionValue, isEnableUnitConversion),
      metalExtrusionFormGroup: this._metalExtrusionMapper.manufacturingMetalExtrusionFormReset(),
      plasticTubeExtrusionFormGroup: this._plasticTubeExtrusionMapper.manufacturingPlasticTubeExtrusionFormReset(),
      // plasticVacuumForming: this._plasticVacuumFormingMapper.manufacturingPlasticVacuumFormingFormReset(),
      compressionMoldingFormGroup: this._compressionMoldMapper.formReset(),
      sheetMetalProcessFormGroup: this._sheetMetalProcessMapperConfig.formReset(),
      customCableFormGroup: this._customCableMapper.manufacturingFormReset(),
      wiringHarnessFormGroup: this._wiringHarnessMapper.manufacturingFormReset(),
      sustainabilityFormGroup: this._sustainabilityMapper.manufacturingSustainabilityFormReset(),
    };
  }

  manufacturingFormPatch(obj: ProcessInfoDto, conversionValue, isEnableUnitConversion, machineInfo: ProcessInfoDto, flags, currentPart?: any, processFlag?: any) {
    return {
      processInfoId: machineInfo?.processInfoId,
      processTypeID: Number(machineInfo?.processTypeID) || 0,
      semiAutoOrAuto: obj.semiAutoOrAuto,
      noOfImpressionsOrCavities: obj.noOfImpressionsOrCavities,
      sortOrder: obj.sortOrder || 0,
      cycleTime: this.sharedService.isValidNumber(obj.cycleTime),
      setUpTime: flags?.IsVisualInspection ? 0 : this.sharedService.isValidNumber(obj.setUpTime),
      noOfLowSkilledLabours: this.sharedService.isValidNumber(obj.noOfLowSkilledLabours),
      noOfSkilledLabours: this.sharedService.isValidNumber(obj.noOfSkilledLabours),
      lowSkilledLaborRatePerHour: flags?.IsVisualInspection ? 0 : this.sharedService.isValidNumber(obj.lowSkilledLaborRatePerHour),
      skilledLaborRatePerHour: flags?.IsVisualInspection ? 0 : this.sharedService.isValidNumber(obj.skilledLaborRatePerHour),
      machineHourRate: this.sharedService.isValidNumber(obj.machineHourRate),
      directLaborCost: this.sharedService.isValidNumber(obj.directLaborCost),
      directMachineCost: this.sharedService.isValidNumber(obj.directMachineCost),
      directSetUpCost: this.sharedService.isValidNumber(obj.directSetUpCost),
      directTooling: this.sharedService.isValidNumber(obj.directTooling),
      yieldPer: obj.yieldPer,
      yieldCost: this.sharedService.isValidNumber(obj.yieldCost),
      inspectionTime: this.sharedService.isValidNumber(obj.inspectionTime),
      samplingRate: flags.IsProcessTypeTesting && !flags.IsCasting ? 0 : this.sharedService.isValidNumber(obj.samplingRate),
      inspectionCost: this.sharedService.isValidNumber(obj.inspectionCost),
      directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost),
      selectedTonnage: this.sharedService.isValidNumber(obj.selectedTonnage),
      recommendedForce: this.sharedService.isValidNumber(obj.recommendedForce),
      totalToolLendingTime: this.sharedService.isValidNumber(obj.totalToolLendingTime),
      sheetLoadUloadTime: this.sharedService.isValidNumber(obj.sheetLoadUloadTime),
      theoreticalForce: this.sharedService.isValidNumber(obj.theoreticalForce),
      noOfBends: obj.noOfbends,
      totalTonnageRequired: this.sharedService.isValidNumber(obj.totalTonnageRequired),
      bendingLineLength: this.sharedService.convertUomInUI(Number(obj.bendingLineLength), conversionValue, isEnableUnitConversion),
      shoulderWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(obj.shoulderWidth), conversionValue, isEnableUnitConversion),
      bendingCoeffecient: this.sharedService.isValidNumber(obj.bendingCoeffecient),
      recommendTonnage: this.sharedService.isValidNumber(obj.recommendTonnage),
      lineOfInspector: this.sharedService.isValidNumber(obj.lineOfInspector),
      qaOfInspector: this.sharedService.isValidNumber(obj.qaOfInspector),
      lineOfInspectorRate: this.sharedService.isValidNumber(obj.lineOfInspectorRate),
      qaOfInspectorRate: this.sharedService.isValidNumber(obj.qaOfInspectorRate),
      netGoodParts: this.sharedService.isValidNumber(obj.netGoodParts),
      lengthOfCut: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(obj.lengthOfCut), conversionValue, isEnableUnitConversion),
      bendingLineLenght: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(obj.bendingLineLength), conversionValue, isEnableUnitConversion),
      noOfStartsPierce: this.sharedService.isValidNumber(obj.noOfStartsPierce),
      cuttingSpeed: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(obj.cuttingSpeed), conversionValue, isEnableUnitConversion),
      cuttingTime: this.sharedService.isValidNumber(obj.cuttingTime),
      piercingTime: this.sharedService.isValidNumber(obj.piercingTime),
      totalTime: this.sharedService.isValidNumber(obj.totalTime),
      insertsPlacement: this.sharedService.isValidNumber(obj.insertsPlacement),
      sideCoreMechanisms: this.sharedService.isValidNumber(obj.sideCoreMechanisms),
      moldClosing: this.sharedService.isValidNumber(obj.moldClosing),
      materialInjectionFillTime: this.sharedService.isValidNumber(obj.materialInjectionFillTime),
      injectionHoldingTime: this.sharedService.isValidNumber(obj.injectionHoldingTime),
      moldOpening: this.sharedService.isValidNumber(obj.moldOpening),
      partEjection: this.sharedService.isValidNumber(obj.partEjection),
      others: this.sharedService.isValidNumber(obj.others),
      dryCycleTime: obj.dryCycleTime || 0,
      injectionPressure: obj.injectionPressure ? obj.injectionPressure : 0,
      qaInspectionCostPerHr: obj.qaInspectionCostPerHr ? this.sharedService.isValidNumber(obj.qaInspectionCostPerHr) : 0,
      lineInspectorCostPerHr: obj.lineInspectorCostPerHr ? this.sharedService.isValidNumber(obj.lineInspectorCostPerHr) : 0,
      formLength: this.sharedService.convertUomInUI(Number(obj.formLength), conversionValue, isEnableUnitConversion),
      formHeight: this.sharedService.convertUomInUI(Number(obj.formHeight), conversionValue, isEnableUnitConversion),
      hlFactor: obj.hlFactor,
      subProcessTypeID: obj.subProcessTypeID,
      coolingTime: obj.coolingTime,
      setUpCost: obj.setUpCost,
      inspectionType: obj.inspectionType || 0,
      inspectionLevel: obj.inspectionLevel,
      workpieceStockDiameter: this.sharedService.convertUomInUI(obj.workpieceStockDiameter, conversionValue, isEnableUnitConversion),
      workpieceStockLength: this.sharedService.convertUomInUI(obj.workpieceStockLength, conversionValue, isEnableUnitConversion),
      noOfHitsRequired: obj.noOfHitsRequired,
      feedPerRev: this.sharedService.convertUomInUI(obj.feedPerRev || 0, conversionValue, isEnableUnitConversion),
      spindleRpm: obj.spindleRpm || 0,
      drillDiameter: this.sharedService.convertUomInUI(obj.drillDiameter || 0, conversionValue, isEnableUnitConversion),
      drillDepth: this.sharedService.convertUomInUI(obj.drillDepth || 0, conversionValue, isEnableUnitConversion),
      formPerimeter: this.sharedService.convertUomInUI(Number(obj.formPerimeter) || 0, conversionValue, isEnableUnitConversion),
      moldMaking: obj.moldMaking,
      corePlacement: obj.corePlacement,
      shakeout: obj.shakeout,
      sandShooting: obj.sandShooting,
      furnaceCapacityTon: obj.furnaceCapacityTon,
      gasingVenting: obj.gasingVenting,
      efficiency: obj.efficiency || this._manufacturingConfig.defaultValues?.machineEfficiency,
      totalCycleTime: obj.totalCycleTime,
      noOfParts: obj.noOfParts,
      powerSupply: obj.powerSupply || 700,
      meltingPower: obj.meltingPower,
      totalMeltingTime: obj.totalMeltingTime,
      chargeIntoFurance: obj.chargeIntoFurance || 30,
      liquidMetalTransfer: obj.liquidMetalTransfer || 8,
      idleTimeMelt: obj.idleTimeMelt || 8,
      idleTimeMouldBox: obj.idleTimeMouldBox || 30,
      efficiencyFactor: obj.efficiencyFactor || 75,
      gravitationalAccelaration: obj.gravitationalAccelaration || 9.8,
      effectiveMetalHead: obj.effectiveMetalHead || 0.02,
      machineCapacity: this.sharedService.convertUomInUI(obj.machcineCapacity, conversionValue, isEnableUnitConversion),
      utilisation: obj.utilisation || 80,
      newToolingRequired: obj.newToolingRequired || false,
      workCenterId: obj.workCenterId,
      totalPowerCost: obj.totalPowerCost || 0,
      totalGasCost: obj.totalGasCost || 0,
      muffleLength: this.sharedService.convertUomInUI(obj.muffleLength, conversionValue, isEnableUnitConversion),
      muffleWidth: this.sharedService.convertUomInUI(obj.muffleWidth, conversionValue, isEnableUnitConversion),
      furanceEfficiency: obj.furanceEfficiency,
      initialTemp: obj.initialTemp || 300,
      finalTemp: obj.finalTemp,
      partEnvelopHeight: this.sharedService.convertUomInUI(obj.partEnvelopHeight, conversionValue, isEnableUnitConversion),
      initialStockHeight: this.sharedService.convertUomInUI(obj.initialStockHeight, conversionValue, isEnableUnitConversion),
      forgingShapeFactor: obj.forgingShapeFactor,
      bourdanRate: obj.bourdanRate,
      punchPerimeter: this.sharedService.convertUomInUI(obj.punchPerimeter, conversionValue, isEnableUnitConversion),
      soakingTime: obj.soakingTime,
      partArea: this.sharedService.convertUomInUI(obj.partArea, conversionValue, isEnableUnitConversion),
      flashArea: this.sharedService.convertUomInUI(obj.flashArea, conversionValue, isEnableUnitConversion),
      flashThickness: this.sharedService.convertUomInUI(obj.flashThickness, conversionValue, isEnableUnitConversion),
      cuttingArea: this.sharedService.convertUomInUI(obj.cuttingArea, conversionValue, isEnableUnitConversion),
      furnaceOutput: obj.furnaceOutput,
      meltingWeight: obj.meltingWeight,
      allowanceBetweenParts: this.sharedService.convertUomInUI(obj.allowanceBetweenParts || 50, conversionValue, isEnableUnitConversion),
      allowanceAlongLength: this.sharedService.convertUomInUI(obj.allowanceAlongLength || 75, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(obj.allowanceAlongWidth || 75, conversionValue, isEnableUnitConversion),
      platenSizeLength: this.sharedService.convertUomInUI(obj.platenSizeLength, conversionValue, isEnableUnitConversion),
      platenSizeWidth: this.sharedService.convertUomInUI(obj.platenSizeWidth, conversionValue, isEnableUnitConversion),
      // sliderRequired: !!obj.platenSizeLength || !!obj.platenSizeWidth ? 'y' : 'n',
      shotSize: obj.shotSize,
      clampingPressure: obj.clampingPressure,
      injectionTemp: obj.injectionTemp,
      liquidTemp: obj.liquidTemp,
      moldTemp: obj.moldTemp,
      coolingFactor: this.sharedService.convertUomInUI(obj.coolingFactor, conversionValue, isEnableUnitConversion),
      injectionRate: this.sharedService.convertUomInUI(obj.injectionRate, conversionValue, isEnableUnitConversion),
      dieClosingTime: obj.dieClosingTime,
      totalInjectionTime: obj.totalInjectionTime,
      pouringTime: obj.pouringTime || 0,
      dieOpeningTime: this.sharedService.convertUomInUI(obj.dieOpeningTime, conversionValue, isEnableUnitConversion),
      partExtractionTime: obj.partExtractionTime || 5,
      lubeTime: obj.lubeTime || 3,
      yieldTimeLoss: obj.yieldTimeLoss,
      wireGuage: obj.wireGuage || 0,
      noOfWireCableCutting: obj.noOfWireCableCutting || 0,
      wireCuttingStrippingSpeed: obj.wireCuttingStrippingSpeed || 0,
      noofStroke: obj.noofStroke || 0,
      noOfCore: obj.noOfCore || 0,
      noOfWireOrCrimp: obj.noOfWireOrCrimp || 0,
      noOfConnector: obj.noOfConnector || 0,
      moldedPartCost: obj.moldedPartCost || 0,
      lengthOfCable: obj.lengthOfCable || 0,
      noOfCable: obj.noOfCable || 0,
      noOfStamping: obj.noOfStamping || 0,
      cycleTimeSolderingJoint: obj.cycleTimeSolderingJoint || 0,
      pricePerWet: obj.pricePerWet || 0,
      pricePerthinner: obj.pricePerthinner || 0,
      ratioCoatingthinner: obj.ratioCoatingthinner || 0,
      lengthOfCoated: this.sharedService.convertUomInUI(obj.lengthOfCoated || 0, conversionValue, isEnableUnitConversion),
      widthOfCoated: this.sharedService.convertUomInUI(obj.widthOfCoated || 0, conversionValue, isEnableUnitConversion),
      coatingthickness: obj.coatingthickness || 0,
      solidPercentageCoating: obj.solidPercentageCoating || 0,
      appliedPerCentagethin: obj.appliedPerCentagethin || 0,
      appliedthinnerDollars: obj.appliedthinnerDollars || 0,
      timeReqPickPlace: obj.timeReqPickPlace || 0,
      timeReqClampFixing: obj.timeReqClampFixing || 0,
      timeReqRollTape: obj.timeReqRollTape || 0,
      noOfROllReq: obj.noOfROllReq || 0,
      noOfCableTie: obj.noOfCableTie || 0,
      noOfLabel: obj.noOfLabel || 0,
      addAssemblyTime: obj.addAssemblyTime || 0,
      noOfJointRequired: obj.noOfJointRequired || 0,
      timeRequiredCableTie: obj.timeRequiredCableTie || 0,
      cycleTimeLabelRequired: obj.cycleTimeLabelRequired || 0,
      wireTwistingSpeed: obj.wireTwistingSpeed || 0,
      totalElectricityConsumption: obj.totalElectricityConsumption || 0,
      // esgImpactElectricityConsumption: obj.esgImpactElectricityConsumption || 0,
      totalFactorySpaceRequired: obj.totalFactorySpaceRequired || 0,
      // esgImpactFactoryImpact: obj.esgImpactFactoryImpact || 0,
      noOfSemiSkilledLabours: obj.noOfSemiSkilledLabours || 0,
      lengthOfCutInternal: this.sharedService.convertUomInUI(obj.lengthOfCutInternal || 0, conversionValue, isEnableUnitConversion),
      noOfHoles: obj.noOfHoles,
      loadingTime: obj.loadingTime || 0,
      processTime: obj.processTime || 0,
      rotationTime: obj.rotationTime || 0,
      unloadingTime: obj.unloadingTime || 0,
      innerRadius: obj.innerRadius || 0,
      partThickness: this.sharedService.convertUomInUI(obj.partThickness || 0, conversionValue, isEnableUnitConversion),
      dieOpeningThickness: this.sharedService.convertUomInUI(obj.dieOpeningThickness || 0, conversionValue, isEnableUnitConversion),
      packAndHoldTime: obj.packAndHoldTime || 0,
      speedOfConveyer: obj.speedOfConveyer || 0,
      injectionTime: this.sharedService.isValidNumber(obj.injectionTime) || 0,
      processDetails: obj.processDetails,
      featureDetails: obj.featureDetails,
      requiredCurrent: obj.requiredCurrent || 0,
      requiredWeldingVoltage: obj.requiredWeldingVoltage || 0,
      noOfIntermediateStartAndStop: obj.noOfIntermediateStartAndStop || 0,
      noOfTackWeld: obj.noOfTackWeld || 0,
      noOfWeldPasses: obj.noOfWeldPasses || 0,
      travelSpeed: obj.travelSpeed || 0,
      powerConsumption: obj.powerConsumption || 0,
      electricityUnitCost: obj.electricityUnitCost || 0,
      weldingPosition: obj.weldingPosition || 0,
      machineStrokes: obj.machineStrokes || 0,
      stitchingCycleTime: obj.stitchingCycleTime || 0,
      eolInspectionSamplingRate: obj.eolInspectionSamplingRate || 0,
      totalPinPopulation: obj.totalPinPopulation || 0,
      noOfTypesOfPins: obj.noOfTypesOfPins || 0,
      maxBomQuantityOfIndividualPinTypes: obj.maxBomQuantityOfIndividualPinTypes,
      noOfStitchingStationsRequired: obj.noOfStitchingStationsRequired,
      cuttingLength: obj.cuttingLength || 0,
      ultimateTensileMaterial: obj.ultimateTensileMaterial || 0,
      shearStrengthMaterial: obj.shearStrengthMaterial || 0,
      typeOfOperationId: obj.typeOfOperationId || 3,
      blankArea: processFlag.IsProcessTypeStamping
        ? obj.subProcessTypeInfos && obj.subProcessTypeInfos.length > 0
          ? obj.subProcessTypeInfos[0]?.blankArea
          : 0
        : this.sharedService.isValidNumber(obj.blankArea),
      electronicsFormGroup: this._ele.electronicsFormPatch(obj),
      assemblyFormGroup: this._assembly.subFormPatch(obj),
      forgingSubProcessFormGroup: this._forgingSubProcess.forgingFormPatch(obj),
      machiningFormGroup: this._machiningMapper.manufacturingMachiningFormPatch(obj),
      cleaningForgingFormGroup: this._cleaningForgingMapper.manufacturingCleaningForgingFormPatch(obj, conversionValue, isEnableUnitConversion),
      billetHeatingForgingFormGroup: this._billetHeatingForgingMapper.manufacturingBilletHeatingForgingFormPatch(obj, conversionValue, isEnableUnitConversion),
      trimmingHydraulicForgingFormGroup: this._trimmingHydraulicForgingMapper.manufacturingTrimmingHydraulicForgingFormPatch(obj, conversionValue, isEnableUnitConversion),
      straighteningOptionalForgingFormGroup: this._straighteningOptionalForgingMapper.manufacturingStraighteningOptionalForgingFormPatch(obj, conversionValue, isEnableUnitConversion),
      piercingHydraulicForgingFormGroup: this._piercingHydraulicForgingMapper.manufacturingPiercingHydraulicForgingFormPatch(obj, conversionValue, isEnableUnitConversion),
      testingMpiForgingFormGroup: this._testingMpiForgingMapper.manufacturingTestingMpiForgingFormPatch(obj, conversionValue, isEnableUnitConversion),
      tubeBendingFormGroup: this._tubeBendingMapper.manufacturingTubeBendingFormPatch(obj),
      insulationJacketFormGroup: this.insulationJacketMapper.manufacturingInsulationJacketFormPatch(obj, conversionValue, isEnableUnitConversion),
      brazingFormGroup: this._brazingMapper.manufacturingBrazingFormPatch(obj, conversionValue, isEnableUnitConversion),
      castingFormGroup: this._castingMapper.manufacturingFormPatch(obj, conversionValue, isEnableUnitConversion),
      metalExtrusionFormGroup: this._metalExtrusionMapper.manufacturingMetalExtrusionFormPatch(obj, conversionValue, isEnableUnitConversion),
      plasticTubeExtrusionFormGroup: this._plasticTubeExtrusionMapper.manufacturingPlasticTubeExtrusionFormPatch(obj),
      // plasticVacuumFormingFormGroup: this._plasticVacuumFormingMapper.manufacturingPlasticVacuumFormingFormPatch(obj),
      compressionMoldingFormGroup: this._compressionMoldMapper.formPatch(obj),
      sheetMetalProcessFormGroup: this._sheetMetalProcessMapperConfig.formPatch(obj, conversionValue, isEnableUnitConversion),
      customCableFormGroup: this._customCableMapper.manufacturingFormPatch(obj, conversionValue, isEnableUnitConversion),
      wiringHarnessFormGroup: this._wiringHarnessMapper.manufacturingFormPatch(obj),
      sustainabilityFormGroup: this._sustainabilityMapper.manufacturingSustainabilityFormPatch(obj),
      recBedSize:
        currentPart?.commodityId === CommodityType.PlasticAndRubber
          ? obj.platenSizeLength && obj.platenSizeWidth
            ? Math.round(obj.platenSizeLength) + ' x ' + Math.round(obj.platenSizeWidth)
            : ''
          : obj.requiredCurrent && obj.requiredWeldingVoltage
            ? Math.round(obj.requiredCurrent) + ' x ' + Math.round(obj.requiredWeldingVoltage)
            : obj.requiredCurrent
              ? Math.round(obj.requiredCurrent).toString()
              : '',
      selectedBedSize:
        obj.lengthOfCoated && obj.widthOfCoated ? Math.round(obj.lengthOfCoated) + ' x ' + Math.round(obj.widthOfCoated) : obj.lengthOfCoated ? Math.round(obj.lengthOfCoated).toString() : '',
    };
  }

  manufacturingDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl, coreCycleTimeArraycntrl) {
    manufactureInfo.isDieOpeningThicknessDirty = formCtrl['dieOpeningThickness'].dirty;
    manufactureInfo.isrequiredCurrentDirty = formCtrl['requiredCurrent'].dirty;
    manufactureInfo.isrequiredWeldingVoltageDirty = formCtrl['requiredWeldingVoltage'].dirty;
    manufactureInfo.isnoOfIntermediateStartAndStopDirty = formCtrl['noOfIntermediateStartAndStop'].dirty;
    manufactureInfo.isnoOfTackWeldDirty = formCtrl['noOfTackWeld'].dirty;
    manufactureInfo.isnoOfWeldPassesDirty = formCtrl['noOfWeldPasses'].dirty;
    manufactureInfo.istravelSpeedDirty = formCtrl['travelSpeed'].dirty;
    manufactureInfo.ispowerConsumptionDirty = formCtrl['powerConsumption'].dirty;
    manufactureInfo.iselectricityUnitCostDirty = formCtrl['electricityUnitCost'].dirty;
    manufactureInfo.isinspectionTimeDirty = formCtrl['inspectionTime'].dirty;
    manufactureInfo.isbourdanRateDirty = formCtrl['bourdanRate'].dirty;
    manufactureInfo.bourdanRate = formCtrl['bourdanRate'].value;
    manufactureInfo.isutilisationDirty = formCtrl['utilisation'].dirty;
    manufactureInfo.isnetGoodPartsDirty = formCtrl['netGoodParts'].dirty;
    manufactureInfo.issetUpTimeDirty = formCtrl['setUpTime'].dirty;
    manufactureInfo.iscoolingTimeDirty = formCtrl['coolingTime'].dirty;
    manufactureInfo.isdirectMachineCostDirty = formCtrl['directMachineCost'].dirty;
    manufactureInfo.isdirectLaborCostDirty = formCtrl['directLaborCost'].dirty;
    manufactureInfo.isdirectSetUpCostDirty = formCtrl['directSetUpCost'].dirty;
    manufactureInfo.ismachineHourRateDirty = formCtrl['machineHourRate'].dirty;
    manufactureInfo.isSheetLoadULoadTimeDirty = formCtrl['sheetLoadUloadTime'].dirty;
    manufactureInfo.isNoOfLowSkilledLaboursDirty = formCtrl['noOfLowSkilledLabours'].dirty;
    manufactureInfo.isLowSkilledLaborRatePerHourDirty = formCtrl['lowSkilledLaborRatePerHour'].dirty;
    manufactureInfo.isSkilledLaborRatePerHourDirty = formCtrl['skilledLaborRatePerHour'].dirty;
    manufactureInfo.isQaInspectorRateDirty = formCtrl['qaOfInspectorRate'].dirty;
    manufactureInfo.isSamplingRateDirty = formCtrl['samplingRate'].dirty;
    manufactureInfo.isinspectionCostDirty = formCtrl['inspectionCost'].dirty;
    manufactureInfo.isyieldCostDirty = formCtrl['yieldCost'].dirty;
    manufactureInfo.isyieldPercentDirty = formCtrl['yieldPer'].dirty;
    // manufactureInfo.isesgImpactElectricityConsumptionDirty = formCtrl['esgImpactElectricityConsumption'].dirty;
    manufactureInfo.isinjectionTimeDirty = formCtrl['injectionTime'].dirty;
    manufactureInfo.iscuttingSpeedDirty = formCtrl['cuttingSpeed'].dirty;
    manufactureInfo.isfeedPerRevDirty = formCtrl['feedPerRev'].dirty;
    manufactureInfo.isspindleRpmDirty = formCtrl['spindleRpm'].dirty;
    manufactureInfo.isLengthOfCutInternalDirty = formCtrl['lengthOfCutInternal'].dirty;
    manufactureInfo.isNoOfHolesDirty = formCtrl['noOfHoles'].dirty;
    manufactureInfo.isNoOfStrokesDirty = formCtrl['noofStroke'].dirty;
    manufactureInfo.isLoadingTimeDirty = formCtrl['loadingTime'].dirty;
    manufactureInfo.isProcessTimeDirty = formCtrl['processTime'].dirty;
    manufactureInfo.isRotationTimeDirty = formCtrl['rotationTime'].dirty;
    manufactureInfo.isUnloadingTimeDirty = formCtrl['unloadingTime'].dirty;
    manufactureInfo.isDirectToolingDirty = formCtrl['directTooling'].dirty;
    manufactureInfo.isallowanceBetweenPartsDirty = formCtrl['allowanceBetweenParts'].dirty;
    manufactureInfo.isallowanceAlongLengthDirty = formCtrl['allowanceAlongLength'].dirty;
    manufactureInfo.isallowanceAlongWidthDirty = formCtrl['allowanceAlongWidth'].dirty;
    manufactureInfo.issandShootingDirty = formCtrl['sandShooting'].dirty;
    manufactureInfo.islengthOfCoatedDirty = formCtrl['lengthOfCoated'].dirty;
    manufactureInfo.iswidthOfCoatedDirty = formCtrl['widthOfCoated'].dirty;
    manufactureInfo.isplatenSizeLengthDirty = formCtrl['platenSizeLength'].dirty;
    manufactureInfo.isplatenSizeWidthDirty = formCtrl['platenSizeWidth'].dirty;
    manufactureInfo.istimeRequiredCableTieDirty = formCtrl['timeRequiredCableTie'].dirty;
    manufactureInfo.isshotSizeDirty = formCtrl['shotSize'].dirty;
    manufactureInfo.isnoOfPartsDirty = formCtrl['noOfParts'].dirty;
    manufactureInfo.isflashAreaDirty = formCtrl['flashArea'].dirty;
    manufactureInfo.isclampingPressureDirty = formCtrl['clampingPressure'].dirty;
    manufactureInfo.isrecommendedForceDirty = formCtrl['recommendedForce'].dirty;
    manufactureInfo.isinjectionTempDirty = formCtrl['injectionTemp'].dirty;
    manufactureInfo.isliquidTempDirty = formCtrl['liquidTemp'].dirty;
    manufactureInfo.ismoldTempDirty = formCtrl['moldTemp'].dirty;
    manufactureInfo.iscoolingFactorDirty = formCtrl['coolingFactor'].dirty;
    manufactureInfo.isNoOfCoreDirty = formCtrl['noOfCore'].dirty;
    manufactureInfo.isinjectionRateDirty = formCtrl['injectionRate'].dirty;
    manufactureInfo.isdieClosingTimeDirty = formCtrl['dieClosingTime'].dirty;
    manufactureInfo.istotalInjectionTimeDirty = formCtrl['totalInjectionTime'].dirty;
    manufactureInfo.isdieOpeningTimeDirty = formCtrl['dieOpeningTime'].dirty;
    manufactureInfo.ispouringTimeDirty = formCtrl['pouringTime'].dirty;
    manufactureInfo.isMoldOpeningDirty = formCtrl['moldOpening'].dirty;
    manufactureInfo.isFormPerimeterDirty = formCtrl['formPerimeter'].dirty;
    manufactureInfo.isBlankAreaDirty = formCtrl['blankArea'].dirty;
    manufactureInfo.ispartExtractionTimeDirty = formCtrl['partExtractionTime'].dirty;
    manufactureInfo.islubeTimeDirty = formCtrl['lubeTime'].dirty;
    manufactureInfo.isefficiencyDirty = formCtrl['efficiency'].dirty;
    manufactureInfo.isyieldTimeLossDirty = formCtrl['yieldTimeLoss'].dirty;
    manufactureInfo.istotalCycleTimeDirty = formCtrl['totalCycleTime'].dirty;
    manufactureInfo.isflashThicknessDirty = formCtrl['flashThickness'].dirty;
    manufactureInfo.ismeltingWeightDirty = formCtrl['meltingWeight'].dirty;
    manufactureInfo.issubProcessTypeIDDirty = formCtrl['subProcessTypeID'].dirty;
    manufactureInfo.ischargeIntoFuranceDirty = formCtrl['chargeIntoFurance'].dirty;
    manufactureInfo.isliquidMetalTransferDirty = formCtrl['liquidMetalTransfer'].dirty;
    manufactureInfo.istotalMeltingTimeDirty = formCtrl['totalMeltingTime'].dirty;
    manufactureInfo.ispunchPerimeterDirty = formCtrl['punchPerimeter'].dirty;
    manufactureInfo.ishlFactorDirty = formCtrl['hlFactor'].dirty;
    manufactureInfo.iscorePlacementDirty = formCtrl['corePlacement'].dirty;
    manufactureInfo.ismoldMakingDirty = formCtrl['moldMaking'].dirty;
    manufactureInfo.isshakeoutDirty = formCtrl['shakeout'].dirty;
    manufactureInfo.iscuttingAreaDirty = formCtrl['cuttingArea'].dirty;
    manufactureInfo.isfinalTempDirty = formCtrl['finalTemp'].dirty;
    manufactureInfo.issoakingTimeDirty = formCtrl['soakingTime'].dirty;
    manufactureInfo.ispartEnvelopHeightDirty = formCtrl['partEnvelopHeight'].dirty;
    manufactureInfo.isinitialStockHeightDirty = formCtrl['initialStockHeight'].dirty;
    manufactureInfo.isforgingShapeFactorDirty = formCtrl['forgingShapeFactor'].dirty;
    manufactureInfo.ispartAreaDirty = formCtrl['partArea'].dirty;
    manufactureInfo.isInsertsPlacementDirty = formCtrl['insertsPlacement'].dirty;
    manufactureInfo.isPartEjectionDirty = formCtrl['partEjection'].dirty;
    manufactureInfo.isSideCoreMechanismsDirty = formCtrl['sideCoreMechanisms'].dirty;
    manufactureInfo.isOthersDirty = formCtrl['others'].dirty;
    manufactureInfo.isLengthOfCableDirty = formCtrl['lengthOfCable'].dirty;
    manufactureInfo.isejectionUnloadingTimeDirty = formCtrl['ejectionUnloadingTime'].dirty;
    manufactureInfo.isDryCycleTimeDirty = formCtrl['dryCycleTime'].dirty;
    manufactureInfo.isspeedOfConveyerDirty = formCtrl['speedOfConveyer'].dirty;
    manufactureInfo.isNoOfStartsPierceDirty = formCtrl['noOfStartsPierce'].dirty;
    manufactureInfo.isNoOfWireCableCuttingDirty = formCtrl['noOfWireCableCutting'].dirty;
    manufactureInfo.isCuttingLengthDirty = formCtrl['cuttingLength'].dirty;
    manufactureInfo.isDrillDiameterDirty = formCtrl['drillDiameter'].dirty;
    manufactureInfo.isBendingCoeffecientDirty = formCtrl['bendingCoeffecient'].dirty;
    manufactureInfo.isTotalTimeDirty = formCtrl['totalTime'].dirty;
    manufactureInfo.isTheoreticalForceDirty = formCtrl['theoreticalForce'].dirty;
    manufactureInfo.isNoOfBends = formCtrl['noOfBends'].dirty;
    manufactureInfo.isMuffleLengthDirty = formCtrl['muffleLength'].dirty;
    manufactureInfo.isMuffleWidthDirty = formCtrl['muffleWidth'].dirty;
    manufactureInfo.isNoOfHitsRequiredDirty = formCtrl['noOfHitsRequired'].dirty;
    manufactureInfo.isNoOfStartsPierceDirty = formCtrl['noOfStartsPierce'].dirty;
    manufactureInfo.isNoOfWeldPassesDirty = formCtrl['noOfWeldPasses'].dirty;
    manufactureInfo.isEfficiencyFactorDirty = formCtrl['efficiencyFactor'].dirty;
    manufactureInfo.isLengthOfCutDirty = formCtrl['lengthOfCut'].dirty;
    manufactureInfo.isBendingLineLengthDirty = formCtrl['bendingLineLength'].dirty;
    manufactureInfo.isNoOfWireCableCuttingDirty = formCtrl['noOfWireCableCutting'].dirty;
    manufactureInfo.isWorkpieceStockLengthDirty = formCtrl['workpieceStockLength'].dirty;
    manufactureInfo.isWorkpieceStockDiameterDirty = formCtrl['workpieceStockDiameter'].dirty;
    manufactureInfo.isUltimateTensileMaterialDirty = formCtrl['ultimateTensileMaterial'].dirty;
    manufactureInfo.isShearStrengthMaterialDirty = formCtrl['shearStrengthMaterial'].dirty;
    manufactureInfo.isformHeightDirty = formCtrl['formHeight'].dirty;
    manufactureInfo.isWeldingPositionDirty = formCtrl['weldingPosition'].dirty;
    manufactureInfo.isTypeOfOperationDirty = formCtrl['typeOfOperationId'].dirty;
    manufactureInfo.isPowerSupplyDirty = formCtrl['powerSupply'].dirty;
    manufactureInfo.isSemiAutoOrAutoDirty = formCtrl['semiAutoOrAuto'].dirty;
    manufactureInfo.isRecommendTonnageDirty = formCtrl['recommendTonnage'].dirty;
    manufactureInfo.isWireCuttingStrippingSpeedDirty = formCtrl['wireCuttingStrippingSpeed'].dirty;
    manufactureInfo.isDrillDepthDirty = formCtrl['drillDepth'].dirty;
    manufactureInfo.isfurnaceOutputDirty = formCtrl['furnaceOutput'].dirty;
    // manufactureInfo.isNoOfTypesOfPins = formCtrl['isNoOfTypesOfPins'].dirty;
    manufactureInfo.isselectedTonnageDirty = !!formCtrl['selectedTonnage'].value && (formCtrl['selectedTonnage'].dirty || manufactureInfo.isselectedTonnageDirty);
    manufactureInfo.iscycleTimeDirty = !!formCtrl['cycleTime'].value && (formCtrl['cycleTime'].dirty || manufactureInfo.iscycleTimeDirty);
    coreCycleTimeArraycntrl.forEach((control, i) => {
      manufactureInfo.isCoreCycleTimesDirty[i] = !control.value ? false : control.dirty ? true : manufactureInfo.isCoreCycleTimesDirty[i];
    });
  }

  manufacturingFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl, conversionValue, isEnableUnitConversion, defaultValues, processFlag) {
    manufactureInfo.inspectionType = formCtrl['inspectionType'].value || 0;
    manufactureInfo.processTypeID = formCtrl['processTypeID'].value || 0;
    manufactureInfo.semiAutoOrAuto = formCtrl['semiAutoOrAuto'].value;
    manufactureInfo.totalToolLendingTime = formCtrl['totalToolLendingTime'].value;
    manufactureInfo.setUpTime = formCtrl['setUpTime'].value != null ? formCtrl['setUpTime'].value : defaultValues.setUpTime;
    manufactureInfo.thermalConductivity = Number(formCtrl['thermalConductivity'].value);
    manufactureInfo.specificHeatCapacity = Number(formCtrl['specificHeatCapacity'].value);
    manufactureInfo.thermalDiffusivity = Number(formCtrl['thermalDiffusivity'].value);
    manufactureInfo.noOfSkilledLabours = formCtrl['noOfSkilledLabours'].value;
    manufactureInfo.packAndHoldTime = formCtrl['packAndHoldTime'].value;
    manufactureInfo.theoreticalForce = formCtrl['theoreticalForce'].value;
    manufactureInfo.inspectionTime = formCtrl['inspectionTime'].value;
    manufactureInfo.meltTemp = formCtrl['meltTemp'].value;
    manufactureInfo.ejecTemp = formCtrl['ejecTemp'].value;
    manufactureInfo.mouldTemp = formCtrl['mouldTemp'].value;
    manufactureInfo.coolingTime = formCtrl['coolingTime'].value;
    manufactureInfo.insertsPlacement = formCtrl['insertsPlacement'].value;
    manufactureInfo.sideCoreMechanisms = formCtrl['sideCoreMechanisms'].value;
    manufactureInfo.partEjection = formCtrl['partEjection'].value;
    manufactureInfo.others = formCtrl['others'].value;
    manufactureInfo.cycleTime = formCtrl['cycleTime'].value;
    manufactureInfo.directMachineCost = formCtrl['directMachineCost'].value;
    manufactureInfo.directLaborCost = formCtrl['directLaborCost'].value;
    manufactureInfo.directSetUpCost = formCtrl['directSetUpCost'].value;
    manufactureInfo.machineHourRate = formCtrl['machineHourRate'].value != null ? formCtrl['machineHourRate'].value : defaultValues.machineHourRate;
    manufactureInfo.machineHourRateFromDB = defaultValues.machineHourRate;
    manufactureInfo.selectedTonnage = formCtrl['selectedTonnage'].value != null ? formCtrl['selectedTonnage'].value : 0;
    manufactureInfo.qaOfInspectorRate = formCtrl['qaOfInspectorRate'].value != null ? formCtrl['qaOfInspectorRate'].value : defaultValues.qaInspectorRate;
    manufactureInfo.lowSkilledLaborRatePerHour = formCtrl['lowSkilledLaborRatePerHour'].value != null ? formCtrl['lowSkilledLaborRatePerHour'].value : defaultValues.directLaborRate;
    manufactureInfo.samplingRate = formCtrl['samplingRate'].value != null ? formCtrl['samplingRate'].value : defaultValues.samplingRate;
    manufactureInfo.skilledLaborRatePerHour = formCtrl['skilledLaborRatePerHour'].value != null ? formCtrl['skilledLaborRatePerHour'].value : defaultValues.setuplaborRate;
    manufactureInfo.noOfLowSkilledLabours = formCtrl['noOfLowSkilledLabours'].value != null ? formCtrl['noOfLowSkilledLabours'].value : defaultValues.noOfDirectLabors;
    manufactureInfo.noOfSemiSkilledLabours = formCtrl['noOfSemiSkilledLabours'].value;
    manufactureInfo.inspectionCost = formCtrl['inspectionCost'].value;
    manufactureInfo.totalElectricityConsumption = formCtrl['totalElectricityConsumption'].value;
    // manufactureInfo.esgImpactElectricityConsumption = formCtrl['esgImpactElectricityConsumption'].value;
    manufactureInfo.totalFactorySpaceRequired = formCtrl['totalFactorySpaceRequired'].value;
    // manufactureInfo.esgImpactFactoryImpact = formCtrl['esgImpactFactoryImpact'].value;
    manufactureInfo.materialInjectionFillTime = formCtrl['materialInjectionFillTime'].value;
    manufactureInfo.yieldPer = Number(formCtrl['yieldPer'].value);
    manufactureInfo.yieldCost = formCtrl['yieldCost'].value;
    manufactureInfo.sheetLoadUloadTime = formCtrl['sheetLoadUloadTime'].value;
    manufactureInfo.recommendTonnage = Number(formCtrl['recommendTonnage'].value);
    manufactureInfo.workpieceStockDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['workpieceStockDiameter'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.drillDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['drillDiameter'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.cuttingSpeed = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingSpeed'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.feedPerRev = this.sharedService.convertUomToSaveAndCalculation(formCtrl['feedPerRev'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.spindleRpm = formCtrl['spindleRpm'].value;
    manufactureInfo.drillDepth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['drillDepth'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.lineOfInspectorRate = Number(formCtrl['lineOfInspectorRate'].value);
    manufactureInfo.lineOfInspector = Number(formCtrl['lineOfInspector'].value);
    manufactureInfo.qaOfInspector = Number(formCtrl['qaOfInspector'].value);
    manufactureInfo.lengthOfCut = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['lengthOfCut'].value), conversionValue, isEnableUnitConversion);
    manufactureInfo.bendingLineLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['bendingLineLength'].value), conversionValue, isEnableUnitConversion);
    manufactureInfo.noofStroke = formCtrl['noofStroke'].value;
    manufactureInfo.lengthOfCutInternal = this.sharedService.convertUomToSaveAndCalculation(formCtrl['lengthOfCutInternal'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.noOfHoles = formCtrl['noOfHoles'].value;
    manufactureInfo.unloadingTime = formCtrl['unloadingTime'].value;
    manufactureInfo.featureDetails = formCtrl['featureDetails'].value;
    manufactureInfo.directTooling = formCtrl['directTooling'].value;
    manufactureInfo.loadingTime = formCtrl['loadingTime'].value;
    manufactureInfo.processTime = formCtrl['processTime'].value;
    manufactureInfo.rotationTime = formCtrl['rotationTime'].value;
    manufactureInfo.allowanceBetweenParts = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceBetweenParts'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.allowanceAlongLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongLength'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.allowanceAlongWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongWidth'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.platenSizeLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['platenSizeLength'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.platenSizeWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['platenSizeWidth'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.lengthOfCoated = this.sharedService.convertUomToSaveAndCalculation(formCtrl['lengthOfCoated'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.widthOfCoated = this.sharedService.convertUomToSaveAndCalculation(formCtrl['widthOfCoated'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.shotSize = formCtrl['shotSize'].value;
    manufactureInfo.partArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partArea'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.noOfParts = formCtrl['noOfParts'].value;
    manufactureInfo.noOfCore = formCtrl['noOfCore'].value;
    manufactureInfo.subProcessTypeID = Number(formCtrl['subProcessTypeID'].value);
    manufactureInfo.flashArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['flashArea'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.clampingPressure = formCtrl['clampingPressure'].value;
    manufactureInfo.injectionTemp = formCtrl['injectionTemp'].value;
    manufactureInfo.dieClosingTime = formCtrl['dieClosingTime'].value;
    manufactureInfo.dryCycleTime = formCtrl['dryCycleTime'].value != null ? formCtrl['dryCycleTime'].value : defaultValues.dryCycleTime;
    manufactureInfo.totalInjectionTime = formCtrl['totalInjectionTime'].value;
    manufactureInfo.coolingTime = formCtrl['coolingTime'].value;
    manufactureInfo.pouringTime = formCtrl['pouringTime'].value;
    manufactureInfo.dieOpeningTime = formCtrl['dieOpeningTime'].value;
    manufactureInfo.partExtractionTime = formCtrl['partExtractionTime'].value;
    manufactureInfo.lubeTime = formCtrl['lubeTime'].value;
    manufactureInfo.efficiency = formCtrl['efficiency'].value != null ? formCtrl['efficiency'].value : defaultValues.machineEfficiency;
    manufactureInfo.yieldTimeLoss = formCtrl['yieldTimeLoss'].value;
    manufactureInfo.totalCycleTime = formCtrl['totalCycleTime'].value;
    manufactureInfo.injectionRate = this.sharedService.convertUomToSaveAndCalculation(formCtrl['injectionRate'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.coolingFactor = this.sharedService.convertUomToSaveAndCalculation(formCtrl['coolingFactor'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.moldTemp = formCtrl['moldTemp'].value;
    manufactureInfo.liquidTemp = formCtrl['liquidTemp'].value;
    manufactureInfo.flashThickness = this.sharedService.convertUomToSaveAndCalculation(formCtrl['flashThickness'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.furnaceOutput = formCtrl['furnaceOutput'].value; //from machineDB
    manufactureInfo.meltingWeight = formCtrl['meltingWeight'].value;
    manufactureInfo.chargeIntoFurance = formCtrl['chargeIntoFurance'].value;
    manufactureInfo.totalMeltingTime = formCtrl['totalMeltingTime'].value;
    manufactureInfo.liquidMetalTransfer = formCtrl['liquidMetalTransfer'].value;
    manufactureInfo.formLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['formLength'].value), conversionValue, isEnableUnitConversion);
    manufactureInfo.formHeight = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['formHeight'].value), conversionValue, isEnableUnitConversion);
    manufactureInfo.hlFactor = formCtrl['hlFactor'].value;
    manufactureInfo.punchPerimeter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['punchPerimeter'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.furnaceCapacityTon = Number(formCtrl['furnaceCapacityTon'].value || 1);
    manufactureInfo.utilisation = formCtrl['utilisation'].value;
    manufactureInfo.netGoodParts = formCtrl['netGoodParts'].value;
    manufactureInfo.powerSupply = formCtrl['powerSupply'].value;
    manufactureInfo.idleTimeMelt = formCtrl['idleTimeMelt'].value;
    manufactureInfo.idleTimeMouldBox = formCtrl['idleTimeMouldBox'].value;
    manufactureInfo.efficiencyFactor = Number(formCtrl['efficiencyFactor'].value);
    manufactureInfo.gravitationalAccelaration = Number(formCtrl['gravitationalAccelaration'].value);
    manufactureInfo.effectiveMetalHead = Number(formCtrl['effectiveMetalHead'].value);
    manufactureInfo.corePlacement = formCtrl['corePlacement'].value;
    manufactureInfo.moldMaking = formCtrl['moldMaking'].value;
    manufactureInfo.shakeout = formCtrl['shakeout'].value;
    manufactureInfo.sandShooting = Number(formCtrl['sandShooting'].value);
    manufactureInfo.gasingVenting = Number(formCtrl['gasingVenting'].value);
    manufactureInfo.noOfStartsPierce = Number(formCtrl['noOfStartsPierce'].value);
    manufactureInfo.machineCapacity = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['machineCapacity'].value), conversionValue, isEnableUnitConversion);
    manufactureInfo.cuttingArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingArea'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.muffleLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['muffleLength'].value), conversionValue, isEnableUnitConversion);
    manufactureInfo.muffleWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['muffleWidth'].value), conversionValue, isEnableUnitConversion);
    manufactureInfo.initialTemp = Number(formCtrl['initialTemp'].value);
    manufactureInfo.furanceEfficiency = Number(formCtrl['furanceEfficiency'].value);
    manufactureInfo.soakingTime = formCtrl['soakingTime'].value;
    manufactureInfo.finalTemp = formCtrl['finalTemp'].value;
    manufactureInfo.noOfHitsRequired = Number(formCtrl['noOfHitsRequired'].value);
    manufactureInfo.partEnvelopHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partEnvelopHeight'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.forgingShapeFactor = formCtrl['forgingShapeFactor'].value;
    manufactureInfo.initialStockHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['initialStockHeight'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.innerRadius = formCtrl['innerRadius'].value;
    manufactureInfo.partThickness = formCtrl['partThickness'].value;
    manufactureInfo.dieOpeningTime = formCtrl['dieOpeningTime'].value;
    manufactureInfo.dieOpeningThickness = formCtrl['dieOpeningThickness'].value;
    manufactureInfo.noOfbends = formCtrl['noOfBends'].value;
    manufactureInfo.bendingLineLength = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['bendingLineLength'].value), conversionValue, isEnableUnitConversion);
    manufactureInfo.shoulderWidth = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['shoulderWidth'].value), conversionValue, isEnableUnitConversion);
    manufactureInfo.bendingCoeffecient = Number(formCtrl['bendingCoeffecient'].value);
    manufactureInfo.recommendedForce = Number(formCtrl['recommendedForce'].value);
    manufactureInfo.injectionTime = formCtrl['injectionTime'].value;
    manufactureInfo.requiredCurrent = Number(formCtrl['requiredCurrent'].value);
    manufactureInfo.requiredWeldingVoltage = Number(formCtrl['requiredWeldingVoltage'].value);
    manufactureInfo.noOfIntermediateStartAndStop = Number(formCtrl['noOfIntermediateStartAndStop'].value);
    manufactureInfo.noOfTackWeld = Number(formCtrl['noOfTackWeld'].value);
    manufactureInfo.noOfWeldPasses = Number(formCtrl['noOfWeldPasses'].value);
    manufactureInfo.travelSpeed = Number(formCtrl['travelSpeed'].value);
    manufactureInfo.powerConsumption = Number(formCtrl['powerConsumption'].value);
    manufactureInfo.electricityUnitCost = Number(formCtrl['electricityUnitCost'].value);
    manufactureInfo.weldingPosition = Number(formCtrl['weldingPosition'].value);
    manufactureInfo.noOfWireCableCutting = Number(formCtrl['noOfWireCableCutting'].value);
    manufactureInfo.cuttingLength = Number(formCtrl['cuttingLength'].value);
    manufactureInfo.workpieceStockLength = Number(formCtrl['workpieceStockLength'].value);
    manufactureInfo.ultimateTensileMaterial = Number(formCtrl['ultimateTensileMaterial'].value);
    manufactureInfo.shearStrengthMaterial = Number(formCtrl['shearStrengthMaterial'].value);
    manufactureInfo.typeOfOperationId = Number(formCtrl['typeOfOperationId'].value);
    manufactureInfo.blankArea = Number(formCtrl['blankArea'].value);
    manufactureInfo.timeRequiredCableTie = Number(formCtrl['timeRequiredCableTie'].value);
    manufactureInfo.formPerimeter = this.sharedService.convertUomToSaveAndCalculation(Number(formCtrl['formPerimeter'].value), conversionValue, isEnableUnitConversion);
    manufactureInfo.speedOfConveyer = formCtrl['speedOfConveyer'].dirty
      ? Number(formCtrl['speedOfConveyer'].value)
      : processFlag.IsProcessTypeWetPainting || processFlag.IsProcessTypeSiliconCoatingAuto || processFlag.IsProcessTypeSiliconCoatingSemi
        ? 2.5
        : 1.52;
  }

  getMaterialStrengthPatchValues(materialData: any, materialInfoList: any[]): { [key: string]: any } {
    return {
      meltTemp: materialData?.meltingTemp || 0,
      ejecTemp: materialData?.ejectDeflectionTemp || 0,
      mouldTemp: materialData?.moldTemp || 0,
      maxWallThickess: this.sharedService.isValidNumber(materialInfoList?.length && materialInfoList[0]?.wallThickessMm),
      co2GasCost: materialData?.co2GasCost || 0.0006,
      argonGasCost: materialData?.argonGasCost || 0.001,
    };
  }

  manufacturingFormPatchResults(result: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      thermalDiffusivity: this.sharedService.isValidNumber(result.thermalDiffusivity),
      insertsPlacement: this.sharedService.isValidNumber(result.insertsPlacement),
      materialInjectionFillTime: this.sharedService.isValidNumber(result.materialInjectionFillTime),
      sideCoreMechanisms: this.sharedService.isValidNumber(result.sideCoreMechanisms),
      partEjection: this.sharedService.isValidNumber(result.partEjection),
      inspectionTime: this.sharedService.isValidNumber(result.inspectionTime),
      cycleTime: this.sharedService.isValidNumber(result.cycleTime),
      coolingTime: this.sharedService.isValidNumber(result.coolingTime),
      dryCycleTime: this.sharedService.isValidNumber(result.dryCycleTime),
      injectionTime: this.sharedService.isValidNumber(result.injectionTime),
      rawMaterialCost: this.sharedService.isValidNumber(result.rawmaterialCost),
      conversionCost: this.sharedService.isValidNumber(result.conversionCost),
      partCost: this.sharedService.isValidNumber(result.partCost),
      recommendTonnage: this.sharedService.isValidNumber(result.recommendTonnage),
      recommendedForce: this.sharedService.isValidNumber(result.recommendedForce),
      bendingCoeffecient: this.sharedService.isValidNumber(result.bendingCoeffecient),
      selectedTonnage: this.sharedService.isValidNumber(result.selectedTonnage),
      directLaborCost: this.sharedService.isValidNumber(result.directLaborCost),
      directMachineCost: this.sharedService.isValidNumber(result.directMachineCost),
      directSetUpCost: this.sharedService.isValidNumber(result.directSetUpCost),
      directTooling: this.sharedService.isValidNumber(result.directTooling),
      yieldCost: this.sharedService.isValidNumber(result.yieldCost),
      inspectionCost: this.sharedService.isValidNumber(result.inspectionCost),
      directProcessCost: this.sharedService.isValidNumber(result.directProcessCost),
      noOfLowSkilledLabours: this.sharedService.isValidNumber(result.noOfLowSkilledLabours),
      setUpTime: this.sharedService.isValidNumber(result.setUpTime),
      totalElectricityConsumption: this.sharedService.isValidNumber(result.totalElectricityConsumption),
      // esgImpactElectricityConsumption: this.sharedService.isValidNumber(result.esgImpactElectricityConsumption),
      totalFactorySpaceRequired: this.sharedService.isValidNumber(result.totalFactorySpaceRequired),
      // esgImpactFactoryImpact: this.sharedService.isValidNumber(result.esgImpactFactoryImpact),
      samplingRate: this.sharedService.isValidNumber(result.samplingRate),
      machineHourRate: this.sharedService.isValidNumber(result.machineHourRate),
      qaOfInspectorRate: this.sharedService.isValidNumber(result.qaOfInspectorRate),
      lowSkilledLaborRatePerHour: this.sharedService.isValidNumber(result.lowSkilledLaborRatePerHour),
      skilledLaborRatePerHour: this.sharedService.isValidNumber(result.skilledLaborRatePerHour),
      packAndHoldTime: this.sharedService.isValidNumber(result.packAndHoldTime),
      workpieceStockLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.workpieceStockLength), conversionValue, isEnableUnitConversion),
      cuttingSpeed: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.cuttingSpeed), conversionValue, isEnableUnitConversion),
      feedPerRev: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.feedPerRev), conversionValue, isEnableUnitConversion),
      spindleRpm: this.sharedService.isValidNumber(result.spindleRpm),
      yieldPer: this.sharedService.isValidNumber(result.yieldPer),
      sheetLoadUloadTime: this.sharedService.isValidNumber(result.sheetLoadUloadTime),
      lengthOfCutInternal: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.lengthOfCutInternal), conversionValue, isEnableUnitConversion),
      noOfHoles: this.sharedService.isValidNumber(result.noOfHoles),
      noOfCore: this.sharedService.isValidNumber(result.noOfCore),
      subProcessTypeID: result.subProcessTypeID,
      noofStroke: this.sharedService.isValidNumber(result.noofStroke),
      loadingTime: this.sharedService.isValidNumber(result.loadingTime),
      processTime: this.sharedService.isValidNumber(result.processTime),
      rotationTime: this.sharedService.isValidNumber(result.rotationTime),
      unloadingTime: this.sharedService.isValidNumber(result.unloadingTime),
      allowanceBetweenParts: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.allowanceBetweenParts), conversionValue, isEnableUnitConversion),
      allowanceAlongLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.allowanceAlongLength), conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.allowanceAlongWidth), conversionValue, isEnableUnitConversion),
      platenSizeLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.platenSizeLength), conversionValue, isEnableUnitConversion),
      platenSizeWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.platenSizeWidth), conversionValue, isEnableUnitConversion),
      lengthOfCoated: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.lengthOfCoated), conversionValue, isEnableUnitConversion),
      widthOfCoated: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.widthOfCoated), conversionValue, isEnableUnitConversion),
      shotSize: this.sharedService.isValidNumber(Number(result.shotSize)),
      noOfParts: this.sharedService.isValidNumber(result.noOfParts),
      flashArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.flashArea), conversionValue, isEnableUnitConversion),
      clampingPressure: this.sharedService.isValidNumber(result.clampingPressure),
      injectionTemp: this.sharedService.isValidNumber(result.injectionTemp),
      liquidTemp: this.sharedService.isValidNumber(result.liquidTemp),
      moldTemp: this.sharedService.isValidNumber(result.moldTemp),
      coolingFactor: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.coolingFactor), conversionValue, isEnableUnitConversion),
      injectionRate: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.injectionRate), conversionValue, isEnableUnitConversion),
      dieClosingTime: this.sharedService.isValidNumber(result.dieClosingTime),
      totalInjectionTime: this.sharedService.isValidNumber(result.totalInjectionTime),
      dieOpeningTime: this.sharedService.isValidNumber(result.dieOpeningTime),
      partExtractionTime: this.sharedService.isValidNumber(result.partExtractionTime),
      lubeTime: this.sharedService.isValidNumber(result.lubeTime),
      efficiency: this.sharedService.isValidNumber(result.efficiency),
      yieldTimeLoss: this.sharedService.isValidNumber(result.yieldTimeLoss),
      totalCycleTime: this.sharedService.isValidNumber(result.totalCycleTime),
      flashThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.flashThickness), conversionValue, isEnableUnitConversion),
      totalMeltingTime: this.sharedService.isValidNumber(result.totalMeltingTime),
      liquidMetalTransfer: this.sharedService.isValidNumber(result.liquidMetalTransfer),
      chargeIntoFurance: this.sharedService.isValidNumber(result.chargeIntoFurance),
      meltingWeight: this.sharedService.isValidNumber(result.meltingWeight),
      hlFactor: this.sharedService.isValidNumber(result.hlFactor),
      punchPerimeter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.punchPerimeter), conversionValue, isEnableUnitConversion),
      totalGasCost: this.sharedService.isValidNumber(result.totalGasCost),
      totalPowerCost: this.sharedService.isValidNumber(result.totalPowerCost),
      argonGasCost: this.sharedService.isValidNumber(result.argonGasCost),
      co2GasCost: this.sharedService.isValidNumber(result.co2GasCost),
      corePlacement: this.sharedService.isValidNumber(result.corePlacement),
      moldMaking: this.sharedService.isValidNumber(result.moldMaking),
      shakeout: this.sharedService.isValidNumber(result.shakeout),
      cuttingTime: this.sharedService.isValidNumber(result.cuttingTime),
      piercingTime: this.sharedService.isValidNumber(result.piercingTime),
      totalTime: this.sharedService.isValidNumber(result.totalTime),
      cuttingArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.cuttingArea), conversionValue, isEnableUnitConversion),
      muffleLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.muffleLength), conversionValue, isEnableUnitConversion),
      muffleWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.muffleWidth), conversionValue, isEnableUnitConversion),
      finalTemp: this.sharedService.isValidNumber(result.finalTemp),
      soakingTime: this.sharedService.isValidNumber(result.soakingTime),
      partArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partArea), conversionValue, isEnableUnitConversion),
      forgingShapeFactor: this.sharedService.isValidNumber(result.forgingShapeFactor),
      initialStockHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.initialStockHeight), conversionValue, isEnableUnitConversion),
      bourdanRate: result.bourdanRate,
      partEnvelopHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partEnvelopHeight), conversionValue, isEnableUnitConversion),
      theoreticalForce: this.sharedService.isValidNumber(result.theoreticalForce),
      noOfBends: this.sharedService.isValidNumber(result.noOfbends),
      totalTonnageRequired: this.sharedService.isValidNumber(result.totalTonnageRequired),
      totalToolLendingTime: this.sharedService.isValidNumber(result.totalToolLendingTime),
      speedOfConveyer: this.sharedService.isValidNumber(result.speedOfConveyer),
      others: this.sharedService.isValidNumber(result.others),
      requiredCurrent: this.sharedService.isValidNumber(result?.requiredCurrent),
      requiredWeldingVoltage: this.sharedService.isValidNumber(result?.requiredWeldingVoltage),
      noOfIntermediateStartAndStop: this.sharedService.isValidNumber(result?.noOfIntermediateStartAndStop),
      noOfTackWeld: this.sharedService.isValidNumber(result?.noOfTackWeld),
      noOfWeldPasses: this.sharedService.isValidNumber(result?.noOfWeldPasses),
      travelSpeed: this.sharedService.isValidNumber(result?.travelSpeed),
      powerConsumption: this.sharedService.isValidNumber(result?.powerConsumption),
      electricityUnitCost: this.sharedService.isValidNumber(result?.electricityUnitCost),
      weldingPosition: this.sharedService.isValidNumber(result?.weldingPosition),
      machineStrokes: this.sharedService.isValidNumber(result?.machineStrokes),
      stitchingCycleTime: this.sharedService.isValidNumber(result?.stitchingCycleTime),
      eolInspectionSamplingRate: this.sharedService.isValidNumber(result?.eolInspectionSamplingRate),
      totalPinPopulation: this.sharedService.isValidNumber(result?.totalPinPopulation),
      noOfTypesOfPins: this.sharedService.isValidNumber(result?.noOfTypesOfPins),
      maxBomQuantityOfIndividualPinTypes: this.sharedService.isValidNumber(result?.maxBomQuantityOfIndividualPinTypes),
      noOfStitchingStationsRequired: this.sharedService.isValidNumber(result?.noOfStitchingStationsRequired),
      drawSpeed: this.sharedService.isValidNumber(result?.drawSpeed),
      utilisation: this.sharedService.isValidNumber(result?.utilisation),
      netGoodParts: this.sharedService.isValidNumber(result?.netGoodParts),
      noOfStartsPierce: this.sharedService.isValidNumber(result?.noOfStartsPierce),
      noOfWireCableCutting: this.sharedService.isValidNumber(result?.noOfWireCableCutting),
      cuttingLength: this.sharedService.isValidNumber(result?.cuttingLength),
      drillDiameter: this.sharedService.isValidNumber(result?.drillDiameter),
      ultimateTensileMaterial: this.sharedService.isValidNumber(result.ultimateTensileMaterial),
      shearStrengthMaterial: this.sharedService.isValidNumber(result.shearStrengthMaterial),
      lengthOfCut: this.sharedService.isValidNumber(result.lengthOfCut),
      bendingLineLength: this.sharedService.isValidNumber(result.bendingLineLength),
      formHeight: this.sharedService.isValidNumber(result.formHeight),
      noOfHitsRequired: this.sharedService.isValidNumber(result.noOfHitsRequired),
      typeOfOperationId: this.sharedService.isValidNumber(result.typeOfOperationId),
      blankArea: this.sharedService.isValidNumber(result.blankArea),
      formPerimeter: this.sharedService.isValidNumber(result.formPerimeter),
      powerSupply: this.sharedService.isValidNumber(result.powerSupply),
      semiAutoOrAuto: result.semiAutoOrAuto,
      electronicsFormGroup: this._ele.electronicsFormPatch(result),
      assemblyFormGroup: this._assembly.subFormPatch(result),
      forgingSubProcessFormGroup: this._forgingSubProcess.forgingFormPatch(result),
      machiningFormGroup: this._machiningMapper.manufacturingMachiningFormPatchResults(result),
      cleaningForgingFormGroup: this._cleaningForgingMapper.manufacturingCleaningForgingFormPatchResults(result, conversionValue, isEnableUnitConversion),
      billetHeatingForgingFormGroup: this._billetHeatingForgingMapper.manufacturingBilletHeatingForgingFormPatchResults(result, conversionValue, isEnableUnitConversion),
      trimmingHydraulicForgingFormGroup: this._trimmingHydraulicForgingMapper.manufacturingTrimmingHydraulicForgingFormPatchResults(result, conversionValue, isEnableUnitConversion),
      straighteningOptionalForgingFormGroup: this._straighteningOptionalForgingMapper.manufacturingStraighteningOptionalForgingFormPatchResults(result, conversionValue, isEnableUnitConversion),
      piercingHydraulicForgingFormGroup: this._piercingHydraulicForgingMapper.manufacturingPiercingHydraulicForgingFormPatchResults(result, conversionValue, isEnableUnitConversion),
      testingMpiForgingFormGroup: this._testingMpiForgingMapper.manufacturingTestingMpiForgingFormPatchResults(result, conversionValue, isEnableUnitConversion),
      tubeBendingFormGroup: this._tubeBendingMapper.manufacturingTubeBendingFormPatchResults(result),
      insulationJacketFormGroup: this.insulationJacketMapper.manufacturingInsulationJacketFormPatchResults(result, conversionValue, isEnableUnitConversion),
      brazingFormGroup: this._brazingMapper.manufacturingBrazingFormPatchResults(result, conversionValue, isEnableUnitConversion),
      castingFormGroup: this._castingMapper.manufacturingFormPatchResults(result, conversionValue, isEnableUnitConversion),
      metalExtrusionFormGroup: this._metalExtrusionMapper.manufacturingMetalExtrusionFormPatchResults(result, conversionValue, isEnableUnitConversion),
      plasticTubeExtrusionFormGroup: this._plasticTubeExtrusionMapper.manufacturingPlasticTubeExtrusionFormPatchResults(result),
      // plasticVacuumFormingFormGroup: this._plasticVacuumFormingMapper.manufacturingPlasticVacuumFormingFormPatchResults(result),
      moldOpening: this.sharedService.isValidNumber(result.moldOpening),
      timeRequiredCableTie: this.sharedService.isValidNumber(result.timeRequiredCableTie),
      pouringTime: this.sharedService.isValidNumber(result.pouringTime),
      compressionMoldingFormGroup: this._compressionMoldMapper.formPatch(result),
      sheetMetalProcessFormGroup: this._sheetMetalProcessMapperConfig.formPatch(result, conversionValue, isEnableUnitConversion),
      customCableFormGroup: this._customCableMapper.manufacturingFormPatchResults(result, conversionValue, isEnableUnitConversion),
      wiringHarnessFormGroup: this._wiringHarnessMapper.manufacturingFormPatch(result),
      sustainabilityFormGroup: this._sustainabilityMapper.manufacturingSustainabilityFormPatchResults(result),
      recBedSize: result.recBedSize, // result.requiredCurrent +' x '+ result.requiredWeldingVoltage,
      selectedBedSize: result.selectedBedSize,
      recommendedDimension: result.recommendedDimension,
      selectedDimension: result.selectedDimension,
      workpieceStockDiameter: this.sharedService.isValidNumber(result.workpieceStockDiameter),
    };
  }

  manufacturingFormSubmit(formCtrl, conversionValue, isEnableUnitConversion, flags, partInfoId, materialInfo, machineMarketId): ProcessInfoDto {
    const model = new ProcessInfoDto();
    model.processInfoId = flags.isPartial ? 0 : formCtrl['processInfoId'].value;
    model.newToolingRequired = formCtrl['newToolingRequired'].value || false;
    model.partInfoId = partInfoId;
    model.processTypeID = formCtrl['processTypeID'].value || 0;
    model.machineMarketId = machineMarketId;
    model.semiAutoOrAuto = Number(formCtrl['semiAutoOrAuto'].value) || 0;
    model.noOfImpressionsOrCavities = materialInfo?.noOfCavities || 0;
    model.sortOrder = formCtrl['sortOrder'].value || 0;
    model.cycleTime = formCtrl['cycleTime'].value || 0;
    model.setUpTime = formCtrl['setUpTime'].value || 0;
    model.speedOfConveyer = formCtrl['speedOfConveyer'].value || 0;
    model.noOfLowSkilledLabours = formCtrl['noOfLowSkilledLabours'].value || 0;
    model.noOfSkilledLabours = formCtrl['noOfSkilledLabours'].value || 0;
    model.noOfSemiSkilledLabours = formCtrl['noOfSemiSkilledLabours'].value || 0;
    model.qaOfInspector = formCtrl['qaOfInspector'].value || 0;
    model.lowSkilledLaborRatePerHour = formCtrl['lowSkilledLaborRatePerHour'].value || 0;
    model.skilledLaborRatePerHour = formCtrl['skilledLaborRatePerHour'].value || 0;
    model.machineHourRate = formCtrl['machineHourRate'].value || 0;
    model.directLaborCost = formCtrl['directLaborCost'].value || 0;
    model.directMachineCost = formCtrl['directMachineCost'].value || 0;
    model.directSetUpCost = formCtrl['directSetUpCost'].value || 0;
    model.directTooling = formCtrl['directTooling'].value || 0;
    model.yieldPer = formCtrl['yieldPer'].value || 0;
    model.yieldCost = formCtrl['yieldCost'].value || 0;
    model.inspectionTime = formCtrl['inspectionTime'].value || 0;
    model.inspectionCost = formCtrl['inspectionCost'].value || 0;
    model.directProcessCost = formCtrl['directProcessCost'].value || 0;
    model.selectedTonnage = formCtrl['selectedTonnage'].value || 0;
    model.recommendedForce = formCtrl['recommendedForce'].value || 0;
    model.totalToolLendingTime = formCtrl['totalToolLendingTime'].value || 0;
    model.sheetLoadUloadTime = formCtrl['sheetLoadUloadTime'].value || 0;
    model.bendingLineLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['bendingLineLength'].value || 0, conversionValue, isEnableUnitConversion);
    model.shoulderWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['shoulderWidth'].value || 0, conversionValue, isEnableUnitConversion);
    model.bendingCoeffecient = formCtrl['bendingCoeffecient'].value || 0;
    model.theoreticalForce = formCtrl['theoreticalForce'].value || 0;
    model.noOfbends = formCtrl['noOfBends'].value || 0;
    model.totalTonnageRequired = formCtrl['totalTonnageRequired'].value || 0;
    model.recommendTonnage = formCtrl['recommendTonnage'].value || 0;
    model.lineOfInspector = formCtrl['lineOfInspector'].value || 0;
    model.noOfStartsPierce = formCtrl['noOfStartsPierce'].value || 0;
    model.cuttingSpeed = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingSpeed'].value || 0, conversionValue, isEnableUnitConversion);
    model.cuttingTime = formCtrl['cuttingTime'].value || 0;
    model.piercingTime = formCtrl['piercingTime'].value || 0;
    model.totalTime = formCtrl['totalTime'].value || 0;
    model.qaOfInspector = formCtrl['qaOfInspector'].value || 0;
    model.lineOfInspectorRate = formCtrl['lineOfInspectorRate'].value || 0;
    model.qaOfInspectorRate = formCtrl['qaOfInspectorRate'].value || 0;
    model.netGoodParts = formCtrl['netGoodParts'].value || 0;
    model.lengthOfCut = this.sharedService.convertUomToSaveAndCalculation(formCtrl['lengthOfCut'].value || 0, conversionValue, isEnableUnitConversion);
    model.bendingLineLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['bendingLineLength'].value || 0, conversionValue, isEnableUnitConversion);
    model.samplingRate = formCtrl['samplingRate'].value || 0;
    model.workpieceStockDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['workpieceStockDiameter'].value || 0, conversionValue, isEnableUnitConversion);
    model.workpieceStockLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['workpieceStockLength'].value || 0, conversionValue, isEnableUnitConversion);
    model.noOfHitsRequired = formCtrl['noOfHitsRequired'].value || 0;
    model.inspectionType = formCtrl['inspectionType'].value || 0;
    model.inspectionLevel = formCtrl['inspectionLevelValue'].value || 0;
    model.insertsPlacement = formCtrl['insertsPlacement'].value || 0;
    model.sideCoreMechanisms = formCtrl['sideCoreMechanisms'].value || 0;
    model.moldClosing = formCtrl['moldClosing'].value || 0;
    model.materialInjectionFillTime = formCtrl['materialInjectionFillTime'].value || 0;
    model.injectionHoldingTime = formCtrl['injectionHoldingTime'].value || 0;
    model.moldOpening = formCtrl['moldOpening'].value || 0;
    model.partEjection = formCtrl['partEjection'].value || 0;
    model.others = formCtrl['others'].value || 0;
    model.dryCycleTime = formCtrl['dryCycleTime'].value || 0;
    model.injectionTime = formCtrl['injectionTime'].value || 0;
    model.injectionPressure = formCtrl['injectionPressure'].value || 0;
    model.qaInspectionCostPerHr = formCtrl['qaInspectionCostPerHr'].value || 0;
    model.lineInspectorCostPerHr = formCtrl['lineInspectorCostPerHr'].value || 0;
    model.formHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['formHeight'].value || 0, conversionValue, isEnableUnitConversion);
    model.totalElectricityConsumption = formCtrl['totalElectricityConsumption'].value || 0;
    // model.esgImpactElectricityConsumption = formCtrl['esgImpactElectricityConsumption'].value || 0;
    model.totalFactorySpaceRequired = formCtrl['totalFactorySpaceRequired'].value || 0;
    // model.esgImpactFactoryImpact = formCtrl['esgImpactFactoryImpact'].value || 0;
    model.formLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['formLength'].value || 0, conversionValue, isEnableUnitConversion);
    model.hlFactor = formCtrl['hlFactor'].value || 0;
    model.subProcessTypeID = formCtrl['subProcessTypeID'].value || 0;
    model.setUpCost = formCtrl['directSetUpCost'].value || 0;
    model.coolingTime = formCtrl['coolingTime'].value || 0;
    if (flags.IsProcessDrilling) {
      model.feedPerRev = this.sharedService.convertUomToSaveAndCalculation(formCtrl['feedPerRev'].value || 0, conversionValue, isEnableUnitConversion);
      model.spindleRpm = formCtrl['spindleRpm'].value || 0;
      model.drillDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['drillDiameter'].value || 0, conversionValue, isEnableUnitConversion);
      model.drillDepth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['drillDepth'].value || 0, conversionValue, isEnableUnitConversion);
    } else {
      model.spindleRpm = formCtrl['spindleRpm'].value || 0;
      model.drillDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['drillDiameter'].value || 0, conversionValue, isEnableUnitConversion);
    }
    model.formPerimeter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['formPerimeter'].value || 0, conversionValue, isEnableUnitConversion);
    model.moldMaking = formCtrl['moldMaking'].value || 0;
    model.corePlacement = formCtrl['corePlacement'].value || 0;
    model.shakeout = formCtrl['shakeout'].value || 0;
    model.sandShooting = formCtrl['sandShooting'].value || 0;
    model.furnaceCapacityTon = formCtrl['furnaceCapacityTon'].value || 0;
    model.gasingVenting = formCtrl['gasingVenting'].value || 0;
    model.efficiency = formCtrl['efficiency'].value || 0;
    model.totalCycleTime = formCtrl['totalCycleTime'].value || 0;
    model.noOfParts = formCtrl['noOfParts'].value || 0;
    model.powerSupply = formCtrl['powerSupply'].value || 0;
    model.meltingPower = formCtrl['meltingPower'].value || 0;
    model.totalMeltingTime = formCtrl['totalMeltingTime'].value || 0;
    model.chargeIntoFurance = formCtrl['chargeIntoFurance'].value || 0;
    model.liquidMetalTransfer = formCtrl['liquidMetalTransfer'].value || 0;
    model.idleTimeMelt = formCtrl['idleTimeMelt'].value || 0;
    model.idleTimeMouldBox = formCtrl['idleTimeMouldBox'].value || 0;
    model.efficiencyFactor = formCtrl['efficiencyFactor'].value || 0;
    model.gravitationalAccelaration = formCtrl['gravitationalAccelaration'].value || 0;
    model.effectiveMetalHead = formCtrl['effectiveMetalHead'].value || 0;
    model.machcineCapacity = this.sharedService.convertUomToSaveAndCalculation(formCtrl['machineCapacity'].value || 0, conversionValue, isEnableUnitConversion);
    model.utilisation = formCtrl['utilisation'].value || 0;
    model.totalPowerCost = formCtrl['totalPowerCost'].value || 0;
    model.totalGasCost = formCtrl['totalGasCost'].value || 0;
    model.muffleLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['muffleLength'].value, conversionValue, isEnableUnitConversion);
    model.muffleWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['muffleWidth'].value, conversionValue, isEnableUnitConversion);
    model.furanceEfficiency = formCtrl['furanceEfficiency'].value;
    model.initialTemp = formCtrl['initialTemp'].value;
    model.finalTemp = formCtrl['finalTemp'].value;
    model.partEnvelopHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partEnvelopHeight'].value, conversionValue, isEnableUnitConversion);
    model.forgingShapeFactor = formCtrl['forgingShapeFactor'].value;
    model.bourdanRate = formCtrl['bourdanRate'].value;
    model.initialStockHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['initialStockHeight'].value, conversionValue, isEnableUnitConversion);
    model.punchPerimeter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['punchPerimeter'].value, conversionValue, isEnableUnitConversion);
    model.soakingTime = formCtrl['soakingTime'].value;
    model.partArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partArea'].value, conversionValue, isEnableUnitConversion);
    model.flashArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['flashArea'].value, conversionValue, isEnableUnitConversion);
    model.flashThickness = this.sharedService.convertUomToSaveAndCalculation(formCtrl['flashThickness'].value, conversionValue, isEnableUnitConversion);
    model.cuttingArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingArea'].value, conversionValue, isEnableUnitConversion);
    model.furnaceOutput = formCtrl['furnaceOutput'].value;
    model.meltingWeight = formCtrl['meltingWeight'].value;
    model.allowanceBetweenParts = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceBetweenParts'].value, conversionValue, isEnableUnitConversion);
    model.allowanceAlongLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongLength'].value, conversionValue, isEnableUnitConversion);
    model.allowanceAlongWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongWidth'].value, conversionValue, isEnableUnitConversion);
    model.platenSizeLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['platenSizeLength'].value, conversionValue, isEnableUnitConversion);
    model.platenSizeWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['platenSizeWidth'].value, conversionValue, isEnableUnitConversion);
    model.shotSize = formCtrl['shotSize'].value;
    model.clampingPressure = formCtrl['clampingPressure'].value;
    model.injectionTemp = formCtrl['injectionTemp'].value;
    model.liquidTemp = formCtrl['liquidTemp'].value;
    model.moldTemp = formCtrl['moldTemp'].value;
    model.coolingFactor = this.sharedService.convertUomToSaveAndCalculation(formCtrl['coolingFactor'].value, conversionValue, isEnableUnitConversion);
    model.injectionRate = this.sharedService.convertUomToSaveAndCalculation(formCtrl['injectionRate'].value, conversionValue, isEnableUnitConversion);
    model.dieClosingTime = formCtrl['dieClosingTime'].value;
    model.totalInjectionTime = formCtrl['totalInjectionTime'].value;
    model.pouringTime = formCtrl['pouringTime'].value;
    model.dieOpeningTime = formCtrl['dieOpeningTime'].value;
    model.partExtractionTime = formCtrl['partExtractionTime'].value;
    model.lubeTime = formCtrl['lubeTime'].value;
    model.yieldTimeLoss = formCtrl['yieldTimeLoss'].value;
    model.wireGuage = formCtrl['wireGuage'].value;
    model.noOfWireCableCutting = formCtrl['noOfWireCableCutting'].value;
    model.wireCuttingStrippingSpeed = formCtrl['wireCuttingStrippingSpeed'].value;
    model.noofStroke = formCtrl['noofStroke'].value;
    model.noOfCore = formCtrl['noOfCore'].value;
    model.noOfWireOrCrimp = formCtrl['noOfWireOrCrimp'].value;
    model.noOfConnector = formCtrl['noOfConnector'].value;
    model.moldedPartCost = formCtrl['moldedPartCost'].value;
    model.lengthOfCable = formCtrl['lengthOfCable'].value;
    model.noOfCable = formCtrl['noOfCable'].value;
    model.noOfStamping = formCtrl['noOfStamping'].value;
    model.cycleTimeSolderingJoint = formCtrl['cycleTimeSolderingJoint'].value;
    model.pricePerWet = formCtrl['pricePerWet'].value;
    model.pricePerthinner = formCtrl['pricePerthinner'].value;
    model.ratioCoatingthinner = formCtrl['ratioCoatingthinner'].value;
    model.lengthOfCoated = this.sharedService.convertUomToSaveAndCalculation(formCtrl['lengthOfCoated'].value, conversionValue, isEnableUnitConversion);
    model.widthOfCoated = this.sharedService.convertUomToSaveAndCalculation(formCtrl['widthOfCoated'].value, conversionValue, isEnableUnitConversion);
    model.coatingthickness = formCtrl['coatingthickness'].value;
    model.solidPercentageCoating = formCtrl['solidPercentageCoating'].value;
    model.appliedPerCentagethin = formCtrl['appliedPerCentagethin'].value;
    model.appliedthinnerDollars = formCtrl['appliedthinnerDollars'].value;
    model.timeReqPickPlace = formCtrl['timeReqPickPlace'].value;
    model.timeReqClampFixing = formCtrl['timeReqClampFixing'].value;
    model.timeReqRollTape = formCtrl['timeReqRollTape'].value;
    model.noOfROllReq = formCtrl['noOfROllReq'].value;
    model.noOfCableTie = formCtrl['noOfCableTie'].value;
    model.noOfLabel = formCtrl['noOfLabel'].value;
    model.addAssemblyTime = formCtrl['addAssemblyTime'].value;
    model.noOfJointRequired = formCtrl['noOfJointRequired'].value;
    model.timeRequiredCableTie = formCtrl['timeRequiredCableTie'].value;
    model.cycleTimeLabelRequired = formCtrl['cycleTimeLabelRequired'].value;
    model.wireTwistingSpeed = formCtrl['wireTwistingSpeed'].value;
    model.lengthOfCutInternal = this.sharedService.convertUomToSaveAndCalculation(formCtrl['lengthOfCutInternal'].value || 0, conversionValue, isEnableUnitConversion);
    model.noOfHoles = formCtrl['noOfHoles'].value;
    model.loadingTime = formCtrl['loadingTime'].value || 0;
    model.processTime = formCtrl['processTime'].value || 0;
    model.rotationTime = formCtrl['rotationTime'].value || 0;
    model.unloadingTime = formCtrl['unloadingTime'].value || 0;
    model.innerRadius = formCtrl['innerRadius'].value || 0;
    model.partThickness = formCtrl['partThickness'].value || 0;
    model.dieOpeningThickness = formCtrl['dieOpeningThickness'].value || 0;
    model.packAndHoldTime = formCtrl['packAndHoldTime'].value || 0;
    model.processDetails = formCtrl['processDetails'].value;
    model.featureDetails = formCtrl['featureDetails'].value;
    model.requiredCurrent = formCtrl['requiredCurrent'].value || 0;
    model.requiredWeldingVoltage = formCtrl['requiredWeldingVoltage'].value || 0;
    model.weldingPosition = formCtrl['weldingPosition'].value || 0;
    model.noOfIntermediateStartAndStop = formCtrl['noOfIntermediateStartAndStop'].value || 0;
    model.noOfTackWeld = formCtrl['noOfTackWeld'].value || 0;
    model.noOfWeldPasses = formCtrl['noOfWeldPasses'].value || 0;
    model.travelSpeed = formCtrl['travelSpeed'].value || 0;
    model.powerConsumption = formCtrl['powerConsumption'].value || 0;
    model.electricityUnitCost = formCtrl['electricityUnitCost'].value || 0;
    model.machineStrokes = formCtrl['machineStrokes'].value || 0;
    model.stitchingCycleTime = formCtrl['stitchingCycleTime'].value || 0;
    model.eolInspectionSamplingRate = formCtrl['eolInspectionSamplingRate'].value || 0;
    model.totalPinPopulation = formCtrl['totalPinPopulation'].value || 0;
    model.noOfTypesOfPins = formCtrl['noOfTypesOfPins'].value || 0;
    model.maxBomQuantityOfIndividualPinTypes = formCtrl['maxBomQuantityOfIndividualPinTypes'].value || 0;
    model.noOfStitchingStationsRequired = formCtrl['noOfStitchingStationsRequired'].value || 0;
    model.cuttingLength = formCtrl['cuttingLength'].value || 0;
    model.ultimateTensileMaterial = formCtrl['ultimateTensileMaterial'].value || 0;
    model.shearStrengthMaterial = formCtrl['shearStrengthMaterial'].value || 0;
    model.typeOfOperationId = formCtrl['typeOfOperationId'].value || 0;
    model.blankArea = formCtrl['blankArea'].value || 0;
    return model;
  }
}
