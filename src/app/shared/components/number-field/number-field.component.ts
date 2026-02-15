import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OnlyNumber } from '../../directives';
import { CommonModule } from '@angular/common';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';

@Component({
  selector: 'app-number-field',
  template: `
    <ng-container [formGroup]="form">
      <label class="form-label">{{ field.label }}:</label>
      <app-field-comment [formIdentifier]="formIdentifier" [fieldIdentifier]="field.id"></app-field-comment>
      <input
        type="number"
        [ngClass]="{ 'input-mandatory': f[field.name].errors, 'input-valid': f[field.name].valid }"
        [formControlName]="field.name"
        (blur)="valueChange.emit(field.name)"
        class="form-control"
        [OnlyNumber]="true"
        min="0" />
    </ng-container>
  `,
  standalone: true,
  imports: [OnlyNumber, CommonModule, FormsModule, ReactiveFormsModule, FieldCommentComponent],
})
export class NumberFieldComponent {
  @Input() form!: FormGroup;
  @Input() field!: { id: string; label: string; name: string };
  @Input() commentPosition!: string;
  @Input() formIdentifier!: any;
  @Output() valueChange = new EventEmitter<string>();

  get f() {
    return this.form.controls;
  }
}
