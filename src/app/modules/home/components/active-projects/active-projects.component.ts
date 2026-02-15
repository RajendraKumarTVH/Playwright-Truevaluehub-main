import { Component, inject, Input, OnInit, ViewChild, effect, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { SelectItem, MenuItem, FilterMatchMode, SortMeta } from 'primeng/api';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { UserService } from 'src/app/modules/settings/Services/user.service';
import { ProjectInfoService, BlockUiService, AiSearchService } from 'src/app/shared/services';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { ProjectService } from '../../services';
import { Observable, Subject } from 'rxjs';
import { ProjectStatus, ProjectStatusDescription } from 'src/app/shared/enums';
import { CommodityMasterDto, ProjectInfoDto } from 'src/app/shared/models';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngxs/store';
// import * as BomActions from 'src/app/modules/_actions/bom.action';
import { UserSettingService } from 'src/app/shared/services/user-setting.service';
import { UserSettingKeys } from 'src/app/shared/models/user-setting.model';
import { SearchTextService } from 'src/app/modules/search/services';
import { ApiCacheService } from 'src/app/shared/services';
import { TableFilterStateModel } from 'src/app/models/table-state.model';
import { TableFilterState } from 'src/app/modules/_state/table.state';
import { SetTableFilterState } from 'src/app/modules/_actions/table.actions';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ProjectPartsSliderComponent } from '../project-parts-slider/project-parts-slider.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { MatMenuModule } from '@angular/material/menu';
import { ProgressBarComponent } from 'src/app/shared/components';
import { FileUploadModule } from 'primeng/fileupload';
import { MatIconModule } from '@angular/material/icon';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { SearchKeyModel } from 'src/app/shared/models/search-key-model';
import { SearchBarModelDto } from 'src/app/shared/models/search-bar-model';
import { SearchBarComponent } from 'src/app/shared/components/search-bar/search-bar.component';
import { CommodityState } from 'src/app/modules/_state/commodity.state';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ShareProjectComponent } from '../share-project/share-project.component';
import { ProjectUserDto } from 'src/app/modules/settings/models';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogModule } from 'primeng/dialog';
import { AiSearchTileExtractionInfoDto } from 'src/app/modules/ai-search/models/ai-image-similarity-result';
import { CadViewerPopupComponent } from 'src/app/modules/costing/components/cad-viewer-popup/cad-viewer-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PartThumbnailDto } from 'src/app/shared/models/part-thumbnail.model';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { MoveProjectsModalComponent } from '../move-projects-modal/move-projects-modal.component';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';
@Component({
  selector: 'app-active-projects',
  templateUrl: './active-projects.component.html',
  styleUrls: ['./active-projects.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ProjectPartsSliderComponent,
    AutoCompleteModule,
    ButtonModule,
    MatMenuModule,
    ProgressBarComponent,
    FileUploadModule,
    MatIconModule,
    DatePickerModule,
    MultiSelectModule,
    SearchBarComponent,
    MatTooltipModule,
    DialogModule,
    RippleModule,
    DropdownModule,
    CheckboxModule,
  ],
})
export class ActiveProjectsComponent implements OnInit {
  // Core properties
  private unSubscribe$: Subject<undefined> = new Subject<undefined>();
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  loading = false;
  dataLoading = false;

  // Grid data
  pinnedRows: number[] = [];
  frozenGridData: any[] = [];
  gridData: any[] = [];
  initialGridData: any[] = [];

  // Table configuration
  matchModeOptions: SelectItem[];
  menuItems: MenuItem[];
  matchMode = FilterMatchMode.CONTAINS;
  selectedRowData: any = null;
  cols: any[];
  _selectedColumns: any[];
  showFloatingBar = false;
  selectAll = false;
  // Search and filters
  searchKeys: SearchKeyModel[];
  appliedSearchModel: SearchBarModelDto[] = [];
  appliedSearch: SearchBarModelDto[] = [];
  private searchText: string;
  isSearchDirty = false;

  // Pagination and sorting
  currentPage = { rowCount: 0, first: 0, pageNo: 0 };
  sortField = '';
  sortOrder = 1;
  first = 0;
  rows = 10;
  totalRecords = 0;
  multiSortMeta: SortMeta[] = [];
  sortFields = [];

  // Filter-related properties
  showFilters = false;
  columnFilters: { [key: string]: any } = {};
  hasActiveFilters = false;
  filterTimeout: any;
  columnFiltersSignal = signal<any[]>([]);
  filterRenderKey = 0;
  colFilterDateMap: { [key: string]: Date | null } = {};

  // Column metadata map for filtering
  private columnMetaMap: { [key: string]: { label: string; type: string } } = {
    projectInfoId: { label: 'Project #', type: 'Contains' },
    projectName: { label: 'Project Name', type: 'Contains' },
    commodityTypes: { label: 'Category', type: 'Contains' },
    tag: { label: 'Tags', type: 'Contains' },
    projectStatus: { label: 'Status', type: 'Contains' },
    totalPercentage: { label: '% Completed', type: 'Contains' },
    shouldCostSpend: { label: 'Savings Identified ($)', type: 'Contains' },
    createDate: { label: 'Created Date', type: 'Is' },
    createdUser: { label: 'Created By', type: 'Is' },
    lastModifiedDate: { label: 'Modified Date', type: 'Is' },
    lastModifiedUser: { label: 'Modified By', type: 'Is' },
  };

  // User management
  users: any[] = [];
  createdUsersList: any[] = [];
  filteredCreatedUsersList: any[] = [];
  currentUserId = 0;
  isAdmin = false;

  // Project sharing
  projectUsers = this.projectInfoService.projectUsers;
  selectedUsers = this.projectInfoService.selectedUsers;
  prevProjectInfoId = 0;
  matDialogRef: MatDialogRef<ShareProjectComponent>;
  matDialog = inject(MatDialog);

  // Thumbnail handling
  thumbnailDialogVisible = false;
  selectedThumbnails: any[] = [];
  thumbnailList: PartThumbnailDto[] = [];
  isThumbnailLoaded = false;

  // Project status and UI state
  projectStatusEnum = ProjectStatus;
  refreshProjectId: number;
  isSliderVisible = false;
  expandedRows: { [key: string]: boolean } = {};
  uploadedPartFilesCount = 0;

  // Observables and state
  tableFilterState$: Observable<TableFilterStateModel>;
  _commodityMaster$: Observable<CommodityMasterDto[]>;
  commodityTypes: CommodityMasterDto[] = [];

  // Search request object
  searchReq: any = {
    filters: [],
    columnFilters: [],
    pageNumber: 1,
    pageSize: this.rows,
    projectIds: [],
  };

  // Column visibility
  columnVisibility: { [key: string]: boolean } = {};

  // Services injection
  sharedService = inject(SharedService);
  @ViewChild('dt') dt: any;

  // Effects
  _e = effect(() => {
    if (this.selectedUsers().length > 0 && this.selectedRowData?.projectInfoId && this.selectedRowData?.projectInfoId !== this.prevProjectInfoId) {
      this.prevProjectInfoId = this.selectedRowData?.projectInfoId;
      this.launchShareProject();
    }
  });

  constructor(
    private projectService: ProjectService,
    private messaging: MessagingService,
    private projectInfoService: ProjectInfoService,
    private blockUiService: BlockUiService,
    private searchTextService: SearchTextService,
    private route: ActivatedRoute,
    private userService: UserService,
    private userInfoService: UserInfoService,
    private router: Router,
    private _store: Store,
    private userSettingService: UserSettingService,
    private message: MessagingService,
    private _apiCacheService: ApiCacheService,
    private searchService: AiSearchService,
    private modalService: NgbModal,
    private _matDialog: MatDialog,
    private bomInfoSignalsService: BomInfoSignalsService
  ) {
    this.tableFilterState$ = this._store.select(TableFilterState.getTableFilterState);
    this._commodityMaster$ = this._store.select(CommodityState.getCommodityData);
  }

  // Lifecycle methods
  ngOnInit() {
    this.initializeComponent();
  }

  private initializeComponent() {
    this.initializeMenuItems();
    this.initializeColumns();
    this.setupSubscriptions();
    this.loadUserSettings();
    this.processRouteParams();
    this.initializeDateFilterMap();
  }

  private initializeMenuItems() {
    this.menuItems = [
      {
        id: '1',
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.onEdit(),
      },
      {
        id: '2',
        label: 'Archive',
        icon: 'fa fa-archive',
        command: () => this.onArchiveClick(),
      },
      {
        id: '3',
        label: 'Retry',
        icon: 'pi pi-replay',
        command: () => this.onRefreshClick(),
      },
      {
        id: '4',
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.onDeleteClick(),
      },
      {
        id: '5',
        label: 'Share',
        icon: 'pi pi-share-alt',
        command: () => this.onShareClick(),
      },
    ];
  }

  private initializeColumns() {
    this.cols = [
      {
        field: 'projectInfoId',
        header: 'Project #',
        sortable: true,
        filter: true,
        filterMatchMode: 'contains',
      },
      {
        field: 'projectName',
        header: 'Project Name',
        sortable: true,
        filter: true,
        filterMatchMode: 'contains',
      },
      {
        field: 'partThumbnails',
        header: 'Part Models',
        sortable: false,
        filter: false,
      },
      {
        field: 'commodityTypes',
        header: 'Category',
        sortable: true,
        filter: true,
        isDropDownFilter: true,
        filterMatchMode: 'equals',
      },
      {
        field: 'tag',
        header: 'Tags',
        sortable: true,
        filter: true,
        filterMatchMode: 'contains',
      },
      {
        field: 'projectStatus',
        header: 'Status',
        sortable: true,
        filter: true,
        isDropDownFilter: true,
        filterMatchMode: 'equals',
      },
      {
        field: 'totalPercentage',
        header: '% Completed',
        sortable: true,
        filter: true,
        filterMatchMode: 'gte',
      },
      {
        field: 'shouldCostSpend',
        header: 'Savings Identified ($)',
        sortable: true,
        filter: true,
        filterMatchMode: 'gte',
      },
      {
        field: 'createDate',
        header: 'Created Date',
        sortable: true,
        filter: true,
        isDateFilter: true,
        filterMatchMode: 'dateIs',
      },
      {
        field: 'lastModifiedDate',
        header: 'Modified Date',
        sortable: true,
        filter: true,
        isDateFilter: true,
        filterMatchMode: 'dateIs',
      },
      {
        field: 'lastModifiedUser',
        header: 'Modified By',
        filter: true,
        isDropDownFilter: true,
        filterMatchMode: 'equals',
      },
      {
        field: 'createdUser',
        header: 'Created By',
        filter: true,
        isDropDownFilter: true,
        filterMatchMode: 'equals',
      },
      {
        field: 'refresh',
        header: 'Refresh',
        filter: false,
      },
    ];

    this._selectedColumns = this.cols;
    this.updateColumnVisibility();
  }

  private setupSubscriptions() {
    this.tableFilterState$.pipe(takeUntil(this.unSubscribe$)).subscribe((state) => {
      console.log('state', state);
      if (state?.rows) {
        this.rows = state.rows;
      }
      if (state?.first) {
        this.first = state.first;
      }
      if (state?.filters && state?.filters?.length > 0) {
        this.appliedSearchModel = state.filters;
        this.searchReq.filters = state.filters;
      } else {
        this.appliedSearchModel = [];
        this.searchReq.filters = [];
      }
      if (state?.columnFilters && state?.columnFilters?.length > 0) {
        this.searchReq.columnFilters = state.columnFilters;
        this.columnFiltersSignal.set(this.searchReq.columnFilters);
        this.showFilters = true;
      } else {
        this.searchReq.columnFilters = [];
      }
    });
  }

  private loadUserSettings() {
    this.userSettingService.getUserSetting(UserSettingKeys[UserSettingKeys.ACTIVE_PROJ_PINNEDROWS]).subscribe((response) => {
      this.pinnedRows =
        response?.value
          ?.split(',')
          ?.map((x) => Number(x))
          ?.filter((x) => x > 0) || [];
    });
  }

  private processRouteParams() {
    this.route.queryParamMap.pipe(takeUntil(this.unSubscribe$)).subscribe((x) => {
      this.searchText = x.get('searchText') || '';
      this.searchText = this.searchText.trim();
      this.loadUsersAndInitialize();
    });
  }

  private loadUsersAndInitialize() {
    this.blockUiService.pushBlockUI('getUsers');
    this.userInfoService.getUserValue().subscribe((user) => {
      this.currentUserId = user?.userId;
      this.isAdmin = user?.roleId === 1;
      const clientId = user?.clientId;
      if (clientId) {
        this.userService.getUsersByClientId(clientId).subscribe((response) => {
          this.users = response;
          this.projectInfoService.setUsers(this.users);
          this.blockUiService.popBlockUI('getUsers');
          this.setSearchKeys();
        });
      }
    });
  }

  // Column management methods
  updateColumnVisibility() {
    const selectedFields = new Set(this._selectedColumns.map((col) => col.field));
    this.columnVisibility = this.cols.reduce(
      (acc, col) => {
        acc[col.field] = selectedFields.has(col.field);
        return acc;
      },
      {} as { [key: string]: boolean }
    );
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.cols.filter((col) => val.includes(col));
    this.updateColumnVisibility();
  }

  // Signal methods
  updateColumnFilters(newFilters: any[]) {
    this.columnFiltersSignal.set([...newFilters]);
  }

  getColumnFilters(): any[] {
    return this.columnFiltersSignal();
  }

  // Utility methods
  getMenuItems(): any[] {
    return this.menuItems;
  }

  getUserName(userId: any) {
    const user: any = this.users.filter((x) => x.userId == userId);
    const name = user != undefined && user[0] != undefined ? user[0].firstName + ' ' + user[0].lastName : '';
    return name;
  }

  // Search and filter methods
  onSearchApply(searchModel: SearchBarModelDto[]) {
    this.appliedSearch = searchModel.map((x) => {
      let searchValueId = 0;

      if (x.searchKey === 'createdUser') {
        searchValueId = this.users.find((y) => `${y.firstName} ${y.lastName}` === x.searchValue)?.userId ?? 0;
      } else if (x.searchKey === 'lastModifiedUser') {
        searchValueId = this.users.find((y) => `${y.firstName} ${y.lastName}` === x.searchValue)?.userId ?? 0;
      } else if (x.searchKey === 'commodityTypes') {
        searchValueId = this.commodityTypes.find((y) => y.commodity === x.searchValue)?.commodityId ?? 0;
      } else if (x.searchKey === 'projectStatus') {
        searchValueId = +(Array.from(ProjectStatusDescription.entries()).find(([, value]) => value === x.searchValue)?.[0] ?? 0);
      }

      return {
        ...x,
        searchValueId,
      };
    });
    const currentColFilters = this.columnFiltersSignal();
    this.first = 0;

    this.searchReq = {
      filters: this.appliedSearch,
      columnFilters: currentColFilters || [],
      pageNumber: this.first / this.rows + 1,
      pageSize: this.rows,
      sortFields: this.sortField,
    };
    this._store.dispatch(new SetTableFilterState({ filters: this.appliedSearch, columnFilters: currentColFilters, rows: this.rows, first: this.first }));

    this.getProjectDetails({ first: this.first, rows: this.rows });
  }

  private setSearchKeys() {
    const projectStatusDropdownValues = Array.from(ProjectStatusDescription.entries()).map(([_id, name]) => ({ id: name, name: name }));

    this._commodityMaster$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: CommodityMasterDto[]) => {
      if (result || result.length !== 0) {
        this.commodityTypes = result;
      }
    });

    const dynamicSearchKeys = this.cols
      .filter((col) => col.filter)
      .map((col) => {
        const key: any = { key: col.field };
        key.label = col.header;
        if (col.isDropDownFilter) {
          key.isDropDown = true;
          key.dropDownValues = [];
        }

        if (col.isDateFilter) {
          key.isDate = true;
        }
        if (col.isDropDownFilter && col.field === 'commodityTypes') {
          key.dropDownValues = this.commodityTypes.map((x) => ({ id: x.commodity, name: x.commodity })) as unknown as SearchKeyModel[];
        }

        if (col.isDropDownFilter && col.field === 'projectStatus') {
          key.dropDownValues = projectStatusDropdownValues as unknown as SearchKeyModel[];
        }

        if (col.isDropDownFilter && col.field === 'createdUser') {
          key.dropDownValues = this.users
            .filter((user) => user.status === true)
            .map((x) => ({ id: `${x.firstName} ${x.lastName}`, name: `${x.firstName} ${x.lastName}` })) as unknown as SearchKeyModel[];
        }
        if (col.isDropDownFilter && col.field === 'lastModifiedUser') {
          key.dropDownValues = this.users
            .filter((user) => user.status === true)
            .map((x) => ({ id: `${x.firstName} ${x.lastName}`, name: `${x.firstName} ${x.lastName}` })) as unknown as SearchKeyModel[];
        }

        return key;
      });

    this.searchKeys = dynamicSearchKeys;
  }

  // Data loading and processing methods
  getProjectDetails(event: TableLazyLoadEvent) {
    this.first = event?.first ?? this.first;
    this.searchReq.pageNumber = this.first / (event?.rows ?? this.rows) + 1;
    this.searchReq.pageSize = event?.rows ?? this.rows;
    this.rows = this.searchReq.pageSize;
    const currentColFilters = this.columnFiltersSignal();

    this.sortFields = (event.multiSortMeta ?? []).map((meta) => ({
      field: meta.field,
      direction: meta.order === 1 ? 'asc' : 'desc',
    }));
    this.searchReq.sortFields = this.sortFields;

    if (event.filters) {
      const filters = [];

      Object.entries(event.filters).forEach(([field, filterData], index) => {
        const value = (filterData as any).value;

        if (value !== null && value !== undefined && value !== '') {
          const meta = this.columnMetaMap[field] ?? { label: field, type: 'Contains' };
          const idVal = typeof value === 'object' && value?.name ? value.name : value;

          filters.push({
            index,
            searchKey: field,
            searchType: meta.type,
            searchValue: typeof value === 'object' && value?.name?.toString() ? value.name.toString() : value.toString(),
            searchLabel: meta.label,
            searchValueId: typeof idVal === 'string' ? 0 : idVal,
          });
        }
      });

      if (filters?.length > 0) {
        this.mergeColumnFilters(filters);
        // this.searchReq.columnFilters = [...filters];
        // this.columnFiltersSignal.set(this.searchReq.columnFilters);
        // this._store.dispatch(new SetTableFilterState({ filters: this.searchReq.filters, columnFilters: this.searchReq.columnFilters }));
      } else {
        if (currentColFilters) {
          this.searchReq.columnFilters = currentColFilters;
        }
      }
    } else {
      if (currentColFilters) {
        this.searchReq.columnFilters = currentColFilters;
      }
    }

    if (event?.rows) {
      this._store.dispatch(
        new SetTableFilterState({
          filters: this.searchReq.filters,
          columnFilters: this.searchReq.columnFilters,
          rows: this.rows,
          first: this.first,
        })
      );
    }

    this.dataLoading = true;
    this.blockUiService.pushBlockUI('getActiveProjectDetails');

    this.projectService
      .getActiveProjectSearchList(this.searchReq)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe({
        next: (result) => {
          let response = result?.items || [];
          this.totalRecords = result?.totalCount || 0;
          this.searchReq.ProjectIds = response.map((x) => x.projectInfoId);

          if (this.searchReq.ProjectIds.length > 0) {
            this.projectService
              .getPartThumbnailsAsync(this.searchReq)
              .pipe(takeUntil(this.unSubscribe$))
              .subscribe((thumbnailList) => {
                if (thumbnailList?.length > 0) {
                  this.bindData(response, thumbnailList);
                }
              });
          }

          if (this.searchText) {
            this.searchTextService
              .getSearchDataByText(this.searchText)
              .pipe(takeUntil(this.unSubscribe$))
              .subscribe((searchIds) => {
                response = result?.items.filter((x) => searchIds.some((y) => y == x.projectInfoId));
                this.bindData(response);
              });
          } else {
            this.bindData(response);
          }

          this.initialGridData = response;
          this.dataLoading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.dataLoading = false;
          this.blockUiService.popBlockUI('getActiveProjectDetails');
        },
      });
  }

  mergeColumnFilters(newFilters: any[]): void {
    const map = new Map<string, any>();

    // Add existing filters
    this.searchReq.columnFilters.forEach((f) => {
      map.set(f.searchKey, f);
    });

    // Overwrite or add new filters
    newFilters.forEach((f) => {
      map.set(f.searchKey, f);
    });

    // Update the array with merged filters
    this.searchReq.columnFilters = Array.from(map.values());

    // Sync signal and store
    this.columnFiltersSignal.set(this.searchReq.columnFilters);
    this._store.dispatch(
      new SetTableFilterState({
        filters: this.searchReq.filters,
        columnFilters: this.searchReq.columnFilters,
        rows: this.rows,
        first: this.first,
      })
    );
  }

  private bindData(result, thumbnails?: PartThumbnailDto[]) {
    this.gridData = result;
    this.gridData = this.gridData.map((x) => {
      const projectThumbnails = thumbnails?.filter((t) => t.projectInfoId === x.projectInfoId) || [];
      x.projectStatus = ProjectStatusDescription.get(Number(x.projectStatusId));
      x.partThumbnails = projectThumbnails.slice(0, 2);
      x.partThumbnailCount = Math.max(projectThumbnails.length - 2, 0);
      x.createdUser = this.getUserName(x.createdUserId);
      x.lastModifiedUser = this.getUserName(x.lastModifiedUserId);
      x.partDetails = [];
      x.shouldCostSpend = x.shouldCostSpend || 0;
      x.canShowLock = this.isAdmin
        ? false
        : this.sharedService.hasSameGroup(x.createdUserId, this.currentUserId)
          ? false
          : !(this.currentUserId === x.createdUserId || x.projectUserDtos?.find((x) => x.userId === this.currentUserId) !== undefined);
      x.canShowLock = this.isAdmin ? false : !(this.currentUserId === x.createdUserId || x.projectUserDtos?.find((x) => x.userId === this.currentUserId) !== undefined);
      return x;
    });
    this.expandAllGroups();

    this.currentPage = {
      ...this.currentPage,
      first: this.first,
      pageNo: 1,
    };

    this.isThumbnailLoaded = !!thumbnails?.length;
    this.blockUiService.popBlockUI('getActiveProjectDetails');
  }

  // Project management methods
  toggleFreeze(projectInfo: ProjectInfoDto, isFreezed: boolean) {
    if (isFreezed) {
      delete this.pinnedRows[this.pinnedRows.findIndex((item) => item == projectInfo.projectInfoId)];
      projectInfo.groupName = 'Projects';
    } else {
      this.pinnedRows.push(projectInfo.projectInfoId);
      this.pinnedRows = [...new Set(this.pinnedRows)];
      projectInfo.groupName = 'Pinned Projects';
    }
    this.gridData = this.gridData.sort((a, b) => {
      if (a.groupName === b.groupName) return 0;
      return a.groupName === 'Pinned Projects' ? -1 : 1;
    });
    this.userSettingService.saveUserSettings(UserSettingKeys[UserSettingKeys.ACTIVE_PROJ_PINNEDROWS], this.pinnedRows.toString()).subscribe(() => {
      const tableLazyLoadEvent: TableLazyLoadEvent = {
        first: this.first,
        rows: this.rows,
      };
      this.getProjectDetails(tableLazyLoadEvent);
    });
  }

  // Action handlers
  public onEdit() {
    const projectInfoId = this.selectedRowData.projectInfoId;
    localStorage.removeItem('lastVisitedProject');
    this.router.navigate(['/costing', projectInfoId]);
  }

  private onArchiveClick() {
    const projectInfoId = this.selectedRowData.projectInfoId;

    if (projectInfoId) {
      this.blockUiService.pushBlockUI('archiveProject');
      this.projectInfoService
        .archiveProject(projectInfoId)
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe(
          () => {
            this.blockUiService.popBlockUI('archiveProject');
            this.getProjectDetails({ first: 0, rows: 10 });
          },
          (error: any) => {
            console.error(error);
            this.blockUiService.popBlockUI('archiveProject');
          }
        );
    }
  }

  private onShareClick() {
    if (this.selectedRowData?.projectInfoId !== this.prevProjectInfoId) {
      this.projectInfoService.projectInfoSelected(this.selectedRowData?.projectInfoId);
    } else {
      this.launchShareProject();
    }
  }

  private launchShareProject() {
    this.matDialogRef = this.matDialog.open(ShareProjectComponent, {
      data: {
        usersList: this.selectedUsers(),
        title: 'Project (' + this.selectedRowData.projectName + ') ' + 'share to Users',
      },
      width: '1000px',
      enterAnimationDuration: '1000ms',
      exitAnimationDuration: '1000ms',
      height: '500px',
      disableClose: true,
    });
    this.matDialogRef.afterClosed().subscribe((data) => {
      if (Array.isArray(data) && data.length > 0) {
        let projectUsers = data.map((x) => ({ projectUserId: x.projectUserId, projectInfoId: x.projectInfoId, userId: x.id, isDeleted: !x.isSelected }) as ProjectUserDto);
        let removedUsers = this.projectUsers().filter((x) => !data.some((y) => y.id === x.userId));
        if (removedUsers && removedUsers.length > 0) {
          removedUsers.forEach((element) => {
            element.isDeleted = true;
            projectUsers.push(element);
          });
        }
        this.projectInfoService.createProjectUsers(projectUsers).subscribe((data) => {
          this.projectInfoService.setProjectUsers(data);
        });
      }
    });
  }

  private onDeleteClick() {
    const projectInfoId = this.selectedRowData.projectInfoId;

    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Delete Confirmation',
        message: 'Do you want to delete project ?',
        action: 'CONFIRM',
        cancelText: 'CANCEL',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.projectInfoService.deleteProject(projectInfoId).subscribe((x) => {
          if (x) {
            this.messaging.openSnackBar(`Project deleted successfully.`, '', {
              duration: 5000,
            });
            this.getProjectDetails({ first: this.first, rows: this.rows });
          }
        });
      }
    });
  }

  public onRefreshIconClick(projectInfoId: number) {
    this.loading = true;
    this.refreshProjectId = projectInfoId;

    this._apiCacheService.removeCache(`/api/costing/ProjectInfo/${projectInfoId}`);
    this._apiCacheService.removeCache(`/api/costing/ProjectInfo/project/${projectInfoId}/activePartDetailsByProjectId`);

    this.projectInfoService.getProjectDetailsById(projectInfoId).subscribe((result) => {
      this.gridData.forEach((x) => {
        if (x.projectInfoId === projectInfoId) {
          if (result) {
            x.projectStatus = ProjectStatusDescription.get(Number(result.projectStatusId));
            x.projectStatusId = result.projectStatusId;
          }
        }
      });
    });

    this.projectInfoService.getPartDetailsByProjectId(projectInfoId).subscribe((parts: any) => {
      this.gridData.forEach((x) => {
        if (x.projectInfoId === projectInfoId) {
          const allParts = parts;
          for (let i = 0; i < x.partDetails.length; i++) {
            const p = allParts.find((y) => y.partInfoId === x.partDetails[i].partInfoId);
            if (p) {
              x.partDetails[i].dataExtractionPercentage = p.dataExtractionPercentage;
              x.partDetails[i].dataExtractionTimeRemaining = p.dataExtractionTimeRemaining;
              x.partDetails[i].dataExtractionStatus = p.dataExtractionStatus;
              x.partDetails[i].partExtractionStatus = p.partExtractionStatus;
              x.partDetails[i].reasonForFailure = p.reasonForFailure;
            }
          }
          this.loading = false;
        }
      });
    });
  }

  public onRefreshClick() {
    const projectInfo = this.selectedRowData;

    if (projectInfo?.projectInfoId) {
      if (projectInfo?.projectStatusId == ProjectStatus.Completed || projectInfo?.projectStatusId == ProjectStatus.Costing) {
        projectInfo.projectStatusId = ProjectStatus.DataExtractionReprocessing;
      }

      this.projectInfoService
        .updateProjectStatus(projectInfo?.projectInfoId, projectInfo?.projectStatusId)
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe(() => {
          this.projectInfoService.refreshProject(projectInfo?.projectInfoId);
          this.message.openSnackBar(`Data Extraction Restarted Successfully.`, '', { duration: 5000 });

          setTimeout(() => {
            this.getProjectDetails({ first: this.first, rows: this.rows });
          }, 1000);
        });
    }
  }

  public onViewPart(): void {
    const item = this.selectedRowData;

    this.isSliderVisible = false;

    setTimeout(() => {
      this.isSliderVisible = true;

      if (item?.projectStatusId !== 8) {
        this.blockUiService.pushBlockUI('getPartDetailsByProjectId');
        this.projectInfoService
          .getPartDetailsByProjectId(item.projectInfoId)
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe(
            (result: any) => {
              this.blockUiService.popBlockUI('getPartDetailsByProjectId');
              item.partDetails = result;
            },
            (error: any) => {
              console.error(error);
            }
          );
      }
    });
  }

  // File upload and document management
  public updateNewDocumentForFailedRecord(event: any, partInfoId: number, documentRecordId: number, item: any) {
    this.blockUiService.pushBlockUI('updateNewDocumentForFailedRecord');
    const files = event.files;
    if (files?.length > 0) {
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        const file = files[i] as File;
        const parts = item?.partDetailsByProjectDto?.find((x) => x.partInfoId == partInfoId);
        let fileName = file.name;
        if (parts && parts?.intPartNumber) {
          const revisionLevel = parts?.partRevision ? parts.partRevision : '0';
          fileName = parts.intPartNumber + '-' + revisionLevel + '-' + file.name;
        }

        formData.append('formFile', file, fileName);
        formData.append('originalFileName', file.name);
      }

      this.projectInfoService
        .updateNewDocumentForFailedRecord(partInfoId, documentRecordId, formData)
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe((data) => {
          this.blockUiService.popBlockUI('updateNewDocumentForFailedRecord');
          if (data) {
            this.messaging.openSnackBar(`New drawing has updated successfully.`, '', { duration: 5000 });
            item.isRefreshRequired = true;
            this.selectedRowData = item;
            this.onViewPart();
          }
        });
    }
  }

  public removeBomClick(projectInfoId: number, bomId: number, scenarioId: number, item: any) {
    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Confirm Delete',
        message: 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
        action: 'CONFIRM',
        cancelText: 'CANCEL',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      } else {
        // this._store.dispatch(new BomActions.RemoveBillOfMaterial(Number(bomId), projectInfoId, scenarioId));
        this.bomInfoSignalsService.removeBillOfMaterial(Number(bomId), projectInfoId, scenarioId);
        setTimeout(() => {
          this.selectedRowData = item;
          this.onViewPart();
        }, 1500);

        this.messaging.openSnackBar(`Data has been delete successfully.`, '', {
          duration: 5000,
        });
      }
    });
  }

  // Thumbnail management
  openThumbnailPopup(rowData: any) {
    this.blockUiService.pushBlockUI('getPartThumbnailsByProject');
    this.selectedThumbnails = rowData.partThumbnails;
    try {
      this.projectInfoService
        .getPartThumbnailsByProject(rowData.projectInfoId)
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe((data) => {
          this.blockUiService.popBlockUI('getPartThumbnailsByProject');
          if (data) {
            this.thumbnailList = data;
            this.thumbnailDialogVisible = true;
          }
        });
    } catch (error) {
      console.error(error);
      this.blockUiService.popBlockUI('getPartThumbnailsByProject');
    }
  }

  onPartThumbnailClick(partInfoId: number) {
    this.thumbnailDialogVisible = false;

    let fileType = 'cad';
    this.blockUiService.pushBlockUI('open3DViewer');
    this.searchService
      .getExtractionInfo([partInfoId])
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (result: AiSearchTileExtractionInfoDto[]) => {
          const item = result[0];
          if (fileType === 'pdf') {
            this.blockUiService.popBlockUI('open3DViewer');
            return;
          }
          const extractedData = {
            material: JSON.parse(item?.materialInfoJson),
            process: JSON.parse(item?.processInfoJson),
          };

          const fileName = item.fileName;
          const modalRef = this.modalService.open(CadViewerPopupComponent, {
            windowClass: 'fullscreen',
          });
          modalRef.componentInstance.fileName = fileName;

          modalRef.componentInstance.partData = {
            caller: 'bom-details',
            partId: partInfoId,
            volume: extractedData?.material?.DimVolume,
            surfaceArea: extractedData?.material?.DimArea,
            projectedArea: extractedData?.material?.ProjectedArea,
            dimentions: {
              dimX: extractedData?.material?.DimX,
              dimY: extractedData?.material?.DimY,
              dimZ: extractedData?.material?.DimZ,
            },
            centerMass: {
              centroidX: extractedData?.process?.CentroidX,
              centroidY: extractedData?.process?.CentroidY,
              centroidZ: extractedData?.process?.CentroidZ,
            },
          };
          this.blockUiService.popBlockUI('open3DViewer');
        },
      });
  }

  // UI helper methods
  expandAllGroups() {
    this.expandedRows = {};
    const uniqueGroups = [...new Set(this.gridData.map((item) => item.groupName))];
    uniqueGroups.forEach((groupName) => {
      if (groupName) {
        this.expandedRows[groupName] = true;
      }
    });
  }

  getProjectStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Costing':
        return 'status-in-progress';
      case 'Data Extraction In Progress':
        return 'status-pending';
      case 'Needs Review':
        return 'status-needs-review';
      default:
        return 'status-default';
    }
  }

  isKnownStatus(statusId: number): boolean {
    return Object.values(this.projectStatusEnum).includes(statusId);
  }

  getStatusConfig(statusId: number): any {
    const statusConfigs = {
      [this.projectStatusEnum.NeedsReview]: {
        icon: 'pi pi-search',
        text: 'Needs Review',
        class: 'needs-review',
        showView: true,
      },
      [this.projectStatusEnum.DataExtractionInprogress]: {
        icon: 'pi pi-download',
        text: 'Extracting',
        class: 'extracting',
        showView: true,
      },
      [this.projectStatusEnum.DataExtractionReprocessing]: {
        icon: 'pi pi-spin pi-spinner',
        text: 'Extracting',
        class: 'extracting',
        showView: true,
      },
      [this.projectStatusEnum.Negotiation]: {
        icon: 'pi pi-times-circle',
        text: 'Failed',
        class: 'failed',
        showView: true,
      },
      [this.projectStatusEnum.Costing]: {
        icon: 'pi pi-dollar',
        text: 'Costing',
        class: 'costing',
        showView: false,
      },
      [this.projectStatusEnum.Completed]: {
        icon: 'pi pi-check-circle',
        text: 'Completed',
        class: 'completed',
        showView: false,
      },
    };

    return (
      statusConfigs[statusId] || {
        icon: 'pi pi-info-circle',
        text: 'Unknown',
        class: 'default',
        showView: false,
      }
    );
  }

  shouldShowViewButton(statusId: number): boolean {
    return [this.projectStatusEnum.NeedsReview, this.projectStatusEnum.DataExtractionInprogress, this.projectStatusEnum.DataExtractionReprocessing].includes(statusId);
  }

  // Filter methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  getFilterValue(field: string): any {
    const filter = this.searchReq.columnFilters.find((f) => f.searchKey === field);
    if (!filter) return this.columnFilters[field] || null;

    // Use ID for specific fields
    if (['projectStatus', 'createdUser'].includes(field)) {
      return filter.searchValueId;
    }

    return filter.searchValue;
  }

  getDateFilterValue(field: string): any {
    const filter = this.searchReq.columnFilters.find((f) => f.searchKey === field);
    if (!filter) return this.columnFilters[field] || null;

    // ID fields
    if (['projectStatus', 'createdUser'].includes(field)) {
      return filter.searchValueId;
    }

    // Check if it's a date filter
    const col = this.cols.find((c) => c.field === field);
    if (col?.isDateFilter) {
      const raw = filter.searchValue;

      // Parse only if string is in yyyy-MM-dd format
      if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const dateParts = raw?.split('-');
        const parsedDate = new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2]);

        // Return only valid dates
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }

      return null;
    }

    return filter.searchValue;
  }

  onFilterChange(event: any, field: string, matchMode: string, table: any): void {
    const value = event.target.value;
    this.columnFilters[field] = value;

    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.filterTimeout = setTimeout(() => {
      if (value) {
        table.filter(value, field, matchMode);
      } else {
        table.filter(null, field, matchMode);
      }
      this.setColumnFilter(field, value, 'text');
      this.updateActiveFiltersStatus();
    }, 1000);
  }

  onDropdownFilterChange(value: any, field: string, table: any): void {
    this.columnFilters[field] = value;

    if (value) {
      table.filter(value, field, 'equals');
    } else {
      table.filter(null, field, 'equals');
    }
    this.setColumnFilter(field, value, 'dropdown');
    this.updateActiveFiltersStatus();
  }

  dateRangeState: Record<string, { from: Date | null; to: Date | null }> = {};
  dateRangeInvalid: Record<string, string | null> = {};
  rangeModel: Record<string, (Date | null)[] | null> = {};
  onFromDateChange(value: Date | null, field: string) {
    if (!this.dateRangeState[field]) {
      this.dateRangeState[field] = { from: null, to: null };
    }
    this.dateRangeState[field].from = value;

    if (value && this.dateRangeState[field].to) {
      this.applyDateFilters(field, this.dateRangeState[field]);
    } else if (!value) {
      this.removeDateFilters(field);
    }
    this.updateActiveFiltersStatus();
  }

  onToDateChange(value: Date | null, field: string) {
    if (!this.dateRangeState[field]) {
      this.dateRangeState[field] = { from: null, to: null };
    }
    this.dateRangeState[field].to = value;

    if (value && this.dateRangeState[field].from) {
      this.applyDateFilters(field, this.dateRangeState[field]);
    } else if (!value) {
      this.removeDateFilters(field);
    }
    this.updateActiveFiltersStatus();
  }

  onDateRangeChange(value: any, field: string) {
    if (Array.isArray(value)) {
      this.rangeModel[field] = [value[0] ?? null, value[1] ?? null];
    } else if (value && value.from !== undefined && value.to !== undefined) {
      this.rangeModel[field] = [value.from ?? null, value.to ?? null];
    } else if (value instanceof Date) {
      this.rangeModel[field] = [value, null];
    } else {
      this.rangeModel[field] = null;
    }
    if (!this.dateRangeState[field]) {
      this.dateRangeState[field] = { from: null, to: null };
    }

    let from: Date | null = null;
    let to: Date | null = null;

    if (Array.isArray(value)) {
      from = value[0] ?? null;
      to = value[1] ?? null;
    } else if (value && value.from !== undefined && value.to !== undefined) {
      from = value.from ?? null;
      to = value.to ?? null;
    } else if (value instanceof Date) {
      from = value;
      to = null;
    }

    this.dateRangeState[field].from = from;
    this.dateRangeState[field].to = to;
    if (from && to) {
      if (from > to) {
        this.dateRangeInvalid[field] = 'From date cannot be after To date';
      } else {
        this.dateRangeInvalid[field] = null;
        this.applyDateFilters(field, this.dateRangeState[field]);
      }
    } else if (!from && !to) {
      this.dateRangeInvalid[field] = null;
      this.removeDateFilters(field);
    } else {
      this.dateRangeInvalid[field] = null;
    }

    this.updateActiveFiltersStatus();
  }

  removeDateFilters(field: string) {
    this.searchReq.columnFilters = this.searchReq.columnFilters.filter((f) => !(f.searchKey === field && (f.searchType === 'From' || f.searchType === 'To')));
    this.columnFiltersSignal.set(this.searchReq.columnFilters);
    this.updateActiveFiltersStatus();

    this.first = 0;
    if (this.dt) {
      try {
        this.dt.first = 0;
        if (typeof this.dt.reset === 'function') {
          this.dt.reset();
        }
      } catch {}
    }
    this.getProjectDetails({ first: this.first, rows: this.rows, filters: this.searchReq.columnFilters });
  }

  getDateRangeTooltip(field: string): string {
    const range = this.rangeModel[field];
    if (range && range[0] && range[1]) {
      const from = new Date(range[0]).toLocaleDateString();
      const to = new Date(range[1]).toLocaleDateString();
      return `${from} - ${to}`;
    }
    return 'Select date range';
  }
  applyDateFilters(field: string, state: { from: Date | null; to: Date | null }) {
    this.removeDateFilters(field);

    if (state.from) {
      this.searchReq.columnFilters.push({
        searchKey: field,
        searchType: 'From',
        searchValue: this.formatDateToYyyyMmDd(state.from),
        searchLabel: field,
      });
    }

    if (state.to) {
      this.searchReq.columnFilters.push({
        searchKey: field,
        searchType: 'To',
        searchValue: this.formatDateToYyyyMmDd(state.to),
        searchLabel: field,
      });
    }

    this.columnFiltersSignal.set(this.searchReq.columnFilters);

    this._store.dispatch(
      new SetTableFilterState({
        filters: this.searchReq.filters,
        columnFilters: this.searchReq.columnFilters,
        rows: this.rows,
        first: this.first,
      })
    );
    this.getProjectDetails({ first: this.first, rows: this.rows, filters: this.searchReq.columnFilters });
  }
  formatDateToYyyyMmDd(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onMultiSelectFilterChange(values: any[], field: string, table: any): void {
    this.columnFilters[field] = values;

    if (values && values.length > 0) {
      table.filter(values, field, 'in');
    } else {
      table.filter(null, field, 'in');
    }
    this.setColumnFilter(field, values, 'multi');
    this.updateActiveFiltersStatus();
  }

  clearFilter(field: string, table: any): void {
    this.columnFilters[field] = null;
    table.filter(null, field, 'contains');
    this.setColumnFilter(field, null);
    this.updateActiveFiltersStatus();
  }

  // applyFilter(table: any): void {
  //   // This method can be used for manual filter application
  //   // Currently filters are applied automatically on change
  // }

  updateActiveFiltersStatus(): void {
    this.hasActiveFilters = Object.values(this.columnFilters).some((value) => value !== null && value !== undefined && value !== '');
  }

  getDropdownOptions(field: string): any[] {
    switch (field) {
      case 'commodityTypes':
        return this.commodityTypes.map((x) => ({ id: x.commodity, name: x.commodity }));

      case 'projectStatus':
        return Array.from(ProjectStatusDescription.entries()).map(([_id, name]) => ({
          id: _id,
          name: name,
        }));

      case 'createdUser':
        const cus = this.users.filter((u) => u.status === true);
        return cus.map((x) => ({
          id: x.userId,
          name: `${x.firstName} ${x.lastName}`,
        }));
      case 'lastModifiedUser':
        const us = this.users.filter((u) => u.status === true);
        return us.map((x) => ({
          id: x.userId,
          name: `${x.firstName} ${x.lastName}`,
        }));

      default:
        return [];
    }
  }

  setColumnFilter(field: string, value: any, type: 'text' | 'dropdown' | 'date' | 'multi' = 'text'): void {
    const filters = [...this.searchReq.columnFilters];
    const index = filters.findIndex((f) => f.searchKey === field);
    const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);

    if (isEmpty && index !== -1) {
      filters.splice(index, 1);
    } else {
      const filterValue = {
        searchKey: field,
        searchType: this.getSearchTypeByFieldType(type),
        searchLabel: this.getColumnLabel(field),
        searchValue: type === 'dropdown' || type === 'multi' ? this.getDropdownLabel(field, value) : value,
        searchValueId: type === 'dropdown' || type === 'multi' ? value : 0,
      };

      if (index !== -1) {
        filters[index] = filterValue;
      } else {
        filters.push(filterValue);
      }
    }

    this.searchReq.columnFilters = filters;
    this.columnFiltersSignal.set(filters);
    this._store.dispatch(new SetTableFilterState({ filters: this.searchReq.filters, columnFilters: this.searchReq.columnFilters, rows: this.rows, first: this.first }));
  }

  getSearchTypeByFieldType(type: string): string {
    switch (type) {
      case 'text':
        return 'Contains';
      case 'dropdown':
        return 'Equals';
      case 'date':
        return 'DateIs';
      case 'multi':
        return 'In';
      default:
        return 'Contains';
    }
  }

  getColumnLabel(field: string): string {
    const col = this.cols.find((c) => c.field === field);
    return col?.header ?? field;
  }

  getDropdownLabel(field: string, id: any): string {
    const options = this.getDropdownOptions(field);
    const match = options.find((opt) => opt.id === id);

    return match?.name ?? '';
  }

  initializeDateFilterMap(): void {
    for (const col of this.cols) {
      if (!col.isDateFilter) continue;

      const filter = this.searchReq.columnFilters.find((f) => f.searchKey === col.field);
      if (filter && typeof filter.searchValue === 'string') {
        const match = filter.searchValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
          const [, y, m, d] = match;
          const date = new Date(+y, +m - 1, +d);
          if (!isNaN(date.getTime())) {
            this.colFilterDateMap[col.field] = date;
          }
        }
      }
    }
  }
  updateFloatingBar() {
    const allProjects = [...this.frozenGridData, ...this.gridData];
    this.showFloatingBar = allProjects.some((p) => p.selected);
  }

  onSelectAllChange(checked: boolean) {
    const allProjects = [...this.frozenGridData, ...this.gridData];
    allProjects.forEach((project) => {
      project.selected = checked;
    });
    this.showFloatingBar = checked;
  }
  openMoveDialog(): void {
    this.matDialog.open(MoveProjectsModalComponent, {
      width: '900px',
      panelClass: 'move-folder-dialog',
      data: {}, // (optional) pass selected count later
    });
  }
}
