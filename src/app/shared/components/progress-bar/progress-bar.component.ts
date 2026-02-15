import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgCircleProgressModule } from 'ng-circle-progress';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, NgCircleProgressModule],
})
export class ProgressBarComponent {
  _data: any;

  @Input() set percentage(val: any) {
    if (val <= 69) {
      this.progressClass = 'progress-bar-red';
      this.circleOuterColor = '#FF6347';
    } else if (val <= 79 && val >= 70) {
      this.progressClass = 'progress-bar-yellow';
      this.circleOuterColor = '#FDB900';
    } else if (val >= 80) {
      this.progressClass = 'progress-bar-green';
      this.circleOuterColor = '#669a13';
    }
    this._data = val;
  }
  get percentage() {
    return this._data;
  }

  @Input() mode = 'determinate';
  color: ThemePalette = 'accent';
  progressClass = 'progress-bar-green';
  circleOuterColor = '#669a13'; //Green
  @Input() showPercentageText = false;
  @Input() animation = true;
}
