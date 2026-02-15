import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidenavToggleService {
  private isMenuOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public isMenuOpenSub$ = this.isMenuOpen$.asObservable();

  public setSideNavToggle(toggle: boolean) {
    this.isMenuOpen$.next(toggle);
  }
}
