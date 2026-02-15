// import { CostSummaryDto } from 'src/app/shared/models';

// export enum CostSummaryTypes {
//   getCostSummaryByPartInfoId = '[getCostSummaryByPartInfoId] Get',
//   getCostSummaryByMultiplePartInfoIds = '[getCostSummaryByMultiplePartInfoIds] Get',
//   saveCostSummaryByPartInfoId = '[saveCostSummaryByPartInfoId] Post',
//   updateCostSummaryByPartInfoId = '[updateCostSummaryByPartInfoId] Put',
// }

// export class GetCostSummaryByPartInfoId {
//   static readonly type = CostSummaryTypes.getCostSummaryByPartInfoId;
//   constructor(
//     public partInfoId: number,
//     public source: string = ''
//   ) {}
// }

// export class GetCostSummaryByMultiplePartInfoIds {
//   static readonly type = CostSummaryTypes.getCostSummaryByMultiplePartInfoIds;
//   constructor(public partInfoIds: number[]) {}
// }

// export class SaveCostSummaryByPartInfoId {
//   static readonly type = CostSummaryTypes.saveCostSummaryByPartInfoId;
//   constructor(public costSummary: CostSummaryDto) {}
// }

// export class UpdateCostSummaryByPartInfoId {
//   static readonly type = CostSummaryTypes.updateCostSummaryByPartInfoId;
//   constructor(public costSummary: CostSummaryDto) {}
// }

// export type CostSummaryActions = GetCostSummaryByPartInfoId | SaveCostSummaryByPartInfoId | UpdateCostSummaryByPartInfoId;
