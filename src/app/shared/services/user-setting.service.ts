import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppConfigurationService } from './app-configuration.service';
import { BaseHttpService } from './base-http.service';
import { BlockUiService } from './block-ui.service';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { UserSettingsDto } from '../models/user-setting.model';
import { ApiCacheService } from './api-cache.service';

@Injectable({
  providedIn: 'root',
})
export class UserSettingService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getUserSetting(key: string): Observable<UserSettingsDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/UserSettings/${key}`;

    return this.getEx<UserSettingsDto>(url, httpOptions).pipe(catchError(this.handleError<UserSettingsDto>('getUserSetting')));
  }

  saveUserSettings(key: string, value: string): Observable<UserSettingsDto> {
    const request: UserSettingsDto = {
      key: key,
      value: value,
    };

    const httpOptions = this.createOptions('post');
    const url = `/api/costing/UserSettings/Save`;
    return this.postEx<UserSettingsDto, UserSettingsDto>(url, httpOptions, request).pipe(catchError(this.handleError<UserSettingsDto>('saveUserSettings')));
  }
}
