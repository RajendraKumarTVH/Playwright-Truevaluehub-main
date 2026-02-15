// import { Injectable } from '@angular/core';
// import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
// import { BomService } from 'src/app/shared/services';
// import { BlockUiService } from 'src/app/shared/services';
// import { tap } from 'rxjs/operators';
// import { BomTreeModel } from 'src/app/shared/models/bom-tree-viewmodel';
// import {
//   AddBillOfMaterial,
//   AddNewBillOfMaterial,
//   GetBomsTreeByProjectId,
//   RemoveBillOfMaterial,
//   UpdateBillOfMaterial,
//   GetBomsByProjectId,
//   BulkUpdateOrCreateBOMInfo,
//   ClearBomInfos,
//   RemoveSingleBillOfMaterial,
// } from '../_actions/bom.action';
// import { AddBomDto } from 'src/app/shared/models/add-bom.model';
// import * as BomActions from 'src/app/modules/_actions/bom.action';
// import { BillOfMaterialDto } from 'src/app/shared/models';
// export class BomStateModel {
//   bomTree: BomTreeModel[];
// }

// export class BillOfMaterialStateModel {
//   bomInfo: BillOfMaterialDto[];
// }

// export class AddBillOfMaterialDto {
//   addBomDto: AddBomDto;
// }

// export class AddNewBillOfMaterialDto {
//   addBomDto: AddBomDto;
// }
// export class UpdateBillOfMaterialDto {
//   updateBomDto: BillOfMaterialDto;
// }
// @State<BomStateModel>({
//   name: 'bomTree',
//   defaults: {
//     bomTree: [],
//   },
// })
// @State<BillOfMaterialStateModel>({
//   name: 'bomInfo',
//   defaults: {
//     bomInfo: [],
//   },
// })
// export class BulkBillOfMaterialStateModel {
//   bulkBillOfMaterialInfos: BillOfMaterialDto[];
// }

// @State<BulkBillOfMaterialStateModel>({
//   name: 'BulkBomInfos',
//   defaults: {
//     bulkBillOfMaterialInfos: [],
//   },
// })
// @Injectable({ providedIn: 'root' })
// export class BomTreeState {
//   constructor(
//     private _bomService: BomService,
//     private _blockUiService: BlockUiService,
//     private _store: Store
//   ) {}

//   @Selector()
//   static getBomTree(state: BomStateModel) {
//     return state.bomTree;
//   }

//   @Selector()
//   static getBomsByProjectId(state: BillOfMaterialStateModel) {
//     return state.bomInfo;
//   }

//   @Action(GetBomsTreeByProjectId)
//   getBomTree(state: StateContext<BomStateModel>, payload: GetBomsTreeByProjectId) {
//     // state.setState({
//     //   bomTree: [],
//     // });
//     // this._blockUiService.pushBlockUI('GetBomsTreeByProjectId');
//     return this._bomService.getBomsTreeByProjectId(payload.projectInfoId, payload.scenarioId).pipe(
//       tap((result) => {
//         state.setState({
//           bomTree: result,
//         });
//         // this._blockUiService.popBlockUI('GetBomsTreeByProjectId');
//       })
//     );
//   }

//   @Action(ClearBomInfos)
//   clearBomInfos(state: StateContext<BillOfMaterialStateModel>) {
//     state.setState({
//       bomInfo: [],
//     });
//   }

//   @Action(GetBomsByProjectId)
//   getBomsByProjectId(state: StateContext<BillOfMaterialStateModel>, payload: GetBomsByProjectId) {
//     // state.setState({
//     //   bomInfo: [],
//     // });
//     return this._bomService.getBomsByProjectId(payload.projectInfoId).pipe(
//       tap((result) => {
//         state.setState({
//           bomInfo: result,
//         });
//       })
//     );
//   }

//   @Action(AddBillOfMaterial)
//   addBillOfMaterial(state: StateContext<AddBillOfMaterialDto>, payload: AddBillOfMaterial) {
//     // this._blockUiService.pushBlockUI('addBillOfMaterial');
//     return this._bomService.addBillOfMaterial(payload.addBomInfo).pipe(
//       tap((result) => {
//         if (result) {
//           // localStorage.setItem('selectedPartId', result.addedPartId.toString());
//           // localStorage.setItem('selectedbomId', result.bomId.toString());
//           // localStorage.setItem('selectedParentId', result.partInfoId.toString());
//           this._store.dispatch(new BomActions.GetBomsTreeByProjectId(result.projectInfoId, result.scenarioId));
//           //this._store.dispatch(new BomActions.GetBoardLoadedComponents(result.projectInfoId, result.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('addBillOfMaterial');
//       })
//     );
//   }

//   @Selector()
//   static getAddNewBillOfMaterial(state: AddNewBillOfMaterialDto) {
//     return state.addBomDto;
//   }
//   @Action(AddNewBillOfMaterial)
//   addNewBillOfMaterial(state: StateContext<AddNewBillOfMaterialDto>, payload: AddNewBillOfMaterial) {
//     this._blockUiService.pushBlockUI('addNewBillOfMaterial');
//     return this._bomService.addNewBillOfMaterial(payload.addBomInfo).pipe(
//       tap((result) => {
//         if (result) {
//           state.setState({
//             addBomDto: { ...result },
//           });
//         }
//         this._blockUiService.popBlockUI('addNewBillOfMaterial');
//       })
//     );
//   }

//   @Action(RemoveBillOfMaterial)
//   deleteMaterialInfo(state: StateContext<AddBillOfMaterialDto>, payload: RemoveBillOfMaterial) {
//     // this._blockUiService.pushBlockUI('RemoveBillOfMaterial');
//     return this._bomService.removeBillOfMaterial(payload.bomId).pipe(
//       tap((result) => {
//         if (result) {
//           const scenarioId = payload.scenarioId;
//           this._store.dispatch(new BomActions.GetBomsTreeByProjectId(payload.projectId, scenarioId));
//           this._store.dispatch(new BomActions.GetBomsByProjectId(payload.projectId));
//         }
//         // this._blockUiService.popBlockUI('RemoveBillOfMaterial');
//       })
//     );
//   }

//   @Action(UpdateBillOfMaterial)
//   updateBillOfMaterial(state: StateContext<UpdateBillOfMaterialDto>, payload: UpdateBillOfMaterial) {
//     // this._blockUiService.pushBlockUI('updateBillOfMaterial');
//     return this._bomService.updateBom(payload.bomId, payload.bomInfo).pipe(
//       tap((result) => {
//         if (result) {
//           this._store.dispatch(new BomActions.GetBoardLoadedComponents(payload.projectId, payload.partInfoId));
//         }
//         // this._blockUiService.popBlockUI('updateBillOfMaterial');
//       })
//     );
//   }

//   @Selector()
//   static getBulkUpdateBomDetails(state: BulkBillOfMaterialStateModel) {
//     return state.bulkBillOfMaterialInfos;
//   }

//   @Action(BulkUpdateOrCreateBOMInfo)
//   bulkUpdateOrCreateMaterialInfo(state: StateContext<BulkBillOfMaterialStateModel>, payload: BulkUpdateOrCreateBOMInfo) {
//     // this._blockUiService.pushBlockUI('BulkUpdateOrCreateBOMInfo');
//     return this._bomService.bulkUpdateOrCreateBOMInfo(payload.bulkmaterialInfo).pipe(
//       tap((result) => {
//         if (result) {
//           state.setState({
//             bulkBillOfMaterialInfos: [...result],
//           });
//         }
//         // this._blockUiService.popBlockUI('BulkUpdateOrCreateBOMInfo');
//       })
//     );
//   }

//   @Action(RemoveSingleBillOfMaterial)
//   deleteSingleMaterialInfo(state: StateContext<AddBillOfMaterialDto>, payload: RemoveSingleBillOfMaterial) {
//     return this._bomService.removeSingleBillOfMaterial(payload.bomId).pipe(
//       tap((result) => {
//         if (result) {
//           const scenarioId = payload.scenarioId;
//           this._store.dispatch(new BomActions.GetBomsTreeByProjectId(payload.projectId, scenarioId));
//           this._store.dispatch(new BomActions.GetBomsByProjectId(payload.projectId));
//         }
//       })
//     );
//   }
// }
