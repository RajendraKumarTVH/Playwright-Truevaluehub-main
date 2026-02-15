import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { BlockUiService } from 'src/app/shared/services';
import { ProjectInfoDto, VendorDto } from 'src/app/shared/models';
import { BaseChartDirective } from 'ng2-charts';
import { AbstractControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AnalyticsService } from '../../services/analytics.service';
import { PartModel } from '../../models/part-model';
import { CostDriverSummary } from '../../models/cost-driver-summary.model';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { PlaybookDto } from '../../models/playbook-dto';
import { PlayBookCostDriverDto } from '../../models/playbook-costdriver-dto';
import { ChartConfiguration } from 'chart.js';
import { VendorService } from 'src/app/modules/data/Service/vendor.service';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-playbook',
  templateUrl: './playbook.component.html',
  styleUrls: ['./playbook.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ChartModule, MatAutocompleteModule, BaseChartDirective],
})
export class PlaybookComponent implements OnInit, OnDestroy {
  public screenHeight: number;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  @ViewChild(MatAutocomplete) projectAuto: MatAutocomplete;

  public filteredSupplierList$: Observable<VendorDto[]>;
  public filteredProjects$: Observable<ProjectInfoDto[]>;
  public filteredPlaybook$: Observable<PlaybookDto[]>;
  public filteredParts$: Observable<PartModel[]>;
  public playBookForm: FormGroup;
  public playBookCostForm: FormGroup;
  public supplierList: VendorDto[] = [];
  public projectInfoList: ProjectInfoDto[];
  public playbookList: PlaybookDto[];
  public partInfoList: PartModel[];
  public isSaveEnabled: boolean = false;
  public isTitleChanged: boolean = false;
  public title: string = '';
  public radarChartOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'left',
      },
    },
    layout: {
      autoPadding: false,
    },
  };
  public radarChartLabels: string[] = ['Gross Raw Material', 'Raw Material', 'Scrap Recovery wt', 'Scrap Recovery Price', 'Cycle Time', 'Machine Rate', 'Other', 'Labor', 'Overhead', 'Profit'];
  public radarChartDatasets: ChartConfiguration<'radar'>['data']['datasets'];

  constructor(
    private blockUiService: BlockUiService,
    private vendorService: VendorService,
    private _fb: FormBuilder,
    private analyticsService: AnalyticsService,
    private messaging: MessagingService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.screenHeight = window.screen.height;
    this.getProjectList();
    this.getPlaybookList();
    this.buildForm();
    this.getSupplierList();
    this.drawGraph();
  }

  buildForm() {
    this.playBookForm = this._fb.group({
      playbookId: [0],
      playBookTitle: [null, [Validators.required]],
      projectId: [null, [Validators.required]],
      partId: [null, [Validators.required]],
      supplier: [null],
      revisionLevel: [null],
    });

    this.playBookCostForm = this._fb.group({
      GrossRawMaterialcostDriverID: [0],
      GrossRawMaterialId: [0],
      GrossRawMaterialUnitOfMeasure: ['gms'],
      GrossRawMaterialCurrentCost: [0],
      GrossRawMaterialShouldCost: [0],
      GrossRawMaterialPercentage: [0],
      GrossRawMaterialNewCost: [0],
      GrossRawMaterialComments: [null],

      RawMaterialcostDriverID: [0],
      RawMaterialId: [0],
      RawMaterialUnitOfMeasure: ['$'],
      RawMaterialCurrentCost: [0],
      RawMaterialShouldCost: [0],
      RawMaterialPercentage: [0],
      RawMaterialNewCost: [0],
      RawMaterialComments: [null],

      ScrapRecoveryWtcostDriverID: [0],
      ScrapRecoveryWtId: [0],
      ScrapRecoveryWtUnitOfMeasure: ['gms'],
      ScrapRecoveryWtCurrentCost: [0],
      ScrapRecoveryWtShouldCost: [0],
      ScrapRecoveryWtPercentage: [0],
      ScrapRecoveryWtNewCost: [0],
      ScrapRecoveryWtComments: [null],

      ScrapRecoveryPricecostDriverID: [0],
      ScrapRecoveryPriceId: [0],
      ScrapRecoveryPriceUnitOfMeasure: ['$'],
      ScrapRecoveryPriceCurrentCost: [0],
      ScrapRecoveryPriceShouldCost: [0],
      ScrapRecoveryPricePercentage: [0],
      ScrapRecoveryPriceNewCost: [0],
      ScrapRecoveryPriceComments: [null],

      CycleTimecostDriverID: [0],
      CycleTimeId: [0],
      CycleTimeUnitOfMeasure: ['Sec'],
      CycleTimeCurrentCost: [0],
      CycleTimeShouldCost: [0],
      CycleTimePercentage: [0],
      CycleTimeNewCost: [0],
      CycleTimeComments: [null],

      MachineRatecostDriverID: [0],
      MachineRateId: [0],
      MachineRateUnitOfMeasure: ['$'],
      MachineRateCurrentCost: [0],
      MachineRateShouldCost: [0],
      MachineRatePercentage: [0],
      MachineRateNewCost: [0],
      MachineRateComments: [null],

      LaborRatecostDriverID: [0],
      LaborRateId: [0],
      LaborRateUnitOfMeasure: ['$'],
      LaborRateCurrentCost: [0],
      LaborRateShouldCost: [0],
      LaborRatePercentage: [0],
      LaborRateNewCost: [0],
      LaborRateComments: [null],

      OverHeadcostDriverID: [0],
      OverHeadId: [0],
      OverHeadUnitOfMeasure: ['$'],
      OverHeadCurrentCost: [0],
      OverHeadShouldCost: [0],
      OverHeadPercentage: [0],
      OverHeadNewCost: [0],
      OverHeadComments: [null],

      ProfitcostDriverID: [0],
      ProfitId: [0],
      ProfitUnitOfMeasure: ['$'],
      ProfitCurrentCost: [0],
      ProfitShouldCost: [0],
      ProfitPercentage: [0],
      ProfitNewCost: [0],
      ProfitComments: [null],

      TotalcostDriverID: [0],
      TotalId: [0],
      TotalCurrentCost: [0],
      TotalShouldCost: [0],
      TotalNewCost: [0],
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  private getSupplierList() {
    // this.blockUiService.pushBlockUI('getVendorList');
    return this.vendorService
      .getVendorList()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: VendorDto[]) => {
        // this.blockUiService.popBlockUI('getVendorList');
        if (result && result.length > 0) {
          this.supplierList = [...result];
          this.filteredSupplierList$ = this.supplierNameControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterSupplier(value || ''))
          );
        }
      });
  }

  private getProjectList() {
    return this.analyticsService
      .getProjectDetails()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any[]) => {
        if (result && result.length > 0) {
          this.projectInfoList = result;
          this.filteredProjects$ = this.projectSearchControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterProject(value || ''))
          );
        }
      });
  }

  private getPlaybookList() {
    return this.analyticsService
      .getplaybookList()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any[]) => {
        if (result && result.length > 0) {
          this.playbookList = result;
          this.filteredPlaybook$ = this.playbookNameControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterPlaybook(value || ''))
          );
        }
      });
  }

  onSearchClick() {
    const projId = this.playBookForm.get('projectId')?.value?.projectInfoId;
    const partId = this.playBookForm.get('partId')?.value?.partInfoId;
    if (projId && partId) {
      this.analyticsService
        .getCostDriverSummaryByProjectId(projId, partId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: any) => {
          if (result) {
            this.patchCostForm(result);
            this.isSaveEnabled = true;
          }
        });
    } else {
      this.messaging.openSnackBar('Please Choose Project and Part.', '', {
        duration: 5000,
      });
    }
  }

  /**
   * update the form with the search results
   */
  patchCostForm(costDriverSummary: CostDriverSummary) {
    this.playBookCostForm.patchValue({
      CycleTimeShouldCost: this.sharedService.isValidNumber(costDriverSummary.cycleTime),
      RawMaterialShouldCost: this.sharedService.isValidNumber(costDriverSummary.rawMatPrice),
      GrossRawMaterialShouldCost: this.sharedService.isValidNumber(costDriverSummary.rawMatWeight),
      ScrapRecoveryWtShouldCost: this.sharedService.isValidNumber(costDriverSummary.scrapWeight),
      ScrapRecoveryPriceShouldCost: this.sharedService.isValidNumber(costDriverSummary.scrapRecCost),

      LaborRateShouldCost: this.sharedService.isValidNumber(costDriverSummary.labourRate),
      OverHeadShouldCost: this.sharedService.isValidNumber(costDriverSummary.overHead),
      ProfitShouldCost: this.sharedService.isValidNumber(costDriverSummary.profit),
      MachineRateShouldCost: this.sharedService.isValidNumber(costDriverSummary.machineHourRate),
      //make new cost same as should cost on search
      CycleTimeNewCost: this.sharedService.isValidNumber(costDriverSummary.cycleTime),
      RawMaterialNewCost: this.sharedService.isValidNumber(costDriverSummary.rawMatPrice),
      GrossRawMaterialNewCost: this.sharedService.isValidNumber(costDriverSummary.rawMatWeight),
      ScrapRecoveryWtNewCost: this.sharedService.isValidNumber(costDriverSummary.scrapWeight),
      ScrapRecoveryPriceNewCost: this.sharedService.isValidNumber(costDriverSummary.scrapRecCost),
      LaborRateNewCost: this.sharedService.isValidNumber(costDriverSummary.labourRate),
      OverHeadNewCost: this.sharedService.isValidNumber(costDriverSummary.overHead),
      ProfitNewCost: this.sharedService.isValidNumber(costDriverSummary.profit),
      MachineRateNewCost: this.sharedService.isValidNumber(costDriverSummary.machineHourRate),
    });
    this.totalShouldCostCalculation();
    this.totalNewCostCalculation();
    this.drawGraph();
  }

  setTitleWithoutSelection(e: any) {
    this.isTitleChanged = true;
    this.title = e.target.value;
  }

  /**
   * save playbook Info
   */
  onSubmit(): void {
    if (this.playBookForm.valid) {
      const playbook = new PlaybookDto();
      playbook.playBookId = this.playBookForm.controls['playbookId'].value;
      if (playbook.playBookId > 0 && this.isTitleChanged) {
        playbook.playbookName = this.displayPlaybookName(this.playBookForm.controls['playBookTitle'].value as PlaybookDto);
      } else {
        playbook.playbookName = this.title;
      }
      playbook.projectInfoId = (this.playBookForm.controls['projectId'].value as ProjectInfoDto)?.projectInfoId;
      playbook.partInfoId = (this.playBookForm.controls['partId'].value as PartModel)?.partInfoId;

      const vendor = this.playBookForm.controls['supplier'].value as VendorDto;
      playbook.supplierId = vendor ? parseInt(vendor.vendorId) : 0;

      playbook.revisionLevel = this.playBookForm.controls['revisionLevel'].value;

      /**
       * costDriverMasterID are taken from tblCostDriverMaster.
       * those are the KEY COST DRIVERS
       */
      const costInfo: PlayBookCostDriverDto[] = [
        {
          costDriverMasterID: 1, //Gross Raw Material Weight
          playBookId: playbook.playBookId,
          costDriverID: this.playBookCostForm.controls['GrossRawMaterialId'].value,
          newCost: this.playBookCostForm.controls['GrossRawMaterialNewCost'].value,
          slidePer: this.playBookCostForm.controls['GrossRawMaterialPercentage'].value,
          comment: this.playBookCostForm.controls['GrossRawMaterialComments'].value,
          shouldCost: this.playBookCostForm.controls['GrossRawMaterialShouldCost'].value,
          currentCost: this.playBookCostForm.controls['GrossRawMaterialCurrentCost'].value,
        },

        {
          costDriverMasterID: 2, //Raw Material Price
          playBookId: playbook.playBookId,
          costDriverID: this.playBookCostForm.controls['RawMaterialId'].value,
          newCost: this.playBookCostForm.controls['RawMaterialNewCost'].value,
          slidePer: this.playBookCostForm.controls['RawMaterialPercentage'].value,
          comment: this.playBookCostForm.controls['RawMaterialComments'].value,
          shouldCost: this.playBookCostForm.controls['RawMaterialShouldCost'].value,
          currentCost: this.playBookCostForm.controls['RawMaterialCurrentCost'].value,
        },
        {
          costDriverMasterID: 3, //Scrap Recovery Weight
          playBookId: playbook.playBookId,
          costDriverID: this.playBookCostForm.controls['ScrapRecoveryWtId'].value,
          newCost: this.playBookCostForm.controls['ScrapRecoveryWtNewCost'].value,
          slidePer: this.playBookCostForm.controls['ScrapRecoveryWtPercentage'].value,
          comment: this.playBookCostForm.controls['ScrapRecoveryWtComments'].value,
          shouldCost: this.playBookCostForm.controls['ScrapRecoveryWtShouldCost'].value,
          currentCost: this.playBookCostForm.controls['ScrapRecoveryWtCurrentCost'].value,
        },
        {
          costDriverMasterID: 5, //Scrap Recovery Price
          playBookId: playbook.playBookId,
          costDriverID: this.playBookCostForm.controls['ScrapRecoveryPriceId'].value,
          newCost: this.playBookCostForm.controls['ScrapRecoveryPriceNewCost'].value,
          slidePer: this.playBookCostForm.controls['ScrapRecoveryPricePercentage'].value,
          comment: this.playBookCostForm.controls['ScrapRecoveryPriceComments'].value,
          shouldCost: this.playBookCostForm.controls['ScrapRecoveryPriceShouldCost'].value,
          currentCost: this.playBookCostForm.controls['ScrapRecoveryPriceCurrentCost'].value,
        },
        {
          costDriverMasterID: 6, //Cycle Time
          playBookId: playbook.playBookId,
          costDriverID: this.playBookCostForm.controls['CycleTimeId'].value,
          newCost: this.playBookCostForm.controls['CycleTimeNewCost'].value,
          slidePer: this.playBookCostForm.controls['CycleTimePercentage'].value,
          comment: this.playBookCostForm.controls['CycleTimeComments'].value,
          shouldCost: this.playBookCostForm.controls['CycleTimeShouldCost'].value,
          currentCost: this.playBookCostForm.controls['CycleTimeCurrentCost'].value,
        },
        {
          costDriverMasterID: 7, //Machine Hourly Rate
          playBookId: playbook.playBookId,
          costDriverID: this.playBookCostForm.controls['MachineRateId'].value,
          newCost: this.playBookCostForm.controls['MachineRateNewCost'].value,
          slidePer: this.playBookCostForm.controls['MachineRatePercentage'].value,
          comment: this.playBookCostForm.controls['MachineRateComments'].value,
          shouldCost: this.playBookCostForm.controls['MachineRateShouldCost'].value,
          currentCost: this.playBookCostForm.controls['MachineRateCurrentCost'].value,
        },
        {
          costDriverMasterID: 8, //Labor Cost
          playBookId: playbook.playBookId,
          costDriverID: this.playBookCostForm.controls['LaborRateId'].value,
          newCost: this.playBookCostForm.controls['LaborRateNewCost'].value,
          slidePer: this.playBookCostForm.controls['LaborRatePercentage'].value,
          comment: this.playBookCostForm.controls['LaborRateComments'].value,
          shouldCost: this.playBookCostForm.controls['LaborRateShouldCost'].value,
          currentCost: this.playBookCostForm.controls['LaborRateCurrentCost'].value,
        },
        {
          costDriverMasterID: 9, //Over Head
          playBookId: playbook.playBookId,
          costDriverID: this.playBookCostForm.controls['OverHeadId'].value,
          newCost: this.playBookCostForm.controls['OverHeadNewCost'].value,
          slidePer: this.playBookCostForm.controls['OverHeadPercentage'].value,
          comment: this.playBookCostForm.controls['OverHeadComments'].value,
          shouldCost: this.playBookCostForm.controls['OverHeadShouldCost'].value,
          currentCost: this.playBookCostForm.controls['OverHeadCurrentCost'].value,
        },
        {
          costDriverMasterID: 11, //Profit
          playBookId: playbook.playBookId,
          costDriverID: this.playBookCostForm.controls['ProfitId'].value,
          newCost: this.playBookCostForm.controls['ProfitNewCost'].value,
          slidePer: this.playBookCostForm.controls['ProfitPercentage'].value,
          comment: this.playBookCostForm.controls['ProfitComments'].value,
          shouldCost: this.playBookCostForm.controls['ProfitShouldCost'].value,
          currentCost: this.playBookCostForm.controls['ProfitCurrentCost'].value,
        },
        {
          costDriverMasterID: 12, //Total Part Cost
          playBookId: playbook.playBookId,
          costDriverID: this.playBookCostForm.controls['TotalId'].value,
          newCost: this.playBookCostForm.controls['TotalNewCost'].value,
          slidePer: 0,
          comment: '',
          shouldCost: this.playBookCostForm.controls['TotalShouldCost'].value,
          currentCost: this.playBookCostForm.controls['TotalCurrentCost'].value,
        },
      ];
      playbook.playBookCostDriver = costInfo;

      this.analyticsService
        .saveAnalyticsDetails(playbook)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          this.blockUiService.popBlockUI('saveAnalyticsDetails');
          if (result) {
            this.messaging.openSnackBar('Playbook Info Saved Successfully !', '', {
              duration: 5000,
            });
            this.getPlaybookList();
          }
        });
    } else {
      this.messaging.openSnackBar('Please Provide mandatory inputs', '', {
        duration: 5000,
      });
    }
  }

  public displaySupplier(supplier: VendorDto): string {
    return supplier?.vendorName || '';
  }
  public displayProject(project: ProjectInfoDto): string {
    return project?.projectName || '';
  }
  public displayPartName(project: PartModel): string {
    return project?.intPartNumber || '';
  }
  public displayPlaybookName(playbook: PlaybookDto): string {
    return playbook?.playbookName || this.title;
  }

  public projectOptionSelected(event: MatAutocompleteSelectedEvent) {
    const selectedProject = event.option.value as ProjectInfoDto;
    this.analyticsService
      .getPartsByProjectId(selectedProject.projectInfoId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any[]) => {
        if (result && result.length > 0) {
          this.partInfoList = result;
          this.filteredParts$ = this.partsControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterParts(value || ''))
          );
        }
      });
  }

  public setProjectOption(playbook: PlaybookDto) {
    this.analyticsService
      .getPartsByProjectId(playbook.projectInfoId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any[]) => {
        if (result && result.length > 0) {
          this.partInfoList = result;
          this.setFormBasedOnPlayBookChange(playbook);
          this.filteredParts$ = this.partsControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterParts(value || ''))
          );
        }
      });
  }

  public playbookNameOnChange(event: MatAutocompleteSelectedEvent) {
    const selectedPlaybook = event.option.value as PlaybookDto;
    this.setProjectOption(selectedPlaybook);
    this.isSaveEnabled = true;
  }

  setFormBasedOnPlayBookChange(selectedPlaybook: PlaybookDto) {
    const selecteProject = this.projectInfoList.find((proj) => proj.projectInfoId === selectedPlaybook.projectInfoId);

    let selectedSupplier;
    if (selectedPlaybook.supplierId) {
      selectedSupplier = this.supplierList.find((item) => item.vendorId === selectedPlaybook.supplierId.toString());
    }

    const selectedPart = this.partInfoList.find((item) => item.partInfoId === selectedPlaybook.partInfoId);

    this.projectSearchControl.setValue(selecteProject);
    this.supplierNameControl.setValue(selectedSupplier);
    this.partsControl.setValue(selectedPart);

    this.playBookForm.patchValue({
      plaplaybookId: selectedPlaybook.playBookId,
      revisionLevel: selectedPlaybook.revisionLevel,
      playbookId: selectedPlaybook.playBookId,
    });

    const costDriverinfo = selectedPlaybook?.playBookCostDriver;
    if (costDriverinfo) {
      const grossInfo = costDriverinfo.find((item) => item.costDriverMasterID === 1);
      const rawMaterialInfo = costDriverinfo.find((item) => item.costDriverMasterID === 2);
      const scrapRecoveryWeight = costDriverinfo.find((item) => item.costDriverMasterID === 3);
      const scrapRecovery = costDriverinfo.find((item) => item.costDriverMasterID === 5);
      const cycleTime = costDriverinfo.find((item) => item.costDriverMasterID === 6);
      const machineRate = costDriverinfo.find((item) => item.costDriverMasterID === 7);
      const laborCost = costDriverinfo.find((item) => item.costDriverMasterID === 8);
      const overHead = costDriverinfo.find((item) => item.costDriverMasterID === 9);
      const profit = costDriverinfo.find((item) => item.costDriverMasterID === 11);
      const totCost = costDriverinfo.find((item) => item.costDriverMasterID === 12);

      this.playBookCostForm.patchValue({
        GrossRawMaterialcostDriverID: grossInfo?.costDriverID,
        GrossRawMaterialCurrentCost: this.sharedService.isValidNumber(grossInfo?.currentCost),
        GrossRawMaterialShouldCost: this.sharedService.isValidNumber(grossInfo?.shouldCost),
        GrossRawMaterialPercentage: this.sharedService.isValidNumber(grossInfo?.slidePer),
        GrossRawMaterialNewCost: this.sharedService.isValidNumber(grossInfo?.newCost),
        GrossRawMaterialComments: grossInfo?.comment,
        GrossRawMaterialId: grossInfo?.costDriverID,

        RawMaterialcostDriverID: rawMaterialInfo?.costDriverID,
        RawMaterialCurrentCost: this.sharedService.isValidNumber(rawMaterialInfo?.currentCost),
        RawMaterialShouldCost: this.sharedService.isValidNumber(rawMaterialInfo?.shouldCost),
        RawMaterialPercentage: this.sharedService.isValidNumber(rawMaterialInfo?.slidePer),
        RawMaterialNewCost: this.sharedService.isValidNumber(rawMaterialInfo?.newCost),
        RawMaterialComments: rawMaterialInfo?.comment,
        RawMaterialId: rawMaterialInfo?.costDriverID,

        ScrapRecoveryWtcostDriverID: scrapRecoveryWeight?.costDriverID,
        ScrapRecoveryWtCurrentCost: this.sharedService.isValidNumber(scrapRecoveryWeight?.newCost),
        ScrapRecoveryWtShouldCost: this.sharedService.isValidNumber(scrapRecoveryWeight?.shouldCost),
        ScrapRecoveryWtPercentage: this.sharedService.isValidNumber(scrapRecoveryWeight?.slidePer),
        ScrapRecoveryWtNewCost: this.sharedService.isValidNumber(scrapRecoveryWeight?.newCost),
        ScrapRecoveryWtComments: scrapRecoveryWeight?.comment,
        ScrapRecoveryWtId: scrapRecoveryWeight?.costDriverID,

        ScrapRecoveryPricecostDriverID: scrapRecovery?.costDriverID,
        ScrapRecoveryPriceCurrentCost: this.sharedService.isValidNumber(scrapRecovery?.currentCost),
        ScrapRecoveryPriceShouldCost: this.sharedService.isValidNumber(scrapRecovery?.shouldCost),
        ScrapRecoveryPricePercentage: this.sharedService.isValidNumber(scrapRecovery?.slidePer),
        ScrapRecoveryPriceNewCost: this.sharedService.isValidNumber(scrapRecovery?.newCost),
        ScrapRecoveryPriceComments: scrapRecovery?.comment,
        ScrapRecoveryPriceId: scrapRecovery?.costDriverID,

        CycleTimecostDriverID: cycleTime?.costDriverID,
        CycleTimeCurrentCost: this.sharedService.isValidNumber(cycleTime?.currentCost),
        CycleTimeShouldCost: this.sharedService.isValidNumber(cycleTime?.shouldCost),
        CycleTimePercentage: this.sharedService.isValidNumber(cycleTime?.slidePer),
        CycleTimeNewCost: this.sharedService.isValidNumber(cycleTime?.newCost),
        CycleTimeComments: cycleTime?.comment,
        CycleTimeId: cycleTime?.costDriverID,

        MachineRatecostDriverID: machineRate?.costDriverID,
        MachineRateCurrentCost: this.sharedService.isValidNumber(machineRate?.currentCost),
        MachineRateShouldCost: this.sharedService.isValidNumber(machineRate?.shouldCost),
        MachineRatePercentage: this.sharedService.isValidNumber(machineRate?.slidePer),
        MachineRateNewCost: this.sharedService.isValidNumber(machineRate?.newCost),
        MachineRateComments: machineRate?.comment,
        MachineRateId: machineRate?.costDriverID,

        LaborRatecostDriverID: laborCost?.costDriverID,
        LaborRateCurrentCost: this.sharedService.isValidNumber(laborCost?.currentCost),
        LaborRateShouldCost: this.sharedService.isValidNumber(laborCost?.shouldCost),
        LaborRatePercentage: this.sharedService.isValidNumber(laborCost?.slidePer),
        LaborRateNewCost: this.sharedService.isValidNumber(laborCost?.newCost),
        LaborRateComments: laborCost?.comment,
        LaborRateId: laborCost?.costDriverID,

        OverHeadcostDriverID: overHead?.costDriverID,
        OverHeadCurrentCost: this.sharedService.isValidNumber(overHead?.currentCost),
        OverHeadShouldCost: this.sharedService.isValidNumber(overHead?.shouldCost),
        OverHeadPercentage: this.sharedService.isValidNumber(overHead?.slidePer),
        OverHeadNewCost: this.sharedService.isValidNumber(overHead?.newCost),
        OverHeadComments: overHead?.comment,
        OverHeadId: overHead?.costDriverID,

        ProfitcostDriverID: profit?.costDriverID,
        ProfitCurrentCost: this.sharedService.isValidNumber(profit?.currentCost),
        ProfitShouldCost: this.sharedService.isValidNumber(profit?.shouldCost),
        ProfitPercentage: this.sharedService.isValidNumber(profit?.slidePer),
        ProfitNewCost: this.sharedService.isValidNumber(profit?.newCost),
        ProfitComments: profit?.comment,
        ProfitId: profit?.costDriverID,

        TotalcostDriverID: totCost?.costDriverID,
        TotalCurrentCost: this.sharedService.isValidNumber(totCost?.currentCost),
        TotalShouldCost: this.sharedService.isValidNumber(totCost?.shouldCost),
        TotalNewCost: this.sharedService.isValidNumber(totCost?.slidePer),
        TotalId: totCost?.costDriverID,
      });
    }
    this.playBookCostForm.updateValueAndValidity();
    this.totalShouldCostCalculation();
    this.totalNewCostCalculation();
    this.drawGraph();
  }

  drawGraph() {
    const currentCostData = [
      parseFloat(this.playBookCostForm.controls['GrossRawMaterialCurrentCost'].value),
      parseFloat(this.playBookCostForm.controls['RawMaterialCurrentCost'].value),
      parseFloat(this.playBookCostForm.controls['ScrapRecoveryWtCurrentCost'].value),
      parseFloat(this.playBookCostForm.controls['ScrapRecoveryPriceCurrentCost'].value),
      parseFloat(this.playBookCostForm.controls['CycleTimeCurrentCost'].value),
      parseFloat(this.playBookCostForm.controls['MachineRateCurrentCost'].value),
      parseFloat(this.playBookCostForm.controls['LaborRateCurrentCost'].value),
      parseFloat(this.playBookCostForm.controls['OverHeadCurrentCost'].value),
      parseFloat(this.playBookCostForm.controls['ProfitCurrentCost'].value),
    ];

    const shouldCostData = [
      parseFloat(this.playBookCostForm.controls['GrossRawMaterialShouldCost'].value),
      parseFloat(this.playBookCostForm.controls['RawMaterialShouldCost'].value),
      parseFloat(this.playBookCostForm.controls['ScrapRecoveryWtShouldCost'].value),
      parseFloat(this.playBookCostForm.controls['ScrapRecoveryPriceShouldCost'].value),
      parseFloat(this.playBookCostForm.controls['CycleTimeShouldCost'].value),
      parseFloat(this.playBookCostForm.controls['MachineRateShouldCost'].value),
      parseFloat(this.playBookCostForm.controls['LaborRateShouldCost'].value),
      parseFloat(this.playBookCostForm.controls['OverHeadShouldCost'].value),
      parseFloat(this.playBookCostForm.controls['ProfitShouldCost'].value),
    ];

    const newCostData = [
      parseFloat(this.playBookCostForm.controls['GrossRawMaterialNewCost'].value),
      parseFloat(this.playBookCostForm.controls['RawMaterialNewCost'].value),
      parseFloat(this.playBookCostForm.controls['ScrapRecoveryWtNewCost'].value),
      parseFloat(this.playBookCostForm.controls['ScrapRecoveryPriceNewCost'].value),
      parseFloat(this.playBookCostForm.controls['CycleTimeNewCost'].value),
      parseFloat(this.playBookCostForm.controls['MachineRateNewCost'].value),
      parseFloat(this.playBookCostForm.controls['LaborRateNewCost'].value),
      parseFloat(this.playBookCostForm.controls['OverHeadNewCost'].value),
      parseFloat(this.playBookCostForm.controls['ProfitNewCost'].value),
    ];

    this.radarChartDatasets = [
      { data: currentCostData, label: 'Current Cost' },
      { data: shouldCostData, label: 'Should Cost' },
      { data: newCostData, label: 'New Cost' },
    ];
  }

  get supplierNameControl(): AbstractControl {
    return this.playBookForm.get('supplier') as AbstractControl;
  }
  get projectSearchControl(): AbstractControl {
    return this.playBookForm.get('projectId') as AbstractControl;
  }

  get partsControl(): AbstractControl {
    return this.playBookForm.get('partId') as AbstractControl;
  }
  get playbookNameControl(): AbstractControl {
    return this.playBookForm.get('playBookTitle') as AbstractControl;
  }

  get form() {
    return this.playBookForm.controls;
  }

  private filterSupplier(value: any): VendorDto[] {
    let filterValue = '';
    if (value instanceof Object) {
      filterValue = (value.vendorName || '').toLowerCase();
    } else {
      filterValue = (value || '').toLowerCase();
    }
    return this.supplierList.filter((supplier: { vendorName: any }) => (supplier.vendorName || '').toLowerCase().includes(filterValue));
  }

  private filterProject(value: any): ProjectInfoDto[] {
    let filterValue = '';
    if (value instanceof Object) {
      filterValue = (value.projectName || '').toLowerCase();
    } else {
      filterValue = (value || '').toLowerCase();
    }
    return this.projectInfoList.filter((project) => (project.projectName || '').toLowerCase().includes(filterValue));
  }
  private filterParts(value: any): PartModel[] {
    let filterValue = '';
    if (value instanceof Object) {
      filterValue = (value.projectName || '').toLowerCase();
    } else {
      filterValue = (value || '').toLowerCase();
    }
    return this.partInfoList.filter((part) => (part.intPartNumber || '').toLowerCase().includes(filterValue));
  }

  private filterPlaybook(value: any): PlaybookDto[] {
    let filterValue = '';
    if (value instanceof Object) {
      filterValue = (value.playbookName || '').toLowerCase();
    } else {
      filterValue = (value || '').toLowerCase();
    }
    return this.playbookList.filter((playbook) => (playbook.playbookName || '').toLowerCase().includes(filterValue));
  }

  calculateGrossRawMaterialNewCost() {
    this.playBookCostForm.controls['GrossRawMaterialNewCost'].patchValue(
      this.sharedService.isValidNumber(
        this.analyticsService.calculateNewCostValue(this.playBookCostForm.controls['GrossRawMaterialShouldCost'].value, this.playBookCostForm.controls['GrossRawMaterialPercentage'].value)
      )
    );
    this.totalNewCostCalculation();
  }

  calculateRawMaterialNewCost() {
    this.playBookCostForm.controls['RawMaterialNewCost'].patchValue(
      this.sharedService.isValidNumber(
        this.analyticsService.calculateNewCostValue(this.playBookCostForm.controls['RawMaterialShouldCost'].value, this.playBookCostForm.controls['RawMaterialPercentage'].value)
      )
    );
    this.totalNewCostCalculation();
  }

  calculateScrapRecoveryWtNewCost() {
    this.playBookCostForm.controls['ScrapRecoveryWtNewCost'].patchValue(
      this.sharedService.isValidNumber(
        this.analyticsService.calculateNewCostValue(this.playBookCostForm.controls['ScrapRecoveryWtShouldCost'].value, this.playBookCostForm.controls['ScrapRecoveryWtPercentage'].value)
      )
    );
    this.totalNewCostCalculation();
  }

  calculateScrapRecoveryPriceNewCost() {
    this.playBookCostForm.controls['ScrapRecoveryPriceNewCost'].patchValue(
      this.sharedService.isValidNumber(
        this.analyticsService.calculateNewCostValue(this.playBookCostForm.controls['ScrapRecoveryPriceShouldCost'].value, this.playBookCostForm.controls['ScrapRecoveryPricePercentage'].value)
      )
    );
    this.totalNewCostCalculation();
  }
  calculateCycleTimeNewCost() {
    this.playBookCostForm.controls['CycleTimeNewCost'].patchValue(
      this.sharedService.isValidNumber(
        this.analyticsService.calculateNewCostValue(this.playBookCostForm.controls['CycleTimeShouldCost'].value, this.playBookCostForm.controls['CycleTimePercentage'].value)
      )
    );
    this.totalNewCostCalculation();
  }
  calculateMachineHourlyRateNewCost() {
    this.playBookCostForm.controls['MachineRateNewCost'].patchValue(
      this.sharedService.isValidNumber(
        this.analyticsService.calculateNewCostValue(this.playBookCostForm.controls['MachineRateShouldCost'].value, this.playBookCostForm.controls['MachineRatePercentage'].value)
      )
    );
    this.totalNewCostCalculation();
  }
  calculateLaborCostNewCost() {
    this.playBookCostForm.controls['LaborRateNewCost'].patchValue(
      this.sharedService.isValidNumber(
        this.analyticsService.calculateNewCostValue(this.playBookCostForm.controls['LaborRateShouldCost'].value, this.playBookCostForm.controls['LaborRatePercentage'].value)
      )
    );
    this.totalNewCostCalculation();
  }
  calculateOverHeadNewCost() {
    this.playBookCostForm.controls['OverHeadNewCost'].patchValue(
      this.sharedService.isValidNumber(
        this.analyticsService.calculateNewCostValue(this.playBookCostForm.controls['OverHeadShouldCost'].value, this.playBookCostForm.controls['OverHeadPercentage'].value)
      )
    );
    this.totalNewCostCalculation();
  }
  calculateProfitNewCost() {
    this.playBookCostForm.controls['ProfitNewCost'].patchValue(
      this.sharedService.isValidNumber(this.analyticsService.calculateNewCostValue(this.playBookCostForm.controls['ProfitShouldCost'].value, this.playBookCostForm.controls['ProfitPercentage'].value))
    );
    this.totalNewCostCalculation();
  }

  //should Cost total calculation
  totalShouldCostCalculation() {
    const total =
      parseFloat(this.playBookCostForm.controls['GrossRawMaterialShouldCost'].value) +
      parseFloat(this.playBookCostForm.controls['RawMaterialShouldCost'].value) +
      parseFloat(this.playBookCostForm.controls['ScrapRecoveryWtShouldCost'].value) +
      parseFloat(this.playBookCostForm.controls['ScrapRecoveryPriceShouldCost'].value) +
      parseFloat(this.playBookCostForm.controls['CycleTimeShouldCost'].value) +
      parseFloat(this.playBookCostForm.controls['MachineRateShouldCost'].value) +
      parseFloat(this.playBookCostForm.controls['LaborRateShouldCost'].value) +
      parseFloat(this.playBookCostForm.controls['OverHeadShouldCost'].value) +
      parseFloat(this.playBookCostForm.controls['ProfitShouldCost'].value);
    this.playBookCostForm.controls['TotalShouldCost'].patchValue(this.sharedService.isValidNumber(total));
    this.drawGraph();
  }
  //New Cost total calculation
  totalNewCostCalculation() {
    const total =
      parseFloat(this.playBookCostForm.controls['GrossRawMaterialNewCost'].value) +
      parseFloat(this.playBookCostForm.controls['RawMaterialNewCost'].value) +
      parseFloat(this.playBookCostForm.controls['ScrapRecoveryWtNewCost'].value) +
      parseFloat(this.playBookCostForm.controls['ScrapRecoveryPriceNewCost'].value) +
      parseFloat(this.playBookCostForm.controls['CycleTimeNewCost'].value) +
      parseFloat(this.playBookCostForm.controls['MachineRateNewCost'].value) +
      parseFloat(this.playBookCostForm.controls['LaborRateNewCost'].value) +
      parseFloat(this.playBookCostForm.controls['OverHeadNewCost'].value) +
      parseFloat(this.playBookCostForm.controls['ProfitNewCost'].value);

    this.playBookCostForm.controls['TotalNewCost'].patchValue(this.sharedService.isValidNumber(total));
    this.drawGraph();
  }

  /*
  New Current total calculation
   */
  totalCurrentCostCalculation() {
    const total =
      parseFloat(this.playBookCostForm.controls['GrossRawMaterialCurrentCost'].value) +
      parseFloat(this.playBookCostForm.controls['RawMaterialCurrentCost'].value) +
      parseFloat(this.playBookCostForm.controls['ScrapRecoveryWtCurrentCost'].value) +
      parseFloat(this.playBookCostForm.controls['ScrapRecoveryPriceCurrentCost'].value) +
      parseFloat(this.playBookCostForm.controls['CycleTimeCurrentCost'].value) +
      parseFloat(this.playBookCostForm.controls['MachineRateCurrentCost'].value) +
      parseFloat(this.playBookCostForm.controls['LaborRateCurrentCost'].value) +
      parseFloat(this.playBookCostForm.controls['OverHeadCurrentCost'].value) +
      parseFloat(this.playBookCostForm.controls['ProfitCurrentCost'].value);

    this.playBookCostForm.controls['TotalCurrentCost'].patchValue(this.sharedService.isValidNumber(total));
    this.drawGraph();
  }

  calculateGrossRawMaterialPercentage() {
    const shouldCost = parseFloat(this.playBookCostForm.controls['GrossRawMaterialShouldCost'].value);
    const newCost = parseFloat(this.playBookCostForm.controls['GrossRawMaterialNewCost'].value);
    this.playBookCostForm.controls['GrossRawMaterialPercentage'].patchValue(this.percIncrease(shouldCost, newCost));
    this.totalNewCostCalculation();
  }

  calculateRawMaterialPercentage() {
    const shouldCost = parseFloat(this.playBookCostForm.controls['RawMaterialShouldCost'].value);
    const newCost = parseFloat(this.playBookCostForm.controls['RawMaterialNewCost'].value);
    this.playBookCostForm.controls['RawMaterialPercentage'].patchValue(this.percIncrease(shouldCost, newCost));
    this.totalNewCostCalculation();
  }

  calculateScrapRecoveryWtPercentage() {
    const shouldCost = parseFloat(this.playBookCostForm.controls['ScrapRecoveryWtShouldCost'].value);
    const newCost = parseFloat(this.playBookCostForm.controls['ScrapRecoveryWtNewCost'].value);
    this.playBookCostForm.controls['ScrapRecoveryWtPercentage'].patchValue(this.percIncrease(shouldCost, newCost));
    this.totalNewCostCalculation();
  }

  calculateScrapRecoveryPercentage() {
    const shouldCost = parseFloat(this.playBookCostForm.controls['ScrapRecoveryPriceShouldCost'].value);
    const newCost = parseFloat(this.playBookCostForm.controls['ScrapRecoveryPriceNewCost'].value);
    this.playBookCostForm.controls['ScrapRecoveryPricePercentage'].patchValue(this.percIncrease(shouldCost, newCost));
    this.totalNewCostCalculation();
  }

  calculateCycleTimePercentage() {
    const shouldCost = parseFloat(this.playBookCostForm.controls['CycleTimeShouldCost'].value);
    const newCost = parseFloat(this.playBookCostForm.controls['CycleTimeNewCost'].value);
    this.playBookCostForm.controls['CycleTimePercentage'].patchValue(this.percIncrease(shouldCost, newCost));
    this.totalNewCostCalculation();
  }

  calculateMachineRatePercentage() {
    const shouldCost = parseFloat(this.playBookCostForm.controls['MachineRateShouldCost'].value);
    const newCost = parseFloat(this.playBookCostForm.controls['MachineRateNewCost'].value);
    this.playBookCostForm.controls['MachineRatePercentage'].patchValue(this.percIncrease(shouldCost, newCost));
    this.totalNewCostCalculation();
  }

  calculateLaborRatePercentage() {
    const shouldCost = parseFloat(this.playBookCostForm.controls['LaborRateShouldCost'].value);
    const newCost = parseFloat(this.playBookCostForm.controls['LaborRateNewCost'].value);
    this.playBookCostForm.controls['LaborRatePercentage'].patchValue(this.percIncrease(shouldCost, newCost));
    this.totalNewCostCalculation();
  }

  calculateOverHeadPercentage() {
    const shouldCost = parseFloat(this.playBookCostForm.controls['OverHeadShouldCost'].value);
    const newCost = parseFloat(this.playBookCostForm.controls['OverHeadNewCost'].value);
    this.playBookCostForm.controls['OverHeadPercentage'].patchValue(this.percIncrease(shouldCost, newCost));
    this.totalNewCostCalculation();
  }

  calculateProfitPercentage() {
    const shouldCost = parseFloat(this.playBookCostForm.controls['ProfitShouldCost'].value);
    const newCost = parseFloat(this.playBookCostForm.controls['ProfitNewCost'].value);
    this.playBookCostForm.controls['ProfitPercentage'].patchValue(this.percIncrease(shouldCost, newCost));
    this.totalNewCostCalculation();
  }

  /*
  for calculating the percentage change on new value change
   */
  percIncrease(a: number, b: number) {
    let percent;
    if (b !== 0) {
      if (a !== 0) {
        percent = ((b - a) / a) * 100;
      } else {
        percent = b * 100;
      }
    } else {
      percent = -a * 100;
    }
    return Math.floor(percent);
  }
}
