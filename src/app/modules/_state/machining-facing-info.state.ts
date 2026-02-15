import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MachiningService } from '../costing/services/machining.service';
import { GetFacingLookup } from '../_actions/master-data.action';
import { FacingDto } from 'src/app/shared/models/facing-info.model';

export class FacingDataStateModel {
  facingDataList: FacingDto[];
}

@State<FacingDataStateModel>({
  name: 'FacingStateData',
  defaults: {
    facingDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class FacingState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getFacingLookup(state: FacingDataStateModel) {
    return state.facingDataList;
  }

  @Action(GetFacingLookup)
  getFacingLookup(state: StateContext<FacingDataStateModel>) {
    state.setState({
      facingDataList: [],
    });

    return this._machiningService.getFacingLookupByMaterial().pipe(
      tap((result) => {
        state.setState({
          facingDataList: [...result],
        });
      })
    );
  }
}
