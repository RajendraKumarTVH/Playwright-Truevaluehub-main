import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MedbMasterService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { MedbProcessTypeMasterDto } from 'src/app/shared/models';
import { GetProcessTypeList } from '../_actions/master-data.action';

export class ProcessTypeStateModel {
  processTypeList: MedbProcessTypeMasterDto[];
}

@State<ProcessTypeStateModel>({
  name: 'ProcessType',
  defaults: {
    processTypeList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class ProcessTypeState {
  constructor(private _medbMasterService: MedbMasterService) {}

  @Selector()
  static getProcessTypeList(state: ProcessTypeStateModel) {
    return state.processTypeList;
  }

  @Action(GetProcessTypeList)
  getProcessTypeList(state: StateContext<ProcessTypeStateModel>) {
    state.setState({
      processTypeList: [],
    });
    return this._medbMasterService.getPrcessTypeList().pipe(
      tap((result) => {
        state.setState({
          processTypeList: [...result],
        });
      })
    );
  }
}
