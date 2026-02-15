import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GetCanUserUpdateCosting } from '../_actions/master-data.action';

export class CanUpdateCostingStateModel {
  canUpdate: boolean;
}

@State<CanUpdateCostingStateModel>({
  name: 'UserCanUpdateCosting',
  defaults: {
    canUpdate: false,
  },
})
@Injectable({ providedIn: 'root' })
export class UserCanUpdateCostingState {
  @Selector()
  static getCanUserUpdateCosting(state: CanUpdateCostingStateModel) {
    return state.canUpdate;
  }

  @Action(GetCanUserUpdateCosting)
  getCanUserUpdateCostingPage({ setState }: StateContext<CanUpdateCostingStateModel>, { canUpdate }: GetCanUserUpdateCosting) {
    setState({
      canUpdate,
    });
  }
}
