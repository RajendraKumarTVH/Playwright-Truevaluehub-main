import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MachiningService } from '../costing/services/machining.service';
import { GetSlotLookup } from '../_actions/master-data.action';
import { SlotMilling } from 'src/app/shared/models/machining-slotmilling.model';

export class SlotDataStateModel {
  slotDataList: SlotMilling[];
}

@State<SlotDataStateModel>({
  name: 'SlotStateData',
  defaults: {
    slotDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class SlotState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getSlotLookup(state: SlotDataStateModel) {
    return state.slotDataList;
  }

  @Action(GetSlotLookup)
  getSlotLookup(state: StateContext<SlotDataStateModel>) {
    state.setState({
      slotDataList: [],
    });
    return this._machiningService.getSlotMillingLookupByMaterial().pipe(
      tap((result) => {
        state.setState({
          slotDataList: [...result],
        });
      })
    );
  }
}
