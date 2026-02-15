import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ProjectInfoService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { GetSubCommodityData } from '../_actions/master-data.action';
import { SubCategoryDto } from 'src/app/shared/models/pcb-master..model';

export class SubCommodityStateModel {
  SubCommodityList: SubCategoryDto[];
}

@State<SubCommodityStateModel>({
  name: 'SubCommodity',
  defaults: {
    SubCommodityList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class SubCommodityState {
  constructor(private _subCategoryService: ProjectInfoService) {}

  @Selector()
  static getSubCommodityData(state: SubCommodityStateModel) {
    return state.SubCommodityList;
  }

  @Action(GetSubCommodityData)
  getSubCommodityData(state: StateContext<SubCommodityStateModel>) {
    state.setState({
      SubCommodityList: [],
    });
    return this._subCategoryService.getSubCategories().pipe(
      tap((result) => {
        state.setState({
          SubCommodityList: [...result],
        });
      })
    );
  }
}
