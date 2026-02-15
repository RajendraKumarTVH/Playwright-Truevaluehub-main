import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { UserGroupDto } from 'src/app/shared/models';
import { GetUserGroups } from '../_actions/master-data.action';
import { UserService } from '../settings/Services/user.service';

export class UserGroupStateModel {
  userGroupDto: UserGroupDto[];
}

@State<UserGroupStateModel>({
  name: 'UserGroupType',
  defaults: {
    userGroupDto: [],
  },
})
@Injectable({ providedIn: 'root' })
export class UserGroupState {
  constructor(private _userService: UserService) {}

  @Selector()
  static getUserGroups(state: UserGroupStateModel) {
    return state?.userGroupDto;
  }

  @Action(GetUserGroups)
  getUserGroups(state: StateContext<UserGroupStateModel>) {
    state.setState({
      userGroupDto: [],
    });
    return this._userService.getUserGroups().pipe(
      tap((result) => {
        state.setState({
          userGroupDto: [...result],
        });
      })
    );
  }
}
