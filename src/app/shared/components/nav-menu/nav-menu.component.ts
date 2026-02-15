import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SidenavHomeIcons, SidenavHomeValues } from '../../constants';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';

import { ApiCacheService, AuthenticationService, SidenavToggleService } from '../../services';
// import { environment } from 'src/environments/environment';
import { UserModel, UserRoleEnum } from './../../../modules/settings/models/user.model';
import { UserInfoService } from '../../services/user-info-service';
// import { PowerBIConfig } from './../../models/power-bi-config';
import { CommonModule } from '@angular/common';
// import { SharedModule } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthenticationHelperService } from '../../helpers/authentication-helper.service';
// Uncomment below code for notification sidebar
// import { NotificationSidebarComponent } from '../notification-sidebar/notification-sidebar.component';

// type ProfileType = {
//   givenName?: string;
//   surname?: string;
//   userPrincipalName?: string;
//   id?: string;
// };
@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule, MatMenuTrigger, MatToolbarModule, MatMenuModule, MatTooltipModule], // NotificationSidebarComponent
})
export class NavMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('search') nameInput: ElementRef;
  loginDisplay = false;
  isMenuOpen = true;
  collapse = 56;
  expand = 125;
  contentMargin = this.expand;
  title = 'True ValueHub';
  home = '/home';
  sidenavHomeValues = SidenavHomeValues;
  sidenavHomeIcons = SidenavHomeIcons;
  public navLinks: any[];
  private activeLinkIndex = -1;
  private currentUserSubject: BehaviorSubject<UserModel>;
  public currentUser: Observable<UserModel>;
  firstName: string;
  lastName: string;
  logoUrl: string;
  @ViewChild('search') searchControl: ElementRef;
  private unSubscribeAll$: Subject<undefined> = new Subject<undefined>();
  imageContent?: any;
  isSupplierRole: boolean = false;
  isUserIsLoaded: boolean = false;

  public flag: boolean;
  isNotificationSidebarVisible = false;
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private authService: MsalService,
    private readonly sidenavToggleService: SidenavToggleService,
    private http: HttpClient,
    private msalBroadcastService: MsalBroadcastService,
    private userService: UserInfoService,
    private cdr: ChangeDetectorRef,
    protected _apiCacheService: ApiCacheService,
    private authenticationHelperService: AuthenticationHelperService
  ) {
    this.navLinks = [
      {
        link: '/home',
        label: 'Overview',
        icon: 'pageview',
        index: 0,
      },
      {
        link: '/project',
        label: 'Projects',
        icon: 'create',
        index: 1,
      },
      {
        link: '/projects',
        label: 'Create',
        icon: 'create',
        index: 2,
      },
    ];
    // this.currentUserSubject = new BehaviorSubject<UserModel>(
    //   JSON.parse(localStorage.getItem('currentUser') || '{}')
    // );
    // this.currentUser = this.currentUserSubject.asObservable();
  }

  ngOnInit(): void {
    //this.userService.getCurrentUser();
    // this.userService.getLocationInfo();
    this.router.events.subscribe(() => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find((tab) => tab.link === this.router.url));
    });
    this.userService.getUserValue().subscribe((user) => {
      if (user) {
        this.firstName = user?.firstName;
        this.lastName = user?.lastName;
        this.imageContent = user?.imageContent;
        if (user?.client.logoRelativePath) {
          this.logoUrl = user?.client.logoRelativePath;
        }
        if (user?.roleId === UserRoleEnum.Supplier) {
          this.isSupplierRole = true;
        }
        this.isUserIsLoaded = true;
      }
      // else {
      //   this.userService.getCurrentUser();
      //   this.userService.getUserValue().subscribe((newUserInfo) => {
      //     if (newUserInfo) {
      //       this.firstName = newUserInfo?.firstName;
      //       this.lastName = newUserInfo?.lastName;
      //     }
      //   });
      // }
    });
  }

  onKeydown(event: any, value: string) {
    if (event.key === 'Enter') {
      this.onSearch(value);
    }
  }

  ngAfterViewInit() {
    this.route.queryParamMap.pipe(takeUntil(this.unSubscribeAll$)).subscribe((x) => {
      const text = x?.get('searchText');
      if (this.searchControl?.nativeElement) {
        this.searchControl.nativeElement.value = text ?? '';
      }
    });
  }
  public get currentUserValue(): UserModel {
    return this.currentUserSubject.value;
  }

  public onSearch(value: string) {
    const val = (value || '').trim();

    if (!val || val.length < 3) {
      alert('Enter atleast 3 characters.');
      return;
    }

    if (val) {
      this.router.navigate(['home', 'projects', 'active'], {
        queryParams: { searchText: val },
      });
    } else {
      this.router.navigate(['home', 'projects', 'active']);
    }
  }
  // getProfile(url: string) {
  //   this.http.get(url).subscribe((profile) => {
  //     this.currentUser = profile;
  //   });
  // }
  // clickMenu() {
  //   this.sidenavToggleService.setSideNavToggle(this.isMenuOpen);
  //   this.contentMargin = !this.isMenuOpen ? this.collapse : this.expand;
  // }

  onHomeClick() {
    this.router.navigate([this.home]);
  }

  logout() {
    this.authService.logout();
    // localStorage.removeItem('isLoggedIn');
    // localStorage.removeItem('user');
    // localStorage.removeItem('@@STATE');
    // this._apiCacheService.removeCache('ALL');
    this.authenticationHelperService.clearOnLogout();
  }

  sendMail() {
    window.open('mailto:support@truevaluehub.com', '_self');
  }

  ngOnDestroy() {
    this.unSubscribeAll$.next(undefined);
    this.unSubscribeAll$.complete();
  }
}
