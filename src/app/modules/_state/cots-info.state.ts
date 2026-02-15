// import { Injectable } from '@angular/core';
// import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
// import { BlockUiService } from 'src/app/shared/services';
// import { tap } from 'rxjs/operators';
// import { CotsInfoDto } from '../../shared/models';
// import { CotsInfoService } from '../../shared/services/cots-info.service';
// import { GetCotsInfoByPartInfoId, UpdateCotsInfo, CreateCotsInfo, DeleteCotsInfo, BulkUpdateCotsInfo, MoveAssembliesInfo } from '../_actions/cots-info.action';
// // import * as CostSummaryActions from '../_actions/cost-summary.action';
// import { MessagingService } from 'src/app/messaging/messaging.service';
// import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

// export class CotsInfoStateModel {
//   cotsInfoDto: CotsInfoDto[];
// }

// @State<CotsInfoStateModel>({
//   name: 'CotsInfo',
//   defaults: {
//     cotsInfoDto: [],
//   },
// })
// @Injectable({ providedIn: 'root' })
// export class CotsInfoState {
//   constructor(
//     private _cotsInfoService: CotsInfoService,
//     private _blockUiService: BlockUiService,
//     private messaging: MessagingService,
//     private _store: Store,
//     private costSummarySignalsService: CostSummarySignalsService
//   ) {}

//   @Selector()
//   static getCotsInfoByPartInfoId(state: CotsInfoStateModel) {
//     return state.cotsInfoDto;
//   }

//   @Action(GetCotsInfoByPartInfoId)
//   getCotsInfoByPartInfoId(state: StateContext<CotsInfoStateModel>, payload: GetCotsInfoByPartInfoId) {
//     state.setState({
//       cotsInfoDto: [],
//     });
//     return this._cotsInfoService.getCotsInfoByPartInfoId(payload.partinfoId).pipe(
//       tap((result: CotsInfoDto[]) => {
//         state.setState({
//           cotsInfoDto: result,
//         });
//       })
//     );
//   }

//   @Action(CreateCotsInfo)
//   createCotsInfo(state: StateContext<CotsInfoStateModel>, payload: CreateCotsInfo) {
//     // this._blockUiService.pushBlockUI('createCotsInfo');
//     return this._cotsInfoService.saveCotsInfo(payload.cotsInfo).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             cotsInfoDto: [...state.getState().cotsInfoDto, result],
//           });
//         }
//         // this._blockUiService.popBlockUI('createCotsInfo');
//       })
//     );
//   }

//   @Action(UpdateCotsInfo)
//   updateCotsInfo(state: StateContext<CotsInfoStateModel>, payload: UpdateCotsInfo) {
//     // this._blockUiService.pushBlockUI('updateCotsInfo');
//     return this._cotsInfoService.updateCotsInfo(payload.cotsInfo).pipe(
//       tap((result) => {
//         if (result) {
//           const cotsInfoList = state.getState().cotsInfoDto;
//           state.patchState({
//             cotsInfoDto: cotsInfoList.map((x) => {
//               let cotsinfo = { ...x };
//               if (cotsinfo.cotsInfoId === result.cotsInfoId) {
//                 cotsinfo = result;
//               }
//               return cotsinfo;
//             }),
//           });
//           this.costSummarySignalsService.getCostSummaryByPartInfoId(payload.cotsInfo.partInfoId);
//         }
//         // this._blockUiService.popBlockUI('updateCotsInfo');
//       })
//     );
//   }

//   @Action(DeleteCotsInfo)
//   deleteCotsInfo(state: StateContext<CotsInfoStateModel>, payload: DeleteCotsInfo) {
//     // this._blockUiService.pushBlockUI('deleteCotsInfo');
//     return this._cotsInfoService.deleteCotsInfo(payload.cotsInfoId).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             cotsInfoDto: state.getState().cotsInfoDto.filter((x) => x.cotsInfoId !== payload.cotsInfoId),
//           });
//           this.costSummarySignalsService.getCostSummaryByPartInfoId(payload.partInfoId);
//         }
//         // this._blockUiService.popBlockUI('deleteCotsInfo');
//       })
//     );
//   }

//   @Action(BulkUpdateCotsInfo)
//   bulkUpdateCotsInfo(state: StateContext<CotsInfoStateModel>, payload: BulkUpdateCotsInfo) {
//     // this._blockUiService.pushBlockUI('bulkUpdateCotsInfo');
//     return this._cotsInfoService.bulkUpdateCotsInfo(payload.cotsInfo).pipe(
//       tap((result) => {
//         if (result) {
//           state.setState({
//             cotsInfoDto: [...result],
//           });
//         }
//         // this._blockUiService.popBlockUI('bulkUpdateCotsInfo');
//       })
//     );
//   }

//   @Action(MoveAssembliesInfo)
//   moveAssembliesInfo(state: StateContext<CotsInfoStateModel>, payload: MoveAssembliesInfo) {
//     // this._blockUiService.pushBlockUI('moveAssembliesInfo');
//     return this._cotsInfoService.moveAssemblies(payload).pipe(
//       tap((result) => {
//         if (result) {
//           this.messaging.openSnackBar(`Purchase Part has been moved successfully.`, '', { duration: 5000 });
//           state.patchState({
//             cotsInfoDto: [...result],
//           });
//         }
//         // this._blockUiService.popBlockUI('moveAssembliesInfo');
//       })
//     );
//   }
// }
