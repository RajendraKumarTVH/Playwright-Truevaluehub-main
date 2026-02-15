import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
// import { CmToInchesPipe } from 'src/app/shared/pipes/UnitConversion/cmToInches.pipe';
import { CmToMmPipe } from 'src/app/shared/pipes/UnitConversion/cmToMm.pipe';
import { FeetToMmPipe } from 'src/app/shared/pipes/UnitConversion/feetToMm.pipe';
// import { InchesToCmPipe } from 'src/app/shared/pipes/UnitConversion/inchesToCm.pipe';
import { InchesToMmPipe } from 'src/app/shared/pipes/UnitConversion/inchesToMm.pipe';
import { MToMmPipe } from 'src/app/shared/pipes/UnitConversion/mToMm.pipe';
import { MmToCmPipe } from 'src/app/shared/pipes/UnitConversion/mmToCm.pipe';
import { MmToFeetPipe } from 'src/app/shared/pipes/UnitConversion/mmToFeet.pipe';
import { MmToInchesPipe } from 'src/app/shared/pipes/UnitConversion/mmToInches.pipe';
import { MmToMetersPipe } from 'src/app/shared/pipes/UnitConversion/mmToMeters.pipe';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';
import { CostingConfig } from '../costing.config';
import { DataExtraction } from 'src/app/shared/models/data-extraction.model';
import { DataExtractionState } from '../../_state/dataextraction.state';
import { Store } from '@ngxs/store';
import { UserGroupState } from '../../_state/user-group-state';
import { UserGroupDto } from 'src/app/shared/models';
import { SharedSignalsService } from 'src/app/shared/signals/shared-signals.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService extends BaseHttpService implements OnDestroy {
  _dataExtraction$: Observable<DataExtraction> = this._store.select(DataExtractionState.getDataExtraction);
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private readonly workflowStatusChangedSub$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly workflowStatusChanged$: Observable<boolean> = this.workflowStatusChangedSub$.asObservable();
  private readonly materialInfoCreatedDateSub$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public readonly materialInfoCreatedDate$: Observable<string> = this.materialInfoCreatedDateSub$.asObservable();

  public extractedMaterialData: any = null;
  public extractedProcessData: any = null;
  public extractedDfmData: any = null;
  public extractedCotsData: any = null;
  public extractedCoreData: any = null;
  public datumCentroid: any = null;
  _userGroupsData$: Observable<UserGroupDto[]> = this._store.select(UserGroupState.getUserGroups);
  userGroupsDtos: UserGroupDto[] = [];
  costSummaryIsNumeric = signal<boolean>(false);
  costSummaryActiveTabIndex = signal<number>(0);

  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    private mmToInchesPipe: MmToInchesPipe,
    private mmToCmPipe: MmToCmPipe,
    private inchesToMMpipe: InchesToMmPipe,
    private cmToMMpipe: CmToMmPipe,
    // private cmToInchesPipe: CmToInchesPipe,
    // private inchesToCmPipe: InchesToCmPipe,
    private mmToMetersPipe: MmToMetersPipe,
    private mToMmPipe: MToMmPipe,
    private mmToFeetPipe: MmToFeetPipe,
    private feetToMmPipe: FeetToMmPipe,
    protected _apiCacheService: ApiCacheService,
    private _costingConfig: CostingConfig,
    private _store: Store,
    public sharedSignal: SharedSignalsService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
    this.initGetExtractedData();
    this._userGroupsData$.subscribe((result: UserGroupDto[]) => {
      if (result && result.length > 0) {
        this.userGroupsDtos = result;
      }
    });
  }

  updateColorInfo(fieldColorsDto: FieldColorsDto[]): Observable<FieldColorsDto[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/ProjectInfo/addpojectfieldproperties`;
    return this.postEx<FieldColorsDto[], FieldColorsDto[]>(url, httpOptions, fieldColorsDto).pipe(catchError(this.handleError<FieldColorsDto[]>('updateColorInfo')));
  }

  getColorInfos(partInfoId: number, screenId: number, primaryId: number): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectInfo/partInfo/${partInfoId}/projectFieldProperties/${screenId}/primaryid/${primaryId}`;
    return this.getEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('getColorInfo')));
  }

  getColorInfosByPartinfo(partInfoId: number): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectInfo/GetPojectFieldPropertiesByPartInfo/${partInfoId}`;
    return this.getEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('getColorInfo')));
  }

  clearDirtyFields(partInfoId: number): Observable<any> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/ProjectInfo/clearfieldproperties`;
    return this.postEx<any, any>(url, httpOptions, partInfoId).pipe(catchError(this.handleError<FieldColorsDto[]>('clearDirtyFields')));
  }

  getToolingCountryMaster(): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ToolingCountryMaster/GetToolingCountryMaster`;
    return this.getMasterEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('GetToolingCountryMaster')));
  }

  public isValidNumber(value: any): number {
    return !value || Number.isNaN(value) || !Number.isFinite(Number(value)) || value < 0 ? 0 : Number(Number(value)?.toFixed(this.appConfigurationService?.configuration?.numberOfDecimals || 4));
  }

  public defaultReturn(value: number) {
    return value;
  }

  public checkDirtyProperty(formCotrolName: string, fieldList: any[]) {
    let res = false;
    if (fieldList) {
      const info = fieldList.filter((x) => x.formControlName === formCotrolName && x.isDirty === true);
      if (info.length > 0) {
        res = true;
      }
    }
    return res;
  }

  public checkSubProcessDirtyProperty(formCotrolName: string, fieldList: any[]) {
    let res = false;
    if (fieldList) {
      const info = fieldList.filter((x) => x.subProcessIndex !== null && x.formControlName === formCotrolName && x.isDirty === true);
      if (info.length > 0) {
        res = true;
      }
    }
    return res;
  }

  isValidJSON(jsonString) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  getUnitMeasurement(): [boolean, string] {
    const user = localStorage.getItem('user');
    let isEnableUnitConversion = false;
    let conversionValue = 'mm';
    if (JSON.parse(user)) {
      const users = JSON.parse(user);
      if (users.client.uomId) {
        isEnableUnitConversion = true;
        conversionValue = this._costingConfig.getUnitOfMeasure()?.find((x) => x.id == users.client.uomId)?.convertionValue;
      }
    }
    return [isEnableUnitConversion, conversionValue];
  }

  public convertUomInUI(value: number, conversionValue: string, isEnableUnitConversion: boolean) {
    if (value > 0 && conversionValue && isEnableUnitConversion) {
      switch (conversionValue) {
        case 'inches': {
          value = this.mmToInchesPipe.transform(value);
          break;
        }
        case 'cm': {
          value = this.mmToCmPipe.transform(value);
          break;
        }
        case 'm': {
          value = this.mmToMetersPipe.transform(value);
          break;
        }
        case 'feet': {
          value = this.mmToFeetPipe.transform(value);
          break;
        }
        default: {
          break;
        }
      }
    }
    return this.isValidNumber(value);
  }

  public convertUomToSaveAndCalculation(value: number, conversionValue: string, isEnableUnitConversion: boolean) {
    if (value > 0 && conversionValue && isEnableUnitConversion) {
      switch (conversionValue) {
        case 'inches': {
          value = this.inchesToMMpipe.transform(value);
          break;
        }
        case 'cm': {
          value = this.cmToMMpipe.transform(value);
          break;
        }
        case 'm': {
          value = this.mToMmPipe.transform(value);
          break;
        }
        case 'feet': {
          value = this.feetToMmPipe.transform(value);
          break;
        }
        default: {
          break;
        }
      }
    }
    return value > 0 ? this.isValidNumber(value) : value;
  }

  public sortObjectbyInteger(objArr: Array<any>, objAttri: string, arrInt: Array<number>) {
    // return objArr.sort((a, b) => arrInt.indexOf(a.id) - arrInt.indexOf(b.id));
    const sortedArray = objArr.sort((a, b) => {
      const valA = a[objAttri];
      const valB = b[objAttri];
      if (valA === 0 && valB !== 0) return 1;
      if (valB === 0 && valA !== 0) return -1;

      // const indexA = arrInt.indexOf(a[objAttri]);
      // const indexB = arrInt.indexOf(b[objAttri]);
      const indexA = arrInt.indexOf(valA);
      const indexB = arrInt.indexOf(valB);

      // Assign a default order for unmatched ids
      const orderA = indexA !== -1 ? indexA : Number.MAX_SAFE_INTEGER;
      const orderB = indexB !== -1 ? indexB : Number.MAX_SAFE_INTEGER;

      return orderA - orderB;
    });
    return sortedArray;
  }
  setUnitMeasurement(): [boolean, string] {
    const user = localStorage.getItem('user');
    let isEnableUnitConversion = false;
    let conversionValue = 'mm';
    if (JSON.parse(user)) {
      conversionValue = 'mm';
      const users = JSON.parse(user);
      if (users.client.uomId) {
        isEnableUnitConversion = true;
        conversionValue = this._costingConfig.getUnitOfMeasure()?.find((x) => x.id == users.client.uomId)?.convertionValue;
      }
    }
    return [isEnableUnitConversion, conversionValue];
  }

  initGetExtractedData(): void {
    this._dataExtraction$.pipe(takeUntil(this.unsubscribe$)).subscribe((res: DataExtraction) => {
      if (res && res?.partInfoId > 0) {
        console.log('___________________________________________________________________');
        console.log('_________________CAD  PROCESS EXTRACTED VALUES_____________________________');
        this.extractedProcessData = res?.processInfoJson ? JSON.parse(res?.processInfoJson) : [];
        console.log(this.extractedProcessData);
        console.log('_________________CAD MATERIAL EXTRACTED VALUES_____________________________');
        this.extractedMaterialData = res?.materialInfoJson ? JSON.parse(res?.materialInfoJson) : [];
        console.log(this.extractedMaterialData);
        console.log('_________________CAD DFM EXTRACTED VALUES_____________________________');
        this.extractedDfmData = res?.dfmIssues ? JSON.parse(res?.dfmIssues) : [];
        console.log(this.extractedDfmData);
        console.log('_________________CAD COTS EXTRACTED VALUES_____________________________');
        this.extractedCotsData = res?.cotsInfoJson ? JSON.parse(res?.cotsInfoJson) : [];
        console.log(this.extractedCotsData);
        console.log('___________________________________________________________________');
        console.log('_________________CAD CORE EXTRACTED VALUES_____________________________');
        this.extractedCoreData = res?.coreInfoJson ? JSON.parse(res?.coreInfoJson) : [];
        console.log(this.extractedCoreData);
        console.log('___________________________________________________________________');
        if (res?.datumCentroid) {
          this.datumCentroid = res?.datumCentroid;
        }
      } else {
        this.extractedMaterialData = null;
        this.extractedProcessData = null;
        this.extractedDfmData = null;
        this.extractedCotsData = null;
        this.extractedCoreData = null;
        this.datumCentroid = null;
        console.log('_________________NO CAD EXTRACTED VALUES FOUND_____________________________');
      }
    });
  }

  public getAllFeatureEntries(documentRecords): any[] {
    let featureData = [];
    for (const item of documentRecords) {
      if (item?.imageJson) {
        const featureGroups = JSON.parse(item?.imageJson)?.parts[0]?.featureRecognition?.featureGroups;
        for (const fgroupIndex in featureGroups) {
          const featureGroup = featureGroups[fgroupIndex];
          for (const subgroupIndex in featureGroup?.subGroups) {
            const subGroup = featureGroup?.subGroups[subgroupIndex];
            for (const fIndex in subGroup?.features) {
              const feature = subGroup?.features[fIndex];
              const featureRow = { name: featureGroup?.name?.replace('(s)', '') };
              featureRow['id'] = feature?.featureIdentifier ?? ((+fgroupIndex + 1) * 10000 + (+subgroupIndex + 1) * 100 + (+fIndex + 1)).toString();
              for (const parameter of subGroup.parameters) {
                const name = parameter?.name?.toLowerCase();
                if (['axis', 'centroid'].includes(name)) {
                  featureRow[name] = this.parseVector(parameter?.value);
                } else {
                  featureRow[name] = +parameter?.value;
                }
              }
              featureData.push(featureRow);
            }
          }
        }
      }
    }
    return featureData;
  }

  parseVector(value: string): number[] {
    return (
      value
        ?.replace(/[()]/g, '')
        ?.split(',')
        ?.map((v) => Number(v.trim())) || [0, 0, 0]
    );
  }

  transformNumberTwoDecimal(value: number) {
    if (value && !Number.isNaN(value) && value > 0) return value.toFixed(2);
    else {
      return 0;
    }
  }

  hasFraction(num: number): boolean {
    return num % 1 !== 0;
  }

  getMarketMonth(marketQuarter: string): string {
    if (!!marketQuarter) {
      const year = marketQuarter?.slice(0, 4) || '';
      const mon = (+marketQuarter?.slice(6, -1) * 3).toString().padStart(2, '0') || '';
      return mon + year;
    }
    return '';
  }

  formatCamelCaseKey(key: string): string {
    return (
      key
        // Insert space before capital letters
        .replace(/([A-Z])/g, ' $1')
        // Capitalize the first letter of each word
        .replace(/\b\w/g, (match) => match.toUpperCase())
        .trim()
    );
  }

  getMonthName(monthNumber: number): string {
    if (monthNumber < 1 || monthNumber > 12) return 'January';
    const date = new Date(2000, monthNumber - 1, 1);
    return date.toLocaleString('default', { month: 'long' });
  }

  hasSameGroup(projUserId: number, currUserId: number): boolean {
    let projGroupIds = this.userGroupsDtos.filter((u) => u.userId === projUserId).map((y) => y.commodityId);
    let curUserGroupIds = this.userGroupsDtos.filter((u) => u.userId === currUserId).map((y) => y.commodityId);
    return projGroupIds.some((i) => curUserGroupIds.includes(i));
  }

  setWorkFlowStatus(status: boolean): void {
    this.workflowStatusChangedSub$.next(status);
  }

  getWorkflowStatus(): Observable<boolean> {
    return this.workflowStatusChanged$;
  }

  setMaterialInfoCreateDate(createDate: string): void {
    this.materialInfoCreatedDateSub$.next(createDate);
  }

  getMaterialInfoCreateDate(): Observable<string> {
    return this.materialInfoCreatedDate$;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
