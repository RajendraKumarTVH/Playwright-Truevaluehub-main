import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ProjectsInfoData } from 'src/app/shared/data-models/projects-info-data.model';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { homeEndpoints } from '../home.endpoints';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';

@Injectable({ providedIn: 'root' })
export class ProjectService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getProjectDetails() {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getProjectDetails('/api');
    return this.getEx<ProjectsInfoData>(url, httpOptions).pipe(catchError(this.handleError<any>('getProjectDetails')));
  }

  getActiveProjectDetails() {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getActiveProjectList('/api');
    return this.getEx<ProjectsInfoData>(url, httpOptions).pipe(catchError(this.handleError<any>('getActiveProjectDetails')));
  }

  getActiveProjectSearchList(searchRequest: any) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.getActiveProjectSearchList('/api');
    return this.postEx<ProjectsInfoData, any>(url, httpOptions, searchRequest).pipe(catchError(this.handleError<any>('getActiveProjectSearchList')));
  }

  getPartThumbnailsAsync(searchRequest: any) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.getPartThumbnailsAsync('/api');
    return this.postEx<ProjectsInfoData, any>(url, httpOptions, searchRequest).pipe(catchError(this.handleError<any>('getPartThumbnailsAsync')));
  }

  getArchiveProjectDetails() {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getArchiveProjectList('/api');
    return this.getEx<ProjectsInfoData>(url, httpOptions).pipe(catchError(this.handleError<any>('getArchiveProjectDetails')));
  }

  getProjectNumber() {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getProjectNumber('/api');
    return this.getEx<string>(url, httpOptions).pipe(catchError(this.handleError<any>('getProjectNumber')));
  }

  getArchived() {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getArchived('/api');
    return this.getEx<ProjectsInfoData>(url, httpOptions).pipe(catchError(this.handleError<any>('getArchived')));
  }

  getProjectDetailById(projectid: string) {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getProjectDetailById('/api', projectid);
    return this.getEx<ProjectsInfoData>(url, httpOptions).pipe(catchError(this.handleError<any>('getProjectDetailById')));
  }

  insertProjectinfo(projinfo: ProjectsInfoData) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.insertProjectinfo('/api');
    return this.postEx<boolean, ProjectsInfoData>(url, httpOptions, projinfo).pipe(catchError(this.handleError<boolean>('insertProjectinfo')));
  }

  editArchived(projectnumber: string) {
    const httpOptions = this.createOptions('put');
    const url = homeEndpoints.editArchived('/api', projectnumber);
    return this.putEx<boolean, string>(url, httpOptions, projectnumber).pipe(catchError(this.handleError<boolean>('editArchived')));
  }

  restoreProject(projectnumber: string) {
    const httpOptions = this.createOptions('put');
    const url = homeEndpoints.restoreProject('/api', projectnumber);
    return this.putEx<boolean, string>(url, httpOptions, projectnumber).pipe(catchError(this.handleError<boolean>('restoreProject')));
  }

  postProjectinfo(projinfo: ProjectsInfoData) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.postProjectinfo('/api');
    return this.postEx<boolean, ProjectsInfoData>(url, httpOptions, projinfo).pipe(catchError(this.handleError<boolean>('postProjectinfo')));
  }
}
