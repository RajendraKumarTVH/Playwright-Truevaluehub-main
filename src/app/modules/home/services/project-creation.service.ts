import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';
import { homeEndpoints } from '../home.endpoints';

@Injectable({ providedIn: 'root' })
export class ProjectCreationService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  processBomTemplate(formData: any) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.processBomTemplate('/api');
    return this.postEx<any, any>(url, httpOptions, formData).pipe(catchError(this.handleError<any>('processBomTemplate')));
  }

  partsFilesProcess(formData: any) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.partsFilesProcess('/api');
    return this.postEx<any, any>(url, httpOptions, formData).pipe(catchError(this.handleError<any>('partsFilesProcess')));
  }

  partsFileUpload(formData: any, projectname: any) {
    const partName = 'testpartname';
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.partsFileUpload('/api', projectname, partName);
    return this.postEx<any, any>(url, httpOptions, formData).pipe(catchError(this.handleError<any>('partsFileUpload')));
  }

  updateParts(partData: any) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.updateParts('/api');
    return this.postEx<any, any>(url, httpOptions, partData).pipe(catchError(this.handleError<any>('updateParts')));
  }

  getProjectData() {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getProjectData('/api');
    return this.getEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('getProjectData')));
  }

  getProjectDataById(id: number) {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getProjectDataById('/api', id);
    return this.getEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('getProjectDataById')));
  }
}
