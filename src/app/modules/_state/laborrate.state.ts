import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { LaborRateMasterDto } from 'src/app/shared/models';
import { LaborService } from 'src/app/shared/services/labor.service';
import { GetLaborRates } from '../_actions/master-data.action';

export class LaborRateStateModel {
  laborRateList: LaborRateMasterDto[];
}

@State<LaborRateStateModel>({
  name: 'LaborRate',
  defaults: {
    laborRateList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class LaborRateState {
  constructor(private _laborService: LaborService) {}

  @Selector()
  static getLaborRates(state: LaborRateStateModel) {
    return state.laborRateList;
  }

  @Action(GetLaborRates)
  getLaborRates(state: StateContext<LaborRateStateModel>) {
    state.setState({
      laborRateList: [],
    });
    return this._laborService.getLaborRates().pipe(
      tap((result) => {
        state.setState({
          laborRateList: [...result],
        });
      })
    );
  }
}
