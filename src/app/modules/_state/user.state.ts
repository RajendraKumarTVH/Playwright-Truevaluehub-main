import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SetUser, DestroyUser } from '../_actions/user.action';

export class UserStateModel {
  userData: { [key: string]: string };
}

@State<UserStateModel>({
  name: 'userData',
  defaults: {
    userData: null,
  },
})
@Injectable({ providedIn: 'root' })
export class UserState {
  @Selector()
  static getUser(state: UserStateModel) {
    return state.userData;
  }

  @Action(SetUser)
  setUser(state: StateContext<UserStateModel>, payload: SetUser) {
    state.setState({ userData: { ...payload.userData } });
  }

  @Action(DestroyUser)
  destroyUser(state: StateContext<UserStateModel>) {
    state.setState({ userData: null });
  }
}
