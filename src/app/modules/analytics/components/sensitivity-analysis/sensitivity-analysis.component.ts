import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
// import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
// import { GridLoaderComponent } from '../grid-loader/grid-loader.component';
import { SensitivityAnalysisGridComponent } from '../sensitivity-analysis-grid/sensitivity-analysis-grid.component';

// Enums
export enum PageEnum {
  BestProcess = 'BestProcess',
  BestRegion = 'BestRegion',
}

// Interfaces
interface Project {
  projectId: string;
  projectName: string;
  projectInfoId: string;
}

interface Scenario {
  scenarioId: string;
  scenarioName: string;
}

interface Part {
  partId: string;
  intPartNumber: string;
}

interface ProcessType {
  processTypeId: string;
  processType: string;
  selected: boolean;
}

interface Country {
  countryId: string;
  countryName: string;
  selected: boolean;
}

@Component({
  selector: 'app-sensitivity-analysis',
  templateUrl: './sensitivity-analysis.component.html',
  styleUrls: ['./sensitivity-analysis.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [MatMenuModule, MatIconModule, MatAutocompleteModule, CommonModule, FormsModule, ReactiveFormsModule, MatTabsModule, SensitivityAnalysisGridComponent],
})
export class SensitivityAnalysisComponent implements OnInit {
  simulationform: FormGroup;
  pageEnum = PageEnum;
  page: PageEnum = PageEnum.BestProcess;

  // Static JSON data
  projects: Project[] = [
    { projectId: '1', projectName: 'Alpha Project', projectInfoId: 'P-001' },
    { projectId: '2', projectName: 'Beta Initiative', projectInfoId: 'P-002' },
    { projectId: '3', projectName: 'Gamma System', projectInfoId: 'P-003' },
  ];

  scenarioList: Scenario[] = [
    { scenarioId: '1', scenarioName: 'Base Scenario' },
    { scenarioId: '2', scenarioName: 'Optimized Scenario' },
    { scenarioId: '3', scenarioName: 'Worst Case Scenario' },
  ];

  parts: Part[] = [
    { partId: '1', intPartNumber: 'PART-001' },
    { partId: '2', intPartNumber: 'PART-002' },
    { partId: '3', intPartNumber: 'PART-003' },
  ];

  processTypes: ProcessType[] = [
    { processTypeId: '1', processType: 'Injection Molding', selected: false },
    { processTypeId: '2', processType: 'CNC Machining', selected: false },
    { processTypeId: '3', processType: '3D Printing', selected: false },
    { processTypeId: '4', processType: 'Die Casting', selected: false },
  ];

  countries: Country[] = [
    { countryId: '1', countryName: 'United States', selected: false },
    { countryId: '2', countryName: 'Germany', selected: false },
    { countryId: '3', countryName: 'China', selected: false },
    { countryId: '4', countryName: 'Mexico', selected: false },
    { countryId: '5', countryName: 'India', selected: false },
  ];

  // Filtered observables
  filteredProjects$: Observable<Project[]>;
  filteredParts$: Observable<Part[]>;
  filteredMfrCountryList$: Observable<Country[]>;
  filteredProcesses$: Observable<ProcessType[]>;

  // Form controls
  projectControl = new FormControl('');
  scenarioControl = new FormControl('');
  partControl = new FormControl('');
  processControl = new FormControl('');
  countryControl = new FormControl('');
  selectAllControl = new FormControl(false);

  // Configuration
  maxCountrySelection: number = 5;
  maxProcessSelection: number = 3;
  saveNeeded: boolean = false;
  showLoader: boolean = false;

  constructor(private fb: FormBuilder) {
    this.simulationform = this.createForm();
  }

  ngOnInit(): void {
    this.setupFilteredObservables();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      projectId: this.projectControl,
      scenarioId: this.scenarioControl,
      partId: this.partControl,
      processList: this.processControl,
      countryList: this.countryControl,
      selectAll: this.selectAllControl,
    });
  }

  private setupFilteredObservables(): void {
    // Project filter
    this.filteredProjects$ = this.projectControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterProjects(value || ''))
    );

    // Part filter
    this.filteredParts$ = this.partControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterParts(value || ''))
    );

    // Country filter
    this.filteredMfrCountryList$ = this.countryControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterCountries(value || ''))
    );

    // Process filter
    this.filteredProcesses$ = this.processControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterProcesses(value || ''))
    );
  }

  // Filter methods
  private _filterProjects(value: string | Project): Project[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.projectName.toLowerCase();
    return this.projects.filter((project) => project.projectName.toLowerCase().includes(filterValue) || project.projectInfoId.toLowerCase().includes(filterValue));
  }

  private _filterParts(value: string | Part): Part[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.intPartNumber.toLowerCase();
    return this.parts.filter((part) => part.intPartNumber.toLowerCase().includes(filterValue));
  }

  private _filterCountries(value: string | Country): Country[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.countryName.toLowerCase();
    return this.countries.filter((country) => country.countryName.toLowerCase().includes(filterValue));
  }

  private _filterProcesses(value: string | ProcessType): ProcessType[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.processType.toLowerCase();
    return this.processTypes.filter((process) => process.processType.toLowerCase().includes(filterValue));
  }

  // Display methods
  displayProject(project: Project): string {
    return project ? `${project.projectName} - ${project.projectInfoId}` : '';
  }

  displayScenarioName(scenario: Scenario): string {
    return scenario ? scenario.scenarioName : '';
  }

  displayPartName(part: Part): string {
    return part ? part.intPartNumber : '';
  }

  displayProcessFn(processes: ProcessType[]): string {
    if (!processes || !Array.isArray(processes)) return '';
    const selectedProcesses = processes.filter((p) => p.selected);
    return selectedProcesses.map((p) => p.processType).join(', ');
  }

  displayFn(countries: Country[]): string {
    if (!countries || !Array.isArray(countries)) return '';
    const selectedCountries = countries.filter((c) => c.selected);
    return selectedCountries.map((c) => c.countryName).join(', ');
  }

  // Simple event handlers for template
  preventDefault(event: Event): void {
    event.preventDefault();
  }

  runSimulation(): void {
    if (this.simulationform.valid) {
      this.showLoader = true;
      setTimeout(() => {
        this.showLoader = false;
        console.log('Simulation completed');
      }, 2000);
    }
  }

  saveSimulationResult(): void {
    if (this.simulationform.valid) {
      this.showLoader = true;
      setTimeout(() => {
        this.showLoader = false;
        this.saveNeeded = false;
        console.log('Results saved');
      }, 1000);
    }
  }
}
