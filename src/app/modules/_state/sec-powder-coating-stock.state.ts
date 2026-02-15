import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GetPowderCoatingStockForm } from '../_actions/secondary-process.action';
import { tap } from 'rxjs/operators';
import { SecondaryProcessService } from '../../shared/services/secondary-process.service';
export class SecondaryProcessPowderCoatingStockStateModel {
  powderCoatingStockForm: string[];
}
@State<SecondaryProcessPowderCoatingStockStateModel>({
  name: 'SecondaryProcessPowderCoatingStocks',
  defaults: {
    powderCoatingStockForm: [],
  },
})
@Injectable({ providedIn: 'root' })
export class SecondaryProcessPowderCoatingStockState {
  constructor(private _secondaryProcessInfoService: SecondaryProcessService) {}

  @Selector()
  static getPowderCoatingStockForm(state: SecondaryProcessPowderCoatingStockStateModel) {
    return state.powderCoatingStockForm;
  }

  @Action(GetPowderCoatingStockForm)
  getPowderCoatingStockForm(state: StateContext<SecondaryProcessPowderCoatingStockStateModel>) {
    state.setState({
      powderCoatingStockForm: [],
    });
    return this._secondaryProcessInfoService.getPowderCoatingStockForm().pipe(
      tap((result) => {
        if (result) {
          state.setState({
            powderCoatingStockForm: [...result],
          });
        }
      })
    );
  }
}
