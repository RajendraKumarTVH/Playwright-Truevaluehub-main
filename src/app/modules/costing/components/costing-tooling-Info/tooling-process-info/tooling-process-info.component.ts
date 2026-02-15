import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
import { CostToolingDto, ToolingProcessInfoDto } from 'src/app/shared/models/tooling.model';
import { ScreeName } from 'src/app/modules/costing/costing.config';
import { ToolingProcessMappingService } from 'src/app/shared/mapping/tooling-process-mapping.service';
import { Store } from '@ngxs/store';
import { first } from 'rxjs/operators';
import { MessagingService, ConfirmationDialogConfig } from 'src/app/messaging/messaging.service';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { Subscription } from 'rxjs';
// import * as ToolingInfoActions from 'src/app/modules/_actions/tooling-info.action';
import { CostingToolingProcessConfigService } from 'src/app/shared/config/costing-tooling-process-config.service';
import { ToolingHelperService } from 'src/app/shared/helpers/tooling-helper.service';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { ToolingManufacturingTableComponent } from './tooling-manufacturing-table/tooling-manufacturing-table.component';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { CostToolingSignalsService } from 'src/app/shared/signals/cost-tooling-signals.service';
@Component({
  selector: 'app-process-info',
  templateUrl: './tooling-process-info.component.html',
  styleUrls: ['./tooling-process-info.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, ToolingManufacturingTableComponent, NgbPopover, MatIconModule],
})
export class ToolingProcessInfoComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() toolingFormGroup: FormGroup;
  @Input() compVals: any;
  @Input() canUpdate: boolean = false;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() actionEmitter = new EventEmitter<any>();
  public processGroupList: any = [];
  public dialogSub: Subscription;
  processFlags = this._toolingProcessConfig.processFlags;
  commodity = this._toolConfig.commodity;
  public isEnableUnitConversion = false;
  public conversionValue: any;
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;
  url = '';
  name = 'World';
  show = false;
  constructor(
    public _toolConfig: ToolingConfigService,
    public _toolingProcessConfig: CostingToolingProcessConfigService,
    public _processMapper: ToolingProcessMappingService,
    private messaging: MessagingService,
    private _store: Store,
    public sharedService: SharedService,
    public _toolingHelper: ToolingHelperService,
    private toolingInfoSignalsService: CostToolingSignalsService
  ) {}

  ngOnInit(): void {
    if (this.compVals.currentPart?.commodityId) {
      this.processGroupList = this._toolingProcessConfig.getProcessGroups(this.compVals.currentPart?.commodityId);
    }
    [this.isEnableUnitConversion, this.conversionValue] = this.sharedService.setUnitMeasurement();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['compVals'] && changes['compVals'].currentValue) {
      if (changes['compVals'].currentValue?.currentPart?.commodityId != changes['compVals'].previousValue?.currentPart?.commodityId) {
        this.processGroupList = this._toolingProcessConfig.getProcessGroups(this.compVals.currentPart?.commodityId);
      }
      this.processToolingProcessInfoList();
    }
  }

  processToolingProcessInfoList() {
    this.compVals.toolingProcessInfoList = this.compVals.toolingProcessInfoList?.map((process) => {
      return {
        ...process,
        totalProcessCost: this.sharedService.isValidNumber(process.totalProcessCost),
      };
    });
  }

  setProcessEntrySelection() {
    if (this.compVals.toolingProcessInfoList && this.compVals.toolingProcessInfoList.length > 0) {
      if (this._toolConfig.addNewFlags.isNewProcess) {
        this.onEditProcessInfo(this.compVals.toolingProcessInfoList[this.compVals.toolingProcessInfoList.length - 1]);
      } else if (this.compVals.selectedToolProcessId) {
        const process = this.compVals.toolingProcessInfoList.find((x) => x.toolingProcessId == this.compVals.selectedToolProcessId);
        this.onEditProcessInfo(process ? process : this.compVals.toolingProcessInfoList[0]);
      } else {
        this.onEditProcessInfo(this.compVals.toolingProcessInfoList[0]);
      }
    }
  }

  addProcess() {
    this._toolConfig.addNewFlags.isNewProcess = true;
    this.compVals.selectedToolProcessId = 0;
    const processInfo = new ToolingProcessInfoDto();
    processInfo.toolingId = this.compVals.selectedToolId;
    // this._store.dispatch(new ToolingInfoActions.SaveToolingProcessInfo(processInfo, this.compVals.currentPart?.partInfoId));
    this.toolingInfoSignalsService.saveToolingProcessInfo(processInfo, this.compVals.currentPart?.partInfoId);
    const emitData: any = { selectedToolProcessId: 0 };
    this.emitAction('add', emitData, () => {});
  }

  onEditProcessInfo(process: ToolingProcessInfoDto) {
    this.compVals.selectedToolProcessId = process?.toolingProcessId;
    this.compVals.selectedProcess = process;
    const fieldColor = this.compVals.toolingFieldColorsList?.filter((x) => x.primaryId == this.compVals.selectedToolProcessId && x.screenId == ScreeName.ToolingManufacturing);
    fieldColor?.forEach((element) => {
      const control = this.formGroup.get(element.formControlName);
      element.isTouched && control?.markAsTouched();
      element.isDirty && control?.markAsDirty();
    });
    this.formGroup.patchValue(this._processMapper.onEditProcessPatch(process));
    const emitData: any = {
      selectedProcess: this.compVals.selectedProcess,
      selectedToolProcessId: this.compVals.selectedToolProcessId,
    };
    this.emitAction('edit', emitData, () => {});
    this.processFlags = { ...this._toolingProcessConfig.processFlags, ...this._toolingProcessConfig.setProcessFlagsOnEditProcessInfo(this.compVals.currentPart.commodityId, process?.processGroupId) };
  }

  onDeleteProcessClick(processId: number) {
    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Confirm Delete',
        message: 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
        action: 'CONFIRM',
        cancelText: 'CANCEL',
      },
    });
    this.dialogSub = dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((confirmed: boolean) => {
        if (processId && confirmed) {
          const toolinglist = this.compVals.toolInfoList.find((x) => x.toolingId == this.compVals.selectedToolId);
          // this.emitAction('setTotalperCost', toolinglist, (toolingCost: number) => {
          let toolingCost = this._toolingHelper.setTotalperCost(toolinglist, this.compVals.currentPart?.commodityId);
          const deletedData = toolinglist.toolingProcessInfos?.find((x) => x.toolingProcessId == processId);
          toolingCost = toolingCost - Number(deletedData?.totalProcessCost || 0);
          let costTooling = new CostToolingDto();
          toolinglist.toolingProcessInfos = toolinglist.toolingProcessInfos.filter((x) => x.toolingProcessId !== processId);
          costTooling = { ...costTooling, ...toolinglist };
          costTooling.toolingCost = toolingCost;
          // this._store.dispatch(new ToolingInfoActions.DeleteToolingProcessInfo(this.compVals.currentPart?.partInfoId, processId));
          this.toolingInfoSignalsService.deleteToolingProcessInfo(this.compVals.currentPart?.partInfoId, processId);
          this.compVals.toolingProcessInfoList = this.compVals.toolingProcessInfoList?.filter((x: { toolingProcessId: number }) => x.toolingProcessId != processId);
          this.messaging.openSnackBar(`Data has been Deleted.`, '', { duration: 5000 });
          // this.emitAction('savetoolingTotalCostPart', costTooling, () => { });
          this._toolingHelper.savetoolingTotalCostPart(costTooling, this.toolingFormGroup.controls, this.conversionValue, this.isEnableUnitConversion, this.commodity, this.compVals.currentPart);
          // });
          if (this.compVals.toolingProcessInfoList && this.compVals.toolingProcessInfoList.length > 0) {
            this.compVals.selectedToolProcessId = this.compVals.toolingProcessInfoList[this.compVals.toolingProcessInfoList.length - 1].toolingProcessId;
          } else {
            this.compVals.selectedToolProcessId = 0;
            this._toolingProcessConfig.processInfo.totCost = 0;
          }
          const emitData: any = { selectedToolProcessId: this.compVals.selectedToolProcessId };
          this.emitAction('delete', emitData, () => {});
        }
      });
  }

  processGroupChange(event: any) {
    const processGroupId = event.currentTarget.value;
    this.processFlags = { ...this._toolingProcessConfig.processFlags, ...this._toolingProcessConfig.setProcessFlagsOnEditProcessInfo(this.compVals.currentPart.commodityId, processGroupId) };
    this.calculateProcessCost();
  }

  calculateProcessCost() {
    this.doCalculateCost.emit({});
  }

  private emitAction(type: string, data: any, callback: (toolingCost?: number) => void): void {
    this.actionEmitter.emit({ type, data, callback });
  }
  showinfo(filterValue: string) {
    let objdesc;
    if (this.lstdescriptions && this.lstdescriptions?.length > 0) {
      objdesc = this.lstdescriptions?.find((item: { id: string }) => item.id.toLowerCase() === filterValue.toLowerCase());
    }

    if (!!objdesc) {
      this.url = objdesc.imageUrl;
      this.show = !!this.url;
      this.name = objdesc.descriptions?.replace(/\n/g, '<br>') || '';
    }
  }
}
