// import { Injectable } from '@angular/core';
// import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
// import { Observable } from 'rxjs';

// import { AuthenticationService } from 'src/app/shared/services/authentication.service';
// import { UserInfo } from 'os';
// import { UserModel } from '../modules/settings/models/user.model';
// @Injectable({ providedIn: 'root' })
// export class JwtInterceptor implements HttpInterceptor {
//   constructor(private authenticationService: AuthenticationService) { }

//   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     // add authorization header with jwt token if available
//     const currentUser = this.authenticationService.currentUserValue;
//     const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}') as UserModel
//     if (currentUser && currentUser.token) {
//       request = request.clone({
//         setHeaders: {
//           Authorization: `Bearer ${currentUser.token}`,
//         },
//       });
//     }
//     debugger;
//     if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
//       // Skip setting content-type if the app already explicitly set a specific content-type
//       const currentContentTypeHeader = request.headers.get('Content-Type');
//       if (currentContentTypeHeader === null || currentContentTypeHeader !== 'multipart/form-data') {
//         request = request.clone({
//           headers: request.headers.set('Content-Type', 'application/json'),
//         });
//       }
//     }
//     request.headers.append('extension_Tenant', loggedInUser.client.clientKey || '');
//     request.headers.append('extension_UserId', loggedInUser.userId.toString() || '');
//     return next.handle(request);
//   }
// }
