import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
import { CostToolingDto, ToolingMaterialInfoDto } from 'src/app/shared/models/tooling.model';
import { ScreeName } from '../../../costing.config';
import { ToolingMaterialMappingService } from 'src/app/shared/mapping/tooling-material-mapping.service';
import { Store } from '@ngxs/store';
import { first, takeUntil } from 'rxjs/operators';
import { MessagingService, ConfirmationDialogConfig } from 'src/app/messaging/messaging.service';
import { Subscription, Subject } from 'rxjs';
// import * as ToolingInfoActions from 'src/app/modules/_actions/tooling-info.action';
import { ToolingMaterialIM } from 'src/app/shared/enums';
import { MaterialMasterService } from 'src/app/shared/services';
import { MaterialMasterDto } from 'src/app/shared/models';
import { SharedService } from '../../../services/shared.service';
import { CostingToolingMaterialConfigService } from 'src/app/shared/config/costing-tooling-material-config.service';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { ToolingHelperService } from 'src/app/shared/helpers/tooling-helper.service';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { ToolingMaterialTableComponent } from './tooling-material-table/tooling-material-table.component';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { CostToolingSignalsService } from 'src/app/shared/signals/cost-tooling-signals.service';

@Component({
  selector: 'app-material-info',
  templateUrl: './tooling-material-info.component.html',
  styleUrls: ['./tooling-material-info.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, ToolingMaterialTableComponent, NgbPopover, MatIconModule],
})
export class ToolingMaterialInfoComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() toolingFormGroup: FormGroup;
  @Input() toolingFieldColorsList: FieldColorsDto[] | null = null;
  @Input() compVals: any;
  @Input() canUpdate: boolean = false;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() actionEmitter = new EventEmitter<any>();
  isEnableUnitConversion = false;
  conversionValue: any;
  public dialogSub: Subscription;
  public isHeightformControlNameReadOnly = false;
  public isWidthFormControlNameReadOnly = false;
  moldItems = ToolingMaterialIM;
  public moldItemDescsriptionsList: any = [];
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;
  url = '';
  name = 'World';
  show = false;

  constructor(
    public _toolConfig: ToolingConfigService,
    public _materialMapper: ToolingMaterialMappingService,
    private messaging: MessagingService,
    private _store: Store,
    private materialMasterService: MaterialMasterService,
    public sharedService: SharedService,
    public _toolingMaterialConfig: CostingToolingMaterialConfigService,
    public _toolingHelper: ToolingHelperService,
    private toolingInfoSignalsService: CostToolingSignalsService
  ) {}

  ngOnInit(): void {
    this.moldItemDescsriptionsList = this._toolConfig.getMoldItemDescription(this.compVals.currentPart?.commodityId);
    [this.isEnableUnitConversion, this.conversionValue] = this.sharedService.setUnitMeasurement();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['compVals'] && changes['compVals'].currentValue) {
      this.processToolingMaterialInfoList();
    }
  }

  processToolingMaterialInfoList() {
    const updateMaterialInfoList = (materialList) =>
      materialList?.map((material) => ({
        ...material,
        totalPlateWeight: this.sharedService.isValidNumber(material.totalPlateWeight),
        totalRawMaterialCost: this.sharedService.isValidNumber(material.totalRawMaterialCost),
      }));
    this.compVals.coreMaterialInfoList = updateMaterialInfoList(this.compVals.coreMaterialInfoList);
    this.compVals.mouldMaterialInfoList = updateMaterialInfoList(this.compVals.mouldMaterialInfoList);
    this.compVals.electrodeMaterialInfoList = updateMaterialInfoList(this.compVals.electrodeMaterialInfoList);
    this.compVals.otherMaterialInfoList = updateMaterialInfoList(this.compVals.otherMaterialInfoList);
    this.compVals.toolingMaterialInfoList = updateMaterialInfoList(this.compVals.toolingMaterialInfoList);
    this.compVals.diePunchMaterialInfoList = updateMaterialInfoList(this.compVals.diePunchMaterialInfoList);
  }

  onMoldDescriptionChange(event: any): void {
    this.emitAction('onMoldDescription', event, () => {});
  }

  setMaterialEntrySelection() {
    if (this.compVals.toolingMaterialInfoList && this.compVals.toolingMaterialInfoList.length > 0) {
      if (this._toolConfig.addNewFlags.isNewMaterial) {
        this.onEditMaterialInfo(this.compVals.toolingMaterialInfoList[this.compVals.toolingMaterialInfoList.length - 1]);
      } else if (this.compVals.selectedToolMaterialId) {
        const material = this.compVals.toolingMaterialInfoList.find((x) => x.toolingMaterialId == this.compVals.selectedToolMaterialId);
        if (material) {
          this.onEditMaterialInfo(material);
        } else {
          this.compVals.selectedToolMaterialId = 0;
          const emitData: any = { selectedToolMaterialId: 0 };
          this.emitAction('setEntry', emitData, () => {});
          this.onEditMaterialInfo(this.compVals.toolingMaterialInfoList[0]);
        }
      } else {
        this.onEditMaterialInfo(this.compVals.toolingMaterialInfoList[0]);
      }
    }
  }

  public mapOnGroupChange(groupId: any): void {
    groupId = groupId?.currentTarget?.value ? groupId.currentTarget.value : Number(groupId);
    if (groupId) {
      this.compVals.materialTypeList = this.compVals.materialTypeMasterList?.filter((x) => x.materialGroupId == groupId);
      this.formGroup && this.formGroup.patchValue(this._toolingMaterialConfig.clearToolingMaterialInfoValues());
      const emitData: any = { materialTypeList: this.compVals.materialTypeList };
      this.emitAction('mapOnGroupChange', emitData, () => {});
    }
  }

  private emitAction(type: string, data: any, callback: (toolingCost?: number) => void): void {
    this.actionEmitter.emit({ type, data, callback });
  }

  addMaterial() {
    this._toolConfig.addNewFlags.isNewMaterial = true;
    this.compVals.selectedToolMaterialId = 0;
    const materialInfo = new ToolingMaterialInfoDto();
    materialInfo.toolingId = this.compVals.selectedToolId;
    // this._store.dispatch(new ToolingInfoActions.SaveToolingMaterialInfo(materialInfo, this.compVals.currentPart?.partInfoId));
    this.toolingInfoSignalsService.saveToolingMaterialInfo(materialInfo, this.compVals.currentPart?.partInfoId);
    const emitData: any = { selectedToolMaterialId: 0 };
    this.emitAction('add', emitData, () => {});
  }

  onEditMaterialInfo(material: ToolingMaterialInfoDto) {
    this.compVals.selectedToolMaterialId = material?.toolingMaterialId;
    this.compVals.selectedMaterial = material;
    this.compVals.mouldid = material.moldDescriptionId;
    const emitData: any = {
      selectedMaterial: this.compVals.selectedMaterial,
      selectedToolMaterialId: this.compVals.selectedToolMaterialId,
      mouldid: material.moldDescriptionId,
      toolingFieldColorsList: this.toolingFieldColorsList,
    };
    this.emitAction('edit', emitData, () => {});
    const fieldColor = this.toolingFieldColorsList?.filter((x) => x.primaryId == this.compVals.selectedToolMaterialId && x.screenId == ScreeName.ToolingMaterial);
    fieldColor?.forEach((element) => {
      const control = this.formGroup.get(element.formControlName);
      element.isTouched && control?.markAsTouched();
      element.isDirty && control?.markAsDirty();
    });
    this.mapOnGroupChange(material.catergoryId);
    this.formGroup.patchValue(this._materialMapper.onEditMaterialPatch(material, this.conversionValue, this.isEnableUnitConversion));
    // const emitDatas: any = {
    //   toolingFieldColorsList: this.toolingFieldColorsList,
    //   formGroup: this.formGroup,
    // };
    this.onMaterialFamilyChange(material.familyId, material.gradeId);
    this.isHeightformControlNameReadOnly = this.compVals.mouldid === this.moldItems.CoreSideClampingPlate || !this._toolConfig.moldItemsSheetMetal.includes(this.compVals.mouldid);
    this.isWidthFormControlNameReadOnly = !this._toolConfig.moldItems.includes(this.compVals.mouldid);
  }

  onDeleteMaterialClick(materialId: number) {
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
        if (materialId && confirmed) {
          const toolinglist = this.compVals.toolInfoList.find((x) => x.toolingId == this.compVals.selectedToolId);
          // this.emitAction('setTotalperCost', toolinglist, (toolingCost: number) => {
          let toolingCost = this._toolingHelper.setTotalperCost(toolinglist, this.compVals.currentPart?.commodityId);
          const deletedMaterial = toolinglist.toolingMaterialInfos.find((x) => x.toolingMaterialId == materialId);
          toolingCost = toolingCost - Number(deletedMaterial?.totalRawMaterialCost || 0);
          let costTooling = new CostToolingDto();
          toolinglist.toolingMaterialInfos = toolinglist.toolingMaterialInfos.filter((x) => x.toolingMaterialId !== materialId);
          costTooling = { ...costTooling, ...toolinglist };
          costTooling.toolingCost = toolingCost;
          this.toolingInfoSignalsService.deleteToolingMaterialInfo(this.compVals.currentPart?.partInfoId, materialId);
          this.compVals.toolingMaterialInfoList = this.compVals.toolingMaterialInfoList?.filter((x: { toolingMaterialId: number }) => x.toolingMaterialId != materialId);
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
          if (this.compVals.toolingMaterialInfoList && this.compVals.toolingMaterialInfoList.length > 0) {
            this.compVals.selectedToolMaterialId = this.compVals.toolingMaterialInfoList[this.compVals.toolingMaterialInfoList.length - 1].toolingMaterialId;
          } else {
            this.compVals.selectedToolMaterialId = 0;
            Object.assign(this._toolingMaterialConfig.materialInfo, this._toolingMaterialConfig.materialDefaults);
          }
          const emitData: any = {
            selectedToolMaterialId: this.compVals.selectedToolMaterialId,
            toolingMaterialInfoList: this.compVals.toolingMaterialInfoList,
          };
          this.emitAction('delete', emitData, () => {});
        }
      });
  }

  public onMaterialFamilyChange(familyId: any, gradeId: number) {
    familyId = familyId?.currentTarget?.value ? familyId.currentTarget.value : Number(familyId);
    if (familyId) {
      this.materialMasterService
        .getmaterialsByMaterialTypeId(familyId)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe((result: MaterialMasterDto[]) => {
          this.compVals.materialDescriptionList = result;
          const emitData: any = { materialDescriptionList: this.compVals.materialDescriptionList };
          this.emitAction('onMaterialFamilyChange', emitData, () => {});
          gradeId > 0 && this.mapOnMaterialDesc(gradeId);
        });
    }
  }

  mapOnMaterialDesc(materialMasterId: any) {
    materialMasterId = materialMasterId?.currentTarget?.value ? materialMasterId.currentTarget.value : Number(materialMasterId);
    const contry = this.toolingFormGroup.controls['sourceCountryId'].value;
    const gradeId = this.formGroup.controls['gradeId'].value;
    const countryId = contry ? contry?.countryId : 0;
    if (materialMasterId != null && materialMasterId != 0 && countryId > 0) {
      this.materialMasterService
        .getMaterialMarketDataByCountryId(countryId, materialMasterId)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: (result) => {
            const density = this.compVals.materialDescriptionList?.find((x: { materialMasterId: any }) => x.materialMasterId == materialMasterId)?.density;
            this.formGroup.controls['gradeId'].setValue(!this.formGroup.controls['gradeId'].dirty ? materialMasterId : gradeId);
            !this.formGroup.controls['materialPrice'].dirty && this.formGroup.controls['materialPrice'].setValue(this.sharedService.isValidNumber(result?.price));
            !this.formGroup.controls['scrapPrice'].dirty && this.formGroup.controls['scrapPrice'].setValue(this.sharedService.isValidNumber(result?.generalScrapPrice));
            !this.formGroup.controls['density'].dirty && this.formGroup.controls['density'].setValue(this.sharedService.isValidNumber(density));
            const tensileStrength = this.compVals.materialDescriptionList?.find((x: { materialMasterId: any }) => x.materialMasterId == materialMasterId)?.tensileStrength;
            this.formGroup.controls['tensileStrength'].setValue(this.sharedService.isValidNumber(tensileStrength));
            this._toolConfig.defaultValues.density = density;
            this._toolConfig.defaultValues.materialPrice = result?.price;
            this._toolConfig.defaultValues.scrapPrice = result?.generalScrapPrice;
          },
          error: () => {
            console.error();
          },
        });
    }
  }

  calculateMaterialCost() {
    this.doCalculateCost.emit({});
  }

  calculateMoldCost() {
    this.emitAction('calculateMoldCost', {}, () => {});
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
