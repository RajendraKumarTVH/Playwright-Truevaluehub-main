import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SliderShellComponent } from '../slider-shell/slider-shell.component';
import { SliderContentComponent } from '../slider-content/slider-content.component';
import { PartCopySliderContentComponent } from '../part-copy-slider-content/part-copy-slider-content.component';

@Component({
  selector: 'app-project-parts-slider',
  templateUrl: './project-parts-slider.component.html',
  styleUrls: ['./project-parts-slider.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SliderShellComponent, SliderContentComponent, PartCopySliderContentComponent],
})
export class ProjectPartsSliderComponent implements OnChanges {
  @Input() rowData: any;
  @Input() userData: any;
  @Input() currentUserId: number;
  @Input() isAdmin: boolean;
  isVisible: boolean = true;

  ngOnChanges() {
    this.isVisible = true;
  }

  closeSlider(): void {
    this.isVisible = false;
  }
}
