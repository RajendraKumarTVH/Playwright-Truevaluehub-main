import { Injectable, inject, effect } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, combineLatest, tap, map, BehaviorSubject } from 'rxjs';
import { CostOverHeadProfitDto, MedbFgiccMasterDto, MedbIccMasterDto, MedbOverHeadProfitDto } from 'src/app/shared/models/overhead-Profit.model';
import { MedbOhpState } from 'src/app/modules/_state/medbOHP.state';
import { FgiccState } from 'src/app/modules/_state/fgicc.state';
import { IccState } from 'src/app/modules/_state/icc.state';
import { ToolingHelperService } from 'src/app/shared/helpers/tooling-helper.service';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { CostToolingDto, ToolingMaterialInfoDto, ToolingRefLookup } from 'src/app/shared/models/tooling.model';
// import { ToolingInfoState } from 'src/app/modules/_state/costing-tooling-info.state';
import { ToolingLookupState } from 'src/app/modules/_state/tooling-lookup.state';
import { CountryDataMasterDto, MaterialTypeDto, PartInfoDto, ViewCostSummaryDto } from 'src/app/shared/models';
import { InjectionMouldingTool, SheetMetalTools } from 'src/app/shared/enums';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
// import { CostSummaryState } from 'src/app/modules/_state/cost-summary.state';
import { OverheadProfitState } from 'src/app/modules/_state/overhead-profit.state';
import { ToolingCountryData } from 'src/app/shared/models/tooling-master-data';
import { CommodityType } from 'src/app/modules/costing/costing.config';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ToolingCountryMasterState } from 'src/app/modules/_state/ToolingMaster.state';
import { CostToolingRecalculationService } from 'src/app/modules/costing/services/automation/cost-tooling-recalculation.service';
// import * as ToolingInfoActions from 'src/app/modules/_actions/tooling-info.action';
import { CostToolingSignalsService } from 'src/app/shared/signals/cost-tooling-signals.service';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

@Injectable({
  providedIn: 'root',
})
export class CostingToolingRecalculationService {
  public countryList: CountryDataMasterDto[] = [];
  public toolingMasterData: any = [];
  private _store = inject(Store);
  _medbohp$: Observable<MedbOverHeadProfitDto[]> = this._store.select(MedbOhpState.getMedbOverHeadProfitData);
  _fgicc$: Observable<MedbFgiccMasterDto[]> = this._store.select(FgiccState.getMedbFgiccData);
  _icc$: Observable<MedbIccMasterDto[]> = this._store.select(IccState.getMedbIccData);
  public medOverHeadProfitData: { medbMohList: MedbOverHeadProfitDto; medbFohList: MedbOverHeadProfitDto; medbSgaList: MedbOverHeadProfitDto; medbProfitList: MedbOverHeadProfitDto };
  _countryData$: Observable<CountryDataMasterDto[]> = this._store.select(CountryDataState.getCountryData);
  public currentPart: PartInfoDto;
  // _costSummary$: Observable<ViewCostSummaryDto[]> = this._store.select(CostSummaryState.getCostSummarys);
  _overheadprofit$: Observable<CostOverHeadProfitDto> = this._store.select(OverheadProfitState.getOverheadProfit);
  _countryToolingData$: Observable<ToolingCountryData[]> = this._store.select(ToolingCountryMasterState.getToolingCountryMasterData);
  // _toolingInfo$: Observable<CostToolingDto[]> = this._store.select(ToolingInfoState.getToolingInfosByPartInfoId);
  _lookup$: Observable<ToolingRefLookup[]> = this._store.select(ToolingLookupState.getToolingLookup);
  public costSummaryViewData: ViewCostSummaryDto;
  public toolcountryList: CountryDataMasterDto[] = [];
  public filteredMfrCountryList$: Observable<CountryDataMasterDto[]>;
  public toolInfoList: CostToolingDto[] = [];
  public toolNamesList: any = [];
  public moldItemDescsriptionsList: any = [];
  public toolingMaterialInfoList: ToolingMaterialInfoDto[] = [];
  public bopDescriptionList: any = [];
  public processGroupList: any = [];
  public isEnableUnitConversion = false;
  public materialTypeMasterList: MaterialTypeDto[] = [];
  public conversionValue: any;
  public changeFlags = { isSupplierCountryChanged: false, isCountryChanged: false, isToollifeChanged: false, lifeTimeRemainingChange: false, complexityChanged: false, surfaceFinishChanged: false };
  public toolingLookupData: {
    toolingIMLookupList: ToolingRefLookup[];
    toolingBendingLookupList: ToolingRefLookup[];
    toolingCuttingLookupList: ToolingRefLookup[];
    toolingFormingLookupList: ToolingRefLookup[];
  };
  public costOverHeadProfitobj: CostOverHeadProfitDto;
  private readonly _toolEntries$ = new BehaviorSubject<any>(null);
  costSummaryEffect = effect(() => {
    const costSummarys = this.costSummarySignalsService.costSummarys();
    if (costSummarys && costSummarys?.length > 0) {
      this.costSummaryViewData = costSummarys[0];
    }
  });

  constructor(
    public _toolConfig: ToolingConfigService,
    public _toolingHelper: ToolingHelperService,
    public sharedService: SharedService,
    private costToolingRecalculationService: CostToolingRecalculationService,
    private toolingInfoSignalsService: CostToolingSignalsService,
    private costSummarySignalsService: CostSummarySignalsService
  ) {
    this._countryToolingData$?.subscribe((result) => {
      if (result && result.length > 0) {
        this.toolingMasterData = result;
      }
    });
    this._countryData$?.subscribe((result) => {
      if (result && result.length > 0) {
        this.countryList = result;
      }
    });
    // this._costSummary$?.subscribe((result) => {
    //   if (result && result.length > 0) {
    //     this.costSummaryViewData = result[0];
    //   }
    // });

    this.changeFlags = { ...this._toolConfig.changeFlags };
    [this.isEnableUnitConversion, this.conversionValue] = this.sharedService.setUnitMeasurement();
    this.getLookupValues();
    effect(() => {
      const toolInfoList = this.toolingInfoSignalsService.toolingInfos() ?? [];
      console.log('ToolInfoList', toolInfoList);
      this.toolInfoList = toolInfoList;
      this._toolEntries$.next({
        costTooling: toolInfoList,
        toolNamesList: this.toolNamesList,
      });
    });
  }
  setCurrentPart(part: PartInfoDto) {
    this.currentPart = part;
    // this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(this.currentPart.partInfoId));
    this.toolingInfoSignalsService.getToolingInfosByPartInfoId(this.currentPart.partInfoId);
    this.loadDataBasedonCommodity();
  }

  getLookupValues() {
    return this._lookup$.pipe(
      tap((result: ToolingRefLookup[]) => {
        if (result?.length > 0) {
          this.toolingLookupData = {
            toolingIMLookupList: result?.filter((x) => x.toolingRefType == InjectionMouldingTool.InjectionMoulding),
            toolingBendingLookupList: result?.filter((x) => x.toolingRefType == SheetMetalTools.SheetMetalBending),
            toolingCuttingLookupList: result?.filter((x) => x.toolingRefType == SheetMetalTools.SheetMetalCutting),
            toolingFormingLookupList: result?.filter((x) => x.toolingRefType == SheetMetalTools.SheetMetalForming),
          };
        }
      }),
      map(() => this.toolingLookupData)
    );
  }

  public getOverHeadProfitData() {
    return this._overheadprofit$.pipe(
      tap((result: CostOverHeadProfitDto) => {
        if (result && result?.costOverHeadProfitId > 0) {
          this.costOverHeadProfitobj = result;
        }
      })
    );
  }

  getToolEntries(): Observable<{
    costTooling: CostToolingDto[];
    toolNamesList: { id: number; name: string }[];
  }> {
    // return this._toolingInfo$.pipe(
    //   tap((result: CostToolingDto[]) => {
    //     console.log('ToolInfoList', result);
    //     if (result && result.length > 0) {
    //       this.toolInfoList = result;
    //     }
    //   }),
    //   map(() => {
    //     return {
    //       costTooling: this.toolInfoList,
    //       toolNamesList: this.toolNamesList,
    //     };
    //   })
    // );
    return this._toolEntries$.asObservable();
  }

  toolIdToNameConversion() {
    this.toolInfoList = this.toolInfoList.map((tool) => {
      return {
        ...tool,
        toolingName: this.toolNamesList?.find((desc) => desc.id === tool.toolingNameId)?.name || null,
      };
    });
  }
  loadDataBasedonCommodity() {
    if (this.currentPart?.commodityId) {
      this._toolConfig.commodity.isInjMoulding = this.currentPart?.commodityId === CommodityType.PlasticAndRubber;
      this._toolConfig.commodity.isSheetMetal = this.currentPart?.commodityId === CommodityType.SheetMetal;
      this._toolConfig.commodity.isCasting = this.currentPart?.commodityId === CommodityType.Casting;
      this.toolNamesList = this._toolConfig.getToolNames(this.currentPart?.commodityId);
      this.moldItemDescsriptionsList = this._toolConfig.getMoldItemDescription(this.currentPart?.commodityId);
      this.bopDescriptionList = this._toolConfig._bopConfig.getBOPDescription(this.currentPart?.commodityId);
      this.processGroupList = this._toolConfig._toolingProcessConfig.getProcessGroups(this.currentPart?.commodityId);
    }
  }

  getMasterData(): Observable<{ medbMohList: MedbOverHeadProfitDto; medbFohList: MedbOverHeadProfitDto; medbSgaList: MedbOverHeadProfitDto; medbProfitList: MedbOverHeadProfitDto }> {
    return combineLatest([this._medbohp$, this._fgicc$, this._icc$]).pipe(
      tap(([medbohp, _fgicc, _icc]) => {
        const annualVolume = this.currentPart?.eav ?? 0;
        const txtVolumeCat = this._toolConfig.getVolumeCategory(annualVolume);
        const countryId = this.currentPart?.mfrCountryId;
        if (medbohp?.length) {
          this.medOverHeadProfitData = this._toolingHelper.getMedbOverHeadProfitData(medbohp, countryId, txtVolumeCat);
        }
      }),
      map(() => this.medOverHeadProfitData)
    );
  }

  recalculateToolingCost(
    info: any,
    marketMonth,
    countryList,
    changeFlags,
    conversionValue,
    isEnableUnitConversion,
    toolingLookupData,
    toolingMasterData,
    costSummaryViewData,
    medOverHeadProfitData,
    costOverHeadProfitobj
  ): Observable<CostToolingDto[]> {
    return this.costToolingRecalculationService.recalculateToolingCost(
      info,
      marketMonth,
      this.toolInfoList[0]?.sourceCountryId,
      countryList ?? this.countryList,
      changeFlags ?? this.changeFlags,
      conversionValue ?? this.conversionValue,
      isEnableUnitConversion ?? this.isEnableUnitConversion,
      toolingLookupData ?? this.toolingLookupData,
      toolingMasterData ?? this.toolingMasterData,
      this.costSummaryViewData,
      medOverHeadProfitData ?? this.medOverHeadProfitData,
      costOverHeadProfitobj ?? this.costOverHeadProfitobj
    );
  }
}
