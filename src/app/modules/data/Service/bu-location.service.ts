import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BuLocationDto } from 'src/app/shared/models/bu-location.model';
import { BaseHttpService, AppConfigurationService, BlockUiService, ApiCacheService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';
import { homeEndpoints } from '../../home/home.endpoints';

@Injectable({
  providedIn: 'root',
})
export class BuLocationService extends BaseHttpService {
  buLocationDtoSubject$ = new BehaviorSubject<BuLocationDto[]>([]);
  subscription: Subscription[] = [];

  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getBuLocation() {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getBuLocation('/api');
    return this.getEx<BuLocationDto[]>(url, httpOptions).pipe(catchError(this.handleError<BuLocationDto[]>('getBuLocation')));
  }

  saveBuLocation(dto: BuLocationDto) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.saveBuLocation('/api');
    return this.postEx<BuLocationDto, BuLocationDto>(url, httpOptions, dto).pipe(catchError(this.handleError<BuLocationDto>('saveBuLocation')));
  }
}
