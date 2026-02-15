import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GetMarketMonth } from '../_actions/master-data.action';

export class MarketMonthStateModel {
  marketMonth: string;
}

@State<MarketMonthStateModel>({
  name: 'MarketMonthType',
  defaults: {
    marketMonth: null,
  },
})
@Injectable({ providedIn: 'root' })
export class MarketMonthState {
  @Selector()
  static getSelectedMarketMonth(state: MarketMonthStateModel) {
    return state.marketMonth;
  }

  @Action(GetMarketMonth)
  getStockForms({ setState }: StateContext<MarketMonthStateModel>, { marketMonth }: GetMarketMonth) {
    setState({
      marketMonth,
    });
  }
}
