import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MachiningService } from '../costing/services/machining.service';
import { GetEndMillingLookup } from '../_actions/master-data.action';
import { EndMilling } from 'src/app/shared/models/machining-end-milling.model';

export class EndDataStateModel {
  endDataList: EndMilling[];
}

@State<EndDataStateModel>({
  name: 'EndMillingStateData',
  defaults: {
    endDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class EndMillingState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getEndMillingLookup(state: EndDataStateModel) {
    return state.endDataList;
  }

  @Action(GetEndMillingLookup)
  getEndMillingLookup(state: StateContext<EndDataStateModel>) {
    state.setState({
      endDataList: [],
    });
    return this._machiningService.getEndMillingLookupByMaterial().pipe(
      tap((result) => {
        state.setState({
          endDataList: [...result],
        });
      })
    );
  }
}
