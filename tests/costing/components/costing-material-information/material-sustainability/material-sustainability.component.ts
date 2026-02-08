import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';

@Component({
  selector: 'app-material-sustainability',
  templateUrl: './material-sustainability.component.html',
  styleUrls: ['./material-sustainability.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, AutoTooltipDirective, InfoTooltipComponent],
})
export class MaterialSustainabilityComponent {
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
