// table.state.ts
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { TableFilterStateModel } from 'src/app/models/table-state.model';
import { ClearTableFilterState, SetTableFilterState } from '../_actions/table.actions';
import { Injectable } from '@angular/core';

@State<TableFilterStateModel>({
  name: 'table',
  defaults: {
    filters: null,
    columnFilters: null,
    rows: 10,
    first: 0,
  },
})
@Injectable({ providedIn: 'root' })
export class TableFilterState {
  @Selector()
  static getTableFilterState(state: TableFilterStateModel) {
    return state;
  }

  @Action(SetTableFilterState)
  setTableFilterState(ctx: StateContext<TableFilterStateModel>, action: SetTableFilterState) {
    ctx.patchState(action.payload);
  }

  @Action(ClearTableFilterState)
  clearTableFilterState(ctx: StateContext<TableFilterStateModel>) {
    ctx.setState({
      filters: null,
      columnFilters: null,
      rows: 10,
      first: 0,
    });
  }
}
