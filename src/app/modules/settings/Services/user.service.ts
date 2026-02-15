import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, UserGroupDto } from 'src/app/shared/models';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';
import { UserModel, UpdateUserRequest, RoleModel } from '../models';
@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getUsersById(userId: number): Observable<User> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/User/${userId}`;
    return this.getMasterEx<User>(url, httpOptions).pipe(catchError(this.handleError<any>('getUsersById')));
  }

  getUsersByClientId(clientId: number): Observable<UserModel[]> {
    const httpOptions = this.createOptionsWithNoCache('get');
    const url = `/api/master/User/ByClient/${clientId}`;
    return this.getMasterEx<User[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getUsersByClientId')));
  }
  getUserGroups(): Observable<UserGroupDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/User/UserGroups`;
    return this.getMasterEx<UserGroupDto[]>(url, httpOptions).pipe(catchError(this.handleError<UserGroupDto[]>('getUserGroups')));
  }

  saveUser(user: UserModel): Observable<UserModel> {
    const httpOptions = this.createOptions('post');
    const url = `/api/master/User`;
    return this.postMasterEx<UserModel, UserModel>(url, httpOptions, user).pipe(catchError(this.handleError<UserModel>('saveUser')));
  }

  getCurrentUser(): Observable<User> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/User`;
    return this.getMasterEx<User>(url, httpOptions).pipe(catchError(this.handleError<any>(`getCurrentUser`)));
  }

  checkUserNameExist(userName: string): Observable<boolean> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/User/${userName}/isExist`;
    return this.getMasterEx<User>(url, httpOptions).pipe(catchError(this.handleError<any>(`checkUserNameExist`)));
  }

  getAllUserNames(): Observable<string[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/User/GetAllUserNames`;
    return this.getMasterEx<string[]>(url, httpOptions).pipe(catchError(this.handleError<any>(`getAllUserNames`)));
  }

  updateUser(user: UpdateUserRequest): Observable<UserModel> {
    const httpOptions = this.createOptions('put');
    const url = `/api/master/User`;
    return this.putMasterEx<UserModel, UpdateUserRequest>(url, httpOptions, user).pipe(catchError(this.handleError<UserModel>('updateUser')));
  }
  getRoles(): Observable<RoleModel[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/Roles/getRoles`;
    return this.getMasterEx<RoleModel[]>(url, httpOptions).pipe(catchError(this.handleError<any>(`getRoles`)));
  }

  deleteUser(user: UserModel): Observable<UserModel> {
    const httpOptions = this.createOptions('delete');
    const url = `/api/master/User/DeleteUserInfo`;
    return this.postMasterEx<UserModel, UserModel>(url, httpOptions, user).pipe(catchError(this.handleError<UserModel>('deleteUser')));
  }
}
