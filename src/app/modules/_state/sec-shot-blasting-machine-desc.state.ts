import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GetSecProcShotBlastingMachineDescription } from '../_actions/secondary-process.action';
import { tap } from 'rxjs/operators';
import { SecondaryProcessService } from '../../shared/services/secondary-process.service';
export class SecondaryProcessShotBlastingStateModel {
  secProcShotBlastingMachineDescription: string[];
}
@State<SecondaryProcessShotBlastingStateModel>({
  name: 'SecondaryProcessShotBlastings',
  defaults: {
    secProcShotBlastingMachineDescription: [],
  },
})
@Injectable({ providedIn: 'root' })
export class SecondaryProcessShotBlastingState {
  constructor(private _secondaryProcessInfoService: SecondaryProcessService) {}

  @Selector()
  static getSecProcShotBlastingMachineDescription(state: SecondaryProcessShotBlastingStateModel) {
    return state.secProcShotBlastingMachineDescription;
  }

  @Action(GetSecProcShotBlastingMachineDescription)
  getSecProcShotBlastingMachineDescription(state: StateContext<SecondaryProcessShotBlastingStateModel>) {
    state.setState({
      secProcShotBlastingMachineDescription: [],
    });
    return this._secondaryProcessInfoService.getSecProcShotBlastingMachineDescription().pipe(
      tap((result) => {
        const safeResult = Array.isArray(result) ? result : [];
        state.setState({
          secProcShotBlastingMachineDescription: [...safeResult],
        });
      })
    );
  }
}
