import { Injectable, OnDestroy } from '@angular/core';
import { map, delay } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { Subject, of } from 'rxjs';
import { CommonHelperService } from '../helpers/common-helper.service';

@Injectable({
  providedIn: 'root',
})
export class ApiCacheService implements OnDestroy {
  public unsubscribe$: Subject<undefined> = new Subject<undefined>();

  private cachableRoutes = {
    get: [
      '/api/costing/Vendor/All',
      // '/api/costing/ProjectInfo',
      '/api/costing/BuLocation',
      '/api/costing/MaterialInfo',
      '/api/costing/Logistics',
      '/api/costing/OverHeadProfit',
      '/api/costing/CostTooling',
      '/api/costing/PackingInfo',
      '/api/costing/ProjectInfo/partInfo',
      '/api/costing/processInfo/partinfo',
      //  '/api/costing/costsummary/partInfo',
      '/api/master/MaterialMaster/GetMaterialPrice',
      '/api/master/MaterialMaster/materialMarketData',
      '/api/master/laborRate/country',
      '/api/master/medbMaster/processtypeByProcessIds',
      '/api/master/medbMaster/country',
      '/api/master/MaterialMaster/country',
      '/api/master/MaterialMaster/materialType',
      '/api/master/User/ByClient',
      '/api/master/CountryPlating',
      '/api/master/MedbMaster/laborCountBasedOnMachineType',
      '/api/master/UnspscMaster/GetUnspscMasterData',
      '/api/master/HtsMaster/GetHtsMasterData',
      '/api/master/PrintedCircuitBoard/materialMaster',
      '/api/master/PackagingMaster/GetPackagingDescriptionMasterData',
      '/api/master/PackagingMaster/GetPackagingFormMasterData',
      '/api/master/PackagingMaster/GetPackagingSizeDefinitionMasterData',
      '/api/master/PackagingMaster/GetPackagingFormByPackagingType',
      '/api/master/PackagingMaster/GetPackagingDescriptionByPackagingTypeAndForm',
    ],
    post: ['/api/master/Logistics/freight-cost'],
  };
  apiResults: { [key: string]: any }[];
  canCache: boolean = true;
  enableCacheLog = false;

  constructor(
    private _store: Store,
    private _apiCacheServiceHelper: CommonHelperService
  ) {
    // this.getApiCacheResults();
    if (localStorage.getItem('enableCacheLog') === 'true') {
      this.enableCacheLog = true;
    }
  }

  private getApiCacheResults(dynamicObject: { [key: string]: any }) {
    // this.apiResults$.pipe(takeUntil(this.unsubscribe$))
    //   .subscribe((result) => {
    //     this.apiResults = result;
    //   });
    // this.canCache$.pipe(takeUntil(this.unsubscribe$))
    //   .subscribe((canCache) => {
    //     this.canCache = canCache;
    //   });
    const apiRes = [];
    for (const key in this.apiResults) {
      if (this.apiResults[key] && Date.now() - this.apiResults[key]['time'] < 10000) {
        apiRes[key] = this.apiResults[key];
      }
    }
    this.apiResults = { ...apiRes, ...dynamicObject };
    this.enableCacheLog && console.log({ ...this.apiResults }, 'updated Cache');
  }

  setCache(relativeUrl: string, res: any, method = 'get') {
    if (this.cachableRoutes[method].some((item) => relativeUrl.includes(item)) && this.canCache) {
      const dynamicObject = {};
      dynamicObject[relativeUrl] = { time: Date.now(), loaded: true, results: res };
      // this._store.dispatch(new ApiCacheActions.UpdateApiCache(dynamicObject));
      // if(res != null && !(Array.isArray(res) && res.length === 0) && !(typeof res === 'object' && !Array.isArray(res) && Object.keys(res).length === 0)){
      if (this._apiCacheServiceHelper.isNotEmpty(res)) {
        this.getApiCacheResults(dynamicObject);
      }
      this.enableCacheLog && console.log(relativeUrl, 'Cache set', res);
    }
  }

  getCache(relativeUrl: string, retryCount = 0, method = 'get') {
    this.enableCacheLog && console.log(relativeUrl, 'request initiated', Date());
    if (this.cachableRoutes[method].some((item) => relativeUrl.includes(item)) && this.canCache) {
      if (this.apiResults && this.apiResults[relativeUrl] && !this.apiResults[relativeUrl].loaded && retryCount === 0) {
        // api in progress already
        const r = of(null).pipe(
          delay(3000),
          map(() => this.getCache(relativeUrl, ++retryCount, method))
        ); // .pipe(map(r => r)); //
        this.enableCacheLog && console.log(relativeUrl, 'loaded in progress', 'retryCount', retryCount, Date.now(), r);
        return r;
      } else if (this.apiResults && this.apiResults[relativeUrl] && this.apiResults[relativeUrl]?.time) {
        // this.apiResults[relativeUrl].loaded = false; // for immediate calls
        const dynamicObject = {};
        dynamicObject[relativeUrl] = { ...this.apiResults[relativeUrl], loaded: false };
        // this._store.dispatch(new ApiCacheActions.UpdateApiCache(dynamicObject));
        this.getApiCacheResults(dynamicObject);

        const timeDiff = Date.now() - this.apiResults[relativeUrl].time;
        this.enableCacheLog && console.log(relativeUrl, 'Cache exists', timeDiff, Date().toLocaleString());
        if (timeDiff < 10000) {
          this.enableCacheLog && console.log(relativeUrl, 'Cache exists within time', timeDiff, this.apiResults[relativeUrl].results);
          return this.apiResults[relativeUrl].results;
        }
      }
      this.enableCacheLog && console.log(relativeUrl, 'real api call', Date());
    }
    return false;
  }

  removeCache(relativeUrl: string, canCache: boolean = true) {
    if (relativeUrl === 'ALL') {
      // this._store.dispatch(new ApiCacheActions.ResetApiCache(canCache));
      this.apiResults = null;
      this.canCache = canCache;
      this.enableCacheLog && console.log(relativeUrl, 'All Cache cleared');
    } else {
      const dynamicObject = {};
      dynamicObject[relativeUrl] = null;
      // this._store.dispatch(new ApiCacheActions.UpdateApiCache(dynamicObject));
      this.getApiCacheResults(dynamicObject);
      this.enableCacheLog && console.log(relativeUrl, 'Cache cleared');
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
