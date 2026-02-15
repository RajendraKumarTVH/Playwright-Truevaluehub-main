export class DraftProjectPartInfoUpdateDto {
  projectInfoId: number;
  partInfoId: number;
  bomId: number;
  commodityId: number;
  partInfoDescription: string;
  partQty: number;
  unitOfMeasure: number;
  annualVolume: number;
  vendorId?: number;
  mfrCountryId?: number;
  buId?: number;
  deliveryCountryId?: number;
}
