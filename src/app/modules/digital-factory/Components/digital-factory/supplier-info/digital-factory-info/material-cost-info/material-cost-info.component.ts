import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DfMaterialInfoDto } from 'src/app/modules/digital-factory/Models/df-material-info-dto';
import { MaterialMasterService } from 'src/app/shared/services/material-master.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { BlockUiService } from 'src/app/shared/services/block-ui.service';
import { MaterialSearchResultDto } from 'src/app/shared/models/material-search-result-dto';
import { DigitalFactoryDtoNew } from 'src/app/modules/digital-factory/Models/digital-factory-dto';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { CountryDataMasterDto } from 'src/app/shared/models/country-data-master.model';
import { Store } from '@ngxs/store';
import { MaterialCostInfoTableConfig } from './material-cost-info-table-config';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { PriceChartComponent } from './price-chart/price-chart.component';
import { AddMaterialComponent } from './add-material-modal/add-material-modal.component';

@Component({
  selector: 'app-material-cost-info',
  templateUrl: './material-cost-info.component.html',
  styleUrls: ['./material-cost-info.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatTableModule, MatTabsModule, PriceChartComponent, AddMaterialComponent],
})
export class MaterialCostInfoComponent implements OnInit, OnDestroy {
  @Input() digitalFactoryInfo?: DigitalFactoryDtoNew;
  @ViewChild(MatSort) sort!: MatSort;
  materialInfoList: DfMaterialInfoDto[] = [];
  currentEditingMaterialInfo?: DfMaterialInfoDto;
  isSaveEnabled = false;
  columnConfig = {};
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource();
  countryList: CountryDataMasterDto[] = [];
  _countryMaster$: Observable<CountryDataMasterDto[]>;
  showAddMaterialForm = false;
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private readonly store: Store,
    private readonly materialMasterService: MaterialMasterService,
    private readonly digitalFactoryService: DigitalFactoryService,
    private readonly blockUiService: BlockUiService,
    private readonly messaging: MessagingService
  ) {
    this._countryMaster$ = this.store.select(CountryDataState.getCountryData);
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.setCountryList();
    this.setDataSource();
    this.columnConfig = MaterialCostInfoTableConfig.getColumnConfig();
    this.displayedColumns = MaterialCostInfoTableConfig.getDisplayColumns();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addMaterialInfo() {
    this.currentEditingMaterialInfo = undefined;
    this.showAddMaterialForm = false;
    setTimeout(() => {
      this.showAddMaterialForm = true;
    });
  }

  onMaterialRemove(materialInfo: DfMaterialInfoDto) {
    const dialogRef = this.messaging.openConfirmationCustomizedDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Delete Material',
        message: 'Are you sure to delete this Material ?',
        actionText: 'Delete',
        cancelText: 'Cancel',
      },
      height: 'min-content',
      width: '50vh',
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.digitalFactoryService
          .removeDigitalFactoryMaterialCostInfo(materialInfo)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: (response) => {
              this.materialInfoList = this.materialInfoList.filter((x) => x.digitalFactoryMaterialInfoId !== response.digitalFactoryMaterialInfoId);
              this.dataSource.data = this.materialInfoList;
              this.onInputChange(this.materialInfoList[0]);
            },
          });
      }
    });
  }

  onInputChange(materialInfo?: DfMaterialInfoDto) {
    this.currentEditingMaterialInfo = materialInfo;
    this.showAddMaterialForm = false;
    setTimeout(() => {
      this.showAddMaterialForm = this.materialInfoList?.length !== 0;
    });
  }

  onMaterialAdded(event: DfMaterialInfoDto) {
    const existingMaterial = this.materialInfoList.find((x) => x.materialMasterId === event.materialMasterId);
    if (existingMaterial) {
      Object.assign(existingMaterial, event);
      this.dataSource.data = this.materialInfoList;
      this.onInputChange(existingMaterial);
      return;
    }
    this.materialInfoList.push(event);
    this.dataSource.data = this.materialInfoList;
    this.onInputChange(event);
  }

  private setCountryList() {
    this._countryMaster$.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      this.countryList = res;
    });
  }

  private setDataSource(): void {
    if (this.digitalFactoryInfo?.digitalFactoryMaterialInfos?.length === 0) return;
    this.materialInfoList = this.digitalFactoryInfo.digitalFactoryMaterialInfos;
    const materialMasterIds = this.materialInfoList.map((m) => m.materialMasterId);
    this.blockUiService.pushBlockUI('setDataSource');
    this.materialMasterService
      .getMaterialDataByMaterialMasterIds(materialMasterIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: MaterialSearchResultDto[]) => {
          this.materialInfoList.forEach((m) => {
            const matInfo = result.find((x) => x.materialDescId === m.materialMasterId);
            if (matInfo) {
              m.materialGroup = matInfo.materialGroupName;
              m.materialType = matInfo.materialTypeName;
              m.materialDescription = matInfo.materialDescription;
              m.materialGroupId = matInfo.materialGroupId;
              m.materialTypeId = matInfo.materialTypeId;
            }
            m.countryOfOriginName = this.countryList?.find((x) => x.countryId === m.countryOfOrigin)?.countryName;
          });
          this.dataSource.data = this.materialInfoList;
          // NEW: select first row by default
          if (this.materialInfoList.length > 0) {
            this.onInputChange(this.materialInfoList[0]);
          }
          this.blockUiService.popBlockUI('setDataSource');
        },
      });
  }
}
