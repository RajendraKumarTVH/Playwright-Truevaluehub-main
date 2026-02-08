export interface GerberReaderResponseDto {
  layerInfo?: LayerInfo[];
  drillInfo?: DrillInfo[];
  dimensionInfo?: DimensionInfo[];
}

export interface LayerInfo {
  fileName?: string;
  layerType?: string;
}

export interface DrillInfo {
  fileName?: string;
  drillDiameter?: string;
  drillType?: string;
  drillName?: string;
  numberOfDrillTypeWise?: number;
}

export interface DimensionInfo {
  fileName?: string;
  dimension?: string;
}

export interface GerberInfoDto {
  gerberInfoId: number;
  partInfoId: number;
  gerberInfoJson?: string;
}

export interface GerberImageInfoDto {
  fileName?: string;
  imageData?: string;
}
