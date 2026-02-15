import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GetPowderCoatingMachineManufacture } from '../_actions/secondary-process.action';
import { tap } from 'rxjs/operators';
import { SecondaryProcessService } from '../../shared/services/secondary-process.service';
import { SecondaryProcessPowderMachineDto } from 'src/app/shared/models/secondary-process-powder-coating-machine.model';
export class SecondaryProcessPowderCoatingMachineStateModel {
  powderCoatingMachineManufacture: SecondaryProcessPowderMachineDto[];
}
@State<SecondaryProcessPowderCoatingMachineStateModel>({
  name: 'SecondaryProcessPowderCoatingMachines',
  defaults: {
    powderCoatingMachineManufacture: [],
  },
})
@Injectable({ providedIn: 'root' })
export class SecondaryProcessPowderCoatingMachineState {
  constructor(private _secondaryProcessInfoService: SecondaryProcessService) {}

  @Selector()
  static getPowderCoatingMachineManufacture(state: SecondaryProcessPowderCoatingMachineStateModel) {
    return state.powderCoatingMachineManufacture;
  }

  @Action(GetPowderCoatingMachineManufacture)
  getPowderCoatingMachineManufacture(state: StateContext<SecondaryProcessPowderCoatingMachineStateModel>) {
    state.setState({
      powderCoatingMachineManufacture: [],
    });
    return this._secondaryProcessInfoService.getPowderCoatingMachineManufacture().pipe(
      tap((result) => {
        if (result) {
          state.setState({
            powderCoatingMachineManufacture: [...result],
          });
        }
      })
    );
  }
}
