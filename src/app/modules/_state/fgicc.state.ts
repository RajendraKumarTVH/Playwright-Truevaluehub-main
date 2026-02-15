import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MedbFgiccMasterDto } from 'src/app/shared/models/overhead-Profit.model';
import { OverHeadProfitMasterService } from 'src/app/shared/services';
import { GetMedbFgiccData } from '../_actions/overhead-profit.action';
import { tap } from 'rxjs/operators';
export class MedbFgiccStateModel {
  medbFgiccMasterList: MedbFgiccMasterDto[];
}

@State<MedbFgiccStateModel>({
  name: 'MedbFgicc',
  defaults: {
    medbFgiccMasterList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class FgiccState {
  constructor(private _overheadProfitService: OverHeadProfitMasterService) {}

  @Selector()
  static getMedbFgiccData(state: MedbFgiccStateModel) {
    return state.medbFgiccMasterList;
  }

  @Action(GetMedbFgiccData)
  getMedbFgiccData(state: StateContext<MedbFgiccStateModel>) {
    state.setState({
      medbFgiccMasterList: [],
    });
    return this._overheadProfitService.getMedbFgiccData().pipe(
      tap((result) => {
        state.setState({
          medbFgiccMasterList: [...result],
        });
      })
    );
  }
}
