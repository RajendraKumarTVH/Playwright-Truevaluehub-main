export interface PackagingMapDto {
  packagingMapId: number;
  packingMaterials: PackagingMapMaterialDto[];
}

export interface PackagingMapMaterialDto {
  packagingMapMaterialId: number;
  packingMaterialMasterId: number;
  material: PackingMaterialDto;
}

export interface PackingMaterialDto {
  packingMaterialMasterId: number;
  description: string;
  packageDescriptionMasterId: number;
  weightInGms: number;
  lengthInMm: number;
  heightInMm: number;
  widthInMm: number;
  maxWeightInGms: number | null;
  maxVolumeInCm3: number | null;
  basePrice: number | null;
  bulkPrice: number;
  packagingTypeId: number;
  packagingType: string;
  packagingForm: string;
  unitId: number;
  unit: string;
  packagingSizeId: number;
  packagingSize: string;
  materialFinishId: number;
  materialFinish: string;
  fragileStatusId: number;
  fragileStatus: string;
  freightId: number;
  freight: string;
  environmentalId: number;
  environmental: string;
  laborTimeSec?: number;
  esgkgCo2?: number;
}

export interface PackagingFormDto {
  packagingFormId: number;
  packagingForm: string;
}

export interface PackagingSizeDefinitionDto {
  packagingSizeDefinitionId: number;
  commodityId: number;
  sizeId: number;
  maxWeightKG: number;
  maxLengthMM: number;
}

export interface PackagingDescriptionDto {
  packageDescriptionMasterId: number;
  description: string;
}

export interface Size {
  x: number;
  y: number;
  z: number;
}
