import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MaterialMasterService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { MaterialGroupDto } from 'src/app/shared/models';
import { GetMaterialGroups } from '../_actions/master-data.action';

export class MaterialGroupStateModel {
  materialGroupList: MaterialGroupDto[];
}

@State<MaterialGroupStateModel>({
  name: 'MaterialGroup',
  defaults: {
    materialGroupList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class MaterialGroupState {
  constructor(private _materialMasterService: MaterialMasterService) {}

  @Selector()
  static getMaterialGroups(state: MaterialGroupStateModel) {
    return state.materialGroupList;
  }

  @Action(GetMaterialGroups)
  getMaterialGroups(state: StateContext<MaterialGroupStateModel>) {
    state.setState({
      materialGroupList: [],
    });
    return this._materialMasterService.getMaterialGroups().pipe(
      tap((result) => {
        state.setState({
          materialGroupList: [...result],
        });
      })
    );
  }
}
