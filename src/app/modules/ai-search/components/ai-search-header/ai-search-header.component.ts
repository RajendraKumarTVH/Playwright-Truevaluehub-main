import { Component, ViewChild, ElementRef, Output, EventEmitter, AfterViewInit, OnInit } from '@angular/core';
import { Popover, PopoverModule } from 'primeng/popover';
import { Listbox, ListboxModule } from 'primeng/listbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AiSearchService } from 'src/app/shared/services';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { UserService } from 'src/app/modules/settings/Services/user.service';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { CommodityMasterDto } from 'src/app/shared/models/commodity-master.model';
import { Store } from '@ngxs/store';
import { CommodityState } from 'src/app/modules/_state/commodity.state';
import { SearchBarModelDto } from 'src/app/shared/models/search-bar-model';
import { UserModel } from 'src/app/modules/settings/models';
import { ImageSearchModalComponent } from '../image-search-modal/image-search-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { AiSearchHelperService } from '../../services/ai-search-helper-service';

interface SearchFilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-ai-search-header',
  imports: [PopoverModule, ListboxModule, MatIconModule, FormsModule, CommonModule, ProgressSpinnerModule],
  templateUrl: './ai-search-header.component.html',
  styleUrl: './ai-search-header.component.scss',
})
export class AiSearchHeaderComponent implements OnInit, AfterViewInit {
  @ViewChild('filterMenuPopover') filterMenuPopover!: Popover;
  @ViewChild('multiSelectPopover') multiSelectPopover!: Popover;
  @Output() imageUpload = new EventEmitter<FileList | null>();
  @ViewChild('filterContainer', { read: ElementRef }) filterContainerRef!: ElementRef;
  @ViewChild('listBox') listBox!: Listbox;
  isFilterPopoverOpen = false;
  // called by the file input in the template
  onImageSimilarityUpload(files: FileList | null) {
    this.imageUpload.emit(files);
  }
  options: SearchFilterOption[] = [];
  defaultList: { [key: string]: SearchFilterOption[] } = {};
  loading = false;
  _commodityMaster$: Observable<CommodityMasterDto[]>;

  activeFilterKey?: string;
  selectedValues: { [key: string]: string[] } = {};
  appliedFilterCount: { [key: string]: number } = {};
  filters: SearchBarModelDto[] = [];
  userDict: { [key: number]: UserModel } = {};
  mfgCategoryDict: { [key: number]: CommodityMasterDto } = {};

  filterLabels: { [key: string]: string } = {
    partNumber: 'Part Number',
    projectNumber: 'Project Number',
    partDescription: 'Part Description',
    tags: 'Tags',
    drawingNumber: 'Drawing Number',
    projectStatus: 'Project Status',
    createdBy: 'Created by',
    createdDate: 'Created Date',
    manufacturingCategory: 'Mfg Category',
    processGroup: 'Process Group',
    mfgCity: 'Mfg City',
    mfgCountry: 'Mfg Country',
    materialType: 'Material Type',
    materialGrade: 'Material Grade',
  };
  currentViewMode: 'grid' | 'column' | 'table' | 'chart' = 'grid';
  private readonly clientFilters = ['createdBy', 'mfgCity', 'mfgCountry'];
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private readonly filterText$ = new Subject<string>();

  constructor(
    private readonly aiSearchService: AiSearchService,
    private readonly userService: UserService,
    private readonly userInfoService: UserInfoService,
    private readonly _store: Store,
    private readonly searchHelper: AiSearchHelperService,
    private readonly dialog: MatDialog
  ) {
    this.filterText$.pipe(debounceTime(1000)).subscribe((filter) => {
      if (this.clientFilters.includes(this.activeFilterKey)) {
        return;
      }
      this.loadOptionsFromApi(filter);
    });
    this._commodityMaster$ = this._store.select(CommodityState.getCommodityData);
  }

  ngOnInit(): void {
    this.userInfoService.getUserValue().subscribe((user) => {
      const clientId = user?.clientId;
      if (clientId) {
        this.userService.getUsersByClientId(clientId).subscribe((users) => {
          this.userDict = users.map((x) => ({ [x.userId ?? 0]: x })).reduce((a, b) => ({ ...a, ...b }), {});
          this.defaultList['createdBy'] = users.map((x) => ({ label: x.userName, value: x.userId?.toString() }));
        });
      }
    });
    this.loadCommodityData();
  }

  ngAfterViewInit() {
    const filterElements = this.listBox.el.nativeElement.getElementsByClassName('p-listbox-filter');
    const input = filterElements.length > 0 ? (filterElements[0] as HTMLInputElement) : null;
    if (input) {
      input.addEventListener('input', (event: any) => {
        const filterValue = event.target.value.trim();
        this.filterText$.next(filterValue);
      });
    }
    // Load initial options
    this.loadOptionsFromApi('');
  }

  loadOptionsFromApi(filter: string) {
    if (!this.activeFilterKey || this.activeFilterKey === '') {
      return;
    }
    this.loading = true;
    this.aiSearchService
      .getFilterValues(this.activeFilterKey, filter)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.options = data.map((x) => {
            return { label: x, value: x };
          });
          this.addToDefaultList();
          this.loading = false;
        },
        error: () => {
          this.options = [];
          this.loading = false;
        },
        complete: () => {
          this.options = [];
          this.loading = false;
        },
      });
  }

  addToDefaultList() {
    if (this.activeFilterKey && this.activeFilterKey !== '') {
      this.defaultList[this.activeFilterKey] ??= this.options;
    }
  }

  openMultiSelect(key: string, event?: Event) {
    // stop clicks from bubbling so outside-click handlers don't close the popover
    event?.stopPropagation?.();

    this.activeFilterKey = key;
    if (!this.selectedValues[key]) this.selectedValues[key] = [];

    // ensure the popover overlay is visible (toggle button usually opened it; call show to be safe)
    try {
      this.filterMenuPopover?.show?.(event as any);
    } catch {}
    // optional: small delay to allow popover to reflow before any positioning logic
    // setTimeout(() => { /* reposition logic if needed */ }, 0);
    if (!this.defaultList[this.activeFilterKey] || this.defaultList[this.activeFilterKey]?.length === 0) {
      this.loadOptionsFromApi('');
    } else {
      this.options = this.defaultList[this.activeFilterKey];
    }
  }

  closeAll() {
    this.activeFilterKey = '';
    try {
      this.filterMenuPopover?.hide?.();
    } catch {}
  }
  closeSubmenu() {
    this.activeFilterKey = undefined;
    // optional: clear current options to show left menu items again
    this.options = [];
  }

  getFilterLabel(key: string): string {
    return this.filterLabels[key] || key;
  }

  onCheckboxSelect(event: any) {
    const filterValues = event.value;
    this.appliedFilterCount[this.activeFilterKey] = filterValues.length;
    this.filters = this.filters.filter((f) => f.searchKey !== this.activeFilterKey);
    for (const val of filterValues) {
      this.filters.push({
        searchLabel: this.getFilterLabel(this.activeFilterKey || ''),
        searchKey: this.activeFilterKey,
        searchType: 'Is',
        searchValue: val,
        index: 0,
      });
    }
    this.appliedFilterCount[this.activeFilterKey] = this.filters.filter((f) => f.searchKey === this.activeFilterKey).length;
    this.searchHelper.$filterChanged.next(this.filters);
  }

  removeAllFilters() {
    this.filters = [];
    this.appliedFilterCount = {};
    this.selectedValues = {};
    this.searchHelper.$filterChanged.next(this.filters);
  }

  removeFilter(filterToRemove: SearchBarModelDto) {
    const filterKey = this.activeFilterKey || filterToRemove.searchKey;
    this.filters = this.filters.filter((f) => !(f.searchKey === filterToRemove.searchKey && f.searchValue === filterToRemove.searchValue));
    this.appliedFilterCount[filterKey] = this.filters.filter((f) => f.searchKey === filterToRemove.searchKey).length;
    this.selectedValues[filterKey] = this.selectedValues[filterKey].filter((v) => v !== filterToRemove.searchValue);
    this.searchHelper.$filterChanged.next(this.filters);
  }

  private loadCommodityData() {
    this._commodityMaster$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: CommodityMasterDto[]) => {
      this.mfgCategoryDict = result.map((x) => ({ [x.commodityId ?? 0]: x })).reduce((a, b) => ({ ...a, ...b }), {});
      this.defaultList['manufacturingCategory'] = result.map((x) => ({ label: x.commodity, value: x.commodityId?.toString() }));
    });
  }
  onFilterPopoverShow() {
    this.isFilterPopoverOpen = true;
  }

  onFilterPopoverHide() {
    this.isFilterPopoverOpen = false;
  }

  switchView(viewMode: 'grid' | 'column' | 'table' | 'chart') {
    this.currentViewMode = viewMode;
    this.searchHelper.$viewModeChanged.next(viewMode);
  }
  openImageSearchDialog() {
    this.dialog.open(ImageSearchModalComponent, {
      width: '500px',
      disableClose: false,
      panelClass: 'image-search-dialog-panel',
    });
  }
}
