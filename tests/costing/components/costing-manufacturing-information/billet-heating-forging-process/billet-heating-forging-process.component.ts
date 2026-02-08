import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { MaterialForgingConfigService } from 'src/app/shared/config/material-forging-config';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';

@Component({
  selector: 'app-billet-heating-forging-process',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FieldCommentComponent, OnlyNumber, AutoTooltipDirective, InfoTooltipComponent],
  templateUrl: './billet-heating-forging-process.component.html',
  styleUrl: './billet-heating-forging-process.component.scss',
  standalone: true,
})
export class BilletHeatingForgingProcessComponent {
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
