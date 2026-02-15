import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { SheetMetalLookupService } from 'src/app/shared/services/sheet-metal-lookup.service';
import { PlasmaCutting } from 'src/app/shared/models/sheet-metal-lookup.model';
import { GetPlasmaCuttingLookup } from '../_actions/master-data.action';

export class PlasmaCuttingModel {
  PlasmaCuttingList: PlasmaCutting[];
}

@State<PlasmaCuttingModel>({
  name: 'PlasmaCuttingState',
  defaults: {
    PlasmaCuttingList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class PlasmaCuttingState {
  constructor(private sheetMetalLookupService: SheetMetalLookupService) {}

  @Selector()
  static getPlasmaCutting(state: PlasmaCuttingModel) {
    return state.PlasmaCuttingList;
  }

  @Action(GetPlasmaCuttingLookup)
  getPlasmaCuttingLookup(state: StateContext<PlasmaCuttingModel>) {
    state.setState({
      PlasmaCuttingList: [],
    });
    return this.sheetMetalLookupService.getPlasmaCuttingTime().pipe(
      tap((result) => {
        state.setState({
          PlasmaCuttingList: [...result],
        });
      })
    );
  }
}
