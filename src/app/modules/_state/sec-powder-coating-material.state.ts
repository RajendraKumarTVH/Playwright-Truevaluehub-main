import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GetPowderCoatingMaterialDescription } from '../_actions/secondary-process.action';
import { tap } from 'rxjs/operators';
import { SecondaryProcessService } from '../../shared/services/secondary-process.service';
export class SecondaryProcessMaterialDescStateModel {
  powderCoatingMaterialDescription: string[];
}
@State<SecondaryProcessMaterialDescStateModel>({
  name: 'SecondaryProcessMaterialDesc',
  defaults: {
    powderCoatingMaterialDescription: [],
  },
})
@Injectable({ providedIn: 'root' })
export class SecondaryProcessMaterialState {
  constructor(private _secondaryProcessInfoService: SecondaryProcessService) {}

  @Selector()
  static getPowderCoatingMaterialDescription(state: SecondaryProcessMaterialDescStateModel) {
    return state.powderCoatingMaterialDescription;
  }

  @Action(GetPowderCoatingMaterialDescription)
  getPowderCoatingMaterialDescription(state: StateContext<SecondaryProcessMaterialDescStateModel>) {
    state.setState({
      powderCoatingMaterialDescription: [],
    });
    return this._secondaryProcessInfoService.getPowderCoatingMaterialDescription().pipe(
      tap((result) => {
        if (result) {
          state.patchState({
            powderCoatingMaterialDescription: [...result],
          });
        }
      })
    );
  }
}
