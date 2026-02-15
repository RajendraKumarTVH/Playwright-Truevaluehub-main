import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { ApiCacheService } from 'src/app/shared/services';

@Component({
  selector: 'app-logout-page',
  templateUrl: './logout-page.component.html',
  styleUrls: ['./logout-page.component.scss'],
  standalone: true,
})
export class LogoutPageComponent implements OnInit {
  ngOnInit() {
    //this.authenticationService.logout();
    this.msalService.logout();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    this._apiCacheService.removeCache('ALL');
    this.router.navigate(['/login']);
    location.reload();
  }
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private msalService: MsalService,
    protected _apiCacheService: ApiCacheService
  ) {}
}
