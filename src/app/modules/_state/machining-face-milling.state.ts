import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MachiningService } from '../costing/services/machining.service';
import { GetFaceMillingLookup } from '../_actions/master-data.action';
import { Milling } from 'src/app/shared/models/machining-milling.model';

export class FaceMillingDataStateModel {
  millingList: Milling[];
}

@State<FaceMillingDataStateModel>({
  name: 'FaceMilling',
  defaults: {
    millingList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class FaceMillingState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getFaceMillingLookup(state: FaceMillingDataStateModel) {
    return state.millingList;
  }

  @Action(GetFaceMillingLookup)
  getFaceMillingLookup(state: StateContext<FaceMillingDataStateModel>) {
    return this._machiningService.getMillingLookupByMaterial().pipe(
      tap((result) => {
        state.patchState({
          millingList: [...result],
        });
      })
    );
  }
}
