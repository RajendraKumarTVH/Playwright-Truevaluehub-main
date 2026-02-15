import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { GetPartingCuttingSpeed } from '../_actions/master-data.action';
import { PartingCuttingDto } from 'src/app/shared/models/parting-cutting.modal';
import { MachiningService } from '../costing/services/machining.service';

export class PartingCuttingDataStateModel {
  partingDataList: PartingCuttingDto[];
}

@State<PartingCuttingDataStateModel>({
  name: 'PartingCuttingData',
  defaults: {
    partingDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class PartingCuttingSpeedState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getPartingCuttingSpeed(state: PartingCuttingDataStateModel) {
    return state.partingDataList;
  }

  @Action(GetPartingCuttingSpeed)
  getPartingCuttingSpeed(state: StateContext<PartingCuttingDataStateModel>) {
    state.setState({
      partingDataList: [],
    });
    return this._machiningService.getCuttingSpeedForParting().pipe(
      tap((result) => {
        state.setState({
          partingDataList: [...result],
        });
      })
    );
  }
}
