import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MedbPaymentMasterDto } from 'src/app/shared/models/overhead-Profit.model';
import { OverHeadProfitMasterService } from 'src/app/shared/services';
import { GetMedbPaymentData } from '../_actions/overhead-profit.action';
import { tap } from 'rxjs/operators';

export class MedbPaymentMasterStateModel {
  medbPaymentMasterList: MedbPaymentMasterDto[];
}

@State<MedbPaymentMasterStateModel>({
  name: 'MedbPaymentMaster',
  defaults: {
    medbPaymentMasterList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class MedbPaymentMasterState {
  constructor(private _overheadProfitService: OverHeadProfitMasterService) {}

  @Selector()
  static getMedbPaymentData(state: MedbPaymentMasterStateModel) {
    return state.medbPaymentMasterList;
  }

  @Action(GetMedbPaymentData)
  getMedbPaymentData(state: StateContext<MedbPaymentMasterStateModel>) {
    state.setState({
      medbPaymentMasterList: [],
    });
    return this._overheadProfitService.getMedbPaymentData().pipe(
      tap((result) => {
        state.setState({
          medbPaymentMasterList: [...result],
        });
      })
    );
  }
}
