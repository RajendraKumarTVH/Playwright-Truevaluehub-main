import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { ToolingCountryData } from 'src/app/shared/models/tooling-master-data';
import { GetToolingCountryMasterData } from '../_actions/master-data.action';
import { SharedService } from '../costing/services/shared.service';

export class ToolingMasterDataStateModel {
  toolingCountryMasterData: ToolingCountryData[];
}

@State<ToolingMasterDataStateModel>({
  name: 'ToolingCountry',
  defaults: {
    toolingCountryMasterData: [],
  },
})
@Injectable({ providedIn: 'root' })
export class ToolingCountryMasterState {
  constructor(private _shareService: SharedService) {}

  @Selector()
  static getToolingCountryMasterData(state: ToolingMasterDataStateModel) {
    return state.toolingCountryMasterData;
  }

  @Action(GetToolingCountryMasterData)
  getToolingCountryMasterData(state: StateContext<ToolingMasterDataStateModel>) {
    state.setState({
      toolingCountryMasterData: [],
    });
    return this._shareService.getToolingCountryMaster().pipe(
      tap((result) => {
        state.setState({
          toolingCountryMasterData: [...result],
        });
      })
    );
  }
}
