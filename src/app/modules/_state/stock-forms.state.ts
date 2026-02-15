import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MaterialMasterService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { StockFormDto } from 'src/app/shared/models';
import { GetStockForms } from '../_actions/master-data.action';

export class StockFormStateModel {
  stockForms: StockFormDto[];
}

@State<StockFormStateModel>({
  name: 'StockFormsType',
  defaults: {
    stockForms: [],
  },
})
@Injectable({ providedIn: 'root' })
export class StockFormsState {
  constructor(private _materialMasterService: MaterialMasterService) {}

  @Selector()
  static getStockForms(state: StockFormStateModel) {
    return state.stockForms;
  }

  @Action(GetStockForms)
  getStockForms(state: StateContext<StockFormStateModel>) {
    state.setState({
      stockForms: [],
    });
    return this._materialMasterService.getStockForms().pipe(
      tap((result) => {
        state.setState({
          stockForms: [...result],
        });
      })
    );
  }
}
