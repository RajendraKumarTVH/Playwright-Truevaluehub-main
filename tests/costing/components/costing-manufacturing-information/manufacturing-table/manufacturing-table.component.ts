import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, inject, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProcessInfoDto } from 'src/app/shared/models';
import { ProcessType } from 'src/app/modules/costing/costing.config';
import { ManufacturingConfigService } from 'src/app/shared/config/cost-manufacturing-config';
import { ProcessInfoService } from 'src/app/shared/services/process-info.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { MatIconModule } from '@angular/material/icon';
import { UserCanUpdateCostingState } from 'src/app/modules/_state/userCanUpdate-costing.state';
import { WiringHarnessConfig } from 'src/app/shared/config/wiring-harness-config';

@Component({
  selector: 'app-manufacturing-table',
  templateUrl: './manufacturing-table.component.html',
  styleUrls: ['./manufacturing-table.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatIconModule, MatTableModule, MatSortModule, MatIconModule, DragDropModule],
})
export class ManufacturingTableComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() machineInfoList: ProcessInfoDto[];
  @Input() selectedProcessInfoId: number;
  _store = inject(Store);
  _canUserUpdateCosting$: Observable<boolean> = this._store.select(UserCanUpdateCostingState.getCanUserUpdateCosting);
  canUpdate: boolean;
  @Output() addInfo = new EventEmitter<any>();
  @Output() editInfo = new EventEmitter<any>();
  @Output() deleteInfo = new EventEmitter<any>();
  processTypeId = ProcessType;
  displayedColumns: string[] = ['sl', 'processType', 'subProcessType', 'machineDetails', 'machineDescription', 'co2', 'cost', 'action'];
  dataSource = new MatTableDataSource([]);
  @ViewChild(MatSort) sort!: MatSort;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  orderedList = [];
  totalCo2Cost = 0;
  totalCost = 0;

  constructor(
    public _manufacturingConfig: ManufacturingConfigService,
    private processInfoService: ProcessInfoService,
    private wiringHarnessConfig: WiringHarnessConfig
  ) {
    this._canUserUpdateCosting$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: boolean) => {
      this.canUpdate = result;
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.machineInfoList && changes.machineInfoList.previousValue !== changes.machineInfoList.currentValue) {
      if (
        !(
          changes.machineInfoList.previousValue?.length > 0 &&
          changes.machineInfoList.currentValue?.length > 0 &&
          changes.machineInfoList.previousValue[0].partInfoId === changes.machineInfoList.currentValue[0].partInfoId
        )
      ) {
        // first time or part change detected
        this.orderedList = [];
      } else {
        //if (changes.machineInfoList.previousValue?.length < changes.machineInfoList.currentValue?.length) { // add detected
        this.machineInfoList = this.machineInfoList.map((x) => {
          const s = this.orderedList.find((y) => y.id === x.processInfoId)?.sortOrder;
          return s >= 0 ? { ...x, sortOrder: s } : { ...x };
        }); // update sort order in process list

        this.machineInfoList.forEach((x) => {
          if (!this.orderedList.map((y) => y.sortOrder).includes(x.sortOrder)) {
            this.orderedList.push({ id: x.processInfoId, sortOrder: x.sortOrder }); // add sort entry in ordered list
          }
        });

        const deletedSortOrder = [];
        const orderedList = [...this.orderedList];
        this.orderedList.forEach((x, i) => {
          if (!this.machineInfoList.map((y) => y.sortOrder).includes(x.sortOrder)) {
            orderedList.splice(i, 1); // remove sort entry in ordered list
            deletedSortOrder.push(x.sortOrder);
          }
        });
        this.orderedList = orderedList;

        deletedSortOrder.forEach((x) => {
          this.machineInfoList = this.machineInfoList.map((y) => (y.sortOrder > x ? { ...y, sortOrder: y.sortOrder - 1 } : y));
          this.orderedList = this.orderedList.map((y) => (y.sortOrder > x ? { ...y, sortOrder: y.sortOrder - 1 } : y));
        }); // resorting order based on deleted entries

        deletedSortOrder?.length > 0 && this.orderedList.length > 0 && this.dataSource.data?.length > 0 && this.updateSortOrder();
      }
      this.machineInfoList.sort((a, b) => a.sortOrder - b.sortOrder);
      this.dataSource.data = this.machineInfoList;
      this.totalCo2Cost = this.machineInfoList.reduce((acc, row) => acc + (row.esgImpactFactoryImpact || 0), 0);
      this.totalCost = this.machineInfoList.reduce((acc, row) => acc + (row.directProcessCost || 0), 0);
    }
  }

  getSubTypeNamebyId(processInfo: ProcessInfoDto) {
    if (processInfo.processTypeID === ProcessType.ColdHeading || processInfo.processTypeID === ProcessType.ClosedDieForging) {
      return this._manufacturingConfig._manufacturingForgingSubProcessConfigService.getSubTypeNamebyId(processInfo);
    } else if ([ProcessType.Stage, ProcessType.Progressive].includes(processInfo.processTypeID)) {
      return this._manufacturingConfig._sheetMetalConfig.getSubTypeNamebyId(processInfo);
    } else if (
      [
        ProcessType.CablePreparation,
        ProcessType.LineAssembly,
        ProcessType.FinalInspection,
        ProcessType.ConduitTubeSleeveHSTPreparation,
        ProcessType.FunctionalTestCableHarness,
        ProcessType.EMPartAssemblyTesting,
      ].includes(processInfo.processTypeID)
    ) {
      return this.wiringHarnessConfig.getSubTypeNamebyId(processInfo);
    } else {
      return this._manufacturingConfig._electronics.getSubTypeNamebyId(processInfo);
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    const data = this.dataSource.data;
    console.log(event);
    moveItemInArray(data, event.previousIndex, event.currentIndex);
    this.dataSource.data = [...data];
    this.dataSource.sort = this.sort;
    // console.log(this.dataSource.data.map((x, i) => ({ id: x.processInfoId, sortOrder: i })));
    this.orderedList = this.dataSource.data.map((x, i) => ({ id: x.processInfoId, sortOrder: i }));
    this.dataSource.data?.length > 0 && this.updateSortOrder();
  }

  private updateSortOrder() {
    this.processInfoService
      .updateSortOrder(this.machineInfoList[0].partInfoId, this.orderedList)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {});
  }

  addMachineInfo() {
    this.addInfo.emit();
  }

  onEditRowClick(row) {
    this.editInfo.emit(row);
  }

  onDeleteClick(id) {
    this.deleteInfo.emit(id);
  }

  onDeleteAllClick() {
    this.deleteInfo.emit(0);
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
