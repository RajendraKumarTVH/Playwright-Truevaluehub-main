import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GetSecProcDeburringMachineDescription } from '../_actions/secondary-process.action';
import { tap } from 'rxjs/operators';
import { SecondaryProcessService } from '../../shared/services/secondary-process.service';
export class SecondaryProcessDeburringMachineStateModel {
  secProcDeburringMachineDescription: string[];
}
@State<SecondaryProcessDeburringMachineStateModel>({
  name: 'SecondaryProcessDeburringMachines',
  defaults: {
    secProcDeburringMachineDescription: [],
  },
})
@Injectable({ providedIn: 'root' })
export class SecondaryProcessDeburringMachineState {
  constructor(private _secondaryProcessInfoService: SecondaryProcessService) {}

  @Selector()
  static getSecProcDeburringMachineDescription(state: SecondaryProcessDeburringMachineStateModel) {
    return state.secProcDeburringMachineDescription;
  }

  @Action(GetSecProcDeburringMachineDescription)
  getSecProcDeburringMachineDescription(state: StateContext<SecondaryProcessDeburringMachineStateModel>) {
    state.setState({
      secProcDeburringMachineDescription: [],
    });
    return this._secondaryProcessInfoService.getSecProcDeburringMachineDescription().pipe(
      tap((result) => {
        state.setState({
          secProcDeburringMachineDescription: (result?.length && [...result]) || [],
        });
      })
    );
  }
}
