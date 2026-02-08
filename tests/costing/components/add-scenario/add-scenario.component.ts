import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { PartInfoDto } from 'src/app/shared/models';
import { ProjectScenarioDto } from 'src/app/shared/models/Project-Scenario.model';
import { CopyScenarioDto } from 'src/app/shared/models/copy-scenario.model';
import { BlockUiService, ScenarioService } from 'src/app/shared/services';
// import * as BomActions from 'src/app/modules/_actions/bom.action';
// import * as ScenarioAction from 'src/app/modules/_actions/project-scenario-action';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { ProjectScenarioSignalsService } from 'src/app/shared/signals/project-scenario-signals.service';

@Component({
  selector: 'app-add-scenario',
  templateUrl: './add-scenario.component.html',
  styleUrls: ['./add-scenario.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatOptionModule, MatFormFieldModule, MatCheckboxModule, MatInputModule],
})
export class AddScenarioComponent implements OnInit {
  @Input() public projectName: string;
  @Input() public projectInfoId: number;

  addScenarioform: FormGroup;
  public partInfoList: PartInfoDto[];
  public scenarioList: ProjectScenarioDto[];
  public basicScenarioList$: Observable<ProjectScenarioDto[]>;
  filteredPartInfoList$: Observable<PartInfoDto[]>;
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  public selectedParts: PartInfoDto[] = new Array<PartInfoDto>();

  constructor(
    private modelService: NgbModal,
    public activeModal: NgbActiveModal,
    private _fb: FormBuilder,
    private _blockUiService: BlockUiService,
    private _scenarioService: ScenarioService,
    private _store: Store,
    private messaging: MessagingService,
    private projectScenarioSignalsService: ProjectScenarioSignalsService
  ) {}

  ngOnInit(): void {
    // let nonWhitespaceRegExp: RegExp = new RegExp("\\S");
    this.addScenarioform = this._fb.group({
      projectInfoId: ['', Validators.required],
      projectName: [''],
      basicScenarioId: ['', Validators.required],
      scenarioName: ['', [Validators.required, this.noWhitespaceValidator, this.noSpecialCharactersValidator]],
      scenarioDescription: [''],
      partInfoList: ['', [Validators.required]],
      selectAll: [false],
    });

    if (this.projectInfoId) {
      this.getScenarioList();
    }

    this.addScenarioform.patchValue({
      projectInfoId: this.projectInfoId,
      projectName: this.projectName,
      basicScenarioId: 1,
    });
  }

  noWhitespaceValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value) {
      const isWhitespace = control.value.trim().length === 0;
      return isWhitespace ? { whitespace: true } : null;
    }
    return null;
  }

  noSpecialCharactersValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value) {
      // Define a regular expression for allowed characters (letters and numbers)
      const pattern = /^[a-zA-Z0-9 ]*$/;
      const isValid = pattern.test(control.value);
      return isValid ? null : { specialCharacters: true };
    }
    return null;
  }

  get f() {
    return this.addScenarioform.controls;
  }

  get scenarioSearchControl(): AbstractControl {
    return this.addScenarioform.get('basicScenarioId') as AbstractControl;
  }

  public displayScenario(scenario: ProjectScenarioDto): string {
    return scenario?.scenarioName || '';
  }

  dismissAll() {
    this.modelService.dismissAll();
  }

  addScenarioClicked() {
    const copyScenarioDto = new CopyScenarioDto();
    if (this.selectedParts) {
      // this._blockUiService.pushBlockUI('CopyScenario');
      const partInfoIds: number[] = this.selectedParts.map(({ partInfoId }) => partInfoId);

      copyScenarioDto.projectInfoId = this.addScenarioform.controls['projectInfoId'].value;
      copyScenarioDto.scenarioName = this.addScenarioform.controls['scenarioName'].value;
      copyScenarioDto.scenarioDescription = this.addScenarioform.controls['scenarioDescription'].value;
      copyScenarioDto.basicScenarioId = (this.addScenarioform.controls['basicScenarioId'].value as ProjectScenarioDto)?.scenarioId;
      copyScenarioDto.isDefault = false;
      copyScenarioDto.partInfoIds = partInfoIds;
      const maxSortOrder = Math.max(...this.scenarioList.map((s) => s.sortOrder ?? 0));
      copyScenarioDto.sortOrder = maxSortOrder + 1;

      this._scenarioService
        .copyScenario(copyScenarioDto)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: (result) => {
            if (result) {
              // this._store.dispatch(new ScenarioAction.GetAllActiveScenarioByProjectId(result.projectInfoId));
              // this._store.dispatch(new ScenarioAction.GetAllPartScenarioByProjectId(result.projectInfoId));
              this.projectScenarioSignalsService.getAllActiveScenarioByProjectId(result.projectInfoId);
              this.projectScenarioSignalsService.GetAllPartScenarioByProjectId(result.projectInfoId);
              // this._store.dispatch(new BomActions.GetBomsTreeByProjectId(result.projectInfoId, result.scenarioId));

              this.messaging.openSnackBar(`New scenario created successfully.`, '', {
                duration: 5000,
              });
              this.activeModal.close(result);
              // this.modelService.dismissAll();
            }
            // this._blockUiService.popBlockUI('CopyScenario');
          },
          error: (error) => {
            console.error(error);
          },
        });
    }
  }

  public scenarioOptionSelected(event: MatAutocompleteSelectedEvent) {
    const selectedScenario = event.option.value as ProjectScenarioDto;
    this.setPartList(selectedScenario.scenarioId);
  }

  private getControl(name: string) {
    return this.addScenarioform?.get(name) as AbstractControl;
  }

  public setPartList(scenarioId: any) {
    this.addScenarioform.controls['selectAll'].setValue(false);
    this.getControl('partInfoList').setValue(null);
    this.selectedParts = [];
    this.partInfoList = this.scenarioList.find((x) => x.scenarioId == scenarioId)?.partInfos.map((x) => ({ ...x, selected: false }));
    this.filteredPartInfoList$ = this.getControl('partInfoList')?.valueChanges.pipe(
      startWith(''),
      map((value: any) => this._filter(value || ''))
    );
  }

  private _filter(value: any): PartInfoDto[] {
    let filterValue = '';
    if (value instanceof Object) {
      filterValue = (value.intPartNumber || '').toLowerCase();
    } else {
      const valueArr = value?.split(',');
      filterValue = (valueArr[valueArr.length - 1].trim() || '').toLowerCase();
    }
    return this.partInfoList.filter((part) => (part.intPartNumber || '').toLowerCase().includes(filterValue));
  }

  public displayFn(value: PartInfoDto[] | string): string | undefined {
    let displayValue: string;
    if (Array.isArray(value)) {
      value.forEach((part, index) => {
        if (index === 0) {
          displayValue = part.intPartNumber;
        } else {
          displayValue += ', ' + part.intPartNumber;
        }
      });
    } else {
      displayValue = value;
    }
    return displayValue;
  }

  private getScenarioList() {
    // this._blockUiService.pushBlockUI('scenarioList');
    return this._scenarioService
      .getAllPartScenarioByProjectId(this.projectInfoId)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((result: any[]) => {
        if (result && result.length > 0) {
          this.scenarioList = result;
          // this.basicScenarioList$ = this.scenarioSearchControl.valueChanges.pipe(
          //   startWith(''),
          //   map((value) => this.filterScenario(value || ''))
          // );
        }
        // this._blockUiService.popBlockUI('scenarioList');
      });
  }

  // private filterScenario(value: any): ProjectScenarioDto[] {
  //   let filterValue = '';
  //   if (value instanceof Object) {
  //     filterValue = (value.scenarioName || '').toLowerCase();
  //   } else {
  //     filterValue = (value || '').toLowerCase();
  //   }
  //   return this.scenarioList.filter((scenario) =>
  //     (scenario.scenarioName || '').toLowerCase().includes(filterValue)
  //   );
  // }

  optionClicked(event: Event, part: PartInfoDto) {
    event.stopPropagation();
    this.toggleSelection(part);
  }

  toggleSelection(part: PartInfoDto, value?: boolean) {
    const flag = value ? value : !part.selected;
    part.selected = flag;
    if (part.selected) {
      this.selectedParts.push(part);
    } else {
      const i = this.selectedParts.findIndex((value) => value.intPartNumber === part.intPartNumber);
      this.selectedParts.splice(i, 1);
    }

    if (this.selectedParts.length !== this.partInfoList.length) {
      this.addScenarioform.controls['selectAll'].setValue(false);
    } else {
      this.addScenarioform.controls['selectAll'].setValue(true);
    }
    this.getControl('partInfoList').setValue(this.selectedParts);
  }

  setAllPartsSelected() {
    const checked: boolean = this.addScenarioform.controls['selectAll'].value;
    this.selectedParts = [];
    this.partInfoList?.forEach((part) => {
      this.toggleSelection(part, !checked);
    });
  }

  public preventDefault(e) {
    e.preventDefault();
  }

  public updatePartInfoListValue() {
    setTimeout(() => this.getControl('partInfoList').setValue(this.selectedParts), 300);
  }
}
