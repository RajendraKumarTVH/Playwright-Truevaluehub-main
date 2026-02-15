import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

export const AuthGuard: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => boolean = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authenticationService = inject(AuthenticationService);

  const currentUser = authenticationService.currentUserValue;
  if (currentUser && Object.keys(currentUser).length > 0) {
    return true;
  }

  // not logged in so redirect to login page with the return url

  if (state.url.indexOf('logout') <= -1) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  }
  router.navigate(['/login']);

  return false;
};
