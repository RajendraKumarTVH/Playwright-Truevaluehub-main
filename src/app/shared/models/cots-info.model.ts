export class CotsInfoDto {
  cotsInfoId: number;
  partInfoId: number;
  partName: string;
  partCost: number;
  qty: number;
  extCost: number;
  priceRef: string;
  partNo: string;
  description: string;
  dataCompletionPercentage: number;
  sourcePartInfoId?: number;
}
export class MoveAssembliesInfoDto {
  bomIds: number[];
  moveType: string;
  projectInfoId: number;
  scenarioId: number;
  partInfoId: number;
}
