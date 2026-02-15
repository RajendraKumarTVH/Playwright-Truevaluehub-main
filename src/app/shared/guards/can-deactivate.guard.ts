import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

export const CanDeactivateGuard = (
  component: CanComponentDeactivate,
  _currentRoute: ActivatedRouteSnapshot,
  _currentState: RouterStateSnapshot,
  _nextState?: RouterStateSnapshot
): Observable<boolean> | Promise<boolean> | boolean => {
  return component.canDeactivate ? component.canDeactivate() : true;
};
