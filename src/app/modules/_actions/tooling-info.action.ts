// import { BopCostToolingDto, CostToolingDto, ToolingMaterialInfoDto, ToolingProcessInfoDto } from 'src/app/shared/models/tooling.model';

// export enum ToolingActionTypes {
//   getToolingInfo = '[GetToolingInfo] Get',
//   getToolingInfosByPartInfoId = '[GetToolingInfosByPartInfoId] Get',
//   saveToolingInfo = '[SaveToolingInfo] Put',
//   deleteToolingInfo = '[DeleteToolingInfo] Delete',
//   saveToolingMaterialInfo = '[SaveToolingMaterialInfo] Put',
//   deleteToolingMaterialInfo = '[DeleteToolingMaterialInfo] Delete',
//   saveBOPInfo = '[SaveBOPInfo] Put',
//   saveToolingProcessInfo = '[SaveToolingProcessInfo] Put',
//   deleteToolingProcessInfo = '[DeleteToolingProcessInfo] Delete',
//   deleteToolingBOPInfo = '[DeleteToolingBOPInfo] Delete',
//   BulkUpdateToolingInfo = '[BulkUpdateToolingInfo] Put',
//   getDefaultValuesForTooling = '[GetDefaultMaterialInfoForTooling] Get',
//   updateToolingCostPerPartInfo = '[UpdateToolingCostPerPart] Put',
//   bulkUpdateAsync = '[BulkUpdateAsync] Put',
//   bulkUpdateToolingCostPerPart = '[BulkUpdateToolingCostPerPart] Put',
//   bulkUpdateOrCreateToolingMaterialInfo = '[BulkUpdateOrCreateToolingMaterialInfo] Put',
//   bulkUpdateOrCreateToolingProcessInfo = '[BulkUpdateOrCreateToolingProcessInfo] Put',
//   bulkUpdateOrCreateBOPInfo = '[BulkUpdateOrCreateBOPInfo] Put',
//   setBulkToolingUpdateLoading = '[SetBulkToolingUpdateLoading] Put',
// }

// export class GetToolingInfo {
//   static readonly type = ToolingActionTypes.getToolingInfo;
//   constructor(public toolingId: number) {}
// }
// export class GetToolingInfosByPartInfoId {
//   static readonly type = ToolingActionTypes.getToolingInfosByPartInfoId;
//   constructor(public partInfoId: number) {}
// }

// export class SaveToolingInfo {
//   static readonly type = ToolingActionTypes.saveToolingInfo;
//   constructor(
//     public toolingInfo: CostToolingDto,
//     public partInfoId: number
//   ) {}
// }

// export class BulkUpdateToolingInfo {
//   static readonly type = ToolingActionTypes.BulkUpdateToolingInfo;
//   constructor(
//     public toolingInfo: CostToolingDto,
//     public partInfoId: number
//   ) {}
// }

// export class DeleteToolingInfo {
//   static readonly type = ToolingActionTypes.deleteToolingInfo;
//   constructor(
//     public toolingId: number,
//     public partInfoId: number
//   ) {}
// }
// export class SaveToolingMaterialInfo {
//   static readonly type = ToolingActionTypes.saveToolingMaterialInfo;
//   constructor(
//     public toolingMaterialList: ToolingMaterialInfoDto,
//     public partInfoId: number
//   ) {}
// }

// export class UpdateToolingCostPerPart {
//   static readonly type = ToolingActionTypes.updateToolingCostPerPartInfo;
//   constructor(
//     public toolingInfo: CostToolingDto,
//     public partInfoId: number
//   ) {}
// }

// export class SaveToolingProcessInfo {
//   static readonly type = ToolingActionTypes.saveToolingProcessInfo;
//   constructor(
//     public toolingProcessList: ToolingProcessInfoDto,
//     public partInfoId: number
//   ) {}
// }

// export class SaveBOPInfo {
//   static readonly type = ToolingActionTypes.saveBOPInfo;
//   constructor(
//     public partInfoId: number,
//     public BOPList: BopCostToolingDto
//   ) {}
// }

// export class DeleteToolingMaterialInfo {
//   static readonly type = ToolingActionTypes.deleteToolingMaterialInfo;
//   constructor(
//     public partInfoId: number,
//     public materialInfoId: number
//   ) {}
// }

// export class DeleteToolingProcessInfo {
//   static readonly type = ToolingActionTypes.deleteToolingProcessInfo;
//   constructor(
//     public partInfoId: number,
//     public processInfoId: number
//   ) {}
// }
// export class DeleteToolingBOPInfo {
//   static readonly type = ToolingActionTypes.deleteToolingBOPInfo;
//   constructor(
//     public partInfoId: number,
//     public bopId: number
//   ) {}
// }

// export class GetDefaultValuesForTooling {
//   static readonly type = ToolingActionTypes.getDefaultValuesForTooling;
//   constructor(
//     public countryId: number,
//     public materialDescriptions: string[]
//   ) {}
// }

// export class BulkUpdateAsync {
//   static readonly type = ToolingActionTypes.bulkUpdateAsync;
//   constructor(
//     public toolingInfo: CostToolingDto[],
//     public partInfoId: number
//   ) {}
// }

// export class BulkUpdateToolingCostPerPart {
//   static readonly type = ToolingActionTypes.bulkUpdateToolingCostPerPart;
//   constructor(
//     public toolingInfo: CostToolingDto[],
//     public partInfoId: number
//   ) {}
// }

// export class BulkUpdateOrCreateToolingMaterialInfo {
//   static readonly type = ToolingActionTypes.bulkUpdateOrCreateToolingMaterialInfo;
//   constructor(
//     public toolingMaterialList: ToolingMaterialInfoDto[],
//     public partInfoId: number
//   ) {}
// }

// export class BulkUpdateOrCreateToolingProcessInfo {
//   static readonly type = ToolingActionTypes.bulkUpdateOrCreateToolingProcessInfo;
//   constructor(
//     public toolingProcessList: ToolingProcessInfoDto[],
//     public partInfoId: number
//   ) {}
// }

// export class BulkUpdateOrCreateBOPInfo {
//   static readonly type = ToolingActionTypes.bulkUpdateOrCreateBOPInfo;
//   constructor(
//     public partInfoId: number,
//     public BOPList: BopCostToolingDto[]
//   ) {}
// }

// export class SetBulkToolingUpdateLoading {
//   static readonly type = ToolingActionTypes.setBulkToolingUpdateLoading;
//   constructor(public source: boolean) {}
// }

// export type ToolingInfoActions =
//   | GetToolingInfo
//   | GetToolingInfosByPartInfoId
//   | SaveToolingInfo
//   | DeleteToolingInfo
//   | SaveToolingMaterialInfo
//   | DeleteToolingMaterialInfo
//   | SaveBOPInfo
//   | SaveToolingProcessInfo
//   | DeleteToolingProcessInfo
//   | DeleteToolingBOPInfo
//   | GetDefaultValuesForTooling
//   | UpdateToolingCostPerPart
//   | BulkUpdateAsync
//   | BulkUpdateToolingCostPerPart
//   | SetBulkToolingUpdateLoading;
