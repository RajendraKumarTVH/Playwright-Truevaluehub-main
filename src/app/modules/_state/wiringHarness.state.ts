import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ProcessMasterService } from 'src/app/shared/services';
import { GetWiringHarnessLookup } from '../_actions/master-data.action';
import { tap } from 'rxjs/operators';
import { WiringHarness } from 'src/app/shared/models/wiring-harness.model';

export class WiringHarnessStateModel {
  LookupList: WiringHarness[];
}

@State<WiringHarnessStateModel>({
  name: 'WiringHarnessInfo',
  defaults: {
    LookupList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class WiringHarnessState {
  constructor(private _processMasterService: ProcessMasterService) {}

  @Selector()
  static getWiringHarnessLookup(state: WiringHarnessStateModel) {
    return state.LookupList;
  }

  @Action(GetWiringHarnessLookup)
  getWiringHarnessLookup(state: StateContext<WiringHarnessStateModel>) {
    state.setState({
      LookupList: [],
    });
    return this._processMasterService.getWiringHarnessLookup().pipe(
      tap((result) => {
        state.setState({
          LookupList: [...result],
        });
      })
    );
  }
}
