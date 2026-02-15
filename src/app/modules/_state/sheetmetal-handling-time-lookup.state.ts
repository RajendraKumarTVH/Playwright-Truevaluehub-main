import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { GetHandlingTime } from '../_actions/master-data.action';
import { HandlingTime } from 'src/app/shared/models/sheet-metal-lookup.model';
import { SheetMetalLookupService } from 'src/app/shared/services/sheet-metal-lookup.service';

export class HandlingTimeStateModel {
  HandlingTimeDataList: HandlingTime[];
}

@State<HandlingTimeStateModel>({
  name: 'HandlingTimeData',
  defaults: {
    HandlingTimeDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class HandlingTimeState {
  constructor(private sheetMetalLookupService: SheetMetalLookupService) {}

  @Selector()
  static getHandlingTime(state: HandlingTimeStateModel) {
    return state.HandlingTimeDataList;
  }

  @Action(GetHandlingTime)
  getHandlingTime(state: StateContext<HandlingTimeStateModel>) {
    state.setState({
      HandlingTimeDataList: [],
    });
    return this.sheetMetalLookupService.getHandlingTime().pipe(
      tap((result) => {
        state.setState({
          HandlingTimeDataList: [...result],
        });
      })
    );
  }
}
