import { CountryDataMasterDto, LaborRateMasterDto, MaterialInfoDto, MedbMachinesMasterDto, PartInfoDto, ProcessInfoDto, ReCalculateContext } from 'src/app/shared/models';
import { CommentFieldFormIdentifierModel } from 'src/app/shared/models/comment-field-model';
import { BendingToolTypes, CommodityType, MachiningTypes, PrimaryProcessType, ProcessType, ScreeName, StampingType } from 'src/app/modules/costing/costing.config';
import { SharedService } from '../shared';
import { SheetMetalProcessCalculatorService } from '../manufacturing-sheetmetal-calculator';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { ManufacturingCastingConfigService } from 'src/app/shared/config/manufacturing-casting-config.service';
import { ManufacturingMachiningConfigService } from 'src/app/shared/config/manufacturing-machining-config';
import { HPDCCastingTool, InjectionMouldingTool, SheetMetalTool } from 'src/app/shared/enums';
import { ManufacturingCalculatorService } from '../manufacturing-calculator';
import { WeldingCalculatorService } from '../manufacturing-welding-calculator';
import { CostingCompletionPercentageCalculator } from '../costing-completion-percentage-calculator';
import { CostToolingRecalculationService } from './cost-tooling-recalculation';
import { PlasticRubberProcessCalculatorService } from '../plastic-rubber-process-calculator';
import { ManufacturingForgingCalculatorService } from '../manufacturing-forging-calculator';
import { ManufacturingCleaningForgingCalculatorService } from '../manufacturing-cleaning-forging-calculator';
import { ManufacturingBilletHeatingForgingCalculatorService } from '../manufacturing-billet-heating-forging-calculator';
import { ManufacturingTestingMpiForgingCalculatorService } from '../manufacturing-testing-mpi-forging-calculator';
import { ManufacturingTrimmingHydraulicForgingCalculatorService } from '../manufacturing-trimming-hydraulic-forging-calculator';
import { ManufacturingStraighteningOptionalForgingCalculatorService } from '../manufacturing-straightening-optional-forging-calculator';
import { ManufacturingPiercingHydraulicForgingCalculatorService } from '../manufacturing-piercing-hydraulic-forging-calculator';
import { ManufacturingForgingSubProcessConfigService } from 'src/app/shared/config/costing-manufacturing-forging-sub-process-config';
import { ManufacturingWireCuttingTerminationCalculatorService } from '../manufacturing-wire-cutting-termination-calculator';
import { CustomCableService } from '../manufacturing-custom-cable';
import { SecondaryProcessCalculatorService } from '../manufacturing-secondary-process';
import { ElectronicsConfigService } from 'src/app/shared/config/manufacturing-electronics-config';
import { ManufacturingPCBConfigService } from 'src/app/shared/config/manufacturing-pcb-config';
import { ConventionalPCBCalculatorService } from '../conventional-pcb-calculator';
import { SubProcessTypeInfoDto } from 'src/app/shared/models/subprocess-info.model';
import { ToolingCountryData } from 'src/app/shared/models/tooling-master-data';
import { AutomateProcessParams } from 'src/app/modules/costing/interfaces';
import { ManufacturingSemiRigidConfigService } from 'src/app/shared/config/manufacturing-semi-rigid-config';
import { PartComplexity } from 'src/app/shared/enums';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { ProcessInfoSignalsService } from 'src/app/shared/signals/process-info-signals.service';
import { PlasticRubberConfigService } from 'src/app/shared/config/plastic-rubber-config.service';
import { RecalculationUpdateSignalsService } from 'src/app/shared/signals/recalculation-update-signals.service';

export class CostManufacturingAutomationService {
  laborRateInfo: LaborRateMasterDto[] = [];
  public toolingMasterData: ToolingCountryData[] = [];
  countryList: CountryDataMasterDto[] = [];
  public commodity = { isInjMoulding: false, isSheetMetal: false, isCasting: false };
  selectedMachineIndex = 0;
  private recalcContext: any = {};
  newCoreAdded: boolean = false;
  isEnableUnitConversion = false;
  conversionValue: any;
  automationProcessCount = 0;
  selectedProcessInfoId: number = 0;
  machineTypeDescription: MedbMachinesMasterDto[] = [];
  formIdentifier: CommentFieldFormIdentifierModel = {
    partInfoId: 0,
    screenId: ScreeName.Manufacturing,
    primaryId: 0,
    secondaryID: 0,
  };
  manufacturingMachiningConfigService: ManufacturingMachiningConfigService;
  manufacturingCastingConfigService: ManufacturingCastingConfigService;
  _manufacturingForgingSubProcessConfig: ManufacturingForgingSubProcessConfigService;
  _manufacturingWireCuttingTerminationCalService: ManufacturingWireCuttingTerminationCalculatorService;
  totProcessList: ProcessInfoDto[] = [];

  constructor(
    public _manufacturingConfig: any,
    private medbMasterService: any,
    private _store: any,
    private _simulationService: ManufacturingCalculatorService,
    private blockUiService: any,
    private _weldingService: WeldingCalculatorService,
    private messaging: any,
    private percentageCalculator: CostingCompletionPercentageCalculator,
    public sharedService: SharedService,
    private toolingRecalculationService: CostToolingRecalculationService,
    private _sheetMetalService: SheetMetalProcessCalculatorService,
    private _plasticRubberService: PlasticRubberProcessCalculatorService,
    private _manufacturingForgingCalService: ManufacturingForgingCalculatorService,
    private _manufacturingCleaningForgingCalService: ManufacturingCleaningForgingCalculatorService,
    private _manufacturingBilletHeatingForgingCalService: ManufacturingBilletHeatingForgingCalculatorService,
    private _manufacturingTestingMpiForgingCalService: ManufacturingTestingMpiForgingCalculatorService,
    private _manufacturingTrimmingHydraulicForgingCalService: ManufacturingTrimmingHydraulicForgingCalculatorService,
    private _manufacturingStraighteningOptionalForgingCalService: ManufacturingStraighteningOptionalForgingCalculatorService,
    private _manufacturingPiercingHydraulicForgingCalService: ManufacturingPiercingHydraulicForgingCalculatorService,
    private _forgingSubProcessConfigService: ManufacturingForgingSubProcessConfigService,
    private _wireCuttingTerminationService: ManufacturingWireCuttingTerminationCalculatorService,
    private _customCableService: CustomCableService,
    private _secondaryService: SecondaryProcessCalculatorService,
    private _electronics: ElectronicsConfigService,
    private _pcbConfig: ManufacturingPCBConfigService,
    private _pcbCalculator: ConventionalPCBCalculatorService,
    private _semiRigidConfig: ManufacturingSemiRigidConfigService,
    private readonly digitalFactoryService: DigitalFactoryService,
    private _plasticRubberConfig: PlasticRubberConfigService,
    private processInfoSignalService: ProcessInfoSignalsService,
    private recalculationUpdateSignalsService: RecalculationUpdateSignalsService
  ) {
    this._manufacturingForgingSubProcessConfig = _forgingSubProcessConfigService;
    this._manufacturingWireCuttingTerminationCalService = _wireCuttingTerminationService;
    this.manufacturingMachiningConfigService = _manufacturingConfig._machining;
    this.manufacturingCastingConfigService = _manufacturingConfig._casting;
    [this.isEnableUnitConversion, this.conversionValue] = this.sharedService.setUnitMeasurement();
  }

  saveRecalculatedProcessResult(recalContext: ReCalculateContext): { selectedProcessInfoId: number; formIdentifier: CommentFieldFormIdentifierModel } {
    this.recalcContext = recalContext;
    this.processInfoSignalService.bulkUpdateOrCreateProcessInfo(recalContext.calculateResults);
    console.log(recalContext.calculateResults.length + ' processed!');
    return { selectedProcessInfoId: recalContext.selectedProcessInfoId, formIdentifier: recalContext.formIdentifier };
  }

  recalculateProcessCost(
    calculateResults: ProcessInfoDto[],
    materialInfoList: MaterialInfoDto[],
    currentPart: PartInfoDto,
    automationProcessCount: number,
    selectedProcessInfoId: number,
    formIdentifier: CommentFieldFormIdentifierModel,
    selectedProcess: ProcessInfoDto,
    dirtyFields: FieldColorsDto[],
    laborRate: LaborRateMasterDto[]
  ): {
    selectedProcessInfoId: number;
    formIdentifier: CommentFieldFormIdentifierModel;
    calculateResults: ProcessInfoDto[];
    materialInfoList: MaterialInfoDto[];
    isToolingNeedToRun: boolean;
  } {
    calculateResults = this.sustainabilityCalc(selectedProcess, calculateResults, dirtyFields, laborRate);
    if (automationProcessCount > 0 && automationProcessCount === calculateResults.length) {
      // Tool cost selection
      if (materialInfoList.length > 0 && materialInfoList[0].processId === PrimaryProcessType.StampingStage) {
        // const selectedProc = calculateResults.find((x) => (x.processInfoId = selectedProcessInfoId));
        const liquidTempValue = selectedProcess?.liquidTemp === undefined || selectedProcess?.liquidTemp === null ? 1 : selectedProcess?.liquidTemp;
        for (let i = 0; i < calculateResults.length; i++) {
          calculateResults[i].liquidTemp = liquidTempValue;
          calculateResults[i].isliquidTempDirty = true;
          calculateResults[i].newToolingRequired = liquidTempValue !== 0;
        }
      }

      if (selectedProcess.processInfoId === undefined) {
        for (let i = 0; i < calculateResults.length; i++) {
          const updatedProcess = this._simulationService._manufacturingSustainabilityCalService.doCostCalculationsForSustainability(calculateResults[i], dirtyFields, selectedProcess, laborRate);

          calculateResults[i] = updatedProcess;
        }
      }
      if (materialInfoList.length > 0 && materialInfoList[0].processId === PrimaryProcessType.StampingProgressive) {
        calculateResults?.sort((a, b) => {
          if (a.processTypeID === 49 && b.processTypeID !== 49) return -1;
          if (b.processTypeID === 49 && a.processTypeID !== 49) return 1;
          return this._manufacturingConfig.stampingProgressSortOrder.indexOf(a.processTypeID) - this._manufacturingConfig.stampingProgressSortOrder.indexOf(b.processTypeID);
        });
      }
      if (materialInfoList.length > 0 && materialInfoList[0].processId === PrimaryProcessType.StampingStage) {
        if (calculateResults && calculateResults.length > 0) {
          if (calculateResults[0] && (!calculateResults[0].processInfoList || calculateResults[0].processInfoList.length === 0)) {
            for (let i = 0; i < calculateResults.length; i++) {
              if (i !== calculateResults.length - 1) {
                calculateResults[i].inspectionTime = 0;
                calculateResults[i].inspectionCost = 0;
              } else {
                let inspectionTime =
                  calculateResults[i]?.partComplexity === PartComplexity.Low
                    ? 2
                    : calculateResults[i]?.partComplexity === PartComplexity.Medium
                      ? 5
                      : calculateResults[i]?.partComplexity === PartComplexity.High
                        ? 10
                        : 0;
                calculateResults[i].inspectionTime = inspectionTime;
                let inspectionCost = this.sharedService.isValidNumber(
                  ((Number(calculateResults[i].qaOfInspectorRate) / 60) * Number(inspectionTime) * Math.round(Number(calculateResults[i].samplingRate / 100) * Number(calculateResults[i].lotSize))) /
                  (Number(calculateResults[i].lotSize) || 1)
                );
                calculateResults[i].inspectionCost = inspectionCost;

                const sum = this.sharedService.isValidNumber(
                  Number(calculateResults[i].directMachineCost) + Number(calculateResults[i].directSetUpCost) + Number(calculateResults[i].directLaborCost) + Number(calculateResults[i].inspectionCost)
                );

                let yieldCost = this.sharedService.isValidNumber(
                  (1 - Number(calculateResults[i].yieldPer / 100)) * (Number(calculateResults[i].materialInfo.totalCost) + sum) -
                  (1 - Number(calculateResults[i].yieldPer / 100)) * ((Number(calculateResults[i].materialInfo.weight) * Number(calculateResults[i].materialInfo.scrapPrice)) / 1000)
                );

                calculateResults[i].yieldCost = yieldCost;

                calculateResults[i].directProcessCost = this.sharedService.isValidNumber(
                  Number(calculateResults[i].directLaborCost) +
                  Number(calculateResults[i].directMachineCost) +
                  Number(calculateResults[i].directSetUpCost) +
                  Number(calculateResults[i].inspectionCost) +
                  Number(calculateResults[i].yieldCost)
                );
              }
            }
          }
        }
      }

      if (materialInfoList.length > 0 && materialInfoList[0].processId === PrimaryProcessType.TransferPress) {
        calculateResults?.sort((a, b) => {
          return this._manufacturingConfig.transferPressSortOrder.indexOf(a.processTypeID) - this._manufacturingConfig.transferPressSortOrder.indexOf(b.processTypeID);
        });
      }

      if (materialInfoList.length > 0 && materialInfoList[0].processId === PrimaryProcessType.RubberInjectionMolding) {
        calculateResults?.sort((a, b) => {
          return this._manufacturingConfig.rubberInjectionMolding.indexOf(a.processTypeID) - this._manufacturingConfig.rubberInjectionMolding.indexOf(b.processTypeID);
        });
      }

      if (materialInfoList.length > 0 && materialInfoList[0].processId === PrimaryProcessType.HotForgingClosedDieHot) {
        calculateResults?.sort((a, b) => {
          return this._manufacturingConfig.hotForgingClosedDieSortOrder.indexOf(a.processTypeID) - this._manufacturingConfig.hotForgingClosedDieSortOrder.indexOf(b.processTypeID);
        });
      }
      if (materialInfoList.length > 0 && materialInfoList?.some((x) => x?.secondaryProcessId === 2)) {
        this._manufacturingConfig._castingConfig.sortCastingCoreProcesses(calculateResults);
      }
      const isToolingNeedToRun = calculateResults.some((result) => result.newToolingRequired);
      calculateResults = this._manufacturingConfig.clearLookupTables(calculateResults);
      this.recalcContext = {
        calculateResults,
        materialInfoList,
        currentPart,
        automationProcessCount,
        selectedProcessInfoId,
        formIdentifier,
        selectedProcess,
        dirtyFields,
        laborRate,
        isToolingNeedToRun,
      };
      // this._store.dispatch(new ProcessInfoActions.BulkUpdateOrCreateProcessInfo(calculateResults));
      this.processInfoSignalService.bulkUpdateOrCreateProcessInfo(calculateResults);
      console.log(calculateResults.length + ' processed!');
    }
    return { selectedProcessInfoId, formIdentifier, calculateResults, materialInfoList, isToolingNeedToRun };
  }

  private handleProcessRecalc(updatedProcessInfoList: ProcessInfoDto[]) {
    this.recalculationUpdateSignalsService.setBulkProcessUpdateLoading(true);
    const processMapping = this._manufacturingConfig.processMappingSortCastingAutomation;
    let updatedList = [...(updatedProcessInfoList as ProcessInfoDto[])];
    for (const process in processMapping) {
      for (const materialInfo of this.recalcContext.materialInfoList) {
        const primaryProcessEnumValue = PrimaryProcessType[process as keyof typeof PrimaryProcessType];
        if (materialInfo.processId === primaryProcessEnumValue) {
          updatedList = this.sharedService.sortObjectbyInteger(updatedList, 'processTypeID', processMapping[process]);
        }
      }
    }
    if (!this.recalcContext.selectedProcessInfoId) {
      this.recalcContext.selectedProcessInfoId = updatedList[0]?.processInfoId || 0;
    }
    this.recalcContext.formIdentifier = {
      ...this.recalcContext.formIdentifier,
      primaryId: this.recalcContext.selectedProcessInfoId,
    };
    this.automationProcessCount = 0;
    this.recalcContext = {};
  }

  sustainabilityCalc(selectedProcess: ProcessInfoDto, calculateResults: ProcessInfoDto[], dirtyFields: FieldColorsDto[], laborRate: LaborRateMasterDto[]): ProcessInfoDto[] {
    if (selectedProcess.processInfoId === undefined) {
      return calculateResults;
    }

    const index = calculateResults.findIndex((process) => process.processInfoId === selectedProcess.processInfoId);

    if (index !== -1) {
      const updatedProcess = this._simulationService._manufacturingSustainabilityCalService.doCostCalculationsForSustainability(calculateResults[index], dirtyFields, selectedProcess, laborRate);

      calculateResults[index] = updatedProcess;
      return calculateResults;
    }

    return calculateResults;
  }

  selectMachineProcess(
    processInfo: ProcessInfoDto,
    currentPart: PartInfoDto,
    materialInfo: MaterialInfoDto,
    machineTypeDescription: any[],
    laborRateInfo: any,
    processTypeOrginalList: any[],
    fieldColorsList: FieldColorsDto[],
    manufacturingObj: ProcessInfoDto
    // moldBoxSize: number
  ): MedbMachinesMasterDto[] {
    this.selectedMachineIndex = 0;
    let machine: MedbMachinesMasterDto[] = [];
    const isCasting = this._manufacturingConfig.castingProcesses.includes(materialInfo?.processId);
    // const isMachiningProcess = this._manufacturingConfig._machining.machineProcessList.includes(processInfo.processTypeID);
    const isMachiningProcess = this._manufacturingConfig._machining.machiningProcess.includes(processInfo?.processTypeID as any);
    let matMaterial = processInfo.materialInfoList?.find((x) => x?.secondaryProcessId === 1);
    let netWeight = matMaterial?.netWeight || 0;
    if (PrimaryProcessType.HPDCCasting === materialInfo?.processId) {
      matMaterial = processInfo.materialInfoList?.find((x) => x?.processId === PrimaryProcessType.HPDCCasting);
      netWeight = (matMaterial?.netWeight ?? 0) / 1000; // converting to kg
    }
    const coreSandMaterial = processInfo.materialInfoList?.find((x) => x?.secondaryProcessId === 2);
    const mouldSandMaterial = processInfo.materialInfoList?.find((x) => x?.secondaryProcessId === 3);
    if (currentPart?.commodityId == CommodityType.PlasticAndRubber) {
      if ([ProcessType.InjectionMouldingSingleShot, ProcessType.InjectionMouldingDoubleShot, ProcessType.PlugConnectorOvermolding].includes(processInfo.processTypeID)) {
        const recommendTonnage = this._manufacturingConfig._sheetMetalConfig.getInjectionMoldingTonnage(materialInfo, processInfo, currentPart);
        processInfo.recommendTonnage = this.sharedService.isValidNumber(recommendTonnage ?? 0);

        if (materialInfo?.noOfInserts > 0) {
          machineTypeDescription = machineTypeDescription.filter((x) => x.machineCategory === 'Insert Moulding').sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        } else {
          machineTypeDescription = machineTypeDescription.filter((x) => x.machineCategory !== 'Insert Moulding').sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        }

        if (processInfo.recommendTonnage > 0) {
          machine = machineTypeDescription.filter((x) => x.machineTonnageTons > recommendTonnage).sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        } else {
          machine = machineTypeDescription;
        }
        const partShotWeight = this.sharedService.isValidNumber(Number(materialInfo?.grossWeight) * Number(materialInfo?.noOfCavities));
        processInfo.requiredCurrent = partShotWeight;


        if (partShotWeight > 0 && recommendTonnage > 0) {
          if (machine && machine[0] && machine[0]?.shotSize < partShotWeight) {
            machine = machineTypeDescription.filter((x) => x.shotSize > partShotWeight && x.machineTonnageTons > recommendTonnage).sort((a, b) => a.shotSize - b.shotSize);
          }
        }
        processInfo.insertPlacement = this.sharedService.isValidNumber(materialInfo?.noOfInserts * 2.5); // materialInfo?.noOfInserts ? (materialInfo?.noOfInserts >= 4 ? 5 : materialInfo?.noOfInserts) : 0;
        if (machine.length > 0) {
          processInfo.lengthOfCoated = machine[0]?.platenLengthmm || 0;
          processInfo.widthOfCoated = machine[0]?.platenWidthmm || 0;
        }
      } else if (
        processInfo.processTypeID === ProcessType.RubberInjectionMolding ||
        processInfo.processTypeID === ProcessType.CompressionMolding ||
        processInfo.processTypeID === ProcessType.TransferMolding
      ) {
        const recommendedMachine = this._plasticRubberConfig.getBestMachineForRubberMolding(machineTypeDescription, materialInfo, currentPart, true);
        machine = [recommendedMachine?.machine];
        const toolSize = recommendedMachine?.toolSize || { length: 0, width: 0 };
        processInfo.platenSizeLength = toolSize.length;
        processInfo.platenSizeWidth = toolSize.width;
        processInfo.requiredCurrent = this.sharedService.isValidNumber(materialInfo?.grossWeight * materialInfo?.noOfCavities);

        if (machine.length > 0) {
          processInfo.lengthOfCoated = machine[0]?.platenLengthmm || 0;
          processInfo.widthOfCoated = machine[0]?.platenWidthmm || 0;
          processInfo.recommendTonnage = machine[0]?.machineTonnageTons || 0;
          const injectionVolume = machine[0]?.injectionRate || 0;

          processInfo.shotSize = injectionVolume * materialInfo?.density || 0;
        }
      } else if (processInfo.processTypeID === ProcessType.RubberMaterialPreparation) {
        const index = machineTypeDescription?.findIndex((machine) => machine.machineName === 'DS20-40');
        if (index !== -1) {
          const [machineToMove] = machineTypeDescription.splice(index, 1);
          machineTypeDescription?.unshift(machineToMove);
        }
      }
      else if (processInfo.processTypeID === ProcessType.PostCuring) {
        machine = machineTypeDescription.sort((a, b) => b.machineTonnageTons - a.machineTonnageTons);
        machine = this._plasticRubberService.selectPostCuringMachine(machine, materialInfo, processInfo);
        processInfo.platenSizeLength = machine.length > 0 ? machine[0]?.maxLength : 0;
        processInfo.platenSizeWidth = machine.length > 0 ? machine[0]?.maxWidth : 0;
        processInfo.allowanceAlongLength = processInfo?.materialInfoList.length > 0 ? processInfo?.materialInfoList[0]?.dimX : 0;
        processInfo.allowanceAlongWidth = processInfo?.materialInfoList.length > 0 ? processInfo?.materialInfoList[0]?.dimY : 0;
      } else if (processInfo.processTypeID === ProcessType.ManualDeflashing) {
        if ([1, 2, 3].includes(materialInfo?.partFinish)) {
          machine = machineTypeDescription.filter((x) => x.machineName.toLowerCase().includes('cryogenic')).sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        } else if ([7, 8].includes(materialInfo?.partFinish)) {
          machine = machineTypeDescription.filter((x) => x.machineName.toLowerCase().includes('oil')).sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        } else {
          machine = machineTypeDescription.filter((x) => x.machineName.toLowerCase().includes('tumbler')).sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        }
      } else {
        machine = machineTypeDescription.sort((a, b) => b.machineTonnageTons - a.machineTonnageTons);
      }

      if (
        !(
          processInfo.processTypeID === ProcessType.RubberInjectionMolding ||
          processInfo.processTypeID === ProcessType.CompressionMolding ||
          processInfo.processTypeID === ProcessType.TransferMolding ||
          processInfo.processTypeID === ProcessType.PlugConnectorOvermolding ||
          processInfo.processTypeID === ProcessType.PostCuring
        )
      ) {
        // Req Platen size calculation for plastic part

        const partLength = materialInfo?.dimX;
        const partWidth = materialInfo?.dimY;
        const envelopLength = Number(partLength);
        const envelopWidth = Number(partWidth);
        const runnerGapLength = 30;
        const runnerGapWidth = 30;
        const sideGapLength = 50;
        const sideGapWidth = 50;

        // for cavity insert tooling
        const ciMoldBaseLength = Number(envelopLength) + Number(runnerGapLength) * 2;
        const ciMoldBaseWidth = Number(envelopWidth) + Number(runnerGapWidth) * 2;

        // Calculate mold base dimensions
        let moldBaseLength = this.sharedService.isValidNumber(Number(ciMoldBaseLength) * Number(materialInfo?.cavityArrangementLength || 1) + Number(sideGapLength) * 2);
        let moldBaseWidth = this.sharedService.isValidNumber(Number(ciMoldBaseWidth) * Number(materialInfo?.cavityArrangementWidth || 1) + Number(sideGapWidth) * 2);

        processInfo.platenSizeLength = moldBaseLength;
        processInfo.platenSizeWidth = moldBaseWidth;

        if (machine.length > 0) {
          processInfo.lengthOfCoated = machine[0]?.platenLengthmm || 0;
          processInfo.widthOfCoated = machine[0]?.platenWidthmm || 0;
        }

        if (processInfo.processTypeID === ProcessType.InjectionMouldingSingleShot || processInfo.processTypeID === ProcessType.InjectionMouldingDoubleShot) {
          machine = machineTypeDescription
            .filter(
              (x) =>
                x.platenLengthmm >= processInfo.platenSizeLength &&
                x.platenWidthmm >= processInfo.platenSizeWidth &&
                x.machineTonnageTons >= processInfo.recommendTonnage &&
                x.shotSize >= processInfo.requiredCurrent
            )
            .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        }
      }
    } else if ([ProcessType.MigWelding, ProcessType.MigWelding].includes(processInfo.processTypeID)) {
      processInfo = this._weldingService.calculationForWelding(processInfo, fieldColorsList, manufacturingObj, laborRateInfo);
      let weldFilterdMachine = [];
      weldFilterdMachine = machineTypeDescription
        .filter((x) => x.plasmaCurrent >= processInfo.requiredCurrent && x.plasmaPower >= processInfo.requiredWeldingVoltage)
        .sort((a, b) => (a.machineHourRate < b.machineHourRate ? -1 : 1));
      if (weldFilterdMachine.length > 0) {
        machine = weldFilterdMachine;
      } else {
        machine = machineTypeDescription.filter((x) => x.plasmaCurrent >= processInfo.requiredCurrent).sort((a, b) => (a.machineHourRate < b.machineHourRate ? -1 : 1));
      }
      processInfo.platenSizeLength = machine.length > 0 ? machine[0]?.plasmaPower : 0;
      // machine = machineTypeDescription.sort((a, b) => (a.machineHourRate < b.machineHourRate ? -1 : 1));
    } else if (currentPart?.commodityId == CommodityType.SheetMetal) {
      if ([ProcessType.LaserCutting, ProcessType.PlasmaCutting].includes(processInfo.processTypeID)) {
        let materialType = this._sheetMetalService._smConfig.mapMaterial(processInfo?.materialmasterDatas?.materialType?.materialTypeName);
        const thickness = this.sharedService.isValidNumber(processInfo?.materialInfoList?.length && processInfo?.materialInfoList[0]?.dimUnfoldedZ);

        let materialCategory = ['Stainless Steel', 'Copper Alloy', 'Aluminium'].includes(materialType) ? 'Fiber' : 'CO2';
        if (!(processInfo.plasmaCutttingSpeedList || processInfo.laserCutttingTimeList)) {
          this._sheetMetalService.laserAndPlasmaCuttingListForProcess(processInfo);
        }
        if (ProcessType.PlasmaCutting === processInfo.processTypeID) {
          const targetThickness = Math.min(
            ...processInfo.plasmaCutttingSpeedList
              .filter(
                (x) =>
                  // x.materialType === materialType  &&
                  x.thickness >= thickness
              )
              .map((x) => x.thickness)
          );

          const cuttingInfo = processInfo.plasmaCutttingSpeedList?.filter((x) => x.materialType === materialType && x.thickness === targetThickness);

          let minAmps = 0;
          let maxAmps = 0;
          if (cuttingInfo && cuttingInfo.length > 0) {
            const ampsList = cuttingInfo.map((x) => x.amps);
            minAmps = Math.min(...ampsList);
            maxAmps = Math.max(...ampsList);
            // const cuttingInfo = processInfo.plasmaCutttingSpeedList?.filter((x) => x.thickness >= Math.ceil(thickness) && x.materialType == materialType);
            processInfo.totalFactorySpaceRequired = minAmps; // cuttingInfo[0]?.amps || 0;
          }

          let plasmaFilterdMachine = [];
          // if (materialCategory === 'Fiber') {
          plasmaFilterdMachine = machineTypeDescription.filter(
            (x) =>
              // x.machineMarketDtos.find((y) => y.machineMarketID == sortedMachineList[0]?.machineMarketId) &&
              x.bedLength >= materialInfo?.coilLength && x.bedWidth >= materialInfo?.coilWidth && x.plasmaCurrent >= minAmps && x.plasmaCurrent <= maxAmps
            // && x.machineCategory == materialCategory
          );
          if (plasmaFilterdMachine.length > 0) {
            machineTypeDescription = plasmaFilterdMachine;
          } else {
            machineTypeDescription = machineTypeDescription.filter(
              (x) => x.plasmaCurrent >= minAmps && x.bedLength >= materialInfo?.coilLength && x.bedWidth >= materialInfo?.coilWidth
              // && x.machineCategory == materialCategory
            );
          }

        } else {
          if (processInfo.laserCutttingTimeList) {
            const cuttingInfo = processInfo.laserCutttingTimeList?.filter((y) => y.cuttingSpeedActual > 0)?.find((x) => x.thickness >= Math.ceil(thickness) && x.material == materialType);
            processInfo.totalFactorySpaceRequired = cuttingInfo?.laserPower || 0;
            if (materialCategory === 'Fiber') {
              machineTypeDescription = machineTypeDescription.filter(
                (x) =>
                  // x.machineMarketDtos.find((y) => y.machineMarketID == sortedMachineList[0]?.machineMarketId) &&
                  x.bedLength >= materialInfo?.coilLength && x.bedWidth >= materialInfo?.coilWidth && x.laserPower >= processInfo?.totalFactorySpaceRequired && x.machineCategory == materialCategory
              );
            } else {
              machineTypeDescription = machineTypeDescription.filter(
                (x) =>
                  // x.machineMarketDtos.find((y) => y.machineMarketID == sortedMachineList[0]?.machineMarketId) &&
                  x.bedLength >= materialInfo?.coilLength && x.bedWidth >= materialInfo?.coilWidth && x.laserPower >= processInfo?.totalFactorySpaceRequired
              );
            }
          }
        }
        const sortedMachineList = this._sheetMetalService.getBestMachineForLaserCutting(machineTypeDescription, processInfo, laborRateInfo, processTypeOrginalList, fieldColorsList, manufacturingObj);
        machine = machineTypeDescription.filter((x) => x.machineMarketDtos.find((y: any) => y.machineMarketID == sortedMachineList[0]?.machineMarketId));
      } else if ([ProcessType.OxyCutting].includes(processInfo.processTypeID)) {
        let oxyFilterdMachine = [];
        oxyFilterdMachine = machineTypeDescription.filter((x) => x.bedLength >= materialInfo?.coilLength && x.bedWidth >= materialInfo?.coilWidth);
        if (oxyFilterdMachine.length > 0) {
          machineTypeDescription = oxyFilterdMachine;
        } else {
          machineTypeDescription = machineTypeDescription.filter((x) => x.bedLength >= materialInfo?.coilLength);
        }

        const sortedMachineList = this._sheetMetalService.getBestMachineForLaserCutting(machineTypeDescription, processInfo, laborRateInfo, processTypeOrginalList, fieldColorsList, manufacturingObj);
        machine = machineTypeDescription.filter((x) => x.machineMarketDtos.find((y) => y.machineMarketID == sortedMachineList[0]?.machineMarketId));
      } else if (ProcessType.TurretTPP === processInfo.processTypeID) {
        const thickness = this.sharedService.isValidNumber(processInfo?.materialInfoList?.length && processInfo?.materialInfoList[0]?.dimUnfoldedZ);
        const shearingStrength = this.sharedService.isValidNumber(processInfo?.materialmasterDatas?.shearingStrength) || 0;
        let materialType = processInfo.materialmasterDatas?.materialType?.materialTypeName;

        const raw = (25 * thickness * shearingStrength) / 9810;
        const roundedUp = Math.ceil(raw);
        processInfo.recommendTonnage = roundedUp * 1.5;

        let filterMachines = [];
        if (thickness < 3) {
          filterMachines = machineTypeDescription
            .filter((x) => x.machineTonnageTons < 30 && x.machineTonnageTons >= processInfo.recommendTonnage)
            .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        } else {
          filterMachines = machineTypeDescription
            .filter((x) => x.machineTonnageTons >= 30 && x.machineTonnageTons >= processInfo.recommendTonnage)
            .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        }

        let filterMachinesByBesSize = filterMachines
          .filter((x) => x.bedLength >= materialInfo?.coilLength && x.bedWidth >= materialInfo?.coilWidth)
          .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);

        if (filterMachinesByBesSize?.length === 0) {
          filterMachines = filterMachines
            .filter((x) => x.bedLength >= materialInfo?.coilLength && x.machineTonnageTons >= processInfo.recommendTonnage)
            .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        } else {
          filterMachines = filterMachinesByBesSize;
        }

        materialType = this._sheetMetalService._smConfig.mapMaterial(processInfo?.materialmasterDatas?.materialType?.materialTypeName);

        let noOfStrokes = this.sharedService.isValidNumber(Math.ceil(processInfo.lengthOfCut / 25) + Math.ceil(processInfo.lengthOfCutInternal / 25) + processInfo.noOfHoles);
        if (filterMachines && filterMachines?.length > 0 && noOfStrokes) {
          const spmRow = this._sheetMetalService._smConfig.findSpm(materialType, thickness);
          if (spmRow) {
            const spmTimes = this._sheetMetalService._smConfig.calculateTPPMachineTimes(spmRow, noOfStrokes);
            const costResults = this._sheetMetalService._smConfig.calculateLowestMachineCosts(spmTimes, filterMachines);
            machine = this._sheetMetalService._smConfig.selectLowestCost(costResults);
            // processInfo.spindleRpm = machine && machine.length > 0 ? spmRow[machine[0]['usedSpmKey']] : 0;
          }
        }

        if (machine?.length === 0) {
          // const maxBedLength = Math.max(...machineTypeDescription.filter((x) => x.machineTonnageTons >= processInfo.recommendTonnage).map((x) => x.bedLength));
          machine = machineTypeDescription
            .filter((x) => x.bedLength >= materialInfo?.coilLength && x.bedWidth >= materialInfo?.coilWidth && x.machineTonnageTons >= processInfo.recommendTonnage)
            .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        }

        if (machine?.length === 0) {
          const maxBedLength = Math.max(...machineTypeDescription.filter((x) => x.machineTonnageTons >= processInfo.recommendTonnage).map((x) => x.bedLength));
          machine = machineTypeDescription.filter((x) => x.bedLength === maxBedLength).sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        }

        if (machine?.length === 0) {
          machine = machineTypeDescription.filter((x) => x.machineTonnageTons >= processInfo.recommendTonnage).sort((a, b) => (a.machineHourRate < b.machineHourRate ? -1 : 1));
        }
      } else if (materialInfo?.processId == PrimaryProcessType.StampingProgressive) {
        processInfo.recommendTonnage = this._manufacturingConfig._sheetMetalConfig.getStampingProgressiveTonnage(materialInfo, processInfo);
        if (currentPart.eav > 500000) {
          machine = machineTypeDescription
            .filter((x) => x.machineManufacturer === 'Bruderer' && x.machineTonnageTons > processInfo.recommendTonnage)
            .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        }
        // const noOfStage = this._manufacturingConfig._sheetMetalConfig.getNumberOfStage(processInfo);
        processInfo = this._sheetMetalService.getSubprocesInfoProgressive(processInfo, fieldColorsList, manufacturingObj);

        const dieSetLength = Number(materialInfo?.dimUnfoldedY) * 1.5 * processInfo.noOfStartsPierce + 100;
        processInfo.noofStroke = processInfo?.materialInfoList && processInfo?.materialInfoList?.length > 0 ? processInfo?.materialInfoList[0].typeOfCable : 1;
        let dieSetWidth = 0;
        if (processInfo.materialInfoList?.length > 0 && processInfo?.materialInfoList[0].typeOfCable == 1) {
          dieSetWidth = Number(processInfo.materialInfoList?.length > 0 ? processInfo?.materialInfoList[0].dimUnfoldedX : 0) + 260;
        } else {
          dieSetWidth = Number(processInfo.materialInfoList?.length > 0 ? processInfo?.materialInfoList[0].dimUnfoldedX : 0) * Number(processInfo.noofStroke) + 260;
        }
        processInfo.requiredCurrent = dieSetLength;
        processInfo.requiredWeldingVoltage = dieSetWidth;

        const thickness = (processInfo.materialInfoList?.length && processInfo.materialInfoList[0]?.dimUnfoldedZ) || 0;
        const unfoldedLength = (processInfo.materialInfoList?.length && processInfo.materialInfoList[0]?.dimUnfoldedX) || 0;
        const unfoldedWidth = (processInfo.materialInfoList?.length && processInfo.materialInfoList[0]?.dimUnfoldedY) || 0;
        const height = (processInfo.materialInfoList?.length && processInfo.materialInfoList[0]?.partHeight) || 0;
        const stripLayout = (processInfo.materialInfoList?.length && processInfo.materialInfoList[0]?.typeOfCable) || 0;
        processInfo.noofStroke = processInfo?.materialInfoList && processInfo?.materialInfoList?.length > 0 ? processInfo?.materialInfoList[0].typeOfCable : 1; // no of impressions
        const { recBedLength, recBedWidth, maxDieSetHeight } = this._manufacturingConfig._sheetMetalConfig.getRecommendedBedSizeProgressive(
          unfoldedLength,
          unfoldedWidth,
          thickness,
          height,
          processInfo.noOfStartsPierce,
          stripLayout,
          processInfo.noofStroke
        );

        processInfo.requiredCurrent = recBedLength;
        processInfo.requiredWeldingVoltage = recBedWidth;


        processInfo.platenSizeLength = maxDieSetHeight;
        machine = machineTypeDescription
          .filter((x) => x.machineTonnageTons > processInfo.recommendTonnage && x.bedLength > recBedLength && x.bedWidth > recBedWidth && x.shutHeightmm >= processInfo.platenSizeLength)
          .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);

        if (machine?.length === 0) {
          machine = machineTypeDescription
            .filter((x) => x.machineTonnageTons > processInfo.recommendTonnage && x.bedLength > recBedLength && x.bedWidth > recBedWidth)
            .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        }

        if (machine?.length === 0) {
          machine = machineTypeDescription.filter((x) => x.machineTonnageTons > processInfo.recommendTonnage).sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        }
        processInfo.platenSizeWidth = machine?.length > 0 ? machine[0]?.shutHeightmm : 0;
        processInfo.spindleRpm = machine?.length > 0 ? machine[0]?.strokeRateMin : 0;
      } else if (materialInfo?.processId === PrimaryProcessType.TransferPress) {
        const shearingStrength = this.sharedService.isValidNumber(processInfo?.materialmasterDatas?.shearingStrength) || 0;
        if (processInfo.processTypeID === ProcessType.Shearing) {
          const calculatedShearingTonnage = (materialInfo?.dimUnfoldedZ * shearingStrength * materialInfo?.dimUnfoldedX) / 9806 || 0;
          processInfo.recommendTonnage = Math.ceil(calculatedShearingTonnage * 10) / 10;
          processInfo.totalTonnageRequired = this.sharedService.isValidNumber(processInfo.recommendTonnage);

          processInfo.requiredCurrent = materialInfo?.dimUnfoldedX * 1.15;
          processInfo.requiredWeldingVoltage = 0;

          machine = machineTypeDescription
            .filter((x) => x.machineTonnageTons > processInfo.recommendTonnage && x.bedLength > processInfo.requiredCurrent)
            .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);

          if (machine?.length === 0) {
            machine = machineTypeDescription.filter((x) => x.machineTonnageTons > processInfo.recommendTonnage).sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
          }
        } else {
          processInfo.recommendTonnage = this._manufacturingConfig._sheetMetalConfig.getTransferPressTonnage(materialInfo, processInfo);
          processInfo.totalTonnageRequired = this.sharedService.isValidNumber(processInfo.recommendTonnage);
          let maxDieLength,
            maxDieWidth,
            maxDieHeight = 0;
          let noOfStages = this._manufacturingConfig._sheetMetalConfig.getNumberOfStagesForTransferPress(processInfo);
          maxDieLength = materialInfo.dimUnfoldedX * noOfStages + 120 * (noOfStages + 1);
          maxDieWidth = materialInfo.dimUnfoldedY + 200;
          maxDieHeight = materialInfo.dimUnfoldedZ * 2 + 100;
          processInfo.requiredCurrent = maxDieLength;
          processInfo.requiredWeldingVoltage = maxDieWidth;
          processInfo.platenSizeLength = maxDieHeight;

          machine = machineTypeDescription
            .filter((x) => x.machineTonnageTons > processInfo.recommendTonnage && x.bedLength > maxDieLength && x.bedWidth > maxDieWidth && x.shutHeightmm > maxDieHeight)
            .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);

          if (machine?.length === 0) {
            machine = machineTypeDescription
              .filter((x) => x.machineTonnageTons > processInfo.recommendTonnage && x.bedLength > maxDieLength)
              .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
          }

          if (machine?.length === 0) {
            machine = machineTypeDescription.filter((x) => x.machineTonnageTons > processInfo.recommendTonnage).sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
          }
        }
      } else if (materialInfo?.processId == PrimaryProcessType.StampingStage) {
        processInfo = this._sheetMetalService.calculationForstampingStage(processInfo, fieldColorsList, manufacturingObj);
        let subprocesstype: any;
        if (processInfo?.subProcessFormArray) {
          subprocesstype = processInfo?.subProcessFormArray?.at(0)?.value?.subProcessTypeID;
          processInfo.lengthOfCut = processInfo?.subProcessFormArray?.at(0)?.value?.lengthOfCut;
        } else {
          subprocesstype = processInfo?.subProcessTypeInfos[0]?.subProcessTypeId;
        }
        if ([StampingType.BlankingPunching, StampingType.Compound, StampingType.Piercing].includes(subprocesstype)) {
          processInfo.recommendTonnage = this._manufacturingConfig._sheetMetalConfig.getBlankingTonnage(materialInfo, processInfo);
        } else if ([StampingType.Bending].includes(subprocesstype)) {
          processInfo.recommendTonnage = this._manufacturingConfig._sheetMetalConfig.getBendingTonnage(processInfo?.materialInfoList, processInfo, currentPart);
        } else if ([StampingType.Forming, StampingType.Restrike].includes(subprocesstype)) {
          processInfo.recommendTonnage = this._manufacturingConfig._sheetMetalConfig.getFormingTonnage(processInfo);
        }
        const thickness = (processInfo.materialInfoList?.length && processInfo.materialInfoList[0]?.dimUnfoldedZ) || 0;
        const unfoldedLength = (processInfo.materialInfoList?.length && processInfo.materialInfoList[0]?.dimUnfoldedX) || 0;
        const unfoldedWidth = (processInfo.materialInfoList?.length && processInfo.materialInfoList[0]?.dimUnfoldedY) || 0;
        const height = (processInfo.materialInfoList?.length && processInfo.materialInfoList[0]?.partHeight) || 0;
        const { recBedLength, recBedWidth, maxDieSetHeight } = this._manufacturingConfig._sheetMetalConfig.getRecommendedBedSizeStaging(unfoldedLength, unfoldedWidth, thickness, height);

        // const dieSetLength = Number(materialInfo?.dimUnfoldedX) * 1.5 + 100;
        // const dieSetWidth = Number(materialInfo?.dimUnfoldedY) + 260;
        processInfo.requiredCurrent = recBedLength;
        processInfo.requiredWeldingVoltage = recBedWidth;
        machine = machineTypeDescription
          .filter((x) => x.machineTonnageTons > processInfo.recommendTonnage && x.bedLength > recBedLength && x.bedWidth > recBedWidth)
          .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);

        processInfo.platenSizeLength = maxDieSetHeight;

        machine = machineTypeDescription
          .filter((x) => x.machineTonnageTons > processInfo.recommendTonnage && x.bedLength > recBedLength && x.bedWidth > recBedLength && x.shutHeightmm >= processInfo.platenSizeLength)
          .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);

        if (machine?.length === 0) {
          machine = machineTypeDescription
            .filter((x) => x.machineTonnageTons > processInfo.recommendTonnage && x.bedLength > recBedLength && x.bedWidth > recBedLength)
            .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        }

        if (machine?.length === 0) {
          machine = machineTypeDescription.filter((x) => x.machineTonnageTons > processInfo.recommendTonnage).sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        }
        // selected bed sizes
        processInfo.lengthOfCoated = machine?.length > 1 ? machine[0]?.bedLength : 0;
        processInfo.widthOfCoated = machine?.length > 1 ? machine[0]?.bedWidth : 0;
        processInfo.selectedBedSize = processInfo.lengthOfCoated + ' x ' + processInfo.widthOfCoated;
        processInfo.platenSizeWidth = machine?.length > 1 ? machine[0]?.shutHeightmm : 0;
        processInfo.spindleRpm = machine?.length > 1 ? machine[0]?.strokeRateMin : 0;
      } else if (processInfo.processTypeID == ProcessType.Bending) {
        const bendingCoeffecient = 1.33;
        const ultimateTensileMaterial = this.sharedService.isValidNumber(processInfo.materialmasterDatas?.tensileStrength);
        const dimz = this.sharedService.isValidNumber(processInfo?.materialInfoList?.length && processInfo?.materialInfoList[0]?.dimUnfoldedZ);
        if (currentPart?.eav > 100000 && processInfo.bendingLineLength < 400) {
          processInfo.moldTemp = BendingToolTypes.Dedicated;
          const theoreticalForceForce = (Math.pow(dimz, 2) * Number(processInfo.bendingLineLength) * ultimateTensileMaterial * bendingCoeffecient) / Number(processInfo.shoulderWidth) / 9810;
          processInfo.theoreticalForce = this.sharedService.isValidNumber(theoreticalForceForce);
          processInfo.totalTonnageRequired = this.sharedService.isValidNumber(theoreticalForceForce);
          processInfo.recommendTonnage = this.sharedService.isValidNumber(processInfo.totalTonnageRequired) * 1.25;
        } else {
          processInfo.moldTemp = BendingToolTypes.Soft;
          processInfo.newToolingRequired = false;

          processInfo.noOfTypesOfPins =
            processInfo?.innerRadius <= dimz / 2
              ? 3 // Coining
              : processInfo?.innerRadius <= dimz
                ? 2 // Bottom Bending
                : processInfo?.innerRadius > dimz
                  ? 1 // Air Bending
                  : 0;

          // Die Opening/Thickness
          const dieOpeningThickness = dimz < 3 ? 6 : dimz < 10 ? 8 : dimz < 12 ? 10 : 12;
          processInfo.dieOpeningThickness = dieOpeningThickness;

          // Die Opening/V
          let dieOpeningV = Number(dimz) * Number(processInfo.dieOpeningThickness);
          const bendingForceKn =
            processInfo.noOfTypesOfPins === 1
              ? (1.33 * dimz ** 2 * (processInfo.bendingLineLength / 1000) * ultimateTensileMaterial) / dieOpeningV // ** equalant to Math.pow(dimz, 2)
              : processInfo.noOfTypesOfPins === 2
                ? (2.67 * dimz ** 2 * (processInfo.bendingLineLength / 1000) * ultimateTensileMaterial) / dieOpeningV
                : processInfo.noOfTypesOfPins === 3
                  ? 1.1 * dimz * (processInfo.bendingLineLength / 1000) * ultimateTensileMaterial
                  : 0;

          // Bending Force/P (Ton)
          const bendingForcePerTon2 = this.sharedService.isValidNumber(bendingForceKn / 9.81);

          // Recommended Force : (Ton)
          processInfo.recommendTonnage = Math.ceil(bendingForcePerTon2 * 1.25);

        }
        machine = machineTypeDescription
          .filter((x) => x.machineTonnageTons >= processInfo.recommendTonnage && x.bedLength > processInfo.bendingLineLength * 1.2)
          .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        if (machine?.length === 0) {
          machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons > b.machineTonnageTons ? -1 : 1));
        }
      } else {
        machine = machineTypeDescription.sort((a, b) => (a.machineHourRate < b.machineHourRate ? -1 : 1));
      }
    } else if (isMachiningProcess) {
      const featureData = this.sharedService.getAllFeatureEntries(currentPart?.documentCollectionDto?.documentRecords || []);
      console.log('featureData', featureData);
      const axisCount = this.manufacturingMachiningConfigService.getAxisCount(featureData);
      console.log('axisCount', axisCount); // to do after the machine db is updated with axis
      const materialInfo = processInfo.materialInfoList[0];
      machine = machineTypeDescription.sort((a, b) => (a.workPieceMinOrMaxDia < b.workPieceMinOrMaxDia ? -1 : 1));
      this.selectedMachineIndex = machine.findIndex(
        (x) =>
          x.machineMarketDtos[0]?.countryId === currentPart?.mfrCountryId &&
          x.workPieceLength >= materialInfo.stockLength &&
          x.workPieceMinOrMaxDia >= (materialInfo.processId === MachiningTypes.Tube ? materialInfo.stockOuterDiameter : materialInfo.stockDiameter) // else rod
      );
    } else if (isCasting) {
      machineTypeDescription = this.filterbyMachineType(machineTypeDescription, processInfo.processTypeID, matMaterial.processId);
      if (processInfo.processTypeID === ProcessType.CastingCorePreparation && coreSandMaterial?.coreCostDetails) {
        const maxCoreDim = coreSandMaterial.coreCostDetails.reduce(
          (acc: any, curr) => (curr.coreLength >= acc.length && curr.coreWidth >= acc.width ? { length: curr.coreLength, width: curr.coreWidth } : acc),
          {
            length: 0,
            width: 0,
          }
        );
        machine = machineTypeDescription.sort((a, b) => a.maxCoreBoxLength * a.maxCoreBoxWidth - b.maxCoreBoxLength * b.maxCoreBoxWidth);
        this.selectedMachineIndex = machine.findIndex((x) => x.maxCoreBoxLength >= maxCoreDim.length && x.maxCoreBoxWidth >= maxCoreDim.width);
      } else if ([ProcessType.MoldPerparation as number, ProcessType.CastingMoldMaking as number].includes(processInfo.processTypeID as number)) {
        machineTypeDescription.sort((a, b) => a.flaskLength * a.flaskWidth - b.flaskLength * b.flaskWidth);
        // machineTypeDescription = machineTypeDescription.filter((x) => x.flaskLength * x.flaskWidth > moldBoxSize).map((x) => ({ ...x, flaskSize: Math.round(x.flaskLength * x.flaskWidth) }));
        machineTypeDescription = machineTypeDescription.map((x) => ({ ...x, flaskSize: Math.round(x.flaskLength * x.flaskWidth) }));
        machine = [...machineTypeDescription.filter((x) => x.machineManufacturer === 'DISA Group'), ...machineTypeDescription.filter((x) => x.machineManufacturer !== 'DISA Group')];
        if (PrimaryProcessType.NoBakeCasting === matMaterial?.processId) {
          this.selectedMachineIndex = machine.findIndex(
            (x) => x.machineDescription.toLowerCase().includes('manual molding line') && x.flaskLength >= (mouldSandMaterial?.moldBoxLength ?? 0) && x.flaskWidth >= (mouldSandMaterial?.moldBoxWidth ?? 0)
          );
          if (this.selectedMachineIndex === -1) {
            this.selectedMachineIndex = machine.findIndex((x) => x.machineDescription.toLowerCase().includes('manual molding line'));
          }
        } else {
          this.selectedMachineIndex = machine.findIndex((x) => x.flaskLength >= (mouldSandMaterial?.moldBoxLength ?? 0) && x.flaskWidth >= (mouldSandMaterial?.moldBoxWidth ?? 0));
        }
      } else if (processInfo.processTypeID === ProcessType.MeltingCasting) {
        machineTypeDescription.sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        machine = [
          ...machineTypeDescription.filter((x) => x.machineName.toLowerCase().includes('induction furnace')),
          ...machineTypeDescription.filter((x) => !x.machineName.toLowerCase().includes('induction furnace')),
        ];
        // this.manufacturingCastingConfigService.getMeltingTonnage(processInfo, fieldColorsList, manufacturingObj);
        let searchTerm = 'crucible';
        if (processInfo.materialmasterDatas.materialGroup === 'Ferrous') {
          searchTerm = 'induction';
          machine = machine.filter((x) => !x.machineName.toLowerCase().includes('crucible'));
        }
        this.selectedMachineIndex = machine.findIndex((x) => x.machineTonnageTons >= (processInfo.recommendTonnage ?? 0) && x.machineName.toLowerCase().includes(searchTerm));
        if (this.selectedMachineIndex === -1) {
          this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes(searchTerm));
        }
      } else if (processInfo.processTypeID === ProcessType.PouringCasting) {
        machine = machineTypeDescription.sort((a, b) => a.pourCapacity - b.pourCapacity);
        this.selectedMachineIndex = machine.findIndex((x) => (x.pourCapacity ?? 0) >= (processInfo.recommendTonnage ?? 0));
      } else if (processInfo.processTypeID === ProcessType.HighPressureDieCasting) {
        const { cavityToCavityLength, cavityToCavityWidth, cavityToEdgeLength, cavityToEdgeWidth, noComponentWidth, noComponentLength } = {
          ...this.manufacturingCastingConfigService.getHpdcConfigValues(matMaterial, ProcessType.HighPressureDieCasting),
        };
        const dieSetLength = (Number(matMaterial?.dimX) + cavityToEdgeLength * 2) * noComponentLength + cavityToCavityLength * 2 + 40;
        const dieSetWidth = (Number(matMaterial?.dimY) + cavityToEdgeWidth * 2) * noComponentWidth + cavityToCavityWidth * 2 + 40;
        this.manufacturingCastingConfigService.getHpdcTonnage(processInfo);
        machine = machineTypeDescription
          .filter((x) => x.machineTonnageTons > (processInfo.recommendTonnage ?? 0) && x.bedLength > dieSetLength && x.bedWidth > dieSetWidth)
          .sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
      } else if (processInfo.processTypeID === ProcessType.TrimmingPress) {
        machine = machineTypeDescription.sort((a, b) => a.platenLengthmm * a.platenWidthmm - b.platenLengthmm * b.platenWidthmm);
        this.selectedMachineIndex = machine.findIndex((x) => (x.platenLengthmm ?? 0) > (matMaterial?.dimX ?? 0) && (x.platenWidthmm ?? 0) > (matMaterial?.dimY ?? 0));
      } else if ([ProcessType.GravityDieCasting, ProcessType.LowPressureDieCasting].includes(processInfo.processTypeID)) {
        machine = machineTypeDescription.sort((a, b) => a.platenLengthmm * a.platenWidthmm - b.platenLengthmm * b.platenWidthmm);
        processInfo = this._simulationService._manufacturingCastingCalcService.doCostCalculationForCasting(processInfo, fieldColorsList, manufacturingObj);
        this.selectedMachineIndex = machine.findIndex((x) => x.platenLengthmm > processInfo.lengthOfCoated && x.platenWidthmm > processInfo.widthOfCoated);
        if (processInfo.processTypeID === ProcessType.GravityDieCasting) {
          if (this.selectedMachineIndex === -1) {
            this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes('manual'));
          }
        }

      } else if (processInfo.processTypeID === ProcessType.CastingShakeout) {
        machine = machineTypeDescription.sort((a, b) => a.machineCapacity - b.machineCapacity);
        if (matMaterial?.processId === PrimaryProcessType.GreenCastingAuto) {
          this.selectedMachineIndex = machine.findIndex((x) => x.machineCapacity >= processInfo.recommendTonnage && x.machineName.toLowerCase().includes('disa cool'));
          if (this.selectedMachineIndex === -1) {
            this.selectedMachineIndex = machine.findIndex((x) => x.machineCapacity >= processInfo.recommendTonnage);
          }
        } else if (matMaterial?.processId === PrimaryProcessType.GreenCastingSemiAuto) {
          this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes('vibratory conveyor'));
        } else if ([PrimaryProcessType.NoBakeCasting, PrimaryProcessType.InvestmentCasting].includes(matMaterial?.processId)) {
          this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes('vertical shakeout'));
        } else {
          this.selectedMachineIndex = machine.findIndex((x) => x.machineCapacity >= processInfo.recommendTonnage);
        }
      } else if (processInfo.processTypeID === ProcessType.CastingDegating) {
        machine = machineTypeDescription;
        if (matMaterial?.processId === PrimaryProcessType.GreenCastingAuto) {
          this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes('wedge breaker'));
          // } else if (matMaterial?.processId === PrimaryProcessType.GreenCastingSemiAuto) {
          //   this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes('abrasive wheel'));
        } else if (
          processInfo.materialmasterDatas.materialGroup === 'Ferrous' &&
          processInfo.materialmasterDatas.materialTypeName?.toLowerCase().includes('steel') &&
          [PrimaryProcessType.NoBakeCasting, PrimaryProcessType.InvestmentCasting, PrimaryProcessType.ShellCasting].includes(matMaterial?.processId)
        ) {
          this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes('oxy-acetylene'));
        } else {
          // this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes('band saw'));
          this.selectedMachineIndex = machine.findIndex((x) => x.machineName?.toLowerCase().includes('abrasive wheel'));
        }
      } else if (processInfo.processTypeID === ProcessType.CastingFettling) {
        machine = machineTypeDescription.sort((a, b) => a.maxProcessableWeightKgs - b.maxProcessableWeightKgs);
        if (matMaterial?.processId === PrimaryProcessType.NoBakeCasting) {
          this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes('hand grind'));
        } else if (matMaterial?.processId === PrimaryProcessType.GreenCastingAuto) {
          this.selectedMachineIndex = machine.findIndex((x) => x.maxProcessableWeightKgs >= netWeight && x.machineName.toLowerCase().includes('automatic'));
          if (this.selectedMachineIndex === -1) {
            this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes('automatic'));
          }
        } else if (matMaterial?.processId === PrimaryProcessType.GreenCastingSemiAuto || processInfo.materialmasterDatas.materialGroup === 'Non Ferrous') {
          // matMaterial.materialDescriptionList[0].materialGroup === 'Non Ferrous') {
          const searchTerm = netWeight > 45 ? 'hand grind' : 'snag';
          this.selectedMachineIndex = machine.findIndex((x) => x.maxProcessableWeightKgs >= netWeight && x.machineName.toLowerCase().includes(searchTerm));
          if (this.selectedMachineIndex === -1) {
            this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes(searchTerm));
          }
        } else if ([PrimaryProcessType.HPDCCasting, PrimaryProcessType.LPDCCasting].includes(matMaterial?.processId)) {
          this.selectedMachineIndex = machine.findIndex((x) => x.maxProcessableWeightKgs >= netWeight && x.machineMarketDtos.find((y: any) => y.machineType === 'Automatic'));
        } else {
          this.selectedMachineIndex = machine.findIndex((x) => x.maxProcessableWeightKgs >= netWeight);
        }
      } else if (processInfo.processTypeID === ProcessType.ShotBlasting) {
        machine = machineTypeDescription.sort((a, b) => a.maxProcessableWeightKgs - b.maxProcessableWeightKgs);
        if (matMaterial?.processId === PrimaryProcessType.NoBakeCasting) {
          this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes('hanging shot'));
        } else if ([PrimaryProcessType.GreenCastingAuto, PrimaryProcessType.GreenCastingSemiAuto, PrimaryProcessType.ShellCasting].includes(matMaterial?.processId)) {
          const searchTerm = netWeight > 20 ? 'hanging shot' : 'table blast';
          this.selectedMachineIndex = machine.findIndex((x) => x.maxProcessableWeightKgs >= netWeight && x.machineName.toLowerCase().includes(searchTerm));
          if (this.selectedMachineIndex === -1) {
            this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes(searchTerm));
          }
        } else if ([PrimaryProcessType.HPDCCasting, PrimaryProcessType.LPDCCasting, PrimaryProcessType.InvestmentCasting].includes(matMaterial?.processId)) {
          const searchTerm = netWeight > 20 ? 'hanging shot' : netWeight > 1 ? 'bead blasting' : 'tumbler';
          this.selectedMachineIndex = machine.findIndex((x) => x.maxProcessableWeightKgs >= netWeight && x.machineName.toLowerCase().includes(searchTerm));
          if (this.selectedMachineIndex === -1) {
            this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes(searchTerm));
          }
        } else if ([PrimaryProcessType.GDCCasting].includes(matMaterial?.processId)) {
          const searchTerm = netWeight > 20 ? 'hanging shot' : 'bead blasting';
          this.selectedMachineIndex = machine.findIndex((x) => x.maxProcessableWeightKgs >= netWeight && x.machineName.toLowerCase().includes(searchTerm));
          if (this.selectedMachineIndex === -1) {
            this.selectedMachineIndex = machine.findIndex((x) => x.machineName.toLowerCase().includes(searchTerm));
          }
        } else {
          this.selectedMachineIndex = machine.findIndex((x) => x.maxProcessableWeightKgs >= netWeight);
        }
      } else {
        machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons < b.machineTonnageTons ? -1 : 1));
      }

    } else if (currentPart?.commodityId == CommodityType.Electronics) {
      machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons < b.machineTonnageTons ? -1 : 1));
    } else if (currentPart?.commodityId === CommodityType.MetalForming || currentPart?.commodityId === CommodityType.StockMachining) {
      if (processInfo.processTypeID === ProcessType.SawCutting) {
        this._manufacturingForgingCalService.calculateForgingSawCuttingAndShearing(processInfo, fieldColorsList, manufacturingObj, currentPart);
        if (processInfo?.subProcessTypeID === 2) {
          const stockShearingMachines = this._manufacturingForgingSubProcessConfig.stockShearingMachines;

          machine = machineTypeDescription.filter((m) => stockShearingMachines.includes(m.machineName)).sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
          this.selectedMachineIndex = machine.findIndex((x) => x.machineTonnageTons >= processInfo?.recommendTonnage);
        }
        if (processInfo?.subProcessTypeID === 1) {
          const bandSawCuttingMachines = this._manufacturingForgingSubProcessConfig.bandSawCuttingMachines;
          if (processInfo.noOfbends === 2) {
            machine = machineTypeDescription.filter((m) => bandSawCuttingMachines.includes(m.machineName)).sort((a, b) => a.workPieceMinOrMaxDia - b.workPieceMinOrMaxDia);
            this.selectedMachineIndex = machine.findIndex((x) => x.workPieceMinOrMaxDia >= processInfo?.drillDiameter);
          }
          if (processInfo.noOfbends === 1) {
            machine = machineTypeDescription.filter((m) => bandSawCuttingMachines.includes(m.machineName)).sort((a, b) => a.workPieceHeight - b.workPieceHeight && a.stockWidth - b.stockWidth);
            this.selectedMachineIndex = machine.findIndex((x) => x.workPieceHeight >= processInfo?.drillDiameter && x.stockWidth >= processInfo?.workpieceStockDiameter);
          }
        }

      } else if (processInfo.processTypeID === ProcessType.HotClosedDieForging) {
        this._manufacturingForgingCalService.calculateHotForgingOpenClosedDieHot(processInfo, fieldColorsList, manufacturingObj);
        machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons < b.machineTonnageTons ? -1 : 1));
        this.selectedMachineIndex = machine.findIndex((x) => x.machineTonnageTons > processInfo.recommendTonnage);
      } else if (processInfo.processTypeID === ProcessType.ShotBlasting) {
        this._manufacturingForgingCalService.calculateForgingShotBlasting(processInfo, fieldColorsList, manufacturingObj);

        // Initialize machine array from machineTypeDescription
        machine = machineTypeDescription.sort((a, b) => a.maxProcessableWeightKgs - b.maxProcessableWeightKgs);

        // Map subprocess types to machine name patterns
        const machineNameMap: { [key: number]: string } = {
          1: 'Shot Blasting-Chamber Loading_181kg_Barrel Size-Wide 787.4xDia. 609.6mm_USA',
          2: 'Shot Blasting-Conveyor Loading-Roller Type_W 1500xH800mm_Germany',
        };

        const targetMachineName = machineNameMap[processInfo?.subProcessTypeID as any];
        if (targetMachineName) {
          this.selectedMachineIndex = machine.findIndex((x) => x.machineName === targetMachineName);
        }

        // Fallback: use first machine if target not found or no matching subprocessType
        if (this.selectedMachineIndex === -1 && machine.length > 0) {
          this.selectedMachineIndex = 0;
        }
      } else if (processInfo.processTypeID === ProcessType.TrimmingPressForging) {
        this._manufacturingTrimmingHydraulicForgingCalService.calculateTrimmingHydraulicForging(processInfo, fieldColorsList, manufacturingObj);
        machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons < b.machineTonnageTons ? -1 : 1));
        this.selectedMachineIndex = machine.findIndex((x) => x.machineTonnageTons > processInfo.theoreticalForce);
      } else if (processInfo.processTypeID === ProcessType.Straightening) {
        this._manufacturingStraighteningOptionalForgingCalService.calculateStraighteningOptionalForging(processInfo, fieldColorsList, manufacturingObj);
        machine = machineTypeDescription;
        this.selectedMachineIndex = machine.findIndex((x) => x.machineName === 'Straightening_Automatic_0.2-160T_L 30-3000mmxW 2-300mm_Germany');
        if (this.selectedMachineIndex === -1) {
          // Fallback: use first machine if available
          this.selectedMachineIndex = machine.length > 0 ? 0 : -1;
        }
      } else if (processInfo?.materialInfoList[0]?.processId === PrimaryProcessType.ColdForgingClosedDieHot && processInfo.processTypeID === ProcessType.ThreadRolling) {
        this._manufacturingForgingCalService.calculateForgingThreadRolling(processInfo, fieldColorsList, manufacturingObj);
        machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons < b.machineTonnageTons ? -1 : 1));
        this.selectedMachineIndex = machine.findIndex((x) => x.machineTonnageTons > processInfo.theoreticalForce);
        if (this.selectedMachineIndex === -1 && machine.length > 0) {
          this.selectedMachineIndex = machine.length - 1;
        }
      } else if (processInfo?.materialInfoList[0]?.processId === PrimaryProcessType.ColdForgingColdHeading && processInfo.processTypeID === ProcessType.ThreadRolling) {
        this._manufacturingForgingCalService.calculateColdHeadingThreadRolling(processInfo, fieldColorsList, manufacturingObj);
        machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons < b.machineTonnageTons ? -1 : 1));
        this.selectedMachineIndex = machine.findIndex((x) => x.machineTonnageTons > processInfo.theoreticalForce);
        if (this.selectedMachineIndex === -1 && machine.length > 0) {
          this.selectedMachineIndex = machine.length - 1;
        }
      } else if (processInfo?.materialInfoList[0]?.processId === PrimaryProcessType.ColdForgingColdHeading && processInfo.processTypeID === ProcessType.ColdHeading) {
        this._manufacturingForgingCalService.calculateColdHeadingForging(processInfo, fieldColorsList, manufacturingObj);
        machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons < b.machineTonnageTons ? -1 : 1));
        this.selectedMachineIndex = machine.findIndex((x) => x.machineTonnageTons > processInfo?.recommendTonnage);
        if (this.selectedMachineIndex === -1 && machine.length > 0) {
          this.selectedMachineIndex = machine.length - 1;
        }
      } else if (processInfo?.materialInfoList[0]?.processId === PrimaryProcessType.ColdForgingClosedDieHot && processInfo.processTypeID === ProcessType.ClosedDieForging) {
        this._manufacturingForgingCalService.calculateColdCloseDieForging(processInfo, fieldColorsList, manufacturingObj);
        machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons < b.machineTonnageTons ? -1 : 1));
        this.selectedMachineIndex = machine.findIndex((x) => x.machineTonnageTons > processInfo?.recommendTonnage);
        if (this.selectedMachineIndex === -1 && machine.length > 0) {
          this.selectedMachineIndex = machine.length - 1;
        }
      } else if (processInfo.processTypeID === ProcessType.Piercing) {
        this._manufacturingPiercingHydraulicForgingCalService.calculatePiercingHydraulicForging(processInfo, fieldColorsList, manufacturingObj);
        machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons < b.machineTonnageTons ? -1 : 1));
        this.selectedMachineIndex = machine.findIndex((x) => x.machineTonnageTons > processInfo.theoreticalForce);
      } else if (processInfo.processTypeID === ProcessType.Testing) {
        this._manufacturingTestingMpiForgingCalService.calculateTestingMpiForging(processInfo, fieldColorsList, manufacturingObj);
        machine = machineTypeDescription.sort((a, b) => (a.workPieceLength < b.workPieceLength ? -1 : 1));
        this.selectedMachineIndex = machine.findIndex((x) => x.workPieceLength > processInfo?.materialInfoList[0]?.partLength);
      } else if (processInfo.processTypeID === ProcessType.BilletHeatingContinuousFurnace) {
        machine = machineTypeDescription.sort((a, b) => (a.totalPowerKW < b.totalPowerKW ? -1 : 1));
        const machineThresholds = this._manufacturingForgingSubProcessConfig.machineThresholdsBilletHeatingContinuousFurnace;
        const weightInKg = this.sharedService.isValidNumber(materialInfo?.grossWeight / 1000);
        const target = machineThresholds.find((t) => weightInKg <= t.max);
        const targetMachineName = target?.name;
        this.selectedMachineIndex = machine.findIndex((x) => x.machineName === targetMachineName);
      } else {
        machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons < b.machineTonnageTons ? -1 : 1));
      }
    } else {
      machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons < b.machineTonnageTons ? -1 : 1));
    }
    if (machine?.length === 0 && machineTypeDescription?.length > 0) {
      machine = machineTypeDescription.sort((a, b) => (a.machineTonnageTons < b.machineTonnageTons ? -1 : 1));
    }
    this.selectedMachineIndex = Math.max(0, this.selectedMachineIndex);
    return machine;
  }

  filterbyMachineType(machineTypeDescription: MedbMachinesMasterDto[], processTypeId: number, matMaterialProcessId: number) {
    if ([ProcessType.CastingCorePreparation, ProcessType.MoldPerparation, ProcessType.PouringCasting, ProcessType.CastingFettling].includes(processTypeId)) {
      // select the auto and non-auto machines
      if (matMaterialProcessId === PrimaryProcessType.GreenCastingAuto) {
        machineTypeDescription = machineTypeDescription.filter((x) => x.machineMarketDtos.find((y) => y.machineType === 'Automatic'));
      } else if (matMaterialProcessId === PrimaryProcessType.GreenCastingSemiAuto) {
        machineTypeDescription = machineTypeDescription.filter((x) => x.machineMarketDtos.find((y) => y.machineType !== 'Automatic'));
      }
    }
    return machineTypeDescription;
  }

  automateProcessEntries(materialInfo: MaterialInfoDto, laborRateInfo: LaborRateMasterDto[], processInfo: ProcessInfoDto, params: AutomateProcessParams, processTypeList: ProcessType[] = null) {
    const {
      thisCurrentPart,
      machineInfoList,
      defaultValues,
      processTypeOrginalList,
      fieldColorsList,
      manufacturingObj,
      laborCountByMachineType,
      subProcessFormArray,
      inputSelectedProcessInfoId,
      inputFormIdentifier,
      // inputAutomationProcessCount,
      totSubProcessCount,
      toolingMasterData,
      commodity,
      countryList,
      // inputMachineTypeDescription,
    } = params;
    this.totProcessList = [];
    this.newCoreAdded = params.newCoreAdded || false;
    const materialInfoList: MaterialInfoDto[] = [materialInfo];
    const currentPart = thisCurrentPart;
    // this.automationProcessCount = inputAutomationProcessCount;
    this.automationProcessCount++;
    this.selectedProcessInfoId = inputSelectedProcessInfoId;
    this.formIdentifier = inputFormIdentifier;
    this.laborRateInfo = laborRateInfo;
    this.toolingMasterData = toolingMasterData;
    this.countryList = countryList;
    this.commodity = commodity;
    // this.machineTypeDescription = inputMachineTypeDescription;
    processInfo.eav = currentPart?.eav;
    processInfo.sortOrder = 0;
    let proceed = true;
    if (processInfo.processTypeID === ProcessType.CastingCorePreparation) {
      const coreSandMaterial = processInfo.materialInfoList?.find((x) => x?.secondaryProcessId === 2);
      if (!(coreSandMaterial?.coreCostDetails?.length >= 1)) {
        // dont include in automation if sand core is not present
        proceed = false;
      }
    }
    if (processInfo.processTypeID === ProcessType.CastingCoreAssembly) {
      const coreSandMaterial = processInfo.materialInfoList?.find((x) => x?.secondaryProcessId === 2);
      if (!(coreSandMaterial?.coreCostDetails?.length >= 2)) {
        // dont include in automation if no. of core is less than 2 for core assembly
        proceed = false;
      }
    }

    if (processInfo.processTypeID && thisCurrentPart.mfrCountryId && thisCurrentPart.supplierInfoId && proceed) {
      this.digitalFactoryService
        .getMachineMasterByProcessTypeId({
          supplierId: currentPart.supplierInfoId,
          processTypeId: processInfo.processTypeID,
          countryData: this.countryList.find((c) => c.countryId === currentPart.mfrCountryId),
          laborRate: laborRateInfo[0],
        })
        .pipe(take(1))
        .subscribe((machineTypeDescription: MedbMachinesMasterDto[]) => {
          if (machineTypeDescription && machineTypeDescription.length > 0) {
            processInfo.machineList = machineTypeDescription;
            processInfo.processInfoList = machineInfoList;
            let machine: MedbMachinesMasterDto[] = [];
            const isCasting = this._manufacturingConfig.castingProcesses.includes(materialInfo?.processId);
            const isMachiningProcess = this._manufacturingConfig._machining.machiningProcess.includes(processInfo?.processTypeID);
            const isSecondaryProcess = this._manufacturingConfig.secondaryProcesses.includes(materialInfo?.processId);
            const isMetalTubeExtrusion = this._manufacturingConfig.metalTubeExtrusionProcesses.includes(processInfo.processTypeID);
            const isMetalExtrusion = this._manufacturingConfig.metalExtrusionProcesses.includes(processInfo.processTypeID);
            const isPlasticTubeExtrusion = this._manufacturingConfig.plasticTubeExtrusionProcesses.includes(processInfo.processTypeID);
            const isInsulationJacket = this._manufacturingConfig.insulationJacket.includes(processInfo.processTypeID);
            const isWelding = this._manufacturingConfig.weldingProcesses.includes(materialInfo?.processId);

            machine = this.selectMachineProcess(
              processInfo,
              thisCurrentPart,
              materialInfo,
              machineTypeDescription,
              laborRateInfo,
              processTypeOrginalList,
              fieldColorsList,
              manufacturingObj
              // moldBoxSize
            );
            if (machine && machine[this.selectedMachineIndex]) {
              this.machineTypeDescription = machine;
              let machineTypeObj: MedbMachinesMasterDto;
              if (processInfo.processTypeID === ProcessType.PlasticConvolutedTubeExtrusion) {
                const selectedMachine = machine.find((x) => materialInfo.dimZ > x.minJobDiamm && materialInfo.dimZ <= x.maxJobDiamm) || machine[0];
                processInfo = this._manufacturingConfig.setMachineMasterObject(processInfo, selectedMachine);
                machineTypeObj = machineTypeDescription.find((x) => x.machineID == selectedMachine?.machineID);
              } else {
                processInfo = this._manufacturingConfig.setMachineMasterObject(processInfo, machine[this.selectedMachineIndex]);
                machineTypeObj = machineTypeDescription.find((x) => x.machineID == machine[this.selectedMachineIndex]?.machineID);
              }
              if (machineTypeObj && processInfo?.machineMarketId) {
                this._manufacturingConfig.setMachineLaborInfo(processInfo, laborRateInfo, machineTypeObj, processTypeOrginalList);
                processInfo.samplingRate = defaultValues.samplingRate;
                if (
                  [
                    ProcessType.LaserCutting,
                    ProcessType.PlasmaCutting,
                    ProcessType.OxyCutting,
                    ProcessType.WaterJetCutting,
                    ProcessType.Progressive,
                    ProcessType.Drawing,
                    ProcessType.Forming,
                    ProcessType.Stage,
                    ProcessType.TurretTPP,
                    ProcessType.Bending,
                    ProcessType.TransferPress,
                    ProcessType.Shearing,
                  ].includes(processInfo.processTypeID)
                ) {
                  processInfo.samplingRate = this._sheetMetalService._smConfig.defaultPercentages(Number(processInfo.processTypeID), processInfo.partComplexity, 'samplingRate');
                  processInfo.yieldPer = this._sheetMetalService._smConfig.defaultPercentages(Number(processInfo.processTypeID), processInfo.partComplexity, 'yieldPercentage');
                }
                if (
                  isWelding ||
                  materialInfo?.processId == PrimaryProcessType.InjectionMouldingSingleShot ||
                  materialInfo?.processId == PrimaryProcessType.InjectionMouldingDoubleShot ||
                  materialInfo?.processId == PrimaryProcessType.RubberInjectionMolding
                ) {
                  const machineObj = laborCountByMachineType?.find((x) => x.machineTypeId === processInfo?.semiAutoOrAuto);
                  // const laborcount = processInfo.noOfLowSkilledLabours ?? this.sharedService.isValidNumber(Number(machineObj?.noOfLowSkilledLabours) +
                  //   Number(machineObj?.noOfSemiSkilledLabours) + Number(machineObj?.noOfSkilledLabours) + Number(machineObj?.specialSkilledLabours));
                  processInfo.noOfLowSkilledLabours = machineObj?.lowSkilledLaborRate;
                  const machineHourRate = this._manufacturingConfig.getMachineHourRateByMachineType(processInfo, processInfo?.semiAutoOrAuto);
                  processInfo.machineHourRate = machineHourRate;
                }
                processInfo.machineHourRateFromDB = processInfo.machineHourRate;
                // defaultValues.machineHourRate = processInfo.machineHourRate;
                processInfo = this._simulationService.setCommonObjectValues(processInfo, fieldColorsList, manufacturingObj);
                if (isSecondaryProcess) {
                  this.handleRecalculationResult(
                    this._simulationService._manufacturingPlatingCalcService.calculationsForPlating(processInfo, fieldColorsList, manufacturingObj),
                    materialInfoList,
                    currentPart,
                    null,
                    manufacturingObj,
                    fieldColorsList
                  );
                }
                // else if (materialInfo?.processId == PrimaryProcessType.ThermoForming) {
                //   const toolingEntryData = { materialInfo: materialInfo, processInfo: processInfo, toolNameId: SheetMetalTool.CuttingTool };
                //   this.handleRecalculationResult(
                //     this._plasticRubberService.doCostCalculationForThermoForming(processInfo, fieldColorsList, manufacturingObj),
                //     materialInfoList,
                //     currentPart,
                //     toolingEntryData,
                //     manufacturingObj,
                //     fieldColorsList
                //   );
                // }
                else if (isWelding) {
                  !processInfo?.weldingPosition && (processInfo.weldingPosition = 1);
                  if (materialInfo?.processId === PrimaryProcessType.SpotWelding) {
                    this.handleRecalculationResult(
                      this._weldingService.calculationForSpotWelding(processInfo, fieldColorsList, manufacturingObj, laborRateInfo),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (materialInfo?.processId === PrimaryProcessType.SeamWelding) {
                    this.handleRecalculationResult(
                      this._weldingService.calculationForSeamWelding(processInfo, fieldColorsList, manufacturingObj, laborRateInfo),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else {
                    this.handleRecalculationResult(
                      this._weldingService.calculationForWelding(processInfo, fieldColorsList, manufacturingObj, laborRateInfo),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  }
                } else if (isMachiningProcess) {
                  processInfo.yieldPer = 98;
                  this.handleRecalculationResult(
                    this._simulationService._manufacturingMachiningCalcService.calculationForMachiningTypes(processInfo, fieldColorsList, manufacturingObj, laborRateInfo, currentPart, 'automation'),
                    materialInfoList,
                    currentPart,
                    null,
                    manufacturingObj,
                    fieldColorsList
                  );
                } else if (isCasting) {
                  if (materialInfo?.processId === PrimaryProcessType.HPDCCasting || materialInfo?.processId === PrimaryProcessType.LPDCCasting) {
                    if (processInfo.processTypeID === ProcessType.HighPressureDieCasting || processInfo.processTypeID === ProcessType.LowPressureDieCasting) {
                      processInfo.yieldPer = 95;
                    } else {
                      processInfo.yieldPer = 0;
                    }
                    // if (processInfo.processTypeID === ProcessType.RadiographyTesting) {
                    //   processInfo.samplingRate = 2;
                    // } else if (processInfo.processTypeID === ProcessType.ManualInspection) {
                    //   processInfo.samplingRate = 10;
                    // } else {
                    //   processInfo.samplingRate = 0;
                    // }
                    processInfo.samplingRate = 0;
                  } else {
                    processInfo.yieldPer = 0;
                    processInfo.samplingRate = 0;
                  }
                  if (processInfo.processTypeID === ProcessType.CastingCorePreparation) {
                    processInfo.coreCycleTimes = processInfo.coreCycleTimes?.split(',') || [];
                  }
                  // if (
                  //   processInfo.processTypeID === ProcessType.GravityDieCasting ||
                  //   processInfo.processTypeID === ProcessType.LowPressureDieCasting ||
                  //   (processInfo.processTypeID === ProcessType.TrimmingPress && materialInfo?.processId === PrimaryProcessType.LPDCCasting)
                  // ) {
                  //   processInfo.newToolingRequired = false;
                  // }
                  if (processInfo.processTypeID === ProcessType.LowPressureDieCasting) {
                    processInfo.noOfHitsRequired = 0;
                  }
                  const calculationRes = this._simulationService._manufacturingCastingCalcService.doCostCalculationForCasting(processInfo, fieldColorsList, manufacturingObj);
                  if (calculationRes) {
                    // let isToolingNeedToRun = false;
                    calculationRes.dataCompletionPercentage = this.percentageCalculator.manufacturingInformation(calculationRes);
                    if (calculationRes.processTypeID === ProcessType.CastingCorePreparation) {
                      calculationRes.coreCycleTimes = calculationRes.coreCycleTimes.join(',');
                    }
                    if (calculationRes.processTypeID === ProcessType.HighPressureDieCasting) {
                      processInfo.newToolingRequired = true;
                      // const result = this.toolingRecalculationService.automationForToolingEntry(materialInfo, processInfo, laborRateInfo, HPDCCastingTool.HPDC, defaultMarketData, thisCurrentPart, this.ToolingMasterData, this.countryList, this.commodity, this.conversionValue, this.isEnableUnitConversion);
                      this.toolingRecalculationService
                        .automationForToolingEntry(
                          materialInfo,
                          processInfo,
                          laborRateInfo,
                          HPDCCastingTool.HPDC,
                          thisCurrentPart,
                          toolingMasterData,
                          countryList,
                          commodity,
                          this.conversionValue,
                          this.isEnableUnitConversion
                        )
                        .subscribe((result) => {
                          calculationRes.costTooling = result.costTooling;
                          this.totProcessList.push(calculationRes);
                          this.updateSelectedProcess(
                            this.recalculateProcessCost(
                              this.totProcessList,
                              materialInfoList,
                              currentPart,
                              this.automationProcessCount,
                              this.selectedProcessInfoId,
                              this.formIdentifier,
                              manufacturingObj,
                              fieldColorsList,
                              laborRateInfo
                            )
                          );
                        });
                      // isToolingNeedToRun = true;
                    } else if (calculationRes.processTypeID === ProcessType.TrimmingPress) {
                      processInfo.newToolingRequired = true;
                      if (materialInfo?.processId === PrimaryProcessType.LPDCCasting) {
                        processInfo.newToolingRequired = false;
                        this.totProcessList.push(calculationRes);
                        this.updateSelectedProcess(
                          this.recalculateProcessCost(
                            this.totProcessList,
                            materialInfoList,
                            currentPart,
                            this.automationProcessCount,
                            this.selectedProcessInfoId,
                            this.formIdentifier,
                            manufacturingObj,
                            fieldColorsList,
                            laborRateInfo
                          )
                        );
                      } else {
                        // const result = this.toolingRecalculationService.automationForToolingEntry(materialInfo, processInfo, laborRateInfo, HPDCCastingTool.TrimmingDie, defaultMarketData, thisCurrentPart, this.ToolingMasterData, this.countryList, this.commodity, this.conversionValue, this.isEnableUnitConversion);
                        this.toolingRecalculationService
                          .automationForToolingEntry(
                            materialInfo,
                            processInfo,
                            laborRateInfo,
                            HPDCCastingTool.TrimmingDie,
                            thisCurrentPart,
                            toolingMasterData,
                            countryList,
                            commodity,
                            this.conversionValue,
                            this.isEnableUnitConversion
                          )
                          .subscribe((result) => {
                            calculationRes.costTooling = result.costTooling;
                            this.totProcessList.push(calculationRes);
                            this.updateSelectedProcess(
                              this.recalculateProcessCost(
                                this.totProcessList,
                                materialInfoList,
                                currentPart,
                                this.automationProcessCount,
                                this.selectedProcessInfoId,
                                this.formIdentifier,
                                manufacturingObj,
                                fieldColorsList,
                                laborRateInfo
                              )
                            );
                          });
                      }
                      // isToolingNeedToRun = true;
                    } else {
                      this.totProcessList.push(calculationRes);
                      if (this.newCoreAdded && this.automationProcessCount > 0 && this.automationProcessCount === this.totProcessList.length) {
                        for (let i = 0; i < this.totProcessList.length; i++) {
                          const updatedProcess = this._simulationService._manufacturingSustainabilityCalService.doCostCalculationsForSustainability(
                            this.totProcessList[i],
                            fieldColorsList,
                            manufacturingObj,
                            laborRateInfo
                          );
                          this.totProcessList[i] = updatedProcess;
                        }
                        this.processInfoSignalService.bulkUpdateOrCreateProcessInfo(this.totProcessList);
                        this.automationProcessCount = 0;
                        this.newCoreAdded = false;
                        return;
                      } else {
                        const selectedProcess = this.recalculateProcessCost(
                          this.totProcessList,
                          materialInfoList,
                          currentPart,
                          this.automationProcessCount,
                          this.selectedProcessInfoId,
                          this.formIdentifier,
                          manufacturingObj,
                          fieldColorsList,
                          laborRateInfo
                        );
                        this.updateSelectedProcess(selectedProcess);
                      }
                    }
                  }
                } else if (isMetalTubeExtrusion || isMetalExtrusion) {
                  isMetalExtrusion &&
                    this.handleRecalculationResult(
                      this._simulationService._manufacturingMetalExtrusionCalService.doCostCalculationsForMetalExtrusion(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  isMetalTubeExtrusion &&
                    this.handleRecalculationResult(
                      this._simulationService._manufacturingMetalExtrusionCalService.doCostCalculationsForMetalTubeExtrusion(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                } else if (isInsulationJacket) {
                  this.handleRecalculationResult(
                    this._simulationService._manufacturingInsulationJacketCalService.doCostCalculationsForInsulationJacket(processInfo, fieldColorsList, manufacturingObj),
                    materialInfoList,
                    currentPart,
                    null,
                    manufacturingObj,
                    fieldColorsList
                  );
                } else if (materialInfo?.processId == PrimaryProcessType.Brazing) {
                  this.handleRecalculationResult(
                    this._simulationService._manufacturingBrazingCalService.doCostCalculationsForBrazing(processInfo, fieldColorsList, manufacturingObj),
                    materialInfoList,
                    currentPart,
                    null,
                    manufacturingObj,
                    fieldColorsList
                  );
                } else if (materialInfo?.processId == PrimaryProcessType.TubeBending) {
                  this.handleRecalculationResult(
                    this._simulationService._manufacturingTubeBendingCalService.doCostCalculationsForTubeBending(processInfo, fieldColorsList, manufacturingObj),
                    materialInfoList,
                    currentPart,
                    null,
                    manufacturingObj,
                    fieldColorsList
                  );
                } else if (thisCurrentPart?.commodityId == CommodityType.PlasticAndRubber) {
                  // this.stagetoolingCompletion.bending = true;
                  // this.stagetoolingCompletion.forming = true;
                  if (materialInfo?.processId == PrimaryProcessType.InjectionMouldingSingleShot || materialInfo?.processId == PrimaryProcessType.InjectionMouldingDoubleShot) {
                    processInfo.newToolingRequired = true;
                    const toolingEntryData = { toolNameId: InjectionMouldingTool.InjectionMoulding, materialInfo: materialInfo, processInfo: processInfo };
                    this.handleRecalculationResult(
                      this._plasticRubberService.calculationsForInjectionMoulding(processInfo, fieldColorsList, manufacturingObj, this.laborRateInfo),
                      materialInfoList,
                      currentPart,
                      toolingEntryData,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (materialInfo?.processId == PrimaryProcessType.RubberInjectionMolding) {
                    processInfo.newToolingRequired = false;
                    // const toolingEntryData = { toolNameId: InjectionMouldingTool.InjectionMoulding, materialInfo: materialInfo, processInfo: processInfo };
                    this.handleRecalculationResult(
                      this._plasticRubberService.calculationsForRubberInjectionMoulding(processInfo, fieldColorsList, manufacturingObj, this.laborRateInfo),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (materialInfo?.processId == PrimaryProcessType.RubberExtrusion) {
                    this.handleRecalculationResult(
                      this._plasticRubberService.calculationsForRubberExtrusion(processInfo, fieldColorsList, manufacturingObj, this.laborRateInfo),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (isPlasticTubeExtrusion) {
                    this.handleRecalculationResult(
                      this._simulationService._manufacturingPlasticTubeExtrusionCalcService.doCostCalculationsForPlasticTubeExtrusion(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (materialInfo?.processId == PrimaryProcessType.CompressionMoulding) {
                    processInfo.newToolingRequired = false;
                    this.handleRecalculationResult(
                      this._plasticRubberService.calculationsForCompressionMolding(processInfo, fieldColorsList, manufacturingObj, this.laborRateInfo),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (materialInfo?.processId === PrimaryProcessType.TransferMolding) {
                    processInfo.newToolingRequired = false;
                    if (processInfo?.processTypeID === ProcessType.Cutting) {
                      this.handleRecalculationResult(
                        this._plasticRubberService.calculationsForCutting(processInfo, fieldColorsList, manufacturingObj, this.laborRateInfo),
                        materialInfoList,
                        currentPart,
                        null,
                        manufacturingObj,
                        fieldColorsList
                      );
                    } else {
                      this.handleRecalculationResult(
                        this._plasticRubberService.calculationsForTransferMolding(processInfo, fieldColorsList, manufacturingObj, this.laborRateInfo),
                        materialInfoList,
                        currentPart,
                        null,
                        manufacturingObj,
                        fieldColorsList
                      );
                    }
                  } else if (materialInfo?.processId === PrimaryProcessType.ThermoForming) {
                    const toolingEntryData = { materialInfo: materialInfo, processInfo: processInfo, toolNameId: SheetMetalTool.CuttingTool };
                    if (processInfo?.processTypeID === ProcessType.Cutting) {
                      this.handleRecalculationResult(
                        this._plasticRubberService.calculationsForCutting(processInfo, fieldColorsList, manufacturingObj, this.laborRateInfo),
                        materialInfoList,
                        currentPart,
                        null,
                        manufacturingObj,
                        fieldColorsList
                      );
                    } else {
                      this.handleRecalculationResult(
                        this._plasticRubberService.doCostCalculationForThermoForming(processInfo, fieldColorsList, manufacturingObj, this.laborRateInfo),
                        materialInfoList,
                        currentPart,
                        toolingEntryData,
                        manufacturingObj,
                        fieldColorsList
                      );
                    }
                  } else if (materialInfo?.processId === PrimaryProcessType.PlasticVacuumForming) {
                    const toolingEntryData = { materialInfo: materialInfo, processInfo: processInfo, toolNameId: SheetMetalTool.CuttingTool };
                    if (processInfo?.processTypeID === ProcessType.Cutting) {
                      this.handleRecalculationResult(
                        this._plasticRubberService.calculationsForCutting(processInfo, fieldColorsList, manufacturingObj, this.laborRateInfo),
                        materialInfoList,
                        currentPart,
                        null,
                        manufacturingObj,
                        fieldColorsList
                      );
                    } else {
                      this.handleRecalculationResult(
                        this._plasticRubberService.doCostCalculationForVacuumForming(processInfo, fieldColorsList, manufacturingObj, this.laborRateInfo),
                        materialInfoList,
                        currentPart,
                        toolingEntryData,
                        manufacturingObj,
                        fieldColorsList
                      );
                    }
                  } else if (materialInfo?.processId == PrimaryProcessType.BlowMoulding) {
                    this.handleRecalculationResult(
                      this._plasticRubberService.calculationsForBlowMolding(processInfo, fieldColorsList, manufacturingObj, currentPart, this.laborRateInfo),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  }
                } else if (thisCurrentPart?.commodityId == CommodityType.SheetMetal) {
                  if ([ProcessType.LaserCutting, ProcessType.TurretTPP, ProcessType.PlasmaCutting, ProcessType.OxyCutting].includes(processInfo?.processTypeID)) {
                    if (this.sharedService.extractedProcessData?.ProcessBendingInfo || this.sharedService.extractedProcessData?.ProcessFormInfo) {
                      processInfo.inspectionCost = 0;
                      processInfo.qaOfInspectorRate = 0;
                      processInfo.inspectionTime = 0;
                      processInfo.isQaInspectorRateDirty = true;
                      processInfo.isinspectionCostDirty = true;
                      processInfo.isinspectionTimeDirty = true;
                    }
                  }
                  if ([ProcessType.LaserCutting, ProcessType.PlasmaCutting, ProcessType.OxyCutting].includes(processInfo?.processTypeID)) {
                    processInfo.newToolingRequired = false;
                    this.handleRecalculationResult(
                      this._sheetMetalService.calculationForCutting(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (processInfo?.processTypeID == ProcessType.TurretTPP) {
                    processInfo.newToolingRequired = false;
                    this.handleRecalculationResult(
                      this._sheetMetalService.calculationsForTPP(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (materialInfo?.processId == PrimaryProcessType.TubeLaserCutting) {
                    this.handleRecalculationResult(
                      this._sheetMetalService.calculationForTubeLaser(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (processInfo?.processTypeID == ProcessType.Bending) {
                    // if (processInfo?.moldTemp == BendingToolTypes.Dedicated) {
                    //   this.handleRecalculationResult(
                    //     this._sheetMetalService.calculationForBending(processInfo, fieldColorsList, manufacturingObj),
                    //     materialInfoList,
                    //     currentPart,
                    //     null,
                    //     manufacturingObj,
                    //     fieldColorsList
                    //   );
                    // } else if (processInfo?.moldTemp == BendingToolTypes.Soft) {
                    this.handleRecalculationResult(
                      this._sheetMetalService.calculationForSoftBending(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                    // }
                  } else if (processInfo?.processTypeID == ProcessType.Forming) {
                    this.handleRecalculationResult(
                      this._sheetMetalService.calculationForForming(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (materialInfo?.processId == PrimaryProcessType.StampingProgressive) {
                    processInfo.newToolingRequired = true;
                    // this._sheetMetalService.calculationForstampingProgressive(processInfo, fieldColorsList, manufacturingObj)
                    //   .pipe(takeUntil(this.unsubscribe$)).subscribe((calculationRes: any) => {
                    const calculationRes = this._sheetMetalService.calculationForstampingProgressive(processInfo, fieldColorsList, manufacturingObj);
                    if (calculationRes) {
                      this._manufacturingConfig.subProcessTypeInfoMapper(calculationRes);
                      if (calculationRes.subProcessFormArray?.length > 0) {
                        calculationRes.subProcessFormArray.clear();
                      }
                      const toolingEntryData = { materialInfo: materialInfo, processInfo: calculationRes, toolNameId: SheetMetalTool.StampingTool };
                      this.handleRecalculationResult(calculationRes, materialInfoList, currentPart, toolingEntryData, manufacturingObj, fieldColorsList);
                    }
                    // });
                  } else if (materialInfo?.processId === PrimaryProcessType.TransferPress) {
                    if (processInfo.processTypeID === ProcessType.Shearing) {
                      processInfo.newToolingRequired = false;
                      this.handleRecalculationResult(
                        this._sheetMetalService.calculationForShearing(processInfo, fieldColorsList, manufacturingObj),
                        materialInfoList,
                        currentPart,
                        null,
                        manufacturingObj,
                        fieldColorsList
                      );
                    } else {
                      processInfo.newToolingRequired = true;
                      const calculationRes = this._sheetMetalService.calculationForTransferPress(processInfo, fieldColorsList, manufacturingObj);
                      if (calculationRes) {
                        this._manufacturingConfig.subProcessTypeInfoMapper(calculationRes);
                        if (calculationRes.subProcessFormArray?.length > 0) {
                          calculationRes.subProcessFormArray.clear();
                        }
                        const toolingEntryData = { materialInfo: materialInfo, processInfo: calculationRes, toolNameId: SheetMetalTool.StampingTool };
                        this.handleRecalculationResult(calculationRes, materialInfoList, currentPart, toolingEntryData, manufacturingObj, fieldColorsList);
                      }
                    }
                  } else if (materialInfo?.processId == PrimaryProcessType.StampingStage) {
                    processInfo.newToolingRequired = true;
                    const calculationRes = this._sheetMetalService.calculationForstampingStage(processInfo, fieldColorsList, manufacturingObj, currentPart);
                    if (calculationRes) {
                      for (let i = 0; i < calculationRes?.subProcessFormArray?.controls?.length; i++) {
                        const info = calculationRes?.subProcessFormArray?.controls[i];
                        const mappedResult = this._manufacturingConfig._sheetMetalConfig.stampingSubprocessMapper(info);
                        if (calculationRes.subProcessTypeInfos == null) {
                          calculationRes.subProcessTypeInfos = [];
                        }
                        calculationRes.subProcessFormArray = null;
                        calculationRes.subProcessTypeInfos.push(mappedResult);
                      }
                      // calculationRes.dataCompletionPercentage = this.percentageCalculator.manufacturingInformation(calculationRes);
                      const subprocessType = calculationRes?.subProcessTypeInfos[0].subProcessTypeId;
                      // let toolName = [StampingType.BlankingPunching, StampingType.Piercing].includes(subprocessType) ? SheetMetalTool.BalnkAndPierce :
                      //   subprocessType === StampingType.Bending ? SheetMetalTool.BendingTool :
                      //     subprocessType === StampingType.Compound ? SheetMetalTool.CompoundTool :
                      //       subprocessType === StampingType.Forming ? SheetMetalTool.FormingTool : SheetMetalTool.StampingTool;
                      const toolMap = new Map<StampingType, SheetMetalTool>([
                        [StampingType.BlankingPunching, SheetMetalTool.BalnkAndPierce],
                        [StampingType.Piercing, SheetMetalTool.BalnkAndPierce],
                        [StampingType.Bending, SheetMetalTool.BendingTool],
                        [StampingType.Compound, SheetMetalTool.CompoundTool],
                        [StampingType.Forming, SheetMetalTool.FormingTool],
                        [StampingType.ShallowDrawRect, SheetMetalTool.ShallowDrawTool],
                        [StampingType.RedrawRect, SheetMetalTool.RedrawTool],
                        [StampingType.ShallowDrawCir, SheetMetalTool.ShallowDrawTool],
                        [StampingType.RedrawCir, SheetMetalTool.RedrawTool],
                        [StampingType.Trimming, SheetMetalTool.TrimmingTool],
                      ]);
                      const toolName = toolMap.get(subprocessType) ?? SheetMetalTool.StampingTool;
                      // const result = this.toolingRecalculationService.automationForToolingEntry(materialInfo, calculationRes, laborRateInfo, toolName, defaultMarketData, thisCurrentPart, this.ToolingMasterData, this.countryList, this.commodity, this.conversionValue, this.isEnableUnitConversion);
                      const toolingEntryData = { toolNameId: toolName, materialInfo: materialInfo, processInfo: processInfo };
                      this.handleRecalculationResult(calculationRes, materialInfoList, currentPart, toolingEntryData, manufacturingObj, fieldColorsList);
                    }
                  } else if (processInfo?.processTypeID === ProcessType.Shearing) {
                    processInfo.newToolingRequired = false;
                    this.handleRecalculationResult(
                      this._sheetMetalService.calculationForShearing(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  }
                } else if (thisCurrentPart?.commodityId == CommodityType.MetalForming) {
                  if (processInfo.processTypeID == ProcessType.ClosedDieForging) {
                    const toolingEntryData = { toolNameId: SheetMetalTool.CuttingTool, materialInfo: materialInfo, processInfo: processInfo };
                    this.handleRecalculationResult(
                      this._manufacturingForgingCalService.calculateColdCloseDieForging(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      toolingEntryData,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (processInfo.processTypeID == ProcessType.ColdHeading && processInfo.materialInfoList[0].processId != PrimaryProcessType.ColdForgingColdHeading) {
                    const toolingEntryData = { toolNameId: SheetMetalTool.CuttingTool, materialInfo: materialInfo, processInfo: processInfo };
                    this.handleRecalculationResult(
                      this._simulationService.calculationsForMetalForming(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      toolingEntryData,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (processInfo.processTypeID === ProcessType.ColdHeading && processInfo.materialInfoList[0].processId === PrimaryProcessType.ColdForgingColdHeading) {
                    this.handleRecalculationResult(
                      this._manufacturingForgingCalService.calculateColdHeadingForging(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (processInfo.processTypeID == ProcessType.HotOpenDieForging) {
                    const toolingEntryData = { toolNameId: SheetMetalTool.CuttingTool, materialInfo: materialInfo, processInfo: processInfo };
                    this.handleRecalculationResult(
                      this._manufacturingForgingCalService.calculateHotForgingOpenDieHot(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      toolingEntryData,
                      manufacturingObj,
                      fieldColorsList
                    );
                  }
                  // else if (materialInfo.processId == PrimaryProcessType.HotForgingClosedDieHot) {
                  //   this.handleRecalculationResult(
                  //     this._manufacturingForgingCalService.calculateHotForgingOpenClosedDieHot(processInfo, fieldColorsList, manufacturingObj),
                  //     materialInfoList,
                  //     currentPart,
                  //     null,
                  //     manufacturingObj,
                  //     fieldColorsList
                  //   );
                  // }
                  else if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot && processInfo.processTypeID === ProcessType.SawCutting) {
                    this.handleRecalculationResult(
                      this._manufacturingForgingCalService.calculateForgingSawCuttingAndShearing(processInfo, fieldColorsList, manufacturingObj, currentPart),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (processInfo.processTypeID === ProcessType.BilletHeating) {
                    this.handleRecalculationResult(
                      this._manufacturingForgingCalService.calculateForgingBilletHeating(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (processInfo.processTypeID === ProcessType.HotClosedDieForging) {
                    this.handleRecalculationResult(
                      this._manufacturingForgingCalService.calculateHotForgingOpenClosedDieHot(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (processInfo.processTypeID === ProcessType.TrimmingPressForging) {
                    this.handleRecalculationResult(
                      this._manufacturingTrimmingHydraulicForgingCalService.calculateTrimmingHydraulicForging(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (
                    processInfo?.processTypeID === ProcessType.Straightening &&
                    materialInfo &&
                    materialInfo.dimX !== null &&
                    materialInfo.dimX !== undefined &&
                    materialInfo.dimY !== null &&
                    materialInfo.dimY !== undefined &&
                    materialInfo.dimZ !== null &&
                    materialInfo.dimZ !== undefined &&
                    (Number(materialInfo.dimX) > 10 || Math.min(Number(materialInfo.dimY), Number(materialInfo.dimZ)) > 10)
                  ) {
                    this.handleRecalculationResult(
                      this._manufacturingStraighteningOptionalForgingCalService.calculateStraighteningOptionalForging(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  }
                  // else if (processInfo.processTypeID === ProcessType.Piercing) {
                  //   this.handleRecalculationResult(
                  //     this._manufacturingPiercingHydraulicForgingCalService.calculatePiercingHydraulicForging(processInfo, fieldColorsList, manufacturingObj),
                  //     materialInfoList,
                  //     currentPart,
                  //     null,
                  //     manufacturingObj,
                  //     fieldColorsList
                  //   );
                  // }
                  else if (processInfo.processTypeID === ProcessType.CleaningForging) {
                    this.handleRecalculationResult(
                      this._manufacturingCleaningForgingCalService.calculateCleaningForging(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot && processInfo.processTypeID === ProcessType.HeatTreatment) {
                    this.handleRecalculationResult(
                      this._manufacturingForgingCalService.calculateForgingHeatTreatment(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (materialInfo.processId === PrimaryProcessType.HotForgingClosedDieHot && processInfo.processTypeID === ProcessType.ShotBlasting) {
                    this.handleRecalculationResult(
                      this._manufacturingForgingCalService.calculateForgingShotBlasting(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (processInfo.processTypeID === ProcessType.BilletHeatingContinuousFurnace) {
                    this.handleRecalculationResult(
                      this._manufacturingBilletHeatingForgingCalService.calculateBilletHeatingForging(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (processInfo.processTypeID === ProcessType.Testing) {
                    this.handleRecalculationResult(
                      this._manufacturingTestingMpiForgingCalService.calculateTestingMpiForging(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  } else if (processInfo.processTypeID == ProcessType.CableWireCutting) {
                    this.handleRecalculationResult(
                      this._manufacturingWireCuttingTerminationCalService.doCostCalculationFormWireCuttingTermination(processInfo, fieldColorsList, manufacturingObj),
                      materialInfoList,
                      currentPart,
                      null,
                      manufacturingObj,
                      fieldColorsList
                    );
                  }
                } else if (processInfo.processTypeID == ProcessType.Stitching) {
                  this.handleRecalculationResult(
                    this._simulationService._manufacturingAssemblyConnectorCalService.doCostCalculationForAssemblyConnectors(processInfo, fieldColorsList, manufacturingObj),
                    materialInfoList,
                    currentPart,
                    null,
                    manufacturingObj,
                    fieldColorsList
                  );
                } else if (processInfo.processTypeID == ProcessType.Assembly) {
                  this.handleRecalculationResult(
                    this._secondaryService.calculationForAssembly(processInfo, fieldColorsList, manufacturingObj),
                    materialInfoList,
                    currentPart,
                    null,
                    manufacturingObj,
                    fieldColorsList
                  );
                } else if (this._manufacturingConfig.customCableMulti.includes(processInfo.processTypeID)) {
                  this.handleRecalculationResult(
                    this._customCableService.customCable(processInfo, fieldColorsList, manufacturingObj, laborRateInfo),
                    materialInfoList,
                    currentPart,
                    null,
                    manufacturingObj,
                    fieldColorsList
                  );
                } else if (currentPart?.commodityId === CommodityType.Electronics && processTypeList.includes(processInfo.processTypeID)) {
                  const subProcessList = this._electronics.getFullSubprocessBasedOnProcessId(processInfo?.processTypeID, materialInfo);
                  if (subProcessList?.length > 0) {
                    for (let i = 0; i < subProcessList.length; i++) {
                      const obj = Object.assign({}, processInfo);
                      const machines = this._electronics.setMachineForAutomation(subProcessList, i, machineTypeDescription, machineTypeObj, obj);
                      this._manufacturingConfig.setMachineLaborInfo(obj, laborRateInfo, machines, processTypeOrginalList);
                      subProcessFormArray.clear();
                      subProcessFormArray.push(this._manufacturingConfig.manufactureFormGroup(this.selectedProcessInfoId, this.conversionValue, this.isEnableUnitConversion, subProcessList[i]?.id));
                      obj.subProcessFormArray = subProcessFormArray;
                      const calculationRes = this._simulationService._manuFacturingElectronicsService.calculationForElectronics(obj, fieldColorsList, manufacturingObj);
                      if (calculationRes) {
                        this._electronics.setSubArrayForPCBA(calculationRes);
                        calculationRes.dataCompletionPercentage = this.percentageCalculator.manufacturingInformation(calculationRes);
                        this.totProcessList.push(calculationRes);
                      }
                    }
                  } else {
                    subProcessFormArray.clear();
                    this._electronics.setMachineForAutomation(subProcessList, 0, machineTypeDescription, machineTypeObj, processInfo);
                    this._manufacturingConfig.setMachineLaborInfo(processInfo, laborRateInfo, machineTypeObj, processTypeOrginalList);
                    processInfo.subProcessFormArray.clear();
                    const calculationRes = this._simulationService._manuFacturingElectronicsService.calculationForElectronics(processInfo, fieldColorsList, manufacturingObj);
                    if (calculationRes) {
                      calculationRes.subProcessFormArray = null;
                      calculationRes.dataCompletionPercentage = this.percentageCalculator.manufacturingInformation(calculationRes);
                      this.totProcessList.push(calculationRes);
                    }
                  }
                  if (totSubProcessCount === this.totProcessList?.length) {
                    this.automationProcessCount = totSubProcessCount;
                    this.totProcessList?.sort((a, b) => {
                      return this._manufacturingConfig.pcbaSortOrder.indexOf(a.processTypeID) - this._manufacturingConfig.pcbaSortOrder.indexOf(b.processTypeID);
                    });
                    this.updateSelectedProcess(
                      this.recalculateProcessCost(
                        this.totProcessList,
                        materialInfoList,
                        currentPart,
                        this.automationProcessCount,
                        this.selectedProcessInfoId,
                        this.formIdentifier,
                        manufacturingObj,
                        fieldColorsList,
                        laborRateInfo
                      )
                    );
                  }
                } else if (materialInfoList[0]?.processId === PrimaryProcessType.ConventionalPCB && processTypeList.includes(processInfo.processTypeID)) {
                  let subProcessList = this._pcbConfig.getSubProcessList(processInfo.processTypeID)?.filter((x) => x.automate === true);
                  if (subProcessList?.length > 0) {
                    if (materialInfoList[0]?.secondaryCount > 0 && processInfo.processTypeID === ProcessType.SurfaceFinish) {
                      subProcessList = subProcessList.filter((x) => x.id === materialInfoList[0]?.secondaryCount);
                    } else if (materialInfoList[0]?.cavityEnvelopWidth > 0 && processInfo.processTypeID === ProcessType.RoutingScoring) {
                      subProcessList = subProcessList.filter((x) => x.id === materialInfoList[0]?.cavityEnvelopWidth);
                    }
                    for (let i = 0; i < subProcessList.length; i++) {
                      const obj = Object.assign({}, processInfo);
                      const machineName = subProcessList?.find((x) => x.id === subProcessList[i]?.id)?.machineName;
                      machine = machineTypeDescription?.filter((x) => x.machineName?.trim() === machineName);
                      machineTypeObj = machine[0];
                      this._manufacturingConfig.setMachineLaborInfo(obj, laborRateInfo, machineTypeObj, processTypeOrginalList);
                      subProcessFormArray.clear();
                      subProcessFormArray.push(this._manufacturingConfig.manufactureFormGroup(this.selectedProcessInfoId, this.conversionValue, this.isEnableUnitConversion, subProcessList[i]?.id));
                      obj.subProcessFormArray = subProcessFormArray;
                      const calculationRes = this._pcbCalculator.doCostCalculationForConventionalPCB(obj, fieldColorsList, manufacturingObj);
                      if (calculationRes) {
                        for (let i = 0; i < calculationRes?.subProcessFormArray?.controls?.length; i++) {
                          const info = calculationRes?.subProcessFormArray?.controls[i];
                          const subProcessInfo = new SubProcessTypeInfoDto();
                          subProcessInfo.subProcessTypeId = Number(info.value.subProcessTypeID);
                          if (calculationRes.subProcessTypeInfos == null) {
                            calculationRes.subProcessTypeInfos = [];
                          }
                          calculationRes.subProcessTypeInfos.push(subProcessInfo);
                        }
                        calculationRes.subProcessFormArray = null;
                        calculationRes.dataCompletionPercentage = this.percentageCalculator.manufacturingInformation(calculationRes);
                        this.totProcessList.push(calculationRes);
                      }
                    }
                  } else {
                    const calculationRes = this._pcbCalculator.doCostCalculationForConventionalPCB(processInfo, fieldColorsList, manufacturingObj);
                    if (calculationRes) {
                      calculationRes.subProcessFormArray = null;
                      calculationRes.dataCompletionPercentage = this.percentageCalculator.manufacturingInformation(calculationRes);
                      this.totProcessList.push(calculationRes);
                    }
                  }
                  console.log('totSubProcessCount-' + totSubProcessCount);
                  console.log('totProcessList-' + this.totProcessList?.length);
                  if (totSubProcessCount === this.totProcessList?.length) {
                    this.automationProcessCount = totSubProcessCount;
                    this.totProcessList?.sort((a, b) => a.processTypeID - b.processTypeID);
                    this.updateSelectedProcess(
                      this.recalculateProcessCost(
                        this.totProcessList,
                        materialInfoList,
                        currentPart,
                        this.automationProcessCount,
                        this.selectedProcessInfoId,
                        this.formIdentifier,
                        manufacturingObj,
                        fieldColorsList,
                        laborRateInfo
                      )
                    );
                  }
                } else if ([PrimaryProcessType.SemiRigidFlex, PrimaryProcessType.RigidFlexPCB].includes(materialInfoList[0]?.processId) && processTypeList.includes(processInfo.processTypeID)) {
                  let subProcessList = this._semiRigidConfig.getSubProcessList(processInfo.processTypeID)?.filter((x) => x.automate === true);
                  if (subProcessList?.length > 0) {
                    if (materialInfoList[0]?.secondaryCount > 0 && processInfo.processTypeID === ProcessType.SurfaceFinish) {
                      subProcessList = subProcessList.filter((x) => x.id === materialInfoList[0]?.secondaryCount);
                    } else if (materialInfoList[0]?.cavityEnvelopWidth > 0 && processInfo.processTypeID === ProcessType.RoutingScoring) {
                      subProcessList = subProcessList.filter((x) => x.id === materialInfoList[0]?.cavityEnvelopWidth);
                    }
                    for (let i = 0; i < subProcessList.length; i++) {
                      const obj = Object.assign({}, processInfo);
                      const machineName = subProcessList?.find((x) => x.id === subProcessList[i]?.id)?.machineName;
                      machine = machineTypeDescription?.filter((x) => x.machineName?.trim() === machineName);
                      machineTypeObj = machine[0];
                      this._manufacturingConfig.setMachineLaborInfo(obj, laborRateInfo, machineTypeObj, processTypeOrginalList);
                      subProcessFormArray.clear();
                      subProcessFormArray.push(this._manufacturingConfig.manufactureFormGroup(this.selectedProcessInfoId, this.conversionValue, this.isEnableUnitConversion, subProcessList[i]?.id));
                      obj.subProcessFormArray = subProcessFormArray;
                      const calculationRes = this._simulationService._manufacturingSemiRigidFlexCalService.doCostCalculationForSemiRigidFlex(obj, fieldColorsList, manufacturingObj);
                      if (calculationRes) {
                        for (let i = 0; i < calculationRes?.subProcessFormArray?.controls?.length; i++) {
                          const info = calculationRes?.subProcessFormArray?.controls[i];
                          const subProcessInfo = new SubProcessTypeInfoDto();
                          subProcessInfo.subProcessTypeId = Number(info.value.subProcessTypeID);
                          if (calculationRes.subProcessTypeInfos == null) {
                            calculationRes.subProcessTypeInfos = [];
                          }
                          calculationRes.subProcessTypeInfos.push(subProcessInfo);
                        }
                        calculationRes.subProcessFormArray = null;
                        calculationRes.dataCompletionPercentage = this.percentageCalculator.manufacturingInformation(calculationRes);
                        this.totProcessList.push(calculationRes);
                      }
                    }
                  } else {
                    const calculationRes = this._simulationService._manufacturingSemiRigidFlexCalService.doCostCalculationForSemiRigidFlex(processInfo, fieldColorsList, manufacturingObj);
                    if (calculationRes) {
                      calculationRes.subProcessFormArray = null;
                      calculationRes.dataCompletionPercentage = this.percentageCalculator.manufacturingInformation(calculationRes);
                      this.totProcessList.push(calculationRes);
                    }
                  }
                  console.log('totSubProcessCount-' + totSubProcessCount);
                  console.log('totProcessList-' + this.totProcessList?.length);
                  if (totSubProcessCount === this.totProcessList?.length) {
                    this.automationProcessCount = totSubProcessCount;
                    this.totProcessList?.sort((a, b) => a.processTypeID - b.processTypeID);
                    this.updateSelectedProcess(
                      this.recalculateProcessCost(
                        this.totProcessList,
                        materialInfoList,
                        currentPart,
                        this.automationProcessCount,
                        this.selectedProcessInfoId,
                        this.formIdentifier,
                        manufacturingObj,
                        fieldColorsList,
                        laborRateInfo
                      )
                    );
                  }
                } else if ([ProcessType.RubberMaterialPreparation].includes(processInfo.processTypeID)) {
                  let calculationRes = null;
                  if (this.totProcessList[0]?.processTypeID === ProcessType.CompressionMolding) {
                    calculationRes = this._plasticRubberService.calculationsForCompressionMaterialPreparation(processInfo, fieldColorsList, manufacturingObj);
                  } else {
                    calculationRes = this._plasticRubberService.calculationsForRubberExtrusion(processInfo, fieldColorsList, manufacturingObj);
                  }
                  this.handleRecalculationResult(calculationRes, materialInfoList, currentPart, null, manufacturingObj, fieldColorsList);
                } else if ([ProcessType.ManualDeflashing].includes(processInfo.processTypeID)) {
                  this.handleRecalculationResult(
                    this._plasticRubberService.calculationsForManualDeflashing(processInfo, fieldColorsList, manufacturingObj),
                    materialInfoList,
                    currentPart,
                    null,
                    manufacturingObj,
                    fieldColorsList
                  );
                } else if ([ProcessType.PostCuring].includes(processInfo.processTypeID)) {
                  this.handleRecalculationResult(
                    this._plasticRubberService.calculationsForPostCuring(processInfo, fieldColorsList, manufacturingObj),
                    materialInfoList,
                    currentPart,
                    null,
                    manufacturingObj,
                    fieldColorsList
                  );
                } else if ([ProcessType.Cutting].includes(processInfo.processTypeID)) {
                  this.handleRecalculationResult(
                    this._plasticRubberService.calculationsForCutting(processInfo, fieldColorsList, manufacturingObj),
                    materialInfoList,
                    currentPart,
                    null,
                    manufacturingObj,
                    fieldColorsList
                  );
                } else {
                  this.handleRecalculationResult(
                    this._simulationService.doCostCalculationForOthers(processInfo, fieldColorsList, manufacturingObj),
                    materialInfoList,
                    currentPart,
                    null,
                    manufacturingObj,
                    fieldColorsList
                  );
                }
              } else {
                this.automationProcessCount--;
                this.updateSelectedProcess(
                  this.recalculateProcessCost(
                    this.totProcessList,
                    materialInfoList,
                    currentPart,
                    this.automationProcessCount,
                    this.selectedProcessInfoId,
                    this.formIdentifier,
                    manufacturingObj,
                    fieldColorsList,
                    laborRateInfo
                  )
                );
                this.blockUiService.popBlockUI('recalculate ProcessCost');
              }
            } else {
              this.automationProcessCount--;
              this.updateSelectedProcess(
                this.recalculateProcessCost(
                  this.totProcessList,
                  materialInfoList,
                  currentPart,
                  this.automationProcessCount,
                  this.selectedProcessInfoId,
                  this.formIdentifier,
                  manufacturingObj,
                  fieldColorsList,
                  laborRateInfo
                )
              );
              this.blockUiService.popBlockUI('recalculate ProcessCost');
              this.messaging.openSnackBar(`No Machines available to automate the process !.`, '', { duration: 5000 });
            }
          } else {
            this.automationProcessCount--;
            this.updateSelectedProcess(
              this.recalculateProcessCost(
                this.totProcessList,
                materialInfoList,
                currentPart,
                this.automationProcessCount,
                this.selectedProcessInfoId,
                this.formIdentifier,
                manufacturingObj,
                fieldColorsList,
                laborRateInfo
              )
            );
            this.blockUiService.popBlockUI('recalculate ProcessCost');
            this.messaging.openSnackBar(`No Machines available to automate the process !.`, '', { duration: 5000 });
          }
          //   },
          // });
        });
    } else {
      this.automationProcessCount--;
      this.updateSelectedProcess(
        this.recalculateProcessCost(
          this.totProcessList,
          materialInfoList,
          currentPart,
          this.automationProcessCount,
          this.selectedProcessInfoId,
          this.formIdentifier,
          manufacturingObj,
          fieldColorsList,
          laborRateInfo
        )
      );
      this.blockUiService.popBlockUI('recalculate ProcessCost');
      // this.messaging.openSnackBar(`Manufacturing Country or Process Type Id not found`, '', { duration: 5000 });
    }
  }

  updateSelectedProcess({ selectedProcessInfoId, formIdentifier }: { selectedProcessInfoId: number; formIdentifier: CommentFieldFormIdentifierModel }) {
    this.selectedProcessInfoId = selectedProcessInfoId;
    this.formIdentifier = formIdentifier;
  }

  handleRecalculationResult(
    calculationRes: any,
    materialInfoList: MaterialInfoDto[],
    currentPart: PartInfoDto,
    toolingEntryData: any = null,
    manufacturingObj: ProcessInfoDto,
    fieldColorsList: FieldColorsDto[]
  ) {
    if (calculationRes) {
      calculationRes.dataCompletionPercentage = this.percentageCalculator.manufacturingInformation(calculationRes);
      if (toolingEntryData) {
        this.toolingRecalculationService
          .automationForToolingEntry(
            toolingEntryData.materialInfo,
            toolingEntryData.processInfo,
            this.laborRateInfo,
            toolingEntryData.toolNameId,
            currentPart,
            this.toolingMasterData,
            this.countryList,
            this.commodity,
            this.conversionValue,
            this.isEnableUnitConversion
          )
          .subscribe((result) => {
            calculationRes.costTooling = result.costTooling;
            // this.totProcessList.push(calculationRes);
            if (toolingEntryData.materialInfo.processId == PrimaryProcessType.StampingStage) {
              if (calculationRes.subProcessFormArray?.length > 0) {
                calculationRes.subProcessFormArray?.clear();
              }
              this.totProcessList.push(calculationRes);
              this.totProcessList = this.totProcessList?.sort((a, b) => {
                const aHas = Array.isArray(a?.subProcessTypeInfos) && a.subProcessTypeInfos.length > 0;
                const bHas = Array.isArray(b?.subProcessTypeInfos) && b.subProcessTypeInfos.length > 0;
                // If only one has subProcessTypeInfos, it should come first
                if (aHas && !bHas) return -1;
                if (!aHas && bHas) return 1;
                // If neither has the info, keep original relative order
                if (!aHas && !bHas) return 0;
                // Both have subProcessTypeInfos — sort by configured stampingStageSortOrder
                const indexA = this._manufacturingConfig.stampingStageSortOrder.indexOf(a.subProcessTypeInfos[0].subProcessTypeId);
                const indexB = this._manufacturingConfig.stampingStageSortOrder.indexOf(b.subProcessTypeInfos[0].subProcessTypeId);
                return indexA - indexB;
              });
            } else {
              this.totProcessList.push(calculationRes);
              if (materialInfoList[0].processId === PrimaryProcessType.ThermoForming || calculationRes.processTypeID === ProcessType.PlasticVacuumForming) {
                this.totProcessList?.sort((a, b) => {
                  return this._manufacturingConfig.thermoForming.indexOf(a.processTypeID) - this._manufacturingConfig.thermoForming.indexOf(b.processTypeID);
                });
              }
            }
            this.updateSelectedProcess(
              this.recalculateProcessCost(
                this.totProcessList,
                materialInfoList,
                currentPart,
                this.automationProcessCount,
                this.selectedProcessInfoId,
                this.formIdentifier,
                manufacturingObj,
                fieldColorsList,
                this.laborRateInfo
              )
            );
          });
      } else {
        this.totProcessList.push(calculationRes);
        if (materialInfoList[0].processId == PrimaryProcessType.RubberExtrusion) {
          this.totProcessList?.sort((a, b) => b.processTypeID - a.processTypeID);
        } else if (materialInfoList[0].processId === PrimaryProcessType.CompressionMoulding) {
          this.totProcessList?.sort((a, b) => {
            return this._manufacturingConfig.compressionMolding.indexOf(a.processTypeID) - this._manufacturingConfig.compressionMolding.indexOf(b.processTypeID);
          });
        } else if (materialInfoList[0].processId === PrimaryProcessType.TubeLaserCutting) {
          this.totProcessList?.sort((a, b) => {
            return this._manufacturingConfig.tubeLaserCutting.indexOf(a.processTypeID) - this._manufacturingConfig.tubeLaserCutting.indexOf(b.processTypeID);
          });
        } else if (this.totProcessList[0]?.processTypeID === ProcessType.CompressionMolding) {
          this.totProcessList?.sort((a, b) => a.processTypeID - b.processTypeID);
        } else if ([ProcessType.ManualDeflashing].includes(calculationRes.processTypeID)) {
          this.totProcessList?.sort((a, b) => a.processTypeID - b.processTypeID);
        } else if ([ProcessType.PostCuring].includes(calculationRes.processTypeID)) {
          this.totProcessList?.sort((a, b) => a.processTypeID - b.processTypeID);
        } else if (
          [ProcessType.LaserCutting, ProcessType.PlasmaCutting, ProcessType.OxyCutting, ProcessType.TurretTPP, BendingToolTypes.Dedicated, ProcessType.Forming].includes(calculationRes?.processTypeID)
        ) {
          this.totProcessList?.sort((a, b) => {
            return this._manufacturingConfig.laserTppSortOrder.indexOf(a.processTypeID) - this._manufacturingConfig.laserTppSortOrder.indexOf(b.processTypeID);
          });
        } else if (materialInfoList[0].processId === PrimaryProcessType.TransferMolding) {
          this.totProcessList?.sort((a, b) => {
            return this._manufacturingConfig.transferMolding.indexOf(a.processTypeID) - this._manufacturingConfig.transferMolding.indexOf(b.processTypeID);
          });
        } else if (this.totProcessList[0]?.processTypeID === ProcessType.TransferMolding) {
          this.totProcessList?.sort((a, b) => a.processTypeID - b.processTypeID);
        } else if (materialInfoList[0].processId === PrimaryProcessType.ThermoForming || calculationRes.processTypeID === ProcessType.PlasticVacuumForming) {
          this.totProcessList?.sort((a, b) => {
            return this._manufacturingConfig.thermoForming.indexOf(a.processTypeID) - this._manufacturingConfig.thermoForming.indexOf(b.processTypeID);
          });
        } else if ([ProcessType.Cutting].includes(calculationRes.processTypeID)) {
          this.totProcessList?.sort((a, b) => a.processTypeID - b.processTypeID);
        } else if (
          [
            ProcessType.MaterialKitting,
            ProcessType.ThroughHoleLine,
            ProcessType.InCircuitTestProgramming,
            ProcessType.Coating,
            ProcessType.AdhesivePotting,
            ProcessType.RoutingVScoring,
            ProcessType.FunctionalTest,
            ProcessType.LabellingnternalPackaging,
            ProcessType.BarCodeReader,
            ProcessType.SMTLine,
            ProcessType.ElectronicsLaserMarking,
            ProcessType.ElectronicsVisualInspection,
          ].includes(calculationRes?.processTypeID)
        ) {
          this.totProcessList?.sort((a, b) => {
            return this._manufacturingConfig.pcbaSortOrder.indexOf(a.processTypeID) - this._manufacturingConfig.pcbaSortOrder.indexOf(b.processTypeID);
          });
        }
        this.updateSelectedProcess(
          this.recalculateProcessCost(
            this.totProcessList,
            materialInfoList,
            currentPart,
            this.automationProcessCount,
            this.selectedProcessInfoId,
            this.formIdentifier,
            manufacturingObj,
            fieldColorsList,
            this.laborRateInfo
          )
        );
      }
    }
  }

}
