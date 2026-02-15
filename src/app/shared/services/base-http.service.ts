import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, timer, EMPTY } from 'rxjs';
import { map, switchMap, catchError, tap, retryWhen, scan, delayWhen } from 'rxjs/operators';
import { GenericHttpError } from '../../shared/models/generic-http-error.model';
import { BaseConfiguration } from './app-configuration';
import { AppConfigurationService } from './app-configuration.service';
import { BaseDto } from '../../shared/models/base-dto';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { BlockUiService } from './block-ui.service';
import { MsalService } from '@azure/msal-angular';
import { ApiCacheService } from './api-cache.service';
import { EventSourcePolyfill } from 'event-source-polyfill';

export abstract class BaseHttpService {
  private config$: Observable<BaseConfiguration>;
  router: any;
  protected msalService: MsalService;

  protected constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    this.config$ = this.appConfigurationService.getConfiguration();
  }

  protected createOptions(method: string, httpParams?: HttpParams) {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const httpHeaders = new HttpHeaders({
      'Content-type': 'application/json',
      'x-extension-Tenant': loggedInUser?.client?.clientKey || '',
      'x-extension-UserId': loggedInUser?.userId?.toString() || '',
    });
    // SonarQube recommends not setting 'Access-Control-Allow-Origin' in client-side code
    // This header should be set on the server-side configuration
    // httpHeaders.append('Access-Control-Allow-Origin', '*');
    const options = httpParams
      ? {
          headers: httpHeaders,
          method,
          params: httpParams,
        }
      : {
          headers: httpHeaders,
          method,
        };
    return options;
  }

  protected createOptionsWithHeader(method: string) {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const httpHeaders = new HttpHeaders({
      'Content-type': 'application/json',
      'x-extension-Tenant': loggedInUser?.client?.clientKey || '',
      'x-extension-UserId': loggedInUser?.userId?.toString() || '',
    });
    const options = {
      headers: httpHeaders,
      method,
      observe: 'response',
    };
    return options;
  }
  protected createOptionsForFormFile(method: string) {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const httpHeaders = new HttpHeaders({
      Accept: '*/*',
      'x-extension-Tenant': loggedInUser?.client?.clientKey || '',
      'x-extension-UserId': loggedInUser?.userId?.toString() || '',
    });
    const options = {
      headers: httpHeaders,
      method,
      observe: 'response',
    };
    return options;
  }

  protected createOptionsWithNoCache(method: string) {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const httpHeaders = new HttpHeaders({
      Accept: '*/*',
      'x-extension-Tenant': loggedInUser?.client?.clientKey || '',
      'x-extension-UserId': loggedInUser?.userId?.toString() || '',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
    const options = {
      headers: httpHeaders,
      method,
      observe: 'response',
    };
    return options;
  }

  // protected get<T>(relativeUrl: string): Observable<T> {
  //   const url$: Observable<string> = this.getUrl(relativeUrl);
  //   return url$.pipe(
  //     switchMap((url: string) => this.http.get<BaseDto<T>>(url)),
  //     // this.retryWithDelay(relativeUrl),
  //     map(this.toBaseDto),
  //     map(this.extractResult)
  //   );
  // }

  protected getEx<T>(relativeUrl: string, httpOptions: any): Observable<T> {
    const url$: Observable<string> = this.getUrl(relativeUrl);
    const result = this._apiCacheService.getCache(relativeUrl, 0, 'get');
    const returns$ = result instanceof Observable ? result : of(result);
    return returns$.pipe(
      switchMap((returnValue) => {
        return !returnValue
          ? url$.pipe(
              switchMap((url: string) => this.http.get<BaseDto<T>>(url, httpOptions))
              // this.retryWithDelay(relativeUrl)
            )
          : of(returnValue);
      }),
      tap((res) => this._apiCacheService.setCache(relativeUrl, res, 'get')),
      map(this.toBaseDto),
      map(this.extractResult)
    );
  }
  protected getMasterEtagEx<T>(relativeUrl: string, httpOptions: any): Observable<T> {
    const url$: Observable<string> = this.getMasterUrl(relativeUrl);
    const result = this._apiCacheService.getCache(relativeUrl, 0, 'get');
    const returns$ = result instanceof Observable ? result : of(result);
    return returns$.pipe(
      switchMap((returnValue) => {
        return !returnValue ? url$.pipe(switchMap((url: string) => this.http.get<BaseDto<T>>(url, httpOptions))) : of(returnValue);
      }),
      map(this.toBaseDto),
      map(this.extractResult)
    );
  }
  protected getMaster<T>(relativeUrl: string): Observable<T> {
    const url$: Observable<string> = this.getMasterUrl(relativeUrl);
    return url$.pipe(
      switchMap((url: string) => this.http.get<BaseDto<T>>(url)),
      // this.retryWithDelay(relativeUrl),
      map(this.toBaseDto),
      map(this.extractResult)
    );
  }

  protected getPlainMaster(relativeUrl: string) {
    const url$: Observable<string> = this.getMasterUrl(relativeUrl);
    return url$.pipe(switchMap((url: string) => this.http.get(url)));
  }

  protected getMasterEx<T>(relativeUrl: string, httpOptions: any): Observable<T> {
    const url$: Observable<string> = this.getMasterUrl(relativeUrl);
    const result = this._apiCacheService.getCache(relativeUrl, 0, 'get');
    const returns$ = result instanceof Observable ? result : of(result);
    return returns$.pipe(
      switchMap((returnValue) => {
        return !returnValue
          ? url$.pipe(
              switchMap((url: string) => this.http.get<BaseDto<T>>(url, httpOptions))
              // this.retryWithDelay(relativeUrl)
            )
          : of(returnValue);
      }),
      tap((res) => this._apiCacheService.setCache(relativeUrl, res, 'get')),
      map(this.toBaseDto),
      map(this.extractResult)
    );
  }

  protected post<T>(relativeUrl: string, body: any): Observable<T> {
    const url$: Observable<string> = this.getUrl(relativeUrl);
    return url$.pipe(
      catchError((error) => {
        console.log(error);
        throw error;
      }),
      switchMap((url: string) => this.http.post<BaseDto<T>>(url, body)),
      // this.retryWithDelay(relativeUrl),
      map(this.extractResult)
    );
  }

  protected postEx<T, S>(relativeUrl: string, httpOptions: any, body?: S): Observable<T> {
    const url$: Observable<string> = this.getUrl(relativeUrl);
    return url$.pipe(
      switchMap((url: string) => {
        if (body) {
          return this.http.post<BaseDto<T>>(url, body, httpOptions);
        } else {
          return this.http.post<BaseDto<T>>(url, httpOptions);
        }
      }),
      // this.retryWithDelay(relativeUrl),
      map(this.toBaseDto),
      map(this.extractResult)
    );
  }

  protected postMasterEx<T, S>(relativeUrl: string, httpOptions: any, body?: S): Observable<T> {
    const url$: Observable<string> = this.getMasterUrl(relativeUrl);
    const result = this._apiCacheService.getCache(relativeUrl, 0, 'post');
    const returns$ = result instanceof Observable ? result : of(result);
    return returns$.pipe(
      switchMap((returnValue) => {
        return !returnValue
          ? url$.pipe(
              switchMap((url: string) => (body ? this.http.post<BaseDto<T>>(url, body, httpOptions) : this.http.post<BaseDto<T>>(url, httpOptions)))
              // this.retryWithDelay(relativeUrl)
            )
          : of(returnValue);
      }),
      tap((res) => this._apiCacheService.setCache(relativeUrl, res, 'post')),
      map(this.toBaseDto),
      map(this.extractResult)
    );
  }

  protected putMasterEx<T, S>(relativeUrl: string, httpOptions: any, body: S): Observable<T> {
    const url$: Observable<string> = this.getMasterUrl(relativeUrl);
    return url$.pipe(
      switchMap((url: string) => this.http.put<BaseDto<T>>(url, body, httpOptions)),
      // this.retryWithDelay(relativeUrl),
      map(this.toBaseDto),
      map(this.extractResult)
    );
  }

  protected getStreamEx<T>(relativeUrl: string, httpOptions: any): Observable<T> {
    const url$: Observable<string> = this.getUrl(relativeUrl);
    const cachedResult = this._apiCacheService.getCache(relativeUrl, 0, 'get');
    const cached$ = cachedResult instanceof Observable ? cachedResult : of(cachedResult);

    return cached$.pipe(
      switchMap((cachedValue) => {
        if (cachedValue) return of(cachedValue);

        return url$.pipe(
          switchMap((url: string) => {
            return new Observable<T>((observer) => {
              const headers: Record<string, string> = {};
              if (httpOptions?.headers) {
                httpOptions.headers.keys().forEach((key) => {
                  headers[key] = httpOptions.headers.get(key)!;
                });
              }

              const es = new EventSourcePolyfill(url, { headers });

              es.onmessage = (event) => {
                try {
                  const data = JSON.parse(event.data) as T;
                  observer.next(data);
                } catch (err) {
                  console.error('SSE JSON parse error:', err);
                }
              };

              es.onerror = (err) => {
                console.error('SSE error:', err);
                es.close();
                observer.error(err);
              };

              es.addEventListener('end', () => {
                es.close();
                observer.complete();
              });

              return () => es.close();
            });
          })
        );
      }),
      tap((res) => this._apiCacheService.setCache(relativeUrl, res, 'get')),
      map(this.toBaseDto),
      map(this.extractResult)
    );
  }

  protected put<T>(relativeUrl: string, httpOptions: any): Observable<T> {
    const url$: Observable<string> = this.getUrl(relativeUrl);
    return url$.pipe(
      catchError((error) => {
        console.log(error);
        throw error;
      }),
      switchMap((url: string) => this.http.put<BaseDto<T>>(url, '', httpOptions)),
      // this.retryWithDelay(relativeUrl),
      map(this.toBaseDto),
      map(this.extractResult)
    );
  }

  protected putEx<T, S>(relativeUrl: string, httpOptions: any, body: S): Observable<T> {
    const url$: Observable<string> = this.getUrl(relativeUrl);
    return url$.pipe(
      switchMap((url: string) => this.http.put<BaseDto<T>>(url, body, httpOptions)),
      // this.retryWithDelay(relativeUrl),
      map(this.toBaseDto),
      map(this.extractResult)
    );
  }

  protected deleteEx<T>(relativeUrl: string, httpOptions: any): Observable<T> {
    const url$: Observable<string> = this.getUrl(relativeUrl);
    return url$.pipe(
      tap(() => this._apiCacheService.removeCache('ALL')),
      switchMap((url: string) => this.http.delete<BaseDto<T>>(url, httpOptions)),
      // this.retryWithDelay(relativeUrl),
      map(this.toBaseDto),
      map(this.extractResult)
    );
  }

  // protected deleteById<T>(relativeUrl: string): Observable<T> {
  //   const url$: Observable<string> = this.getUrl(relativeUrl);
  //   return url$.pipe(
  //     switchMap((url: string) => this.http.delete<BaseDto<T>>(url)),
  //     // this.retryWithDelay(relativeUrl),
  //     map((response) => {
  //       return response.result;
  //     })
  //   );
  // }

  protected getUrl(relativeUrl: string): Observable<string> {
    return this.config$.pipe(
      map((config: BaseConfiguration) => {
        return config.getAbsoluteApiUrl(relativeUrl);
      })
    );
  }

  protected getMasterUrl(relativeUrl: string): Observable<string> {
    return this.config$.pipe(
      map((config: BaseConfiguration) => {
        return config.getAbsoluteMasterApiUrl(relativeUrl);
      })
    );
  }

  protected getMasterBaseUrl(): Observable<string> {
    return this.config$.pipe(
      map((config: BaseConfiguration) => {
        return config.getMasterApiBaseUrl();
      })
    );
  }

  // takes in response of type any or BaseDto<T> or HttpResponse<BaseDto<T>>
  // force response to type BaseDto<T>
  private toBaseDto(dto: any): BaseDto<any> {
    let baseDto: BaseDto<any>;

    if (dto.result === undefined && dto.body === undefined && dto !== undefined) {
      baseDto = { result: dto };
      return baseDto;
    } else if (dto.body) {
      baseDto = { result: dto.body.result };
      return baseDto;
    }
    return dto;
  }

  private extractResult<T>(baseDto: BaseDto<T>): T {
    return baseDto.result;
  }

  protected handleError<T>(operation = 'operation') {
    return (error: GenericHttpError): Observable<T> => {
      this._blockUIService.popBlockUI(operation);
      if (error.statusCode === 401) {
        this._blockUIService._authenticationHelperService.clearOnLogout();
        this.msalService.logoutRedirect();
        return EMPTY;
        // this.msalService.logout();
        // localStorage.removeItem('isLoggedIn');
        // localStorage.removeItem('user');
        // this._apiCacheService.removeCache('ALL');
        // this.router.navigate(['/login']);
        // location.reload();
      }
      if (error.statusCode !== 404) {
        this._snackBarErrorHandlerService.handleError(error);
      }
      // return of(result as T);
      return throwError(() => error);
    };
  }

  /** Retry Logic */
  private retryWithDelay<T>(relativeUrl, maxRetries: number = 3, delayMs: number = 3000) {
    return (source: Observable<T>) => {
      return source.pipe(
        retryWhen((errors) =>
          errors.pipe(
            scan((retryCount, error) => {
              retryCount++;
              if (retryCount >= maxRetries) {
                throw error;
              }
              console.log(relativeUrl, error, 'retrying', retryCount);
              return retryCount;
            }, 0),
            delayWhen(() => timer(delayMs))
          )
        ),
        catchError((error) => {
          console.log('Max retries reached for', relativeUrl);
          return throwError(error);
        })
      );
    };
  }
}
