import { Component, OnInit, OnDestroy, Inject, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, PopupRequest, RedirectRequest, EventMessage, EventType, InteractionType, AccountInfo, SsoSilentRequest } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { IdTokenClaims, PromptValue } from '@azure/msal-common';
import { UserInfoService } from './shared/services/user-info-service';
import { Store } from '@ngxs/store';
import * as MasterDataActions from 'src/app/modules/_actions/master-data.action';
import * as SecondaryProcessInfoActions from 'src/app/modules/_actions/secondary-process.action';
import * as OverHeadProfitActions from 'src/app/modules/_actions/overhead-profit.action';
import * as UserActions from 'src/app/modules/_actions/user.action';
import { ApiCacheService, IdleTimeoutService } from './shared/services';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavMenuComponent } from './shared/components';
import { NavLeftMenuComponent } from './shared/components/nav-left-menu/nav-left-menu.component';
import { BlockUIModule } from 'ng-block-ui';
import { GoogleMapsLoaderService } from './shared/services/google-maps-loader.service';
import { UserModel } from './modules/settings/models/user.model';
import { SignalrDfService } from './shared/services/signalr-df.service';
import { AuthenticationHelperService } from './shared/helpers/authentication-helper.service';
import { ZohoDeskService } from './shared/services/zoho-desk-service';
import { HighchartsLoaderService } from './modules/costing/services/highcharts-loader.service';

type IdTokenClaimsWithPolicyId = IdTokenClaims & {
  acr?: string;
  tfp?: string;
};
// Extend the Window interface to include zohoDeskAsapReady
declare global {
  interface Window {
    ZohoDeskAsapReady?: (callback: () => void) => void;
    ZohoDeskAsap?: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavMenuComponent, NavLeftMenuComponent, RouterModule, BlockUIModule],
})
export class AppComponent implements OnInit, OnDestroy {
  loginDisplay = false;
  isIframe = false;
  private readonly _destroying$ = new Subject<void>();
  dispatchMasterDataCalled = false;
  signalrDfService = inject(SignalrDfService);
  private loader = inject(HighchartsLoaderService);
  //currentUser: User;
  constructor(
    private router: Router,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private userService: UserInfoService,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private _store: Store,
    private idleTimeoutService: IdleTimeoutService,
    protected _apiCacheService: ApiCacheService,
    private googleMapsLoader: GoogleMapsLoaderService,
    private authenticationHelperService: AuthenticationHelperService,
    private zohoDeskService: ZohoDeskService
  ) {
    this.authService.instance
      .handleRedirectPromise()
      .then((result) => {
        if (result?.account) {
          this.authService.instance.setActiveAccount(result.account);
        }

        const accounts = this.authService.instance.getAllAccounts();
        if (accounts.length > 0) {
          this.authService.instance.setActiveAccount(accounts[0]);
        } else {
          this.router.navigate(['/login-failed']);
        }
      })
      .catch((err) => {
        console.error('MSAL redirect error:', err);
        this.router.navigate(['/login-failed']);
      });
    this.matIconRegistry
      .addSvgIcon('icon_home', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/homeoutline-icon.svg'))
      .addSvgIcon('dfx_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/dfx-icon.svg'))
      .addSvgIcon('costing_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/costing-icon.svg'))
      .addSvgIcon('analytics_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/analytics-icon.svg'))
      .addSvgIcon('collabrate_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/collabrate-icon.svg'))
      .addSvgIcon('report_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/report-icon.svg'))
      .addSvgIcon('database_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/database-icon.svg'))
      .addSvgIcon('archive_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/archive-icon.svg'))
      .addSvgIcon('setting_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/setting-icon.svg'))
      .addSvgIcon('overview_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/overview-icon.svg'))
      .addSvgIcon('create_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/create-icon.svg'))
      .addSvgIcon('plus_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/plus-icon.svg'))
      .addSvgIcon('folder_opened_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/folder-opened-icon.svg'))
      .addSvgIcon('folder_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/folder-icon.svg'))
      .addSvgIcon('rename_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/rename-icon.svg'))
      .addSvgIcon('add_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/add-icon.svg'))
      .addSvgIcon('remove_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/remove-icon.svg'))
      .addSvgIcon('digital_factory_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/digital-factory.svg'))
      .addSvgIcon('upload_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/upload-icon.svg'))
      .addSvgIcon('aisearch_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/ai_search-icon.svg'))
      .addSvgIcon('notebook_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/notebook-icon.svg'))

      .addSvgIcon('circuitry_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/circuitry-icon.svg'))

      .addSvgIcon('cranetower_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/cranetower-icon.svg'))

      .addSvgIcon('currencycircledollar_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/currencycircledollar-icon.svg'))

      .addSvgIcon('filetext_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/filetext-icon.svg'))
      .addSvgIcon('info_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/info-icon.svg'))
      .addSvgIcon('leaf_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/leaf-icon.svg'))
      .addSvgIcon('notepad_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/notepad-icon.svg'))
      .addSvgIcon('package_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/package-icon.svg'))
      .addSvgIcon('toolbox_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/toolbox-icon.svg'))
      .addSvgIcon('warehouse_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/warehouse-icon.svg'))
      .addSvgIcon('moneywavy_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/moneywavy-icon.svg'))
      .addSvgIcon('downArrow_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/down-arrow-icon.svg'))
      .addSvgIcon('upload_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/upload-icon.svg'))
      .addSvgIcon('trash_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/trash-icon.svg'))
      .addSvgIcon('arrowReturnLeft_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/arrow-return-left-icon.svg'))
      .addSvgIcon('fileDollar_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/file-dollar-icon.svg'))
      .addSvgIcon('cube_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/cube-icon.svg'))
      .addSvgIcon('costing_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/costing_icon.svg'))
      .addSvgIcon('negotiation_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/negotiation_icon.svg'))
      .addSvgIcon('completed_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/completed_icon.svg'))
      .addSvgIcon('archive_blue_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/archive_blue_icon.svg'))
      .addSvgIcon('base_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/base-icon.svg'))
      .addSvgIcon('chart_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/chart-icon.svg'))
      .addSvgIcon('project_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/project-icon.svg'))
      .addSvgIcon('creation_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/creation-icon.svg'))
      .addSvgIcon('cost_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/cost-icon.svg'))
      .addSvgIcon('search-ai_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/search-ai-icon.svg'))
      .addSvgIcon('analytic_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/analytic-icon.svg'))
      .addSvgIcon('file_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/file-icon.svg'))
      .addSvgIcon('collab_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/collab-icon.svg'))
      .addSvgIcon('db_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/db-icon.svg'))
      .addSvgIcon('dig-factory_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/dig-factory.svg'))
      .addSvgIcon('arch_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/arch-icon.svg'))
      .addSvgIcon('settings_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/settings-icon.svg'))
      .addSvgIcon('collapse_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/collapse-icon.svg'))
      .addSvgIcon('search_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/search-icon.svg'))
      .addSvgIcon('uploadit_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/uploadit-icon.svg'))
      .addSvgIcon('sort_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sort-icon.svg'))
      .addSvgIcon('ellipses_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/ellipses-icon.svg'))
      .addSvgIcon('close_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/close-icon.svg'))
      .addSvgIcon('help_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/help-icon.svg'))
      .addSvgIcon('bell_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/bell-icon.svg'))
      .addSvgIcon('chevron-up_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/chevron-up-icon.svg'))
      .addSvgIcon('compare_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/compare-icon.svg'))
      .addSvgIcon('delete_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/delete-icon.svg'))
      .addSvgIcon('editpen_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/editpen-icon.svg'))
      .addSvgIcon('scenario_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/scenario-icon.svg'))
      .addSvgIcon('total_count', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/supplier-icon.svg'))
      .addSvgIcon('active_count', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/supplier-icon-active.svg'))
      .addSvgIcon('category', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/categories.svg'))
      .addSvgIcon('filter', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/filter-icon.svg'))
      .addSvgIcon('trash', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/trash.svg'))
      .addSvgIcon('left-collapse', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/left-collapse-icon.svg'))
      .addSvgIcon('expand', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/expand-icon.svg'))
      .addSvgIcon('comparision', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/comparision-icon.svg'))
      .addSvgIcon('message', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/message-icon.svg'))
      .addSvgIcon('graph', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/graph-icon.svg'))
      .addSvgIcon('number', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/number-icon.svg'))
      .addSvgIcon('move', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/move-icon.svg'))
      .addSvgIcon('circle_plus', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/circle-plus-icon.svg'))
      .addSvgIcon('information', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/information-icon.svg'))
      .addSvgIcon('percent', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/percent-icon.svg'))
      .addSvgIcon('barcode', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/barcode-icon.svg'))
      .addSvgIcon('play-filled-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/play-filled.svg'))
      .addSvgIcon('dropdown-down-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/dropdown-down-icon.svg'))
      .addSvgIcon('dropdown-up-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/dropdown-up-icon.svg'))
      .addSvgIcon('copy-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/copy-icon.svg'))
      .addSvgIcon('grid-sort-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/grid-sort-icon.svg'))
      .addSvgIcon('plus-add-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/plus-add-icon.svg'))
      .addSvgIcon('find-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/find-icon.svg'))
      .addSvgIcon('window-collapse-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/window-collapse-icon.svg'))
      .addSvgIcon('moved-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/moved-icon.svg'))
      .addSvgIcon('expand-step-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/expand-step-icon.svg'))
      .addSvgIcon('collapse-step-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/collapse-step-icon.svg'))
      .addSvgIcon('undo-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/undo-icon.svg'))
      .addSvgIcon('redo-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/redo-icon.svg'))
      .addSvgIcon('renewable-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/renewable-icon.svg'))
      .addSvgIcon('nonrenew-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/nonrenew-icon.svg'))
      .addSvgIcon('geothermal-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/geothermal-icon.svg'))
      .addSvgIcon('nuclear-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/nuclear-icon.svg'))
      .addSvgIcon('nat-gas-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/nat-gas-icon.svg'))
      .addSvgIcon('wind-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/wind-icon.svg'))
      .addSvgIcon('coal-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/coal-icon.svg'))
      .addSvgIcon('check-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/check-icon.svg'))
      .addSvgIcon('drag-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/drag-icon.svg'))
      .addSvgIcon('drag-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/drag-icon.svg'))
      .addSvgIcon('dropdown-blue-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/dropdown-down-blue.svg'))
      .addSvgIcon('right-arrow-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/right-arrow-icon.svg'))
      .addSvgIcon('left-arrow-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/left-arrow-icon.svg'))
      .addSvgIcon('message-with-blue-dot', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/message-with-blue-dot.svg'))
      .addSvgIcon('graph-arrow-up', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/graph-arrow-up.svg'))
      .addSvgIcon('graph-arrow-down', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/graph-arrow-down.svg'))
      .addSvgIcon('calendar-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/calendar-icon-black.svg'))
      .addSvgIcon('check-circle-filled', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/check-circle-filled.svg'))
      .addSvgIcon('check-circle-outline', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/check-circle-outline.svg'))
      .addSvgIcon('download-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/download-icon.svg'))
      .addSvgIcon('material-info-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/material-information.svg'))
      .addSvgIcon('manufacturing-info-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/manufacturing-information.svg'))
      .addSvgIcon('bom-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/bom-icon.svg'))
      .addSvgIcon('tooling-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/tooling-icon.svg'))
      .addSvgIcon('partinfo-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/part-information-icon.svg'))
      .addSvgIcon('overhead-profit-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/overhead-profit-icon.svg'))
      .addSvgIcon('logistics-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/logistics-icon.svg'))
      .addSvgIcon('tariff-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/tariff-icon.svg'))
      .addSvgIcon('list-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/list-icon.svg'))
      .addSvgIcon('folder-empty-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/folder-empty.svg'))
      .addSvgIcon('folder-filled-color', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/folder-filled-color.svg'))
      .addSvgIcon('filter-blue', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/filter-blue.svg'))
      .addSvgIcon('search-image', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/search-image.svg'))
      .addSvgIcon('grid-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/grid-icon.svg'))
      .addSvgIcon('column-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/column-icon.svg'))
      .addSvgIcon('chart-line-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/chart-line-icon.svg'))
      .addSvgIcon('table-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/table-icon.svg'))
      .addSvgIcon('info-icon-black', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/info-icon-black.svg'))
      .addSvgIcon('cube-light-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/cube-light.svg'))
      .addSvgIcon('currency-light-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/currency-light.svg'))
      .addSvgIcon('no-notification-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/no-notification-icon.svg'))
      .addSvgIcon('annual-usage', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/annual-usage.svg'))
      .addSvgIcon('fuels-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/fuels-icon.svg'))
      .addSvgIcon('gas-utilized', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/gas-utilized.svg'))
      .addSvgIcon('recyclebin', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/recyclebin.svg'))
      .addSvgIcon('expand-full-screen', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/expand-full-screen.svg'))
      .addSvgIcon('select-cursor-bubble', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/select-cursor-bubble.svg'))
      .addSvgIcon('no-notification-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/no-notification-icon.svg'))
      .addSvgIcon('folder-move', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/folder-move.svg'))
      .addSvgIcon('share', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/share.svg'))
      .addSvgIcon('pin-outlined', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/pin-outlined.svg'))
      .addSvgIcon('configure', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/configure.svg'))
      .addSvgIcon('pin-filled', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/pin-filled.svg'))
      .addSvgIcon('delete-icon-thin', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/delete-icon-thin.svg'))
      .addSvgIcon('version-history', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/version-history.svg'))
      .addSvgIcon('direction-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/direction-icon.svg'))
      .addSvgIcon('eye-icon', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/eye-icon.svg'));
  }
  title = 'truevaluehub-ui';

  ngOnInit() {
    this.loader.load();
    this.authService.handleRedirectObservable().subscribe((result) => {
      if (result && result.account) {
        this.authService.instance.setActiveAccount(result.account);
        this.router.navigateByUrl('/home');
      }
    });
    // if (localStorage.getItem('isLoggedIn')) {
    //   this.setupIdleTimout();
    //   this.router.events.subscribe((event: any) => {
    //     if (event instanceof NavigationEnd) {
    //       const val = localStorage.getItem('@@STATE');
    //       const object = JSON.parse(val);
    //       if (object === null || object?.commodityList === null || object?.commodityList === undefined) {
    //         this.dispatchMasterData();
    //       }
    //       // Api Cache when router changes
    //       // this._store.dispatch(new ApiCacheActions.ResetApiCache());
    //       this._apiCacheService.removeCache('ALL');
    //     }
    //   });
    // }
    this.onLoggedIn();
    this.isIframe = window !== window.parent && !window.opener; // Remove this line to use Angular Universal
    this.userService.getCurrentUser().subscribe((user: UserModel) => {
      if (user != null) {
        this.setLoginDisplay();
        this.loadZohoWidget(user);
        this.userService.getMasterUrlBase().subscribe((url) => {
          this.signalrDfService.connectSignalRDFHub(url);
        });
        this.authService.instance.enableAccountStorageEvents(); // Optional - This will enable ACCOUNT_ADDED and ACCOUNT_REMOVED events emitted when a user logs in or out of another tab or window
        this.msalBroadcastService.msalSubject$.pipe(filter((msg: EventMessage) => msg.eventType === EventType.ACCOUNT_ADDED || msg.eventType === EventType.ACCOUNT_REMOVED)).subscribe(() => {
          if (this.authService.instance.getAllAccounts().length === 0) {
            window.location.pathname = '/';
          } else {
            this.setLoginDisplay();
          }
        });
        this.msalBroadcastService.inProgress$
          .pipe(
            filter((status: InteractionStatus) => status === InteractionStatus.None),
            take(1)
            //takeUntil(this._destroying$)
          )
          .subscribe(() => {
            this.setLoginDisplay();
            this.checkAndSetActiveAccount();
          });
        this.msalBroadcastService.msalSubject$
          .pipe(
            filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS || msg.eventType === EventType.SSO_SILENT_SUCCESS),
            takeUntil(this._destroying$)
          )
          .subscribe((result: EventMessage) => {
            const payload = result.payload as AuthenticationResult;
            const idtoken = payload.idTokenClaims as IdTokenClaimsWithPolicyId;
            // let getJwtTokenCallback = (successCallback, failureCallback) => {
            //   try {
            //     if (!location.origin.includes('localhost')) {
            //       this.userService.getZohoToken().subscribe((token: any) => {
            //         if (token) {
            //           successCallback(token.jwt);
            //         } else {
            //           throw new Error('JWT token not found in store');
            //         }
            //       });
            //     }
            //   } catch (error) {
            //     failureCallback(error);
            //   }
            // };
            // window.ZohoDeskAsapReady(() => {
            //   window.ZohoDeskAsap.invoke('login', getJwtTokenCallback);
            // });
            this.handleAuthenticationSuccess(payload, idtoken, user);
            return result;
          });
      }
    });
    this.userService.getClientGroups().pipe(takeUntil(this._destroying$)).subscribe();
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_FAILURE || msg.eventType === EventType.ACQUIRE_TOKEN_FAILURE),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        // Check for forgot password error
        // Learn more about AAD error codes at https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-aadsts-error-codes
        if (result.error && result.error.message.indexOf('AADB2C90118') > -1) {
          const resetPasswordFlowRequest: RedirectRequest | PopupRequest = {
            authority: environment.b2cPolicies.authorities.resetPassword.authority,
            scopes: [],
          };
          this.login(resetPasswordFlowRequest);
        }
      });

    this.googleMapsLoader.load().catch((error) => {
      console.error('Google Maps API script loading error:', error);
    });
  }

  private onLoggedIn() {
    if (localStorage.getItem('isLoggedIn')) {
      this.setupIdleTimout();
      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          const val = localStorage.getItem('@@STATE');
          const object = JSON.parse(val);
          if (object === null || object?.commodityList === null || object?.commodityList === undefined) {
            this.dispatchMasterData();
          }
          // Api Cache when router changes
          // this._store.dispatch(new ApiCacheActions.ResetApiCache());
          this._apiCacheService.removeCache('ALL');
        }
      });
    }
  }

  private handleAuthenticationSuccess(payload: AuthenticationResult, idtoken: IdTokenClaimsWithPolicyId, user: UserModel) {
    if (payload.accessToken) {
      this._store.dispatch(new UserActions.SetUser({ token: payload.accessToken }));

      if (user?.client?.baseUrl != location.origin && !location.origin.includes('localhost')) {
        this.logout();
      } else {
        if (!localStorage.getItem('isLoggedIn') && user?.userId) {
          //   this.userService
          //     .getLocationInfo()
          //     .pipe(
          //       take(1),
          //       switchMap((location: any) => {
          //         const countryCode = location?.country_code;
          //         return this.userService.addUserLog(user.userId, location).pipe(
          //           take(1),
          //           switchMap(() => this.userService.checkIfAccessAllowed(user.userId, countryCode))
          //         );
          //       })
          //     )
          //     .subscribe((isAllowed: boolean) => {
          //       if (isAllowed) {
          //         localStorage.setItem('isLoggedIn', '1');
          //         this.dispatchMasterData();
          //         this.setupIdleTimout();
          //       } else {
          //         this.logout();
          //       }
          //     });
          this.userService
            .getLocationInfo()
            .pipe(take(1))
            .subscribe((location: any) => {
              if (location?.country_code) {
                this.userService.addUserLog(user.userId, location).pipe(take(1)).subscribe();
              }
            });
          localStorage.setItem('isLoggedIn', '1');
          this.dispatchMasterData();
          this.setupIdleTimout();
        }
      }
    } else {
      this.logout();
    }
    this.processB2CPolicyFlow(idtoken, payload);
  }

  private processB2CPolicyFlow(idtoken: IdTokenClaimsWithPolicyId, payload: AuthenticationResult) {
    if (idtoken.acr === environment.b2cPolicies.names.signUpSignIn || idtoken.tfp === environment.b2cPolicies.names.signUpSignIn) {
      this.authService.instance.setActiveAccount(payload.account);
    }
    /**
     * For the purpose of setting an active account for UI update, we want to consider only the auth response resulting
     * from SUSI flow. "acr" claim in the id token tells us the policy (NOTE: newer policies may use the "tfp" claim instead).
     * To learn more about B2C tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
     */
    if (idtoken.acr === environment.b2cPolicies.names.editProfile || idtoken.tfp === environment.b2cPolicies.names.editProfile) {
      // retrieve the account from initial sing-in to the app
      const originalSignInAccount = this.authService.instance
        .getAllAccounts()
        .find(
          (account: AccountInfo) =>
            account.idTokenClaims?.oid === idtoken.oid &&
            account.idTokenClaims?.sub === idtoken.sub &&
            ((account.idTokenClaims as IdTokenClaimsWithPolicyId).acr === environment.b2cPolicies.names.signUpSignIn ||
              (account.idTokenClaims as IdTokenClaimsWithPolicyId).tfp === environment.b2cPolicies.names.signUpSignIn)
        );
      const signUpSignInFlowRequest: SsoSilentRequest = {
        authority: environment.b2cPolicies.authorities.signUpSignIn.authority,
        account: originalSignInAccount,
      };
      // silently login again with the signUpSignIn policy
      this.authService.ssoSilent(signUpSignInFlowRequest);
    }
    /**
     * Below we are checking if the user is returning from the reset password flow.
     * If so, we will ask the user to reauthenticate with their new password.
     * If you do not want this behavior and prefer your users to stay signed in instead,
     * you can replace the code below with the same pattern used for handling the return from
     * profile edit flow (see above ln. 74-92).
     */
    if (idtoken.acr === environment.b2cPolicies.names.resetPassword || idtoken.tfp === environment.b2cPolicies.names.resetPassword) {
      const signUpSignInFlowRequest: RedirectRequest | PopupRequest = {
        authority: environment.b2cPolicies.authorities.signUpSignIn.authority,
        scopes: [...environment.apiConfig.scopes],
        prompt: PromptValue.LOGIN, // force user to reauthenticate with their new password
      };
      this.login(signUpSignInFlowRequest);
    }
  }
  setupIdleTimout() {
    /** Check for user idle */
    this.idleTimeoutService.startTimer();
    document.addEventListener('mousemove', () => this.idleTimeoutService.resetTimer());
    document.addEventListener('keypress', () => this.idleTimeoutService.resetTimer());
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }
  checkAndSetActiveAccount() {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    const activeAccount = this.authService.instance.getActiveAccount();
    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      const accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }
  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
    this.signalrDfService
      .getHubConnection()
      ?.stop()
      .then(() => console.log('SignalRDf connection stopped.'))
      .catch((err) => console.error('Error stopping SignalRDf connection: ', err));
  }

  login(userFlowRequest?: RedirectRequest | PopupRequest) {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      if (this.msalGuardConfig.authRequest) {
        this.authService
          .loginPopup({
            ...this.msalGuardConfig.authRequest,
            ...userFlowRequest,
          } as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
            this.authService.instance.setActiveAccount(response.account);
            // localStorage.setItem('token', response.accessToken);
            this._store.dispatch(new UserActions.SetUser({ token: response.accessToken }));
          });
      } else {
        this.authService.loginPopup(userFlowRequest).subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);
          // localStorage.setItem('token', response.accessToken);
          this._store.dispatch(new UserActions.SetUser({ token: response.accessToken }));
        });
      }
    } else {
      if (!this.authService.instance.getAllAccounts().length) {
        if (this.msalGuardConfig.authRequest) {
          this.authService.loginRedirect({
            ...this.msalGuardConfig.authRequest,
            ...userFlowRequest,
          } as RedirectRequest);
        } else {
          this.authService.loginRedirect(userFlowRequest);
        }
      }
    }
  }
  //ngOnInit() {
  //   const currentUser = this.authenticationService.currentUserValue;
  //   if (currentUser && Object.keys(currentUser).length > 0) {
  //     console.log(currentUser);
  //     this.bnIdle.startWatching(600).subscribe((res) => {
  //       if (res) {
  //         this.bnIdle.stopTimer();
  //         console.log('session expired');
  //         const dialogRef = this.messaging.openConfirmationDialogTimeOut(<
  //           ConfirmationDialogTimeOutConfig
  //         >{
  //           data: {
  //             title: 'Session expired',
  //             message: 'Session expired',
  //             action: 'YES',
  //             cancelText: 'NO',
  //           },
  //         });
  //         dialogRef.afterClosed().subscribe((confirmed: boolean = false) => {
  //           if (confirmed) {
  //             this.bnIdle.resetTimer();
  //           } else {
  //             this.authenticationService.logout();
  //             this.router.navigate(['/login']);
  //             location.reload();
  //           }
  //         });
  //         setTimeout(() => {
  //           dialogRef.close();
  //         }, 60000);
  //       }
  //     });
  //   }
  //}

  dispatchMasterData() {
    if (!this.dispatchMasterDataCalled) {
      this.dispatchMasterDataCalled = true;
      this._store.dispatch(new MasterDataActions.GetToolingCountryMasterData()).subscribe({
        next: () => console.log('Master Action dispatched'),
        error: (err) => console.error('Master Dispatch failed:', err),
      });
      this._store.dispatch(new MasterDataActions.GetProcessTypeList());
      //this._store.dispatch(new MasterDataActions.GetAccessories()); Not Used
      this._store.dispatch(new MasterDataActions.GetAllMachineTypes());
      this._store.dispatch(new MasterDataActions.GetStockForms());
      this._store.dispatch(new MasterDataActions.GetCountryFormMatrix());
      this._store.dispatch(new MasterDataActions.GetUserGroups());
      this._store.dispatch(new MasterDataActions.GetStockFormCategories());
      this._store.dispatch(new MasterDataActions.GetAllProcessMasterData());
      this._store.dispatch(new MasterDataActions.GetCommodityData());
      this._store.dispatch(new MasterDataActions.GetCountryData());
      this._store.dispatch(new MasterDataActions.GetSubCommodityData());
      // this._store.dispatch(new MasterDataActions.GetLaborRates()); TODO : it has 7000 records , we have to filter based on CountryId
      this._store.dispatch(new MasterDataActions.GetCountryPlatingData());
      this._store.dispatch(new MasterDataActions.GetMaterialGroups());
      this._store.dispatch(new MasterDataActions.GetMaterialTypes());
      this._store.dispatch(new MasterDataActions.GetTechnologyData());
      this._store.dispatch(new MasterDataActions.GetSamplingRate());

      //Secondary process
      //Commenting this line as it is not used anywhere in code.
      //this._store.dispatch(new SecondaryProcessInfoActions.GetPowderCoatingMachineManufacture());
      this._store.dispatch(new SecondaryProcessInfoActions.GetPowderCoatingMaterialDescription());
      this._store.dispatch(new SecondaryProcessInfoActions.GetPowderCoatingStockForm());
      this._store.dispatch(new SecondaryProcessInfoActions.GetSecProcDeburringMachineDescription());
      this._store.dispatch(new SecondaryProcessInfoActions.GetSecProcMachineDescription());
      this._store.dispatch(new SecondaryProcessInfoActions.GetSecProcShotBlastingMachineDescription());

      // OHP
      this._store.dispatch(new OverHeadProfitActions.GetMedbFgiccData());
      this._store.dispatch(new OverHeadProfitActions.GetMedbIccData());
      this._store.dispatch(new OverHeadProfitActions.GetMedbOverHeadProfitData());
      this._store.dispatch(new OverHeadProfitActions.GetMedbPaymentData());

      //Manufacturing
      this._store.dispatch(new MasterDataActions.GetPlasmaCuttingLookup());
      this._store.dispatch(new MasterDataActions.GetDrillingCuttingSpeed());
      this._store.dispatch(new MasterDataActions.GetPartingCuttingSpeed());
      this._store.dispatch(new MasterDataActions.GetHandlingTime());
      this._store.dispatch(new MasterDataActions.GetToolLoadingTime());
      this._store.dispatch(new MasterDataActions.GetStrokeRate());
      this._store.dispatch(new MasterDataActions.GetStrokeRateManual());
      this._store.dispatch(new MasterDataActions.GetLaserCuttingSpeed());
      this._store.dispatch(new MasterDataActions.GetStampingMatrialLookUpList());
      this._store.dispatch(new MasterDataActions.GetConnectorAssemblyManufacturingLookUpList());
      this._store.dispatch(new MasterDataActions.GetTurningLookup());
      this._store.dispatch(new MasterDataActions.GetFacingLookup());
      this._store.dispatch(new MasterDataActions.GetGroovingLookup());
      this._store.dispatch(new MasterDataActions.GetFaceMillingLookup());
      this._store.dispatch(new MasterDataActions.GetBoringLookup());
      this._store.dispatch(new MasterDataActions.GetEndMillingLookup());
      this._store.dispatch(new MasterDataActions.GetSlotLookup());
      this._store.dispatch(new MasterDataActions.GetGrindingLookup());
      this._store.dispatch(new MasterDataActions.GetToolingLookup());
      // this._store.dispatch(new MasterDataActions.GetGearCuttingLookup());
      this._store.dispatch(new MasterDataActions.GetMigLookup());
      this._store.dispatch(new MasterDataActions.GetForgingLookup());
      this._store.dispatch(new MasterDataActions.GetThermoFormingLookup());
      this._store.dispatch(new MasterDataActions.GetFormingTimeLookup());
      this._store.dispatch(new MasterDataActions.GetWiringHarnessLookup());

      // Logistics
      this._store.dispatch(new MasterDataActions.GetSupplierList());
      this._store.dispatch(new MasterDataActions.GetBuLocation());

      // Tariff
      // this._store.dispatch(new MasterDataActions.GetAllUnspscMasterData());
      // this._store.dispatch(new MasterDataActions.GetAllHtsMasterData());

      this._store.dispatch(new MasterDataActions.GetPackageDescriptionMasterData());
      this._store.dispatch(new MasterDataActions.GetPackageFormMasterData());
      this._store.dispatch(new MasterDataActions.GetPackageSizeDefinitionMasterData());
    }
  }
  isCollapsed = false;

  onCollapseChange(isCollapsed: boolean) {
    this.isCollapsed = isCollapsed;
  }

  loadZohoWidget(user: UserModel) {
    if (user?.client?.widgetScript && !location.origin.includes('localhost')) {
      console.log('Zoho Widget Load');
      this.zohoDeskService.load(user?.client?.widgetScript);
      let getJwtTokenCallback = (successCallback, failureCallback) => {
        try {
          this.userService.getZohoToken().subscribe((token: any) => {
            if (token) {
              successCallback(token.jwt);
            } else {
              throw new Error('JWT token not found in store');
            }
          });
        } catch (error) {
          failureCallback(error);
        }
      };
      window.ZohoDeskAsapReady(() => {
        console.log('Zoho app ready');
        window.ZohoDeskAsap.invoke('login', getJwtTokenCallback);
      });
    }
  }

  logout() {
    this.authService.logout();
    window.ZohoDeskAsapReady(() => {
      window.ZohoDeskAsap.invoke('logout');
    });
    // localStorage.removeItem('isLoggedIn');
    // localStorage.removeItem('user');
    // localStorage.removeItem('@@STATE');
    // this._apiCacheService.removeCache('ALL');
    this.authenticationHelperService.clearOnLogout();
    this.router.navigate(['/login']);
  }
}
