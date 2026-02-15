import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { homeEndpoints } from 'src/app/modules/home/home.endpoints';
import { Industry } from '../models';
import { AppConfigurationService } from './app-configuration.service';
import { BaseHttpService } from './base-http.service';
import { BlockUiService } from './block-ui.service';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { ApiCacheService } from './api-cache.service';

@Injectable({
  providedIn: 'root',
})
export class IndustryService extends BaseHttpService {
  industrySubject$ = new BehaviorSubject<Industry[]>([]);
  subscription: Subscription[] = [];
  private industris: Industry[] = [];

  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getIndustry() {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getIndustry('/api');
    this.subscription['IndustryService:getIndustry'] = this.getEx<Industry[]>(url, httpOptions).subscribe({
      next: (data) => {
        this.addBuLocation(data || []);
        this.industrySubject$.next(this.industris);
        this.subscription['IndustryService:getIndustry'].unsubscribe();
      },
      error: () => {
        this.handleError<Industry>('getIndustry');
        this.subscription['IndustryService:getIndustry'].unsubscribe();
      },
    });
  }

  saveBuLocation(dto: Industry) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.createVendor('/api');
    this._blockUIService.pushBlockUI('getIndustry');
    this.subscription['IndustryService:saveBuLocation'] = this.postEx<Industry, Industry>(url, httpOptions, dto).subscribe({
      next: (data) => {
        this.subscription['IndustryService:saveBuLocation'].unsubscribe();
        if (data) {
          this.addBuLocation([data]);
          this.industrySubject$.next(this.industris);
        }
      },
      error: (error: any) => {
        console.log(error);
        this.handleError<Industry>('saveBuLocation');
        this.subscription['IndustryService:saveBuLocation'].unsubscribe();
        this._blockUIService.popBlockUI('saveBuLocation');
      },
    });
  }

  private addBuLocation(dto: Industry[]) {
    this.industris = [...this.industris, ...dto];
  }
}
