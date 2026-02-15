import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { CommodityService } from 'src/app/shared/services';
import { take, tap } from 'rxjs/operators';
import { CommodityMasterDto } from 'src/app/shared/models';
import { GetCommodityData } from '../_actions/master-data.action';

export class CommodityStateModel {
  commodityList: CommodityMasterDto[];
}

@State<CommodityStateModel>({
  name: 'commodityList',
  defaults: {
    commodityList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class CommodityState {
  constructor(
    private _commodityService: CommodityService,
    private _store: Store
  ) {}

  @Selector()
  static getCommodityData(state: CommodityStateModel) {
    return state.commodityList;
  }

  @Action(GetCommodityData)
  getCommodityData(state: StateContext<CommodityStateModel>) {
    // const stateV = getState();
    // patchState({
    //     commodityList: stateV.commodityList
    // });
    return this._commodityService.getCommodityData().pipe(
      tap((result) => {
        state.patchState({
          commodityList: [...result],
        });
      }),
      take(1)
    );
  }
}
