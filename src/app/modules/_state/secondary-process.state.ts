import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  GetSecondaryProcessInfosByPartInfoId,
  UpdateSecondaryProcessInfo,
  CreateSecondaryProcessInfo,
  DeleteSecondaryProcessInfo,
  BulkUpdateOrCreateSecondaryProcessInfo,
} from '../_actions/secondary-process.action';
import { BlockUiService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { SecondaryProcessDto } from 'src/app/shared/models/secondary-process.model';
import { SecondaryProcessService } from '../../shared/services/secondary-process.service';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
export class SecondaryProcessInfoStateModel {
  secondaryProcessInfos: SecondaryProcessDto[];
}

@State<SecondaryProcessInfoStateModel>({
  name: 'SecondaryProcessInfos',
  defaults: {
    secondaryProcessInfos: [],
  },
})
@Injectable({ providedIn: 'root' })
export class SecondaryProcessInfoState {
  constructor(
    private _secondaryProcessInfoService: SecondaryProcessService,
    private _blockUiService: BlockUiService,
    private _store: Store,
    private costSummarySignalsService: CostSummarySignalsService
  ) {}

  @Selector()
  static getSecondaryProcessInfos(state: SecondaryProcessInfoStateModel) {
    return state.secondaryProcessInfos;
  }

  @Action(GetSecondaryProcessInfosByPartInfoId)
  getSecondaryProcessInfosByPartInfoId(state: StateContext<SecondaryProcessInfoStateModel>, payload: GetSecondaryProcessInfosByPartInfoId) {
    state.setState({
      secondaryProcessInfos: [],
    });
    return this._secondaryProcessInfoService.getSecondaryProcessDetailsByPartId(payload.partInfoId).pipe(
      tap((result) => {
        if (result) {
          state.setState({
            secondaryProcessInfos: [...result],
          });
        }
      })
    );
  }

  @Action(CreateSecondaryProcessInfo)
  createSecondaryProcessInfo(state: StateContext<SecondaryProcessInfoStateModel>, payload: CreateSecondaryProcessInfo) {
    // this._blockUiService.pushBlockUI('createSecondaryProcessInfo');
    return this._secondaryProcessInfoService.saveSecondaryProcessData(payload.secondaryProcessInfo).pipe(
      tap((result) => {
        if (result) {
          state.patchState({
            secondaryProcessInfos: [...state.getState().secondaryProcessInfos, result],
          });
          this.costSummarySignalsService.getCostSummaryByPartInfoId(payload.secondaryProcessInfo.partInfoId);
        }
        // this._blockUiService.popBlockUI('createSecondaryProcessInfo');
      })
    );
  }

  @Action(UpdateSecondaryProcessInfo)
  updateSecondaryProcessInfo(state: StateContext<SecondaryProcessInfoStateModel>, payload: UpdateSecondaryProcessInfo) {
    // this._blockUiService.pushBlockUI('updateSecondaryProcessInfo');
    return this._secondaryProcessInfoService.updateSecondaryProcessData(payload.secondaryProcessInfo).pipe(
      tap((result) => {
        if (result) {
          const list = state.getState().secondaryProcessInfos;
          state.patchState({
            secondaryProcessInfos: list.map((x) => {
              let SecondaryProcessInfo = { ...x };
              if (SecondaryProcessInfo.secondaryProcessInfoId === result.secondaryProcessInfoId) {
                SecondaryProcessInfo = result;
              }
              return SecondaryProcessInfo;
            }),
          });
          this.costSummarySignalsService.getCostSummaryByPartInfoId(payload.secondaryProcessInfo.partInfoId);
        }
        // this._blockUiService.popBlockUI('updateSecondaryProcessInfo');
      })
    );
  }

  @Action(DeleteSecondaryProcessInfo)
  deleteSecondaryProcessInfo(state: StateContext<SecondaryProcessInfoStateModel>, payload: DeleteSecondaryProcessInfo) {
    // this._blockUiService.pushBlockUI('deleteSecondaryProcessInfo');
    return this._secondaryProcessInfoService.deleteSecondaryProcessData(payload.secondaryProcessInfoId).pipe(
      tap((result) => {
        if (result) {
          state.patchState({
            secondaryProcessInfos: state.getState().secondaryProcessInfos.filter((x) => x.secondaryProcessInfoId !== payload.secondaryProcessInfoId),
          });
          this.costSummarySignalsService.getCostSummaryByPartInfoId(payload.partInfoId);
        }
        // this._blockUiService.popBlockUI('deleteSecondaryProcessInfo');
      })
    );
  }

  @Action(BulkUpdateOrCreateSecondaryProcessInfo)
  bulkUpdateOrCreateSecondaryProcessInfo(state: StateContext<SecondaryProcessInfoStateModel>, payload: BulkUpdateOrCreateSecondaryProcessInfo) {
    // this._blockUiService.pushBlockUI('bulkUpdateOrCreateSecondaryProcessInfo');
    return this._secondaryProcessInfoService.bulkUpdateOrCreateSecondaryProcessInfo(payload.secondaryProcessInfo).pipe(
      tap((result) => {
        if (result) {
          state.setState({
            secondaryProcessInfos: [...result],
          });
        }
        // this._blockUiService.popBlockUI('bulkUpdateOrCreateSecondaryProcessInfo');
      })
    );
  }
}
