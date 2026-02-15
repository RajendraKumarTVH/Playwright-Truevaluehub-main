import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GetSecProcMachineDescription } from '../_actions/secondary-process.action';
import { tap } from 'rxjs/operators';
import { SecondaryProcessService } from '../../shared/services/secondary-process.service';
export class SecondaryProcessMachineStateModel {
  secProcMachineDescription: string[];
}
@State<SecondaryProcessMachineStateModel>({
  name: 'SecondaryProcessMachines',
  defaults: {
    secProcMachineDescription: [],
  },
})
@Injectable({ providedIn: 'root' })
export class SecondaryProcessMachineState {
  constructor(private _secondaryProcessInfoService: SecondaryProcessService) {}

  @Selector()
  static getSecProcMachineDescription(state: SecondaryProcessMachineStateModel) {
    return state.secProcMachineDescription;
  }

  @Action(GetSecProcMachineDescription)
  getSecProcMachineDescription(state: StateContext<SecondaryProcessMachineStateModel>) {
    state.setState({
      secProcMachineDescription: [],
    });
    return this._secondaryProcessInfoService.getSecProcMachineDescription().pipe(
      tap((result) => {
        const safeResult = Array.isArray(result) ? result : [];
        state.setState({
          secProcMachineDescription: [...safeResult],
        });
      })
    );
  }
}
