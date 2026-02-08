import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
import { ToolingInfoMappingService } from 'src/app/shared/mapping/tooling-info-mapping.service';
import { CostToolingDto } from 'src/app/shared/models/tooling.model';
// import * as ToolingInfoActions from 'src/app/modules/_actions/tooling-info.action';
import { SharedService } from '../../../services/shared.service';
import { ToolingCalculatorService } from '../../../services/tooling-calculator.service';
import { CostingConfig } from '../../../costing.config';
import { ToolingInfoConfigService } from 'src/app/shared/config/tooling-info-config.service';
import { CountryDataMasterDto } from 'src/app/shared/models';
import { MatOptionModule } from '@angular/material/core';
import { OnlyNumber } from 'src/app/shared/directives';
import { ToolingTableComponent } from './tooling-table/tooling-table.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';
import { CostToolingSignalsService } from 'src/app/shared/signals/cost-tooling-signals.service';

@Component({
  selector: 'app-tooling-info',
  templateUrl: './tooling-info.component.html',
  styleUrls: ['./tooling-info.component.scss'],
  standalone: true,
  imports: [MatOptionModule, ReactiveFormsModule, MatAutocompleteModule, FormsModule, OnlyNumber, ToolingTableComponent, CommonModule, MatIconModule, InfoTooltipComponent],
})
export class ToolingInfoComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() compVals: any;
  @Input() canUpdate: boolean = false;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() actionEmitter = new EventEmitter<any>();
  public previousComplexity = 0;
  public previousLifeShort = 0;
  public previoussurfaceFinish = 0;
  public previousCountryId = 0;
  public IsCountryChanged = false;
  public IsToollifeChanged = false;
  public isHotRunner: boolean = false;
  public isDropSelected: boolean = false;
  public complexityChanged = false;
  public surfaceFinishChanged = false;
  //public isMoudlTypeDisabled = true;
  public toolingNoOfShot: any = [];
  public MouldTypeList: any = [];
  public MouldSubTypeList: any = [];
  public mouldCriticalityList: any = [];
  public SurfaceFinishList: any = [];
  public isEnableUnitConversion = false;
  public conversionValue: any;
  public dialogSub: Subscription;
  public processedCompVals: any = {};

  constructor(
    public _toolInfoConfig: ToolingInfoConfigService,
    public _toolConfig: ToolingConfigService,
    private messaging: MessagingService,
    public sharedService: SharedService,
    private _costingConfig: CostingConfig,
    private _store: Store,
    public _toolingInfoMapper: ToolingInfoMappingService,
    private _toolingCalculator: ToolingCalculatorService,
    private toolingInfoSignalsService: CostToolingSignalsService
  ) {}

  ngOnInit(): void {
    this.toolingNoOfShot = this._toolConfig.getToolingNoOfShot();
    this.MouldTypeList = this._toolConfig.getMouldType();
    this.MouldSubTypeList = this._toolConfig.getMouldSubtype();
    this.mouldCriticalityList = this._toolConfig._bopConfig.getCriticality();
    this.SurfaceFinishList = this._toolConfig.surfaceFinish();
    [this.isEnableUnitConversion, this.conversionValue] = this.sharedService.setUnitMeasurement();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['compVals'] && changes['compVals'].currentValue) {
      this.processToolInfoList();
    }
  }

  processToolInfoList() {
    // this.compVals.toolInfoList = this.compVals.toolInfoList?.map((tool) => {
    //   return {
    //     ...tool,
    //     toolingCost: this.sharedService.isValidNumber(tool.toolingCost),
    //     subsequentToolCost: this.sharedService.isValidNumber(tool.subsequentToolCost),
    //     amortizationPerPart: this.sharedService.isValidNumber(tool.amortizationPerPart),
    //   };
    // });
    this.processedCompVals = {
      ...this.compVals,
      toolInfoList: this.compVals.toolInfoList?.map((tool) => ({
        ...tool,
        toolingCost: this.sharedService.isValidNumber(tool.toolingCost),
        subsequentToolCost: this.sharedService.isValidNumber(tool.subsequentToolCost),
        amortizationPerPart: this.sharedService.isValidNumber(tool.amortizationPerPart),
      })),
    };
  }

  addTooling() {
    this._toolConfig.addNewFlags.isNewTool = true;
    const partLength = this.compVals.materialInfoList?.length && this.compVals.materialInfoList[0]?.dimX;
    const partWidth = this.compVals.materialInfoList?.length && this.compVals.materialInfoList[0]?.dimY;
    const partHeight = this.compVals.materialInfoList?.length && this.compVals.materialInfoList[0]?.dimZ;
    const noOfCavity = (this.compVals.materialInfoList?.length && this.compVals.materialInfoList[0]?.noOfCavities) || 8;
    this.emitAction('clearToolingInfo', {});
    const moldInfo = this._toolingInfoMapper.addToolingMoldInfo(this.compVals.currentPart);
    let country = this.compVals.currentPart?.mfrCountryId;
    if (this.compVals.countryList.length > 0) {
      country = this.compVals.countryList.find((x) => x.countryId == this.compVals.currentPart?.mfrCountryId)?.toolingLocationCountryId;
    }
    moldInfo.sourceCountryId = country;
    this.previousCountryId = country;
    moldInfo.noOfCavity = noOfCavity;
    const toolLife = Math.round(this.sharedService.isValidNumber(Number(this.compVals.currentPart.lifeTimeQtyRemaining) / Number(noOfCavity)));
    const toolData = this._toolConfig.getToolingNoOfShot().find((range) => toolLife >= range.start && toolLife <= range.end);
    moldInfo.toolLifeNoOfShots = toolData ? toolData.id : 4;
    this._toolingCalculator.toolingSharedCalculatorService.calculateToolLifeInParts(moldInfo, toolData, this.compVals.currentPart, toolLife);
    if (this._toolConfig.commodity.isInjMoulding || this._toolConfig.commodity.isSheetMetal || this._toolConfig.commodity.isCasting) {
      if (this._toolConfig.commodity.isInjMoulding) {
        moldInfo.envelopLength = Number(partLength);
        moldInfo.envelopWidth = Number(partWidth);
      } else {
        moldInfo.envelopLength = Number(partLength) * Number(noOfCavity);
        moldInfo.envelopWidth = Number(partWidth) * Number(noOfCavity);
      }
      moldInfo.envelopHeight = Number(partHeight);
      this._toolInfoConfig.setDefaultValuesForTooling(moldInfo, this.compVals.currentPart?.commodityId);
      const cavColsRows = this._costingConfig.cavityColsRows(moldInfo.noOfCavity);
      moldInfo.cavityMaxLength = cavColsRows.columns;
      moldInfo.cavityMaxWidth = cavColsRows.rows;
      moldInfo.moldBaseLength = Number(moldInfo.envelopLength) + Number(moldInfo.runnerGapLength) + Number(moldInfo.sideGapLength);
      moldInfo.moldBaseWidth = Number(moldInfo.envelopWidth) + Number(moldInfo.runnerGapWidth) + Number(moldInfo.sideGapWidth);
      moldInfo.moldBaseHeight = Number(partHeight);
      const noOfTool = Math.round(this.sharedService.isValidNumber(Number(this.compVals.currentPart?.prodLifeRemaining) / (Number(moldInfo.toolLifeInParts) * Number(moldInfo.noOfCavity))));
      moldInfo.noOfTool = noOfTool == 0 ? 1 : noOfTool;
      moldInfo.noOfNewTool = 1;
      moldInfo.noOfSubsequentTool = this.sharedService.isValidNumber(Number(moldInfo.noOfTool) - Number(moldInfo.noOfNewTool));
      moldInfo.noOfCopperElectrodes = 0;
      moldInfo.noOfGraphiteElectrodes = moldInfo.noOfCavity;
      moldInfo.surfaceFinish = 2;
      moldInfo.textureGrade = 'YS Number';
      moldInfo.mouldCriticality = this.compVals.currentPart.partComplexity;
      this.previousComplexity = moldInfo.mouldCriticality;
      this.previousLifeShort = moldInfo.toolLifeNoOfShots;
      this.previoussurfaceFinish = moldInfo.surfaceFinish;
      moldInfo.undercutsSideCores = 0;
      moldInfo.undercutsAngularSlides = 0;
      moldInfo.undercutsUnscrewing = 0;
      moldInfo.noOfDieStages = 1;
      moldInfo.noOfStagesAlong = 1;
      moldInfo.noOfStagesAcross = 0;
      moldInfo.dieSizeLength = 0;
      moldInfo.dieSizeWidth = 0;
      moldInfo.dieSetSizeLength = 0;
      moldInfo.dieSetSizeWidth = 0;
      moldInfo.dieSetSizeHeight = 0;
      if (Number(this.compVals.currentPart?.eav) > 100000) {
        moldInfo.mouldTypeId = 1;
        if (moldInfo.noOfCavity >= 2) {
          moldInfo.mouldSubTypeId = 3;
          moldInfo.noOfDrop = 2;
        } else {
          moldInfo.mouldSubTypeId = 1;
        }
      } else {
        moldInfo.mouldTypeId = 2;
      }
      moldInfo.hotRunnerCost = 0;
      moldInfo.electrodeMaterialCostGr = 0;
      moldInfo.electrodeMaterialCostCu = 0;
      moldInfo.totalSheetCost = 0;
    }
    // this._store.dispatch(new ToolingInfoActions.SaveToolingInfo(moldInfo, this.compVals.currentPart?.partInfoId));
    this.toolingInfoSignalsService.saveToolingInfo(moldInfo, this.compVals.currentPart?.partInfoId);
  }

  onEditToolInfo(tool: CostToolingDto) {
    this.emitAction('onEditToolInfo', { ...tool });
  }

  onDeleteToolClick(toolId: number) {
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
        if (toolId && confirmed) {
          this.formGroup.patchValue(this._toolingInfoMapper.resetForm());
          // this._store.dispatch(new ToolingInfoActions.DeleteToolingInfo(toolId, this.compVals.currentPart?.partInfoId));
          this.toolingInfoSignalsService.deleteToolingInfo(toolId, this.compVals.currentPart?.partInfoId);
          this.compVals.toolInfoList = this.compVals.toolInfoList.filter((x) => x.toolingId != toolId);
          const emitData: any = { showMaterialProcessSection: false, toolInfoList: this.compVals.toolInfoList };
          this.emitAction('delete', emitData);
          this.messaging.openSnackBar(`Data has been Deleted.`, '', { duration: 5000 });
          if (this.compVals.toolInfoList && this.compVals.toolInfoList.length > 0) {
            this.compVals.selectedToolId = this.compVals.toolInfoList[this.compVals.toolInfoList.length - 1].toolingId;
            const emitData: any = { selectedToolId: this.compVals.selectedToolId };
            this.emitAction('deleteSelectedToolId', emitData);
          } else {
            this.emitAction('clearAll', {});
          }
        }
      });
  }

  sourceCountry(country: CountryDataMasterDto): string {
    return country?.countryName || '';
  }

  onSourceCountryChange(event: MatAutocompleteSelectedEvent) {
    const res = event.option.value;
    const sourceCountryId = Number(res?.countryId) || 0;
    const previousCountryId = Number(this.previousCountryId);
    this.previousCountryId = sourceCountryId;
    const emitData: any = {
      IsCountryChanged: previousCountryId !== sourceCountryId,
      sourceCountryId: Number(res?.countryId) || 0,
    };
    this.emitAction('getLaborRateBasedOnCountry', emitData);
    this.calculateMoldCost();
  }

  public changeToolingName(e: any) {
    const toolingNameId = e.currentTarget.value;
    if (this.compVals.selectedToolId == 0) {
      this.emitAction('clearAll', {});
    }
    this.formGroup.controls['toolingNameId'].setValue(toolingNameId);
    this.calculateMoldCost();
  }

  public changeLifeShort(e: any) {
    const lifeShort = Number(e.currentTarget.value);
    if (lifeShort > 0) {
      const data = this._toolConfig.getToolingNoOfShot().find((x) => x.id === lifeShort);
      if (data) {
        const initialToolLife = Math.min(Number(this.compVals.selectedTool.toolLifeInParts), Number(data.end));
        this.formGroup.controls['toolLifeInParts'].setValue(initialToolLife);
      }
      this.IsToollifeChanged = lifeShort !== Number(this.previousLifeShort);
    }
    this.calculateMoldCost();
  }

  public changeMouldtype(e: any) {
    this.compVals.isHotRunner = Number(e.currentTarget.value) == 1;
    this.calculateMoldCost();
  }

  public changeMouldSubtype(e: any) {
    this.compVals.isDropSelected = Number(e.currentTarget.value) == 3 || Number(e.currentTarget.value) == 4;
    this.calculateMoldCost();
  }

  public changeComplexity(e: any) {
    this.previousComplexity = Number(e.currentTarget.value);
    const emitData: any = { complexityChanged: Number(e.currentTarget.value) !== Number(this.previousComplexity) };
    this.emitAction('changeComplexity', emitData);
  }

  public changeSurface(e: any) {
    this.previoussurfaceFinish = Number(e.currentTarget.value);
    this.calculateMoldCost();
    const emitData: any = { surfaceFinishChanged: Number(e.currentTarget.value) !== Number(this.previoussurfaceFinish) };
    this.emitAction('changeSurface', emitData);
  }

  calculateMoldCost() {
    this.doCalculateCost.emit({});
  }

  calculateMaterialCost() {
    this.emitAction('calculateMaterialCost', {});
  }

  private emitAction(type: string, data: any): void {
    this.actionEmitter.emit({ type, data });
  }
}
