import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { ProjectScenarioDto } from '../models/Project-Scenario.model';
import { CopyScenarioDto, EditScenarioDto, NewScenarioDto, PartInputDto } from '../models/copy-scenario.model';

@Injectable({ providedIn: 'root' })
export class ScenarioService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getAllActiveScenarioByProjectId(projectInfoId: number): Observable<ProjectScenarioDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectScenario?projectInfoId=${projectInfoId}`;
    return this.getEx<ProjectScenarioDto[]>(url, httpOptions).pipe(catchError(this.handleError<ProjectScenarioDto[]>('getAllActiveScenarioByProjectId')));
  }

  getAllPartScenarioByProjectId(projectInfoId: number): Observable<ProjectScenarioDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectScenario/${projectInfoId}/GetAllScenarioWithPartInfos`;
    return this.getEx<ProjectScenarioDto[]>(url, httpOptions).pipe(catchError(this.handleError<ProjectScenarioDto[]>('getAllPartScenarioByProjectId')));
  }

  copyScenario(copyScenarioDto: CopyScenarioDto): Observable<NewScenarioDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/ProjectScenario/CopyScenario`;
    return this.postEx<NewScenarioDto, CopyScenarioDto>(url, httpOptions, copyScenarioDto).pipe(catchError(this.handleError<NewScenarioDto>('copyScenario')));
  }

  updateScenario(editScenarioDto: EditScenarioDto): Observable<boolean> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/ProjectScenario/updateScenario`;
    return this.putEx<boolean, EditScenarioDto>(url, httpOptions, editScenarioDto).pipe(catchError(this.handleError<boolean>('updateScenario')));
  }

  removeScenario(projectInfoId: number, scenarioId: number) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/ProjectScenario/${projectInfoId}/delete/${scenarioId}`;
    return this.deleteEx<boolean>(url, httpOptions).pipe(catchError(this.handleError<boolean>('removeScenario')));
  }

  copyPart(partInputDtos: PartInputDto[], projectInfoId: number): Observable<any> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/ProjectScenario/CopyPart/${projectInfoId}`;
    return this.postEx<any, PartInputDto[]>(url, httpOptions, partInputDtos).pipe(catchError(this.handleError<any>('copyPart')));
  }

  updateScenarioSortOrder(projectInfoId: number, sortInfo: { id: number; sortOrder: number }[]): Observable<boolean> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/ProjectScenario/updateScenarioSortOrder/${projectInfoId}`;
    return this.putEx<boolean, { id: number; sortOrder: number }[]>(url, httpOptions, sortInfo).pipe(catchError(this.handleError<boolean>('updateScenarioSortOrder')));
  }
}
