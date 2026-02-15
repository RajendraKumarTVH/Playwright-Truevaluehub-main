import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { Store } from '@ngxs/store';
import { ChartModule } from 'primeng/chart';
import { map, Observable, of, startWith, Subject, takeUntil } from 'rxjs';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { ProcessMasterState } from 'src/app/modules/_state/process-master.state';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { DigitalFactoryCommonService } from 'src/app/modules/digital-factory/Components/Shared/digital-factory-common-service';
import { EditPageBase } from 'src/app/modules/digital-factory/Components/Shared/edit-state/edit-page.base';
import { EditToolbarComponent } from 'src/app/modules/digital-factory/Components/Shared/edit-toolbar/edit-toolbar.component';
import { DfMachineInfoDto } from 'src/app/modules/digital-factory/Models/df-machine-info-dto';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { LaborRateMasterDto } from 'src/app/shared/models';
import { CountryDataMasterDto } from 'src/app/shared/models/country-data-master.model';
import { MachineMarketDto, MedbMachinesMasterDto, MedbProcessTypeMasterDto } from 'src/app/shared/models/medb-machine.model';
import { ProcessMasterDto } from 'src/app/shared/models/process-master.model';
import { LaborService } from 'src/app/shared/services/labor.service';
import { MedbMasterService } from 'src/app/shared/services/medb-master.service';

@Component({
  selector: 'app-add-machine-modal',
  templateUrl: './add-machine-modal.component.html',
  styleUrls: ['./add-machine-modal.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, EditToolbarComponent, MatAutocompleteModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTabsModule, ChartModule],
})
export class AddMachineModalComponent extends EditPageBase<DfMachineInfoDto> implements OnInit, OnDestroy {
  @Input() selectedMachineInfo?: DfMachineInfoDto;
  @Input() countryId?: number;
  @Input() regionId?: number;
  @Output() machineAdded = new EventEmitter<DfMachineInfoDto>();
  @Output() machineUpdated = new EventEmitter<DfMachineInfoDto>();
  materialProcessGroupList: ProcessMasterDto[] = [];
  processTypesList: MedbProcessTypeMasterDto[] = [];
  machineNameList: MedbMachinesMasterDto[] = [];
  private readonly unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private readonly _processMasterData$: Observable<ProcessMasterDto[]>;
  filteredMaterialProcessGroup$: Observable<any>;
  filteredProcessTypes$: Observable<any>;
  filteredMachineNames$: Observable<any>;
  _countryMaster$: Observable<CountryDataMasterDto[]>;
  countryList: CountryDataMasterDto[];
  machineChartData: any;
  machineChartOptions: any;
  calculatedMhr?: number;
  selectedMachineMaster?: MedbMachinesMasterDto;
  selectedMachineMarket?: MachineMarketDto;
  suppliercountryData?: CountryDataMasterDto;
  selectedCountryLaborRateInfo?: LaborRateMasterDto;
  private readonly chartColorInfo = {
    depreciation: '#BDA9DF',
    interest: '#D8C4EC',
    rentOverhead: '#E5D1F2',
    power: '#79D7F0',
    maintenance: '#B7E8F6',
    supplies: '#D6F2FA',
  };

  constructor(
    private readonly store: Store,
    private readonly digitalFactoryService: DigitalFactoryService,
    private readonly medbMasterService: MedbMasterService,
    private readonly digitalFactoryCommonService: DigitalFactoryCommonService,
    readonly fb: FormBuilder,
    private readonly sharedService: SharedService,
    private readonly laborService: LaborService
  ) {
    super(fb);
    this._processMasterData$ = this.store.select(ProcessMasterState.getAllProcessMasterData);
    this._countryMaster$ = this.store.select(CountryDataState.getCountryData);
    this.digitalFactoryCommonService.factoryHoursUpdated$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.setFormCalculatedMhr();
    });
  }

  load(): Observable<DfMachineInfoDto> {
    return of(this.selectedMachineInfo);
  }

  buildForm(data: DfMachineInfoDto): FormGroup {
    this.applyFormData(data);
    if (data?.processMasterId) {
      this.onMaterialProcessGroupSelect({ option: { value: data.processMasterId } } as MatAutocompleteSelectedEvent);
      this.form.patchValue({
        processMasterId: data?.processMasterId,
      });
      this.setMachineHourlyCostDetails();
    }
    return this.form;
  }

  saveApi(data: DfMachineInfoDto): Observable<any> {
    if (!this.form.get('digitalFactoryMachineInfoId')?.value || this.form.get('machineMasterId')?.dirty) {
      data.digitalFactoryMachineInfoId = 0;
      return this.digitalFactoryService.addDigitalFactoryMachineCostInfo(data).pipe(takeUntil(this.unsubscribe$));
    }
    return this.digitalFactoryService.updateDigitalFactoryMachineCostInfo(data).pipe(takeUntil(this.unsubscribe$));
  }

  afterSaveApi(data: DfMachineInfoDto) {
    const processMasterId = this.form.get('processMasterId')?.value;
    const processTypeId = this.form.get('processTypeId')?.value;
    data.processMasterId = processMasterId;
    data.processTypeId = processTypeId;
    data.processName = this.materialProcessGroupList?.find((g) => g.processId === processMasterId)?.primaryProcess;
    data.manufacturingCategory = this.processTypesList?.find((t) => t.processTypeId === processTypeId)?.primaryProcess;
    data.machineName = this.machineNameList.find((m) => m.machineID === data.machineMasterId)?.machineName;
    this.applyFormData(data);
    this.setMachineHourlyCostDetails();
    this.setFormCalculatedMhr();
    this.machineAdded.emit(data);
  }

  ngOnInit(): void {
    this.setCountryList();
    this.setLaborRateInfo();
    this.form = this.fb.group({
      digitalFactoryId: [[Validators.required]],
      digitalFactoryMachineInfoId: [],
      machineMasterId: [[Validators.required]],
      processName: [],
      processMasterId: [[Validators.required]],
      manufacturingCategory: [],
      processTypeId: [[Validators.required]],
      machineName: [],
      investmentCost: [[Validators.required]],
      age: [],
      utilization: [],
      efficiency: [],
      installationFactor: [],
      supplies: [],
      depreciation: [],
      interest: [],
      rentAndOverhead: [],
      power: [],
      maintainance: [],
      lowSkilledLaborersNeeded: [],
      semiSkilledLaborersNeeded: [],
      highSkilledLaborersNeeded: [],
      specialSkilledLaborersNeeded: [],
      ratedPower: [],
      powerUtilization: [],
      averageMachineUtilization: [],
      averageMachineAvailability: [],
      powerCost: [],
      rentRate: [],
      interestRate: [],
      suppliesCost: [],
    });
    this.initEditPage();
    this.setMaterialProcessGroup();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  onMaterialProcessGroupSelect(event: any) {
    const materialProcessGroupId = event.option.value;
    if (materialProcessGroupId) {
      this.medbMasterService
        .getProcessTypeList(materialProcessGroupId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          if (result) {
            this.processTypesList = result;
            this.filteredProcessTypes$ = this.form.get('processTypeId')?.valueChanges.pipe(
              startWith(''),
              map((value) => this.getFilteredDropdownValues('processType', value))
            );
            const selectedTypeId = this.form.get('processTypeId').value;
            if (selectedTypeId) {
              this.onManufacturingCategorySelect({ option: { value: selectedTypeId } } as MatAutocompleteSelectedEvent);
              this.form.patchValue({
                processTypeId: selectedTypeId,
              });
            }
          }
        });
    }
  }

  onManufacturingCategorySelect(event: any) {
    const processTypeId = event.option.value;
    this.machineNameList = [];
    if (!this.countryId) return;
    if (processTypeId) {
      this.medbMasterService
        .getMedbMachineMasterByProcessTypeId(this.countryId, processTypeId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          if (result) {
            this.machineNameList = result;
            this.filteredMachineNames$ = this.form.get('machineMasterId')?.valueChanges.pipe(
              startWith(''),
              map((value) => this.getFilteredDropdownValues('machineMaster', value))
            );
            const selectedMachineMasterId = this.form.get('machineMasterId').value;
            if (selectedMachineMasterId) {
              this.onMachineNameSelect({ option: { value: selectedMachineMasterId } }, true);
              this.form.patchValue({
                machineMasterId: selectedMachineMasterId,
              });
            }
          }
        });
    }
  }

  onMachineNameSelect(event: any, initialLoad = false) {
    const machineMasterId = event.option.value;
    if (!machineMasterId) return;

    if (!initialLoad) {
      this.preserveFormValues(['machineMasterId', 'processTypeId', 'processMasterId', 'digitalFactoryId', 'digitalFactoryMachineInfoId']);
    }
    this.selectedMachineMaster = this.machineNameList.find((x) => x.machineID === machineMasterId);

    if (this.selectedMachineMaster?.machineMarketDtos?.length > 0) {
      this.selectedMachineMarket = this.selectedMachineMaster.machineMarketDtos[0];
      this.updateMachineDetails(initialLoad);
    }
  }

  private preserveFormValues(fields: string[]) {
    const preservedValues: any = {};
    fields.forEach((key) => {
      preservedValues[key] = this.form.get(key)?.value;
    });
    this.form.reset(preservedValues);
  }

  private updateMachineDetails(initialLoad?: boolean) {
    if (this.selectedCountryLaborRateInfo) {
      this.calculateMachineHourlyRate(initialLoad);
      return;
    }
    const now = new Date();
    const currentMonth = `${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
    this.laborService
      .getLaborRatesByCountry(this.countryId, currentMonth, this.regionId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result?.length > 0) {
          this.selectedCountryLaborRateInfo = result[0];
          this.calculateMachineHourlyRate(initialLoad);
        }
      });
  }

  private calculateMachineHourlyRate(initialLoad?: boolean) {
    const getValue = <T>(initialLoadValue: T | undefined, fallbackValue: T | undefined): T | undefined => (initialLoad ? (initialLoadValue ?? fallbackValue) : fallbackValue);

    const machineDetails: DfMachineInfoDto = {
      investmentCost: getValue(this.selectedMachineInfo?.investmentCost, this.selectedMachineMarket?.mcInvestment),
      age: getValue(this.selectedMachineInfo?.age, this.selectedMachineMarket?.depreciatioNInYears),
      installationFactor: getValue(this.selectedMachineInfo?.installationFactor, this.selectedMachineMarket?.installationFactor),
      efficiency: getValue(this.selectedMachineInfo?.efficiency, this.selectedMachineMarket?.efficiency),
      interestRate: getValue(this.selectedMachineInfo?.interestRate, this.suppliercountryData?.imputeRateOfInterest),
      suppliesCost: getValue(this.selectedMachineInfo?.suppliesCost, this.selectedMachineMarket?.suppliesCost),
      powerUtilization: getValue(this.selectedMachineInfo?.powerUtilization, this.selectedMachineMaster?.powerUtilization),
      machineOverhead: getValue(this.selectedMachineInfo?.machineOverhead, this.selectedMachineMarket?.machineOverheadRate),
      utilization: getValue(this.selectedMachineInfo?.utilization, this.selectedMachineMarket?.maintanenceCost),
      ratedPower: getValue(this.selectedMachineInfo?.ratedPower, this.selectedMachineMaster?.ratedPower),
      rentRate: getValue(this.selectedMachineInfo?.rentRate, this.selectedCountryLaborRateInfo?.rentRate),
      powerCost: getValue(this.selectedMachineInfo?.powerCost, this.selectedCountryLaborRateInfo?.powerCost),
      maxLength: getValue(this.selectedMachineInfo?.maxLength, this.selectedMachineMaster?.maxLength),
      maxWidth: getValue(this.selectedMachineInfo?.maxWidth, this.selectedMachineMaster?.maxWidth),
    };

    const annualHours = this.digitalFactoryCommonService?.dfSupplierMasterDetails?.annualHours || this.suppliercountryData?.annualHours;
    this.calculateMhrValue(machineDetails, annualHours);
  }

  displayProcessGroupName = (id: number) => this.materialProcessGroupList.find((g) => g.processId === id)?.primaryProcess || '';

  displaymanufacturingCategoryName = (id: number) => this.processTypesList.find((g) => g.processTypeId === id)?.primaryProcess || '';

  displayMachineName = (id: number) => this.machineNameList.find((g) => g.machineID === id)?.machineName || '';

  private setLaborRateInfo() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const currentMonth = `${month}${year}`;
    this.laborService
      .getLaborRatesByCountry(this.countryId, currentMonth, this.regionId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result?.length > 0) {
          this.selectedCountryLaborRateInfo = result[0];
        }
      });
  }
  private setCountryList() {
    this._countryMaster$.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      this.countryList = res;
      this.suppliercountryData = this.countryList.find((c) => c.countryId === this.countryId);
    });
  }

  private applyFormData(data: DfMachineInfoDto) {
    this.form.patchValue({
      digitalFactoryId: this.digitalFactoryCommonService.digitalFacotryDetails?.digitalFactoryId,
      digitalFactoryMachineInfoId: data?.digitalFactoryMachineInfoId,
      machineMasterId: data?.machineMasterId,
      processName: data?.processName,
      processMasterId: data?.processMasterId,
      manufacturingCategory: data?.manufacturingCategory,
      processTypeId: data?.processTypeId,
      machineName: data?.machineName,
      investmentCost: data?.investmentCost,
      age: data?.age,
      utilization: data?.utilization,
      efficiency: data?.efficiency,
      installationFactor: data?.installationFactor,
      supplies: data?.supplies,
      depreciation: data?.depreciation,
      interest: data?.interest,
      rentAndOverhead: data?.rentAndOverhead,
      power: data?.power,
      maintainance: data?.maintainance,
      lowSkilledLaborersNeeded: data?.lowSkilledLaborersNeeded,
      semiSkilledLaborersNeeded: data?.semiSkilledLaborersNeeded,
      highSkilledLaborersNeeded: data?.highSkilledLaborersNeeded,
      specialSkilledLaborersNeeded: data?.specialSkilledLaborersNeeded,
      ratedPower: data?.ratedPower,
      powerUtilization: data?.powerUtilization,
      averageMachineUtilization: data?.averageMachineUtilization,
      averageMachineAvailability: data?.averageMachineAvailability,
      powerCost: data?.powerCost,
      interestRate: data?.interestRate,
      rentRate: data?.rentRate,
      suppliesCost: data?.suppliesCost,
    });
  }

  private setFormCalculatedMhr() {
    const investmentCost = this.form.get('investmentCost')?.value ?? this.selectedMachineMarket?.mcInvestment;
    const installationFactor = this.form.get('installationFactor')?.value ?? this.selectedMachineMarket?.installationFactor;
    const depreciationInYears = this.form.get('age')?.value ?? this.selectedMachineMarket?.depreciatioNInYears;
    const interestRate = this.form.get('interestRate')?.value ?? this.suppliercountryData?.imputeRateOfInterest;
    const ratedPower = this.form.get('ratedPower')?.value ?? this.selectedMachineMaster?.ratedPower;
    const powerCost = this.form.get('powerCost')?.value ?? this.selectedCountryLaborRateInfo?.powerCost;
    const rentRate = this.form.get('rentRate')?.value ?? this.selectedCountryLaborRateInfo?.rentRate;
    const maintenanceCost = this.form.get('utilization')?.value ?? this.selectedMachineMarket?.maintanenceCost;
    const suppliesCost = this.form.get('suppliesCost')?.value ?? this.selectedMachineMarket?.suppliesCost;
    const powerUtilization = this.form.get('powerUtilization')?.value ?? this.selectedMachineMaster?.powerUtilization;
    const machineOverhead = this.selectedMachineMarket?.machineOverheadRate ?? 1;
    const efficiency = this.form.get('efficiency')?.value ?? (this.selectedMachineMaster?.machineMarketDtos.length > 0 ? this.selectedMachineMaster?.machineMarketDtos[0].efficiency : 0);
    const annualHours = this.digitalFactoryCommonService?.dfSupplierMasterDetails?.annualHours || this.suppliercountryData?.annualHours;

    const machineDetails: DfMachineInfoDto = {
      investmentCost,
      installationFactor,
      age: depreciationInYears,
      interestRate,
      powerCost,
      ratedPower,
      rentRate,
      utilization: maintenanceCost,
      suppliesCost,
      powerUtilization,
      machineOverhead,
      efficiency,
      maxLength: this.selectedMachineMaster?.maxLength,
      maxWidth: this.selectedMachineMaster?.maxWidth,
    };

    if (!annualHours || !machineDetails) return;
    this.calculateMhrValue(machineDetails, annualHours);
  }

  private calculateMhrValue(machineDetails: DfMachineInfoDto, annualHours: number) {
    const totalDepreciationCost = (machineDetails.investmentCost * (1 + machineDetails.installationFactor)) / (machineDetails.age ?? 0) / annualHours;
    const totalInterestCost = (machineDetails.investmentCost * (1 + machineDetails.installationFactor) * (machineDetails.interestRate ?? 0)) / annualHours;
    const totalPowerCost = (machineDetails.ratedPower ?? 0) * (machineDetails.powerCost ?? 0) * machineDetails.efficiency * (machineDetails.powerUtilization ?? 0);
    const totalRentCost = (((((machineDetails.maxLength ?? 0) * (machineDetails?.maxWidth ?? 0) * (machineDetails.rentRate ?? 0)) / 1000000) * 12) / annualHours) * 1.75;
    const totalMaintainanceCost = (machineDetails.investmentCost * (1 + machineDetails.installationFactor) * (machineDetails.utilization ?? 0)) / annualHours;
    const totalSuppliesCost = (machineDetails.investmentCost * (1 + machineDetails.installationFactor) * (machineDetails.suppliesCost ?? 0)) / annualHours;

    this.form.get('depreciation').setValue(this.sharedService.isValidNumber(totalDepreciationCost));
    this.form.get('interest').setValue(this.sharedService.isValidNumber(totalInterestCost));
    this.form.get('power').setValue(this.sharedService.isValidNumber(totalPowerCost));
    this.form.get('rentAndOverhead').setValue(this.sharedService.isValidNumber(totalRentCost));
    this.form.get('maintainance').setValue(this.sharedService.isValidNumber(totalMaintainanceCost));
    this.form.get('supplies').setValue(this.sharedService.isValidNumber(totalSuppliesCost));

    this.calculatedMhr = this.sharedService.isValidNumber(
      (totalDepreciationCost + totalInterestCost + totalPowerCost + totalRentCost + totalMaintainanceCost + totalSuppliesCost) * machineDetails.machineOverhead
    );
  }

  private setMachineHourlyCostDetails() {
    this.setChartData();
    this.machineChartOptions = {
      cutout: '50%', // donut thickness
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (ctx: any) => ` ${ctx.parsed} $/hr`,
          },
        },
      },
    };
  }

  private setChartData() {
    const depreciationCost = this.form.get('depreciation')?.value;
    const interest = this.form.get('interest')?.value;
    const rentAndOverhead = this.form.get('rentAndOverhead')?.value;
    const power = this.form.get('power')?.value;
    const maintainance = this.form.get('maintainance')?.value;
    const supplies = this.form.get('supplies')?.value;

    this.machineChartData = {
      labels: ['Depreciation', 'Interest', 'Rent & Overhead', 'Power', 'Maintenance', 'Supplies'],
      datasets: [
        {
          data: [depreciationCost, interest, rentAndOverhead, power, maintainance, supplies],
          backgroundColor: [
            this.chartColorInfo.depreciation,
            this.chartColorInfo.interest,
            this.chartColorInfo.rentOverhead,
            this.chartColorInfo.power,
            this.chartColorInfo.maintenance,
            this.chartColorInfo.supplies,
          ],
        },
      ],
    };
  }

  private getFilteredDropdownValues(key: string, value: string | number) {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    switch (key) {
      case 'processGroup':
        return this.materialProcessGroupList.filter((group) => group.primaryProcess.toLowerCase().includes(filterValue));
      case 'processType':
        if (!filterValue) return this.processTypesList;
        return this.processTypesList.filter((type) => type.primaryProcess.toLowerCase().includes(filterValue));
      case 'machineMaster':
        if (!filterValue) return this.machineNameList;
        return this.machineNameList.filter((material) => material.machineName.toLowerCase().includes(filterValue));
      default:
        return [];
    }
  }

  private setMaterialProcessGroup() {
    this.materialProcessGroupList = [];
    this._processMasterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: any[]) => {
      result.forEach((item) => {
        if (!this.materialProcessGroupList.some((x) => x.processId === item.processId)) {
          this.materialProcessGroupList.push(item);
        }
      });
      this.filteredMaterialProcessGroup$ = this.form.get('processMasterId')?.valueChanges.pipe(
        startWith(''),
        map((value) => this.getFilteredDropdownValues('processGroup', value))
      );
    });
  }
}
