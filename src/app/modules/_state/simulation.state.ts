import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { BlockUiService, SimulationService } from 'src/app/shared/services';
import { BestProcessTotalCostDto, SimulationTotalCostDto } from '../analytics/models/simulationTotalCostDto.model';
import { GetSimulationResultDb, UpdateSimulationResultStore } from '../_actions/simulation.action';
import { PageEnum } from 'src/app/shared/enums';
import * as SimulationDataActions from 'src/app/modules/_actions/simulation.action';
import { MessagingService } from 'src/app/messaging/messaging.service';

export class SimulationStateModel {
  simulationResult: SimulationTotalCostDto[];
  totProcessList: BestProcessTotalCostDto[];
}

@State<SimulationStateModel>({
  name: 'SimulationResult',
  defaults: {
    simulationResult: [],
    totProcessList: [],
  },
})
@Injectable({ providedIn: 'root' })
export class SimulationState {
  constructor(
    private _simulationService: SimulationService,
    private _blockUiService: BlockUiService,
    private messaging: MessagingService,
    private _store: Store
  ) {}

  @Selector()
  static getSimulationResult(state: SimulationStateModel) {
    return state.simulationResult;
  }

  @Selector()
  static getTotProcessList(state: SimulationStateModel) {
    return state.totProcessList;
  }

  // @Action(GetPreviousSimulationResult)
  // getPreviousSimulationResult(state: StateContext<SimulationStateModel>, params: GetPreviousSimulationResult) {
  //     if (params.page == PageEnum.BestRegion) {
  //         return [...state.getState().simulationResult];
  //     } else if (params.page == PageEnum.BestProcess) {
  //         return [...state.getState().totProcessList];
  //     }
  //     return [];
  // }

  // Only get best region
  @Action(GetSimulationResultDb)
  getSimulationResultDb(state: StateContext<SimulationStateModel>, payload: GetSimulationResultDb) {
    // if (payload.page === PageEnum.BestRegion) {
    this._blockUiService.pushBlockUI('getSimulationResultDb');
    return this._simulationService.getSimulationResult(payload.partInfoId).pipe(
      tap((result) => {
        if (result && result.length > 0) {
          this._store.dispatch(new SimulationDataActions.UpdateSimulationResultStore({ SimulationTotalCostDtos: [...result] }, PageEnum.BestRegion));
        }
        setTimeout(() => this._blockUiService.popBlockUI('getSimulationResultDb'), 3000);
      })
    );
    // }
  }

  @Action(UpdateSimulationResultStore)
  updateSimulationResultStore(state: StateContext<SimulationStateModel>, payload: UpdateSimulationResultStore) {
    if (payload.page == PageEnum.BestRegion) {
      return state.patchState({
        simulationResult: [...payload.simulationdto.SimulationTotalCostDtos],
      });
    } else if (payload.page == PageEnum.BestProcess) {
      return state.patchState({
        totProcessList: [...payload.simulationdto.bestProcessCostDtos],
      });
    }
    return state;
  }
}
