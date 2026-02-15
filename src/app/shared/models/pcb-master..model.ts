export class PCBAMarketDataDto {
  pCBAMarketDataId: number;
  mpn: string;
  supplierName?: string;
  manufacturer?: string;
  subCategoryName?: string;
  categoryId?: number;
  category?: string;
  subCategoryId?: number;
  dataSheetUrl?: string;
  imageUrl?: string;
  description?: string;
  productStatus?: string;
  quantityAvailable?: number;
  minOrderQuantity?: number;
  series?: string;
  price?: number;
  breakQuantity?: number;
  dateCreated: Date;
  jsonData?: string;
  isDirectMatch?: boolean;
  subSupplierName?: string;
  partialMatchMpn?: string;
  subCategories?: SubCategoryDto;
  lengthInFeet?: number;
}
export class MainCategoryDto {
  categoryId: number;
  categoryName: string;
  isActive?: boolean;
  subTypeCount?: number;
  subCategories: SubCategoryDto[];
}

export class SubCategoryDto {
  subCategoryId: number;
  subCategoryName?: string;
  categoryId?: number;
  subCategoryTypeId?: number;
  electronicsMaster?: any;
}

export class PCBAResultDto {
  pcbaMarketDataDtos: PCBAMarketDataDto[];
  subCategories: SubCategoryDto[];
}
