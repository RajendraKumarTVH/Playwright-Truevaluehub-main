import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { DigitalFactoryService } from '../../../Service/digital-factory.service';
import { BlockUiService } from 'src/app/shared/services/block-ui.service';
import { takeUntil } from 'rxjs/operators';
import { DfSupplierDirectoryMasterDto } from '../../../Models/df-supplier-directory-master-dto';
import { DigitalFactoryRouteLinks } from '../../Shared/digital-factory-route-links';
import { DigitalFactoryCommonService } from '../../Shared/digital-factory-common-service';
import { SearchBarModelDto } from 'src/app/shared/models/search-bar-model';
import { DFSupplierCountDetails } from '../../../Models/df-supplier-count-details';
import { SupplierDirectoryColumnDefinitions } from '../../Shared/supplier-table.column-definition';
import { PaginatorModule } from 'primeng/paginator';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-digital-factory-table',
  templateUrl: './digital-factory-table.component.html',
  styleUrls: ['./digital-factory-table.component.scss'],
  standalone: true,
  imports: [PaginatorModule, CommonModule, MatTableModule],
})
export class DigitalFactoryTableComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  displayedColumns: string[] = ['vendorName', 'missionStatement', 'countryName', 'regionName', 'state', 'companySizeBySales'];
  columnDefinitions = SupplierDirectoryColumnDefinitions.getColumnDefinition();
  dataSource = new MatTableDataSource();
  recordCount = 0;
  isLoaded = true;
  currentListingPage = 0;
  currentPageSize = 20;
  pageFirst = 0;
  @Input() searchModel?: SearchBarModelDto[] = [];
  @Output() supplierDataEmit = new EventEmitter<DFSupplierCountDetails>();

  @ViewChild(MatSort) sort!: MatSort;

  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private readonly router: Router,
    private readonly digitalFactoryService: DigitalFactoryService,
    private readonly digitalFactoryCommonService: DigitalFactoryCommonService,
    private blockUiService: BlockUiService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    const searchedValues = changes['searchModel']?.currentValue;
    if (searchedValues) {
      this.isLoaded = false;
      this.blockUiService.pushBlockUI('ngOnChanges');
      this.digitalFactoryService
        .getDigitalFactorySuppliers(0, 20, searchedValues)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (data) => {
            this.recordCount = data?.totalSuppliers;
            this.dataSource.data = data?.dfSupplierDirectoryMasterDtos;
            this.isLoaded = true;
            this.blockUiService.popBlockUI('paginatorPageChanged');
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
      .getDigitalFactorySuppliers(this.currentListingPage, this.currentPageSize, this.searchModel)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data: any) => {
          this.recordCount = data?.totalSuppliers;
          this.dataSource.data = data?.dfSupplierDirectoryMasterDtos;
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
      .getDigitalFactorySuppliers(this.currentListingPage, this.currentPageSize, this.searchModel)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data: any) => {
          this.recordCount = data?.totalSuppliers;
          this.dataSource.data = data?.dfSupplierDirectoryMasterDtos;
          this.supplierDataEmit.emit({
            totalSuppliers: data?.totalSuppliers,
            activeSuppliers: data?.dfSupplierDirectoryMasterDtos?.filter((r) => r.isActive)?.length ?? 0,
            categories: 23,
            countryList: data?.countries,
            regionList: data?.regions,
            tabIndex: 1,
          });
          this.blockUiService.popBlockUI('loadDigitalFactoryData');
        },
      });
  }

  onRowClick(row: DfSupplierDirectoryMasterDto) {
    this.router.navigate([DigitalFactoryRouteLinks.supplierInfo, row.supplierId]);
  }
}
