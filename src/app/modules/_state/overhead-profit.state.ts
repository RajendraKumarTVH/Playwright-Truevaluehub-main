import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { CostOverHeadProfitDto } from 'src/app/shared/models/overhead-Profit.model';
import { OverHeadProfitMasterService, BlockUiService } from 'src/app/shared/services';
import { CreateOverHeadProfit, GetOverHeadProfitByPartInfoId, GetViewCostSummaryByPartInfoId, UpdateOverHeadProfit, SetBulkOverheadUpdateLoading } from '../_actions/overhead-profit.action';
import { tap } from 'rxjs/operators';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
import * as OverheadActions from 'src/app/modules/_actions/overhead-profit.action';
import { ViewCostSummaryDto } from 'src/app/shared/models';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

export class OverheadProfitStateModel {
  overheadProfitDto: CostOverHeadProfitDto;
  bulkOverheadUpdateLoading: boolean;
}
export class CostSummaryStateModel {
  viewCostSummary: ViewCostSummaryDto[];
}

@State<OverheadProfitStateModel>({
  name: 'OverheadProfit',
  defaults: {
    overheadProfitDto: null,
    bulkOverheadUpdateLoading: true,
  },
})
@State<CostSummaryStateModel>({
  name: 'ViewCostSummary',
  defaults: {
    viewCostSummary: [],
  },
})
@Injectable({ providedIn: 'root' })
export class OverheadProfitState {
  constructor(
    private _overheadProfitService: OverHeadProfitMasterService,
    private _blockUiService: BlockUiService,
    private _store: Store,
    private costSummarySignalsService: CostSummarySignalsService
  ) {}

  @Selector()
  static getOverheadProfit(state: OverheadProfitStateModel) {
    return state.overheadProfitDto;
  }
  @Selector()
  static getViewCostSummary(state: CostSummaryStateModel) {
    return state.viewCostSummary;
  }
  @Selector()
  static getBulkOverheadUpdateStatus(state: OverheadProfitStateModel) {
    return state.bulkOverheadUpdateLoading;
  }

  @Action(GetOverHeadProfitByPartInfoId)
  getOverheadProfitsByPartInfoId(state: StateContext<OverheadProfitStateModel>, payload: GetOverHeadProfitByPartInfoId) {
    // state.patchState({
    //   overheadProfitDto: null,
    // });
    return this._overheadProfitService.getOverheadProfitByPartInfoId(payload.partInfoId).pipe(
      tap((result) => {
        // if (result) {
        state.patchState({
          overheadProfitDto: result || null,
        });
        // }
      })
    );
  }

  @Action(CreateOverHeadProfit)
  createOverHeadProfit(state: StateContext<OverheadProfitStateModel>, payload: CreateOverHeadProfit) {
    // this._blockUiService.pushBlockUI('createOverHeadProfit');
    return this._overheadProfitService.saveCostOverHeadProfit(payload.overHeadProfit).pipe(
      tap((result) => {
        if (result) {
          state.patchState({
            overheadProfitDto: result,
          });
          if (payload.overHeadProfit.partInfoId > 0) {
            this._store.dispatch(new OverheadActions.GetOverHeadProfitByPartInfoId(payload.overHeadProfit.partInfoId));
          }
          this.costSummarySignalsService.getCostSummaryByPartInfoId(payload.overHeadProfit.partInfoId, 'overHeadProfit');
        }
        // this._blockUiService.popBlockUI('createOverHeadProfit');
      })
    );
  }

  @Action(UpdateOverHeadProfit)
  updateOverHeadProfit(state: StateContext<OverheadProfitStateModel>, payload: UpdateOverHeadProfit) {
    // this._blockUiService.pushBlockUI('updateOverHeadProfit');
    return this._overheadProfitService.updateCostOverHeadProfit(payload.overHeadProfit).pipe(
      tap((result) => {
        if (result) {
          state.patchState({
            overheadProfitDto: result,
          });

          if (payload.overHeadProfit.partInfoId > 0) {
            this._store.dispatch(new OverheadActions.GetOverHeadProfitByPartInfoId(payload.overHeadProfit.partInfoId));
            this.costSummarySignalsService.getCostSummaryByPartInfoId(payload.overHeadProfit.partInfoId, 'overHeadProfit');
          }
        }
        // this._blockUiService.popBlockUI('updateOverHeadProfit');
      })
    );
  }

  @Action(GetViewCostSummaryByPartInfoId)
  getViewCostSummaryByPartInfoId(state: StateContext<CostSummaryStateModel>, payload: GetViewCostSummaryByPartInfoId) {
    // this._blockUiService.pushBlockUI('getViewCostSummaryByPartInfoId');
    return this._overheadProfitService.getCostSummaryViewByPartInfoId(payload.partInfoId).pipe(
      tap((result) => {
        if (result && result.length > 0) {
          state.patchState({
            viewCostSummary: [...result],
          });
        }
        // this._blockUiService.popBlockUI('getViewCostSummaryByPartInfoId');
      })
    );
  }

  @Action(SetBulkOverheadUpdateLoading)
  setBulkOverheadUpdateLoadingFalse(state: StateContext<OverheadProfitStateModel>, flag: SetBulkOverheadUpdateLoading) {
    state.patchState({
      bulkOverheadUpdateLoading: flag.source,
    });
  }
}
