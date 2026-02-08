import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { PartModel } from 'src/app/modules/analytics/models/part-model';
import { ProjectPartInfoScenario, ProjectPartScenario } from 'src/app/shared/models/Project-Scenario.model';
import { BlockUiService, ScenarioService } from 'src/app/shared/services';
import { Store } from '@ngxs/store';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
import { CommonModule } from '@angular/common';
import { CostingCostSummaryComponent } from '../costing-cost-summary/costing-cost-summary.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMiniFabButton } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

@Component({
  selector: 'app-compare-scenarios',
  templateUrl: './compare-scenarios.component.html',
  styleUrls: ['./compare-scenarios.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CostingCostSummaryComponent, MatIconModule, MatMiniFabButton, MatIconModule, MatAutocompleteModule, MatOptionModule, MatCheckboxModule],
})
export class CompareScenariosComponent implements OnInit, OnDestroy {
  @Input() public projectName: string;
  @Input() public projectInfoId: number;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  public filteredParts$: Observable<ProjectPartInfoScenario[]>;
  public scenarioList: ProjectPartScenario[];
  public partInfoList: ProjectPartInfoScenario[];
  public searchForm: FormGroup;
  public selectedScenarios: ProjectPartScenario[] = [];
  public compareAction: boolean = false;
  public hiddenScenarios: number[] = [];

  constructor(
    private _blockUiService: BlockUiService,
    private _scenarioService: ScenarioService,
    private modelService: NgbModal,
    private _store: Store,
    private _fb: FormBuilder,
    private _costSummarySignalsService: CostSummarySignalsService
  ) {}

  ngOnInit(): void {
    if (this.projectInfoId) {
      this.getPartsScenarioList();
    }

    this.searchForm = this._fb.group({
      // projectId: ['', Validators.required],
      partId: ['', Validators.required],
      scenarioId: ['', Validators.required],
    });
  }

  private getControl(name: string) {
    return this.searchForm?.get(name) as AbstractControl;
  }

  public displayScenarioName(value: ProjectPartScenario[] | string): string | undefined {
    let displayValue: string;
    if (Array.isArray(value)) {
      value.forEach((scenarioPart, index) => {
        if (index === 0) {
          displayValue = scenarioPart.scenario.scenarioName;
        } else {
          displayValue += ', ' + scenarioPart.scenario.scenarioName;
        }
      });
    } else {
      displayValue = value;
    }
    return displayValue;
  }

  public displayPartName(part: PartModel): string {
    return part ? part?.intPartNumber : '';
  }

  private getPartsScenarioList() {
    // this._blockUiService.pushBlockUI('scenarioList');
    return this._scenarioService
      .getAllPartScenarioByProjectId(this.projectInfoId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any[]) => {
        if (result && result.length > 0) {
          this.partInfoList = result.reduce((result, scenario) => {
            const scenarioDetails = { scenario: { scenarioId: scenario.scenarioId, scenarioName: scenario.scenarioName, scenarioDescription: scenario.scenarioDescription } };
            scenario.partInfos.forEach((part) => {
              const existingEntry = result.find((entry) => entry.intPartNumber === part.intPartNumber);
              if (existingEntry) {
                existingEntry.partInfos.push({ partInfoId: part.partInfoId, ...scenarioDetails });
              } else {
                result.push({ intPartNumber: part.intPartNumber, partInfos: [{ partInfoId: part.partInfoId, ...scenarioDetails }] });
              }
            });
            return result;
          }, []);
        }
        // this._blockUiService.popBlockUI('scenarioList');
      });
  }

  private filterParts(): void {
    this.filteredParts$ = this.getControl('partId').valueChanges.pipe(
      startWith(''),
      map((value) => {
        let filterValue = '';
        if (value instanceof Object) {
          filterValue = (value.intPartNumber || '').toLowerCase();
        } else {
          filterValue = (value || '').toLowerCase();
        }
        return this.partInfoList?.filter((part) => (part.intPartNumber || '').toLowerCase().includes(filterValue));
      })
    );
  }

  public onPartFocus() {
    this.filterParts();
  }

  public onPartBlur() {
    this.getControl('partId').value && this.onPartInfoChange(<MatAutocompleteSelectedEvent>{ option: { value: this.getControl('partId').value } });
  }

  public onPartInfoChange(event: MatAutocompleteSelectedEvent) {
    this.scenarioList = (event.option.value.partInfos ?? [])
      .map((part) => ({ ...part, selected: false }))
      .filter((obj, index, arr) => arr.findIndex((item) => item.scenario.scenarioName === obj.scenario.scenarioName && item.scenario.scenarioName === obj.scenario.scenarioName) === index);
    this.getControl('scenarioId').setValue(this.selectedScenarios);
    this.compareAction = false;
  }

  optionScenarioClicked(scenarioPart: ProjectPartScenario) {
    this.toggleScenarioSelection(scenarioPart);
  }

  toggleScenarioSelection(scenarioPart: ProjectPartScenario, value?: boolean) {
    const flag = value ? value : !scenarioPart.selected;
    scenarioPart.selected = flag;
    if (scenarioPart.selected) {
      this.selectedScenarios.push(scenarioPart);
    } else {
      const i = this.selectedScenarios.findIndex((value) => value.scenario.scenarioId === scenarioPart.scenario.scenarioId);
      this.selectedScenarios.splice(i, 1);
    }
    this.getControl('scenarioId').setValue(this.selectedScenarios);
    this.compareAction = false;
  }

  public compareNow() {
    this.hiddenScenarios = [];
    this._costSummarySignalsService.getCostSummaryByMultiplePartInfoIds(this.selectedScenarios.map((x) => x.partInfoId));
    this.compareAction = true;
  }

  onCancel() {
    this.modelService.dismissAll();
  }

  hideScenario(partId: number) {
    this.hiddenScenarios.push(partId);
  }

  showLastScenario() {
    this.hiddenScenarios.pop();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
