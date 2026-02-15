import { HttpClient } from '@angular/common/http';
import { computed, effect, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { ProjectBasicDetailsModel } from 'src/app/modules/home/models';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { PartInfoDto, ProjectInfoDto } from '../models';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { PartDetailsByProjectDto } from '../models/partdetails_byproject.model';
import { DocumentRecordDto } from '../models/document-records.model';
import { ExtractionData } from '../models/extract-data.model';
import { PCBAMarketDataDto, SubCategoryDto } from '../models/pcb-master..model';
import { ProjectUserDto, SelectedProjectUser, UserModel } from 'src/app/modules/settings/models';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PartThumbnailDto } from '../models/part-thumbnail.model';

@Injectable({ providedIn: 'root' })
export class ProjectInfoService extends BaseHttpService {
  users = signal<UserModel[]>([]);
  selectedProjectInfoId = signal<number | undefined>(undefined);
  prevProjectInfoId: number = 0;
  selectedProjectId: number = 0;
  private writableProjectUsers = signal<ProjectUserDto[]>([]);
  _e = effect(() => this.writableProjectUsers.set(this.projectUsers()));

  private projectUsers$ = toObservable(this.selectedProjectInfoId).pipe(
    filter(Boolean),
    switchMap((id) => {
      const httpOptions = this.createOptions('get');
      const url = `/api/costing/ProjectUser/${id}`;
      return this.getEx<ProjectUserDto[]>(url, httpOptions).pipe(catchError(this.handleError<ProjectUserDto[]>('GetProjectUsersByProjectId')));
    })
  );
  projectUsers = toSignal(this.projectUsers$, { initialValue: [] as ProjectUserDto[] });
  selectedUsers = computed(() => {
    return this.users()
      .filter((x) => x.status === true)
      .map((x) => {
        let prjUserId = 0;
        let selected: boolean = false;
        let prjUser = this.writableProjectUsers().find((y) => y.userId === x.userId);
        if (prjUser) {
          prjUserId = prjUser.projectUserId;
          selected = !prjUser.isDeleted;
        }
        return {
          id: x.userId,
          firstName: x.firstName,
          lastName: x.lastName,
          name: x.firstName + ',' + x.lastName,
          projectUserId: prjUserId,
          projectInfoId: this.selectedProjectId,
          isSelected: selected,
        } as SelectedProjectUser;
      });
  });
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getAllProjectInfo(pageNumber: number = 1, pageSize: number = 20, fUllList: boolean = false, searchCriteria: string = ''): Observable<ProjectInfoDto[]> {
    const httpOptions = this.createOptions('get');
    let s = '';
    if (pageNumber > 0) {
      s = `pageNumber=${pageNumber}`;
    }

    if (pageSize > 0) {
      s = `${s}&&pageNumber=${pageNumber}`;
      // } else if (pageSize > 0) {
      //   s = `$pageSize=${pageSize}`;
    }

    if (fUllList) {
      s = `${s}&&fUllList=${fUllList}`;
    }

    if (searchCriteria) {
      s = `${s}&&searchCriteria=${searchCriteria}`;
    }
    const url = `/api/costing/ProjectInfo?${s}`;
    return this.getEx<ProjectInfoDto[]>(url, httpOptions).pipe(catchError(this.handleError<ProjectInfoDto[]>('getAllProjectInfo')));
  }

  getArchiveProjectDetails(): Observable<ProjectInfoDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectInfo/archive`;
    return this.getEx<ProjectInfoDto[]>(url, httpOptions).pipe(catchError(this.handleError<ProjectInfoDto[]>('getArchiveProjectDetails')));
  }

  getDraftProjectDetails(): Observable<ProjectInfoDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectInfo/drafts`;
    return this.getEx<ProjectInfoDto[]>(url, httpOptions).pipe(catchError(this.handleError<ProjectInfoDto[]>('getDraftProjectDetails')));
  }

  getBasicProjectDetails(projectInfoId: number): Observable<ProjectInfoDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectInfo/basicInfo/${projectInfoId}`;
    return this.getEx<ProjectInfoDto>(url, httpOptions).pipe(catchError(this.handleError<ProjectInfoDto>('getBasicProjectDetails')));
  }

  setProjectUsers(projectUsers: ProjectUserDto[]) {
    this.writableProjectUsers.set(projectUsers);
  }

  projectInfoSelected(projectInfoId: number): void {
    this.selectedProjectId = projectInfoId;
    this.selectedProjectInfoId.set(projectInfoId);
  }

  setUsers(users: UserModel[]) {
    this.users.set(users);
  }

  createProjectUsers(projectUsers: ProjectUserDto[]): Observable<ProjectUserDto[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/ProjectUser/create`;
    return this.postEx<ProjectUserDto[], ProjectUserDto[]>(url, httpOptions, projectUsers).pipe(catchError(this.handleError<ProjectUserDto[]>('createProjectUsers')));
  }

  getProjectDetailsById(projectInfoId: number): Observable<ProjectInfoDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectInfo/${projectInfoId}`;
    return this.getEx<ProjectInfoDto>(url, httpOptions).pipe(catchError(this.handleError<ProjectInfoDto>('getProjectDetailsById')));
  }

  saveProjectDetails(projectInfo: ProjectInfoDto): Observable<ProjectInfoDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/ProjectInfo/create`;
    return this.postEx<ProjectInfoDto, ProjectInfoDto>(url, httpOptions, projectInfo).pipe(catchError(this.handleError<ProjectInfoDto>('saveProjectDetails')));
  }

  updateProjectDetails(projectInfo: ProjectInfoDto): Observable<ProjectInfoDto> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/ProjectInfo/update?projectInfoId=${projectInfo.projectInfoId}`;
    return this.putEx<ProjectInfoDto, ProjectInfoDto>(url, httpOptions, projectInfo).pipe(catchError(this.handleError<ProjectInfoDto>('updateProjectDetails')));
  }

  updateProjectBasicDetails(projectInfoId: number, model: ProjectBasicDetailsModel): Observable<boolean> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/ProjectInfo/project/${projectInfoId}/updatebasicdata`;
    return this.putEx<boolean, ProjectBasicDetailsModel>(url, httpOptions, model).pipe(catchError(this.handleError<boolean>('updateProjectDetails')));
  }

  projectPartsUpload(projectInfoId: number, formData: FormData): Observable<ProjectInfoDto> {
    const httpOptions = this.createOptionsForFormFile('post');
    const url = `/api/costing/ProjectInfo/${projectInfoId}/partsfileupload`;
    return this.postEx<ProjectInfoDto, FormData>(url, httpOptions, formData).pipe(catchError(this.handleError<ProjectInfoDto>('projectPartsUpload')));
  }

  updateDocument(formData: FormData): Observable<PartInfoDto> {
    const httpOptions = this.createOptionsForFormFile('post');
    const url = `/api/costing/ProjectInfo/updatedocuments`;
    return this.postEx<PartInfoDto, FormData>(url, httpOptions, formData).pipe(catchError(this.handleError<PartInfoDto>('updateDocument')));
  }

  archiveProject(projectInfoId: number): Observable<ProjectInfoDto> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/ProjectInfo/archive?projectInfoId=${projectInfoId}`;
    return this.put<ProjectInfoDto>(url, httpOptions).pipe(catchError(this.handleError<ProjectInfoDto>('archiveProject')));
  }

  deleteProject(projectInfoId: number): Observable<boolean> {
    const httpOptions = this.createOptions('delete');
    const url = `/api/costing/ProjectInfo/Delete?projectInfoId=${projectInfoId}`;
    return this.deleteEx<boolean>(url, httpOptions).pipe(catchError(this.handleError<boolean>('deleteProject')));
  }

  restoreProject(projectInfoId: number): Observable<ProjectInfoDto> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/ProjectInfo/restore?projectInfoId=${projectInfoId}`;
    return this.put<ProjectInfoDto>(url, httpOptions).pipe(catchError(this.handleError<ProjectInfoDto>('restoreProject')));
  }

  getPartDetailsByProjectId(projectInfoId: number): Observable<PartDetailsByProjectDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectInfo/project/${projectInfoId}/activePartDetailsByProjectId`;

    return this.getEx<PartDetailsByProjectDto[]>(url, httpOptions).pipe(catchError(this.handleError<PartDetailsByProjectDto[]>('getArchiveProjectDetails')));
  }

  partsFileUpload(projectId: number, partName: string): Observable<ProjectInfoDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/ProjectInfo/partsfileupload?projectName=${projectId}&partName=${partName}`;
    return this.put<ProjectInfoDto>(url, httpOptions).pipe(catchError(this.handleError<ProjectInfoDto>('partsFileUpload')));
  }

  refreshProject(projectInfoId: number) {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/ProjectInfo/extract-cad-data/${projectInfoId}`;
    return this.put<ProjectInfoDto>(url, httpOptions).subscribe();
  }

  updateProjectStatus(projectInfoId: number, projectStatusId: number): Observable<boolean> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/ProjectInfo/updateProjectStatus/${projectInfoId}`;
    return this.putEx<boolean, number>(url, httpOptions, projectStatusId).pipe(catchError(this.handleError<boolean>('updateProjectStatus')));
  }

  updateNewDocumentForFailedRecord(partInfoId: number, documentRecordId: number, formData: FormData): Observable<DocumentRecordDto> {
    const httpOptions = this.createOptionsForFormFile('put');
    const url = `/api/costing/ProjectInfo/project/${partInfoId}/updatedocumentrecords/${documentRecordId}`;
    return this.postEx<DocumentRecordDto, FormData>(url, httpOptions, formData).pipe(catchError(this.handleError<DocumentRecordDto>('updateDocuments')));
  }

  getPartThumbnailsByProject(projectInfoId: number): Observable<PartThumbnailDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectInfo/partThumbnails/${projectInfoId}`;
    return this.getEx<PartThumbnailDto[]>(url, httpOptions).pipe(catchError(this.handleError<PartThumbnailDto[]>('PartThumbnailDto')));
  }

  reExtraction(extractDataRequest: ExtractionData): Observable<boolean> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/ProjectInfo/costing-extract-cad-data/${extractDataRequest.projectInfoId}`;
    return this.postEx<boolean, ExtractionData>(url, httpOptions, extractDataRequest).pipe(catchError(this.handleError<boolean>('reExtraction')));
  }

  getQuarter(month: number): string {
    if (month <= 3) {
      return 'Q1';
    } else if (month > 3 && month <= 6) {
      return 'Q2';
    } else if (month > 6 && month <= 9) {
      return 'Q3';
    } else {
      return 'Q4';
    }
  }

  getPriceDatasByMPNsAsync(mpnNos: any[]): Observable<PCBAMarketDataDto[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/master/PrintedCircuitBoard/mpns`;
    return this.postMasterEx<PCBAMarketDataDto[], any[]>(url, httpOptions, mpnNos).pipe(catchError(this.handleError<PCBAMarketDataDto[]>('getPriceDatasByMPNsAsync')));
  }

  getSubCategories(): Observable<SubCategoryDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/PrintedCircuitBoard/GetSubCategories`;
    return this.getMasterEx<SubCategoryDto[]>(url, httpOptions).pipe(catchError(this.handleError<SubCategoryDto[]>('getSubCommodityData')));
  }

  getCopyPartDetailsById(projectInfoId: number): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectInfo/previouslyCostedProjectInfo/${projectInfoId}`;
    return this.getEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('getCopyPartDetailsById')));
  }

  getMaterialInputsByProjectId(projectInfoId: number): Observable<any[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectInfo/project/${projectInfoId}/materialInputsByProjectId`;
    return this.getEx<any[]>(url, httpOptions).pipe(catchError(this.handleError<any[]>('getMaterialInputsByProjectId')));
  }
}
