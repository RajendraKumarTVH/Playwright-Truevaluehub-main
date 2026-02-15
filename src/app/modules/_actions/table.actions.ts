import { TableFilterStateModel } from 'src/app/models/table-state.model';

// table.actions.ts
export class SetTableFilterState {
  static readonly type = '[Table] Set State';
  constructor(public payload: Partial<TableFilterStateModel>) {}
}

export class ClearTableFilterState {
  static readonly type = '[Table] Clear State';
}
