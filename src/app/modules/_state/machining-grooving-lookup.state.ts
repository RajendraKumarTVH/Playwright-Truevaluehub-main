import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MachiningService } from '../costing/services/machining.service';
import { GetGroovingLookup } from '../_actions/master-data.action';
import { GroovingLookupDto } from 'src/app/shared/models/grooving-lookup.model';

export class GroovingDataStateModel {
  groovingDataList: GroovingLookupDto[];
}

@State<GroovingDataStateModel>({
  name: 'GroovingStateData',
  defaults: {
    groovingDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class GroovingState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getGroovingLookup(state: GroovingDataStateModel) {
    return state.groovingDataList;
  }

  @Action(GetGroovingLookup)
  getGroovingLookup(state: StateContext<GroovingDataStateModel>) {
    state.setState({
      groovingDataList: [],
    });
    //   return this._machiningService.getGroovingLookupByMaterial().pipe(
    //     tap((result) => {
    //       state.setState({
    //         groovingDataList: [...result],
    //       });
    //     })
    //   );
  }
}
