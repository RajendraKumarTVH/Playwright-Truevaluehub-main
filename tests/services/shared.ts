import { FieldColorsDto } from '../models/field-colors.model';
import { CostingConfig } from '../utils/costing-config';
import { DataExtraction } from '../models/data-extraction.model';
type UserGroupDto = any;

// Simple mock for Observable-like behavior if needed
class MockObservable<T> {
  constructor(private value: T) { }
  subscribe(fn: (val: T) => void) {
    fn(this.value);
  }
}

function of<T>(value: T): MockObservable<T> {
  return new MockObservable(value);
}

// Mocking Pipes for Playwright
class MmToInchesPipe { transform(value: number) { return value / 25.4; } }
class MmToCmPipe { transform(value: number) { return value / 10; } }
class InchesToMmPipe { transform(value: number) { return value * 25.4; } }
class CmToMmPipe { transform(value: number) { return value * 10; } }
class MmToMetersPipe { transform(value: number) { return value / 1000; } }
class MToMmPipe { transform(value: number) { return value * 1000; } }
class MmToFeetPipe { transform(value: number) { return value / 304.8; } }
class FeetToMmPipe { transform(value: number) { return value * 304.8; } }

export class SharedService {
  _dataExtraction$: MockObservable<DataExtraction | null> = of(null);
  private workflowStatusChanged: boolean = false;
  private materialInfoCreatedDate: string = '';

  public extractedMaterialData: any = null;
  public extractedProcessData: any = null;
  public extractedDfmData: any = null;
  public extractedCotsData: any = null;
  public extractedCoreData: any = null;
  public datumCentroid: any = null;
  _userGroupsData$: MockObservable<UserGroupDto[]> = of([]);
  userGroupsDtos: UserGroupDto[] = [];
  costSummaryIsNumeric = { set: (val: any) => { }, update: (fn: any) => { } };
  costSummaryActiveTabIndex = { set: (val: any) => { }, update: (fn: any) => { } };

  // Pipes
  private mmToInchesPipe = new MmToInchesPipe();
  private mmToCmPipe = new MmToCmPipe();
  private inchesToMMpipe = new InchesToMmPipe();
  private cmToMMpipe = new CmToMmPipe();
  private mmToMetersPipe = new MmToMetersPipe();
  private mToMmPipe = new MToMmPipe();
  private mmToFeetPipe = new MmToFeetPipe();
  private feetToMmPipe = new FeetToMmPipe();

  // Mock Services
  protected appConfigurationService = { configuration: { numberOfDecimals: 4 } };

  constructor(
    private _costingConfig?: CostingConfig,
  ) {
    if (!this._costingConfig) this._costingConfig = new CostingConfig();
    this.initGetExtractedData();
    this._userGroupsData$.subscribe((result: UserGroupDto[]) => {
      if (result && result.length > 0) {
        this.userGroupsDtos = result;
      }
    });
  }

  updateColorInfo(fieldColorsDto: FieldColorsDto[]): MockObservable<FieldColorsDto[]> {
    return of(fieldColorsDto);
  }

  getColorInfos(partInfoId: number, screenId: number, primaryId: number): MockObservable<any> {
    return of(null);
  }

  getColorInfosByPartinfo(partInfoId: number): MockObservable<any> {
    return of(null);
  }

  clearDirtyFields(partInfoId: number): MockObservable<any> {
    return of(null);
  }

  getToolingCountryMaster(): MockObservable<any> {
    return of(null);
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

  isValidJSON(jsonString: any) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  getUnitMeasurement(): [boolean, string] {
    let isEnableUnitConversion = false;
    let conversionValue = 'mm';
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
    const sortedArray = objArr.sort((a, b) => {
      const valA = a[objAttri];
      const valB = b[objAttri];
      if (valA === 0 && valB !== 0) return 1;
      if (valB === 0 && valA !== 0) return -1;

      const indexA = arrInt.indexOf(valA);
      const indexB = arrInt.indexOf(valB);

      const orderA = indexA !== -1 ? indexA : Number.MAX_SAFE_INTEGER;
      const orderB = indexB !== -1 ? indexB : Number.MAX_SAFE_INTEGER;

      return orderA - orderB;
    });
    return sortedArray;
  }
  setUnitMeasurement(): [boolean, string] {
    let isEnableUnitConversion = false;
    let conversionValue = 'mm';
    return [isEnableUnitConversion, conversionValue];
  }

  initGetExtractedData(): void {
  }

  public getAllFeatureEntries(documentRecords: any): any[] {
    let featureData: any[] = [];
    if (!documentRecords) return featureData;
    for (const item of documentRecords) {
      if (item?.imageJson) {
        const featureGroups = JSON.parse(item?.imageJson)?.parts[0]?.featureRecognition?.featureGroups;
        for (const fgroupIndex in featureGroups) {
          const featureGroup = featureGroups[fgroupIndex];
          for (const subgroupIndex in featureGroup?.subGroups) {
            const subGroup = featureGroup?.subGroups[subgroupIndex];
            for (const fIndex in subGroup?.features) {
              const feature = subGroup?.features[fIndex];
              const featureRow: any = { name: featureGroup?.name?.replace('(s)', '') };
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
        .replace(/([A-Z])/g, ' $1')
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
    this.workflowStatusChanged = status;
  }

  getWorkflowStatus(): MockObservable<boolean> {
    return of(this.workflowStatusChanged);
  }

  setMaterialInfoCreateDate(createDate: string): void {
    this.materialInfoCreatedDate = createDate;
  }

  getMaterialInfoCreateDate(): MockObservable<string> {
    return of(this.materialInfoCreatedDate);
  }

  ngOnDestroy(): void {
  }
}
