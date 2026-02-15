import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { GetDrillingCuttingSpeed } from '../_actions/master-data.action';
import { DrillingCutting } from 'src/app/shared/models/drilling-cutting.model';
import { MachiningService } from '../costing/services/machining.service';

export class CuttingDataStateModel {
  cuttingDataList: DrillingCutting[];
}

@State<CuttingDataStateModel>({
  name: 'DrillingCuttingData',
  defaults: {
    cuttingDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class DrillingCuttingSpeedState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getDrillingCuttingSpeed(state: CuttingDataStateModel) {
    return state.cuttingDataList;
  }

  @Action(GetDrillingCuttingSpeed)
  getDrillingCuttingSpeed(state: StateContext<CuttingDataStateModel>) {
    state.setState({
      cuttingDataList: [],
    });
    return this._machiningService.getDrillingCuttingSpeed().pipe(
      tap((result) => {
        state.setState({
          cuttingDataList: [...result],
        });
      })
    );
  }
}
