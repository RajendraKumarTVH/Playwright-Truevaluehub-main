// import { Injectable } from '@angular/core';
// import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
// import { MaterialInfoDto } from 'src/app/shared/models';
// import { ApiCacheService, MaterialInfoService } from 'src/app/shared/services';
// import {
//   GetMaterialInfosByPartInfoId,
//   UpdateMaterialInfo,
//   CreateMaterialInfo,
//   DeleteMaterialInfo,
//   BulkUpdateOrCreateMaterialInfo,
//   SetBulkMaterialUpdateLoading,
//   ClearMaterialInfos,
// } from '../_actions/material-info.action';
// // import { BlockUiService } from 'src/app/shared/services';
// import { tap } from 'rxjs/operators';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
// import * as MaterialInfoActions from 'src/app/modules/_actions/material-info.action';

// export class MaterialInfoStateModel {
//   materialInfos: MaterialInfoDto[];
//   bulkMaterialUpdateLoading: boolean;
//   bulkMaterialInfos: MaterialInfoDto[];
// }

// @State<MaterialInfoStateModel>({
//   name: 'MaterialInfos',
//   defaults: {
//     materialInfos: [],
//     bulkMaterialUpdateLoading: true,
//     bulkMaterialInfos: [],
//   },
// })
// // export class BulkMaterialInfoStateModel {
// //   bulkMaterialInfos: MaterialInfoDto[];
// // }

// // @State<BulkMaterialInfoStateModel>({
// //   name: 'BulkMaterialInfos',
// //   defaults: {
// //     bulkMaterialInfos: [],
// //   },
// // })
// @Injectable({ providedIn: 'root' })
// export class MaterialInfoState {
//   constructor(
//     private _materialInfoService: MaterialInfoService,
//     private _store: Store,
//     private _apiCacheService: ApiCacheService
//   ) {}

//   @Selector()
//   static getMaterialInfos(state: MaterialInfoStateModel) {
//     return state.materialInfos;
//   }

//   @Selector()
//   static bulkGetMaterialInfos(state: MaterialInfoStateModel) {
//     return state.bulkMaterialInfos;
//   }

//   @Selector()
//   static getBulkMaterialUpdateStatus(state: MaterialInfoStateModel) {
//     return state.bulkMaterialUpdateLoading;
//   }

//   @Action(GetMaterialInfosByPartInfoId)
//   getMaterialInfosByPartInfoId(state: StateContext<MaterialInfoStateModel>, payload: GetMaterialInfosByPartInfoId) {
//     return this._materialInfoService.getMaterialInfosByPartInfoId(payload.partInfoId).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             materialInfos: [...result],
//           });
//         }
//       })
//     );
//   }

//   @Action(ClearMaterialInfos)
//   clearMaterialInfos(state: StateContext<MaterialInfoStateModel>) {
//     state.setState({
//       materialInfos: [],
//       bulkMaterialInfos: [],
//       bulkMaterialUpdateLoading: true,
//     });
//   }

//   @Action(CreateMaterialInfo)
//   createMaterialInfo(state: StateContext<MaterialInfoStateModel>, payload: CreateMaterialInfo) {
//     // this._blockUiService.pushBlockUI('createMaterialInfo');
//     return this._materialInfoService.saveMaterialInfo(payload.materialInfo).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             materialInfos: [...state.getState().materialInfos, result],
//           });
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.materialInfo.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('createMaterialInfo');
//       })
//     );
//   }

//   @Action(UpdateMaterialInfo)
//   updateMaterialInfo(state: StateContext<MaterialInfoStateModel>, payload: UpdateMaterialInfo) {
//     // this._blockUiService.pushBlockUI('updateMaterialInfo');
//     return this._materialInfoService.updateMaterialInfo(payload.materialInfo).pipe(
//       tap((result) => {
//         if (result) {
//           const materialInfoList = state?.getState()?.materialInfos;
//           state.patchState({
//             materialInfos: materialInfoList.map((x) => {
//               let materialinfo = { ...x };
//               if (materialinfo.materialInfoId === result.materialInfoId) {
//                 materialinfo = result;
//               }
//               return materialinfo;
//             }),
//           });
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.materialInfo.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('updateMaterialInfo');
//       })
//     );
//   }

//   @Action(DeleteMaterialInfo)
//   deleteMaterialInfo(state: StateContext<MaterialInfoStateModel>, payload: DeleteMaterialInfo) {
//     // this._blockUiService.pushBlockUI('deleteMaterialInfo');
//     return this._materialInfoService.deleteMaterialInfo(payload.materialInfoId).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             materialInfos: state.getState().materialInfos.filter((x) => x.materialInfoId !== payload.materialInfoId),
//           });
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('deleteMaterialInfo');
//       })
//     );
//   }

//   @Action(BulkUpdateOrCreateMaterialInfo)
//   bulkUpdateOrCreateMaterialInfo(state: StateContext<MaterialInfoStateModel>, payload: BulkUpdateOrCreateMaterialInfo) {
//     // this._blockUiService.pushBlockUI('bulkUpdateOrCreateMaterialInfo');
//     return this._materialInfoService.bulkUpdateOrCreateMaterialInfo(payload.bulkmaterialInfo).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             bulkMaterialInfos: [...result],
//           });
//           const partInfoId = result?.length > 0 ? result[0].partInfoId : 0;
//           if (partInfoId > 0) {
//             this._apiCacheService.removeCache(`/api/costing/MaterialInfo/${partInfoId}/materialdetails`);
//             this._store.dispatch(new MaterialInfoActions.GetMaterialInfosByPartInfoId(partInfoId));
//             this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(partInfoId, 'bulkUpdateOrCreateMaterialInfo'));
//           }
//         }
//         // this._blockUiService.popBlockUI('bulkUpdateOrCreateMaterialInfo');
//       })
//     );
//   }

//   @Action(SetBulkMaterialUpdateLoading)
//   setBulkMaterialUpdateLoadingFalse(state: StateContext<MaterialInfoStateModel>, flag: SetBulkMaterialUpdateLoading) {
//     state.patchState({
//       bulkMaterialUpdateLoading: flag.source,
//     });
//   }
// }
