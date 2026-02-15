import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MachiningService } from '../costing/services/machining.service';
import { GetMigLookup } from '../_actions/master-data.action';
import { MigWeldingLookupDto } from 'src/app/shared/models/migLookup.model';

export class GetMigDataStateModel {
  getMigDataList: MigWeldingLookupDto[];
}

@State<GetMigDataStateModel>({
  name: 'GetMigDataStateModel',
  defaults: {
    getMigDataList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class GetMigDataState {
  constructor(private _machiningService: MachiningService) {}

  @Selector()
  static getMigLookup(state: GetMigDataStateModel) {
    return state.getMigDataList;
  }

  @Action(GetMigLookup)
  getGrindingLookup(state: StateContext<GetMigDataStateModel>) {
    state.setState({
      getMigDataList: [],
    });
    return this._machiningService.getGetMigLookup().pipe(
      tap((result) => {
        state.setState({
          getMigDataList: [...result],
        });
      })
    );
  }
}
