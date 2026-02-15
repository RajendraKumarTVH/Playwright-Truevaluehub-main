// import { Injectable } from '@angular/core';
// import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
// import { PartInfoDto } from 'src/app/shared/models';
// import { PartInfoService } from 'src/app/shared/services';
// import { GetPartInfo, ResetPartInfo, UpdatePartInfo } from '../_actions/part-info.action';
// import { BlockUiService } from 'src/app/shared/services';
// import { tap } from 'rxjs/operators';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';

// export class PartInfoStateModel {
//   partInfo: PartInfoDto;
// }

// @State<PartInfoStateModel>({
//   name: 'partInfo',
//   defaults: {
//     partInfo: null,
//   },
// })
// @Injectable({ providedIn: 'root' })
// export class PartInfoState {
//   constructor(
//     private _partInfoService: PartInfoService,
//     private _blockUiService: BlockUiService,
//     private _store: Store
//   ) {}

//   @Selector()
//   static getPartInfo(state: PartInfoStateModel) {
//     return state.partInfo;
//   }

//   @Action(GetPartInfo)
//   getPartInfo(state: StateContext<PartInfoStateModel>, payload: GetPartInfo) {
//     // state.setState({
//     //   partInfo: null,
//     // });
//     // this._blockUiService.pushBlockUI('getPartInfo');
//     return this._partInfoService.getParttDetailsById(payload.partInfoId).pipe(
//       tap((result) => {
//         state.setState({
//           partInfo: result,
//         });
//         // this._blockUiService.popBlockUI('getPartInfo');
//       })
//     );
//   }

//   @Action(ResetPartInfo)
//   resetPartInfo(state: StateContext<PartInfoStateModel>) {
//     state.setState({
//       partInfo: null,
//     });
//   }

//   @Action(UpdatePartInfo)
//   updatePartInfo(state: StateContext<PartInfoStateModel>, payload: UpdatePartInfo) {
//     // this._blockUiService.pushBlockUI('updatePartInfo');
//     return this._partInfoService.updatePartInfo(payload.partInfo).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             partInfo: result,
//           });
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfo.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('updatePartInfo');
//       })
//     );
//   }
// }
