import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MedbIccMasterDto } from 'src/app/shared/models/overhead-Profit.model';
import { OverHeadProfitMasterService } from 'src/app/shared/services';
import { GetMedbIccData } from '../_actions/overhead-profit.action';
import { tap } from 'rxjs/operators';

export class MedbIccStateModel {
  medbIccMasterList: MedbIccMasterDto[];
}
@State<MedbIccStateModel>({
  name: 'MedbIcc',
  defaults: {
    medbIccMasterList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class IccState {
  constructor(private _overheadProfitService: OverHeadProfitMasterService) {}

  @Selector()
  static getMedbIccData(state: MedbIccStateModel) {
    return state.medbIccMasterList;
  }

  @Action(GetMedbIccData)
  getMedbIccData(state: StateContext<MedbIccStateModel>) {
    state.setState({
      medbIccMasterList: [],
    });
    return this._overheadProfitService.getMedbIccData().pipe(
      tap((result) => {
        state.setState({
          medbIccMasterList: [...result],
        });
      })
    );
  }
}
