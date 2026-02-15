import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { SheetMetalLookupService } from 'src/app/shared/services/sheet-metal-lookup.service';
import { StrokeRateManual } from 'src/app/shared/models/sheet-metal-lookup.model';
import { GetStrokeRateManual } from '../_actions/master-data.action';

export class GetStrokeRateManualStateModel {
  StrokeRateManualList: StrokeRateManual[];
}

@State<GetStrokeRateManualStateModel>({
  name: 'StrokeRateManual',
  defaults: {
    StrokeRateManualList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class StrokeRateManualState {
  constructor(private sheetMetalLookupService: SheetMetalLookupService) {}

  @Selector()
  static getStrokeRateManual(state: GetStrokeRateManualStateModel) {
    return state.StrokeRateManualList;
  }

  @Action(GetStrokeRateManual)
  getStrokeRateManual(state: StateContext<GetStrokeRateManualStateModel>) {
    state.setState({
      StrokeRateManualList: [],
    });
    return this.sheetMetalLookupService.getStrokeRateManual().pipe(
      tap((result) => {
        state.setState({
          StrokeRateManualList: [...result],
        });
      })
    );
  }
}
