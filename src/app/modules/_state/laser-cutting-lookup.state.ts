import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { SheetMetalLookupService } from 'src/app/shared/services/sheet-metal-lookup.service';
import { LaserCuttingTime } from 'src/app/shared/models/sheet-metal-lookup.model';
import { GetLaserCuttingSpeed } from '../_actions/master-data.action';

export class GetLaserCuttingModel {
  LaserCuttingSpeedList: LaserCuttingTime[];
}

@State<GetLaserCuttingModel>({
  name: 'LaserCuttingCutting',
  defaults: {
    LaserCuttingSpeedList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class LaserCuttingState {
  constructor(private sheetMetalLookupService: SheetMetalLookupService) {}

  @Selector()
  static getLaserCutting(state: GetLaserCuttingModel) {
    return state.LaserCuttingSpeedList;
  }

  @Action(GetLaserCuttingSpeed)
  getLaserCuttingSpeed(state: StateContext<GetLaserCuttingModel>) {
    state.setState({
      LaserCuttingSpeedList: [],
    });
    return this.sheetMetalLookupService.getLaserCuttingTime().pipe(
      tap((result) => {
        state.setState({
          LaserCuttingSpeedList: [...result],
        });
      })
    );
  }
}
