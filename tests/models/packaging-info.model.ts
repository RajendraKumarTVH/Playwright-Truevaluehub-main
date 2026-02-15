import { MaterialInfoDto } from './material-info.model';

export class PackagingInfoDto {
  packagingId?: number;
  partInfoId?: number;
  projectInfoId?: number;
  partsPerShipment?: number;
  totalShipmentWeight?: number;
  totalShipmentVolume?: number;
  corrugatedBox?: number;
  boxPerShipment?: number;
  corrugatedBoxCostPerUnit?: number;
  totalBoxCostPerShipment?: number;
  pallet?: number;
  palletPerShipment?: number;
  palletCostPerUnit?: number;
  totalPalletCostPerShipment?: number;
  shrinkWrap?: boolean = true;
  shrinkWrapCostPerUnit?: number;
  totalShrinkWrapCost?: number;
  // totalProtectivePkgCost?: number;
  totalPackagCostPerShipment?: number;
  totalPackagCostPerUnit?: number;
  splBoxType?: number;
  unitCost?: number;
  totalUnits?: number;
  costPerUnit?: number;
  units?: number;
  adnlProtectPkgs?: AdditionalPackagingDto[];
  calcultionadnlProtectPkgs?: FormArray<any>;
  dataCompletionPercentage?: number;
  esgImpactCO2Kg: number;
  esgImpactperBox: number;
  esgImpactperPallet: number;
  totalESGImpactperPart: number;
  // for calculation
  deliveryFrequency: number;
  eav: number;
  totalBoxVol: number;
  countNumberOfMatSub: number = 0;
  dataFromMaterialInfo: number = 0;
  partsPerShipmentDirty?: boolean = false;
  totalShipmentWeightDirty?: boolean = false;
  totalShipmentVolumeDirty?: boolean = false;
  materialInfo: MaterialInfoDto;
  corrugatedBoxDirty?: boolean = false;
  boxPerShipmentDirty?: boolean = false;
  corrugatedBoxList: MaterialPriceDto[] = [];
  palletList: MaterialPriceDto[] = [];
  protectList: MaterialPriceDto[] = [];
  corrugatedBoxCostPerUnitDirty?: boolean = false;
  totalBoxCostPerShipmentDirty?: boolean = false;

  palletDirty?: boolean = false;
  palletPerShipmentDirty?: boolean = false;

  palletCostPerUnitDirty?: boolean = false;

  totalPalletCostPerShipmentDirty?: boolean = false;

  shrinkWrapDirty?: boolean = false;
  shrinkWrapCostPerUnitDirty?: boolean = false;
  totalShrinkWrapCostDirty?: boolean = false;

  totalPackagCostPerShipmentDirty?: boolean = false;
  totalPackagCostPerUnitDirty?: boolean = false;

  splBoxTypeDirty?: boolean = false;
  unitCostDirty?: boolean = false;
  totalUnitsDirty?: boolean = false;
  costPerUnitDirty?: boolean = false;
  unitsDirty?: boolean = false;

  dataCompletionPercentageDirty?: boolean = false;
  esgImpactCO2KgDirty?: boolean = false;
  esgImpactperBoxDirty?: boolean = false;
  esgImpactperPalletDirty?: boolean = false;
  isFromSustainability?: boolean = false;
  totalESGImpactperPartDirty?: boolean = false;

  weightPerShipment?: number;
  volumePerShipment?: number;
  materialFinishId?: number;
  fragileId?: number;
  freightId?: number;

  packagingTypeId?: number;
  packagingFormId?: number;
  packageDescriptionId?: number;

  packagingWeight?: number;
  packageMaxCapacity?: number;
  packageMaxVolume?: number;

  totalPackagingTime?: number;
  directLaborRate?: number;
  laborCostPerPart?: number;

  partsPerContainer?: number;
  qtyNeededPerShipment?: number;
  costPerContainer?: number;

  cO2PerUnit?: number;

  sizeId?: number;
  environmentalId?: number;
  mfrCountryId?: number;
  deliveryCountryId?: number;

  weightPerShipmentDirty?: boolean = false;
  volumePerShipmentDirty?: boolean = false;
  materialFinishIdDirty?: boolean = false;
  fragileIdDirty?: boolean = false;
  freightIdDirty?: boolean = false;

  packagingTypeIdDirty?: boolean = false;
  packagingFormIdDirty?: boolean = false;
  packageDescriptionIdDirty?: boolean = false;

  packagingWeightDirty?: boolean = false;
  packageMaxCapacityDirty?: boolean = false;
  packageMaxVolumeDirty?: boolean = false;

  totalPackagingTimeDirty?: boolean = false;
  directLaborRateDirty?: boolean = false;
  laborCostPerPartDirty?: boolean = false;

  partsPerContainerDirty?: boolean = false;
  qtyNeededPerShipmentDirty?: boolean = false;
  costPerContainerDirty?: boolean = false;

  cO2PerUnitDirty?: boolean = false;
}

export class AdditionalPackagingDto {
  adnlId: number;
  adlnalid: number;
  packagingId: number;
  protectivePkgId?: number;
  protectivePkg?: number;
  costPerUnit?: number;
  units?: number;
  specialtyBoxType?: string;
  costPerProtectivePackagingUnit?: number;
  totalNumberOfProtectivePackaging?: number;
  unitsDirty?: boolean = false;
  specialtyBoxTypeDirty?: boolean = false;
  costPerProtectivePackagingUnitDirty?: boolean = false;
  totalNumberOfProtectivePackagingDirty?: boolean = false;
  costPerUnitDirty?: boolean = false;

  packagingTypeId?: number;
  packagingFormId?: number;
  packageDescriptionId?: number;

  packagingWeight?: number;
  packageMaxCapacity?: number;
  packageMaxVolume?: number;

  totalPackagingTime?: number;
  directLaborRate?: number;
  laborCostPerPart?: number;

  partsPerContainer?: number;
  qtyNeededPerShipment?: number;
  costPerContainer?: number;

  cO2PerUnit?: number;

  unitId?: number;
  laborTimeSec?: number;
  esgkgCo2?: number;

  // Newly added from the JSON object
  packingMaterialMasterId?: number;
  description?: string;
  weightInGms?: number;
  lengthInMm?: number;
  heightInMm?: number;
  widthInMm?: number;
  maxWeightInGms?: number | null;
  maxVolumeInCm3?: number | null;
  basePrice?: number | null;
  bulkPrice?: number;
  packagingType?: string;
  packagingForm?: string;
  unit?: string;
  packagingSizeId?: number;
  packagingSize?: string;
  materialFinishId?: number;
  materialFinish?: string;
  fragileStatusId?: number;
  fragileStatus?: string;
  freightId?: number;
  freight?: string;
  environmentalId?: number;
  environmental?: string;

  calcRequired?: boolean = true;

  isTotalPackagingTimeDirty?: boolean = false;
  isDirectLaborRateDirty?: boolean = false;
  isPartsPerContainerDirty?: boolean = false;
  isQtyNeededPerShipmentDirty?: boolean = false;
  isCostPerContainerDirty?: boolean = false;
  isCO2PerUnitDirty?: boolean = false;
}

export enum MaterialTypeEnum {
  Box = 'box',
  Pallet = 'pallet',
  Protect = 'protect',
}
export class MaterialPriceDto {
  materialMasterId: number;
  materialDescription: string;
  price: number;
  materialTypeName: string;
  esgImpactCO2Kg: number;
}
