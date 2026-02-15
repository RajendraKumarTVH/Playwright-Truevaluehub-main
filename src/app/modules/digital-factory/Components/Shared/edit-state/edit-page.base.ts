import { FormBuilder, FormGroup } from '@angular/forms';
import { Directive, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { EditState } from './edit-state';
import { connectEditState } from './edit-form.connector';

@Directive()
export abstract class EditPageBase<T> implements OnDestroy {
  form!: FormGroup;
  protected editState = new EditState<T>();
  private connector!: ReturnType<typeof connectEditState<T>>;
  private sub?: Subscription;

  protected constructor(protected fb: FormBuilder) {}

  /** Page must implement */
  protected abstract load(): Observable<T>;
  protected abstract buildForm(data: T): FormGroup;
  protected abstract saveApi(data: T): Observable<any>;
  protected afterSaveApi?(data: T): any;

  /** Call this in ngOnInit() */
  protected initEditPage() {
    this.sub = this.load().subscribe((data) => {
      this.form = this.buildForm(data);
      this.connector = connectEditState<T>(this.form, this.editState);
    });
  }

  undo() {
    this.connector.undo();
  }

  redo() {
    this.connector.redo();
  }

  discard() {
    this.connector.discard();
  }

  save() {
    const value = this.form.getRawValue();
    this.saveApi(value)?.subscribe((response) => {
      this.connector.markSaved();
      if (this.afterSaveApi) {
        this.afterSaveApi(response);
      }
    });
  }

  canUndo() {
    return this.editState.canUndo();
  }

  canRedo() {
    return this.editState.canRedo();
  }

  isDirty() {
    return this.form?.dirty;
  }

  ngOnDestroy() {
    this.connector?.dispose();
    this.sub?.unsubscribe();
  }
}
