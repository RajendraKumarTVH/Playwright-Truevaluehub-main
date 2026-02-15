import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { GetFormingTimeLookup } from '../_actions/master-data.action';
import { FormingTime } from 'src/app/shared/models/thermo-forming.models';
import { MachiningService } from '../costing/services/machining.service';

export class FormingTimeStateModel {
  formingTimeList: FormingTime[];
}

@State<FormingTimeStateModel>({
  name: 'FormingTimeLookupData',
  defaults: {
    formingTimeList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class ThermoFormingTimeState {
  constructor(private _formingService: MachiningService) {}

  @Selector()
  static getThermoFormingTime(state: FormingTimeStateModel) {
    return state.formingTimeList;
  }

  @Action(GetFormingTimeLookup)
  getFormingTimeLookup(state: StateContext<FormingTimeStateModel>) {
    state.setState({
      formingTimeList: [],
    });
    return this._formingService.getFormingTimeLookup().pipe(
      tap((result) => {
        state.setState({
          formingTimeList: [...result],
        });
      })
    );
  }
}
