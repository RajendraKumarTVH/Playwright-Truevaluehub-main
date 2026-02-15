import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Observable, Subject, timer } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { ApiCacheService } from './api-cache.service';
import { AuthenticationHelperService } from '../helpers/authentication-helper.service';

@Injectable({
  providedIn: 'root',
})
export class IdleTimeoutService {
  private readonly logoutTimer: Observable<number>;
  private readonly confirmLogoutTimer: Observable<number>;
  private readonly stopTimerSubject = new Subject<void>();
  private popupOpen = false;

  constructor(
    private authService: MsalService,
    private messaging: MessagingService,
    protected _apiCacheService: ApiCacheService,
    private authenticationHelperService: AuthenticationHelperService
  ) {
    const timeout = Number(localStorage.getItem('idleTimeout') || 60);
    this.logoutTimer = timer(timeout * 60 * 1000); // 60 mins
    this.confirmLogoutTimer = timer((timeout - 1) * 60 * 1000); // 59 mins
    // console.log(`Idle timeout set to ${timeout} minutes`);

    // this.logoutTimer = timer(10 * 60 * 1000); // 10 mins
    // this.confirmLogoutTimer = timer(9 * 60 * 1000); // 9 mins

    // this.logoutTimer = timer(65 * 1000); // 65 secs
    // this.confirmLogoutTimer = timer(5 * 1000); // 5 secs
  }

  startTimer(): void {
    this.logoutTimer.pipe(takeUntil(this.stopTimerSubject)).subscribe(() => {
      this.logout();
    });
    this.confirmLogoutTimer.pipe(takeUntil(this.stopTimerSubject)).subscribe(() => {
      if (!this.popupOpen) {
        this.popupOpen = true;
        this.confirmLogout();
      }
    });
  }

  resetTimer(): void {
    if (!this.popupOpen) {
      this.stopTimerSubject.next();
      this.startTimer();
    }
  }

  stopTimer(): void {
    this.stopTimerSubject.next();
  }

  confirmLogout(): void {
    this.messaging
      .openConfirmationDialogTimeOut(<ConfirmationDialogConfig>{
        data: {
          title: 'Confirm Logout',
          action: 'LOGOUT',
        },
        disableClose: true,
      })
      .afterClosed()
      .pipe(first())
      .subscribe((confirmed: boolean) => {
        this.popupOpen = false;
        if (confirmed) {
          this.resetTimer();
        } else {
          this.logout();
        }
      });
  }

  logout(): void {
    console.log('User logged out due to inactivity');
    this.stopTimer();
    this.authService.logout();
    // localStorage.removeItem('isLoggedIn');
    // localStorage.removeItem('user');
    // localStorage.removeItem('@@STATE');
    // this._apiCacheService.removeCache('ALL');
    this.authenticationHelperService.clearOnLogout();
  }
}
