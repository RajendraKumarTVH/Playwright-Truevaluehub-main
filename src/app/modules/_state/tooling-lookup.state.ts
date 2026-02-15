import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { GetToolingLookup } from '../_actions/master-data.action';
import { ToolingRefLookup } from 'src/app/shared/models/tooling.model';
import { CostToolingService } from 'src/app/shared/services/cost-tooling.service';

export class ToolingStateModel {
  toolingList: ToolingRefLookup[];
}

@State<ToolingStateModel>({
  name: 'ToolingLookupData',
  defaults: {
    toolingList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class ToolingLookupState {
  constructor(private _toolService: CostToolingService) {}

  @Selector()
  static getToolingLookup(state: ToolingStateModel) {
    return state.toolingList;
  }

  @Action(GetToolingLookup)
  getToolingLookup(state: StateContext<ToolingStateModel>) {
    state.setState({
      toolingList: [],
    });
    return this._toolService.getToolingLookup().pipe(
      tap((result) => {
        state.setState({
          toolingList: [...result],
        });
      })
    );
  }
}
