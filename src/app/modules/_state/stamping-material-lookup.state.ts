import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { SheetMetalLookupService } from 'src/app/shared/services/sheet-metal-lookup.service';
import { StampingMetrialLookUp } from 'src/app/shared/models/sheet-metal-lookup.model';
import { GetStampingMatrialLookUpList } from '../_actions/master-data.action';

export class GetStampingMetrialLookUpModel {
  StampingMetrialLookUpList: StampingMetrialLookUp[];
}

@State<GetStampingMetrialLookUpModel>({
  name: 'StampingMetrialLookUp',
  defaults: {
    StampingMetrialLookUpList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class StampingMetrialLookUpState {
  constructor(private sheetMetalLookupService: SheetMetalLookupService) {}

  @Selector()
  static getStampingMetrialLookUp(state: GetStampingMetrialLookUpModel) {
    return state.StampingMetrialLookUpList;
  }

  @Action(GetStampingMatrialLookUpList)
  getStampingMatrialLookUpList(state: StateContext<GetStampingMetrialLookUpModel>) {
    state.setState({
      StampingMetrialLookUpList: [],
    });
    return this.sheetMetalLookupService.getStampingMaterialLookUpAll().pipe(
      tap((result) => {
        state.setState({
          StampingMetrialLookUpList: [...result],
        });
      })
    );
  }
}
