import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, provideAnimations, provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withFetch, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AppConfigurationService } from './shared/services/app-configuration.service';
import { tvhAzureBlobUrlToken } from './app.token';
import { MaterialModule } from './shared/material.module';
import { BlockUIModule } from 'ng-block-ui';
import { SamplingRateState } from './modules/_state/sampling-rate.state';
import { ProcessMasterState } from './modules/_state/process-master.state';
import { CommodityState } from './modules/_state/commodity.state';
import { SubCommodityState } from './modules/_state/subCommodity.state';
import { CountryDataState } from './modules/_state/country.state';
import { FgiccState } from './modules/_state/fgicc.state';
import { IccState } from './modules/_state/icc.state';
import { LaborRateState } from './modules/_state/laborrate.state';
import { CountryPlatingState } from './modules/_state/country-plating.state';
import { MachineTypeState } from './modules/_state/machine-type.state';
import { MaterialGroupState } from './modules/_state/material-group.state';
import { MaterialTypeState } from './modules/_state/material-type.state';
import { MedbPaymentMasterState } from './modules/_state/medb-payment-master.state';
import { MedbOhpState } from './modules/_state/medbOHP.state';
import { ProcessTypeState } from './modules/_state/process-type.state';
import { TechnologyState } from './modules/_state/technology.state';
import { SecondaryProcessMachineState } from './modules/_state/sec-machine-desc.state';
import { SecondaryProcessDeburringMachineState } from './modules/_state/sec-deburring-machine-desc.state';
import { SecondaryProcessMaterialState } from './modules/_state/sec-powder-coating-material.state';
import { SecondaryProcessPowderCoatingMachineState } from './modules/_state/sec-powder-coating-machine.state';
import { SecondaryProcessPowderCoatingStockState } from './modules/_state/sec-powder-coating-stock.state';
import { SecondaryProcessShotBlastingState } from './modules/_state/sec-shot-blasting-machine-desc.state';
import { DrillingCuttingSpeedState } from './modules/_state/machining-drilling-lookup.state';
import { PartingCuttingSpeedState } from './modules/_state/machining-parting-cuttingspeed.state';
import { HandlingTimeState } from './modules/_state/sheetmetal-handling-time-lookup.state';
import { ToolLoadingTimeState } from './modules/_state/sheetmetal-tool-loadingtime.state';
import { StrokeRateState } from './modules/_state/sheetmetal-stroke-rate.state';
import { StrokeRateManualState } from './modules/_state/sheetmetal-stroke-rate-manual.state';
import { LaserCuttingState } from './modules/_state/laser-cutting-lookup.state';
import { StampingMetrialLookUpState } from './modules/_state/stamping-material-lookup.state';
import { ConnectorAssemblyManufacturingLookUpState } from './modules/_state/connector-assembly-manufacturing-lookup.state';
import { TurningState } from './modules/_state/machining-turning-info.state';
import { FacingState } from './modules/_state/machining-facing-info.state';
// import { GroovingState } from './modules/_state/machining-grooving-lookup.state';
import { FaceMillingState } from './modules/_state/machining-face-milling.state';
import { SlotState } from './modules/_state/machining-slot-milling.state';
import { EndMillingState } from './modules/_state/machining-end-milling.state';
import { GrindingState } from './modules/_state/machining-grinding.state';
import { ToolingLookupState } from './modules/_state/tooling-lookup.state';
import { GearCuttingState } from './modules/_state/machining-gearcutting.state';
import { GetMigDataState } from './modules/_state/machining-getmig-lookup.state';
import { GetForgingState } from './modules/_state/forging-lookup-state';
import { BoringState } from './modules/_state/machining-boring.state';
import { TappingState } from './modules/_state/machining-tapping.state';
import { SimulationState } from './modules/_state/simulation.state';
// import { MaterialInfoState } from './modules/_state/material-info.state';
import { OverheadProfitState } from './modules/_state/overhead-profit.state';
// import { PartInfoState } from './modules/_state/part-info.state';
// import { ProcessInfoState } from './modules/_state/process-info.state';
import { SecondaryProcessInfoState } from './modules/_state/secondary-process.state';
// import { BomTreeState } from './modules/_state/bom.state';
// import { CostSummaryState } from './modules/_state/cost-summary.state';
// import { CotsInfoState } from './modules/_state/cots-info.state';
import { PackagingInfoState } from './modules/_state/packaging-info.state';
import { SupplierBuLocationState } from './modules/_state/supplier-bu-location.state';
import { LogisticsSummaryState } from './modules/_state/logistics-summary.state';
// import { ToolingInfoState } from './modules/_state/costing-tooling-info.state';
import { DataExtractionState } from './modules/_state/dataextraction.state';
// import { ScenarioState } from './modules/_state/project-scenario.state';
// import { CommentFieldState } from './modules/_state/comment-field.state';
import { ThermoFormingState } from './modules/_state/thermal-forming-lookup.state';
import { WiringHarnessState } from './modules/_state/wiringHarness.state';
import { UserState } from './modules/_state/user.state';
import { ThermoFormingTimeState } from './modules/_state/thermal-forming-time.state';
import { ToolingCountryMasterState } from './modules/_state/ToolingMaster.state';
import { ElectronicsState } from './modules/_state/electronics.state';
import { PlasmaCuttingState } from './modules/_state/plasma-cutting-lookup.state';
import { GoogleMapsModule } from '@angular/google-maps';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.route';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { MsalRedirectComponent } from '@azure/msal-angular';
// import Lara from '@primeng/themes/aura';
import Lara from '@primeng/themes/lara';

import { UnspscMasterState } from './modules/_state/unspsc-master.state';
import { HtsMasterState } from './modules/_state/hts-master.state';
import { PcbMaterialMarketDataState } from './modules/_state/pcb-info.state';
import { TableFilterState } from './modules/_state/table.state';
import { StockFormsState } from './modules/_state/stock-forms.state';
import { StockFormsCategoriesState } from './modules/_state/stock-forms-categories.state';
import { MarketMonthState } from './modules/_state/market-month.state';
import { UserCanUpdateCostingState } from './modules/_state/userCanUpdate-costing.state';
import { CountryFormMatrixState } from './modules/_state/country-form-matrix-state';
import { UserGroupState } from './modules/_state/user-group-state';
import { provideHighcharts } from 'highcharts-angular';
import { BlockUiInterceptor } from './_helpers/block-ui.interceptor';

const intializeAppFn = () => {
  const configService = inject(AppConfigurationService);
  const configFilename = 'assets/' + environment.config.configFilename;
  return configService.loadConfigurationData(configFilename).then(
    () => {},
    () => {}
  );
};

const preset: typeof Lara = {
  ...Lara,
  semantic: {
    ...Lara.semantic,
    primary: {
      50: '#f5f9ff',
      100: '#d0e1fd',
      200: '#abc9fb',
      300: '#85b2f9',
      400: '#609af8',
      500: '#3b82f6',
      600: '#326fd1',
      700: '#295bac',
      800: '#204887',
      900: '#1e3a8a',
      950: '#183462',
    },
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [
        CommodityState,
        SubCommodityState,
        CountryDataState,
        StockFormsState,
        MarketMonthState,
        UserCanUpdateCostingState,
        StockFormsCategoriesState,
        CountryFormMatrixState,
        UserGroupState,
        FgiccState,
        IccState,
        LaborRateState,
        CountryPlatingState,
        MachineTypeState,
        MaterialGroupState,
        MaterialTypeState,
        MedbPaymentMasterState,
        MedbOhpState,
        ProcessMasterState,
        ProcessTypeState,
        SamplingRateState,
        TechnologyState,
        SecondaryProcessMachineState,
        SecondaryProcessDeburringMachineState,
        SecondaryProcessMaterialState,
        SecondaryProcessPowderCoatingMachineState,
        SecondaryProcessPowderCoatingStockState,
        SecondaryProcessShotBlastingState,
        DrillingCuttingSpeedState,
        PartingCuttingSpeedState,
        HandlingTimeState,
        ToolLoadingTimeState,
        StrokeRateState,
        StrokeRateManualState,
        LaserCuttingState,
        StampingMetrialLookUpState,
        ConnectorAssemblyManufacturingLookUpState,
        TurningState,
        FacingState,
        // GroovingState,
        FaceMillingState,
        SlotState,
        EndMillingState,
        GrindingState,
        ToolingLookupState,
        GearCuttingState,
        GetMigDataState,
        GetForgingState,
        BoringState,
        TappingState,
        SimulationState,
        // MaterialInfoState,
        OverheadProfitState,
        // PartInfoState,
        // ProcessInfoState,
        SecondaryProcessInfoState,
        // BomTreeState,
        // CostSummaryState,
        // CotsInfoState,
        PackagingInfoState,
        LogisticsSummaryState,
        SupplierBuLocationState,
        // ToolingInfoState,
        DataExtractionState,
        // CommentFieldState,
        // ScenarioState,
        ThermoFormingState,
        WiringHarnessState,
        UserState,
        ThermoFormingTimeState,
        ToolingCountryMasterState,
        ElectronicsState,
        PlasmaCuttingState,
        UnspscMasterState,
        HtsMasterState,
        PcbMaterialMarketDataState,
        TableFilterState,
      ],
      { developmentMode: !environment.production, selectorOptions: {} },
      //withNgxsFormPlugin(),
      //withNgxsLoggerPlugin({ logger: console, collapsed: false, disabled: true }),
      withNgxsReduxDevtoolsPlugin({ disabled: environment.production }),
      //withNgxsRouterPlugin(),
      withNgxsStoragePlugin({ keys: '*', storage: 0 })
    ),
    providePrimeNG({
      theme: {
        preset: preset,
        options: {
          prefix: 'p',
          darkModeSelector: 'none',
          cssLayer: {
            name: 'primeng',
            order: 'primeng, tailwind-base, tailwind-utilities',
          },
        },
      },
      ripple: true,
    }),
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      MaterialModule,
      FormsModule,
      ReactiveFormsModule,
      //SharedModule,
      BlockUIModule.forRoot(),
      GoogleMapsModule
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(intializeAppFn),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BlockUiInterceptor,
      multi: true,
    },
    provideNoopAnimations(),
    provideAnimations(),
    { provide: tvhAzureBlobUrlToken, useValue: environment.azureBlobUrl },
    MsalRedirectComponent, // This is needed for MSAL redirect component to work properly
    provideHighcharts({
      instance: () => import('highcharts/esm/highcharts').then((m) => m.default),
      options: {
        accessibility: {
          enabled: true,
        },
        credits: {
          enabled: false,
        },
        chart: {
          backgroundColor: 'transparent',
          style: {
            fontFamily: 'Poppins, sans-serif',
          },
        },
      },
    }),
  ],
};
