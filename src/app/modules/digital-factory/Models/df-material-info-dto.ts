export interface DfMaterialInfoDto {
  digitalFactoryMaterialInfoId?: number;
  digitalFactoryId: number;
  materialMasterId?: number;
  materialGroup?: string;
  materialGroupId?: number;
  materialType?: string;
  materialTypeId?: number;
  materialDescription?: string;
  stockFormId?: number;
  stockForm?: string;
  volumePurchased?: number;
  discountPercent?: number;
  price: number;
  scrapPrice?: number;
  countryOfOrigin?: number;
  countryOfOriginName?: string;
  createDate?: string;
  effectiveDate?: string;
}
