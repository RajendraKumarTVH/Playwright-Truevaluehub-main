export class MaterialCoreDetailsDto {
  coreCostDetailsId: number;
  materialInfoId: number;
  coreLength: number;
  coreWidth: number;
  coreHeight: number;
  coreShape?: number;
  coreArea: number;
  coreVolume: number;
  noOfCore: number;
  coreWeight: number;
  coreSandPrice?: number;
  weldSide?: number;
  grindFlush?: number;
  coreName?: string;
  iscoreLengthDirty: boolean;
  iscoreWidthDirty: boolean;
  iscoreHeightDirty: boolean;
  iscoreShapeDirty: boolean;
  iscoreAreaDirty: boolean;
  iscoreVolumeDirty: boolean;
  isnoOfCoreDirty: boolean;
  iscoreWeightDirty: boolean;
  iscoreSandPriceDirty: boolean;
  isweldSideDirty: boolean;
  isgrindFlushDirty: boolean;
}
