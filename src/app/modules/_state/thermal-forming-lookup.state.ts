import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { GetThermoFormingLookup } from '../_actions/master-data.action';
import { ThermoForming } from 'src/app/shared/models/thermo-forming.models';
import { MachiningService } from '../costing/services/machining.service';

export class ThermalFormingStateModel {
  thermoFormingList: ThermoForming[];
}

@State<ThermalFormingStateModel>({
  name: 'ThermalFormingLookupData',
  defaults: {
    thermoFormingList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class ThermoFormingState {
  constructor(private _formingService: MachiningService) {}

  @Selector()
  static getThermoFormingLookup(state: ThermalFormingStateModel) {
    return state.thermoFormingList;
  }

  @Action(GetThermoFormingLookup)
  getThermoFormingLookup(state: StateContext<ThermalFormingStateModel>) {
    state.setState({
      thermoFormingList: [],
    });
    return this._formingService.getThermoFormingLookup().pipe(
      tap((result) => {
        state.setState({
          thermoFormingList: [...result],
        });
      })
    );
  }
}
