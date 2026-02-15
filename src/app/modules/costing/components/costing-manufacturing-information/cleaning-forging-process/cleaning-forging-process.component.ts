import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';
import { MaterialForgingConfigService } from 'src/app/shared/config/material-forging-config';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';

@Component({
  selector: 'app-cleaning-forging-process',
  templateUrl: './cleaning-forging-process.component.html',
  styleUrls: ['./cleaning-forging-process.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FieldCommentComponent, OnlyNumber, AutoTooltipDirective, InfoTooltipComponent],
})
export class CleaningForgingProcessComponent {
  @Input() formGroup: FormGroup;
  @Input() compVals: any;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() doCalculateSamplingRate = new EventEmitter<any>();

  forgingSubProcessList = this._materialForgingConfigService.getForgingSubProcesses();

  constructor(public _materialForgingConfigService: MaterialForgingConfigService) {}

  get f() {
    return this.formGroup.controls;
  }

  calculateSamplingRate() {
    this.doCalculateSamplingRate.emit(true);
  }

  calculateCost(fieldName = '') {
    this.doCalculateCost.emit({ fieldName });
  }
}
