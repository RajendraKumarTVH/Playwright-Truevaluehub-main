// import { Injectable } from '@angular/core';
// import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
// import { ProcessInfoDto } from 'src/app/shared/models';
// import { ApiCacheService, ProcessInfoService } from 'src/app/shared/services';
// import {
//   GetProcessInfosByPartInfoId,
//   UpdateProcessInfo,
//   CreateProcessInfo,
//   DeleteProcessInfo,
//   DeleteAllProcessInfo,
//   BulkUpdateOrCreateProcessInfo,
//   SetBulkProcessUpdateLoading,
//   ClearProcessInfos,
// } from '../_actions/process-info.action';
// import { BlockUiService } from 'src/app/shared/services';
// import { tap } from 'rxjs/operators';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
// import * as ToolingInfoActions from 'src/app/modules/_actions/tooling-info.action';
// import * as ProcessInfoActions from 'src/app/modules/_actions/process-info.action';

// export class ProcessInfoStateModel {
//   processInfos: ProcessInfoDto[];
//   bulkProcessUpdateLoading: boolean;
// }
// @State<ProcessInfoStateModel>({
//   name: 'ProcessInfos',
//   defaults: {
//     processInfos: [],
//     bulkProcessUpdateLoading: true,
//   },
// })
// @Injectable({ providedIn: 'root' })
// export class ProcessInfoState {
//   constructor(
//     private _processInfoService: ProcessInfoService,
//     private _blockUiService: BlockUiService,
//     private _store: Store,
//     private _apiCacheService: ApiCacheService
//   ) {}

//   @Selector()
//   static getProcessInfos(state: ProcessInfoStateModel) {
//     return state.processInfos;
//   }

//   @Selector()
//   static getBulkProcessUpdateStatus(state: ProcessInfoStateModel) {
//     return state.bulkProcessUpdateLoading;
//   }

//   @Action(GetProcessInfosByPartInfoId)
//   getProcessInfosByPartInfoId(state: StateContext<ProcessInfoStateModel>, payload: GetProcessInfosByPartInfoId) {
//     return this._processInfoService.getProcessInfoByPartInfoId(payload.partInfoId).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             processInfos: [...result],
//           });
//         }
//       })
//     );
//   }

//   @Action(ClearProcessInfos)
//   clearProcessInfos(state: StateContext<ProcessInfoStateModel>) {
//     state.setState({
//       processInfos: [],
//       bulkProcessUpdateLoading: true,
//     });
//   }

//   @Action(CreateProcessInfo)
//   createProcessInfo(state: StateContext<ProcessInfoStateModel>, payload: CreateProcessInfo) {
//     // this._blockUiService.pushBlockUI('createProcessInfo');
//     console.log('CreateProcessInfo', payload.processInfo); // BP
//     if (sessionStorage.getItem('processlist') && window.location.pathname === '/analytics/bestprocess') {
//       const processes = JSON.parse(sessionStorage.getItem('processlist'));
//       processes.push({ ...payload.processInfo, processInfoId: 0 });
//       sessionStorage.setItem('processlist', JSON.stringify(processes));
//     }
//     return this._processInfoService.saveProcessInfoDetails(payload.processInfo).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             processInfos: [...state.getState().processInfos, result],
//           });

//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.processInfo.partInfoId));
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.processInfo.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('createProcessInfo');
//       })
//     );
//   }

//   @Action(UpdateProcessInfo)
//   updateProcessInfo(state: StateContext<ProcessInfoStateModel>, payload: UpdateProcessInfo) {
//     // this._blockUiService.pushBlockUI('updateProcessInfo');
//     console.log('UpdateProcessInfo', payload.processInfo); // BP
//     return this._processInfoService.updateProcessInfo(payload.processInfo).pipe(
//       tap((result) => {
//         if (result) {
//           const materialInfoList = state.getState().processInfos;
//           state.patchState({
//             processInfos: materialInfoList.map((x) => {
//               let ProcessInfo = { ...x };
//               if (ProcessInfo.processInfoId === result.processInfoId) {
//                 ProcessInfo = result;
//               }
//               return ProcessInfo;
//             }),
//           });
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.processInfo.partInfoId));
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.processInfo.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('updateProcessInfo');
//       })
//     );
//   }

//   @Action(DeleteProcessInfo)
//   deleteProcessInfo(state: StateContext<ProcessInfoStateModel>, payload: DeleteProcessInfo) {
//     // this._blockUiService.pushBlockUI('deleteProcessInfo');
//     return this._processInfoService.deleteProcessInfo(payload.processInfoId).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             processInfos: state.getState().processInfos.filter((x) => x.processInfoId !== payload.processInfoId),
//           });
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('deleteProcessInfo');
//       })
//     );
//   }

//   @Action(DeleteAllProcessInfo)
//   deleteAllProcessInfo(state: StateContext<ProcessInfoStateModel>, payload: DeleteAllProcessInfo) {
//     // this._blockUiService.pushBlockUI('deleteAllProcessInfo');
//     return this._processInfoService.deleteAllProcessInfo(payload.partInfoId).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             processInfos: [],
//           });
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('deleteAllProcessInfo');
//       })
//     );
//   }

//   @Action(BulkUpdateOrCreateProcessInfo)
//   bulkUpdateOrCreateProcessInfo(state: StateContext<ProcessInfoStateModel>, payload: BulkUpdateOrCreateProcessInfo) {
//     // this._blockUiService.pushBlockUI('bulkUpdateOrCreateProcessInfo');
//     console.log('BulkUpdateOrCreateProcessInfo', payload.processInfo); // BP
//     if (sessionStorage.getItem('processlist') && window.location.pathname === '/analytics/bestprocess') {
//       const processes = JSON.parse(sessionStorage.getItem('processlist'));
//       processes.push({ ...payload.processInfo[0], processInfoId: 0 });
//       sessionStorage.setItem('processlist', JSON.stringify(processes));
//     }
//     // state.patchState({
//     //   bulkProcessUpdateLoading: true,
//     // });
//     return this._processInfoService.bulkUpdateOrCreateProcessInfo(payload.processInfo).pipe(
//       tap((result) => {
//         if (result) {
//           const partInfoId = result?.length > 0 ? result[0].partInfoId : 0;
//           if (partInfoId > 0) {
//             // state.patchState({
//             //     bulkProcessUpdateLoading: false
//             // });
//             this._store.dispatch(new ProcessInfoActions.GetProcessInfosByPartInfoId(partInfoId));
//             this._apiCacheService.removeCache('/api/costing/CostTooling/' + partInfoId);
//             this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(partInfoId));
//             this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(partInfoId, 'bulkUpdateOrCreateProcessInfo'));
//           }
//         }
//         // this._blockUiService.popBlockUI('bulkUpdateOrCreateProcessInfo');
//       })
//     );
//   }

//   @Action(SetBulkProcessUpdateLoading)
//   setBulkProcessUpdateLoadingFalse(state: StateContext<ProcessInfoStateModel>, flag: SetBulkProcessUpdateLoading) {
//     state.patchState({
//       bulkProcessUpdateLoading: flag.source,
//     });
//   }
// }
