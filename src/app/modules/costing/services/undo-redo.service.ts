import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { auditTime, debounceTime, filter, map, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UndoRedoService implements OnDestroy {
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  public formSubscribe$: Subject<boolean> = new Subject<boolean>();
  public formUpdateSubscribe$: Subject<any> = new Subject<any>();
  public undoRedoSubject$ = new Subject<any>();
  public isEnabledUndoRedo = true;
  public isConsoleLogs = false;
  public userInteracted = false;
  public formsLoaded = false;
  public formChangeList: Array<string> = [];
  public formChangeListPointer = -1;
  private forms: { [key: string]: { componentName: string; form: FormGroup; changes: any[]; pointer: number; prevValue: any; loadTimeLimit: number } } = {};
  public undoRedoAction: boolean;
  public formsCount = 0;
  public actionNeeded = false;

  public setupFormChange(componentName: string, form: FormGroup, formName: string, loadTime: number) {
    this.forms[formName] = { componentName, form, changes: [], pointer: 0, prevValue: null, loadTimeLimit: new Date().getTime() + loadTime };
    this.forms[formName].changes = [form.value];
    this.formChangeListPointer++;
    this.formChangeList.push(formName);

    this.formSubscribe$.next(true);
    this.forms[formName].form.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          if (!this.userInteracted || this.forms[formName].loadTimeLimit > new Date().getTime()) {
            // until user interacts with the form and form gets loaded
            this.forms[formName].changes = [form.value];
            this.isConsoleLogs && console.log('Added changes to default', formName);
            return false;
          }

          if (this.forms[formName].changes[this.forms[formName].pointer] === value) {
            this.isConsoleLogs && console.log('Same value detected');
            value = false;
          }

          if (this.undoRedoAction) {
            // On undo/redo action
            this.isConsoleLogs && console.log('Undo/Redo Action in effect');
            this.undoRedoAction = false;
            value = false;
          } else if (this.actionNeeded) {
            // On form change based on api changes or ctrl/alt keys
            this.actionNeeded = false;
          } else if (value) {
            // to handled any delayed changes and changes based on api results
            setTimeout(() => {
              this.forms[formName].changes[this.forms[formName].pointer] = form.value; // form.value to avoid reference to value
              this.isConsoleLogs && console.log('Extra Update in form', formName, this.forms[formName].pointer);
            }, 1100);
            value = false;
          }

          if (!value && !!this.forms[formName].prevValue) {
            // On undo/redo action and pending form change is present
            value = this.forms[formName].prevValue;
          } else if (!value && !this.forms[formName].prevValue) {
            // On undo/redo action and pending form change is not present
            return false;
          } else if (this.forms[formName].prevValue !== value) {
            // Usual form change
            this.forms[formName].prevValue = value;
          }
          return value;
        }),
        auditTime(1000),
        takeUntil(this.formSubscribe$.pipe(filter((val) => !val)))
      )
      .subscribe((value) => {
        if (value) {
          this.forms[formName].prevValue = null;
          this.addStateToArray(formName, value);
        }
      });
    this.isConsoleLogs && console.log('Forms Pointer ', this.formChangeListPointer, this.formChangeList);
    this.isConsoleLogs && console.log('Form Loaded: ', formName);
    if (this.formsCount === this.formChangeList.length) {
      this.formsLoaded = true;
      this.isConsoleLogs && console.log('All Forms Loaded', this.forms);
    }
  }

  private addStateToArray(formName: string, value: any) {
    if (this.formChangeList.length < this.formsCount) {
      // to maintain the array length to be same as number of forms
      this.formChangeList.length = this.formsCount;
      this.formChangeListPointer = this.formsCount - 1;
    } else {
      this.formChangeList.length = this.formChangeListPointer + 1; // to discard the earlier undo vals
    }

    this.formChangeList.push(formName);
    this.formChangeListPointer++;

    this.forms[formName].changes.length = this.forms[formName].pointer + 1;
    this.forms[formName].changes.push(value);
    this.forms[formName].pointer++;

    this.isConsoleLogs && console.log(this.formChangeListPointer, this.formChangeList);
    this.isConsoleLogs && console.log('Forms:', this.forms);
  }

  public undoRedoInit() {
    this.undoRedoSubject$
      .asObservable()
      .pipe(
        debounceTime(1000),
        // switchMap((action) => of(action)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((action) => {
        this.undoRedoAction = true;
        if (action === 'undo' && this.formChangeListPointer > this.formsCount - 1) {
          let formIdentifier = this.formChangeList[--this.formChangeListPointer];
          if (formIdentifier !== this.formChangeList[this.formChangeListPointer + 1]) {
            // when form is different to fetch the previous state of the form
            formIdentifier = this.formChangeList[this.formChangeListPointer + 1];
          }

          if (this.forms[formIdentifier].pointer <= 0) {
            this.forms[formIdentifier].pointer = 1;
          }
          this.forms[formIdentifier].form.patchValue(this.forms[formIdentifier].changes[--this.forms[formIdentifier].pointer]);
          this.isConsoleLogs && console.log('Undo Form Name', formIdentifier, 'Pointer:' + this.forms[formIdentifier].pointer);
          this.formUpdateTrigger('undo', formIdentifier);
        } else if (action === 'redo' && this.formChangeListPointer < this.formChangeList.length - 1) {
          if (this.formChangeListPointer < this.formsCount - 1) {
            // to bring the pointer according to the number of forms
            this.formChangeListPointer = this.formsCount - 1;
          }
          const formIdentifier = this.formChangeList[++this.formChangeListPointer];
          this.forms[formIdentifier].form.patchValue(this.forms[formIdentifier].changes[++this.forms[formIdentifier].pointer]);
          this.isConsoleLogs && console.log('Redo Form Name', formIdentifier, 'Pointer:' + this.forms[formIdentifier].pointer);
          this.formUpdateTrigger('redo', formIdentifier);
        }
        this.isConsoleLogs && console.log('Main Pointer', this.formChangeListPointer);
      });
  }

  private formUpdateTrigger(action, formIdentifier) {
    let pointerToCompare = this.forms[formIdentifier].pointer;
    if (action === 'undo') {
      pointerToCompare = this.forms[formIdentifier].pointer + 1;
    } else if (action === 'redo') {
      pointerToCompare = this.forms[formIdentifier].pointer - 1;
    }

    const formChanges = this.forms[formIdentifier].changes[this.forms[formIdentifier].pointer];
    const formChangesCompare = this.forms[formIdentifier].changes[pointerToCompare];
    const componentAttributes = { componentName: this.forms[formIdentifier].componentName, formName: formIdentifier };

    switch (formIdentifier) {
      case 'costingMaterialInfoform': {
        if (formChangesCompare.matPrimaryProcessName !== formChanges.matPrimaryProcessName) {
          this.formUpdateSubscribe$.next({ ...componentAttributes, formControlName: 'matPrimaryProcessName' });
        } else if (formChangesCompare.stockForm !== formChanges.stockForm) {
          this.formUpdateSubscribe$.next({ ...componentAttributes, formControlName: 'stockForm' });
        } else if (formChangesCompare.materialCategory !== formChanges.materialCategory) {
          this.formUpdateSubscribe$.next({ ...componentAttributes, formControlName: 'materialCategory' });
        } else if (formChangesCompare.materialFamily !== formChanges.materialFamily) {
          this.formUpdateSubscribe$.next({ ...componentAttributes, formControlName: 'materialFamily' });
        }
        break;
      }
      case 'costingManufacturingInfoform': {
        if (formChangesCompare.processTypeID !== formChanges.processTypeID) {
          this.formUpdateSubscribe$.next({ ...componentAttributes, formControlName: 'processTypeID' });
        } else {
          formChangesCompare.manufacturePkgs.forEach((m, i) => {
            if (formChanges.manufacturePkgs[i]?.subProcessTypeID !== m.subProcessTypeID) {
              this.formUpdateSubscribe$.next({ ...componentAttributes, formControlName: 'manufacturePkgs.subProcessTypeID', index: i });
            }
          });
        }
        break;
      }
      case 'costingSecProcessform': {
        if (formChangesCompare.Secondary_Process !== formChanges.Secondary_Process) {
          this.formUpdateSubscribe$.next({ ...componentAttributes, formControlName: 'Secondary_Process' });
        }
        break;
      }
      case 'costingPackagingForm': {
        if (formChangesCompare.shrinkWrap !== formChanges.shrinkWrap) {
          this.formUpdateSubscribe$.next({ ...componentAttributes, formControlName: 'shrinkWrap' });
        }
        break;
      }
      case 'logisticsInformationForm': {
        if (formChangesCompare.ModeOfTransport !== formChanges.ModeOfTransport) {
          this.formUpdateSubscribe$.next({ ...componentAttributes, formControlName: 'ModeOfTransport' });
        } else if (formChangesCompare.ShipmentType !== formChanges.ShipmentType) {
          this.formUpdateSubscribe$.next({ ...componentAttributes, formControlName: 'ShipmentType' });
        } else if (formChangesCompare.ContainerType !== formChanges.ContainerType) {
          this.formUpdateSubscribe$.next({ ...componentAttributes, formControlName: 'ContainerType' });
        }
        break;
      }
    }
  }

  public unsubscribeUndoRedoForm() {
    this.formSubscribe$.next(false);
    this.isConsoleLogs && console.log('Form Changes Unsubscribe Done');
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
