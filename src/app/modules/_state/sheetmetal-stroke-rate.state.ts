import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { StrokeRate } from 'src/app/shared/models/sheet-metal-lookup.model';
import { SheetMetalLookupService } from 'src/app/shared/services/sheet-metal-lookup.service';
import { GetStrokeRate } from '../_actions/master-data.action';

export class GetStrokeRateStateModel {
  StrokeRateDataList: StrokeRate[];
}

@State<GetStrokeRateStateModel>({
  name: 'StrokeRateData',
  defaults: {
    StrokeRateDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class StrokeRateState {
  constructor(private sheetMetalLookupService: SheetMetalLookupService) {}

  @Selector()
  static getStrokeRate(state: GetStrokeRateStateModel) {
    return state.StrokeRateDataList;
  }

  @Action(GetStrokeRate)
  getStrokeRate(state: StateContext<GetStrokeRateStateModel>) {
    state.setState({
      StrokeRateDataList: [],
    });
    return this.sheetMetalLookupService.getStrokeRate().pipe(
      tap((result) => {
        state.setState({
          StrokeRateDataList: [...result],
        });
      })
    );
  }
}
