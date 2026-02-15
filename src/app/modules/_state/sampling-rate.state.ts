import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MedbMasterService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { GetSamplingRate } from '../_actions/master-data.action';
import { SamplingRate } from '../costing/models/sampling-rate.model';

export class SamplingRateStateModel {
  samplingRates: SamplingRate[];
}

@State<SamplingRateStateModel>({
  name: 'SamplingRates',
  defaults: {
    samplingRates: [],
  },
})
@Injectable({ providedIn: 'root' })
export class SamplingRateState {
  constructor(private _medbMasterService: MedbMasterService) {}

  @Selector()
  static getSamplingRates(state: SamplingRateStateModel) {
    return state.samplingRates;
  }

  @Action(GetSamplingRate)
  getSamplingRate(state: StateContext<SamplingRateStateModel>) {
    state.setState({
      samplingRates: [],
    });
    return this._medbMasterService.getSamplingRates().pipe(
      tap((result) => {
        state.setState({
          samplingRates: [...result],
        });
      })
    );
  }
}
