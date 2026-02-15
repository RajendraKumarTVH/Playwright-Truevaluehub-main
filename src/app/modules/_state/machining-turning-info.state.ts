import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MachiningService } from '../costing/services/machining.service';
import { TurningInfoDto } from 'src/app/shared/models/turning-info.model';
import { GetTurningLookup } from '../_actions/master-data.action';

export class TurningDataStateModel {
  turningDataList: TurningInfoDto[];
}

@State<TurningDataStateModel>({
  name: 'TurningData',
  defaults: {
    turningDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class TurningState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getTurningLookup(state: TurningDataStateModel) {
    return state.turningDataList;
  }

  @Action(GetTurningLookup)
  getTurningLookup(state: StateContext<TurningDataStateModel>) {
    state.setState({
      turningDataList: [],
    });

    return this._machiningService.getTurningLookupByMaterial().pipe(
      tap((result) => {
        state.setState({
          turningDataList: [...result],
        });
      })
    );
  }
}
