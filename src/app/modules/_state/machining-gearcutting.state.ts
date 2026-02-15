import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MachiningService } from '../costing/services/machining.service';
import { GetGearCuttingLookup } from '../_actions/master-data.action';
import { GearCutting } from 'src/app/shared/models/machining-gearcutting.model';

export class GearCuttingDataStateModel {
  gearCuttingDataList: GearCutting[];
}

@State<GearCuttingDataStateModel>({
  name: 'GearCuttingStateData',
  defaults: {
    gearCuttingDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class GearCuttingState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getGearCuttingLookup(state: GearCuttingDataStateModel) {
    return state.gearCuttingDataList;
  }

  @Action(GetGearCuttingLookup)
  getGrindingLookup(state: StateContext<GearCuttingDataStateModel>) {
    state.setState({
      gearCuttingDataList: [],
    });
    return this._machiningService.getGearCuttingLookup().pipe(
      tap((result) => {
        state.setState({
          gearCuttingDataList: [...result],
        });
      })
    );
  }
}
