import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';

@Component({
  selector: 'app-machining-material',
  templateUrl: './machining-material.component.html',
  styleUrls: ['./machining-material.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, FieldCommentComponent, AutoTooltipDirective, InfoTooltipComponent],
})
export class MachiningMaterialComponent {
  @Input() formGroup: FormGroup;
  @Input() compVals;
  @Output() doCalculateCost = new EventEmitter<any>();

  calculateCost(fieldName = '', index = 0) {
    this.doCalculateCost.emit({ fieldName, index });
  }

  get f() {
    return this.formGroup.controls;
  }
}
