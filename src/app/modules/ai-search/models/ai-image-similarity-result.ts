import { MaterialInfoDto, ProcessInfoDto } from 'src/app/shared/models';

export interface ImageSimilarityResult {
  imgUrl: string | null;
  manufacturing_category: string;
  commodityId?: number;
  partId: string;
  similarity_score: string;
  intPartNumber: string;
  intPartDescription: string;
  partRevision: string | null;
  drawingNumber: string | null;
  annualVolume: string;
  projectInfoId: string;
  blobFileName: string;
  materialInfoJson: string;
  highestParentPartId: string;
  createDate: string;
  createdUserId: number;
  actualImgUrl?: string;
  imageShowing?: string;
  imageType?: string;
  pdfThumbnailData?: string;
  pdfData?: string;
  surfaceArea?: string;
  volume?: string;
  pdfPartName?: string;
  percentageComplete?: number;
  pdfCostSummaryInfo?: PdfCostSummaryInfo;
}

export interface SimilaritySearchRequestDto {
  origin?: string;
  fileData?: string;
  pdfPartName?: string;
}

export interface AiSearchListTileDto {
  manufacturingCategory?: string;
  commodityId?: number;
  partId?: string;
  similarityScore?: string;
  maxValue?: number;
  avgValue?: number;
  intPartNumber?: string;
  intPartDescription?: string;
  partRevision?: string;
  drawingNumber?: string;
  annualVolume?: string;
  annualSpend?: string;
  competitivenessScore?: number;
  complexityScore?: number;
  purchasePrice?: number;
  shouldCost?: number;
  supplierCountry?: string;
  supplierCity?: string;
  weight?: string;
  projectInfoId?: string;
  projectName?: string;
  tag?: string;
  imageType?: string;
  pdfThumbnailData?: string;
  imgThumbnailData?: string;
  imageShowing?: string;
  createdDate?: string;
  createdUserId?: number;
  extractionInfoDto?: AiSearchTileExtractionInfoDto;
  pdfCostSummaryInfo?: PdfCostSummaryInfo;
  completionPercentage?: number;
  pdfPartName?: string;
  onlyPdf?: boolean;
  currMaterialCost?: number;
  vendorId?: number;
  supplierRegionId?: number;
  mfrCountryId?: number;
  materialInfoJson?: string;
  surfaceArea?: number;
  volume?: number;
  dimArea?: number;
  netWeight?: number;
}

export interface AiSearchTileExtractionInfoDto {
  partInfoId?: number;
  fileName?: string;
  pdfDocLocation?: string;
  materialInfoJson?: string;
  processInfoJson?: string;
  volume?: string;
  surfaceArea?: string;
  dimArea?: string;
}

export interface AiIntegratedInfoDto {
  aiSearchListTileDtos: AiSearchListTileDto[];
  totalRecordCount?: number;
}

export interface AiSearchTileCompletionInfoDto {
  partInfoId: number;
  totalPercentage?: number;
}

export interface PdfCostSummaryInfo {
  partInfoId?: number;
  deburr?: string;
  surfaceFinish?: string;
  welding?: string;
  cleaning?: string;
}

export interface AiSearchImageInfoDto {
  partInfoId: number;
  thumbnailImage?: string;
  convertedData?: string;
  viewName?: string;
}

export interface AiCostingSuggestionDto {
  partInfoId: number;
  projectInfoId: number;
  processId?: number;
  manufacturingCategory?: string;
  similarityScore?: string;
  avgScore?: number;
  materialInfoDtos?: MaterialInfoDto[];
  processInfoDtos?: ProcessInfoDto[];
}

export interface AiCostingMaterialSuggestionInfo {
  partInfoId: number;
  projectInfoId: number;
  projectInfoIds?: number[];
  similarityScore?: number;
  avgScore?: number;
  materialDescription?: string;
  processId?: number;
  materialDescriptionId?: number;
  materialFamily?: number;
  materialGroupId?: number;
  processName?: string;
  manufacturingCategory?: string;
}

export interface AiCostingManufacturingSuggestionInfo {
  partInfoId: number;
  projectInfoId: number;
  projectInfoIds?: number[];
  similarityScore?: number;
  avgScore?: number;
  processName?: string;
  machineDescription: string;
}

export interface SimilaritySearchDto {
  totalTimeOfSql?: number;
  totalTimeOfCosmos?: number;
  aiSearchListTileDtos?: AiSearchListTileDto[];
  imageListTileDtos?: AiSearchImageInfoDto[];
  timeDetails?: TimeDetails;
}

export interface TimeDetails {
  image_decoding_rotation?: number;
  model_selection?: number;
  result_processing?: number;
  similarity_search?: number;
  token_validation?: number;
  total_time?: number;
  vector_db_connection?: number;
  vector_query_time?: number;
}

export interface ComparePartInfo {
  partInfoId: number;
  projectInfoId: number;
  intPartNumber?: string;
  intPartDescription?: string;
  drawingNumber?: string;
  commodityId?: number;
  createdUserId?: number;
  createDate?: string;
  vendorName?: string;
  materialDescription?: string;
  processId?: number;
  partSize?: number;
  surfaceArea?: number;
  partVolume?: number;
  partWeight?: number;
  annualVolume?: number;
  competitivenessScore?: number;
  complexityScore?: number;
  materialCost?: number;
  manufacturingCost?: number;
  toolingCost?: number;
  overheadAndProfitCost?: number;
  packagingCost?: number;
  frieghtCost?: number;
  dutiesAndTariffCost?: number;
}
