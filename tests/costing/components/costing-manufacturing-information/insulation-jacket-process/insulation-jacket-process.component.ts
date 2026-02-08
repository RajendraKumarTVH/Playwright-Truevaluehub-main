import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';

@Component({
  selector: 'app-insulation-jacket-process',
  templateUrl: './insulation-jacket-process.component.html',
  styleUrls: ['./insulation-jacket-process.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FieldCommentComponent, OnlyNumber, AutoTooltipDirective],
})
export class InsulationJacketProcessComponent {
  @Input() formGroup: FormGroup;
  @Input() compVals: any;
  @Output() doCalculateCost = new EventEmitter<any>();

  calculateCost(fieldName = '') {
    this.doCalculateCost.emit({ fieldName });
  }
}
