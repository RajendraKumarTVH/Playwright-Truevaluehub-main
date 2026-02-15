import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from 'src/app/shared/models/user.model';
import { BaseHttpService } from './base-http.service';
import { AppConfigurationService } from './app-configuration.service';
import { sharedEndpoints } from '../shared.endpoints';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { BlockUiService } from './block-ui.service';
import { ApiCacheService } from './api-cache.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService extends BaseHttpService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string) {
    const httpOptions = this.createOptions('post');
    const url = sharedEndpoints.login('/api');
    return this.postEx<User, any>(url, httpOptions, { username, password }).pipe(
      map((user) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(this.handleError<boolean>('login'))
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
  }
}
