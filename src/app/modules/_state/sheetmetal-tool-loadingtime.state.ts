import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { ToolLoadingTime } from 'src/app/shared/models/sheet-metal-lookup.model';
import { SheetMetalLookupService } from 'src/app/shared/services/sheet-metal-lookup.service';
import { GetToolLoadingTime } from '../_actions/master-data.action';

export class ToolLoadingTimeStateModel {
  ToolLoadTimeDataList: ToolLoadingTime[];
}

@State<ToolLoadingTimeStateModel>({
  name: 'ToolLoadingTimeData',
  defaults: {
    ToolLoadTimeDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class ToolLoadingTimeState {
  constructor(private sheetMetalLookupService: SheetMetalLookupService) {}

  @Selector()
  static getToolLoadingTime(state: ToolLoadingTimeStateModel) {
    return state.ToolLoadTimeDataList;
  }

  @Action(GetToolLoadingTime)
  getToolLoadingTime(state: StateContext<ToolLoadingTimeStateModel>) {
    state.setState({
      ToolLoadTimeDataList: [],
    });

    return this.sheetMetalLookupService.getToolLoadingTime().pipe(
      tap((result) => {
        state.setState({
          ToolLoadTimeDataList: [...result],
        });
      })
    );
  }
}
