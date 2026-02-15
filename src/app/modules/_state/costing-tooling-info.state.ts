// import { Injectable } from '@angular/core';
// import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
// import { ApiCacheService, BlockUiService, MaterialMasterService } from 'src/app/shared/services';
// import { tap } from 'rxjs/operators';
// import * as ToolingInfoActions from 'src/app/modules/_actions/tooling-info.action';
// import { CostToolingDto, ToolingMaterialInfoDto, ToolingProcessInfoDto } from 'src/app/shared/models/tooling.model';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
// import { CostToolingService } from 'src/app/shared/services/cost-tooling.service';
// import {
//   BulkUpdateAsync,
//   BulkUpdateOrCreateBOPInfo,
//   BulkUpdateOrCreateToolingMaterialInfo,
//   BulkUpdateOrCreateToolingProcessInfo,
//   // BulkUpdateToolingCostPerPart,
//   BulkUpdateToolingInfo,
//   DeleteToolingBOPInfo,
//   DeleteToolingInfo,
//   DeleteToolingMaterialInfo,
//   DeleteToolingProcessInfo,
//   GetDefaultValuesForTooling,
//   GetToolingInfosByPartInfoId,
//   SaveBOPInfo,
//   SaveToolingInfo,
//   SaveToolingMaterialInfo,
//   SaveToolingProcessInfo,
//   UpdateToolingCostPerPart,
//   SetBulkToolingUpdateLoading,
// } from '../_actions/tooling-info.action';
// import { MaterialMarketDataDto } from 'src/app/shared/models';

// export class ToolingInfoStateModel {
//   toolingInfos: CostToolingDto[];
//   bulkToolingUpdateLoading: boolean;
// }

// export class ToolingTotalCostStateModel {
//   toolingTotalCostInfos: CostToolingDto[];
// }

// export class ToolingMaterialInfoStateModel {
//   toolingMaterialInfos: ToolingMaterialInfoDto[];
// }

// export class ToolingProcessInfoStateModel {
//   toolingProcessInfos: ToolingProcessInfoDto[];
// }

// export class ToolingBOPInfoStateModel {
//   toolingBOPInfos: ToolingMaterialInfoDto[];
// }

// export class ToolingDefaultValueStateModel {
//   defaultDataList: MaterialMarketDataDto[];
// }

// @State<ToolingInfoStateModel>({
//   name: 'ToolingInfos',
//   defaults: {
//     toolingInfos: [],
//     bulkToolingUpdateLoading: true,
//   },
// })
// @State<ToolingTotalCostStateModel>({
//   name: 'ToolingTotalCostInfos',
//   defaults: {
//     toolingTotalCostInfos: [],
//   },
// })
// @State<ToolingMaterialInfoStateModel>({
//   name: 'ToolingMaterialInfos',
//   defaults: {
//     toolingMaterialInfos: [],
//   },
// })
// @State<ToolingProcessInfoStateModel>({
//   name: 'ToolingProcessInfos',
//   defaults: {
//     toolingProcessInfos: [],
//   },
// })
// @State<ToolingBOPInfoStateModel>({
//   name: 'ToolingBOPInfos',
//   defaults: {
//     toolingBOPInfos: [],
//   },
// })
// @State<ToolingDefaultValueStateModel>({
//   name: 'DefaultMarketData',
//   defaults: {
//     defaultDataList: [],
//   },
// })
// @Injectable({ providedIn: 'root' })
// export class ToolingInfoState {
//   constructor(
//     private _toolService: CostToolingService,
//     private _blockUiService: BlockUiService,
//     private _store: Store,
//     private materialMasterService: MaterialMasterService,
//     private _apiCacheService: ApiCacheService
//   ) {}

//   @Selector()
//   static getToolingInfosByPartInfoId(state: ToolingInfoStateModel) {
//     return state.toolingInfos;
//   }

//   @Selector()
//   static getToolingMaterialInfos(state: ToolingMaterialInfoStateModel) {
//     return state.toolingMaterialInfos;
//   }

//   @Selector()
//   static getDefaultValuesForTooling(state: ToolingDefaultValueStateModel) {
//     return state.defaultDataList;
//   }

//   @Selector()
//   static getBulkToolingUpdateStatus(state: ToolingInfoStateModel) {
//     return state.bulkToolingUpdateLoading;
//   }

//   @Action(GetToolingInfosByPartInfoId)
//   getToolingInfosByPartInfoId(state: StateContext<ToolingInfoStateModel>, payload: GetToolingInfosByPartInfoId) {
//     return this._toolService.getCostToolingByPartId(payload.partInfoId).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             toolingInfos: [...result],
//           });
//         }
//       })
//     );
//   }

//   @Action(SaveToolingInfo)
//   saveToolingInfo(state: StateContext<ToolingInfoStateModel>, payload: SaveToolingInfo) {
//     // this._blockUiService.pushBlockUI('SaveCostTooling');
//     return this._toolService.saveCostTooling(payload.toolingInfo).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('SaveCostTooling');
//       })
//     );
//   }

//   @Action(BulkUpdateToolingInfo)
//   bulkUpdateToolingInfo(state: StateContext<ToolingInfoStateModel>, payload: SaveToolingInfo) {
//     // this._blockUiService.pushBlockUI('BulkUpdateTooling');
//     return this._toolService.bulkUpdateTooling(payload.toolingInfo).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('BulkUpdateTooling');
//       })
//     );
//   }

//   @Action(BulkUpdateAsync)
//   bulkUpdateAsync(state: StateContext<ToolingInfoStateModel>, payload: BulkUpdateAsync) {
//     // this._blockUiService.pushBlockUI('bulkUpdateAsync');
//     // state.patchState({
//     //   bulkToolingUpdateLoading: true,
//     // });
//     return this._toolService.bulkUpdateAsync(payload.toolingInfo).pipe(
//       tap((result) => {
//         if (result) {
//           this._apiCacheService.removeCache('/api/costing/CostTooling/' + payload.partInfoId);
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//           // state.patchState({
//           //   bulkToolingUpdateLoading: false,
//           // });
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId, 'bulkUpdateAsyncTooling'));
//         }
//         // this._blockUiService.popBlockUI('bulkUpdateAsync');
//       })
//     );
//   }

//   @Action(UpdateToolingCostPerPart)
//   updateToolingCostPerPart(state: StateContext<ToolingTotalCostStateModel>, payload: UpdateToolingCostPerPart) {
//     // this._blockUiService.pushBlockUI('updateToolingCostPerPart');
//     return this._toolService.updateToolingCostPerPart(payload.toolingInfo).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('updateToolingCostPerPart');
//       })
//     );
//   }

//   // @Action(BulkUpdateToolingCostPerPart)
//   // bulkUpdateToolingCostPerPart(state: StateContext<ToolingTotalCostStateModel>, payload: BulkUpdateToolingCostPerPart) {
//   //   // this._blockUiService.pushBlockUI('bulkUpdateToolingCostPerPart');
//   //   return this._toolService.bulkUpdateToolingCostPerPart(payload.toolingInfo).pipe(
//   //     tap((result) => {
//   //       if (result) {
//   //         this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//   //       }
//   //       // this._blockUiService.popBlockUI('bulkUpdateToolingCostPerPart');
//   //     })
//   //   );
//   // }

//   @Action(DeleteToolingInfo)
//   deleteToolingInfo(state: StateContext<ToolingInfoStateModel>, payload: DeleteToolingInfo) {
//     // this._blockUiService.pushBlockUI('deleteToolingInfo');
//     return this._toolService.deleteCostToolingById(payload.toolingId).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('deleteToolingInfo');
//       })
//     );
//   }

//   @Action(SaveToolingMaterialInfo)
//   saveToolingMaterialInfo(state: StateContext<ToolingMaterialInfoStateModel>, payload: SaveToolingMaterialInfo) {
//     // this._blockUiService.pushBlockUI('saveToolingMaterialInfo');
//     return this._toolService.saveCostToolingMaterial(payload.toolingMaterialList).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('saveToolingMaterialInfo');
//       })
//     );
//   }

//   @Action(BulkUpdateOrCreateToolingMaterialInfo)
//   bulkUpdateOrCreateToolingMaterialInfo(state: StateContext<ToolingMaterialInfoStateModel>, payload: BulkUpdateOrCreateToolingMaterialInfo) {
//     // this._blockUiService.pushBlockUI('bulkUpdateOrCreateToolingMaterialInfo');
//     return this._toolService.bulkUpdateOrCreateToolingMaterialInfo(payload.toolingMaterialList).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('bulkUpdateOrCreateToolingMaterialInfo');
//       })
//     );
//   }

//   @Action(DeleteToolingMaterialInfo)
//   deleteToolingMaterialInfo(state: StateContext<ToolingMaterialInfoStateModel>, payload: DeleteToolingMaterialInfo) {
//     // this._blockUiService.pushBlockUI('deleteToolingMaterialInfo');
//     return this._toolService.deleteCostToolingMaterialById(payload.materialInfoId).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('deleteToolingMaterialInfo');
//       })
//     );
//   }

//   @Action(SaveBOPInfo)
//   saveBOPInfo(state: StateContext<ToolingBOPInfoStateModel>, payload: SaveBOPInfo) {
//     // this._blockUiService.pushBlockUI('saveBOPInfo');
//     return this._toolService.saveCostToolingBOP(payload.BOPList).pipe(
//       tap((result) => {
//         if (result) {
//           this._apiCacheService.removeCache('/api/costing/CostTooling/' + payload.partInfoId);
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('saveBOPInfo');
//       })
//     );
//   }

//   @Action(BulkUpdateOrCreateBOPInfo)
//   bulkUpdateOrCreateBOPInfo(state: StateContext<ToolingBOPInfoStateModel>, payload: BulkUpdateOrCreateBOPInfo) {
//     // this._blockUiService.pushBlockUI('bulkUpdateOrCreateBOPInfo');
//     return this._toolService.bulkUpdateOrCreateBOPInfo(payload.BOPList).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('bulkUpdateOrCreateBOPInfo');
//       })
//     );
//   }

//   @Action(SaveToolingProcessInfo)
//   saveToolingProcessInfo(state: StateContext<ToolingProcessInfoStateModel>, payload: SaveToolingProcessInfo) {
//     // this._blockUiService.pushBlockUI('saveToolingProcessInfo');
//     return this._toolService.saveCostToolingProcess(payload.toolingProcessList).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('saveToolingProcessInfo');
//       })
//     );
//   }

//   @Action(BulkUpdateOrCreateToolingProcessInfo)
//   bulkUpdateOrCreateToolingProcessInfo(state: StateContext<ToolingProcessInfoStateModel>, payload: BulkUpdateOrCreateToolingProcessInfo) {
//     // this._blockUiService.pushBlockUI('bulkUpdateOrCreateToolingProcessInfo');
//     return this._toolService.bulkUpdateOrCreateToolingProcessInfo(payload.toolingProcessList).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//           this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('bulkUpdateOrCreateToolingProcessInfo');
//       })
//     );
//   }

//   @Action(DeleteToolingProcessInfo)
//   deleteToolingProcessInfo(state: StateContext<ToolingProcessInfoStateModel>, payload: DeleteToolingProcessInfo) {
//     // this._blockUiService.pushBlockUI('deleteToolingProcessInfo');
//     return this._toolService.deleteCostToolingProcessById(payload.processInfoId).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('deleteToolingProcessInfo');
//       })
//     );
//   }

//   @Action(DeleteToolingBOPInfo)
//   deleteToolingBOPInfo(state: StateContext<ToolingBOPInfoStateModel>, payload: DeleteToolingBOPInfo) {
//     // this._blockUiService.pushBlockUI('deleteToolingBOPInfo');
//     return this._toolService.deleteCostToolingBOPById(payload.bopId).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('deleteToolingBOPInfo');
//       })
//     );
//   }

//   @Action(GetDefaultValuesForTooling)
//   getDefaultValuesForTooling(state: StateContext<ToolingDefaultValueStateModel>, payload: GetDefaultValuesForTooling) {
//     state.setState({
//       defaultDataList: [],
//     });
//     return this.materialMasterService.getMaterialMarketDataListByCountryId(payload.countryId).pipe(
//       tap((result) => {
//         if (result) {
//           state.setState({
//             defaultDataList: [...result],
//           });
//         }
//       })
//     );
//   }

//   @Action(SetBulkToolingUpdateLoading)
//   setBulkToolingUpdateLoadingFalse(state: StateContext<ToolingInfoStateModel>, flag: SetBulkToolingUpdateLoading) {
//     state.patchState({
//       bulkToolingUpdateLoading: flag.source,
//     });
//   }
// }
