import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { CommodityService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { TechnologyMasterDto } from 'src/app/shared/models';
import { GetTechnologyData } from '../_actions/master-data.action';

export class TechnologyStateModel {
  technologyList: TechnologyMasterDto[];
}

@State<TechnologyStateModel>({
  name: 'Technology',
  defaults: {
    technologyList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class TechnologyState {
  constructor(private _commodityService: CommodityService) {}

  @Selector()
  static getTechnologyData(state: TechnologyStateModel) {
    return state.technologyList;
  }

  @Action(GetTechnologyData)
  getTechnologyData(state: StateContext<TechnologyStateModel>) {
    state.setState({
      technologyList: [],
    });
    return this._commodityService.getTechnologyData().pipe(
      tap((result) => {
        state.setState({
          technologyList: [...result],
        });
      })
    );
  }
}
