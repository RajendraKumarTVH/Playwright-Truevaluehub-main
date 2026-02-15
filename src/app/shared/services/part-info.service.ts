import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { PartInfoDto } from '../models';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { DocumentCollectionDto } from '../models/document-collection.model';
import { DocumentRecordDto } from '../models/document-records.model';
import { DFMSheetMetalAnalyzer } from '../models/dfm-issues.model';
import { DraftProjectPartInfoUpdateDto } from '../models/draft-part-info.model';

@Injectable({ providedIn: 'root' })
export class PartInfoService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getParttDetailsById(partInfoId: number): Observable<PartInfoDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/PartInfo?PartInfoId=${partInfoId}`;
    return this.getEx<PartInfoDto>(url, httpOptions).pipe(catchError(this.handleError<PartInfoDto>('getParttDetailsById')));
  }

  savePartInfoDetails(partInfo: PartInfoDto): Observable<PartInfoDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/PartInfo/create`;
    return this.postEx<PartInfoDto, PartInfoDto>(url, httpOptions, partInfo).pipe(catchError(this.handleError<PartInfoDto>('savePartInfoDetails')));
  }

  updatePartInfo(partInfo: PartInfoDto): Observable<PartInfoDto> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/PartInfo/${partInfo.partInfoId}/update`;
    return this.putEx<PartInfoDto, PartInfoDto>(url, httpOptions, partInfo).pipe(catchError(this.handleError<PartInfoDto>('updatePartInfo')));
  }

  uploadPartDocumentCollection(partInfoId: number, formData: FormData): Observable<DocumentCollectionDto> {
    const httpOptions = this.createOptionsForFormFile('post');
    const url = `/api/costing/PartInfo/${partInfoId}/documents`;
    return this.postEx<DocumentCollectionDto, FormData>(url, httpOptions, formData).pipe(catchError(this.handleError<DocumentCollectionDto>('uploadPartDocumentCollection')));
  }

  uploadPartDocuments(partInfoId: number, documentCollectionId: number, formData: FormData): Observable<DocumentRecordDto> {
    const httpOptions = this.createOptionsForFormFile('post');
    const url = `/api/costing/PartInfo/${partInfoId}/documentCollection/${documentCollectionId}/documents`;
    return this.postEx<DocumentRecordDto, FormData>(url, httpOptions, formData).pipe(catchError(this.handleError<DocumentRecordDto>('uploadPartDocuments')));
  }

  updateDocumentRecordPrivate(partInfoId: number, documentRecordId: number, isPrivate: boolean): Observable<DocumentRecordDto> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/PartInfo/${partInfoId}/documentrecords/${documentRecordId}/private?isPrivate=${isPrivate}`;
    return this.putEx<DocumentRecordDto, boolean>(url, httpOptions, isPrivate).pipe(catchError(this.handleError<DocumentRecordDto>('updateDocumentRecordPrivate')));
  }

  downloadDocument(documentRecordId: number): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/documentrecords/${documentRecordId}/download`;
    return this.getEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('downloadDocument')));
  }

  getSasToken() {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/PartInfo/document/sastoken`;
    return this.getEx<string>(url, httpOptions).pipe(catchError(this.handleError<any>('getSasToken')));
  }

  deleteDocument(partInfoId: number, documentRecordId: number): Observable<boolean> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/PartInfo/${partInfoId}/documentrecords/${documentRecordId}`;
    return this.deleteEx<boolean>(url, httpOptions).pipe(catchError(this.handleError<boolean>('deleteDocument')));
  }

  getDfmIssues(partInfoId: number): Observable<DFMSheetMetalAnalyzer> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/PartInfo/${partInfoId}/dfm-issues`;
    return this.getEx<DFMSheetMetalAnalyzer>(url, httpOptions).pipe(catchError(this.handleError<any>('getDfmIssues')));
  }

  uploadPartDocumentImage(partInfoId: number, documentRecordId: number, formData: FormData): Observable<DocumentRecordDto> {
    const httpOptions = this.createOptionsForFormFile('post');
    const url = `/api/costing/PartInfo/${partInfoId}/documentrecords/${documentRecordId}`;
    return this.postEx<DocumentRecordDto, FormData>(url, httpOptions, formData).pipe(catchError(this.handleError<DocumentRecordDto>('uploadPartDocumentImage')));
  }

  draftPartInfoUpdate(partInfoId: number, draftProjectPartInfoUpdateDto: DraftProjectPartInfoUpdateDto) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/PartInfo/${partInfoId}/draftpartupdate`;
    return this.postEx<DraftProjectPartInfoUpdateDto, DraftProjectPartInfoUpdateDto>(url, httpOptions, draftProjectPartInfoUpdateDto).pipe(catchError(this.handleError<any>('draftPartInfoUpdate')));
  }
}
