import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable, Subject } from 'rxjs';
import { CountryDataMasterDto, PartInfoDto, ProcessMasterDto, ProcessType, ProjectInfoDto, SimulationEmit, SimulationForm } from 'src/app/shared/models';
import { PartModel } from '../../../models/part-model';
import { debounceTime, filter, map, startWith, takeUntil } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { ApiCacheService, BlockUiService } from 'src/app/shared/services';
import { AnalyticsService } from '../../../services/analytics.service';
import * as SimulationDataActions from 'src/app/modules/_actions/simulation.action';
import { ProcessMasterState } from 'src/app/modules/_state/process-master.state';
import { PageEnum } from 'src/app/shared/enums';
import { ProjectScenarioDto } from 'src/app/shared/models/Project-Scenario.model';
import { ToolingCountryData } from 'src/app/shared/models/tooling-master-data';
import { ToolingCountryMasterState } from 'src/app/modules/_state/ToolingMaster.state';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { DigitalFactoryDtoNew } from 'src/app/modules/digital-factory/Models/digital-factory-dto';

@Component({
  selector: 'app-simulation-form',
  templateUrl: './simulation-form.component.html',
  styleUrls: ['./simulation-form.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatCheckboxModule, MatButtonModule, MatMenuModule, MatIconModule],
})
export class SimulationFormComponent implements OnInit, OnChanges, OnDestroy {
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  public simulationform: FormGroup;
  public filteredParts$: Observable<PartInfoDto[]>;
  public filteredMfrCountryList$: Observable<CountryDataMasterDto[]>;
  public countryList: CountryDataMasterDto[] = [];
  public selectedCountries: CountryDataMasterDto[] = new Array<CountryDataMasterDto>();
  public partInfoList: PartInfoDto[];
  public scenarioList: ProjectScenarioDto[];
  public filteredProjects$: Observable<ProjectInfoDto[]>;
  public projectInfoList: ProjectInfoDto[];
  public selectedProcesses: ProcessType[] = new Array<ProcessType>();
  public toolingMasterData: ToolingCountryData[] = [];
  @Input() simulationFormData: SimulationForm;
  @Input() hasResults: boolean = false;
  @Input() page: string;
  @Input() processTypeID: ProcessType[];
  @Input() currentAnalysisId: number | null;
  @Output() partInfo = new EventEmitter<any>();
  @Output() runSimulationEmit = new EventEmitter<SimulationEmit>();
  @Output() saveSimulationResultEmit = new EventEmitter<boolean>();
  @Output() getPrevioussimulationResultEmit = new EventEmitter<{ countryList: CountryDataMasterDto[]; projectInfoList: ProjectInfoDto[]; toolingMasterData: ToolingCountryData[] }>();
  @Output() selectedProcessesEmit = new EventEmitter<ProcessType[]>();
  @Output() reInitFetchEmit = new EventEmitter<boolean>();
  @Output() copyAnalysisEmit = new EventEmitter<void>();
  @Output() deleteAnalysisEmit = new EventEmitter<void>();
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  _countryToolingData$: Observable<ToolingCountryData[]>;
  _countryData$: Observable<CountryDataMasterDto[]>;
  _processMasterData$: Observable<ProcessMasterDto[]>;
  processMasterDataList: ProcessMasterDto[];
  currentCommodityId: number;
  processList: { group: string; data: any }[];
  processTypeList: { group: string; data: any }[];
  processTypes: ProcessType[];
  public pageEnum = PageEnum;
  public maxProcessSelection = 100;
  public maxCountrySelection = 100;
  public selectedPart: PartInfoDto;
  public selectedProject: ProjectInfoDto;
  public saveNeeded: boolean = false;
  public showLoader = false;
  digitalFactoryDto: DigitalFactoryDtoNew[] = [];
  // Notify parent when scenarios/parts are loaded and form controls are ready
  public partsLoaded$ = new Subject<void>();
  @ViewChild('countryInput', { read: MatAutocompleteTrigger }) private countryAutocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild('countryInput') private countryInput: ElementRef<HTMLInputElement>;

  constructor(
    private analyticsService: AnalyticsService,
    private _store: Store,
    private _fb: FormBuilder,
    private _blockUiService: BlockUiService,
    private _apiCacheService: ApiCacheService,
    private store: Store,
    private digitalFactoryService: DigitalFactoryService
  ) {
    this._countryToolingData$ = this.store.select(ToolingCountryMasterState.getToolingCountryMasterData);
    this._countryData$ = this.store.select(CountryDataState.getCountryData);
    this._processMasterData$ = this.store.select(ProcessMasterState.getAllProcessMasterData);
    this.simulationform = this._fb.group({
      projectId: ['', Validators.required],
      partId: ['', Validators.required],
      scenarioId: ['', Validators.required],
      countryList: ['', Validators.required],
      selectAll: [false],
    });
  }

  ngOnInit(): void {
    this.simulationform = this._fb.group({
      projectId: ['', Validators.required],
      partId: ['', Validators.required],
      scenarioId: ['', Validators.required],
      countryList: ['', Validators.required],
      selectAll: [false],
    });

    if (this.page === this.pageEnum.BestProcess) {
      //   this.simulationform.addControl('matPrimaryProcessName', this._fb.control('', Validators.required));
      //   this.simulationform.addControl('processTypeID', this._fb.control('', Validators.required));
      this.simulationform.addControl('processList', this._fb.control('', Validators.required));
    }
    this.getToolingCountryDataList();
    this.getProcessMaster();
    this.getCountryList();
    this.getProjectList();

    this.simulationform.valueChanges.pipe(debounceTime(3000)).subscribe(() => {
      if (this.saveNeeded) {
        this.showLoader = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.simulationFormData && changes.simulationFormData.currentValue) {
      const val = changes.simulationFormData.currentValue;
      this.simulationform.patchValue({
        projectId: val.project,
        countryList: val.countries,
        selectAll: val.selectAll,
      });
      this.selectedCountries = val.countries;
      const countryIds = this.selectedCountries.map((x) => x.countryId);
      this.countryList = this.countryList.map((country) => ({ ...country, selected: countryIds.includes(country.countryId) }));
      this.getFilteredMfrCountryList();
      this.setPartList(val.part.projectInfoId, val.part.setValue, val.part.partId, val.processes);
    } else if (changes.page && changes.page.currentValue && this.page === this.pageEnum.BestProcess) {
      this.maxCountrySelection = 5;
      this.maxProcessSelection = 3;
    }
  }

  get partsControl(): AbstractControl {
    return this.simulationform.get('partId') as AbstractControl;
  }

  get projectSearchControl(): AbstractControl {
    return this.simulationform.get('projectId') as AbstractControl;
  }

  private getControl(name: string) {
    return this.simulationform?.get(name) as AbstractControl;
  }

  public displayProject(project: ProjectInfoDto): string {
    return project ? `${project?.projectName} - ${project?.projectInfoId}` : '';
  }

  public displayScenarioName(scenario: ProjectScenarioDto): string {
    return scenario ? scenario?.scenarioName : '';
  }

  public displayPartName(part: PartModel): string {
    return part ? part?.intPartNumber : '';
  }

  public displayFn(value: CountryDataMasterDto[]): string {
    let displayValue = '';
    if (Array.isArray(value) && value.length > 0) {
      value.forEach((country, index) => {
        if (index === 0) {
          displayValue = country.countryName;
        } else {
          displayValue += ', ' + country.countryName;
        }
      });
    }
    console.log('Debug the display', displayValue);
    return displayValue;
  }

  getToolingCountryDataList() {
    this._countryToolingData$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: any[]) => {
      if (result && result.length > 0) {
        this.toolingMasterData = [...result];
      }
    });
  }

  private getCountryList() {
    this._countryData$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: CountryDataMasterDto[]) => {
      if (result && result.length > 0) {
        this.countryList = result.map((country) => ({ ...country, selected: false }));
        this.getFilteredMfrCountryList();
      }
    });
    this.digitalFactoryService
      .getAllDigitalFactorySuppliers()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((result) => {
        this.digitalFactoryDto = result;
      });
  }

  private getFilteredMfrCountryList() {
    this.filteredMfrCountryList$ = this.getControl('countryList')?.valueChanges.pipe(
      startWith(''),
      map((value: any) => this._filter(value || ''))
    );
  }

  private _filter(value: any): CountryDataMasterDto[] {
    let filterValue = '';
    if (value instanceof Object) {
      filterValue = (value.countryName || '').toLowerCase();
    } else {
      const valueArr = value?.split(',');
      filterValue = (valueArr[valueArr.length - 1].trim() || '').toLowerCase();
    }
    return this.countryList.filter((country) => (country.countryName || '').toLowerCase().includes(filterValue));
  }

  private getProjectList() {
    // this._blockUiService.pushBlockUI('projectload');
    return this.analyticsService
      .getProjectDetails()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((result: any[]) => {
        if (result && result.length > 0) {
          this.projectInfoList = result;
          this.filteredProjects$ = this.projectSearchControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterProject(value || ''))
          );
          this.getPrevioussimulationResultEmit.emit({ countryList: this.countryList, projectInfoList: this.projectInfoList, toolingMasterData: this.toolingMasterData });
        }
        // this._blockUiService.popBlockUI('projectload');
      });
  }

  private filterProject(value: any): ProjectInfoDto[] {
    let filterValue = '';
    if (value instanceof Object) {
      filterValue = (value.projectName || '').toLowerCase() + ` - ${value.projectInfoId}`;
    } else {
      filterValue = (value || '').toLowerCase();
    }
    return this.projectInfoList.filter((project) => ((project.projectName || '').toLowerCase() + ` - ${project.projectInfoId}`).includes(filterValue));
  }

  setAllCountriesSelected() {
    const checked: boolean = this.simulationform.controls['selectAll'].value;
    this.selectedCountries = [];
    this.countryList.forEach((country) => {
      this.toggleSelection(country, !checked);
    });
  }

  countryOptionClicked(event: Event, country: CountryDataMasterDto) {
    event.stopPropagation();
    event.preventDefault();
    this.toggleSelection(country);
  }

  public reopenCountryPanel(event: MatAutocompleteSelectedEvent) {
    // We manage selection manually; prevent default close and reopen
    try {
      event.option.deselect();
    } catch {}
    setTimeout(() => {
      if (this.countryInput) {
        this.countryInput.nativeElement.focus();
      }
      if (this.countryAutocompleteTrigger) {
        this.countryAutocompleteTrigger.openPanel();
      }
    });
  }

  toggleSelection(country: CountryDataMasterDto, value?: boolean) {
    const flag = value ? value : !country.selected;
    const supplier = this.digitalFactoryDto?.find((x) => x.supplierDirectoryMasterDto?.countryId === country.countryId);
    country.regionId = supplier?.supplierDirectoryMasterDto.regionId;
    country.selected = flag;
    if (country.selected) {
      this.selectedCountries.push(country);
    } else {
      const i = this.selectedCountries.findIndex((value) => value.countryName === country.countryName);
      this.selectedCountries.splice(i, 1);
    }
    this.getControl('countryList').setValue(this.selectedCountries);
    this.getControl('selectAll').setValue(this.selectedCountries.length === this.countryList.length);
  }

  public projectOptionSelected(event: MatAutocompleteSelectedEvent) {
    const selectedProject = event.option.value as ProjectInfoDto;
    this.setPartList(selectedProject.projectInfoId, false, 0, []);
  }

  public setPartList(projectInfoId: number, setValue: boolean, partId: any, selectedProcesses: number[] = []) {
    this.selectedProject = this.getControl('projectId').value;
    this.partInfoList = [];
    this.scenarioList = [];
    this.getControl('scenarioId').setValue(null);
    this.getControl('partId').setValue(null);
    this.selectedPart = null;
    this.analyticsService
      .getScenariosAndPartsByProjectId(projectInfoId)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((result: ProjectScenarioDto[]) => {
        if (result && result.length > 0) {
          this.partInfoList = result.flatMap((s) => s.partInfos.map((p) => ({ ...p, scenarioName: s.scenarioName })));
          this.scenarioList = result;
          if (setValue && partId > 0) {
            const partdetails = this.partInfoList.find((x) => x.partInfoId == partId);
            this.getControl('partId').setValue(partdetails);
            this.partInfo.emit({ intPartNumber: partdetails.intPartNumber });
            this.getControl('scenarioId').setValue(this.scenarioList.filter((x) => x.scenarioId == partdetails.scenarioId)[0] || '');
            this.filterParts();
            this.onPartChange(partdetails.commodityId, selectedProcesses);
          }
          // Emit once lists are populated so parent can patch safely
          this.partsLoaded$.next();
        }
      });
  }

  private filterParts(): void {
    this.filteredParts$ = this.partsControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        let filterValue = '';
        if (value && typeof value === 'object') {
          filterValue = (value.intPartNumber || '').toLowerCase();
        } else if (typeof value === 'string') {
          filterValue = value.toLowerCase();
        } else {
          filterValue = '';
        }

        const scenarioControlValue = this.getControl('scenarioId').value;
        const scenarioId = scenarioControlValue && typeof scenarioControlValue === 'object' ? scenarioControlValue.scenarioId : scenarioControlValue;

        return this.partInfoList.filter((x) => x.scenarioId === scenarioId).filter((part) => (part.intPartNumber || '').toLowerCase().includes(filterValue));
      })
    );
  }

  getProcessMaster() {
    this._processMasterData$
      .pipe(
        filter((r) => r?.length > 0),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: ProcessMasterDto[]) => {
        this.processMasterDataList = result;
        // console.log(result);
      });
  }

  public onScenarioChange(_event: MatAutocompleteSelectedEvent) {
    this.getControl('partId').setValue(null);
    this.selectedPart = null;
    this.filterParts();
  }

  public onPartChange(event: MatAutocompleteSelectedEvent | number, selectedProcesses: number[] = []) {
    this.selectedPart = this.getControl('partId').value;
    if (this.page === this.pageEnum.BestRegion) {
      if (event instanceof MatAutocompleteSelectedEvent) {
        this.saveNeeded = false;
        this._store.dispatch(new SimulationDataActions.GetSimulationResultDb(event.option.value.partInfoId, this.pageEnum.BestRegion));
        this.reInitFetchEmit.emit(true);
      }
    } else if (this.page === this.pageEnum.BestProcess) {
      let currentCommodityId = event;
      if (event instanceof MatAutocompleteSelectedEvent) {
        currentCommodityId = event.option.value.commodityId;
      }
      if (Number(currentCommodityId) > 0) {
        const result = this.processMasterDataList?.filter((x) => x.commodityId == currentCommodityId && x.groupName === 'Primary Process' && ![11, 12, 13, 50, 3, 4, 5, 6, 8, 9].includes(x.processId)); // avoid blank sheet(50) & Cutting(11,12,13) & Plastic(3,4,5,6,8,9)
        this.processTypes = result.map((x) => ({ processTypeId: x.processId, processType: x.primaryProcess, selected: selectedProcesses.includes(x.processId) }));
        console.log('Processes', this.processTypes);
        // this.processList = this.getItGrouped(result);
        this.selectedProcesses = this.processTypes.filter((x) => selectedProcesses.includes(x.processTypeId));
        this.selectedProcessesEmit.emit(this.selectedProcesses);
        this.getControl('processList').setValue(this.selectedProcesses);
      }
    }
    // if (this.page === this.pageEnum.BestProcess) {
    //   let partInfoId = event;
    //   if (event instanceof MatAutocompleteSelectedEvent) {
    //     partInfoId = event.option.value.partInfoId;
    //   }
    //   console.log(partInfoId);
    //   this._processService.getProcessInfoByPartInfoId(Number(partInfoId))
    //     .pipe(takeUntil(this.unsubscribeAll$))
    //     .subscribe((processList: any) => {
    //       console.log(processList);
    //       this.processTypes = processList.filter(x => x?.machineId > 0).map(x => ({ processTypeId: x.processInfoId, processType: x.processType, selected: selectedProcesses.includes(x.processInfoId) }));
    //       this.selectedProcesses = this.processTypes.filter(x => selectedProcesses.includes(x.processTypeId));
    //       this.getControl("processList").setValue(this.selectedProcesses);
    //     });
    // }
  }

  optionProcessClicked(event: Event, pType: ProcessType) {
    event.stopPropagation();
    this.toggleProcessSelection(pType);
  }

  toggleProcessSelection(pType: ProcessType, value?: boolean) {
    const flag = value ? value : !pType.selected;
    pType.selected = flag;
    if (pType.selected) {
      this.selectedProcesses.push(pType);
    } else {
      const i = this.selectedProcesses.findIndex((value) => value.processTypeId === pType.processTypeId);
      this.selectedProcesses.splice(i, 1);
    }
    this.getControl('processList').setValue(this.selectedProcesses);
    // this.onPrimaryProcessChange();
  }

  public displayProcessFn(value: ProcessType[] | string): string | undefined {
    let displayValue: string;
    if (Array.isArray(value)) {
      value.forEach((pType, index) => {
        if (index === 0) {
          displayValue = pType.processType;
        } else {
          displayValue += ', ' + pType.processType;
        }
      });
    } else {
      displayValue = value;
    }
    return displayValue;
  }

  // public onPrimaryProcessChange() {
  //   this.processTypeList = [];
  //   // this.getControl("processTypeID").setValue('');
  //   // let processIds = this.materialInfoList.filter(x => x.processId != null).map((x) => x.processId).join(',');
  //   // const processIds = $event?.currentTarget?.value || $event;
  //   const processIds = this.selectedProcesses.map(x => x.processTypeId).join(',');
  //   if (processIds !== '') {
  //     this.medbMasterService.getProcessTypeList(processIds)
  //       .pipe(filter((r) => !!r), takeUntil(this.unsubscribe$))
  //       .subscribe((result) => {
  //         // this.processTypeList = this.getItGrouped(result);
  //         console.log(result);
  //       });
  //   }
  // }

  public runSimulation() {
    this._apiCacheService.removeCache('ALL', false);
    this.runSimulationEmit.emit({
      selectedProject: this.simulationform.controls['projectId'].value,
      selectedCountries: this.selectedCountries,
      selectedProcesses: this.selectedProcesses,
      selectedPart: this.simulationform.controls['partId'].value,
    });
    setTimeout(() => {
      this.saveNeeded = true;
    }, 7000);
  }

  public saveSimulationResult() {
    this.saveSimulationResultEmit.emit(true);
    this.saveNeeded = false;
  }

  public makeACopy() {
    this.copyAnalysisEmit.emit();
  }

  public deleteAnalysis() {
    this.deleteAnalysisEmit.emit();
  }

  public preventDefault(e) {
    e.preventDefault();
  }

  public updateProjectIdValue() {
    setTimeout(() => this.getControl('projectId').setValue(this.selectedProject), 300);
  }

  public updatePartIdValue() {
    setTimeout(() => this.getControl('partId').setValue(this.selectedPart), 300);
  }

  public updateCountriesValue() {
    setTimeout(() => this.getControl('countryList').setValue(this.selectedCountries), 300);
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
