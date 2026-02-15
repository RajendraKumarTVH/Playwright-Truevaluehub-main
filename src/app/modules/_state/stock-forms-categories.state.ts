import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MaterialMasterService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { StockFormCategoriesDto } from 'src/app/shared/models';
import { GetStockFormCategories } from '../_actions/master-data.action';

export class StockFormCategoriesStateModel {
  stockFormsCategories: StockFormCategoriesDto[];
}

@State<StockFormCategoriesStateModel>({
  name: 'StockFormsCategoriesType',
  defaults: {
    stockFormsCategories: [],
  },
})
@Injectable({ providedIn: 'root' })
export class StockFormsCategoriesState {
  constructor(private _materialMasterService: MaterialMasterService) {}

  @Selector()
  static getStockFormsCategories(state: StockFormCategoriesStateModel) {
    return state.stockFormsCategories;
  }

  @Action(GetStockFormCategories)
  getAllMachineTypes(state: StateContext<StockFormCategoriesStateModel>) {
    state.setState({
      stockFormsCategories: [],
    });
    return this._materialMasterService.getStockFormCategories().pipe(
      tap((result) => {
        state.setState({
          stockFormsCategories: [...result],
        });
      })
    );
  }
}
