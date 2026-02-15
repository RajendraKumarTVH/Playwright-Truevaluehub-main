import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';
import { CommentFieldCountModel, CommentFieldModel, CommentFieldPayloadModel, CommentFieldUpdatePayloadModel } from '../models/comment-field-model';

@Injectable({ providedIn: 'root' })
export class CommentFieldService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getCommentFieldsByParams(params: any): Observable<CommentFieldModel[]> {
    const secondaryID = params.secondaryID ?? 0;
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CommentField?partInfoId=${params.partInfoId}&screenId=${params.screenId}&primaryId=${params.primaryId}&formControlName=${params.formControlName}&secondaryID=${secondaryID}`;
    return this.getEx<CommentFieldModel[]>(url, httpOptions).pipe(catchError(this.handleError<CommentFieldModel[]>('getCommentFieldsByParams')));
  }

  getCommentFieldsByPartInfoId(partInfoId: number): Observable<CommentFieldModel[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CommentField/${partInfoId}`;
    return this.getEx<CommentFieldModel[]>(url, httpOptions).pipe(catchError(this.handleError<CommentFieldModel[]>('getCommentFieldsByPartInfoId')));
  }

  getCommentFieldsCountByPartInfoId(partInfoId: number): Observable<CommentFieldCountModel[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CommentField/count/${partInfoId}`;
    return this.getEx<CommentFieldCountModel[]>(url, httpOptions).pipe(catchError(this.handleError<CommentFieldCountModel[]>('getCommentFieldsCountByPartInfoId')));
  }

  saveCommentField(commentField: CommentFieldPayloadModel): Observable<CommentFieldModel> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CommentField/create`;
    return this.postEx<CommentFieldModel, CommentFieldPayloadModel>(url, httpOptions, commentField).pipe(catchError(this.handleError<CommentFieldModel>('saveCommentField')));
  }

  updateCommentField(commentField: CommentFieldUpdatePayloadModel, commentId: number): Observable<CommentFieldModel> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CommentField/update/${commentId}`;
    return this.putEx<CommentFieldModel, CommentFieldUpdatePayloadModel>(url, httpOptions, commentField).pipe(catchError(this.handleError<CommentFieldModel>('updateCommentField')));
  }

  deleteCommentField(commentId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CommentField/delete?commentId=${commentId}`;
    return this.deleteEx<boolean>(url, httpOptions).pipe(catchError(this.handleError<CommentFieldModel>('deleteCommentField')));
  }
}
