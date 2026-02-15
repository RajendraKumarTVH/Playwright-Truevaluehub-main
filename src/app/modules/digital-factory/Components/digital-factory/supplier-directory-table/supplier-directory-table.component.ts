import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DigitalFactoryService } from '../../../Service/digital-factory.service';
import { DfSupplierDirectoryMasterDto } from '../../../Models/df-supplier-directory-master-dto';
import { DFSupplierCountDetails } from '../../../Models/df-supplier-count-details';
import { Router } from '@angular/router';
import { DigitalFactoryRouteLinks } from '../../Shared/digital-factory-route-links';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DfSupplierDirectoryTableListDto } from '../../../Models/df-supplier-directory-table-list-dto';
import { BlockUiService } from 'src/app/shared/services';
import { SearchBarModelDto } from 'src/app/shared/models/search-bar-model';
import { SupplierDirectoryColumnDefinitions } from '../../Shared/supplier-table.column-definition';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-supplier-directory-table',
  templateUrl: './supplier-directory-table.component.html',
  styleUrls: ['./supplier-directory-table.component.scss'],
  standalone: true,
  imports: [CommonModule, PaginatorModule, MatTableModule, MatSortModule],
})
export class SupplierDirectoryTableComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  displayedColumns: string[] = ['vendorName', 'missionStatement', 'countryName', 'regionName', 'state', 'companySizeBySales'];
  columnDefinitions = SupplierDirectoryColumnDefinitions.getColumnDefinition();
  dataSource = new MatTableDataSource();
  recordCount = 0;
  isLoaded = true;
  currentListingPage = 0;
  currentPageSize = 20;
  pageFirst = 0;
  @Input() searchModel?: SearchBarModelDto[];
  @Output() supplierDataEmit = new EventEmitter<DFSupplierCountDetails>();

  @ViewChild(MatSort) sort: MatSort = {} as MatSort;

  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private readonly router: Router,
    private readonly digitalFactoryService: DigitalFactoryService,
    private blockUiService: BlockUiService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    const searchedValues = changes['searchModel']?.currentValue;
    if (searchedValues) {
      this.isLoaded = false;
      this.blockUiService.pushBlockUI('ngOnChanges');
      this.digitalFactoryService
        .getFilteredDigitalFactorySuppliers(0, 20, searchedValues)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (result: DfSupplierDirectoryTableListDto) => {
            this.recordCount = result?.totalSuppliers;
            this.dataSource.data = result?.dfSupplierDirectoryMasterDtos;
            this.isLoaded = true;
            this.supplierDataEmit.emit({
              totalSuppliers: result?.totalSuppliers,
              activeSuppliers: result?.dfSupplierDirectoryMasterDtos?.filter((r) => r.isActive)?.length,
              categories: 23,
              countryList: result?.countries,
              regionList: result?.regions,
              tabIndex: 0,
            });
            this.blockUiService.popBlockUI('ngOnChanges');
          },
        });
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    this.setDataSource();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  paginatorPageChanged(event: any) {
    this.currentListingPage = event.page;
    this.isLoaded = false;
    this.currentPageSize = event.rows;
    this.pageFirst = event.first;
    this.blockUiService.pushBlockUI('paginatorPageChanged');
    this.digitalFactoryService
      .getFilteredDigitalFactorySuppliers(this.currentListingPage, this.currentPageSize, this.searchModel)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: DfSupplierDirectoryTableListDto) => {
          this.recordCount = result?.totalSuppliers;
          this.dataSource.data = result?.dfSupplierDirectoryMasterDtos;
          this.isLoaded = true;
          this.blockUiService.popBlockUI('paginatorPageChanged');
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  private setDataSource(): void {
    this.blockUiService.pushBlockUI('loadDigitalFactoryData');
    this.digitalFactoryService
      .getSuppliers()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: DfSupplierDirectoryTableListDto) => {
          this.recordCount = result?.totalSuppliers;
          this.dataSource.data = result?.dfSupplierDirectoryMasterDtos;
          this.supplierDataEmit.emit({
            totalSuppliers: result?.totalSuppliers,
            activeSuppliers: result?.dfSupplierDirectoryMasterDtos?.filter((r) => r.isActive)?.length,
            categories: 23,
            countryList: result?.countries,
            regionList: result?.regions,
            tabIndex: 0,
          });
          this.searchModel = this.searchModel ?? [];
          this.blockUiService.popBlockUI('loadDigitalFactoryData');
        },
      });
  }

  onRowClick(row: DfSupplierDirectoryMasterDto) {
    this.router.navigate([DigitalFactoryRouteLinks.supplierInfo, row.supplierId]);
  }
}
