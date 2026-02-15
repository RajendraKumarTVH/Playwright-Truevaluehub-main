import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MaterialMasterService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { MaterialTypeDto } from 'src/app/shared/models';
import { GetMaterialTypes } from '../_actions/master-data.action';

export class MaterialTypeStateModel {
  materialTypeList: MaterialTypeDto[];
}

@State<MaterialTypeStateModel>({
  name: 'materialType',
  defaults: {
    materialTypeList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class MaterialTypeState {
  constructor(private _materialMasterService: MaterialMasterService) {}

  @Selector()
  static getMaterialTypes(state: MaterialTypeStateModel) {
    return state.materialTypeList;
  }

  @Action(GetMaterialTypes)
  getmaterialTypes(state: StateContext<MaterialTypeStateModel>) {
    state.setState({
      materialTypeList: [],
    });
    return this._materialMasterService.getMaterialTypes().pipe(
      tap((result) => {
        state.setState({
          materialTypeList: [...result],
        });
      })
    );
  }
}
