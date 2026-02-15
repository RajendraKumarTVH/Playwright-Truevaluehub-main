import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DfMachineInfoDto } from 'src/app/modules/digital-factory/Models/df-machine-info-dto';
import { BlockUiService } from 'src/app/shared/services/block-ui.service';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MedbMasterService } from 'src/app/shared/services/medb-master.service';
import { DfMedbMachineMasterInfoDto, MachineRequestDto } from 'src/app/shared/models/medb-machine.model';
import { DigitalFactoryDtoNew } from 'src/app/modules/digital-factory/Models/digital-factory-dto';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MachineCostInfoTableConfig } from './machine-cost-info-table-config';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DfActionEnum } from 'src/app/modules/digital-factory/Models/df-action-enum';
import { AddMachineModalComponent } from './add-machine-modal/add-machine-modal.component';

@Component({
  selector: 'app-machine-cost-info',
  templateUrl: './machine-cost-info.component.html',
  styleUrls: ['./machine-cost-info.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatTableModule, AddMachineModalComponent],
})
export class MachineCostInfoComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() digitalFactoryInfo?: DigitalFactoryDtoNew;
  @ViewChild(MatSort) sort!: MatSort;

  machineInfoList: DfMachineInfoDto[] = [];
  currentEditingMachineInfo?: DfMachineInfoDto;
  isSaveEnabled = false;
  columnConfig = {};
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource();

  materialProcessGroupListControl = new FormControl();
  manufacturingCategoryControl = new FormControl();
  machineNameListControl = new FormControl();
  showAddMachineForm = false;
  machineInfoMode: DfActionEnum = DfActionEnum.Add;
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private readonly digitalFactoryService: DigitalFactoryService,
    private readonly blockUiService: BlockUiService,
    private readonly medbMasterService: MedbMasterService,
    private readonly messaging: MessagingService
  ) {}

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.setDataSource();
    this.columnConfig = MachineCostInfoTableConfig.getColumnConfig();
    this.displayedColumns = MachineCostInfoTableConfig.getDisplayColumns();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addMachineInfo() {
    this.currentEditingMachineInfo = undefined;
    this.showAddMachineForm = false;
    setTimeout(() => {
      this.showAddMachineForm = true;
    });
  }

  onMachineRemove(machineInfo: DfMachineInfoDto) {
    const dialogRef = this.messaging.openConfirmationCustomizedDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Delete Machine',
        message: 'Are you sure to delete this Machine ?',
        actionText: 'Delete',
        cancelText: 'Cancel',
      },
      height: 'min-content',
      width: '50vh',
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.blockUiService.pushBlockUI('onMachineRemove');
        this.digitalFactoryService
          .removeDigitalFactoryMachineCostInfo(machineInfo)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: (response) => {
              this.machineInfoList = this.machineInfoList.filter((x) => x.digitalFactoryMachineInfoId !== response.digitalFactoryMachineInfoId);
              this.dataSource.data = this.machineInfoList;
              this.onInputChange(this.machineInfoList[0]);
              this.blockUiService.popBlockUI('onMachineRemove');
            },
          });
      }
    });
  }

  onInputChange(machineInfo?: DfMachineInfoDto) {
    this.currentEditingMachineInfo = machineInfo;
    this.showAddMachineForm = false;
    setTimeout(() => {
      this.showAddMachineForm = this.machineInfoList?.length !== 0;
    });
  }

  private setDataSource(): void {
    if (!this.digitalFactoryInfo?.digitalFactoryMachineInfos) return;
    this.machineInfoList = this.digitalFactoryInfo?.digitalFactoryMachineInfos;
    const machineRequestDtos: MachineRequestDto[] = this.machineInfoList.map((m) => ({
      machineMasterId: m.machineMasterId,
      processTypeId: m.processTypeId,
      processId: m.processMasterId,
    }));
    if (machineRequestDtos?.length === 0) return;
    this.blockUiService.pushBlockUI('setDataSource');
    this.medbMasterService
      .getDfMedbMachineMasterByIds(machineRequestDtos)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: DfMedbMachineMasterInfoDto[]) => {
          this.machineInfoList.forEach((m) => {
            const machineInfo = result.find((x) => x.machineId === m.machineMasterId);
            if (machineInfo) {
              m.processName = machineInfo.processName;
              m.manufacturingCategory = machineInfo.processTypeName;
              m.machineName = machineInfo.machineName;
              m.processMasterId = machineInfo.processId;
              m.processTypeId = machineInfo.processTypeId;
            }
          });
          this.dataSource.data = this.machineInfoList;
          console.log('source', this.dataSource.data);
          // NEW: select first row by default
          if (this.machineInfoList.length > 0) {
            this.onInputChange(this.machineInfoList[0]);
          }
          this.blockUiService.popBlockUI('setDataSource');
        },
      });
  }

  onMachineAddedOrUpdated(event: DfMachineInfoDto) {
    const existingMachine = this.machineInfoList.find((x) => x.machineMasterId === event.machineMasterId);
    if (existingMachine) {
      Object.assign(existingMachine, event);
      this.currentEditingMachineInfo = existingMachine;
      this.dataSource.data = this.machineInfoList;
      return;
    }
    this.machineInfoList.push(event);
    this.dataSource.data = this.machineInfoList;
    this.currentEditingMachineInfo = event;
  }
}
