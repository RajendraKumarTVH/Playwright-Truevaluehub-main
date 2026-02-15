// import { Injectable } from '@angular/core';
// import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
// // import { Observable, throwError } from 'rxjs';
// // import { catchError } from 'rxjs/operators';
// import { Router } from '@angular/router';
// import { AuthenticationService } from 'src/app/shared/services/authentication.service';
// import { MsalService } from '@azure/msal-angular';
// import { ApiCacheService } from '../shared/services';
// import { AuthenticationHelperService } from '../shared/helpers/authentication-helper.service';

// @Injectable({ providedIn: 'root' })
// export class ErrorInterceptor implements HttpInterceptor {
//   constructor(
//     private authenticationService: AuthenticationService,
//     private msalService: MsalService,
//     private router: Router,
//     protected _apiCacheService: ApiCacheService,
//     private authenticationHelperService: AuthenticationHelperService
//   ) {}

//   // intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//   //   return next.handle(request).pipe(
//   //     catchError((err) => {
//   //       if (err.status === 401) {
//   //         // auto logout if 401 response returned from api
//   //         //this.authenticationService.logout();
//   //         this.msalService.logout();
//   //         // localStorage.removeItem('isLoggedIn');
//   //         // localStorage.removeItem('user');
//   //         // this._apiCacheService.removeCache('ALL');
//   //         this.authenticationHelperService.clearOnLogout();
//   //         console.log('Unauthorized request - logging out');
//   //         this.router.navigate(['/login']);
//   //         location.reload();
//   //       }

//   //       const error = err.error.message || err.statusText;
//   //       return throwError(error);
//   //     })
//   //   );
//   // }
// }
