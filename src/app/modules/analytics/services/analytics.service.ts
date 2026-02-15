import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProjectsInfoData } from 'src/app/shared/data-models/projects-info-data.model';
import { MaterialInfoDto } from 'src/app/shared/models';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';
import { homeEndpoints } from '../../home/home.endpoints';
import { CostDriverSummary } from '../models/cost-driver-summary.model';
import { PartModel } from '../models/part-model';
import { PlaybookDto } from '../models/playbook-dto';
import { ProjectScenarioDto } from 'src/app/shared/models/Project-Scenario.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService extends BaseHttpService {
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

  getScenariosAndPartsByProjectId(projecttInfoId: number): Observable<ProjectScenarioDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectScenario/${projecttInfoId}/GetAllScenarioWithPartInfos`;
    return this.getEx<ProjectScenarioDto[]>(url, httpOptions).pipe(catchError(this.handleError<ProjectScenarioDto[]>('getScenariosAndPartsByProjectId')));
  }

  getPartsByProjectId(projecttInfoId: number): Observable<PartModel[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/PartInfo/${projecttInfoId}/partdetails`;
    return this.getEx<PartModel[]>(url, httpOptions).pipe(catchError(this.handleError<PartModel[]>('getPartsByProjectId')));
  }

  getCostDriverSummaryByProjectId(projectInfoId: number, partId: number): Observable<CostDriverSummary[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/Analytics/costdriversummary?projectInfoId=${projectInfoId}&partInfoId=${partId}`;
    return this.getEx<CostDriverSummary[]>(url, httpOptions).pipe(catchError(this.handleError<CostDriverSummary[]>('getCostDriverSummaryByProjectId')));
  }

  getMaterialInfoBypartId(partInfoId: number): Observable<MaterialInfoDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/MaterialInfo/${partInfoId}/materialdetails`;
    return this.getEx<MaterialInfoDto>(url, httpOptions).pipe(catchError(this.handleError<MaterialInfoDto>('getMaterialInfoBypartId')));
  }

  calculateNewCostValue(shouldCost: any, percentage: any) {
    const percent = percentage / 100;
    const should = parseFloat(shouldCost);
    const newCost = should + should * percent;
    return percentage == 0 ? should : newCost;
  }

  saveAnalyticsDetails(playbookInfo: PlaybookDto): Observable<PlaybookDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/Analytics/create`;
    return this.postEx<PlaybookDto, PlaybookDto>(url, httpOptions, playbookInfo).pipe(catchError(this.handleError<PlaybookDto>('saveAnalyticsDetails')));
  }

  getplaybookList(): Observable<PlaybookDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/Analytics/getall`;
    return this.getEx<PlaybookDto[]>(url, httpOptions).pipe(catchError(this.handleError<PlaybookDto[]>('getplaybookList')));
  }

  checkNameExists(partInfoId: number, playbookName: string): Observable<PlaybookDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/Analytics/nameduplicate?partInfoId=${partInfoId}&name=${playbookName}`;
    return this.getEx<PlaybookDto>(url, httpOptions).pipe(catchError(this.handleError<PlaybookDto>('checkNameExists')));
  }
}
