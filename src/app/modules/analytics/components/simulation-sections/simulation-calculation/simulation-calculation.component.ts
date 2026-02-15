import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable, Subject, forkJoin, Subscription, combineLatest, of } from 'rxjs';
import { switchMap, map, takeUntil, tap, take, catchError, finalize, filter } from 'rxjs/operators';
import {
  CountryDataMasterDto,
  MaterialInfoDto,
  MaterialMasterDto,
  PartInfoDto,
  ProcessInfoDto,
  ProjectInfoDto,
  SimulationEmit,
  SimulationForm,
  SimulationFormPart,
  VendorDto,
  BuLocationDto,
  StockFormDto,
  CountryFormMatrixDto,
  ReCalculateContext,
} from 'src/app/shared/models';
import { BlockUiService, MaterialInfoService, MaterialMasterService, MedbMasterService, OverHeadProfitMasterService, ProcessInfoService } from 'src/app/shared/services';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MaterialCalculatorService } from 'src/app/modules/costing/services/material-calculator.service';
import { LaborService } from 'src/app/shared/services/labor.service';
import { MachiningTypes, ScreeName } from 'src/app/modules/costing/costing.config';
import { ManufacturingCalculatorService } from 'src/app/modules/costing/services/manufacturing-calculator.service';
import { CostToolingService } from 'src/app/shared/services/cost-tooling.service';
import { HandlingTime, LaserCuttingTime, StrokeRate, StrokeRateManual, ToolLoadingTime } from 'src/app/shared/models/sheet-metal-lookup.model';
import { LaserCuttingState } from 'src/app/modules/_state/laser-cutting-lookup.state';
import { ToolingRefLookup, CostToolingDto } from 'src/app/shared/models/tooling.model';
import { ToolingCalculatorService } from 'src/app/modules/costing/services/tooling-calculator.service';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
import { ToolingLookupState } from 'src/app/modules/_state/tooling-lookup.state';
import { BestProcessTotalCostDto, ListSimulationTotalCostDto, SimulationTotalCostDto } from '../../../models/simulationTotalCostDto.model';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { DrillingCuttingSpeedState } from 'src/app/modules/_state/machining-drilling-lookup.state';
import { DrillingCutting } from 'src/app/shared/models/drilling-cutting.model';
import { PartingCuttingSpeedState } from 'src/app/modules/_state/machining-parting-cuttingspeed.state';
import { HandlingTimeState } from 'src/app/modules/_state/sheetmetal-handling-time-lookup.state';
import { ToolLoadingTimeState } from 'src/app/modules/_state/sheetmetal-tool-loadingtime.state';
import { StrokeRateState } from 'src/app/modules/_state/sheetmetal-stroke-rate.state';
import { StrokeRateManualState } from 'src/app/modules/_state/sheetmetal-stroke-rate-manual.state';
import { FacingState } from 'src/app/modules/_state/machining-facing-info.state';
import { TurningState } from 'src/app/modules/_state/machining-turning-info.state';
// import { GroovingState } from 'src/app/modules/_state/machining-grooving-lookup.state';
import { FaceMillingState } from 'src/app/modules/_state/machining-face-milling.state';
import { SlotState } from 'src/app/modules/_state/machining-slot-milling.state';
import { GetForgingState } from 'src/app/modules/_state/forging-lookup-state';
import { GetMigDataState } from 'src/app/modules/_state/machining-getmig-lookup.state';
// import { GearCuttingState } from 'src/app/modules/_state/machining-gearcutting.state';
import { EndMillingState } from 'src/app/modules/_state/machining-end-milling.state';
import { GrindingState } from 'src/app/modules/_state/machining-grinding.state';
import { PartingCuttingDto } from 'src/app/shared/models/parting-cutting.modal';
import { TurningInfoDto } from 'src/app/shared/models/turning-info.model';
import { FacingDto } from 'src/app/shared/models/facing-info.model';
// import { GroovingLookupDto } from 'src/app/shared/models/grooving-lookup.model';
import { Milling } from 'src/app/shared/models/machining-milling.model';
import { SlotMilling } from 'src/app/shared/models/machining-slotmilling.model';
import { EndMilling } from 'src/app/shared/models/machining-end-milling.model';
// import { GearCutting } from 'src/app/shared/models/machining-gearcutting.model';
import { ForgingLookupDto } from 'src/app/shared/models/forging.model';
import { MigWeldingLookupDto } from 'src/app/shared/models/migLookup.model';
import { Grinding } from 'src/app/shared/models/machining-grinding.model';
import { PackagingInfoDto, MaterialPriceDto, AdditionalPackagingDto } from '../../../../../shared/models/packaging-info.model';
import { GetMaterialPriceByCountryModel, PackagingSimulationModel } from '../../../../../shared/models/simulation/packaging-simulation.model';
import { PackagingInfoService, ProtectivePkgTypes } from '../../../../../shared/services/packaging-info.service';
import { CostOverHeadProfitDto, MedbFgiccMasterDto, MedbIccMasterDto, MedbOverHeadProfitDto, MedbPaymentMasterDto } from '../../../../../shared/models/overhead-Profit.model';
import { CostingOverheadProfitCalculatorService } from '../../../../costing/services/costing-overhead-profit-calculator.service';
import { CostSummaryService, ProjectInfoService } from '../../../../../shared/services';
import { ViewCostSummaryDto } from '../../../../../shared/models';
import { CostingPackagingInformationCalculatorService } from '../../../../costing/services/costing-packaging-information-calculator.service';
import { FgiccState } from 'src/app/modules/_state/fgicc.state';
import { IccState } from 'src/app/modules/_state/icc.state';
import { MedbOhpState } from 'src/app/modules/_state/medbOHP.state';
import { MedbPaymentMasterState } from 'src/app/modules/_state/medb-payment-master.state';
import * as MasterDataActions from 'src/app/modules/_actions/master-data.action';
import { LogisticsSummaryCalculatorService } from 'src/app/modules/costing/services/logistics-summary-calculator.service';
import { SupplierBuLocationState } from 'src/app/modules/_state/supplier-bu-location.state';
import { PartModel } from '../../../models/part-model';
import { LogisticsSummaryService } from 'src/app/shared/services/logistics-summary.service';
import { LogisticsRateCard, LogisticsSummaryDto } from 'src/app/shared/models/logistics-summary.model';
import { LogisticsSummaryState } from 'src/app/modules/_state/logistics-summary.state';
import { ContainerSize } from 'src/app/shared/models/container-size.model';
import * as LogisticsSummaryActions from 'src/app/modules/_actions/logistics-summary.action';
import { BuLocationService } from 'src/app/modules/data/Service/bu-location.service';
import { VendorService } from 'src/app/modules/data/Service/vendor.service';
import * as SimulationDataActions from 'src/app/modules/_actions/simulation.action';
import { SimulationState } from 'src/app/modules/_state/simulation.state';
import { PageEnum, InjectionMouldingTool, SheetMetalTools } from 'src/app/shared/enums';
import { MaterialPlatingCalculatorService } from 'src/app/modules/costing/services/material-plating-calculator.service';
import { ManufacturingPlatingCalculatorService } from 'src/app/modules/costing/services/manufacturing-plating-calculator.service';
import { MaterialCastingCalculatorService } from 'src/app/modules/costing/services/material-casting-calculator.service';
import { ManufacturingCastingCalculatorService } from 'src/app/modules/costing/services/manufacturing-casting-calculator.service';
import { ToolingCountryData } from 'src/app/shared/models/tooling-master-data';
import { MaterialStockMachiningCalculatorService } from 'src/app/modules/costing/services/material-stock-machining-calculator.service';
import { ManufacturingMachiningCalculatorService } from 'src/app/modules/costing/services/manufacturing-machining-calculator.service';
import { PlasticRubberProcessCalculatorService } from 'src/app/modules/costing/services/plastic-rubber-process-calculator.service';
import { WeldingCalculatorService } from 'src/app/modules/costing/services/manufacturing-welding-calculator.service';
import { ManufacturingForgingCalculatorService } from 'src/app/modules/costing/services/manufacturing-forging-calculator.service';
import { ManufacturingMachiningConfigService } from 'src/app/shared/config/manufacturing-machining-config';
import { Boring } from 'src/app/shared/models/machining-boring.model';
import { BoringState } from 'src/app/modules/_state/machining-boring.state';
import { ManufacturingConfigService } from 'src/app/shared/config/cost-manufacturing-config';
import { SecondaryProcessCalculatorService } from 'src/app/modules/costing/services/manufacturing-secondary-process.service';
import { MaterialSecondaryProcessCalculatorService } from 'src/app/modules/costing/services/material-secondary-process.service';
import { SheetMetalProcessCalculatorService } from 'src/app/modules/costing/services/manufacturing-sheetmetal-calculator.service';
import { CommonModule } from '@angular/common';
import { DigitalFactoryDtoNew } from 'src/app/modules/digital-factory/Models/digital-factory-dto';
import { StockFormsState } from 'src/app/modules/_state/stock-forms.state';
import { CountryFormMatrixState } from 'src/app/modules/_state/country-form-matrix-state';
import { CostMaterialMappingService } from 'src/app/shared/mapping/cost-material-mapping.service';
import { MaterialCustomCableCalculatorService } from 'src/app/modules/costing/services/material-custom-cable-calculator.service';
import { MaterialCalculationByCommodityFactory } from 'src/app/modules/costing/services/MaterialCalculationByCommodityFactory';
import { IMaterialCalculationByCommodity } from 'src/app/modules/costing/services/IMaterialCalculationByCommodity';
import { CostManufacturingRecalculationService } from 'src/app/modules/costing/services/recalculation/cost-manufacturing-recalculation.service';
import { CommentFieldFormIdentifierModel } from 'src/app/shared/models/comment-field-model';
import { MaterialSustainabilityCalculationService } from 'src/app/modules/costing/services/material-sustainability-calculator.service';
import { CostingToolingRecalculationService } from 'src/app/modules/costing/services/recalculation/costing-tooling-recalculation.service';
import { CostPackagingingRecalculationService } from 'src/app/modules/costing/services/recalculation/cost-packaging-recalculation.service';
import { CostOverheadProfitRecalculationService } from 'src/app/modules/costing/services/recalculation/cost-overhead-profit-recalculation.service';

@Component({
  selector: 'app-simulation-calculation',
  templateUrl: './simulation-calculation.component.html',
  styleUrls: ['./simulation-calculation.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class SimulationCalculationComponent implements OnInit, OnDestroy {
  public screenHeight: number;
  public materialList: MaterialInfoDto[] = [];
  // public sandForCoreFormArray: FormArray;
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  public toolingMasterData: ToolingCountryData[] = [];
  public selectedCountries: CountryDataMasterDto[] = new Array<CountryDataMasterDto>();
  public countryList: CountryDataMasterDto[] = [];
  public materialDescriptionList: MaterialMasterDto[] = [];
  public laserCutttingTimeList: LaserCuttingTime[] = [];
  private finalResult: SimulationTotalCostDto[] = [];
  public simulationResult: SimulationTotalCostDto[] = [];
  public toolingIMLookupList: ToolingRefLookup[] = [];
  public toolingFormingLookupList: ToolingRefLookup[] = [];
  public toolingBendingLookupList: ToolingRefLookup[] = [];
  public toolingCuttingLookupList: ToolingRefLookup[] = [];
  public vendorLocation: VendorDto[] = [];
  public buLocation: BuLocationDto[] = [];
  public containerSize: ContainerSize[] = [];
  public partingCuttingSpeedList: PartingCuttingDto[];
  public handlingTimeList: HandlingTime[] = [];
  public toolLoadingTimeList: ToolLoadingTime[] = [];
  public strokeRateList: StrokeRate[] = [];
  public strokeRateManualList: StrokeRateManual[] = [];
  public turningLookupList: TurningInfoDto[] = [];
  public millingLookupList: Milling[] = [];
  public drillingCuttingSpeedList: DrillingCutting[];
  public boringLookupList: Boring[] = [];
  public GrindingLookupList: Grinding[] = [];
  // public GearCuttingLookupList: GearCutting[] = [];
  public facingLookupList: FacingDto[] = [];
  // public groovingLookupList: GroovingLookupDto[] = [];
  public SlotMillingLookupList: any[] = [];
  public endMillingLookupList: any[] = [];
  public MigLookupList: MigWeldingLookupDto[] = [];
  public forgingLookupList: ForgingLookupDto[] = [];
  public packagingInfoDto: PackagingInfoDto;
  public fieldcolor: FieldColorsDto[] = [];
  public overheadDirtFields: FieldColorsDto[] = [];
  private unsubscribeMasterData$: Subscription;
  public medbFgiccMasterList: MedbFgiccMasterDto | undefined;
  public medbIccMasterList: MedbIccMasterDto | undefined;
  public medbMohList: MedbOverHeadProfitDto | undefined;
  public medbFohList: MedbOverHeadProfitDto | undefined;
  public medbSgaList: MedbOverHeadProfitDto | undefined;
  public medbProfitList: MedbOverHeadProfitDto | undefined;
  public medbPaymentList: MedbPaymentMasterDto | undefined;
  public resultPackaging: PackagingSimulationModel[] = [];
  public getProjectDetailById: any;
  public totalBoxCostPerShipment: number = 0;
  public totalESGImpactperPart: number = 0;
  public ohpCost: number = 0;
  public totalShipmentCost: number;
  public costSummaryViewData: ViewCostSummaryDto;
  public overheadprofit: any[] = [];
  public overheadAndProfitData: CostOverHeadProfitDto;
  public projectInfoList: ProjectInfoDto[];

  _fgicc$: Observable<MedbFgiccMasterDto[]>;
  _icc$: Observable<MedbIccMasterDto[]>;
  _medbohp$: Observable<MedbOverHeadProfitDto[]>;
  _paymentmaster$: Observable<MedbPaymentMasterDto[]>;
  _laserCuttting$: Observable<LaserCuttingTime[]>;
  _lookup$: Observable<ToolingRefLookup[]>;
  _partingCuttingSpeed$: Observable<PartingCuttingDto[]>;
  _handlingTime$: Observable<HandlingTime[]>;
  _toolLoadTime$: Observable<ToolLoadingTime[]>;
  _strokeRates$: Observable<StrokeRate[]>;
  _strokeRatesManual$: Observable<StrokeRateManual[]>;
  _turningLookup$: Observable<TurningInfoDto[]>;
  _milling$: Observable<Milling[]>;
  _drillingCuttingSpeed$: Observable<DrillingCutting[]>;
  _boringLookup$: Observable<Boring[]>;
  _grindingLookup$: Observable<Grinding[]>;
  _facingLookup$: Observable<FacingDto[]>;
  // _groovingLookup$: Observable<GroovingLookupDto[]>;
  _slotMilling$: Observable<SlotMilling[]>;
  _endMilling$: Observable<EndMilling[]>;
  _getMigLookup$: Observable<MigWeldingLookupDto[]>;
  _getForgingLookup$: Observable<ForgingLookupDto[]>;
  _buLocationList$: Observable<BuLocationDto[]>;
  _containerSize$: Observable<ContainerSize[]>;
  _regionPreviousResult$: Observable<SimulationTotalCostDto[]>;
  _processPreviousResult$: Observable<BestProcessTotalCostDto[]>;
  _supplierList$: Observable<DigitalFactoryDtoNew[]>;
  formIdentifier: CommentFieldFormIdentifierModel = {
    partInfoId: 0,
    screenId: ScreeName.Manufacturing,
    primaryId: 0,
    secondaryID: 0,
  };

  private materialInfo = {
    weight: 0,
    scrapPrice: 0,
    totalCost: 0,
  };

  public completionStatus = {
    materialSection: false,
    Manufacturing: false,
    Tooling: false,
    packaging: false,
    OverheadProfit: false,
    logistics: false,
  };

  private sectionCount = {
    material: 0,
    manufacturing: 0,
    tooling: 0,
    packaging: 0,
    overheadProfit: 0,
    logistics: 0,
  };

  private sectionMaxCount = {
    material: 0,
    manufacturing: 0,
    tooling: 0,
    packaging: 0,
    overheadProfit: 0,
    logistics: 0,
  };

  public machining = {
    isRod: false,
    isTube: false,
    isSquareBar: false,
    isRectangularBar: false,
    isHexagonalBar: false,
    isBlock: false,
    isWire: false,
    isOtherShapes: false,
  };

  public totmaterialList: MaterialInfoDto[] = [];
  public totProcessList: ProcessInfoDto[] = [];
  public toolingTotalCost: any[] = [];
  public toolingAmortizationCost: any[] = [];
  public OHPTotalCost: any[] = [];
  public packagingTotalCost: any[] = [];
  public logisticsTotalCost: any[] = [];

  public pageEnum = PageEnum;
  @Input() page: PageEnum;
  @Output() simulationFormDataEmit = new EventEmitter<SimulationForm>();
  @Output() simulationResultEmit = new EventEmitter<SimulationTotalCostDto[]>();
  @Output() totProcessListEmit = new EventEmitter<BestProcessTotalCostDto[]>();
  public IsNoBakeCasting = false;
  public IsInvestmentCasting = false;
  public IsGreenCastingAuto = false;
  public IsGreenCastingSemiAuto = false;
  public IsGreenCasting = false;
  public IsHPDCCasting = false;
  public IsGDCCasting = false;
  stockFormDtos: StockFormDto[] = [];
  countryFormMatixDtos: CountryFormMatrixDto[] = [];
  private _materialCommodityService: IMaterialCalculationByCommodity = null;
  _stockFormData$: Observable<StockFormDto[]> = this._store.select(StockFormsState.getStockForms);
  _countryFormMatrixData$: Observable<CountryFormMatrixDto[]> = this._store.select(CountryFormMatrixState.getCountryFormMatrixs);
  private defaultValues = this._manufacturingConfig.defaultValues;
  MachiningFlags = this._manufacturingConfig._machining.getMachiningFlags();
  materialmasterDatas: MaterialMasterDto[] = [];

  constructor(
    private _fb: FormBuilder,
    private _materialService: MaterialInfoService,
    private materialMasterService: MaterialMasterService,
    public sharedService: SharedService,
    private _materialSimulationService: MaterialCalculatorService,
    private _materialPlatingCalcService: MaterialPlatingCalculatorService,
    private _materialCastingCalcService: MaterialCastingCalculatorService,
    private _materialMachiningCalcService: MaterialStockMachiningCalculatorService,
    private materialMapper: CostMaterialMappingService,
    private _processService: ProcessInfoService,
    private laborService: LaborService,
    private medbMasterService: MedbMasterService,
    private _blockUiService: BlockUiService,
    private _processSimulationService: ManufacturingCalculatorService,
    private _manufacturingForgingCalService: ManufacturingForgingCalculatorService,
    private _manufacturingPlatingCalcService: ManufacturingPlatingCalculatorService,
    private _manufacturingCastingCalcService: ManufacturingCastingCalculatorService,
    private _manufacturingMachiningCalcService: ManufacturingMachiningCalculatorService,
    private _toolingService: CostToolingService,
    private formbuilder: FormBuilder,
    private _toolingCalculator: ToolingCalculatorService,
    private messaging: MessagingService,
    private _toolConfig: ToolingConfigService,
    private _costingOverheadProfitCalculatorService: CostingOverheadProfitCalculatorService,
    private _CostSummaryService: CostSummaryService,
    private _PackagingInfoService: PackagingInfoService,
    private _costingPackagingICalc: CostingPackagingInformationCalculatorService,
    private _projectInfoService: ProjectInfoService,
    private PackgSvc: PackagingInfoService,
    private _store: Store,
    private logisticsSummaryCalculatorService: LogisticsSummaryCalculatorService,
    private logisticsSummaryService: LogisticsSummaryService,
    private _buLocationService: BuLocationService, // do not delete (used dynamically in ngOnInit)
    private _vendorService: VendorService, // do not delete (used dynamically in ngOnInit)
    private _overheadProfitService: OverHeadProfitMasterService,
    private _plasticRubberService: PlasticRubberProcessCalculatorService,
    private _weldingService: WeldingCalculatorService,
    private machiningConfig: ManufacturingMachiningConfigService,
    private _manufacturingConfig: ManufacturingConfigService,
    private _secondaryService: SecondaryProcessCalculatorService,
    private _assemblyService: MaterialSecondaryProcessCalculatorService,
    private _sheetMetalService: SheetMetalProcessCalculatorService,
    private _customCableCalculatorService: MaterialCustomCableCalculatorService,
    private _materialFactory: MaterialCalculationByCommodityFactory,
    private costManufacturingRecalculationService: CostManufacturingRecalculationService,
    public _materialSustainabilityCalcService: MaterialSustainabilityCalculationService,
    private costingToolingRecalculationService: CostingToolingRecalculationService,
    private costPackagingRecalculationService: CostPackagingingRecalculationService,
    private costOverheadRecalculationService: CostOverheadProfitRecalculationService
  ) {
    this._fgicc$ = this._store.select(FgiccState.getMedbFgiccData);
    this._icc$ = this._store.select(IccState.getMedbIccData);
    this._medbohp$ = this._store.select(MedbOhpState.getMedbOverHeadProfitData);
    this._paymentmaster$ = this._store.select(MedbPaymentMasterState.getMedbPaymentData);
    this._laserCuttting$ = this._store.select(LaserCuttingState.getLaserCutting);
    this._lookup$ = this._store.select(ToolingLookupState.getToolingLookup);
    this._partingCuttingSpeed$ = this._store.select(PartingCuttingSpeedState.getPartingCuttingSpeed);
    this._handlingTime$ = this._store.select(HandlingTimeState.getHandlingTime);
    this._toolLoadTime$ = this._store.select(ToolLoadingTimeState.getToolLoadingTime);
    this._strokeRates$ = this._store.select(StrokeRateState.getStrokeRate);
    this._strokeRatesManual$ = this._store.select(StrokeRateManualState.getStrokeRateManual);
    this._turningLookup$ = this._store.select(TurningState.getTurningLookup);
    this._milling$ = this._store.select(FaceMillingState.getFaceMillingLookup);
    this._drillingCuttingSpeed$ = this._store.select(DrillingCuttingSpeedState.getDrillingCuttingSpeed);
    this._boringLookup$ = this._store.select(BoringState.getBoringLookup);
    this._grindingLookup$ = this._store.select(GrindingState.getGrindingLookup);
    this._facingLookup$ = this._store.select(FacingState.getFacingLookup);
    // this._groovingLookup$ = this._store.select(GroovingState.getGroovingLookup);
    this._slotMilling$ = this._store.select(SlotState.getSlotLookup);
    this._endMilling$ = this._store.select(EndMillingState.getEndMillingLookup);
    this._getMigLookup$ = this._store.select(GetMigDataState.getMigLookup);
    this._getForgingLookup$ = this._store.select(GetForgingState.getForgingLookup);
    this._supplierList$ = this._store.select(SupplierBuLocationState.getSupplierList);
    this._buLocationList$ = this._store.select(SupplierBuLocationState.getBuLocationList);
    this._containerSize$ = this._store.select(LogisticsSummaryState.getContainerSize);
    this._regionPreviousResult$ = this._store.select(SimulationState.getSimulationResult);
    this._processPreviousResult$ = this._store.select(SimulationState.getTotProcessList);
    this._stockFormData$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: StockFormDto[]) => {
      if (result) {
        this.stockFormDtos = result;
      }
    });
    this._countryFormMatrixData$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: CountryFormMatrixDto[]) => {
      if (result && result.length > 0) {
        this.countryFormMatixDtos = result;
      }
    });
  }

  ngOnInit(): void {
    this._store.dispatch(new LogisticsSummaryActions.GetContainerSize());
    this._store.dispatch(new MasterDataActions.GetSupplierList());
    this._store.dispatch(new MasterDataActions.GetBuLocation());
    this.subscribeAssign('_vendorService.getVendorList', 'vendorLocation', 1);
    this.subscribeAssign('_supplierList$', 'vendorLocation', 1);
    this.subscribeAssign('_buLocationService.getBuLocation', 'buLocation', 0);
    this.subscribeAssign('_buLocationList$', 'buLocation', 0);
    this.subscribeAssign('_containerSize$', 'containerSize', 1);
    this.subscribeAssign('_laserCuttting$', 'laserCutttingTimeList', 1);
    this.subscribeAssign('_partingCuttingSpeed$', 'partingCuttingSpeedList', 1);
    this.subscribeAssign('_handlingTime$', 'handlingTimeList', 1);
    this.subscribeAssign('_toolLoadTime$', 'toolLoadingTimeList', 1);
    this.subscribeAssign('_strokeRates$', 'strokeRateList', 1);
    this.subscribeAssign('_strokeRatesManual$', 'strokeRateManualList', 1);
    this.subscribeAssign('_turningLookup$', 'turningLookupList', 1);
    this.subscribeAssign('_milling$', 'millingLookupList', 1);
    this.subscribeAssign('_drillingCuttingSpeed$', 'drillingCuttingSpeedList', 1);
    this.subscribeAssign('_boringLookup$', 'boringLookupList', 1);
    this.subscribeAssign('_grindingLookup$', 'GrindingLookupList', 1);
    // this.subscribeAssign('_gearCuttingLookup$', 'GearCuttingLookupList', 1);
    this.subscribeAssign('_facingLookup$', 'facingLookupList', 1);
    // this.subscribeAssign('_groovingLookup$', 'groovingLookupList', 1);
    this.subscribeAssign('_slotMilling$', 'SlotMillingLookupList', 1);
    this.subscribeAssign('_endMilling$', 'endMillingLookupList', 1);
    this.subscribeAssign('_getMigLookup$', 'MigLookupList', 1);
    this.subscribeAssign('_getForgingLookup$', 'forgingLookupList', 1);
    this.getToolingLookupValues();
  }

  private subscribeAssign(observer, assignee, minLength) {
    const observerArr = observer?.split('.');
    const observerObj = observerArr.length === 2 ? this[observerArr[0]][observerArr[1]]() : this[observerArr[0]];
    observerObj.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: any[]) => {
      if (result?.length >= minLength) {
        this[assignee] = result;
      }
    });
  }

  private getToolingLookupValues() {
    this._lookup$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: ToolingRefLookup[]) => {
      if (result?.length > 0) {
        this.toolingIMLookupList = result?.filter((x) => x.toolingRefType == InjectionMouldingTool.InjectionMoulding);
        this.toolingBendingLookupList = result?.filter((x) => x.toolingRefType == SheetMetalTools.SheetMetalBending);
        this.toolingCuttingLookupList = result?.filter((x) => x.toolingRefType == SheetMetalTools.SheetMetalCutting);
        this.toolingFormingLookupList = result?.filter((x) => x.toolingRefType == SheetMetalTools.SheetMetalForming);
      }
    });
  }

  public onMaterialTypeChange(materialTypeId: number) {
    if (materialTypeId) {
      // this._blockUiService.pushBlockUI('getmaterialsByMaterialTypeId');
      this.materialMasterService
        .getmaterialsByMaterialTypeId(materialTypeId)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: (result) => {
            // this._blockUiService.popBlockUI('getmaterialsByMaterialTypeId');
            this.materialDescriptionList = result;
          },
          error: () => {
            console.error();
          },
        });
    }
  }

  public getPrevioussimulationResult(data: { countryList: CountryDataMasterDto[]; projectInfoList: ProjectInfoDto[]; toolingMasterData: ToolingCountryData[] }) {
    this.countryList = data.countryList;
    this.projectInfoList = data.projectInfoList;
    this.toolingMasterData = data.toolingMasterData;
    // this._store.dispatch(new SimulationDataActions.GetPreviousSimulationResult());

    if (this.page === this.pageEnum.BestProcess) {
      this._processPreviousResult$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: BestProcessTotalCostDto[]) => {
        console.log('totProcessList got from the storage', result);
        if (result && result.length > 0) {
          this.setPreviousSelectedValue(result);
          this.totProcessListEmit.emit(result);
        }
      });
    } else if (this.page === this.pageEnum.BestRegion) {
      this._regionPreviousResult$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: SimulationTotalCostDto[]) => {
        if (result) {
          this.finalResult = result;
          if (this.finalResult && this.finalResult.length > 0) {
            this.totalUpdate();
            this.simulationResult = this.finalResult;
            this.setPreviousSelectedValue(this.simulationResult);
            this.simulationResultEmit.emit(this.simulationResult);
          }
        }
      });
    }
  }

  private setPreviousSelectedValue(result: any[]) {
    const partId = result[0].partInfoId;
    const projectInfoId = result[0].projectInfoId;
    const projectdetails = this.projectInfoList.find((x) => x.projectInfoId == projectInfoId);
    const part: SimulationFormPart = { projectInfoId, setValue: true, partId };
    setTimeout(() => {
      const processes = new Set<number>();
      this.selectedCountries = [];
      result.forEach((element) => {
        !processes.has(element.processId) && processes.add(element.processId);
        const country = this.countryList.find((x) => x.countryId == element.countryId);
        if (country) {
          country.selected = true;
          this.selectedCountries.push(country);
        }
      });
      this.selectedCountries = Array.from(new Set(this.selectedCountries)); // to remove duplicates
      const selectAll = this.selectedCountries?.length === this.countryList?.length;
      this.simulationFormDataEmit.emit({
        countries: this.selectedCountries,
        project: projectdetails,
        part,
        selectAll,
        processes: Array.from(processes),
      });
    }, 1000);
  }

  private resetCompletionFlags() {
    this.completionStatus.materialSection = false;
    this.completionStatus.Manufacturing = false;
    this.completionStatus.Tooling = false;
    this.completionStatus.packaging = false;
    this.completionStatus.OverheadProfit = false;
    this.completionStatus.logistics = false;

    this.sectionCount.material = 0;
    this.sectionCount.manufacturing = 0;
    this.sectionCount.tooling = 0;
    this.sectionCount.logistics = 0;
    this.sectionCount.overheadProfit = 0;
    this.sectionCount.packaging = 0;

    this.sectionMaxCount.material = 0;
    this.sectionMaxCount.manufacturing = 0;
    this.sectionMaxCount.tooling = 0;
    this.sectionMaxCount.logistics = 0;
    this.sectionMaxCount.overheadProfit = 0;
    this.sectionMaxCount.packaging = 0;
  }

  private checkCompletionStatus() {
    if (
      this.completionStatus.materialSection &&
      this.completionStatus.Manufacturing &&
      this.completionStatus.Tooling &&
      this.completionStatus.packaging &&
      this.completionStatus.OverheadProfit &&
      this.completionStatus.logistics
    ) {
      this.page === this.pageEnum.BestRegion && this.setResultData();
      this.page === this.pageEnum.BestProcess && this.setBestProcessResultData();
    }
  }

  private setResultData() {
    this.totalUpdate();
    this.simulationResult = this.finalResult;
    console.log(this.simulationResult);

    setTimeout(() => {
      this.simulationResultEmit.emit(this.simulationResult);
      console.log(this.simulationResult);
      const list = new ListSimulationTotalCostDto();
      list.SimulationTotalCostDtos = this.simulationResult;
      this._store.dispatch(new SimulationDataActions.UpdateSimulationResultStore(list, this.page));
    }, 2000);
  }

  private setBestProcessResultData() {
    const list = new ListSimulationTotalCostDto();
    list.bestProcessCostDtos = this.totProcessList.map((x) => {
      const m = this.totmaterialList.filter((y) => y.processId == x.processId && y.countryId == x.countryId)[0];
      const t = this.toolingTotalCost.filter((y) => y.processId == x.processId && y.countryId == x.countryId)[0];
      const a = this.toolingAmortizationCost.filter((y) => y.processId == x.processId && y.countryId == x.countryId)[0];
      const o = this.OHPTotalCost.filter((y) => y.processId == x.processId && y.countryId == x.countryId)[0];
      const p = this.packagingTotalCost.filter((y) => y.processId == x.processId && y.countryId == x.countryId)[0];
      const l = this.logisticsTotalCost.filter((y) => y.countryId == x.countryId)[0];

      return {
        partInfoId: x.partInfoId,
        projectInfoId: x.projectInfoId,
        countryId: x.countryId,
        countryName: x.countryName,
        processId: x.processId,
        processTypeId: x.processTypeID,
        processType: x.processType,
        processCost: x?.directProcessCost,
        processEsg: x?.esgImpactElectricityConsumption,
        materialCost: m?.netMatCost,
        materialEsg: m?.totalEsgImpactCO2Kg,
        toolingCost: t?.toolingCost,
        amortizationCost: a?.amorthizationCost,
        ohpCost: o?.ohpCost,
        packagingCost: p?.packagingCost,
        packagingEsg: p?.packagingEsg,
        logisticsCost: l?.logisticsCost,
        logisticsEsg: l?.logisticsEsg,
      };
    });
    console.log('Before storing', this.totProcessList);
    this.totProcessListEmit.emit(list.bestProcessCostDtos);
    this._store.dispatch(new SimulationDataActions.UpdateSimulationResultStore(list, this.page));
  }

  private getTotalCost(s: SimulationTotalCostDto): number {
    return (
      this.sharedService.isValidNumber(s.materialTotalCost) +
      this.sharedService.isValidNumber(s.processTotalCost) +
      this.sharedService.isValidNumber(s.toolingAmortizationCost) +
      this.sharedService.isValidNumber(s.secProcessTotalCost) +
      this.sharedService.isValidNumber(s.purchaseTotalCost) +
      this.sharedService.isValidNumber(s.packagingTotalCost) +
      this.sharedService.isValidNumber(s.logisticsTotalCost) +
      this.sharedService.isValidNumber(s.OHPTotalCost)
    );
  }

  private getTotalCostESG(s: SimulationTotalCostDto): number {
    return (
      this.sharedService.isValidNumber(s.totalESGManufacturing) +
      this.sharedService.isValidNumber(s.totalESGMaterial) +
      this.sharedService.isValidNumber(s.totalESGPackaging) +
      this.sharedService.isValidNumber(s.totalESGLogistics)
    );
  }

  private totalUpdate() {
    const finalResult = [];
    this.finalResult.forEach((s) => {
      finalResult.push({ ...s, totalCost: this.getTotalCost(s), totalCostESG: this.getTotalCostESG(s) });
    });
    this.finalResult = finalResult;
  }

  private getMarketQuarter(createDate) {
    const createdDate: Date = createDate && new Date(createDate);
    return `${createdDate?.getFullYear()}-${this._projectInfoService.getQuarter(createdDate?.getMonth())}F`;
  }

  private getMarketMonthByDate(createDate: Date) {
    const mon = (createDate.getMonth() + 1).toString().padStart(2, '0');
    const year = createDate.getFullYear();
    return mon + year.toString();
  }

  /** Simulation Run - Start */
  runSimulation2(selectedData: SimulationEmit): Observable<SimulationTotalCostDto[]> {
    this.packagingInfoDto = new PackagingInfoDto();
    this.fieldcolor = [];
    this.overheadDirtFields = [];
    this.getProjectDetailById = [];
    this.finalResult = [];
    this.simulationResult = [];
    const selectedPart = selectedData.selectedPart;
    const selectedProject = selectedData.selectedProject;
    this.selectedCountries = selectedData.selectedCountries;
    let marketMonth: string = selectedProject?.marketMonth;
    const marketQuarter = selectedProject?.marketQuarter;
    this.getCostSummaryDetails(selectedPart);
    if (!this.selectedCountries.length || !selectedPart || !selectedProject) {
      return of([]);
    }
    this.totmaterialList = [];
    this.totProcessList = [];
    this.resetCompletionFlags();
    if (!marketMonth) {
      if (marketQuarter) {
        marketMonth = this.sharedService.getMarketMonth(marketQuarter);
      } else {
        marketMonth = this.getMarketMonthByDate(new Date(selectedProject?.createDate));
      }
    }

    this._materialCommodityService = this._materialFactory.getCalculatorServiveByCommodity(selectedPart);
    const tasks = this.selectedCountries.map((country) => {
      const summary = new SimulationTotalCostDto();
      summary.countryId = country.countryId;
      summary.countryName = country.countryName;
      summary.projectInfoId = selectedProject.projectInfoId;
      summary.partInfoId = selectedPart.partInfoId;

      return this.runMaterialSimulation(selectedPart, country, marketMonth).pipe(
        take(1),
        switchMap((materialResult) => {
          console.log('Material tap hit:', country.countryName, materialResult);
          summary.materialTotalCost = materialResult.reduce((total, mat) => total + this.sharedService.isValidNumber(mat.netMatCost), 0);
          summary.totalESGMaterial = materialResult.reduce((total, mat) => total + this.sharedService.isValidNumber(mat.totalEsgImpactCO2Kg), 0);
          return this.runProcessSimulation(selectedPart, country, materialResult, marketMonth).pipe(
            take(1),
            switchMap((processResult) => {
              console.log('Process tap hit:', country.countryName, processResult);
              const processResultFlat = processResult.flatMap((x) => structuredClone(x.calculateResults));
              //const processResultFlat = processResult.map((x) => x.calculateResults).flat();
              summary.processTotalCost = processResultFlat.reduce((total, proc) => total + this.sharedService.isValidNumber(proc.directProcessCost), 0);
              summary.totalESGManufacturing = processResultFlat.reduce((total, proc) => total + this.sharedService.isValidNumber(proc.esgImpactAnnualKgCO2Part), 0);
              summary.totalCostESG += summary.totalESGManufacturing;
              if (processResult[0].isToolingNeedToRun) {
                return this.runToolingSimulation(
                  {
                    materialInfoList: processResult[0].materialInfoList,
                    calculateResults: processResultFlat,
                    currentPart: structuredClone(processResult[0].currentPart),
                    isToolingNeedToRun: processResult[0].isToolingNeedToRun,
                  },
                  marketMonth
                ).pipe(
                  take(1),
                  switchMap((toolingResult) => {
                    console.log('Tooling tap hit:', country.countryName, toolingResult);
                    summary.toolingTotalCost = toolingResult.reduce((total, tool) => total + this.sharedService.isValidNumber(tool.toolCostPerPart), 0);
                    summary.toolingAmortizationCost = summary.toolingTotalCost / toolingResult[0].toolLifeInParts;
                    return this.runOHP(structuredClone(processResult[0].currentPart)).pipe(
                      take(1),
                      switchMap((ohpResult) => {
                        console.log('OHP tap hit:', country.countryName, ohpResult);
                        summary.OHPTotalCost = ohpResult?.profitCost + ohpResult.mohCost + ohpResult.fohCost + ohpResult.sgaCost;
                        return this.runPackagingSimulation(
                          structuredClone(processResult[0].currentPart),
                          structuredClone(processResultFlat[0]),
                          structuredClone(processResult[0].materialInfoList[0])
                        ).pipe(
                          take(1),
                          map((pkgInfoState: PackagingInfoDto) => {
                            console.log('Package tap hit:', country.countryName, pkgInfoState);
                            summary.packagingTotalCost = pkgInfoState.adnlProtectPkgs.reduce((total, pkg) => total + pkg.costPerUnit, 0);
                            summary.totalESGPackaging = pkgInfoState?.totalESGImpactperPart || 0;
                            summary.totalCostESG += summary.totalESGPackaging;
                            return summary;
                          })
                        );
                      })
                    );
                  })
                );
              } else {
                //package
                return combineLatest([
                  this.runOHP(processResult[0].currentPart).pipe(take(1)),
                  this.runPackagingSimulation(processResult[0].currentPart, processResultFlat[0], processResult[0].materialInfoList[0]).pipe(take(1)),
                ]).pipe(
                  take(1),
                  map(([ohpResult, pkgInfoState]) => {
                    console.log('OHP Package tap hit:', country.countryName, ohpResult, pkgInfoState);
                    summary.packagingTotalCost = pkgInfoState.adnlProtectPkgs.reduce((total, pkg) => total + pkg.costPerUnit, 0);
                    // summary.packagingTotalCost = pkgInfoState?.totalPackagCostPerUnit || 0;
                    summary.totalESGPackaging = pkgInfoState?.totalESGImpactperPart || 0;
                    summary.OHPTotalCost = ohpResult?.profitCost + ohpResult.mohCost + ohpResult.fohCost + ohpResult.sgaCost;
                    return summary;
                  })
                );
              }
            })
          );
        }),
        finalize(() => {
          console.log('Task completed for:', country.countryName);
        })
      );
    });
    console.log('tasks.length', tasks.length);
    return forkJoin(tasks).pipe(
      tap((resultSummaries) => {
        this.finalResult = resultSummaries;
        console.log('ALL SIMULATIONS COMPLETED', this.finalResult);
      })
    );
  }
  runSimulation(selectedData: SimulationEmit): Observable<SimulationTotalCostDto[]> {
    const selectedPart = selectedData.selectedPart;
    const selectedProject = selectedData.selectedProject;
    this.selectedCountries = selectedData.selectedCountries;
    let marketMonth: string = selectedProject?.marketMonth;
    const marketQuarter = selectedProject?.marketQuarter;
    this.getCostSummaryDetails(selectedPart);
    if (!this.selectedCountries.length || !selectedPart || !selectedProject) {
      return of([]);
    }

    if (!marketMonth) {
      if (marketQuarter) {
        marketMonth = this.sharedService.getMarketMonth(marketQuarter);
      } else {
        marketMonth = this.getMarketMonthByDate(new Date(selectedProject?.createDate));
      }
    }

    this._materialCommodityService = this._materialFactory.getCalculatorServiveByCommodity(selectedPart);
    const tasks = this.selectedCountries.map((country) => {
      const countryObj = structuredClone(country);
      const currentPart = { ...structuredClone(selectedPart), mfrCountryId: countryObj.countryId };
      return this.runSimulationForCountry(countryObj, currentPart, structuredClone(selectedProject), marketMonth);
    });

    return forkJoin(tasks).pipe(
      tap((results) => {
        this.finalResult = results;
        console.log('ALL SIMULATIONS COMPLETED', results);
      })
    );
  }
  private runSimulationForCountry(country, selectedPart: PartInfoDto, selectedProject, marketMonth): Observable<SimulationTotalCostDto> {
    const summary = this.createSummary(country, selectedPart, selectedProject);
    return this.runMaterialSimulation(structuredClone(selectedPart), country, marketMonth).pipe(
      take(1),
      map((materialResult) => {
        this.populateMaterial(summary, materialResult);
        return structuredClone(materialResult);
      }),
      switchMap((materialResult) => this.runProcessSimulation(structuredClone(selectedPart), country, materialResult, marketMonth).pipe(take(1))),
      switchMap((processResult) => this.handleProcessAndNextSteps(summary, structuredClone(processResult), marketMonth).pipe(take(1)))
    );
  }
  private handleProcessAndNextSteps(summary: SimulationTotalCostDto, processResult, marketMonth): Observable<SimulationTotalCostDto> {
    const processFlat = processResult.flatMap((x) => structuredClone(x.calculateResults));
    console.log('Mallik 4001 before', summary.countryName, summary.mfrCountryId, summary.processTotalCost);
    summary.processTotalCost = processFlat.reduce((t, p) => t + this.sharedService.isValidNumber(p.directProcessCost), 0);
    summary.totalESGManufacturing = processFlat.reduce((t, p) => t + this.sharedService.isValidNumber(p.esgImpactAnnualKgCO2Part), 0);
    summary.totalCostESG = summary.totalESGMaterial + summary.totalESGManufacturing;
    console.log('Mallik 4001 after', summary.countryName, summary.mfrCountryId, summary.processTotalCost);
    console.log(
      'Mallik 5001 after',
      summary.countryName,
      summary.mfrCountryId,
      processFlat.reduce((t, p) => t + this.sharedService.isValidNumber(p.esgImpactAnnualKgCO2Part), 0)
    );
    //---------------------------------

    const safeCurrentPart = structuredClone(processResult[0].currentPart);
    const safeMaterialList = structuredClone(processResult[0].materialInfoList);

    return processResult[0].isToolingNeedToRun
      ? this.runWithTooling(summary, safeCurrentPart, safeMaterialList, processFlat, marketMonth).pipe(take(1))
      : this.runWithoutTooling(summary, safeCurrentPart, safeMaterialList, processFlat).pipe(take(1));
  }

  private runWithTooling(summary, currentPart, materialInfoList, processFlat, marketMonth): Observable<SimulationTotalCostDto> {
    return this.runToolingSimulation(
      {
        materialInfoList: structuredClone(materialInfoList),
        calculateResults: structuredClone(processFlat),
        currentPart: structuredClone(currentPart),
        isToolingNeedToRun: true,
      },
      marketMonth
    ).pipe(
      take(1),
      tap((toolingResult) => {
        console.log('Mallik 4002 before', summary.countryName, summary.mfrCountryId, summary.toolingTotalCost);
        summary.toolingTotalCost = toolingResult.reduce((t, tool) => t + this.sharedService.isValidNumber(tool.toolCostPerPart), 0);
        summary.toolingAmortizationCost = summary.toolingTotalCost / toolingResult[0].toolLifeInParts;
        console.log('Mallik 4002 after', summary.countryName, summary.mfrCountryId, summary.toolingTotalCost);
      }),

      switchMap(() => this.runOHP(structuredClone(currentPart)).pipe(take(1))),

      tap((ohp) => {
        summary.OHPTotalCost = ohp.profitCost + ohp.mohCost + ohp.fohCost + ohp.sgaCost;
      }),

      switchMap(() => this.runPackagingSimulation(structuredClone(currentPart), structuredClone(processFlat[0]), structuredClone(materialInfoList[0])).pipe(take(1))),
      map((pkg) => this.finalizePackaging(summary, pkg))
    );
  }
  private runWithoutTooling(summary, currentPart, materialInfoList, processFlat): Observable<SimulationTotalCostDto> {
    return combineLatest({
      ohp: this.runOHP(structuredClone(currentPart)).pipe(take(1)),
      pkg: this.runPackagingSimulation(structuredClone(currentPart), structuredClone(processFlat[0]), structuredClone(materialInfoList[0])).pipe(take(1)),
    }).pipe(
      take(1),
      map(({ ohp, pkg }) => {
        summary.OHPTotalCost = ohp.profitCost + ohp.mohCost + ohp.fohCost + ohp.sgaCost;
        console.log('Mallik 4004 after', summary.countryName, summary.mfrCountryId, summary.OHPTotalCost);
        return this.finalizePackaging(summary, pkg);
      })
    );
  }
  private finalizePackaging(summary: SimulationTotalCostDto, pkg: PackagingInfoDto): SimulationTotalCostDto {
    console.log('Mallik 4003 before', summary.countryName, summary.mfrCountryId, summary.packagingTotalCost);
    summary.packagingTotalCost = pkg?.adnlProtectPkgs.reduce((total, pkg) => total + pkg.costPerUnit, 0);
    summary.totalESGPackaging = pkg?.totalESGImpactperPart || 0;
    summary.totalCostESG += summary.totalESGPackaging;
    console.log('Mallik 4003 after', summary.countryName, summary.mfrCountryId, summary.packagingTotalCost);
    return summary;
  }

  private populateMaterial(summary: SimulationTotalCostDto, materialResult) {
    summary.materialTotalCost = materialResult.reduce((t, m) => t + this.sharedService.isValidNumber(m.netMatCost), 0);
    summary.totalESGMaterial = materialResult.reduce((t, m) => t + this.sharedService.isValidNumber(m.totalEsgImpactCO2Kg), 0);
  }

  private createSummary(country, selectedPart, selectedProject): SimulationTotalCostDto {
    const summary = new SimulationTotalCostDto();
    summary.countryId = country.countryId;
    summary.countryName = country.countryName;
    summary.projectInfoId = selectedProject.projectInfoId;
    summary.partInfoId = selectedPart.partInfoId;
    summary.mfrCountryId = selectedPart.mfrCountryId;
    return summary;
  }

  runMaterialSimulation(selectedPart: PartInfoDto, country: CountryDataMasterDto, marketMonth: string): Observable<MaterialInfoDto[]> {
    return this._materialService.getMaterialInfosByPartInfoId(selectedPart?.partInfoId).pipe(
      switchMap((materialList: MaterialInfoDto[]) => {
        if (!materialList || materialList.length === 0) {
          return of([new MaterialInfoDto()]).pipe(take(1));
        }
        const observables = materialList.map((selectedMaterial, idx) => {
          return this.sharedService.getColorInfos(selectedPart?.partInfoId, ScreeName.Material, selectedMaterial?.materialInfoId).pipe(
            take(1),
            switchMap((materialDirtyFields) => {
              const marketDataId = selectedMaterial?.materialMarketId;
              if (!marketDataId || marketDataId <= 0) {
                return of(new MaterialInfoDto());
              }
              return this.materialMasterService.getMaterialMasterByMaterialMarketDataId(marketDataId).pipe(
                take(1),
                switchMap((response) => {
                  const materialMaster = response?.materialMarketData?.materialMaster;
                  const materialMasterId = materialMaster?.materialMasterId || 0;
                  if (!materialMasterId) {
                    return of(new MaterialInfoDto());
                  }
                  if (materialMaster) {
                    this.materialmasterDatas.push(materialMaster);
                  }
                  // const marketMonth = this.getMarketMonthByDate(new Date(selectedProject?.createDate));

                  return this.materialMasterService.getMaterialMarketDataByMarketQuarter(country.countryId, materialMasterId, marketMonth).pipe(
                    take(1),
                    switchMap((marketData) => {
                      if (!materialMaster?.materialTypeId) {
                        return of(new MaterialInfoDto());
                      }
                      const typeId = materialMaster?.materialTypeId;
                      const materialGroupId = materialMaster?.materialType?.materialGroupId;

                      return this.materialMasterService.getmaterialsByMaterialTypeId(typeId).pipe(
                        take(1),
                        switchMap((materialDescriptionList) => {
                          const materialInfo: MaterialInfoDto = { ...selectedMaterial };
                          materialInfo.materialMasterId = materialMasterId;
                          materialInfo.materialFamily = typeId;
                          materialInfo.sandCost = this.sharedService.isValidNumber(materialMaster?.sandCost);
                          materialInfo.eav = selectedPart?.eav;
                          materialInfo.materialDescriptionList = materialDescriptionList;
                          materialInfo.materialGroupId = materialGroupId;
                          materialInfo.materialMarketData = marketData?.length > 0 ? marketData[0] : null;

                          if (marketData?.length > 0) {
                            const data = marketData[0];
                            materialInfo.materialMarketId = data.materialMarketId;
                            //materialInfo.totalEsgImpactCO2Kg = data?.esgImpactCO2Kg;
                            const stockForm = materialInfo?.stockForm;
                            if (stockForm) {
                              const stockFormId = this.stockFormDtos.find((x) => x.formName === stockForm)?.stockFormId;
                              const multiplier = this.countryFormMatixDtos.find((x) => x.countryId === selectedPart.mfrCountryId && x.stockFormId === stockFormId)?.multiplier || 1;
                              materialInfo.materialPricePerKg = data.price * multiplier;
                            } else {
                              materialInfo.materialPricePerKg = data.price;
                            }
                            materialInfo.scrapPricePerKg = data?.generalScrapPrice;
                            materialInfo.machiningScrapPrice = Number(data?.machineScrapPrice || 0);
                          }
                          materialInfo.machiningIsRod = selectedMaterial.processId == MachiningTypes.Rod;
                          materialInfo.machiningIsBlock = selectedMaterial.processId == MachiningTypes.Block;
                          materialInfo.machiningIsWire = selectedMaterial.processId == MachiningTypes.Wire;
                          materialInfo.machiningIsTube = selectedMaterial.processId == MachiningTypes.Tube;
                          materialInfo.machiningIsSquareBar = selectedMaterial.processId == MachiningTypes.SquareBar;
                          materialInfo.machiningIsRectangularBar = selectedMaterial.processId == MachiningTypes.RectangularBar;
                          materialInfo.machiningIsHexagonalBar = selectedMaterial.processId == MachiningTypes.HexagonalBar;
                          materialInfo.machiningIsOtherShapes = selectedMaterial.processId == MachiningTypes.OtherShapes;

                          materialInfo.countryId = country.countryId;
                          materialInfo.countryName = country.countryName;

                          if (selectedPart?.mfrCountryId != country.countryId) {
                            materialDirtyFields = [];
                          }
                          const calcResult = this._materialCommodityService.CalculateMaterialCost(materialInfo.processId, materialInfo, materialDirtyFields, selectedMaterial);
                          const result = this._materialSustainabilityCalcService.calculationsForMaterialSustainability(calcResult, materialDirtyFields, selectedMaterial);
                          return of(result).pipe(take(1));
                        })
                      );
                    })
                  );
                })
              );
            }),
            catchError((err) => {
              console.error(`✖ [${idx}] error in material observable:`, err);
              return of(null);
            })
          );
        });
        return forkJoin(observables).pipe(map((results) => results.filter((x) => x != null)));
      })
    );
  }

  runProcessSimulation(selectedPart: PartInfoDto, country: CountryDataMasterDto, materialInfoList: MaterialInfoDto[], marketMonth: string): Observable<ReCalculateContext[]> {
    const processIds = materialInfoList
      ?.filter((x) => x.processId)
      .map((x) => x.processId)
      .join(',');

    return combineLatest([
      this.laborService.getLaborRatesByCountry(country.countryId, marketMonth, country?.regionId).pipe(take(1)),
      this._processService.getProcessInfoByPartInfoId(selectedPart?.partInfoId).pipe(take(1)),
      this.medbMasterService.getProcessTypeList(processIds).pipe(take(1)),
      this.laborService.getLaborCountByCountry(country.countryId).pipe(take(1)),
    ]).pipe(
      take(1),
      switchMap(([laborRate, processList, processTypeOriginalList, laborCountByMachineType]) => {
        if (!laborRate || !processList?.length) {
          return of([]);
        }
        materialInfoList = [
          ...materialInfoList.filter((x) => !(this._manufacturingConfig.secondaryProcesses.includes(x.processId) || this._manufacturingConfig.weldingProcesses.includes(x.processId))),
          ...materialInfoList.filter((x) => this._manufacturingConfig.secondaryProcesses.includes(x.processId) || this._manufacturingConfig.weldingProcesses.includes(x.processId)),
        ];

        this.costManufacturingRecalculationService.setLookupLists({
          fieldColorsList: [],
          processTypeOrginalList: processTypeOriginalList,
        });

        return this.costManufacturingRecalculationService.recalculateExistingProcessCosts(
          selectedPart,
          materialInfoList,
          laborRate,
          processList,
          structuredClone(this.materialmasterDatas[0]),
          laborCountByMachineType,
          structuredClone(processList[0]),
          this._fb.array([]),
          this._fb.array([]),
          this._fb.group({}),
          processList[0].processInfoId,
          (this.formIdentifier = { ...this.formIdentifier, primaryId: processList[0].processInfoId }),
          this.defaultValues,
          this.MachiningFlags
        );
      })
    );
  }

  runToolingSimulation(info: any, marketMonth: string): Observable<CostToolingDto[]> {
    const changeFlags = { isSupplierCountryChanged: false, isCountryChanged: true, isToollifeChanged: false, lifeTimeRemainingChange: true, complexityChanged: false, surfaceFinishChanged: false };
    return this.costingToolingRecalculationService.recalculateToolingCost(info, marketMonth, null, changeFlags, null, null, null, null, null, null, null);
  }

  runOHP(currentPart: PartInfoDto): Observable<CostOverHeadProfitDto> {
    return this.costOverheadRecalculationService.getMasterData(currentPart).pipe(
      filter(Boolean),
      switchMap(() => this.costOverheadRecalculationService.recalculateOverHeadAndProfit(currentPart)),
      map((result) => result)
    );
  }

  overHeadProfitSimulationCall(
    dirtyFields: FieldColorsDto[],
    overheadInfo: CostOverHeadProfitDto,
    selectedPart: PartModel,
    summary: SimulationTotalCostDto,
    country: CountryDataMasterDto,
    costSummaryViewData: any,
    info: CostOverHeadProfitDto,
    partialMaterial: any
  ) {
    if (selectedPart?.mfrCountryId != country.countryId) {
      dirtyFields = [];
    }
    this.getMasterData(selectedPart, country.countryId);
    const percentageResult = this._costingOverheadProfitCalculatorService.calculateOverheadCost(
      costSummaryViewData,
      this.medbFgiccMasterList,
      this.medbIccMasterList,
      this.medbPaymentList,
      this.medbMohList,
      this.medbFohList,
      this.medbSgaList,
      this.medbProfitList,
      dirtyFields,
      overheadInfo,
      info
    );
    const annualVolume = selectedPart?.eav;
    const lotSize = annualVolume / 12;
    const costResult = this._costingOverheadProfitCalculatorService.getAndSetData(costSummaryViewData, annualVolume, lotSize, selectedPart?.paymentTermId, percentageResult, selectedPart?.commodityId);
    summary.OHPTotalCost = Number(costResult.OverheadandProfitAmount) + Number(costResult.profitCost) + Number(costResult.CostOfCapitalAmount);
    this.sectionCount.overheadProfit++;
    this.OHPTotalCost.push({ countryId: country.countryId, processId: partialMaterial.processId, ohpCost: summary.OHPTotalCost });

    console.log('totaloverheadcallcount' + this.sectionCount.overheadProfit);
    console.log('CountryName' + country.countryName);
    console.log('CountryID' + country.countryId);
    console.log('selectedcounties' + this.selectedCountries?.length);
    if (this.completionStatus.Tooling && this.sectionMaxCount.overheadProfit <= this.sectionCount.overheadProfit) {
      console.log('OverHeadCompleted');
      this.completionStatus.OverheadProfit = true;
      this.checkCompletionStatus();
    }
  }

  runPackagingSimulation(currentPart: PartInfoDto, processInfoDtoOut: ProcessInfoDto, materialInfo: MaterialInfoDto): Observable<PackagingInfoDto> {
    return this.PackgSvc.getPackagingDetails(currentPart?.partInfoId).pipe(
      take(1),
      switchMap((pkgInfoState: PackagingInfoDto) => {
        return this.costPackagingRecalculationService.recalculatePackagingCost(currentPart, processInfoDtoOut, materialInfo, pkgInfoState);
      })
    );
  }

  getpackagevalue(pakgInfo: PackagingInfoDto, res: MaterialPriceDto[], selectedPart: any, selectedMaterial: any, countryId: number, summary: SimulationTotalCostDto) {
    if (this.fieldcolor && this.fieldcolor.length > 0) {
      this.getPakagingDataSimulation(pakgInfo, res, selectedPart, selectedMaterial, countryId, summary, this.fieldcolor);
    } else {
      this.sharedService
        .getColorInfos(selectedPart?.partInfoId, ScreeName.Packaging, pakgInfo.packagingId)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe((dirtyFields: FieldColorsDto[]) => {
          this.fieldcolor = dirtyFields;
          this.getPakagingDataSimulation(pakgInfo, res, selectedPart, selectedMaterial, countryId, summary, dirtyFields);
        });
    }
  }

  getPakagingDataSimulation(
    pakgInfo: PackagingInfoDto,
    res: MaterialPriceDto[],
    selectedPart: any,
    selectedMaterial: any,
    countryId: number,
    summary: SimulationTotalCostDto,
    dirtyfield: FieldColorsDto[]
  ) {
    const returnData = new GetMaterialPriceByCountryModel();

    if (res?.length) {
      returnData.corrugatedBoxList = res.filter((x) => x.materialTypeName.toLowerCase().includes('carton')).sort((a, b) => a.price - b.price);

      returnData.palletList = res.filter((x) => x.materialTypeName.toLowerCase().includes('pallet')).sort((a, b) => a.price - b.price);

      const protectivePkgType = [...ProtectivePkgTypes].map((x) => x.toLowerCase());

      returnData.protectList = res.filter((item) => protectivePkgType.includes(item.materialDescription.toLowerCase())).sort((a, b) => a.price - b.price);
    }
    this.recalculatePackageForSimulation(pakgInfo, this.packagingInfoDto, selectedPart, selectedMaterial, summary, returnData, countryId, dirtyfield);
  }

  recalculatePackageForSimulation(
    pakgInfo: PackagingInfoDto,
    packagedbObj: PackagingInfoDto,
    currentPart: PartInfoDto,
    selectedMaterial: any,
    summary: SimulationTotalCostDto,
    masterlist: GetMaterialPriceByCountryModel,
    countryId: number,
    dirtyfield: FieldColorsDto[]
  ) {
    const { partInfoId, projectInfoId, eav, deliveryFrequency } = currentPart;
    pakgInfo.partInfoId = partInfoId;
    pakgInfo.projectInfoId = projectInfoId;
    pakgInfo.packagingId = packagedbObj?.packagingId;
    pakgInfo.eav = eav;
    pakgInfo.deliveryFrequency = deliveryFrequency;
    pakgInfo.materialInfo = selectedMaterial;
    pakgInfo.corrugatedBoxList = masterlist?.corrugatedBoxList;
    pakgInfo.palletList = masterlist.palletList;
    pakgInfo.protectList = masterlist?.protectList;
    pakgInfo.calcultionadnlProtectPkgs = this._fb.array([]) as FormArray;
    const adnlPkgs = packagedbObj?.adnlProtectPkgs;
    if (adnlPkgs?.length) {
      adnlPkgs.forEach((item) => {
        pakgInfo.calcultionadnlProtectPkgs.push(this.adnlProtPkgFormGroup(item));
      });
    } else {
      pakgInfo.calcultionadnlProtectPkgs.push(this.adnlProtPkgFormGroup());
    }

    let recalculate = false;
    if (currentPart?.mfrCountryId != countryId) {
      recalculate = true;
      dirtyfield = [];
    }
    const packgaeResult = this._costingPackagingICalc.calculationsForPackaging(pakgInfo, dirtyfield, packagedbObj, recalculate);
    // .pipe(takeUntil(this.unsubscribeAll$))
    // .subscribe((packgaeResult: PackagingInfoDto) => {
    if (packgaeResult) {
      summary.packagingTotalCost = packgaeResult?.totalPackagCostPerUnit || 0;
      summary.totalESGPackaging = Number(packgaeResult?.totalESGImpactperPart);
      this.sectionCount.packaging++;
      console.log('totalpackagecallcount' + this.sectionCount.packaging);
      console.log('selectedcounties' + this.selectedCountries?.length);
      this.packagingTotalCost.push({ countryId: countryId, processId: selectedMaterial.processId, packagingCost: summary.packagingTotalCost, packagingEsg: summary.totalESGPackaging });

      if (this.completionStatus.Manufacturing && this.sectionMaxCount.packaging <= this.sectionCount.packaging) {
        console.log('totalpackagecallcompleted');
        this.completionStatus.packaging = true;
        this.checkCompletionStatus();
      }
      this.runLogisticsSimulation(currentPart, this.materialList, countryId, summary, packgaeResult);
    } else {
      this.completionStatus.packaging = true;
      this.completionStatus.logistics = true;
      this.checkCompletionStatus();
    }
    // });
  }

  runLogisticsSimulation(part: any, materialList: MaterialInfoDto[], countryId: number, summary: SimulationTotalCostDto, packagingInfo: PackagingInfoDto) {
    const partInfo = part as PartInfoDto;
    let currentVendor: any, currentBuLocation: any;
    if (partInfo?.supplierInfoId) {
      currentVendor = this.vendorLocation.find((x) => x.id == partInfo?.supplierInfoId);
    }
    if (partInfo?.buId) {
      currentBuLocation = this.buLocation.find((x) => x.buId == partInfo?.buId);
    }

    this.logisticsSummaryService
      .getLogisticsSummary(partInfo.partInfoId)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((logisticSummary: LogisticsSummaryDto) => {
        if (logisticSummary) {
          const logistic: LogisticsSummaryDto = Object.assign({}, logisticSummary);
          if (logisticSummary?.costingLogisticsId > 0) {
            this.sharedService
              .getColorInfos(part?.partInfoId, ScreeName.Logistic, logisticSummary?.costingLogisticsId)
              .pipe(takeUntil(this.unsubscribeAll$))
              .subscribe((logisticDirtyFields: FieldColorsDto[]) => {
                if (part?.mfrCountryId != countryId) {
                  logisticDirtyFields = [];
                }
                this.logisticsSummaryService
                  .getLogisticsRateCards(countryId, partInfo?.deliveryCountryId)
                  .pipe(takeUntil(this.unsubscribeAll$))
                  .subscribe((rateCardResult: any) => {
                    if (rateCardResult && rateCardResult?.length > 0) {
                      const rateCards: LogisticsRateCard[] = rateCardResult;
                      const costResults = [];
                      let count = 0;

                      rateCards?.forEach((rate) => {
                        const containerTypeId = rate?.containerTypeId;
                        const shipmentTypeId = rate?.shipmentTypeId;
                        const modeOfTransportId = rate?.modeOfTransportTypeId;

                        this.logisticsSummaryCalculatorService
                          .getCostCalculation(
                            modeOfTransportId,
                            containerTypeId,
                            shipmentTypeId,
                            currentVendor,
                            currentBuLocation,
                            this.containerSize,
                            partInfo,
                            this.materialList,
                            countryId,
                            packagingInfo
                          )
                          .pipe(takeUntil(this.unsubscribeAll$))
                          .subscribe((costResult) => {
                            if (costResult) {
                              count++;
                              costResults.push(costResult);
                              if (count === rateCards?.length) {
                                const sortedArray: any[] = costResults?.filter((f) => f.totalCost > 0).sort((a, b) => a.freightCostPerShipment - b.freightCostPerShipment);
                                if (sortedArray?.length > 0) {
                                  const lowCostTransportMode: any = sortedArray[0];
                                  const lowCostTransport: LogisticsSummaryDto = new LogisticsSummaryDto();

                                  lowCostTransport.containerCost = lowCostTransportMode?.containerCost;
                                  lowCostTransport.containerPercent = lowCostTransportMode?.percentageOfShipment;
                                  lowCostTransport.freightCostPerShipment = lowCostTransportMode?.freightCostPerShipment;
                                  lowCostTransport.freightCost = lowCostTransportMode?.freightCostPerPart;
                                  const carbonFootPrintUnit = this.sharedService.isValidNumber(lowCostTransportMode.totalCo2 * (lowCostTransportMode.percentageOfShipment / 100));
                                  const partCo2 = this.sharedService.isValidNumber(carbonFootPrintUnit / lowCostTransportMode.partsPerShipment);
                                  lowCostTransport.carbonFootPrint = this.sharedService.isValidNumber(carbonFootPrintUnit);
                                  lowCostTransport.totalCarbonFootPrint = this.sharedService.isValidNumber(lowCostTransportMode.totalCo2);
                                  lowCostTransport.carbonFootPrintPerUnit = this.sharedService.isValidNumber(partCo2);

                                  lowCostTransport.modeOfTransport = this.sharedService.checkDirtyProperty('ModeOfTransport', logisticDirtyFields)
                                    ? logistic?.modeOfTransport
                                    : lowCostTransportMode?.modeOfTransportId;
                                  lowCostTransport.shipmentType = this.sharedService.checkDirtyProperty('ShipmentType', logisticDirtyFields)
                                    ? logistic?.shipmentType
                                    : lowCostTransportMode?.shipmentTypeId;
                                  lowCostTransport.containerType = this.sharedService.checkDirtyProperty('ContainerType', logisticDirtyFields)
                                    ? logistic?.containerType
                                    : lowCostTransportMode?.containerTypeId;
                                  lowCostTransport.currentPart = part;
                                  lowCostTransport.packagingInfo = packagingInfo;

                                  lowCostTransport.pickUpCost = Number(lowCostTransportMode?.sourceToPortCost);
                                  lowCostTransport.portCost = Number(lowCostTransportMode?.portCost);
                                  lowCostTransport.deliveryCost = Number(lowCostTransportMode?.portToDestinationCost);
                                  lowCostTransport.pickUpCo2 = Number(lowCostTransportMode?.pickUpCo2);
                                  lowCostTransport.portCo2 = Number(lowCostTransportMode?.co2);
                                  lowCostTransport.deliveryCo2 = Number(lowCostTransportMode?.deliveryCo2);

                                  this.logisticsSummaryCalculatorService
                                    .calculateLogisticsCost(lowCostTransport, logisticDirtyFields, logistic)
                                    .pipe(takeUntil(this.unsubscribeAll$))
                                    .subscribe((calculationResult: LogisticsSummaryDto) => {
                                      if (calculationResult) {
                                        summary.logisticsTotalCost = calculationResult.freightCost;
                                        summary.totalESGLogistics = Number(calculationResult?.carbonFootPrintPerUnit);
                                        summary.totalCostESG =
                                          Number(summary.totalESGManufacturing) + Number(summary.totalESGMaterial) + Number(summary.totalESGPackaging) + Number(summary.totalESGLogistics);
                                        this.totalESGImpactperPart = Number(calculationResult?.carbonFootPrintPerUnit);
                                        this.logisticsTotalCost.push({ countryId: countryId, logisticsCost: summary.logisticsTotalCost, logisticsEsg: summary.totalESGLogistics });
                                        this.sectionCount.logistics++;
                                        if (this.completionStatus.packaging && this.sectionMaxCount.logistics <= this.sectionCount.logistics) {
                                          this.completionStatus.logistics = true;
                                          this.checkCompletionStatus();
                                        }
                                      } else {
                                        this.completionStatus.logistics = true;
                                        this.checkCompletionStatus();
                                      }
                                    });
                                } else {
                                  this.completionStatus.logistics = true;
                                  this.checkCompletionStatus();
                                }
                              } else {
                                this.completionStatus.logistics = true;
                                this.checkCompletionStatus();
                              }
                            } else {
                              this.completionStatus.logistics = true;
                              this.checkCompletionStatus();
                            }
                          });
                      });
                    } else {
                      this.completionStatus.logistics = true;
                      this.checkCompletionStatus();
                    }
                  });
              });
          } else {
            this.completionStatus.logistics = true;
            this.checkCompletionStatus();
          }
        } else {
          this.completionStatus.logistics = true;
          this.checkCompletionStatus();
        }
      });
  }

  // runLogisticsSimulation(part: any, materialList: MaterialInfoDto[], countryId: number, summary: SimulationTotalCostDto, packagingInfo: PackagingInfoDto) {
  //   let partInfo = part as PartInfoDto;
  //   let currentVendor: VendorDto = this.vendorLocation.find((x) => x.country == countryId);
  //   let currentBuLocation: buLocationDto = this.buLocation.find((x) => x.country == partInfo?.deliveryCountryId);
  //   this.logisticsSummaryService.getLogisticsSummary(partInfo.partInfoId)
  //     .pipe(takeUntil(this.unsubscribeAll$))
  //     .subscribe((logisticSummary: LogisticsSummaryDto) => {
  //       if (logisticSummary) {
  //         let logistic: LogisticsSummaryDto = Object.assign({}, logisticSummary);
  //         this.logisticsSummaryService.getDefaultModeOfTransport(countryId, part.deliveryCountryId)
  //           .pipe(takeUntil(this.unsubscribeAll$))
  //           .subscribe((response: number) => {
  //             if (response) {
  //               let modeOfTransport = response || 0;
  //               let shipmentType: number = 0;
  //               let containerType = 0;
  //               if (part?.mfrCountryId == part?.deliveryCountryId) {
  //                 modeOfTransport = ModeOfTransportEnum.Surface;
  //               } else {
  //                 if (response == ModeOfTransportEnum.Ocean &&
  //                   part.commodityId == CommodityType.Electronics) {
  //                   modeOfTransport = ModeOfTransportEnum.Air;
  //                 }
  //                 shipmentType = modeOfTransport == ModeOfTransportEnum.Air ? ShipmentTypeEnum.AIR : response == ModeOfTransportEnum.Surface ? ShipmentTypeEnum.LTL : ShipmentTypeEnum.LCL;
  //                 containerType = modeOfTransport == ModeOfTransportEnum.Air ? ContainerTypeEnum.AIR : response == ModeOfTransportEnum.Surface ? ContainerTypeEnum.LTL : ContainerTypeEnum.LCL;
  //               }

  //               if (packagingInfo?.totalShipmentVolume > 50000000) {
  //                 if (modeOfTransport == ModeOfTransportEnum.Surface) {
  //                   shipmentType = ShipmentTypeEnum.FTL;
  //                   containerType = ContainerTypeEnum.Container40Ft;
  //                 } else if (modeOfTransport == ModeOfTransportEnum.Ocean) {
  //                   shipmentType = ShipmentTypeEnum.FCL;
  //                   containerType = ContainerTypeEnum.Container40Ft;
  //                 }

  //               } else if (packagingInfo?.totalShipmentVolume > 22000000 || packagingInfo?.totalShipmentWeight > 16000000) {
  //                 if (modeOfTransport == ModeOfTransportEnum.Surface) {
  //                   shipmentType = ShipmentTypeEnum.FTL;
  //                   containerType = ContainerTypeEnum.Container20Ft;
  //                 } else if (modeOfTransport == ModeOfTransportEnum.Ocean) {
  //                   shipmentType = ShipmentTypeEnum.FCL;
  //                   containerType = ContainerTypeEnum.Container20Ft;
  //                 }
  //               }
  //               if (logisticSummary?.costingLogisticsId > 0) {
  //                 this.sharedService
  //                   .getColorInfos(part?.partInfoId, ScreeName.Logistic, logisticSummary?.costingLogisticsId)
  //                   .pipe(takeUntil(this.unsubscribeAll$))
  //                   .subscribe((logisticDirtyFields: FieldColorsDto[]) => {
  //                     if (part?.mfrCountryId != countryId) {
  //                       logisticDirtyFields = [];
  //                     }
  //                     modeOfTransport = this.sharedService.checkDirtyProperty("ModeOfTransport", logisticDirtyFields) ? logisticSummary?.modeOfTransport : modeOfTransport;
  //                     shipmentType = this.sharedService.checkDirtyProperty("ShipmentType", logisticDirtyFields) ? logisticSummary?.shipmentType : shipmentType;
  //                     containerType = this.sharedService.checkDirtyProperty("ContainerType", logisticDirtyFields) ? logisticSummary?.containerType : containerType;

  //                     this.logisticsSummaryService.getContainerSize()
  //                       .pipe(takeUntil(this.unsubscribeAll$))
  //                       .subscribe((containerSizeResult: any) => {
  //                         this.logisticsSummaryCalculatorService.getCostCalculation(modeOfTransport, containerType,
  //                           shipmentType, currentVendor, currentBuLocation, containerSizeResult, part, materialList,
  //                           countryId, packagingInfo)
  //                           .subscribe(costResult => {
  //                             if (costResult) {
  //                               let carbonFootPrintUnit = this.sharedService.isValidNumber(costResult.totalCo2 * (costResult.percentageOfShipment / 100));
  //                               let partCo2 = this.sharedService.isValidNumber(carbonFootPrintUnit / costResult.partsPerShipment);

  //                               logistic.containerCost = Number(costResult.containerCost);
  //                               logistic.containerPercent = Number(costResult.percentageOfShipment);
  //                               logistic.freightCostPerShipment = Number(costResult.freightCostPerShipment);
  //                               logistic.freightCost = Number(costResult.freightCostPerPart);
  //                               logistic.carbonFootPrint = Number(carbonFootPrintUnit);
  //                               logistic.totalCarbonFootPrint = Number(costResult.totalCo2);
  //                               logistic.carbonFootPrintPerUnit = Number(partCo2);
  //                               logistic.pickUpCost = Number(costResult.sourceToPortCost);
  //                               logistic.portCost = Number(costResult.portCost);
  //                               logistic.deliveryCost = Number(costResult.portToDestinationCost);
  //                               logistic.pickUpCo2 = Number(costResult.pickUpCo2);
  //                               logistic.portCo2 = Number(costResult.co2);
  //                               logistic.deliveryCo2 = Number(costResult.deliveryCo2);
  //                               logistic.currentPart = part;
  //                               logistic.packagingInfo = packagingInfo;

  //                               this.logisticsSummaryCalculatorService.calculateLogisticsCost(logistic, logisticDirtyFields, logisticSummary)
  //                                 .pipe(takeUntil(this.unsubscribeAll$))
  //                                 .subscribe((calculationResult: LogisticsSummaryDto) => {
  //                                   if (calculationResult) {
  //                                     summary.logisticsTotalCost = calculationResult.freightCost;
  //                                     summary.totalESGLogistics = Number(calculationResult?.carbonFootPrintPerUnit);
  //                                     summary.totalCostESG = Number(summary.totalESGManufacturing) + Number(summary.totalESGMaterial) + Number(summary.totalESGPackaging) + Number(summary.totalESGLogistics);
  //                                     this.totalESGImpactperPart = Number(calculationResult?.carbonFootPrintPerUnit);
  //                                     this.logisticsTotalCost.push({ countryId: countryId, logisticsCost: summary.logisticsTotalCost, logisticsEsg: summary.totalESGLogistics });
  //                                     this.sectionCount.logistics++;
  //                                     if (this.completionStatus.packaging && this.sectionMaxCount.logistics <= this.sectionCount.logistics) {
  //                                       this.completionStatus.logistics = true;
  //                                       this.checkCompletionStatus();
  //                                     }
  //                                   }
  //                                   else {
  //                                     this.completionStatus.logistics = true;
  //                                     this.checkCompletionStatus();
  //                                   }
  //                                 });
  //                             } else {
  //                               this.completionStatus.logistics = true;
  //                               this.checkCompletionStatus();
  //                             }
  //                           });
  //                       })
  //                   });
  //               } else {
  //                 this.completionStatus.logistics = true;
  //                 this.checkCompletionStatus();
  //               }
  //             } else {
  //               this.completionStatus.logistics = true;
  //               this.checkCompletionStatus();
  //             }
  //           });
  //       } else {
  //         this.completionStatus.logistics = true;
  //         this.checkCompletionStatus();
  //       }
  //     });
  // }
  /** Simulation Run - End */

  saveSimulationResult(_event: any) {
    if (this.simulationResult?.length > 0) {
      const list = new ListSimulationTotalCostDto();
      list.SimulationTotalCostDtos = this.simulationResult;
      this._store.dispatch(new SimulationDataActions.SaveSimulationResultDb(list));
    } else {
      this.messaging.openSnackBar(`Please run the simulation before save.`, '', { duration: 5000 });
    }
  }

  private getMedbFgiccData(fgicc: MedbFgiccMasterDto[], countryId: number, txtVolumeCat: string) {
    this.medbFgiccMasterList = fgicc.find((s: any) => s.countryId == countryId && s.volumeCategory == txtVolumeCat);
  }

  private getMedbIccData(icc: MedbIccMasterDto[], countryId: number, txtVolumeCat: string) {
    this.medbIccMasterList = icc.find((s: any) => s.countryId == countryId && s.volumeCategory == txtVolumeCat);
  }

  private getMedbOverHeadProfitData(medbohp: MedbOverHeadProfitDto[], countryId: number, txtVolumeCat: string) {
    const filteredMasterList = medbohp.filter((s: any) => s.countryId == countryId && s.volumeCategory == txtVolumeCat);
    this.medbMohList = filteredMasterList.find((s: any) => s.overHeadProfitType == 'MOH');
    this.medbFohList = filteredMasterList.find((s: any) => s.overHeadProfitType == 'FOH');
    this.medbSgaList = filteredMasterList.find((s: any) => s.overHeadProfitType == 'SGA');
    this.medbProfitList = filteredMasterList.find((s: any) => s.overHeadProfitType == 'Profit');
  }

  private getMedbPaymentData(medbPayment: MedbPaymentMasterDto[], countryId: number, selectedPart: any) {
    const paymentTermId = selectedPart?.paymentTermId;
    this.medbPaymentList = medbPayment?.find((s: any) => s.countryId == countryId && s.paymentTermId == paymentTermId);
  }

  private getCostSummaryDetails(selectedPart: any) {
    if (selectedPart) {
      this._CostSummaryService.getCostSummaryViewByPartInfoId(selectedPart.partInfoId).subscribe((result) => {
        if (result) {
          this.costSummaryViewData = result[0];
        }
      });
    }
  }

  private getLWH(description: string) {
    const matDescAry = description?.split('x');
    return {
      length: +matDescAry[0]?.trim(),
      width: +matDescAry[1]?.trim(),
      height: +matDescAry[2]?.trim(),
    };
  }

  ngOnDestroy() {
    this.unsubscribeAll$.next(undefined);
    this.unsubscribeAll$.complete();
    if (this.unsubscribeMasterData$) {
      this.unsubscribeMasterData$.unsubscribe();
    }
  }

  private getMasterData(selectedPart: any, countryId: number) {
    // add on ngonit and comment all other 4 methods
    this.unsubscribeMasterData$ = combineLatest([this._medbohp$, this._fgicc$, this._icc$, this._paymentmaster$])
      .pipe(
        tap(([medbohp, fgicc, icc, paymentmaster]) => {
          const AnnualVolume = selectedPart?.eav | 0;
          const txtAnnualVolume: number = AnnualVolume;
          let txtVolumeCat: string = '';
          if (txtAnnualVolume <= 500) {
            txtVolumeCat = 'Low Volume <=500';
          } else if (txtAnnualVolume >= 500 && txtAnnualVolume <= 1000) {
            txtVolumeCat = 'Low Volume >500 to <=1,000';
          } else if (txtAnnualVolume >= 1000 && txtAnnualVolume <= 5000) {
            txtVolumeCat = 'Low Volume >1,000 to <=5,000';
          } else if (txtAnnualVolume >= 5000 && txtAnnualVolume <= 20000) {
            txtVolumeCat = 'Low Volume >5,000 to <=20,000';
          } else if (txtAnnualVolume >= 20000 && txtAnnualVolume <= 100000) {
            txtVolumeCat = 'Medium Volume >20,000 to <=100,000';
          } else {
            txtVolumeCat = 'High Volume >100,000';
          }

          if (medbohp && medbohp.length > 0) {
            this.getMedbOverHeadProfitData(medbohp, countryId, txtVolumeCat);
          }
          if (fgicc && fgicc.length > 0) {
            this.getMedbFgiccData(fgicc, countryId, txtVolumeCat);
          }
          if (icc && icc.length > 0) {
            this.getMedbIccData(icc, countryId, txtVolumeCat);
          }
          if (paymentmaster && paymentmaster.length > 0) {
            this.getMedbPaymentData(paymentmaster, countryId, selectedPart);
          }
        })
      )
      .subscribe();
  }

  private adnlProtPkgFormGroup(pkg?: AdditionalPackagingDto): FormGroup {
    const formGroup = this._fb.group({
      adlnalid: [pkg?.adnlId || 0],
      protectivePkg: [pkg?.protectivePkg || 0],
      costPerProtectivePackagingUnit: Number([pkg?.costPerProtectivePackagingUnit || 0]),
      totalNumberOfProtectivePackaging: [pkg?.totalNumberOfProtectivePackaging],
      costPerUnit: [pkg?.costPerUnit || 0],
      units: [pkg?.units || 0],
    });
    return formGroup;
  }
}
