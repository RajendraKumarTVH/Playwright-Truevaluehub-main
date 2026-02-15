import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { BopCostToolingDto, CostToolingDto } from 'src/app/shared/models/tooling.model';
import { Subscription } from 'rxjs';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { first } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { ToolingBopInfoMappingService } from 'src/app/shared/mapping/tooling-bop-info-mapping.service';
import { CommodityType, ScreeName } from 'src/app/modules/costing/costing.config';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
// import * as ToolingInfoActions from 'src/app/modules/_actions/tooling-info.action';
import { CostingToolingBopConfigService } from 'src/app/shared/config/costing-tooling-bop-config.service';
import { ToolingHelperService } from 'src/app/shared/helpers/tooling-helper.service';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { ToolingBopTableComponent } from './tooling-bop-table/tooling-bop-table.component';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { CostToolingSignalsService } from 'src/app/shared/signals/cost-tooling-signals.service';

@Component({
  selector: 'app-bop-info',
  templateUrl: './tooling-bop-info.component.html',
  styleUrls: ['./tooling-bop-info.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, ToolingBopTableComponent, NgbPopover, MatIconModule],
})
export class ToolingBopInfoComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() toolingFormGroup: FormGroup;
  @Input() compVals: any;
  @Input() canUpdate: boolean = false;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() actionEmitter = new EventEmitter<any>();
  public validatedTotCost: number;
  public validatedTotProcessCost: number;
  public dialogSub: Subscription;
  public bopDescriptionList: any = [];
  public isEnableUnitConversion = false;
  public conversionValue: any;
  bopInfoDefaultValues = this._toolConfig._bopConfig.bopInfo;
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;
  url = '';
  name = 'World';
  show = false;

  constructor(
    private messaging: MessagingService,
    private _store: Store,
    public sharedService: SharedService,
    private _bopMapper: ToolingBopInfoMappingService,
    public _toolConfig: ToolingConfigService,
    public _toolingBopConfig: CostingToolingBopConfigService,
    public _toolingHelper: ToolingHelperService,
    private toolingInfoSignalsService: CostToolingSignalsService
  ) {}

  ngOnInit(): void {
    if (this.compVals.currentPart?.commodityId) {
      this.bopDescriptionList = this._toolConfig._bopConfig.getBOPDescription(this.compVals.currentPart?.commodityId);
    }
    [this.isEnableUnitConversion, this.conversionValue] = this.sharedService.setUnitMeasurement();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['compVals'] && changes['compVals'].currentValue) {
      if (changes['compVals'].currentValue?.currentPart?.commodityId != changes['compVals'].previousValue?.currentPart?.commodityId) {
        this.bopDescriptionList = this._toolConfig._bopConfig.getBOPDescription(this.compVals.currentPart?.commodityId);
      }
      this.processToolingBOPInfoList();
    }
  }

  processToolingBOPInfoList() {
    this.compVals.toolingBOPInfoList = this.compVals.toolingBOPInfoList?.map((bop) => {
      return {
        ...bop,
        validatedTotalCost: this.sharedService.isValidNumber(bop.totalCost),
        validatedTotalProcessCost: this.sharedService.isValidNumber(bop.totalProcessCost),
      };
    });
    this.validatedTotCost = this.sharedService.isValidNumber(this.bopInfoDefaultValues.totCost);
    this.validatedTotProcessCost = this.sharedService.isValidNumber(this.bopInfoDefaultValues.totProcessCost);
  }

  setBOPEntrySelection() {
    if (this.compVals.toolingBOPInfoList && this.compVals.toolingBOPInfoList.length > 0) {
      if (this._toolConfig.addNewFlags.isNewBOP) {
        this.onEditBOPInfo(this.compVals.toolingBOPInfoList[this.compVals.toolingBOPInfoList.length - 1]);
      } else if (this.compVals.selectedToolBopId) {
        const bop = this.compVals.toolingBOPInfoList.find((x) => x.bopCostId == this.compVals.selectedToolProcessId);
        this.onEditBOPInfo(bop ? bop : this.compVals.toolingBOPInfoList[0]);
      } else {
        this.onEditBOPInfo(this.compVals.toolingBOPInfoList[0]);
      }
    }
  }

  addBOPSection() {
    this._toolConfig.addNewFlags.isNewBOP = true;
    this.compVals.selectedToolBopId = 0;
    const bopInfo = new BopCostToolingDto();
    bopInfo.toolingId = this.compVals.selectedToolId;
    bopInfo.bopCostId = 0;
    if (this.compVals.currentPart?.commodityId == CommodityType.PlasticAndRubber) {
      const mouldcompl = this.toolingFormGroup.controls['mouldCriticality'].value || 0;
      const totalSheetCost = Number(this.toolingFormGroup.controls['totalSheetCost'].value);
      const data = this._toolingBopConfig.getCriticality();
      const complexValue = data.find((x) => x.id == mouldcompl);
      bopInfo.descriptionId = 1;
      bopInfo.totalProcessCost = Number(complexValue?.value) * Number(totalSheetCost);
    }
    // this._store.dispatch(new ToolingInfoActions.SaveBOPInfo(this.compVals.currentPart?.partInfoId, bopInfo));
    this.toolingInfoSignalsService.saveBOPInfo(bopInfo, this.compVals.currentPart?.partInfoId);
    const emitData: any = { selectedToolBopId: 0 };
    this.emitAction('add', emitData, () => {});
  }

  onEditBOPInfo(bop: BopCostToolingDto) {
    this.compVals.selectedToolBopId = bop.bopCostId;
    this.compVals.selectedBop = bop;
    const fieldColor = this.compVals.toolingFieldColorsList?.filter((x) => x.primaryId == this.compVals.selectedToolBopId && x.screenId == ScreeName.ToolingBOP);
    fieldColor?.forEach((element) => {
      const control = this.formGroup.get(element.formControlName);
      element.isTouched && control?.markAsTouched();
      element.isDirty && control?.markAsDirty();
    });
    this.formGroup.patchValue(this._bopMapper.onEditBOPPatch(bop));
    const emitData: any = {
      selectedBop: this.compVals.selectedBop,
      selectedToolBopId: this.compVals.selectedToolBopId,
    };
    this.emitAction('edit', emitData, () => {});
  }

  onDeleteBOPClick(bopCostId: number) {
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
        if (bopCostId && confirmed) {
          const toolinglist = this.compVals.toolInfoList.find((x) => x.toolingId == this.compVals.selectedToolId);
          // this.emitAction('setTotalperCost', toolinglist, (toolingCost: number) => {
          let toolingCost = this._toolingHelper.setTotalperCost(toolinglist, this.compVals.currentPart?.commodityId);
          const deletedData = toolinglist.bopCostTooling?.find((x) => x.bopCostId == bopCostId);
          toolingCost = toolingCost - Number(deletedData?.totalProcessCost || 0);
          let costTooling = new CostToolingDto();
          toolinglist.bopCostTooling = toolinglist.bopCostTooling.filter((x) => x.bopCostId !== bopCostId);
          costTooling = { ...costTooling, ...toolinglist };
          costTooling.toolingCost = toolingCost;
          // this._store.dispatch(new ToolingInfoActions.DeleteToolingBOPInfo(this.compVals.currentPart?.partInfoId, bopCostId));
          this.toolingInfoSignalsService.deleteToolingBOPInfo(this.compVals.currentPart?.partInfoId, bopCostId);
          this.compVals.toolingBOPInfoList = this.compVals.toolingBOPInfoList?.filter((x: { bopCostId: number }) => x.bopCostId != bopCostId);
          this.messaging.openSnackBar(`Data has been Deleted.`, '', { duration: 5000 });
          // this.emitAction('savetoolingTotalCostPart', costTooling, () => { });
          // });
          this._toolingHelper.savetoolingTotalCostPart(
            costTooling,
            this.toolingFormGroup.controls,
            this.conversionValue,
            this.isEnableUnitConversion,
            this._toolConfig.commodity,
            this.compVals.currentPart
          );
          if (this.compVals.toolingBOPInfoList && this.compVals.toolingBOPInfoList.length > 0) {
            this.compVals.selectedToolBopId = this.compVals.toolingBOPInfoList[this.compVals.toolingBOPInfoList.length - 1].bopCostId;
          } else {
            this.compVals.selectedToolBopId = 0;
            this.bopInfoDefaultValues.totCost = 0;
          }
          const emitData: any = { selectedToolBopId: this.compVals.selectedToolBopId };
          this.emitAction('delete', emitData, () => {});
        }
      });
  }

  calculateBOPCost() {
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
