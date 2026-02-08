import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, OnChanges, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CostSummaryDto, PartInfoDto, ProcessInfoDto, ViewCostSummaryDto } from 'src/app/shared/models';
import { AppConfigurationService } from 'src/app/shared/services';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { Store } from '@ngxs/store';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
// import { CostSummaryState } from 'src/app/modules/_state/cost-summary.state';
import { Subject } from 'rxjs';
import { CommonModule, DecimalPipe } from '@angular/common';
// import { PartInfoState } from 'src/app/modules/_state/part-info.state';
import { CommodityType, ScreeName } from '../../costing.config';
import { CommentFieldFormIdentifierModel } from 'src/app/shared/models/comment-field-model';
import { SharedService } from '../../services/shared.service';
import { CostingGdntComponent } from '../../../ai-search/components/costing-gdnt/costing-gdnt.component';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { OnlyNumber } from 'src/app/shared/directives';
import { CostingNoteComponent } from './costing-note/costing-note-component';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { CostingAiAttributeComponent } from './costing-ai-attribute/costing-ai-attribute-modal.component';
import { CostingSuggestionComponent } from './costing-suggestion/costing-suggestion.component';
import { CostWaterfallChartComponent } from './cost-waterfall-chart/cost-waterfall-chart.component';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { GerberReaderAiComponent } from './gerber-reader/gerber-reader-ai.component';
import { PartInfoSignalsService } from 'src/app/shared/signals/part-info-signals.service';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';
// import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-costing-cost-summary',
  templateUrl: './costing-cost-summary.component.html',
  styleUrls: ['./costing-cost-summary.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, CostingNoteComponent, FieldCommentComponent, CostWaterfallChartComponent, MatTabsModule, MatIconModule, NgbPopover, MatTooltip],
  providers: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostingCostSummaryComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() selectedPartId: number;
  @Input() viewOnly: boolean = false;
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  currentSelectedPartId: number;
  costSummaryInfoForm: FormGroup;
  costSummaryData: CostSummaryDto;
  costSummaryViewData: ViewCostSummaryDto;
  partDto: PartInfoDto;
  currentPart: PartInfoDto;
  // matPotentialSaving: any = 0;
  // manufPotentialSaving: any = 0;
  // overheadandProfitPotentialSaving: any = 0;
  // eXWPartCostPotentialSaving: any = 0;
  // PackingCostPotentialSaving: any = 0;
  // freightCostPotentialSaving: any = 0;
  OpportunitySaving: any = 0;
  CurrentSpendValue: any = 0;
  UnitOpportunityShouldCostValue: any = 0;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  processInfoDtos: ProcessInfoDto[] = [];
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  // @ViewChild('tabChartGroup') tabChartGroup: MatTabGroup;
  activeTab: string = 'cost';
  // _costAllSummary$: Observable<{ [key: number]: ViewCostSummaryDto }>;
  // _partInfo$: Observable<PartInfoDto>;
  formIdentifier: CommentFieldFormIdentifierModel;
  isToggleNumeric = this._sharedService.costSummaryIsNumeric;
  activeTabIndex = this._sharedService.costSummaryActiveTabIndex;
  chartDataCost: number[];
  chartDataEsg: number[];
  private partInfoEffect = effect(() => {
    const partInfo = this.partInfoSignalsService.partInfo();
    if (partInfo) {
      this.partDto = { ...partInfo };
    }
  });
  private costSumaryAllEffect = effect(() => {
    const costSummaryAll = this.costSummarySignalsService.costSummaryAll();
    if (costSummaryAll) {
      this.getCostSummaryDetails(costSummaryAll);
    }
  });

  constructor(
    private form: FormBuilder,
    private messaging: MessagingService,
    private configservice: AppConfigurationService,
    private _store: Store,
    private decimalPipe: DecimalPipe,
    private _sharedService: SharedService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private partInfoSignalsService: PartInfoSignalsService,
    private costSummarySignalsService: CostSummarySignalsService
  ) {
    // this._costAllSummary$ = this._store.select(CostSummaryState.getAllCostSummarys);
    // this._partInfo$ = this._store.select(PartInfoState.getPartInfo);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedPartId'] && changes['selectedPartId'].currentValue > 0 && changes['selectedPartId'].currentValue != changes['selectedPartId'].previousValue) {
      this.currentSelectedPartId = changes['selectedPartId'].currentValue;
      this.reset();

      if (this.currentSelectedPartId > 0) {
        !this.viewOnly && this.costSummarySignalsService.getCostSummaryByPartInfoId(this.currentSelectedPartId);

        this.formIdentifier = {
          partInfoId: this.currentSelectedPartId,
          screenId: ScreeName.CostSummary,
          primaryId: 0,
          secondaryID: 0,
        };
      }
    }
  }

  ngOnInit() {
    // this.getPartDetailsById();
    // this.getCostSummaryDetails();
    this.costSummaryInfoForm = this.form.group({
      CostSummaryId: [0],
      MaterialCostAmount: [0, [Validators.required]],
      MaterialCostPercentage: [0, [Validators.required]],
      ManufacturingCostAmount: [0, [Validators.required]],
      ManufacturingCostPercentage: [0, [Validators.required]],
      OverheadandProfitAmount: [0, [Validators.required]],
      OverheadandProfitPercentage: [0, [Validators.required]],
      EXWPartCostAmount: [0, [Validators.required]],
      EXWPartCostPercentage: [0, [Validators.required]],
      ToolingCostAmount: [0, [Validators.required]],
      ToolingCostPercentage: [0, [Validators.required]],
      UnitPartCostAmount: [''],
      UnitPartCostPercentage: [''],
      ICCAmount: [''],
      ICCPercentage: [''],
      MaterialOHAmount: [''],
      MaterialOHPercentage: [''],
      FactoryOHAmount: [''],
      FactoryOHPercentage: [''],
      SGandAAmount: [''],
      SGandAPercentage: [''],
      ProfitAmount: [''],
      ProfitPercentage: [''],
      PaymentTermsAmount: [''],
      PaymentTermsPercentage: [''],
      FinishPartICCAmount: [''],
      FinishPartICCpercentage: [''],
      PackingCostAmount: [0, [Validators.required]],
      PackingCostPercentage: [0, [Validators.required]],
      FreightCostAmount: [0, [Validators.required]],
      FreightCostPercentage: [0, [Validators.required]],
      DutiesandTariffAmount: [0],
      DutiesandTariffPercentage: [0],
      CurrentCost: [0, [Validators.required]],
      ShouldCostAmount: [0, [Validators.required]],
      ShouldCostPercentage: [0, [Validators.required]],
      CurrentSpend: [0, [Validators.required]],
      ShouldCostSpend: [0, [Validators.required]],
      OpportunityAmount: [0, [Validators.required]],
      OpportunityPercentage: [0, [Validators.required]],
      Comments: [''],
      ManufacturingCurrentCost: [0, [Validators.required]],
      ManufacturingPotentialSaving: [0, [Validators.required]],
      ManufacturingPotentialSavingPercentage: [0, [Validators.required]],
      MaterialCurrentCost: [0, [Validators.required]],
      MaterialPotentialSaving: [0, [Validators.required]],
      MaterialPotentialSavingPercentage: [0, [Validators.required]],
      OverheadandProfitCurrentCost: [0, [Validators.required]],
      overheadandProfitPotentialSaving: [0, [Validators.required]],
      EXWPartCostCurrentCost: [0, [Validators.required]],
      eXWPartCostPotentialSaving: [0, [Validators.required]],
      eXWPartCostPotentialSavingPercentage: [0, [Validators.required]],
      PackingCostCurrentCost: [0, [Validators.required]],
      PackingCostPotentialSaving: [0, [Validators.required]],
      PackingCostPotentialSavingPercentage: [0, [Validators.required]],
      FreightCostCurrentCost: [0, [Validators.required]],
      freightCostPotentialSaving: [0, [Validators.required]],
      freightCostPotentialSavingPercentage: [0, [Validators.required]],
      UnitOpportunityShouldCost: [0, [Validators.required]],
      UnitOpportunityCurrentCost: [0, [Validators.required]],
      LifeTimeSavingShouldCost: [0, [Validators.required]],
      LifeTimeSavingCurrentCost: [0, [Validators.required]],
      PartESG: [0, [Validators.required]],
      PartESGPercentage: [0, [Validators.required]],
      AnnualESG: [0, [Validators.required]],
      LifetimeESG: [0, [Validators.required]],
    });
  }

  get f() {
    return this.costSummaryInfoForm.controls;
  }

  public changeViewType() {
    this._sharedService.costSummaryIsNumeric.set(!this._sharedService.costSummaryIsNumeric());
  }

  public changeTab(index: number) {
    this._sharedService.costSummaryActiveTabIndex.set(index);
  }

  // private getPartDetailsById() {
  //   this._partInfo$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: PartInfoDto) => {
  //     this.partDto = { ...result };
  //   });
  // }

  getCostSummaryDetails(result: { [key: number]: ViewCostSummaryDto }) {
    // this._costAllSummary$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: { [key: number]: ViewCostSummaryDto }) => {
    if (this.currentSelectedPartId && result[this.currentSelectedPartId]) {
      this.costSummaryViewData = result[this.currentSelectedPartId];
      // const isInitialLoad = localStorage.getItem('isInitialLoad') === 'true';
      // if (isInitialLoad) {
      //   this.setForm();
      //   localStorage.setItem('isInitialLoad', 'false');
      // }
      this.setForm();
      this.setCostSummaryValue();
      this.calcOpportunityCost();
      this.costSummaryCalculation();
      // this.updateMaterialDescriptionBasedOnPrediction();
      this.cdr.detectChanges();
    } else {
      this.costSummaryViewData = new ViewCostSummaryDto();
    }
    // });
  }

  ngAfterViewInit() {
    setTimeout(() => this.setForm(), 500);
    this.costSummaryInfoForm
      .get('CurrentCost')
      ?.valueChanges.pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.calcOpportunityCost();
        this.costSummaryCalculation();
      });
  }

  private setCostSummaryValue() {
    if (this.costSummaryInfoForm) {
      const materialCost = this.costSummaryInfoForm.get('MaterialCostAmount')?.value;
      const manufacturingCostAmount = this.costSummaryInfoForm.get('ManufacturingCostAmount')?.value;
      const overheadandProfitAmount = this.costSummaryInfoForm.get('OverheadandProfitAmount')?.value;

      const toolingCostAmount = this.costSummaryInfoForm.get('ToolingCostAmount')?.value;
      const packingCostAmount = this.costSummaryInfoForm.get('PackingCostAmount')?.value;

      const eXWPartCostAmount = Number(materialCost) + Number(manufacturingCostAmount) + Number(overheadandProfitAmount) + Number(toolingCostAmount) + Number(packingCostAmount);
      this.costSummaryInfoForm.get('EXWPartCostAmount')?.setValue(this._sharedService.isValidNumber(eXWPartCostAmount));

      const freightCostAmount = this.costSummaryInfoForm.get('FreightCostAmount')?.value;
      const dutiesandTariffAmount = this.costSummaryInfoForm.get('DutiesandTariffAmount')?.value;

      const totalCost =
        Number(materialCost) +
        Number(manufacturingCostAmount) +
        Number(packingCostAmount) +
        Number(overheadandProfitAmount) +
        Number(freightCostAmount) +
        Number(toolingCostAmount) +
        Number(dutiesandTariffAmount);

      const productlifetime = this.partDto?.prodLifeRemaining || 5;

      if (totalCost > 0) {
        this.costSummaryInfoForm.get('MaterialCostPercentage')?.setValue(this._sharedService.transformNumberTwoDecimal((materialCost / totalCost) * 100));
        this.costSummaryInfoForm.get('ManufacturingCostPercentage')?.setValue(this._sharedService.transformNumberTwoDecimal((manufacturingCostAmount / totalCost) * 100));
        this.costSummaryInfoForm.get('EXWPartCostPercentage')?.setValue(this._sharedService.transformNumberTwoDecimal((eXWPartCostAmount / totalCost) * 100));
        this.costSummaryInfoForm.get('OverheadandProfitPercentage')?.setValue(this._sharedService.transformNumberTwoDecimal((overheadandProfitAmount / totalCost) * 100));
        this.costSummaryInfoForm.get('PackingCostPercentage')?.setValue(this._sharedService.transformNumberTwoDecimal((packingCostAmount / totalCost) * 100));
        this.costSummaryInfoForm.get('FreightCostPercentage')?.setValue(this._sharedService.transformNumberTwoDecimal((freightCostAmount / totalCost) * 100));
        this.costSummaryInfoForm.get('DutiesandTariffPercentage')?.setValue(this._sharedService.transformNumberTwoDecimal((dutiesandTariffAmount / totalCost) * 100));
        this.costSummaryInfoForm.get('ShouldCostAmount')?.setValue(this._sharedService.isValidNumber(totalCost));
        this.costSummaryInfoForm.get('ShouldCostPercentage')?.setValue(this._sharedService.transformNumberTwoDecimal(totalCost > 0 ? 100 : 0));

        const currentCost = this.costSummaryInfoForm.get('CurrentCost')?.value;
        const shouldSpend = Number(this.partDto?.eav || 0) * currentCost;
        this.costSummaryInfoForm.get('ShouldCostSpend')?.setValue(this._sharedService.isValidNumber(shouldSpend));
        const shouldCost = this.costSummaryInfoForm.get('ShouldCostAmount')?.value;

        let opportunityCost = 0;
        if (currentCost > 0 && this.partDto?.eav) {
          const currentSpend = Number(this.partDto.eav) * shouldCost;
          this.costSummaryInfoForm.get('CurrentSpend')?.setValue(this._sharedService.isValidNumber(currentSpend));

          const shouldCostSpend = this.costSummaryInfoForm.get('ShouldCostSpend')?.value;
          const CurrentSpend = this.costSummaryInfoForm.get('CurrentSpend')?.value;
          opportunityCost = Number(shouldCostSpend) - Number(CurrentSpend);
          this.CurrentSpendValue = CurrentSpend;
          this.costSummaryInfoForm.get('OpportunityAmount')?.setValue(this._sharedService.isValidNumber(opportunityCost));

          const opportunityCostvalue = this.costSummaryInfoForm.get('OpportunityAmount').value;
          this.costSummaryInfoForm.get('LifeTimeSavingCurrentCost')?.setValue(this._sharedService.isValidNumber(opportunityCostvalue * productlifetime));

          this.OpportunitySaving = opportunityCost;

          let unitOpportunityShouldCost = Number(currentCost) - Number(shouldCost);
          unitOpportunityShouldCost = currentCost > 0 ? unitOpportunityShouldCost : 0;
          this.costSummaryInfoForm.get('UnitOpportunityShouldCost')?.setValue(this._sharedService.isValidNumber(unitOpportunityShouldCost));
          this.UnitOpportunityShouldCostValue = unitOpportunityShouldCost;
          let unitOpportunityCurrentCost = 0;
          if (currentCost > 0) {
            unitOpportunityCurrentCost = (unitOpportunityShouldCost / Number(currentCost)) * 100;
          }

          this.costSummaryInfoForm.get('UnitOpportunityCurrentCost')?.setValue(this._sharedService.isValidNumber(unitOpportunityCurrentCost));

          if (currentCost > 0) {
            this.costSummaryInfoForm.get('OpportunityPercentage')?.setValue(this._sharedService.isValidNumber((opportunityCost / Number(currentCost)) * 100));
            this.OpportunitySaving = opportunityCost;
          } else {
            this.costSummaryInfoForm.get('OpportunityPercentage')?.setValue(this._sharedService.isValidNumber(0.0));
            this.OpportunitySaving = opportunityCost;
          }
        }

        this.costSummaryInfoForm.get('ToolingCostPercentage')?.setValue(this._sharedService.transformNumberTwoDecimal((toolingCostAmount / totalCost) * 100));
      }

      this.chartDataCost = [
        this.costSummaryInfoForm.get('MaterialCostPercentage')?.value,
        this.costSummaryInfoForm.get('ManufacturingCostPercentage')?.value,
        this.costSummaryInfoForm.get('ToolingCostPercentage')?.value,
        this.costSummaryInfoForm.get('OverheadandProfitPercentage')?.value,
        this.costSummaryInfoForm.get('PackingCostPercentage')?.value,
        this.costSummaryInfoForm.get('EXWPartCostPercentage')?.value,
        this.costSummaryInfoForm.get('FreightCostPercentage')?.value,
        this.costSummaryInfoForm.get('DutiesandTariffPercentage')?.value,
        this.costSummaryInfoForm.get('ShouldCostPercentage')?.value,
      ];

      let currentBuyCost = 0;
      if (this.partDto != null && this.partDto.currentBuyCost != null) {
        currentBuyCost = this.partDto?.currentBuyCost || this.costSummaryInfoForm.get('CurrentCost')?.value || 0;
      }
      this.costSummaryInfoForm.get('MaterialCurrentCost')?.setValue(this._sharedService.isValidNumber(currentBuyCost));
      this.costSummaryInfoForm.get('ManufacturingCurrentCost')?.setValue(this._sharedService.isValidNumber(currentBuyCost));
      this.costSummaryInfoForm.get('OverheadandProfitCurrentCost')?.setValue(this._sharedService.isValidNumber(currentBuyCost));
      this.costSummaryInfoForm.get('PackingCostCurrentCost')?.setValue(this._sharedService.isValidNumber(currentBuyCost));
      this.costSummaryInfoForm.get('EXWPartCostCurrentCost')?.setValue(this._sharedService.isValidNumber(currentBuyCost));
      this.costSummaryInfoForm.get('FreightCostCurrentCost')?.setValue(this._sharedService.isValidNumber(currentBuyCost));

      const matPotentialSaving = Number(this.costSummaryViewData?.materialSustainabilityPart ?? 0);
      const manufPotentialSaving = Number(this.costSummaryViewData?.manufactureSustainabilityPart ?? 0);
      const overheadandProfitPotentialSaving = Number(currentBuyCost) - Number(overheadandProfitAmount);
      const packCostPotentialSaving = Number(this.costSummaryViewData?.packageSustainabilityPart ?? 0);
      const eXWPartCostPotentialSaving = matPotentialSaving + manufPotentialSaving + packCostPotentialSaving;
      const freightCostPotentialSaving = Number(this.costSummaryViewData?.logisticsSustainabilityPart ?? 0);
      const totEsgSavings = matPotentialSaving + manufPotentialSaving + packCostPotentialSaving + freightCostPotentialSaving;

      // this.matPotentialSaving = matPotentialSaving;
      // this.manufPotentialSaving = manufPotentialSaving;
      // this.overheadandProfitPotentialSaving = overheadandProfitPotentialSaving;
      // this.PackingCostPotentialSaving = packCostPotentialSaving;
      // this.eXWPartCostPotentialSaving = eXWPartCostPotentialSaving;
      // this.freightCostPotentialSaving = freightCostPotentialSaving;

      this.costSummaryInfoForm.get('MaterialPotentialSaving')?.setValue(this._sharedService.isValidNumber(matPotentialSaving));
      this.costSummaryInfoForm.get('ManufacturingPotentialSaving')?.setValue(this._sharedService.isValidNumber(manufPotentialSaving));
      this.costSummaryInfoForm.get('overheadandProfitPotentialSaving')?.setValue(this._sharedService.isValidNumber(overheadandProfitPotentialSaving));
      this.costSummaryInfoForm.get('eXWPartCostPotentialSaving')?.setValue(this._sharedService.isValidNumber(eXWPartCostPotentialSaving));
      this.costSummaryInfoForm.get('PackingCostPotentialSaving')?.setValue(this._sharedService.isValidNumber(packCostPotentialSaving));
      this.costSummaryInfoForm.get('freightCostPotentialSaving')?.setValue(this._sharedService.isValidNumber(freightCostPotentialSaving));

      this.costSummaryInfoForm.get('MaterialPotentialSavingPercentage')?.setValue(this._sharedService.transformNumberTwoDecimal(totEsgSavings > 0 ? (matPotentialSaving / totEsgSavings) * 100 : 0));
      this.costSummaryInfoForm
        .get('ManufacturingPotentialSavingPercentage')
        ?.setValue(this._sharedService.transformNumberTwoDecimal(totEsgSavings > 0 ? (manufPotentialSaving / totEsgSavings) * 100 : 0));
      this.costSummaryInfoForm
        .get('PackingCostPotentialSavingPercentage')
        ?.setValue(this._sharedService.transformNumberTwoDecimal(totEsgSavings > 0 ? (packCostPotentialSaving / totEsgSavings) * 100 : 0));
      this.costSummaryInfoForm
        .get('eXWPartCostPotentialSavingPercentage')
        ?.setValue(this._sharedService.transformNumberTwoDecimal(totEsgSavings > 0 ? (eXWPartCostPotentialSaving / totEsgSavings) * 100 : 0));
      this.costSummaryInfoForm
        .get('freightCostPotentialSavingPercentage')
        ?.setValue(this._sharedService.transformNumberTwoDecimal(totEsgSavings > 0 ? (freightCostPotentialSaving / totEsgSavings) * 100 : 0));
      this.costSummaryInfoForm.get('PartESGPercentage')?.setValue(this._sharedService.transformNumberTwoDecimal(totEsgSavings > 0 ? 100 : 0));

      this.chartDataEsg = [
        this.costSummaryInfoForm.get('MaterialPotentialSavingPercentage')?.value,
        this.costSummaryInfoForm.get('ManufacturingPotentialSavingPercentage')?.value,
        this.costSummaryInfoForm.get('PackingCostPotentialSavingPercentage')?.value,
        this.costSummaryInfoForm.get('eXWPartCostPotentialSavingPercentage')?.value,
        this.costSummaryInfoForm.get('freightCostPotentialSavingPercentage')?.value,
        this.costSummaryInfoForm.get('PartESGPercentage')?.value,
      ];

      const partEsg = totEsgSavings; // this.costSummaryViewData?.materialSustainabilityPart + this.costSummaryViewData?.manufactureSustainabilityPart;
      this.costSummaryInfoForm.get('PartESG')?.setValue(this._sharedService.isValidNumber(partEsg));
      const annualEsg = partEsg * this.costSummaryViewData?.sustainabilityAnnualNos;
      this.costSummaryInfoForm.get('AnnualESG')?.setValue(this._sharedService.isValidNumber(annualEsg));
      const lifeTimeEsg = annualEsg * productlifetime;
      this.costSummaryInfoForm.get('LifetimeESG')?.setValue(this._sharedService.isValidNumber(lifeTimeEsg));
    }
  }

  private calcOpportunityCost() {
    if (this.costSummaryInfoForm) {
      const shouldCost = this.costSummaryInfoForm.get('ShouldCostAmount')?.value;
      const currentCost = this.costSummaryInfoForm.get('CurrentCost')?.value;
      let shouldSpend = 0;

      if (currentCost >= 0 && this.partDto?.eav) {
        shouldSpend = Number(this.partDto.eav) * currentCost;
        this.costSummaryInfoForm.get('ShouldCostSpend')?.setValue(this.decimalPipe.transform(currentCost > 0 ? this._sharedService.isValidNumber(shouldSpend) : 0));

        const currentSpend = Number(this.partDto.eav) * shouldCost;
        this.costSummaryInfoForm.get('CurrentSpend')?.setValue(currentCost > 0 ? this._sharedService.isValidNumber(currentSpend) : 0);
        this.CurrentSpendValue = currentSpend;
        const shouldCostSpend = this.costSummaryInfoForm.get('ShouldCostSpend')?.value;

        const CurrentSpend = this.costSummaryInfoForm.get('CurrentSpend')?.value;
        const opportunityCost = Number(shouldCostSpend) - Number(CurrentSpend);
        this.costSummaryInfoForm.get('OpportunityAmount')?.setValue(currentCost > 0 ? this._sharedService.isValidNumber(opportunityCost) : 0);

        const opportunityCostvalue = this.costSummaryInfoForm.get('OpportunityAmount').value;
        const productlifetime = this.partDto?.prodLifeRemaining || 5;
        this.costSummaryInfoForm.get('LifeTimeSavingCurrentCost')?.setValue(this._sharedService.isValidNumber(opportunityCostvalue * productlifetime));

        // this.costSummaryInfoForm
        //   .get('PartESG')
        //   ?.setValue(this._sharedService.isValidNumber(this.costSummaryViewData?.materialSustainabilityPart + this.costSummaryViewData?.manufactureSustainabilityPart));
        // this.costSummaryInfoForm
        //   .get('AnnualESG')
        //   ?.setValue(
        //     this._sharedService.isValidNumber(
        //       (this.costSummaryViewData?.materialSustainabilityPart + this.costSummaryViewData?.manufactureSustainabilityPart) * this.costSummaryViewData?.sustainabilityAnnualNos
        //     )
        //   );

        let unitOpportunityShouldCost = Number(currentCost) - Number(shouldCost);

        unitOpportunityShouldCost = currentCost > 0 ? unitOpportunityShouldCost : 0;
        this.costSummaryInfoForm.get('UnitOpportunityShouldCost')?.setValue(currentCost > 0 ? this._sharedService.isValidNumber(unitOpportunityShouldCost) : 0);

        this.UnitOpportunityShouldCostValue = unitOpportunityShouldCost;
        let unitOpportunityCurrentCost = 0;
        if (currentCost > 0) {
          unitOpportunityCurrentCost = (unitOpportunityShouldCost / Number(currentCost)) * 100;
        }

        this.costSummaryInfoForm.get('UnitOpportunityCurrentCost')?.setValue(this._sharedService.isValidNumber(unitOpportunityCurrentCost));

        if (currentCost > 0) {
          this.costSummaryInfoForm.get('OpportunityPercentage')?.setValue(this._sharedService.isValidNumber((opportunityCost / Number(currentCost)) * 100));
          this.OpportunitySaving = opportunityCost;
        } else {
          this.costSummaryInfoForm.get('OpportunityPercentage')?.setValue(this._sharedService.isValidNumber(0.0));
          this.OpportunitySaving = opportunityCost;
        }
        // if (CurrentSpend > 0) {
        //   this.costSummaryInfoForm
        //     .get('LifeTimeSavingCurrentCost')
        //     ?.setValue(
        //       this.transformNumber(Number(CurrentSpend) * 5)
        //     );
        // }
        // if (Number(shouldSpend) > 0) {
        //   this.costSummaryInfoForm
        //     .get('LifeTimeSavingShouldCost')
        //     ?.setValue(
        //       this.transformNumber(Number(shouldSpend) * 5)
        //     );
        // }
      }
    }
  }

  private reset() {
    if (this.costSummaryInfoForm) {
      this.costSummaryInfoForm.reset();
    }
  }

  private setForm() {
    if (this.costSummaryViewData && this.costSummaryInfoForm) {
      const manuFactCost = (this.costSummaryViewData.sumManufacturingCost || 0) + (this.costSummaryViewData.platingCost || 0);
      const { sumNetMatCost, sumBillOfMaterial } = this.costSummaryViewData;
      const materialCostMap = {
        [CommodityType.WiringHarness]: this._sharedService.isValidNumber(sumNetMatCost) + this._sharedService.isValidNumber(sumBillOfMaterial),
        [CommodityType.Electronics]: this._sharedService.isValidNumber(sumBillOfMaterial),
      };
      const materialCost = materialCostMap[this.partDto?.commodityId] ?? this._sharedService.isValidNumber(sumNetMatCost);

      this.costSummaryInfoForm.patchValue({
        CostSummaryId: this.costSummaryViewData.costSummaryId,
        MaterialCostAmount: this._sharedService.isValidNumber(materialCost),
        MaterialCostPercentage: 0,
        ManufacturingCostAmount: this._sharedService.isValidNumber(manuFactCost || 0),
        ManufacturingCostPercentage: 0,
        UnitPartCostAmount: 0,
        UnitPartCostPercentage: '',
        ICCAmount: 0,
        ICCPercentage: '',
        MaterialOHAmount: 0,
        MaterialOHPercentage: '',
        FactoryOHAmount: 0,
        FactoryOHPercentage: '',
        SGandAAmount: 0,
        SGandAPercentage: '',
        ProfitAmount: 0,
        ProfitPercentage: '',
        PaymentTermsAmount: 0,
        PaymentTermsPercentage: '',
        FinishPartICCAmount: 0,
        FinishPartICCpercentage: '',
        OverheadandProfitAmount: this._sharedService.isValidNumber(this.costSummaryViewData.sumOverHeadCost),
        OverheadandProfitPercentage: 0,
        EXWPartCostAmount: 0,
        EXWPartCostPercentage: 0,
        PackingCostAmount: this._sharedService.isValidNumber(this.costSummaryViewData.packingCost),
        PackingCostPercentage: 0,
        FreightCostAmount: this._sharedService.isValidNumber(this.costSummaryViewData.freightCost),
        FreightCostPercentage: 0,
        DutiesandTariffAmount: this._sharedService.isValidNumber(this.costSummaryViewData.dutiesTariffCost),
        DutiesandTariffPercentage: 0,
        CurrentCost: this._sharedService.isValidNumber(this.costSummaryViewData.currMaterialCost),
        ShouldCostAmount: 0,
        ShouldCostPercentage: 0,
        CurrentSpend: 0,
        ShouldCostSpend: 0,
        OpportunityAmount: 0,
        OpportunityPercentage: 0,
        LifeTimeSavingShouldCost: 0,
        LifeTimeSavingCurrentCost: 0,
        PartESG: 0,
        PartESGPercentage: 0,
        AnnualESG: 0,
        LifetimeESG: 0,
        Comments: this.costSummaryViewData.comments,
        UnitOpportunityShouldCost: 0,
        UnitOpportunityCurrentCost: 0,
        ToolingCostAmount: this._sharedService.isValidNumber(this.costSummaryViewData.toolingCost),
        ToolingCostPercentage: 0,
      });
    }
  }

  private costSummaryCalculation() {
    if (this.costSummaryInfoForm) {
      const shouldCost = this.costSummaryInfoForm.get('ShouldCostAmount')?.value;
      const currentCost = this.costSummaryInfoForm.get('CurrentCost')?.value;
      let unitOpportunityShouldCost = Number(currentCost) - Number(shouldCost);

      unitOpportunityShouldCost = currentCost > 0 ? unitOpportunityShouldCost : 0;
      this.costSummaryInfoForm.get('UnitOpportunityShouldCost')?.setValue(currentCost > 0 ? this._sharedService.isValidNumber(unitOpportunityShouldCost) : 0);

      let unitOpportunityCurrentCost = 0;
      if (currentCost > 0) {
        unitOpportunityCurrentCost = (unitOpportunityShouldCost / Number(currentCost)) * 100;
      }
      this.costSummaryInfoForm.get('UnitOpportunityCurrentCost')?.setValue(this._sharedService.isValidNumber(unitOpportunityCurrentCost));

      let shouldSpend = 0;

      shouldSpend = currentCost * Number(this.partDto?.eav || 0);
      this.costSummaryInfoForm.get('ShouldCostSpend')?.setValue(this.decimalPipe.transform(currentCost > 0 ? this._sharedService.isValidNumber(shouldSpend) : 0));

      const currentSpend = shouldCost * Number(this.partDto?.eav || 0); // anuualspend/shouldcost
      this.costSummaryInfoForm.get('CurrentSpend')?.setValue(currentCost > 0 ? this._sharedService.isValidNumber(currentSpend) : 0);
      this.CurrentSpendValue = currentSpend;

      const opportunityCost = Number(shouldSpend) - Number(currentSpend);
      this.costSummaryInfoForm.get('OpportunityAmount')?.setValue(currentCost > 0 ? this._sharedService.isValidNumber(opportunityCost) : 0);

      const opportunityCostvalue = this.costSummaryInfoForm.get('OpportunityAmount').value;
      const productlifetime = this.partDto?.prodLifeRemaining || 5;
      this.costSummaryInfoForm.get('LifeTimeSavingCurrentCost')?.setValue(this._sharedService.isValidNumber(opportunityCostvalue * productlifetime));

      this.UnitOpportunityShouldCostValue = unitOpportunityShouldCost;

      // this.costSummaryInfoForm
      //   .get('PartESG')
      //   ?.setValue(this._sharedService.isValidNumber(this.costSummaryViewData?.materialSustainabilityPart + this.costSummaryViewData?.manufactureSustainabilityPart));
      // this.costSummaryInfoForm
      //   .get('AnnualESG')
      //   ?.setValue(
      //     this._sharedService.isValidNumber(
      //       (this.costSummaryViewData?.materialSustainabilityPart + this.costSummaryViewData?.manufactureSustainabilityPart) * this.costSummaryViewData?.sustainabilityAnnualNos
      //     )
      //   );
    }
  }

  setCostSummarySection() {
    this.costSummaryCalculation();
    if (this.costSummaryInfoForm.controls['CurrentCost'].dirty) {
      this.dirtyCheckEvent.emit(true);
    }
  }

  commentChange() {
    if (this.costSummaryInfoForm.controls['Comments'].dirty) {
      this.dirtyCheckEvent.emit(true);
    }
  }

  getPdfFilterCategories(aiSuggestedCategoryValue: string) {
    let pdfCategoriesToFilter: string[] = [];
    switch (aiSuggestedCategoryValue) {
      case 'Plastic & Rubber': {
        pdfCategoriesToFilter = ['material', 'surface_finish_painting'];
        return pdfCategoriesToFilter;
      }
      case 'Sheet Metal and Fabrication': {
        pdfCategoriesToFilter = ['material', 'deburr', 'welding', 'surface_finish_painting', 'Inspection', 'cleaning'];
        return pdfCategoriesToFilter;
      }
      default: {
        return pdfCategoriesToFilter;
      }
    }
  }

  openGdntModal() {
    const modalRef = this.modalService.open(CostingGdntComponent, {
      windowClass: 'fullscreen',
    });
    modalRef.componentInstance.partId = this.currentSelectedPartId;
  }

  openAttributeModal() {
    const modalRef = this.modalService.open(CostingAiAttributeComponent, {
      windowClass: 'fullscreen',
    });
    modalRef.componentInstance.partId = this.currentSelectedPartId;
  }

  openSuggestionModal() {
    const modalRef = this.modalService.open(CostingSuggestionComponent, {
      windowClass: 'fullscreen',
    });
    modalRef.componentInstance.partId = this.currentSelectedPartId;
    modalRef.componentInstance.commodityId = this.partDto?.commodityId;
  }

  openGerberDetailsModel() {
    const modalRef = this.modalService.open(GerberReaderAiComponent, {
      windowClass: 'fullscreen',
    });
    modalRef.componentInstance.partInfoId = this.currentSelectedPartId;
    modalRef.componentInstance.commodityId = this.partDto?.commodityId;
  }

  saveCostSummary() {
    const model = new CostSummaryDto();
    model.costSummaryId = this.costSummaryViewData ? this.costSummaryViewData.costSummaryId : 0;
    model.partInfoId = this.costSummaryViewData.partInfoId;
    model.materialCost = this.costSummaryInfoForm.controls['MaterialCostAmount'].value || 0;
    model.conversionCost = this.costSummaryInfoForm.controls['ManufacturingCostAmount'].value || 0;
    model.ohpCost = +this.costSummaryInfoForm.controls['OverheadandProfitAmount'].value || 0;
    model.packingCost = +this.costSummaryInfoForm.controls['PackingCostAmount'].value || 0;
    model.freightCost = +this.costSummaryInfoForm.controls['FreightCostAmount'].value || 0;
    model.dtcost = +this.costSummaryInfoForm.controls['DutiesandTariffAmount'].value || 0;
    model.currMaterialCost = +this.costSummaryInfoForm.controls['CurrentCost'].value || 0;
    model.shouldCost = +this.costSummaryInfoForm.controls['ShouldCostAmount'].value || 0;
    model.opportunityCost = +this.costSummaryInfoForm.controls['OpportunityAmount'].value || 0;
    model.comments = this.costSummaryInfoForm.controls['Comments'].value || '';

    if (model.costSummaryId == 0 || model.costSummaryId == null) {
      this.costSummarySignalsService.createCostSummary(model);
      this.messaging.openSnackBar(`Cost summary Information has been saved successfully.`, '', { duration: 5000 });
    } else {
      this.costSummarySignalsService.updateCostSummary(model);
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
    this.partInfoEffect.destroy();
    this.costSumaryAllEffect.destroy();
  }
}
