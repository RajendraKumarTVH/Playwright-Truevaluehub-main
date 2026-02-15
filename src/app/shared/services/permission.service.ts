import { inject, Injectable } from '@angular/core';
import { UserInfoService } from './user-info-service';
import { UserModel, PermissionModel } from 'src/app/modules/settings/models/user.model';
import { SecurityPermissionType } from '../enums/security-permission-type.enum';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private user: UserModel | undefined;
  private permissionsMap = new Map<number, boolean>();
  private readonly fullAccessRoles = ['admin', 'superadmin'];
  private userInfoService = inject(UserInfoService);
  private isUserFoundInLocalStorage: boolean = false;
  private permissionsMapUpdateSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor() {
    const user = localStorage.getItem('user');
    if (!user) {
      this.userInfoService.getUserValue().subscribe((user) => {
        if (user && !this.isUserFoundInLocalStorage) {
          this.initializePermissions();
        }
      });
    } else {
      this.initializePermissions();
    }
  }

  isPermissionsMapUpdated() {
    return this.permissionsMapUpdateSubject.asObservable();
  }

  private initializePermissions(): void {
    const userJson = localStorage.getItem('user');
    if (!userJson) return;
    this.isUserFoundInLocalStorage = true;
    this.user = JSON.parse(userJson);
    const roleName = this.user.role?.roleName?.toLowerCase();

    if (this.isFullAccessRole(roleName)) {
      this.grantAllPermissions();
    } else if (this.user.role?.rolePermissions) {
      this.setPermissions(this.user.role.rolePermissions);
    }
    this.permissionsMapUpdateSubject.next(true);
  }

  private isFullAccessRole(roleName: string | undefined): boolean {
    return !!roleName && this.fullAccessRoles.includes(roleName);
  }

  private grantAllPermissions(): void {
    Object.values(SecurityPermissionType).forEach((permission) => {
      if (typeof permission === 'number') {
        this.permissionsMap.set(permission, true);
      }
    });
  }

  private setPermissions(permissions: PermissionModel[]): void {
    permissions.forEach((permission) => {
      this.permissionsMap.set(permission.permissionId, true);
    });
  }

  public hasPermission(permissionType: SecurityPermissionType | SecurityPermissionType[]): boolean {
    const permissionTypes = ([] as SecurityPermissionType[]).concat(permissionType);
    return permissionTypes.some((type) => this.permissionsMap.has(type));
  }
}
