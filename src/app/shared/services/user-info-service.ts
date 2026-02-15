import { HttpClient } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { BlockUiService } from './block-ui.service';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { ClientGroupModel, UserModel, WorkflowProcessDto, WorkflowProcessMapDto, WorkflowProcessStatusDto } from 'src/app/modules/settings/models';
import { AppConfigurationService } from './app-configuration.service';
import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { UserTrackingDto } from '../models/user-tracking.model';
import { catchError, tap } from 'rxjs/operators';
import { ClientCountryFilterRequestDto } from '../models/client-country-filter';
import { ApiCacheService } from './api-cache.service';
import { AuthenticationHelperService } from '../helpers/authentication-helper.service';

@Injectable({
  providedIn: 'root',
})
export class UserInfoService extends BaseHttpService {
  private currentUserSubject: BehaviorSubject<UserModel> = new BehaviorSubject(null);
  private clientGroupSubject: BehaviorSubject<ClientGroupModel[]> = new BehaviorSubject(null);
  userInfoUpdatedSubject: Subject<UserModel> = new Subject<UserModel>();
  router: any;
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected msalService: MsalService,
    protected _apiCacheService: ApiCacheService,
    protected authenticationHelperService: AuthenticationHelperService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getCurrentUser(): Observable<UserModel> {
    const httpOptions = this.createOptions('get');
    // const baseUrl = location.origin;
    const url = `/api/master/User`;
    return this.getMasterEx<UserModel>(url, httpOptions).pipe(
      tap((user) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.appConfigurationService.loadPowerBIConfigData(user?.client?.numberOfDecimals, user?.client?.reports);
        }
      }),
      catchError(this.handleError<UserModel>('getCurrentUser'))
      // catchError((err) => {
      // if (err.status == 401) {
      //   this.msalService.logout();
      //   // localStorage.removeItem('isLoggedIn');
      //   // this._apiCacheService.removeCache('ALL');
      //   // localStorage.removeItem('user');
      //   // localStorage.removeItem('@@STATE');
      //   this.authenticationHelperService.clearOnLogout();
      //   this.router.navigate(['/login']);
      //   location.reload();
      // }
      // return of(null);
      // })
    );
  }

  getClientGroups(): Observable<ClientGroupModel[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/User/ClientGroups`;
    return this.getMasterEx<ClientGroupModel[]>(url, httpOptions).pipe(
      tap((clientGroups) => {
        if (clientGroups) {
          localStorage.setItem('clientGroups', JSON.stringify(clientGroups));
          this.clientGroupSubject.next(clientGroups);
        }
      })
    );
  }

  getZohoToken(): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/zoho/token`;
    return this.getMasterEx<any>(url, httpOptions);
  }

  getMasterUrlBase(): Observable<string> {
    return this.getMasterBaseUrl();
  }

  getUserValue() {
    return this.currentUserSubject.asObservable();
  }

  getClientGroupsValue() {
    return this.clientGroupSubject.asObservable();
  }

  getNumberOfDecimalPlaces() {
    return this.currentUserSubject.asObservable().subscribe((user) => {
      return user != null && user != undefined && user?.client ? user?.client?.numberOfDecimals : 0;
    });
  }

  addUserLog(userId: number, location: any): Observable<any> {
    // this.getLocationInfo();
    const postUrl = `/api/master/UserTracking/create`;
    const httpOptions = this.createOptions('post');
    const locationDto = new UserTrackingDto();
    locationDto.id = 0;
    locationDto.userId = userId;
    locationDto.loginDetails = JSON.stringify(location);
    // locationDto.loginDetails = localStorage.getItem('location');
    return this.postMasterEx(postUrl, httpOptions, locationDto).pipe(catchError(this.handleError<UserTrackingDto>('AddUserLog')));
  }

  checkIfAccessAllowed(userId: number, countryCode: string): Observable<any> {
    if (userId || isNaN(userId)) {
      return of(true);
    }
    const postUrl = `/api/master/UserTracking/checkIfAccessIsAlowed`;
    const httpOptions = this.createOptions('post');
    const request = new ClientCountryFilterRequestDto();
    request.userId = userId;
    request.countryCode = countryCode;
    return this.postMasterEx(postUrl, httpOptions, request).pipe(catchError(this.handleError<UserTrackingDto>('checkIfAccessAllowed')));
  }

  getLocationInfo() {
    // We can use this url if geolocation-db.com is down
    //https://static.matterport.com/geoip/
    const locationUrl = 'https://geolocation-db.com/json/';
    return this.http.get(locationUrl).pipe(
      catchError((err) => {
        console.error('getLocationInfo failed', err);
        return of({});
      })
    );
  }

  createOrUpdateWorkflowProcess(workflowProcess: WorkflowProcessDto[]): Observable<WorkflowProcessDto[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/ProjectUser/createWorkflowProcess`;
    return this.postEx<WorkflowProcessDto[], WorkflowProcessDto[]>(url, httpOptions, workflowProcess).pipe(catchError(this.handleError<WorkflowProcessDto[]>('createOrUpdateWorkflowProcess')));
  }

  getWorkFlowProcess(): Observable<WorkflowProcessDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectUser/workFlowProcess`;
    return this.getEx<WorkflowProcessDto[]>(url, httpOptions).pipe(catchError(this.handleError<WorkflowProcessDto[]>('getWorkFlowProcess')));
  }

  getWorkFlowProcessMap(): Observable<WorkflowProcessMapDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectUser/workFlowProcessMap`;
    return this.getEx<WorkflowProcessMapDto[]>(url, httpOptions).pipe(catchError(this.handleError<WorkflowProcessMapDto[]>('getWorkFlowProcessMap')));
  }

  getWorkFlowProcessStatus(projectInfoId: number): Observable<WorkflowProcessStatusDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/ProjectUser/workFlowProcessStatus/${projectInfoId}`;
    return this.getEx<WorkflowProcessStatusDto[]>(url, httpOptions).pipe(catchError(this.handleError<WorkflowProcessStatusDto[]>('getWorkFlowProcessStatus')));
  }

  createOrUpdateWorkflowProcessStatus(workflowProcessStatus: WorkflowProcessStatusDto): Observable<WorkflowProcessStatusDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/ProjectUser/createWorkflowProcessStatus`;
    return this.postEx<WorkflowProcessStatusDto, WorkflowProcessStatusDto>(url, httpOptions, workflowProcessStatus).pipe(
      catchError(this.handleError<WorkflowProcessStatusDto>('createOrUpdateWorkflowProcessStatus'))
    );
  }

  // getLocationInfo() {
  //   const locationUrl = 'https://geolocation-db.com/json/';
  //   return this.http.get(locationUrl).subscribe((x) => {
  //     localStorage.setItem('location', JSON.stringify(x));
  //   });
  // }
}
