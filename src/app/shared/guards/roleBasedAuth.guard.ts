import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserInfoService } from '../services/user-info-service';
import { UserRoleEnum } from 'src/app/modules/settings/models';

export const RoleBasedAuthGuard = (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
  const router = inject(Router);
  const userInfoService = inject(UserInfoService);

  const user = userInfoService.getUserValue?.() ?? JSON.parse(localStorage.getItem('user') || '{}');
  if (user?.roleId === UserRoleEnum.Supplier) {
    router.navigate(['/digitalFactory']);
    return false;
  }
  return true;
};
