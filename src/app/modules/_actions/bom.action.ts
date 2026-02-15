// import { BillOfMaterialDto } from 'src/app/shared/models';
// import { AddBomDto } from 'src/app/shared/models/add-bom.model';

export enum BomActionTypes {
  //   getBomsTreeByProjectId = '[GetBomsTreeByProjectId] Get',
  //   addBillOfMaterial = '[AddBillOfMaterial] Post',
  //   addNewBillOfMaterial = '[AddNewBillOfMaterial] Post',
  //   removeBillOfMaterial = '[RemoveBillOfMaterial] Post',
  getBoardLoadedComponents = '[GetBoardLoadedComponents] Get',
  //   updateBillOfMaterial = '[UpdateBillOfMaterial] Put',
  //   getBomsByProjectId = '[GetBomsByProjectId] Get',
  //   bulkUpdateOrCreateBOMInfo = '[BulkUpdateOrCreateBOMInfo] Post',
  //   clear = '[ClearBomInfos] Clear',
  //   removeSingleBillOfMaterial = '[RemoveSingleBillOfMaterial] Post',
}

// export class GetBomsTreeByProjectId {
//   static readonly type = BomActionTypes.getBomsTreeByProjectId;
//   constructor(
//     public projectInfoId: number,
//     public scenarioId: number
//   ) {}
// }

// export class GetBomsByProjectId {
//   static readonly type = BomActionTypes.getBomsByProjectId;
//   constructor(public projectInfoId: number) {}
// }

// export class AddBillOfMaterial {
//   static readonly type = BomActionTypes.addBillOfMaterial;
//   constructor(public addBomInfo: AddBomDto) {}
// }

// export class AddNewBillOfMaterial {
//   static readonly type = BomActionTypes.addNewBillOfMaterial;
//   constructor(public addBomInfo: AddBomDto) {}
// }

// export class RemoveBillOfMaterial {
//   static readonly type = BomActionTypes.removeBillOfMaterial;
//   constructor(
//     public bomId: number,
//     public projectId: number,
//     public scenarioId: number
//   ) {}
// }
export class GetBoardLoadedComponents {
  static readonly type = BomActionTypes.getBoardLoadedComponents;
  constructor(
    public projectId: number,
    public partInfoId: number
  ) {}
}
// export class UpdateBillOfMaterial {
//   static readonly type = BomActionTypes.updateBillOfMaterial;
//   constructor(
//     public bomId: number,
//     public projectId: number,
//     public partInfoId: number,
//     public bomInfo: BillOfMaterialDto
//   ) {}
// }
// export class BulkUpdateOrCreateBOMInfo {
//   static readonly type = BomActionTypes.bulkUpdateOrCreateBOMInfo;
//   constructor(public bulkmaterialInfo: BillOfMaterialDto[]) {}
// }

// export class ClearBomInfos {
//   static readonly type = BomActionTypes.clear;
// }

// export class RemoveSingleBillOfMaterial {
//   static readonly type = BomActionTypes.removeSingleBillOfMaterial;
//   constructor(
//     public bomId: number,
//     public projectId: number,
//     public scenarioId: number
//   ) {}
// }

export type BomActions =
  //   | GetBomsTreeByProjectId
  //   | AddBillOfMaterial
  //   | AddNewBillOfMaterial
  //   | RemoveBillOfMaterial
  GetBoardLoadedComponents;
//   | UpdateBillOfMaterial
//   | GetBomsByProjectId
//   | BulkUpdateOrCreateBOMInfo
//   | ClearBomInfos
//   | RemoveSingleBillOfMaterial;
