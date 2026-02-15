// import { Injectable } from '@angular/core';
// import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
// import { ViewCostSummaryDto } from 'src/app/shared/models';
// import { CostSummaryService } from 'src/app/shared/services';
// import { BlockUiService } from 'src/app/shared/services';
// import { tap } from 'rxjs/operators';
// import { GetCostSummaryByMultiplePartInfoIds, GetCostSummaryByPartInfoId, SaveCostSummaryByPartInfoId, UpdateCostSummaryByPartInfoId } from '../_actions/cost-summary.action';
// import * as CostSummaryActions from '../_actions/cost-summary.action';
// // import * as ProcessInfoActions from 'src/app/modules/_actions/process-info.action';
// // import * as MaterialInfoActions from 'src/app/modules/_actions/material-info.action';
// import * as OverheadActions from 'src/app/modules/_actions/overhead-profit.action';
// // import * as ToolingInfoActions from 'src/app/modules/_actions/tooling-info.action';
// import * as PackagingInfoActions from 'src/app/modules/_actions/packaging-info.action';
// import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';
// import { ProcessInfoSignalsService } from 'src/app/shared/signals/process-info-signals.service';
// import { CostToolingSignalsService } from 'src/app/shared/signals/cost-tooling-signals.service';
// export class CostSummaryStateModel {
//   costSummary: ViewCostSummaryDto[];
//   costSummaryAll: { [key: number]: ViewCostSummaryDto };
// }

// @State<CostSummaryStateModel>({
//   name: 'CostSummary',
//   defaults: {
//     costSummary: [],
//     costSummaryAll: {},
//   },
// })
// @Injectable({ providedIn: 'root' })
// export class CostSummaryState {
//   constructor(
//     private _CostSummaryService: CostSummaryService,
//     private _blockUiService: BlockUiService,
//     private _store: Store,
//     private _materialInfoSignalsService: MaterialInfoSignalsService,
//     private _processInfoSignalsService: ProcessInfoSignalsService,
//     private toolingInfoSignalsService: CostToolingSignalsService
//   ) {}

//   @Selector()
//   static getCostSummarys(state: CostSummaryStateModel) {
//     return state.costSummary;
//   }

//   @Selector()
//   static getAllCostSummarys(state: CostSummaryStateModel) {
//     return state.costSummaryAll;
//   }

//   @Action(GetCostSummaryByPartInfoId)
//   getCostSummarysByPartInfoId(state: StateContext<CostSummaryStateModel>, payload: GetCostSummaryByPartInfoId) {
//     // this._blockUiService.pushBlockUI('getCostSummarysByPartInfoId');
//     return this._CostSummaryService.getCostSummaryViewByPartInfoId(payload.partInfoId).pipe(
//       tap((result) => {
//         if (result && result.length > 0) {
//           state.patchState({
//             costSummary: [...result],
//             costSummaryAll: { ...state.getState().costSummaryAll, [result[0].partInfoId]: result[0] },
//           });
//           // if (result[0].sumNetProcessCost && payload.source === 'bulkUpdateOrCreateProcessInfo') {
//           if (payload.source === 'bulkUpdateOrCreateProcessInfo') {
//             this._processInfoSignalsService.setBulkProcessUpdateLoading(false);
//           } else if (payload.source === 'bulkUpdateOrCreateMaterialInfo') {
//             this._materialInfoSignalsService.setBulkMaterialUpdateLoading(false);
//           } else if (payload.source === 'overHeadProfit') {
//             this._store.dispatch(new OverheadActions.SetBulkOverheadUpdateLoading(false));
//           } else if (payload.source === 'bulkUpdateAsyncTooling') {
//             // this._store.dispatch(new ToolingInfoActions.SetBulkToolingUpdateLoading(false));
//             this.toolingInfoSignalsService.setBulkToolingUpdateLoading(false);
//           } else if (payload.source === 'savePackagingInfo') {
//             this._store.dispatch(new PackagingInfoActions.SetBulkPackagingUpdateLoading(false));
//           }
//         }
//         // this._blockUiService.popBlockUI('getCostSummarysByPartInfoId');
//       })
//     );
//     // }
//     // return true;
//   }

//   @Action(GetCostSummaryByMultiplePartInfoIds)
//   getCostSummaryByMultiplePartInfoIds(state: StateContext<CostSummaryStateModel>, payload: GetCostSummaryByMultiplePartInfoIds) {
//     // this._blockUiService.pushBlockUI('getCostSummaryByMultiplePartInfoIds');
//     return this._CostSummaryService.getCostSummaryViewByMultiplePartInfoIds(payload.partInfoIds).pipe(
//       tap((result) => {
//         if (result && result.length > 0) {
//           state.patchState({
//             costSummaryAll: { ...state.getState().costSummaryAll, ...result.reduce((updatedObj, curItem) => ({ ...updatedObj, [curItem.partInfoId]: curItem }), {}) },
//           });
//         }
//         // this._blockUiService.popBlockUI('getCostSummaryByMultiplePartInfoIds');
//       })
//     );
//   }

//   @Action(SaveCostSummaryByPartInfoId)
//   createCostSummary(state: StateContext<CostSummaryStateModel>, payload: SaveCostSummaryByPartInfoId) {
//     return this._CostSummaryService.saveCostSummary(payload.costSummary).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.costSummary.partInfoId));
//         }
//       })
//     );
//   }

//   @Action(CostSummaryActions.UpdateCostSummaryByPartInfoId)
//   updateCostSummary(state: StateContext<CostSummaryStateModel>, payload: UpdateCostSummaryByPartInfoId) {
//     // this._blockUiService.pushBlockUI('updateCostSummary');
//     return this._CostSummaryService.updateCostsummary(payload.costSummary).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.costSummary.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('updateCostSummary');
//       })
//     );
//   }
// }
