import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { GetTappingCuttingSpeed } from '../_actions/master-data.action';
import { MachiningService } from '../costing/services/machining.service';
import { TappingLookupDto } from 'src/app/shared/models/machining-tapping.model';

export class TappingStateModel {
  TappingDataList: TappingLookupDto[];
}

@State<TappingStateModel>({
  name: 'TappingData',
  defaults: {
    TappingDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class TappingState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getTappingCuttingSpeed(state: TappingStateModel) {
    return state.TappingDataList;
  }

  @Action(GetTappingCuttingSpeed)
  getTappingCuttingSpeed(state: StateContext<TappingStateModel>) {
    state.setState({
      TappingDataList: [],
    });
    return this._machiningService.getTappingCuttingSpeed().pipe(
      tap((result) => {
        state.setState({
          TappingDataList: [...result],
        });
      })
    );
  }
}
