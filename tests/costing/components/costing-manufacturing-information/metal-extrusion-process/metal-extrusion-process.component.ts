import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';

@Component({
  selector: 'app-metal-extrusion-process',
  templateUrl: './metal-extrusion-process.component.html',
  styleUrls: ['./metal-extrusion-process.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, FieldCommentComponent, AutoTooltipDirective],
})
export class MetalExtrusionProcessComponent {
  @Input() formGroup: FormGroup;
  @Input() compVals: any;
  @Output() doCalculateCost = new EventEmitter<any>();

  get f() {
    return this.formGroup.controls;
  }

  calculateCost(fieldName = '') {
    this.doCalculateCost.emit({ fieldName });
  }
}
