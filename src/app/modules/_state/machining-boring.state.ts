import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { GetBoringCuttingSpeed, GetBoringLookup } from '../_actions/master-data.action';
import { MachiningService } from '../costing/services/machining.service';
import { Boring, BoringDto } from 'src/app/shared/models/machining-boring.model';

export class BoringStateModel {
  BoringDataList: BoringDto[];
  BoringLookupDataList: Boring[];
}

@State<BoringStateModel>({
  name: 'BoringData',
  defaults: {
    BoringDataList: [],
    BoringLookupDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class BoringState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getBoringCuttingSpeed(state: BoringStateModel) {
    return state.BoringDataList;
  }

  @Selector()
  static getBoringLookup(state: BoringStateModel) {
    return state.BoringLookupDataList;
  }

  @Action(GetBoringCuttingSpeed)
  getBoringCuttingSpeed(state: StateContext<BoringStateModel>) {
    return this._machiningService.getBoringCuttingSpeed().pipe(
      tap((result) => {
        state.patchState({
          BoringDataList: [...result],
        });
      })
    );
  }

  @Action(GetBoringLookup)
  getBoringLookup(state: StateContext<BoringStateModel>) {
    return this._machiningService.getBoringLookupByMaterial().pipe(
      tap((result) => {
        state.patchState({
          BoringLookupDataList: [...result],
        });
      })
    );
  }
}
