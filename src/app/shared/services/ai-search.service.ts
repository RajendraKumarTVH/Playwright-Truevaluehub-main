import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MostSimilarPartCostDetailsDto } from '../models/material-master-marketdata.model';
import {
  AiCostingSuggestionDto,
  AiSearchImageInfoDto,
  AiSearchTileCompletionInfoDto,
  AiSearchTileExtractionInfoDto,
  PdfCostSummaryInfo,
  SimilaritySearchDto,
  SimilaritySearchRequestDto,
  ComparePartInfo,
} from 'src/app/modules/ai-search/models/ai-image-similarity-result';
import { SearchBarModelDto } from '../models/search-bar-model';

@Injectable({ providedIn: 'root' })
export class AiSearchService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  searchDocument(formData: FormData): Observable<any> {
    const httpOptions = this.createOptionsForFormFile('post');
    const url = `/api/costing/AIVisualSearch/searchdocument`;
    return this.postEx<any, FormData>(url, httpOptions, formData).pipe(catchError(this.handleError<any>('searchDocument')));
  }

  getDocuments(): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIVisualSearch/getUploadedDocs`;
    console.log('===>');
    return this.getEx<any[]>(url, httpOptions).pipe(catchError(this.handleError<any[]>('getDocuments')));
  }

  getDBpartsId(pageNumber: number, pageSize: number): Observable<any> {
    const httpOptions = this.createOptions('post');

    const url = `/api/costing/AIMLSearch?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.getEx<any[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getDBpartsId')));
  }

  getDocumentsByTextSearch(filterInfo: SearchBarModelDto[], pageNumber: number, pageSize: number): Observable<any> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/AIMLSearch/getFilteredPartsListAsync?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.postEx<any[], SearchBarModelDto[]>(url, httpOptions, filterInfo).pipe(catchError(this.handleError<any[]>('getDocumentsByTextSearch')));
  }

  get3dAISimilarSearch(partId: number, manufacturingCategory?: string): Observable<SimilaritySearchDto> {
    const httpOptions = this.createOptions('post');
    manufacturingCategory = manufacturingCategory ? encodeURIComponent(manufacturingCategory) : '';
    const url = `/api/costing/AIMLSearch/get3dSimilarPartsList?partId=${partId}&manufacturingCategory=${manufacturingCategory}`;
    return this.getEx<SimilaritySearchDto>(url, httpOptions).pipe(catchError(this.handleError<SimilaritySearchDto>('get3dAISimilarSearch')));
  }

  getPdfAISimilarSearch(partId: number, manufacturingCategory?: string, formData?: SimilaritySearchRequestDto): Observable<SimilaritySearchDto> {
    const httpOptions = this.createOptionsForFormFile('post');
    manufacturingCategory = manufacturingCategory ? encodeURIComponent(manufacturingCategory) : '';
    const url = `/api/costing/AIMLSearch/GetPdfSimilarPartsListAsync?partId=${partId}&manufacturingCategory=${manufacturingCategory}`;
    return this.postEx<SimilaritySearchDto, SimilaritySearchRequestDto>(url, httpOptions, formData).pipe(catchError(this.handleError<SimilaritySearchDto>('getpdfAISimilarSearch')));
  }

  getAIImageSimilarSearch(partId: number, formData: FormData): Observable<SimilaritySearchDto> {
    const httpOptions = this.createOptionsForFormFile('post');
    const url = `/api/costing/AIMLSearch/getImageSimilarPartsList?partId=${partId}`;
    return this.postEx<SimilaritySearchDto, FormData>(url, httpOptions, formData).pipe(catchError(this.handleError<SimilaritySearchDto>('getAIImageSimilarSearch')));
  }

  getDocumentsUID(uId: string): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIVisualSearch/GetFileDetails/${uId}`;
    return this.getEx<any[]>(url, httpOptions).pipe(catchError(this.handleError<any[]>('getDocumentsByTextSearch')));
  }

  getAIComparisonSearch(jsonData): Observable<any> {
    const httpOptions = this.createOptions('post');
    const url = `/api/image/aimaterialssearch`;
    console.log('===>', jsonData);
    return this.postEx<any, FormData>(url, httpOptions, jsonData).pipe(catchError(this.handleError<any[]>('getAIComparisonSearch')));
  }

  getAIAllChildParts(partId: number): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/getPartAllChildrenList?pageNumber=0&pageSize=20&partId=${partId}`;
    return this.getEx<any[]>(url, httpOptions).pipe(catchError(this.handleError<any[]>('getAIAllChildParts')));
  }

  getCostingDetailsForSimilarPart(partId: number): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/getCostingDetailsForSimilarPartAsync?partId=${partId}`;
    return this.getEx<MostSimilarPartCostDetailsDto>(url, httpOptions).pipe(catchError(this.handleError<any[]>('getAISimilarSearch')));
  }

  getAIAllPdfParts(partId: number): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/getPdfAllPdfSketchesListAsync?pageNumber=0&pageSize=20&partId=${partId}`;
    return this.getEx<any[]>(url, httpOptions).pipe(catchError(this.handleError<any[]>('getAIAllPdfParts')));
  }

  getGdntParts(partId: number): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/getGdntParts?partId=${partId}`;
    return this.getEx<any[]>(url, httpOptions).pipe(catchError(this.handleError<any[]>('getGdntParts')));
  }

  getAttributeInfo(partId: number): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/getAttributeInfo?partId=${partId}`;
    return this.getEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('getAttributeInfo')));
  }

  registerAttributeInfo(partId: number): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/registerAttributeInfo?partId=${partId}`;
    return this.getEx<string>(url, httpOptions).pipe(catchError(this.handleError<string>('registerAttributeInfo')));
  }

  getExtractionInfo(partIds: number[]): Observable<AiSearchTileExtractionInfoDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/getExtractionInfo`;
    return this.postEx<AiSearchTileExtractionInfoDto[], number[]>(url, httpOptions, partIds).pipe(catchError(this.handleError<AiSearchTileExtractionInfoDto[]>('getExtractionInfo')));
  }

  getPercentageCompletionInfo(partIds: number[]): Observable<AiSearchTileCompletionInfoDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/getPercentageCompletionInfo`;
    return this.postEx<AiSearchTileCompletionInfoDto[], number[]>(url, httpOptions, partIds).pipe(catchError(this.handleError<AiSearchTileCompletionInfoDto[]>('getPercentageCompletionInfo')));
  }

  getPdfCostSummaryInfo(partIds: number[]): Observable<PdfCostSummaryInfo[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/getPdfCostSummaryInfo`;
    return this.postEx<PdfCostSummaryInfo[], number[]>(url, httpOptions, partIds).pipe(catchError(this.handleError<PdfCostSummaryInfo[]>('getPdfCostSummaryInfo')));
  }

  getPdfPartData(partIds: number[]): Observable<AiSearchImageInfoDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/getPartPdfData`;
    return this.postEx<AiSearchImageInfoDto[], number[]>(url, httpOptions, partIds).pipe(catchError(this.handleError<AiSearchImageInfoDto[]>('getPartPdfData')));
  }

  get3dPartData(partIds: number[]): Observable<SimilaritySearchDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/getPart3dData`;
    return this.postEx<SimilaritySearchDto, number[]>(url, httpOptions, partIds).pipe(catchError(this.handleError<SimilaritySearchDto>('getPart3dData')));
  }

  getSuggestedMaterialDescriptionFrom3d(partId: number, manufacturingCategory?: string, ignoreCurrentCosting = false): Observable<AiCostingSuggestionDto[]> {
    const httpOptions = this.createOptions('get');
    const category = encodeURIComponent(manufacturingCategory);
    const url = `/api/costing/AIMLSearch/getSuggestedMaterialDescriptionFrom3d?partId=${partId}&manufacturingCategory=${category}&ignoreCurrentCosting=${ignoreCurrentCosting}`;
    return this.getEx<AiCostingSuggestionDto[]>(url, httpOptions).pipe(catchError(this.handleError<AiCostingSuggestionDto[]>('getSuggestedMaterialDescriptionFrom3d')));
  }

  getComprehensiveSuggestion(partId: number, manufacturingCategory?: string): Observable<AiCostingSuggestionDto[]> {
    const httpOptions = this.createOptions('get');
    const category = encodeURIComponent(manufacturingCategory);
    const url = `/api/costing/AIMLSearch/getComprehensiveSuggestion?partId=${partId}&manufacturingCategory=${category}`;
    return this.getEx<AiCostingSuggestionDto[]>(url, httpOptions).pipe(catchError(this.handleError<AiCostingSuggestionDto[]>('getComprehensiveSuggestion')));
  }

  getUpdatedManufacturingCategory(partId: number): Observable<string> {
    const httpOptions = this.createOptions('get');
    // const category = encodeURIComponent(manufacturingCategory);
    const url = `/api/costing/AIMLSearch/getUpdatedManufacturingCategory?partId=${partId}`;
    return this.getEx<string>(url, httpOptions).pipe(catchError(this.handleError<string>('getSuggestedMaterialDescriptionFrom3d')));
  }

  getHighResThumbnailImage(partId: string, thumbnailType: string) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/getHighResThumbnailImage?partId=${partId}&thumbnailType=${thumbnailType}`;
    return this.getEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('getHighResThumbnailImage')));
  }

  createImageDataJob(partIds: number[]): Observable<any> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/AIMLSearch/createJob`;
    return this.postEx<any, number[]>(url, httpOptions, partIds).pipe(catchError(this.handleError<any>('createImageDataJob')));
  }

  getPartImageData(streamId: string): Observable<any> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/AIMLSearch/streamImages?streamId=${streamId}`;
    return this.getStreamEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('getPartImageData')));
  }

  getFilterValues(filterKey: string, filterValue?: string): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/AIMLSearch/getFilterValues?filterKey=${filterKey}&filterValue=${filterValue}`;
    return this.getEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('getFilterValues')));
  }

  getComparePartsInfo(partIds: number[]): Observable<ComparePartInfo[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/AIMLSearch/getComparePartsInfo`;
    return this.postEx<ComparePartInfo[], number[]>(url, httpOptions, partIds).pipe(catchError(this.handleError<ComparePartInfo[]>('getComparePartsInfo')));
  }
}
