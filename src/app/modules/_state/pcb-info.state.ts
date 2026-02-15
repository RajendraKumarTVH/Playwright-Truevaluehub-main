import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ProcessInfoDto } from 'src/app/shared/models';
import { tap } from 'rxjs/operators';
import { GetMaterialMasterByCountryId } from '../_actions/master-data.action';
import { PCBAService } from 'src/app/shared/services/pcba-.service';
export class PcbMaterialMasterModel {
  marketDataInfos: ProcessInfoDto[];
}
@State<PcbMaterialMasterModel>({
  name: 'PcbMaterialMaster',
  defaults: {
    marketDataInfos: [],
  },
})
@Injectable()
export class PcbMaterialMarketDataState {
  constructor(private _pcbaService: PCBAService) {}

  @Selector()
  static getMaterialMasterByCountryId(state: PcbMaterialMasterModel) {
    return state.marketDataInfos;
  }

  @Action(GetMaterialMasterByCountryId)
  getMaterialMasterByCountryId(state: StateContext<PcbMaterialMasterModel>, payload: GetMaterialMasterByCountryId) {
    return this._pcbaService.getMaterialMasterByCountryId(payload.partInfoId).pipe(
      tap((result) => {
        if (result) {
          state.patchState({
            marketDataInfos: [...result],
          });
        }
      })
    );
  }
}
