import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MachiningService } from '../costing/services/machining.service';
import { GetGrindingLookup } from '../_actions/master-data.action';
import { Grinding } from 'src/app/shared/models/machining-grinding.model';

export class GrindingDataStateModel {
  grindingDataList: Grinding[];
}

@State<GrindingDataStateModel>({
  name: 'GrindingStateData',
  defaults: {
    grindingDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class GrindingState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getGrindingLookup(state: GrindingDataStateModel) {
    return state.grindingDataList;
  }

  @Action(GetGrindingLookup)
  getGrindingLookup(state: StateContext<GrindingDataStateModel>) {
    state.setState({
      grindingDataList: [],
    });
    return this._machiningService.getGrindingLookup().pipe(
      tap((result) => {
        state.setState({
          grindingDataList: [...result],
        });
      })
    );
  }
}
