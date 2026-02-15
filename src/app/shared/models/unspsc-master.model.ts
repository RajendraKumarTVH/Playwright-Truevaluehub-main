// unspsc.model.ts

export interface UnspscSegmentDto {
  unspscSegmentId: number;
  unspscSegmentCode: string;
  unspscSegment: string;
  isActive: boolean;
}

export interface UnspscFamilyDto {
  unspscFamilyId: number;
  unspscSegmentId: number;
  unspscFamilyCode: string;
  unspscFamily: string;
  isActive: boolean;
}

export interface UnspscClassDto {
  unspscClassId: number;
  unspscFamilyId: number;
  unspscClassCode: string;
  unspscClass: string;
  isActive: boolean;
}

export interface UnspscCommodityDto {
  unspscCommodityId: number;
  unspscClassId: number;
  unspscCommodityCode: string;
  unspscCommodity: string;
  isActive: boolean;
}

export interface UnspscMasterDto {
  segments: UnspscSegmentDto[];
  families: UnspscFamilyDto[];
  classes: UnspscClassDto[];
  commodities: UnspscCommodityDto[];
}
