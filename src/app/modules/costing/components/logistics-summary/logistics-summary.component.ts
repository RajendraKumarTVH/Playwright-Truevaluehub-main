import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, OnChanges, effect } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuLocationDto, MaterialInfoDto, MaterialTypeDto, PartInfoDto } from '../../../../shared/models';
import { ContainerTypeEnum, LogisticsCostRequest, LogisticsCostResponse, LogisticsSummaryDto, ModeOfTransportEnum, ShipmentTypeEnum } from 'src/app/shared/models/logistics-summary.model';
import { LogisticsSummaryService } from 'src/app/shared/services/logistics-summary.service';
import { Observable, of, Subject, Subscription, combineLatest } from 'rxjs';
import { PackagingInfoDto } from 'src/app/shared/models/packaging-info.model';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { CostingCompletionPercentageCalculator } from '../../services';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
// need to fix
// import { MapTypeStyle } from '@agm/core';
import { FreightCostResponseDto } from './../../../../shared/models/freight-cost-response';
import { CommodityType, ScreeName } from '../../costing.config';
import { ApiCacheService, BlockUiService } from 'src/app/shared/services';
import { take, takeUntil, tap } from 'rxjs/operators';
// import { MaterialInfoState } from 'src/app/modules/_state/material-info.state';
import { Store } from '@ngxs/store';
import { ContainerSize } from './../../../../shared/models/container-size.model';
import { LogisticsSummaryState } from 'src/app/modules/_state/logistics-summary.state';
import * as LogisticsSummaryActions from 'src/app/modules/_actions/logistics-summary.action';
import { SupplierBuLocationState } from './../../../_state/supplier-bu-location.state';
import * as MasterDataActions from 'src/app/modules/_actions/master-data.action';
import { PackagingInfoState } from 'src/app/modules/_state/packaging-info.state';
import { LogisticsSummaryCalculatorService } from '../../services/logistics-summary-calculator.service';
import { BuLocationService } from 'src/app/modules/data/Service/bu-location.service';
import { VendorService } from 'src/app/modules/data/Service/vendor.service';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { SharedService } from '../../services/shared.service';
import { MaterialCategory } from 'src/app/shared/enums';
import { MaterialTypeState } from 'src/app/modules/_state/material-type.state';
import { LogisticsMapDto } from 'src/app/shared/models/logistics-map.model';
import { DigitalFactoryDtoNew } from 'src/app/modules/digital-factory/Models/digital-factory-dto';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';
// Uncomment below code while integration
// import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-logistics-summary',
  templateUrl: './logistics-summary.component.html',
  styleUrls: ['./logistics-summary.component.scss'],
  standalone: true,
  imports: [CommonModule, MatTabsModule, ReactiveFormsModule, MatExpansionModule, OnlyNumber, GoogleMapsModule, GoogleMap, InfoTooltipComponent, MatTooltipModule],
})
export class LogisticsSummaryComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() part: PartInfoDto;
  @Output() partChange: EventEmitter<PartInfoDto> = new EventEmitter<PartInfoDto>();
  @Input() recalculateSubject: Subject<PartInfoDto>;
  @Input() countryChangeSubject: Subject<boolean>;
  @Output() completionPercentageChange = new EventEmitter<number>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Output() logisticsSummaryDtoOut = new EventEmitter<LogisticsSummaryDto>();

  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  dataCompletionPercentage: any;
  public currentPart: PartInfoDto;
  logisticsInformationForm: FormGroup;
  packagingObj?: PackagingInfoDto;
  logisticsSummaryObj?: LogisticsSummaryDto;
  dirtyFieldList: FieldColorsDto[] = [];
  susTainabilityDirtyFieldList: FieldColorsDto[] = [];
  afterChange = false;
  isCountryChanged = false;
  noPalletId = 0;
  noCartonBoxId = 0;
  isRecalculate: boolean = false;
  modeOfTransports = [
    { value: '3', name: 'Sea' },
    { value: '2', name: 'Surface' },
    { value: '1', name: 'Air' },
  ];
  shipmentType: any[] = [];
  containerType: any[] = [];
  materialTypeList: any[] = [];
  corrugatedBoxList: any[] = [];
  palletList: any[] = [];
  hasUnsavedEventSub$: Subscription = Subscription.EMPTY;
  nexturltonavigate: any;
  directions: any;
  lat = 0;
  lng = 0;
  polyLine: any;
  mapMarkerPoints: any;
  // need to fix
  // mapStyles: MapTypeStyle[];
  routeInfo: any;
  timeLineClass: any;
  timeLineClassDot: any;
  btnLoader: boolean = false;
  costLoader: boolean = false;
  isApiCallRequired: boolean = true;
  freightCost: FreightCostResponseDto;
  defaultMode: number;
  materialList: MaterialInfoDto[];
  materialTypeMasterList: MaterialTypeDto[];
  totalCO2: number = 0;
  totalCost: number = 0;

  // _materialInfos$: Observable<MaterialInfoDto[]>;
  _materialTypes$: Observable<MaterialTypeDto[]>;
  _containerSize$: Observable<ContainerSize[]>;
  _saveLogisticsSummary$: Observable<LogisticsSummaryDto>;
  _supplierList$: Observable<DigitalFactoryDtoNew[]>;
  _buLocationList$: Observable<BuLocationDto[]>;
  packgeInfoState$: Observable<PackagingInfoDto>;

  containerSize: ContainerSize[] = [];
  vendorLocation: DigitalFactoryDtoNew[] = [];
  buLocation: BuLocationDto[] = [];
  dispatchMasterLoadingProgress = false;

  mapOptions: google.maps.MapOptions = {
    styles: this.getMapStyle(),
    disableDefaultUI: true,
    minZoom: 1,
    fullscreenControl: true,
    maxZoom: 10,
  };
  materialInfoEffect = effect(() => {
    const result = this.materialInfoSignalService.materialInfos();
    if (result?.length > 0) {
      this.materialList = result;
    }
  });

  constructor(
    private form: FormBuilder,
    private logisticsSummaryService: LogisticsSummaryService,
    private messageService: MessagingService,
    private percentageCalculator: CostingCompletionPercentageCalculator,
    private blockUiService: BlockUiService,
    private _store: Store,
    private _logisticsSummaryCalculatorService: LogisticsSummaryCalculatorService,
    private _buLocationService: BuLocationService,
    private _vendorService: VendorService,
    private sharedService: SharedService,
    private _apiCacheService: ApiCacheService,
    private digitalFactoryService: DigitalFactoryService,
    private materialInfoSignalService: MaterialInfoSignalsService
  ) {
    // this._materialInfos$ = this._store.select(MaterialInfoState.getMaterialInfos);
    this._materialTypes$ = this._store.select(MaterialTypeState.getMaterialTypes);
    this._containerSize$ = this._store.select(LogisticsSummaryState.getContainerSize);
    this._saveLogisticsSummary$ = this._store.select(LogisticsSummaryState.saveSummaryInfo);
    this._supplierList$ = this._store.select(SupplierBuLocationState.getSupplierList);
    this._buLocationList$ = this._store.select(SupplierBuLocationState.getBuLocationList);
    this.packgeInfoState$ = this._store.select(PackagingInfoState.getPackageInfo);
  }

  // ngOnInit(): void {
  //   this.isCountryChanged = false;
  //   this.formInitialise();
  //   this.dirtyFieldList = [];
  //   this.susTainabilityDirtyFieldList = [];
  //   this.callDataInLoad();
  //   this.recalculateSubject.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
  //     this.recalculateLogisticsCost(e);
  //   });

  //   this.countryChangeSubject.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
  //     this.isCountryChanged = e;
  //   });
  //   this.completionPercentageChange.emit(0);
  // }
  ngOnInit(): void {
    this.isCountryChanged = false;
    this.formInitialise();
    this.dirtyFieldList = [];
    this.susTainabilityDirtyFieldList = [];
    this.callDataInLoad();

    // Wait for defaultMode to be loaded before allowing recalc
    // this.getDefaultModeOfTransport()
    //   .pipe(take(1))
    //   .subscribe(() => {
    //     this.recalculateSubject.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
    //       this.recalculateLogisticsCost(e);
    //     });
    //   });
    combineLatest([this.getDefaultModeOfTransport().pipe(take(1)), this.recalculateSubject])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([_, event]) => {
        this.recalculateLogisticsCost(event);
      });

    this.countryChangeSubject.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
      this.isCountryChanged = e;
    });

    this.completionPercentageChange.emit(0);
  }

  callDataInLoad() {
    if (!this.dispatchMasterLoadingProgress) {
      this.dispatchMasterLoadingProgress = true;
      this.dispatchMasterData();
      // this.getMaterialInfoList();
      this.getContainerSize();
      this.getMaterial();
      this.getVendorLocation();
      this.getBuLocation();
      this.getPackageInfoState();
      setTimeout(() => {
        this.dispatchMasterLoadingProgress = false;
      }, 6000);
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    const tab = event.tab.ariaLabelledby;
    if (tab === 'Map') {
      this.btnLoader = true;
      this.getMapStyle();
      const modeOfTrans = this.logisticsInformationForm.get('ModeOfTransport').value;
      const originCity = this.currentPart?.vendorLocation?.supplierDirectoryMasterDto.city;
      const destinationCity = this.currentPart?.buLocation?.city;
      const originCountryId = this.currentPart.mfrCountryId;
      const destinationCountryId = this.currentPart.deliveryCountryId;

      let srcCoord = '';
      let destCoord = '';

      let supplierId = this.currentPart?.vendorLocation?.supplierId;
      let buId = this.currentPart?.buLocation?.buId;

      if (this.currentPart?.vendorLocation?.supplierDirectoryMasterDto?.latitude && this.currentPart?.vendorLocation?.supplierDirectoryMasterDto?.longitude) {
        srcCoord = this.currentPart?.vendorLocation?.supplierDirectoryMasterDto?.latitude.toString() + ',' + this.currentPart?.vendorLocation?.supplierDirectoryMasterDto?.longitude.toString();
      }
      if (this.currentPart?.buLocation?.latitude && this.currentPart?.buLocation?.longitude) {
        destCoord = this.currentPart?.buLocation?.latitude.toString() + ',' + this.currentPart?.buLocation?.longitude.toString();
      }

      if ((!originCity || !destinationCity) && (!srcCoord || !destCoord)) {
        this.mapMarkerPoints = [];
        this.routeInfo = [];
        this.directions = [];
        this.btnLoader = false;
        return;
      }

      if (modeOfTrans) {
        this.logisticsSummaryService
          .getDirections(originCity, destinationCity, originCountryId, destinationCountryId, modeOfTrans, srcCoord, destCoord, supplierId, buId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((dat: LogisticsMapDto) => {
            if (dat?.apiExecutionStatus !== 'OK') {
              this.mapMarkerPoints = [];
              this.routeInfo = [];
              this.directions = [];
              this.btnLoader = false;
              return;
            }

            const routePoints = dat.routeLocations.map((loc) => ({
              lat: parseFloat(loc.lat.toString()),
              lng: parseFloat(loc.lng.toString()),
            }));

            this.lat = parseFloat(dat.originLatitude);
            this.lng = parseFloat(dat.originLongitude);

            if (modeOfTrans === ModeOfTransportEnum.Surface) {
              this.timeLineClass = 'timeline-line-green';
              this.timeLineClassDot = 'timeline-dot-green';

              this.directions = [
                {
                  path: routePoints,
                  color: '#3aaa35',
                },
              ];

              this.mapMarkerPoints = [
                { path: [routePoints[0].lat, routePoints[0].lng], img: 'assets/images/marker-starting-point.png' },
                { path: [routePoints[routePoints.length - 1].lat, routePoints[routePoints.length - 1].lng], img: 'assets/images/marker-location.png' },
              ];

              // this.routeInfo = [
              //   {
              //     name: dat.originAddress,
              //     image: 'assets/images/Truck.png',
              //     rclass: '',
              //     modeOfTrans,
              //     speed: 0,
              //     time: dat.duration,
              //     distance: dat.distance,
              //     cost: this.sharedService.isValidNumber(this.freightCost?.totalAnnualCost),
              //     co2: this.freightCost?.co2 > 0 ? this.sharedService.isValidNumber(this.freightCost?.co2) : 0,
              //   },
              //   {
              //     name: dat.destinationAddress,
              //     speed: 0,
              //     time: -1,
              //     image: '',
              //     rclass: 'greenColor',
              //     modeOfTrans,
              //   },
              // ];

              this.routeInfo = [
                {
                  name: dat.originAddress,
                  image: 'assets/icons/industrial-icon.svg',
                  segmentIcon: 'assets/icons/truck-icon.svg', // Transport mode to next point (Land)
                  rclass: '',
                  modeOfTrans: modeOfTrans,
                  speed: 0,
                  time: dat.duration,
                  distance: dat.distance,
                  cost: this.sharedService.isValidNumber(this.freightCost?.totalAnnualCost),
                  co2: this.freightCost?.co2 > 0 ? this.sharedService.isValidNumber(this.freightCost?.co2) : 0,
                },

                {
                  name: dat.destinationAddress,
                  speed: 0,
                  time: -1,
                  image: 'assets/icons/map-outline.svg',
                  rclass: 'greenColor',
                  modeOfTrans: modeOfTrans,
                },
              ];
            } else if (modeOfTrans === ModeOfTransportEnum.Air) {
              this.timeLineClass = 'timeline-line-violet';
              this.timeLineClassDot = 'timeline-dot-violet';

              const airPath = [
                { lat: parseFloat(dat.originLatitude), lng: parseFloat(dat.originLongitude) },
                { lat: parseFloat(dat.destinationLatitude), lng: parseFloat(dat.destinationLongitude) },
              ];

              this.directions = [
                {
                  path: airPath,
                  color: '#820582',
                },
              ];

              this.mapMarkerPoints = [
                { path: [airPath[0].lat, airPath[0].lng], img: 'assets/images/marker-starting-point.png' },
                { path: [airPath[1].lat, airPath[1].lng], img: 'assets/images/marker-location.png' },
              ];

              // this.routeInfo = [
              //   {
              //     name: dat.originAddress,
              //     image: 'assets/images/aeroplane.png',
              //     rclass: '',
              //     modeOfTrans,
              //     speed: 0,
              //     time: dat.duration,
              //     distance: dat.distance,
              //     cost: this.sharedService.isValidNumber(this.freightCost?.totalAnnualCost),
              //     co2: this.freightCost?.co2 > 0 ? this.sharedService.isValidNumber(this.freightCost?.co2) : 0,
              //   },
              //   {
              //     name: dat.destinationAddress,
              //     speed: 0,
              //     time: -1,
              //     image: '',
              //     rclass: 'greenColor',
              //     modeOfTrans,
              //   },
              // ];

              this.routeInfo = [
                {
                  name: this.freightCost?.route[0]?.locationName,
                  speed: 0,
                  image: 'assets/icons/industrial-icon.svg',
                  segmentIcon: 'assets/icons/truck-icon.svg', // Transport mode to next point (Land)
                  rclass: 'greenColor',
                  modeOfTrans: ModeOfTransportEnum.Surface,
                  time: -1,
                  distance: this.freightCost?.route[0]?.distance,
                  cost: this.sharedService.isValidNumber(this.freightCost?.sourceToPortCost),
                  co2: this.freightCost?.pickUpCo2 > 0 ? this.sharedService.isValidNumber(this.freightCost?.pickUpCo2) : 0,
                },
                {
                  name: this.freightCost?.route[1]?.locationName,
                  image: 'assets/icons/airplane-icon.svg',
                  segmentIcon: 'assets/icons/airplane-icon.svg', // Transport mode to next point (Air)
                  rclass: 'greenColor',
                  modeOfTrans: modeOfTrans,
                  speed: 0,
                  time: -1,
                  distance: this.freightCost?.route[1]?.distance,
                  cost: this.sharedService.isValidNumber(this.freightCost?.portCost),
                  co2: this.freightCost?.co2 > 0 ? this.sharedService.isValidNumber(this.freightCost?.co2) : 0,
                },
                {
                  name: this.freightCost?.route[2]?.locationName,
                  speed: 0,
                  image: 'assets/icons/map-outline.svg',
                  segmentIcon: 'assets/icons/truck-icon.svg', // Transport mode to next point (Land)
                  rclass: 'redColor',
                  modeOfTrans: ModeOfTransportEnum.Surface,
                  time: -1,
                  distance: this.freightCost?.route[2]?.distance,
                  cost: this.sharedService.isValidNumber(this.freightCost?.portToDestinationCost),
                  co2: this.freightCost?.deliveryCo2 > 0 ? this.sharedService.isValidNumber(this.freightCost?.deliveryCo2) : 0,
                },
                {
                  name: this.freightCost?.route[3]?.locationName,
                  speed: 0,
                  time: -1,
                  distance: '',
                  image: '',
                  rclass: 'greenColor',
                },
              ];
            } else if (modeOfTrans === ModeOfTransportEnum.Ocean) {
              this.timeLineClass = 'timeline-line-blue';
              this.timeLineClassDot = 'timeline-dot-blue';

              this.directions = [
                {
                  path: routePoints,
                  color: '#08f',
                },
              ];

              this.mapMarkerPoints = [
                { path: [routePoints[0].lat, routePoints[0].lng], img: 'assets/images/marker-starting-point.png' },
                { path: [routePoints[routePoints.length - 1].lat, routePoints[routePoints.length - 1].lng], img: 'assets/images/marker-location.png' },
              ];

              // this.routeInfo = [
              //   {
              //     name: dat.originAddress,
              //     image: 'assets/images/ship1.svg',
              //     rclass: '',
              //     modeOfTrans,
              //     speed: 0,
              //     time: dat.duration,
              //     distance: dat.distance,
              //     cost: this.sharedService.isValidNumber(this.freightCost?.totalAnnualCost),
              //     co2: this.freightCost?.co2 > 0 ? this.sharedService.isValidNumber(this.freightCost?.co2) : 0,
              //   },
              //   {
              //     name: dat.destinationAddress,
              //     speed: 0,
              //     time: -1,
              //     image: '',
              //     rclass: 'greenColor',
              //     modeOfTrans,
              //   },
              // ];

              this.routeInfo = [
                {
                  name: this.freightCost?.route[0]?.locationName,
                  speed: 0,
                  image: 'assets/icons/industrial-icon.svg',
                  segmentIcon: 'assets/icons/truck-icon.svg', // Transport mode to next point (Land)
                  rclass: 'greenColor',
                  modeOfTrans: ModeOfTransportEnum.Surface,
                  time: -1,
                  distance: this.freightCost?.route[0]?.distance,
                  cost: this.sharedService.isValidNumber(this.freightCost?.sourceToPortCost),
                  co2: this.freightCost?.pickUpCo2 > 0 ? this.sharedService.isValidNumber(this.freightCost?.pickUpCo2) : 0,
                },
                {
                  name: this.freightCost?.route[1]?.locationName,
                  image: 'assets/icons/anchor-icon.svg',
                  segmentIcon: 'assets/icons/ship-icon.svg', // Transport mode to next point (Sea)
                  rclass: 'greenColor',
                  modeOfTrans: modeOfTrans,
                  speed: 0,
                  time: -1,
                  distance: this.freightCost?.route[1]?.distance,
                  cost: this.sharedService.isValidNumber(this.freightCost?.portCost),
                  co2: this.freightCost?.co2 > 0 ? this.sharedService.isValidNumber(this.freightCost?.co2) : 0,
                },
                {
                  name: this.freightCost?.route[2]?.locationName,
                  speed: 0,
                  image: 'assets/icons/anchor-icon.svg',
                  segmentIcon: 'assets/icons/truck-icon.svg', // Transport mode to next point (Land)
                  rclass: 'blueColor',
                  modeOfTrans: ModeOfTransportEnum.Surface,
                  time: -1,
                  distance: this.freightCost?.route[2]?.distance,
                  cost: this.sharedService.isValidNumber(this.freightCost?.portToDestinationCost),
                  co2: this.freightCost?.deliveryCo2 > 0 ? this.sharedService.isValidNumber(this.freightCost?.deliveryCo2) : 0,
                },
                {
                  name: this.freightCost?.route[3]?.locationName,
                  speed: 0,
                  time: -1,
                  distance: '',
                  image: 'assets/icons/map-outline.svg',
                  rclass: 'greenColor',
                },
              ];
            }

            this.totalCost = this.logisticsSummaryObj?.containerCost;
            this.btnLoader = false;
          });
      } else {
        this.btnLoader = false;
      }
    }

    // if (tab === 'Map') {
    //   this.btnLoader = true;
    //   this.getMapStyle();
    //   const modeOfTrans = this.logisticsInformationForm.get('ModeOfTransport').value;
    //   const originCountryId = this.currentPart.mfrCountryId;
    //   const destinationCountryId = this.currentPart.deliveryCountryId;
    //   const originCity = this.currentPart?.vendorLocation?.supplierDirectoryMasterDto.city;
    //   const destinationCity = this.currentPart?.buLocation?.city;
    //   const srcCoord = '';
    //   let destCoord = '';
    //   // if (this.currentPart?.vendorLocation?.latitude &&
    //   //   this.currentPart?.vendorLocation?.longitude) {
    //   //   srcCoord = this.currentPart?.vendorLocation?.latitude.toString() +
    //   //     ',' + this.currentPart?.vendorLocation?.longitude.toString();
    //   // }
    //   if (this.currentPart?.buLocation?.latitude && this.currentPart?.buLocation?.longitude) {
    //     destCoord = this.currentPart?.buLocation?.latitude.toString() + ',' + this.currentPart?.buLocation?.longitude.toString();
    //   }
    //   if ((!originCity || !destinationCity) && (!srcCoord || !destCoord)) {
    //     this.mapMarkerPoints = [];
    //     this.routeInfo = [];
    //     this.directions = [];
    //     this.btnLoader = false;
    //     return;
    //   }

    //   if (modeOfTrans) {
    //     this.logisticsSummaryService
    //       .getDirections(originCity, destinationCity, originCountryId, destinationCountryId, modeOfTrans, srcCoord, destCoord)
    //       .pipe(takeUntil(this.unsubscribe$))
    //       .subscribe((dat: LogisticsMapDto) => {
    //         if (dat?.apiExecutionStatus != 'OK') {
    //           // No response from api
    //           this.mapMarkerPoints = [];
    //           this.routeInfo = [];
    //           this.directions = [];
    //         } else {
    //           // If transport mode is surface
    //           if (modeOfTrans == ModeOfTransportEnum.Surface) {
    //             // this.lat = dat.road.path[0][0];
    //             // this.lng = dat.road.path[0][1];
    //             this.lat = parseFloat(dat?.originLatitude);
    //             this.lng = parseFloat(dat?.originLongitude);
    //             this.timeLineClass = 'timeline-line-green';
    //             this.timeLineClassDot = 'timeline-dot-green';
    //             // this.directions = [{ path: dat.road.path, color: '#3aaa35' }];
    //             const directionsPath: any[] = [];
    //             for (let i = 0; i < dat?.routeLocations.length; i++) {
    //               const routeLocationValue = [parseFloat(dat?.routeLocations[i].lat.toString()), parseFloat(dat?.routeLocations[i].lng.toString())];
    //               directionsPath.push(routeLocationValue);
    //             }
    //             this.directions = [{ path: directionsPath.map((p) => ({ lat: p[0], lng: p[1] })), color: '#3aaa35' }];
    //             // this.mapMarkerPoints = [
    //             //   {
    //             //     path: dat.road.path[0],
    //             //     img: 'assets/images/marker-gr.png',
    //             //   },
    //             //   {
    //             //     path: dat.road.path[dat.road.path.length - 1],
    //             //     img: 'assets/images/marker-gr.png',
    //             //   },
    //             // ];
    //             this.mapMarkerPoints = [
    //               {
    //                 path: directionsPath[0],
    //                 img: 'assets/images/marker-gr.png',
    //               },
    //               {
    //                 path: directionsPath[directionsPath.length - 1],
    //                 img: 'assets/images/marker-gr.png',
    //               },
    //             ];
    //             this.routeInfo = [
    //               {
    //                 name: dat.originAddress, //dat.road.from_name,
    //                 image: 'assets/images/Truck.png',
    //                 rclass: '',
    //                 modeOfTrans: modeOfTrans,
    //                 speed: 0, //dat.road.speed,
    //                 time: dat.duration,
    //                 // dat.road.transit_time_seconds / 3600 > 1
    //                 //   ? Math.floor(dat.road.transit_time_seconds / 3600)
    //                 //   : 0,
    //                 distance: dat.distance,
    //                 // Math.floor(dat.road.dist) +
    //                 // ' mi, ' +
    //                 // '(' +
    //                 // Math.floor(dat.road.distance) +
    //                 // ' km)',
    //                 cost: this.sharedService.isValidNumber(this.freightCost?.totalAnnualCost),
    //                 co2: this.freightCost?.co2 > 0 ? this.sharedService.isValidNumber(this.freightCost?.co2) : 0,
    //               },

    //               {
    //                 name: dat.destinationAddress, //dat.road.to_name,
    //                 speed: 0,
    //                 time: -1,
    //                 image: '',
    //                 rclass: 'greenColor',
    //                 modeOfTrans: modeOfTrans,
    //               },
    //             ];
    //           }
    //           // else sea/air
    //           else {
    //             this.mapMarkerPoints = [];
    //             this.routeInfo = [];
    //             this.directions = [];
    //             // this.timeLineClass =
    //             //   modeOfTrans == ModeOfTransportEnum.Ocean
    //             //     ? 'timeline-line-blue'
    //             //     : 'timeline-line-violet';
    //             // this.timeLineClassDot =
    //             //   modeOfTrans == ModeOfTransportEnum.Ocean
    //             //     ? 'timeline-dot-blue'
    //             //     : 'timeline-dot-violet';
    //             // this.lat = dat.road_from.path[0][0];
    //             // this.lng = dat.road_from.path[0][1];
    //             // this.directions = [
    //             //   { path: dat.road_from.path, color: '#3aaa35' },
    //             //   modeOfTrans == ModeOfTransportEnum.Ocean
    //             //     ? { path: dat.sea.path, color: '#08f' }
    //             //     : { path: dat.air.path, color: '#820582' },
    //             //   { path: dat.road_to.path, color: '#3aaa35' },
    //             // ];

    //             // this.mapMarkerPoints = [
    //             //   {
    //             //     path: dat.road_from.path[0],
    //             //     img: 'assets/images/marker-gr.png',
    //             //   },
    //             //   {
    //             //     path:
    //             //       modeOfTrans == ModeOfTransportEnum.Ocean
    //             //         ? dat.sea.path[0]
    //             //         : dat.air.path[0],
    //             //     img: 'assets/images/marker-blue.png',
    //             //   },
    //             //   {
    //             //     path:
    //             //       modeOfTrans == ModeOfTransportEnum.Ocean
    //             //         ? dat.sea.path[dat.sea.path.length - 1]
    //             //         : dat.air.path[dat.air.path.length - 1],
    //             //     img: 'assets/images/marker-blue.png',
    //             //   },
    //             //   {
    //             //     path: dat.road_to.path[dat.road_to.path.length - 1],
    //             //     img: 'assets/images/marker-gr.png',
    //             //   },
    //             // ];

    //             // this.routeInfo = [
    //             //   {
    //             //     name: dat.road_from.name,
    //             //     speed: dat.road_from.speed,
    //             //     image: '',
    //             //     rclass: 'greenColor',
    //             //     modeOfTrans: ModeOfTransportEnum.Surface,
    //             //     time:
    //             //       dat.road_from.transit_time_seconds / 3600 > 1
    //             //         ? Math.floor(dat.road_from.transit_time_seconds / 3600)
    //             //         : 0,
    //             //     distance:
    //             //       Math.floor(dat.road_from.dist) +
    //             //       ' mi, ' +
    //             //       '(' +
    //             //       Math.floor(dat.road_from.distance) +
    //             //       ' km)',
    //             //     cost: this.sharedService.isValidNumber(
    //             //       this.freightCost?.sourceToPortCost
    //             //     ),
    //             //     co2:
    //             //       this.freightCost?.pickUpCo2 > 0
    //             //         ? this.sharedService.isValidNumber(this.freightCost?.pickUpCo2)
    //             //         : 0,
    //             //   },
    //             //   {
    //             //     name:
    //             //       modeOfTrans == ModeOfTransportEnum.Ocean
    //             //         ? dat.sea.from_name
    //             //         : dat.air.from_name,
    //             //     image:
    //             //       modeOfTrans == ModeOfTransportEnum.Ocean
    //             //         ? 'assets/images/ship1.svg'
    //             //         : 'assets/images/aeroplane.png',
    //             //     rclass: 'greenColor',
    //             //     modeOfTrans: modeOfTrans,
    //             //     speed:
    //             //       modeOfTrans == ModeOfTransportEnum.Ocean
    //             //         ? dat.sea.speed
    //             //         : dat.air.speed,
    //             //     time:
    //             //       modeOfTrans == ModeOfTransportEnum.Ocean
    //             //         ? dat.sea.transit_time_seconds / 3600 > 1
    //             //           ? Math.floor(dat.sea.transit_time_seconds / 3600)
    //             //           : 0
    //             //         : dat.air.transit_time_seconds / 3600 > 1
    //             //           ? Math.floor(dat.air.transit_time_seconds / 3600)
    //             //           : 0,
    //             //     distance:
    //             //       modeOfTrans == ModeOfTransportEnum.Ocean
    //             //         ? Math.floor(dat.sea.dist / 1.852) +
    //             //         ' mi, ' +
    //             //         '(' +
    //             //         Math.floor(dat.sea.dist) +
    //             //         ' km)'
    //             //         : Math.floor(dat.air.distance / 1.852) +
    //             //         ' mi, ' +
    //             //         '(' +
    //             //         Math.floor(dat.air.distance) +
    //             //         ' km)',
    //             //     cost: this.sharedService.isValidNumber(this.freightCost?.portCost),
    //             //     co2:
    //             //       this.freightCost?.co2 > 0
    //             //         ? this.sharedService.isValidNumber(this.freightCost?.co2)
    //             //         : 0,
    //             //   },
    //             //   {
    //             //     name:
    //             //       modeOfTrans == ModeOfTransportEnum.Ocean
    //             //         ? dat.sea.to_name
    //             //         : dat.air.to_name,
    //             //     speed: dat.road_to.speed,
    //             //     image: '',
    //             //     rclass:
    //             //       modeOfTrans == ModeOfTransportEnum.Ocean
    //             //         ? 'blueColor'
    //             //         : 'redColor',
    //             //     modeOfTrans: ModeOfTransportEnum.Surface,
    //             //     time: Math.floor(dat.road_to.transit_time_seconds / 3600),
    //             //     distance:
    //             //       Math.floor(dat.road_to.dist) +
    //             //       ' mi, ' +
    //             //       '(' +
    //             //       Math.floor(dat.road_to.distance) +
    //             //       ' km)',
    //             //     cost: this.sharedService.isValidNumber(
    //             //       this.freightCost?.portToDestinationCost
    //             //     ),
    //             //     co2:
    //             //       this.freightCost?.deliveryCo2 > 0
    //             //         ? this.sharedService.isValidNumber(this.freightCost?.deliveryCo2)
    //             //         : 0,
    //             //   },
    //             //   {
    //             //     name: dat.road_to.name,
    //             //     speed: 0,
    //             //     time: -1,
    //             //     distance: '',
    //             //     image: '',
    //             //     rclass: 'greenColor',
    //             //   },
    //             // ];
    //           }

    //           this.totalCost = this.logisticsSummaryObj?.containerCost;
    //           //this.totalCO2 = this.logisticsSummaryObj?.totalCarbonFootPrint;
    //           // for (let i = 0; i < this.routeInfo.length - 1; i++) {
    //           //   if (Number(this.routeInfo[i].cost) != null)
    //           //     this.totalCost =
    //           //       this.sharedService.isValidNumber(Number(this.routeInfo[i].cost) + this.totalCost);
    //           //   if (Number(this.routeInfo[i].co2) != null) {
    //           //     this.totalCO2 = this.sharedService.isValidNumber(Number(this.routeInfo[i].co2) + this.totalCO2);
    //           //   }
    //           // }
    //         }
    //         this.btnLoader = false;
    //       });
    //   } else {
    //     this.btnLoader = false;
    //   }
    // }
  }

  getMapStyle() {
    return [
      {
        elementType: 'geometry',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#523735',
          },
        ],
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'transit.line',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'transit.line',
        elementType: 'labels.text.stroke',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#f8f8fa',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#f8f8fa',
          },
        ],
      },
    ];
  }

  setOnchangesActions() {
    this.logisticsInformationForm
      .get('ModeOfTransport')
      .valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((x: any) => {
        if (x == null && this.logisticsSummaryObj?.modeOfTransport == null) {
          this.logisticsInformationForm.get('ShipmentType').setValue('');
          this.logisticsInformationForm.get('ContainerType').setValue('');
        } else if (x != null && this.logisticsSummaryObj?.modeOfTransport != x) {
          this.logisticsInformationForm.get('ShipmentType').setValue('');
          this.logisticsInformationForm.get('ContainerType').setValue('');
        } else {
          this.logisticsInformationForm.get('ShipmentType').setValue(this.logisticsSummaryObj?.shipmentType);
          this.logisticsInformationForm.get('ContainerType').setValue(this.logisticsSummaryObj?.containerType);
        }
        this.containerType = [];
        this.shipmentType = [];
        this.setValuesBasedOnModeOfTransport(x);
      });

    this.logisticsInformationForm
      .get('ShipmentType')
      .valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((x: any) => {
        if (x == null && this.logisticsSummaryObj?.shipmentType == null) {
          this.logisticsInformationForm.get('ContainerType').setValue('');
        } else if (x != null && this.logisticsSummaryObj?.shipmentType != x) {
          this.logisticsInformationForm.get('ContainerType').setValue('');
        } else {
          this.logisticsInformationForm.get('ContainerType').setValue(this.logisticsSummaryObj?.containerType);
        }
        this.setValuesBasedOnShipmentType(x);
      });
  }

  // getLessCostTransportMode() {
  //   if (!this.currentPart?.mfrCountryId || !this.currentPart.deliveryCountryId) {
  //     return;
  //   }
  //   this.costLoader = true;
  //   this.logisticsSummaryService
  //     .getLogisticsRateCards(this.currentPart?.mfrCountryId, this.currentPart?.deliveryCountryId)
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe((rateCardResult: any) => {
  //       if (rateCardResult && rateCardResult?.length > 0) {
  //         const rateCards: LogisticsRateCard[] = rateCardResult;
  //         const costResults = [];

  //         let currentVendor: any, currentBuLocation: any;
  //         if (this.currentPart?.supplierInfoId) {
  //           currentVendor = this.vendorLocation.find((x) => x.supplierId == this.currentPart?.supplierInfoId);
  //         }
  //         if (this.currentPart?.buId) {
  //           currentBuLocation = this.buLocation.find((x) => x.buId == this.currentPart?.buId);
  //         }

  //         let count = 0;
  //         rateCards?.forEach((rate) => {
  //           const containerTypeId = rate?.containerTypeId;
  //           const shipmentTypeId = rate?.shipmentTypeId;
  //           const modeOfTransportId = rate?.modeOfTransportTypeId;

  //           this._logisticsSummaryCalculatorService
  //             .getCostCalculation(
  //               modeOfTransportId,
  //               containerTypeId,
  //               shipmentTypeId,
  //               currentVendor,
  //               currentBuLocation,
  //               this.containerSize,
  //               this.currentPart,
  //               this.materialList,
  //               this.currentPart.mfrCountryId,
  //               this.packagingObj
  //             )
  //             .pipe(takeUntil(this.unsubscribe$))
  //             .subscribe((costResult) => {
  //               if (costResult) {
  //                 count++;
  //                 costResults.push(costResult);
  //                 if (count === rateCards?.length) {
  //                   // const sortedArray: any[] = costResults.sort((a, b) => a.freightCostPerShipment - b.freightCostPerShipment);
  //                   // if (sortedArray && sortedArray?.length > 0) {
  //                   //   const lowCostTransportMode = sortedArray[0];
  //                   const sortedArray: any[] = costResults.filter((f) => f.totalCost > 0).sort((a, b) => a.freightCostPerShipment - b.freightCostPerShipment);

  //                   let lowCostTransportMode = null;

  //                   if (sortedArray?.length > 0) {
  //                     if (this.defaultMode) {
  //                       // Find cheapest match for default mode
  //                       const defaultModeMatches = sortedArray.filter((x) => x.modeOfTransportId === this.defaultMode);
  //                       if (defaultModeMatches.length > 0) {
  //                         lowCostTransportMode = defaultModeMatches[0];
  //                       }
  //                     }

  //                     // Fallback to cheapest if no default match
  //                     if (!lowCostTransportMode) {
  //                       lowCostTransportMode = sortedArray[0];
  //                     }

  //                     const carbonFootPrintUnit = this.sharedService.isValidNumber(lowCostTransportMode.totalCo2 * (lowCostTransportMode.percentageOfShipment / 100));
  //                     const partCo2 = this.sharedService.isValidNumber(carbonFootPrintUnit / lowCostTransportMode.partsPerShipment);

  //                     this.freightCost = lowCostTransportMode;
  //                     this.logisticsSummaryObj = lowCostTransportMode;
  //                     this.setValuesBasedOnModeOfTransport(lowCostTransportMode.modeOfTransportId);
  //                     this.setValuesBasedOnShipmentType(lowCostTransportMode.shipmentTypeId);

  //                     this.logisticsInformationForm.get('ContainerCost').setValue(this.sharedService.isValidNumber(lowCostTransportMode.containerCost));
  //                     this.logisticsInformationForm.get('ContainerPercent').setValue(this.sharedService.isValidNumber(lowCostTransportMode.percentageOfShipment));
  //                     this.logisticsInformationForm.get('FreightCostPerShipment').setValue(this.sharedService.isValidNumber(lowCostTransportMode.freightCostPerShipment));
  //                     this.logisticsInformationForm.get('FreightCost')?.setValue(this.sharedService.isValidNumber(lowCostTransportMode.freightCostPerPart));
  //                     //this.logisticsInformationForm.get('CarbonFootPrint').setValue(this.sharedService.isValidNumber(carbonFootPrintUnit));
  //                     //this.logisticsInformationForm.get('TotalCarbonFootPrint').setValue(this.sharedService.isValidNumber(lowCostTransportMode.totalCo2));
  //                     //this.logisticsInformationForm.get('CarbonFootPrintPerUnit').setValue(this.sharedService.isValidNumber(partCo2));
  //                     this.logisticsSummaryObj.carbonFootPrint = carbonFootPrintUnit;
  //                     this.logisticsSummaryObj.totalCarbonFootPrint = lowCostTransportMode.totalCo2;
  //                     this.logisticsSummaryObj.carbonFootPrintPerUnit = partCo2;
  //                     if (!this.isRecalculate) {
  //                       console.log('this.logisticsSummaryObj getLogisticsSummary', this.logisticsSummaryObj);
  //                       this.logisticsSummaryDtoOut.emit(this.logisticsSummaryObj);
  //                     }

  //                     this.logisticsInformationForm.get('PickUpCost').setValue(this.sharedService.isValidNumber(lowCostTransportMode.sourceToPortCost));
  //                     this.logisticsInformationForm.get('PortCost').setValue(this.sharedService.isValidNumber(lowCostTransportMode.portCost));
  //                     this.logisticsInformationForm.get('DeliveryCost').setValue(this.sharedService.isValidNumber(lowCostTransportMode.portToDestinationCost));
  //                     this.logisticsInformationForm.get('PickUpCo2').setValue(this.sharedService.isValidNumber(lowCostTransportMode.pickUpCo2));
  //                     this.logisticsInformationForm.get('PortCo2').setValue(this.sharedService.isValidNumber(lowCostTransportMode.co2));
  //                     this.logisticsInformationForm.get('DeliveryCo2').setValue(this.sharedService.isValidNumber(lowCostTransportMode.deliveryCo2));

  //                     this.setRouteData(lowCostTransportMode?.route);

  //                     this.logisticsInformationForm.get('ModeOfTransport').setValue(lowCostTransportMode.modeOfTransportId);
  //                     this.logisticsInformationForm.get('ShipmentType').setValue(lowCostTransportMode.shipmentTypeId);
  //                     this.logisticsInformationForm.get('ContainerType').setValue(lowCostTransportMode.containerTypeId);
  //                     this.costLoader = false;
  //                   }
  //                 }
  //               } else {
  //                 this.costLoader = false;
  //                 this.messageService.openSnackBar(`The cost between Origin and destination countries for this Mode of Transport is not valid/defined.`, '', { duration: 4000 });
  //               }
  //             });
  //         });
  //       } else {
  //         this.costLoader = false;
  //         this.messageService.openSnackBar(`The cost between Origin and destination countries for this Mode of Transport is not valid/defined.`, '', { duration: 4000 });
  //       }
  //     });
  // }
  public getLessCostTransportMode() {
    if (!this.currentPart?.mfrCountryId || !this.currentPart.deliveryCountryId) {
      return;
    }

    this.costLoader = true;

    // Build request for backend
    const request: LogisticsCostRequest = {
      originCountryId: this.currentPart.mfrCountryId,
      destinationCountryId: this.currentPart.deliveryCountryId,
      vendor: this.currentPart?.supplierInfoId ? this.vendorLocation.find((x) => x.supplierId === this.currentPart.supplierInfoId) : undefined,
      buLocation: this.currentPart?.buId ? this.buLocation.find((x) => x.buId === this.currentPart.buId) : undefined,
      containerSizes: this.containerSize,
      part: this.currentPart,
      materials: this.materialList,
      packaging: this.packagingObj,
      defaultMode: 0, // kept for backend reference
    };

    // Call backend
    this.logisticsSummaryService
      .getBulkLogisticsCost(request)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (results: LogisticsCostResponse[]) => {
          // Filter only valid results (totalCost > 0) and sort by freightCostPerShipment
          const safeResults = Array.isArray(results) ? results : [];
          if (safeResults.length === 0) {
            this.costLoader = false;
            this.messageService.openSnackBar('No valid cost results returned from backend.', '', { duration: 4000 });
            return;
          }
          const validResults = safeResults.filter((r) => r?.freightCost?.totalCost > 0).sort((a, b) => (a.freightCost?.freightCostPerShipment || 0) - (b.freightCost?.freightCostPerShipment || 0));

          if (validResults.length === 0) {
            this.costLoader = false;
            this.messageService.openSnackBar('No valid cost found for the selected countries and modes.', '', { duration: 4000 });
            return;
          }

          // Pick the first valid result
          const lowCostTransportMode = validResults[0];
          const freight = lowCostTransportMode.freightCost;

          // Update form and UI values
          this.freightCost = freight;
          this.logisticsSummaryObj = {
            ...this.logisticsSummaryObj, // preserve existing values
            modeOfTransport: lowCostTransportMode.rateCard.modeOfTransportTypeId,
            shipmentType: lowCostTransportMode.rateCard.shipmentTypeId,
            containerType: lowCostTransportMode.rateCard.containerTypeId,
            containerCost: freight.containerCost,
            freightCost: freight.freightCostPerPart,
            freightCostPerShipment: freight.freightCostPerShipment,
            containerPercent: freight.percentageOfShipment,
            totalCarbonFootPrint: freight.totalCo2,
            carbonFootPrint: freight.totalCo2,
            carbonFootPrintPerUnit: freight.totalCo2 && freight.partsPerShipment ? freight.totalCo2 / freight.partsPerShipment : undefined,
            pickUpCost: freight.sourceToPortCost,
            portCost: freight.portCost,
            deliveryCost: freight.portToDestinationCost,
            pickUpCo2: freight.pickUpCo2,
            portCo2: freight.co2,
            deliveryCo2: freight.deliveryCo2,
            route: freight.route,
          };

          this.setValuesBasedOnModeOfTransport(lowCostTransportMode.rateCard.modeOfTransportTypeId);
          this.setValuesBasedOnShipmentType(lowCostTransportMode.rateCard.shipmentTypeId);

          this.logisticsInformationForm.get('ContainerCost')?.setValue(freight.containerCost);
          this.logisticsInformationForm.get('ContainerPercent')?.setValue(freight.percentageOfShipment);
          this.logisticsInformationForm.get('FreightCostPerShipment')?.setValue(freight.freightCostPerShipment);
          this.logisticsInformationForm.get('FreightCost')?.setValue(freight.freightCostPerPart);

          this.logisticsSummaryObj.carbonFootPrint = freight.totalCo2;
          this.logisticsSummaryObj.totalCarbonFootPrint = freight.totalCo2;
          this.logisticsSummaryObj.carbonFootPrintPerUnit = freight.totalCo2 / freight.partsPerShipment;

          if (!this.isRecalculate) {
            this.logisticsSummaryDtoOut.emit(this.logisticsSummaryObj);
          }

          this.logisticsInformationForm.get('PickUpCost')?.setValue(freight.sourceToPortCost);
          this.logisticsInformationForm.get('PortCost')?.setValue(freight.portCost);
          this.logisticsInformationForm.get('DeliveryCost')?.setValue(freight.portToDestinationCost);

          this.logisticsInformationForm.get('PickUpCo2')?.setValue(freight.pickUpCo2);
          this.logisticsInformationForm.get('PortCo2')?.setValue(freight.co2);
          this.logisticsInformationForm.get('DeliveryCo2')?.setValue(freight.deliveryCo2);

          this.setRouteData(freight.route);

          this.logisticsInformationForm.get('ModeOfTransport')?.setValue(lowCostTransportMode.rateCard.modeOfTransportTypeId);
          this.logisticsInformationForm.get('ShipmentType')?.setValue(lowCostTransportMode.rateCard.shipmentTypeId);
          this.logisticsInformationForm.get('ContainerType')?.setValue(lowCostTransportMode.rateCard.containerTypeId);

          this.costLoader = false;
        },
        (error) => {
          this.costLoader = false;
          this.messageService.openSnackBar('Error fetching logistics cost', '', { duration: 4000 });
          console.error('Error in getLessCostTransportMode:', error);
        }
      );
  }

  getDefaultModeOfTransport(): Observable<number> {
    if (!this.currentPart?.mfrCountryId || !this.currentPart.deliveryCountryId) {
      return of(null);
    }

    return this.logisticsSummaryService.getDefaultModeOfTransport(this.currentPart.mfrCountryId, this.currentPart.deliveryCountryId).pipe(
      tap((result: number) => {
        if (result) {
          this.defaultMode = result;
        }
      })
    );
  }

  // getDefaultModeOfTransport() {
  //   if (!this.currentPart?.mfrCountryId || !this.currentPart.deliveryCountryId) {
  //     return;
  //   }

  //   this.logisticsSummaryService
  //     .getDefaultModeOfTransport(this.currentPart.mfrCountryId, this.currentPart.deliveryCountryId)
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe((result: number) => {
  //       if (result) {
  //         this.defaultMode = result;
  //         // if (this.defaultMode) {
  //         //   this.setDefaultModeOfTransport();
  //         // }
  //       }
  //     });
  // }

  setValuesBasedOnShipmentType(value: any) {
    this.containerType = [];
    if (value == ShipmentTypeEnum.FCL || value == ShipmentTypeEnum.FTL) {
      this.containerType = [
        { value: 1, name: '20 Feet Container' },
        { value: 2, name: '40 Feet Container' },
      ];
    } else if (value == ShipmentTypeEnum.LCL) {
      this.containerType = [{ value: 4, name: 'LCL' }];
    } else if (value == ShipmentTypeEnum.AIR) {
      this.containerType = [{ value: 3, name: 'Air' }];
    } else if (value == ShipmentTypeEnum.LTL) {
      this.containerType = [{ value: 6, name: 'LTL' }];
    }
  }

  setValuesBasedOnModeOfTransport(value: any) {
    if (value == ModeOfTransportEnum.Air) {
      this.shipmentType = [{ value: 1, name: 'Air' }];
    } else if (value == ModeOfTransportEnum.Ocean) {
      this.shipmentType = [
        { value: 3, name: 'LCL' },
        { value: 2, name: 'FCL' },
      ];
    } else if (value == ModeOfTransportEnum.Surface) {
      this.shipmentType = [
        { value: 4, name: 'FTL' },
        { value: 5, name: 'LTL' },
      ];
    }
  }

  getMaterial() {
    this._materialTypes$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: MaterialTypeDto[]) => {
      if (result?.length > 0) {
        this.materialTypeMasterList = result;
        this.materialTypeList = this.materialTypeMasterList?.filter((x) => x.materialGroupId === MaterialCategory.Packaging);
        const corrugatedBoxid = this.materialTypeList?.filter((s: any) => s.materialTypeName?.toLowerCase().includes('carton'));
        if (corrugatedBoxid.length > 0) {
          const index = this.corrugatedBoxList?.findIndex((item: any) => item.materialDescription?.toLowerCase().includes('no corrugatedbox'));
          if (index > -1) {
            this.noCartonBoxId = this.corrugatedBoxList[index].materialMasterId;
            this.corrugatedBoxList.splice(index, 1);
          }
        }
        const palletid = this.materialTypeList?.filter((s: any) => s.materialTypeName?.toLowerCase().includes('pallet'));
        if (palletid?.length > 0) {
          this.palletList = this.materialTypeMasterList?.filter((x) => x.materialTypeId == palletid[0].materialTypeId);
          if (this.palletList) {
            const index = this.palletList?.findIndex((item: any) => item.materialDescription?.toLowerCase().includes('no palletization'));
            if (index > -1) {
              this.noPalletId = this.palletList[index].materialMasterId;
              this.palletList.splice(index, 1);
            }
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.logisticsInformationForm.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((change: any) => {
      const value = this.percentageCalculator.logistics(change);
      this.completionPercentageChange.emit(value);
      this.dataCompletionPercentage = value;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
    this.materialInfoEffect.destroy();
  }

  private setForm(isRecalculateCall: boolean = false) {
    if (this.logisticsSummaryObj) {
      if (this.logisticsSummaryObj.costingLogisticsId == 0) {
        this.logisticsSummaryObj.costingLogisticsId = null;
      }
      this.setValuesBasedOnModeOfTransport(this.logisticsSummaryObj.modeOfTransport);
      this.setValuesBasedOnShipmentType(this.logisticsSummaryObj.shipmentType);
      this.logisticsInformationForm.get('ModeOfTransport').setValue(this.logisticsSummaryObj?.modeOfTransport);
      this.logisticsInformationForm.get('ShipmentType').setValue(this.logisticsSummaryObj?.shipmentType);
      this.logisticsInformationForm.get('ContainerType').setValue(this.logisticsSummaryObj?.containerType);
      this.logisticsInformationForm.get('OriginSurfaceKm').setValue(this.logisticsSummaryObj.originSurfaceKm || 0);
      this.logisticsInformationForm.get('DestinationSurfaceKm').setValue(this.logisticsSummaryObj.destinationSurfaceKm || 0);
      this.logisticsInformationForm.get('ContainerCost').setValue(this.sharedService.isValidNumber(this.logisticsSummaryObj.containerCost));
      this.logisticsInformationForm.get('FreightCost').setValue(this.sharedService.isValidNumber(this.logisticsSummaryObj.freightCost));
      //this.logisticsInformationForm.get('CarbonFootPrint').setValue(this.sharedService.isValidNumber(this.logisticsSummaryObj.carbonFootPrint));
      this.logisticsInformationForm.get('FreightCostPerShipment').setValue(this.sharedService.isValidNumber(this.logisticsSummaryObj.freightCostPerShipment));
      //this.logisticsInformationForm.get('CarbonFootPrintPerUnit').setValue(this.sharedService.isValidNumber(this.logisticsSummaryObj.carbonFootPrintPerUnit));
      this.logisticsInformationForm.get('ContainerPercent').setValue(this.sharedService.isValidNumber(this.logisticsSummaryObj.containerPercent));
      //this.logisticsInformationForm.get('TotalCarbonFootPrint').setValue(this.sharedService.isValidNumber(this.logisticsSummaryObj.totalCarbonFootPrint));

      this.setRouteData(this.logisticsSummaryObj?.route);

      this.logisticsInformationForm?.patchValue({
        PickUpCost: this.sharedService.isValidNumber(this.logisticsSummaryObj.pickUpCost),
        PortCost: this.sharedService.isValidNumber(this.logisticsSummaryObj.portCost),
        DeliveryCost: this.sharedService.isValidNumber(this.logisticsSummaryObj.deliveryCost),
        PickUpCo2: this.sharedService.isValidNumber(this.logisticsSummaryObj.pickUpCo2),
        PortCo2: this.sharedService.isValidNumber(this.logisticsSummaryObj.portCo2),
        DeliveryCo2: this.sharedService.isValidNumber(this.logisticsSummaryObj.deliveryCo2),
        CostingLogisticsId: this.logisticsSummaryObj.costingLogisticsId,
      });

      if (!this.isRecalculate) {
        this.logisticsSummaryObj.packagingInfo = this.packagingObj;
        this.logisticsSummaryObj.currentPart = this.currentPart;
        this.logisticsSummaryDtoOut.emit(this.logisticsSummaryObj);
      }
    }
    if (isRecalculateCall) {
      this.saveLogisticsSummary(true);
    }
  }

  get f() {
    return this.logisticsInformationForm.controls;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && changes['part'].currentValue != changes['part'].previousValue) {
      this.currentPart = changes['part'].currentValue;

      if (
        changes['part'].currentValue?.partInfoId != changes['part'].previousValue?.partInfoId ||
        changes['part'].currentValue?.commodityId != changes['part'].previousValue?.commodityId ||
        changes['part'].currentValue?.mfrCountryId != changes['part'].previousValue?.mfrCountryId
      ) {
        this.currentPart = changes['part'].currentValue;
        this.resetform();
        this.logisticsSummaryObj = new LogisticsSummaryDto();
        this.callDataInLoad();

        if (this.currentPart?.partInfoId) {
          setTimeout(() => {
            this.getLogisticsSummary();
          }, 1000);
        }
      }
    }
  }

  onFormValueChange() {
    this.afterChange = true;
    this.dirtyCheckEvent.emit(true);
    this.isApiCallRequired = true;
  }

  public onFormSubmit() {
    this.saveLogisticsSummary();
    this.messageService.openSnackBar(`Logistics Data updated successfully.`, '', { duration: 5000 });
    this.logisticsInformationForm.markAsPristine();
    this.afterChange = false;
    this.dirtyCheckEvent.emit(this.afterChange);
    return new Observable((obs) => {
      obs.next(this.logisticsInformationForm.value);
    });
  }

  saveLogisticsSummary(isRecalculate: boolean = false) {
    const logisticsForm: LogisticsSummaryDto = this.logisticsInformationForm.value;
    logisticsForm.partInfoId = this.currentPart.partInfoId;
    logisticsForm.originCountryId = this.currentPart.mfrCountryId;
    logisticsForm.destinationCountryId = this.currentPart.deliveryCountryId;
    logisticsForm.dataCompletionPercentage = this.dataCompletionPercentage;
    logisticsForm.carbonFootPrintPerUnit = this.logisticsSummaryObj.carbonFootPrintPerUnit;
    logisticsForm.carbonFootPrint = this.logisticsSummaryObj.carbonFootPrint;
    logisticsForm.totalCarbonFootPrint = this.logisticsSummaryObj.totalCarbonFootPrint;

    logisticsForm.containerType = this.logisticsInformationForm.value.ContainerType != '' ? Number(this.logisticsInformationForm.value.ContainerType) : null;
    logisticsForm.freightCost = this.logisticsInformationForm.value.FreightCost != '' ? Number(this.logisticsInformationForm.value.FreightCost) : null;
    logisticsForm.shipmentType = this.logisticsInformationForm.value.ShipmentType != '' ? Number(this.logisticsInformationForm.value.ShipmentType) : null;

    logisticsForm.deliveryCo2 = this.logisticsInformationForm.value.DeliveryCo2 != '' ? Number(this.logisticsInformationForm.value.DeliveryCo2) : null;
    logisticsForm.deliveryCost = this.logisticsInformationForm.value.DeliveryCost != '' ? Number(this.logisticsInformationForm.value.DeliveryCost) : null;
    logisticsForm.pickUpCo2 = this.logisticsInformationForm.value.PickUpCo2 != '' ? Number(this.logisticsInformationForm.value.PickUpCo2) : null;
    logisticsForm.pickUpCost = this.logisticsInformationForm.value.PickUpCost != '' ? Number(this.logisticsInformationForm.value.PickUpCost) : null;
    logisticsForm.portCo2 = this.logisticsInformationForm.value.PortCo2 != '' ? Number(this.logisticsInformationForm.value.PortCo2) : null;
    logisticsForm.portCost = this.logisticsInformationForm.value.PortCost != '' ? Number(this.logisticsInformationForm.value.PortCost) : null;
    const routeArray = this.logisticsInformationForm.get('Route') as FormArray;
    logisticsForm.route = routeArray.value;

    if (this.logisticsSummaryObj?.costingLogisticsId != null) logisticsForm.costingLogisticsId = this.logisticsSummaryObj?.costingLogisticsId;

    if (this.logisticsInformationForm.get('ModeOfTransport').invalid || this.logisticsInformationForm.get('ShipmentType').invalid || this.logisticsInformationForm.get('ContainerType').invalid) {
      return;
    }
    this._store.dispatch(new LogisticsSummaryActions.SaveSummaryInfo(logisticsForm));

    if (this.logisticsSummaryObj?.costingLogisticsId > 0) {
      // if (!this.isCountryChanged) {
      //   this.saveDirtyFields(this.logisticsSummaryObj?.costingLogisticsId);
      // }
      this.saveDirtyFields(this.logisticsSummaryObj?.costingLogisticsId);
      this.isCountryChanged = false;
    }
    if (isRecalculate) {
      setTimeout(() => {
        this.getLogisticsSummary();
      }, 10000);
    }
  }

  calcLogisticCost(isSubmit: boolean) {
    if (this.logisticsInformationForm.get('ModeOfTransport').invalid || this.logisticsInformationForm.get('ShipmentType').invalid || this.logisticsInformationForm.get('ContainerType').invalid) {
      return;
    }

    if (!this.isApiCallRequired) {
      return;
    }

    // const box = [];
    if (!isSubmit) {
      this.getOfflineCost();
    }

    if (this.packagingObj == undefined) {
      return;
    }

    if (this.packagingObj.pallet != this.noPalletId) {
      // const selectedPallet = this.palletList.filter((s: any) => s.materialMasterId == this.packagingObj?.pallet);
      // if (selectedPallet.length > 0) {
      //   box = selectedPallet[0]?.materialDescription?.split('x', 3)?.map((element: any) => Number(element.trim()));
      // }
    } else if (this.packagingObj.pallet == this.noPalletId) {
      // const selectedCorrugatedMaterial = this.corrugatedBoxList.filter((s: any) => s.materialMasterId == this.packagingObj?.corrugatedBox);
      // if (selectedCorrugatedMaterial.length > 0) {
      //   box = selectedCorrugatedMaterial[0].materialDescription?.split('x', 3)?.map((element: any) => Number(element.trim()));
      // }
    } else {
      this.messageService.openSnackBar(`Packaging box not selected`, '', { duration: 5000 });
      return;
    }
  }

  formInitialise() {
    this.logisticsInformationForm = this.form.group({
      ModeOfTransport: ['', [Validators.required]],
      ShipmentType: ['', [Validators.required]],
      ContainerType: ['', [Validators.required]],
      OriginSurfaceKm: [0, [Validators.required]],
      DestinationSurfaceKm: [0, [Validators.required]],
      ContainerCost: ['', [Validators.required]],
      FreightCost: ['', [Validators.required]],
      //CarbonFootPrint: [''],
      //TotalCarbonFootPrint: [''],
      ContainerPercent: ['', [Validators.required]],
      FreightCostPerShipment: ['', [Validators.required]],
      //CarbonFootPrintPerUnit: [''],
      PickUpCost: [''],
      PortCost: [''],
      DeliveryCost: [''],
      PickUpCo2: [''],
      PortCo2: [''],
      DeliveryCo2: [''],
      Route: this.form.array([]),
    });
  }

  // Create a FormGroup for each route item
  createRouteItem(routeItem: any): FormGroup {
    return this.form.group({
      locationName: [routeItem.locationName || ''],
      modeOfTransport: [routeItem.modeOfTransport || ''],
      distance: [routeItem.distance || ''],
    });
  }

  // Set the FormArray with route data
  setRouteData(routeArray: any[]) {
    const routeFormArray = this.logisticsInformationForm.get('Route') as FormArray;

    routeFormArray.clear();

    if (!Array.isArray(routeArray)) {
      return;
    }

    routeArray.forEach((item) => {
      routeFormArray.push(this.createRouteItem(item));
    });
  }

  public checkIfFormDirty() {
    return this.afterChange;
  }
  public resetform() {
    return this.logisticsInformationForm?.reset();
  }
  public getFormData() {
    return this.logisticsInformationForm.value;
  }

  getOfflineCost() {
    this.costLoader = true;
    let currentVendor: DigitalFactoryDtoNew;
    let currentBuLocation: BuLocationDto;
    this.getVendorLocation();
    this.getBuLocation();
    if (this.currentPart?.supplierInfoId) {
      currentVendor = this.vendorLocation.find((x) => x.supplierId == this.currentPart?.supplierInfoId);
    }
    if (this.currentPart?.buId) {
      currentBuLocation = this.buLocation.find((x) => x.buId == this.currentPart?.buId);
    }

    if ((currentVendor?.supplierDirectoryMasterDto?.city ?? '') == '' || (currentBuLocation?.city ?? '') == '') {
      this.costLoader = false;
      return;
    }

    const containerTypeId = this.logisticsInformationForm.get('ContainerType').value;
    const shipmentTypeId = this.logisticsInformationForm.get('ShipmentType').value;
    const modeOfTransportId = this.logisticsInformationForm.get('ModeOfTransport').value;

    this._logisticsSummaryCalculatorService
      .getCostCalculation(
        modeOfTransportId,
        containerTypeId,
        shipmentTypeId,
        currentVendor,
        currentBuLocation,
        this.containerSize,
        this.currentPart,
        this.materialList,
        this.currentPart.mfrCountryId,
        this.packagingObj
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (result) => {
          if (result) {
            // if (result?.containerCost == 0) {
            if (result?.totalCost == 0) {
              this.messageService.openSnackBar(`The cost between Origin and destination countries for this Mode of Transport is not valid/defined.`, '', {
                duration: 4000,
              });
            }
            this.freightCost = result;
            //let carbonFootPrintUnit = this.sharedService.isValidNumber(result.totalCo2 * (result.percentageOfShipment / 100));
            //let partCo2 = this.sharedService.isValidNumber(carbonFootPrintUnit / result.partsPerShipment);

            this.logisticsInformationForm.get('ContainerCost').setValue(this.sharedService.isValidNumber(result.containerCost));
            this.logisticsInformationForm.get('ContainerPercent').setValue(this.sharedService.isValidNumber(result.percentageOfShipment));
            this.logisticsInformationForm.get('FreightCostPerShipment').setValue(this.sharedService.isValidNumber(result.freightCostPerShipment));
            this.logisticsInformationForm.get('FreightCost')?.setValue(this.sharedService.isValidNumber(result.freightCostPerPart));
            //this.logisticsInformationForm.get('CarbonFootPrint').setValue(this.sharedService.isValidNumber(carbonFootPrintUnit));
            //this.logisticsInformationForm.get('TotalCarbonFootPrint').setValue(this.sharedService.isValidNumber(result.totalCo2));
            //this.logisticsInformationForm.get('CarbonFootPrintPerUnit').setValue(this.sharedService.isValidNumber(partCo2));

            this.logisticsInformationForm.get('PickUpCost').setValue(this.sharedService.isValidNumber(result.sourceToPortCost));
            this.logisticsInformationForm.get('PortCost').setValue(this.sharedService.isValidNumber(result.portCost));
            this.logisticsInformationForm.get('DeliveryCost').setValue(this.sharedService.isValidNumber(result.portToDestinationCost));
            this.logisticsInformationForm.get('PickUpCo2').setValue(this.sharedService.isValidNumber(result.pickUpCo2));
            this.logisticsInformationForm.get('PortCo2').setValue(this.sharedService.isValidNumber(result.co2));
            this.logisticsInformationForm.get('DeliveryCo2').setValue(this.sharedService.isValidNumber(result.deliveryCo2));

            this.setRouteData(result?.route);

            this.costLoader = false;
          } else {
            this.costLoader = false;
            this.messageService.openSnackBar(`The cost between Origin and destination countries for this Mode of Transport is not valid/defined.`, '', {
              duration: 4000,
            });
          }
        },
        (error) => {
          this.costLoader = false;
          console.error(error);
        }
      );
  }

  private setDefaultModeOfTransport() {
    let isAirMode = false;
    // Check If item is electronics then change transport mode
    // from sea to air
    if (this.defaultMode == ModeOfTransportEnum.Ocean && this.currentPart.commodityId == CommodityType.Electronics) {
      isAirMode = true;
      this.f.ModeOfTransport.setValue(ModeOfTransportEnum.Air);
    } else {
      this.f.ModeOfTransport.setValue(this.defaultMode);
    }

    if (this.currentPart?.mfrCountryId == this.currentPart?.deliveryCountryId) {
      this.f.ModeOfTransport.setValue(ModeOfTransportEnum.Surface);
    }
    if (this.packagingObj?.totalShipmentVolume > 50000000) {
      if (this.f.ModeOfTransport?.value == ModeOfTransportEnum.Surface) {
        this.logisticsInformationForm.get('ShipmentType').setValue(ShipmentTypeEnum.FTL);
        this.logisticsInformationForm.get('ContainerType').setValue(ContainerTypeEnum.Container40Ft);
      } else if (this.f.ModeOfTransport?.value == ModeOfTransportEnum.Ocean) {
        this.logisticsInformationForm.get('ShipmentType').setValue(ShipmentTypeEnum.FCL);
        this.logisticsInformationForm.get('ContainerType').setValue(ContainerTypeEnum.Container40Ft);
      }
    } else if (this.packagingObj?.totalShipmentVolume > 22000000 || this.packagingObj?.totalShipmentWeight > 16000000) {
      if (this.f.ModeOfTransport?.value == ModeOfTransportEnum.Surface) {
        this.logisticsInformationForm.get('ShipmentType').setValue(ShipmentTypeEnum.FTL);
        this.logisticsInformationForm.get('ContainerType').setValue(ContainerTypeEnum.Container20Ft);
      } else if (this.f.ModeOfTransport?.value == ModeOfTransportEnum.Ocean) {
        this.logisticsInformationForm.get('ShipmentType').setValue(ShipmentTypeEnum.FCL);
        this.logisticsInformationForm.get('ContainerType').setValue(ContainerTypeEnum.Container20Ft);
      }
    } else {
      setTimeout(() => {
        this.logisticsInformationForm.get('ShipmentType').setValue(isAirMode ? ShipmentTypeEnum.AIR : this.defaultMode == ModeOfTransportEnum.Surface ? ShipmentTypeEnum.LTL : ShipmentTypeEnum.LCL);
      }, 20);

      setTimeout(() => {
        this.logisticsInformationForm
          .get('ContainerType')
          .setValue(isAirMode ? ContainerTypeEnum.AIR : this.defaultMode == ModeOfTransportEnum.Surface ? ContainerTypeEnum.LTL : ContainerTypeEnum.LCL);

        this.onContainerTypeChange();
      }, 30);
    }
  }

  getContainerSize() {
    this._containerSize$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: ContainerSize[]) => {
      if (result?.length > 0) {
        this.containerSize = result;
      }
    });
  }

  calculateLogisticsCost() {
    const logistic = new LogisticsSummaryDto();
    logistic.currentPart = this.currentPart;
    logistic.packagingInfo = this.packagingObj;
    if (this.logisticsInformationForm.controls['ContainerCost'].dirty) {
      logistic.isContainerCostDirty = true;
    }
    if (this.logisticsInformationForm.controls['ContainerPercent'].dirty) {
      logistic.isContainerPercentDirty = true;
    }
    if (this.logisticsInformationForm.controls['FreightCostPerShipment'].dirty) {
      logistic.isFreightCostPerShipmentDirty = true;
    }
    if (this.logisticsInformationForm.controls['FreightCost'].dirty) {
      logistic.isFreightCostDirty = true;
    }
    // if (this.logisticsInformationForm.controls['TotalCarbonFootPrint'].dirty) {
    //   logistic.isTotalCarbonFootPrintDirty = true;
    // }
    // if (this.logisticsInformationForm.controls['CarbonFootPrint'].dirty) {
    //   logistic.isCarbonFootPrintDirty = true;
    // }
    // if (this.logisticsInformationForm.controls['CarbonFootPrintPerUnit'].dirty) {
    //   logistic.isCarbonFootPrintPerUnitDirty = true;
    // }
    logistic.containerPercent = this.logisticsInformationForm.get('ContainerPercent').value;
    logistic.containerCost = this.logisticsInformationForm.get('ContainerCost').value;
    logistic.freightCost = this.logisticsInformationForm.get('FreightCost').value;
    logistic.freightCostPerShipment = this.logisticsInformationForm.get('FreightCostPerShipment').value;
    //logistic.totalCarbonFootPrint = this.logisticsInformationForm.get('TotalCarbonFootPrint').value;
    // logistic.carbonFootPrint = this.logisticsInformationForm.get('CarbonFootPrint').value;
    // logistic.carbonFootPrintPerUnit = this.logisticsInformationForm.get('CarbonFootPrintPerUnit').value;

    this._logisticsSummaryCalculatorService
      .calculateLogisticsCost(logistic, this.dirtyFieldList, this.logisticsSummaryObj)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: LogisticsSummaryDto) => {
        if (result) {
          this.logisticsInformationForm.patchValue({
            FreightCostPerShipment: this.sharedService.isValidNumber(result?.freightCostPerShipment),
            FreightCost: this.sharedService.isValidNumber(result?.freightCost),
            // CarbonFootPrint: this.sharedService.isValidNumber(result?.carbonFootPrint),
            // CarbonFootPrintPerUnit: this.sharedService.isValidNumber(result?.carbonFootPrintPerUnit),
            ContainerPercent: this.sharedService.isValidNumber(result?.containerPercent),
            //TotalCarbonFootPrint: this.sharedService.isValidNumber(result?.totalCarbonFootPrint),
            ContainerCost: this.sharedService.isValidNumber(result?.containerCost),
          });
        }
      });
  }

  onContainerTypeChange() {
    if (this.logisticsInformationForm.get('ModeOfTransport').valid && this.logisticsInformationForm.get('ShipmentType').valid && this.logisticsInformationForm.get('ContainerType').valid) {
      this.calcLogisticCost(false);
    }
  }

  // getMaterialInfoList() {
  //   this._materialInfos$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: MaterialInfoDto[]) => {
  //     if (result?.length > 0) {
  //       this.materialList = result;
  //     }
  //   });
  // }

  getLogisticsSummary() {
    this.logisticsSummaryService
      .getLogisticsSummary(this.currentPart.partInfoId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: LogisticsSummaryDto) => {
        if (result) {
          this.logisticsSummaryObj = result;
          this.logisticsSummaryDtoOut.emit(this.logisticsSummaryObj);
          this.mapDataToFreightCost(result);
          if (this.logisticsSummaryObj && this.logisticsSummaryObj?.costingLogisticsId > 0) {
            if (this.logisticsInformationForm) {
              this.isApiCallRequired = false;
              this.setForm();
            }
            this.isApiCallRequired = true;
            if (this.logisticsSummaryObj?.costingLogisticsId > 0) {
              setTimeout(() => {
                this.getDirtyFields(this.logisticsSummaryObj?.costingLogisticsId);
              }, 1000);
            }
          } else {
            // //  this.getDefaultModeOfTransport();
            // this.getLessCostTransportMode();
            this.getDefaultModeOfTransport()
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe(() => {
                this.getLessCostTransportMode();
              });
          }
        }
      });
  }

  getVendorLocation() {
    this.digitalFactoryService
      .getAllDigitalFactorySuppliers()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: DigitalFactoryDtoNew[]) => {
          if (result && result?.length > 0) {
            this.vendorLocation = result;
          }
        },
      });

    this._supplierList$.pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
      if (result && result?.length > 0) {
        this.vendorLocation = result;
      }
    });
  }

  private getBuLocation() {
    this._buLocationService
      .getBuLocation()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result && result?.length) {
          this.buLocation = result;
        }
      });

    this._buLocationList$.pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
      if (result && result?.length) {
        this.buLocation = result;
      }
    });
  }

  private getPackageInfoState() {
    this.packgeInfoState$.pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
      if (result) {
        this.packagingObj = result;
      }
    });
  }

  dispatchMasterData() {
    this._store.dispatch(new LogisticsSummaryActions.GetContainerSize());
    this._store.dispatch(new MasterDataActions.GetSupplierList());
    this._store.dispatch(new MasterDataActions.GetBuLocation());
  }

  // recalculateLogisticsCost(part: any) {
  //   try {
  //     this.blockUiService.pushBlockUI('Logistics recalculate');
  //     // let currentVendor: any, currentBuLocation: any;

  //     // this.currentPart = part;
  //     // if (this.currentPart?.supplierInfoId) {
  //     //   currentVendor = this.vendorLocation.find((x) => x.supplierId == this.currentPart?.supplierInfoId);
  //     // }
  //     // if (this.currentPart?.buId) {
  //     //   currentBuLocation = this.buLocation.find((x) => x.buId == this.currentPart?.buId);
  //     // }

  //     if (this.currentPart.packingModeId != null && this.currentPart.packingModeId == 2) {
  //       this.packagingObj = new PackagingInfoDto();
  //     }

  //     this.logisticsSummaryService
  //       .getLogisticsSummary(this.currentPart.partInfoId)
  //       .pipe(takeUntil(this.unsubscribe$))
  //       .subscribe((logisticSummary: LogisticsSummaryDto) => {
  //         if (logisticSummary) {
  //           this.mapDataToFreightCost(logisticSummary);
  //           this.logisticsSummaryObj = logisticSummary;
  //           const logistic: LogisticsSummaryDto = Object.assign({}, logisticSummary);
  //           const logisticsId = logisticSummary?.costingLogisticsId || 0;
  //           this.sharedService
  //             .getColorInfos(part?.partInfoId, ScreeName.Logistic, logisticsId)
  //             .pipe(takeUntil(this.unsubscribe$))
  //             .subscribe((logisticDirtyFields: FieldColorsDto[]) => {
  //               if (this.isCountryChanged) {
  //                 logisticDirtyFields = [];
  //               }
  //               this.logisticsSummaryService
  //                 .getLogisticsRateCards(this.currentPart?.mfrCountryId, this.currentPart?.deliveryCountryId)
  //                 .pipe(takeUntil(this.unsubscribe$))
  //                 .subscribe((rateCardResult: any) => {
  //                   if (rateCardResult && rateCardResult?.length > 0) {
  //                     const rateCards: LogisticsRateCard[] = rateCardResult;
  //                     const costResults = [];

  //                     let currentVendor: any, currentBuLocation: any;
  //                     if (this.currentPart?.supplierInfoId) {
  //                       currentVendor = this.vendorLocation.find((x) => x.supplierId == this.currentPart?.supplierInfoId);
  //                     }
  //                     if (this.currentPart?.buId) {
  //                       currentBuLocation = this.buLocation.find((x) => x.buId == this.currentPart?.buId);
  //                     }
  //                     let count = 0;
  //                     rateCards?.forEach((rate) => {
  //                       const containerTypeId = rate?.containerTypeId;
  //                       const shipmentTypeId = rate?.shipmentTypeId;
  //                       const modeOfTransportId = rate?.modeOfTransportTypeId;

  //                       this._logisticsSummaryCalculatorService
  //                         .getCostCalculation(
  //                           modeOfTransportId,
  //                           containerTypeId,
  //                           shipmentTypeId,
  //                           currentVendor,
  //                           currentBuLocation,
  //                           this.containerSize,
  //                           this.currentPart,
  //                           this.materialList,
  //                           this.currentPart.mfrCountryId,
  //                           this.packagingObj
  //                         )
  //                         .pipe(takeUntil(this.unsubscribe$))
  //                         .subscribe((costResult) => {
  //                           count++;
  //                           if (costResult) {
  //                             costResults.push(costResult);
  //                             if (count === rateCards?.length) {
  //                               const sortedArray: any[] = costResults.filter((f) => f.totalCost > 0).sort((a, b) => a.freightCostPerShipment - b.freightCostPerShipment);
  //                               if (sortedArray?.length > 0) {
  //                                 const shipmentType = logistic?.shipmentType;
  //                                 const containerType = logistic?.containerType;
  //                                 // Set lowCostTransportMode, if it found exiting transport mode else assign lowest one
  //                                 // let lowCostTransportMode = sortedArray[0];
  //                                 let lowCostTransportMode: any = null;

  //                                 // Prefer default mode of transport if available
  //                                 if (this.defaultMode) {
  //                                   const defaultModeMatches = sortedArray.filter((x) => x.modeOfTransportId === this.defaultMode);
  //                                   if (defaultModeMatches.length > 0) {
  //                                     lowCostTransportMode = defaultModeMatches[0];
  //                                   }
  //                                 }

  //                                 // Fallback to the absolute cheapest if default mode not found
  //                                 if (!lowCostTransportMode) {
  //                                   lowCostTransportMode = sortedArray[0];
  //                                 }

  //                                 let isTransportChanged = false;

  //                                 if (this.isCountryChanged) {
  //                                   isTransportChanged = true;
  //                                 } else {
  //                                   const canFindMatch = !!shipmentType && !!containerType;
  //                                   if (canFindMatch) {
  //                                     const matchedMode = sortedArray.find((x) => x.shipmentTypeId === shipmentType && x.containerTypeId === containerType);
  //                                     if (matchedMode) {
  //                                       lowCostTransportMode = matchedMode;
  //                                     } else {
  //                                       isTransportChanged = true;
  //                                     }
  //                                   }
  //                                 }

  //                                 const lowCostTransport: LogisticsSummaryDto = new LogisticsSummaryDto();

  //                                 if (!isTransportChanged) {
  //                                   lowCostTransport.modeOfTransport = this.checkDirtyProperty('ModeOfTransport', logisticDirtyFields)
  //                                     ? logistic?.modeOfTransport
  //                                     : lowCostTransportMode?.modeOfTransportId;
  //                                   lowCostTransport.shipmentType = this.checkDirtyProperty('ShipmentType', logisticDirtyFields) ? logistic?.shipmentType : lowCostTransportMode?.shipmentTypeId;
  //                                   lowCostTransport.containerType = this.checkDirtyProperty('ContainerType', logisticDirtyFields) ? logistic?.containerType : lowCostTransportMode?.containerTypeId;
  //                                 } else {
  //                                   lowCostTransport.modeOfTransport = lowCostTransportMode?.modeOfTransportId;
  //                                   lowCostTransport.shipmentType = lowCostTransportMode?.shipmentTypeId;
  //                                   lowCostTransport.containerType = lowCostTransportMode?.containerTypeId;
  //                                 }

  //                                 lowCostTransport.containerCost = lowCostTransportMode?.containerCost;
  //                                 lowCostTransport.containerPercent = lowCostTransportMode?.percentageOfShipment;
  //                                 lowCostTransport.freightCostPerShipment = lowCostTransportMode?.freightCostPerShipment;
  //                                 lowCostTransport.freightCost = lowCostTransportMode?.freightCostPerPart;
  //                                 const carbonFootPrintUnit = this.sharedService.isValidNumber(lowCostTransportMode.totalCo2 * (lowCostTransportMode.percentageOfShipment / 100));
  //                                 const partCo2 = this.sharedService.isValidNumber(carbonFootPrintUnit / lowCostTransportMode.partsPerShipment);
  //                                 lowCostTransport.carbonFootPrint = this.sharedService.isValidNumber(carbonFootPrintUnit);
  //                                 lowCostTransport.totalCarbonFootPrint = this.sharedService.isValidNumber(lowCostTransportMode.totalCo2);
  //                                 lowCostTransport.carbonFootPrintPerUnit = this.sharedService.isValidNumber(partCo2);
  //                                 lowCostTransport.currentPart = part;
  //                                 lowCostTransport.packagingInfo = this.packagingObj;
  //                                 lowCostTransport.pickUpCost = Number(lowCostTransportMode?.sourceToPortCost);
  //                                 lowCostTransport.portCost = Number(lowCostTransportMode?.portCost);
  //                                 lowCostTransport.deliveryCost = Number(lowCostTransportMode?.portToDestinationCost);
  //                                 lowCostTransport.pickUpCo2 = Number(lowCostTransportMode?.pickUpCo2);
  //                                 lowCostTransport.portCo2 = Number(lowCostTransportMode?.co2);
  //                                 lowCostTransport.deliveryCo2 = Number(lowCostTransportMode?.deliveryCo2);
  //                                 lowCostTransport.route = lowCostTransportMode?.route;
  //                                 this.isRecalculate = true;
  //                                 this.freightCost = lowCostTransportMode;
  //                                 this._logisticsSummaryCalculatorService
  //                                   .calculateLogisticsCost(lowCostTransport, logisticDirtyFields, logistic)
  //                                   .pipe(takeUntil(this.unsubscribe$))
  //                                   .subscribe((calculationResult: LogisticsSummaryDto) => {
  //                                     if (calculationResult) {
  //                                       calculationResult.dataCompletionPercentage = this.percentageCalculator.logistics(calculationResult);
  //                                       this.afterChange = false;
  //                                       this.dirtyCheckEvent.emit(this.afterChange);
  //                                       this.logisticsSummaryObj = calculationResult;
  //                                       this.logisticsSummaryObj.costingLogisticsId = logisticsId;
  //                                       this.logisticsSummaryObj.partInfoId = lowCostTransportMode?.partInfoId;
  //                                       this.setForm(true);
  //                                       this.logisticsSummaryDtoOut.emit(this.logisticsSummaryObj);
  //                                       this.messageService.openSnackBar(`Recalculation completed for Logistics Section.`, '', {
  //                                         duration: 5000,
  //                                       });
  //                                       this.blockUiService.popBlockUI('Logistics recalculate');
  //                                     } else {
  //                                       this.blockUiService.popBlockUI('Logistics recalculate');
  //                                     }
  //                                   });
  //                               } else {
  //                                 this.blockUiService.popBlockUI('Logistics recalculate');
  //                               }
  //                             }
  //                             // else {
  //                             //   this.blockUiService.popBlockUI('Logistics recalculate');
  //                             // }
  //                           } else {
  //                             this.blockUiService.popBlockUI('Logistics recalculate');
  //                           }
  //                         });
  //                     });
  //                   } else {
  //                     this.blockUiService.popBlockUI('Logistics recalculate');
  //                     this.messageService.openSnackBar(`The cost between Origin and destination countries for this Mode of Transport is not valid/defined.`, '', { duration: 4000 });
  //                     this.logisticsSummaryObj = new LogisticsSummaryDto();
  //                     this.resetform();
  //                     this._store.dispatch(new LogisticsSummaryActions.DeleteLogisticInfo(this.currentPart?.partInfoId));
  //                   }
  //                 });
  //             });
  //         } else {
  //           this.blockUiService.popBlockUI('Logistics recalculate');
  //         }
  //       });
  //   } catch (error) {
  //     console.error('recalculateLogisticsCost error occurred:', error);
  //     this.blockUiService.popBlockUI('Logistics recalculate');
  //   } finally {
  //     console.log('recalculateLogisticsCost - Finally block executed.');
  //     this.blockUiService.popBlockUI('Logistics recalculate');
  //   }
  // }

  recalculateLogisticsCost(part: any) {
    try {
      this.blockUiService.pushBlockUI('Logistics recalculate');

      if (this.currentPart.packingModeId != null && this.currentPart.packingModeId == 2) {
        this.packagingObj = new PackagingInfoDto();
      }

      this.logisticsSummaryService
        .getLogisticsSummary(this.currentPart.partInfoId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((logisticSummary: LogisticsSummaryDto) => {
          if (!logisticSummary) {
            this.blockUiService.popBlockUI('Logistics recalculate');
            return;
          }

          this.mapDataToFreightCost(logisticSummary);
          this.logisticsSummaryObj = logisticSummary;

          const logistic: LogisticsSummaryDto = Object.assign({}, logisticSummary);
          const logisticsId = logisticSummary?.costingLogisticsId || 0;
          let modeOfTransportSelected = logistic?.modeOfTransport ?? 0;

          this.sharedService
            .getColorInfos(part?.partInfoId, ScreeName.Logistic, logisticsId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((logisticDirtyFields: FieldColorsDto[]) => {
              if (this.isCountryChanged) {
                logisticDirtyFields = [];
                modeOfTransportSelected = 0;
              }

              // prepare bulk API request
              const bulkRequest: LogisticsCostRequest = {
                originCountryId: this.currentPart.mfrCountryId,
                destinationCountryId: this.currentPart.deliveryCountryId,
                vendor: this.currentPart?.supplierInfoId ? this.vendorLocation.find((x) => x.supplierId === this.currentPart.supplierInfoId) : undefined,
                buLocation: this.currentPart?.buId ? this.buLocation.find((x) => x.buId === this.currentPart.buId) : undefined,
                containerSizes: this.containerSize,
                part: this.currentPart,
                materials: this.materialList,
                packaging: this.packagingObj,
                defaultMode: modeOfTransportSelected, // backend resolves actual mode
              };

              this.logisticsSummaryService
                .getBulkLogisticsCost(bulkRequest)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((bulkResults: LogisticsCostResponse[]) => {
                  if (!bulkResults || bulkResults.length === 0) {
                    this.blockUiService.popBlockUI('Logistics recalculate');
                    this.messageService.openSnackBar(`The cost between Origin and destination countries for this Mode of Transport is not valid/defined.`, '', { duration: 4000 });
                    this.logisticsSummaryObj = new LogisticsSummaryDto();
                    this.resetform();
                    this._store.dispatch(new LogisticsSummaryActions.DeleteLogisticInfo(this.currentPart?.partInfoId));
                    return;
                  }

                  const validResults = bulkResults.filter((r) => r.freightCost?.totalCost > 0).sort((a, b) => a.freightCost.freightCostPerShipment - b.freightCost.freightCostPerShipment);

                  if (validResults.length === 0) {
                    this.blockUiService.popBlockUI('Logistics recalculate');
                    this.messageService.openSnackBar(`The cost between Origin and destination countries for this Mode of Transport is not valid/defined.`, '', { duration: 4000 });
                    return;
                  }

                  // pick first
                  let lowCostTransportMode = validResults[0];
                  let freightResult = lowCostTransportMode.freightCost;

                  // TRANSPORT CHANGE LOGIC
                  const shipmentType = logistic?.shipmentType;
                  const containerType = logistic?.containerType;
                  const modeOfTransport = logistic?.modeOfTransport;
                  let isTransportChanged = false;

                  if (this.isCountryChanged) {
                    isTransportChanged = true;
                  } else {
                    const canFindMatch = !!shipmentType && !!containerType && !!modeOfTransport;

                    if (canFindMatch && lowCostTransportMode?.rateCard) {
                      // Check if all three transport parameters match the new available option
                      const matched =
                        modeOfTransport === lowCostTransportMode.rateCard.modeOfTransportTypeId &&
                        shipmentType === lowCostTransportMode.rateCard.shipmentTypeId &&
                        containerType === lowCostTransportMode.rateCard.containerTypeId;

                      // Only mark as changed if values don't match
                      if (!matched) {
                        // Check if saved values exist in any of the available results
                        const savedValuesExistInResults = bulkResults.find(
                          (result) =>
                            result.rateCard?.modeOfTransportTypeId === modeOfTransport && result.rateCard?.shipmentTypeId === shipmentType && result.rateCard?.containerTypeId === containerType
                        );

                        // If saved values still exist as valid option, use that instead
                        if (savedValuesExistInResults) {
                          lowCostTransportMode = savedValuesExistInResults;
                          freightResult = lowCostTransportMode.freightCost;
                        } else {
                          isTransportChanged = true;
                        }
                      }
                    } else {
                      // If we don't have previous values to compare, mark as changed
                      isTransportChanged = true;
                    }
                  }

                  const lowCostTransport: LogisticsSummaryDto = new LogisticsSummaryDto();

                  if (!isTransportChanged) {
                    // Preserve dirty/manually set values
                    lowCostTransport.modeOfTransport = this.checkDirtyProperty('ModeOfTransport', logisticDirtyFields)
                      ? logistic?.modeOfTransport
                      : lowCostTransportMode.rateCard.modeOfTransportTypeId;

                    lowCostTransport.shipmentType = this.checkDirtyProperty('ShipmentType', logisticDirtyFields) ? logistic?.shipmentType : lowCostTransportMode.rateCard.shipmentTypeId;

                    lowCostTransport.containerType = this.checkDirtyProperty('ContainerType', logisticDirtyFields) ? logistic?.containerType : lowCostTransportMode.rateCard.containerTypeId;
                  } else {
                    // If transport has changed, use the new optimal values
                    lowCostTransport.modeOfTransport = lowCostTransportMode.rateCard.modeOfTransportTypeId;
                    lowCostTransport.shipmentType = lowCostTransportMode.rateCard.shipmentTypeId;
                    lowCostTransport.containerType = lowCostTransportMode.rateCard.containerTypeId;
                  }

                  // MAP AVAILABLE FREIGHT COST FIELDS
                  lowCostTransport.containerCost = freightResult.containerCost;
                  lowCostTransport.containerPercent = freightResult.percentageOfShipment;
                  lowCostTransport.freightCostPerShipment = freightResult.freightCostPerShipment;
                  lowCostTransport.freightCost = freightResult.freightCostPerPart;

                  lowCostTransport.pickUpCost = freightResult.sourceToPortCost;
                  lowCostTransport.portCost = freightResult.portCost;
                  lowCostTransport.deliveryCost = freightResult.portToDestinationCost;

                  lowCostTransport.pickUpCo2 = freightResult.pickUpCo2;
                  lowCostTransport.portCo2 = freightResult.co2;
                  lowCostTransport.deliveryCo2 = freightResult.deliveryCo2;

                  lowCostTransport.totalCarbonFootPrint = freightResult.totalCo2;
                  lowCostTransport.carbonFootPrint = freightResult.totalCo2;
                  lowCostTransport.carbonFootPrintPerUnit = freightResult.totalCo2 && freightResult.partsPerShipment ? freightResult.totalCo2 / freightResult.partsPerShipment : 0;

                  lowCostTransport.route = freightResult.route;
                  lowCostTransport.currentPart = part;
                  lowCostTransport.packagingInfo = this.packagingObj;

                  this.isRecalculate = true;
                  this.freightCost = freightResult;

                  // CONTINUE WITH CALCULATOR
                  this._logisticsSummaryCalculatorService
                    .calculateLogisticsCost(lowCostTransport, logisticDirtyFields, logistic)
                    .pipe(takeUntil(this.unsubscribe$))
                    .subscribe((calculationResult: LogisticsSummaryDto) => {
                      if (calculationResult) {
                        calculationResult.dataCompletionPercentage = this.percentageCalculator.logistics(calculationResult);
                        this.afterChange = false;
                        this.dirtyCheckEvent.emit(this.afterChange);
                        this.logisticsSummaryObj = calculationResult;
                        this.logisticsSummaryObj.costingLogisticsId = logisticsId;
                        this.logisticsSummaryObj.partInfoId = this.currentPart?.partInfoId;
                        this.setForm(true);
                        this.logisticsSummaryDtoOut.emit(this.logisticsSummaryObj);
                        this.messageService.openSnackBar(`Recalculation completed for Logistics Section.`, '', {
                          duration: 5000,
                        });
                      }

                      this.blockUiService.popBlockUI('Logistics recalculate');
                    });
                });
            });
        });
    } catch (error) {
      console.error('recalculateLogisticsCost error occurred:', error);
      this.blockUiService.popBlockUI('Logistics recalculate');
    } finally {
      this.blockUiService.popBlockUI('Logistics recalculate');
    }
  }

  private checkDirtyProperty(formCotrolName: string, fieldList: any[]) {
    let res = false;
    if (fieldList) {
      const info = fieldList.filter((x) => x.formControlName == formCotrolName && x.isDirty == true);
      if (info.length > 0) {
        res = true;
      }
    }
    return res;
  }

  mapDataToFreightCost(result: LogisticsSummaryDto) {
    this.freightCost = new FreightCostResponseDto();
    this.freightCost.sourceToPortCost = result.pickUpCost;
    this.freightCost.pickUpCost = result.pickUpCost;
    this.freightCost.portCost = result.portCost;
    this.freightCost.portToDestinationCost = result.deliveryCost;
    this.freightCost.deliveryCost = result.deliveryCost;
    this.freightCost.pickUpCo2 = result.pickUpCo2;
    this.freightCost.co2 = result.portCo2;
    this.freightCost.deliveryCo2 = result.deliveryCo2;
    this.freightCost.totalAnnualCost = result.freightCost;
    this.freightCost.totalCost = result.freightCost;
    this.freightCost.route = result.route;
  }

  private saveDirtyFields(logisticsId: number) {
    const dirtyItems = [];
    this.dirtyFieldList = [];
    for (const el in this.logisticsInformationForm.controls) {
      if (this.logisticsInformationForm.controls[el].dirty || this.logisticsInformationForm.controls[el].touched) {
        const fieldColorsDto = new FieldColorsDto();
        fieldColorsDto.isDirty = this.logisticsInformationForm.controls[el].dirty;
        fieldColorsDto.formControlName = el;
        fieldColorsDto.isTouched = this.logisticsInformationForm.controls[el].touched;
        fieldColorsDto.partInfoId = this.currentPart.partInfoId;
        fieldColorsDto.screenId = ScreeName.Logistic;
        fieldColorsDto.primaryId = logisticsId;
        dirtyItems.push(fieldColorsDto);
      }
    }
    if (dirtyItems.length > 0) {
      this.sharedService
        .updateColorInfo(dirtyItems)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          if (result) {
            this.dirtyFieldList = result;
            result.forEach((element) => {
              if (element.isTouched) {
                this.logisticsInformationForm.get(element.formControlName).markAsTouched();
              }
              if (element.isDirty) {
                this.logisticsInformationForm.get(element.formControlName).markAsDirty();
              }
            });
          }
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  private getDirtyFields(logisticsId: number) {
    this.dirtyFieldList = [];
    this.susTainabilityDirtyFieldList = [];
    if (logisticsId > 0 && !!this.currentPart && this.currentPart?.partInfoId) {
      this.sharedService
        .getColorInfos(this.currentPart?.partInfoId, ScreeName.SustainabilityLogistic, logisticsId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: FieldColorsDto[]) => {
          if (result) {
            this.susTainabilityDirtyFieldList = result;
          }

          this.sharedService
            .getColorInfos(this.currentPart?.partInfoId, ScreeName.Logistic, logisticsId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((result: FieldColorsDto[]) => {
              if (result) {
                this.dirtyFieldList = result;
              }
              result?.forEach((element) => {
                if (element?.isTouched) {
                  this.logisticsInformationForm.get(element?.formControlName)?.markAsTouched();
                }
                if (element?.isDirty) {
                  this.logisticsInformationForm.get(element?.formControlName)?.markAsDirty();
                }
              });
              this.calculateLogisticsCost();
              this.afterChange = false;
              this.dirtyCheckEvent.emit(this.afterChange);
            });
        });
    }
  }
}
