import { Injectable } from '@angular/core';
import { ApiCacheService } from '../services/api-cache.service';
import { Store } from '@ngxs/store';
import { Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { MsalService } from '@azure/msal-angular';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { MaterialGroupState } from 'src/app/modules/_state/material-group.state';
import { ProcessTypeState } from 'src/app/modules/_state/process-type.state';
import { CommodityState } from 'src/app/modules/_state/commodity.state';
import { MaterialGroupDto, MedbProcessTypeMasterDto, CommodityMasterDto, CountryDataMasterDto } from 'src/app/shared/models';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationHelperService {
  constructor(
    private _apiCacheService: ApiCacheService,
    private msalService: MsalService,
    private _store: Store
  ) {}

  checkStateIntegrity(): Observable<boolean> {
    return combineLatest([
      this._store.select(CountryDataState.getCountryData),
      this._store.select(MaterialGroupState.getMaterialGroups),
      this._store.select(ProcessTypeState.getProcessTypeList),
      this._store.select(CommodityState.getCommodityData),
    ]).pipe(
      take(1),
      map(([countryData, materialGroup, materialType, commodityList]) => {
        return this.isStateInvalid(countryData, materialGroup, materialType, commodityList);
      })
    );
  }

  private isStateInvalid(countryData: CountryDataMasterDto[], materialGroup: MaterialGroupDto[], materialType: MedbProcessTypeMasterDto[], commodityList: CommodityMasterDto[]): boolean {
    return !countryData || countryData.length === 0 || !materialGroup || materialGroup.length === 0 || !materialType || materialType.length === 0 || !commodityList || commodityList.length === 0;
  }

  forceLogoutIfStateInvalid() {
    this.checkStateIntegrity()
      .pipe(take(1))
      .subscribe((isInvalid: boolean) => {
        if (isInvalid) {
          this.clearOnLogout();
          this.msalService.logoutRedirect();
        }
      });
  }

  clearOnLogout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('@@STATE');
    this._apiCacheService.removeCache('ALL');
  }
}
