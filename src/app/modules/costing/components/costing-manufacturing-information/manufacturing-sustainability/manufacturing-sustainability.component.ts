import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { OnlyNumber } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';

@Component({
  selector: 'app-manufacturing-sustainability',
  templateUrl: './manufacturing-sustainability.component.html',
  styleUrls: ['./manufacturing-sustainability.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, AutoTooltipDirective, InfoTooltipComponent],
})
export class ManufacturingSustainabilityComponent {
  @Input() formGroup: FormGroup;
  @Input() compVals: any;
  @Output() doCalculateCost = new EventEmitter<any>();

  calculateCost(fieldName = '') {
    this.doCalculateCost.emit({ fieldName });
  }
}
