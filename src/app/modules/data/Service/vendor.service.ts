import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { homeEndpoints } from 'src/app/modules/home/home.endpoints';
import { VendorDto } from 'src/app/shared/models';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class VendorService extends BaseHttpService {
  vendorDtoSubject$ = new BehaviorSubject<VendorDto[]>([]);
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

  getVendorList() {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getVendorAll('/api');
    return this.getEx<VendorDto[]>(url, httpOptions).pipe(catchError(this.handleError<VendorDto[]>('getVendorList')));
  }
  loadVendorData() {
    this.subscription['VendorService:getVendorList'] = this.getVendorList().subscribe((result: VendorDto[]) => {
      if (result?.length > 0) {
        this.vendorDtoSubject$.next(result);
      }
      this.subscription['VendorService:getVendorList'].unsubscribe();
    });
  }

  getVendorByName(name: string) {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getVendorByName('/api', name);
    return this.getEx<VendorDto[]>(url, httpOptions).pipe(catchError(this.handleError<VendorDto[]>('getVendorByName')));
  }

  createVendor(vendorData: VendorDto) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.createVendor('/api');
    return this.postEx<VendorDto, VendorDto>(url, httpOptions, vendorData).pipe(catchError(this.handleError<VendorDto>('createVendor')));
  }
}
