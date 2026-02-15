import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ProcessMasterDto } from 'src/app/shared/models/process-master.model';
import { ProcessMasterService } from 'src/app/shared/services';
import { GetAllProcessMasterData } from '../_actions/master-data.action';
import { tap } from 'rxjs/operators';

export class ProcessMasterStateModel {
  processMasterList: ProcessMasterDto[];
}

@State<ProcessMasterStateModel>({
  name: 'Processmaster',
  defaults: {
    processMasterList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class ProcessMasterState {
  constructor(private _processMasterService: ProcessMasterService) {}

  @Selector()
  static getAllProcessMasterData(state: ProcessMasterStateModel) {
    return state.processMasterList;
  }

  @Action(GetAllProcessMasterData)
  getAllProcessMasterData(state: StateContext<ProcessMasterStateModel>) {
    state.setState({
      processMasterList: [],
    });
    return this._processMasterService.getAllProcessMasterData().pipe(
      tap((result) => {
        state.setState({
          processMasterList: [...result],
        });
      })
    );
  }
}
