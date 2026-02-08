import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';

@Component({
  selector: 'app-insulation-jacket',
  templateUrl: './insulation-jacket.component.html',
  styleUrls: ['./insulation-jacket.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, FieldCommentComponent, AutoTooltipDirective],
})
export class InsulationJacketComponent {
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
