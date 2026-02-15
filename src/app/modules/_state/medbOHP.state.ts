import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MedbOverHeadProfitDto } from 'src/app/shared/models/overhead-Profit.model';
import { OverHeadProfitMasterService } from 'src/app/shared/services';
import { GetMedbOverHeadProfitData } from '../_actions/overhead-profit.action';
import { tap } from 'rxjs/operators';

export class MedbOverHeadProfitStateModel {
  medbOverHeadProfitList: MedbOverHeadProfitDto[];
}

@State<MedbOverHeadProfitStateModel>({
  name: 'MedbOverHeadProfit',
  defaults: {
    medbOverHeadProfitList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class MedbOhpState {
  constructor(private _overheadProfitService: OverHeadProfitMasterService) {}

  @Selector()
  static getMedbOverHeadProfitData(state: MedbOverHeadProfitStateModel) {
    return state.medbOverHeadProfitList;
  }

  @Action(GetMedbOverHeadProfitData)
  getMedbOverHeadProfitData(state: StateContext<MedbOverHeadProfitStateModel>) {
    state.setState({
      medbOverHeadProfitList: [],
    });
    return this._overheadProfitService.getMedbOverHeadProfitData().pipe(
      tap((result) => {
        state.setState({
          medbOverHeadProfitList: [...result],
        });
      })
    );
  }
}
