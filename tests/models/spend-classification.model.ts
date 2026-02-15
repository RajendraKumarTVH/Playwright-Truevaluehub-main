export class SpendClassificationDto {
  spendClassificationId?: number;
  partInfoId?: number;
  projectInfoId?: number;
  dataCompletionPercentage: number;

  unspscCode: string;
  unspscSegmentId: number;
  unspscFamilyId: number;
  unspscClassId: number;
  unspscCommodityId: number;
  internalClassificationCode?: string;
  internalDescription?: string;
}
