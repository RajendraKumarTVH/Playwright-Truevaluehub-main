import { SharedService } from '../shared';
import { ComplexityConfig, ComplexityDefaultConfig, ManufacturingConfigService } from 'src/app/shared/config/cost-manufacturing-config';
import { HPDCCastingTool, InjectionMouldingTool, SheetMetalTool } from 'src/app/shared/enums';
import { FormGroupKeys } from 'src/app/shared/enums/manufacturing-formgroups.enum';
import { MedbMasterService } from 'src/app/shared/services';
import { catchError, finalize, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import { PartComplexity } from 'src/app/shared/enums';
import {
  PartInfoDto,
  BillOfMaterialDto,
  MaterialInfoDto,
  LaborRateMasterDto,
  ProcessInfoDto,
  MedbMachinesMasterDto,
  MedbMachineTypeMasterDto,
  MaterialMasterDto,
  CountryDataMasterDto,
  ReCalculateContext,
  StockFormCategoriesDto,
} from 'src/app/shared/models';
import { SubProcessTypeInfoDto } from 'src/app/shared/models/subprocess-info.model';
import { ProcessType, ScreeName, CommodityType, PrimaryProcessType, StampingType } from '../../costing.config';
import { ElectronicsConfigService } from 'src/app/shared/config/manufacturing-electronics-config';
import { ManufacturingPCBConfigService } from 'src/app/shared/config/manufacturing-pcb-config';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { CostManufacturingAutomationService } from '../automation/cost-manufacturing-automation';
import { ConventionalPCBCalculatorService } from '../conventional-pcb-calculator';
import { DigitalFactoryHelper } from '../digital-factory-helper';
import { ManufacturingCalculatorService } from '../manufacturing-calculator';
import { ManufacturingForgingCalculatorService } from '../manufacturing-forging-calculator';
import { SecondaryProcessCalculatorService } from '../manufacturing-secondary-process';
import { SheetMetalProcessCalculatorService } from '../manufacturing-sheetmetal-calculator';
import { WeldingCalculatorService } from '../manufacturing-welding-calculator';
import { ManufacturingWireCuttingTerminationCalculatorService } from '../manufacturing-wire-cutting-termination-calculator';
import { PlasticRubberProcessCalculatorService } from '../plastic-rubber-process-calculator';
import { ManufacturingWiringHarnessCalculatorService } from '../manufacturing-wiringharness-calculator';
import { CommentFieldFormIdentifierModel } from 'src/app/shared/models/comment-field-model';
import { ManufacturingHelperService } from 'src/app/shared/helpers/manufacturing-helper.service';
import { CostToolingRecalculationService } from '../automation/cost-tooling-recalculation';
import { TurningInfoDto } from 'src/app/shared/models/turning-info.model';
import { Milling } from 'src/app/shared/models/machining-milling.model';
import { DrillingCutting } from 'src/app/shared/models/drilling-cutting.model';
import { Boring } from 'src/app/shared/models/machining-boring.model';
import { Grinding } from 'src/app/shared/models/machining-grinding.model';
import { WiringHarness } from 'src/app/shared/models/wiring-harness.model';
import { ToolingCountryData } from 'src/app/shared/models/tooling-master-data';
import { GrindingState } from 'src/app/modules/_state/machining-grinding.state';
import { Store } from '@ngxs/store';
import { DrillingCuttingSpeedState } from 'src/app/modules/_state/machining-drilling-lookup.state';
import { BoringState } from 'src/app/modules/_state/machining-boring.state';
import { FaceMillingState } from 'src/app/modules/_state/machining-face-milling.state';
import { TurningState } from 'src/app/modules/_state/machining-turning-info.state';
import { WiringHarnessState } from 'src/app/modules/_state/wiringHarness.state';
import { CostManufacturingMappingService } from 'src/app/shared/mapping/cost-manufacturing-mapping.service';
import { LaserCuttingTime, PlasmaCutting } from 'src/app/shared/models/sheet-metal-lookup.model';
import { PlasmaCuttingState } from 'src/app/modules/_state/plasma-cutting-lookup.state';
import { LaserCuttingState } from 'src/app/modules/_state/laser-cutting-lookup.state';
import { HandlingTimeState } from 'src/app/modules/_state/sheetmetal-handling-time-lookup.state';
import { HandlingTime, StrokeRate, StrokeRateManual, ToolLoadingTime } from 'src/app/shared/models/sheet-metal-lookup.model';
import { StrokeRateState } from 'src/app/modules/_state/sheetmetal-stroke-rate.state';
import { ToolLoadingTimeState } from 'src/app/modules/_state/sheetmetal-tool-loadingtime.state';
import { StrokeRateManualState } from 'src/app/modules/_state/sheetmetal-stroke-rate-manual.state';
import { ThermoFormingState } from 'src/app/modules/_state/thermal-forming-lookup.state';
import { ThermoForming } from 'src/app/shared/models/thermo-forming.models';
import { FormingTime } from 'src/app/shared/models/thermo-forming.models';
import { ThermoFormingTimeState } from 'src/app/modules/_state/thermal-forming-time.state';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { ToolingCountryMasterState } from 'src/app/modules/_state/ToolingMaster.state';
import { CountryDataState } from 'src/app/modules/_state/country.state';
// import { BomTreeState } from 'src/app/modules/_state/bom.state';
import { ProcessInfoSignalsService } from 'src/app/shared/signals/process-info-signals.service';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';
import { StockFormsCategoriesState } from 'src/app/modules/_state/stock-forms-categories.state';

@Injectable({
  providedIn: 'root',
})
export class CostManufacturingRecalculationService {
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private automationProcessCount: number = 0;
  isEnableUnitConversion = false;
  conversionValue: any;
  formIdentifier: CommentFieldFormIdentifierModel;
  selectedProcessInfoId: number = 0;
  turningLookupList: TurningInfoDto[] = [];
  millingLookupList: Milling[] = [];
  laserCutttingTimeList: LaserCuttingTime[] = [];
  plasmaCutttingSpeedList: PlasmaCutting[] = [];
  public drillingCuttingSpeedList: DrillingCutting[];
  boringLookupList: Boring[] = [];
  grindingLookupList: Grinding[] = [];
  wiringHarnessLookupList: WiringHarness[] = [];
  handlingTimeList: HandlingTime[] = [];
  strokeRateList: StrokeRate[] = [];
  toolLoadingTimeList: ToolLoadingTime[] = [];
  strokeRateManualList: StrokeRateManual[] = [];
  thermoFormingList: ThermoForming[] = [];
  formingTimeList: FormingTime[] = [];
  public ToolingMasterData: ToolingCountryData[] = [];
  BillOfMaterialList: BillOfMaterialDto[];
  countryList: CountryDataMasterDto[] = [];
  private digitalFacotyHelper = inject(DigitalFactoryHelper);
  public commodity = { isInjMoulding: false, isSheetMetal: false, isCasting: false };
  fieldColorsList: FieldColorsDto[] = [];
  public processTypeOrginalList: any[] = [];
  private _grindingLookup$: Observable<Grinding[]> = this._store.select(GrindingState.getGrindingLookup);
  private _boringLookup$: Observable<Boring[]> = this._store.select(BoringState.getBoringLookup);
  private _drillingCuttingSpeed$: Observable<DrillingCutting[]> = this._store.select(DrillingCuttingSpeedState.getDrillingCuttingSpeed);
  private _milling$: Observable<Milling[]> = this._store.select(FaceMillingState.getFaceMillingLookup);
  private _turningLookup$: Observable<TurningInfoDto[]> = this._store.select(TurningState.getTurningLookup);
  private _wiringHarness$: Observable<WiringHarness[]> = this._store.select(WiringHarnessState.getWiringHarnessLookup);
  private _laserCuttting$: Observable<LaserCuttingTime[]> = this._store.select(LaserCuttingState.getLaserCutting);
  private _plasmaCuttting$: Observable<PlasmaCutting[]> = this._store.select(PlasmaCuttingState.getPlasmaCutting);
  private _handlingTime$: Observable<HandlingTime[]> = this._store.select(HandlingTimeState.getHandlingTime);
  private _strokeRates$: Observable<StrokeRate[]> = this._store.select(StrokeRateState.getStrokeRate);
  private _toolLoadTime$: Observable<ToolLoadingTime[]> = this._store.select(ToolLoadingTimeState.getToolLoadingTime);
  private _strokeRatesManual$: Observable<StrokeRateManual[]> = this._store.select(StrokeRateManualState.getStrokeRateManual);
  private _thermoForming$: Observable<ThermoForming[]> = this._store.select(ThermoFormingState.getThermoFormingLookup);
  private _formingTime$: Observable<FormingTime[]> = this._store.select(ThermoFormingTimeState.getThermoFormingTime);

  private _countryToolingData$: Observable<ToolingCountryData[]> = this._store.select(ToolingCountryMasterState.getToolingCountryMasterData);
  private _countryData$: Observable<CountryDataMasterDto[]> = this._store.select(CountryDataState.getCountryData);
  // _bomsInfo$: Observable<BillOfMaterialDto[]> = this._store.select(BomTreeState.getBomsByProjectId);
  bomInfoEffect = effect(() => {
    const bomInfo = this.bomInfoSignalService.bomInfo();
    if (bomInfo?.length > 0) {
      this.BillOfMaterialList = bomInfo;
    }
  });
  public processFlag = this._manufacturingConfig.processFlag;
  stockFormCategoriesDto: StockFormCategoriesDto[] = [];
  _stockFormCategoriesData$: Observable<StockFormCategoriesDto[]> = this._store.select(StockFormsCategoriesState.getStockFormsCategories);

  constructor(
    private _store: Store,
    private sharedService: SharedService,
    private medbMasterService: MedbMasterService,
    private _manufacturingConfig: ManufacturingConfigService,
    private costManufacturingAutomationService: CostManufacturingAutomationService,
    private _fb: FormBuilder,
    private _pcbConfig: ManufacturingPCBConfigService,
    private digitalFactoryHelper: DigitalFactoryHelper,
    private _simulationService: ManufacturingCalculatorService,
    private _manufacturingForgingCalService: ManufacturingForgingCalculatorService,
    private _plasticRubberService: PlasticRubberProcessCalculatorService,
    private _weldingService: WeldingCalculatorService,
    private _manufacturingWireCuttingTerminationCalService: ManufacturingWireCuttingTerminationCalculatorService,
    private _sheetMetalService: SheetMetalProcessCalculatorService,
    private _electronincs: ElectronicsConfigService,
    private _secondaryService: SecondaryProcessCalculatorService,
    private _pcbCalculator: ConventionalPCBCalculatorService,
    private _wiringHarness: ManufacturingWiringHarnessCalculatorService,
    private _manufacturingHelperService: ManufacturingHelperService,
    private toolingRecalculationService: CostToolingRecalculationService,
    private _manufacturingMapper: CostManufacturingMappingService,
    private readonly digitalFactoryService: DigitalFactoryService,
    private processInfoSignalService: ProcessInfoSignalsService,
    private bomInfoSignalService: BomInfoSignalsService
  ) {
    this.subscribeAssign(this._grindingLookup$, 'grindingLookupList', 1);
    this.subscribeAssign(this._boringLookup$, 'boringLookupList', 1);
    this.subscribeAssign(this._drillingCuttingSpeed$, 'drillingCuttingSpeedList', 1);
    this.subscribeAssign(this._milling$, 'millingLookupList', 1);
    this.subscribeAssign(this._turningLookup$, 'turningLookupList', 1);
    this.subscribeAssign(this._wiringHarness$, 'wiringHarnessLookupList', 1);
    this.subscribeAssign(this._laserCuttting$, 'laserCutttingTimeList', 1);
    this.subscribeAssign(this._plasmaCuttting$, 'plasmaCutttingSpeedList', 1);
    this.subscribeAssign(this._handlingTime$, 'handlingTimeList', 1);
    this.subscribeAssign(this._strokeRates$, 'strokeRateList', 1);
    this.subscribeAssign(this._toolLoadTime$, 'toolLoadingTimeList', 1);
    this.subscribeAssign(this._strokeRatesManual$, 'strokeRateManualList', 1);
    this.subscribeAssign(this._thermoForming$, 'thermoFormingList', 1);
    this.subscribeAssign(this._formingTime$, 'formingTimeList', 1);
    this.subscribeAssign(this._countryToolingData$, 'ToolingMasterData', 1);
    this.subscribeAssign(this._countryData$, 'countryList', 1);
    // this.subscribeAssign(this._bomsInfo$, 'BillOfMaterialList', 1);
    this._stockFormCategoriesData$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: StockFormCategoriesDto[]) => {
      if (result && result.length > 0) {
        this.stockFormCategoriesDto = result;
      }
    });
  }

  setLookupLists(lists: { fieldColorsList: FieldColorsDto[]; processTypeOrginalList: any[] }) {
    if (lists.fieldColorsList) this.fieldColorsList = lists.fieldColorsList;
    if (lists.processTypeOrginalList) this.processTypeOrginalList = lists.processTypeOrginalList;
  }

  private subscribeAssign(observer, assignee, minLength) {
    // const observerArr = observer.split('.');
    // const observerObj = (observerArr.length === 2) ? this[observerArr[0]][observerArr[1]]() : this[observerArr[0]];
    observer.pipe(takeUntil(this.unsubscribe$)).subscribe((result: any[]) => {
      if (result?.length >= minLength) {
        this[assignee] = result;
      }
    });
  }

  recalculateExistingProcessCosts(
    currentPart: PartInfoDto,
    materialInfoList: MaterialInfoDto[],
    laborRate: LaborRateMasterDto[],
    processList: ProcessInfoDto[],
    materialmasterDatas: MaterialMasterDto,
    laborCountByMachineType: any[],
    manufacturingObj: ProcessInfoDto,
    subProcessFormArray: FormArray<any>,
    machiningOperationTypeFormArray: FormArray<any>,
    costingManufacturingInfoform: FormGroup,
    selectedProcessInfoId: number,
    formIdentifier: CommentFieldFormIdentifierModel,
    defaultValues = this._manufacturingConfig.defaultValues,
    machiningFlags = this._manufacturingConfig._machining.getMachiningFlags()
  ): Observable<ReCalculateContext[]> {
    [this.isEnableUnitConversion, this.conversionValue] = this.sharedService.setUnitMeasurement();
    this.formIdentifier = formIdentifier;
    // this.currentPart = currentPart;
    const automationProcessCount = processList.length;
    const processToObservable = (pInfo: ProcessInfoDto): Observable<ReCalculateContext> => {
      let calculateResults: ProcessInfoDto[] = [];
      let recalcContext: ReCalculateContext;
      let processInfo = { ...pInfo }; // avoid mutating original
      processInfo.eav = currentPart?.eav;
      processInfo.processTypeID = Number(processInfo?.processTypeID);
      const noRecalculationRequired = processInfo?.processTypeID === ProcessType.FinalInspection && !processInfo.machineMarketId;
      if (processInfo?.processTypeID <= 0 || noRecalculationRequired || !currentPart?.supplierInfoId) {
        recalcContext = new ReCalculateContext();
        recalcContext.calculateResults = [processInfo];
        recalcContext.materialInfoList = [];
        recalcContext.currentPart = currentPart;
        recalcContext.automationProcessCount = processList.length;
        recalcContext.selectedProcessInfoId = selectedProcessInfoId;
        recalcContext.formIdentifier = formIdentifier;
        recalcContext.selectedProcess = manufacturingObj;
        recalcContext.dirtyFields = [];
        recalcContext.laborRate = [];
        recalcContext.isToolingNeedToRun = false;
        return of(recalcContext);
      }
      const selectedProcess: ProcessInfoDto = Object.assign({}, processInfo);
      if (processInfo?.costTooling) {
        const matchedProcess = processList.find((process) => process.processInfoId === processInfo.processInfoId);
        if (
          matchedProcess?.costTooling?.toolingNameId === 0 &&
          processInfo.processInfoId === matchedProcess?.processInfoId &&
          processInfo.costTooling?.toolingNameId !== matchedProcess?.costTooling?.toolingNameId
        ) {
          processInfo.costTooling.toolingNameId = matchedProcess.costTooling.toolingNameId;
        }
      }
      processInfo?.subProcessTypeInfos?.forEach((element) => {
        element.subProcessInfoId = 0;
      });
      return combineLatest([
        this.sharedService.getColorInfos(currentPart?.partInfoId, ScreeName.Manufacturing, processInfo.processInfoId).pipe(take(1)),
        this.digitalFactoryService
          .getMachineMasterByProcessTypeId({
            supplierId: currentPart.supplierInfoId,
            processTypeId: processInfo.processTypeID,
            countryData: this.countryList.find((c) => c.countryId === currentPart.mfrCountryId),
            laborRate: laborRate[0],
          })
          .pipe(take(1)),
      ]).pipe(
        take(1),
        switchMap(([dirtyFields, machineTypeDescription]) => {
          if (!machineTypeDescription || machineTypeDescription.length === 0) {
            recalcContext = new ReCalculateContext();
            recalcContext.calculateResults = [processInfo];
            recalcContext.materialInfoList = [];
            recalcContext.currentPart = currentPart;
            recalcContext.automationProcessCount = automationProcessCount;
            recalcContext.selectedProcessInfoId = selectedProcessInfoId;
            recalcContext.formIdentifier = formIdentifier;
            recalcContext.selectedProcess = manufacturingObj;
            recalcContext.dirtyFields = [];
            recalcContext.laborRate = [];
            recalcContext.isToolingNeedToRun = false;
            return of(recalcContext);
          }
          if (machineTypeDescription && machineTypeDescription.length > 0) {
            processInfo.materialInfoList = materialInfoList;
            processInfo.materialInfo = this._manufacturingHelperService.getMaterialObjectTotals(materialInfoList);
            processInfo.processInfoList = processList;
            processInfo.mfrCountryId = currentPart?.mfrCountryId;
            processInfo.totalToolLendingTime = pInfo?.totalToolLendingTime;
            processInfo.materialmasterDatas = materialmasterDatas;
            processInfo.noOfStartsPierce = Number(processInfo.noOfStartsPierce) || Number(this.sharedService.extractedProcessData?.NoOfStartsPierce);
            processInfo.lotSize = currentPart?.lotSize;
            processInfo.materialType = materialmasterDatas.materialTypeId;
            processInfo.materialTypeName = this.stockFormCategoriesDto.find((x) => x.materialTypeId === processInfo.materialType)?.materialType;
            const materialProcessId = processInfo.materialInfoList?.length > 0 ? processInfo.materialInfoList[0]?.processId : 0;
            this.processFlag = { ...this._manufacturingConfig.setProcessTypeFlags(this.processFlag, processInfo.processTypeID, currentPart?.commodityId, materialProcessId) };
            let yieldPer = 98.5;
            if (this.processFlag.IsProcessMachining && !this.processFlag.IsSecondaryProcess) {
              yieldPer = 98;
            } else if (this.processFlag.IsCasting && !this.processFlag.IsSecondaryProcess) {
              yieldPer = this.processFlag.IsProcessHighPressureDieCasting || this.processFlag.IsProcessLowPressureDieCasting ? 95 : 0;
            } else if (
              this.processFlag.IsProcessShotBlasting ||
              this.processFlag.IsProcessMoldPreparation ||
              this.processFlag.IsProcessCorePreparation ||
              this.processFlag.IsProcessMelting ||
              this.processFlag.IsProcessPouring ||
              this.processFlag.IsProcessPartCoolingShakeOut ||
              this.processFlag.IsProcessFetling ||
              this.processFlag.IsProcessCleaning ||
              this.processFlag.IsProcessVaccumeImpregnation
            ) {
              yieldPer = 98;
            }
            processInfo.yieldPer = yieldPer;
            processInfo.efficiencyFactor = processInfo.efficiencyFactor || 75;
            if (processInfo.processTypeID === ProcessType.SawCutting) {
              processInfo.isLoadingTimeDirty = true;
              processInfo.isUnloadingTimeDirty = true;
            }
            selectedProcess.processTypeID = processInfo?.processTypeID;
            !processInfo?.weldingPosition && (processInfo.weldingPosition = 1);
            selectedProcess.processName = this.processTypeOrginalList?.find((x) => x.processTypeId === processInfo.processTypeID)?.primaryProcess;
            const isCasting = processInfo?.materialInfoList?.length > 0 ? this._manufacturingConfig.castingProcesses.includes(processInfo?.materialInfoList[0]?.processId) : false;
            const isMetalTubeExtrusion = processInfo?.materialInfoList?.length > 0 ? this._manufacturingConfig.metalTubeExtrusionProcesses.includes(processInfo?.processTypeID) : false;
            const isMetalExtrusion = processInfo?.materialInfoList?.length > 0 ? this._manufacturingConfig.metalExtrusionProcesses.includes(processInfo?.processTypeID) : false;
            const isPlasticTubeExtrusion = processInfo?.materialInfoList?.length > 0 ? this._manufacturingConfig.plasticTubeExtrusionProcesses.includes(processInfo?.processTypeID) : false;
            const isInsulationJacket = processInfo?.materialInfoList?.length > 0 ? this._manufacturingConfig.insulationJacket.includes(processInfo?.processTypeID) : false;
            processInfo.subProcessFormArray = this._fb.array([]) as FormArray;
            this._manufacturingConfig.subprocessFormArrayMapper(processInfo.subProcessFormArray, processInfo);
            let machine: MedbMachinesMasterDto[] = [];
            this._manufacturingMapper._castingMapper.setMoldPreparationData(materialInfoList, costingManufacturingInfoform.get(FormGroupKeys.Casting));
            const excludedProcessTypes = [ProcessType.InjectionMouldingSingleShot, ProcessType.InjectionMouldingDoubleShot, ProcessType.RubberInjectionMolding, ProcessType.PlugConnectorOvermolding];
            let chooseMachine = false;
            // if (currentPart?.commodityId === CommodityType.MetalForming && processInfo?.processTypeID === ProcessType.SawCutting)
            if (currentPart?.commodityId === CommodityType.MetalForming) {
              chooseMachine = true;
            } else if ([CommodityType.SheetMetal, CommodityType.Casting, CommodityType.StockMachining].includes(currentPart?.commodityId)) {
              chooseMachine = true;
            } else if (processInfo.machineDescription?.trim() && !excludedProcessTypes.includes(processInfo?.processTypeID)) {
              machine = machineTypeDescription.filter((x) => x.machineDescription === processInfo.machineDescription);
            } else {
              chooseMachine = true;
            }
            if (chooseMachine) {
              machine = this.costManufacturingAutomationService.selectMachineProcess(
                processInfo,
                currentPart,
                processInfo.materialInfoList[0],
                machineTypeDescription,
                laborRate,
                this.processTypeOrginalList,
                this.fieldColorsList,
                manufacturingObj
              );
            }

            processInfo.machineList = machineTypeDescription;
            const isSecondaryProcess = this._manufacturingConfig.secondaryProcess.includes(processInfo?.processTypeID);
            const isMachiningProcess = this._manufacturingConfig._machining.machiningProcess.includes(processInfo?.processTypeID);
            const isWelding = this._manufacturingConfig.welding.includes(processInfo?.processTypeID);
            if (machine && machine[this.costManufacturingAutomationService.selectedMachineIndex]) {
              const machineType = new MedbMachineTypeMasterDto();
              let machineTypeObj: MedbMachinesMasterDto;
              let machineSelected: MedbMachinesMasterDto;
              if (this.sharedService.checkDirtyProperty('machineId', dirtyFields)) {
                if (materialInfoList[0]?.processId === PrimaryProcessType.ConventionalPCB && selectedProcess?.machineMarketId === null) {
                  const subProcessList = this._pcbConfig.getSubProcessList(processInfo.processTypeID);
                  const subprocessTypeId = processInfo?.subProcessTypeInfos[0]?.subProcessTypeId;
                  const machineName = subProcessList?.find((x) => x.id === subprocessTypeId)?.machineName;
                  if (machineName?.length > 0) {
                    machineSelected = machineTypeDescription?.find((x) => x.machineName?.trim() === machineName);
                  } else {
                    machineSelected = machineTypeDescription[0];
                  }
                } else {
                  machineSelected = machineTypeDescription.find((x) => x.machineMarketDtos.find((y) => Number(y.machineMarketID) === Number(selectedProcess?.machineMarketId)));
                }
                !machineSelected && (machineSelected = machineTypeDescription.find((x) => x.machineDescription === selectedProcess?.machineDescription)); // quick fix for the machineId differnce between countries
                processInfo.machineMarketId = machineSelected?.machineMarketDtos[0].machineMarketID;
                processInfo.machineMarket = machineSelected?.machineMarketDtos[0];
                processInfo.machineMaster = machineSelected;
                processInfo.selectedTonnage = machineSelected?.machineTonnageTons;
                //this.machineTypeDescription = machineTypeDescription;
                const injecRate = this.sharedService.isValidNumber((Number(processInfo?.machineMaster?.injectionRate) * Number(processInfo.density)) / 1000);
                const shotweight = this.sharedService.isValidNumber(processInfo.grossWeight * processInfo.noOfCavities);
                const materialInjectionFillTime = this.sharedService.isValidNumber(shotweight / Number(injecRate));
                processInfo.materialInjectionFillTime = materialInjectionFillTime;
                machineTypeObj = machineTypeDescription.find((x) => Number(x.machineID) === Number(machineSelected?.machineID));
              } else {
                if (processInfo.processTypeID === ProcessType.PlasticConvolutedTubeExtrusion) {
                  machineSelected = machine.find((x) => materialInfoList[0].dimZ > x.minJobDiamm && materialInfoList[0].dimZ <= x.maxJobDiamm) || machine[0];
                } else if (materialInfoList[0]?.processId === PrimaryProcessType.ConventionalPCB) {
                  const subProcessList = this._pcbConfig.getSubProcessList(processInfo.processTypeID);
                  const subprocessTypeId = processInfo?.subProcessTypeInfos[0]?.subProcessTypeId;
                  const machineName = subProcessList?.find((x) => x.id === subprocessTypeId)?.machineName;
                  if (machineName?.length > 0) {
                    machineSelected = machine?.find((x) => x.machineName?.trim() === machineName);
                  } else {
                    machineSelected = machine[this.costManufacturingAutomationService.selectedMachineIndex];
                  }
                } else {
                  machineSelected = machine[this.costManufacturingAutomationService.selectedMachineIndex];
                }
                processInfo.machineMarketId = machineSelected?.machineMarketDtos[0].machineMarketID;
                processInfo.selectedTonnage = machineSelected?.machineTonnageTons;
                processInfo.machineMarket = machineSelected?.machineMarketDtos[0];
                processInfo.machineMaster = machineSelected;
                processInfo.machineId = machineSelected.machineID;
                if (this.selectedProcessInfoId === processInfo.processInfoId) {
                  costingManufacturingInfoform.controls['machineId'].setValue(machineSelected.machineID);
                }
                // this.machineTypeDescription = machine;
                const injecRate = this.sharedService.isValidNumber((Number(processInfo?.machineMaster?.injectionRate) * Number(processInfo.density)) / 1000);
                const shotweight = this.sharedService.isValidNumber(processInfo.grossWeight * processInfo.noOfCavities);
                const materialInjectionFillTime = this.sharedService.isValidNumber(shotweight / Number(injecRate));
                processInfo.materialInjectionFillTime = materialInjectionFillTime;
                machineTypeObj = machineTypeDescription.find((x) => Number(x.machineID) === Number(machineSelected?.machineID));
              }
              if (!this.sharedService.checkDirtyProperty('semiAutoOrAuto', dirtyFields)) {
                processInfo.semiAutoOrAuto = this._manufacturingConfig.setMachineTypeIdByName(
                  machineSelected?.machineMarketDtos?.length > 0 ? machineSelected?.machineMarketDtos[0]?.machineType : undefined
                );
              }
              if (machineTypeObj && processInfo?.machineMarketId) {
                machineType.machineType = machineTypeObj.machineMarketDtos?.length > 0 ? machineTypeObj?.machineMarketDtos[0].machineType : undefined;
                machineType.processTypeId = machineTypeObj?.machineMarketDtos.length > 0 ? machineTypeObj?.machineMarketDtos[0].processTypeId : undefined;
                processInfo.machineType = machineType.machineType;
                processInfo.machineDescription = machineTypeObj?.machineDescription;
                processInfo.dryCycleTime = this.sharedService.checkDirtyProperty('dryCycleTime', dirtyFields) ? processInfo.dryCycleTime : machineTypeObj?.machineDryCycleTimeInSec;
                processInfo.machineCapacity = machineTypeObj?.machineCapacity;
                processInfo.efficiency = machineTypeObj?.machineMarketDtos.length > 0 ? machineTypeObj?.machineMarketDtos[0].efficiency : 0;
                processInfo.bourdanRate = machineTypeObj?.burdenRate;
                processInfo.machineHourRate = machineTypeObj?.machineHourRate;
                // const laborRateInfo = this.digitalFacotyHelper.getLaborRateInfo(laborRate[0], manufacturingObj, this.fieldColorsList, machineSelected);
                // this.defaultValues.machineHourRate = processInfo.machineHourRate || 0;
                //this.defaultValues.dryCycleTime = machineTypeObj?.machineDryCycleTimeInSec;
                processInfo.furnaceCapacityTon = machineTypeObj?.furnaceCapacityTon || 1;
                // if (machineTypeObj?.machineMarketDtos.length > 0 && machineTypeObj?.machineMarketDtos[0].setUpTimeInHour && !isCasting) {
                //   processInfo.setUpTime = Number(machineTypeObj?.machineMarketDtos.length > 0 ? machineTypeObj?.machineMarketDtos[0].setUpTimeInHour : 0) * 60;
                // }
                processInfo.countryList = this.countryList;
                processInfo = this._manufacturingConfig.setMachineTypeObject(processInfo, machineTypeObj);
                this._manufacturingConfig.setMachineLaborInfo(processInfo, laborRate, machineTypeObj, this.processTypeOrginalList);
                defaultValues.machineHourRate = machineTypeObj.machineHourRate;
                // this.manufacturingObj.machineHourRate = processInfo.machineHourRate;
                // manufacturingObj = { ...manufacturingObj, machineHourRate: processInfo.machineHourRate };
                manufacturingObj.machineHourRate = processInfo.machineHourRate;
                // const manufacturingValues = this.digitalFacotyHelper.getDFManufacturingValues(processInfo, machine[0], this.laborRateInfo?.[0], []);
                if (
                  isWelding ||
                  processInfo.processTypeID === ProcessType.InjectionMouldingSingleShot ||
                  processInfo.processTypeID === ProcessType.InjectionMouldingDoubleShot ||
                  processInfo.processTypeID === ProcessType.RubberInjectionMolding ||
                  processInfo.processTypeID === ProcessType.PlugConnectorOvermolding
                ) {
                  if (machineTypeObj?.machineMarketDtos[0]?.noOfLowSkilledLabours) {
                    processInfo.noOfLowSkilledLabours = machineTypeObj?.machineMarketDtos[0]?.noOfLowSkilledLabours;
                  } else {
                    const machineObj = laborCountByMachineType?.find((x) => x.machineTypeId === processInfo?.semiAutoOrAuto);
                    processInfo.noOfLowSkilledLabours = Number(machineObj?.lowSkilledLaborRate);
                  }
                  //const machineObj = laborCountByMachineType?.find((x) => x.machineTypeId === processInfo?.semiAutoOrAuto);
                  //processInfo.noOfLowSkilledLabours = Number(machineObj?.lowSkilledLaborRate);
                  //const machineHourRate = this._manufacturingConfig.getMachineHourRateByMachineType(processInfo.machineMaster, processInfo?.semiAutoOrAuto);
                  //processInfo.machineHourRate = processInfo.machineHourRate ?? machineHourRate;
                }
                processInfo.processType = this._manufacturingConfig.getProcessType(machineType.processTypeId, this.processTypeOrginalList);
                processInfo.partComplexity = currentPart?.partComplexity;
                processInfo.lotSize = currentPart.lotSize ? currentPart.lotSize : 1;
                processInfo.meltTemp = materialmasterDatas?.meltingTemp || 0;
                processInfo.ejecTemp = materialmasterDatas?.ejectDeflectionTemp || 0;
                processInfo.mouldTemp = materialmasterDatas?.moldTemp || 0;
                processInfo.thermalConductivity = 0.187;
                processInfo.specificHeatCapacity = 2.13;
                processInfo.thermalDiffusivity = materialmasterDatas?.thermalDiffusivity || 0;

                const config = ComplexityConfig[currentPart?.partComplexity] || ComplexityDefaultConfig;
                processInfo.sideCoreMechanisms = config.sideCoreMechanisms;
                processInfo.packAndHoldTime = config.packAndHoldTime;
                processInfo.partEjection = config.partEjection;
                processInfo.setUpTimeBatch = 60;
                processInfo.processInfoList = processList;

                let addProcessParams: {
                  processResult: ProcessInfoDto;
                  totProcessList: ProcessInfoDto[];
                  processInfoId: number;
                  toolingEntryData: any;
                  selectedProcess: ProcessInfoDto;
                  dirtyFields: FieldColorsDto[];
                  laborRate: LaborRateMasterDto[];
                };
                //this._manufacturingConfig.manufacturingRecalculateExistingCostProps.forEach((prop) => (processInfo[prop] = this[prop]));
                processInfo = this._simulationService.setCommonObjectValues(processInfo, dirtyFields, selectedProcess);
                if ([ProcessType.LaserCutting, ProcessType.TurretTPP, ProcessType.PlasmaCutting].includes(processInfo?.processTypeID)) {
                  if (this.sharedService.extractedProcessData?.ProcessBendingInfo || this.sharedService.extractedProcessData?.ProcessFormInfo) {
                    processInfo.inspectionCost = 0;
                    processInfo.qaOfInspectorRate = 0;
                    processInfo.inspectionTime = 0;
                    processInfo.isQaInspectorRateDirty = true;
                    processInfo.isinspectionCostDirty = true;
                    processInfo.isinspectionTimeDirty = true;
                  }
                }
                let alreadyProcessed = false;
                if (
                  processInfo?.materialInfoList?.length > 0 &&
                  (processInfo?.materialInfoList[0]?.processId === PrimaryProcessType.HotForgingOpenDieHot ||
                    processInfo?.materialInfoList[0]?.processId === PrimaryProcessType.HotForgingClosedDieHot ||
                    processInfo?.materialInfoList[0]?.processId === PrimaryProcessType.ColdForgingClosedDieHot ||
                    processInfo?.materialInfoList[0]?.processId === PrimaryProcessType.ColdForgingColdHeading ||
                    processInfo?.materialInfoList[0]?.processId === PrimaryProcessType.RoundBar ||
                    processInfo?.materialInfoList[0]?.processId === PrimaryProcessType.RectangularBar ||
                    processInfo?.materialInfoList[0]?.processId === PrimaryProcessType.RoundTube)
                ) {
                  alreadyProcessed = true;
                  switch (processInfo?.processTypeID) {
                    case ProcessType.HotOpenDieForging:
                      processInfo.setUpTimeBatch = 60;
                      addProcessParams = {
                        processResult: this._manufacturingForgingCalService.calculateHotForgingOpenDieHot(processInfo, dirtyFields, selectedProcess),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };
                      break;

                    case ProcessType.HotClosedDieForging:
                      processInfo.setUpTimeBatch = 3600;
                      addProcessParams = {
                        processResult: this._manufacturingForgingCalService.calculateHotForgingOpenClosedDieHot(processInfo, dirtyFields, selectedProcess),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };
                      break;

                    case ProcessType.BilletHeatingContinuousFurnace:
                      processInfo.setUpTimeBatch = 3600;
                      addProcessParams = {
                        processResult: this._simulationService._manufacturingBilletHeatingForgingCalService.calculateBilletHeatingForging(processInfo, dirtyFields, selectedProcess),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };
                      break;
                    case ProcessType.ShotBlasting:
                      if (processInfo?.materialInfoList[0]?.processId !== PrimaryProcessType.HotForgingClosedDieHot) {
                        processInfo.setUpTimeBatch = 45;
                        addProcessParams = {
                          processResult: this._manufacturingForgingCalService.calculationForShotBlasting(processInfo, dirtyFields, selectedProcess),
                          totProcessList: calculateResults,
                          processInfoId: selectedProcess.processInfoId,
                          toolingEntryData: null,
                          selectedProcess: selectedProcess,
                          dirtyFields: dirtyFields,
                          laborRate: laborRate,
                        };
                      } else {
                        processInfo.setUpTimeBatch = 10;
                        addProcessParams = {
                          processResult: this._manufacturingForgingCalService.calculateForgingShotBlasting(processInfo, dirtyFields, selectedProcess),
                          totProcessList: calculateResults,
                          processInfoId: selectedProcess.processInfoId,
                          toolingEntryData: null,
                          selectedProcess: selectedProcess,
                          dirtyFields: dirtyFields,
                          laborRate: laborRate,
                        };
                      }
                      break;

                    case ProcessType.SawCutting:
                      processInfo.setUpTimeBatch = 30;
                      processInfo.noOfParts ||= 1;
                      processInfo.lotSize ||= currentPart?.lotSize || 1;
                      processInfo.subProcessFormArray = null;
                      addProcessParams = {
                        processResult: this._manufacturingForgingCalService.calculateForgingSawCuttingAndShearing(processInfo, dirtyFields, selectedProcess, currentPart),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };

                      break;

                    case ProcessType.HeatTreatment:
                      processInfo.setUpTimeBatch = 60;
                      addProcessParams = {
                        processResult: this._manufacturingForgingCalService.calculateForgingHeatTreatment(processInfo, dirtyFields, selectedProcess),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };

                      break;

                    case ProcessType.StockShearing:
                      processInfo.setUpTimeBatch = 30;
                      addProcessParams = {
                        processResult: this._manufacturingForgingCalService.calculateHotForgingClosedDieStockShearing(processInfo, dirtyFields, selectedProcess),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };
                      break;

                    case ProcessType.TrimmingPressForging:
                      if (Number(currentPart?.commodityId) === CommodityType.MetalForming) {
                        processInfo.setUpTimeBatch = 3600;
                        addProcessParams = {
                          processResult: this._simulationService._manufacturingTrimmingHydraulicForgingCalService.calculateTrimmingHydraulicForging(processInfo, dirtyFields, selectedProcess),
                          totProcessList: calculateResults,
                          processInfoId: selectedProcess.processInfoId,
                          toolingEntryData: null,
                          selectedProcess: selectedProcess,
                          dirtyFields: dirtyFields,
                          laborRate: laborRate,
                        };
                      }
                      break;

                    case ProcessType.Piercing:
                      if (Number(currentPart?.commodityId) === CommodityType.MetalForming) {
                        processInfo.setUpTimeBatch = 3600;
                        addProcessParams = {
                          processResult: this._simulationService._manufacturingPiercingHydraulicForgingCalService.calculatePiercingHydraulicForging(processInfo, dirtyFields, selectedProcess),
                          totProcessList: calculateResults,
                          processInfoId: selectedProcess.processInfoId,
                          toolingEntryData: null,
                          selectedProcess: selectedProcess,
                          dirtyFields: dirtyFields,
                          laborRate: laborRate,
                        };
                      }
                      break;

                    case ProcessType.Control:
                      addProcessParams = {
                        processResult: this._manufacturingForgingCalService.calculateForgingControl(processInfo, dirtyFields, selectedProcess),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };
                      break;

                    case ProcessType.Straightening:
                      addProcessParams = {
                        processResult: this._simulationService._manufacturingStraighteningOptionalForgingCalService.calculateStraighteningOptionalForging(processInfo, dirtyFields, selectedProcess),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };

                      break;

                    case ProcessType.Testing:
                      addProcessParams = {
                        processResult: this._simulationService._manufacturingTestingMpiForgingCalService.calculateTestingMpiForging(processInfo, dirtyFields, selectedProcess),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };

                      break;

                    case ProcessType.LubricationPhosphating:
                      addProcessParams = {
                        processResult: this._manufacturingForgingCalService.calculateForgingLubricationPhosphate(processInfo, dirtyFields, selectedProcess),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };

                      break;

                    // ---------- THREAD ROLLING (2 sub-conditions) ----------
                    case ProcessType.ThreadRolling:
                      if (processInfo.materialInfoList[0]?.processId === PrimaryProcessType.ColdForgingClosedDieHot) {
                        addProcessParams = {
                          processResult: this._manufacturingForgingCalService.calculateForgingThreadRolling(processInfo, dirtyFields, selectedProcess),
                          totProcessList: calculateResults,
                          processInfoId: selectedProcess.processInfoId,
                          toolingEntryData: null,
                          selectedProcess: selectedProcess,
                          dirtyFields: dirtyFields,
                          laborRate: laborRate,
                        };
                      } else if (processInfo.materialInfoList[0]?.processId === PrimaryProcessType.ColdForgingColdHeading) {
                        addProcessParams = {
                          processResult: this._manufacturingForgingCalService.calculateColdHeadingThreadRolling(processInfo, dirtyFields, selectedProcess),
                          totProcessList: calculateResults,
                          processInfoId: selectedProcess.processInfoId,
                          toolingEntryData: null,
                          selectedProcess: selectedProcess,
                          dirtyFields: dirtyFields,
                          laborRate: laborRate,
                        };
                      }
                      break;

                    case ProcessType.ColdHeading:
                      addProcessParams = {
                        processResult: this._manufacturingForgingCalService.calculateColdHeadingForging(processInfo, dirtyFields, selectedProcess),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };

                      break;

                    case ProcessType.ClosedDieForging:
                      const forgingSubProcessFG = costingManufacturingInfoform.get(FormGroupKeys.ForgingSubProcess) as FormGroup;
                      if (forgingSubProcessFG) {
                        const forgingSubProcessFA = forgingSubProcessFG.get('subProcessList') as FormArray;
                        if (forgingSubProcessFA) {
                          this._manufacturingForgingCalService.reCalculateforgingSubProcessColdDieCost(
                            processInfo,
                            dirtyFields,
                            selectedProcess,
                            calculateResults,
                            forgingSubProcessFA,
                            subProcessFormArray,
                            this.selectedProcessInfoId,
                            this.conversionValue,
                            this.isEnableUnitConversion
                          );
                        }
                      }
                      break;

                    case ProcessType.BilletHeating:
                      addProcessParams = {
                        processResult: this._manufacturingForgingCalService.calculateForgingBilletHeating(processInfo, dirtyFields, selectedProcess),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };

                      break;

                    default:
                      alreadyProcessed = false;
                      break;
                  }
                }
                if (!alreadyProcessed) {
                  if (isSecondaryProcess && processInfo?.processTypeID !== ProcessType.Stage) {
                    console.log('Secondary Process Calc');
                    addProcessParams = {
                      processResult: this._simulationService._manufacturingPlatingCalcService.calculationsForPlating(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (isMachiningProcess) {
                    // Machining
                    console.log('Machining Calc');
                    // processInfo.setUpTimeBatch = 60;
                    machiningFlags = { ...machiningFlags, ...this._manufacturingConfig._machining.setMachineFlags(Number(processInfo.processTypeID)) };
                    processInfo.MachiningFlags = machiningFlags;
                    processInfo.turningLookupList = this.turningLookupList;
                    processInfo.millingLookupList = this.millingLookupList;
                    processInfo.drillingCuttingSpeedList = this.drillingCuttingSpeedList;
                    processInfo.boringLookupList = this.boringLookupList;
                    processInfo.grindingLookupList = this.grindingLookupList;
                    // selectedProcess.subProcessFormArray = null; // del
                    // processInfo.subProcessFormArray = null; // del
                    // if (selectedProcess?.subProcessTypeInfos) {
                    //   if (machiningOperationTypeFormArray.length > 0) {
                    //     machiningOperationTypeFormArray.clear();
                    //   }
                    //   for (let i = 0; i < selectedProcess?.subProcessTypeInfos?.length; i++) {
                    //     const info = selectedProcess?.subProcessTypeInfos[i];
                    //     const formGroup = this._fb.group({
                    //       ...this._manufacturingConfig._machining.getMachiningOperationFormFields(this.selectedProcessInfoId),
                    //       subProcessInfoId: info.subProcessInfoId,
                    //       ...this._manufacturingConfig._machining.setMachiningSubProcess(this.selectedProcessInfoId, info, this.conversionValue, this.isEnableUnitConversion, 'defaultReturn'),
                    //       ...this._manufacturingConfig._machining.getOperationFlags(processInfo?.processTypeID, info?.operationTypeId),
                    //     });
                    //     machiningOperationTypeFormArray.push(formGroup);
                    //   }
                    //   processInfo.machiningOperationTypeFormArray = machiningOperationTypeFormArray;
                    // }
                    const processResult = this._simulationService._manufacturingMachiningCalcService.calculationForMachiningTypes(processInfo, dirtyFields, selectedProcess, laborRate, currentPart);
                    // processResult.subProcessFormArray = null; // del
                    // processResult.subProcessTypeInfos = [];
                    // for (let i = 0; i < processResult.machiningOperationTypeFormArray?.controls?.length; i++) {
                    //   const info = processResult.machiningOperationTypeFormArray?.controls[i];
                    //   let subProcessInfo = new SubProcessTypeInfoDto();
                    //   subProcessInfo.subProcessInfoId = 0;
                    //   subProcessInfo = {
                    //     ...subProcessInfo,
                    //     ...this._manufacturingConfig._machining.setMachiningSubProcess(selectedProcess.processInfoId, info.value, this.conversionValue, this.isEnableUnitConversion, 'defaultReturn'),
                    //   };
                    //   processResult.subProcessTypeInfos.push(subProcessInfo);
                    // }
                    // processInfo.machiningOperationTypeFormArray = null;
                    // processResult.machiningOperationTypeFormArray = null;
                    addProcessParams = {
                      processResult: processResult,
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (isWelding) {
                    if (processInfo?.processTypeID === ProcessType.SpotWelding) {
                      addProcessParams = {
                        processResult: this._weldingService.calculationForSpotWelding(processInfo, dirtyFields, selectedProcess, laborRate),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };
                    } else if (processInfo?.processTypeID === ProcessType.SeamWelding) {
                      addProcessParams = {
                        processResult: this._weldingService.calculationForSeamWelding(processInfo, dirtyFields, selectedProcess, laborRate),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };
                    } else {
                      addProcessParams = {
                        processResult: this._weldingService.calculationForWelding(processInfo, dirtyFields, selectedProcess, laborRate),
                        totProcessList: calculateResults,
                        processInfoId: selectedProcess.processInfoId,
                        toolingEntryData: null,
                        selectedProcess: selectedProcess,
                        dirtyFields: dirtyFields,
                        laborRate: laborRate,
                      };
                    }
                  } else if (isPlasticTubeExtrusion) {
                    calculateResults.push(this._simulationService._manufacturingPlasticTubeExtrusionCalcService.doCostCalculationsForPlasticTubeExtrusion(processInfo, dirtyFields, selectedProcess));
                  } else if (isMetalTubeExtrusion) {
                    calculateResults.push(this._simulationService._manufacturingMetalExtrusionCalService.doCostCalculationsForMetalTubeExtrusion(processInfo, dirtyFields, selectedProcess));
                  } else if (isMetalExtrusion) {
                    calculateResults.push(this._simulationService._manufacturingMetalExtrusionCalService.doCostCalculationsForMetalExtrusion(processInfo, dirtyFields, selectedProcess));
                  } else if (processInfo?.processId === ProcessType.Brazing) {
                    calculateResults.push(this._simulationService._manufacturingBrazingCalService.doCostCalculationsForBrazing(processInfo, dirtyFields, selectedProcess));
                  } else if (processInfo?.processTypeID === ProcessType.TubeBending) {
                    calculateResults.push(this._simulationService._manufacturingTubeBendingCalService.doCostCalculationsForTubeBending(processInfo, dirtyFields, selectedProcess));
                  } else if (isInsulationJacket) {
                    calculateResults.push(this._simulationService._manufacturingInsulationJacketCalService.doCostCalculationsForInsulationJacket(processInfo, dirtyFields, selectedProcess));
                  } else if ([ProcessType.InjectionMouldingDoubleShot, ProcessType.InjectionMouldingSingleShot, ProcessType.PlugConnectorOvermolding].includes(processInfo?.processTypeID)) {
                    const processResult = this._plasticRubberService.calculationsForInjectionMoulding(processInfo, dirtyFields, selectedProcess, laborRate);
                    if (processResult) {
                      let isToolingAutomationRun = false;
                      processResult.processInfoId = selectedProcess.processInfoId;
                      if (
                        processInfo.newToolingRequired &&
                        (processInfo.costTooling === null || processInfo.costTooling === undefined || processInfo.costTooling?.toolingNameId <= 0 || processInfo.costTooling?.toolingId <= 0)
                      ) {
                        isToolingAutomationRun = true;
                        const toolingEntryData = { processInfo: processInfo, laborRate: laborRate, toolNameId: InjectionMouldingTool.InjectionMoulding, currentPart: currentPart };
                        addProcessParams = {
                          processResult: processResult,
                          totProcessList: calculateResults,
                          processInfoId: selectedProcess.processInfoId,
                          toolingEntryData: toolingEntryData,
                          selectedProcess: selectedProcess,
                          dirtyFields: dirtyFields,
                          laborRate: laborRate,
                        };
                      }
                      !isToolingAutomationRun && calculateResults.push(processResult);
                    }
                    // } else if ([ProcessType.RubberExtrusion].includes(processInfo?.processTypeID)) {
                    //   this.addProcessToRecalculatedList(
                    //     this._plasticRubberService.calculationsForRubberExtrusion(processInfo, dirtyFields, selecteProcess),
                    //     totProcessList,
                    //     selecteProcess.processInfoId,
                    //     null,
                    //     selecteProcess,
                    //     dirtyFields,
                    //     laborRate
                    //   );
                    // }
                  } else if ([ProcessType.RubberInjectionMolding].includes(processInfo?.processTypeID)) {
                    const processResult = this._plasticRubberService.calculationsForRubberInjectionMoulding(processInfo, dirtyFields, selectedProcess, laborRate);
                    if (processResult) {
                      let isToolingAutomationRun = false;
                      processResult.processInfoId = selectedProcess.processInfoId;
                      if (
                        processInfo.newToolingRequired &&
                        (processInfo.costTooling === null || processInfo.costTooling === undefined || processInfo.costTooling?.toolingNameId <= 0 || processInfo.costTooling?.toolingId <= 0)
                      ) {
                        isToolingAutomationRun = true;
                        const toolingEntryData = { processInfo: processInfo, laborRate: laborRate, toolNameId: InjectionMouldingTool.InjectionMoulding, currentPart: currentPart };
                        addProcessParams = {
                          processResult: processResult,
                          totProcessList: calculateResults,
                          processInfoId: selectedProcess.processInfoId,
                          toolingEntryData: toolingEntryData,
                          selectedProcess: selectedProcess,
                          dirtyFields: dirtyFields,
                          laborRate: laborRate,
                        };
                      }
                      !isToolingAutomationRun && calculateResults.push(processResult);
                    }
                  } else if (
                    ([ProcessType.MetalForming, ProcessType.ColdHeading].includes(processInfo?.processTypeID) &&
                      Number(processInfo.materialInfoList[0].processId) !== PrimaryProcessType.ColdForgingColdHeading) ||
                    [ProcessType.RollForming].includes(processInfo?.processTypeID) // TODO : Need to confirm with Metal Forming
                  ) {
                    addProcessParams = {
                      processResult: this._simulationService.calculationsForMetalForming(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.Drilling) {
                    addProcessParams = {
                      processResult: this._simulationService.calculationsForDrilling(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.TurretTPP) {
                    addProcessParams = {
                      processResult: this._sheetMetalService.calculationsForTPP(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };

                    // } else if ([ProcessType.RollForming, ProcessType.PlasticVacuumForming].includes(processInfo?.processTypeID)) {
                    //   this.addProcessToRecalculatedList(
                    //     this._simulationService.calculationsForMetalForming(processInfo, dirtyFields, selecteProcess),
                    //     totProcessList,
                    //     selecteProcess.processInfoId,
                    //     null,
                    //     selecteProcess,
                    //     dirtyFields,
                    //     laborRate
                    //   );
                    // }
                  } else if (!isCasting && processInfo?.processTypeID === ProcessType.MeltingCasting) {
                    processInfo.setUpTimeBatch = 2;
                    addProcessParams = {
                      processResult: this._simulationService._manufacturingCastingCalcService.calculationForMeltingCasting(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (!isCasting && processInfo?.processTypeID === ProcessType.PouringCasting) {
                    processInfo.setUpTimeBatch = 2;
                    addProcessParams = {
                      processResult: this._simulationService._manufacturingCastingCalcService.calculationForPouringCasting(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if ([ProcessType.RotorMolding].includes(processInfo?.processTypeID)) {
                    processInfo.setUpTimeBatch = 3;
                    addProcessParams = {
                      processResult: this._simulationService.calculationForForMoldPreparation(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID == ProcessType.TransferMolding) {
                    addProcessParams = {
                      processResult: this._plasticRubberService.calculationsForTransferMolding(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.CorePreparation) {
                    processInfo.setUpTimeBatch = 0.25;
                    addProcessParams = {
                      processResult: this._simulationService.calculationForForCorePreparation(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if ([ProcessType.OxyCutting, ProcessType.LaserCutting, ProcessType.PlasmaCutting, ProcessType.OxyCutting, ProcessType.WaterJetCutting].includes(processInfo?.processTypeID)) {
                    processInfo.setUpTimeBatch = 0.25;
                    processInfo.cuttingLength = processInfo?.lengthOfCut || 0;
                    addProcessParams = {
                      processResult: this._sheetMetalService.calculationForCutting(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };

                    // const processResult = this._sheetMetalService.calculationForCutting(processInfo, dirtyFields, selecteProcess);
                  } else if (processInfo?.processTypeID === ProcessType.TubeLaser) {
                    // processInfo.setUpTimeBatch = 0.25;
                    processInfo.cuttingLength = processInfo?.lengthOfCut || 0;
                    addProcessParams = {
                      processResult: this._sheetMetalService.calculationForTubeLaser(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.TubeBendingMetal) {
                    processInfo.cuttingLength = processInfo?.lengthOfCut || 0;
                    addProcessParams = {
                      processResult: this._sheetMetalService.calculationForTubeBendingMetal(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.PartCoolingShakeOut) {
                    processInfo.setUpTimeBatch = 2;
                    addProcessParams = {
                      processResult: this._simulationService.calculationForPartCooling(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.VaccumeImpregnation || processInfo?.processTypeID === ProcessType.Cleaning) {
                    processInfo.setUpTimeBatch = 0.25;
                    addProcessParams = {
                      processResult: this._simulationService.calculationForCleaningOrVaccumeImpregnation(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.RunnerRiserDegating) {
                    processInfo.setUpTimeBatch = 2;
                    addProcessParams = {
                      processResult: this._simulationService.calculationForFetling(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.StockHeating) {
                    processInfo.setUpTimeBatch = 60;
                    addProcessParams = {
                      processResult: this._simulationService.calculateForgingStockHeating(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.ThermoForming) {
                    processInfo.setUpTimeBatch = 60;
                    addProcessParams = {
                      processResult: this._plasticRubberService.doCostCalculationForThermoForming(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.PlasticVacuumForming) {
                    processInfo.setUpTimeBatch = 90;
                    addProcessParams = {
                      processResult: this._plasticRubberService.doCostCalculationForVacuumForming(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.Bending) {
                    // processInfo.setUpTimeBatch = 60;
                    // if (selectedProcess?.moldTemp == BendingToolTypes.Dedicated) {
                    //   addProcessParams = {
                    //     processResult: this._sheetMetalService.calculationForBending(processInfo, dirtyFields, selectedProcess),
                    //     totProcessList: calculateResults,
                    //     processInfoId: selectedProcess.processInfoId,
                    //     toolingEntryData: null,
                    //     selectedProcess: selectedProcess,
                    //     dirtyFields: dirtyFields,
                    //     laborRate: laborRate,
                    //   };
                    // } else if (selectedProcess?.moldTemp === BendingToolTypes.Soft) {
                    addProcessParams = {
                      processResult: this._sheetMetalService.calculationForSoftBending(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                    // }
                  } else if (processInfo?.processTypeID === ProcessType.Forming) {
                    addProcessParams = {
                      processResult: this._sheetMetalService.calculationForForming(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.Progressive) {
                    processInfo.setUpTimeBatch = 60;
                    if (selectedProcess?.subProcessTypeInfos) {
                      this._manufacturingConfig.subprocessFormArrayMapper(subProcessFormArray, selectedProcess);
                      processInfo.subProcessFormArray = subProcessFormArray;
                    }
                    const processResult = this._sheetMetalService.calculationForstampingProgressive(processInfo, dirtyFields, selectedProcess);
                    if (processResult) {
                      processResult.subProcessTypeInfos = [];
                      processInfo.subProcessTypeInfos = [];
                      this._manufacturingConfig.subProcessTypeInfoMapper(processResult, selectedProcess.processInfoId, processInfo);
                      processResult.subProcessFormArray = null;
                      let isToolingAutomationRun = false;
                      processResult.processInfoId = selectedProcess.processInfoId;
                      if (processInfo.newToolingRequired && (!processInfo.costTooling || processInfo.costTooling?.toolingNameId <= 0 || processInfo.costTooling?.toolingId <= 0)) {
                        isToolingAutomationRun = true;
                        const toolingEntryData = { processInfo: processInfo, laborRate: laborRate, toolNameId: SheetMetalTool.StampingTool, currentPart: currentPart };
                        addProcessParams = {
                          processResult: processResult,
                          totProcessList: calculateResults,
                          processInfoId: selectedProcess.processInfoId,
                          toolingEntryData: toolingEntryData,
                          selectedProcess: selectedProcess,
                          dirtyFields: dirtyFields,
                          laborRate: laborRate,
                        };
                      }
                      !isToolingAutomationRun && calculateResults.push(processResult);
                    }
                  } else if (processInfo?.processTypeID === ProcessType.Stage) {
                    processInfo.noOfHitsRequired = processInfo.noOfHitsRequired ?? this._manufacturingConfig._sheetMetalConfig.getToolingRequiredOrNotForStage(currentPart?.mfrCountryId);
                    processInfo.setUpTimeBatch = 60;
                    if (selectedProcess?.subProcessTypeInfos) {
                      this._manufacturingConfig.subprocessFormArrayMapper(subProcessFormArray, selectedProcess);
                      processInfo.subProcessFormArray = subProcessFormArray;
                    }
                    const processResult = this._sheetMetalService.calculationForstampingStage(processInfo, dirtyFields, selectedProcess, currentPart);
                    if (processResult) {
                      processResult.subProcessTypeInfos = [];
                      processInfo.subProcessTypeInfos = [];
                      this._manufacturingConfig.subProcessTypeInfoMapper(processResult, selectedProcess.processInfoId, processInfo);
                      processInfo.subProcessFormArray = null;
                      processResult.subProcessFormArray = null;
                      let isToolingAutomationRun = false;
                      processResult.processInfoId = selectedProcess.processInfoId;
                      // processInfo.newToolingRequired = Number(processInfo.noOfHitsRequired) !== 3; // 3 is No
                      processInfo.liquidTemp =
                        costingManufacturingInfoform.controls.liquidTemp?.value === undefined || costingManufacturingInfoform.controls.liquidTemp?.value === null
                          ? 1
                          : costingManufacturingInfoform.controls.liquidTemp?.value;
                      processInfo.newToolingRequired = processInfo?.liquidTemp === undefined || processInfo?.liquidTemp === null ? true : processInfo?.liquidTemp !== 0;
                      if (processInfo.newToolingRequired && (!processInfo.costTooling || processInfo.costTooling?.toolingNameId <= 0 || processInfo.costTooling?.toolingId <= 0)) {
                        isToolingAutomationRun = true;
                        if (
                          processInfo?.subProcessTypeInfos &&
                          processInfo?.subProcessTypeInfos.find((x) => x.subProcessTypeId === StampingType.BlankingPunching || x.subProcessTypeId === StampingType.Piercing)
                        ) {
                          const toolingEntryData = { processInfo: processInfo, laborRate: laborRate, toolNameId: SheetMetalTool.BalnkAndPierce, currentPart: currentPart };
                          addProcessParams = {
                            processResult: processResult,
                            totProcessList: calculateResults,
                            processInfoId: selectedProcess.processInfoId,
                            toolingEntryData: toolingEntryData,
                            selectedProcess: selectedProcess,
                            dirtyFields: dirtyFields,
                            laborRate: laborRate,
                          };
                        }
                        if (processInfo?.subProcessTypeInfos && processInfo?.subProcessTypeInfos.find((x) => x.subProcessTypeId === StampingType.Compound)) {
                          const toolingEntryData = { processInfo: processInfo, laborRate: laborRate, toolNameId: SheetMetalTool.CompoundTool, currentPart: currentPart };
                          addProcessParams = {
                            processResult: processResult,
                            totProcessList: calculateResults,
                            processInfoId: selectedProcess.processInfoId,
                            toolingEntryData: toolingEntryData,
                            selectedProcess: selectedProcess,
                            dirtyFields: dirtyFields,
                            laborRate: laborRate,
                          };
                        }
                        if (processInfo?.subProcessTypeInfos && processInfo?.subProcessTypeInfos.find((x) => x.subProcessTypeId === StampingType.Forming)) {
                          const toolingEntryData = { processInfo: processInfo, laborRate: laborRate, toolNameId: SheetMetalTool.FormingTool, currentPart: currentPart };
                          addProcessParams = {
                            processResult: processResult,
                            totProcessList: calculateResults,
                            processInfoId: selectedProcess.processInfoId,
                            toolingEntryData: toolingEntryData,
                            selectedProcess: selectedProcess,
                            dirtyFields: dirtyFields,
                            laborRate: laborRate,
                          };
                        }
                        if (processInfo?.subProcessTypeInfos && processInfo?.subProcessTypeInfos.find((x) => x.subProcessTypeId === StampingType.Bending)) {
                          const toolingEntryData = {
                            materialInfo: processInfo.materialInfoList[0],
                            processInfo: processInfo,
                            laborRate: laborRate,
                            toolNameId: SheetMetalTool.BendingTool,
                            currentPart: currentPart,
                          };
                          addProcessParams = {
                            processResult: processResult,
                            totProcessList: calculateResults,
                            processInfoId: selectedProcess.processInfoId,
                            toolingEntryData: toolingEntryData,
                            selectedProcess: selectedProcess,
                            dirtyFields: dirtyFields,
                            laborRate: laborRate,
                          };
                        }
                      }
                      !isToolingAutomationRun && calculateResults.push(processResult);
                    }
                  } else if ([ProcessType.CablePreparation, ProcessType.LineAssembly, ProcessType.FinalInspection, ProcessType.FunctionalTestCableHarness].includes(processInfo?.processTypeID)) {
                    if (selectedProcess?.subProcessTypeInfos) {
                      if (subProcessFormArray.length > 0) {
                        subProcessFormArray.clear();
                      }
                      for (let i = 0; i < selectedProcess?.subProcessTypeInfos?.length; i++) {
                        const info = selectedProcess?.subProcessTypeInfos[i];
                        const formGroup = this._manufacturingConfig._wireHarnessConfig.setWireHarnessSubProcess(info, selectedProcess.processInfoId);
                        subProcessFormArray.push(formGroup);
                        if (info?.additionalLengthArray) {
                          const additionalLengthInfo = info?.additionalLengthArray?.split(',');
                          if (additionalLengthInfo && additionalLengthInfo?.length > 0) {
                            ((subProcessFormArray?.controls[i] as FormGroup).get('cableLengthArray') as FormArray).clear();
                            for (let index = 0; index < additionalLengthInfo?.length; index++) {
                              ((subProcessFormArray?.controls[i] as FormGroup).get('cableLengthArray') as FormArray).push(this._fb.control(+additionalLengthInfo[index]));
                            }
                          }
                        }
                      }
                      processInfo.subProcessFormArray = subProcessFormArray;
                    }
                    processInfo.wiringHarnessLookupList = this.wiringHarnessLookupList;
                    this._wiringHarness.doCostCalculationForWiringHarness(processInfo, dirtyFields, selectedProcess);
                    processInfo.subProcessTypeInfos = [];
                    this._manufacturingConfig.subProcessTypeInfoMapper(processInfo, selectedProcess.processInfoId, processInfo);
                    processInfo.subProcessFormArray = null;
                    addProcessParams = {
                      processResult: processInfo,
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.Stitching) {
                    processInfo.setUpTimeBatch = 60;
                    processInfo.totalPinPopulation = this._manufacturingConfig.calculateTotalPinPopulation(this.BillOfMaterialList);
                    processInfo.noOfTypesOfPins = this._manufacturingConfig.calculateNoOfTypesOfPins(this.BillOfMaterialList);
                    processInfo.maxBomQuantityOfIndividualPinTypes = this._manufacturingConfig.calculateBomMaxQtyOfIndividualPinTypes(this.BillOfMaterialList);
                    addProcessParams = {
                      processResult: this._simulationService._manufacturingAssemblyConnectorCalService.doCostCalculationForAssemblyConnectors(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.CableWireCutting) {
                    addProcessParams = {
                      processResult: this._manufacturingWireCuttingTerminationCalService.doCostCalculationFormWireCuttingTermination(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.BlowMolding) {
                    addProcessParams = {
                      processResult: this._plasticRubberService.calculationsForBlowMolding(processInfo, dirtyFields, selectedProcess, currentPart, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.CompressionMolding) {
                    addProcessParams = {
                      processResult: this._plasticRubberService.calculationsForCompressionMolding(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.RubberMaterialPreparation && Number(processInfo?.materialInfoList[0]?.processId) === PrimaryProcessType.CompressionMoulding) {
                    addProcessParams = {
                      processResult: this._plasticRubberService.calculationsForCompressionMaterialPreparation(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (
                    (processInfo?.processTypeID === ProcessType.RubberMaterialPreparation && Number(processInfo?.materialInfoList[0]?.processId) === PrimaryProcessType.RubberExtrusion) ||
                    [ProcessType.RubberExtrusion].includes(processInfo?.processTypeID)
                  ) {
                    addProcessParams = {
                      processResult: this._plasticRubberService.calculationsForRubberExtrusion(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.ManualDeflashing) {
                    addProcessParams = {
                      processResult: this._plasticRubberService.calculationsForManualDeflashing(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.PostCuring) {
                    addProcessParams = {
                      processResult: this._plasticRubberService.calculationsForPostCuring(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.Preform) {
                    addProcessParams = {
                      processResult: this._plasticRubberService.calculationsForPreform(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.Cutting) {
                    addProcessParams = {
                      processResult: this._plasticRubberService.calculationsForCutting(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.Deburring) {
                    addProcessParams = {
                      processResult: this._plasticRubberService.calculationsForDeburring(processInfo, dirtyFields, selectedProcess, laborRate),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.WeldingPreparation) {
                    addProcessParams = {
                      processResult: this._weldingService.calculationsForWeldingPreparation(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.WeldingCleaning) {
                    addProcessParams = {
                      processResult: this._weldingService.calculationsForWeldingCleaning(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.CleaningForging) {
                    addProcessParams = {
                      processResult: this._simulationService._manufacturingCleaningForgingCalService.calculateCleaningForging(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (processInfo?.processTypeID === ProcessType.Assembly) {
                    if (selectedProcess?.subProcessTypeInfos) {
                      if (subProcessFormArray.length > 0) {
                        subProcessFormArray.clear();
                      }
                      this._manufacturingConfig._assembly.setAssemblySubProcess(selectedProcess, subProcessFormArray);
                      processInfo.subProcessFormArray = subProcessFormArray;
                    }
                    addProcessParams = {
                      processResult: this._secondaryService.calculationForAssembly(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
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
                    ].includes(processInfo?.processTypeID)
                  ) {
                    const obj = Object.assign({}, processInfo);
                    if (subProcessFormArray.length > 0) {
                      subProcessFormArray.clear();
                    }
                    const machineInfo = this._manufacturingConfig._electronics.setMachineForPCBASubProcessEntries(
                      selectedProcess,
                      obj,
                      machineTypeDescription,
                      this.fieldColorsList,
                      machine,
                      machineTypeObj
                    );
                    this._manufacturingConfig.setMachineLaborInfo(obj, laborRate, machineInfo, this.processTypeOrginalList);
                    const processResult = this._simulationService._manuFacturingElectronicsService.calculationForElectronics(obj, dirtyFields, selectedProcess);
                    if (processResult) {
                      this._electronincs.setSubArrayForPCBA(processResult);
                      calculateResults.push(processResult);
                    }
                  } else if (
                    materialInfoList[0]?.processId === PrimaryProcessType.ConventionalPCB &&
                    [
                      ProcessType.InnerLayer,
                      ProcessType.LaminationBonding,
                      ProcessType.PCBDrilling,
                      ProcessType.PCBPlating,
                      ProcessType.OuterLayer,
                      ProcessType.Soldermask,
                      ProcessType.SilkScreen,
                      ProcessType.SurfaceFinish,
                      ProcessType.RoutingScoring,
                      ProcessType.ETestBBT,
                      ProcessType.FQCInspection,
                    ].includes(processInfo?.processTypeID)
                  ) {
                    if (selectedProcess?.subProcessTypeInfos) {
                      if (subProcessFormArray.length > 0) {
                        subProcessFormArray.clear();
                      }
                      for (let i = 0; i < selectedProcess?.subProcessTypeInfos?.length; i++) {
                        const info = selectedProcess?.subProcessTypeInfos[i];
                        const formGroup = this._fb.group({
                          subProcessInfoId: [info.subProcessInfoId],
                          processInfoId: selectedProcess.processInfoId || 0,
                          subProcessTypeID: info.subProcessTypeId,
                        });
                        subProcessFormArray.push(formGroup);
                      }
                      processInfo.subProcessFormArray = subProcessFormArray;
                    }
                    const obj = Object.assign({}, processInfo);
                    if (this.sharedService.checkDirtyProperty('machineId', dirtyFields)) {
                      machineTypeObj = machineTypeDescription?.find((x) => x.machineMarketDtos.find((y) => y.machineMarketID == obj?.machineMarketId));
                    } else {
                      machineTypeObj = machineSelected;
                    }
                    this._manufacturingConfig.setMachineLaborInfo(obj, laborRate, machineTypeObj, this.processTypeOrginalList);
                    const processResult = this._pcbCalculator.doCostCalculationForConventionalPCB(obj, dirtyFields, selectedProcess);
                    if (processResult) {
                      processResult.subProcessTypeInfos = [];
                      obj.subProcessTypeInfos = [];
                      for (let i = 0; i < processResult.subProcessFormArray?.controls?.length; i++) {
                        const info = processResult.subProcessFormArray?.controls[i];
                        const subProcessInfo = new SubProcessTypeInfoDto();
                        subProcessInfo.subProcessInfoId = 0;
                        subProcessInfo.processInfoId = selectedProcess.processInfoId;
                        subProcessInfo.subProcessTypeId = info.value.subProcessTypeID;
                        if (obj.subProcessTypeInfos == null) {
                          obj.subProcessTypeInfos = [];
                        }
                        obj.subProcessTypeInfos.push(subProcessInfo);
                      }
                      processResult.subProcessFormArray = null;
                      calculateResults.push(processResult);
                    }
                  } else if (
                    materialInfoList[0]?.processId === PrimaryProcessType.SemiRigidFlex &&
                    [
                      ProcessType.InnerLayer,
                      ProcessType.LaminationBonding,
                      ProcessType.PCBDrilling,
                      ProcessType.PCBPlating,
                      ProcessType.OuterLayer,
                      ProcessType.Soldermask,
                      ProcessType.SilkScreen,
                      ProcessType.SurfaceFinish,
                      ProcessType.RoutingScoring,
                      ProcessType.ETestBBT,
                      ProcessType.FQCInspection,
                      ProcessType.ImpedanceCouponTest,
                    ].includes(processInfo?.processTypeID)
                  ) {
                    if (selectedProcess?.subProcessTypeInfos) {
                      if (subProcessFormArray.length > 0) {
                        subProcessFormArray.clear();
                      }
                      for (let i = 0; i < selectedProcess?.subProcessTypeInfos?.length; i++) {
                        const info = selectedProcess?.subProcessTypeInfos[i];
                        const formGroup = this._fb.group({
                          subProcessInfoId: [info.subProcessInfoId],
                          processInfoId: selectedProcess.processInfoId || 0,
                          subProcessTypeID: info.subProcessTypeId,
                        });
                        subProcessFormArray.push(formGroup);
                      }
                      processInfo.subProcessFormArray = subProcessFormArray;
                    }

                    const obj = Object.assign({}, processInfo);
                    if (this.sharedService.checkDirtyProperty('machineId', dirtyFields)) {
                      machineTypeObj = machineTypeDescription?.find((x) => x.machineMarketDtos.find((y) => y.machineMarketID == obj?.machineMarketId));
                    } else {
                      machineTypeObj = machineSelected;
                    }
                    this._manufacturingConfig.setMachineLaborInfo(obj, laborRate, machineTypeObj, this.processTypeOrginalList);
                    const processResult = this._simulationService._manufacturingSemiRigidFlexCalService.doCostCalculationForSemiRigidFlex(obj, dirtyFields, selectedProcess);
                    if (processResult) {
                      processResult.subProcessTypeInfos = [];
                      obj.subProcessTypeInfos = [];
                      for (let i = 0; i < processResult.subProcessFormArray?.controls?.length; i++) {
                        const info = processResult.subProcessFormArray?.controls[i];
                        const subProcessInfo = new SubProcessTypeInfoDto();
                        subProcessInfo.subProcessInfoId = 0;
                        subProcessInfo.processInfoId = selectedProcess.processInfoId;
                        subProcessInfo.subProcessTypeId = info.value.subProcessTypeID;
                        if (obj.subProcessTypeInfos == null) {
                          obj.subProcessTypeInfos = [];
                        }
                        obj.subProcessTypeInfos.push(subProcessInfo);
                      }
                      processResult.subProcessFormArray = null;
                      calculateResults.push(processResult);
                    }
                  } else if (isCasting) {
                    let isToolingAutomationRun = false;
                    console.log('Casting Calc');
                    processInfo.selectedTonnage = selectedProcess.selectedTonnage;
                    const materialWithCore = processInfo.materialInfoList?.find((x) => x?.secondaryProcessId === 2);
                    if (processInfo.processTypeID === ProcessType.CastingCorePreparation) {
                      processInfo.coreCycleTimes = processInfo.coreCycleTimes?.split(',') || [];
                      const hasMatchingCore = materialWithCore?.coreCostDetails?.some((core) => core.coreCostDetailsId === processInfo.subProcessTypeID);
                      if (!hasMatchingCore) {
                        this.processInfoSignalService.deleteProcessInfo(processInfo.processInfoId, processInfo.partInfoId);
                        this.automationProcessCount--;
                        return of(null);
                      }
                    }
                    if (processInfo.processTypeID === ProcessType.CastingCoreAssembly) {
                      if (!(materialWithCore?.coreCostDetails?.length >= 2)) {
                        this.processInfoSignalService.deleteProcessInfo(processInfo.processInfoId, processInfo.partInfoId);
                        this.automationProcessCount--;
                        return of(null);
                      }
                    }
                    if (processInfo.processTypeID === ProcessType.GravityDieCasting) {
                      processInfo.newToolingRequired = false;
                    }
                    const processResult = this._simulationService._manufacturingCastingCalcService.doCostCalculationForCasting(processInfo, dirtyFields, selectedProcess);
                    if (processResult) {
                      if (processResult.processTypeID === ProcessType.CastingCorePreparation) {
                        processResult.coreCycleTimes = processResult.coreCycleTimes.join(',');
                      }
                      processResult.processInfoId = selectedProcess.processInfoId;
                      if (
                        processInfo?.processTypeID === ProcessType.HighPressureDieCasting &&
                        processInfo.newToolingRequired &&
                        (processInfo.costTooling === null || processInfo.costTooling === undefined || processInfo.costTooling?.toolingNameId <= 0 || processInfo.costTooling?.toolingId <= 0)
                      ) {
                        isToolingAutomationRun = true;
                        const toolingEntryData = { processInfo: processInfo, laborRate: laborRate, toolNameId: HPDCCastingTool.HPDC, currentPart: currentPart };

                        addProcessParams = {
                          processResult: processResult,
                          totProcessList: calculateResults,
                          processInfoId: selectedProcess.processInfoId,
                          toolingEntryData: toolingEntryData,
                          selectedProcess: selectedProcess,
                          dirtyFields: dirtyFields,
                          laborRate: laborRate,
                        };
                      } else if (
                        processInfo?.processTypeID === ProcessType.TrimmingPress &&
                        processInfo.newToolingRequired &&
                        (processInfo.costTooling === null || processInfo.costTooling === undefined || processInfo.costTooling?.toolingNameId <= 0 || processInfo.costTooling?.toolingId <= 0)
                      ) {
                        isToolingAutomationRun = true;
                        const toolingEntryData = { processInfo: processInfo, laborRate: laborRate, toolNameId: HPDCCastingTool.TrimmingDie, currentPart: currentPart };
                        addProcessParams = {
                          processResult: processResult,
                          totProcessList: calculateResults,
                          processInfoId: selectedProcess.processInfoId,
                          toolingEntryData: toolingEntryData,
                          selectedProcess: selectedProcess,
                          dirtyFields: dirtyFields,
                          laborRate: laborRate,
                        };
                      }
                      !isToolingAutomationRun && calculateResults.push(processResult);
                    }
                  } else if (this._manufacturingConfig.testing.includes(processInfo?.processTypeID)) {
                    addProcessParams = {
                      processResult: this._simulationService.calculationsForTesting(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else if (
                    [
                      ProcessType.Others,
                      ProcessType.ManualInspection,
                      ProcessType.RadiographyTesting,
                      ProcessType.CMMInspection,
                      // ProcessType.SawCutting
                    ].includes(processInfo?.processTypeID)
                  ) {
                    addProcessParams = {
                      processResult: this._simulationService.doCostCalculationForOthers(processInfo, dirtyFields, selectedProcess),
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  } else {
                    calculateResults.push(selectedProcess);
                    console.log('Process not found', processInfo?.processTypeID, processInfo?.materialInfoList[0]?.processId, isCasting);
                    // unfound++;
                  }
                  if (!addProcessParams) {
                    addProcessParams = {
                      processResult: undefined,
                      totProcessList: calculateResults,
                      processInfoId: selectedProcess.processInfoId,
                      toolingEntryData: null,
                      selectedProcess: selectedProcess,
                      dirtyFields: dirtyFields,
                      laborRate: laborRate,
                    };
                  }
                  return this.addProcessToRecalculatedList(
                    addProcessParams.processResult,
                    addProcessParams.totProcessList,
                    addProcessParams.processInfoId,
                    addProcessParams.toolingEntryData,
                    addProcessParams.selectedProcess,
                    addProcessParams.dirtyFields,
                    addProcessParams.laborRate,
                    currentPart
                  ).pipe(
                    take(1),
                    map(() => {
                      calculateResults = this.costManufacturingAutomationService.sustainabilityCalc(selectedProcess, calculateResults, dirtyFields, laborRate);
                      if (materialInfoList.length > 0 && materialInfoList[0].processId === PrimaryProcessType.StampingStage) {
                        const liquidTempValue = selectedProcess?.liquidTemp === undefined || selectedProcess?.liquidTemp === null ? 1 : selectedProcess?.liquidTemp;
                        for (let i = 0; i < calculateResults.length; i++) {
                          calculateResults[i].liquidTemp = liquidTempValue;
                          calculateResults[i].isliquidTempDirty = true;
                          calculateResults[i].newToolingRequired = liquidTempValue !== 0;
                        }
                      }
                      if (selectedProcess.processInfoId === undefined) {
                        for (let i = 0; i < calculateResults.length; i++) {
                          const updatedProcess = this._simulationService._manufacturingSustainabilityCalService.doCostCalculationsForSustainability(
                            calculateResults[i],
                            dirtyFields,
                            selectedProcess,
                            laborRate
                          );
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
                                  ((Number(calculateResults[i].qaOfInspectorRate) / 60) *
                                    Number(inspectionTime) *
                                    Math.round(Number(calculateResults[i].samplingRate / 100) * Number(calculateResults[i].lotSize))) /
                                  Number(calculateResults[i].lotSize)
                                );
                                calculateResults[i].inspectionCost = inspectionCost;

                                const sum = this.sharedService.isValidNumber(
                                  Number(calculateResults[i].directMachineCost) +
                                  Number(calculateResults[i].directSetUpCost) +
                                  Number(calculateResults[i].directLaborCost) +
                                  Number(calculateResults[i].inspectionCost)
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

                      const isToolingNeedToRun = calculateResults.some((result) => result.newToolingRequired);
                      calculateResults = this._manufacturingConfig.clearLookupTables(calculateResults);
                      recalcContext = new ReCalculateContext();
                      recalcContext.calculateResults = calculateResults;
                      recalcContext.materialInfoList = materialInfoList;
                      recalcContext.currentPart = currentPart;
                      recalcContext.automationProcessCount = automationProcessCount;
                      recalcContext.selectedProcessInfoId = selectedProcessInfoId;
                      recalcContext.formIdentifier = formIdentifier;
                      recalcContext.selectedProcess = selectedProcess;
                      recalcContext.dirtyFields = dirtyFields;
                      recalcContext.laborRate = laborRate;
                      recalcContext.isToolingNeedToRun = isToolingNeedToRun;
                      return recalcContext;
                    })
                  );
                }
                recalcContext = new ReCalculateContext();
                recalcContext.calculateResults = [processInfo];
                recalcContext.materialInfoList = materialInfoList;
                recalcContext.currentPart = currentPart;
                recalcContext.automationProcessCount = automationProcessCount;
                recalcContext.selectedProcessInfoId = selectedProcessInfoId;
                recalcContext.formIdentifier = formIdentifier;
                recalcContext.selectedProcess = selectedProcess;
                recalcContext.dirtyFields = dirtyFields;
                recalcContext.laborRate = laborRate;
                recalcContext.isToolingNeedToRun = false;
                return of(recalcContext).pipe(take(1));
              }
            }
          }
          recalcContext = new ReCalculateContext();
          recalcContext.calculateResults = [processInfo];
          recalcContext.materialInfoList = materialInfoList;
          recalcContext.currentPart = currentPart;
          recalcContext.automationProcessCount = automationProcessCount;
          recalcContext.selectedProcessInfoId = selectedProcessInfoId;
          recalcContext.formIdentifier = formIdentifier;
          recalcContext.selectedProcess = manufacturingObj;
          recalcContext.dirtyFields = dirtyFields;
          recalcContext.laborRate = laborRate;
          recalcContext.isToolingNeedToRun = false;
          return of(recalcContext).pipe(take(1));
          // })
        })
      );
    };

    const allProcessObservables = processList.map((p) => processToObservable(p));
    return forkJoin(allProcessObservables).pipe(
      map((results) => results.filter((r) => r !== null)),
      finalize(() => {
        console.log('Process recalculationforkJoin completed');
      })
    );
  }

  addProcessToRecalculatedList(
    processResult: ProcessInfoDto,
    totProcessList: ProcessInfoDto[],
    processInfoId: number,
    toolingEntryData: any,
    selectedProcess: ProcessInfoDto,
    dirtyFields: FieldColorsDto[],
    laborRate: LaborRateMasterDto[],
    currentPart: PartInfoDto
  ): Observable<boolean> {
    if (!processResult) {
      return of(false);
    }

    this.commodity.isInjMoulding = currentPart?.commodityId === CommodityType.PlasticAndRubber;
    this.commodity.isSheetMetal = currentPart?.commodityId === CommodityType.SheetMetal;
    this.commodity.isCasting = currentPart?.commodityId === CommodityType.Casting;

    processResult.subProcessFormArray = null;
    if (toolingEntryData) {
      return this.toolingRecalculationService
        .automationForToolingEntry(
          toolingEntryData.processInfo.materialInfoList[0],
          toolingEntryData.processInfo,
          toolingEntryData.laborRate,
          toolingEntryData.toolNameId,
          toolingEntryData.currentPart,
          this.ToolingMasterData,
          this.countryList,
          this.commodity,
          this.conversionValue,
          this.isEnableUnitConversion
        )
        .pipe(
          tap((result) => {
            processResult.costTooling = result.costTooling;
            processResult.costTooling.processInfoId = processInfoId;

            totProcessList.push(processResult);

            this.costManufacturingAutomationService.saveRecalculateResult(
              totProcessList,
              processResult.materialInfoList,
              toolingEntryData.currentPart,
              this.automationProcessCount,
              this.selectedProcessInfoId,
              this.formIdentifier,
              selectedProcess,
              dirtyFields,
              laborRate
            );
          }),
          map(() => true),
          catchError((error) => {
            console.error('addProcessToRecalculatedList tooling error', error);
            return of(false);
          })
        );
    }
    processResult.processInfoId = processInfoId;
    totProcessList.push(processResult);
    return of(true);
  }

  // updateSelectedProcess({ selectedProcessInfoId, formIdentifier }: { selectedProcessInfoId: number; formIdentifier: CommentFieldFormIdentifierModel }) {
  //   // this.selectedProcessInfoId = selectedProcessInfoId;
  //   // this.formIdentifier = formIdentifier;
  //   this.automationResultEvent.next({ selectedProcessInfoId, formIdentifier });
  // }
}
