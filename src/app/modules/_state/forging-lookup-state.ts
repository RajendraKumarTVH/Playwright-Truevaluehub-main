import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MachiningService } from '../costing/services/machining.service';
import { ForgingLookupDto } from 'src/app/shared/models/forging.model';
import { GetForgingLookup } from '../_actions/master-data.action';

export class GetForgingStateModel {
  getForgingDataList: ForgingLookupDto[];
}

@State<GetForgingStateModel>({
  name: 'GetForgingStateModel',
  defaults: {
    getForgingDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class GetForgingState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getForgingLookup(state: GetForgingStateModel) {
    return state.getForgingDataList;
  }

  @Action(GetForgingLookup)
  getForgingLookup(state: StateContext<GetForgingStateModel>) {
    state.setState({
      getForgingDataList: [],
    });
    return this._machiningService.getForgingLookup().pipe(
      tap((result) => {
        state.setState({
          getForgingDataList: [...result],
        });
      })
    );
  }
}
