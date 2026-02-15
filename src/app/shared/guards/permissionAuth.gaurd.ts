import { Injectable } from '@angular/core';
import { CanMatch, Route, UrlSegment } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionAuthGuard implements CanMatch {
  // public activeUser: boolean = false;
  constructor(private permissionService: PermissionService) {}

  canMatch(route: Route, _segments: UrlSegment[]): Observable<boolean> {
    let path = route.path;
    path = path.charAt(0).toUpperCase() + path.slice(1);
    return this.permissionService.hasValidPermission(path);
  }
}
