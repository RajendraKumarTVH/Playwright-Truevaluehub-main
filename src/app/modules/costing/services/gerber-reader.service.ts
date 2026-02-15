import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';
import { GerberImageInfoDto, GerberInfoDto, GerberReaderResponseDto } from '../models/gerber-reader-response-dto';

@Injectable({
  providedIn: 'root',
})
export class GerberReaderService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getGerberReaderDetails(formData?: FormData): Observable<GerberReaderResponseDto> {
    const httpOptions = this.createOptionsForFormFile('post');
    const url = `/api/costing/GerberReader/getGerberReaderDetails`;
    return this.postEx<GerberReaderResponseDto, FormData>(url, httpOptions, formData).pipe(catchError(this.handleError<GerberReaderResponseDto>('getGerberReaderDetails')));
  }

  getGerberDetailsByPartInfoId(partInfoId?: number): Observable<GerberInfoDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/GerberReader/getGerberReaderDetailsByPartInfoId/${partInfoId}`;
    return this.getEx<GerberInfoDto>(url, httpOptions).pipe(catchError(this.handleError<GerberInfoDto>('getGerberDetailsByPartInfoId')));
  }

  getGerberImageInfoByPartInfoId(partInfoId?: number): Observable<GerberImageInfoDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/GerberReader/getGerberImage?partInfoId=${partInfoId}`;
    return this.getEx<GerberImageInfoDto[]>(url, httpOptions).pipe(catchError(this.handleError<GerberImageInfoDto[]>('getGerberImageInfoByPartInfoId')));
  }
}
