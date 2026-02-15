import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MedbMasterService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { MedbMachineTypeMasterDto } from 'src/app/shared/models';
import { GetAllMachineTypes } from '../_actions/master-data.action';

export class MedbMachineTypeStateModel {
  machineTypeList: MedbMachineTypeMasterDto[];
}

@State<MedbMachineTypeStateModel>({
  name: 'MachineType',
  defaults: {
    machineTypeList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class MachineTypeState {
  constructor(private _medbMasterService: MedbMasterService) {}

  @Selector()
  static getAllMachineTypes(state: MedbMachineTypeStateModel) {
    return state.machineTypeList;
  }

  @Action(GetAllMachineTypes)
  getAllMachineTypes(state: StateContext<MedbMachineTypeStateModel>) {
    state.setState({
      machineTypeList: [],
    });
    return this._medbMasterService.getAllMachineTypes().pipe(
      tap((result) => {
        state.setState({
          machineTypeList: [...result],
        });
      })
    );
  }
}
