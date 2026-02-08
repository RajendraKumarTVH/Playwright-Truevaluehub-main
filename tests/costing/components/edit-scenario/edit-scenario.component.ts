import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { ProjectScenarioDto } from 'src/app/shared/models/Project-Scenario.model';
import { BlockUiService, ScenarioService } from 'src/app/shared/services';
// import * as ScenarioAction from 'src/app/modules/_actions/project-scenario-action';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ProjectScenarioSignalsService } from 'src/app/shared/signals/project-scenario-signals.service';

@Component({
  selector: 'app-edit-scenario',
  templateUrl: './edit-scenario.component.html',
  styleUrls: ['./edit-scenario.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSlideToggleModule, MatIconModule],
})
export class EditScenarioComponent implements OnInit {
  @Input() public projectName: string;
  @Input() public scenarioData: ProjectScenarioDto;
  @Input() public scenarioList: ProjectScenarioDto[];
  editScenarioform: FormGroup;
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private modelService: NgbModal,
    private _fb: FormBuilder,
    private _blockUiService: BlockUiService,
    private _scenarioService: ScenarioService,
    private _store: Store,
    private messaging: MessagingService,
    private projectScenarioSignalsService: ProjectScenarioSignalsService
  ) {}

  ngOnInit(): void {
    this.editScenarioform = this._fb.group({
      projectInfoId: ['', Validators.required],
      projectName: [''],
      scenarioId: ['', Validators.required],
      scenarioName: ['', [Validators.required, this.noWhitespaceValidator, this.noSpecialCharactersValidator]],
      scenarioDescription: [''],
      isDefault: [false],
    });

    this.editScenarioform.patchValue({
      projectName: this.projectName,
      projectInfoId: this.scenarioData.projectInfoId,
      scenarioId: this.scenarioData.scenarioId,
      scenarioName: this.scenarioData.scenarioName,
      scenarioDescription: this.scenarioData.scenarioDescription,
      isDefault: this.scenarioData.isDefault,
    });
    this.checkDefaultScenarioLock();
  }

  checkDefaultScenarioLock(): void {
    if (!this.scenarioList || this.scenarioList.length === 0) return;

    const defaultScenarios = this.scenarioList.filter((s) => s.isDefault === true);
    if (defaultScenarios.length === 1 && defaultScenarios[0].scenarioId === this.scenarioData.scenarioId) {
      this.editScenarioform.get('isDefault')?.disable();
    }
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
    return this.editScenarioform.controls;
  }

  dismissAll() {
    this.modelService.dismissAll();
  }

  addScenarioClicked() {
    // this._blockUiService.pushBlockUI('EditScenario');
    const payload = {
      projectInfoId: this.editScenarioform.controls['projectInfoId'].value,
      scenarioId: this.editScenarioform.controls['scenarioId'].value,
      scenarioName: this.editScenarioform.controls['scenarioName'].value,
      scenarioDescription: this.editScenarioform.controls['scenarioDescription'].value,
      isDefault: this.editScenarioform.controls['isDefault'].value,
    };

    this._scenarioService
      .updateScenario(payload)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (result) => {
          if (result) {
            // this._store.dispatch(new ScenarioAction.GetAllActiveScenarioByProjectId(this.scenarioData.projectInfoId));
            // this._store.dispatch(new ScenarioAction.GetAllPartScenarioByProjectId(this.scenarioData.projectInfoId));
            this.projectScenarioSignalsService.getAllActiveScenarioByProjectId(this.scenarioData.projectInfoId);
            this.projectScenarioSignalsService.GetAllPartScenarioByProjectId(this.scenarioData.projectInfoId);
            this.messaging.openSnackBar(`Scenario updated successfully.`, '', { duration: 5000 });
            this.modelService.dismissAll();
          } else {
            this.messaging.openSnackBar(`Scenario update was unsuccessful.`, '', { duration: 5000 });
          }
          // this._blockUiService.popBlockUI('EditScenario');
        },
        error: (error) => {
          console.error(error);
        },
      });
  }
}
