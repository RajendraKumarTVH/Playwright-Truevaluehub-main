export class DutiesTariffDto {
  dutiesTariffId?: number;
  partInfoId?: number;
  projectInfoId?: number;

  duties: number;
  taxes: number;
  eXWPartCostAmount?: number;
  packingCost?: number;
  dutiesPerPart?: number;
  tariffPerPart?: number;
  taxPerPart?: number;
  totalPerPart?: number;
  dataCompletionPercentage: number;

  htsCode: string;
  unspscCode: string;
  unspscSegmentId: number;
  unspscFamilyId: number;
  unspscClassId: number;
  unspscCommodityId: number;
  internalClassificationCode?: string;
  internalDescription?: string;

  htsSectionId?: number;
  htsChapterId?: number;
  htsHeadingId?: number;
  htsSubHeadingId?: number;
  coo?: string;
  deliveryCountry?: string;
  htsSubHeading1Id: number;
  htsSubHeading2Id: number;
  htsInternalClassificationCode?: string;
  htsInternalDescription?: string;
  tariffBreakDown: {
    tariffBreakDownId?: number;
    tariffType?: number;
    tariffAppliesTo?: number;
    tariffPercentage?: number;
    tariff: number;
    comments?: string;
    tariffTypeExtraction?: string;
  };
  tariffBreakDowns?: Array<{
    tariffBreakDownId?: number;
    tariffType?: number;
    tariffAppliesTo?: number;
    tariffPercentage?: number;
    tariff: number;
    comments?: string;
    tariffTypeExtraction?: string;
  }>;
}
